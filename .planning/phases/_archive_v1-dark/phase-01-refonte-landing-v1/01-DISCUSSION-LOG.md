# Phase 1 : Refonte Landing v2 — Discussion Log

> **Audit trail only.** Ne pas utiliser comme entrée pour les agents de planning / execution.
> Les décisions sont capturées dans `01-CONTEXT.md` — ce log préserve les alternatives considérées.

**Date :** 2026-04-22
**Phase :** 01-refonte-landing-v2
**Areas discussed :** Stratégie toggle dark/light · Structure des composants · Marquee animation

---

## Theme / Toggle dark-light

### Q1 — Lib / approche pour le toggle ?

| Option | Description | Selected |
|--------|-------------|----------|
| next-themes | Lib standard Next, SSR + no-flash + localStorage + OS auto | ✓ |
| CSS vars + [data-theme] custom | Zero dep, ~30 lignes maison, full control | |
| Tailwind dark: class mode | `darkMode: 'class'`, syntaxe native mais verbeuse | |

**User's choice :** next-themes (recommandé)
**Notes :** Standard communauté, minimise le risque de flash et le boilerplate.

### Q2 — Comportement au premier load ?

| Option | Description | Selected |
|--------|-------------|----------|
| Dark par défaut, sans OS | Tous les visiteurs voient dark | |
| Respecter OS (prefers-color-scheme) | Light si OS en light, dark sinon | ✓ |
| Dark par défaut + option OS via next-themes | Forcer dark mais proposer System | |

**User's choice :** Respecter l'OS (prefers-color-scheme)
**Notes :** Plus respectueux de l'utilisateur, alignement avec les conventions modernes.

---

## Component structure

### Q3 — Découpage en composants ?

| Option | Description | Selected |
|--------|-------------|----------|
| Découpage par section dans components/landing/ | 6 fichiers dédiés, app/page.tsx = orchestration | ✓ |
| Tout dans app/page.tsx (monolithe) | 1 fichier ~500 lignes | |
| Hybride primitives + sections inline | Extraire uniquement GradientText/GlassCard/etc | |

**User's choice :** Découpage par section dans `components/landing/`
**Notes :** Plus maintenable, testable section par section.

### Q4 — Sous-composant dédié pour le preview rapport du hero ?

| Option | Description | Selected |
|--------|-------------|----------|
| Oui, ReportPreview.tsx dédié | Prêt à accepter de vraies props plus tard | ✓ |
| Non, inline dans LandingHero | Pas d'abstraction premature | |

**User's choice :** Oui, composant dédié ReportPreview.tsx
**Notes :** Anticipation d'une future réutilisation ou alimentation par vraies données.

---

## Animation marquee (social proof)

### Q5 — Technique pour le marquee infini ?

| Option | Description | Selected |
|--------|-------------|----------|
| CSS pure @keyframes translateX (recommandé) | Zero JS, perf max, GPU | |
| Framer Motion (déjà dans le stack) | Plus de contrôle, pause hover facile, déjà importé | ✓ |
| Lib dédiée react-fast-marquee | API prête, mais dep supplémentaire | |

**User's choice :** Framer Motion (déjà dans le stack)
**Notes :** Évite une nouvelle dépendance, profite de la fluidité d'intégration des controls Framer.

### Q6 — Comportement au hover ?

| Option | Description | Selected |
|--------|-------------|----------|
| Pause au hover (recommandé) | S'arrête quand souris dessus, UX standard | ✓ |
| Pas de pause, défilement continu | Plus simple | |

**User's choice :** Pause au hover
**Notes :** Meilleure UX, permet de lire un logo spécifique.

---

## Claude's Discretion

- Tailwind config exact pour tokens dark/light (CSS vars vs `darkMode: 'class'`)
- Naming des CSS variables (ex: `--landing-bg`)
- Extraction des primitives GradientText / GlassCard (selon duplication observée)
- Nav mobile : burger ou compressed
- Scroll-triggered apparition animations (bonus)

## Deferred Ideas

- Collecte vrais témoignages / stats / logos (préparation parallèle hors phase)
- Animation variant A sketch 007 cards témoignages (idée user à préciser)
- Page privacy / mentions légales complète (phase 5 RGPD)
- Menu burger mobile dédié (si nav compressed insuffisante)
- Scroll-triggered apparition animations Framer Motion (discrétion exécution)
