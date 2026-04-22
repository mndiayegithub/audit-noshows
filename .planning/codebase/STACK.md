# Technology Stack

**Analysis Date:** 2026-04-22

## Languages

**Primary:**
- TypeScript ^5.6.3 (strict mode enabled) — all application code under `app/`, `components/`, `types/`, `lib/`
- TSX — React components

**Secondary:**
- JavaScript (CommonJS) — `next.config.js`, `postcss.config.js`
- HTML — static prototypes at project root (`landing.html`, `landing-preview.html`, `mockup.html`)

## Runtime

**Environment:**
- Node.js 18+ (implicit — required by Next.js 14.2 and `AbortSignal.timeout` used in `app/api/audit/route.ts`)
- Next.js server runtime (default Node.js runtime for API routes; `maxDuration = 60` set in `app/api/audit/route.ts` for long-running n8n calls)

**Package Manager:**
- npm (lockfile `package-lock.json` present)

## Frameworks

**Core:**
- Next.js 14.2.18 — App Router (`app/` directory); API route at `app/api/audit/route.ts`
- React ^18.3.1 + React DOM ^18.3.1 — UI rendering, client components (`"use client"`)

**Testing:**
- Not detected — no Jest/Vitest/Playwright config or test files present

**Build/Dev:**
- Next.js CLI — `next dev`, `next build`, `next start`, `next lint` (see `package.json` scripts)
- PostCSS ^8.4.49 + Autoprefixer ^10.4.20 — CSS pipeline (`postcss.config.js`)
- TypeScript compiler ^5.6.3 (`noEmit: true`, `moduleResolution: "bundler"`, incremental builds via `tsconfig.tsbuildinfo`)

## Key Dependencies

**UI & Styling:**
- `tailwindcss` ^3.4.15 — utility-first CSS; config in `tailwind.config.ts` with custom semantic colors (`primary`, `accent`, `ink`, `navy`, `danger`, `success`, `warning`) and safelist pattern for dynamic color utilities
- `tailwind-merge` ^3.5.0 — class-name conflict resolution
- `clsx` ^2.1.1 — conditional className composition
- `framer-motion` ^12.34.3 — animations (hero sections, score card reveal)
- `lucide-react` ^1.7.0 — icon set used across audit and landing pages
- `@fontsource/inter` ^5.2.8, `@fontsource/plus-jakarta-sans` ^5.2.8 — self-hosted web fonts (dev deps)

**Charts & Data Viz:**
- `chart.js` ^4.5.1 — chart engine
- `react-chartjs-2` ^5.3.1 — React wrapper; used in `components/GaugeBenchmark.tsx` (doughnut) and `components/GraphiqueParJour.tsx` (bar)

**PDF Generation:**
- `@react-pdf/renderer` ^4.3.2 — client-side PDF generation in `components/audit/RapportPDF.tsx`; imported dynamically in `app/audit/page.tsx` to keep it out of the initial bundle

**Markdown & Content:**
- `react-markdown` ^9.0.1 — renders the AI-generated `rapport_texte` from n8n
- `remark-gfm` ^4.0.0 — GitHub Flavored Markdown plugin (tables, strikethrough, task lists)

**Forms & Interaction:**
- `react-dropzone` ^14.2.3 — CSV drag-and-drop upload in `app/audit/page.tsx`
- `react-hot-toast` ^2.4.1 — toast notifications for upload/error states

**3D / Visual (optional):**
- `@splinetool/react-spline` ^4.1.0 + `@splinetool/runtime` ^1.12.81 — Spline 3D scene embedding (landing visuals)

## Configuration

**TypeScript (`tsconfig.json`):**
- `strict: true`, `noEmit: true`, `jsx: "preserve"`, `moduleResolution: "bundler"`
- Path alias: `@/*` → `./*` (used throughout for `@/components/...`, `@/types/...`)
- Includes `.next/types/**/*.ts` for Next-generated types
- Next.js TS plugin registered

**Next.js (`next.config.js`):**
- `images.remotePatterns` — whitelists `images.unsplash.com` and `images.pexels.com` for `next/image`
- No custom webpack, headers, rewrites, or redirects

**Tailwind (`tailwind.config.ts`):**
- Content globs: `./pages/**`, `./components/**`, `./app/**`
- Safelist regex for dynamic semantic colors: `(bg|text|border|ring|placeholder|from|to|via)-(primary|accent|navy|danger|success|warning)`
- Custom animations: `blob`, `float`, `pulse-slow`
- Font families: `sans` → Plus Jakarta Sans / Inter; `heading` → Outfit / DM Sans

**PostCSS (`postcss.config.js`):**
- Plugins: `tailwindcss`, `autoprefixer`

**Lint (`.eslintrc.json`):**
- Extends `next/core-web-vitals` only (no custom rules)
- No Prettier config file detected

**Environment:**
- `.env.example` documents `N8N_WEBHOOK_URL` (single required var)
- No `.env` committed; actual env loaded by Next.js at runtime
- Route falls back to hardcoded default `https://n8n.srv939707.hstgr.cloud/webhook/audit-flash` if env var is absent (`app/api/audit/route.ts` line 8-9)

## Platform Requirements

**Development:**
- Node.js 18+ (for `AbortSignal.timeout` and Next.js 14 requirements)
- npm with `package-lock.json` present
- Port 3000 (default Next.js dev server)

**Production:**
- Any Node.js 18+ host supporting Next.js 14 (Vercel, Node server, Docker)
- Must expose `N8N_WEBHOOK_URL` env var (or rely on the hardcoded fallback)
- Serverless runtime must allow `maxDuration = 60` (Vercel Pro or self-hosted)

---

*Stack analysis: 2026-04-22*
