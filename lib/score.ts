/**
 * Pure score helpers for the audit dashboard (Phase 02).
 *
 * Extracted from the legacy inline formula so that `ScoreHero` (Plan 02-05)
 * and `RapportPDF` (Plan 02-06) can share the exact same computation.
 *
 * Formula: score = 100 - tauxNoshow * 3.2, clamped to [0, 100], rounded.
 * Defensive: non-finite input (NaN, Infinity) → 0.
 *
 * No imports, no side effects — safe for RSC, client, and PDF renderer.
 */

export type ScoreTone = "good" | "warn" | "bad";

export function computeScore(tauxNoshow: number): number {
  if (!Number.isFinite(tauxNoshow)) return 0;
  const raw = 100 - tauxNoshow * 3.2;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

export function scoreBadge(score: number): { label: string; tone: ScoreTone } {
  if (score >= 70) return { label: "Bon · au-dessus du secteur", tone: "good" };
  if (score >= 50) return { label: "À améliorer", tone: "warn" };
  return { label: "Critique", tone: "bad" };
}

export function computeBlendedScore(
  tauxNoshow: number,
  google?: { rating: number | null; user_ratings_total: number } | null
): number {
  const base = computeScore(tauxNoshow);
  if (!google || typeof google.rating !== "number" || !Number.isFinite(google.rating)) {
    return base;
  }
  const reviews = Number.isFinite(google.user_ratings_total) ? google.user_ratings_total : 0;
  const confidence = Math.min(1, Math.max(0, reviews / 50));
  const delta = Math.round((google.rating - 4.0) * 5 * confidence);
  return Math.max(0, Math.min(100, base + delta));
}
