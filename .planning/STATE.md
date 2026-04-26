# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-22)

**Core value:** Audit rapide des no-shows pour cabinets dentaires — diagnostic + rapport IA en 60 s.
**Current focus:** Phase 07 livrée structurellement — UAT utilisateur en attente (e2e + vitest + smoke prod) avant Phase 08 deploy.

## Current Position

Phase: 07 of 09 — ✅ Livrée structurellement 2026-04-26 (UAT utilisateur en attente)
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

Last session: 2026-04-26 04:45 GMT+2 (avant /compact + dodo)
Stopped at: Phase 7 livrée + UAT validée côté Next.js (vitest 78/78 ✅, e2e 3/3 ✅ via filechooser pattern + bumped timeouts, build ✅). 5 bugs trouvés en UAT et corrigés : (a) parseCSVForPreview ne skippait pas la ligne `Export du …` Doctolib → `stripLeadingMetadata()` ; (b) STATUTS_RECONNUS regex étendue (Non honoré, Excusé, Manqué, présent, OK, HONORE/ABSENT) ; (c) audit-validation.ts avait LE MÊME bug → `findHeaderLineIndex()` ajouté ; (d) Playwright `setInputFiles` direct ne déclenchait pas onDrop de react-dropzone → flux filechooser ; (e) playwright.config timeout test 120s + nav 60s pour cold-start Next.js sur WSL. Commits: `46acadd` (parseCSVForPreview + e2e) + `434b84e` (audit-validation server). 10 CSVs de test ajoutés dans `01_Leads_CSV/test_*.csv` (5 propres + 5 altérés).

🚨 **BLOQUANT Phase 8** découvert en smoke prod : workflow n8n `Hc3aGjSuNjd4KVuu` (Audit Flash No-Shows live) renvoie 502 sur Doctolib clean car son nœud "Parse & Validate CSV" a 4 gaps non-alignés avec Phase 7 :
1. Ne skippe pas la ligne métadonnée Doctolib
2. Ne reconnaît pas les statuts FR étendus
3. Ne renvoie pas les 5 error_code typés Phase 7
4. Ne passthrough pas les champs degraded/reco_rate/ignored_count/sample_ignored

À reprendre demain matin (2026-04-27) AVANT Phase 8 deploy. Reco : option C+B (workaround route.ts pour débloquer Doctolib + nouveau plan 07-09 pour aligner n8n). Outils : MCP n8n (`mcp__n8n-mcp__n8n_get_workflow` / `n8n_update_partial_workflow`). Voir aussi memory `project_phase7_n8n_followup`.
Resume file: None
