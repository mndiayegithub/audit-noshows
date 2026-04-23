---
sketch: 009
name: audit-score-plan-cta
question: "Comment clôturer le dashboard : Score cabinet + Plan d'action tricolore + CTA Calendly final ?"
winner: C
tags: [audit, dashboard, score, plan, cta, phase-02]
---

# Sketch 009 — Score + Plan d'action + CTA Calendly

## Design Question

Dernières zones du dashboard (`#score`, `#plan`, `#rdv`). Trois blocs à enchaîner :
1. **Score cabinet** — jauge 72/100 (formule `100 − taux × 3.2`), couleur conditionnelle (émeraude ≥ 70 / orange 50–69 / rouge < 50)
2. **Plan d'action** — 3 étapes tricolores (bleu Volume → émeraude Signal → orange Taux)
3. **CTA final** — bandeau `#064E3B` primary-dark + embed Calendly ou bouton ouvrant modal

Trois traitements à comparer pour la composition de ces 3 blocs en fin de page.

## How to View

```
open .planning/sketches/009-audit-score-plan-cta/index.html
```

## Variants

- **A — 3 blocs empilés full-width** : Score (card blanche large avec ring SVG à gauche + label + narratif à droite), puis Plan (3 cards tricolores en grille 3 col), puis CTA bandeau primary-dark plein avec titre blanc + bouton blanc "Prendre rendez-vous". Lecture linéaire, simple, sans surprise.

- **B — Score + Plan en split 50/50, puis CTA** ★ : Score et Plan dans une **même rangée** (Score à gauche = card blanche ring 260 px + narratif court, Plan à droite = 3 cards tricolores empilées verticalement plus compactes). Puis bandeau CTA primary-dark plein avec 2 cols : titre+sous-titre à gauche + mini-preview Calendly embed à droite. Densifie la fin de page, pose le CTA comme climax.

- **C — Hero score immersif + plan timeline + CTA Calendly embed plein** : Score devient **hero** card primary-dark `#064E3B` plein fond, ring blanc, chiffre Fraunces XXL blanc, badge "Bon" / "À améliorer" / "Critique". Plan en **timeline verticale** gauche (3 étapes tricolores avec connecteur vertical) + narratif droite ("Étape 1 : Réduire les no-shows du jeudi…"). CTA final = **iframe Calendly inline** 520 px de haut sur fond gris-50 bordé primary-dark, bouton secondaire "ou planifier plus tard par email". Registre le plus "rapport d'expertise premium".

## What to Look For

- Hiérarchie de fin de page : linéaire (A), densifiée (B) ou crescendo (C) ?
- Le split Score/Plan (B) allège ou fragmente la lecture ?
- Le Calendly inline (C) est-il un bon climax ou un parasite dans le rapport ?
- Couleur du score : rester émeraude dans la jauge ou primary-dark vert sapin (C hero) ?
- Cohérence avec les 4 sections précédentes (Synthèse / Manque à gagner / Où & Quand) ?

## Decision

**Winner : C — Hero score primary-dark + plan timeline + Calendly embed inline** (validé 2026-04-23).
