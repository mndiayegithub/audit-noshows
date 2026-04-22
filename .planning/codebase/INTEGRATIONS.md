# External Integrations

**Analysis Date:** 2026-04-22

## APIs & External Services

**n8n Webhook (core backend):**
- Purpose: Receives the uploaded CSV, runs the audit + AI analysis workflow, returns stats and a Markdown report
- Env var: `N8N_WEBHOOK_URL`
- Default fallback (hardcoded in `app/api/audit/route.ts` line 8-9): `https://n8n.srv939707.hstgr.cloud/webhook/audit-flash`
- Transport: `fetch` with `multipart/form-data` (FormData forwarded as-is from the browser)
- Timeout: `AbortSignal.timeout(55000)` — 55 s client-side abort; route declares `maxDuration = 60` for serverless
- Auth: None (public webhook; security relies on URL obscurity)

**Calendly (embed/link):**
- Purpose: Post-audit booking CTA
- Integration: Link-out from `components/audit/CTACalendly.tsx` (no SDK; static URL)

**Spline (3D visuals):**
- Purpose: Embedded 3D scene in landing visuals
- SDK: `@splinetool/react-spline`, `@splinetool/runtime`
- Auth: None (public scene URL)

**Google (diagnostic display):**
- Purpose: Presents Google Business data in `components/audit/DiagnosticGoogle.tsx`
- Data source: Supplied inside the n8n response (typed as `GoogleData` in `types/audit.ts`); no direct Google API call from this Next.js app

**Image CDNs (Next Image):**
- `images.unsplash.com`, `images.pexels.com` — whitelisted in `next.config.js` `remotePatterns`

## Data Storage

**Databases:**
- None in this app — all persistence lives inside the n8n workflow backend

**File Storage:**
- None — uploaded CSV is streamed directly to n8n via the API proxy; never written to disk locally

**Caching:**
- None

## Authentication & Identity

**Auth Provider:**
- None — the audit tool is open / unauthenticated; a user email may be collected and forwarded to n8n as part of the form

## Monitoring & Observability

**Error Tracking:**
- None — errors surface via `console.error("Erreur API audit:", error)` in `app/api/audit/route.ts` and `react-hot-toast` on the client

**Logs:**
- Standard Next.js server logs (stdout) only

## CI/CD & Deployment

**Hosting:**
- Not declared in repo (no `vercel.json`, no Dockerfile, no `.github/workflows/`). Deployment target inferred as Vercel or similar Next.js-compatible host.

**CI Pipeline:**
- None detected

## Environment Configuration

**Required env vars:**
- `N8N_WEBHOOK_URL` — n8n webhook endpoint (optional at runtime; falls back to hardcoded production URL)

**Secrets location:**
- `.env.example` documents expected vars; actual `.env` is gitignored and not present in the repo
- No other secrets used (no API keys, no OAuth tokens, no DB credentials)

## Webhooks & Callbacks

**Incoming:**
- None — this app does not expose any webhook endpoint

**Outgoing:**
- `POST /api/audit` (client → Next) → `POST {N8N_WEBHOOK_URL}` (Next → n8n). Single outbound integration.

## API Proxy Pattern — `app/api/audit/route.ts`

The route is a thin `multipart/form-data` proxy whose sole job is to normalize n8n's response shape before returning JSON to the client.

**Flow:**
1. Client (`app/audit/page.tsx` line ~245) submits FormData (CSV + email) to `/api/audit`
2. Route reads `request.formData()` and forwards it unchanged to `N8N_WEBHOOK_URL`
3. Route awaits `response.json()` and unwraps the payload (see below)
4. Route returns the normalized `AuditResponse` (`types/audit.ts`) as JSON

**Response-shape normalization (3 formats handled, in priority order):**

1. **Test webhook (array)** — n8n test mode wraps the payload in an array:
   ```
   [{ output: { success, stats, rapport_texte }, email }]
   ```
   The route takes `raw[0]` and, if `first.output` contains `success`, uses `first.output`; otherwise uses `first` directly.

2. **Production (object with `output` wrapper)** — Respond-to-Webhook node with `JSON.stringify`:
   ```
   { output: { success, stats, rapport_texte }, email }
   ```
   The route unwraps to `raw.output`.

3. **Direct (legacy)** — older workflow returning the flat shape:
   ```
   { success, stats, rapport_texte }
   ```
   The route passes `raw` through untouched.

**Error handling:**
- Non-2xx from n8n → thrown `Error("n8n a répondu avec le statut : {status}")`
- Any thrown error → `Response.json({ success: false, error }, { status: 500 })`

**Business invariant (enforced downstream, not here):**
- `ca_perdu` / `ca_perdu_an` returned by n8n is already annualized. The frontend must never re-annualize (no `* 12`, no `* (12 / nb_mois)`).

---

*Integration audit: 2026-04-22*
