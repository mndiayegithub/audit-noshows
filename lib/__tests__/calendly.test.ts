import { describe, it, expect, afterEach, vi } from "vitest";
import { lienCalendly } from "@/lib/calendly";

afterEach(() => {
  vi.unstubAllEnvs();
});

/** Renvoie les paramètres de requête d'une URL, sous forme d'objet. */
function params(url: string): Record<string, string> {
  return Object.fromEntries(new URL(url).searchParams.entries());
}

describe("lienCalendly", () => {
  it("returns undefined when NEXT_PUBLIC_CALENDLY_URL is unset", () => {
    vi.stubEnv("NEXT_PUBLIC_CALENDLY_URL", "");
    expect(lienCalendly("audit-results")).toBeUndefined();
  });

  it("appends the four UTM params with ? on a bare URL", () => {
    vi.stubEnv("NEXT_PUBLIC_CALENDLY_URL", "https://calendly.com/perfiamatic/20min");
    const url = lienCalendly("audit-results");
    expect(url).toBeDefined();
    expect(params(url!)).toEqual({
      utm_source: "audit.perfiamatic.fr",
      utm_medium: "site",
      utm_campaign: "audit",
      utm_content: "audit-results",
    });
  });

  it("preserves an existing query string and joins with &", () => {
    vi.stubEnv("NEXT_PUBLIC_CALENDLY_URL", "https://calendly.com/perfiamatic/20min?hide_gdpr_banner=1");
    const url = lienCalendly("pdf")!;
    expect(url).toContain("?hide_gdpr_banner=1&");
    expect(params(url).hide_gdpr_banner).toBe("1");
    expect(params(url).utm_content).toBe("pdf");
  });

  it("distinguishes each origin through utm_content only", () => {
    vi.stubEnv("NEXT_PUBLIC_CALENDLY_URL", "https://calendly.com/perfiamatic/20min");
    const a = params(lienCalendly("audit-results")!);
    const b = params(lienCalendly("pdf")!);
    expect(a.utm_source).toBe(b.utm_source);
    expect(a.utm_campaign).toBe(b.utm_campaign);
    expect(a.utm_content).not.toBe(b.utm_content);
  });

  it("adds the Calendly email prefill, URL-encoded", () => {
    vi.stubEnv("NEXT_PUBLIC_CALENDLY_URL", "https://calendly.com/perfiamatic/20min");
    const url = lienCalendly("audit-results", { email: "dr.durand+test@cabinet.fr" })!;
    expect(url).toContain("dr.durand%2Btest%40cabinet.fr");
    expect(params(url).email).toBe("dr.durand+test@cabinet.fr");
  });

  it("omits the email param when none is provided", () => {
    vi.stubEnv("NEXT_PUBLIC_CALENDLY_URL", "https://calendly.com/perfiamatic/20min");
    expect(params(lienCalendly("audit-results")!)).not.toHaveProperty("email");
    expect(params(lienCalendly("audit-results", {})!)).not.toHaveProperty("email");
  });

  it("keeps utm_campaign stable — it is the cross-site aggregation key", () => {
    vi.stubEnv("NEXT_PUBLIC_CALENDLY_URL", "https://calendly.com/perfiamatic/20min");
    // Renommer cette valeur casserait l'agrégation avec perfiamatic.fr.
    expect(params(lienCalendly("pdf")!).utm_campaign).toBe("audit");
  });
});
