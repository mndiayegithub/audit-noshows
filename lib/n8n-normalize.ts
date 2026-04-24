/**
 * Normalizes the n8n /webhook/audit-flash response into the canonical
 * `{ success, stats, rapport_texte, ... }` shape regardless of the n8n
 * execution mode (production wrapper, test array, or direct).
 *
 * Pure, no I/O — extracted from app/api/audit/route.ts in Phase 06 for
 * unit testability.
 */
export function normalizeN8nResponse(raw: unknown): unknown {
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
      return (first as { output: unknown }).output;
    }
    return first;
  }

  if (
    raw &&
    typeof raw === "object" &&
    "output" in raw &&
    (raw as { output?: unknown }).output &&
    typeof (raw as { output: unknown }).output === "object" &&
    "success" in ((raw as { output: Record<string, unknown> }).output)
  ) {
    return (raw as { output: unknown }).output;
  }

  return raw;
}
