import type { EffortTier, ValueBand } from "@/lib/scoring";

type EffortBadgeVariant = "success" | "warning" | "critical";
type ValueBadgeVariant = "accent" | "warning" | "neutral";

export function getScoreColorClass(valueBand: ValueBand): string {
  switch (valueBand) {
    case "Automate now":
      return "text-[color:var(--semantic-success-text)]";
    case "Validate next":
      return "text-[color:var(--semantic-warning-text)]";
    case "Monitor":
      return "text-[color:var(--semantic-critical-text)]";
  }
}

export function getEffortBadgeVariant(tier: EffortTier): EffortBadgeVariant {
  if (tier === "Quick win") {
    return "success";
  }

  if (tier === "Strategic bet") {
    return "critical";
  }

  return "warning";
}

export function getValueBadgeVariant(
  valueBand: ValueBand,
): ValueBadgeVariant {
  if (valueBand === "Automate now") {
    return "accent";
  }

  if (valueBand === "Validate next") {
    return "warning";
  }

  return "neutral";
}
