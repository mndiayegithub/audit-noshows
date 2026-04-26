---
phase: 09-monitoring-analytics
plan: 02
subsystem: lib
tags: [analytics, typed-helpers, vitest, fail-soft, pii-safe]
dependency_graph:
  requires:
    - "@vercel/analytics (installed by Plan 09-01, wave 1 parallel)"
    - "types/audit-errors.ts → AuditErrorCode (existing, Phase 7)"
  provides:
    - "lib/analytics.ts → 11 typed track helpers (consumed by Plan 09-03 call-sites)"
  affects:
    - "Single import barrier for @vercel/analytics across the repo (D-03 — Plan 09-03 will lint-enforce)"
tech-stack:
  added: []
  patterns:
    - "TDD red→green (D-06)"
    - "Fail-soft wrapper around external SDK (try/catch silencieux)"
    - "PII safety by construction via TypeScript signatures (no free-form identity strings)"
key-files:
  created:
    - "lib/analytics.ts (76 lines, 11 named exports + safeTrack wrapper + CalendlyCtaLocation type)"
    - "lib/__tests__/analytics.test.ts (145 lines, 11 describe / 19 it, 2 fail-soft tests)"
  modified: []
decisions:
  - "Helpers without args call safeTrack(name) without explicit undefined — vitest matcher toHaveBeenCalledWith(name, undefined) accepts both forms"
  - "CalendlyCtaLocation exported as named type (re-usable from call-sites in 09-03)"
metrics:
  duration: "~5 min"
  completed: "2026-04-26T14:28Z"
---

# Phase 9 Plan 02: Typed Analytics Helpers Summary

11 typed `track*()` helpers wrapping `@vercel/analytics` with fail-soft try/catch and PII-safe TypeScript signatures, covered by 19 Vitest assertions (TDD red→green).

## What was built

### `lib/analytics.ts` — 11 named exports

| Helper | Event name | Properties signature |
|---|---|---|
| `trackLandingView(referrer?: string)` | `landing_view` | `{ referrer }` if provided, else none |
| `trackLandingCtaAuditClick()` | `landing_cta_audit_click` | none |
| `trackAuditView()` | `audit_view` | none |
| `trackCsvPreviewLoaded(nbRdv: number, recoRate: number)` | `csv_preview_loaded` | `{ nb_rdv, reco_rate }` |
| `trackCsvRejected(errorCode: AuditErrorCode)` | `csv_rejected` | `{ error_code }` |
| `trackAuditSubmitted(degraded: boolean)` | `audit_submitted` | `{ degraded }` |
| `trackAuditSuccess(score: number, tauxNoshow: number)` | `audit_success` | `{ score, taux_noshow }` |
| `trackAuditFailed(errorCode: string)` | `audit_failed` | `{ error_code }` |
| `trackCtaCalendlyClick(location: CalendlyCtaLocation)` | `cta_calendly_click` | `{ location }` |
| `trackGoogleDiagnosticTriggered()` | `google_diagnostic_triggered` | none |
| `trackPdfDownloaded()` | `pdf_downloaded` | none |

`CalendlyCtaLocation = "hero" | "footer" | "audit-results"` exported as named type.

### Fail-soft wrapper (D-04)

```ts
function safeTrack(name, properties?) {
  try { track(name, properties); }
  catch { /* silencieux */ }
}
```

All 11 helpers route through `safeTrack()` — analytics outage / adblock / network never blocks the commercial funnel (R4).

### PII safety (R3 / AC-3)

No helper signature accepts free-form identity strings (`email`, `nom_cabinet`, CSV content, patient names). Properties are typed primitives (`string | number | boolean | null`) with snake_case conventions verrouillées. Plan 09-03 will lint-enforce that no other file imports `@vercel/analytics` directly (D-03 import barrier).

## Tests (`lib/__tests__/analytics.test.ts`)

- **11 `describe()` blocks** — 1 per helper
- **19 `it()` assertions** — exact event name + properties shape per helper
- **2 fail-soft tests** — `trackAuditSuccess` and `trackPdfDownloaded` verified `not.toThrow()` when `track` throws via `mockImplementationOnce`
- Top-level `vi.mock("@vercel/analytics", () => ({ track: vi.fn() }))` + `mockReset` in `beforeEach`

### Vitest run output (final, GREEN)

```
 Test Files  1 passed (1)
      Tests  19 passed (19)
   Start at  16:27:22
   Duration  7.35s (transform 166ms, setup 0ms, import 332ms, tests 17ms, environment 0ms)
```

## Verification results

- [x] AC-3 (PII): Helpers accept only typed primitives + closed unions (`AuditErrorCode`, `CalendlyCtaLocation`). `grep` of helper signatures: zero free-form `email` / `nom_cabinet` / `cabinet` / `patient` parameters (only doc comment mentions for guard rationale).
- [x] AC-5: `npx vitest run lib/__tests__/analytics.test.ts` → **19/19 passed in 7.35s**. `npm run lint` → exit 0 (only pre-existing warnings on unrelated `components/ui/*` files).
- [x] R2: 11 helpers exported (`grep -cE '^export function track' lib/analytics.ts` → 11)
- [x] R3: PII statiquement bloquée par typage (no `string` libre dangereux dans les signatures)
- [x] R4: Fail-soft testé (2 tests `mockImplementationOnce` + `not.toThrow`)
- [x] Single `@vercel/analytics` import in `lib/analytics.ts` (1 line, will be enforced repo-wide by Plan 09-03)

## D-03 import barrier confirmation

`lib/analytics.ts` is the **only** file in the repo importing `@vercel/analytics`. Plan 09-03 will:
1. Wire all call-sites to import from `@/lib/analytics` only
2. Add a lint rule (or grep guard in CI) to block direct `@vercel/analytics` imports outside `lib/analytics.ts` and the test file

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] `@vercel/analytics` not yet installed when Task 1 ran**
- **Found during:** Task 1 (RED phase — Plan 09-01 running in parallel had not committed `package.json` yet)
- **Issue:** `npx vitest run` failed with module-not-found before being able to assert RED on missing `lib/analytics.ts`
- **Fix:** `npm install --no-save @vercel/analytics` (transient install in `node_modules` only, no `package.json` / `package-lock.json` mutation in scope of this plan — Plan 09-01 owns those files). Verified via `diff package.json package.json.bak` post-install.
- **Files modified:** none (transient `node_modules/` only — package.json restored from backup, package-lock.json restored from backup)
- **Commit:** none (no source changes, only ephemeral install)
- **Note:** By the time Task 2 GREEN ran, Plan 09-01 had already landed commit `9172c1d feat(09-01): install @vercel/analytics for web analytics tracking`, so the proper install is now in place.

## Commits

| Task | Phase | Commit | Description |
|------|-------|--------|-------------|
| 1 (RED) | TDD red | `b78e58b` | `test(09-02): add failing vitest suite for typed analytics helpers` |
| 2 (GREEN) | TDD green | `caf218d` | `feat(09-02): implement 11 typed analytics helpers with fail-soft wrapper` |

## TDD Gate Compliance

- [x] RED commit (`test(09-02): ...` `b78e58b`) precedes GREEN
- [x] GREEN commit (`feat(09-02): ...` `caf218d`) follows RED
- [x] No REFACTOR needed — initial implementation matches target structure exactly

## Self-Check: PASSED

- [x] `lib/analytics.ts` exists (76 lines, 11 exports)
- [x] `lib/__tests__/analytics.test.ts` exists (145 lines, 19 it())
- [x] Commit `b78e58b` found in `git log`
- [x] Commit `caf218d` found in `git log`
- [x] Vitest GREEN re-run: 19/19 passed
