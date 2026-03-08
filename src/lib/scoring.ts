import type { Opportunity, Team } from "@/generated/prisma/client";
import type { AutomationType } from "@/generated/prisma/enums";

export const HOURLY_RATE_USD = 48;

export const SCORE_WEIGHTS = {
  volume: 0.18,
  laborIntensity: 0.18,
  repeatability: 0.15,
  standardization: 0.12,
  rework: 0.1,
  slaRisk: 0.1,
  customerImpact: 0.1,
  implementationEase: 0.05,
  approvalEase: 0.02,
} as const;

export type ScoreFactorKey = keyof typeof SCORE_WEIGHTS;

export type EffortTier = "Quick win" | "Foundation build" | "Strategic bet";
export type ValueBand = "Automate now" | "Validate next" | "Monitor";

export type ScoreBreakdownEntry = {
  key: ScoreFactorKey;
  label: string;
  description: string;
  weight: number;
  normalizedScore: number;
  contribution: number;
  displayValue: string;
};

export type OpportunityAnalytics = {
  score: number;
  monthlyMinutesSaved: number;
  monthlyHoursSaved: number;
  annualHoursSaved: number;
  annualCostSavings: number;
  estimatedAutomationRate: number;
  laborHoursPerMonth: number;
  effortTier: EffortTier;
  valueBand: ValueBand;
  scoreBreakdown: ScoreBreakdownEntry[];
  whyNow: string;
  keyConstraint: string;
};

export type EnrichedOpportunity = Opportunity & { team: Team } & OpportunityAnalytics;
export type RankedOpportunity = EnrichedOpportunity & { rank: number };

const VOLUME_CAP = 800;
const MONTHLY_MINUTES_CAP = 8000;

const AUTOMATION_TYPE_MULTIPLIERS: Record<AutomationType, number> = {
  SELF_SERVICE_WORKFLOW: 0.95,
  API_WORKFLOW: 0.85,
  APPROVAL_GATED_PROVISIONING: 0.78,
  AI_ASSISTED_TRIAGE: 0.65,
  SCHEDULED_FOLLOW_UP: 0.92,
  SYSTEM_INTEGRATION: 0.8,
};

const FACTOR_METADATA: Record<
  ScoreFactorKey,
  {
    label: string;
    description: string;
    narrative: string;
  }
> = {
  volume: {
    label: "Monthly volume",
    description: "Higher recurring volume expands the surface area for recovered analyst capacity.",
    narrative: "the category appears often enough to justify investment",
  },
  laborIntensity: {
    label: "Analyst time load",
    description: "More baseline handling time creates a larger savings pool once the workflow is automated.",
    narrative: "each occurrence consumes meaningful analyst time",
  },
  repeatability: {
    label: "Repeatability",
    description: "Highly repeatable work is easier to route into a stable automation path.",
    narrative: "the work follows a repeatable pattern",
  },
  standardization: {
    label: "Standardization",
    description: "A standardized process is easier to automate safely without exception-heavy branching.",
    narrative: "the intake and fulfillment steps are standardized",
  },
  rework: {
    label: "Rework pressure",
    description: "Frequent reopen or correction loops signal waste that automation can remove.",
    narrative: "manual rework is adding avoidable drag",
  },
  slaRisk: {
    label: "SLA risk",
    description: "Work that regularly threatens SLA performance has outsized operational value when stabilized.",
    narrative: "the category affects SLA performance",
  },
  customerImpact: {
    label: "Customer impact",
    description: "Automation carries more value when delays directly affect employees or customers.",
    narrative: "it directly affects user productivity or customer experience",
  },
  implementationEase: {
    label: "Implementation fit",
    description: "Lower implementation difficulty improves time-to-value and lowers delivery risk.",
    narrative: "the implementation path is manageable for a v1 delivery",
  },
  approvalEase: {
    label: "Approval fit",
    description: "Lower approval complexity reduces the number of human checkpoints that stay in the loop.",
    narrative: "approval requirements are light enough to keep the flow mostly automated",
  },
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function normalizeFivePointScore(value: number) {
  return clamp((value - 1) / 4, 0, 1);
}

function roundToOneDecimal(value: number) {
  return Math.round(value * 10) / 10;
}

function roundToThreeDecimals(value: number) {
  return Math.round(value * 1000) / 1000;
}

function getDisplayValue(
  key: ScoreFactorKey,
  opportunity: Opportunity,
  laborHoursPerMonth: number,
) {
  switch (key) {
    case "volume":
      return `${opportunity.monthlyVolume} requests/month`;
    case "laborIntensity":
      return `${roundToOneDecimal(laborHoursPerMonth)} analyst hours/month`;
    case "implementationEase":
      return `${6 - opportunity.implementationDifficultyScore}/5 implementation ease`;
    case "approvalEase":
      return `${6 - opportunity.approvalComplexityScore}/5 approval ease`;
    case "repeatability":
      return `${opportunity.repeatabilityScore}/5`;
    case "standardization":
      return `${opportunity.standardizationScore}/5`;
    case "rework":
      return `${opportunity.reworkRateScore}/5`;
    case "slaRisk":
      return `${opportunity.slaRiskScore}/5`;
    case "customerImpact":
      return `${opportunity.customerImpactScore}/5`;
  }
}

function joinNarratives(items: string[]) {
  if (items.length === 1) {
    return items[0] ?? "";
  }

  if (items.length === 2) {
    return `${items[0]} and ${items[1]}`;
  }

  return `${items[0]}, ${items[1]}, and ${items[2]}`;
}

function buildConstraint(opportunity: Opportunity) {
  if (opportunity.implementationDifficultyScore >= 4) {
    return "Implementation difficulty is the main drag on this opportunity, so integration design and exception handling should be narrowed before delivery.";
  }

  if (opportunity.approvalComplexityScore >= 4) {
    return "Approval complexity is the main constraint, so the workflow should preserve explicit checkpoints and limit auto-approval to low-risk cases.";
  }

  if (opportunity.standardizationScore <= 2) {
    return "Process variation is still the main constraint, so standardizing intake and routing rules should happen before pushing for deeper automation.";
  }

  if (opportunity.repeatabilityScore <= 2) {
    return "The request pattern still has too many edge cases, so start with assisted triage before attempting full workflow automation.";
  }

  return "The remaining constraints are manageable within a scoped v1 if exception handling and ownership are clearly defined.";
}

function getEffortTier(opportunity: Opportunity): EffortTier {
  if (
    opportunity.implementationDifficultyScore <= 2 &&
    opportunity.approvalComplexityScore <= 2
  ) {
    return "Quick win";
  }

  if (
    opportunity.implementationDifficultyScore >= 4 ||
    opportunity.approvalComplexityScore >= 4
  ) {
    return "Strategic bet";
  }

  return "Foundation build";
}

function getValueBand(score: number): ValueBand {
  if (score >= 70) {
    return "Automate now";
  }

  if (score >= 56) {
    return "Validate next";
  }

  return "Monitor";
}

export function enrichOpportunity(opportunity: Opportunity & { team: Team }): EnrichedOpportunity {
  const monthlyMinutes = opportunity.monthlyVolume * opportunity.avgHandleTimeMinutes;
  const laborHoursPerMonth = monthlyMinutes / 60;

  const normalizedScores: Record<ScoreFactorKey, number> = {
    volume: clamp(opportunity.monthlyVolume / VOLUME_CAP, 0, 1),
    laborIntensity: clamp(monthlyMinutes / MONTHLY_MINUTES_CAP, 0, 1),
    repeatability: normalizeFivePointScore(opportunity.repeatabilityScore),
    standardization: normalizeFivePointScore(opportunity.standardizationScore),
    rework: normalizeFivePointScore(opportunity.reworkRateScore),
    slaRisk: normalizeFivePointScore(opportunity.slaRiskScore),
    customerImpact: normalizeFivePointScore(opportunity.customerImpactScore),
    implementationEase:
      1 - normalizeFivePointScore(opportunity.implementationDifficultyScore),
    approvalEase: 1 - normalizeFivePointScore(opportunity.approvalComplexityScore),
  };

  const scoreBreakdown: ScoreBreakdownEntry[] = (
    Object.entries(SCORE_WEIGHTS) as Array<[ScoreFactorKey, number]>
  ).map(([key, weight]) => {
    return {
      key,
      label: FACTOR_METADATA[key].label,
      description: FACTOR_METADATA[key].description,
      weight,
      normalizedScore: normalizedScores[key],
      contribution: normalizedScores[key] * weight * 100,
      displayValue: getDisplayValue(key, opportunity, laborHoursPerMonth),
    };
  });

  const score = roundToOneDecimal(
    scoreBreakdown.reduce((total, factor) => total + factor.contribution, 0),
  );

  const automationFit =
    (normalizeFivePointScore(opportunity.repeatabilityScore) +
      normalizeFivePointScore(opportunity.standardizationScore) +
      (1 - normalizeFivePointScore(opportunity.implementationDifficultyScore)) +
      (1 - normalizeFivePointScore(opportunity.approvalComplexityScore))) /
    4;

  const estimatedAutomationRate = roundToThreeDecimals(
    clamp(
    automationFit * AUTOMATION_TYPE_MULTIPLIERS[opportunity.suggestedAutomationType],
    0.25,
    0.85,
    ),
  );

  const monthlyMinutesSaved = monthlyMinutes * estimatedAutomationRate;
  const monthlyHoursSaved = monthlyMinutesSaved / 60;
  const annualHoursSaved = monthlyHoursSaved * 12;
  const annualCostSavings = annualHoursSaved * HOURLY_RATE_USD;

  const leadingDrivers = [...scoreBreakdown]
    .sort((left, right) => right.contribution - left.contribution)
    .slice(0, 3)
    .map((factor) => FACTOR_METADATA[factor.key].narrative);

  return {
    ...opportunity,
    score,
    monthlyMinutesSaved: roundToOneDecimal(monthlyMinutesSaved),
    monthlyHoursSaved: roundToOneDecimal(monthlyHoursSaved),
    annualHoursSaved: roundToOneDecimal(annualHoursSaved),
    annualCostSavings: Math.round(annualCostSavings),
    estimatedAutomationRate,
    laborHoursPerMonth: roundToOneDecimal(laborHoursPerMonth),
    effortTier: getEffortTier(opportunity),
    valueBand: getValueBand(score),
    scoreBreakdown: scoreBreakdown.map((factor) => ({
      ...factor,
      contribution: roundToOneDecimal(factor.contribution),
    })),
    whyNow: `This opportunity ranks well because ${joinNarratives(leadingDrivers)}.`,
    keyConstraint: buildConstraint(opportunity),
  };
}
