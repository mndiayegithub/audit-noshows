# Phase 1: Refonte Landing v2 — Research

**Researched:** 2026-04-22
**Domain:** Next.js 14 App Router theming (next-themes) + Tailwind v3 dark mode + Framer Motion marquee + Lighthouse perf budget
**Confidence:** HIGH

---

## Summary

Cette phase refond `app/page.tsx` en une landing B2B dark-premium (direction Apple Health clinical / Linear-like) avec un toggle dark/light fonctionnel, sans régression sur `/audit`. Le stack actuel (Next.js 14.2.18 App Router, React 18, Tailwind 3.4.15, Framer Motion 12.34.3) est déjà capable de porter tous les REQs. Une seule nouvelle dépendance est requise : `next-themes@^0.4.6` [VERIFIED: `npm view next-themes version` → 0.4.6, publié 2025-03-11].

Trois points d'attention non évidents ressortent de l'audit du code existant :

1. **`app/layout.tsx` hard-code `className="... bg-ink text-white"`** sur `<body>` — cette règle écrase tout thème et doit être retirée/remplacée par des tokens réactifs au thème.
2. **`/audit/` n'a pas de `layout.tsx`** — il faut en créer un avec `forcedTheme="light"` pour imperméabiliser la page audit au toggle (REQ-1.12).
3. **`globals.css` importe les fonts via `@import url(...)` Google Fonts** — pattern render-blocking. Migration vers `next/font/google` (déjà disponible dans Next 14) recommandée pour sécuriser Lighthouse ≥ 85 (REQ-1.11).

**Primary recommendation:** Installer `next-themes@^0.4.6`, configurer Tailwind `darkMode: 'class'`, introduire des CSS variables `--landing-*` (dark par défaut, override sur `.light`), créer `app/audit/layout.tsx` avec `forcedTheme="light"`, et migrer les fonts vers `next/font` avant de commencer les composants.

---

## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01** : Utiliser `next-themes` (lib standard Next.js theming) — pas Tailwind dark: class seule, pas custom.
- **D-02** : `defaultTheme="system"` (respect `prefers-color-scheme`) pour le premier load.
- **D-03** : Toggle thème visible dans `LandingNav` (soleil / lune / système).
- **D-06** : Nouveaux composants sous `components/landing/` — breakdown : `LandingNav`, `LandingHero`, `LandingHowItWorks`, `LandingSocialProof`, `LandingFaqCta`, `LandingFooter`, `ReportPreview`, `ThemeToggle`, `Marquee`.
- **D-09** : Marquee via Framer Motion (déjà en stack, pas de nouvelle dépendance).
- **D-10** : Pause on hover activée sur le marquee.
- **D-12** : Archiver `landing.html`, `landing-preview.html`, `mockup.html` vers `archive/landings-v1/` (ne pas supprimer).

### Claude's Discretion

- Nom exact des CSS variables (ex. `--landing-bg` vs `--surface-0`) — à arbitrer par le planner.
- Choix `attribute="class"` vs `attribute="data-theme"` → verdict de cette recherche : **`class`** (voir §1).
- Stratégie fonts (CSS import vs `next/font`) → verdict : **`next/font`** (voir §5).
- Composition interne de `LandingHero` (split 2 cols vs stacked) → direction sketch `005-hero-impact/`.

### Deferred Ideas (OUT OF SCOPE)

- Tests Playwright / Vitest (phase 6 prévue dans ROADMAP).
- i18n / multilingue (FR seulement).
- Animations Spline 3D (lourd, bannir du hero).
- A/B testing framework.

---

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| REQ-1.1 | Nouvelle landing remplace `app/page.tsx` | §6 extraction `CountUpNumber`, §7 structure fichiers |
| REQ-1.2 | Toggle dark/light sans flash | §1 `suppressHydrationWarning` + `disableTransitionOnChange` |
| REQ-1.3 | `defaultTheme="system"` | §1 config `ThemeProvider` |
| REQ-1.4 | Messaging B2B cabinets FR | hors périmètre recherche tech, voir SKILL design ref |
| REQ-1.5 | Social proof (marquee logos + 4 stats) | §4 Framer Motion marquee |
| REQ-1.6 | Section "How it works" 3 étapes | CSS layout standard |
| REQ-1.7 | FAQ 4 questions métier | pattern collapse accessible |
| REQ-1.8 | CTA unique vers `/audit` (pas de Calendly) | § protection audit, REQ-1.12 |
| REQ-1.9 | `ReportPreview` intégré dans hero | §6 réutilisation `CountUpNumber` |
| REQ-1.10 | Responsive 375 / 768 / 1440 | breakpoints Tailwind `sm/md/lg` |
| REQ-1.11 | Lighthouse Performance ≥ 85 desktop | §5 budget perf (fonts, content-visibility, backdrop-filter) |
| REQ-1.12 | Zéro régression sur `/audit` | §2 `app/audit/layout.tsx` avec `forcedTheme="light"` |
| REQ-1.13 | Archiver les anciens HTML | §7 dossier `archive/landings-v1/` |
| REQ-1.14 | Accessibilité (AA contraste + reduced-motion) | §4 `useReducedMotion`, §5 checklist WCAG |

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Theme preference storage | Browser (localStorage) | — | next-themes gère tout client-side, zéro backend |
| Theme resolution (system) | Browser | — | `window.matchMedia('(prefers-color-scheme: dark)')` |
| Pré-application thème au first paint | Frontend Server (SSR inline script) | Browser | Script inline injecté par next-themes dans `<head>` |
| Theme scoping `/audit` | Frontend Server (nested layout) | — | `app/audit/layout.tsx` force light côté SSR |
| Marquee animation | Browser (Framer Motion RAF) | — | Non SSR, uniquement rendu client |
| Fonts loading | Frontend Server (`next/font`) | CDN | `next/font` auto-host les fonts Google au build |
| CSS variables cascade | Browser | — | Appliquées via `.dark` / `.light` sur `<html>` |

Tous les composants landing sont purement présentationnels. Pas de backend call dans cette phase. L'API `/api/audit` reste intacte.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next-themes | ^0.4.6 | Theme switching SSR-safe pour App Router | Lib officiellement recommandée par la doc Next.js theming [VERIFIED: npm view next-themes version → 0.4.6, 2025-03-11]. Intégration native Tailwind `darkMode: 'class'`. |
| tailwindcss | 3.4.15 (existant) | Utility classes + darkMode:'class' | Déjà en stack [VERIFIED: package.json]. v3 suffisante (pas besoin v4 pour cette phase). |
| framer-motion | 12.34.3 (existant) | Marquee, hover states, stagger | Déjà utilisé dans le projet [VERIFIED: package.json]. API `useAnimationControls`, `useReducedMotion`, `motion.div` couvrent tout le besoin. |
| lucide-react | 1.7.0 (existant) | Icônes (Sun, Moon, Monitor pour toggle) | Déjà utilisé [VERIFIED: package.json, app/page.tsx actuel]. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| next/font/google | built-in Next 14 | Self-hosting fonts Google + preload auto | Remplace `@import url()` de `globals.css` pour gagner ~200-400ms LCP [CITED: nextjs.org/docs/app/building-your-application/optimizing/fonts] |
| clsx (existant) | 2.1.1 | Composition conditionnelle de classes | Déjà en stack, utile pour `cn(isActive && "dark:bg-...")` |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| next-themes | CSS `prefers-color-scheme` only | [ASSUMED] Pas de toggle utilisateur possible, pas de persistance. Rejeté par D-01. |
| next-themes | Zustand + manual class toggle | Ajoute complexité, recrée ce que next-themes fait, et doit réimplémenter la prévention du flash. Non-standard. |
| Framer Motion marquee | CSS `@keyframes` pure | ~30% moins de CPU [ASSUMED basé sur discussions communauté], mais pause-on-hover (D-10) et `prefers-reduced-motion` plus verbeux à câbler. Framer déjà en stack → préférable. |
| `next/font` | garder `@import url(...)` | Render-blocking, nuit LCP [CITED: web.dev/font-best-practices]. À migrer pour sécuriser REQ-1.11. |
| Tailwind v4 (via upgrade) | v3.4.15 actuel | Migration majeure hors scope phase. v3 gère `darkMode:'class'` nativement. |

**Installation :**
```bash
npm install next-themes
```

**Version verification :**
```bash
npm view next-themes version
# → 0.4.6 (publié 2025-03-11) [VERIFIED]
```

---

## Architecture Patterns

### System Architecture Diagram

```
┌──────────────────────────────────────────────────────────────┐
│ BROWSER — First paint                                        │
│                                                              │
│  1. HTML arrives (SSR) ── <html lang="fr" suppressHydr...>  │
│  2. <head> inline script (injected by next-themes) runs     │
│     BEFORE React hydration:                                  │
│       - reads localStorage['theme']                          │
│       - if "system" → reads matchMedia                       │
│       - adds class "dark" or "light" to <html>               │
│  3. CSS vars cascade :                                       │
│       :root { --landing-bg: #0A0A0C; ... }  (dark default)  │
│       .light { --landing-bg: #F7F7F8; ... }  (override)     │
│  4. React hydrates, ThemeProvider reconciles                 │
└──────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│ ROUTE TREE                                                   │
│                                                              │
│  app/layout.tsx                                              │
│   └─ <ThemeProvider attribute="class"                        │
│                     defaultTheme="system"                    │
│                     enableSystem                             │
│                     disableTransitionOnChange>               │
│      │                                                       │
│      ├─ app/page.tsx  (landing — utilise toggle)             │
│      │   └─ LandingNav → ThemeToggle → setTheme("light")     │
│      │                                                       │
│      └─ app/audit/layout.tsx  ◄── NEW                        │
│          └─ <ThemeProvider forcedTheme="light"               │
│                             enableSystem={false}>            │
│              └─ app/audit/page.tsx  (toujours light)         │
└──────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│ USER TOGGLES (ThemeToggle cliqué sur landing)                │
│                                                              │
│  setTheme("light")                                           │
│    ↓                                                         │
│  next-themes :                                               │
│    - écrit localStorage['theme'] = "light"                   │
│    - remplace class "dark" → "light" sur <html>              │
│    - (disableTransitionOnChange: suppress CSS transitions    │
│       pendant 1 tick pour éviter flash multi-couleurs)       │
│    ↓                                                         │
│  CSS vars bascule instantanément                             │
│    → tous les composants avec `bg-landing-bg` re-peignent    │
│                                                              │
│  Navigation vers /audit :                                    │
│    - app/audit/layout.tsx nested ThemeProvider prend le      │
│      dessus avec forcedTheme="light"                         │
│    - toggle utilisateur conservé pour retour sur landing     │
└──────────────────────────────────────────────────────────────┘
```

### Recommended Project Structure
```
app/
├── layout.tsx                    # ThemeProvider racine (retirer bg-ink hard-codé)
├── page.tsx                      # assemblage des 6 sections landing
├── globals.css                   # CSS vars :root (dark) + .light + @tailwind dirs
└── audit/
    ├── layout.tsx                # NEW — forcedTheme="light" (protège /audit)
    └── page.tsx                  # existant, inchangé

components/
├── landing/
│   ├── LandingNav.tsx            # sticky glass + ThemeToggle
│   ├── LandingHero.tsx           # split 2 cols + ReportPreview
│   ├── LandingHowItWorks.tsx     # 3 steps
│   ├── LandingSocialProof.tsx    # <Marquee /> + 4 stats
│   ├── LandingFaqCta.tsx         # FAQ 4Q collapse + section CTA finale
│   ├── LandingFooter.tsx
│   ├── ReportPreview.tsx         # mini preview rapport (hero right col)
│   ├── ThemeToggle.tsx           # bouton soleil/lune/système
│   └── Marquee.tsx               # primitive Framer Motion pause-on-hover
├── theme/
│   └── ThemeProvider.tsx         # "use client" wrapper next-themes
└── ui/
    └── CountUpNumber.tsx         # extrait depuis app/page.tsx actuel

archive/
└── landings-v1/
    ├── landing.html
    ├── landing-preview.html
    ├── mockup.html
    └── README.md                 # date + raison du snapshot
```

### Pattern 1: next-themes setup avec Next.js 14 App Router

**What:** Wrapper client isolé pour next-themes, injecté dans le root layout.
**When to use:** Une seule fois dans `app/layout.tsx` racine.

```tsx
// components/theme/ThemeProvider.tsx
// Source: https://github.com/pacocoursey/next-themes (README — App Router section)
"use client";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

export function ThemeProvider(props: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props} />;
}
```

```tsx
// app/layout.tsx (modifié)
// Source: next-themes README + Next.js 14 App Router docs
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-landing-bg text-landing-text">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**Notes critiques :**
- `suppressHydrationWarning` sur `<html>` : obligatoire. Sans ça, React émet un warning à chaque load parce que next-themes mute la className côté client avant l'hydration.
- `disableTransitionOnChange` : évite un flash multicolore quand l'utilisateur toggle (neutralise momentanément `transition-colors`, `transition-all`).
- `attribute="class"` : meilleur ROI avec Tailwind `darkMode:'class'` — `dark:` fonctionne directement.
- Retirer `bg-ink text-white` actuel de `<body>` : ces classes figées cassent le theming.

### Pattern 2: Scope `/audit` immune au toggle (REQ-1.12)

```tsx
// app/audit/layout.tsx — NEW FILE
// Source: next-themes README — forcedTheme section
"use client";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

export default function AuditLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      forcedTheme="light"
      enableSystem={false}
    >
      {children}
    </ThemeProvider>
  );
}
```

`forcedTheme` override toute préférence (localStorage, système, toggle) pour les routes enfants. next-themes supporte officiellement le nesting depuis 0.3 [CITED: https://github.com/pacocoursey/next-themes README "Forced page theme"]. La page `/audit` sera donc en light quelle que soit l'action utilisateur sur la landing.

### Pattern 3: Marquee Framer Motion pause-on-hover (D-09, D-10)

```tsx
// components/landing/Marquee.tsx
"use client";
import { motion, useReducedMotion } from "framer-motion";
import { useState, type ReactNode } from "react";

type Props = { children: ReactNode; durationSec?: number };

export function Marquee({ children, durationSec = 35 }: Props) {
  const [paused, setPaused] = useState(false);
  const prefersReduced = useReducedMotion();

  return (
    <div
      className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Défilement de logos clients"
    >
      <motion.div
        className="flex gap-12 w-max will-change-transform"
        animate={prefersReduced ? { x: 0 } : { x: paused ? undefined : ["0%", "-50%"] }}
        transition={{ duration: durationSec, repeat: Infinity, ease: "linear" }}
      >
        {children}
        {/* Duplication obligatoire pour un loop sans coupure */}
        <div className="flex gap-12" aria-hidden="true">{children}</div>
      </motion.div>
    </div>
  );
}
```

**Points clés :**
- `x: ["0%", "-50%"]` + duplication des enfants = illusion d'un défilement infini. Quand `-50%` est atteint, le 2e bloc arrive exactement là où le 1er était.
- `paused ? undefined : [...]` : `undefined` fait reprendre l'animation là où elle en était (pas de reset).
- `ease: "linear"` : obligatoire, sinon l'animation pulse.
- `useReducedMotion()` : désactive le défilement si l'utilisateur a `prefers-reduced-motion: reduce` (REQ-1.14).
- `aria-hidden="true"` sur la copie : empêche les lecteurs d'écran d'annoncer les logos en double.
- `will-change: transform` (via classe Tailwind `will-change-transform`) : hint GPU composition.

### Pattern 4: CSS variables pour tokens landing

```css
/* app/globals.css — à réécrire */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Tokens landing — dark par défaut (correspond au design v2 premium) */
:root {
  --landing-bg: #0A0A0C;
  --landing-bg-elevated: rgba(255, 255, 255, 0.04);
  --landing-surface: rgba(255, 255, 255, 0.06);
  --landing-text: #F5F5F7;
  --landing-text-secondary: rgba(245, 245, 247, 0.7);
  --landing-border: rgba(255, 255, 255, 0.08);
}

/* Override light — next-themes applique .light sur <html> */
.light {
  --landing-bg: #F7F7F8;
  --landing-bg-elevated: #FFFFFF;
  --landing-surface: #F2F2F4;
  --landing-text: #1D1D1F;
  --landing-text-secondary: #424245;
  --landing-border: #E5E5E7;
}

/* Garder les utilities existantes (glass-dark, mesh-bg) si encore utilisées,
   mais leur rendre des variantes light via .light .glass-dark { ... } */
.light .mesh-bg {
  background-color: #F7F7F8;
  background-image:
    radial-gradient(ellipse 80% 60% at 70% -10%, rgba(139, 92, 246, 0.10) 0%, transparent 60%),
    radial-gradient(ellipse 50% 50% at 10% 60%, rgba(236, 72, 153, 0.08) 0%, transparent 55%);
}
```

```ts
// tailwind.config.ts — à étendre
const config: Config = {
  darkMode: 'class',  // ← AJOUT CRITIQUE
  content: [...],
  safelist: [...],
  theme: {
    extend: {
      colors: {
        // existants conservés (primary, accent, ink, ink-subtle, cyan, danger, success, warning, navy, background, surface)
        landing: {
          bg:              'var(--landing-bg)',
          'bg-elevated':   'var(--landing-bg-elevated)',
          surface:         'var(--landing-surface)',
          text:            'var(--landing-text)',
          'text-secondary':'var(--landing-text-secondary)',
          border:          'var(--landing-border)',
          'accent-violet': '#A78BFA',
          'accent-rose':   '#F472B6',
          'accent-orange': '#FB923C',
          'accent-alert':  '#FF6961',
        },
      },
      // fontFamily: étendre sans retirer existants
    },
  },
};
```

Avec cette config : `className="bg-landing-bg text-landing-text border-landing-border"` fonctionne en dark par défaut et en light après toggle, sans aucun `dark:` conditionnel nécessaire dans le JSX des composants.

### Anti-Patterns to Avoid

- **Hard-coder `bg-ink` ou `bg-white` dans les composants landing** : casse le toggle. Utiliser `bg-landing-bg`.
- **Utiliser `dark:` sur chaque classe** : verbeux, duplique l'info. Les CSS vars + cascade `.light` sont plus propres et performantes.
- **Oublier `suppressHydrationWarning`** : pollue la console en dev et signale une vraie erreur qui peut masquer d'autres.
- **Laisser `@import url('https://fonts.googleapis.com/...')`** : render-blocking, impacte LCP. Migrer vers `next/font/google`.
- **Imbriquer `<ThemeProvider>` à plusieurs niveaux sur la landing** : le nested provider est réservé au `forcedTheme` de `/audit`.
- **Animer `transform` ET `filter: blur()` simultanément sur le marquee** : double coût GPU. S'en tenir à `transform`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Theme persistence + system-preference detection + SSR flash prevention | Custom `useTheme` hook avec `localStorage` + `matchMedia` + script inline | `next-themes` | Le script inline anti-flash est non-trivial à écrire correctement. next-themes gère aussi les cas `storage` event cross-tab. |
| Font self-hosting Google Fonts | `<link preconnect>` + `<link preload>` + CSS `@import` manuels | `next/font/google` | Auto-hosting, subsetting automatique, zéro request au runtime, preload inline optimal [CITED: nextjs.org/docs/app/api-reference/components/font] |
| Infinite marquee | CSS `@keyframes` + JS for pause/reduce-motion | Framer Motion `motion.div` + `useReducedMotion` | Pause réactive (state) + reduce-motion gérés en une ligne. |
| Accessible FAQ collapse | `<details>/<summary>` ou toggle manuel | Conserver le pattern existant (FAQItem avec `aria-expanded` + Framer `AnimatePresence`) | Déjà fonctionnel dans `app/page.tsx` actuel — réutiliser, ne pas réinventer. |
| Viewport-triggered count-up | Setinterval + Date.now() | `CountUpNumber` existant (IntersectionObserver + RAF + ease-out cubic) | Déjà écrit et testé. Extraire dans `components/ui/`. |

**Key insight :** Chaque item ci-dessus est un nid-à-bugs si fait maison (race conditions, fuites de listeners, contradictions SSR/CSR). Tout est déjà disponible en dépendance ou dans le code existant.

---

## Common Pitfalls

### Pitfall 1: Flash of incorrect theme au first paint
**What goes wrong:** L'utilisateur a `localStorage['theme'] = 'light'`, mais la page apparaît en dark pendant ~200ms avant que React hydrate et applique la classe correcte.
**Why it happens:** Le HTML rendu côté serveur ne connaît pas `localStorage`. Sans mécanisme anti-flash, le premier paint utilise les valeurs par défaut.
**How to avoid:** next-themes injecte automatiquement un script inline dans `<head>` qui lit `localStorage` **avant** le premier paint et applique la classe. Il faut juste respecter 2 conditions :
1. `suppressHydrationWarning` sur `<html>`.
2. Ne pas forcer une classe `dark` ou `light` manuelle dans `app/layout.tsx`.
**Warning signs:** Si on observe un flash → vérifier qu'`app/layout.tsx` ne contient plus `bg-ink text-white` sur `<body>` (la règle actuelle masquerait le problème mais casserait le toggle).

### Pitfall 2: Tailwind `dark:` ne fonctionne pas après install next-themes
**What goes wrong:** `className="dark:bg-black"` reste inactif même après toggle.
**Why it happens:** Par défaut, Tailwind v3 utilise `darkMode: 'media'` (basé sur `prefers-color-scheme`). next-themes manipule la classe CSS, pas la media query.
**How to avoid:** Ajouter `darkMode: 'class'` dans `tailwind.config.ts`.
**Warning signs:** Toggle visible dans devtools (classe `.dark` sur `<html>`) mais styles inchangés.

### Pitfall 3: `/audit` hérite du toggle malgré `forcedTheme`
**What goes wrong:** Toggle en dark sur landing → aller sur `/audit` → page en dark alors qu'elle doit rester light.
**Why it happens:** Next.js 14 App Router ne re-render pas les layouts en cas de navigation intra-app. Si `forcedTheme` n'est pas bien scopé, la classe `.dark` reste sur `<html>`.
**How to avoid:** Le nested `<ThemeProvider forcedTheme="light">` dans `app/audit/layout.tsx` écrase la classe côté client à chaque mount. next-themes gère ce cas nativement [CITED: next-themes README `forcedTheme`].
**Warning signs:** Tester manuellement : toggle dark → nav `/audit` → devrait voir `<html class="light">`. Si `<html class="dark">` persiste, forcedTheme mal configuré.

### Pitfall 4: Marquee gap visible au loop
**What goes wrong:** Au moment où l'animation se réinitialise, on voit un espace vide.
**Why it happens:** Les enfants ne sont pas dupliqués, ou `x` va de `0` à `-100%` sur un seul bloc.
**How to avoid:** Dupliquer les enfants (2× même liste) et animer `x` de `0%` à `-50%`. Quand `-50%` est atteint, le 2e bloc occupe exactement la position initiale du 1er.
**Warning signs:** Œil humain perçoit un "saut" toutes les N secondes.

### Pitfall 5: Lighthouse < 85 à cause de `backdrop-filter: blur()`
**What goes wrong:** Même avec une landing CSS-only, Lighthouse tombe à 70-80.
**Why it happens:** `backdrop-filter: blur(24px)` est paint-heavy et désactive certaines optimisations de composition. Plusieurs cards glassmorphism superposées → gros coût sur le thread main.
**How to avoid:**
- Limiter blur à ≤ 16px (préférer 12-14px).
- Utiliser `will-change: transform` (pas `will-change: backdrop-filter`) sur éléments animés.
- `content-visibility: auto` sur sections sous le fold (SocialProof, FAQ, Footer).
- Preload les fonts via `next/font` (gain LCP direct).
**Warning signs:** Dans Lighthouse : "Avoid large layout shifts" ou "Main-thread work" > 3s.

### Pitfall 6: CLS non-zéro au toggle
**What goes wrong:** Cliquer sur le toggle shift la page de 2-3px.
**Why it happens:** Changement de font-family entre thèmes, ou de padding sur éléments `dark:`.
**How to avoid:** Les CSS vars ne changent que les couleurs, jamais les dimensions. Ne pas définir `dark:px-6 px-4`. Le REQ-1.11 (CLS = 0) dépend de cette discipline.
**Warning signs:** Lighthouse "CLS" > 0.05 après toggle.

### Pitfall 7: `next/font` + Tailwind `fontFamily` mal cablés
**What goes wrong:** Les fonts sont chargées mais Tailwind utilise toujours `-apple-system`.
**Why it happens:** `next/font` génère une variable CSS (ex. `--font-plus-jakarta`), qu'il faut référencer dans `tailwind.config.ts`.
**How to avoid:**
```tsx
// app/layout.tsx
import { Plus_Jakarta_Sans } from "next/font/google";
const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-plus-jakarta" });
// <html className={plusJakarta.variable}>
```
```ts
// tailwind.config.ts
fontFamily: { sans: ['var(--font-plus-jakarta)', 'Inter', 'sans-serif'] }
```
**Warning signs:** DevTools computed style montre `-apple-system` au lieu de `Plus Jakarta Sans`.

---

## Code Examples

### Example 1: ThemeToggle avec Sun/Moon/Monitor
```tsx
// components/landing/ThemeToggle.tsx
// Source: next-themes README + pattern shadcn-ui (adapté)
"use client";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Évite mismatch d'hydration (le thème n'est pas connu côté SSR)
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-9 w-24" aria-hidden />; // placeholder anti-CLS

  const options = [
    { value: "light",  Icon: Sun },
    { value: "system", Icon: Monitor },
    { value: "dark",   Icon: Moon },
  ] as const;

  return (
    <div role="radiogroup" aria-label="Thème d'affichage" className="inline-flex items-center gap-1 rounded-full border border-landing-border bg-landing-surface p-1">
      {options.map(({ value, Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={theme === value}
          aria-label={`Thème ${value}`}
          onClick={() => setTheme(value)}
          className={`grid place-items-center rounded-full p-1.5 transition-colors ${
            theme === value ? "bg-landing-bg-elevated text-landing-text" : "text-landing-text-secondary hover:text-landing-text"
          }`}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}
```

### Example 2: CountUpNumber extrait
```tsx
// components/ui/CountUpNumber.tsx
// Source: extrait de app/page.tsx actuel (lignes 16-52), isolé pour réutilisation
"use client";
import { useEffect, useRef, useState } from "react";

type Props = { target: number; decimals?: number; suffix?: string; className?: string };

export function CountUpNumber({ target, decimals = 0, suffix = "", className = "" }: Props) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      obs.disconnect();
      let start: number | null = null;
      const duration = 1800;
      const step = (ts: number) => {
        if (!start) start = ts;
        const progress = Math.min((ts - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(eased * target);
        if (progress < 1) requestAnimationFrame(step);
        else setCount(target);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);

  const formatted = decimals > 0
    ? count.toFixed(decimals).replace(".", ",")
    : Math.round(count).toString();

  return <span ref={ref} className={className}>{formatted}{suffix}</span>;
}
```

### Example 3: Section avec content-visibility (perf below-fold)
```tsx
// components/landing/LandingSocialProof.tsx (extrait)
export function LandingSocialProof() {
  return (
    <section
      className="py-24 bg-landing-bg-elevated"
      style={{ contentVisibility: "auto", containIntrinsicSize: "1px 800px" }}
    >
      {/* contenu */}
    </section>
  );
}
```
`content-visibility: auto` + `contain-intrinsic-size` : skip le paint/layout tant que la section est hors viewport. Gain typique LCP/TBT 200-500ms [CITED: web.dev/content-visibility].

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Pages Router + `_app.tsx` theming | App Router + `app/layout.tsx` + `"use client"` wrapper | Next.js 13.4 (mai 2023) | Nécessite le wrapper `"use client"` autour de `NextThemesProvider` car les Server Components ne peuvent pas fournir de context |
| `@import url(...)` Google Fonts | `next/font/google` auto-host | Next.js 13 stable (2023) | -200-400ms LCP, 0 layout shift |
| CSS `@keyframes` marquee | Framer Motion `motion.div` | Stable depuis Framer 6+ | Pause interactive + reduced-motion en un hook |
| `@media (prefers-color-scheme)` seul | `next-themes` + `darkMode:'class'` | Dès qu'un toggle utilisateur est requis | Permet override manuel + persistance |

**Deprecated/outdated:**
- `ContainerScroll` (components/ui/container-scroll-animation.tsx) : ne pas importer dans la nouvelle landing (style incompatible). Laisser le fichier en place pour usages futurs.
- `ShuffleTestimonials` (components/ui/testimonial-cards.tsx) : même logique, fichier non supprimé.
- `FaqSection` (components/ui/faq-section.tsx) : la nouvelle FAQ sera reconstruite dans `LandingFaqCta.tsx` avec le style dark-premium.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Next build + npm install | ✓ | ≥ 18 (Next 14 requiert 18.17+) | — |
| npm | Install `next-themes` | ✓ | — | — |
| next-themes | Theme switching | ✗ (pas installé) | à installer 0.4.6 | aucun — bloquant si non installé |
| framer-motion | Marquee + animations | ✓ | 12.34.3 | — |
| tailwindcss | Utility classes | ✓ | 3.4.15 | — |
| lucide-react | Icônes | ✓ | 1.7.0 | — |
| Lighthouse (Vercel preview ou CLI) | Mesure REQ-1.11 | Vercel preview OK (si déployé) / `npx lighthouse` localement | — | DevTools Lighthouse intégré |

**Missing dependencies with no fallback:** aucune — `next-themes` sera installé en task 1 du plan.

**Missing dependencies with fallback:** aucune.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Aucun test runner configuré actuellement (pas de Jest/Vitest/Playwright dans `package.json`) |
| Config file | — |
| Quick run command | `npm run build && npm run lint` (build + lint = boucle rapide) |
| Full suite command | `npm run build` + Lighthouse manuel sur preview Vercel |
| Phase gate | Build vert + Lighthouse desktop ≥ 85 + smoke manuel `/audit` intact |

**Décision acceptance (cohérente avec roadmap phase 6) :** les tests automatisés (Vitest/Playwright) sont hors scope de cette phase. La validation repose sur un mix build/lint automatisé + QA manuelle guidée par checklist.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| REQ-1.1 | Nouvelle landing remplace `app/page.tsx` | build | `npm run build` | ✅ |
| REQ-1.2 | Toggle sans flash | manual | DevTools → disable cache → reload 5× en dark, puis 5× en light | ✅ manuel |
| REQ-1.3 | `defaultTheme="system"` | manual | Chrome prefers-dark ON → premier visit → dark. prefers-light ON → light. | ✅ manuel |
| REQ-1.4 | Messaging FR B2B | manual | Relecture contenu avec checklist messaging (landing-page.md SKILL) | ✅ manuel |
| REQ-1.5 | Social proof marquee + 4 stats | manual + build | Visible, pause on hover, reduce-motion stop | ✅ manuel |
| REQ-1.6 | 3 étapes How it works | manual | Visible et responsive | ✅ manuel |
| REQ-1.7 | FAQ 4 Q collapse | manual | Clic chaque Q → expand/collapse, keyboard (Tab+Enter) | ✅ manuel |
| REQ-1.8 | CTA unique → `/audit` | manual | Clic chaque CTA → URL = `/audit`. Aucun popup. | ✅ manuel |
| REQ-1.9 | ReportPreview dans hero | manual | Screenshot visual vs sketch 005 | ✅ manuel |
| REQ-1.10 | Responsive 375/768/1440 | manual | DevTools → 3 viewports → pas d'overflow, stacking OK | ✅ manuel |
| REQ-1.11 | Lighthouse ≥ 85 desktop | automated | `npx lighthouse https://<preview>.vercel.app --preset=desktop --only-categories=performance` | ✅ automated |
| REQ-1.12 | `/audit` intact | automated + manual | `npm run build` + `git diff app/audit/page.tsx app/api/audit/route.ts` = ∅ + smoke upload CSV | ✅ mixed |
| REQ-1.13 | Archive HTML legacy | automated | `ls archive/landings-v1/` montre les 3 fichiers + README | ✅ automated |
| REQ-1.14 | A11y (WCAG AA + reduced-motion) | manual | Axe DevTools extension → 0 erreur critique. Chrome prefers-reduced-motion → marquee stop. | ✅ manuel |

### Sampling Rate
- **Per task commit:** `npm run lint` (rapide < 5s)
- **Per wave merge:** `npm run build` + smoke manual page landing
- **Phase gate:** `npm run build` + Lighthouse preview + `/audit` smoke test + checklist manuelle REQ-1.2 à REQ-1.14

### Wave 0 Gaps
- [ ] Aucun test framework à installer (scope phase 1 exclut tests auto — voir phase 6 ROADMAP).
- [ ] Checklist de QA manuelle à rédiger dans VALIDATION.md (par le planner).
- [ ] Preview Vercel ou tunnel local (`vercel dev` ou `ngrok`) pour faire tourner Lighthouse sur une URL https.

---

## Security Domain

**Skip justification :** cette phase ne touche à aucune surface d'attaque — uniquement du rendu CSS/HTML côté client, pas de nouvel endpoint API, pas de gestion d'input utilisateur, pas de secrets. La seule dépendance ajoutée (`next-themes`) est une lib client-only à large adoption (> 1.5M downloads/semaine [ASSUMED basé sur notoriété npm]). Pas de flux d'authentification, pas de stockage de données sensibles, pas de cryptographie. Les CSP headers existants (si configurés ailleurs) restent inchangés.

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Auth | non | — |
| V3 Session | non | — |
| V4 Access Control | non | — |
| V5 Input Validation | non | — (pas d'input sur landing) |
| V6 Cryptography | non | — |
| V14 Config (CSP, headers) | tangentiel | Vérifier que l'inline script injecté par `next-themes` est compatible avec la CSP existante (si présente). next-themes utilise un nonce-friendly pattern [CITED: next-themes README]. |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | CSS marquee pur est ~30% moins lourd CPU que Framer Motion | Standard Stack — Alternatives | Faible — D-09 lock le choix Framer de toute façon. |
| A2 | next-themes a > 1.5M downloads/semaine | Security Domain | Nul (argumentaire, pas de décision technique dépendant de ce chiffre). |
| A3 | Lighthouse desktop atteint 92-98 sur hero similaire (Linear, Vercel) avec les mitigations listées | §5 Benchmarks | Moyen — si on descend sous 85 malgré mitigations, il faudra retirer backdrop-filter. Plan doit prévoir une task "perf fallback" en contingence. |
| A4 | SF Pro Display / New York Apple fonts ne peuvent pas être légalement embed | §Pitfalls | Faible — la stack utilise Plus Jakarta Sans + Outfit actuellement, fallback `-apple-system` suffit. |

**Vérifié / cité au lieu d'assumé :**
- next-themes version → `npm view next-themes version` = 0.4.6
- Stack actuel → `package.json` lu
- Comportements next-themes (`forcedTheme`, `disableTransitionOnChange`, `suppressHydrationWarning`) → README officiel pacocoursey/next-themes
- `next/font/google` → docs Next.js 14 App Router

---

## Open Questions

1. **CSP headers existants ?**
   - What we know : aucune config `next.config.js` CSP vue en quick scan.
   - What's unclear : si Vercel ou un middleware ajoute des headers `Content-Security-Policy` restrictifs, l'inline script de next-themes peut être bloqué.
   - Recommendation : vérifier `next.config.js` + headers Vercel preview en task 1. Si CSP strict, prévoir nonce propagation.

2. **Route `/audit` → doit-elle rester exactement identique (diff ∅) ou peut-on ajouter juste un wrapper layout ?**
   - What we know : REQ-1.12 = "zéro régression", API inchangée, build pass.
   - What's unclear : ajouter `app/audit/layout.tsx` est techniquement un nouveau fichier → pas une modif de `page.tsx`. À confirmer que le planner/verifier accepte cette lecture.
   - Recommendation : considérer que "zéro régression" = fonctionnel (rendu identique) et non "diff = 0". Ajouter le layout est la seule voie propre.

3. **Fonts exactes pour dark-premium (SF Pro / New York vs Plus Jakarta / serif Google) ?**
   - What we know : CONTEXT.md ne verrouille pas les fonts précises. Le SKILL mentionne Apple Health direction.
   - What's unclear : SF Pro Display n'est pas legit-embeddable. Substitut serif premium (Instrument Serif, Source Serif, Fraunces, New York fallback via `ui-serif` stack) ?
   - Recommendation : laisser le planner trancher. Recommandation tech : **`Instrument Serif`** (Google Fonts, esthétique proche New York) + Plus Jakarta Sans existant.

4. **Breakpoint intermédiaire entre 768 et 1440 ?**
   - What we know : REQ-1.10 cite les 3 breakpoints.
   - What's unclear : comportement entre 1024 et 1280 (laptops courants) — fallback `md:` suffit-il ?
   - Recommendation : tester manuellement 1024 et 1280 en plus de 1440 pendant la QA, mais pas de breakpoint custom.

---

## Sources

### Primary (HIGH confidence)
- next-themes README — https://github.com/pacocoursey/next-themes (sections "With app/", "Forced page theme", "Without CSS variables")
- Next.js 14 docs — https://nextjs.org/docs/app/building-your-application/optimizing/fonts (next/font)
- Tailwind CSS v3 docs — https://tailwindcss.com/docs/dark-mode (class strategy)
- `npm view next-themes version` → 0.4.6 (2025-03-11) [VERIFIED en session]
- Codebase lu : `app/page.tsx`, `app/layout.tsx`, `app/globals.css`, `tailwind.config.ts`, `package.json`, `app/audit/` [VERIFIED en session]

### Secondary (MEDIUM confidence)
- web.dev/content-visibility (skip paint below-fold)
- web.dev/font-best-practices (fonts perf)
- Framer Motion docs — `useAnimationControls`, `useReducedMotion`

### Tertiary (LOW confidence, non-bloquant)
- Benchmarks Lighthouse sur hero dark-premium — basé sur training data, à valider sur preview réelle.

---

## Metadata

**Confidence breakdown:**
- Standard stack : HIGH — versions vérifiées via `npm view` et `package.json` réel.
- Architecture : HIGH — patterns next-themes officiels, nested provider documenté.
- Pitfalls : HIGH — issus de bugs connus de la communauté + audit du code existant (`app/layout.tsx bg-ink` hard-codé, absence de `app/audit/layout.tsx`, `@import url(...)` fonts).
- Perf (Lighthouse ≥ 85) : MEDIUM — mitigations solides mais dépend du matériel de test ; à valider en preview.

**Research date:** 2026-04-22
**Valid until:** 2026-05-22 (30 jours, stack stable)
