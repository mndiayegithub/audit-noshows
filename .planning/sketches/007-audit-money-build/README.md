---
sketch: 007
name: audit-money-build
question: "Comment dramatiser le CA perdu (zone Manque à gagner) avec breakdown et reveal ?"
winner: A
tags: [audit, dashboard, money, reveal, phase-02]
---

# Sketch 007 — Manque à gagner (CA perdu violet plein + breakdown + reveal)

## Design Question

Deuxième zone du dashboard (`#manque-a-gagner`). Objectif : **dramatiser la perte financière** (violet plein, la seule zone fond pastel plein de la page) et décomposer le chiffre pour rendre l'audit crédible.

Trois approches à comparer pour la narration du chiffre : bloc dense, reveal progressif, ou éclaté en stacked bars.

## How to View

```
open .planning/sketches/007-audit-money-build/index.html
```

## Variants

- **A — Card violet plein + breakdown inline** : grande card violet `#6B21A8` fond plein sur toute la largeur. À gauche : valeur Fraunces XXL `47 200 €` + sous-titre. À droite : stack de 3 lignes breakdown (57 no-shows × 95 € × 12 mois / période). Tout visible d'emblée, sans animation.

- **B — Reveal narratif en 3 temps** ★ : card violet plein qui se **construit** au scroll : (1) d'abord `57 no-shows` (apparaît), (2) puis `× 95 € = 5 415 €/mois` (apparaît), (3) enfin `× 12 = 47 200 €/an` (apparaît en grand). Chaque ligne a son étape numérotée. Termine avec une petite phrase "Soit 3,8 semaines de CA qui disparaissent." Lecture plus cinématique.

- **C — Hero chiffre + stacked bar horizontale** : valeur Fraunces `47 200 €` en hero au-dessus, sur fond blanc. Puis une **stacked bar horizontale** colorée (violet pastel + violet plein) qui illustre la répartition : "CA encaissé" (tranche émeraude pastel) / "CA perdu" (tranche violet plein) à l'échelle proportionnelle du CA annuel total. Chiffres posés au-dessus de chaque tranche. Registre plus "graphique business".

## What to Look For

- Quel format provoque le plus de réaction émotionnelle sur le chiffre 47 200 € ?
- Le reveal (B) apporte du relief ou complique la compréhension ?
- La stacked bar (C) aide à contextualiser la perte vs le CA total ou dilue le message ?
- Respect de la règle : le **violet plein** reste réservé à cette zone uniquement (signature pastel) ?
- Cohérence avec hero Argent de sketch 006 (on ne répète pas la même card) ?

## Decision

**Winner : A — Card violet plein + breakdown inline** (validé 2026-04-23).
