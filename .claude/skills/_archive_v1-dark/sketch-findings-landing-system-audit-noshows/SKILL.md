---
name: sketch-findings-landing-system-audit-noshows
description: Validated design decisions, CSS patterns, and visual direction for the landing page v2 (PerfIAmatic). Dark premium direction, distinct de l'audit clinique Apple Health. Auto-loaded when implementing the landing UI on system-audit-noshows. Triggers on terms like "refonte landing", "landing page", "page d'accueil", "app/page.tsx", "hero dark premium", "landing.html".
---

<context>
## Project: system-audit-noshows (PerfIAmatic) — Landing page phase 1

SaaS audit tool for medical practices (dentistes, médecins, kinés/ostéos).
La landing (`app/page.tsx`) est refondue en direction **dark premium** pour capter
et convertir, distincte de la direction clinique Apple Health du rapport d'audit.

**Design direction consolidée :** dark premium B2B, palette noire avec mesh radial
violet/rose, typographie SF Pro Display + New York serif pour chiffres-clés en
gradient, glassmorphism subtil sur les cards. Ton mixte : hero commercial
(chiffre choc, gradient) + reste factuel (how it works, FAQ, stats).

**Cible :** cabinets médicaux FR (dentistes, médecins, paramédical) — messaging
générique large avec spécialités mentionnées dans le social proof.

**Reference points :** Linear / Stripe pour les landings dark premium, Vercel
pour le hero split, Apple (SF Pro + serif authority numbers).

**CTA unique :** vers `/audit` (page de résultats). Pas d'upload direct, pas
de Calendly sur la landing.

Sketches wrapped: 2026-04-22 (sketches 005-008)
</context>

<design_direction>
## Overall Direction

**Dark premium**, bg `#0A0A0C`, glassmorphism sur cards (`rgba(255,255,255,0.04)` + blur 10-14px), mesh radial violet/rose en fond des sections.

Signature visuelle :
- Chiffres-clés en **serif New York** avec gradient text violet→rose (`#A78BFA → #F472B6`)
- Titres H1/H2 en SF Pro Display avec gradient blanc→gris (`#FFFFFF → #C7C7CC`)
- CTA pill blanc (`#F5F5F7`) sur fond noir — contraste max, action unique
- Border-radius 14-20px (cards), 999px (pills CTA)
- Shadows profondes non colorées pour élévations majeures (`0 30px 80px rgba(0,0,0,0.5)`)
- Halo violet/rose flouté (`filter: blur(28px)`) derrière les cards d'impact

Interactions signatures :
- **Split hero** avec preview rapport glassmorphism en rotation `0.6deg`
- **Marquee logos infini** avec mask fade sur les bords
- **Accordéon FAQ épuré** border-top/bottom, chevron `+` rotate 45°
- **Dot pulse vert** pour status "live" / "gratuit"
- **Hover cards** translateY -2px + bg lighter

Copy :
- Phrases courtes finissant sur le chiffre-clé, ton factuel
- Hero : accent commercial toléré (gradient, promesse forte)
- Reste : registre factuel, zéro superlatif
- Reassurance ubiquitaire : ⏱ 60 s · 🔒 RGPD · 📎 PDF sans achat · 🚫 sans CB

**Direction alternative à prévoir :** un toggle dark/light pourrait basculer la landing
vers une version light (même structure, palette clinique) — sketch 005 variant C est
le pendant light du hero.
</design_direction>

<findings_index>
## Design Areas

| Area | Reference | Key Decision |
|------|-----------|--------------|
| Landing page (full) | `references/landing-page.md` | Dark premium, split hero + 3 steps + marquee stats + FAQ minimal + final CTA full-bleed |

## Theme

Les tokens sont partagés avec le skill audit (`sources/themes/default.css`). La
surcouche dark est gérée localement dans chaque section via des variables inline.
Pour l'implémentation Tailwind, ajouter un set de couleurs `landing-*` ou wrapper
la page dans un `[data-theme="dark-premium"]` si un toggle est prévu.

## Source Files

Les 4 sketches HTML originaux sont préservés dans `sources/` avec leur README
(design question, winner, tags). Ouvrables directement dans un navigateur
pour référence visuelle pendant l'implémentation.
</findings_index>

<when_to_use>
## When Claude Should Auto-Invoke This Skill

Charger systématiquement ce skill quand la tâche concerne :
- Refonte ou modification de `app/page.tsx` (landing)
- Création de composants landing (hero, how-it-works, social proof, FAQ, CTA final)
- Décisions sur palette dark, typo, gradients, halo violet/rose de la landing
- Copy/ton de la landing (titres, ledes, reassurance)
- Adaptation responsive/mobile de la landing
- Implémentation d'un toggle dark/light pour la landing
- Migration / suppression des anciens fichiers (`landing.html`, `landing-preview.html`, `mockup.html`)

**Ne PAS invoquer** pour :
- La page audit (`app/audit/page.tsx`) — direction distincte (clinique Apple Health), couverte par `sketch-findings-system-audit-noshows`
- Le formulaire d'upload CSV — hors scope v2
- Le PDF (`RapportPDF.tsx`) — direction dark/gold existante conservée
</when_to_use>

<constraints>
## Hard Constraints (non-négociables, héritent de PROJECT.md)

1. **CTA unique vers `/audit`** — un seul parcours self-serve, pas d'upload inline, pas de Calendly direct sur la landing
2. **Messaging générique cabinets médicaux FR** — dentistes, médecins, paramédical. Pas de niche exclusive dentiste
3. **Pas de données personnelles dans les mocks** — les témoignages et stats actuels (Dr Marchand, 240 cabinets, 9,4 M€) sont des placeholders à remplacer avant prod
4. **Conformité RGPD visible** — mention dans reassurance + FAQ
5. **Performance** — landing légère, pas de lib animation lourde (CSS/SVG natif suffit, marquee en CSS animation)
6. **Cohérence de marque** passe par les chiffres serif et le ton, pas par la palette (autorisé à diverger du clinique blanc du rapport)
</constraints>

<metadata>
## Processed Sketches

- 005-hero-impact (winner D · Split dark premium message + preview rapport)
- 006-how-it-works (winner A · 3 steps numérotés horizontaux dark premium)
- 007-social-proof (winner B · Marquee logos + 4 stats KPI)
- 008-faq-final-cta (winner C · FAQ minimal 4 Q + section finale full-bleed)

Last wrap-up: 2026-04-22
</metadata>
