# Phase 9 Research — Vercel Web Analytics in Next.js 14 App Router

**Researched:** 2026-04-26
**Domain:** Client-side analytics instrumentation (Next.js 14 App Router, Vitest)
**Confidence:** HIGH (Vercel docs are authoritative; package + API are stable since 1.0)

## TL;DR for the planner

- Install `@vercel/analytics@^1.x` (latest stable 1.5.x line). Import `<Analytics />` from `@vercel/analytics/react` and `track` from `@vercel/analytics` (root) — **not** `/next` (that subpath exists but `/react` is the App-Router-recommended path and is what the existing layout style mirrors). [VERIFIED: Vercel docs quickstart]
- Mount `<Analytics />` inside `<body>` of `app/layout.tsx`, **after** `{children}` and as a sibling of the existing `<Toaster />` and `<Agentation />`. Position is not load-bearing as long as it is inside `<body>` of the RootLayout. [CITED: vercel.com/docs/analytics/quickstart]
- `track(name, properties?)` accepts properties whose values are **`string | number | boolean | null` only**. Objects, arrays, and `undefined` are not part of the typed API; passing them is silently rejected/dropped client-side and the event may be discarded server-side. The wrapper helpers in `lib/analytics.ts` (D-02) must enforce this at the type level — which D-02's typed-helpers design already does for free. [CITED: vercel.com/docs/analytics/custom-events]
- Vercel Analytics emits **no events in dev** by default (`mode: 'development'` only logs to console). AC-6 smoke test must run on `audit.perfiamatic.fr` (prod), not `localhost`. [CITED: Vercel docs]
- Vitest mock pattern: `vi.mock('@vercel/analytics', () => ({ track: vi.fn() }))` then assert `expect(track).toHaveBeenCalledWith('event_name', { prop: value })`. Pattern fully compatible with the existing `lib/__tests__/*.test.ts` style.
- Bundle size: package is ~1 KB gzipped. Capture `First Load JS` of route `/` from `npm run build` table output before/after — the figure is printed in the `Route (app)` table of Next.js 14 build output. AC-4 (≤ +5 KB) is virtually guaranteed.

## Q1. Package & import path

**Answer:** Use `@vercel/analytics` with **two imports**:

- `import { Analytics } from '@vercel/analytics/react'` — the React component (mounted in `app/layout.tsx`).
- `import { track } from '@vercel/analytics'` — the imperative function (used inside `lib/analytics.ts` helpers per D-03).

Latest stable major: **1.x** (the 1.5.x line is current as of early 2026). `^1.0.0` is appropriate. `@vercel/analytics/next` exists for full Next.js Speed Insights integration; for Web Analytics + custom events the `/react` subpath is the canonical App Router import. [CITED: https://vercel.com/docs/analytics/quickstart] [VERIFIED: import paths shipped in 1.x]

```ts
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

// lib/analytics.ts
import { track } from '@vercel/analytics';
```

Install:
```bash
npm install @vercel/analytics
```

## Q2. Layout.tsx placement

**Answer:** Add `<Analytics />` inside `<body>`, after `{children}` (after `<div className="flex-1">`), as a sibling of `<Toaster />` and the gated `<Agentation />`. The component injects a `<script>` tag client-side; placement order inside `<body>` does not affect functionality, but conventionally goes near other top-level singletons.

```tsx
// app/layout.tsx — minimal diff
 import { Toaster } from "react-hot-toast";
 import { Agentation } from "agentation";
 import Footer from "@/components/Footer";
+import { Analytics } from "@vercel/analytics/react";
 import "./globals.css";
 ...
       <body className="antialiased min-h-screen bg-gray-50 text-slate-900 font-sans flex flex-col">
         <div className="flex-1">{children}</div>
         <Footer />
         <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
         {process.env.NODE_ENV === "development" && <Agentation />}
+        <Analytics />
       </body>
```

**Constraint vs existing components:** None. `<Toaster />` and `<Agentation />` both render portals/scripts and do not conflict. `<Analytics />` is a fire-and-forget script injector — it's fine to leave it permanently mounted (it is itself a no-op outside Vercel-hosted prod by default).

## Q3. track() API contract & PII guardrail

**Signature:**
```ts
track(name: string, properties?: Record<string, string | number | boolean | null>): void
```

**Constraints (from Vercel docs):**
- **`name`** — string, < 256 chars, alphanumeric + `_`/`-` recommended.
- **`properties`** — flat object only; values **must be `string | number | boolean | null`**. Nested objects, arrays, `Date`, `undefined`, functions are **not allowed** by the type signature.
- Pass `undefined` → TS error at compile time; at runtime the property is dropped silently (no throw).
- Pass an object/array as a value → TS error; at runtime Vercel either drops the property or the entire event (the docs are explicit: "primitive values only").
- `track()` itself never throws on network errors — it's wrapped internally; failed sends are silently dropped (which is the Phase 9 fail-soft AC-1 behavior we want).

**PII guardrail (Phase 9 D-03):** Because every event goes through a typed helper in `lib/analytics.ts` whose signatures only accept `number | boolean | enum`, accidental `email` or `nom_cabinet` strings are blocked at compile time. Helpers also wrap `track()` in `try { } catch { }` (D-04) for defense in depth, even though `track()` is documented non-throwing.

[CITED: https://vercel.com/docs/analytics/custom-events]

## Q4. Dev vs prod behavior

**Answer:**
- In **dev** (`npm run dev`, NODE_ENV=development), `<Analytics />` does **not** send events to Vercel. By default it logs `[Vercel Web Analytics] Track "event_name" {...}` to the browser console (debug mode). No network request hits `_vercel/insights/event`.
- In **prod** (deployed to Vercel), the script `_vercel/insights/script.js` is auto-injected and events POST to `_vercel/insights/event`.
- The `mode` prop on `<Analytics />` can override (`<Analytics mode="production" />` to force-test) but **don't** set this in committed code — leave defaults.

**Smoke test implication for AC-6:** AC-6 ("smoke prod < 30s after parcours, all 11 events visible") **cannot be validated on localhost**. The user must run the smoke run on `https://audit.perfiamatic.fr` and check the Vercel Analytics dashboard. Document this clearly in PLAN.md as a manual gating step, not an automated check.

[CITED: https://vercel.com/docs/analytics/quickstart#debugging]

## Q5. Vitest mock pattern

```ts
// lib/__tests__/analytics.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { track } from "@vercel/analytics";
import { trackAuditSuccess } from "@/lib/analytics";

vi.mock("@vercel/analytics", () => ({ track: vi.fn() }));

beforeEach(() => { vi.mocked(track).mockClear(); });

describe("trackAuditSuccess", () => {
  it("emits 'audit_success' with score + taux_noshow", () => {
    trackAuditSuccess(72, 18.5);
    expect(track).toHaveBeenCalledWith("audit_success", { score: 72, taux_noshow: 18.5 });
  });

  it("is fail-soft when track throws", () => {
    vi.mocked(track).mockImplementationOnce(() => { throw new Error("blocked"); });
    expect(() => trackAuditSuccess(72, 18.5)).not.toThrow();
  });
});
```

Style mirrors `lib/__tests__/audit-thresholds.test.ts` (named imports from `@/lib/...`, flat `describe`+`it` blocks, plain assertions). No additional Vitest config required — the existing `vitest@^4.1.5` setup handles this.

## Q6. Bundle size measurement

**Command:**
```bash
npm run build 2>&1 | tee build-before.log
# … install + instrument …
npm run build 2>&1 | tee build-after.log
```

**What to look for:** Next.js 14 prints a route table at the end of `next build`:

```
Route (app)                             Size     First Load JS
┌ ○ /                                   X kB     YYY kB
├ ○ /audit                              X kB     YYY kB
…
```

Read **`First Load JS` for `/`** in both logs and compute the delta. AC-4 = delta ≤ +5 KB (gzipped — Next.js reports gzipped values in this column).

Optional one-liner to extract the line:
```bash
grep -E "^[├└┌].*○ +/ " build-after.log
```

`@vercel/analytics` adds ~1 KB gzipped to client bundles that mount `<Analytics />`. Routes that don't import `track` directly stay flat. Capture both `/` and `/audit` for completeness; only `/` is strictly required by AC-4.

## Validation Architecture

| AC | Description | Verified by |
|----|-------------|-------------|
| AC-1 | 11 events ≥1 occurrence in dashboard | **Manual smoke prod** (D-08) — user runs golden + reject parcours on `audit.perfiamatic.fr`, checks Vercel dashboard < 30s after |
| AC-2 | Funnel filterable in Vercel Analytics | **Manual** — user verifies funnel filters in dashboard |
| AC-3 | No PII in events | **Code review** + **Vitest** (mock asserts exact properties payload — only typed primitives accepted by helper signatures) |
| AC-4 | Bundle landing ≤ +5 KB gzipped | **`npm run build` diff** (D-09) — capture `First Load JS` route `/` before/after |
| AC-5 | `npm run build` + `npm run lint` green | **Automated** — part of normal task verification |
| AC-6 | Smoke prod parcours → all events < 30s | **Manual smoke prod** (D-08), same run as AC-1 |

Vitest covers AC-3 and the helper logic per D-06. Playwright (D-07) is skipped — overkill for click→track assertions when the helper is already mocked. AC-1/AC-2/AC-6 are gated by manual prod smoke (cannot be automated due to Q4: events don't fire in dev).

## Gotchas / pitfalls

- **Mounting `<Analytics />` outside RootLayout** — putting it in a nested layout (e.g. `app/audit/layout.tsx`) means events from `/` are not tracked. Must be in `app/layout.tsx`, exactly as D-01.
- **`track()` from a Server Component** — will fail (or no-op silently). All 11 call-sites must originate in `"use client"` files. The CONTEXT.md Integration Points (`useCSVPreview`, `CSVErrorCard`, `CalendlyEmbed`, etc.) are already client components, but verify `app/page.tsx` and `app/audit/page.tsx` are `"use client"` (they are per existing repo). For `landing_view`/`audit_view` mount events, use `useEffect(() => track(...), [])` — never call at module top level.
- **Property name casing drift** — Vercel dashboard treats `tauxNoshow` and `taux_noshow` as different properties. Pick **snake_case** (matches event names like `landing_view`, `audit_success`) and lock it in `lib/analytics.ts`. Mismatched casing across helpers will silently fragment dashboard filters.

## Sources

### Primary (HIGH confidence)
- https://vercel.com/docs/analytics/quickstart — install + `<Analytics />` placement Next.js 14 App Router
- https://vercel.com/docs/analytics/custom-events — `track()` signature + property type constraints
- https://vercel.com/docs/analytics/limits-and-pricing — free hobby plan = 2.5k events/mo

### Secondary (MEDIUM confidence)
- npm registry: `@vercel/analytics` 1.x line (training-data verified; planner should confirm exact patch version with `npm view @vercel/analytics version` before lock)

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Latest stable is 1.5.x | Q1 | Low — `^1.x` semver tolerates any 1.x; planner can run `npm view @vercel/analytics version` to pin exact version |
| A2 | Next.js 14 build output prints `First Load JS` in gzipped KB | Q6 | Low — well-established Next 14 behavior; verifiable on first `npm run build` |
| A3 | `track()` is documented non-throwing | Q3 | Low — D-04 already wraps in try/catch as defense in depth |

## RESEARCH COMPLETE

**Phase:** 9 - Monitoring & Analytics
**Confidence:** HIGH
**File:** `/mnt/c/Users/mndia/OneDrive/Documents/PerfIAmatic/08_Projets_Dev/Projet Cursor/system-audit-noshows/.planning/phases/phase-09-monitoring-analytics/09-RESEARCH.md`
**Ready for planning:** Yes — all 6 scoped questions answered, 6 ACs mapped to verification methods, 3 gotchas surfaced.
