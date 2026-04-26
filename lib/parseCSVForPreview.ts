/**
 * Pure-fn CSV preview parser — Phase 7 REQ #1 / D-01 (papaparse).
 *
 * Lit un CSV brut, détecte les colonnes obligatoires (date + statut), parse
 * un échantillon (3 lignes), calcule le taux de reconnaissance des statuts
 * et classifie le résultat selon les seuils canoniques de `audit-thresholds.ts`.
 *
 * Aucune I/O — testable en isolation. Le composant React passe par
 * `hooks/useCSVPreview.ts` qui encapsule `FileReader`.
 */
import Papa from "papaparse";
import {
  DEGRADED_THRESHOLD,
  REJECT_THRESHOLD,
  MIN_RDV_VALIDES,
} from "./audit-thresholds";
import type { AuditErrorCode } from "@/types/audit-errors";

export interface CSVPreviewError {
  error_code: AuditErrorCode;
  error: string;
  details?: Record<string, unknown>;
}

export interface CSVPreviewSuccess {
  /** Headers tels que retournés par papaparse (trimmed). */
  columns: string[];
  /** 3 premières lignes (max) — pour preview UI. */
  sampleRows: Array<Record<string, string>>;
  /** Nombre total de lignes après parsing (hors header). */
  totalRows: number;
  /** Fraction 0..1 de lignes avec statut reconnu. */
  recoRate: number;
  /** Count des lignes avec statut reconnu (pas total). */
  nbRdvValides: number;
  /** `true` si reco_rate < DEGRADED ET passe les seuils reject (mode dégradé). */
  degraded: boolean;
  /** `true` si reco_rate < REJECT OU nbRdvValides < MIN_RDV_VALIDES (refus dur). */
  willReject: boolean;
}

export type CSVPreviewResult =
  | { ok: true; preview: CSVPreviewSuccess }
  | { ok: false; error: CSVPreviewError };

/**
 * Statuts reconnus côté frontend — doit refléter la logique de `lib/audit-validation.ts`
 * et du nœud n8n "Parse & Validate CSV" (REQ contrainte de réutilisation).
 *
 * Couvre : Honoré/honored, present, venu(e), absent, no-show/no_show/noshow,
 * annulé/annulee, cancelled/canceled.
 */
const STATUTS_RECONNUS =
  /^(honor[ée]e?|honored|present|venu[e]?|absent|no[\s_-]?show|annul[ée]e?|cancell?ed)$/i;

/** Colonne date (ou ses synonymes courants Doctolib / Excel). */
const COLONNE_DATE = /^(date|jour|date_rdv|date du rendez-vous)$/i;

/** Colonne statut (FR + EN, avec accents). */
const COLONNE_STATUT = /^(statut|status|état|etat)$/i;

export function parseCSVForPreview(text: string): CSVPreviewResult {
  if (!text || text.trim().length === 0) {
    return {
      ok: false,
      error: {
        error_code: "EMPTY_AFTER_PARSING",
        error: "CSV vide ou aucune ligne lisible.",
      },
    };
  }

  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
    // papaparse auto-détecte le délimiteur (',', ';', '\t')
  });

  if (parsed.data.length === 0) {
    return {
      ok: false,
      error: {
        error_code: "EMPTY_AFTER_PARSING",
        error: "Aucune ligne lisible dans le fichier.",
      },
    };
  }

  const headers = (parsed.meta.fields ?? []).map((h) => h.trim());
  const hasDate = headers.some((h) => COLONNE_DATE.test(h));
  const hasStatut = headers.some((h) => COLONNE_STATUT.test(h));

  if (!hasDate || !hasStatut) {
    const missing: string[] = [];
    if (!hasDate) missing.push("date");
    if (!hasStatut) missing.push("statut");
    return {
      ok: false,
      error: {
        error_code: "MISSING_COLUMNS",
        error: "Colonnes obligatoires manquantes.",
        details: { missing },
      },
    };
  }

  const statutKey = headers.find((h) => COLONNE_STATUT.test(h))!;
  const totalRows = parsed.data.length;
  const nbRdvValides = parsed.data.filter((row) =>
    STATUTS_RECONNUS.test((row[statutKey] ?? "").trim()),
  ).length;
  const recoRate = totalRows === 0 ? 0 : nbRdvValides / totalRows;

  return {
    ok: true,
    preview: {
      columns: headers,
      sampleRows: parsed.data.slice(0, 3) as Array<Record<string, string>>,
      totalRows,
      recoRate,
      nbRdvValides,
      degraded:
        recoRate < DEGRADED_THRESHOLD &&
        recoRate >= REJECT_THRESHOLD &&
        nbRdvValides >= MIN_RDV_VALIDES,
      willReject:
        recoRate < REJECT_THRESHOLD || nbRdvValides < MIN_RDV_VALIDES,
    },
  };
}
