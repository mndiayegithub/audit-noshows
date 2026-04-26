/**
 * Server-side validation of the /api/audit payload (Phase 05 — RGPD & Sécurité).
 * Phase 07 extension: branche d'erreur CSV étendue avec `error_code` typé +
 * helper `evaluateRecognition()` pour D-06 (REJECT/DEGRADED thresholds).
 *
 * Pure, testable, no I/O. Returns a discriminated union so the caller knows
 * whether to forward the payload to n8n or to short-circuit with 400.
 *
 * Décision Phase 7 (Task 3): le `ValidationResult` reste discriminé à 3 branches.
 * Les erreurs CSV (taille, colonnes) portent un `error_code` typé conforme à la SPEC.
 * Les erreurs hors-CSV (email, nom_cabinet, ca_moyen) conservent la branche legacy
 * `{ ok:false, error: string }` car la SPEC verrouille 5 codes (tous CSV-centric).
 */

import type { AuditErrorCode, AuditErrorPayload } from "@/types/audit-errors";
import {
  REJECT_THRESHOLD,
  MIN_RDV_VALIDES,
  DEGRADED_THRESHOLD,
} from "./audit-thresholds";

const MAX_CSV_BYTES = 2_000_000;
const MAX_CABINET_LEN = 120;
const MAX_EMAIL_LEN = 254;
const MAX_CA = 10_000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface AuditPayload {
  csv: string;
  nom_cabinet: string;
  ca_moyen: number;
  email?: string;
}

export type ValidationResult =
  | { ok: true; values: AuditPayload }
  | { ok: false; error: string }                          // erreurs hors-CSV (email, nom_cabinet, ca_moyen)
  | {
      ok: false;
      error_code: AuditErrorCode;
      error: string;
      details?: Record<string, unknown>;
    };                                                    // erreurs CSV structurées (Phase 7 REQ #2)

function detectSeparator(headerLine: string): "," | ";" {
  return (headerLine.match(/;/g)?.length ?? 0) > (headerLine.match(/,/g)?.length ?? 0) ? ";" : ",";
}

const HEADER_DATE = /^(date|jour|date_rdv|date du rendez-vous)$/;
const HEADER_STATUT = /^(statut|status|état|etat)$/;

/**
 * Scanne les 20 premières lignes pour trouver le header CSV. Une ligne candidate
 * doit contenir un séparateur ET au moins un signal date OU statut. La ligne avec
 * les deux signaux gagne (header complet) ; à défaut, on retombe sur la première
 * ligne candidate (header partiel — laisse le caller détecter la colonne manquante).
 */
function findHeaderLineIndex(lines: string[]): number {
  let firstCandidate = -1;
  for (let i = 0; i < Math.min(lines.length, 20); i++) {
    const line = lines[i];
    if (!/[,;\t]/.test(line)) continue;
    const sep = detectSeparator(line);
    const cells = line.split(sep).map((c) => c.trim().toLowerCase());
    const hasDate = cells.some((c) => HEADER_DATE.test(c));
    const hasStatut = cells.some((c) => HEADER_STATUT.test(c));
    if (hasDate && hasStatut) return i;
    if ((hasDate || hasStatut) && firstCandidate === -1) firstCandidate = i;
  }
  return firstCandidate;
}

export function validateAuditPayload(formData: FormData): ValidationResult {
  const csvRaw = formData.get("csv");
  const nomRaw = formData.get("nom_cabinet");
  const caRaw = formData.get("ca_moyen");
  const emailRaw = formData.get("email");

  if (typeof csvRaw !== "string" || csvRaw.trim().length === 0) {
    return {
      ok: false,
      error_code: "EMPTY_AFTER_PARSING",
      error: "CSV vide ou invalide",
    };
  }
  if (csvRaw.length > MAX_CSV_BYTES) {
    return {
      ok: false,
      error_code: "EMPTY_AFTER_PARSING",
      error: "CSV trop volumineux (max 2 Mo)",
    };
  }
  const lines = csvRaw.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    return {
      ok: false,
      error_code: "EMPTY_AFTER_PARSING",
      error: "CSV vide ou invalide",
    };
  }
  // Skip leading metadata lines (Doctolib "Export du …", commentaires `#`,
  // titres cabinet) jusqu'à trouver la ligne header avec date+statut.
  const headerIdx = findHeaderLineIndex(lines);
  if (headerIdx === -1) {
    return {
      ok: false,
      error_code: "MISSING_COLUMNS",
      error: "Colonnes manquantes : date et/ou statut introuvables",
      details: { missing: ["date", "statut"] },
    };
  }
  const headerLine = lines[headerIdx];
  const sep = detectSeparator(headerLine);
  const headers = headerLine.split(sep).map((h) => h.trim().toLowerCase());
  const hasDate = headers.some((h) =>
    /^(date|jour|date_rdv|date du rendez-vous)$/.test(h),
  );
  const hasStatut = headers.some((h) =>
    /^(statut|status|état|etat)$/.test(h),
  );
  if (!hasDate || !hasStatut) {
    const missing: string[] = [];
    if (!hasDate) missing.push("date");
    if (!hasStatut) missing.push("statut");
    return {
      ok: false,
      error_code: "MISSING_COLUMNS",
      error: "Colonnes manquantes : date et/ou statut introuvables",
      details: { missing },
    };
  }

  if (typeof nomRaw !== "string" || nomRaw.trim().length === 0) {
    return { ok: false, error: "Nom cabinet invalide" };
  }
  const nom = nomRaw.trim();
  if (nom.length > MAX_CABINET_LEN) {
    return { ok: false, error: "Nom cabinet invalide" };
  }

  if (typeof caRaw !== "string" || caRaw.trim().length === 0) {
    return { ok: false, error: "CA moyen invalide" };
  }
  const ca = Number(caRaw);
  if (!Number.isFinite(ca) || ca <= 0 || ca > MAX_CA) {
    return { ok: false, error: "CA moyen invalide" };
  }

  let email: string | undefined;
  if (typeof emailRaw === "string" && emailRaw.trim().length > 0) {
    const e = emailRaw.trim();
    if (e.length > MAX_EMAIL_LEN || !EMAIL_RE.test(e)) {
      return { ok: false, error: "Email invalide" };
    }
    email = e;
  }

  return {
    ok: true,
    values: { csv: csvRaw, nom_cabinet: nom, ca_moyen: ca, email },
  };
}

/**
 * D-06 — Évalue les seuils de reconnaissance CSV après parsing backend.
 * Pur, sans I/O. Consommé par `app/api/audit/route.ts` (plan 07-02).
 */
export type RecognitionOutcome =
  | { outcome: "ok" }
  | { outcome: "degraded"; reco_rate: number }
  | { outcome: "reject"; error: AuditErrorPayload };

export function evaluateRecognition(
  reco_rate: number,
  nb_rdv_valides: number,
): RecognitionOutcome {
  if (reco_rate < REJECT_THRESHOLD || nb_rdv_valides < MIN_RDV_VALIDES) {
    return {
      outcome: "reject",
      error: {
        success: false,
        error_code: "INSUFFICIENT_DATA",
        error: `Données trop incomplètes pour produire un audit fiable (${Math.round(reco_rate * 100)} % reconnus, ${nb_rdv_valides} RDV valides — il faut au moins 50 % et 20 RDV).`,
        details: {
          reco_rate,
          nb_rdv_valides,
          min_reco_rate: REJECT_THRESHOLD,
          min_rdv_valides: MIN_RDV_VALIDES,
        },
      },
    };
  }
  if (reco_rate < DEGRADED_THRESHOLD) return { outcome: "degraded", reco_rate };
  return { outcome: "ok" };
}
