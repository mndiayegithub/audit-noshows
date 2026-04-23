---
phase: 01-refonte-landing-v2
plan: 05
subsystem: landing
tags: [landing, orchestration, build, lighthouse]
requires:
  - components/landing/LandingNav.tsx
  - components/landing/LandingHero.tsx
  - components/landing/StatsBar.tsx
  - components/landing/TargetGrid.tsx
  - components/landing/HowItWorksTimeline.tsx
  - components/landing/ValueProps.tsx
  - components/landing/Testimonial.tsx
  - components/landing/FAQCards.tsx
  - components/landing/CTABand.tsx
  - components/landing/LandingFooter.tsx
provides:
  - RSC landing page at "/" composing 10 landing components
  - Client-side IntersectionObserver fade-up wrapper for 7 sections
  - Build-green, anchor-stable, CTA-unique landing per REQ-01/10/12/13/14
affects:
  - app/page.tsx
  - components/landing/ScrollFadeUp.tsx
tech_stack:
  added: [IntersectionObserver API]
  patterns: [RSC orchestrator, client-wrapped sections, CSS-transition fade-up]
key_files:
  created:
    - components/landing/ScrollFadeUp.tsx
    - .planning/phases/phase-01-refonte-landing-v2/01-05-LIGHTHOUSE.md
  modified:
    - app/page.tsx
decisions:
  - "Wrapped 7 sections (all but LandingNav/LandingHero) in ScrollFadeUp — matches plan intent (5) plus Testimonial/FAQ/CTA for visual consistency"
  - "Scaffolded npm install during execution (Rule 3) — deps react-markdown/remark-gfm/chart.js/react-chartjs-2 were in package.json but missing from node_modules, blocking `npm run build`"
  - "Lighthouse CLI fallback-deferred to Plan 06 UAT — WSL2 executor has no Chrome binary; documented with remediation plan rather than silently passing"
metrics:
  duration_minutes: 9
  tasks_completed: 3
  files_touched: 2
  completed_date: 2026-04-23
---

# Phase 01 Plan 05: Landing Orchestration Summary

RSC orchestrator wires all 10 landing components through 7 ScrollFadeUp wrappers with native IntersectionObserver — build green, 136 kB first-load, zero legacy tokens.

## What Was Built

**`components/landing/ScrollFadeUp.tsx`** — 45-line client component. `useRef` + `useEffect` attach a single `IntersectionObserver` with `threshold: 0.15` and `unobserve` after the first intersection (fade-once). Transitions `opacity` and `translateY` over 400 ms ease-out. Respects `prefers-reduced-motion` via the `motion-safe-translate` utility already defined in `app/globals.css` (Plan 01). SSR/no-IO fallback shows content immediately.

**`app/page.tsx`** — completely rewritten from 891 lines to **55 lines**. Pure RSC (no `"use client"`), thin orchestrator importing all 10 landing components via `@/*` alias. Hero renders first without fade wrapper (hero has its own framer-motion entrance per D-01). All other sections wrapped in `<ScrollFadeUp>`.

## Commits

| Task | Hash      | Message                                         |
| ---- | --------- | ----------------------------------------------- |
| 1    | `4c97486` | feat(01-05): add ScrollFadeUp IntersectionObserver wrapper |
| 2    | `0181e2f` | feat(01-05): rewrite app/page.tsx as thin RSC orchestrator |
| 3    | `984965e` | docs(01-05): capture build + Lighthouse report  |

## Plan Output Questions Answered

- **Exact `app/page.tsx` line count:** **55 lines** (well under the 80-line cap, D-05).
- **Exact Lighthouse scores:** ⏸ **deferred** — Chrome/Chromium not present in this WSL2 executor sandbox; CLI Lighthouse returned "Unable to connect to Chrome". Documented remediation in `01-05-LIGHTHOUSE.md`: human operator runs Chrome DevTools Lighthouse in Plan 06 UAT.
- **Responsive observations:** SSR HTML has **zero** `overflow-x-auto` / `overflow-x-scroll` matches. Live-browser device-toolbar verification (375 / 768 / 1440) deferred to Plan 06 UAT.
- **Alias used:** `@/*` (confirmed in `tsconfig.json`, `paths: { "@/*": ["./*"] }`). No relative-import fallback required.

## Verification Evidence

| Check                                               | Result |
| --------------------------------------------------- | ------ |
| `npm run build` → "Compiled successfully"           | ✅     |
| Landing bundle: 2.12 kB / 136 kB First Load JS       | ✅     |
| `wc -l app/page.tsx` = 55 (< 80 cap)                 | ✅     |
| `grep '"use client"' app/page.tsx` = 0 (RSC)         | ✅     |
| All 10 component names referenced ≥ 1× each          | ✅ (21 matches) |
| `ScrollFadeUp` used 7×                               | ✅ (15 grep matches incl. import + close tags) |
| No `<form>` / no `newsletter` / no `type="email"`   | ✅     |
| Anchors `pour-qui` / `comment-ca-marche` / `faq` in SSR | ✅ (5 / 6 / 5 occurrences) |
| `href="/audit"` in SSR                               | ✅ (4 occurrences) |
| Legacy tokens (bg-ink, indigo, mesh-bg, Plus Jakarta, blob/float) in SSR | ✅ 0 matches |
| Brand token `#064E3B` present                        | ✅     |
| `npx tsc --noEmit` on ScrollFadeUp (isolated)        | ✅     |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 — Blocking] Ran `npm install` before `npm run build`**
- **Found during:** Task 2 verification
- **Issue:** `npm run build` failed with "Module not found: react-markdown / remark-gfm / react-chartjs-2 / chart.js". These are declared in `package.json` dependencies but were missing from `node_modules` — a pre-existing environment drift (likely a fresh clone or a `node_modules` wipe). REQ-13 ("build exits 0") was unreachable otherwise.
- **Fix:** Ran `npm install` (no lockfile or package.json changes produced — `git status --short` confirmed zero modifications outside `app/page.tsx`).
- **Files modified:** none (install only; no source changes)
- **Commit:** not a separate commit — unblocked Task 2 verification which was folded into `0181e2f`.
- **Scope justification:** these deps are used by the audit-path (`app/audit/page.tsx`, `components/Graphique*.tsx`) — not by the landing — but the build compiles the whole app as one webpack graph, so the landing build requires them to resolve. Installing is NOT a source change; no architectural decision.

**2. [Rule 3 — Environmental fallback] Started production server on port 3100 instead of 3000**
- **Found during:** Task 3
- **Issue:** Port 3000 was already bound by a long-running `next-server` (likely the user's dev server, 4h uptime). Starting our verification server on 3000 would have (a) failed with EADDRINUSE or (b) required killing the user's process. Neither is acceptable.
- **Fix:** Started `npm run start` with `PORT=3100`. All verification (curl fetch, anchor scan, overflow scan) performed against `http://localhost:3100/`. Stopped cleanly before commit.
- **Impact:** none — functionally equivalent; documented in `01-05-LIGHTHOUSE.md`.

### Deferred to Plan 06 UAT

**1. Lighthouse desktop scores (Perf / A11y / BP / SEO)**
- **Reason:** WSL2 executor sandbox has no Chrome/Chromium binary; `npx lighthouse … --chrome-flags="--headless=new"` returned "Unable to connect to Chrome".
- **Remediation recorded in `01-05-LIGHTHOUSE.md` §2:** human operator runs Chrome DevTools → Lighthouse tab on `http://localhost:3000/` (or `:3100/`) in Plan 06 UAT and records 4 scores in the UAT report. Bundle metrics (136 kB FLJ, static prerender, zero blocking third-party) give high confidence the ≥ 90 × 4 gate will be met — but it is **NOT silently passed**.

**2. Live-browser responsive check at 375 / 768 / 1440**
- **Reason:** same (no GUI browser in WSL2 executor).
- **Proxy evidence collected:** `grep "overflow-x-*" rendered.html` → 0 matches. SSR structure contains no fixed-width `width:` inline styles or `min-w-` classes that would exceed viewport.

## Authentication Gates

None.

## Requirements Satisfied

- **REQ-01** — landing `app/page.tsx` entirely rewritten from 891 lines → 55 lines; zero legacy imports. ✅
- **REQ-10** — zero `<form>`, zero `<input type="email">`, zero newsletter paths; all 4 CTAs point to `/audit`. ✅
- **REQ-12** — SSR overflow scan clean; live-browser verification handed to Plan 06. ⏸ (partial — deferred half)
- **REQ-13** — `npm run build` exits 0 with "Compiled successfully". ✅
- **REQ-14** — Lighthouse scores captured handed to Plan 06 UAT (CLI unavailable in WSL2). ⏸ (deferred)

## Known Stubs

None. All rendered sections source data from their respective component (no empty arrays flowing to UI).

## Threat Flags

None new. Threat register T-01-14 (path alias) mitigated: `@/*` alias verified present in `tsconfig.json` before use.

## Files Changed

**Created (2):**
- `components/landing/ScrollFadeUp.tsx` (45 lines)
- `.planning/phases/phase-01-refonte-landing-v2/01-05-LIGHTHOUSE.md` (report)

**Modified (1):**
- `app/page.tsx` (891 → 55 lines, `-888/+52` diff)

## Self-Check: PASSED

- ✅ `components/landing/ScrollFadeUp.tsx` exists
- ✅ `app/page.tsx` exists at 55 lines
- ✅ `.planning/phases/phase-01-refonte-landing-v2/01-05-LIGHTHOUSE.md` exists
- ✅ Commit `4c97486` in `git log`
- ✅ Commit `0181e2f` in `git log`
- ✅ Commit `984965e` in `git log`
