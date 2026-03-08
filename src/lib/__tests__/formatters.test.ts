import { describe, expect, it } from "vitest";
import {
  formatHours,
  formatPercent,
  formatScore,
  currencyFormatter,
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

describe("formatScore", () => {
  it("shows one decimal place", () => {
    expect(formatScore(72)).toBe("72.0");
    expect(formatScore(85.37)).toBe("85.4");
    expect(formatScore(0)).toBe("0.0");
  });
});

describe("currencyFormatter", () => {
  it("formats as USD with no decimals", () => {
    const result = currencyFormatter.format(1234);
    expect(result).toBe("$1,234");
  });
});

describe("compactCurrencyFormatter", () => {
  it("uses compact notation for large values", () => {
    const result = compactCurrencyFormatter.format(150000);
    // maximumFractionDigits: 1 may produce "$150.0K" or "$150K" depending on runtime
    expect(result).toMatch(/^\$150(\.0)?K$/);
  });
});
