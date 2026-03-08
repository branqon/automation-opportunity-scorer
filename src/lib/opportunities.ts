import { AutomationType } from "@/generated/prisma/enums";

import { prisma } from "@/lib/prisma";
import {
  enrichOpportunity,
  type EnrichedOpportunity,
  type RankedOpportunity,
} from "@/lib/scoring";

export type DashboardFocus = "all" | "quick-wins" | "strategic-bets";

export type DashboardFilters = {
  team: string;
  automationType: AutomationType | "all";
  focus: DashboardFocus;
};

type RawSearchParams = Record<string, string | string[] | undefined>;

function readValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function parseDashboardFilters(searchParams: RawSearchParams): DashboardFilters {
  const requestedTeam = readValue(searchParams.team);
  const requestedAutomationType = readValue(searchParams.automationType);
  const requestedFocus = readValue(searchParams.focus);

  const validAutomationTypes = new Set(Object.values(AutomationType));
  const validFocus = new Set<DashboardFocus>([
    "all",
    "quick-wins",
    "strategic-bets",
  ]);

  return {
    team: requestedTeam ?? "all",
    automationType:
      requestedAutomationType &&
      validAutomationTypes.has(requestedAutomationType as AutomationType)
        ? (requestedAutomationType as AutomationType)
        : "all",
    focus:
      requestedFocus && validFocus.has(requestedFocus as DashboardFocus)
        ? (requestedFocus as DashboardFocus)
        : "all",
  };
}

function rankOpportunities(opportunities: EnrichedOpportunity[]) {
  return opportunities.map((opportunity, index) => ({
    ...opportunity,
    rank: index + 1,
  }));
}

function sortByOpportunityScore(left: EnrichedOpportunity, right: EnrichedOpportunity) {
  if (right.score !== left.score) {
    return right.score - left.score;
  }

  if (right.annualCostSavings !== left.annualCostSavings) {
    return right.annualCostSavings - left.annualCostSavings;
  }

  return left.name.localeCompare(right.name);
}

function applyFilters(
  opportunities: RankedOpportunity[],
  filters: DashboardFilters,
) {
  return opportunities.filter((opportunity) => {
    if (filters.team !== "all" && opportunity.team.slug !== filters.team) {
      return false;
    }

    if (
      filters.automationType !== "all" &&
      opportunity.suggestedAutomationType !== filters.automationType
    ) {
      return false;
    }

    if (filters.focus === "quick-wins" && opportunity.effortTier !== "Quick win") {
      return false;
    }

    if (
      filters.focus === "strategic-bets" &&
      opportunity.effortTier !== "Strategic bet"
    ) {
      return false;
    }

    return true;
  });
}

export async function getDashboardData(filters: DashboardFilters) {
  const rows = await prisma.opportunity.findMany({
    include: { team: true },
    orderBy: {
      name: "asc",
    },
  });

  const teams = await prisma.team.findMany({ orderBy: { name: "asc" } });

  const rankedAll = rankOpportunities(
    rows
      .map((row) => enrichOpportunity(row))
      .sort(sortByOpportunityScore),
  );

  const opportunities = applyFilters(rankedAll, filters);

  return {
    opportunities,
    topCandidates: opportunities.slice(0, 3),
    filterOptions: {
      teams,
      automationTypes: Object.values(AutomationType),
    },
    stats: {
      totalCategories: rankedAll.length,
      visibleCategories: opportunities.length,
      totalMonthlyHoursSaved: opportunities.reduce(
        (total, opportunity) => total + opportunity.monthlyHoursSaved,
        0,
      ),
      totalAnnualCostSavings: opportunities.reduce(
        (total, opportunity) => total + opportunity.annualCostSavings,
        0,
      ),
      quickWinCount: opportunities.filter(
        (opportunity) => opportunity.effortTier === "Quick win",
      ).length,
      strategicBetCount: opportunities.filter(
        (opportunity) => opportunity.effortTier === "Strategic bet",
      ).length,
      baselineHours: opportunities.reduce(
        (total, opportunity) => total + opportunity.laborHoursPerMonth,
        0,
      ),
      averageScore:
        opportunities.length > 0
          ? opportunities.reduce((total, opportunity) => total + opportunity.score, 0) /
            opportunities.length
          : 0,
    },
    charts: {
      savingsByOpportunity: opportunities
        .slice(0, 6)
        .map((opportunity) => ({
          name: opportunity.name,
          annualCostSavings: opportunity.annualCostSavings,
          monthlyHoursSaved: opportunity.monthlyHoursSaved,
        })),
      valueVsEffort: opportunities.map((opportunity) => ({
        name: opportunity.name,
        slug: opportunity.slug,
        score: opportunity.score,
        implementationDifficulty: opportunity.implementationDifficultyScore,
        monthlyHoursSaved: opportunity.monthlyHoursSaved,
        effortTier: opportunity.effortTier,
      })),
    },
  };
}

export async function getOpportunityDetail(slug: string) {
  const rows = await prisma.opportunity.findMany({
    include: { team: true },
    orderBy: {
      name: "asc",
    },
  });

  const rankedAll = rankOpportunities(
    rows
      .map((row) => enrichOpportunity(row))
      .sort(sortByOpportunityScore),
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
