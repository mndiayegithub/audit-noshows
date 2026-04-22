---
name: sketch-findings-system-audit-noshows
description: Validated design decisions, CSS patterns, and visual direction from sketch experiments for the audit report v2 (PerfIAmatic). Auto-loaded when implementing UI on system-audit-noshows. Triggers on terms like "refonte audit", "page résultats", "rapport v2", "stepped reveal", "step card", "money build", "activity ring", "sticky CTA", "synthèse + CTA Calendly".
---

<context>
## Project: system-audit-noshows (PerfIAmatic)

SaaS audit tool for dental practices. The audit page (`app/audit/page.tsx`)
is being redesigned as a **stepped-reveal report** in a clinical Apple Health
style. Four sketches were run on 2026-04-22 to validate the direction
before implementation.

**Design direction consolidée :** rapport clinique/factuel, Apple Health
inspired, blanc clinique, typographie serif pour les chiffres-clés, palette
neutre + accents médicaux (bleu `#0066CC` / rouge `#FF3B30`). Zéro dark
premium SaaS, zéro gradient tape-à-l'œil, zéro marketing growth-hacking.

**Reference points :** Apple Health (Activity Rings, SF Pro Display),
rapports médicaux cliniques, Stripe/Linear pour la rigueur des cards.

Sketches wrapped: 2026-04-22
</context>

<design_direction>
## Overall Direction

**Stepped reveal 6 steps**, une section = un écran, chacune avec son graphique
contextuel. Le praticien est guidé section par section, sans scroll. Chaque
step fait monter l'inconfort factuel.

Signature visuelle :
- Chiffres-clés en **serif** (New York / Source Serif), letter-spacing `-0.03em`, tabular-nums
- Rouge `#FF3B30` réservé aux signaux forts (CA perdu, taux no-show, score bas)
- Orange `#FF9500` pour les warnings intermédiaires
- Cards noires (`--text: #1D1D1F`) pour les moments verdict/CTA, avec radial rouge subtle au top
- Border-radius 14/20px, shadows très subtiles (0-12px max), jamais de gradient coloré

Interactions signatures :
- **Reveal latéral** sur le step 02 (money build → split marché via bouton noir flottant)
- **Activity ring** SVG sur le step 05 (score global 54/100)
- **Sticky CTA pill** en bas pendant le step 05
- **Split blanc/noir** problème/solution sur le step 06

Copy : phrases courtes finissant sur le chiffre-clé, ton factuel, zéro superlatif marketing.
</design_direction>

<findings_index>
## Design Areas

| Area | Reference | Key Decision |
|------|-----------|--------------|
| Audit Report v2 | `references/audit-report-v2.md` | Stepped reveal 6 steps, Apple Health clinique, chiffres serif rouge |

## Theme

Le theme CSS complet est dans `sources/themes/default.css`. À copier-adapter
dans l'implémentation (peut être consolidé dans `app/globals.css` ou en
tokens Tailwind).

## Source Files

Les 4 sketches HTML originaux sont préservés dans `sources/` avec leur
README (design question, winner, tags). Ouvrables directement dans un
navigateur pour référence visuelle pendant l'implémentation.
</findings_index>

<when_to_use>
## When Claude Should Auto-Invoke This Skill

Charger systématiquement ce skill quand la tâche concerne :
- Refonte ou ajout de section sur `app/audit/page.tsx`
- Création de nouveaux composants sous `components/audit/`
- Décisions sur la palette, la typographie, les graphs, le CTA du rapport
- Copie/ton du rapport d'audit (titres, ledes, reassurance CTA)
- Adaptation responsive/mobile du stepped reveal

**Ne PAS invoquer** pour :
- La landing page (`app/page.tsx`, `landing.html`, `mockup.html`) — direction design distincte, non couverte par ce skill
- Le formulaire d'upload CSV — hors scope (préserver l'existant)
- Le PDF (`components/audit/RapportPDF.tsx`) — direction dark/gold existante, conservée telle quelle sauf décision explicite
</when_to_use>

<constraints>
## Hard Constraints (non-négociables)

1. **`ca_perdu` est déjà annualisé par n8n** — ne jamais multiplier côté frontend
2. **Clé Google Places API** côté serveur uniquement, jamais dans le bundle client
3. **Score /50 si Google absent** avec mention explicite "Score partiel"
4. **Fallback gracieux** si Google Places échoue : le rapport s'affiche sans step Google
5. **RGPD** : aucun nom patient dans les graphes/synthèse (aggregates only)
6. **Performance** : rapport affiché en < 60s total, stepped reveal léger (CSS/SVG natif, pas de lib lourde de transitions)
</constraints>

<metadata>
## Processed Sketches

- 001-layout-structure (winner C · Stepped reveal 6 steps)
- 002-hero-kpi (winner D · Money build + reveal latéral comparatif marché)
- 003-conversion-moment (winner A · Activity ring + sticky CTA)
- 004-synthesis-cta (winner C · Split problème/solution + CTA Calendly)

Last wrap-up: 2026-04-22
</metadata>
