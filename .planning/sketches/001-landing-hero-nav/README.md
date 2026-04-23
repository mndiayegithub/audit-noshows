---
sketch: 001
name: landing-hero-nav
question: "Quelle composition hero + nav amène le mieux les 4 KPI pastels et le positionnement clinique-claire ?"
winner: B
fallback: C
tags: [landing, hero, nav, phase-01]
---

# Sketch 001 — Landing Hero + Nav

## Design Question

Le haut de la landing doit montrer :
1. Qui on est (nav + logo)
2. La question qui dérange le lecteur (H1 interrogatif)
3. Ce qu'il va recevoir (preview 4 KPI pastels)

Trois compositions explorées **dans** la DA clinique-claire verrouillée.

## How to View

```
open .planning/sketches/001-landing-hero-nav/index.html
```

Les 3 variants se basculent via la barre d'onglets en haut.

## Variants

- **A — Centered stacked** (reprend `new_design_audit.html` 1:1) : hero texte centré, CTAs centrés, dashboard mockup complet centré dessous, `max-w-xl`. Sécurité maximale, cohérent avec la maquette validée. Tout le poids visuel sur l'axe central.

- **B — Split 2-col** : texte hero à gauche, dashboard mockup à droite sur desktop (2 colonnes `max-w-1200`). Sur mobile collapse en empilé. Plus "Stripe / Linear" — équilibré, permet de voir le produit immédiatement en périphérie du regard lors de la lecture.

- **C — Compact + KPI strip** ★ : hero texte et CTAs classiques, puis **à la place du mockup** une bande horizontale des 4 KPI pastels (sans barre macOS, sans chart). Le mockup complet est reporté plus bas dans la page. Hero léger, densité allégée.

## What to Look For

- Où se pose l'œil en premier ?
- La promesse (CA perdu violet) reste-t-elle lisible dans chaque composition ?
- La hauteur de scroll avant de voir les 4 KPI ?
- Mobile : qui se dégrade le mieux ?

## Decision

**Winner : B — Split 2-col** (ré-arbitré 2026-04-23 après build réel ; variante C paraissait trop légère).

**Fallback : C — Compact + KPI strip** conservé comme option de repli.
</content>
</invoke>