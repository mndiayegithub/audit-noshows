---
sketch: 001
name: layout-structure
question: "Quelle structure globale pour la page de résultats de l'audit ?"
winner: "C"
tags: [layout, flow, results-page]
---

# Sketch 001 — Layout structure

## Design Question

Quelle structure globale pour la page de résultats de l'audit ?
Cette décision conditionne tout le reste : rythme de lecture, densité
d'information, moment où le CTA apparaît, sensation générale.

## How to View

```bash
open .planning/sketches/001-layout-structure/index.html
```

## Variants

- **A — Scrollytelling vertical**
  Long scroll continu, chiffre XXL en hero, sections chaînées avec séparateurs
  clairs, CTA dark en footer. Lecture linéaire narrative. Principe : "laisse
  le chiffre respirer, puis décompose l'histoire".

- **B — Grille Apple Health**
  Dashboard-like, tuiles de tailles variables (hero large + KPI tiles + graph
  tile + ring tile). Le score est une "activity ring", le Google block est
  une tile dashed (optionnelle), le CTA est une tile sombre finale. Vue
  d'ensemble immédiate, densité médicale.

- **C — Stepped reveal**
  5 sections présentées une à une comme un parcours guidé (1/5 → 5/5).
  Progress bar en haut, bouton "Continuer" en bas. Aucun scroll, chaque
  section prend tout l'écran. Contrôle total du rythme. La section finale
  contient le CTA.

## What to Look For

- **Rythme émotionnel** : laquelle "fait le plus mal" au bon moment ?
- **Scannabilité** : si le praticien veut juste voir le chiffre, laquelle est la plus rapide ?
- **Mobile friendly** : Variant B se réduit à 2 colonnes, C reste 1 section/écran, A scroll natural
- **Position du CTA** : unique en bas (A/B) vs section dédiée finale (C)
- **Sensation globale** : médicale/clinique (B) vs narrative (A) vs parcours/wizard (C)
- **Risque** : A peut paraître long, B peut paraître "trop dashboard" (pas assez narratif), C peut frustrer (obligatoire de cliquer)
