---
phase: 07-robustesse-upload-csv
verified: 2026-04-26T00:00:00Z
status: human_needed
score: 6/6 must-haves verified
overrides_applied: 0
---

# Phase 7: Robustesse upload CSV — Verification Report

**Phase Goal:** Donner au client une autonomie totale sur l'upload CSV (preview + validation + mode dégradé + refus dur), avec catalogue de fixtures e2e reproductible.
**Verified:** 2026-04-26
**Status:** human_needed (static checks pass; e2e + visual still require human run)

## Goal Achievement — REQ by REQ

| #   | REQ                                       | Status     | Evidence                                                                                                                                                                                                          |
| --- | ----------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | CSV preview parses 3 sources (papaparse)  | ✓ PASS     | `lib/parseCSVForPreview.ts:73` (Papa.parse, `header:true`, auto delim). Regex `COLONNE_DATE` + `COLONNE_STATUT` cover Doctolib/Excel/logiciels. Fixtures `doctolib_*`, `excel_*`, `julie/veasy/logos_w_*` present. |
| 2   | 5 typed AuditErrorCode mapping            | ✓ PASS     | `types/audit-errors.ts:5-10` exports the union (5 codes exact). `lib/mapErrorToCard.ts` switch covers all 5 (`MISSING_COLUMNS`, `INVALID_DATE_FORMAT`, `EMPTY_AFTER_PARSING`, `ENCODING_ERROR`, `INSUFFICIENT_DATA`). `mapN8nErrorToCode` in `lib/n8n-normalize.ts:74-126` returns one of the 5. |
| 3   | Mode dégradé < 0.90 → modal + bannière    | ✓ PASS     | `DEGRADED_THRESHOLD = 0.90` in `lib/audit-thresholds.ts:6`. `parseCSVForPreview.ts:124` flags `degraded`. `app/audit/page.tsx:330-348` opens `DegradedConfirmDialog`. Bannière "Audit partiel" rendered at `app/audit/page.tsx:393-400` when `resultats.degraded`. API passthrough at `app/api/audit/route.ts:127-134`. |
| 4   | Refus dur < 0.50 OR < 20 RDV              | ✓ PASS     | `REJECT_THRESHOLD = 0.50`, `MIN_RDV_VALIDES = 20` in `lib/audit-thresholds.ts:7-8`. `evaluateRecognition` returns `INSUFFICIENT_DATA` when either threshold breached (`lib/audit-validation.ts:138-153`). API returns 400 with `error_code` (`route.ts:124`). Frontend shows `<CSVErrorCard>` (`page.tsx:416`). |
| 5   | 12 fixtures CSV + 3 mock JSON + generator | ✓ PASS     | `e2e/fixtures/csv/` contains 12 files (doctolib×3, excel×3, julie/veasy/logos_w, malformed×3). `e2e/fixtures/responses/` has audit-{ok,degraded,reject}.json. `scripts/gen-csv-fixtures.ts` is 439 LoC (substantive generator).                                       |
| 6   | 3 specs Playwright avec page.route() mock | ✓ PASS     | `audit-flow-ok.spec.ts`, `audit-flow-degraded.spec.ts`, `audit-flow-reject.spec.ts` all use `page.route("**/api/audit", ...)` + `route.fulfill()` with bodies from fixtures/responses. Each spec asserts the expected UI surface (KPIs / dialog+bannière / CSVErrorCard). |

**Score:** 6 / 6 REQs structurally satisfied.

## Required Artifacts

| Artifact                                        | Status     | Notes                                                                              |
| ----------------------------------------------- | ---------- | ---------------------------------------------------------------------------------- |
| `lib/audit-thresholds.ts`                       | ✓ VERIFIED | 3 named constants exported, single source of truth.                                |
| `types/audit-errors.ts`                         | ✓ VERIFIED | 5-code union + `makeAuditError` helper.                                            |
| `lib/audit-validation.ts`                       | ✓ VERIFIED | 3-branch `ValidationResult` discriminated union + `evaluateRecognition`.           |
| `lib/parseCSVForPreview.ts`                     | ✓ VERIFIED | Pure fn, papaparse, returns `degraded` / `willReject` flags.                       |
| `lib/n8n-normalize.ts`                          | ✓ VERIFIED | `normalizeN8nResponse` + `mapN8nErrorToCode` + `sanitizeRapportTexte` + passthrough. |
| `lib/mapErrorToCard.ts`                         | ✓ VERIFIED | Exhaustive switch on 5 codes + `default`.                                          |
| `hooks/useCSVPreview.ts`                        | ✓ VERIFIED | FileReader wraps pure fn; reader error → ENCODING_ERROR.                           |
| `components/audit/CSVPreview.tsx`               | ✓ VERIFIED | 240 LoC; renders preview, badges, mini table, "Continuer" disabled if `willReject`. |
| `components/audit/DegradedConfirmDialog.tsx`    | ✓ VERIFIED | Radix Dialog with focus trap (native), confirm/cancel callbacks.                   |
| `components/audit/CSVErrorCard.tsx`             | ✓ VERIFIED | role=alert, mapErrorToCard wired, retry button.                                    |
| `app/api/audit/route.ts`                        | ✓ VERIFIED | Wires `validateAuditPayload` + `evaluateRecognition` + `mapN8nErrorToCode` + dégradé passthrough. |
| `app/audit/page.tsx`                            | ✓ VERIFIED | 454 LoC; full wiring dropzone → CSVPreview → optional DegradedConfirmDialog → POST → results+banner OR CSVErrorCard. |
| `scripts/gen-csv-fixtures.ts`                   | ✓ VERIFIED | 439 LoC generator, reproducible.                                                   |
| `e2e/fixtures/csv/*.csv` (×12)                  | ✓ VERIFIED | Exact 12 files present.                                                            |
| `e2e/fixtures/responses/audit-{ok,degraded,reject}.json` | ✓ VERIFIED | All three present (39 / 47 / 11 lines).                                  |
| `e2e/audit-flow-{ok,degraded,reject}.spec.ts`   | ✓ VERIFIED | All three new specs exist with `page.route()` mocks.                               |
| `lib/__tests__/*.test.ts` (Vitest)              | ✓ VERIFIED | Coverage for thresholds, validation, normalize, parseCSVForPreview, mapErrorToCard (5 new test files alongside legacy). |

## Key Link Verification (Wiring)

| From                           | To                              | Via                                              | Status      |
| ------------------------------ | ------------------------------- | ------------------------------------------------ | ----------- |
| `app/audit/page.tsx`           | `useCSVPreview` (via CSVPreview) | import `CSVPreview` line 12 + `<CSVPreview file=…>` line 330 | ✓ WIRED |
| `CSVPreview`                   | `parseCSVForPreview`            | `useCSVPreview.ts:35`                            | ✓ WIRED     |
| `app/audit/page.tsx`           | `DegradedConfirmDialog`         | always-mounted line 440-451, opens via snapshot.degraded | ✓ WIRED |
| `app/audit/page.tsx`           | `CSVErrorCard`                  | rendered when `structuredError` truthy (lines 231, 416)  | ✓ WIRED |
| `app/audit/page.tsx` → `/api/audit` | `route.ts` POST handler   | `fetch('/api/audit', { method:'POST', body:formData })` (handleSubmit) | ✓ WIRED |
| `route.ts`                     | `evaluateRecognition`           | imported line 3, called line 123                 | ✓ WIRED     |
| `route.ts`                     | `mapN8nErrorToCode`             | imported line 9, called line 103                 | ✓ WIRED     |
| Bannière "Audit partiel"       | `resultats.degraded`            | `page.tsx:393-400` reads passthrough field       | ✓ WIRED     |

## Data-Flow Trace (Level 4)

| Artifact                  | Data var               | Source                                                | Flowing? |
| ------------------------- | ---------------------- | ----------------------------------------------------- | -------- |
| `CSVPreview` metrics      | `result.preview.*`     | `parseCSVForPreview` (real CSV via FileReader)        | ✓ FLOWING |
| Bannière dégradée         | `resultats.reco_rate`  | API passthrough from n8n (route.ts:131)               | ✓ FLOWING |
| `CSVErrorCard` title/hint | `error.error_code`     | API 400 payload OR client preview error               | ✓ FLOWING |
| Dialog metrics            | `previewSnapshot`      | `onReady` callback from CSVPreview (page.tsx:48)      | ✓ FLOWING |

## Anti-Patterns

`grep -rn "TODO\|FIXME\|placeholder\|return null" lib/ hooks/ components/audit/CSVPreview.tsx components/audit/CSVErrorCard.tsx components/audit/DegradedConfirmDialog.tsx app/api/audit/route.ts app/audit/page.tsx` — no actionable stubs found in Phase 7 deliverables. The single `return null` in `CSVPreview.tsx:111` is intentional (parent renders `<CSVErrorCard>` instead), documented in code comment.

## Human Verification Required

Static verification cannot replace the following — please run before deploy:

### 1. Playwright e2e suite

**Test:** `npx playwright test e2e/audit-flow-ok.spec.ts e2e/audit-flow-degraded.spec.ts e2e/audit-flow-reject.spec.ts`
**Expected:** 3/3 specs pass green.
**Why human:** Verifier was instructed not to run tests; the specs are statically valid but real run needed.

### 2. Vitest unit suite

**Test:** `npm test` (or `npx vitest run`)
**Expected:** All 9 test files pass; in particular `audit-thresholds`, `parseCSVForPreview`, `n8n-normalize`, `mapErrorToCard`, `audit-validation` should be 100 % green.
**Why human:** Same — verifier did not execute.

### 3. Visual sanity on real Doctolib export

**Test:** Upload a real `doctolib_export.csv` (>200 lines) at `/audit`, observe preview + KPI bandeau + badges colonnes.
**Expected:** Colonnes `date` + `statut` reconnues (badges verts), reco_rate ≥ 95 %, "Continuer" non-disabled.
**Why human:** Requires real CSV + visual judgment on clinique-claire palette.

### 4. Mode dégradé manual flow

**Test:** Upload `e2e/fixtures/csv/malformed_statuts_inconnus.csv` — confirm modal appears, click "Continuer en mode dégradé", confirm bannière "Audit partiel" + chiffre `ignored_count` cohérent.
**Why human:** Real n8n round-trip (not mocked) tests passthrough end-to-end.

## Gaps Summary

**No structural gaps.** All 6 REQs map to existing, substantive, wired artifacts. The only blockers to "ship-ready" are the 4 human verifications above (e2e + visual). Once those pass, Phase 7 is mergeable.

**Notable observations (non-blocking):**
- `app/api/audit/route.ts:146-151`: catch-all error returns `error_code: "EMPTY_AFTER_PARSING"` for any 502 network failure. Semantically loose (network ≠ empty CSV), but pragmatic — `mapErrorToCard` shows acceptable fallback copy. Consider adding a `NETWORK_ERROR` code in a follow-up if telemetry shows confusion.
- `MISSING_PLAN_SUMMARY`: `07-01-SUMMARY.md`, `07-04-SUMMARY.md`, `07-06-SUMMARY.md` are absent from the phase dir while their PLANs exist. Code is delivered, but the SUMMARY trail is incomplete. Not a code gap; a documentation gap.

---

_Verified: 2026-04-26_
_Verifier: Claude (gsd-verifier, static-only)_
