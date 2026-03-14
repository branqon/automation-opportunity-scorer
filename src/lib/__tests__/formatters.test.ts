import { describe, expect, it } from "vitest";
import {
  formatHours,
  formatPercent,
  formatRatePercent,
  formatScore,
  compactCurrencyFormatter,
} from "@/lib/formatters";

describe("formatHours", () => {
  it("shows one decimal for hours under 100", () => {
    expect(formatHours(42.567)).toBe("42.6h");
    expect(formatHours(0.5)).toBe("0.5h");
    expect(formatHours(99.99)).toBe("100.0h");
  });

  it("rounds to integer for >= 100", () => {
    expect(formatHours(100)).toBe("100h");
    expect(formatHours(150.7)).toBe("151h");
    expect(formatHours(1234.5)).toBe("1235h");
  });
});

describe("formatPercent", () => {
  it("converts decimal to percentage", () => {
    expect(formatPercent(0.5)).toBe("50%");
    expect(formatPercent(1)).toBe("100%");
    expect(formatPercent(0)).toBe("0%");
  });

  it("rounds to nearest integer", () => {
    expect(formatPercent(0.333)).toBe("33%");
    expect(formatPercent(0.667)).toBe("67%");
    expect(formatPercent(0.155)).toBe("16%");
  });
});

describe("formatRatePercent", () => {
  it("shows one decimal place for rate values", () => {
    expect(formatRatePercent(0.85)).toBe("85.0%");
    expect(formatRatePercent(0.772)).toBe("77.2%");
    expect(formatRatePercent(0.25)).toBe("25.0%");
  });
});

describe("formatScore", () => {
  it("shows one decimal place", () => {
    expect(formatScore(72)).toBe("72.0");
    expect(formatScore(85.37)).toBe("85.4");
    expect(formatScore(0)).toBe("0.0");
  });
});

describe("compactCurrencyFormatter", () => {
  it("formats thousands with K suffix", () => {
    expect(compactCurrencyFormatter.format(150000)).toBe("$150K");
    expect(compactCurrencyFormatter.format(57300)).toBe("$57.3K");
    expect(compactCurrencyFormatter.format(1000)).toBe("$1K");
  });

  it("formats millions with M suffix", () => {
    expect(compactCurrencyFormatter.format(1500000)).toBe("$1.5M");
    expect(compactCurrencyFormatter.format(2000000)).toBe("$2M");
  });

  it("formats values under 1000 without suffix", () => {
    expect(compactCurrencyFormatter.format(500)).toBe("$500");
    expect(compactCurrencyFormatter.format(84)).toBe("$84");
  });

  it("handles negative values", () => {
    expect(compactCurrencyFormatter.format(-50000)).toBe("-$50K");
  });
});
