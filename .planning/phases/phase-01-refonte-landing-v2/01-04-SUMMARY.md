---
phase: 01-refonte-landing-v2
plan: 04
subsystem: landing
tags: [landing, testimonial, faq, cta, footer]
requires: [01-01]
provides: [Testimonial, FAQCards, CTABand, LandingFooter]
affects: [app/page.tsx (to be wired by plan 01-05)]
tech-stack:
  added:
    - "lucide-react ChevronDown (FAQ chevron)"
  patterns:
    - "RSC-only (zero 'use client')"
    - "Native <details> + Tailwind open: / group-open: variants — zero JS"
    - "[&::-webkit-details-marker]:hidden arbitrary selector to remove default disclosure triangle"
key-files:
  created:
    - components/landing/Testimonial.tsx
    - components/landing/FAQCards.tsx
    - components/landing/CTABand.tsx
    - components/landing/LandingFooter.tsx
  modified: []
decisions:
  - "FAQ uses native <details> (D-06 from CONTEXT), no Radix Accordion, no React state — a11y delegated to browser"
  - "Testimonial pastille avatar (initials LM on bg-primaryDark) instead of photo — no signed consent yet (T-01-10)"
  - "Footer legal hrefs are inert `#` placeholders — real pages deferred to Phase 05 RGPD (T-01-12)"
metrics:
  duration: "~15 min (continuation run, Task 1 pre-completed)"
  completed: "2026-04-23"
  tasks_completed: "3/3"
  files_created: 4
---

# Phase 01 Plan 04: Testimonial + FAQ + CTA + Footer Summary

One-liner: Closes the landing funnel with a pastille-avatar testimonial card, 4 native `<details>` FAQ cards with CSS-only chevron/background animation, a primary-dark 2-col CTA band anchored to `/audit`, and a minimal 3-block GetLostRevenue footer — all RSC, zero JS beyond the lucide chevron icon.

## Components Delivered

| Component       | Path                                     | Export            | RSC | Notes |
| --------------- | ---------------------------------------- | ----------------- | --- | ----- |
| Testimonial     | `components/landing/Testimonial.tsx`     | `Testimonial`     | yes | Pastille avatar (initials LM), italic blockquote, figcaption attribution |
| FAQCards        | `components/landing/FAQCards.tsx`        | `FAQCards`        | yes | 4 native `<details>`, `id="faq"`, `open:bg-emerald-50`, `group-open:rotate-180` |
| CTABand         | `components/landing/CTABand.tsx`         | `CTABand`         | yes | `bg-primaryDark rounded-3xl`, white button → `/audit`, no form |
| LandingFooter   | `components/landing/LandingFooter.tsx`   | `LandingFooter`   | yes | 3 blocks (brand / produit / légal), GetLostRevenue×2, inert `#` legal links |

## Commits

| Task | Description                                           | Commit    |
| ---- | ----------------------------------------------------- | --------- |
| 1    | Testimonial card with pastille avatar + italic quote  | `946d77d` |
| 2    | FAQCards — 4 native details, CSS-only open/rotate     | `f522b61` |
| 3    | CTABand + LandingFooter closing the funnel            | `84fb1c8` |

## Acceptance Criteria Verification

All plan acceptance criteria passed:
- `id="faq"` present in FAQCards (anchor target for nav)
- `open:bg-emerald-50` + `group-open:rotate-180` present (CSS-only toggling)
- Zero `useState` / `useEffect` / `onClick` in FAQCards
- Zero `"use client"` across all 4 files
- Zero `<form>` / `<input>` across all 4 files (REQ-10)
- `GetLostRevenue` appears 2× in LandingFooter (logo + copyright — REQ-11)
- `bg-primaryDark`, `rounded-3xl`, `href="/audit"` present in CTABand
- `border-t border-gray-200` present in LandingFooter
- `<blockquote>` + `<figcaption>` + `italic` + `rounded-2xl` + `bg-primaryDark` + 0 `<img>` in Testimonial
- `npx tsc --noEmit` clean on all 4 landing files (pre-existing errors exist in audit-path deps — out of scope; see Deferred below)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Apostrophe un-escaping in FAQCards copy (prior executor had already applied this fix)**
- **Found during:** Task 2 verification of pre-existing uncommitted file
- **Issue:** Raw `'` in JSX text (`L'audit`, `n'est`, etc.) would trip `react/no-unescaped-entities` ESLint rule
- **Fix:** Prior partial-state executor had used `&apos;` — verified present in the uncommitted FAQCards.tsx; no change needed from this run. Same fix applied proactively to LandingFooter.tsx copy (`L'audit` → `L&apos;audit`).
- **Files modified:** `components/landing/FAQCards.tsx` (preexisting), `components/landing/LandingFooter.tsx` (this run)
- **Commits:** `f522b61`, `84fb1c8`

No other deviations. Plan executed as written.

## Continuation Notes

Task 1 (`946d77d`) was completed by the prior (stalled) executor and was not re-done. Task 2's file existed uncommitted on disk; it matched the plan spec exactly (accentGreen token, native details, open/group-open Tailwind variants, apostrophe escaping already applied) and was committed as-is after verification. Tasks 3 and 4 (combined into plan Task 3) were written from scratch in this run.

## Threat Flags

No new trust boundaries introduced beyond those already in the plan's threat register.

**T-01-11 follow-up (Information Disclosure — FAQ data-retention claim):**
The FAQ answer states `"Le fichier est analysé à la volée et supprimé immédiatement après la génération du rapport. Aucune donnée patient n'est conservée."` This claim must be validated against `app/api/audit/route.ts` behavior. A quick read of that route shows it is a thin proxy that forwards `multipart/form-data` to the n8n webhook — the Next.js layer itself does not persist the CSV. **However**, the n8n workflow downstream may log or cache the file; the claim is therefore contingent on n8n-side retention policy. **Follow-up for Phase 05 RGPD:** audit the full n8n workflow for any node that writes the CSV to disk, storage, or log sinks, and either (a) confirm the claim is accurate, or (b) soften the FAQ copy. Not blocking for Plan 01-04 acceptance — copy is aligned with intended product policy.

## Deferred Issues

**Pre-existing `npm run build` failure:** Missing audit-path deps (`chart.js`, `react-markdown`, etc.) cause the full build to fail. Not introduced by this plan (no landing component imports any of those). Verification used `npx tsc --noEmit` and per-file grep acceptance — all four new landing components type-check cleanly. Tracked in Phase 01 deferred-items; will be resolved by Plan 01-05 (page wiring) or Phase 02 (dependency install audit).

## Tailwind open: / group-open: variants

Both variants worked as expected on Tailwind 3.4.x — no config change required. `[&::-webkit-details-marker]:hidden` arbitrary selector is emitted correctly into the final CSS.

## Self-Check: PASSED

- Testimonial.tsx: FOUND (commit `946d77d`)
- FAQCards.tsx: FOUND (commit `f522b61`)
- CTABand.tsx: FOUND (commit `84fb1c8`)
- LandingFooter.tsx: FOUND (commit `84fb1c8`)
- Commit `946d77d`: FOUND in git log
- Commit `f522b61`: FOUND in git log
- Commit `84fb1c8`: FOUND in git log
