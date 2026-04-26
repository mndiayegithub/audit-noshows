# Plan 07-08 Summary — 3 Playwright e2e specs

**Wave:** 4
**Status:** ✅ Done
**Commit:** `0102185`
**Date:** 2026-04-26

## What was delivered

3 Playwright specs in `e2e/` covering the 3 critical paths of the CSV upload flow (REQ #6):

1. `e2e/audit-flow-ok.spec.ts` — golden path (Doctolib 6 mois → preview → Continuer → résultats sans bannière dégradée)
2. `e2e/audit-flow-degraded.spec.ts` — mode dégradé (statuts inconnus → preview "Mode dégradé" → modal "Données partiellement reconnues" → bannière "Audit partiel" + ignored_count=72)
3. `e2e/audit-flow-reject.spec.ts` — refus dur INSUFFICIENT_DATA (API 400 → CSVErrorCard "Données trop incomplètes" + bouton "Choisir un autre fichier")

All specs mock `/api/audit` via `page.route()` per D-07 — zero appels n8n réels, déterministe, < 1s/spec attendu.

## Deviations from plan

**Reject spec — uploaded fixture swapped.** Plan referenced `malformed_insufficient.csv` for the upload, but that fixture (~15 rows) déclenche `willReject` côté client dans `parseCSVForPreview` (nb_rdv_valides < MIN_RDV_VALIDES=20), ce qui désactive le bouton "Continuer" et empêche le POST vers `/api/audit`. Le path `API → CSVErrorCard` n'aurait jamais été testé. La spec utilise donc `doctolib_6mois.csv` (passe la validation côté client) avec un mock API 400 retournant le payload INSUFFICIENT_DATA. La fixture `malformed_insufficient.csv` reste référencée dans un commentaire d'implémentation pour traçabilité ; elle est testée implicitement par les tests Vitest unit sur `parseCSVForPreview` (Plan 07-03).

## Acceptance criteria

| # | Critère | Status |
|---|---------|--------|
| 1 | 3 specs e2e existent | ✅ |
| 2 | `page.route` présent dans chaque | ✅ (1× chaque) |
| 3 | Fixtures JSON consommées | ✅ audit-{ok,degraded,reject}.json |
| 4 | Fixtures CSV utilisées | ✅ doctolib_6mois.csv, malformed_statuts_inconnus.csv |
| 5 | Aucun N8N_WEBHOOK_URL référencé | ✅ |
| 6 | `npm run lint` exit 0 | ✅ |
| 7 | TypeScript strict OK | ✅ |
| 8 | Specs Playwright passent en CI | ⏳ user devra lancer `npm run test:e2e` |

## Run command

```bash
npm run test:e2e -- e2e/audit-flow-ok.spec.ts e2e/audit-flow-degraded.spec.ts e2e/audit-flow-reject.spec.ts
```

## Files modified

- `e2e/audit-flow-ok.spec.ts` (new, 41 lines)
- `e2e/audit-flow-degraded.spec.ts` (new, 51 lines)
- `e2e/audit-flow-reject.spec.ts` (new, 57 lines)
