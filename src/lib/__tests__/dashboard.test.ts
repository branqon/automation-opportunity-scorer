import { describe, expect, it } from "vitest";

import {
  applyImportanceSearchParams,
  hasCustomImportance,
  parseImportance,
} from "@/lib/dashboard";
import { DEFAULT_IMPORTANCE } from "@/lib/scoring";

describe("parseImportance", () => {
  it("returns default importance when weight params are absent", () => {
    expect(parseImportance(new URLSearchParams())).toEqual(DEFAULT_IMPORTANCE);
  });

  it("parses, rounds, and clamps weight params", () => {
    const params = new URLSearchParams(
      "w_volume=21&w_rework=4.7&w_slaRisk=not-a-number",
    );

    expect(parseImportance(params)).toEqual({
      ...DEFAULT_IMPORTANCE,
      volume: 20,
      rework: 5,
      slaRisk: DEFAULT_IMPORTANCE.slaRisk,
    });
  });
});

describe("hasCustomImportance", () => {
  it("detects when the current importance differs from defaults", () => {
    expect(hasCustomImportance(DEFAULT_IMPORTANCE)).toBe(false);
    expect(
      hasCustomImportance({
        ...DEFAULT_IMPORTANCE,
        volume: DEFAULT_IMPORTANCE.volume + 1,
      }),
    ).toBe(true);
  });
});

describe("applyImportanceSearchParams", () => {
  it("preserves existing filter params while adding custom weights", () => {
    const params = new URLSearchParams("team=security-ops&focus=quick-wins");
    const next = applyImportanceSearchParams(params, {
      ...DEFAULT_IMPORTANCE,
      volume: 1,
      slaRisk: 20,
    });

    expect(next.get("team")).toBe("security-ops");
    expect(next.get("focus")).toBe("quick-wins");
    expect(next.get("w_volume")).toBe("1");
    expect(next.get("w_slaRisk")).toBe("20");
  });

  it("removes weight params when importance matches defaults", () => {
    const params = new URLSearchParams("w_volume=1&w_slaRisk=20");
    const next = applyImportanceSearchParams(params, DEFAULT_IMPORTANCE);

    expect(next.get("w_volume")).toBeNull();
    expect(next.get("w_slaRisk")).toBeNull();
  });
});
