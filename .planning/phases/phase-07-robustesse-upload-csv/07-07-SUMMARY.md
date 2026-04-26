---
phase: 07-robustesse-upload-csv
plan: 07
subsystem: testing/fixtures
tags: [csv, fixtures, e2e, playwright, vitest, generator]
provides:
  - scripts/gen-csv-fixtures.ts (paramétrable, re-exécutable via npm run gen:fixtures)
  - e2e/fixtures/csv/*.csv (12 fixtures CSV annotées)
  - e2e/fixtures/responses/audit-{ok,degraded,reject}.json (mock Playwright)
requires:
  - tsx (devDependency installée)
  - types/audit.ts (shape AuditStats nested)
  - types/audit-errors.ts (AuditErrorCode)
affects:
  - Plan 07-08 (e2e Playwright consommera les responses + fixtures CSV)
  - Phase 6 (tests Vitest pourront charger les fixtures CSV)
key-decisions:
  - "D-04 (verbatim): générateur Node paramétré (source, nb_mois, taux_no_show, encoding, separator, statuts, include_meta_header, corrupt_pct)"
  - "D-07: 3 fixtures de réponse JSON pré-générées pour mock page.route() Playwright"
  - "RNG mulberry32 seed=hash(outFile) → fixtures déterministes"
  - "Commentaires CSV `# source:` `# expected:` placés en tête (loader helper sera créé Plan 07-08)"
key-files:
  created:
    - scripts/gen-csv-fixtures.ts
    - e2e/fixtures/csv/.gitkeep
    - e2e/fixtures/csv/doctolib_6mois.csv
    - e2e/fixtures/csv/doctolib_12mois.csv
    - e2e/fixtures/csv/doctolib_18mois.csv
    - e2e/fixtures/csv/excel_freenamed_a.csv
    - e2e/fixtures/csv/excel_googlesheets_b.csv
    - e2e/fixtures/csv/excel_libre_c.csv
    - e2e/fixtures/csv/logos_w_typique.csv
    - e2e/fixtures/csv/julie_typique.csv
    - e2e/fixtures/csv/veasy_typique.csv
    - e2e/fixtures/csv/malformed_statuts_inconnus.csv
    - e2e/fixtures/csv/malformed_lignes_ignorees.csv
    - e2e/fixtures/csv/malformed_insufficient.csv
    - e2e/fixtures/responses/audit-ok.json
    - e2e/fixtures/responses/audit-degraded.json
    - e2e/fixtures/responses/audit-reject.json
  modified:
    - package.json (script gen:fixtures + tsx devDependency)
    - package-lock.json
metrics:
  tasks_completed: 2
  fixtures_csv: 12
  fixtures_json: 3
  completed: 2026-04-26
---

# Phase 7 Plan 07: CSV Fixture Generator + Playwright Mock Responses Summary

Générateur paramétrable de fixtures CSV (D-04) + 3 réponses JSON mock (D-07) pour les tests Vitest et Playwright.

## What was built

### 1. `scripts/gen-csv-fixtures.ts` (Task 1)

Script TypeScript exécuté via `tsx` (`npm run gen:fixtures`). Expose `FixtureParams` verbatim D-04 :
- `source` : `"doctolib" | "excel" | "logos_w" | "julie" | "veasy"`
- `nb_mois`, `taux_no_show`, `encoding`, `separator`, `statuts`, `include_meta_header`, `corrupt_pct`
- `total_override` (utilisé pour le cas INSUFFICIENT_DATA — 15 RDV)

**RNG déterministe** : `mulberry32(hashString(outFile))` → mêmes fixtures à chaque run.

**Catalogue verrouillé** (12 fixtures) :
| Fichier | Source | Mois | Lignes | Expected |
|---|---|---|---|---|
| doctolib_6mois.csv | doctolib | 6 | 485 | ok |
| doctolib_12mois.csv | doctolib | 12 | 965 | ok |
| doctolib_18mois.csv | doctolib | 18 | 1445 | ok |
| excel_freenamed_a.csv | excel | 6 | 484 | ok |
| excel_googlesheets_b.csv | excel | 9 | 724 | ok |
| excel_libre_c.csv | excel (latin-1) | 12 | 964 | ok |
| logos_w_typique.csv | logos_w | 6 | 484 | ok |
| julie_typique.csv | julie | 6 | 484 | ok |
| veasy_typique.csv | veasy | 6 | 484 | ok |
| malformed_statuts_inconnus.csv | doctolib | 6 | 485 | degraded (corrupt 20 %) |
| malformed_lignes_ignorees.csv | excel | 6 | 484 | degraded (corrupt 15 %) |
| malformed_insufficient.csv | doctolib | 1 | 20 | reject:INSUFFICIENT_DATA |

Chaque fixture est annotée :
```
# source: <source>
# expected: <code>
# nb_mois: <n> ; taux_no_show: <r> ; encoding: <e> ; separator: <s>
```

**RGPD** : aucun PII (`Patient_NNN`, `Dr_Martin/Dupont/Bernard/Petit`, pas d'email, pas de téléphone). Vérifié : `grep -lE "@(gmail|hotmail|yahoo|outlook)\.com" e2e/fixtures/csv/*.csv | wc -l` retourne 0.

### 2. Mock responses JSON (Task 2)

Trois fixtures dans `e2e/fixtures/responses/` consommées par `page.route()` Playwright :
- `audit-ok.json` : 200 success, `AuditResponse` complet (nested `global`/`periode`/`benchmark`/`top_3_pires`/`top_3_meilleurs`/`potentiel`/`par_jour`)
- `audit-degraded.json` : 200 + `degraded:true`, `reco_rate:0.85`, `ignored_count:72`, `sample_ignored[3]`
- `audit-reject.json` : 400 + `error_code:"INSUFFICIENT_DATA"` + `details.{reco_rate, nb_rdv_valides, min_reco_rate, min_rdv_valides}`

## Commits

| # | Hash | Message |
|---|------|---------|
| 1 | f8127ca | feat(07-07): add CSV fixture generator script + 12 fixtures |
| 2 | fa09342 | feat(07-07): add 3 JSON mock responses for Playwright e2e (D-07) |

## Verification

- `npm run gen:fixtures` exit 0 → 12 fixtures générées
- `ls e2e/fixtures/csv/*.csv | wc -l` = 12
- 3 JSON parsables (`node -e "JSON.parse(...)"` exit 0)
- `npm run lint` exit 0 (warnings out-of-scope sur `<img>` dans `components/ui/{faq-section,testimonial-cards}.tsx` — pré-existants Phase 7 hors périmètre)
- `npm run build` exit 0 (script `scripts/` exclu du bundle Next, pas d'impact)
- Aucun PII dans les fixtures CSV

## Deviations from Plan

None — plan exécuté exactement comme spécifié. Le script `tsx` n'était pas pré-installé : ajouté en `devDependency ^4.21.0` (geste explicitement prévu par le plan Task 1 step 1).

## Self-Check: PASSED

- [x] scripts/gen-csv-fixtures.ts existe (≥ 100 lignes)
- [x] e2e/fixtures/csv/ contient 12 fichiers .csv
- [x] e2e/fixtures/responses/audit-{ok,degraded,reject}.json existent et parsables
- [x] package.json contient `"gen:fixtures": "tsx scripts/gen-csv-fixtures.ts"`
- [x] Commits f8127ca et fa09342 présents dans `git log`
- [x] `npm run lint` et `npm run build` exit 0
- [x] Aucun PII détecté dans les fixtures
