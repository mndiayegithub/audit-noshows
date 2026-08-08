/**
 * Phase 9 — Couche typée d'analytics.
 * Tous les call-sites passent par les helpers ci-dessous (D-03 : appel direct
 * au transport interdit ailleurs dans le repo). Chaque helper est fail-soft
 * (D-04) : si l'envoi échoue (adblock, réseau, base Supabase en pause), le
 * funnel commercial n'est jamais interrompu.
 *
 * ── Changement de collecte (2026-08-08) ──────────────────────────────────
 * Ces événements partaient vers `@vercel/analytics`, qui les jetait : les
 * événements personnalisés sont réservés au plan Pro, le projet est en Hobby.
 * Zéro donnée collectée entre avril et août. Ils vont désormais dans la table
 * Supabase `audit_events` via `lib/mesure.ts`.
 *
 * `<Analytics />` reste monté dans `app/layout.tsx` : les pages vues, elles,
 * sont bien collectées sur Hobby, gratuitement, et donnent volume et
 * provenance. Les deux dispositifs sont complémentaires, pas redondants.
 *
 * La promesse de cette couche a tenu : le changement d'outil n'a touché que
 * ce fichier, aucun des 20 call-sites.
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Convention (verrouillée — RESEARCH gotcha §3) :
 * - Event names : snake_case verbatim (ex: "audit_success", PAS "auditSuccess")
 * - Properties : snake_case (ex: taux_noshow, nb_rdv, reco_rate, error_code)
 * - Properties values : string | number | boolean | null UNIQUEMENT
 *
 * PII safety (D-03 / R3 / AC-3) : aucun helper ci-dessous n'accepte de string
 * libre représentant une identité (email, nom_cabinet, contenu CSV). Les
 * signatures TypeScript bloquent statiquement toute fuite de PII via analytics.
 */
import { envoyer, type ProprietesMesure } from "@/lib/mesure";
import type { AuditErrorCode } from "@/types/audit-errors";
import type { CalendlyOrigin } from "@/lib/calendly";

/** Wrapper fail-soft local (D-04). */
function safeTrack(name: string, properties?: ProprietesMesure): void {
  try {
    envoyer(name, properties);
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
 * L'utilisateur a quitté la page PENDANT l'attente du résultat.
 *
 * Émis sur `pagehide` — et pas sur `visibilitychange`, qui se déclenche aussi
 * sur un simple changement d'onglet et compterait des abandons imaginaires.
 * Le transport est `sendBeacon` : un `fetch` ordinaire n'aurait pas le temps
 * de partir. C'est le seul événement du funnel qui mesure une absence.
 */
export function trackAuditAbandoned(durationMs: number): void {
  safeTrack("audit_abandoned", { duration_ms: durationMs });
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
