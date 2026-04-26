# Phase 7 — Robustesse upload CSV (autonomie client)

**Status:** ✅ Livrée — en attente UAT utilisateur (e2e + vitest + smoke réel)
**Date:** 2026-04-26
**Plans:** 8 (4 vagues d'exécution parallèle)
**Verification:** `07-VERIFICATION.md` — 6/6 REQs structurellement OK, 4 vérifications humaines à dérouler avant deploy.

## Goal

Garantir qu'un client uploadant son CSV en autonomie reçoit soit (a) un audit fiable, soit (b) un message d'erreur actionnable, soit (c) un audit dégradé avec confirmation explicite — jamais un crash silencieux ni un rapport sur des données fausses.

## Livré (par REQ)

| REQ | Description | Implementation | Status |
|-----|-------------|----------------|--------|
| #1  | CSV preview client-side (3 sources) | `lib/parseCSVForPreview.ts` (papaparse) + `hooks/useCSVPreview.ts` + `components/audit/CSVPreview.tsx` | ✅ |
| #2  | 5 codes erreur typés | `types/audit-errors.ts` + `lib/mapErrorToCard.ts` + `lib/n8n-normalize.ts:mapN8nErrorToCode` | ✅ |
| #3  | Mode dégradé < 90 % | `components/audit/DegradedConfirmDialog.tsx` (Radix) + bannière `app/audit/page.tsx:393` + API passthrough `app/api/audit/route.ts:127` | ✅ |
| #4  | Refus dur < 50 % ou < 20 RDV | `lib/audit-validation.ts:evaluateRecognition` + `components/audit/CSVErrorCard.tsx` | ✅ |
| #5  | Catalogue 12 CSV + 3 mocks | `scripts/gen-csv-fixtures.ts` + `e2e/fixtures/csv/*.csv` (12) + `e2e/fixtures/responses/*.json` (3) | ✅ |
| #6  | 3 specs Playwright e2e | `e2e/audit-flow-{ok,degraded,reject}.spec.ts` (mock via `page.route()` D-07) | ✅ |

## Décisions clés (CONTEXT.md)

- **D-01** papaparse (auto-detect séparateur, robuste FR encoding)
- **D-02** Preview inline qui remplace la dropzone (pas de modal)
- **D-03** Radix Dialog pour mode dégradé (focus trap natif)
- **D-04** Script générateur paramétré pour fixtures (reproductibilité)
- **D-05** Inline error card avec hint actionnable (pas de toast)
- **D-06** Single source of truth `lib/audit-thresholds.ts`
- **D-07** Mock e2e via `page.route()` (déterministe, offline)

## Seuils (lib/audit-thresholds.ts)

```ts
DEGRADED_THRESHOLD = 0.90  // Wave 1 — sera resserré à 0.95 après validation prod
REJECT_THRESHOLD   = 0.50
MIN_RDV_VALIDES    = 20
```

## À dérouler avant deploy

1. `npm run test:e2e` (3 specs Playwright)
2. `npm test` (Vitest — 41+ tests Phase 7 dans `lib/__tests__/`)
3. Smoke réel : upload d'un Doctolib CSV de prod sur `/audit`
4. Smoke mode dégradé : CSV avec ~15 % statuts inconnus → vérifier modal + bannière

## Commits Phase 7

- `5c69149` — ROADMAP.md insertion Phase 7
- `d9392b3` — SPEC.md
- `a6b6db8` — 8 plans
- (Wave 1-3 commits — voir git log Phase 7 dir)
- `0102185` — Plan 07-08 specs e2e

## Backlog post-Phase 7

- Resserrer DEGRADED_THRESHOLD 0.90 → 0.95 après obs prod
- Détection encodage Latin-1 → UTF-8 (auto-repair côté serveur)
- Auto-skip métadata header (ligne `Export du …`)
- Telemetry server-side error_code (Phase 9 monitoring)
- Compléter SUMMARY.md manquants pour Plans 07-01, 07-04, 07-06 (gap doc seulement)
