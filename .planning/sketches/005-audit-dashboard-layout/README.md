---
sketch: 005
name: audit-dashboard-layout
question: "Quelle architecture de sidebar + sections scrollables pour le tableau de bord d'audit (direction B) ?"
winner: A
tags: [audit, dashboard, layout, phase-02]
---

# Sketch 005 — Audit Dashboard Layout (Direction B)

## Design Question

La page de résultats passe d'un flow séquentiel 5 steps à un **tableau de bord navigable**. Architecture retenue (direction B) : sidebar fixe à gauche + toutes les 5 sections visibles en scroll continu, scrollspy sur la sidebar.

Trois traitements de sidebar à comparer.

## How to View

```
open .planning/sketches/005-audit-dashboard-layout/index.html
```

## Variants

- **A — Classic sidebar** : sidebar 240 px avec logo + bloc infos cabinet + liste de 5 liens avec pastilles de couleur (reprise sémantique des 4 pastels KPI + vert pour Score) + CTA "Prendre RDV" en bas. Topbar main avec titre + bouton PDF. Sobre, lecture facile.

- **B — Icon-compact sidebar + topbar riche** ★ : sidebar réduite 64 px avec uniquement des icônes (tooltip au hover) + CTA icône seule. Topbar horizontale large avec nom cabinet en Fraunces + pills de métadata (date, période) + 2 boutons actions (PDF, RDV). Maximise la surface main.

- **C — Rich sidebar + sticky section headers** : sidebar 280 px avec **card "infos cabinet"** (nom Fraunces, généré le, période, RDV analysés) + liste numérotée Fraunces 1→5 avec barre verticale primary-dark sur l'item courant + **bloc CTA primary-dark** plein dans la sidebar. Main avec **breadcrumb sticky** qui change selon la section visible ("Rapport · Synthèse" → "Rapport · Manque à gagner"…).

## What to Look For

- Quelle densité de sidebar te paraît la plus lisible ? (A sobre, B minimal, C riche)
- Le bloc infos cabinet (A simple, B horizontal, C card) est-il utile en permanence ?
- Le CTA "Prendre RDV" : en bas de sidebar (A), icône seule (B), ou bloc vert sapin in-sidebar (C) ?
- Le breadcrumb sticky (C) apporte-t-il de la clarté ou du bruit ?
- Cohérence avec la Phase 1 (logo vert sapin, Fraunces pour chiffres, pastels KPI) ?

## Decision

**Winner (révisé 2026-04-23) : A — Classic sidebar 240 px avec bloc infos cabinet + liste 5 liens pastilles + CTA bas de sidebar.**

_Note : choix initial était B (icon-compact 64 px), révisé vers A pour privilégier une sidebar explicite avec labels lisibles et contexte cabinet permanent._

Next step : décomposer en sous-sketches pour les zones détaillées du dashboard (money build reveal, bars chart, plan d'action, CTA Calendly embed).

## Décomposition suivante (à construire après ce choix)

- 006 — audit-synthese-kpi (détail zone Synthèse)
- 007 — audit-money-build-detail (animation CA perdu reveal + breakdown)
- 008 — audit-charts (bars par jour + éventuels autres angles : praticien, tranche horaire, ancienneté)
- 009 — audit-plan-cta (3 cards plan + bandeau CTA + intégration Calendly)
</content>
</invoke>