# Architecture

**Analysis Date:** 2026-04-22

## Pattern Overview

**Overall:** Single-flow Next.js 14 App Router SaaS app. Thin frontend + proxy API routes delegating all business logic to an external n8n workflow backend.

**Key Characteristics:**
- Two-page application: marketing landing (`app/page.tsx`) + audit tool (`app/audit/page.tsx`)
- Client-side state machine drives the entire audit UX (no server-side rendering of results)
- Backend is stateless: Next.js API routes proxy to n8n (audit) and Google Places (enrichment); no database, no auth, no sessions
- All heavy business logic (CSV parsing, stats computation, AI report generation) lives in n8n, not in this repo
- PDF generation happens client-side via `@react-pdf/renderer`

## Layers

**Presentation Layer (React Client Components):**
- Purpose: Render landing page and audit flow UI
- Location: `app/page.tsx`, `app/audit/page.tsx`, `components/`
- Contains: Client components (`"use client"`) with Framer Motion animations, Chart.js charts, Markdown rendering
- Depends on: `types/audit.ts`, API routes via `fetch`
- Used by: End users through the browser

**API Proxy Layer (Next.js Route Handlers):**
- Purpose: Forward requests to external services; normalize responses
- Location: `app/api/audit/route.ts`, `app/api/google-places/route.ts`
- Contains: `POST` and `GET` handlers; timeouts via `AbortSignal.timeout`; `maxDuration` export for Vercel
- Depends on: `N8N_WEBHOOK_URL`, `GOOGLE_PLACES_API_KEY` env vars
- Used by: `app/audit/page.tsx` via `fetch("/api/audit")` and `fetch("/api/google-places")`

**Type Contracts Layer:**
- Purpose: Shared TypeScript contracts for n8n responses
- Location: `types/audit.ts`
- Contains: `AuditStats`, `AuditResponse`, `GoogleData`
- Used by: Both the client page and PDF component

**External Backend (out of repo):**
- n8n workflow at `N8N_WEBHOOK_URL` handles CSV parsing, aggregation, benchmark lookup, AI report generation
- Google Places API for cabinet Google-review enrichment

## Data Flow

**Primary audit flow (CSV upload → results):**

1. User visits `app/audit/page.tsx` — client page mounts in state `etat = "formulaire"`
2. User drops CSV via `react-dropzone`, types `nomCabinet`, `caMoyen`, `email`
3. On submit, page transitions to `etat = "loading"`; a simulated `etapeActuelle` counter animates progress steps
4. `FormData` (file + fields) is POSTed to `/api/audit`
5. `app/api/audit/route.ts` forwards the `multipart/form-data` to `N8N_WEBHOOK_URL` with a 55 s timeout (`maxDuration = 60`)
6. n8n parses the CSV, computes stats, generates the AI report (~30–50 s), and responds
7. The API route **normalizes** the n8n response through three possible shapes:
   - Array (n8n test-mode): `[{ output: { success, stats, rapport_texte }, email }]` → take `[0].output`
   - Wrapped object (production Respond-to-Webhook): `{ output: {...}, email }` → unwrap `.output`
   - Direct (legacy): `{ success, stats, rapport_texte }` → pass through
8. Client receives normalized `AuditResponse`, sets `resultats`, transitions to `etat = "resultats"`
9. Results render in fixed order (KPI cards → ScoreCard → GaugeBenchmark → GraphiqueParJour → AI Markdown report → PDF download)
10. If enrichment is available, Google Places data is fetched via `/api/google-places?input=...` and rendered in `DiagnosticGoogle`
11. User clicks "Télécharger PDF" → `@react-pdf/renderer` renders `components/audit/RapportPDF.tsx` to a Blob client-side and triggers download

**Error path:** on fetch failure or `success: false`, `etat = "erreur"` and a retry button resets to `"formulaire"`.

**State Management:**
- Client-only, co-located `useState` hooks inside `app/audit/page.tsx`
- Single source of truth is the `etat` discriminant: `"formulaire" | "loading" | "resultats" | "erreur"`
- No global store (no Redux, Zustand, Context). No persistence (no localStorage). Page refresh wipes everything.

## Key Abstractions

**`Etat` state machine:**
- Purpose: Models the four mutually-exclusive UI stages of the audit flow
- Location: `app/audit/page.tsx` line 33 (type), line 197 (state)
- Pattern: Discriminated-union controlling conditional JSX branches (`{etat === "formulaire" && ...}`)

**n8n response normalizer:**
- Purpose: Decouple the frontend from n8n's execution-mode-dependent response shape
- Location: `app/api/audit/route.ts` lines 30–50
- Pattern: Imperative shape-detection with `Array.isArray` + `"output" in raw` discrimination

**`AuditResponse` / `AuditStats`:**
- Purpose: Single source of truth for the n8n payload contract
- Location: `types/audit.ts`
- Pattern: Nested interfaces with optional fields (`par_jour?`, `stats_par_jour?`) to cover legacy n8n outputs

**Score & benchmark computation:**
- Purpose: Derive a 0–100 performance score from `taux` no-show rate
- Location: `app/audit/page.tsx` — `calcScore(taux) = 100 - taux * 3.2` and `getScoreConfig(score)` thresholds
- Pattern: Pure helper functions at module scope, applied to `stats.global.taux`

## Entry Points

**Landing page:**
- Location: `app/page.tsx`
- Triggers: Browser navigation to `/`
- Responsibilities: Marketing content (hero, features, scroll animation, testimonials, FAQ, CTA to `/audit`)

**Audit page:**
- Location: `app/audit/page.tsx`
- Triggers: Browser navigation to `/audit` (CTAs from landing)
- Responsibilities: Complete audit flow — form, upload, loading, results, PDF, error handling

**Audit API proxy:**
- Location: `app/api/audit/route.ts`
- Triggers: Client `POST /api/audit` with `FormData`
- Responsibilities: Proxy CSV upload to n8n, normalize three possible response shapes, translate errors

**Google Places API proxy:**
- Location: `app/api/google-places/route.ts`
- Triggers: Client `GET /api/google-places?input=<cabinet>`
- Responsibilities: Query Google Places "findplacefromtext", return `{ found, name, rating, user_ratings_total, formatted_address }`

## Error Handling

**Strategy:** Try/catch at every boundary with user-facing French toast/inline messages.

**Patterns:**
- API routes: wrap `fetch` in `try/catch`, return `Response.json({ success: false, error }, { status: 500 })`
- API routes use `AbortSignal.timeout(55000)` (audit) and `AbortSignal.timeout(8000)` (Google) to bound external calls
- Client page: on non-OK response or thrown error, sets `etat = "erreur"` with a retry CTA
- Toast notifications (`react-hot-toast`) signal validation errors (missing file, bad email, etc.)

## Cross-Cutting Concerns

**Logging:** `console.error` in API route catch blocks. No structured logger, no Sentry.

**Validation:** Client-side only — manual checks on file presence, email format, `nomCabinet` non-empty; no Zod/Yup. Server-side API routes validate presence of query params and env vars only.

**Authentication:** None. The audit tool is public; lead capture is via email field, forwarded to n8n.

**Configuration:**
- Env vars loaded by Next.js runtime: `N8N_WEBHOOK_URL` (falls back to hardcoded default), `GOOGLE_PLACES_API_KEY`
- `.env.local` holds developer values; `.env.example` lists required keys

**Styling:** Tailwind CSS v3 with semantic tokens in `tailwind.config.ts` (`primary`, `accent`, `danger`, `success`, `warning`, `navy`, `ink`). Dark theme (`bg-ink text-white`) set in `app/layout.tsx`.

**Rendering model:** App Router with client-component pages. No SSR/ISR benefit taken — both pages declare `"use client"`. Root layout (`app/layout.tsx`) is the only server component and injects the global `Toaster`.

**Business invariant (do not violate):** `ca_perdu_an` is already annualized by n8n. The frontend must **never** multiply it again (`* 12` or `* (12 / nb_mois)`). Treat values from `stats.global.ca_perdu_an` as final.

---

*Architecture analysis: 2026-04-22*
