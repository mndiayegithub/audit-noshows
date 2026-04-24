import { describe, it, expect } from "vitest";
import { normalizeN8nResponse } from "@/lib/n8n-normalize";

describe("normalizeN8nResponse", () => {
  const payload = { success: true, stats: { global: { taux: 10 } }, rapport_texte: "r" };

  it("unwraps array → { output }", () => {
    const raw = [{ output: payload, email: "x@y.com" }];
    expect(normalizeN8nResponse(raw)).toEqual(payload);
  });

  it("unwraps object { output }", () => {
    const raw = { output: payload, email: "x@y.com" };
    expect(normalizeN8nResponse(raw)).toEqual(payload);
  });

  it("passes direct { success, stats } through", () => {
    expect(normalizeN8nResponse(payload)).toEqual(payload);
  });

  it("falls back to first element if array item has no output wrapper", () => {
    const raw = [payload];
    expect(normalizeN8nResponse(raw)).toEqual(payload);
  });

  it("handles null/undefined safely", () => {
    expect(normalizeN8nResponse(null)).toBeNull();
    expect(normalizeN8nResponse(undefined)).toBeUndefined();
  });
});
