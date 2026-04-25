/**
 * Normalizes the n8n /webhook/audit-flash response into the canonical
 * `{ success, stats, rapport_texte, ... }` shape regardless of the n8n
 * execution mode (production wrapper, test array, or direct).
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

  return sanitizeRapportTexte(unwrapped);
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
