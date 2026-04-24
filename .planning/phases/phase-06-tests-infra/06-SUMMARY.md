# Phase 6 — SUMMARY (Tests infra)

**Status :** ✅ **CODE SHIPPÉ** — commit `e2b94c2`, tests 36/36 passés, build exit 0
**Date close-out :** 2026-04-24
**Spec :** `06-SPEC.md` (5 requirements, ambiguity 0.180)
**Plan :** `06-01-PLAN.md` (8 tasks)

## Livrables

### Vitest (unit)
| Fichier | Couvre | Tests |
|---------|--------|-------|
| `lib/__tests__/score.test.ts` | `computeScore`, `scoreBadge`, `computeBlendedScore` | 11 |
| `lib/__tests__/audit-validation.test.ts` | 6 invalidations + valid + semicolon | 9 |
| `lib/__tests__/safe-log.test.ts` | Redaction email + token + truncation | 5 |
| `lib/__tests__/rate-limit.test.ts` | allow / block / reset / fail-open | 4 |
| `lib/__tests__/n8n-normalize.test.ts` | 3 shapes + null/undefined | 5 |
| `lib/__tests__/no-reannualization.test.ts` | **Guard `ca_perdu × 12` interdit** | 2 |
| **Total** | | **36** |

`npm run test` → 36 passed, 10s, exit 0.

### Refacto
- `lib/n8n-normalize.ts` extrait de `app/api/audit/route.ts` (les 3 shapes : array, wrapper object, direct). La route appelle désormais `normalizeN8nResponse(raw)` — comportement strictement identique, prouvé par le test unitaire.

### E2E Playwright (local, Chromium)
- `playwright.config.ts` : `webServer: npm run dev`, `reuseExistingServer` local.
- `e2e/audit-flow.spec.ts` : landing → `/audit` → upload CSV → dashboard ; mock `/api/audit` + `/api/google-places` via `page.route()` ; **asserte `ca_perdu_an=12500` affiché et PAS 150000** (invariant no-reannualization) ; asserte "Score cabinet" + lien footer "Politique de confidentialité".
- Fixtures : `e2e/fixtures/audit-response.json` (stats figées) + `sample.csv` (10 lignes Doctolib-like).

### CI GitHub Actions
- `.github/workflows/ci.yml` : déclenché sur `push main` + `pull_request`. Étapes : `npm ci` → `npm run lint` → `npm run build` → `npm run test`. **Playwright skipped Phase 6** (à faire Phase 7 avec cache browsers).

### Scripts npm ajoutés
```json
"test": "vitest run",
"test:watch": "vitest",
"test:e2e": "playwright test"
```

## Guard de régression `ca_perdu`

Le test `no-reannualization.test.ts` scanne **tous les fichiers `.ts`/`.tsx`** de `components/audit/` et `app/audit/` avec la regex `/ca_perdu[A-Za-z0-9_]*\s*\*\s*(12|\(\s*12\s*\/)/`. Si un développeur (humain ou IA) introduit jamais `ca_perdu_mois * 12` ou `ca_perdu_an * (12 / nbMois)`, le test fail avec le fichier + numéro de ligne. Le test meta vérifie que le guard fait ce qu'il prétend (2 patterns positifs, 1 pattern négatif).

## Décisions pré-lockées

- **Vitest vs Jest** — Vitest (TS/ESM natif, pas de config Babel).
- **Environment `node`** — libs pures, pas de DOM → install plus léger.
- **Playwright local seulement** cette phase — CI E2E reporté Phase 7.
- **Chromium uniquement** — couverture multi-browser hors scope MVP.
- **Extraction `n8n-normalize.ts`** plutôt qu'inline tests dans la route.
- **Guard scanner** plutôt que simple ESLint rule — plus lisible, intégré aux reporters de test.

## Test manuel à effectuer (user)

1. `npm run test` → 36 passed en ~10s.
2. **Installer les browsers Playwright** (1re fois, ~250 Mo) : `npx playwright install chromium`.
3. `npm run test:e2e` → ≥ 1 passed. Si échec, regarder `playwright-report/` ou le trace (`trace: retain-on-failure`).
4. Optionnel : `npm run test:watch` pour le dev loop.

## 🟡 Actions recommandées (user, hors-code)

### CI GitHub Actions
- Push sur `main` ou créer une PR → vérifier que le workflow "CI" vert apparaît dans l'onglet Actions. Si rouge, lire les logs.
- `CI=true` est fixé dans le yaml — les scripts `next` et `vitest` se comporteront en mode CI (no interactive prompts).

### Playwright install en local
- Première exécution nécessite `npx playwright install chromium` (≈ 250 Mo, une seule fois).
- Les traces sont sauvegardées en cas d'échec → `playwright show-trace <trace.zip>`.

## Suite / backlog

- **Phase 7** : déploiement v2 + ajouter Playwright au CI (avec `actions/cache` sur `~/.cache/ms-playwright`).
- **Post-MVP** : coverage gate (`"test": "vitest run --coverage"` + seuil 70%+ via `coverage.thresholds` dans vitest.config).
- **Post-MVP** : E2E multi-browser (Firefox, WebKit) — utile si le produit attaque Safari iOS.
- **Post-MVP** : tests visuels / snapshot via `@playwright/test` `expect(page).toHaveScreenshot()`.
- **Post-MVP** : `@testing-library/react` pour tester `ScoreHero`, `MoneyBuildCard` isolément (si un composant devient complexe).

---

*Phase 6 closed: 2026-04-24 — tests infra en place, 36/36 verts, guard `ca_perdu` verrouillé.*
