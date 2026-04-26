# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-22)

**Core value:** Audit rapide des no-shows pour cabinets dentaires — diagnostic + rapport IA en 60 s.
**Current focus:** Phase 07 + 7-bis n8n alignment ✅ livrées et validées en smoke prod — Phase 08 deploy Vercel débloquée.

## Current Position

Phase: 07 of 09 — ✅ Livrée + Phase 7-bis n8n alignée (smoke prod 4/4 cas validés 2026-04-26 12h20)
Phases livrées & validées : 01 (landing v2), 02 (audit dashboard v2), 03 (n8n stats_par_mois), 04 (Google Places API), 05 (RGPD & Sécurité)
Phase 06 (tests Vitest + Playwright) absorbée dans Phase 07 (config existait, étendue par Phase 7).
Phase 07 (Robustesse upload CSV) — 8 plans, 4 vagues, 6 REQs livrées. Verifier: 6/6 REQs PASS structurel. Voir `.planning/phases/phase-07-robustesse-upload-csv/PHASE-SUMMARY.md`.
Next: UAT utilisateur (npm run test:e2e + npm test + smoke prod) → puis Phase 08 (deploy Vercel) → Phase 09 (monitoring).
Last activity: 2026-04-26 — Phase 7 complète : `lib/audit-thresholds.ts`, `lib/parseCSVForPreview.ts`, `lib/n8n-normalize.ts:mapN8nErrorToCode`, CSVPreview / DegradedConfirmDialog (Radix) / CSVErrorCard, page.tsx full wiring, 12 fixtures CSV + 3 mocks JSON, 3 specs Playwright e2e (mock page.route).

Progress: [██████░░░░] 67% (6/9 phases livrées — Phase 7 en attente UAT)

## Performance Metrics

**Velocity:**
- Total plans completed: 8
- Average duration: ~9 min
- Total execution time: ~75 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01 | 1/5 | ~25 min | ~25 min |
| 02 | 6/7 | ~43 min | ~7 min   |
| 03 | 1/1 | ~7 min  | ~7 min   |

**Recent Trend:**
- Last 5 plans: 02-03 (~8 min), 02-04 (~8 min), 02-05 (~7 min), 02-06 (~4 min), 03-01 (~7 min)
- Trend: ↘️ plans courts et focalisés ; Phase 3 = livraison backend pure

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
- Plan 02-06: Task 2 (RapportPDF refonte light palette) SKIPPED par override utilisateur explicite — RapportPDF.tsx conservé verbatim en palette dark/gold v1, REQ-2 reporté vers milestone "PDF refonte clinique" backlog
- Plan 02-06: Bouton PDF déplacé de page.tsx vers AuditDashboard Section 5 (props `onDownloadPDF` + `isGeneratingPDF`) — aligné avec la nouvelle arborescence par sections
- Plan 02-06: Suppression 3 composants legacy v1 (GaugeBenchmark / GraphiqueParJour / ScoreGlobal) + nettoyage massif des imports dans page.tsx (ScoreCard inline, ReactMarkdown, Framer Motion, Font.register redondants)

### Pending Todos

None yet.

### Blockers/Concerns

None.

## Deferred Items

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| build    | 4 npm deps missing from node_modules (chart.js, react-chartjs-2, react-markdown, remark-gfm) — blocks `npm run build` on unrelated audit-flow files. Pre-existing, network offline. See `.planning/phases/phase-01-refonte-landing-v2/deferred-items.md` | open | 2026-04-23 (Plan 01-01) |

## Session Continuity

Last session: 2026-04-26 12:25 GMT+2
Stopped at: ✅ **Phase 7-bis n8n alignment LIVRÉE** (option propre choisie — refactor graphe avec IF + 2 Respond Webhook).

Workflow `Hc3aGjSuNjd4KVuu` mis à jour via MCP `n8n_update_full_workflow` :
- Parse & Validate CSV : strip Doctolib metadata, regex statuts FR/EN étendue, retourne `{success, ...}` (jamais throw), expose `nb_rdv_valides`/`reco_rate`/`ignored_count`/`sample_ignored`, self-handle INSUFFICIENT_DATA + INVALID_DATE_FORMAT
- Nouveau IF "Validation Success?" + nouveau Respond Webhook "Respond Error" (HTTP 400 + JSON typé)
- Formater Réponse passthrough des 4 champs

**Smoke test prod 4/4 cas validés** (curl + UI utilisateur) :
1. test_01 Doctolib clean → 200, 480 RDV, audit complet ✅
2. test_09 metadata header (3 lignes) → 200, 480 RDV (gap 1 OK) ✅
3. CSV sans colonne statut → 400 `MISSING_COLUMNS` typé ✅
4. CSV 15 RDV (< MIN_RDV_VALIDES) → 400 `INSUFFICIENT_DATA` avec `reco_rate`/`nb_rdv_valides` ✅

Workaround `stripLeadingMetadata` côté `route.ts` (commit `ae78614`) **retiré** car redondant — n8n gère maintenant.

Snapshots préservés : `04_Scripts_Workflows/audit-flash-Hc3aGjSuNjd4KVuu-snapshot-2026-04-26.json` (pre) + `-postrefactor.json` (post).

**Phase 8 deploy Vercel = DÉBLOQUÉE.** Si problème n8n en prod (≥3 incidents en 2 semaines), fallback option simple documenté dans memory `feedback_n8n_workflow_error_strategy`.
Resume file: None
