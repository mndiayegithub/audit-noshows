---
phase: 02-refonte-audit-v2
plan: 04
subsystem: audit-dashboard
tags: [audit, dashboard, charts, dom-bars, tailwind, par-jour, par-heure, zero-chartjs]
wave: 3
requires:
  - 02-02 (AuditDashboard shell + AuditSection + pastel tokens)
  - types/audit.ts (AuditStats.par_jour / stats_par_jour optional)
provides:
  - components/audit/ChartParJour.tsx
  - components/audit/ChartParHeure.tsx
  - Section 3 (Où & Quand) content-filled
affects:
  - components/audit/AuditDashboard.tsx (section ou-et-quand wired, placeholder removed)
tech-stack:
  added: []
  patterns:
    - "DOM bars Tailwind pure (flex h-48 items-end + style height %) — zero Chart.js import"
    - "Pic bar highlighted via conditional className (bg-[#059669] vs bg-[#DCF4E6] jour, bg-[#EA580C] vs bg-[#FCEACC] heure)"
    - "Normalization dictionary pattern: normalizeDayKey + matchSlot absorbent toutes variantes n8n (Lun/lundi/monday, 8-10h/8h-10h/8h)"
    - "Empty state card (border-dashed) pour par_heure absent"
    - "Insight dynamique calculé client-side: pic index, % du total, NBSP typographique avant %"
key-files:
  created:
    - components/audit/ChartParJour.tsx
    - components/audit/ChartParHeure.tsx
  modified:
    - components/audit/AuditDashboard.tsx
decisions:
  - "Pure DOM bars Tailwind retenu — zéro dépendance Chart.js pour sections 3 (per D-07, Chart.js en legacy tant que GraphiqueParJour n'est pas retiré par plan 02-06)"
  - "Support polymorphe stats.par_jour || stats.stats_par_jour — normalizeDayKey accepte Lun/Mar/... et lundi/mardi/..."
  - "Field count polymorphe: count | no_shows | noShows | value — couvre les trois shapes n8n observés"
  - "par_heure optionnel — empty state 'Données horaires non disponibles' avec hint Phase 3 n8n extension"
  - "Pic jour émeraude #059669 / pic heure orange #EA580C — sémantique pastel préservée (Signal / Taux)"
metrics:
  duration_minutes: 8
  completed_date: 2026-04-24
  tasks_completed: 3
  files_created: 2
  files_modified: 1
---

# Phase 02 Plan 04 : Section Où & Quand Summary

**One-liner :** 2 charts DOM-bars Tailwind (7 jours émeraude + 5 tranches horaires orange) side-by-side avec insights dynamiques et empty state — zero Chart.js.

## Objective atteint

Requirement 5 (Où & Quand) livré. Section 3 du dashboard passe du placeholder à deux cards charts côte-à-côte (`lg:grid-cols-2`) qui stackent sous 1024px. Aucun import `chart.js` ni `react-chartjs-2` dans les deux nouveaux composants (grep-verified).

## Shape Resolution (for Plan 02-06 cleanup reference)

### `par_jour` resolved shape

D'après `types/audit.ts` :

- `stats.par_jour?: Array<{ jour, total_rdv, no_shows, taux }>` (nouvelle shape)
- `stats.stats_par_jour?: Array<{ jour, total, noShows, taux }>` (legacy)

`ChartParJour` consomme les deux via fallback `stats.par_jour ?? stats.stats_par_jour ?? []`, field de valeur polymorphe (`count ?? no_shows ?? noShows ?? value`).

### `par_heure` resolved shape

Pas encore typé dans `types/audit.ts`. `ChartParHeure` l'accède via narrow-cast `as { par_heure?: Array<{ tranche?, slot?, heure?, count?, no_shows?, noShows?, value? }> }`. Empty state s'affiche tant que n8n n'injecte pas `par_heure` (déblocage prévu phase 3 n8n extension).

**Action Plan 02-06 :** ajouter `par_heure` à `AuditStats` une fois n8n aligné + retirer la dépendance Chart.js (package.json + `components/GraphiqueParJour.tsx` legacy).

## Tasks exécutées

### Task 1 — ChartParJour (commit 484d3bb)

7 bars (Lun→Dim) avec fallback `par_jour || stats_par_jour`, normalizeDayKey tolérant (Lun/lundi/monday-style), bar pic `#059669`, bars standard `#DCF4E6`, insight "Pic le <jour> — X no-shows, Y% du total" avec NBSP typographique.

### Task 2 — ChartParHeure (commit de98221)

5 tranches (`8–10h`, `10–12h`, `14–16h`, `16–18h`, `18–20h`). Empty state `border-dashed` avec texte "Données horaires non disponibles" + hint Phase 3 quand `par_heure` absent. matchSlot absorbe variations (`8-10h`, `8h-10h`, chiffre seul). Bar pic `#EA580C`, bars standard `#FCEACC`, insight "Créneau critique <slot> — Y% des no-shows".

### Task 3 — Wiring AuditDashboard (commit dc745a6)

Imports `ChartParJour` + `ChartParHeure`, placeholder section `ou-et-quand` remplacé par `<div className="grid grid-cols-1 lg:grid-cols-2 gap-5">`. Build green (`/audit` = 25.5 kB First Load JS 151 kB).

## Deviations from Plan

None — plan exécuté exactement comme écrit. Le field `noShows` (legacy camelCase) a été ajouté en plus du `no_shows` du template comme Rule 2 preventive (couvre `stats_par_jour` shape de `types/audit.ts`). Aucune décision architecturale prise, aucun auth gate, aucun bug à fixer.

## Acceptance Criteria (all green)

- [x] `test -f components/audit/ChartParJour.tsx`
- [x] `test -f components/audit/ChartParHeure.tsx`
- [x] NO Chart.js import (grep -qE "from ['\"](chart\.js|react-chartjs)" — empty on both)
- [x] Bar colors jour : `bg-[#DCF4E6]` + `bg-[#059669]`
- [x] Bar colors heure : `bg-[#FCEACC]` + `bg-[#EA580C]`
- [x] Empty state : "Données horaires non disponibles"
- [x] Insights dynamiques : "Pic le" + "Créneau critique"
- [x] AuditDashboard imports + `<ChartParJour stats={stats}` + `<ChartParHeure stats={stats}`
- [x] `lg:grid-cols-2` responsive
- [x] `npx tsc --noEmit` exits 0
- [x] `npm run build` exits 0

## Self-Check: PASSED

- FOUND: components/audit/ChartParJour.tsx
- FOUND: components/audit/ChartParHeure.tsx
- FOUND: components/audit/AuditDashboard.tsx (modified — Where & When wired)
- FOUND commit: 484d3bb (Task 1 ChartParJour)
- FOUND commit: de98221 (Task 2 ChartParHeure)
- FOUND commit: dc745a6 (Task 3 AuditDashboard wiring)
