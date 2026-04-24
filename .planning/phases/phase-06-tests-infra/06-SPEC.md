# Phase 6 : Infra tests (Vitest + Playwright) — Specification

**Created:** 2026-04-24
**Ambiguity score:** 0.180 (gate ≤ 0.20) — PASS (auto)
**Requirements:** 5 locked

## Goal

Mettre en place l'infrastructure minimale de tests automatisés pour figer les invariants métier critiques avant le déploiement v2 : Vitest pour l'unitaire (libs pures `score`, `audit-validation`, `safe-log`, `rate-limit`) et **Playwright** pour un E2E happy-path landing → upload CSV → audit rendu → CTA Calendly visible. **Tests de régression mandatoires** sur l'invariant `ca_perdu_an` (le frontend ne le re-multiplie jamais) et sur la normalization n8n (3 shapes).

## Background

État actuel :
- Aucune infra de test installée. `package.json` n'a ni `vitest`, ni `@playwright/test`, ni script `test`/`test:e2e`.
- 4 fichiers `lib/` purs livrés en Phase 5 + un `lib/score.ts` (Phase 2, mis à jour Phase 4) sont **testables sans setup React** (pure functions, pas d'I/O).
- La normalization n8n vit dans `app/api/audit/route.ts` (3 shapes : array `[{output:{...}}]`, wrapped object `{output:{...}}`, direct `{success,...}`). Cette logique est inlined ; pour être testable, elle peut soit être extraite en `lib/n8n-normalize.ts` (préférable), soit testée via E2E mock. Cette spec choisit **l'extraction** (refacto pur, pas de regression).
- L'invariant `ca_perdu_an` n'est exposé qu'à la consommation (composants React). Le test de régression vise donc 2 niveaux : (a) **statique** via `grep` interdisant `* 12` ou `* (12 / nb_mois)` sur `ca_perdu*` dans `components/audit/`, et (b) **E2E** vérifiant que la valeur affichée dans le DOM correspond exactement à la valeur renvoyée par le mock n8n.
- Aucun CI configuré (.github/workflows/ vide ou inexistant). Cette phase ajoute un workflow GitHub Actions minimal qui exécute `npm run lint && npm run build && npm run test`.
- Playwright nécessite une mock des routes API (`/api/audit`, `/api/google-places`) pour ne dépendre ni de n8n live ni de Google Places. Mock via `page.route()` dans le test.

REQ-6 dans `.planning/REQUIREMENTS.md` (vérification rapide) : non explicitement listé, mais le ROADMAP §6 le cadre clairement. Cette phase ne modifie pas REQUIREMENTS.md (les invariants existaient déjà en Phase 1-5).

## Requirements

1. **Setup Vitest** : ajouter `vitest`, `@vitest/coverage-v8` en `devDependencies` ; configurer `vitest.config.ts` (jsdom inutile, environnement `node` suffit pour les libs pures) ; ajouter scripts `"test": "vitest run"` et `"test:watch": "vitest"` ; déclarer un alias `@/` cohérent avec `tsconfig.json`.
   - Current : aucune infra de test.
   - Target : `npm run test` exit 0 et exécute les tests unitaires.
   - Acceptance : `cat package.json | grep -E "\"vitest\"|\"test\":" ` → matches ; `npm run test` exit 0 ; fichier `vitest.config.ts` à la racine.

2. **Suite de tests unitaires** sur les libs pures (au minimum 4 fichiers `*.test.ts` dans `lib/__tests__/`) :
   - `score.test.ts` : couvre `computeScore` (formule, clamp 0-100, NaN/Infinity → 0), `scoreBadge` (3 zones), `computeBlendedScore` (sans google → identique à computeScore, +4 cas représentatifs incluant clamp et confidence=0).
   - `audit-validation.test.ts` : couvre les 6 cas d'invalidation (csv vide, csv trop gros, colonnes manquantes, nom_cabinet vide, ca_moyen négatif/0/excessif, email invalide) + 1 cas valide.
   - `safe-log.test.ts` : couvre la redaction email + token long + truncation à 200 chars (utilise `vi.spyOn(console, 'error')` pour capturer la sortie).
   - `rate-limit.test.ts` : 1er request allowed, n+1 blocked, fenêtre expirée → reset, fail-open si headers cassés.
   - Current : 0 test.
   - Target : ≥ 25 test cases au total, tous passants.
   - Acceptance : `npm run test` retourne `0 failed`, ≥ 25 tests passants ; sortie contient `score.test.ts`, `audit-validation.test.ts`, `safe-log.test.ts`, `rate-limit.test.ts`.

3. **Extraction + tests de la normalization n8n** : extraire la logique des lignes ~46-72 de `app/api/audit/route.ts` (les 3 shapes) dans `lib/n8n-normalize.ts` exportant `normalizeN8nResponse(raw: unknown): unknown`. La route appelle cette fonction. Tests unitaires `n8n-normalize.test.ts` couvrent les 3 shapes : array wrapper, object wrapper, direct.
   - Current : logique inlined.
   - Target : `lib/n8n-normalize.ts` créé, `app/api/audit/route.ts` simplifié, build OK, comportement identique.
   - Acceptance : `grep -n "normalizeN8nResponse" app/api/audit/route.ts lib/n8n-normalize.ts` → matches ; `npm run test n8n-normalize` ≥ 4 cas passants ; build exit 0.

4. **E2E Playwright happy-path** : ajouter `@playwright/test` ; configurer `playwright.config.ts` (1 navigateur Chromium suffit, `webServer: { command: 'npm run dev', port: 3000 }`) ; script `"test:e2e": "playwright test"`. Un test `e2e/audit-flow.spec.ts` :
   - Visite `/` (landing) → assertion sur la présence du H1 + CTA "Lancer l'audit".
   - Click CTA → `/audit`, assertion sur le formulaire visible.
   - Mock `/api/audit` via `page.route()` qui retourne un payload JSON figé (fixture `e2e/fixtures/audit-response.json` contenant `stats.global.ca_perdu_an = 12500`, `stats.global.taux = 8.5`, etc.).
   - Mock `/api/google-places` retournant `{found: false}` (pas de cliquage Google dans le happy-path).
   - Upload d'un CSV de test (`e2e/fixtures/sample.csv`, ≥ 10 lignes valides), saisie nom cabinet + CA, submit.
   - Assertion : section "Manque à gagner annuel" affiche `12 500 €` (ou format FR équivalent) — **invariant `ca_perdu_an` non re-multiplié**.
   - Assertion : section 4 Score visible avec un chiffre /100.
   - Assertion : footer présent avec lien "Politique de confidentialité".
   - Current : aucun E2E.
   - Target : `npm run test:e2e` exit 0 sur Chromium ; le test couvre le happy-path complet.
   - Acceptance : `playwright.config.ts` existe ; `e2e/audit-flow.spec.ts` existe ; `npm run test:e2e -- --reporter=list` retourne `1 passed`.

5. **CI GitHub Actions + guard de régression `ca_perdu`** :
   - `.github/workflows/ci.yml` : déclencheur `pull_request` + `push: main`, étapes `npm ci`, `npm run lint`, `npm run build`, `npm run test`. Playwright **skipped en CI pour cette phase** (coût d'install browser, sera ajouté Phase 7) — la job CI s'arrête au unit test.
   - `lib/__tests__/no-reannualization.test.ts` : test guard qui lit chaque fichier de `components/audit/*.tsx` et `app/audit/page.tsx`, et fail si une regex `/ca_perdu[^,;\s)\]]*\s*\*\s*(12|\(\s*12\s*\/)/` matche (i.e. `ca_perdu_xxx * 12` ou `ca_perdu_xxx * (12 /`).
   - Current : pas de CI, pas de guard.
   - Target : CI workflow file commit + test guard passant.
   - Acceptance : `cat .github/workflows/ci.yml | grep "npm run test"` → match ; `npm run test no-reannualization` passe ; le test détecte volontairement une fausse violation injectée temporairement (validation manuelle).

## Boundaries

**In scope :**
- Vitest + 5 fichiers test (`score`, `audit-validation`, `safe-log`, `rate-limit`, `n8n-normalize`, + guard `no-reannualization`)
- Refacto extraction `lib/n8n-normalize.ts`
- Playwright + 1 fichier E2E happy-path
- 2 fixtures (`audit-response.json`, `sample.csv`)
- CI GitHub Actions minimal (lint + build + unit tests)
- Scripts `npm run test` + `npm run test:watch` + `npm run test:e2e`

**Out of scope :**
- Coverage gate (`--coverage` reporting OK mais pas de threshold)
- E2E sur les pages légales / footer (couvert par unit tests via assertion DOM dans audit-flow)
- E2E sur le flow Google Places (mock retourne `{found:false}`, le clic Google n'est pas testé)
- E2E multi-navigateurs (Firefox/WebKit) — Chromium seul
- Tests visuels / screenshots — reporté
- Tests d'accessibilité (axe-core) — reporté
- Mutation testing — overkill
- Tests de performance / load — reporté Phase 7
- Intégration Playwright dans la CI GitHub Actions — reporté Phase 7 (besoin install browsers caching)
- Tests des composants React via `@testing-library` — non-prioritaire (les libs pures couvrent l'essentiel des invariants métier)

## Constraints

- **Pas de breaking change** : l'extraction `n8n-normalize.ts` doit produire un comportement strictement identique à l'inlined. Test unitaire couvre les 3 shapes pour le prouver.
- **Vitest en `node` env**, pas `jsdom` — pas de besoin de DOM pour les libs pures. Cela simplifie l'install (pas de `jsdom`/`happy-dom`).
- **Playwright local-only** dans cette phase — pas d'install browsers en CI (coût). La CI utilise `npm run test` (unit only). Phase 7 ajoutera l'E2E en CI avec cache.
- **Mocks via `page.route()`** — pas de MSW, pas de stub serveur custom. Playwright natif suffit.
- **Pas de modif des libs existantes** sauf extraction `n8n-normalize.ts`. Les tests s'adaptent à l'API existante.
- **Fixtures réalistes** : `sample.csv` 10 lignes minimum avec colonnes `date,statut,heure` au format Doctolib (`DD/MM/YYYY` + `Honoré`/`Absent`/etc.).
- **Pas de `.env`/secrets** dans les tests — tout est mocké côté test (mock des routes, fixture JSON).
- **Performance** : `npm run test` doit s'exécuter en < 5s en local (libs pures, ~25 cas). Pas de `setTimeout` ou network dans les unit tests.

## Acceptance Criteria

- [ ] `package.json` contient `"test": "vitest run"`, `"test:watch": "vitest"`, `"test:e2e": "playwright test"` ; `vitest`, `@vitest/coverage-v8`, `@playwright/test` en devDependencies.
- [ ] `vitest.config.ts` à la racine, `playwright.config.ts` à la racine.
- [ ] `lib/__tests__/score.test.ts`, `audit-validation.test.ts`, `safe-log.test.ts`, `rate-limit.test.ts`, `n8n-normalize.test.ts`, `no-reannualization.test.ts` existent.
- [ ] `lib/n8n-normalize.ts` exporte `normalizeN8nResponse`, importée et utilisée dans `app/api/audit/route.ts`.
- [ ] `npm run test` exit 0 avec ≥ 25 tests passants.
- [ ] `e2e/audit-flow.spec.ts` + `e2e/fixtures/audit-response.json` + `e2e/fixtures/sample.csv` existent.
- [ ] `npm run test:e2e` exit 0 (au moins 1 test passé en local Chromium).
- [ ] `.github/workflows/ci.yml` exécute lint + build + unit tests (Playwright SKIP).
- [ ] `npm run build` exit 0 après refacto (regression check).
- [ ] Test guard `no-reannualization` détecte 100% des patterns `ca_perdu* * 12` et `ca_perdu* * (12 /`.

## Ambiguity Report

| Dimension           | Score | Min  | Status | Notes |
|---------------------|-------|------|--------|-------|
| Goal Clarity        | 0.85  | 0.75 | PASS   | 5 requirements binaires, fichiers cibles nommés, scripts npm précis. |
| Boundary Clarity    | 0.80  | 0.70 | PASS   | In/Out explicites — pas de coverage gate, pas de E2E multi-browser, pas de Playwright en CI. |
| Constraint Clarity  | 0.80  | 0.65 | PASS   | Vitest node env, Playwright local-only, fixtures réalistes, pas de breaking change. |
| Acceptance Criteria | 0.75  | 0.70 | PASS   | 10 critères grep-able / scriptables. |
| **Ambiguity**       | 0.180 | ≤0.20| PASS   | Spec serrée — downstream planner a contracts, fichiers, regex, CI shape. |

## Design Decisions Pre-Locked

1. **Vitest plutôt que Jest** — natif Vite, compatible TypeScript ESM sans config, syntaxe identique à Jest.
2. **`environment: 'node'`** dans Vitest (pas jsdom) — libs pures, pas de DOM.
3. **Playwright** plutôt que Cypress — meilleur DX moderne, install plus light, mocks natifs via `page.route()`.
4. **1 seul navigateur (Chromium)** — couvrir la diversité hors scope MVP.
5. **Extraction `n8n-normalize.ts`** — préférable à inliner les tests dans la route (la logique devient testable + réutilisable).
6. **Guard `no-reannualization`** sous forme de test unitaire qui scanne les fichiers — plus puissant qu'un grep CI car il s'intègre au reporter de test.
7. **CI Playwright reporté Phase 7** — éviter le yak-shave install browsers / cache GitHub Actions cette phase.
8. **Pas de `@testing-library/react`** — le ROI sur les composants React est faible vs E2E qui couvre déjà le rendu utilisateur.

---

*Phase: 06-tests-infra*
*Spec locked: 2026-04-24*
