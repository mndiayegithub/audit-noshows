# Coding Conventions

**Analysis Date:** 2026-04-22

## Language & Strictness

**TypeScript** (`tsconfig.json`):
- `"strict": true` — full strict mode enabled (noImplicitAny, strictNullChecks, etc.)
- `"allowJs": true` — JS files tolerated
- `"jsx": "preserve"` — Next.js handles JSX transform
- `"moduleResolution": "bundler"` — modern Next.js 14 setup
- Path alias: `@/*` → project root (use `@/components/...`, `@/types/...`, `@/lib/...`)

**Linting** (`.eslintrc.json`):
- Minimal config: extends only `next/core-web-vitals`
- No custom rules, no Prettier config file present
- Run via `npm run lint` (`next lint`)

## Naming Patterns

**Mixed French/English identifiers** — the codebase uses French for domain/UI concepts and English for technical primitives. Preserve this convention.

**French (domain/business):**
- State machine type: `type Etat = "formulaire" | "loading" | "resultats" | "erreur"` (`app/audit/page.tsx:33`)
- State variables: `etat`, `nomCabinet`, `caMoyen`, `resultats`, `creneau`
- Business fields (from n8n): `ca_perdu`, `ca_perdu_an`, `ca_perdu_mois`, `taux`, `nb_mois`, `top_3_pires`, `top_3_meilleurs`, `par_jour`, `stats_par_praticien`, `honores`
- Component names: `GraphiqueParJour`, `GaugeBenchmark`, `RapportPDF`, `DiagnosticGoogle`, `ScoreGlobal`
- Comments: French (`// Pas de "use client" — ...`, `// Fond principal Noir Obsidienne`)

**English (React/technical):**
- Hooks: `useState`, `useEffect`, `useRef`, `useCallback`, `useDropzone`, `useInView`
- Utility helpers: `calcScore`, `getScoreConfig`, `fadeInUp`, `sectionVariants`
- Props and HTML attributes

**Files:**
- Components: `PascalCase.tsx` (`GaugeBenchmark.tsx`, `ScoreGlobal.tsx`, `RapportPDF.tsx`)
- Pages: lowercase Next.js conventions (`page.tsx`, `layout.tsx`, `route.ts`)
- Types: lowercase domain (`types/audit.ts`)
- Config: kebab/dot (`tailwind.config.ts`, `next.config.js`, `postcss.config.js`)

**Functions / variables:** `camelCase` (`calcScore`, `needleAngle`, `handleDownloadPDF`)
**Types / components:** `PascalCase` (`AuditStats`, `AuditResponse`, `ScoreCard`, `Etat`)
**Constants (local scope):** single-letter or SCREAMING when stylistic (`const R = 72; const CX = 96; const CIRC = 2 * Math.PI * R;` in `app/audit/page.tsx`)
**Color palette aliases:** capital single-letter namespace object `C` and styles `S` inside `RapportPDF.tsx` (e.g., `C.bg`, `C.gold`, `S.page`)

## File Organization

```
app/                # Next.js App Router
├── layout.tsx      # Root layout
├── page.tsx        # Landing (marketing)
├── globals.css     # Global styles
├── audit/page.tsx  # Full audit flow (all states)
└── api/
    ├── audit/route.ts         # n8n proxy (maxDuration = 60)
    └── google-places/         # Google Places API

components/         # Reusable UI
├── GaugeBenchmark.tsx         # Chart: doughnut + needle
├── GraphiqueParJour.tsx       # Chart: bar by day
├── audit/                     # Audit-specific
│   ├── CTACalendly.tsx
│   ├── DiagnosticGoogle.tsx
│   ├── RapportPDF.tsx         # @react-pdf/renderer document
│   └── ScoreGlobal.tsx
└── ui/                        # Generic/primitive (Aceternity-style)
    ├── container-scroll-animation.tsx
    ├── faq-section.tsx
    └── testimonial-cards.tsx

types/audit.ts      # All shared types (AuditStats, AuditResponse, GoogleData)
lib/                # Present but empty — reserved for helpers
public/             # Static assets + fonts
```

**Where to add new code:**
- New page → `app/<route>/page.tsx` (App Router)
- New API endpoint → `app/api/<name>/route.ts`
- New audit-specific component → `components/audit/<Component>.tsx`
- New generic UI primitive → `components/ui/<component-name>.tsx` (kebab-case accepted here)
- New shared type → append to `types/audit.ts` or create a new `types/<domain>.ts`
- Never introduce a second `types/` tree

## Component Patterns

**Client vs. Server:**
- Almost every component is a client component — `"use client"` directive on line 1
  - `app/page.tsx`, `app/audit/page.tsx`
  - `components/audit/CTACalendly.tsx`, `DiagnosticGoogle.tsx`, `ScoreGlobal.tsx`
  - `components/ui/*.tsx`
- **Exception:** `components/audit/RapportPDF.tsx` intentionally has **no** `"use client"` — it is imported dynamically and runs in the browser via `@react-pdf/renderer`. The leading comment documents this (`// Pas de "use client" — ce composant est importé dynamiquement`).
- The API route `app/api/audit/route.ts` is the only true server code (Next.js Route Handler).

**Single-page state machine** (`app/audit/page.tsx`):
- One `AuditPage` component owns the full flow
- State driver: `const [etat, setEtat] = useState<Etat>("formulaire")` with values `"formulaire" | "loading" | "resultats" | "erreur"`
- Keep the `Etat` union as the single source of truth for flow state; do not add parallel booleans (`isLoading`, `hasError`). Extend the union instead.

**Hooks patterns:**
- `useRef` + `IntersectionObserver` (hand-rolled) or `useInView` (from `framer-motion`) for on-scroll reveal animations
- `useEffect` with `requestAnimationFrame` + cubic easing (`1 - Math.pow(1 - t, 3)`) for animated counters and gauge needles
- Always clean up: `return () => obs.disconnect()` / `cancelAnimationFrame(raf)` / `clearTimeout(id)`
- `useCallback` for dropzone handlers

**Props typing:**
- Inline generic: `function GaugeBenchmark({ tauxActuel }: { tauxActuel: number })` (preferred for 1–2 props)
- Inline referencing a shared type: `function ScoreCard({ stats }: { stats: import("@/types/audit").AuditStats })`
- No separate `Props` interface files

**Framer Motion conventions:**
- Module-level `variants` objects: `fadeInUp`, `sectionVariants`, `containerVariants`
- Standard pattern: `initial="hidden"` + `whileInView="visible"` + `viewport={{ once: true, margin: "-50px" }}`
- Transition defaults: `duration: 0.5`, staggered delays `i * 0.06`

## Import Style

**Order observed** (`app/audit/page.tsx`):
1. React core (`useState`, `useEffect`, ...)
2. Third-party libraries (`react-dropzone`, `react-markdown`, `framer-motion`, `lucide-react`, `react-hot-toast`)
3. Next.js (`next/link`, `next/dynamic`)
4. Internal components via `@/` alias (`@/components/...`)
5. Types last, `import type { ... } from "@/types/audit"`

**Rules:**
- Always use path alias `@/` for internal modules — never relative `../../`
- Prefer named imports; `import type` for type-only imports
- Icon imports are grouped multi-line from `lucide-react`

## Tailwind Conventions

**Config:** `tailwind.config.ts` (TypeScript config, `Config` type imported from `tailwindcss`).

**Semantic color tokens** (always use these, never raw hex in JSX):
- `primary` (#4F46E5), `primary-light` (#6366F1) — CTA / gradient start
- `accent` (#7C3AED) — gradient end / secondary accent
- `cyan` (#06B6D4) — data highlights
- `ink` (#07080F), `ink-subtle` (#0E0F1C) — dark hero / dark cards
- `danger` (#EF4444), `success` (#10B981), `warning` (#F59E0B) — status
- `navy` (#0F172A), `background` (#F8FAFC), `surface` (#FFFFFF)

**Fonts:**
- `font-sans` → Plus Jakarta Sans / Inter
- `font-heading` → Outfit / DM Sans

**Dynamic class composition (safelist):**
```ts
safelist: [
  { pattern: /(bg|text|border|ring|placeholder|from|to|via)-(primary|accent|navy|danger|success|warning)/ }
]
```
When composing classes dynamically (e.g., `statusCls: "text-danger bg-danger/10 border-danger/30"`), stick to the semantic tokens above so they survive purging. Adding a new semantic color requires updating the safelist pattern.

**Utilities:** `clsx` + `tailwind-merge` are dependencies — use them for conditional class merging rather than manual template strings when complexity grows.

**Custom shadows:** `shadow-card`, `shadow-card-hover`, `shadow-soft`, `shadow-soft-hover`
**Custom animations:** `animate-blob`, `animate-float`, `animate-pulse-slow`
**Custom pattern:** `bg-plus-pattern` (inline SVG data URI)

## Error Handling

**API route** (`app/api/audit/route.ts`):
- Thin proxy pattern — forwards `multipart/form-data` to n8n, normalizes three response shapes (array / wrapped / direct) inline
- `export const maxDuration = 60` because n8n AI calls run ~30–50s
- Return JSON with `success: boolean` and `error?: string` fields matching `AuditResponse`

**Client:**
- `toast` (`react-hot-toast`) for user-facing success/error notifications
- `etat === "erreur"` state for fatal flow errors
- Optional chaining + `??` defaulting for n8n payload variability:
  - `stats.top_3_pires?.length ?? 0`
  - `(stats.global.ca_perdu_an ?? 0).toLocaleString("fr-FR")`

## Formatting & Display

**Currency:** Always `value.toLocaleString("fr-FR")` followed by `" €"` (e.g. `${ca_perdu_an.toLocaleString("fr-FR")} €`).
**Percentages:** Integer rounded when possible; one decimal via `toFixed(1)` only for deltas.
**Comments:** ASCII box dividers common (`/* ─── ScoreCard (dark) ─── */`, `// ─── Styles ──────────`).

## KEY BUSINESS RULE (Non-negotiable)

**`ca_perdu` / `ca_perdu_an` / `ca_perdu_mois` are already annualized by the n8n backend.**

The frontend must **NEVER** re-apply annualization:
- No `* 12`
- No `* (12 / nb_mois)`
- No `/ nb_mois * 12`

**Approved usages** (display as-is):
- `stats.global.ca_perdu_an.toLocaleString("fr-FR")` in KPI cards (`app/audit/page.tsx:105, :521`)
- `Math.round(c.ca_perdu).toLocaleString("fr-FR")` per-créneau in `RapportPDF.tsx:549`
- `caPerduAn={resultats.stats.global.ca_perdu_an}` passed to child components (`app/audit/page.tsx:648`, `ScoreGlobal.tsx:95`)
- PDF rendering in `RapportPDF.tsx:482, :491`

Any PR that introduces `ca_perdu * <number>` or `ca_perdu / nb_mois * <number>` is incorrect and must be rejected. If a monthly figure is needed, use the n8n-provided `ca_perdu_mois` directly.

## Logging

- No logging framework — `console.log` / `console.error` acceptable in API routes and dev-only branches
- No Sentry / observability wiring

## Comments

- French domain commentary is welcome and consistent with the codebase
- Section separators with Unicode box-drawing (`─`) are the norm
- JSDoc is not used — prefer TypeScript types for contracts

---

*Convention analysis: 2026-04-22*
