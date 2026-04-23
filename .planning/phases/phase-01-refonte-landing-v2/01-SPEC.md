# Phase 01 — Refonte Landing (clinique-claire v2) — SPEC

**Phase number:** 01
**Phase slug:** refonte-landing-v2
**Spec drafted:** 2026-04-23
**Ambiguity score:** 0.16 (gate ≤ 0.20 ✓)
**Status:** Ready for `/gsd-discuss-phase 1`

---

## Domain

Livrer une landing page marketing entièrement reconstruite pour le projet
`system-audit-noshows` (brand placeholder **GetLostRevenue**), en direction
artistique **clinique-claire** (registre "rapport d'expertise comptable
moderne"). La page remplace intégralement `app/page.tsx`, pose la fondation
tokens (palette + fonts) partagée avec la Phase 02, et pointe un unique CTA
vers `/audit`.

Cette phase traite **uniquement la landing** (`app/page.tsx` + dépendances
token/layout). Le dashboard audit est la Phase 02.

---

## Goal

Remplacer `app/page.tsx` par une landing en 5 sections issues des sketches
validés (001 C, 002 B, 003 C, 004 B), fondée sur la DA figée dans
`new_design.md` — fond `bg-gray-50`, primary vert sapin `#064E3B`, typographies
Inter + Fraunces, 4 KPI pastels sémantiques signature — avec un unique CTA
vers `/audit`, build green, responsive desktop + mobile + tablet et Lighthouse
≥ 90 sur les 4 métriques.

---

## Requirements

Chaque REQ est falsifiable (current state → target state + acceptance).

### REQ-01 · Rewrite complet de `app/page.tsx`

- **Current state:** `app/page.tsx` contient 891 lignes de landing legacy
  PerfIAmatic (marketing dark ink, framer-motion, Plus Jakarta Sans, palette
  indigo/violet `#4F46E5` / `#7C3AED`).
- **Target state:** `app/page.tsx` est entièrement réécrit depuis zéro. Rien
  du fichier actuel n'est préservé (ni copy, ni animations, ni structure).
- **Acceptance:** `git diff HEAD~N -- app/page.tsx` montre une réécriture
  complète ; aucune importation de `bg-ink`, `primary` (indigo), Plus Jakarta
  Sans, Outfit, `blob`/`float` animations.

### REQ-02 · Fond global `bg-gray-50` sur toute la page

- **Current state:** `app/layout.tsx` force `bg-ink text-white` sur `<body>`.
- **Target state:** `<body>` utilise `bg-gray-50 text-slate-900` (light mode
  forcé, pas de dark toggle sur la landing).
- **Acceptance:** inspection DOM en browser : `document.body.className`
  contient `bg-gray-50` et ne contient ni `bg-ink` ni `dark:*`.

### REQ-03 · Typographies Inter + Fraunces via `next/font/google`

- **Current state:** `next/font` n'est pas utilisé ; fonts legacy Plus Jakarta
  Sans + Outfit configurées dans `tailwind.config.ts`.
- **Target state:** Inter (400/500/600/700) et Fraunces (opsz 9..144,
  500/600) chargées via `next/font/google`, exposées comme CSS variables
  (`--font-inter`, `--font-fraunces`) et appliquées sur `<body>` + classe
  utilitaire `font-serif` pour Fraunces.
- **Acceptance:** inspection DOM : `<html>` ou `<body>` a
  `style="font-family: var(--font-inter), …"` ; les titres H1 Fraunces
  rendent en serif visuellement.

### REQ-04 · Palette Tailwind clinique-claire figée

- **Current state:** `tailwind.config.ts` expose `primary: #4F46E5` (indigo)
  et plein de tokens legacy.
- **Target state:** `tailwind.config.ts` contient les tokens clinique-claire :
  `primaryDark: '#064E3B'`, `accentGreen: '#10B981'`, et les 4 KPI pastels
  sémantiques (`kpiVolume` {bg `#DFF3FF`, fg `#2563EB`}, `kpiSignal`
  {`#DCF4E6`, `#059669`}, `kpiTaux` {`#FCEACC`, `#EA580C`}, `kpiArgent`
  {`#ECCDF8`, `#9333EA`, deep `#6B21A8`}).
- **Acceptance:** `grep -E '#4F46E5|#7C3AED|primary-light' tailwind.config.ts`
  renvoie 0 résultat ; `grep '#064E3B' tailwind.config.ts` renvoie ≥ 1.

### REQ-05 · Section Nav sticky + Hero interrogatif (sketch 001 C)

- **Current state:** N/A (rewrite).
- **Target state:** `<header>` sticky top-0 72 px, `bg-white/90` + bordure
  `border-gray-200`, logo GetLostRevenue + 3 liens (Comment ça marche, Pour
  qui, FAQ) + CTA primary-dark. Hero layout split 2 col (stacked mobile),
  badge pill interrogatif `bg-emerald-50 text-emerald-700` au-dessus du H1
  Fraunces XXL, sous-titre Inter regular 1 phrase, 2 CTA (primary-dark plein
  + ghost secondaire), mini dashboard mockup côté droit avec les 4 KPI
  pastels.
- **Acceptance:** browser check visuel : la page chargée correspond au HTML
  du `.planning/sketches/001-landing-hero-nav/index.html` variante C.

### REQ-06 · Section Stats + Pour qui (sketch 002 B)

- **Current state:** N/A.
- **Target state:** bandeau stats pleine largeur `bg-white`, 3–4 chiffres
  Fraunces serif vert sapin avec séparateurs verticaux fins. Section "Pour
  qui" avec eyebrow + titre Fraunces + grid cards cabinets cibles (omnipratique,
  orthodontie, implantologie, groupes/réseaux), icône en pastille pastel,
  radius 20 px.
- **Acceptance:** visual match avec sketch 002 variante B ; stats affichent
  des chiffres factuels non-superlatifs (pas de `+1000`, pas de `∞`).

### REQ-07 · Section How It Works + Value + Score (sketch 003 C)

- **Current state:** N/A.
- **Target state:** "Comment ça marche" en timeline numérotée tricolore
  (étape 1 pastille bleu Volume, étape 2 émeraude Signal, étape 3 orange
  Taux) avec connecteur vertical gris. "Ce que révèle l'audit" en bloc texte
  + checks émeraude, accompagné d'une floating score pill (score `72/100`
  Fraunces + ring SVG miniature, card blanche `rounded-3xl`).
- **Acceptance:** visual match avec sketch 003 variante C ; les 3 pastilles
  respectent la sémantique fixe Volume/Signal/Taux.

### REQ-08 · Section Témoignage + FAQ + CTA final (sketch 004 B)

- **Current state:** N/A.
- **Target state:** Témoignage en card blanche bordée `rounded-2xl` avec
  avatar + citation + attribution. FAQ = 4 cards `rounded-xl` (chaque
  question dans sa propre card, fond blanc fermée → `bg-emerald-50` ouverte,
  chevron qui tourne). Bandeau CTA final pleine largeur `bg-[#064E3B]`
  radius 28 px, 2 colonnes (titre/paragraphe à gauche, bouton blanc à droite).
- **Acceptance:** visual match avec sketch 004 variante B ; FAQ fonctionne
  en ouvrant/fermant les cards ; le bouton blanc du CTA final pointe vers
  `/audit`.

### REQ-09 · Footer minimaliste

- **Current state:** N/A.
- **Target state:** `<footer>` `bg-white` + bordure top `border-gray-200`,
  3 blocs (logo + tagline / liens produit / liens légaux), copyright Inter
  12 px muted.
- **Acceptance:** footer présent en bas de page, pas de CTA supplémentaire,
  pas de duplication du CTA final.

### REQ-10 · CTA unique vers `/audit` — aucune autre destination

- **Current state:** N/A.
- **Target state:** tous les boutons d'action principaux (nav CTA, hero CTA
  primary-dark, CTA final du bandeau) pointent vers `/audit`. Le CTA ghost
  du hero peut pointer vers l'ancre `#comment-ca-marche` (scroll intra-page).
- **Acceptance:** `grep -E 'href="(/audit|#)' app/page.tsx` — aucune autre
  URL externe ou route interne n'est utilisée comme destination d'action.
  Aucun `<form>`, aucun `<input type="email">`, aucune capture email,
  aucune newsletter signup.

### REQ-11 · Brand `GetLostRevenue` affiché comme placeholder

- **Current state:** N/A.
- **Target state:** le nom `GetLostRevenue` apparaît dans le logo nav + le
  copyright footer. Cette phase accepte explicitement qu'il s'agisse d'un
  placeholder — le rebranding final sera une phase ultérieure.
- **Acceptance:** `grep 'GetLostRevenue' app/page.tsx` renvoie ≥ 2 matches
  (logo + footer copyright).

### REQ-12 · Responsive desktop + mobile + tablet

- **Current state:** N/A (à construire from-scratch).
- **Target state:** la landing rend correctement sans overflow horizontal
  ni casse de layout sur 3 breakpoints : desktop (≥ 1024 px), tablet
  (768–1023 px), mobile (< 768 px).
- **Acceptance:** contrôle manuel en DevTools sur les 3 breakpoints :
  aucune scrollbar horizontale, aucune section tronquée, CTA primary
  toujours accessible.

### REQ-13 · Build Next.js production green

- **Current state:** le build actuel est green.
- **Target state:** `npm run build` termine sans erreur (exit 0), sans
  nouvelle warning TypeScript ou ESLint bloquante.
- **Acceptance:** `npm run build` → exit 0 avec sortie contenant
  "Compiled successfully".

### REQ-14 · Lighthouse ≥ 90 sur les 4 métriques

- **Current state:** non mesuré sur cette nouvelle landing.
- **Target state:** Lighthouse desktop renvoie **≥ 90** sur
  Performance, Accessibility, Best Practices, SEO.
- **Acceptance:** capture / rapport Lighthouse (Chrome DevTools ou
  `npx @lhci/cli`) sur la landing buildée, 4 scores ≥ 90.

### REQ-15 · Validation finale via `/gsd-verify-work`

- **Current state:** N/A.
- **Target state:** UAT interactif confirmé — tous les items de la checklist
  de vérification (visual match sketches, CTA clic fonctionnel, responsive
  OK) sont cochés par l'utilisateur.
- **Acceptance:** sortie de `/gsd-verify-work` = "all items verified" pour
  la phase 01.

---

## Boundaries

### In scope

- Rewrite complet de `app/page.tsx` (landing marketing 5 sections).
- Rewrite de `app/layout.tsx` (bg-gray-50, Inter + Fraunces via `next/font`,
  forcer light).
- Rewrite de `tailwind.config.ts` (tokens clinique-claire + pastels KPI
  sémantiques).
- Rewrite de `app/globals.css` (import CSS tokens, suppression styles legacy).
- Création des composants landing nécessaires (`LandingNav`, `LandingHero`,
  `StatsBar`, `TargetGrid`, `HowItWorksTimeline`, `ValueProps`, `ScorePill`,
  `Testimonial`, `FAQCards`, `CTABand`, `LandingFooter`) ou équivalents.
- Brand `GetLostRevenue` affiché comme placeholder.
- Single CTA `/audit`.
- Build green, responsive 3 breakpoints, Lighthouse ≥ 90 × 4.

### Out of scope

- **Dashboard audit** (`app/audit/page.tsx`) — Phase 02.
- **Dark mode** — banni par la DA ; pas de `next-themes` sur la landing.
  (Le dashboard audit peut continuer à forcer light séparément.)
- **Rebranding final** — `GetLostRevenue` reste placeholder ; le nom
  définitif sera traité dans une phase dédiée ultérieure.
- **Email capture / newsletter / form** — aucun input utilisateur dans
  cette landing. Seul CTA = `/audit`.
- **Gate strict a11y AA** — les contrastes AA et focus-ring sont
  "best-effort" mais pas bloquants pour la livraison. (Lighthouse
  Accessibility ≥ 90 reste requis via REQ-14 — ce qui couvre l'essentiel
  sans être AAA-strict.)
- **Legacy HTML files cleanup** — aucun `landing.html`/`landing-preview.html`/
  `mockup.html` détecté à la racine ; rien à supprimer dans cette phase.
- **PDF report refonte** — `components/audit/RapportPDF.tsx` reste v1
  dark-gold ; refonte dans une phase ultérieure (candidate milestone v2.1).
- **Agentation toolbar** — la réintégration du dev toolbar (stash
  actuellement préservé) sera traitée séparément après la phase 01.
- **SEO content** — le copy (headings, paragraphes, FAQ) est rédigé selon
  les guidelines skill `sketch-findings-landing-system-audit-noshows`
  (interrogatif, chiffré, pas superlatif). Pas d'audit SEO externe, pas de
  génération de metadata structurée (JSON-LD) dans cette phase.

---

## Constraints

- **Stack :** Next.js 14 App Router, TypeScript strict, Tailwind v3,
  `next/font/google`.
- **Bundle :** pas de budget précis, mais on évite d'importer des libs lourdes
  non nécessaires. Framer Motion OK uniquement pour fade-up légers au scroll
  (0.4 s ease-out, pas de spring bouncy).
- **Responsive :** 3 breakpoints Tailwind natifs (mobile `< 768`, tablet
  `md: 768`, desktop `lg: 1024`).
- **Perf targets :** Lighthouse Performance ≥ 90 desktop (mobile non gatée
  dans cette phase, mais visé).
- **Accessibility :** Lighthouse A11y ≥ 90 (couvre alt-text, labels de base,
  contrast des textes gros corps). Focus-ring et AA strict sont best-effort.
- **Pas de dark mode :** light uniquement. Pas de `next-themes`. Pas de
  classe `.dark` dans le CSS.

---

## Acceptance Criteria (Pass/Fail)

- [ ] `git diff` sur `app/page.tsx` montre une réécriture complète (pas
      d'import legacy framer-motion `blob`, pas de palette indigo/violet).
- [ ] `<body>` a `bg-gray-50 text-slate-900`, aucune classe dark.
- [ ] Inter + Fraunces chargées via `next/font/google` et visibles dans
      les titres.
- [ ] `tailwind.config.ts` expose `primaryDark: '#064E3B'` et les 4 KPI
      pastels sémantiques.
- [ ] Landing match visuellement les sketches 001 C / 002 B / 003 C / 004 B
      (vérification manuelle browser sur chaque section).
- [ ] Tous les CTA principaux pointent vers `/audit` ; aucun form, aucune
      capture email.
- [ ] Brand `GetLostRevenue` affiché dans le logo nav + footer.
- [ ] Pas d'overflow horizontal sur mobile/tablet/desktop en DevTools.
- [ ] `npm run build` sort exit 0 avec "Compiled successfully".
- [ ] Lighthouse desktop ≥ 90 sur Performance / Accessibility /
      Best Practices / SEO.
- [ ] `/gsd-verify-work` retourne "all items verified".

---

## Canonical refs

- `new_design.md` — spec DA complète (palette, typo, composants signature,
  règles bannies).
- `new_design_audit.html` — maquette Google Stitch validée (référence visuelle
  niveau markup).
- `.planning/sketches/001-landing-hero-nav/` — winner C (fallback B).
- `.planning/sketches/002-landing-stats-target/` — winner B.
- `.planning/sketches/003-landing-how-value/` — winner C.
- `.planning/sketches/004-landing-testimonial-faq-cta/` — winner B.
- `.claude/skills/sketch-findings-landing-system-audit-noshows/SKILL.md` —
  tokens + structure + copy guidelines.
- `CLAUDE.md` (root + project) — conventions projet, rappel `ca_perdu`
  déjà annualisé (règle audit, pas landing).

---

## Ambiguity Report

| Dimension | Score | Min | Status |
|---|---|---|---|
| Goal Clarity | 0.85 | 0.75 | ✓ |
| Boundary Clarity | 0.85 | 0.70 | ✓ |
| Constraint Clarity | 0.80 | 0.65 | ✓ |
| Acceptance Criteria | 0.85 | 0.70 | ✓ |
| **Ambiguity** | **0.16** | ≤ 0.20 | **✓ gate** |

Rounds: 2 (Researcher + Researcher/Simplifier). Gate passé sans
Boundary Keeper ni Failure Analyst explicites — boundaries ont été
clarifiées directement via Q1+Q2.

---

*Spec drafted: 2026-04-23*
*Ready for: `/gsd-discuss-phase 1` (implementation decisions)*
