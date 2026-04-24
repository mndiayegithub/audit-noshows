import { describe, it, expect } from "vitest";
import { computeScore, scoreBadge, computeBlendedScore } from "@/lib/score";

describe("computeScore", () => {
  it("formula: 100 − taux × 3.2 rounded", () => {
    expect(computeScore(10)).toBe(68);
    expect(computeScore(0)).toBe(100);
    expect(computeScore(25)).toBe(20);
  });
  it("clamps to [0, 100]", () => {
    expect(computeScore(50)).toBe(0);
    expect(computeScore(-10)).toBe(100);
  });
  it("defensive: NaN / Infinity → 0", () => {
    expect(computeScore(NaN)).toBe(0);
    expect(computeScore(Infinity)).toBe(0);
    expect(computeScore(-Infinity)).toBe(0);
  });
});

describe("scoreBadge", () => {
  it("good >= 70", () => {
    expect(scoreBadge(85).tone).toBe("good");
    expect(scoreBadge(70).tone).toBe("good");
  });
  it("warn 50-69", () => {
    expect(scoreBadge(60).tone).toBe("warn");
    expect(scoreBadge(50).tone).toBe("warn");
  });
  it("bad < 50", () => {
    expect(scoreBadge(49).tone).toBe("bad");
    expect(scoreBadge(0).tone).toBe("bad");
  });
});

describe("computeBlendedScore", () => {
  it("no google → identical to computeScore", () => {
    expect(computeBlendedScore(10, null)).toBe(computeScore(10));
    expect(computeBlendedScore(10)).toBe(computeScore(10));
    expect(computeBlendedScore(10, { rating: null, user_ratings_total: 100 })).toBe(computeScore(10));
  });
  it("+4 points for 4.8★ / 100 reviews", () => {
    expect(computeBlendedScore(10, { rating: 4.8, user_ratings_total: 100 })).toBe(72);
  });
  it("negative delta for 3.5★ / 30 reviews (JS Math.round rounds half toward +∞)", () => {
    // (3.5 − 4.0) × 5 × 0.6 = −1.5 → Math.round(−1.5) = −1 in JS → 68 − 1 = 67
    expect(computeBlendedScore(10, { rating: 3.5, user_ratings_total: 30 })).toBe(67);
  });
  it("0 delta when confidence is 0 (no reviews)", () => {
    expect(computeBlendedScore(10, { rating: 5, user_ratings_total: 0 })).toBe(68);
  });
  it("clamps to [0, 100]", () => {
    expect(computeBlendedScore(0, { rating: 5, user_ratings_total: 1000 })).toBe(100);
    expect(computeBlendedScore(50, { rating: 1, user_ratings_total: 1000 })).toBeGreaterThanOrEqual(0);
  });
});
