# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Design system source of truth

- `new_design.md` + `new_design_audit.html` are the canonical DA spec (clinique-claire, Inter, bg-gray-50, primary `#064E3B`, 4 pastel KPI semantic: bleu Volume / émeraude Signal / orange Taux / violet Argent). Use these when touching landing or audit-step UI.
- Old dark-premium skills are archived under `.claude/skills/_archive_v1-dark/` — do not reference.

## Commands

```bash
npm run dev       # Dev server on port 3000
npm run build     # Production build
npm run lint      # ESLint (next lint)
```

Required env variable: `N8N_WEBHOOK_URL` (defaults to the production n8n webhook if absent).

## Architecture

Single-flow Next.js 14 App Router app. There are only two pages:

- `app/page.tsx` — Landing page (marketing)
- `app/audit/page.tsx` — Full audit flow: CSV drag-and-drop upload → POST to `/api/audit` → results display (all states managed in a single `"use client"` page with `Etat` = `"formulaire" | "loading" | "resultats" | "erreur"`)

The API route `app/api/audit/route.ts` is a thin proxy: it forwards the `multipart/form-data` to n8n and normalizes three possible response shapes (see inline comments). `maxDuration = 60` because n8n AI calls can take ~30–50 s.

### Results display (`app/audit/page.tsx`)

The results section renders in this order:
1. KPI cards (total RDV, no-shows, CA perdu, taux)
2. `ScoreCard` — animated SVG 270° gauge (0–100 performance score; formula: `100 - taux * 3.2`)
3. `GaugeBenchmark` — doughnut chart comparing cabinet rate vs. dental sector benchmark
4. `GraphiqueParJour` — bar chart of no-shows by day of week
5. AI report (`rapport_texte`) rendered as Markdown via `react-markdown` + `remark-gfm`
6. PDF download button — generates the PDF client-side via `@react-pdf/renderer`

### Components

- `components/GaugeBenchmark.tsx` — Doughnut chart with animated needle; prop: `tauxActuel: number`
- `components/GraphiqueParJour.tsx` — Bar chart; prop: `data: ParJourItem[]` (normalized from `stats.par_jour` or `stats.stats_par_jour`)
- `components/audit/RapportPDF.tsx` — `@react-pdf/renderer` document; dark theme (bg `#111111`, gold `#d4a843`)

### Types

All shared types are in `types/audit.ts`:
- `AuditStats` — full stats shape from n8n (includes optional `par_jour`, `stats_par_jour`, `stats_par_praticien`)
- `AuditResponse` — top-level API response (`success`, `stats`, `rapport_texte`, `pdf_url`, `email_sent`)

## Key Business Rule

`ca_perdu` / `ca_perdu_an` is already annualized by n8n. **Never multiply it again** on the frontend (no `* 12`, no `* (12 / nb_mois)`). Display as-is in cards, charts, and PDF.

## Tailwind Design Tokens

Custom semantic colors (defined in `tailwind.config.ts`):
- `primary` — `#0ea5e9` (medical blue)
- `accent` — `#8b5cf6` (indigo)
- `danger` — `#EF4444`, `success` — `#10B981`, `warning` — `#F59E0B`
- `navy` — `#0F172A`, `background` — `#F8FAFC`, `surface` — `#FFFFFF`

The safelist pattern ensures all semantic color utilities survive purging even when composed dynamically.

## n8n Response Normalization

The three formats the API route handles (in order of priority):
1. **Array** (n8n test mode): `[{ output: { success, stats, rapport_texte }, email }]`
2. **Wrapped object** (production Respond-to-Webhook): `{ output: { success, stats, rapport_texte }, email }`
3. **Direct** (legacy): `{ success, stats, rapport_texte }`
