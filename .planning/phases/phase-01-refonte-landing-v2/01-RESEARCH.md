# Phase 1 — RESEARCH.md : Refonte Landing v2

**Date :** 2026-04-22
**Source :** Recherche produite inline (agent researcher rate-limité avant exécution). À compléter par le planner si gaps détectés.

---

## Current Stack (vérifié via `package.json`)

- `next@14.2.18` (App Router)
- `react@18.3.1`
- `tailwindcss@3.4.15`
- `framer-motion@12.34.3`
- `lucide-react@1.7.0`
- **`next-themes` : à installer** (pas présent)

`tailwind.config.ts` actuel : custom colors `primary/accent/cyan/ink/danger/...`, fonts `Plus Jakarta Sans` / `Outfit` (pas SF Pro Display ni New York serif encore). `darkMode` non configuré. Safelist présent pour sémantiques.

---

## 1. next-themes integration — Next.js 14 App Router

### Installation
```bash
npm install next-themes
```

### Setup SSR-safe dans App Router

**Étape 1 — Wrapper client** (fichier dédié pour isoler `"use client"`)

`components/theme/ThemeProvider.tsx` :
```tsx
"use client";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

export function ThemeProvider(props: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props} />;
}
```

**Étape 2 — Injection dans `app/layout.tsx`**

```tsx
// app/layout.tsx
import { ThemeProvider } from "@/components/theme/ThemeProvider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
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

### Pourquoi `attribute="class"`

- Compatible Tailwind v3 `darkMode: 'class'` natif — syntaxe `dark:bg-...`
- next-themes ajoute/enlève `.dark` sur `<html>` (ou `.light`)
- Plus simple à troubleshoot que `data-theme` custom

### Pourquoi `suppressHydrationWarning` sur `<html>`

next-themes lit `localStorage` côté client après SSR. Le server rend `<html class="">` (vide), le client hydrate avec `<html class="dark">` → mismatch benign. `suppressHydrationWarning` supprime le warning React sans désactiver les autres vérifs.

### Pourquoi `disableTransitionOnChange`

Évite que les transitions CSS (`transition-colors`) ne s'animent quand l'utilisateur toggle — bascule instantanée propre.

### Prévention du flash-of-incorrect-theme

next-themes injecte **automatiquement** un script inline dans `<head>` qui lit `localStorage` avant le first paint et applique la classe. Pas de config supplémentaire nécessaire. Vérifier sur preview Vercel (devtools Network > disable cache > reload).

---

## 2. Protection de `/audit` contre le toggle

**Problème :** le ThemeProvider dans `app/layout.tsx` enveloppe **toute l'app**, donc `/audit` hérite de la valeur du toggle.

**Décision recommandée : Option A (forcedTheme nested)**

`app/audit/layout.tsx` (à créer s'il n'existe pas) :
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

`forcedTheme="light"` override le toggle utilisateur pour toute la sous-route `/audit/*`. next-themes supporte le nesting.

**Alternative rejetée :**
- Route groups `app/(landing)/` : nécessite restructurer tout le layout, plus de risque de casser `/audit`.
- Manipulation manuelle className dans audit/page.tsx : fragile, hook order issues.

**Acceptance REQ-1.12 :** smoke test — après refonte landing, toggle en dark, puis naviguer `/audit`. La page audit doit rester light, inchangée visuellement.

---

## 3. Tailwind v3 dark mode + next-themes

### Config à ajouter dans `tailwind.config.ts`

```ts
const config: Config = {
  darkMode: 'class',          // ← ajouter
  content: [...],             // existant
  safelist: [...],            // existant
  theme: {
    extend: {
      colors: {
        // Existant conservé (primary, accent, ink, etc.) pour /audit et autres
        // Ajouter tokens landing dark premium :
        landing: {
          bg: 'var(--landing-bg)',
          'bg-elevated': 'var(--landing-bg-elevated)',
          surface: 'var(--landing-surface)',
          text: 'var(--landing-text)',
          'text-secondary': 'var(--landing-text-secondary)',
          border: 'var(--landing-border)',
          'accent-1': '#A78BFA',  // violet — fixe, identique dark/light
          'accent-2': '#F472B6',  // rose
          'accent-3': '#FB923C',  // orange
          'accent-alert': '#FF6961',
        },
      },
      fontFamily: {
        display: ['"SF Pro Display"', '-apple-system', 'Inter', 'sans-serif'],
        serif: ['"New York"', '"Source Serif Pro"', 'Charter', 'Georgia', 'serif'],
      },
      // ... reste
    },
  },
};
```

### CSS variables dans `app/globals.css`

```css
/* Tokens landing — dark par défaut */
:root {
  --landing-bg: #0A0A0C;
  --landing-bg-elevated: rgba(255, 255, 255, 0.04);
  --landing-surface: rgba(255, 255, 255, 0.06);
  --landing-text: #F5F5F7;
  --landing-text-secondary: rgba(245, 245, 247, 0.7);
  --landing-border: rgba(255, 255, 255, 0.08);
}

/* Override light (next-themes ajoute `.light` sur <html>) */
.light {
  --landing-bg: #F7F7F8;
  --landing-bg-elevated: #FFFFFF;
  --landing-surface: #F2F2F4;
  --landing-text: #1D1D1F;
  --landing-text-secondary: #424245;
  --landing-border: #E5E5E7;
}
```

**Avantage :** le même JSX utilise `bg-landing-bg text-landing-text` dans tous les composants, et la palette bascule via CSS vars. Zéro duplication de markup.

**Note :** next-themes avec `attribute="class"` ajoute `.dark` ou `.light` ou la valeur système. `defaultTheme="system"` + `enableSystem` → applique `.dark` ou `.light` automatiquement selon `prefers-color-scheme`.

---

## 4. Framer Motion marquee avec pause-on-hover

### Pattern recommandé

```tsx
"use client";
import { motion, useAnimationControls } from "framer-motion";
import { useState } from "react";

export function Marquee({ children, speed = 30 }: { children: React.ReactNode; speed?: number }) {
  const controls = useAnimationControls();
  const [paused, setPaused] = useState(false);

  return (
    <div
      className="overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <motion.div
        className="flex gap-10 w-max"
        animate={{ x: paused ? undefined : [0, "-50%"] }}
        transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
      >
        {children}
        {children /* duplicate for seamless loop */}
      </motion.div>
    </div>
  );
}
```

### Notes perf

- Framer Motion utilise `transform: translateX` → GPU-composited, pas de layout thrash
- `ease: "linear"` obligatoire pour un défilement constant
- Duplication des enfants x2 → illusion d'infini (quand `x: -50%`, on se retrouve au point de départ grâce à la duplication)
- Au hover : `x: undefined` pause l'animation (Framer préserve la valeur courante)
- **Alternative CSS pure** : ~30% moins lourd CPU mais moins flexible pour pause interactive. Utilisée si perf budget serré (mesurer Lighthouse d'abord).

### Pièges à éviter

- Ne pas utiliser `AnimatePresence` autour du marquee (overkill)
- Ne pas imbriquer de state interne dans chaque item (ça casse la fluidité)
- `prefers-reduced-motion` : ajouter handling pour accessibilité :
  ```tsx
  const prefersReduced = useReducedMotion();
  transition={{ duration: prefersReduced ? 0 : speed, ... }}
  ```

---

## 5. Lighthouse Performance ≥ 85 (desktop)

### Coûts identifiés dans le design

| Élément | Coût estimé | Mitigation |
|---------|-------------|------------|
| `backdrop-filter: blur(14px)` sur nav + cards | Paint-heavy, pas composite | Limiter le blur à ≤16px, utiliser `backdrop-filter: saturate(180%) blur(14px)` plutôt que blur pur |
| Mesh radial gradients (3x radial-gradient par section) | Paint cost modéré | Statiques, pas animés → OK. Éviter de les re-render. |
| Marquee continu 30s | CPU ~2-3% en continu | `will-change: transform` sur `.motion-div` |
| Hero avec 4-5 cards glassmorphism | Layer promotion | Acceptable, limiter à 6-8 layers GPU max |
| Fonts custom serif "New York" | Potential FOUT | `<link rel="preload">` + `font-display: swap` |

### Checklist Lighthouse

- [ ] `next/font/local` ou `next/font/google` pour serif fallback → évite le FOUT
- [ ] `will-change: transform` sur marquee container
- [ ] `content-visibility: auto` sur sections under-the-fold (social proof, FAQ, final CTA)
- [ ] Pas d'images volumineuses — la landing est CSS/SVG pure
- [ ] `next/image` si assets ajoutés plus tard (pas dans cette phase)
- [ ] LCP : hero H1 doit être SSR-rendered, pas d'animation d'apparition sur le H1 initial
- [ ] CLS = 0 : toggle dark/light NE DOIT PAS causer de shift de layout (tokens CSS = instant)
- [ ] Tester avec DevTools CPU throttle x4 pour simuler mobile bas de gamme (même si REQ-1.11 cible desktop)

### Benchmarks rapides

Sur un hero dark premium similaire (Linear, Vercel) avec backdrop-filter + gradient mesh, Lighthouse desktop atteint couramment 92-98 après preload fonts + content-visibility. Cible 85 largement atteignable si on respecte les 3 items ci-dessus.

---

## 6. Utilitaires réutilisables depuis `app/page.tsx` actuel

### À préserver et extraire

- **`CountUpNumber`** (lignes 16-53) : IntersectionObserver + RAF ease-out cubic. Utile dans :
  - Section social proof (stats 240 / 9,4 M€ / 4,8 / 54 s)
  - Hero preview rapport (KPI 42 380 €)
  - Extraire vers `components/ui/CountUpNumber.tsx` pour réutilisation cross-page.

### À abandonner (décision acceptance REQ-1.1)

- `ContainerScroll` (`components/ui/container-scroll-animation.tsx`)
- `ShuffleTestimonials` (`components/ui/testimonial-cards.tsx`)
- `FaqSection` (`components/ui/faq-section.tsx`)

Ces 3 composants sont importés par l'ancienne landing mais la direction dark premium a des animations/structures différentes. Plan : laisser les fichiers en place (pas les supprimer, peuvent servir ailleurs) mais ne pas les importer dans les nouveaux composants landing.

### `fadeInUp` / `staggerContainer` (lignes 92-100)

Patterns Framer Motion génériques. Intérêt limité à extraire — les nouveaux composants peuvent définir leurs variants localement. À juger à l'exécution.

---

## 7. Structure de fichiers proposée

```
app/
├── layout.tsx                    # inject ThemeProvider
├── page.tsx                      # assemble les 6 sections (shell d'orchestration)
├── globals.css                   # CSS vars :root + .light
└── audit/
    └── layout.tsx                # NEW — forcedTheme="light" pour protéger /audit

components/
├── landing/
│   ├── LandingNav.tsx            # sticky + toggle
│   ├── LandingHero.tsx           # split 2 cols, utilise <ReportPreview />
│   ├── LandingHowItWorks.tsx     # 3 steps horizontaux
│   ├── LandingSocialProof.tsx    # <Marquee /> + 4 stats
│   ├── LandingFaqCta.tsx         # FAQ 4Q + section finale full-bleed
│   ├── LandingFooter.tsx
│   ├── ReportPreview.tsx         # KPI + score ring + mini bar chart
│   ├── ThemeToggle.tsx           # bouton soleil/lune/système
│   └── Marquee.tsx               # primitive Framer Motion pause-hover
├── theme/
│   └── ThemeProvider.tsx         # "use client" wrapper next-themes
└── ui/
    └── CountUpNumber.tsx         # extrait depuis ancien app/page.tsx

archive/
└── landings-v1/
    ├── landing.html
    ├── landing-preview.html
    ├── mockup.html
    └── README.md                 # date + raison
```

---

## 8. Validation Architecture (Nyquist)

### Dimension 1 — Build & Types
- `npm run build` sans erreur ni warning nouveau
- `tsc --noEmit` sur les nouveaux fichiers

### Dimension 2 — Visual Regression (manuel)
- Preview Vercel accessible
- Parcours manuel desktop 1440 : dark OK + toggle light OK
- Parcours mobile 375 : stacking vertical OK, pas d'overflow
- Parcours tablet 768 : layout intermédiaire OK

### Dimension 3 — Behavior
- Clic sur toggle → bascule instantanée sans reload
- Refresh → thème persisté
- Premier visit avec OS dark → landing en dark ; OS light → landing en light
- Navigation `/audit` → page toujours en light, quel que soit le toggle landing

### Dimension 4 — Perf (Lighthouse)
- Lighthouse desktop sur preview Vercel → Performance ≥ 85
- LCP < 2.5s, CLS = 0, FID < 100ms

### Dimension 5 — Intégration API
- Upload CSV sur `/audit` → retourne encore les résultats corrects (smoke test avec fichier exemple)
- Aucune modif de `app/api/audit/route.ts` vérifiable via `git diff`

### Dimension 6 — CTA flow
- Tous les boutons CTA de la landing → redirection effective vers `/audit`
- Aucun popup Calendly, aucun form upload inline

### Dimension 7 — Accessibilité
- Contraste WCAG AA en dark et light (le gradient text violet/rose sur dark doit rester ≥ 4.5:1)
- `aria-label` sur le toggle thème
- `prefers-reduced-motion` respecté sur marquee

### Dimension 8 — Responsive
- Breakpoints 375 / 768 / 1440 testés manuellement
- `overflow-x: hidden` sur body si needed en fallback

### Manuel vs Automatisé

- **Automatisable** : build, typecheck, lighthouse CI
- **Manuel** : visual regression, CTA flow, theme persistence
- **Tests auto Vitest/Playwright** = hors scope (phase 6)

---

## 9. Pièges signalés / Points d'attention

1. **`suppressHydrationWarning` sur `<html>`** : obligatoire, sinon warning React en console sur chaque load.
2. **`disableTransitionOnChange` manquant** → flash de couleurs quand l'utilisateur toggle (les transitions CSS s'animent toutes en même temps).
3. **Nested ThemeProvider sur `/audit/layout.tsx`** : bien tester, certains rapports de bugs next-themes sur nested providers anciens (<v0.3). `next-themes@^0.3.0` OK.
4. **Tailwind `darkMode: 'class'`** : si non ajouté, `dark:` ne fonctionnera pas même si next-themes applique `.dark`.
5. **CSS variables + Tailwind arbitrary values** : éviter `bg-[var(--landing-bg)]` partout. Préférer extend la config Tailwind pour avoir `bg-landing-bg` propre.
6. **Marquee duplication** : les enfants DOIVENT être rendus 2× côté JSX, sinon le loop a un gap visible à la transition.
7. **Lighthouse glassmorphism** : tester sur preview Vercel, pas en local (`next dev` ajoute overhead).
8. **Custom fonts SF Pro / New York** : non fournies par Apple sans licence. Utiliser `system-ui` fallback + `Source Serif Pro` via Google Fonts pour le serif. New York/SF Pro natifs sur Apple devices via `-apple-system`.

---

## 10. Dependencies à installer

```bash
npm install next-themes
```

**Aucune autre nouvelle dep.** Framer Motion, Tailwind, lucide-react, next/font déjà présents.

---

## RESEARCH COMPLETE

**Résumé des findings clés :**
- `next-themes@^0.3` avec `attribute="class"` + `defaultTheme="system"` + nested `forcedTheme="light"` sur `/audit/layout.tsx`
- Tailwind v3 `darkMode: 'class'` + CSS vars `:root` (dark) / `.light` (override)
- Framer Motion marquee avec `useAnimationControls` + pause on hover, duplication x2 des enfants
- Lighthouse 85 atteignable si fonts preload + `content-visibility: auto` + `will-change: transform`
- `CountUpNumber` (ancien page.tsx) extractible dans `components/ui/`
- 9 nouveaux composants landing + 1 ThemeProvider wrapper + 1 audit layout + 1 extract utility

**À consommer par le planner pour produire PLAN.md.**
