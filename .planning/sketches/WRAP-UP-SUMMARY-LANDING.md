# Sketch Wrap-Up Summary — Landing (phase 1)

**Date:** 2026-04-22
**Sketches processed:** 4 (005-008)
**Design areas:** 1 (Landing page — single coherent page)
**Skill output:** `./.claude/skills/sketch-findings-landing-system-audit-noshows/`

## Included Sketches

| # | Name | Winner | Design Area |
|---|------|--------|-------------|
| 005 | hero-impact | D · Split dark premium (message + preview rapport) | Landing page |
| 006 | how-it-works | A · 3 steps numérotés horizontaux | Landing page |
| 007 | social-proof | B · Marquee logos + 4 stats KPI | Landing page |
| 008 | faq-final-cta | C · FAQ minimal 4 Q + section finale full-bleed | Landing page |

## Excluded Sketches

_None — les 4 sketches sont cohérents et inclus dans le skill._

## Design Direction

Landing B2B **dark premium** pour cabinets médicaux FR (dentistes, médecins,
paramédical). Direction volontairement distincte du rapport d'audit clinique
Apple Health : la landing a un rôle commercial (capter, crédibiliser,
convertir), l'audit a un rôle factuel (mesurer, chiffrer, motiver l'action).

La cohérence de marque passe par les **chiffres-clés serif en gradient** et
le **ton factuel sobre** du corps — pas par la palette. Ce découplage
volontaire permet un effet de contraste à la sortie de la landing : "ça
devient sérieux" quand on arrive sur le rapport.

Un **toggle dark/light** est envisagé à l'implémentation — le sketch 005
variant C sert de pendant light du hero en miroir.

## Key Decisions

- **Palette** : `#0A0A0C` bg · glassmorphism `rgba(255,255,255,0.04)` + blur · gradient signature violet `#A78BFA` → rose `#F472B6` → orange `#FB923C` accent
- **Typo** : SF Pro Display pour titres avec gradient blanc→gris · New York serif pour chiffres-clés en gradient violet→rose · `letter-spacing: -0.03em` · tabular-nums
- **Radius** : 14-20px (cards), 999px (pills CTA, badges)
- **Shadows** : profondes non colorées (`0 30px 80px rgba(0,0,0,0.5)`), jamais colorées sauf halo subtil flouté derrière les cards d'impact
- **Structure** : Nav sticky blur → Hero split 2 col → How it works 3 cards horizontales → Social proof marquee + 4 stats → FAQ minimal 4 Q → Final CTA full-bleed → Footer minimal
- **Interactions clés** :
  - Split hero avec preview rapport en rotation `0.6deg` + halo blur violet/rose
  - Marquee logos infinie (30s linear) avec mask fade sur les bords
  - Accordéon FAQ épuré, chevron `+` rotate 45°
  - Dot pulse vert pour status "gratuit / live"
  - Hover cards : translateY -2px + bg lighter
- **CTA** : unique vers `/audit` · pill blanc `#F5F5F7` sur fond noir · présent en nav, hero, section finale
- **Reassurance** : ⏱ 60 s · 🔒 RGPD · 📎 PDF sans achat · 🚫 sans CB — reprise à chaque CTA
- **Copy** : phrases courtes finissant sur le chiffre-clé, ton factuel, accent commercial toléré dans le hero uniquement

## Anti-patterns (à ne pas reprendre)

- Hero full mesh + gradient surchargé (sketch 005 B) — perd l'ancrage produit
- Video-like player mock (sketch 006 C) — gimmick sans valeur narrative
- Cards témoignages classiques SaaS 5★ (sketch 007 A) comme choix principal — à garder en alternative avec animation spéciale
- Accordéon + sticky CTA pill (sketch 008 A) — sticky peut paraître agressif après 2 CTA déjà vus
- FAQ 6 Q tout ouvert 2 cols (sketch 008 B) — mur de texte, visiteur saute
- Emoji décoratifs à outrance — réservés aux 3-4 micro-signaux reassurance
- Direction clinique Apple Health pour la landing entière — écartée, cohérence passe par chiffres serif + ton

## Open Questions

- **Toggle dark/light** — à décider en implémentation : livrer dark seul, ou construire les 2 versions via `[data-theme="..."]` ?
- **Animation du variant A de 007** (cards témoignages) — idée personnelle du user à préciser
- **Vrais témoignages + stats** — tous les mocks à remplacer avant prod (Dr Marchand, 240 cabinets, 9,4 M€ CA, 4,8/5, 54 s)
- **Logos cabinets** du marquee — mock génériques, vrais logos avec accord, ou juste des noms textuels stylisés ?
- **Nav mobile** — pas encore sketché (menu burger vs nav minimal)

## Scope exclus de ce skill

- **Page audit** (`app/audit/page.tsx`) — skill distinct `sketch-findings-system-audit-noshows` (direction clinique Apple Health)
- **Upload CSV form** — préservé, hors scope
- **PDF** (`RapportPDF.tsx`) — direction dark/gold existante conservée
- **Anciens fichiers** (`landing.html`, `landing-preview.html`, `mockup.html`) — à supprimer en fin de phase 1 après migration
