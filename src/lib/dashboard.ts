import { AutomationType } from "@/generated/prisma/enums";
import {
  DEFAULT_IMPORTANCE,
  enrichOpportunity,
  type EnrichedOpportunity,
  type RankedOpportunity,
  type ScoreFactorKey,
} from "@/lib/scoring";

export type DashboardFocus = "all" | "quick-wins" | "strategic-bets";

export type DashboardFilterState = {
  team: string;
  automationType: AutomationType | "all";
  focus: DashboardFocus;
};

export type RawTeam = {
  id: string;
  slug: string;
  name: string;
  description: string;
};

export type RawOpportunity = {
  id: string;
  slug: string;
  name: string;
  teamId: string;
  monthlyVolume: number;
  avgHandleTimeMinutes: number;
  repeatabilityScore: number;
  standardizationScore: number;
  approvalComplexityScore: number;
  reworkRateScore: number;
  slaRiskScore: number;
  customerImpactScore: number;
  implementationDifficultyScore: number;
  suggestedAutomationType: AutomationType;
  summary: string;
  suggestedApproach: string;
  implementationConsiderations: string;
  riskNotes: string;
  recommendedNextStep: string;
  team: RawTeam;
};

type RawSearchParams = Record<string, string | string[] | undefined>;
type SearchParamsReader = {
  get(name: string): string | null;
};

const IMPORTANCE_PARAM_PREFIX = "w_";
const IMPORTANCE_KEYS = Object.keys(DEFAULT_IMPORTANCE) as ScoreFactorKey[];
const MIN_IMPORTANCE = 1;
const MAX_IMPORTANCE = 20;

function readValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function clampImportance(value: number) {
  return Math.min(Math.max(value, MIN_IMPORTANCE), MAX_IMPORTANCE);
}

function getImportanceParamKey(key: ScoreFactorKey) {
  return `${IMPORTANCE_PARAM_PREFIX}${key}`;
}

function parseImportanceValue(value: string | null, fallback: number) {
  if (value === null) {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return clampImportance(Math.round(parsed));
}

export function parseDashboardFilters(searchParams: RawSearchParams): DashboardFilterState {
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

export function parseImportance(searchParams: SearchParamsReader) {
  return IMPORTANCE_KEYS.reduce(
    (importance, key) => {
      importance[key] = parseImportanceValue(
        searchParams.get(getImportanceParamKey(key)),
        DEFAULT_IMPORTANCE[key],
      );
      return importance;
    },
    { ...DEFAULT_IMPORTANCE },
  );
}

export function hasCustomImportance(importance: Record<ScoreFactorKey, number>) {
  return IMPORTANCE_KEYS.some(
    (key) => importance[key] !== DEFAULT_IMPORTANCE[key],
  );
}

export function applyImportanceSearchParams(
  searchParams: URLSearchParams,
  importance: Record<ScoreFactorKey, number>,
) {
  const nextParams = new URLSearchParams(searchParams.toString());

  for (const key of IMPORTANCE_KEYS) {
    const value = clampImportance(importance[key]);
    const paramKey = getImportanceParamKey(key);

    if (value === DEFAULT_IMPORTANCE[key]) {
      nextParams.delete(paramKey);
    } else {
      nextParams.set(paramKey, String(value));
    }
  }

  return nextParams;
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

function rankOpportunities(opportunities: EnrichedOpportunity[]) {
  return opportunities.map((opportunity, index) => ({
    ...opportunity,
    rank: index + 1,
  }));
}

function applyFilters(
  opportunities: RankedOpportunity[],
  filters: DashboardFilterState,
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

export function computeDashboardData(
  rawOpportunities: RawOpportunity[],
  teams: RawTeam[],
  filters: DashboardFilterState,
  customWeights?: Record<ScoreFactorKey, number>,
) {
  const rankedAll = rankOpportunities(
    rawOpportunities
      .map((row) => enrichOpportunity(row, customWeights))
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
