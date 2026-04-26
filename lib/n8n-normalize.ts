import type { AuditErrorCode } from "@/types/audit-errors";

/**
 * Normalizes the n8n /webhook/audit-flash response into the canonical
 * `{ success, stats, rapport_texte, ... }` shape regardless of the n8n
 * execution mode (production wrapper, test array, or direct).
 *
 * Phase 7 (REQ #3): conserve les champs `degraded`, `reco_rate`, `ignored_count`,
 * `sample_ignored` en passthrough (jamais inventés — n8n est source de vérité).
 *
 * Pure, no I/O — extracted from app/api/audit/route.ts in Phase 06 for
 * unit testability.
 */
export function normalizeN8nResponse(raw: unknown): unknown {
  let unwrapped: unknown = raw;

  if (Array.isArray(raw)) {
    const first = raw[0];
    if (
      first &&
      typeof first === "object" &&
      "output" in first &&
      (first as { output?: unknown }).output &&
      typeof (first as { output: unknown }).output === "object" &&
      "success" in ((first as { output: Record<string, unknown> }).output)
    ) {
      unwrapped = (first as { output: unknown }).output;
    } else {
      unwrapped = first;
    }
  } else if (
    raw &&
    typeof raw === "object" &&
    "output" in raw &&
    (raw as { output?: unknown }).output &&
    typeof (raw as { output: unknown }).output === "object" &&
    "success" in ((raw as { output: Record<string, unknown> }).output)
  ) {
    unwrapped = (raw as { output: unknown }).output;
  }

  // Phase 7 (REQ #3) — passthrough des champs dégradé si fournis par n8n.
  // On les copie depuis l'objet déjà unwrappé (le wrapper output les contient déjà après unwrap).
  if (unwrapped && typeof unwrapped === "object" && !Array.isArray(unwrapped)) {
    const src = unwrapped as Record<string, unknown>;
    const out: Record<string, unknown> = { ...src };
    const passthroughKeys = [
      "degraded",
      "reco_rate",
      "ignored_count",
      "sample_ignored",
    ] as const;
    for (const key of passthroughKeys) {
      if (key in src && src[key] !== undefined) {
        out[key] = src[key];
      }
    }
    unwrapped = out;
  }

  return sanitizeRapportTexte(unwrapped);
}

/**
 * Mappe un message d'erreur technique n8n vers un AuditErrorCode typé (REQ #2).
 *
 * Pure, idempotente, sans I/O. Ne stocke jamais le message — classification only.
 * Aucune PII dans les regex (la fn lit le message en lecture seule, ne le réémet pas).
 *
 * Ordre = priorité (premier match gagne). Insensible à la casse.
 * Fallback: "EMPTY_AFTER_PARSING" pour les messages non classifiés
 * (plus prudent que d'inventer un code spécifique).
 */
export function mapN8nErrorToCode(rawError: string): AuditErrorCode {
  const msg = (rawError || "").toLowerCase();

  // ENCODING: spécifique avant date/colonne car peut contenir "format"
  if (
    msg.includes("encoding") ||
    msg.includes("encodage") ||
    msg.includes("latin") ||
    msg.includes("utf-8 invalid") ||
    msg.includes("utf8 invalid")
  ) {
    return "ENCODING_ERROR";
  }

  // INSUFFICIENT_DATA: spécifique avant "vide" / "colonne"
  if (
    msg.includes("trop peu") ||
    msg.includes("moins de 20") ||
    msg.includes("pas assez") ||
    msg.includes("< 20")
  ) {
    return "INSUFFICIENT_DATA";
  }

  // INVALID_DATE_FORMAT: nécessite "date" + signal de mauvais format
  if (
    msg.includes("date") &&
    (msg.includes("invalide") || msg.includes("format") || msg.includes("parsable"))
  ) {
    return "INVALID_DATE_FORMAT";
  }

  // MISSING_COLUMNS
  if (
    msg.includes("colonne") ||
    msg.includes("header") ||
    msg.includes("manquant")
  ) {
    return "MISSING_COLUMNS";
  }

  // EMPTY_AFTER_PARSING (incluant fallback)
  if (
    msg.includes("vide") ||
    msg.includes("aucune ligne") ||
    msg.includes("no row") ||
    msg.includes("0 rdv")
  ) {
    return "EMPTY_AFTER_PARSING";
  }

  return "EMPTY_AFTER_PARSING";
}

const FALLBACK_RAPPORT =
  "## Rapport indisponible\n\nLe générateur n'a pas produit de rapport lisible cette fois-ci. " +
  "Les statistiques ci-dessus restent fiables. Réessayez dans quelques minutes pour obtenir le rapport narratif détaillé.";

/**
 * Détecte si rapport_texte est du JSON brut (LLM dérapage) au lieu du markdown
 * narratif attendu. Si oui, le remplace par un fallback lisible plutôt que
 * d'afficher du JSON moche au cabinet médical.
 *
 * Signaux:
 *   - démarre par `{` ou `[` après trim
 *   - contient des clés JSON propres au schéma raté ("resume_executif", etc.)
 *   - contient des expressions arithmétiques pseudo-JSON (ex: `: 1 + 2 = 3`)
 */
export function sanitizeRapportTexte(payload: unknown): unknown {
  if (
    !payload ||
    typeof payload !== "object" ||
    Array.isArray(payload) ||
    !("rapport_texte" in payload)
  ) {
    return payload;
  }

  const obj = payload as Record<string, unknown>;
  const rapport = obj.rapport_texte;
  if (typeof rapport !== "string" || !rapport.trim()) return payload;

  const trimmed = rapport.trim();
  const startsAsJson = trimmed.startsWith("{") || trimmed.startsWith("[");
  const hasSchemaKeys =
    /"(resume_executif|analyse_creneaux_a_risque|recommandations_actionnables|impact_financier)"/.test(
      trimmed
    );
  const hasArithExpr = /:\s*\d+(\s*[+\-*/]\s*\d+)+\s*=/.test(trimmed);

  if (startsAsJson || hasSchemaKeys || hasArithExpr) {
    return { ...obj, rapport_texte: FALLBACK_RAPPORT };
  }

  return payload;
}
