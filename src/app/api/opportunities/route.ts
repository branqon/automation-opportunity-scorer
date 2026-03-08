import { NextRequest, NextResponse } from "next/server";
import { AutomationType } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { enrichOpportunity, type RankedOpportunity } from "@/lib/scoring";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const team = searchParams.get("team");
  const automationType = searchParams.get("automationType");
  const validAutomationTypes = new Set(Object.values(AutomationType));

  const where: Record<string, unknown> = {};

  if (team) {
    where.team = { slug: team };
  }

  if (automationType) {
    if (!validAutomationTypes.has(automationType as AutomationType)) {
      return NextResponse.json(
        {
          error: `Invalid automationType "${automationType}".`,
        },
        { status: 400 },
      );
    }

    where.suggestedAutomationType = automationType as AutomationType;
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

export async function POST() {
  return NextResponse.json(
    {
      error:
        "This portfolio app ships as a read-only prioritization tool. Creating opportunities is intentionally out of scope for v1.",
    },
    { status: 405 },
  );
}
