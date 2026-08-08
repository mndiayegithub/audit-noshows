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
import type { CalendlyOrigin } from "@/lib/calendly";

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

/**
 * Emplacement du bouton « lancer un audit » sur la landing.
 * Paramètre obligatoire : quatre boutons mènent à /audit, et sans ça on ne
 * peut pas savoir lequel travaille.
 */
export type LandingCtaLocation = "nav" | "hero" | "cta-band" | "footer";

export function trackLandingCtaAuditClick(location: LandingCtaLocation): void {
  safeTrack("landing_cta_audit_click", { location });
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

/**
 * `durationMs` = temps écoulé entre `audit_submitted` et l'arrivée du
 * résultat. L'appel n8n prend 30 à 50 s : c'est le moment le plus fragile du
 * parcours, et il était jusqu'ici totalement aveugle.
 *
 * ⚠️ Trois propriétés — au-dessus des 2 autorisées par Vercel Pro « de base »
 * (l'add-on Web Analytics Plus en donne 8). Sans effet si la collecte part
 * ailleurs (Supabase / n8n) ; à revérifier si on reste sur Vercel.
 */
export function trackAuditSuccess(
  score: number,
  tauxNoshow: number,
  durationMs: number,
): void {
  safeTrack("audit_success", {
    score,
    taux_noshow: tauxNoshow,
    duration_ms: durationMs,
  });
}

export function trackAuditFailed(errorCode: string, durationMs: number): void {
  safeTrack("audit_failed", { error_code: errorCode, duration_ms: durationMs });
}

/**
 * Aligné sur `CalendlyOrigin` : un seul vocabulaire pour l'emplacement, qu'il
 * serve à nommer l'event ou à remplir `utm_content`.
 */
export type CalendlyCtaLocation = CalendlyOrigin;

export function trackCtaCalendlyClick(location: CalendlyCtaLocation): void {
  safeTrack("cta_calendly_click", { location });
}

export function trackGoogleDiagnosticTriggered(): void {
  safeTrack("google_diagnostic_triggered");
}

export function trackPdfDownloaded(): void {
  safeTrack("pdf_downloaded");
}
