---
gsd_state_version: 1.0
milestone: v2.0
milestone_name: — Finalisation
status: unknown
stopped_at: ✅ **Phase 7-bis CLOSE — n8n alignment + 3 fixes post-UAT, 10/10 smoke prod validés**.
last_updated: "2026-04-26T16:30:00.000Z"
last_activity: "2026-04-26 -- Plan 09-01 complete: @vercel/analytics@2.0.1 installed + <Analytics /> mounted in RootLayout, bundle baseline / = 160 kB captured pre-install for AC-4 delta. Wave 1 (09-01 + 09-02) DONE — disjoint files merged cleanly."
progress:
  total_phases: 9
  completed_phases: 4
  total_plans: 31
  completed_plans: 25
  percent: 81
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-22)

**Core value:** Audit rapide des no-shows pour cabinets dentaires — diagnostic + rapport IA en 60 s.
**Current focus:** Phase 08 ✅ close — funnel commercial v2 live + complet sur `audit.perfiamatic.fr`. Reste Phase 09 (monitoring) pour clôturer milestone v2.

## Current Position

Phase: 09 of 09 — 📝 à spec (monitoring & analytics)
Phases livrées & validées : 01 (landing v2), 02 (audit dashboard v2), 03 (n8n stats_par_mois), 04 (Google Places API), 05 (RGPD & Sécurité), 06 (tests Vitest + Playwright — absorbée dans Phase 7), 07 (Robustesse upload CSV + 7-bis n8n alignment + 3 fixes post-UAT), **08 (Déploiement production v2)**
Phase 08 résumé : smoke E2E 4/4, backup `v1-backup` branch + tag `v1.0.0` (commit `91e66ad`), 3 env vars set + redéploy (55s), Calendly URL baked dans bundle, Google Places API live, rollback plan → `.planning/ROLLBACK.md`. **Découverte** : 0 env vars set avant ce passage → CTA Calendly cassé silencieusement depuis 1er deploy v2 — réparé.
Next: Phase 09 monitoring (events, dashboard conversion, alertes Sentry/Vercel logs).
Last activity: 2026-04-26 -- Plan 09-02 complete: lib/analytics.ts (11 typed helpers + safeTrack fail-soft) + vitest GREEN 19/19 in 7.35s. Wave 1 done with 09-01 (parallel, disjoint files).

Progress: [████████░░] 89% (8/9 phases validées)

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
- Plan 09-02: `lib/analytics.ts` = single import barrier pour `@vercel/analytics` (D-03) — 11 helpers typés + `safeTrack` try/catch silencieux (D-04 fail-soft) + `CalendlyCtaLocation` literal union exporté
- Plan 09-02: PII safety by construction — signatures TS bloquent statiquement free-form `email`/`nom_cabinet`/CSV content (R3 / AC-3)
- Plan 09-02: TDD red→green honoré (`b78e58b` test → `caf218d` impl) ; vitest GREEN 19/19 en 7.35s
- Plan 09-01: `@vercel/analytics@2.0.1` résolu (npm latest = 2.x ; deviation Rule 3 vs plan-spec 1.x) ; subpath `/react` inchangé per RESEARCH Q1
- Plan 09-01: Bundle baseline / = 160 kB / /audit = 242 kB capturé pre-install dans `09-01-bundle-baseline.txt` (R5 baseline pour AC-4 delta Plan 09-04)
- Plan 09-01: `<Analytics />` monté en sibling de Toaster + Agentation (D-01) ; pas de prop `mode`/`debug` (defaults Vercel auto)

### Pending Todos

None yet.

### Blockers/Concerns

None.

## Deferred Items

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| build    | 4 npm deps missing from node_modules (chart.js, react-chartjs-2, react-markdown, remark-gfm) — blocks `npm run build` on unrelated audit-flow files. Pre-existing, network offline. See `.planning/phases/phase-01-refonte-landing-v2/deferred-items.md` | open | 2026-04-23 (Plan 01-01) |

## Session Continuity

Last session: 2026-04-26 13:00 GMT+2
Stopped at: ✅ **Phase 7-bis CLOSE — n8n alignment + 3 fixes post-UAT, 10/10 smoke prod validés**.

**Phase 7-bis n8n** (option propre choisie — refactor graphe avec IF + 2 Respond Webhook).

Workflow `Hc3aGjSuNjd4KVuu` mis à jour via MCP `n8n_update_full_workflow` :

- Parse & Validate CSV : strip Doctolib metadata, regex statuts FR/EN étendue, retourne `{success, ...}` (jamais throw), expose `nb_rdv_valides`/`reco_rate`/`ignored_count`/`sample_ignored`, self-handle INSUFFICIENT_DATA + INVALID_DATE_FORMAT
- Nouveau IF "Validation Success?" + nouveau Respond Webhook "Respond Error" (HTTP 400 + JSON typé)
- Formater Réponse passthrough des 4 champs

Workaround `stripLeadingMetadata` côté `route.ts` (commit `ae78614`) **retiré** car redondant après alignement n8n (commit `b67ff1d`).

Snapshots préservés : `04_Scripts_Workflows/audit-flash-Hc3aGjSuNjd4KVuu-snapshot-2026-04-26.json` (pre) + `-postrefactor.json` (post).

**Fixes additionnels post-UAT** :

- `2a50473` — `BROAD_DATE`/`BROAD_STATUT` substring-match (débloque headers Doctolib `Statut_presence`, Julie `Statut RDV`, Logos `Résultat`). Aligne client `parseCSVForPreview` + serveur `audit-validation`.
- `d2a37c6` — Helper `lib/readCSVAsText.ts` avec auto-décode UTF-8 → fallback ISO-8859-1. Branché dans `useCSVPreview` + `app/audit/page.tsx` submit. Hint `MISSING_COLUMNS` aussi mis à jour pour lister les variantes acceptées au lieu de demander un rename.

**Smoke test prod 10/10 CSVs ✅** (`01_Leads_CSV/test_*.csv`, via curl) :

- 9/10 à 100 % reco / 0 ignored (golden path complet)
- 1/10 (test_05_doctolib_statuts_inconnus) à 80 % → mode dégradé attendu (DegradedConfirmDialog côté UI)

**Phase 8 deploy Vercel = DÉBLOQUÉE.** Fallback option simple n8n documenté (`feedback_n8n_workflow_error_strategy`) si ≥3 incidents prod en 2 semaines. UAT user en cours en parallèle pour confirmer côté UI réelle.
Resume file: None
