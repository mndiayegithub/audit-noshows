---
phase: 02-refonte-audit-v2
plan: 03
subsystem: audit-dashboard
tags: [audit, dashboard, kpi, money-build, violet-plein, ca-perdu-invariant]
wave: 3
requires:
  - 02-02 (AuditDashboard shell + AuditSection + pastel tokens)
  - components/ui/CountUpNumber.tsx (Phase 1)
  - types/audit.ts (AuditStats.global.* + periode.nb_mois)
provides:
  - components/audit/SyntheseKPIs.tsx
  - components/audit/MoneyBuildCard.tsx
  - Dashboard sections 1 & 2 content-filled
affects:
  - components/audit/AuditDashboard.tsx (sections synthese + manque-a-gagner wired)
tech-stack:
  added: []
  patterns:
    - "4-KPI pastel grid (Volume/Signal/Taux/Argent) avec tokens bg-kpi*/text-kpi*-fg"
    - "Violet-plein hero card (#6B21A8) + glass breakdown (bg-white/10 + backdrop-blur)"
    - "CountUpNumber (target/decimals/suffix) pour l'animation KPI"
    - "French typographic NBSP ( ) avant € et %"
key-files:
  created:
    - components/audit/SyntheseKPIs.tsx
    - components/audit/MoneyBuildCard.tsx
  modified:
    - components/audit/AuditDashboard.tsx
decisions:
  - "Real AuditStats schema used (stats.global.* + stats.periode.nb_mois) vs. plan's simplified stats.rdv_total/no_shows/ca_perdu — Rule 1 continuation from Plan 02-02"
  - "ca_perdu_an displayed VERBATIM in 2 locations (Argent KPI + Total annualisé) — no multiplication anywhere"
  - "#6B21A8 hex confined to MoneyBuildCard.tsx only — design contract lock"
  - "CountUpNumber signature uses target/decimals/suffix (not end/format as plan snippet suggested) — real component API"
metrics:
  duration_minutes: 8
  completed_date: 2026-04-24
  tasks_completed: 3
  files_created: 2
  files_modified: 1
---

# Phase 02 Plan 03 : Sections Synthèse + Manque à gagner Summary

**One-liner :** 4 KPI pastels animés (CountUpNumber) + card violet-plein `#6B21A8` avec breakdown glass — `ca_perdu_an` affiché verbatim en 2 points, jamais remultiplié.

## Objective atteint

Requirements 3 (Synthèse 4 KPI) et 4 (Manque à gagner violet-plein) livrés. Invariant `ca_perdu` grep-verifiable sur les deux composants (aucun `*`). Sections 1 et 2 du dashboard passent du placeholder au contenu réel.

## Commits

| Hash      | Message                                              |
| --------- | ---------------------------------------------------- |
| `f3a51dc` | feat(02-03): add SyntheseKPIs                        |
| `89cf492` | feat(02-03): add MoneyBuildCard                      |
| `e3ea4cd` | feat(02-03): wire components into AuditDashboard     |

## Files

**Created :**
- `components/audit/SyntheseKPIs.tsx` (83 lignes) — grille 4 cards, tokens `bg-kpiVolume|Signal|Taux|Argent` + `text-*-fg`, Fraunces 40px, CountUpNumber animé
- `components/audit/MoneyBuildCard.tsx` (82 lignes) — card `bg-[#6B21A8]` + radial gradient, hero 72/96px, breakdown glass (bg-white/10 + backdrop-blur + border-white/20)

**Modified :**
- `components/audit/AuditDashboard.tsx` — imports + remplacement 2 placeholders + ajout `lede` sur section manque-a-gagner

## Verification

- `npx tsc --noEmit` : 0 erreur
- `npm run build` : ✅ exit 0, `/audit` route = 24.2 kB / First Load 149 kB
- `grep -rl "#6B21A8" components/audit/ | wc -l` = **1** (MoneyBuildCard.tsx uniquement)
- `grep -qE "ca_perdu.*\*" components/audit/SyntheseKPIs.tsx` = **non trouvé** (invariant respecté)
- `grep -qE "ca_perdu.*\*" components/audit/MoneyBuildCard.tsx` = **non trouvé** (invariant respecté)
- `stats.global.ca_perdu_an` référencé 2× dans MoneyBuildCard (hero + total annualisé) + 1× dans SyntheseKPIs (Argent KPI) — tous verbatim

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Plan snippet referenced non-existent AuditStats flat fields**

- **Found during :** Task 1 (read of `types/audit.ts`)
- **Issue :** Le plan utilisait `stats.rdv_total`, `stats.no_shows`, `stats.taux_noshow`, `stats.ca_perdu`, `stats.ca_moyen_par_rdv`, `stats.nb_mois` — ces champs n'existent pas sur `AuditStats`. Le vrai schéma loge tout sous `stats.global.*` et `stats.periode.nb_mois`.
- **Fix :** Remappage identique à celui appliqué en Plan 02-02 (Rule 1 continuation) :
  - `stats.rdv_total` → `stats.global.total_rdv`
  - `stats.no_shows` → `stats.global.no_shows`
  - `stats.taux_noshow` → `stats.global.taux`
  - `stats.ca_perdu` → `stats.global.ca_perdu_an` (le champ annualisé déjà livré par n8n)
  - `stats.ca_moyen_par_rdv` → `stats.global.ca_moyen`
  - `stats.nb_mois` → `stats.periode.nb_mois`
- **Files modified :** SyntheseKPIs.tsx, MoneyBuildCard.tsx
- **Impact sur l'invariant métier :** aucun — la règle `ca_perdu déjà annualisé par n8n` s'applique à `ca_perdu_an`, qui est la valeur annualisée exposée par `AuditStats.global`.

**2. [Rule 1 - Bug] CountUpNumber signature différente du snippet**

- **Found during :** Task 1 (read de `components/ui/CountUpNumber.tsx`)
- **Issue :** Le plan propose `<CountUpNumber end={k.value} format={k.format} />`. La vraie API est `target/decimals/prefix/suffix`.
- **Fix :** Adaptation à la vraie signature : `<CountUpNumber target={k.target} decimals={k.decimals} suffix={k.suffix} />`. Le formatage fr-FR est fait en interne par le composant, et les suffixes ` %` / ` €` (NBSP + symbole) sont passés via `suffix`.
- **Files modified :** SyntheseKPIs.tsx
- **Impact :** l'animation et le rendu final sont équivalents ; la mise en forme fr-FR est même plus stricte (via `toLocaleString` dans CountUpNumber).

## Acceptance criteria

### Task 1 (SyntheseKPIs)

- [x] Fichier créé
- [x] `"use client"` directive
- [x] `lg:grid-cols-4` (responsive 1 → 2 → 4)
- [x] 4 pastel bg classes (`bg-kpiVolume`, `bg-kpiSignal`, `bg-kpiTaux`, `bg-kpiArgent`)
- [x] 4 fg text classes (`text-kpiVolume-fg`, etc.)
- [x] 4 chip labels (Volume, Signal, Taux, Argent)
- [x] Fraunces 40px via `font-fraunces text-[40px]`
- [x] NBSP avant € et % (via `${NBSP}%` et `${NBSP}€`)
- [x] `stats.global.ca_perdu_an` référencé, aucune multiplication
- [x] `npx tsc --noEmit` vert

### Task 2 (MoneyBuildCard)

- [x] Fichier créé
- [x] `bg-[#6B21A8]` présent
- [x] `rounded-[28px]` présent
- [x] `text-[72px] md:text-[96px]` présent
- [x] Glass : `bg-white/10` + `border-white/20` + `backdrop-blur-sm`
- [x] "Total CA perdu annualisé" présent
- [x] `stats.global.ca_perdu_an` référencé 2× (hero + total)
- [x] **Zéro multiplication** sur `ca_perdu_an`
- [x] #6B21A8 confiné à **1** fichier dans `components/audit/`
- [x] `npx tsc --noEmit` vert

### Task 3 (Wire into AuditDashboard)

- [x] `import SyntheseKPIs` ajouté
- [x] `import MoneyBuildCard` ajouté
- [x] `<SyntheseKPIs stats={stats} />` wiré dans section synthese
- [x] `<MoneyBuildCard stats={stats} />` wiré dans section manque-a-gagner
- [x] Lede ajouté sur section manque-a-gagner (rappel annualisation)
- [x] `npx tsc --noEmit` + `npm run build` verts

## Known Stubs

Aucun stub dans ce plan. Les sections 3 (Où & Quand), 4 (Score) et 5 (Plan d'action) restent en placeholders **documentés** (attribués aux Plans 02-04 et 02-05) — ce n'est pas un stub bloquant puisque la roadmap est explicite.

## Self-Check: PASSED

- FOUND : `components/audit/SyntheseKPIs.tsx`
- FOUND : `components/audit/MoneyBuildCard.tsx`
- FOUND : `components/audit/AuditDashboard.tsx` (modifié)
- FOUND : commit `f3a51dc`
- FOUND : commit `89cf492`
- FOUND : commit `e3ea4cd`
- FOUND : build green (exit 0)
- FOUND : invariant `ca_perdu` respecté (0 multiplication)
- FOUND : #6B21A8 dans exactement 1 fichier
