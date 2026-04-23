---
sketch: 008
name: audit-charts
question: "Comment présenter la zone Où & Quand (répartition des no-shows) — bars par jour + angles complémentaires ?"
winner: B
tags: [audit, dashboard, chart, phase-02]
---

# Sketch 008 — Où & Quand (bars par jour + angles complémentaires)

## Design Question

Troisième zone du dashboard (`#ou-et-quand`). Objectif : **répondre à "où se concentrent les no-shows ?"** avec au minimum un bar chart par jour de la semaine (couleur Signal émeraude pastel), et éventuellement un ou deux angles complémentaires (tranche horaire, praticien, ancienneté patient) pour rendre le diagnostic actionnable.

Trois partis pris à comparer : chart unique focalisé, double chart côte à côte, ou triptyque exhaustif avec insight.

## How to View

```
open .planning/sketches/008-audit-charts/index.html
```

## Variants

- **A — Bars par jour seul, grand format** : **un seul chart** sur toute la largeur, bars verticales émeraude `#DCF4E6` / `#059669` sur bg gris-50. 7 jours × hauteur proportionnelle au nombre de no-shows. Valeur affichée au-dessus de chaque barre. Un insight textuel discret en bas ("Pic le jeudi : 12 no-shows, soit 21 % du total"). Minimaliste, lisible, sans bruit.

- **B — Par jour + Par tranche horaire côte à côte** ★ : **deux charts** dans une grille 2 col. À gauche : bars par jour (émeraude). À droite : bars par tranche horaire (8h–10h / 10h–12h / 14h–16h / 16h–18h / 18h–20h) en orange pastel Taux. Chaque chart a son propre titre et mini-insight dessous. Permet de croiser jour × heure mentalement.

- **C — Triptyque : jour + heure + praticien + insight card** : **trois mini-charts** en ligne (jour émeraude / heure orange / praticien bleu Volume), suivis d'une **card insight large** primary-dark light (`#064E3B` 5 % de saturation) synthétisant le diagnostic : "Votre créneau à risque : **jeudi 16h–18h avec Dr. Laurent** (28 % des no-shows malgré 11 % des RDV)." Registre le plus "rapport d'expertise".

## What to Look For

- Quelle densité de data rend le mieux le diagnostic ? (A minimal, B double, C exhaustif)
- Le bar par heure (B) apporte-t-il vraiment un angle utile ou dilue-t-il le chart jour ?
- L'insight final (C) est-il trop ambitieux pour ce qu'on peut générer de manière fiable côté n8n ?
- Les couleurs restent-elles lisibles côte à côte (émeraude + orange + bleu Volume) sans clash avec la signature KPI ?
- Cohérence avec la règle : ce qui est coloré ici = Signal (émeraude) car on parle toujours des no-shows ?

## Decision

**Winner : B — Par jour + Par tranche horaire côte à côte** (validé 2026-04-23).
