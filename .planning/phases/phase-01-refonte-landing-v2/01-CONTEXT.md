# Phase 01: Refonte Landing (clinique-claire v2) — Context

**Gathered:** 2026-04-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Rewrite complet de la landing marketing (`app/page.tsx`) en direction
**clinique-claire** (brand placeholder GetLostRevenue), fondée sur les 4
sketches validés (001 C, 002 B, 003 C, 004 B) et la DA figée dans
`new_design.md`. Pose aussi les fondations tokens partagées avec Phase 02
(palette Tailwind, Inter + Fraunces via `next/font`, bg-gray-50).
Single CTA `/audit`. Pas de dark mode, pas de form, pas de rebranding final.

</domain>

<spec_lock>
## Requirements (locked via SPEC.md)

**15 requirements sont lockés.** Voir `01-SPEC.md` pour requirements complets,
boundaries et acceptance criteria.

Downstream agents (researcher, planner, executor) **DOIVENT lire `01-SPEC.md`**
avant de planifier ou d'implémenter. Les requirements ne sont pas dupliqués
ici.

**In scope (from SPEC.md):**
- Rewrite complet `app/page.tsx`, `app/layout.tsx`, `tailwind.config.ts`,
  `app/globals.css`.
- Création composants landing (LandingNav, LandingHero, StatsBar, TargetGrid,
  HowItWorksTimeline, ValueProps, ScorePill, Testimonial, FAQCards, CTABand,
  LandingFooter) ou équivalents.
- Brand `GetLostRevenue` placeholder, CTA unique `/audit`.
- Build green, responsive desktop/mobile/tablet, Lighthouse ≥ 90 × 4.

**Out of scope (from SPEC.md):**
- Dashboard audit (Phase 02).
- Dark mode, `next-themes` sur la landing.
- Rebranding final (nom définitif).
- Email capture / newsletter / form.
- Gate a11y AA strict (Lighthouse A11y ≥ 90 suffit).
- Legacy HTML cleanup (aucun fichier détecté).
- PDF report refonte.
- Agentation toolbar reintegration.
- SEO content / JSON-LD metadata.

</spec_lock>

<decisions>
## Implementation Decisions

### Animation Strategy (discuté)

- **D-01:** **Mix Framer Motion + CSS natif.** Framer Motion uniquement pour
  les animations complexes et orchestrées du hero (entrée staggered
  H1 + badge + CTA + mini dashboard au mount). Tout le reste (hovers, scroll
  fade-up, chevron FAQ, CTA hover) en CSS/Tailwind pur. Motivation : minimiser
  le surcoût JS tout en gardant un hero polish.

- **D-02:** **Portée des animations = hero au mount + fade-up scroll sur
  chaque section principale.** Sections concernées : Stats+Target, How It
  Works, Value+Score, Témoignage, FAQ, CTA final. Implémentation via
  `IntersectionObserver` natif (pas de lib supplémentaire). Chaque section
  fade-up une fois au moment où elle entre dans le viewport.

- **D-03:** **Reduce-motion : best effort.** `@media
  (prefers-reduced-motion: reduce)` désactive les translates/scales lourdes,
  mais garde les transitions d'opacity courtes (≤ 150 ms) et les hover
  subtle. Pas de check strict AAA — on reste pragmatique.

- **D-04:** **Timing / easing figés par la skill** — `0.4s ease-out` pour
  fade-up, pas de spring bouncy, stagger enfants ≤ 80 ms. (Rappel skill
  `sketch-findings-landing-system-audit-noshows`.)

### Claude's Discretion (défauts retenus, pas discuté)

Les 5 gray areas suivantes sont laissées à la discrétion du planner/executor
avec les **défauts recommandés ci-dessous** (l'user peut les revoir au
moment du plan).

- **D-05 (Découpage composants) :** split en composants sous
  `components/landing/*.tsx` (LandingNav, LandingHero, etc.), avec
  `app/page.tsx` comme orchestrateur mince (< 80 lignes). Raison : testable,
  lisible, cohérent avec la convention existante (`components/audit/` déjà
  en place pour Phase 02).

- **D-06 (FAQ accordion) :** `<details>` HTML natif stylé en Tailwind.
  Raison : a11y gratuite, zéro JS, suffit pour 4 questions. Upgrade React +
  Framer seulement si un need précis émerge (ex: animation de slide).

- **D-07 (Source du copy) :** hardcodé inline dans les composants landing.
  Raison : 1 phase, une seule landing, le copy évolue peu. Centraliser dans
  `lib/landing-content.ts` sera fait au moment du rebranding final (phase
  ultérieure).

- **D-08 (Icônes) :** **lucide-react** (lib à ajouter). Raison : tree-shakable,
  design cohérent, déjà un standard React ; évite de dessiner 10+ SVG à la
  main. Coût bundle marginal (~2 kB avec tree-shaking).

- **D-09 (Cleanup legacy) :** **1 commit "big bang" de rewrite** qui fait le
  cleanup en même temps (suppression Plus Jakarta Sans + Outfit dans
  tailwind.config, suppression des tokens indigo/violet/`ink`, suppression
  du `plus-pattern` backgroundImage, suppression des keyframes `blob`/`float`).
  Raison : `app/page.tsx` est intégralement réécrit, l'atomicité garde
  l'arbre de commits propre. _Sauf_ si le planner juge utile de séparer
  tailwind.config en une task atomique dédiée pour clarté — au choix du
  plan.

### Folded Todos

Aucun todo folded dans cette phase.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Spec & Decisions (cette phase)
- `.planning/phases/phase-01-refonte-landing-v2/01-SPEC.md` — 15 requirements
  lockés (à lire en premier).
- `.planning/phases/phase-01-refonte-landing-v2/01-CONTEXT.md` — ce document.

### Design Direction (source of truth)
- `new_design.md` — spec DA complète (palette exacte, typo, formes,
  composants signature, règles bannies).
- `new_design_audit.html` — maquette Google Stitch validée (référence
  visuelle niveau markup).

### Sketches validés (Phase 01)
- `.planning/sketches/001-landing-hero-nav/README.md` + `index.html` —
  winner **C** (compact + KPI strip), fallback B.
- `.planning/sketches/002-landing-stats-target/README.md` + `index.html` —
  winner **B** (Fraunces serif comptable + vertical dividers).
- `.planning/sketches/003-landing-how-value/README.md` + `index.html` —
  winner **C** (timeline numérotée + floating score pill).
- `.planning/sketches/004-landing-testimonial-faq-cta/README.md` +
  `index.html` — winner **B** (cards everywhere + 2-col CTA).
- `.planning/sketches/MANIFEST.md` — index des 9 sketches.
- `.planning/sketches/themes/default.css` — CSS tokens partagés utilisés
  dans les sketches (référence token).

### Skill auto-load
- `.claude/skills/sketch-findings-landing-system-audit-noshows/SKILL.md` —
  structure 5 sections, tokens, copy guidelines, composants à créer,
  règles d'animation.

### Conventions projet
- `CLAUDE.md` (racine + projet) — commandes, stack, conventions.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- **Framer Motion** déjà dans `package.json` — utilisé par la legacy
  `app/page.tsx`. On garde la dep mais on **scope son usage au hero
  uniquement** (D-01).
- **Dossier `components/audit/`** existant — suit la convention "composants
  par page". Applicable au miroir `components/landing/` (D-05).
- **Fonts `next/font/google`** non encore utilisées dans le projet — setup
  à faire dans `app/layout.tsx`.
- **Pas de `lucide-react`** actuellement — à installer (D-08).
- **`react-hot-toast` (Toaster)** présent dans `app/layout.tsx` actuel :
  à conserver (utile pour toast d'erreur audit), mais on vérifie que son
  rendu n'interfère pas avec le `bg-gray-50` forcé.

### Established Patterns

- **`"use client"` top-of-file** dans la legacy `app/page.tsx` — on inverse
  la convention : `app/page.tsx` devient RSC par défaut (orchestration),
  seuls les composants client nécessaires (LandingNav pour scroll shadow,
  LandingHero pour framer, FAQCards pour `<details>`) portent le
  `"use client"`.
- **Tailwind customisation** : ajouter `fontFamily.sans: ['var(--font-inter)']`
  et `fontFamily.serif: ['var(--font-fraunces)']`, supprimer
  `Plus Jakarta Sans` + `Outfit`, `heading: [Outfit]`, etc.
- **Safelist Tailwind** actuelle (`primary/accent/navy/danger/success/warning`)
  → sera réécrite pour refléter les nouveaux tokens (kpi*, primaryDark).

### Integration Points

- `app/layout.tsx` : rewrite pour exposer les fonts via CSS variables,
  supprimer `bg-ink text-white`, mettre `bg-gray-50 text-slate-900`.
- `app/audit/layout.tsx` (Phase 02, hors scope 01) — s'appuiera sur la
  même base tokens. Pas à toucher dans cette phase.
- `app/api/audit/route.ts` — non concerné par la landing. Ignore.
- `components/audit/*` et `components/ui/*` — non concernés par la landing.
  Ignore.

</code_context>

<specifics>
## Specific Ideas

- **Brand** : `GetLostRevenue` en Inter 600 (logo nav) + Inter 400
  (copyright footer). Pas de logo SVG — pastille colorée + wordmark.
- **Copy ton** : interrogatif dans le hero ("Combien les no-shows
  vous coûtent-ils vraiment ?"), factuel et chiffré partout ailleurs
  (pas de superlatif, pas de "révolutionner").
- **Mini dashboard du hero** : DOM Tailwind pur (pas de Chart.js). 4 KPI
  pastels mini-cards + chart émeraude placeholder dessiné en divs (référence
  sketch 001 C).
- **Stats bar "Pour qui"** : cabinets cibles = omnipratique / orthodontie /
  implantologie / groupes-réseaux (4 cards). Icônes `lucide-react`.
- **Social proof** : pas de logos de clients fictifs, pas de "+1000 cabinets".
  Section témoignage unique (1 citation Dr. + attribution).

</specifics>

<deferred>
## Deferred Ideas

- **Rebranding final** (nom définitif → swap `GetLostRevenue`) — phase
  dédiée future.
- **PDF report refonte** clinique-claire (`components/audit/RapportPDF.tsx`)
  — candidate milestone v2.1.
- **Agentation toolbar** réapplication — après Phase 01 livrée (stash
  préservé à `stash@{0}`).
- **Centralisation copy dans `lib/landing-content.ts`** — à faire au moment
  du rebranding final, pas nécessaire dans cette phase.
- **JSON-LD / metadata SEO structurée** — backlog milestone v2.1+.
- **Logos client réels / social proof étendu** — dépend de l'acquisition
  de vrais clients + accords.

</deferred>

---

*Phase: 01-refonte-landing-v2*
*Context gathered: 2026-04-23*
*Ambiguity score from SPEC: 0.16 (gate ≤ 0.20 ✓)*
*Next: `/gsd-plan-phase 1`*
