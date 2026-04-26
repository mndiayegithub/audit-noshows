---
phase: 09-monitoring-analytics
plan: 03
subsystem: analytics-wiring
tags: [analytics, vercel, instrumentation, funnel, R2, R3]
requires: [09-01, 09-02]
provides: [11-events-instrumented]
affects: [app/page.tsx, app/audit/page.tsx, hooks/useCSVPreview.ts, components/landing/*, components/audit/*]
key_files_created:
  - components/landing/LandingViewTracker.tsx
key_files_modified:
  - app/page.tsx
  - app/audit/page.tsx
  - components/landing/LandingHero.tsx
  - components/landing/LandingNav.tsx
  - components/landing/CTABand.tsx
  - components/landing/LandingFooter.tsx
  - hooks/useCSVPreview.ts
  - components/audit/CSVErrorCard.tsx
  - components/audit/CTACalendly.tsx
  - components/audit/CalendlyEmbed.tsx
  - components/audit/DiagnosticGoogle.tsx
decisions:
  - "RSC landing wraps client tracker — LandingViewTracker.tsx posted before <LandingNav />"
  - "CTABand.tsx + LandingFooter.tsx converted RSC → client (small files, no server-only deps)"
  - "trackPdfDownloaded emitted ONCE in app/audit/page.tsx::handleDownloadPDF (single source) — AuditDashboard.tsx delegates via prop, no duplication"
  - "trackCsvRejected guarded by KNOWN_ERROR_CODES Set to honor strict AuditErrorCode signature when server returns ad-hoc strings"
  - "trackCsvPreviewLoaded uses CSVPreviewSuccess.nbRdvValides + recoRate (camelCase, not nb_rdv/reco_rate as in plan draft)"
  - "All Calendly CTAs in /audit results map to location='audit-results' — 'hero'/'footer' enum kept reserved for landing Calendly buttons (none exist today)"
  - "audit_failed has 5 distinct call-sites covering: 4xx with code, 4xx no code, success=false with code, success=false no code, catch CLIENT_EXCEPTION"
metrics:
  duration_minutes: ~28
  completed_at: "2026-04-26T15:14:00Z"
  tasks_completed: 5
  files_modified: 12
  files_created: 1
  commits: 4
---

# Phase 9 Plan 03: Wire 11 Analytics Events to Funnel Call-Sites — Summary

11 analytics events instrumented across the funnel commercial v2 (`landing → upload → audit → CTA Calendly → PDF`) via the typed `lib/analytics.ts` helper layer. Zero direct `@vercel/analytics` imports outside `lib/analytics.ts` (D-03 PII guardrail held). 98/98 vitest tests still green, build + lint exit 0.

## Events Wired (R2 — 11/11)

| # | Event | Helper | Call-Site | Properties |
|---|-------|--------|-----------|------------|
| 1 | `landing_view` | `trackLandingView` | `components/landing/LandingViewTracker.tsx:13` | `{ referrer? }` (document.referrer if non-empty) |
| 2 | `landing_cta_audit_click` | `trackLandingCtaAuditClick` | `components/landing/LandingHero.tsx:53`, `LandingNav.tsx:53`, `CTABand.tsx:23`, `LandingFooter.tsx:38` | none |
| 3 | `audit_view` | `trackAuditView` | `app/audit/page.tsx:60` (useEffect mount) | none |
| 4 | `csv_preview_loaded` | `trackCsvPreviewLoaded` | `hooks/useCSVPreview.ts:49` | `{ nb_rdv, reco_rate }` from `CSVPreviewSuccess.nbRdvValides`/`recoRate` |
| 5 | `csv_rejected` | `trackCsvRejected` | `components/audit/CSVErrorCard.tsx:41` (useEffect on mount, deps error_code) | `{ error_code: AuditErrorCode }` |
| 6 | `audit_submitted` | `trackAuditSubmitted` | `app/audit/page.tsx:100` (before fetch) | `{ degraded: boolean }` (degradedConfirmed flag) |
| 7 | `audit_success` | `trackAuditSuccess` | `app/audit/page.tsx:151` | `{ score, taux_noshow }` (score = `100 - taux*3.2`, clamped 0..100) |
| 8 | `audit_failed` | `trackAuditFailed` | `app/audit/page.tsx:119, 128, 133, 142, 158` (5 branches) | `{ error_code: string }` — server code OR HTTP status OR `UNKNOWN_FAILURE` OR `CLIENT_EXCEPTION` |
| 9 | `cta_calendly_click` | `trackCtaCalendlyClick` | `components/audit/CTACalendly.tsx:66`, `CalendlyEmbed.tsx:43,51` | `{ location: "audit-results" }` |
| 10 | `google_diagnostic_triggered` | `trackGoogleDiagnosticTriggered` | `components/audit/DiagnosticGoogle.tsx:68` (in `handleSearch`, after empty-input guard) | none |
| 11 | `pdf_downloaded` | `trackPdfDownloaded` | `app/audit/page.tsx:178` (start of `handleDownloadPDF`) | none |

## Verification Results (Task 5)

### D-03 — Direct `@vercel/analytics` import barrier
```bash
$ grep -rE 'from "@vercel/analytics"' app/ components/ hooks/ | grep -v lib/analytics.ts
(zero matches)
```
PASS — only `lib/analytics.ts` imports `@vercel/analytics`.

### R3 / AC-3 — PII-free properties
```bash
$ grep -rE 'track[A-Z][A-Za-z]+\([^)]*\b(email|nomCabinet|cabinet|patient)\b' app/ components/ hooks/
(zero matches)
```
PASS — no PII passed to any helper.

### R2 — 11 helpers ≥ 1 call-site each

| Helper | Call-sites |
|--------|------------|
| trackLandingView | 1 |
| trackLandingCtaAuditClick | 4 |
| trackAuditView | 1 |
| trackCsvPreviewLoaded | 1 |
| trackCsvRejected | 1 |
| trackAuditSubmitted | 1 |
| trackAuditSuccess | 1 |
| trackAuditFailed | 5 |
| trackCtaCalendlyClick | 3 |
| trackGoogleDiagnosticTriggered | 1 |
| trackPdfDownloaded | 1 |
| **Total** | **20 invocations** |

### AC-5 — Build + Lint + Tests
- `npm run build` — exit 0 (Next 14 route table preserved, /audit static 95.8 kB / 242 kB First Load JS — same as 09-01 baseline)
- `npm run lint` — exit 0 (only 2 pre-existing `<img>` warnings in `components/ui/{faq-section,testimonial-cards}.tsx` — out of scope per CLAUDE.md scope boundary)
- `npm test` — 98/98 vitest passed in 20.19s (10 test files; 19 analytics tests from 09-02 + 79 prior tests)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Wrong field names in plan draft for csv_preview_loaded**
- **Found during:** Task 3
- **Issue:** Plan referenced `result.nb_rdv` / `result.reco_rate`, but `CSVPreviewResult` shape is `{ ok: true, preview: { nbRdvValides, recoRate, ... } }` (camelCase, nested under `preview`)
- **Fix:** Used `r.preview.nbRdvValides` + `r.preview.recoRate` with NaN guards (fail-soft per D-04)
- **Files modified:** `hooks/useCSVPreview.ts`
- **Commit:** `aa47c40`

**2. [Rule 2 - Critical] AuditErrorCode strict-signature gate for trackCsvRejected**
- **Found during:** Task 3
- **Issue:** `CSVErrorCardProps.error.error_code` is typed `AuditErrorCode | string` (server may return ad-hoc codes). `trackCsvRejected(errorCode: AuditErrorCode)` only accepts the strict union. Without a guard, TS would refuse the cast or runtime would emit ungrouped events.
- **Fix:** Added `KNOWN_ERROR_CODES` Set; only emit when code is in the union (else skip — keeps strict typing intact, matches D-03 spirit)
- **Files modified:** `components/audit/CSVErrorCard.tsx`
- **Commit:** `aa47c40`

**3. [Rule 3 - Blocking] CTABand.tsx + LandingFooter.tsx were RSC**
- **Found during:** Task 1
- **Issue:** Both files were Server Components (no `"use client"` directive). Adding `onClick={() => trackLandingCtaAuditClick()}` would have failed Next 14 compilation (event handlers forbidden in RSC).
- **Fix:** Converted both to client components by prepending `"use client";` directive. Files are small, have no server-only data fetches → safe conversion (per plan's option A)
- **Files modified:** `components/landing/CTABand.tsx`, `components/landing/LandingFooter.tsx`
- **Commit:** `879a89c`

### Decisions Documented in Plan

- `pdf_downloaded` emitted only from `app/audit/page.tsx::handleDownloadPDF` (Task 2), NOT duplicated in `AuditDashboard.tsx` — explicit single-source-of-truth decision per plan Task 4. AuditDashboard delegates to `onDownloadPDF` prop which is `handleDownloadPDF` in parent, so the event fires once per click regardless of which button (sticky-bar PDF or CalendlyEmbed PDF) is pressed.
- Calendly enum `'hero'` and `'footer'` left unused — no Calendly CTA exists in landing today (only on /audit). Enum kept strict to avoid drift.

## Authentication Gates
None — wiring is pure-frontend, no external services touched at execution time.

## Threat Flags
None — no new network endpoints, auth paths, file access, or schema changes introduced.

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | `879a89c` | feat(09-03): wire landing_view + landing_cta_audit_click events |
| 2 | `ab32907` | feat(09-03): wire audit_view, audit_submitted, audit_success, audit_failed, pdf_downloaded |
| 3 | `aa47c40` | feat(09-03): wire csv_preview_loaded + csv_rejected events |
| 4 | `a2e834b` | feat(09-03): wire cta_calendly_click + google_diagnostic_triggered events |

## Self-Check: PASSED

- [x] `components/landing/LandingViewTracker.tsx` exists
- [x] `app/page.tsx` imports + uses LandingViewTracker
- [x] 4 landing CTAs wire trackLandingCtaAuditClick (Hero, Nav, CTABand, Footer)
- [x] `app/audit/page.tsx` wires audit_view (useEffect), audit_submitted, audit_success, audit_failed (×5), pdf_downloaded
- [x] `hooks/useCSVPreview.ts` wires trackCsvPreviewLoaded with NaN guard
- [x] `components/audit/CSVErrorCard.tsx` wires trackCsvRejected (useEffect mount)
- [x] `components/audit/CTACalendly.tsx` + `CalendlyEmbed.tsx` wire trackCtaCalendlyClick("audit-results")
- [x] `components/audit/DiagnosticGoogle.tsx` wires trackGoogleDiagnosticTriggered in handleSearch
- [x] Zero `@vercel/analytics` direct imports outside `lib/analytics.ts`
- [x] Zero PII in any track*() argument
- [x] `npm run build` exit 0
- [x] `npm run lint` exit 0 (only 2 pre-existing img warnings, out of scope)
- [x] `npm test` 98/98 passed
- [x] All 4 commits exist in git log: 879a89c, ab32907, aa47c40, a2e834b
