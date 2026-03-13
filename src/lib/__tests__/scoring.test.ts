import { describe, expect, it } from "vitest";
import {
  enrichOpportunity,
  SCORE_WEIGHTS,
  DEFAULT_IMPORTANCE,
  normalizeWeights,
} from "@/lib/scoring";
import type { ScoreFactorKey } from "@/lib/scoring";
import type { Opportunity, Team } from "@/generated/prisma/client";

type OpportunityWithTeam = Opportunity & { team: Team };

function makeOpportunity(
  overrides: Partial<Omit<OpportunityWithTeam, "team">> & {
    team?: Partial<Team>;
  } = {},
): OpportunityWithTeam {
  const { team: teamOverrides, ...opportunityOverrides } = overrides;

  const team: Team = {
    id: "team-1",
    slug: "infrastructure",
    name: "Infrastructure",
    description: "Infrastructure team",
    createdAt: new Date("2025-01-01T00:00:00Z"),
    updatedAt: new Date("2025-01-01T00:00:00Z"),
    ...teamOverrides,
  };

  return {
    id: "opp-1",
    slug: "test-opportunity",
    name: "Test Opportunity",
    teamId: team.id,
    monthlyVolume: 200,
    avgHandleTimeMinutes: 20,
    repeatabilityScore: 3,
    standardizationScore: 3,
    approvalComplexityScore: 3,
    reworkRateScore: 3,
    slaRiskScore: 3,
    customerImpactScore: 3,
    implementationDifficultyScore: 3,
    suggestedAutomationType: "SELF_SERVICE_WORKFLOW",
    summary: "Test summary",
    suggestedApproach: "Test approach",
    implementationConsiderations: "Test considerations",
    riskNotes: "Test risk notes",
    recommendedNextStep: "Test next step",
    createdAt: new Date("2025-01-01T00:00:00Z"),
    updatedAt: new Date("2025-01-01T00:00:00Z"),
    ...opportunityOverrides,
    team,
  };
}

describe("SCORE_WEIGHTS", () => {
  it("weights sum to 1.0", () => {
    const sum = Object.values(SCORE_WEIGHTS).reduce(
      (total, weight) => total + weight,
      0,
    );
    expect(sum).toBeCloseTo(1.0, 10);
  });
});

describe("enrichOpportunity", () => {
  it("returns score between 0 and 100", () => {
    const result = enrichOpportunity(makeOpportunity());
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("calculates annual cost savings from hours and hourly rate", () => {
    const result = enrichOpportunity(makeOpportunity());
    // annualCostSavings = annualHoursSaved * HOURLY_RATE_USD (48)
    // annualHoursSaved = monthlyHoursSaved * 12
    // monthlyHoursSaved = monthlyMinutesSaved / 60
    // monthlyMinutesSaved = (monthlyVolume * avgHandleTimeMinutes) * estimatedAutomationRate
    const monthlyMinutes = 200 * 20;
    const laborHoursPerMonth = monthlyMinutes / 60;
    expect(result.laborHoursPerMonth).toBeCloseTo(laborHoursPerMonth, 0);
    expect(result.annualCostSavings).toBeGreaterThan(0);
    // Verify the chain: annualCostSavings should be roughly annualHoursSaved * 48
    expect(result.annualCostSavings).toBe(
      Math.round(result.annualHoursSaved * 48),
    );
  });

  it("produces higher score for high-volume high-repeatability vs low", () => {
    const high = enrichOpportunity(
      makeOpportunity({
        monthlyVolume: 800,
        repeatabilityScore: 5,
      }),
    );

    const low = enrichOpportunity(
      makeOpportunity({
        monthlyVolume: 20,
        repeatabilityScore: 1,
      }),
    );

    expect(high.score).toBeGreaterThan(low.score);
  });

  it('assigns "Quick win" for low difficulty and low approval', () => {
    const result = enrichOpportunity(
      makeOpportunity({
        implementationDifficultyScore: 1,
        approvalComplexityScore: 1,
      }),
    );
    expect(result.effortTier).toBe("Quick win");
  });

  it('assigns "Strategic bet" for high difficulty', () => {
    const result = enrichOpportunity(
      makeOpportunity({
        implementationDifficultyScore: 4,
      }),
    );
    expect(result.effortTier).toBe("Strategic bet");
  });

  it('assigns "Automate now" for score >= 70', () => {
    // Max out all factors to get a high score
    const result = enrichOpportunity(
      makeOpportunity({
        monthlyVolume: 800,
        avgHandleTimeMinutes: 60,
        repeatabilityScore: 5,
        standardizationScore: 5,
        reworkRateScore: 5,
        slaRiskScore: 5,
        customerImpactScore: 5,
        implementationDifficultyScore: 1,
        approvalComplexityScore: 1,
      }),
    );
    expect(result.score).toBeGreaterThanOrEqual(70);
    expect(result.valueBand).toBe("Automate now");
  });

  it("returns 9 score breakdown entries", () => {
    const result = enrichOpportunity(makeOpportunity());
    expect(result.scoreBreakdown).toHaveLength(9);
  });

  it("breakdown contributions sum to composite score", () => {
    const result = enrichOpportunity(makeOpportunity());
    const contributionSum = result.scoreBreakdown.reduce(
      (total, entry) => total + entry.contribution,
      0,
    );
    // Both values are rounded to one decimal, so they should be close
    expect(contributionSum).toBeCloseTo(result.score, 0);
  });

  it("clamps automation rate between 0.25 and 0.85", () => {
    // Low scores should still clamp to the 0.25 floor.
    const lowResult = enrichOpportunity(
      makeOpportunity({
        repeatabilityScore: 1,
        standardizationScore: 1,
        implementationDifficultyScore: 5,
        approvalComplexityScore: 5,
      }),
    );
    expect(lowResult.estimatedAutomationRate).toBeCloseTo(0.25, 10);

    // High scores should cap at the 0.85 ceiling instead of rounding up past it.
    const highResult = enrichOpportunity(
      makeOpportunity({
        repeatabilityScore: 5,
        standardizationScore: 5,
        implementationDifficultyScore: 1,
        approvalComplexityScore: 1,
      }),
    );
    expect(highResult.estimatedAutomationRate).toBeCloseTo(0.85, 10);
  });

  it("generates whyNow narrative", () => {
    const result = enrichOpportunity(makeOpportunity());
    expect(result.whyNow).toContain("This opportunity ranks well because");
    expect(result.whyNow.length).toBeGreaterThan(40);
  });

  it("uses SCORE_WEIGHTS when no custom weights provided", () => {
    const opp = makeOpportunity();
    const defaultResult = enrichOpportunity(opp);
    const explicitResult = enrichOpportunity(opp, SCORE_WEIGHTS);
    expect(explicitResult.score).toBe(defaultResult.score);
    expect(explicitResult.scoreBreakdown).toEqual(defaultResult.scoreBreakdown);
  });

  it("produces different scores with different custom weights", () => {
    const opp = makeOpportunity({
      monthlyVolume: 800,
      repeatabilityScore: 5,
      slaRiskScore: 1,
    });

    // Heavy weight on volume/repeatability
    const volumeHeavy: Record<ScoreFactorKey, number> = {
      volume: 50,
      laborIntensity: 10,
      repeatability: 20,
      standardization: 5,
      rework: 5,
      slaRisk: 1,
      customerImpact: 1,
      implementationEase: 5,
      approvalEase: 3,
    };

    // Heavy weight on slaRisk
    const slaHeavy: Record<ScoreFactorKey, number> = {
      volume: 1,
      laborIntensity: 1,
      repeatability: 1,
      standardization: 1,
      rework: 1,
      slaRisk: 90,
      customerImpact: 1,
      implementationEase: 1,
      approvalEase: 3,
    };

    const volumeResult = enrichOpportunity(opp, normalizeWeights(volumeHeavy));
    const slaResult = enrichOpportunity(opp, normalizeWeights(slaHeavy));

    // With high volume and repeatability, volumeHeavy should score higher
    expect(volumeResult.score).toBeGreaterThan(slaResult.score);
  });
});

describe("normalizeWeights", () => {
  it("normalizes importance values to sum to 1.0", () => {
    const raw: Record<ScoreFactorKey, number> = {
      volume: 50,
      laborIntensity: 50,
      repeatability: 0,
      standardization: 0,
      rework: 0,
      slaRisk: 0,
      customerImpact: 0,
      implementationEase: 0,
      approvalEase: 0,
    };
    const normalized = normalizeWeights(raw);
    const sum = Object.values(normalized).reduce((total, w) => total + w, 0);
    expect(sum).toBeCloseTo(1.0, 10);
    expect(normalized.volume).toBeCloseTo(0.5, 10);
    expect(normalized.laborIntensity).toBeCloseTo(0.5, 10);
  });

  it("DEFAULT_IMPORTANCE normalizes to SCORE_WEIGHTS", () => {
    const normalized = normalizeWeights(DEFAULT_IMPORTANCE);
    for (const key of Object.keys(SCORE_WEIGHTS) as ScoreFactorKey[]) {
      expect(normalized[key]).toBeCloseTo(SCORE_WEIGHTS[key], 10);
    }
  });
});
