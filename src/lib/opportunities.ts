import type { Opportunity, Team } from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";
import {
  computeDashboardData,
  type DashboardFilterState,
  type RawOpportunity,
  type RawTeam,
} from "@/lib/dashboard";

export type { DashboardFilterState, RawOpportunity, RawTeam };
export { computeDashboardData };

export function toRawTeam(team: Team): RawTeam {
  return {
    id: team.id,
    slug: team.slug,
    name: team.name,
    description: team.description,
  };
}

export function toRawOpportunity(
  opportunity: Opportunity & { team: Team },
): RawOpportunity {
  return {
    id: opportunity.id,
    slug: opportunity.slug,
    name: opportunity.name,
    teamId: opportunity.teamId,
    monthlyVolume: opportunity.monthlyVolume,
    avgHandleTimeMinutes: opportunity.avgHandleTimeMinutes,
    repeatabilityScore: opportunity.repeatabilityScore,
    standardizationScore: opportunity.standardizationScore,
    approvalComplexityScore: opportunity.approvalComplexityScore,
    reworkRateScore: opportunity.reworkRateScore,
    slaRiskScore: opportunity.slaRiskScore,
    customerImpactScore: opportunity.customerImpactScore,
    implementationDifficultyScore: opportunity.implementationDifficultyScore,
    suggestedAutomationType: opportunity.suggestedAutomationType,
    summary: opportunity.summary,
    suggestedApproach: opportunity.suggestedApproach,
    implementationConsiderations: opportunity.implementationConsiderations,
    riskNotes: opportunity.riskNotes,
    recommendedNextStep: opportunity.recommendedNextStep,
    team: toRawTeam(opportunity.team),
  };
}

export async function getAllRawData() {
  const [rows, teams] = await Promise.all([
    prisma.opportunity.findMany({
      include: { team: true },
      orderBy: { name: "asc" },
    }),
    prisma.team.findMany({ orderBy: { name: "asc" } }),
  ]);

  return {
    rawOpportunities: rows.map(toRawOpportunity),
    teams: teams.map(toRawTeam),
  };
}

export async function getOpportunityDetail(slug: string) {
  const { rawOpportunities, teams } = await getAllRawData();
  const { opportunities: rankedAll } = computeDashboardData(
    rawOpportunities,
    teams,
    { team: "all", automationType: "all", focus: "all" },
  );

  const opportunity = rankedAll.find((item) => item.slug === slug);

  if (!opportunity) {
    return null;
  }

  return {
    opportunity,
    totalCount: rankedAll.length,
    neighboring: {
      higher:
        rankedAll.find((item) => item.rank === opportunity.rank - 1) ?? null,
      lower:
        rankedAll.find((item) => item.rank === opportunity.rank + 1) ?? null,
    },
  };
}

export async function getAllSlugs() {
  const rows = await prisma.opportunity.findMany({
    select: { slug: true },
  });
  return rows.map((row) => row.slug);
}
