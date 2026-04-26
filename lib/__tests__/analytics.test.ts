import { describe, it, expect, vi, beforeEach } from "vitest";
import { track } from "@vercel/analytics";
import {
  trackLandingView,
  trackLandingCtaAuditClick,
  trackAuditView,
  trackCsvPreviewLoaded,
  trackCsvRejected,
  trackAuditSubmitted,
  trackAuditSuccess,
  trackAuditFailed,
  trackCtaCalendlyClick,
  trackGoogleDiagnosticTriggered,
  trackPdfDownloaded,
} from "@/lib/analytics";

vi.mock("@vercel/analytics", () => ({
  track: vi.fn(),
}));

beforeEach(() => {
  vi.mocked(track).mockReset();
});

describe("trackLandingView", () => {
  it('emits "landing_view" without properties when no referrer', () => {
    trackLandingView();
    expect(track).toHaveBeenCalledTimes(1);
    expect(track).toHaveBeenCalledWith("landing_view", undefined);
  });

  it('emits "landing_view" with { referrer } when referrer provided', () => {
    trackLandingView("https://google.com");
    expect(track).toHaveBeenCalledWith("landing_view", { referrer: "https://google.com" });
  });
});

describe("trackLandingCtaAuditClick", () => {
  it('emits "landing_cta_audit_click" without properties', () => {
    trackLandingCtaAuditClick();
    expect(track).toHaveBeenCalledWith("landing_cta_audit_click", undefined);
  });
});

describe("trackAuditView", () => {
  it('emits "audit_view" without properties', () => {
    trackAuditView();
    expect(track).toHaveBeenCalledWith("audit_view", undefined);
  });
});

describe("trackCsvPreviewLoaded", () => {
  it('emits "csv_preview_loaded" with snake_case nb_rdv and reco_rate', () => {
    trackCsvPreviewLoaded(150, 0.85);
    expect(track).toHaveBeenCalledWith("csv_preview_loaded", { nb_rdv: 150, reco_rate: 0.85 });
  });

  it("preserves zero values without dropping properties", () => {
    trackCsvPreviewLoaded(0, 0);
    expect(track).toHaveBeenCalledWith("csv_preview_loaded", { nb_rdv: 0, reco_rate: 0 });
  });
});

describe("trackCsvRejected", () => {
  it('emits "csv_rejected" with error_code from AuditErrorCode union', () => {
    trackCsvRejected("MISSING_COLUMNS");
    expect(track).toHaveBeenCalledWith("csv_rejected", { error_code: "MISSING_COLUMNS" });
  });

  it("supports INSUFFICIENT_DATA error code", () => {
    trackCsvRejected("INSUFFICIENT_DATA");
    expect(track).toHaveBeenCalledWith("csv_rejected", { error_code: "INSUFFICIENT_DATA" });
  });
});

describe("trackAuditSubmitted", () => {
  it('emits "audit_submitted" with { degraded: true }', () => {
    trackAuditSubmitted(true);
    expect(track).toHaveBeenCalledWith("audit_submitted", { degraded: true });
  });

  it('emits "audit_submitted" with { degraded: false }', () => {
    trackAuditSubmitted(false);
    expect(track).toHaveBeenCalledWith("audit_submitted", { degraded: false });
  });
});

describe("trackAuditSuccess", () => {
  it('emits "audit_success" with score + taux_noshow snake_case', () => {
    trackAuditSuccess(72, 18.5);
    expect(track).toHaveBeenCalledWith("audit_success", { score: 72, taux_noshow: 18.5 });
  });

  it("is fail-soft when track throws (R4 / D-04)", () => {
    vi.mocked(track).mockImplementationOnce(() => {
      throw new Error("blocked by adblocker");
    });
    expect(() => trackAuditSuccess(72, 18.5)).not.toThrow();
  });
});

describe("trackAuditFailed", () => {
  it('emits "audit_failed" with error_code free string', () => {
    trackAuditFailed("VALIDATION_ERROR");
    expect(track).toHaveBeenCalledWith("audit_failed", { error_code: "VALIDATION_ERROR" });
  });
});

describe("trackCtaCalendlyClick", () => {
  it('emits "cta_calendly_click" with location "hero"', () => {
    trackCtaCalendlyClick("hero");
    expect(track).toHaveBeenCalledWith("cta_calendly_click", { location: "hero" });
  });

  it('emits "cta_calendly_click" with location "footer"', () => {
    trackCtaCalendlyClick("footer");
    expect(track).toHaveBeenCalledWith("cta_calendly_click", { location: "footer" });
  });

  it('emits "cta_calendly_click" with location "audit-results"', () => {
    trackCtaCalendlyClick("audit-results");
    expect(track).toHaveBeenCalledWith("cta_calendly_click", { location: "audit-results" });
  });
});

describe("trackGoogleDiagnosticTriggered", () => {
  it('emits "google_diagnostic_triggered" without properties', () => {
    trackGoogleDiagnosticTriggered();
    expect(track).toHaveBeenCalledWith("google_diagnostic_triggered", undefined);
  });
});

describe("trackPdfDownloaded", () => {
  it('emits "pdf_downloaded" without properties', () => {
    trackPdfDownloaded();
    expect(track).toHaveBeenCalledWith("pdf_downloaded", undefined);
  });

  it("is fail-soft when track throws", () => {
    vi.mocked(track).mockImplementationOnce(() => {
      throw new Error("network error");
    });
    expect(() => trackPdfDownloaded()).not.toThrow();
  });
});
