# Codebase Concerns

**Analysis Date:** 2026-04-22

## Tech Debt

**Monolithic client page (`app/audit/page.tsx`):**
- Issue: 708-line single `"use client"` file managing upload, loading, results, error states, KPI rendering, markdown, and PDF orchestration.
- Files: `app/audit/page.tsx`
- Impact: Hard to test, hard to reason about; changes risk regressions across unrelated sections.
- Fix approach: Extract state machine (`Etat`) into a custom hook, split results display into section components (`<KpiCards>`, `<ResultsLayout>`), lift file-upload dropzone into its own component.

**Oversized landing page (`app/page.tsx`):**
- Issue: 891 lines in one marketing page component.
- Files: `app/page.tsx`
- Impact: Slow cognitive load; copy/content changes require touching a huge file.
- Fix approach: Break into section components (`<Hero>`, `<Features>`, `<Pricing>`, `<FaqSection>` already extracted) under `components/landing/`.

**Large PDF document component:**
- Issue: `components/audit/RapportPDF.tsx` is 619 lines of inline `@react-pdf/renderer` styles and layout.
- Files: `components/audit/RapportPDF.tsx`
- Impact: Difficult to iterate on report design; style constants duplicated.
- Fix approach: Extract page/section components and a shared stylesheet module.

**Massive uncommitted working tree:**
- Issue: 23 modified files and 7 untracked files sitting outside git history (per `git status`).
- Files: `app/*`, `components/*`, `tailwind.config.ts`, `tsconfig.json`, `next.config.js`, `package.json`, `.gitignore`, `.env.example`, `.eslintrc.json`, etc.
- Impact: No rollback granularity; a single revert loses unrelated progress; code review impossible; risk of losing changes if `.next/` or IDE crashes.
- Fix approach: Stage and commit logically grouped changes (config, landing, audit flow, components). Adopt a feature-branch workflow with small commits.

**"Backup snapshot" commit pattern:**
- Issue: Recent commits are `backup: snapshot V3_LIGHT`, `backup: snapshot V2_LIGHT`, `backup: snapshot site audit et landing` — suggests rollback-prone, fear-driven workflow rather than incremental feature commits.
- Files: git history (`git log`)
- Impact: Git history is unusable for bisecting or changelog; contributors can't tell what changed between snapshots.
- Fix approach: Adopt Conventional Commits strictly; use branches + tags for restore points instead of snapshot commits on `main`.

**Multiple parallel landing page variants:**
- Issue: Three HTML files coexist with the Next.js landing: `landing.html` (34.6 KB, dated 2026-04-21), `landing-preview.html` (62 KB, 2026-04-14), `mockup.html` (Carevia template, 2026-04-17) — in addition to `app/page.tsx`.
- Files: `landing.html`, `landing-preview.html`, `mockup.html`, `app/page.tsx`
- Impact: Divergence risk — content/styles drift between HTML prototypes and the React implementation; unclear which is the source of truth; adds dead weight to the repo if committed.
- Fix approach: Decide which is canonical (likely `app/page.tsx`), move HTML mockups to a `/prototypes` folder outside the Next app (or delete), add them to `.gitignore` if throwaway.

**Stray `mockup.html` is unrelated template:**
- Issue: `mockup.html` is a "Carevia — Patient Support Dashboard" template (different product name, English, unrelated design language).
- Files: `mockup.html`
- Impact: Confuses contributors; not part of this product.
- Fix approach: Delete or move to personal scratch folder.

**French/English mixing:**
- Issue: UI copy, toast messages, and code comments are in French; variable names, types, and API response keys mix French (`resultats`, `formulaire`, `ca_perdu`, `rapport_texte`, `par_jour`) with English (`success`, `error`, `stats`, `email_sent`).
- Files: `app/audit/page.tsx`, `types/audit.ts`, `app/api/audit/route.ts`
- Impact: Confusing for non-French contributors; inconsistent naming makes autocomplete less useful; risk of typos at the FR/EN boundary.
- Fix approach: Pick a convention — recommended: French UI copy, English identifiers. Rename types gradually in a dedicated refactor phase.

## Known Bugs

**`AbortSignal.timeout` shorter than `maxDuration`:**
- Symptoms: API proxy aborts n8n request at 55 s while `maxDuration = 60`. If n8n responds between 55–60 s, the client sees a 500 instead of success.
- Files: `app/api/audit/route.ts:13`, `app/api/audit/route.ts:1`
- Trigger: Slow n8n AI run (~50–60 s, which the CLAUDE.md explicitly mentions is typical).
- Workaround: Retry client-side — but there is no retry logic.

**No response-shape validation:**
- Symptoms: If n8n returns an unexpected format (neither array, nor `{output: {...}}`, nor `{success, stats, ...}`), `data` may be a garbage object silently forwarded to the client, which then crashes when reading `stats.ca_perdu`.
- Files: `app/api/audit/route.ts:30-51`
- Trigger: n8n workflow edit that changes response shape.
- Workaround: None; Zod validation would surface the issue early.

## Security Considerations

**CSV upload — weak validation:**
- Risk: Dropzone accepts `text/csv` MIME + `.csv` extension with `maxSize: 10 MB`, but the API route (`app/api/audit/route.ts`) performs **no server-side validation** — it blindly forwards `multipart/form-data` to n8n. An attacker could POST any file type / size directly to `/api/audit` bypassing the browser.
- Files: `app/api/audit/route.ts`, `app/audit/page.tsx:215-216`
- Current mitigation: Client-side only (react-dropzone `accept` and `maxSize`).
- Recommendations: Server-side: verify `Content-Type`, enforce file size (read `content-length`), sniff first bytes to confirm CSV, reject if >10 MB. Consider rate limiting (Upstash / Vercel middleware) to prevent abuse of the paid n8n/AI pipeline.

**No authentication on `/api/audit`:**
- Risk: The endpoint is public — anyone can trigger n8n AI runs (which consume OpenAI/Claude credits).
- Files: `app/api/audit/route.ts`
- Current mitigation: None.
- Recommendations: Add IP-based rate limiting, CAPTCHA (hCaptcha/Turnstile) on the upload form, or a short-lived signed token issued by the page.

**Webhook URL hardcoded as fallback:**
- Risk: `https://n8n.srv939707.hstgr.cloud/webhook/audit-flash` appears in source (`app/api/audit/route.ts:9`). If `N8N_WEBHOOK_URL` is unset in prod, requests still flow to the hardcoded URL — infra leakage + no fail-fast.
- Files: `app/api/audit/route.ts:8-9`
- Current mitigation: `.env.example` documents the variable.
- Recommendations: Remove the fallback; throw if `process.env.N8N_WEBHOOK_URL` is missing at request time. Move the production URL to a non-committed secret.

**`.env.local` present on disk:**
- Risk: `.env.local` exists (listed via `ls -la`) — correctly excluded by `.gitignore` (`.env*.local`), but confirm no secrets end up in commits after editing `.env.example` (which is `M` in git status).
- Files: `.env.local`, `.env.example`
- Current mitigation: `.gitignore` lines 28–29 cover it.
- Recommendations: Before committing modified `.env.example`, confirm it contains only placeholders.

## Performance Bottlenecks

**Client-side PDF generation with `@react-pdf/renderer`:**
- Problem: The full `@react-pdf/renderer` bundle + `RapportPDF` component are dynamically imported in the browser at download time; rendering a 619-line document can freeze the main thread on low-end devices.
- Files: `app/audit/page.tsx:267-292`, `components/audit/RapportPDF.tsx`
- Cause: `@react-pdf/renderer` runs a full React reconciler + PDF layout engine in-browser; bundle is ~1 MB+ gzipped.
- Improvement path: Move PDF generation server-side (Node route or n8n already has the data) and return a URL (`pdf_url` field already exists in `AuditResponse`). Or pre-generate at audit time. As an intermediate step, wrap the call in `requestIdleCallback` and show progress UI.

**Large bundle risk from Spline runtime:**
- Problem: `@splinetool/react-spline` + `@splinetool/runtime` are heavy 3D dependencies; unclear if they are still used after recent redesigns.
- Files: `package.json:13-14`
- Cause: Dependency bloat.
- Improvement path: Grep for `Spline` imports; remove if unused. If used, lazy-load via `next/dynamic` with `ssr: false`.

## Fragile Areas

**n8n response normalization logic:**
- Files: `app/api/audit/route.ts:22-51`
- Why fragile: Branching on structural heuristics (`Array.isArray`, `"output" in raw`) without schema validation. Any fourth format added to n8n breaks silently.
- Safe modification: Add Zod schema for `AuditResponse` and validate `data` before returning; add unit tests for the three known shapes.
- Test coverage: Zero — no tests exist.

**Day-of-week chart data path:**
- Files: `components/GraphiqueParJour.tsx`
- Why fragile: Accepts both `stats.par_jour` and `stats.stats_par_jour` (per CLAUDE.md); any schema drift on the n8n side produces an empty chart silently.
- Safe modification: Normalize in `types/audit.ts` with a single canonical field; transform once in the API route.
- Test coverage: None.

**Score formula — magic number:**
- Files: `app/audit/page.tsx` (ScoreCard section)
- Why fragile: `100 - taux * 3.2` is documented only in CLAUDE.md; no unit or boundary tests (what happens when `taux > 31.25` → negative score?).
- Safe modification: Clamp to `[0, 100]`, extract to `lib/scoring.ts`, add tests for edges (0 %, 5 %, 30 %, 50 %).
- Test coverage: None.

## Scaling Limits

**Single n8n webhook dependency:**
- Current capacity: One self-hosted n8n instance at `n8n.srv939707.hstgr.cloud`.
- Limit: Single point of failure — if n8n goes down, the product is 100 % broken (landing still loads, but `/audit` cannot deliver results). No health-check UI, no degraded mode.
- Scaling path: (a) add `/api/health` that pings n8n and disables upload button if down; (b) queue uploads to S3 + n8n webhook consumer for async processing; (c) duplicate n8n instance behind load balancer; (d) long term: re-implement the AI pipeline directly in Next.js API routes to remove n8n as a runtime dep.

**60-second Vercel function cap:**
- Current capacity: `maxDuration = 60` (Vercel Hobby: 10 s, Pro: 60 s, Enterprise: 300 s).
- Limit: AI calls routinely take 30–50 s; no headroom for retries, cold starts, or slower GPT runs.
- Scaling path: Move to async flow — return job ID immediately, poll `/api/audit/:id` for results; store intermediate state in KV/Redis.

## Dependencies at Risk

**`lucide-react` at `^1.7.0`:**
- Risk: `lucide-react` is at version 0.x / 0.5xx on npm — `^1.7.0` is suspicious; may be an outdated pin or a typo. Worth verifying the installed version.
- Impact: Icons may silently fall back; new icon names unavailable.
- Migration plan: Audit `npm ls lucide-react`; upgrade to latest (`0.5xx`) and adapt imports.

**`next 14.2.18` vs workspace sibling projects on Next 16:**
- Risk: Other PerfIAmatic projects use Next 16 (per workspace CLAUDE.md); divergence means shared patterns (App Router APIs, server actions) won't transfer.
- Impact: Knowledge silos; future upgrade cost.
- Migration plan: Plan a Next 15 → 16 upgrade phase once remaining Next 14 features are stable.

## Missing Critical Features

**No retry / resume on upload failure:**
- Problem: If the 55 s abort fires or n8n 5xx, the user loses their CSV position and must re-upload.
- Blocks: Professional UX for a paid/gated audit tool.

**No analytics / funnel tracking:**
- Problem: No Plausible / PostHog / GA wiring visible; can't measure landing → upload → results conversion.
- Blocks: Data-driven product iteration.

**No health page / status indicator:**
- Problem: Users discover n8n is down only after uploading a CSV and waiting 55 s.
- Blocks: Graceful degradation.

**PDF server URL field unused:**
- Problem: `AuditResponse.pdf_url` exists in `types/audit.ts` but the frontend always generates PDF client-side.
- Blocks: Performance improvement (see above).

## RGPD / Privacy Concerns

**Dental patient data transits through third-party infra:**
- Risk: CSVs of dental no-shows are likely to contain patient identifiers (names, phone, emails, appointment dates) — "données de santé" under RGPD Art. 9 require special treatment. The file flows: browser → Vercel (FR/EU region?) → self-hosted n8n at `n8n.srv939707.hstgr.cloud` (Hostinger, region?) → OpenAI/Anthropic for AI report generation (likely US).
- Files: `app/audit/page.tsx:435` ("Conforme RGPD · Aucun nom patient stocké" claim), `app/audit/page.tsx:678`, `app/api/audit/route.ts`
- Current mitigation: UI claims RGPD compliance and claims no patient names are stored — but the app **has no mechanism to enforce or verify this**.
- Recommendations:
  - Document data-flow (DPIA) and processor list (Vercel, Hostinger, OpenAI/Anthropic).
  - Enforce CSV anonymization client-side before upload (strip name columns, hash phone/email) rather than trusting n8n to do it.
  - Add an explicit RGPD consent checkbox on the upload form ("j'atteste avoir anonymisé le CSV").
  - Add a DPA link, privacy policy, and right-to-erasure endpoint.
  - Verify hosting regions are EU; if AI provider is US, require SCCs or move to EU-hosted models (Mistral).
  - Remove the "Conforme RGPD" claim until the above is true — unverified claims are themselves a legal risk.

**No privacy policy / legal mentions page:**
- Risk: A French-facing B2B product collecting health data with no `/mentions-legales`, `/politique-de-confidentialite`, `/cgu` — non-compliant with LCEN + RGPD.
- Files: `app/` (missing pages)
- Recommendations: Add `/mentions-legales` and `/confidentialite` pages before broader launch.

## Test Coverage Gaps

**Zero tests in the repo:**
- What's not tested: Everything. No `*.test.*` or `*.spec.*` files under `app/`, `components/`, `lib/`, `types/`. No test runner (Jest/Vitest) in `package.json` deps. No CI.
- Files: entire codebase
- Risk: Regressions in the n8n normalization, score formula, PDF rendering, or CSV parsing go unnoticed until a user reports.
- Priority: High — at minimum, add:
  - Unit tests for `app/api/audit/route.ts` response normalization (3 shapes + invalid).
  - Unit tests for the score formula with boundary cases.
  - Component smoke tests for `GaugeBenchmark` and `GraphiqueParJour` with empty / malformed `stats`.
  - E2E (Playwright) for the upload → results happy path using a mocked n8n endpoint.

**No lint/typecheck in CI:**
- What's not tested: `next lint` and `tsc --noEmit` are not wired to any pre-commit hook or GitHub Action (no `.github/workflows/` visible).
- Risk: Broken builds land on `main`.
- Priority: Medium — add a minimal GitHub Actions workflow running `npm run lint && npm run build`.

## Configuration & Tooling Concerns

**Untracked `CLAUDE.md` and `PRD_V2.md`:**
- Status: `CLAUDE.md` and `PRD_V2.md` are untracked (in `git status`). `CLAUDE.md` is referenced by the workspace setup as the authoritative project guide.
- Files: `CLAUDE.md`, `PRD_V2.md`
- Impact: If the authoritative spec is not committed, Claude Code / contributors on a fresh clone miss critical context (e.g., the "never re-annualize `ca_perdu`" rule).
- Fix approach: Commit both files. `PRD_V2.md` likely supersedes a previous `PRD.md` — clarify naming.

**Untracked but actively-used components:**
- Status: `components/ui/faq-section.tsx` and `components/ui/testimonial-cards.tsx` are untracked yet imported by `app/page.tsx:12-13`.
- Files: `components/ui/faq-section.tsx`, `components/ui/testimonial-cards.tsx`
- Impact: A fresh clone + `npm run build` will fail. The landing page is broken on any deployment that doesn't have these files.
- Fix approach: Commit these files immediately (highest priority).

**`tsconfig.tsbuildinfo` checked into working tree:**
- Status: 115 KB file present in repo root; correctly ignored by `.gitignore:35` (`*.tsbuildinfo`).
- Files: `tsconfig.tsbuildinfo`
- Impact: None (ignored), but noisy on disk.
- Fix approach: None required; consider `rm` during cleanup.

---

*Concerns audit: 2026-04-22*
