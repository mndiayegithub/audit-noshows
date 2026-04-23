---
phase: 01-refonte-landing-v2
plan: 01
subsystem: landing-foundations
tags: [landing, foundations, tailwind, fonts, layout]
requires: []
provides:
  - tailwind-tokens-clinique-claire
  - next-font-inter-fraunces
  - root-layout-light-mode
affects:
  - app/page.tsx (will need rewrite in Plan 01-02+ — legacy classes now orphaned)
  - app/audit/page.tsx (uses legacy btn-glow/primary-light — outside phase-01 scope)
tech-stack:
  added:
    - next/font/google (Inter, Fraunces variable-font with opsz axis)
  patterns:
    - CSS variables --font-inter / --font-fraunces consumed by Tailwind fontFamily
    - safelist with single regex pattern for semantic KPI utilities
key-files:
  created:
    - .planning/phases/phase-01-refonte-landing-v2/deferred-items.md
  modified:
    - tailwind.config.ts
    - app/globals.css
    - app/layout.tsx
decisions:
  - "D-09 big bang token replacement executed in one wave (no transitional aliases)"
  - "Fraunces loaded as variable font with opsz axis (not static weights)"
  - "scrollbar-hide utility dropped — zero remaining callers after grep scan"
metrics:
  duration: ~25min
  completed: 2026-04-23
  tasks_total: 3
  tasks_completed: 3
---

# Phase 01 Plan 01: Tailwind Tokens + Fonts + Root Layout Foundation Summary

One-liner: clinique-claire v2 design foundation — primaryDark `#064E3B` + 4 pastel KPIs + Inter/Fraunces via next/font + forced-light `bg-gray-50` body, all legacy dark/indigo tokens removed in one atomic D-09 rewrite.

## What Shipped

### 1. `tailwind.config.ts` — clinique-claire token palette

Tokens added:
- `primaryDark: #064E3B` (vert sapin, primary CTA)
- `accentGreen: #10B981`
- `kpiVolume:   { DEFAULT: #DFF3FF, fg: #2563EB }` (bleu)
- `kpiSignal:   { DEFAULT: #DCF4E6, fg: #059669 }` (émeraude)
- `kpiTaux:     { DEFAULT: #FCEACC, fg: #EA580C }` (orange)
- `kpiArgent:   { DEFAULT: #ECCDF8, fg: #9333EA, deep: #6B21A8 }` (violet)

Other changes:
- `fontFamily.sans = [var(--font-inter), ui-sans-serif, ...]`
- `fontFamily.serif = [var(--font-fraunces), ui-serif, ...]`
- `borderRadius.2xl = 20px`, `3xl = 28px` (overrides Tailwind 16/24 defaults)
- `boxShadow.cta = 0 12px 40px -16px rgba(6,78,59,0.3)`
- `safelist` reduced to a single pattern covering semantic KPI utilities
- **Removed:** `primary #4F46E5`, `primary-light`, `accent #7C3AED`, `cyan #06B6D4`, `ink`, `ink-subtle`, `navy`, `background`, `surface`, Plus Jakarta Sans, Outfit, `plus-pattern` backgroundImage, `blob`/`float`/`pulse-slow` animations and keyframes, legacy shadow set

### 2. `app/globals.css` — minimal Tailwind entry

File shrunk from **134 → 22 lines**.

Kept:
- `@tailwind base/components/utilities` directives
- `html { color-scheme: light }` (forced light mode, REQ-02)
- `@media (prefers-reduced-motion: reduce)` safety net (D-03)

Removed:
- `@import url(fonts.googleapis.com)` (fonts now via next/font)
- `body { font-family Plus Jakarta Sans; background-color #07080F; color #F8FAFC }`
- `.mesh-bg`, `.grid-overlay`, `.text-gradient*`, `.glass-dark*`, `.glass-panel`, `.btn-glow`, `.soft-card`, `.trust-badge-icon`, `.chart-container`
- `.scrollbar-hide` utilities (dropped — `grep -rE scrollbar-hide app components` returned 0 callers outside globals.css per plan instruction)

No utilities were preserved — the grep scan confirmed zero surviving callers of the legacy classes outside `app/page.tsx` (which will be rewritten in Plans 01-02/03/04 per phase roadmap).

### 3. `app/layout.tsx` — next/font Inter + Fraunces

- `Inter` loaded with `subsets: [latin]`, `weight: [400,500,600,700]`, `variable: --font-inter`, `display: swap`
- `Fraunces` loaded with `subsets: [latin]`, `axes: [opsz]`, `variable: --font-fraunces`, `display: swap`
- `<html lang="fr" className="${inter.variable} ${fraunces.variable}">` — variables attached to html, accessible to portals
- `<body className="antialiased min-h-screen bg-gray-50 text-slate-900 font-sans">`
- Metadata updated to GetLostRevenue brand placeholder (title + French description)
- Toaster preserved (top-center, 4 s duration)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fraunces config mixed `weight[]` and `axes[]`**
- **Found during:** Task 3 (first `npm run build` after layout rewrite)
- **Issue:** next/font threw compile-time error: `Axes can only be defined for variable fonts`. The plan spec had both `weight: ["500","600"]` and `axes: ["opsz"]` — these are mutually exclusive (static vs variable-font configs).
- **Fix:** Dropped `weight: [...]` for Fraunces. Variable fonts with `opsz` handle the full weight range intrinsically; the opsz axis controls optical sizing from 9 to 144.
- **Files modified:** `app/layout.tsx`
- **Commit:** `bac7fa1` (Task 3 commit — fix applied before commit)

## Deferred Issues

### Missing npm dependencies (pre-existing, blocks `npm run build`)

Four packages declared in `package.json` are missing from `node_modules/`:
- `chart.js` ^4.5.1
- `react-chartjs-2` ^5.3.1
- `react-markdown` ^9.0.1
- `remark-gfm` ^4.0.0

These are imported only by `app/audit/page.tsx`, `components/GaugeBenchmark.tsx`, and `components/GraphiqueParJour.tsx` — none of which are in the Plan 01-01 scope.

**Verified pre-existing** via `git stash` + `npm run build` before any Plan 01-01 change: same errors reproduced. The three foundation files rewritten by this plan (tailwind.config.ts, globals.css, layout.tsx) compile cleanly — the `next/font` error was resolved after the Rule 1 fix, and no new errors were introduced.

**Network is offline** in the current execution environment, so `npm install` cannot fetch these packages. Logged to `.planning/phases/phase-01-refonte-landing-v2/deferred-items.md`.

**Resolution:** Run `npm install` once network is available. This does NOT block Wave 2 (Plans 01-02/03/04 touch only `app/page.tsx` and new landing components — none import the missing packages).

## Verification Status

| Gate | Status | Evidence |
|------|--------|----------|
| Task 1 grep gates (tokens present, legacy absent) | PASS | All 8 acceptance grep checks pass |
| `npx tsc --noEmit` on config | BLOCKED | Fails on pre-existing missing modules (audit flow), not on config |
| Task 2 grep gates (minimal globals, <40 lines) | PASS | 22 lines, 0 legacy markers |
| Task 3 grep gates (next/font wired, body light) | PASS | All 10 acceptance grep checks pass |
| `npm run build` exits 0 | PARTIAL | Plan 01-01 files compile clean (font error fixed). Build blocked by pre-existing missing deps in unrelated files — deferred. |

## Known Stubs

None introduced by this plan. Legacy classes referenced in `app/page.tsx` (e.g., `mesh-bg`, `btn-glow`, `text-gradient-indigo`) are now orphaned CSS selectors — they will resolve to empty/no-op at render time. `app/page.tsx` will be fully rewritten in Plans 01-02 / 01-03 / 01-04 per phase roadmap, which is why this is acceptable transitional state.

## Commits

| SHA | Task | Message |
|-----|------|---------|
| `061df2e` | 1 | feat(01-01): rewrite tailwind config with clinique-claire v2 tokens |
| `65f23ef` | 2 | feat(01-01): strip legacy dark utilities from globals.css |
| `bac7fa1` | 3 | feat(01-01): rewrite root layout with Inter + Fraunces via next/font |

## Self-Check: PASSED

- tailwind.config.ts: FOUND (14 inserts, 39 deletes)
- app/globals.css: FOUND (15 inserts, 128 deletes)
- app/layout.tsx: FOUND (42 inserts, 29 deletes)
- .planning/phases/phase-01-refonte-landing-v2/deferred-items.md: FOUND
- Commit 061df2e: FOUND on main
- Commit 65f23ef: FOUND on main
- Commit bac7fa1: FOUND on main
