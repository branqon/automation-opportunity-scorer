import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enrichOpportunity, type RankedOpportunity } from "@/lib/scoring";
import { AutomationType, OpportunitySource } from "@/generated/prisma/enums";

const VALID_AUTOMATION_TYPES = Object.values(AutomationType);

const SCORE_FIELDS = [
  "repeatabilityScore",
  "standardizationScore",
  "approvalComplexityScore",
  "reworkRateScore",
  "slaRiskScore",
  "customerImpactScore",
  "implementationDifficultyScore",
] as const;

const REQUIRED_FIELDS = [
  "name",
  "teamId",
  "monthlyVolume",
  "avgHandleTimeMinutes",
  ...SCORE_FIELDS,
  "suggestedAutomationType",
  "summary",
  "suggestedApproach",
  "implementationConsiderations",
  "riskNotes",
  "recommendedNextStep",
] as const;

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const team = searchParams.get("team");
  const automationType = searchParams.get("automationType");

  const where: Record<string, unknown> = {};

  if (team) {
    where.team = { slug: team };
  }

  if (automationType) {
    where.suggestedAutomationType = automationType;
  }

  const opportunities = await prisma.opportunity.findMany({
    where,
    include: { team: true },
    orderBy: { name: "asc" },
  });

  const enriched = opportunities.map((opp) => enrichOpportunity(opp));
  const sorted = enriched.sort((a, b) => b.score - a.score);
  const ranked: RankedOpportunity[] = sorted.map((opp, index) => ({
    ...opp,
    rank: index + 1,
  }));

  return NextResponse.json(ranked);
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const missing = REQUIRED_FIELDS.filter(
    (field) => body[field] === undefined || body[field] === null,
  );

  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Missing required fields: ${missing.join(", ")}` },
      { status: 400 },
    );
  }

  if (!VALID_AUTOMATION_TYPES.includes(body.suggestedAutomationType as AutomationType)) {
    return NextResponse.json(
      {
        error: `Invalid automationType. Must be one of: ${VALID_AUTOMATION_TYPES.join(", ")}`,
      },
      { status: 400 },
    );
  }

  for (const field of SCORE_FIELDS) {
    const value = body[field];
    if (
      typeof value !== "number" ||
      !Number.isInteger(value) ||
      value < 1 ||
      value > 5
    ) {
      return NextResponse.json(
        { error: `${field} must be an integer between 1 and 5` },
        { status: 400 },
      );
    }
  }

  const slug = slugify(body.name as string);

  const existing = await prisma.opportunity.findUnique({ where: { slug } });

  if (existing) {
    return NextResponse.json(
      { error: `An opportunity with slug "${slug}" already exists` },
      { status: 409 },
    );
  }

  const opportunity = await prisma.opportunity.create({
    data: {
      slug,
      name: body.name as string,
      teamId: body.teamId as string,
      monthlyVolume: body.monthlyVolume as number,
      avgHandleTimeMinutes: body.avgHandleTimeMinutes as number,
      repeatabilityScore: body.repeatabilityScore as number,
      standardizationScore: body.standardizationScore as number,
      approvalComplexityScore: body.approvalComplexityScore as number,
      reworkRateScore: body.reworkRateScore as number,
      slaRiskScore: body.slaRiskScore as number,
      customerImpactScore: body.customerImpactScore as number,
      implementationDifficultyScore: body.implementationDifficultyScore as number,
      suggestedAutomationType: body.suggestedAutomationType as AutomationType,
      summary: body.summary as string,
      suggestedApproach: body.suggestedApproach as string,
      implementationConsiderations: body.implementationConsiderations as string,
      riskNotes: body.riskNotes as string,
      recommendedNextStep: body.recommendedNextStep as string,
      source: (body.source as OpportunitySource) ?? "MANUAL",
    },
    include: { team: true },
  });

  return NextResponse.json(opportunity, { status: 201 });
}
