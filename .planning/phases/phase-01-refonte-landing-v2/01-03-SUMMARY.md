---
phase: 01-refonte-landing-v2
plan: 03
subsystem: landing-components
tags: [landing, stats, how-it-works, score, rsc]
requires: [01-01]
provides:
  - components/landing/StatsBar.tsx
  - components/landing/TargetGrid.tsx
  - components/landing/HowItWorksTimeline.tsx
  - components/landing/ValueProps.tsx
  - components/landing/ScorePill.tsx
affects: []
tech_stack:
  patterns: [react-server-components, tailwind-semantic-tokens, pure-svg-ring]
key_files:
  created:
    - components/landing/StatsBar.tsx
    - components/landing/TargetGrid.tsx
    - components/landing/HowItWorksTimeline.tsx
    - components/landing/ValueProps.tsx
    - components/landing/ScorePill.tsx
  modified: []
decisions:
  - "All 5 components are RSC — no client hooks, no framer-motion (scroll fade-up deferred to Plan 05 page-level utility)"
  - "KPI sémantique locked on HowItWorksTimeline: step 1 Volume bleu, step 2 Signal émeraude, step 3 Taux orange (Argent reserved for money)"
  - "ScorePill uses pure inline SVG (r=32, stroke=6) — zero Chart.js dependency"
  - "TargetGrid rotates through all 4 KPI pastels as surface decoration (Volume/Signal/Taux/Argent) — decorative, not semantic"
metrics:
  tasks_completed: 3
  files_created: 5
  completed_date: 2026-04-23
---

# Phase 01 Plan 03: Stats + Target + How-It-Works + ValueProps Summary

Five RSC landing-middle components implementing sketches 002 B (stats + target grid) and 003 C (how-it-works timeline + value props with floating score pill), all using the clinique-claire v2 token set from Plan 01-01.

## Components Delivered

| File | Export | Role |
|------|--------|------|
| `components/landing/StatsBar.tsx` | `StatsBar` (default) | 3 factual stats (8% / 27k€ / 3min) in Fraunces + vert sapin, vertical dividers on `bg-white` |
| `components/landing/TargetGrid.tsx` | `TargetGrid` (default) | 4 cabinet-cible cards with pastel pastille icons, section `id="pour-qui"` |
| `components/landing/HowItWorksTimeline.tsx` | `HowItWorksTimeline` (default) | 3 numbered vertical steps with tricolor Volume/Signal/Taux pastilles + gray-200 connector, section `id="comment-ca-marche"` |
| `components/landing/ScorePill.tsx` | `ScorePill` (default) | Compact card, pure-SVG 80px ring (r=32, circumference-based `strokeDasharray`), score 72/100 in Fraunces |
| `components/landing/ValueProps.tsx` | `ValueProps` (default) | 2-col split: 4 emerald `Check` bullets + floating `ScorePill` |

## Stats Values (for cross-landing consistency)

- **8 %** — Taux de no-shows moyen secteur dentaire
- **27 k€** — Manque à gagner annuel cabinet moyen
- **3 min** — Temps pour recevoir votre audit

## Icon Substitutions

None required. All lucide-react icons used (`Stethoscope`, `Smile`, `Sparkles`, `Building2`, `Check`) resolved correctly in v1.7.0.

## KPI Sémantique Enforcement

HowItWorksTimeline locks the KPI → step mapping:
- Step 1 → `bg-kpiVolume` / `text-kpiVolume-fg` (bleu — "Chargez l'export")
- Step 2 → `bg-kpiSignal` / `text-kpiSignal-fg` (émeraude — "On analyse")
- Step 3 → `bg-kpiTaux` / `text-kpiTaux-fg` (orange — "Rapport")
- `bg-kpiArgent` explicitly NOT used (reserved for money surfaces)

TargetGrid uses all 4 pastels as decorative surface variety — this is not a semantic mapping and can be permuted freely in later tweaks.

## Commits

| Task | Hash | Message |
|------|------|---------|
| 1 | `116d331` | feat(01-03): add StatsBar and TargetGrid landing components |
| 2 | `5a82a63` | feat(01-03): add HowItWorksTimeline with tricolor Volume/Signal/Taux steps |
| 3 | `7be274c` | feat(01-03): add ScorePill and ValueProps landing components |

## Verification

- `npx tsc --noEmit` — 0 errors in `components/landing/*`. Pre-existing errors in `app/audit/*` and `components/Graphique*/Gauge*` (missing `chart.js`, `react-markdown`, `remark-gfm`) are unrelated to this plan and pre-existed on main.
- All acceptance greps passed (ids present, tokens present, no `"use client"` directive, no superlative copy).

## Deviations from Plan

None. Plan executed exactly as written — all files created with the exact code blocks, verification criteria met.

## Known Stubs

None.

## Threat Flags

None. No new surface beyond decorative marketing components.

## Follow-ups (for Plan 05 orchestration)

- Wire all 5 components into `app/page.tsx` in order: Hero → StatsBar → TargetGrid → HowItWorksTimeline → ValueProps → ... (Hero from Plan 01-02, Footer from Plan 01-04).
- Nav anchors from Plan 01-02 should target `#pour-qui` and `#comment-ca-marche`.
- Scroll fade-up animation (if added) goes at the page level per CONTEXT.md animation decision.

## Self-Check: PASSED

- FOUND: components/landing/StatsBar.tsx
- FOUND: components/landing/TargetGrid.tsx
- FOUND: components/landing/HowItWorksTimeline.tsx
- FOUND: components/landing/ScorePill.tsx
- FOUND: components/landing/ValueProps.tsx
- FOUND: commit 116d331
- FOUND: commit 5a82a63
- FOUND: commit 7be274c
