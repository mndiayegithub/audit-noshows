# Testing Patterns

**Analysis Date:** 2026-04-22

## Reality Check: No Test Infrastructure Exists

**There is currently ZERO automated test coverage in this project.** All verification is manual.

### Evidence

**`package.json` scripts** — only dev / build / start / lint, no `test` script:
```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint"
}
```

**No test frameworks installed** (neither in `dependencies` nor `devDependencies`):
- No `jest`, `@jest/*`, `ts-jest`
- No `vitest`, `@vitest/*`
- No `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`
- No `playwright`, `@playwright/test`
- No `cypress`
- No `msw` (mock service worker)

**No test files found** (repo-wide search excluding `node_modules` / `.next`):
- No `*.test.ts` / `*.test.tsx`
- No `*.spec.ts` / `*.spec.tsx`
- No `__tests__/` directories
- No `tests/` or `e2e/` folder

**No test config files:**
- No `jest.config.*`
- No `vitest.config.*`
- No `playwright.config.*`
- No `cypress.config.*`

**No CI workflow** enforcing tests (no `.github/workflows/` observed in the tracked tree).

### Only Quality Gate Today

- **ESLint** via `npm run lint` (`next lint`, extends `next/core-web-vitals`) — static checks only, no behavior assertions
- **TypeScript strict mode** at build time (`npm run build` calls `tsc` through Next)
- **Manual QA** — upload a CSV through `/audit`, eyeball the charts, PDF, and AI report

## What Would Need to Be Added

Below is a pragmatic blueprint for introducing testing. Choose per phase — do not adopt everything at once.

### 1. Unit Tests (Vitest recommended)

**Why Vitest over Jest:** Native ESM, TypeScript-first, instant startup, matches Next 14 + Vite tooling ergonomically. Jest also works but needs heavier `ts-jest` / `babel-jest` config.

**Install:**
```bash
npm i -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

**Add to `package.json`:**
```json
"scripts": {
  "test": "vitest",
  "test:run": "vitest run",
  "test:ui": "vitest --ui",
  "test:coverage": "vitest run --coverage"
}
```

**Create `vitest.config.ts`** with `jsdom` environment, `@/` alias matching `tsconfig.json`, and a `vitest.setup.ts` wiring `@testing-library/jest-dom`.

**Highest-value unit test targets:**

| Target | File | Why |
|---|---|---|
| `calcScore(taux)` | `app/audit/page.tsx:35` | Pure function, business-critical (capped 0–100, formula `100 - taux * 3.2`) |
| `getScoreConfig(score)` | `app/audit/page.tsx:39` | Threshold boundaries (80 / 60) drive UI colors |
| n8n response normalization | `app/api/audit/route.ts` | Three shapes (array / wrapped / direct) — prime regression surface |
| `par_jour` vs. `stats_par_jour` fallback | `components/GraphiqueParJour.tsx` | Data shape variability from n8n |
| `ca_perdu` NON-annualization guard | anywhere it's displayed | **Regression test the business rule — assert raw values, never re-multiplied** |

**Example test skeleton** (`app/audit/__tests__/calcScore.test.ts`):
```ts
import { describe, it, expect } from 'vitest';
import { calcScore } from '../page'; // requires extracting helper to a shared module first

describe('calcScore', () => {
  it('returns 100 for 0% no-shows', () => expect(calcScore(0)).toBe(100));
  it('caps at 0 for extreme rates',  () => expect(calcScore(50)).toBe(0));
  it('rounds to nearest integer',    () => expect(calcScore(10)).toBe(68));
});
```

**Refactor needed:** `calcScore` and `getScoreConfig` currently live inside `app/audit/page.tsx`. Extract them to `lib/score.ts` (the `lib/` directory already exists and is empty) so they can be imported by tests without pulling in the whole page.

### 2. Component Tests (React Testing Library)

**Targets:**
- `GaugeBenchmark` — assert needle angle math and rendered taux given `tauxActuel`
- `GraphiqueParJour` — assert normalization of `par_jour` / `stats_par_jour` (mock Chart.js)
- `ScoreCard` (extract from `app/audit/page.tsx`) — snapshot status labels per score band
- `RapportPDF` — render to string via `@react-pdf/renderer` test utilities, assert no `ca_perdu` is multiplied

**Mocking Chart.js / Framer Motion:**
Chart.js needs canvas mocking (`vi.mock('react-chartjs-2')`) or `vitest-canvas-mock`. Framer Motion components can be passed through with `vi.mock('framer-motion', ...)`.

### 3. API Route Tests

**Target:** `app/api/audit/route.ts`

**Approach:**
- Unit: import the `POST` handler directly, call with a fabricated `Request` containing `multipart/form-data`, mock `fetch` to return each of the three n8n shapes, assert the normalized JSON output
- Use `msw` (Mock Service Worker) to intercept the n8n webhook call instead of stubbing global `fetch`

**Must cover:**
- Array shape: `[{ output: { success, stats, rapport_texte }, email }]`
- Wrapped shape: `{ output: { ... } }`
- Direct shape: `{ success, stats, rapport_texte }`
- n8n timeout / 500 / malformed JSON
- Missing `N8N_WEBHOOK_URL` env var
- `ca_perdu_an` round-trip preservation (snapshot the exact number — no mutation)

### 4. End-to-End Tests (Playwright recommended)

**Why Playwright:** First-class Next.js support, multi-browser, built-in trace viewer, easier than Cypress for file uploads.

**Install:**
```bash
npm i -D @playwright/test
npx playwright install
```

**Config:** `playwright.config.ts` with `webServer: { command: 'npm run dev', port: 3000 }`.

**Critical user journeys to cover:**
1. **Happy path** — landing → `/audit` → drag-drop CSV → submit → `"loading"` → `"resultats"` → all KPI cards render → score gauge animates → PDF button downloads a file
2. **Validation** — submit without file / wrong MIME type → friendly toast, stays in `"formulaire"`
3. **Error path** — n8n webhook 500 → lands in `"erreur"` state with retry CTA
4. **PDF generation** — click download, intercept blob, assert non-empty and contains `ca_perdu_an` value matching what the API returned (critical business-rule assertion)
5. **Responsive** — mobile viewport renders KPI cards stacked without overflow

**Fixtures:** Store a sample `fixtures/audit-sample.csv` (small, realistic 3-month dataset) and a recorded n8n response JSON that Playwright can serve via route interception.

### 5. User Acceptance Testing (UAT)

**Today:** Done manually by the product owner on `npm run dev`.

**To structure it:**
- Write a UAT checklist Markdown (`.planning/uat/CHECKLIST.md`) with every user-facing scenario from §4 above plus:
  - Visual regression: screenshots of dark results section vs. reference
  - PDF sampled at 3 different rate bands (5% / 12% / 25%) to check color coding
  - Google Places diagnostic pulls the right cabinet when name is fuzzy
  - Email delivery (if `email_sent` flow is enabled)
- Add Playwright `trace: 'retain-on-failure'` so UAT failures produce a replayable artifact for triage

### 6. CI Integration

Add `.github/workflows/ci.yml`:
```yaml
- npm ci
- npm run lint
- npm run test:run   # (once vitest is installed)
- npm run build
- npx playwright test   # (once e2e is installed)
```
Run on every PR targeting `main`. Cache `~/.npm` and Playwright browsers.

## Suggested Rollout Order

1. Extract `calcScore` / `getScoreConfig` / response-normalization into `lib/` modules (refactor, no behavior change)
2. Add Vitest + unit tests for those pure helpers — first green CI
3. Add one end-to-end Playwright test for the happy path — catches ~80% of regressions
4. Add API route tests with `msw` for the three n8n shapes
5. Grow component and PDF tests opportunistically when bugs surface

## Guard for the Key Business Rule

Whatever stack is chosen, **every test layer must include at least one assertion that `ca_perdu_an` is rendered/returned untouched from the API response** (no `* 12`, no `/ nb_mois`). This is the single most important regression to lock in before adding features.

---

*Testing analysis: 2026-04-22*
