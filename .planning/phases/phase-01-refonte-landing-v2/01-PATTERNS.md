# Phase 1: Refonte Landing v2 — Pattern Map

**Mapped:** 2026-04-22
**Files analyzed:** 15 (9 new + 5 modified + 1 new layout)
**Analogs found:** 14 / 15

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `components/theme/ThemeProvider.tsx` | provider (client wrapper) | event-driven (context) | — (no existing provider) | no-analog |
| `components/landing/ThemeToggle.tsx` | component (interactive control) | event-driven (setState) | `app/page.tsx` lines 143-180 (nav interactive state) | role-match |
| `components/landing/LandingNav.tsx` | component (layout/nav) | event-driven (scroll listener) | `app/page.tsx` lines 144-180 | exact |
| `components/landing/LandingHero.tsx` | component (presentational section) | request-response (none, pure render) | `app/page.tsx` lines 182-236 (HERO block) | exact |
| `components/landing/LandingHowItWorks.tsx` | component (presentational section) | request-response (none) | `app/page.tsx` HERO + `components/ui/faq-section.tsx` motion pattern | role-match |
| `components/landing/LandingSocialProof.tsx` | component (section with animation) | event-driven (marquee RAF) | `components/GaugeBenchmark.tsx` (Framer animation) + `app/page.tsx` CountUp | role-match |
| `components/landing/LandingFaqCta.tsx` | component (collapsible section + CTA) | event-driven (setState open/close) | `app/page.tsx` lines 54-89 (FAQItem) | exact |
| `components/landing/LandingFooter.tsx` | component (presentational footer) | request-response (none) | `app/page.tsx` nav block as structural analog | role-match |
| `components/landing/ReportPreview.tsx` | component (presentational mock) | request-response (none) | `app/page.tsx` lines 239-320 (Dashboard mockup) | exact |
| `components/landing/Marquee.tsx` | component (primitive animation) | event-driven (Framer motion RAF) | `components/ui/testimonial-cards.tsx` + `components/audit/ScoreGlobal.tsx` (useReducedMotion) | role-match |
| `components/ui/CountUpNumber.tsx` | component (extraction) | event-driven (IntersectionObserver + RAF) | `app/page.tsx` lines 15-52 (verbatim source) | exact |
| `app/audit/layout.tsx` | layout (nested scope) | config (SSR) | `app/layout.tsx` lines 11-29 | role-match |
| `app/page.tsx` (rewrite) | page (orchestration shell) | request-response (pure composition) | — (full rewrite) | new-shape |
| `app/layout.tsx` (modified) | layout (root) | config | self (current lines 11-29) | self |
| `app/globals.css` (modified) | config (tokens) | config | self (current lines 1-135) | self |
| `tailwind.config.ts` (modified) | config | config | self (current lines 1-63) | self |

---

## Pattern Assignments

### `components/theme/ThemeProvider.tsx` (provider, event-driven)

**Analog:** no direct existing analog — first context-provider wrapper in codebase.
**Reference:** RESEARCH.md §Pattern 1 (next-themes README).

**Required shape:**
```tsx
"use client";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

export function ThemeProvider(props: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props} />;
}
```

**Client-directive pattern** — consistent with every interactive component in the repo (see `app/page.tsx:1`, `components/ui/faq-section.tsx:1`, `components/audit/ScoreGlobal.tsx:1` — all start with `"use client";`).

---

### `components/landing/ThemeToggle.tsx` (component, event-driven)

**Analog:** `app/page.tsx` lines 143-180 (nav interactive state pattern) for `useState` + click handler idiom.
**Supplement:** RESEARCH.md Example 1.

**Client directive & imports pattern** (from `app/page.tsx:1-10`):
```tsx
"use client";
import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react"; // lucide-react already in stack
```

**Anti-CLS placeholder pattern** — mirror the anti-hydration idiom in `components/audit/ScoreGlobal.tsx` lines 60-77 (mount-gated rendering):
```tsx
useEffect(() => setMounted(true), []);
if (!mounted) return <div className="h-9 w-24" aria-hidden />;
```

**Icon sizing convention** — match `app/page.tsx:156` (`w-5 h-5`) and `app/page.tsx:71` (`w-5 h-5`). Use `h-4 w-4` inside the toggle buttons.

---

### `components/landing/LandingNav.tsx` (component, event-driven)

**Analog:** `app/page.tsx` lines 143-180 — **exact match** (existing nav with scroll listener).

**Scroll listener pattern** (lines 103-111):
```tsx
const [isScrolled, setIsScrolled] = useState(false);
useEffect(() => {
  const handleScroll = () => setIsScrolled(window.scrollY > 20);
  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, []);
```

**Sticky nav structure** (lines 144-151):
```tsx
<nav className={`fixed w-full z-50 transition-all duration-300 ${
  isScrolled ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-100" : "glass-panel"
}`}>
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between items-center h-20">
```

**Adaptation for v2:** replace hard-coded `bg-white/90` / `glass-panel` with theme-reactive tokens → `bg-landing-bg/80 backdrop-blur-md border-landing-border`. Add `<ThemeToggle />` in the right cluster next to the CTA.

**CTA button pattern** (line 171-176 — keep verbatim):
```tsx
<Link href="/audit" className="bg-primary text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-primary-light transition-all duration-200 shadow-md btn-glow">
  Lancer l'audit gratuit
</Link>
```

---

### `components/landing/LandingHero.tsx` (component, presentational)

**Analog:** `app/page.tsx` lines 182-236 — **exact match** (existing HERO structure).

**Section container pattern** (line 183):
```tsx
<section className="mesh-bg grid-overlay relative pt-32 pb-20 lg:pt-44 lg:pb-36 overflow-hidden min-h-[92vh] flex items-center">
  <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 w-full">
    <div className="grid lg:grid-cols-2 gap-16 items-center">
```

**Framer stagger variants** (lines 92-99 — reuse verbatim):
```tsx
const fadeInUp: any = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};
const staggerContainer: any = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};
```

**Headline pattern** (lines 201-205) — split typographic treatment:
```tsx
<motion.h1 variants={fadeInUp} className="text-5xl sm:text-6xl lg:text-7xl font-heading font-extrabold leading-[1.0] tracking-tight mb-7">
  <span className="text-white/50 block">...</span>
  <span className="text-white block">...</span>
  <span className="text-gradient-indigo block">...</span>
</motion.h1>
```
Adapt `text-white` → `text-landing-text`, `text-white/50` → `text-landing-text-secondary`.

**Micro-badges pattern** (lines 224-235):
```tsx
{[{ icon: ShieldCheck, label: "RGPD" }, ...].map(({ icon: Icon, label }) => (
  <span key={label} className="flex items-center gap-1.5 text-white/40 text-xs font-semibold">
    <Icon className="w-3.5 h-3.5" aria-hidden="true" />{label}
  </span>
))}
```

**CTA pair pattern** (lines 213-221) — primary `bg-primary` + ghost outline. Single CTA per REQ-1.8 (remove secondary anchor OR point both to `/audit`).

---

### `components/landing/ReportPreview.tsx` (component, presentational)

**Analog:** `app/page.tsx` lines 239-320 — **exact match** (existing dashboard mockup inside hero right col).

**Card shell pattern** (lines 239-246):
```tsx
<motion.div
  initial={{ opacity: 0, y: 30, scale: 0.96 }}
  animate={{ opacity: 1, y: 0, scale: 1 }}
  transition={{ duration: 0.7, delay: 0.3 }}
  className="relative hidden lg:block animate-float"
>
  <div className="glass-dark-strong rounded-3xl p-6 shadow-2xl relative z-10">
```

**Gauge SVG pattern** (lines 261-277): preserve the 75%-arc ring with `strokeDasharray="263.9"` gradient.

**KPI mini-card pattern** (lines 301-317):
```tsx
<div className="rounded-2xl bg-white/[0.04] border border-white/[0.07] p-3.5">
  <p className="text-white/40 text-[10px] font-medium uppercase tracking-wider mb-1.5">No-shows</p>
  <p className="font-mono text-white font-semibold text-lg tabular-nums">124</p>
  <p className="text-red-400 text-[10px] font-medium mt-0.5">↑ +12% /mois</p>
</div>
```
**Adapt:** `bg-white/[0.04]` → `bg-landing-surface`, `border-white/[0.07]` → `border-landing-border`, `text-white/40` → `text-landing-text-secondary`, `text-white` → `text-landing-text`.

**Use `CountUpNumber`** instead of static "124" / "18 600€" — per REQ-1.9 + Don't-Hand-Roll table in RESEARCH.md.

---

### `components/landing/LandingHowItWorks.tsx` (component, presentational)

**Analog:** partial — `components/ui/faq-section.tsx` lines 35-55 for the `whileInView` reveal pattern.

**Scroll-reveal pattern** (faq-section.tsx:35-47):
```tsx
<motion.div
  initial={{ opacity: 0, x: -24 }}
  whileInView={{ opacity: 1, x: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.5 }}
>
```

**Section container convention** (from `app/page.tsx:183`): `max-w-7xl mx-auto px-6 md:px-12`.

**3-step grid:** use `grid md:grid-cols-3 gap-8` (Tailwind standard), each step with a numbered badge, icon from `lucide-react`, heading (`font-heading`), and copy (`text-landing-text-secondary`).

---

### `components/landing/LandingSocialProof.tsx` (component, event-driven + IntersectionObserver)

**Analog:** extracted `CountUpNumber` (from `app/page.tsx:15-52`) for the 4 stats, plus `Marquee` primitive for the logo carousel.

**Content-visibility perf pattern** (RESEARCH.md Example 3):
```tsx
<section
  className="py-24 bg-landing-bg-elevated"
  style={{ contentVisibility: "auto", containIntrinsicSize: "1px 800px" }}
>
```

**Stats grid** — mirror `app/page.tsx:301-317` KPI card layout, but use `CountUpNumber target={X}` instead of static literals.

---

### `components/landing/Marquee.tsx` (component, Framer animation)

**Analog:** `components/audit/ScoreGlobal.tsx` lines 60-77 (`useReducedMotion` via `matchMedia`) — closest existing reduced-motion handling.

**Reduced-motion idiom** (ScoreGlobal.tsx:60-66):
```tsx
const [reducedMotion, setReducedMotion] = useState(false);
useEffect(() => {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  setReducedMotion(mq.matches);
  const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
  mq.addEventListener("change", handler);
  return () => mq.removeEventListener("change", handler);
}, []);
```
**Preferred for new code:** use `useReducedMotion()` from `framer-motion` (same behaviour, one hook) — RESEARCH.md §Pattern 3.

**Full marquee implementation:** copy verbatim from RESEARCH.md §Pattern 3 (pause-on-hover + duplicated children + `ease: "linear"` + `[mask-image:...]` fade edges).

---

### `components/landing/LandingFaqCta.tsx` (component, event-driven collapse)

**Analog:** `app/page.tsx` lines 54-89 (`FAQItem`) — **exact match**.

**Collapse structure** (lines 62-88 — reuse verbatim, adapt colors):
```tsx
<div className={`border-b border-gray-100 transition-all duration-300 ${isOpen ? "bg-gray-50" : ""}`}>
  <button
    onClick={onClick}
    className="w-full text-left py-6 px-6 flex justify-between items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 rounded"
    aria-expanded={isOpen}
  >
    <span className="font-heading font-semibold text-gray-900 text-lg pr-8">{q}</span>
    <ChevronDown className={`w-5 h-5 text-primary shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" />
  </button>
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="overflow-hidden"
      >
        <div className="pb-6 px-6 text-gray-600 leading-relaxed">{a}</div>
      </motion.div>
    )}
  </AnimatePresence>
</div>
```
**Adapt:** `border-gray-100` → `border-landing-border`, `bg-gray-50` → `bg-landing-surface`, `text-gray-900` → `text-landing-text`, `text-gray-600` → `text-landing-text-secondary`.

**Open-state management** (line 104): `const [openFaq, setOpenFaq] = useState<number | null>(0);` — keep first question open by default.

**FAQ content:** reduce from 6 to 4 questions per REQ-1.7 (select the 4 most business-critical from the existing `faqs` array at lines 119-138).

**Terminal CTA block:** after the FAQ, add a final CTA section — reuse hero CTA button pattern (`app/page.tsx:214-217`).

---

### `components/landing/LandingFooter.tsx` (component, presentational)

**Analog:** no dedicated footer exists — closest structural analog is `app/page.tsx` nav (`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` container).

**Logo pattern** (app/page.tsx:154-161):
```tsx
<div className="flex items-center gap-2.5">
  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
    <Activity className="w-5 h-5 text-white" aria-hidden="true" />
  </div>
  <span className="font-heading font-bold text-xl tracking-tight text-landing-text">PerfIAmatic</span>
</div>
```

**Token usage:** `bg-landing-bg-elevated`, `border-t border-landing-border`, `text-landing-text-secondary`.

---

### `components/ui/CountUpNumber.tsx` (extraction)

**Analog:** `app/page.tsx` lines 15-52 — **verbatim source**.

**Action:** extract to standalone file as shown in RESEARCH.md Example 2. Keep signature `{ target, decimals = 0, suffix = "", className = "" }` identical for drop-in compatibility with `ReportPreview` and `LandingSocialProof`.

---

### `app/audit/layout.tsx` (new layout)

**Analog:** `app/layout.tsx` lines 11-29 (root layout shape).

**Structural pattern from root layout:**
```tsx
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (...)
}
```

**Required content (RESEARCH.md §Pattern 2):**
```tsx
"use client";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

export default function AuditLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" forcedTheme="light" enableSystem={false}>
      {children}
    </ThemeProvider>
  );
}
```

**Critical:** does NOT render `<html>` / `<body>` (nested layouts never do in App Router — only root layout does).

---

### `app/layout.tsx` (modified)

**Current state** (lines 11-29):
```tsx
<html lang="fr">
  <body className="antialiased min-h-screen bg-ink text-white">
    {children}
    <Toaster ... />
  </body>
</html>
```

**Required changes:**
1. Add `suppressHydrationWarning` to `<html>`.
2. Replace hard-coded `bg-ink text-white` → `bg-landing-bg text-landing-text`.
3. Wrap `{children}` in `<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>`.
4. Import and apply `next/font/google` font variable on `<html className={plusJakarta.variable}>` (RESEARCH.md Pitfall 7).
5. Keep `<Toaster />` as-is (works in both themes).

**Font import pattern** (RESEARCH.md Pitfall 7):
```tsx
import { Plus_Jakarta_Sans } from "next/font/google";
const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-plus-jakarta" });
```

---

### `app/globals.css` (modified)

**Current state** (line 1): `@import url('https://fonts.googleapis.com/...')` — **must be removed** (migrating to `next/font`).

**Current tokens to preserve** (lines 24-92): `mesh-bg`, `grid-overlay`, `text-gradient-*`, `glass-dark`, `glass-dark-strong`, `glass-panel`, `btn-glow`. These are used in `app/audit/page.tsx` — keep them but add `.light .mesh-bg { ... }` overrides for landing toggle (RESEARCH.md §Pattern 4).

**New required content** (RESEARCH.md §Pattern 4):
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --landing-bg: #0A0A0C;
  --landing-bg-elevated: rgba(255, 255, 255, 0.04);
  --landing-surface: rgba(255, 255, 255, 0.06);
  --landing-text: #F5F5F7;
  --landing-text-secondary: rgba(245, 245, 247, 0.7);
  --landing-border: rgba(255, 255, 255, 0.08);
}

.light {
  --landing-bg: #F7F7F8;
  --landing-bg-elevated: #FFFFFF;
  --landing-surface: #F2F2F4;
  --landing-text: #1D1D1F;
  --landing-text-secondary: #424245;
  --landing-border: #E5E5E7;
}
```

**Remove:** the hard-coded `body { font-family: ...; background-color: #07080F; color: #F8FAFC; }` at lines 7-11 — superseded by Tailwind classes on `<body>` + CSS vars.

---

### `tailwind.config.ts` (modified)

**Current state** (lines 1-63): existing `colors` block (primary, accent, ink, cyan, danger, etc.) must be preserved for `/audit` compatibility.

**Required additions:**
1. Top-level `darkMode: 'class'` (RESEARCH.md Pitfall 2 — critical).
2. Extend `colors` with `landing.*` namespace referencing CSS vars (RESEARCH.md §Pattern 4 — see code block with `'var(--landing-bg)'`).
3. Extend `fontFamily.sans` to `['var(--font-plus-jakarta)', 'Plus Jakarta Sans', 'Inter', 'sans-serif']` (fallback chain preserves existing behaviour if var fails).
4. Extend safelist to include `landing-*` pattern:
```ts
safelist: [
  { pattern: /(bg|text|border|ring|placeholder|from|to|via)-(primary|accent|navy|danger|success|warning)/ },
  { pattern: /(bg|text|border)-landing-(bg|bg-elevated|surface|text|text-secondary|border)/ },
],
```

---

### `app/page.tsx` (full rewrite — orchestration shell)

**No analog** — new shape. The rewrite replaces ~800 lines of inline sections with a thin composition:

```tsx
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingHero } from "@/components/landing/LandingHero";
import { LandingHowItWorks } from "@/components/landing/LandingHowItWorks";
import { LandingSocialProof } from "@/components/landing/LandingSocialProof";
import { LandingFaqCta } from "@/components/landing/LandingFaqCta";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function HomePage() {
  return (
    <div className="min-h-screen font-sans overflow-x-hidden bg-landing-bg text-landing-text">
      <LandingNav />
      <LandingHero />
      <LandingHowItWorks />
      <LandingSocialProof />
      <LandingFaqCta />
      <LandingFooter />
    </div>
  );
}
```

**No `"use client"`** at this level — each subcomponent carries its own directive (mirrors the audit-page architecture where children handle interactivity).

---

## Shared Patterns

### Client Directive
**Source:** every interactive file — `app/page.tsx:1`, `components/ui/faq-section.tsx:1`, `components/audit/ScoreGlobal.tsx:1`, `components/GaugeBenchmark.tsx`.
**Apply to:** all `components/landing/*`, `components/theme/ThemeProvider.tsx`, `components/ui/CountUpNumber.tsx`, `app/audit/layout.tsx`.

```tsx
"use client";
```
Required whenever `useState`, `useEffect`, `useRef`, `motion`, or event handlers are used.

---

### Imports Convention
**Source:** `app/page.tsx:3-13`, `components/audit/ScoreGlobal.tsx:1-5`.
**Apply to:** all new landing files.

```tsx
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { UploadCloud, ShieldCheck, Activity } from "lucide-react";
import { SomeComponent } from "@/components/...";  // always use @/ path alias (tsconfig paths)
```

Path-alias `@/` is verified working in `app/page.tsx:11-13` (`@/components/ui/...`).

---

### Framer Motion Variants
**Source:** `app/page.tsx:92-99`.
**Apply to:** `LandingHero`, `LandingHowItWorks`, `LandingSocialProof`, `LandingFaqCta` (all sections that stagger reveal).

```tsx
const fadeInUp: any = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};
const staggerContainer: any = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};
```

Consider lifting to `components/landing/_motion.ts` if duplicated across 3+ files.

---

### Scroll-Reveal (whileInView)
**Source:** `components/ui/faq-section.tsx:35-47`.
**Apply to:** below-fold sections (`LandingSocialProof`, `LandingFaqCta`, `LandingFooter`).

```tsx
<motion.div
  initial={{ opacity: 0, y: 24 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.5 }}
>
```

---

### Container / Max-Width
**Source:** `app/page.tsx:151`, `app/page.tsx:184`.
**Apply to:** every top-level section in landing v2.

```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">    {/* nav */}
<div className="max-w-7xl mx-auto px-6 md:px-12">           {/* hero / sections */}
```

---

### Reduced-Motion Handling
**Source:** `components/audit/ScoreGlobal.tsx:60-66` (manual matchMedia).
**Preferred for new code:** `useReducedMotion()` from `framer-motion` (one-liner).
**Apply to:** `Marquee`, `LandingHero` (animated headlines), `ReportPreview` (animate-float).

```tsx
import { useReducedMotion } from "framer-motion";
const prefersReduced = useReducedMotion();
// gate animations with: prefersReduced ? {} : { ...animation }
```

---

### Theme Tokens (replace hard-coded colors)
**Source:** new CSS vars in `app/globals.css` (RESEARCH.md §Pattern 4).
**Apply to:** every `components/landing/*` file. Never hard-code `bg-white`, `text-black`, `bg-ink`, `text-white` inside landing components (RESEARCH.md Anti-Patterns).

| Replace | With |
|---------|------|
| `bg-white`, `bg-ink` | `bg-landing-bg` |
| `bg-white/[0.04]`, `bg-gray-50` | `bg-landing-surface` |
| `text-white` | `text-landing-text` |
| `text-white/60`, `text-gray-600` | `text-landing-text-secondary` |
| `border-white/[0.08]`, `border-gray-100` | `border-landing-border` |

**Preserve `text-primary` / `bg-primary` / `text-gradient-indigo`** — these are brand accents, theme-invariant.

---

### Accessibility Attributes
**Source:** `app/page.tsx:67` (`aria-expanded`), `app/page.tsx:72` (`aria-hidden="true"` on icons), `app/page.tsx:193` (ping animation structure).
**Apply to:** all interactive controls (`ThemeToggle`, `LandingFaqCta` buttons) and decorative icons.

```tsx
<ChevronDown aria-hidden="true" />
<button aria-expanded={isOpen} aria-controls={`faq-panel-${i}`}>
```

---

### Lucide Icon Sizing
**Source:** `app/page.tsx` uses `w-3.5 h-3.5` (micro-badge), `w-5 h-5` (nav/buttons), `w-9 h-9` (logo avatar).
**Apply to:** all landing components — match size scale per context.

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `components/theme/ThemeProvider.tsx` | provider | context | No existing React context providers in repo — this is the first. Shape is trivial (`<NextThemesProvider {...props} />`) and fully documented in next-themes README (see RESEARCH.md §Pattern 1). |

Note: no file-write modifications are required that lack an analog — the ThemeProvider shape is complete in RESEARCH.md.

---

## Metadata

**Analog search scope:** `app/`, `components/`, `types/`.
**Files scanned:** `app/page.tsx`, `app/layout.tsx`, `app/globals.css`, `app/audit/page.tsx` (directory listed), `tailwind.config.ts`, `package.json`, `components/GaugeBenchmark.tsx`, `components/GraphiqueParJour.tsx`, `components/audit/ScoreGlobal.tsx`, `components/audit/CTACalendly.tsx` (listed), `components/audit/DiagnosticGoogle.tsx` (listed), `components/audit/RapportPDF.tsx` (listed), `components/ui/faq-section.tsx`, `components/ui/container-scroll-animation.tsx` (listed), `components/ui/testimonial-cards.tsx` (listed).
**Pattern extraction date:** 2026-04-22.
**Stack confirmed:** Next 14.2.18, React 18.3.1, Tailwind 3.4.15, Framer Motion 12.34.3, lucide-react 1.7.0 — from `package.json`.
**Missing dep:** `next-themes` (to be installed — task 1 of plan).
