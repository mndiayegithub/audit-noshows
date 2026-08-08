import { describe, it, expect, vi, beforeEach } from "vitest";
import { envoyer } from "@/lib/mesure";
import {
  trackLandingView,
  trackLandingCtaAuditClick,
  trackAuditView,
  trackCsvPreviewLoaded,
  trackCsvRejected,
  trackAuditSubmitted,
  trackAuditSuccess,
  trackAuditFailed,
  trackAuditAbandoned,
  trackCtaCalendlyClick,
  trackGoogleDiagnosticTriggered,
  trackPdfDownloaded,
} from "@/lib/analytics";

vi.mock("@/lib/mesure", () => ({
  envoyer: vi.fn(),
}));

beforeEach(() => {
  vi.mocked(envoyer).mockReset();
});

describe("trackLandingView", () => {
  it('emits "landing_view" without properties when no referrer', () => {
    trackLandingView();
    expect(envoyer).toHaveBeenCalledTimes(1);
    expect(envoyer).toHaveBeenCalledWith("landing_view", undefined);
  });

  it('emits "landing_view" with { referrer } when referrer provided', () => {
    trackLandingView("https://google.com");
    expect(envoyer).toHaveBeenCalledWith("landing_view", { referrer: "https://google.com" });
  });
});

describe("trackLandingCtaAuditClick", () => {
  it.each(["nav", "hero", "cta-band", "footer"] as const)(
    'emits "landing_cta_audit_click" with location "%s"',
    (location) => {
      trackLandingCtaAuditClick(location);
      expect(envoyer).toHaveBeenCalledWith("landing_cta_audit_click", { location });
    },
  );
});

describe("trackAuditView", () => {
  it('emits "audit_view" without properties', () => {
    trackAuditView();
    expect(envoyer).toHaveBeenCalledWith("audit_view", undefined);
  });
});

describe("trackCsvPreviewLoaded", () => {
  it('emits "csv_preview_loaded" with snake_case nb_rdv and reco_rate', () => {
    trackCsvPreviewLoaded(150, 0.85);
    expect(envoyer).toHaveBeenCalledWith("csv_preview_loaded", { nb_rdv: 150, reco_rate: 0.85 });
  });

  it("preserves zero values without dropping properties", () => {
    trackCsvPreviewLoaded(0, 0);
    expect(envoyer).toHaveBeenCalledWith("csv_preview_loaded", { nb_rdv: 0, reco_rate: 0 });
  });
});

describe("trackCsvRejected", () => {
  it('emits "csv_rejected" with error_code from AuditErrorCode union', () => {
    trackCsvRejected("MISSING_COLUMNS");
    expect(envoyer).toHaveBeenCalledWith("csv_rejected", { error_code: "MISSING_COLUMNS" });
  });

  it("supports INSUFFICIENT_DATA error code", () => {
    trackCsvRejected("INSUFFICIENT_DATA");
    expect(envoyer).toHaveBeenCalledWith("csv_rejected", { error_code: "INSUFFICIENT_DATA" });
  });
});

describe("trackAuditSubmitted", () => {
  it('emits "audit_submitted" with { degraded: true }', () => {
    trackAuditSubmitted(true);
    expect(envoyer).toHaveBeenCalledWith("audit_submitted", { degraded: true });
  });

  it('emits "audit_submitted" with { degraded: false }', () => {
    trackAuditSubmitted(false);
    expect(envoyer).toHaveBeenCalledWith("audit_submitted", { degraded: false });
  });
});

describe("trackAuditSuccess", () => {
  it('emits "audit_success" with score + taux_noshow + duration_ms snake_case', () => {
    trackAuditSuccess(72, 18.5, 42_318);
    expect(envoyer).toHaveBeenCalledWith("audit_success", {
      score: 72,
      taux_noshow: 18.5,
      duration_ms: 42_318,
    });
  });

  it("preserves a zero duration rather than dropping the property", () => {
    trackAuditSuccess(72, 18.5, 0);
    expect(envoyer).toHaveBeenCalledWith("audit_success", {
      score: 72,
      taux_noshow: 18.5,
      duration_ms: 0,
    });
  });

  it("is fail-soft when track throws (R4 / D-04)", () => {
    vi.mocked(envoyer).mockImplementationOnce(() => {
      throw new Error("blocked by adblocker");
    });
    expect(() => trackAuditSuccess(72, 18.5, 1000)).not.toThrow();
  });
});

describe("trackAuditFailed", () => {
  it('emits "audit_failed" with error_code + duration_ms', () => {
    trackAuditFailed("VALIDATION_ERROR", 12_004);
    expect(envoyer).toHaveBeenCalledWith("audit_failed", {
      error_code: "VALIDATION_ERROR",
      duration_ms: 12_004,
    });
  });

  it("timestamps a client-side timeout too", () => {
    trackAuditFailed("CLIENT_EXCEPTION", 60_000);
    expect(envoyer).toHaveBeenCalledWith("audit_failed", {
      error_code: "CLIENT_EXCEPTION",
      duration_ms: 60_000,
    });
  });
});

describe("trackAuditAbandoned", () => {
  it('emits "audit_abandoned" with the elapsed wait', () => {
    trackAuditAbandoned(37_500);
    expect(envoyer).toHaveBeenCalledWith("audit_abandoned", { duration_ms: 37_500 });
  });
});

describe("trackCtaCalendlyClick", () => {
  // Le vocabulaire est celui de CalendlyOrigin : un seul jeu de valeurs
  // partagé entre l'event et le `utm_content` du lien sortant.
  it.each(["audit-results", "pdf"] as const)(
    'emits "cta_calendly_click" with location "%s"',
    (location) => {
      trackCtaCalendlyClick(location);
      expect(envoyer).toHaveBeenCalledWith("cta_calendly_click", { location });
    },
  );
});

describe("trackGoogleDiagnosticTriggered", () => {
  it('emits "google_diagnostic_triggered" without properties', () => {
    trackGoogleDiagnosticTriggered();
    expect(envoyer).toHaveBeenCalledWith("google_diagnostic_triggered", undefined);
  });
});

describe("trackPdfDownloaded", () => {
  it('emits "pdf_downloaded" without properties', () => {
    trackPdfDownloaded();
    expect(envoyer).toHaveBeenCalledWith("pdf_downloaded", undefined);
  });

  it("is fail-soft when track throws", () => {
    vi.mocked(envoyer).mockImplementationOnce(() => {
      throw new Error("network error");
    });
    expect(() => trackPdfDownloaded()).not.toThrow();
  });
});
