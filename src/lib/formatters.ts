export const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const compactCurrencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

export const numberFormatter = new Intl.NumberFormat("en-US");

export function formatHours(hours: number) {
  if (hours >= 100) {
    return `${Math.round(hours)}h`;
  }

  return `${hours.toFixed(1)}h`;
}

export function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function formatScore(value: number) {
  return value.toFixed(1);
}
