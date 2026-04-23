# Phase 1 : Refonte Landing v2 — Context

**Gathered :** 2026-04-22
**Status :** Ready for planning

<domain>
## Phase Boundary

Réécrire `app/page.tsx` en landing B2B dark premium (avec toggle dark/light) pour cabinets médicaux FR. 5 sections ordonnées conformes aux sketches 005-008 validés. CTA unique vers `/audit`. Archivage des anciens landings HTML statiques.

Cette phase livre **uniquement la landing**. Page audit, API, PDF, Google Places, RGPD avancée, tests auto, monitoring → hors scope (autres phases).
</domain>

<spec_lock>
## Requirements (locked via SPEC.md)

**14 requirements sont lockés.** Voir `01-SPEC.md` pour les requirements complets, boundaries et acceptance criteria.

**Downstream agents MUST read `01-SPEC.md` before planning or implementing.** Requirements ne sont pas dupliqués ici.

**In scope (from SPEC.md) :**
- Réécriture complète de `app/page.tsx` (dark premium par défaut)
- Toggle dark/light (nav, persistance localStorage, SSR-safe)
- 5 sections : Nav sticky → Hero split → How-it-works 3 steps → Social proof marquee+stats → FAQ minimal + Final CTA full-bleed → Footer
- Composants landing dédiés
- Archivage `landing.html` / `landing-preview.html` / `mockup.html` dans `archive/landings-v1/`
- Responsive 3 breakpoints (375 / 768 / 1440)
- Copy conforme au voice validé
- Placeholders "early access / beta" pour assets non collectés

**Out of scope (from SPEC.md) :**
- Page audit, API backend, PDF, Google Places, RGPD avancée, tests auto, monitoring, collecte vrais témoignages/stats/logos.
</spec_lock>

<decisions>
## Implementation Decisions

### Theme / Toggle dark-light

- **D-01 :** Utiliser la librairie `next-themes` (pas de solution maison ni `dark:` Tailwind).
  - Rationale : standard communauté Next.js, gère SSR + no-flash + localStorage + OS auto en ~10 lignes de setup. Dépendance ~2 KB acceptable.
- **D-02 :** `defaultTheme="system"` — respecter `prefers-color-scheme` de l'OS au premier load (pas de forçage dark).
- **D-03 :** 3 états dans le toggle : `dark` / `light` / `system`. Placement du toggle : dans `LandingNav`, à droite avant le CTA principal.
- **D-04 :** Tokens de couleur gérés via CSS variables dans `:root` (dark par défaut) + override dans `[data-theme="light"]` ou `html.light`, selon la convention retenue par `next-themes` (`attribute="class"` recommandé). À valider dans le plan.
- **D-05 :** Pas de flash-of-incorrect-theme : le script inline de `next-themes` s'en charge, mais vérifier sur preview Vercel avant merge.

### Component structure

- **D-06 :** Découpage par section sous `components/landing/`. Fichiers prévus :
  - `LandingNav.tsx` (nav sticky + toggle thème + CTA)
  - `LandingHero.tsx` (split 2 col, eyebrow/H1/lede/CTA/reassurance + `<ReportPreview />`)
  - `LandingHowItWorks.tsx` (3 steps cards)
  - `LandingSocialProof.tsx` (marquee + 4 stats)
  - `LandingFaqCta.tsx` (FAQ minimal + section finale full-bleed)
  - `LandingFooter.tsx`
  - `ReportPreview.tsx` (KPI géant + score ring + mini bar chart)
  - `ThemeToggle.tsx` (bouton toggle soleil/lune, consommé par LandingNav)
  - `Marquee.tsx` (primitive réutilisable, Framer Motion — voir D-09)
- **D-07 :** `app/page.tsx` devient une coquille d'orchestration qui assemble les 6 composants landing dans l'ordre (plus de logique métier dedans).
- **D-08 :** Extraire d'éventuels tokens ou primitives partagées (ex: `GradientText`, `GlassCard`) uniquement si le besoin apparaît pendant l'implémentation — pas de pré-extraction spéculative.

### Animation marquee (social proof)

- **D-09 :** Utiliser **Framer Motion** (déjà dans le stack, pas de lib supplémentaire). Implémentation : `motion.div` avec `animate={{ x: [0, -50%] }}` + `transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}`.
- **D-10 :** **Pause au hover** activée. Avec Framer Motion : détecter `onHoverStart` / `onHoverEnd` et basculer `animate` entre running/paused (ou utiliser `useAnimationControls`). À figer dans le plan.
- **D-11 :** Mask-image fade sur les bords gauche/droit (pattern CSS du skill) pour que le marquee s'estompe en entrée/sortie — non animé, côté CSS pur.

### Claude's Discretion

- **Tailwind config** : convention exacte pour exposer les tokens dark/light (extend via CSS vars vs `darkMode: 'class'` + deux sets de vars) — le plan choisira l'approche la plus propre selon la config Tailwind v3 actuelle.
- **Naming des CSS variables** : libre (ex: `--landing-bg`, `--landing-text`), tant que ça ne conflicte pas avec les vars existantes du rapport audit.
- **Composants primitives réutilisables** (GradientText, GlassCard) : à extraire OU non selon la duplication réellement observée durant l'exécution. Pas d'abstraction prématurée.
- **Nav mobile** : menu burger ou nav compact horizontal — à choisir pendant l'exécution selon la place disponible. Le toggle thème reste toujours visible.
- **Images** : pas d'images identifiées pour l'instant, la landing est full CSS/SVG. Si ajout plus tard, passer par `next/image`.
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & SPEC
- `.planning/phases/phase-01-refonte-landing-v2/01-SPEC.md` — **Locked requirements — MUST read before planning**. 14 REQs falsifiables, boundaries, acceptance gate.
- `.planning/REQUIREMENTS.md` — Requirements transversaux v2.0.
- `.planning/PROJECT.md` — Invariants projet (ca_perdu annualisé, RGPD, etc.).
- `.planning/ROADMAP.md` — Phase 1 entry.

### Design / Sketches
- `.claude/skills/sketch-findings-landing-system-audit-noshows/SKILL.md` — Skill auto-chargeable avec direction complète.
- `.claude/skills/sketch-findings-landing-system-audit-noshows/references/landing-page.md` — **Design reference détaillé** : palette, typo, CSS patterns, copy voice, anti-patterns. MUST read pour respecter la direction visuelle.
- `.planning/sketches/WRAP-UP-SUMMARY-LANDING.md` — Synthèse wrap-up.
- `.planning/sketches/005-hero-impact/` à `008-faq-final-cta/` — 4 sketches HTML originaux (ouvrables dans un navigateur pour référence visuelle).

### Code existant
- `app/page.tsx` — À réécrire complètement. Les utilitaires `CountUpNumber`, `FAQItem`, `fadeInUp`, `staggerContainer` peuvent être réutilisés si pertinents.
- `components/ui/container-scroll-animation.tsx`, `components/ui/testimonial-cards.tsx`, `components/ui/faq-section.tsx` — **Non réutilisés** en dark (REQ-1.1 acceptance).
- `tailwind.config.ts` — Base config à étendre pour le dark mode + tokens CSS vars.
- `app/globals.css` — Point d'injection des CSS variables de thème.
- `CLAUDE.md` (projet) — Routing des skills auto-chargeables + invariants.
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **Framer Motion** : déjà importé partout (`motion`, `AnimatePresence`). Réutilisé pour marquee + animations d'apparition + pause hover.
- **lucide-react icons** : disponibles (`UploadCloud`, `ShieldCheck`, `Activity`, `Lock`, etc.). Utilisables pour eyebrows, tags, reassurance, toggle thème.
- **`CountUpNumber` (`app/page.tsx` actuel)** : IntersectionObserver + requestAnimationFrame pour animer les chiffres à l'apparition. Peut être extrait en composant partagé si utile dans les stats.
- **Tailwind v3** + safelist déjà configurés pour les couleurs sémantiques.

### Established Patterns
- **`"use client"` + React state** pour interactivité (toggle, accordéon FAQ, marquee pause).
- **Layout responsive** via utilitaires Tailwind standards (`md:`, `lg:`) + custom breakpoint 860px pour les splits.
- **Icons via lucide-react** — éviter d'introduire une nouvelle lib d'icônes.
- **Next.js App Router 14** — `page.tsx` + co-located components OK.

### Integration Points
- `app/layout.tsx` : point d'injection du `ThemeProvider` de `next-themes` (enveloppe toute l'app, donc affecte aussi `/audit`). Vérifier que `/audit` reste light ou indépendant du toggle.
- `app/globals.css` : déclarations CSS variables `:root` + `[data-theme]` (ou `html.light`).
- `tailwind.config.ts` : activer `darkMode: ['class']` ou `'selector'` compatible `next-themes`.

### Risks / Points d'attention
- **Le ThemeProvider impactera aussi `/audit`** : vérifier que la page audit conserve sa direction clinique (light fixe) indépendamment du toggle landing. Option : forcer `data-theme="light"` sur `<main>` de la page audit, ou scoper le toggle au seul segment landing.
- **Lighthouse ≥ 85 (REQ-1.11)** : glassmorphism (`backdrop-filter: blur`) + mesh radial multiples + Framer Motion marquee animé en continu peuvent peser. Prévoir : preload des fonts custom (si New York serif chargée via @font-face), `will-change: transform` sur marquee, `content-visibility: auto` sur sections hors viewport.
- **Next York serif** : pas garantie disponible sur tous OS. Prévoir fallback Source Serif Pro → Charter → Georgia dans la stack.
</code_context>

<specifics>
## Specific Ideas

- **Toggle UX** : idéalement 3 états cliquables (dark / light / system) mais un toggle binaire simple suffit si le skill design préfère. À valider visuellement dans le plan.
- **"Early access / beta" sur la section social proof** : mention visible (badge, sur-titre, ou footer de section) pour ne pas vendre des chiffres non vérifiés. À valider avec le user au moment du plan.
- **Variant A de sketch 007** (cards témoignages) : une idée d'animation existe côté user à préciser. Non bloquant — à discuter avant ou pendant le plan si l'utilisateur veut l'intégrer en complément ou alternative au marquee.
</specifics>

<deferred>
## Deferred Ideas

- **Collecte de vrais témoignages / stats / logos** — hors phase 1, à préparer en parallèle pour remplacer les placeholders "bêta" avant mise en prod.
- **Animation spéciale pour les cards témoignages** (variant A sketch 007) — idée user à préciser ; backlog milestone v2.1+ ou intégration tardive phase 1 si triviale.
- **Page privacy / mentions légales** complète — phase 5 RGPD.
- **Menu burger mobile dédié** — si la nav compressée ne suffit pas, à traiter en mini-phase ultérieure.
- **Scroll-triggered animations d'apparition** (Framer Motion whileInView) — potentiel bonus UX, pas requis par les sketches. Laissé à la discrétion de l'exécution si perf budget OK.
</deferred>

---

*Phase : 01-refonte-landing-v2*
*Context gathered : 2026-04-22*
