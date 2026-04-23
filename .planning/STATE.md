# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-22)

**Core value:** Audit rapide des no-shows pour cabinets dentaires — diagnostic + rapport IA en 60 s.
**Current focus:** Phase 02 — refonte-audit-v2 (dashboard clinique-claire)

## Current Position

Phase: 02 of 08 (refonte-audit-v2)
Plan: 06 of 07 in current phase
Status: In progress (Wave 3 complete — sections 1 à 5 livrées)
Last activity: 2026-04-24 — Plan 02-05 complete (ScoreHero + PlanTimeline + CalendlyEmbed + wiring Sections 4+5)

Progress: [███████░░░] 70%

## Performance Metrics

**Velocity:**
- Total plans completed: 6
- Average duration: ~11 min
- Total execution time: ~64 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01 | 1/5 | ~25 min | ~25 min |
| 02 | 5/7 | ~39 min | ~8 min   |

**Recent Trend:**
- Last 5 plans: 02-01 (6 min), 02-02 (~10 min), 02-03 (~8 min), 02-04 (~8 min), 02-05 (~7 min)
- Trend: ↗️ stable (composants content + wiring léger)

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Phase 01: Dark premium split-hero landing v2 (sketch 005 variant D winner)
- Phase 01: Sketch findings skill auto-loaded for landing implementation
- Plan 01-01: D-09 big bang token replacement executed in one wave
- Plan 01-01: Fraunces loaded as variable font with opsz axis (not static weights)
- Plan 01-01: scrollbar-hide utility dropped — zero remaining callers
- Plan 02-01: `text-ink` fallback → `text-slate-900` (not defined in config, plan-sanctioned)
- Plan 02-01: TDD honored via inline Node assertion (no Vitest installed yet — deferred to Phase 6)
- Plan 02-01: Task 3 no-op commit skipped — tokens already seeded by Phase 1 (audit-only)
- Plan 02-02: Shell dashboard wired — AuditSidebar (240px desktop + mobile top-bar), useScrollSpy rootMargin -40%, 5 placeholder sections ready for Wave 3
- Plan 02-02: Rule 1 auto-fix — realigned `stats.global.total_rdv` / `stats.periode.nb_mois` vs plan snippet (which referenced non-existent flat fields)
- Plan 02-02: Legacy imports in app/audit/page.tsx intentionally kept (cleanup scoped to plan 02-06)
- Plan 02-03: Rule 1 continuation — schema remap (stats.global.ca_perdu_an / ca_moyen, stats.periode.nb_mois) + CountUpNumber real signature (target/decimals/suffix)
- Plan 02-03: Invariant ca_perdu confirmé — stats.global.ca_perdu_an affiché verbatim (2× MoneyBuildCard + 1× SyntheseKPIs), 0 multiplication
- Plan 02-03: #6B21A8 confiné à MoneyBuildCard.tsx (1 seul fichier dans components/audit/)
- Plan 02-04: DOM bars Tailwind purs retenus — aucun import chart.js/react-chartjs-2 dans ChartParJour / ChartParHeure (per D-07, Chart.js retrait programmé plan 02-06)
- Plan 02-04: Support polymorphe `stats.par_jour || stats.stats_par_jour` + field `count | no_shows | noShows | value` — couvre les 3 shapes n8n observées
- Plan 02-04: `par_heure` non typé dans AuditStats (narrow-cast localisé) — empty state "Données horaires non disponibles" tant que n8n extension Phase 3 absente
- Plan 02-05: Score input via `stats.global.taux` (path réel AuditStats) — Rule 1 auto-fix vs plan snippet `stats.taux_noshow` (champ flat inexistant)
- Plan 02-05: Badge pill tone-aware (good emerald / warn amber / bad rose) — Rule 2 preventive, évite qu'un score "Critique" apparaisse en badge émeraude
- Plan 02-05: CalendlyEmbed iframe-only (pas de widget Calendly.js) — D-10 confirmé, placeholder vert-sapin garanti tant que NEXT_PUBLIC_CALENDLY_URL non défini
- Plan 02-05: `computeScore` + `scoreBadge` réutilisés depuis lib/score.ts — zero duplication de la formule 100 - taux × 3.2

### Pending Todos

None yet.

### Blockers/Concerns

None.

## Deferred Items

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| build    | 4 npm deps missing from node_modules (chart.js, react-chartjs-2, react-markdown, remark-gfm) — blocks `npm run build` on unrelated audit-flow files. Pre-existing, network offline. See `.planning/phases/phase-01-refonte-landing-v2/deferred-items.md` | open | 2026-04-23 (Plan 01-01) |

## Session Continuity

Last session: 2026-04-24 01:22
Stopped at: Plan 02-05 complete — Wave 3 complete (sections 1 à 5 content-filled). ScoreHero primary-dark avec ring 220px SVG piloté par computeScore(stats.global.taux), PlanTimeline 3-items tricolore (Volume/Signal/Taux) + narratif, CalendlyEmbed iframe env-driven (placeholder vert-sapin si NEXT_PUBLIC_CALENDLY_URL absent). AuditDashboard sections 4+5 wirées. Build green (/audit = 26.9 kB). Ready for Plan 02-06 (cleanup legacy Gauge/Graphique/Score + RapportPDF refonte light).
Resume file: None
