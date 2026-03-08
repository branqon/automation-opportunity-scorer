export const compactCurrencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

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
