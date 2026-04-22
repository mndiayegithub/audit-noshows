# Codebase Structure

**Analysis Date:** 2026-04-22

## Directory Layout

```
system-audit-noshows/
├── app/                          # Next.js 14 App Router
│   ├── layout.tsx                # Root layout (html/body, Toaster, metadata)
│   ├── page.tsx                  # Landing page (marketing)
│   ├── globals.css               # Tailwind entry + global styles
│   ├── audit/
│   │   └── page.tsx              # Full audit flow (form → loading → results → error)
│   └── api/
│       ├── audit/route.ts        # Proxy POST → n8n webhook, normalizes response shapes
│       └── google-places/route.ts# Proxy GET → Google Places findplacefromtext
├── components/
│   ├── GaugeBenchmark.tsx        # Doughnut chart: cabinet rate vs dental-sector benchmark
│   ├── GraphiqueParJour.tsx      # Bar chart: no-shows per day of week
│   ├── audit/                    # Audit-flow-specific components
│   │   ├── ScoreGlobal.tsx       # Animated 0–100 score component (alt to inline ScoreCard)
│   │   ├── DiagnosticGoogle.tsx  # Google reviews enrichment card
│   │   ├── CTACalendly.tsx       # Conversion CTA (Calendly booking)
│   │   └── RapportPDF.tsx        # @react-pdf/renderer document (dark theme)
│   └── ui/                       # Generic presentational components (mostly landing)
│       ├── container-scroll-animation.tsx  # Scroll-driven hero animation
│       ├── faq-section.tsx       # FAQ accordion
│       └── testimonial-cards.tsx # Shuffling testimonial cards
├── types/
│   └── audit.ts                  # AuditStats, AuditResponse, GoogleData interfaces
├── lib/                          # Present but currently empty
├── public/
│   ├── dental-cabinet-hero.jpg   # Landing hero image
│   ├── logo.png                  # Brand logo
│   └── fonts/                    # Self-hosted fonts
├── .planning/
│   └── codebase/                 # GSD codebase maps (this directory)
├── .cursor/                      # Cursor IDE rules
├── CLAUDE.md                     # Project instructions for Claude Code
├── PRD_V2.md                     # Product requirements document v2
├── README.md
├── landing.html                  # Standalone HTML landing mockup (not served by Next.js)
├── landing-preview.html          # Preview variant of landing mockup
├── mockup.html                   # Design mockup
├── package.json                  # Next 14.2.18, React 18.3, TS 5.6, Tailwind 3.4
├── tailwind.config.ts            # Semantic color tokens + safelist
├── tsconfig.json                 # Strict TS with @/* path alias
├── next.config.js
├── postcss.config.js
├── .eslintrc.json                # extends next/core-web-vitals
├── .env.example                  # Template env vars
└── .env.local                    # Local env vars (gitignored, contains webhook + API keys)
```

## Directory Purposes

**`app/`:**
- Purpose: Next.js 14 App Router root — defines all routes, layouts, and API handlers
- Contains: `layout.tsx`, page files per route, API route handlers under `api/`
- Key files: `app/page.tsx` (landing), `app/audit/page.tsx` (audit tool)

**`app/api/`:**
- Purpose: Server-side route handlers that proxy to external services
- Contains: One subdirectory per endpoint; each contains a `route.ts`
- Key files:
  - `app/api/audit/route.ts` — POST handler, `maxDuration = 60`, normalizes the 3 n8n response shapes
  - `app/api/google-places/route.ts` — GET handler, `maxDuration = 15`, queries Google Places Text Search

**`app/audit/`:**
- Purpose: The audit tool page — single client component (~708 lines) implementing the full flow
- Key file: `app/audit/page.tsx` — hosts the `Etat` state machine and the inline `ScoreCard`

**`components/`:**
- Purpose: All reusable React components
- Contains: Two top-level chart components plus two topical subfolders
- Key files:
  - `components/GaugeBenchmark.tsx` (159 lines) — doughnut + animated needle; prop `tauxActuel: number`
  - `components/GraphiqueParJour.tsx` (124 lines) — Chart.js bar; prop `parJour: ParJourItem[]`

**`components/audit/`:**
- Purpose: Components coupled to the audit flow / audit domain
- Key files:
  - `components/audit/ScoreGlobal.tsx` (194 lines) — alternative score component
  - `components/audit/DiagnosticGoogle.tsx` (263 lines) — Google reviews card, consumes `/api/google-places`
  - `components/audit/RapportPDF.tsx` (619 lines) — `@react-pdf/renderer` doc; dark theme (`#111111` bg, `#d4a843` gold)
  - `components/audit/CTACalendly.tsx` (83 lines) — booking CTA

**`components/ui/`:**
- Purpose: Generic presentational primitives used mainly by the landing page
- Key files:
  - `components/ui/container-scroll-animation.tsx` (85 lines)
  - `components/ui/faq-section.tsx` (96 lines)
  - `components/ui/testimonial-cards.tsx` (146 lines)

**`types/`:**
- Purpose: Shared TypeScript contracts
- Key file: `types/audit.ts` — `AuditStats`, `AuditResponse`, `GoogleData`

**`lib/`:**
- Purpose: Reserved for shared utilities. Currently empty; any future helpers (formatters, constants) belong here.

**`public/`:**
- Purpose: Static assets served at the site root
- Contains: `dental-cabinet-hero.jpg`, `logo.png`, `fonts/`
- Generated: No. Committed: Yes.

## Key File Locations

**Entry Points:**
- `app/layout.tsx` — Root layout (only server component; sets `<html lang="fr">`, global Toaster)
- `app/page.tsx` — `/` landing page (client component, marketing)
- `app/audit/page.tsx` — `/audit` main tool (client component, state machine)

**Configuration:**
- `next.config.js` — Next.js config
- `tailwind.config.ts` — Design tokens (`primary #0ea5e9`, `accent #8b5cf6`, `danger`, `success`, `warning`, `navy`, `ink`) + dynamic-class safelist
- `tsconfig.json` — Strict mode, `@/*` path alias → project root
- `postcss.config.js` — Tailwind + autoprefixer
- `.eslintrc.json` — `next/core-web-vitals`
- `.env.example` / `.env.local` — `N8N_WEBHOOK_URL`, `GOOGLE_PLACES_API_KEY`

**Core Logic:**
- `app/audit/page.tsx` — `Etat` state machine, upload handler, score calculation, PDF trigger
- `app/api/audit/route.ts` — n8n proxy + response normalization
- `app/api/google-places/route.ts` — Google enrichment proxy

**Testing:**
- Not applicable — no test framework is configured (no `jest.config`, `vitest.config`, no `*.test.*` or `*.spec.*` files)

## Naming Conventions

**Files:**
- Components: `PascalCase.tsx` (e.g., `GaugeBenchmark.tsx`, `RapportPDF.tsx`)
- UI primitives in `components/ui/`: `kebab-case.tsx` (e.g., `faq-section.tsx`)
- Next.js route files: lowercase reserved names (`page.tsx`, `layout.tsx`, `route.ts`)
- Config: `kebab-case` or canonical names (`tailwind.config.ts`, `.eslintrc.json`)

**Directories:**
- Route segments: lowercase (`audit/`, `api/`, `google-places/`)
- Component groupings: lowercase (`audit/`, `ui/`)

**Imports:**
- Absolute imports via `@/` alias (e.g., `@/components/GaugeBenchmark`, `@/types/audit`)

## Results Display Order

When `etat === "resultats"` in `app/audit/page.tsx`, sections render in this fixed order:

1. **KPI cards** — Total RDV, No-shows, Taux, CA perdu/an (line ~513)
2. **ScoreCard** — Animated 270° SVG gauge (0–100), inline in `app/audit/page.tsx`
3. **GaugeBenchmark** — `components/GaugeBenchmark.tsx` — doughnut comparing `stats.global.taux` vs dental benchmark
4. **GraphiqueParJour** — `components/GraphiqueParJour.tsx` — bar chart of `stats.par_jour`
5. **AI report** — `stats.rapport_texte` rendered via `react-markdown` + `remark-gfm`
6. **PDF download** — client-side `@react-pdf/renderer` → `components/audit/RapportPDF.tsx` → Blob download

`DiagnosticGoogle` and `CTACalendly` render alongside/after the report depending on enrichment availability.

## Where to Add New Code

**New audit flow UI section:**
- Add component under `components/audit/NewSection.tsx`
- Import and render in `app/audit/page.tsx` inside the `etat === "resultats"` block at the correct position in the order above

**New landing section:**
- Add under `components/ui/your-section.tsx` (kebab-case)
- Import in `app/page.tsx`

**New chart/visualization:**
- Add under `components/` root (top-level) if reusable, or `components/audit/` if audit-specific
- Follow `GaugeBenchmark.tsx`/`GraphiqueParJour.tsx` pattern: Chart.js with `react-chartjs-2`

**New API proxy:**
- Add `app/api/<endpoint>/route.ts`
- Export `maxDuration`, handler function(s), use `AbortSignal.timeout` for outbound calls
- Return `Response.json(...)` with explicit status on errors

**New shared type:**
- Add to `types/audit.ts` if audit-related, or create `types/<domain>.ts`

**Shared utility / helper:**
- Place under `lib/` (currently empty — first helper creates the convention)

**Static asset:**
- Place under `public/`; reference as `/filename.ext`

## Special Directories

**`.planning/codebase/`:**
- Purpose: GSD codebase maps (ARCHITECTURE.md, STRUCTURE.md, etc.)
- Generated: Yes (by `/gsd-map-codebase`). Committed: Yes.

**`.cursor/`:**
- Purpose: Cursor IDE project rules
- Generated: No. Committed: Yes.

**`.next/`:**
- Purpose: Next.js build output
- Generated: Yes (by `next dev`/`next build`). Committed: No.

**`node_modules/`:**
- Purpose: Installed dependencies
- Generated: Yes (by `npm install`). Committed: No.

**Loose HTML files at project root:**
- `landing.html`, `landing-preview.html`, `mockup.html` are standalone static HTML mockups (design references). They are **not** served by the Next.js app and are not imported by any TS file. Treat them as design artifacts.

---

*Structure analysis: 2026-04-22*
