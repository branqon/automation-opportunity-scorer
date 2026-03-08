import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { callLLM, extractApiCredentials } from "@/lib/llm";
import { enrichOpportunity } from "@/lib/scoring";
import { getAutomationTypeLabel } from "@/lib/metadata";
import { IMPLEMENTATION_PLAN_SYSTEM_PROMPT } from "@/lib/ai-prompts";

export async function POST(request: NextRequest) {
  let provider, apiKey;
  try {
    ({ provider, apiKey } = extractApiCredentials(request.headers));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid credentials" },
      { status: 401 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const slug = body.slug;
  if (typeof slug !== "string" || !slug.trim()) {
    return NextResponse.json(
      { error: "Missing or invalid slug" },
      { status: 400 },
    );
  }

  const opportunity = await prisma.opportunity.findUnique({
    where: { slug: slug.trim() },
    include: { team: true },
  });

  if (!opportunity) {
    return NextResponse.json(
      { error: `Opportunity with slug "${slug}" not found` },
      { status: 404 },
    );
  }

  const enriched = enrichOpportunity(opportunity);

  const userPrompt = `Generate an implementation plan for the following automation opportunity:

Name: ${enriched.name}
Team: ${enriched.team.name}
Automation Type: ${getAutomationTypeLabel(enriched.suggestedAutomationType)}
Summary: ${enriched.summary}
Suggested Approach: ${enriched.suggestedApproach}
Implementation Considerations: ${enriched.implementationConsiderations}
Risk Notes: ${enriched.riskNotes}
Recommended Next Step: ${enriched.recommendedNextStep}

Scoring Data:
- Composite Score: ${enriched.score}/100
- Value Band: ${enriched.valueBand}
- Effort Tier: ${enriched.effortTier}
- Monthly Volume: ${enriched.monthlyVolume} requests
- Avg Handle Time: ${enriched.avgHandleTimeMinutes} minutes
- Monthly Hours Saved: ${enriched.monthlyHoursSaved}
- Annual Cost Savings: $${enriched.annualCostSavings}
- Estimated Automation Rate: ${Math.round(enriched.estimatedAutomationRate * 100)}%

Factor Scores:
- Repeatability: ${enriched.repeatabilityScore}/5
- Standardization: ${enriched.standardizationScore}/5
- Approval Complexity: ${enriched.approvalComplexityScore}/5
- Rework Rate: ${enriched.reworkRateScore}/5
- SLA Risk: ${enriched.slaRiskScore}/5
- Customer Impact: ${enriched.customerImpactScore}/5
- Implementation Difficulty: ${enriched.implementationDifficultyScore}/5

Key Constraint: ${enriched.keyConstraint}`;

  try {
    const response = await callLLM({
      provider,
      apiKey,
      systemPrompt: IMPLEMENTATION_PLAN_SYSTEM_PROMPT,
      userPrompt,
      maxTokens: 4096,
    });

    const plan = JSON.parse(response.content);

    await prisma.opportunity.update({
      where: { slug: slug.trim() },
      data: { aiAnalysis: JSON.stringify(plan) },
    });

    return NextResponse.json({
      plan,
      meta: {
        provider: response.provider,
        model: response.model,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to generate implementation plan",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
