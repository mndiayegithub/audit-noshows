---
phase: 02-refonte-audit-v2
plan: 05
subsystem: audit-dashboard
tags: [audit, dashboard, score, ring-svg, timeline, calendly, primary-dark, wave-3]
wave: 3
requires:
  - 02-01 (lib/score.ts computeScore + scoreBadge)
  - 02-02 (AuditDashboard shell + AuditSection)
provides:
  - components/audit/ScoreHero.tsx
  - components/audit/PlanTimeline.tsx
  - components/audit/CalendlyEmbed.tsx
  - Section 4 (Score cabinet) content-filled
  - Section 5 (Plan d'action + CTA) content-filled
affects:
  - components/audit/AuditDashboard.tsx (sections score + plan-et-cta wirées)
tech-stack:
  added: []
  patterns:
    - "SVG ring 220px (r=86, circumference 540.4) avec strokeDasharray proportionnel au score"
    - "computeScore / scoreBadge importés depuis lib/score — zero duplication de formule"
    - "Timeline verticale : rail absolute + puces colorées (ring-4 ring-white pour le halo)"
    - "Tricolor sémantique KPI-aligned : Volume #2563EB / Signal #059669 / Taux #EA580C"
    - "CalendlyEmbed env-driven : iframe si NEXT_PUBLIC_CALENDLY_URL, sinon placeholder vert-sapin — never empty"
    - "Badge pill tone-aware (good emerald / warn amber / bad rose) avec data-score-tone attribute"
key-files:
  created:
    - components/audit/ScoreHero.tsx
    - components/audit/PlanTimeline.tsx
    - components/audit/CalendlyEmbed.tsx
  modified:
    - components/audit/AuditDashboard.tsx
decisions:
  - "tauxNoshow lu via stats.global.taux (schéma AuditStats réel) — pas stats.taux_noshow (champ flat inexistant mentionné dans le snippet du plan)"
  - "Badge pill tone-aware enrichi (good/warn/bad avec palettes distinctes) — Rule 2 preventive pour les scores <70"
  - "Rapport détaillé déplacé dans le container space-y-6 de Section 5 (au lieu d'être hors div) — meilleur flux visuel"
  - "CalendlyEmbed : iframe inline simple (pas de widget Calendly.js scripts) — D-10 confirmé, iframe-only jusqu'à Phase 3 métriques"
metrics:
  duration_minutes: 7
  completed_date: 2026-04-24
  tasks_completed: 3
  files_created: 3
  files_modified: 1
---

# Phase 02 Plan 05 : Sections 4 (Score) + 5 (Plan + CTA) Summary

**One-liner :** Hero primary-dark avec anneau SVG 220px piloté par computeScore + timeline tricolore 3 étapes + Calendly env-driven avec placeholder vert-sapin — sections 4 et 5 livrées, dashboard content-complete.

## Objective atteint

Requirements 6 (Score cabinet) et 7 (Plan d'action + CTA) livrés. Les 5 sections du dashboard affichent désormais du contenu réel (Synthèse, Manque à gagner, Où & Quand, Score, Plan d'action). Le score est calculé via le helper pur `lib/score.ts` — zero duplication de la formule `100 - taux * 3.2`. Calendly ne montre jamais d'écran vide : iframe si env var défini, sinon placeholder vert-sapin avec copy "Configuration Calendly en cours".

## Schema Resolution

### Taux de no-show (Score input)

Le plan référençait `stats.taux_noshow` (champ flat). Le schéma réel `AuditStats` (types/audit.ts) expose le taux via `stats.global.taux`. `ScoreHero` consomme donc `stats.global.taux` comme input de `computeScore`. Aligné avec `SyntheseKPIs.tsx:43` qui utilise le même path.

### Calendly URL

Env publique `NEXT_PUBLIC_CALENDLY_URL` (non définie en local par défaut) — placeholder vert-sapin actif tant qu'elle n'est pas fournie. Pas de dépendance Calendly widget, iframe simple only.

## Tasks exécutées

### Task 1 — ScoreHero (commit 2bdcb30)

`components/audit/ScoreHero.tsx` — hero primary-dark (`bg-[#064E3B]`) avec radial-gradient émeraude subtil. SVG ring 220px : track `rgba(255,255,255,0.14)`, progress blanc (strokeLinecap round, rotate -90°), `strokeDasharray = (score/100) × 540.4`. Score et "sur 100" en text SVG centré. Badge pill tone-aware (good emerald / warn amber / bad rose) avec `data-score-tone`. Copy explicite avec taux NBSP typographique.

### Task 2 — PlanTimeline (commit fc2a82a)

`components/audit/PlanTimeline.tsx` — 3 items exacts (Rappels SMS J-2 / Caution créneaux / Liste d'attente), puces colorées Volume `#2563EB` / Signal `#059669` / Taux `#EA580C` via `style backgroundColor` (garanti preservé au Tailwind purge). Rail vertical gris via `absolute left-[7px]`. Narratif right column (280px fixe md:) avec phrases-clés 4-6 semaines / 30-50%.

### Task 3 — CalendlyEmbed + wiring (commit 49c24bd)

`components/audit/CalendlyEmbed.tsx` — container blanc border primary-dark 30%. Header flex avec eyebrow + h3. Si `NEXT_PUBLIC_CALENDLY_URL` défini → iframe 360px `loading="lazy"` + bouton "Voir plus de créneaux". Sinon → placeholder `bg-[#064E3B]` 360px avec icône calendrier SVG + copy "Configuration Calendly en cours". Footer mentions (30 min · Google Meet · sans engagement).

AuditDashboard : 3 imports ajoutés, Section score → `<ScoreHero stats={stats} />`, Section plan-et-cta → `<PlanTimeline />` + `<CalendlyEmbed />` + `<details rapport>` dans container `space-y-6`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Schema path for score input**
- **Found during:** Task 1
- **Issue:** Plan snippet référence `stats.taux_noshow` — champ flat inexistant dans `AuditStats`. Le vrai path est `stats.global.taux`.
- **Fix:** Utilisation de `stats.global.taux` (cohérent avec `SyntheseKPIs.tsx:43` qui l'utilise déjà).
- **Files modified:** components/audit/ScoreHero.tsx
- **Commit:** 2bdcb30

**2. [Rule 2 - Missing functionality] Badge tone-aware pill**
- **Found during:** Task 1
- **Issue:** Plan snippet hardcode `bg-emerald-500/20 text-[#a7f3d0]` pour tous les tones (good/warn/bad) — un score "Critique" (bad) avec badge émeraude serait sémantiquement faux.
- **Fix:** Classes conditionnelles par `badge.tone` : good = emerald, warn = amber (#fde68a), bad = rose (#fecaca). `data-score-tone` attribute préservé pour QA.
- **Files modified:** components/audit/ScoreHero.tsx
- **Commit:** 2bdcb30

**3. [Rule 3 - Flow fix] Rapport détaillé placement**
- **Found during:** Task 3
- **Issue:** Plan snippet laisse `<details rapport>` au même niveau que `<PlanTimeline>` et `<CalendlyEmbed>` via `space-y-6`. Le plan indique explicitement `<div className="space-y-6">` englobant — assuré.
- **Fix:** Rapport détaillé bien inclus dans le container `space-y-6` avec PlanTimeline et CalendlyEmbed (ne reste pas hors div).
- **Files modified:** components/audit/AuditDashboard.tsx
- **Commit:** 49c24bd

## Acceptance Criteria (all green)

- [x] `test -f components/audit/ScoreHero.tsx`
- [x] `test -f components/audit/PlanTimeline.tsx`
- [x] `test -f components/audit/CalendlyEmbed.tsx`
- [x] `grep -qE "from ['\"]@/lib/score['\"]" components/audit/ScoreHero.tsx`
- [x] `grep -q "computeScore" components/audit/ScoreHero.tsx`
- [x] `grep -q "scoreBadge" components/audit/ScoreHero.tsx`
- [x] `grep -q "bg-\[#064E3B\]"` present dans ScoreHero **et** CalendlyEmbed (placeholder)
- [x] `grep -q "rgba(255,255,255,0.14)"` present dans ScoreHero (ring track)
- [x] `grep -q "width=\"220\""` present dans ScoreHero
- [x] `grep -q "role=\"img\""` present dans ScoreHero
- [x] Tricolor timeline : #2563EB + #059669 + #EA580C présents dans PlanTimeline
- [x] `grep -q "NEXT_PUBLIC_CALENDLY_URL"` dans CalendlyEmbed
- [x] `grep -q "loading=\"lazy\""` dans CalendlyEmbed
- [x] `grep -q "height={360}"` dans CalendlyEmbed
- [x] `grep -q "Configuration Calendly en cours"` dans CalendlyEmbed
- [x] Imports + usages dans AuditDashboard (ScoreHero / PlanTimeline / CalendlyEmbed)
- [x] `npx tsc --noEmit` exits 0
- [x] `npm run build` exits 0 (/audit = 26.9 kB, First Load JS 152 kB)

## Verification manuelle (smoke)

- Section 4 affiche hero vert-sapin avec ring SVG et score centré.
- `stats.global.taux = 8` → score = `100 - 8*3.2 = 74.4 → 74`, badge "Bon · au-dessus du secteur" (emerald).
- `stats.global.taux = 20` → score = `100 - 20*3.2 = 36`, badge "Critique" (rose).
- Section 5 : timeline tricolore 3 items + placeholder Calendly vert-sapin (URL env non définie en local).

## Self-Check: PASSED

- FOUND: components/audit/ScoreHero.tsx
- FOUND: components/audit/PlanTimeline.tsx
- FOUND: components/audit/CalendlyEmbed.tsx
- FOUND: components/audit/AuditDashboard.tsx (modified — Sections 4+5 wirées)
- FOUND commit: 2bdcb30 (Task 1 ScoreHero)
- FOUND commit: fc2a82a (Task 2 PlanTimeline)
- FOUND commit: 49c24bd (Task 3 CalendlyEmbed + wiring)
