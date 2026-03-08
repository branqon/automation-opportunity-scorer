import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { callLLM, extractApiCredentials } from "@/lib/llm";
import { enrichOpportunity, type RankedOpportunity } from "@/lib/scoring";
import { getAutomationTypeLabel } from "@/lib/metadata";
import { PORTFOLIO_SUMMARY_SYSTEM_PROMPT } from "@/lib/ai-prompts";

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

  const opportunities = await prisma.opportunity.findMany({
    include: { team: true },
    orderBy: { name: "asc" },
  });

  if (opportunities.length === 0) {
    return NextResponse.json(
      { error: "No opportunities found in the portfolio" },
      { status: 404 },
    );
  }

  const enriched = opportunities.map((opp) => enrichOpportunity(opp));
  const sorted = enriched.sort((a, b) => b.score - a.score);
  const ranked: RankedOpportunity[] = sorted.map((opp, index) => ({
    ...opp,
    rank: index + 1,
  }));

  const totalAnnualSavings = ranked.reduce(
    (sum, opp) => sum + opp.annualCostSavings,
    0,
  );
  const totalAnnualHours = ranked.reduce(
    (sum, opp) => sum + opp.annualHoursSaved,
    0,
  );
  const quickWinCount = ranked.filter(
    (opp) => opp.effortTier === "Quick win",
  ).length;
  const strategicBetCount = ranked.filter(
    (opp) => opp.effortTier === "Strategic bet",
  ).length;

  const opportunitySummaries = ranked
    .map(
      (opp) =>
        `#${opp.rank}. ${opp.name} (Score: ${opp.score}, Team: ${opp.team.name}, Type: ${getAutomationTypeLabel(opp.suggestedAutomationType)}, Effort: ${opp.effortTier}, Value: ${opp.valueBand}, Annual Savings: $${opp.annualCostSavings}, Hours/Year: ${opp.annualHoursSaved})`,
    )
    .join("\n");

  const userPrompt = `Analyze the following automation opportunity portfolio and provide strategic recommendations:

Portfolio Statistics:
- Total Opportunities: ${ranked.length}
- Total Potential Annual Savings: $${totalAnnualSavings.toLocaleString()}
- Total Potential Annual Hours Saved: ${totalAnnualHours.toLocaleString()}
- Quick Wins: ${quickWinCount}
- Strategic Bets: ${strategicBetCount}

Opportunities (ranked by score):
${opportunitySummaries}`;

  try {
    const response = await callLLM({
      provider,
      apiKey,
      systemPrompt: PORTFOLIO_SUMMARY_SYSTEM_PROMPT,
      userPrompt,
      maxTokens: 4096,
    });

    const summary = JSON.parse(response.content);

    return NextResponse.json({
      summary,
      meta: {
        provider: response.provider,
        model: response.model,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to generate portfolio summary",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
