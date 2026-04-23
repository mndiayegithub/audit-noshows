# Phase 01 — Deferred Items

## Missing npm dependencies (blocks `npm run build`)

**Discovered during:** Plan 01-01 execution (2026-04-23)

**Missing from `node_modules/` but declared in `package.json`:**
- `chart.js` ^4.5.1
- `react-chartjs-2` ^5.3.1
- `react-markdown` ^9.0.1
- `remark-gfm` ^4.0.0

**Affected files (unchanged by Plan 01-01):**
- `app/audit/page.tsx` — imports `react-markdown`, `remark-gfm`
- `components/GaugeBenchmark.tsx` — imports `chart.js`, `react-chartjs-2`
- `components/GraphiqueParJour.tsx` — imports `react-chartjs-2`

**Status:** Pre-existing. `npm run build` was already failing on the same errors before Plan 01-01 touched any file (verified via `git stash` + build + `git stash pop`). Network is offline in the current execution environment, so `npm install` cannot fetch these packages.

**Resolution plan:** Run `npm install` once network is available. These packages are only referenced from the audit flow; the landing page (Plan 01 scope) does not depend on them. This does not block Wave 2 landing plans (01-02, 01-03, 01-04) which only touch `app/page.tsx` and new landing components.

**Scope justification:** Per GSD scope boundary, auto-fix is limited to issues caused by the current task's changes. These errors are in files unrelated to the three foundation files rewritten by Plan 01-01 (`tailwind.config.ts`, `app/globals.css`, `app/layout.tsx`).
