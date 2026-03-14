/**
 * Deterministic compact currency formatter that avoids Intl.NumberFormat
 * compact notation differences between Node and browsers (e.g. "$150.0K"
 * vs "$150K"), which cause React hydration mismatches.
 */
export const compactCurrencyFormatter = {
  format(value: number): string {
    const abs = Math.abs(value);
    const sign = value < 0 ? "-" : "";

    if (abs >= 1_000_000) {
      const millions = abs / 1_000_000;
      const formatted = millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1);
      return `${sign}$${formatted}M`;
    }

    if (abs >= 1_000) {
      const thousands = abs / 1_000;
      const formatted = thousands % 1 === 0 ? thousands.toFixed(0) : thousands.toFixed(1);
      return `${sign}$${formatted}K`;
    }

    return `${sign}$${abs % 1 === 0 ? abs.toFixed(0) : abs.toFixed(1)}`;
  },
};

export function formatHours(hours: number) {
  if (hours >= 100) {
    return `${Math.round(hours)}h`;
  }

  return `${hours.toFixed(1)}h`;
}

export function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function formatRatePercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

export function formatScore(value: number) {
  return value.toFixed(1);
}
