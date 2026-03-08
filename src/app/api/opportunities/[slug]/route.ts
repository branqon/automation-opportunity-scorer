import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enrichOpportunity } from "@/lib/scoring";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;

  const opportunity = await prisma.opportunity.findUnique({
    where: { slug },
    include: { team: true },
  });

  if (!opportunity) {
    return NextResponse.json(
      { error: `Opportunity with slug "${slug}" not found` },
      { status: 404 },
    );
  }

  const enriched = enrichOpportunity(opportunity);

  return NextResponse.json(enriched);
}
