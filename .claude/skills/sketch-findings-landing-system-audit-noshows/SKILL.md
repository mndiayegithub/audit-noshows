---
name: sketch-findings-landing-system-audit-noshows
description: Validated design decisions (DA clinique-claire v2) for the landing page of system-audit-noshows (PerfIAmatic, GetLostRevenue). Auto-loaded when implementing or iterating on the landing UI. Triggers on terms like "refonte landing v2", "landing page", "page d'accueil", "app/page.tsx", "clinique-claire", "hero interrogatif", "new_design.md".
---

<context>

## Project

system-audit-noshows (PerfIAmatic) — outil d'audit SaaS des no-shows pour cabinets
dentaires. Brand placeholder : **GetLostRevenue**. La landing (`app/page.tsx`)
est refondue v2 en direction **clinique-claire** — registre "rapport d'expertise
comptable moderne", distinct de tout registre SaaS tech / dark / glass / neon.

## Source of truth

Lire **avant toute implémentation** :
- `new_design.md` — spec DA complète (palette exacte, typo, composants signature, copy guidelines)
- `new_design_audit.html` — maquette Google Stitch validée
- `.planning/sketches/001-*`, `002-*`, `003-*`, `004-*` — 4 sketches landing validés

En cas de conflit, `new_design.md` > sketch README > sketch HTML > ce SKILL.md.

## Non-négociables (bannis)

- ❌ Dark mode / fond sombre quelconque
- ❌ Glassmorphism, backdrop-blur, verre
- ❌ Gradients néon, mesh radial, halos cyber
- ❌ Violet cyber (`#a855f7` saturé), indigo SaaS, cyan accent
- ❌ Ombres lourdes, glow, lueurs
- ❌ Typo SF Pro, system-ui seuls — on impose Inter + Fraunces

</context>

<design_tokens>

## Palette — figée

- Fond global : `bg-gray-50` (`#f9fafb`) — jamais blanc pur sur toute la page
- Surfaces cards : `bg-white` (`#ffffff`) + bordure `border-gray-200` (`#e5e7eb`)
- **Primary dark** (vert sapin) : `#064E3B` — logo, CTA, headings accents, bandeau CTA final
- **Accent green** : `#10B981` — points d'attention discrets, badges "live"
- Ink text : `#0f172a` (slate-900)
- Muted : `#64748b` (slate-500) — sous-labels, meta
- Border fin : `#e5e7eb` (gray-200)

## KPI pastels sémantiques — figés et intouchables

4 couleurs avec sémantique **fixe** (ne jamais permuter) :

| Sémantique | BG pastel | Texte valeur |
|---|---|---|
| Volume / RDV analysés | `#DFF3FF` | `#2563EB` |
| Signal / No-shows | `#DCF4E6` | `#059669` |
| Taux / Performance | `#FCEACC` | `#EA580C` |
| Argent / CA perdu | `#ECCDF8` | `#9333EA` (deep `#6B21A8` pour valeurs XXL) |

Règle d'or : quand on parle d'argent, c'est violet. Quand on parle de no-shows, c'est émeraude. Etc.

## Typographie

- Body / UI : **Inter** (400/500/600/700) — chargée via `next/font/google`
- Serif numérique / headings éditoriaux : **Fraunces** (opsz 9..144, 500/600) — pour les chiffres XXL, les titres de sections rapport, les valeurs KPI, les citations pull-quote

Jamais `font-family: system-ui` nu. Jamais SF Pro.

## Formes

- Radius cards : `rounded-2xl` (20 px) pour KPI cards / content blocks
- Radius hero blocks : `rounded-3xl` (28 px) pour bandeaux CTA, hero money, score hero
- Radius boutons : `rounded-xl` (12 px)
- Radius chips / pills : `rounded-full`
- Bordures : 1 px `border-gray-200` (jamais > 1 px sauf encart CTA primary-dark intentionnel)

## Ombres

- Cards : `shadow-sm` ou sans ombre. Préférer bordure fine à ombre.
- CTA primary-dark : pas d'ombre colorée, une ombre douce `0 12px 40px -16px rgba(6,78,59,.3)` acceptée sur interaction

</design_tokens>

<landing_structure>

## Structure de `app/page.tsx` — 5 sections (issues des 4 sketches validés)

### 1. Sticky Nav + Hero (sketch 001 — variante **B**, fallback C)

- **Nav sticky** 72 px, bg `bg-white/90` + backdrop-blur léger, bordure bas `border-gray-200`
- Logo "GetLostRevenue" en Fraunces ou Inter 600 + pastille vert sapin (pas de svg complexe)
- Liens : "Comment ça marche", "Pour qui", "FAQ"
- CTA nav : bouton primary-dark `bg-[#064E3B] text-white rounded-xl`
- **Hero split 2-col** (variante B) :
  - Layout split 2 col desktop, stacked mobile (`grid md:grid-cols-2`, `max-w-6xl`)
  - Badge pill interrogatif au-dessus du H1 (`bg-emerald-50 text-emerald-700`)
  - H1 Fraunces serif XXL, max 2 lignes, ton interrogatif (pas "Découvrez" / "Révolutionnez")
  - Sous-titre Inter regular, 1 phrase factuelle
  - 2 CTA : primary-dark plein + secondaire ghost
  - Côté droit : **mini dashboard mockup** (`MiniDashboard`) avec les 4 KPI pastels, pas de chart complexe — juste poser la signature visuelle d'entrée

### 2. Stats + Target (sketch 002 — variante **B**)

- **Bandeau stats** pleine largeur sur `bg-white` : 3–4 chiffres Fraunces serif vert sapin avec séparateurs verticaux fins
- Chiffres factuels dentaires (ex : "8 %" taux moyen secteur, "27 k€" perte moyenne annuelle, "3 min" temps audit). Jamais de chiffre superlatif ("+1000", "∞", etc.)
- **Section "Pour qui"** :
  - Eyebrow "Pour qui" + titre Fraunces
  - Grid de cards cabinets cibles avec icône + label court (omnipratique, orthodontie, implantologie, groupes/réseaux). Cards rectangulaires radius 20 px, icône en pastille pastel variée (respecter la sémantique : surface neutre, pas de couleur saturée)

### 3. How It Works + Value + Score (sketch 003 — variante **C**)

- **"Comment ça marche"** en **timeline numérotée tricolore** (pas 3 cards en ligne) :
  - Étape 1 pastille bleu Volume `#DFF3FF/#2563EB` : "Chargez votre export"
  - Étape 2 pastille émeraude Signal `#DCF4E6/#059669` : "On analyse vos no-shows"
  - Étape 3 pastille orange Taux `#FCEACC/#EA580C` : "Recevez votre rapport"
  - Connecteur vertical fin `bg-gray-200` entre les 3
- **"Ce que révèle l'audit"** : bloc texte + checks émeraude, à côté une **floating score pill** : card blanche rounded-3xl montrant un score `72/100` Fraunces + ring SVG miniature. Jamais centrer cette score card en hero — elle flotte en accompagnement

### 4. Témoignage + FAQ + CTA final (sketch 004 — variante **B**)

- **Témoignage** : card blanche bordée `rounded-2xl`, avatar rond à gauche, citation Inter italic à droite, attribution (Dr. Nom + ville + spécialité) en meta
- **FAQ** : chaque question dans **sa propre card** `rounded-xl` (4 cards max), fond `bg-white` fermée → fond `bg-emerald-50` ouverte, chevron qui tourne, pas de divider horizontal
- **Bandeau CTA final** : pleine largeur, `bg-[#064E3B]`, radius 28 px, **2 colonnes** desktop (titre/paragraphe gauche, bouton blanc à droite). Pas d'email form inline. Bouton "Lancer mon audit" `bg-white text-[#064E3B]`

### 5. Footer minimaliste

- `bg-white` + bordure top `border-gray-200`
- 3 blocs : logo + tagline / liens produit / liens légaux
- Copyright Inter 12 px muted

</landing_structure>

<copy_guidelines>

## Ton & copy

- **Interrogatif > affirmatif** dans le hero : "Combien les no-shows vous coûtent-ils vraiment ?" > "Découvrez combien…"
- **Chiffré > superlatif** : "27 k€ de CA perdu / an" > "énorme manque à gagner"
- **Factuel > marketing-speak** : "8 % de taux moyen secteur" > "la plupart des cabinets"
- **Pas de "révolutionner", "disrupter", "transformer", "booster"**
- **Pas de "+1000 cabinets" / "utilisé partout"** si ce n'est pas vrai — préférer silence ou social proof honnête
- FR natif, jamais d'anglicisme gratuit ("dashboard" ok, "insights-driven" non)
- Voix cabinet : "votre cabinet", "vos rendez-vous", pas "le cabinet type"

</copy_guidelines>

<implementation_notes>

## Stack & conventions

- Tailwind v3 (existant), custom tokens dans `tailwind.config.ts` :
  - `kpiVolume`, `kpiSignal`, `kpiTaux`, `kpiArgent` (bg + fg)
  - `primaryDark: '#064E3B'`, `accentGreen: '#10B981'`
- Fonts via `next/font/google` dans `app/layout.tsx` → expose `--font-inter` et `--font-fraunces` comme CSS variables, appliquées sur `<body>` et `.font-serif` utility
- Pas de `next-themes` dark mode sur landing (forcer light)
- Framer Motion : uniquement pour fade-up légers au scroll (0.4 s, ease-out). Jamais spring bouncy, jamais stagger agressif
- Images : si hero mockup = DOM Tailwind (pas d'image), c'est préférable

## Composants à créer / adapter

- `LandingNav` (sticky + scroll shadow)
- `LandingHero` (split, mini dashboard mockup)
- `StatsBar` + `TargetGrid`
- `HowItWorksTimeline` (3 étapes tricolores)
- `ValueProps` + `ScorePill`
- `Testimonial` + `FAQCards` + `CTABand`
- `LandingFooter`

Chaque composant = `"use client"` uniquement si besoin (animations). Sinon RSC par défaut.

## Accessibilité

- Focus ring visible sur tous les CTA (`focus-visible:ring-2 ring-[#064E3B] ring-offset-2`)
- `aria-label` sur FAQ accordéons
- Contraste AA minimum : pastels ont un texte foncé sémantique (ex: violet `#6B21A8` sur `#ECCDF8`), ne jamais poser du texte blanc sur un pastel

</implementation_notes>

<when_to_use>

Active quand la demande concerne :
- Création ou refonte de la landing `app/page.tsx`
- Nouvelle section de landing (stats, pour qui, how it works, FAQ, CTA)
- Nav sticky, footer, témoignages landing
- Composants signature de la DA landing (hero interrogatif, timeline tricolore, CTA band primary-dark)

Ne pas activer pour le dashboard audit (`app/audit/page.tsx`) — utiliser `sketch-findings-audit-system-audit-noshows` à la place.

</when_to_use>
