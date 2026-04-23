---
phase: 01-refonte-landing-v2
plan: 02
subsystem: landing
tags: [landing, nav, hero, framer-motion, kpi-pastels]
requires:
  - 01-01 (tailwind tokens: primaryDark, kpi* pastels, shadow-cta, font-serif Fraunces)
provides:
  - components/landing/LandingNav (default export, client)
  - components/landing/LandingHero (default export, client)
  - components/landing/MiniDashboard (default export, RSC)
affects:
  - "components/landing/ tree created (previously absent)"
tech-stack:
  added: []
  patterns:
    - framer-motion Variants typed (v12 strict Easing)
    - RSC-first (MiniDashboard), client boundary only where scroll listener or motion is required
key-files:
  created:
    - components/landing/MiniDashboard.tsx
    - components/landing/LandingNav.tsx
    - components/landing/LandingHero.tsx
  modified: []
decisions:
  - "MiniDashboard is RSC — no 'use client' since it holds no state or effects"
  - "LandingNav scroll threshold fixed at 8px (plan spec) — hysteresis unnecessary given single transition"
  - "LandingHero fadeUp/container typed as Variants to satisfy framer-motion v12 Easing (required since framer-motion ^12.34.3)"
  - "Interrogative H1 uses &nbsp;? for French narrow-no-break-space typography (SPEC tone, D-04 copy)"
metrics:
  duration: ~5 min
  tasks_completed: 3
  files_created: 3
  commits: 3
  completed: 2026-04-23
---

# Phase 01 Plan 02: landing-nav-hero Summary

Three landing components delivered under `components/landing/`: sticky nav, split-2-col hero with framer-motion mount, and a pure-DOM MiniDashboard mockup showcasing the signature 4-pastel KPI sémantique.

## Files

| Path | Export | Boundary |
|------|--------|----------|
| `components/landing/MiniDashboard.tsx` | `default MiniDashboard` | RSC |
| `components/landing/LandingNav.tsx`    | `default LandingNav`    | Client (scroll listener) |
| `components/landing/LandingHero.tsx`   | `default LandingHero`   | Client (framer-motion) |

## Commits

- `55486fa` — feat(01-02): add MiniDashboard landing mockup with 4 KPI pastels
- `4d3a86b` — feat(01-02): add sticky LandingNav with scroll-shadow behaviour
- `1aa5caf` — feat(01-02): add LandingHero split 2-col with framer-motion mount

## KPI Sémantique (MiniDashboard — locked)

| Card | Token | Pastel | Label | Value (sample) |
|------|-------|--------|-------|----------------|
| Volume | `bg-kpiVolume` / `text-kpiVolume-fg` | #DFF3FF / #2563EB | RDV analysés | 2 148 |
| Signal | `bg-kpiSignal` / `text-kpiSignal-fg` | #DCF4E6 / #059669 | No-shows | 164 |
| Taux   | `bg-kpiTaux`   / `text-kpiTaux-fg`   | #FCEACC / #EA580C | Taux | 7,6 % |
| Argent | `bg-kpiArgent` / `text-kpiArgent-deep` | #ECCDF8 / #6B21A8 | CA perdu / an | 27 k€ |

CA perdu deliberately uses `text-kpiArgent-deep` per SKILL rule on XXL monetary values.

## Framer Motion — Variants & Timing (LandingHero)

```ts
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};
const container: Variants = {
  show: { transition: { staggerChildren: 0.08 } },
};
```

- Duration: **0.4s** (D-04)
- Easing: **easeOut** (no spring / bounce, D-01)
- Stagger: **0.08s** children (badge → H1 → subtitle → CTAs → MiniDashboard = 5 steps ≈ 320 ms cascade)
- Scope: mount only — no scroll-triggered animations (D-01)

## Nav Behaviour

- Height: `h-[72px]` (fixed)
- Background: `bg-white/90` with backdrop-blur when supported
- Scroll state: `scrolled = scrollY > 8` → toggles `shadow-sm border-b border-gray-200`
- CTA: primary-dark → `/audit` (REQ-10)
- Anchor links: `#comment-ca-marche`, `#pour-qui`, `#faq` — Plans 03 and 04 MUST set matching `id` attributes (threat T-01-06 mitigation carried forward)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Type] Framer Motion v12 Variants typing**
- **Found during:** Task 3 verification (`npx tsc --noEmit`)
- **Issue:** `framer-motion` v12 tightened `Transition.ease` to a `Easing` union. Assigning `ease: "easeOut"` as a plain string literal inside a plain object caused `TS2322` on every `variants={...}` prop.
- **Fix:** Imported `type Variants` and annotated `fadeUp: Variants` and `container: Variants`. This narrows the object literal to the expected type and preserves the plan's exact timing values.
- **Files modified:** `components/landing/LandingHero.tsx`
- **Commit:** `1aa5caf`

### Sketch C deviations

None — markup for nav, hero, and MiniDashboard matches sketch 001 variant C structurally. Responsive tweaks (`md:py-24`, `md:pl-4`, `md:items-center`) are the sketch-indicated breakpoints, applied as-is.

## Acceptance Criteria Result

All `npx tsc --noEmit` checks on the three new files: **pass** (no `components/landing/*` errors). Pre-existing errors in `app/audit/page.tsx`, `components/GaugeBenchmark.tsx`, `components/GraphiqueParJour.tsx` are missing-deps warnings tracked in `deferred-items.md` and out-of-scope for Wave 2.

One acceptance-criterion pattern was slightly narrower than the plan copy (interrogative regex expected `?` within 5 chars of "vraiment", but the H1 reads `…vraiment à votre cabinet&nbsp;?`). The intent — "H1 is interrogative" — is satisfied: the sentence ends with `cabinet&nbsp;?` (confirmed via `grep -cE 'cabinet&nbsp;\\?' ` → 1). Plan copy preserved verbatim.

## Follow-ups for Downstream Plans

- **Plan 03 (HowItWorks):** section must carry `id="comment-ca-marche"`
- **Plan 04 (PourQui / FAQ):** sections must carry `id="pour-qui"` and `id="faq"` respectively
- **Plan 05 (orchestrator):** wire `<LandingNav /> + <LandingHero />` at top of `app/page.tsx`; ensure they sit above any future sections and use only one `h1`.

## Self-Check: PASSED

- [x] `components/landing/MiniDashboard.tsx` — FOUND
- [x] `components/landing/LandingNav.tsx` — FOUND
- [x] `components/landing/LandingHero.tsx` — FOUND
- [x] Commit `55486fa` — FOUND
- [x] Commit `4d3a86b` — FOUND
- [x] Commit `1aa5caf` — FOUND
- [x] `npx tsc --noEmit` — no landing errors
- [x] framer-motion scope limited to `LandingHero.tsx` (D-01)
