---
status: partial
phase: 02-refonte-audit-v2
source: [02-07-PLAN.md]
started: 2026-04-24
updated: 2026-04-24
auto_mode: true
note: "Auto-approuvé par /gsd-execute-phase 2 --auto. Les tests humains ci-dessous restent à exécuter manuellement — lancer /gsd-verify-work 2 pour compléter."
---

## Current Test

[awaiting human testing]

## Tests

### 1. Visual parity vs sketches 005–009
expected: Section 1 ≈ sketch 006 A (4 KPI pastels grid égal) ; Section 2 ≈ 007 A (violet plein + breakdown glass) ; Section 3 ≈ 008 B (dual charts côte à côte) ; Section 4 ≈ 009 C (primary-dark ring blanc) ; Section 5 ≈ 009 C (timeline + Calendly).
result: [pending]

### 2. Scrollspy behavior
expected: En scrollant lentement, le lien actif dans la sidebar change à mesure que chaque section entre au centre du viewport ; l'actif porte une barre verticale 3px + bg emerald-50 + `aria-current="location"`.
result: [pending]

### 3. No horizontal overflow @ 375 / 768 / 1280
expected: `document.documentElement.scrollWidth === document.documentElement.clientWidth` renvoie `true` aux trois largeurs.
result: [pending]

### 4. axe-core audit (blocking violations)
expected: 0 violation bloquante sur `/audit` état `resultats` (moderate/minor tolérés, à noter).
result: [pending]

### 5. `ca_perdu` verbatim — 4 surfaces
expected: Avec `stats.ca_perdu = 47 200` et `stats.nb_mois = 3` : Argent KPI = `47 200 €` ; MoneyBuildCard "Total CA perdu annualisé" = `47 200 €` ; PDF Argent KPI = `47 200 €` ; PDF violet hero = `47 200 €`. Jamais de multiplication.
result: [pending]
note: "Surfaces PDF à vérifier uniquement si PDF passé en refonte light (actuellement v1 dark conservé sur override utilisateur — l'invariant s'applique quand même côté dashboard)."

### 6. Calendly env toggle
expected: Sans `NEXT_PUBLIC_CALENDLY_URL` → placeholder vert sapin visible ; avec l'env → iframe Calendly charge.
result: [pending]

### 7. Legacy states untouched
expected: États `formulaire` / `loading` / `erreur` visuellement identiques au pré-Phase-2.
result: [pending]

### 8. Build check
expected: `npm run build` exits 0.
result: passed
note: "Vérifié lors des plans 02-01 à 02-06 : build vert à chaque itération, /audit = 27.4 kB First Load JS 153 kB."

## Summary

total: 8
passed: 1
issues: 0
pending: 7
skipped: 0
blocked: 0

## Gaps

(à remplir par `/gsd-verify-work 2` si des issues émergent lors du test humain manuel)
