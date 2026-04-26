import { describe, it, expect } from "vitest";
import {
  DEGRADED_THRESHOLD,
  REJECT_THRESHOLD,
  MIN_RDV_VALIDES,
} from "@/lib/audit-thresholds";

describe("audit-thresholds (D-06 source of truth)", () => {
  it("DEGRADED_THRESHOLD === 0.90", () => {
    expect(DEGRADED_THRESHOLD).toBe(0.90);
  });

  it("REJECT_THRESHOLD === 0.50", () => {
    expect(REJECT_THRESHOLD).toBe(0.50);
  });

  it("MIN_RDV_VALIDES === 20", () => {
    expect(MIN_RDV_VALIDES).toBe(20);
  });

  it("all 3 thresholds are typed as number (not string)", () => {
    expect(typeof DEGRADED_THRESHOLD).toBe("number");
    expect(typeof REJECT_THRESHOLD).toBe("number");
    expect(typeof MIN_RDV_VALIDES).toBe("number");
  });
});
