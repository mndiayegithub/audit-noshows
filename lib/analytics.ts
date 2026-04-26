/**
 * Phase 9 — Couche typée d'analytics (Vercel Web Analytics).
 * Tous les call-sites passent par les helpers ci-dessous (D-03 :
 * import direct de `@vercel/analytics` interdit ailleurs dans le repo).
 * Chaque helper est fail-soft (D-04) : si track() throw (adblock,
 * réseau, infra Vercel down), le funnel commercial n'est jamais interrompu.
 *
 * Convention (verrouillée — RESEARCH gotcha §3) :
 * - Event names : snake_case verbatim (ex: "audit_success", PAS "auditSuccess")
 * - Properties : snake_case (ex: taux_noshow, nb_rdv, reco_rate, error_code)
 * - Properties values : string | number | boolean | null UNIQUEMENT (RESEARCH §Q3)
 *
 * PII safety (D-03 / R3 / AC-3) : aucun helper ci-dessous n'accepte de string
 * libre représentant une identité (email, nom_cabinet, contenu CSV). Les
 * signatures TypeScript bloquent statiquement toute fuite de PII via analytics.
 */
import { track } from "@vercel/analytics";
import type { AuditErrorCode } from "@/types/audit-errors";

/** Wrapper fail-soft local (D-04). */
function safeTrack(
  name: string,
  properties?: Record<string, string | number | boolean | null>,
): void {
  try {
    track(name, properties);
  } catch {
    // Silencieux — analytics ne doit JAMAIS bloquer le parcours commercial.
  }
}

export function trackLandingView(referrer?: string): void {
  safeTrack("landing_view", referrer ? { referrer } : undefined);
}

export function trackLandingCtaAuditClick(): void {
  safeTrack("landing_cta_audit_click");
}

export function trackAuditView(): void {
  safeTrack("audit_view");
}

export function trackCsvPreviewLoaded(nbRdv: number, recoRate: number): void {
  safeTrack("csv_preview_loaded", { nb_rdv: nbRdv, reco_rate: recoRate });
}

export function trackCsvRejected(errorCode: AuditErrorCode): void {
  safeTrack("csv_rejected", { error_code: errorCode });
}

export function trackAuditSubmitted(degraded: boolean): void {
  safeTrack("audit_submitted", { degraded });
}

export function trackAuditSuccess(score: number, tauxNoshow: number): void {
  safeTrack("audit_success", { score, taux_noshow: tauxNoshow });
}

export function trackAuditFailed(errorCode: string): void {
  safeTrack("audit_failed", { error_code: errorCode });
}

export type CalendlyCtaLocation = "hero" | "footer" | "audit-results";

export function trackCtaCalendlyClick(location: CalendlyCtaLocation): void {
  safeTrack("cta_calendly_click", { location });
}

export function trackGoogleDiagnosticTriggered(): void {
  safeTrack("google_diagnostic_triggered");
}

export function trackPdfDownloaded(): void {
  safeTrack("pdf_downloaded");
}
