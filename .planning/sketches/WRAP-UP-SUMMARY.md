# Sketch Wrap-Up Summary

**Date:** 2026-04-22
**Sketches processed:** 4
**Design areas:** 1 (Audit Report v2)
**Skill output:** `./.claude/skills/sketch-findings-system-audit-noshows/`

## Included Sketches

| # | Name | Winner | Design Area |
|---|------|--------|-------------|
| 001 | layout-structure | C · Stepped reveal 6 steps + graph/section | Audit Report v2 |
| 002 | hero-kpi | D · Money build + reveal latéral comparatif marché | Audit Report v2 |
| 003 | conversion-moment | A · Activity ring + breakdown + sticky CTA | Audit Report v2 |
| 004 | synthesis-cta | C · Split problème / solution + CTA Calendly | Audit Report v2 |

## Excluded Sketches

_None — les 4 sketches sont cohérents et inclus dans le skill._

## Design Direction

Rapport d'audit dentaire en mode **clinique & factuel**, inspiré Apple
Health et rapports médicaux. Blanc clinique, grands nombres avec autorité,
typographie serif pour les chiffres-clés, palette neutre + accents
médicaux. Direction volontairement éloignée du dark premium SaaS existant
(`landing.html`, `mockup.html`) pour positionner le rapport comme un
document médical sérieux plutôt qu'un dashboard produit.

## Key Decisions

- **Layout** : stepped reveal 6 steps (1 écran = 1 section), avec un
  graphique contextuel par step
- **Palette** : `#F7F7F8` (bg clinique) / `#1D1D1F` (text + cards noires
  CTA) / `#FF3B30` rouge Apple (alertes) / `#FF9500` orange (warnings) /
  `#0066CC` bleu médical (liens, actions secondaires)
- **Typo** : SF Pro Display / New York serif pour les chiffres d'autorité
  (42 380 €, 14,2 %, 54/100), letter-spacing `-0.03em`, tabular-nums
- **Radius** : 14 / 20px (cards), 999px (pills CTA et buttons)
- **Shadows** : subtiles (0-12px max), jamais colorées
- **Interactions clés** :
  - Reveal latéral sur step 02 (money build → split marché, 700ms cubic-bezier)
  - Activity ring Apple-like sur step 05
  - Sticky CTA pill noir flottant pendant step 05
  - Split blanc/noir problème/solution sur step 06
- **CTA** : unique en fin (step 06), avec reassurance micro ⏱ 48h · 🔒 RGPD · 📎 plan même sans achat
- **Copy** : phrases courtes finissant sur le chiffre-clé, ton factuel, zéro superlatif

## Anti-patterns (à ne pas reprendre)

- Dark premium SaaS / aurora mesh / glassmorphisme (direction des landings existantes)
- Gradients colorés, shadows colorées, effets 3D
- Compteur animé 0 → X € avec équivalents "Dacia / 85 prothèses" (testé sketch 002 variant B, rejeté comme racoleur)
- Emoji décoratifs à outrance (sauf micro-signaux reassurance CTA)
- Timeline récap complète dans le step 05 (testé sketch 003 variant D, rejeté car doublon avec steps 1-4)
- Step 6 avec juste une grande verdict card seule sans détailler le RDV (testé sketch 004 variant A/B, rejetés car n'expliquent pas la valeur du 30 min)

## Scope exclus de ce skill

- **Landing page** (`app/page.tsx`, `landing.html`, etc.) — à traiter séparément, directions visuelles distinctes
- **Upload CSV** — préservé tel quel, hors scope v2
- **PDF** (`components/audit/RapportPDF.tsx`) — direction dark/gold existante conservée
- **Widget Calendly** (iframe embed vs popup vs redirect) — décision reportée à l'implémentation

## Open Questions résiduelles

- Choix technique Calendly (embed iframe, popup `window.Calendly`, ou redirect)
- Comportement mobile fin (sketches testés, mais pas formellement validé sur device)
- Faut-il garder les 3 variantes de landing HTML ou les supprimer ?
