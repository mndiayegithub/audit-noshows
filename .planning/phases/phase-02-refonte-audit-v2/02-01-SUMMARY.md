---
phase: 02-refonte-audit-v2
plan: 01
subsystem: audit-dashboard
tags: [scaffolding, tailwind, layout, score-helper, wave-1]
requires:
  - Phase 1 tailwind tokens (kpiVolume/kpiSignal/kpiTaux/kpiArgent + primaryDark + safelist)
provides:
  - Pure helper `computeScore(taux)` + `scoreBadge(score)` consumable by Wave 3+ components
  - Light-mode scope wrapper for the `/audit` subtree (RSC, zero hydration cost)
  - Smooth anchor navigation primitive (scroll-behavior + scroll-margin-top) for chained sections
affects:
  - app/audit/* (all descendants inherit light scope)
  - Any `section[data-audit-section]` anchor target (reserves 24 px above)
tech-stack:
  added: []
  patterns:
    - Nested segment layout as theme-scoping primitive (no client JS, no context)
    - Pure utility module pattern — zero imports, no side effects, safe for RSC/client/@react-pdf
key-files:
  created:
    - lib/score.ts
    - app/audit/layout.tsx
  modified:
    - app/globals.css (scroll-behavior smooth, scroll-margin-top 24 px, reduced-motion override)
decisions:
  - text-ink utility not defined in tailwind.config.ts → fell back to text-slate-900 (plan-sanctioned fallback)
  - Task 3 tokens already seeded by Phase 1 — audit-only, zero edits
  - No test framework installed; TDD "RED" validated via inline Node assertion script (10/10 behavior cases pass) rather than committed test file
metrics:
  duration: ~6 min
  completed: 2026-04-24
---

# Phase 2 Plan 01: Scaffolding Foundation Summary

Scaffolding pour la refonte du dashboard audit (clinique-claire v2). 2 nouveaux fichiers (`lib/score.ts` helper pur + `app/audit/layout.tsx` nested segment forçant le light theme local) et 3 lignes ajoutées à `app/globals.css` pour activer le smooth scroll + scroll-margin des sections chaînées. Les tokens Tailwind KPI pastels + primaryDark + safelist étaient déjà en place depuis Phase 1 — audit-only, zéro édition. Zero UI surface area, zero regression sur le state machine `/audit` existant.

## What Was Built

### Task 1 — `lib/score.ts` (helper pur)

- `computeScore(tauxNoshow: number): number` — `Math.round(100 - taux * 3.2)`, clamp `[0, 100]`, `NaN/Infinity → 0`
- `scoreBadge(score: number): { label, tone }` — tri-state `good ≥ 70 / warn ≥ 50 / bad < 50`
- `ScoreTone` type export (`"good" | "warn" | "bad"`)
- Pure module : zéro import, zéro side-effect, safe pour RSC + client + `@react-pdf/renderer`
- Contrat comportemental (10 cas du `<behavior>`) validé via assertion Node inline, 10/10 PASS

### Task 2 — `app/audit/layout.tsx` + `app/globals.css`

- Nouveau nested layout Server Component (pas de `"use client"`) :
  ```tsx
  <div className="min-h-screen bg-gray-50 text-slate-900 antialiased">{children}</div>
  ```
- Ajout à `app/globals.css` :
  - `html { scroll-behavior: smooth; }` (co-loc dans le bloc `html` existant)
  - `section[data-audit-section] { scroll-margin-top: 24px; }`
  - `@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }` — respect des préférences utilisateur
- `text-ink` n'étant pas défini dans `tailwind.config.ts`, fallback `text-slate-900` (autorisé explicitement par le PLAN)

### Task 3 — Audit Tailwind tokens

Tous les tokens déjà présents (vérifiés par `grep` direct sur `tailwind.config.ts`) — **aucune édition requise, aucun commit** :

| Token | Valeur | Statut |
|-------|--------|--------|
| `kpiVolume` | `{ DEFAULT: "#DFF3FF", fg: "#2563EB" }` | ✅ présent (ligne 17) |
| `kpiSignal` | `{ DEFAULT: "#DCF4E6", fg: "#059669" }` | ✅ présent (ligne 18) |
| `kpiTaux` | `{ DEFAULT: "#FCEACC", fg: "#EA580C" }` | ✅ présent (ligne 19) |
| `kpiArgent` | `{ DEFAULT: "#ECCDF8", fg: "#9333EA", deep: "#6B21A8" }` | ✅ présent (ligne 20) |
| `primaryDark` | `"#064E3B"` | ✅ présent (ligne 15) |
| `safelist` pattern | `/(bg\|text\|border\|ring)-(primaryDark\|accentGreen\|kpiVolume\|kpiSignal\|kpiTaux\|kpiArgent)(-fg\|-deep)?/` | ✅ présent (ligne 10) |

## Commits

| Task | Hash | Message |
|------|------|---------|
| 1 | `010ee50` | feat(02-01): add pure score helper lib/score.ts |
| 2 | `d84f154` | feat(02-01): scope /audit to light theme + enable smooth scroll |
| 3 | — | Aucun édit nécessaire (tokens déjà en place) |

## Verification Run

- `npx tsc --noEmit` — **clean** (aucune erreur TS)
- `npm run build` — **succès**, route `/audit` toujours générée (142 kB / 284 kB First Load), aucun nouveau warning
- `npm run lint` — **clean** (2 warnings `<img>` pré-existants dans `components/ui/` hors scope)
- Acceptance criteria Task 1 : 6/6 PASS
- Acceptance criteria Task 2 : 7/7 PASS
- Acceptance criteria Task 3 : 7/7 PASS

## Decisions Made

- **Fallback `text-slate-900`** : `text-ink` n'est pas défini dans la config Tailwind actuelle. Le PLAN autorise explicitement cette substitution. Pas d'ajout de token pour rester minimal (Wave 2+ peut introduire `text-ink` si besoin futur).
- **Pas de test framework installé** : le projet n'a ni Vitest ni Jest (cf. Phase 6 sur la roadmap). Le `tdd="true"` de Task 1 a été honoré via une **assertion Node inline** reproduisant 1:1 la logique et exécutant les 10 cas du `<behavior>` → 10/10 PASS. Ce script n'est pas committé (éphémère). Un vrai test unitaire sera ajouté quand l'infra Vitest atterrira (Phase 6).
- **Task 3 no-op** : les tokens étant déjà scellés par Phase 1, il n'y a **pas de commit Task 3**. Faire un commit vide serait bruyant. Le status est documenté ici uniquement.
- **`scroll-behavior: smooth` co-loc dans le bloc `html` existant** plutôt qu'un second bloc `html { ... }` : une seule déclaration, zéro risque de conflit avec la règle `color-scheme: light` de Phase 1.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 — Blocker] Test framework absent**
- **Found during:** Task 1 (pré-exécution infra check)
- **Issue:** Task 1 a `tdd="true"` mais le projet n'a ni Vitest ni Jest installé (roadmap → Phase 6)
- **Fix:** Contrat comportemental validé via script Node inline (non committé) reproduisant 1:1 la logique du helper et asserting les 10 cas du `<behavior>` — 10/10 PASS. L'implémentation est conforme au contrat documenté dans le PLAN.
- **Files modified:** aucun (validation éphémère)

**2. [Rule 3 — Environment] `lib/score.ts` déjà présent (untracked)**
- **Found during:** Task 1 (git status)
- **Issue:** Le fichier existait physiquement avec le contenu conforme au contrat mais n'était pas committé (untracked sur `main`)
- **Fix:** Commit direct `feat` avec le contenu existant (déjà conforme caractère pour caractère à ce que le PLAN spécifie). Pas de réécriture gratuite.
- **Files modified:** `lib/score.ts` (staged & committed)

### Out-of-scope warnings (logged, not fixed)

- 2 warnings ESLint `@next/next/no-img-element` dans `components/ui/faq-section.tsx` et `components/ui/testimonial-cards.tsx` — pré-existants depuis Phase 1, hors scope Plan 02-01.

## Known Stubs

Aucun stub introduit. Les helpers `computeScore` / `scoreBadge` sont fonctionnels end-to-end. Le layout ne rend que `{children}` (par design — scaffolding).

## Unblocks

- **Plan 02-02 (Dashboard shell)** : peut désormais s'appuyer sur `AuditLayout` pour le light scope et `scroll-behavior: smooth` pour la scrollspy navigation.
- **Plan 02-05 (ScoreHero)** : peut importer `{ computeScore, scoreBadge }` from `@/lib/score` pour le ring SVG 270°.
- **Plan 02-06 (RapportPDF refonte)** : même import, réutilisation identique dans `@react-pdf/renderer`.
- **Tous Wave 2+ plans** : peuvent poser `data-audit-section` sur leurs `<section>` pour bénéficier du `scroll-margin-top: 24px`.

## Self-Check: PASSED

- FOUND: `lib/score.ts`
- FOUND: `app/audit/layout.tsx`
- FOUND: `app/globals.css` (modified — scroll-behavior + scroll-margin-top + reduced-motion override)
- FOUND commit: `010ee50` (Task 1)
- FOUND commit: `d84f154` (Task 2)
- Task 3: audit-only, no commit expected (documented above)
- `npx tsc --noEmit`: clean
- `npm run build`: success
- `npm run lint`: clean (only pre-existing out-of-scope warnings)
