---
sketch: 006
name: audit-synthese-kpi
question: "Comment présenter la zone Synthèse (4 KPI pastels grand format) dans le dashboard direction B ?"
winner: B
fallback: C
tags: [audit, dashboard, kpi, synthese, phase-02]
---

# Sketch 006 — Audit Synthèse (4 KPI pastels grand format)

## Design Question

Première zone du dashboard d'audit (`#synthese`). Elle doit **immédiatement poser les 4 chiffres clés** de l'audit : RDV analysés (Volume / bleu), No-shows (Signal / émeraude), Taux de no-show (Taux / orange), CA perdu (Argent / violet).

Trois traitements à comparer pour la disposition, la densité et le contexte qui accompagne les KPI.

## How to View

```
open .planning/sketches/006-audit-synthese-kpi/index.html
```

## Variants

- **A — Grid 4 colonnes pure** : 4 KPI cards de taille égale en une rangée, chaque card contient label + valeur Fraunces XXL + sous-label. Minimum de contexte, lecture immédiate façon cockpit. Au-dessus : petite phrase d'introduction "Voici ce que nous avons trouvé".

- **B — Hero KPI Argent + 3 KPI secondaires** ★ : le KPI **CA perdu** (violet) devient hero sur toute la largeur (valeur Fraunces énorme, sous-label, delta vs benchmark). En dessous, les 3 autres KPI (Volume/Signal/Taux) en rangée compacte. Hiérarchie claire : l'argent d'abord, les causes ensuite.

- **C — 2×2 grid + panneau contextuel droit** : 4 KPI en grille 2×2 à gauche (60% largeur), panneau droit "Contexte de l'audit" (40%) avec période, nb praticiens, type de cabinet, + 1 phrase de lecture narrative générée ("Sur les X RDV analysés, Y% n'ont pas été honorés, représentant Z € de CA perdu sur l'année."). Lecture plus posée, davantage éditoriale.

## What to Look For

- Hiérarchie : traiter les 4 KPI à égalité (A) ou mettre l'argent en hero (B) ?
- Le panneau contextuel (C) aide à la lecture ou alourdit la page ?
- Densité : grid pure (A), pyramide (B), ou 2×2 + side (C) ?
- Cohérence pastels sémantiques : les 4 couleurs restent distinctes sans conflit visuel ?
- Quel format donne le plus envie de scroller vers Manque à gagner ensuite ?

## Decision

**Winner : B — Hero Argent + 3 KPI compact** (validé 2026-04-23).

**Fallback : C — 2×2 + panneau contextuel** conservé en option de repli. À ré-arbitrer au moment du Plan si B paraît trop frontal.
