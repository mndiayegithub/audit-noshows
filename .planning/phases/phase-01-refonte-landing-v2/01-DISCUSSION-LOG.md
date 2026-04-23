# Phase 01: Refonte Landing (clinique-claire v2) — Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in `01-CONTEXT.md` — this log preserves the alternatives considered.

**Date:** 2026-04-23
**Phase:** 01-refonte-landing-v2
**Areas discussed:** Animation Strategy (1 / 6 areas — user scoped discussion tight)

---

## Gray Areas Presented (user chose which to discuss)

1. **Stratégie d'animation** — Framer Motion vs CSS natif vs mix ✓ **DISCUSSED**
2. Découpage composants — inline `app/page.tsx` vs split `components/landing/*.tsx` — *Claude's discretion (default: split)*
3. FAQ accordion — `<details>` natif vs React controlled + Framer — *Claude's discretion (default: `<details>`)*
4. Source du copy — hardcodé inline vs `lib/landing-content.ts` — *Claude's discretion (default: hardcodé inline)*
5. Icônes — lucide-react vs SVG custom inline — *Claude's discretion (default: lucide-react)*
6. Cleanup legacy — 1 commit big bang vs 2 commits séparés — *Claude's discretion (default: big bang)*

---

## Area 1 — Stratégie d'animation

### Q1 · Choix lib

| Option | Description | Selected |
|--------|-------------|----------|
| a · Framer Motion | Déjà installée, API React, +~45 kB bundle | |
| b · CSS pur + reduce-motion | Zéro dep JS, meilleure perf Lighthouse | |
| c · Mix Framer (hero) + CSS (reste) | Framer pour orchestration complexe uniquement | ✓ |

**User's choice:** c — Mix Framer Motion pour hero orchestré + CSS pour le reste
**Notes:** motivation = minimiser surcoût JS sans sacrifier le polish du hero.

### Q2 · Portée des animations

| Option | Description | Selected |
|--------|-------------|----------|
| a · Hero only | Entrée orchestrée au mount, reste statique | |
| b · Hero + fade-up scroll sections | IntersectionObserver sur chaque section principale | ✓ |
| c · Tout animé | Hero + scroll + micro-animations hover cards | |

**User's choice:** b — Hero mount + fade-up scroll via IntersectionObserver sur chaque section
**Notes:** équilibre entre dynamisme visuel et contrôle perf.

### Q3 · Accessibilité reduce-motion

| Option | Description | Selected |
|--------|-------------|----------|
| a · Respect strict | `prefers-reduced-motion` désactive toutes les animations de mouvement | |
| b · Best effort | Désactive les plus lourdes, garde transitions fluides | ✓ |
| c · Ignore | Pas de support dans cette phase | |

**User's choice:** b — Best effort
**Notes:** approche pragmatique, pas de gate strict mais respect du signal utilisateur.

---

## Claude's Discretion (defaults retained, not discussed)

- **Découpage composants :** split `components/landing/*.tsx` (cohérent avec
  `components/audit/`, testable, orchestrateur fin dans `app/page.tsx`).
- **FAQ accordion :** `<details>` HTML natif (a11y gratuite, zéro JS, OK pour 4 Q).
- **Source du copy :** hardcodé inline (1 phase, évolution lente, centraliser
  plus tard au rebranding final).
- **Icônes :** `lucide-react` (tree-shakable, cohérent, coût marginal).
- **Cleanup legacy :** 1 commit big bang du rewrite qui inclut la suppression
  des tokens legacy dans `tailwind.config.ts`.

## Deferred Ideas

- Rebranding final (swap `GetLostRevenue` → nom définitif) — phase future.
- PDF report refonte clinique-claire — milestone v2.1.
- Agentation toolbar reintegration — après Phase 01 (stash@{0} préservé).
- Centralisation copy `lib/landing-content.ts` — au moment du rebranding.
- JSON-LD / metadata SEO structurée — backlog v2.1+.

---

*Discussion log written: 2026-04-23*
