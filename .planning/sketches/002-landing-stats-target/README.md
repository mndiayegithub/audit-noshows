---
sketch: 002
name: landing-stats-target
question: "Quelle lecture des stats chiffrées + quelle forme de 'Pour qui' pose le mieux la crédibilité institutionnelle ?"
winner: B
tags: [landing, stats, audience, phase-01]
---

# Sketch 002 — Landing Stats + Target audience

## Design Question

Après le hero, deux blocs qui posent la crédibilité :
1. **Bandeau stats** — 4 chiffres clés (+200 cabinets, 12 % taux, 22 k€ perte, 3 min)
2. **Section "Pour qui"** — 4 profils cibles avec icône + label

## How to View

```
open .planning/sketches/002-landing-stats-target/index.html
```

## Variants

- **A — Flat + 2×2 grid** : stats horizontales centrées font-black Inter (proche `new_design_audit.html`), target en grille 2 colonnes compacte (`max-w-lg`). Sobre, direct.

- **B — Serif comptable** ★ : chiffres en **Fraunces serif** couleur `#064E3B`, séparés par des filets verticaux gris très clair (effet "rapport chiffré"). Target en ligne unique 4 colonnes avec icônes primary-dark.

- **C — Mini-cards + illustrated list** : stats dans des mini-cards blanches avec `shadow-sm`, target en **liste verticale** (icône colorée dans pastille pastel + label + sous-texte). Plus riche, bascule vers un registre "cible détaillée".

## What to Look For

- Les chiffres sont-ils lisibles / impactants au premier regard ?
- La typo serif (B) est-elle trop luxe ou juste "institutionnelle" ?
- La liste verticale (C) alourdit-elle la page ou apporte-t-elle de la chair ?
- Cohérence globale avec le sketch 001 ?

## Decision

**Winner : B — Serif comptable** (validé 2026-04-23).

### ⚠️ Copy change au moment du build final

Dans la version implémentée, **la section "Pour qui" doit cibler les types de cabinets** (structures) et non les professions individuelles.

Reformuler les 4 items depuis :
- ❌ *Dentistes / Kinésithérapeutes / Ostéopathes / Médecins*

Vers des types de cabinets, par exemple :
- ✅ *Cabinets dentaires / Cabinets de kinésithérapie / Cabinets d'ostéopathie / Cabinets médicaux*
- ou variante plus fine : *Cabinets libéraux / Cabinets de groupe / Centres de santé / Maisons médicales*

À arbitrer dans le SPEC de Phase 01 — liste définitive à verrouiller là.
</content>
</invoke>