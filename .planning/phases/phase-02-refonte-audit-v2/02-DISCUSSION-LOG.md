# Phase 2: Refonte Audit — dashboard clinique-claire v2 — Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-23
**Phase:** 02-refonte-audit-v2
**Mode:** `--auto` (Claude selected recommended defaults on all gray areas)
**Areas discussed:** Architecture rendu, Sidebar mobile, Scrollspy, Charts, Calendly, PDF refonte, Tokens

---

## Architecture — Rendu résultats

| Option | Description | Selected |
|--------|-------------|----------|
| Extract `AuditDashboard` component | Sépare le refondu dans un fichier client dédié, `page.tsx` garde le state machine | ✓ |
| Inline dans `page.tsx` | Refonte directement dans le JSX résultats existant | |
| Route segment dédié | Nouvelle route `/audit/results` avec redirect | |

**User's choice:** Extract `AuditDashboard` (auto-recommended)
**Notes:** Isolation du risque de régression sur les états form/loading/erreur.

---

## Sidebar mobile

| Option | Description | Selected |
|--------|-------------|----------|
| Top bar horizontale sticky scrollable | 5 liens pastillés inline + CTA réduit icône | ✓ |
| Hamburger menu drawer | Bouton en top, drawer latéral au tap | |
| Sidebar masquée (skip nav mobile) | Seul le contenu principal visible, scrollspy désactivé | |

**User's choice:** Top bar horizontale sticky (auto-recommended)
**Notes:** 5 liens courts tiennent dans une barre scrollable horizontale. Évite overhead modal, maintient scrollspy continu.

---

## Scrollspy

| Option | Description | Selected |
|--------|-------------|----------|
| `IntersectionObserver` rootMargin centré | `rootMargin: "-40% 0px -40% 0px"`, threshold `[0]` | ✓ |
| `IntersectionObserver` threshold 0.4 | Classic threshold | |
| Scroll listener + bounding rect | Manuel, moins performant | |

**User's choice:** rootMargin centré (auto-recommended)
**Notes:** Comportement prévisible sur sections de hauteurs variables.

---

## Charts (Par jour / Par heure)

| Option | Description | Selected |
|--------|-------------|----------|
| DOM bars Tailwind pures | Divs `h-[...]` + bg pastels/pleines, zéro JS chart lib | ✓ |
| Chart.js (existant) | Réutilise la lib déjà présente pour `GraphiqueParJour` | |
| Recharts | Lib React native, plus ergonomique | |

**User's choice:** DOM bars Tailwind (auto-recommended)
**Notes:** Sketch 008 B = bars simples, accessibles natif, responsive gratuit. Chart.js retiré en fin de phase.

---

## Calendly embed

| Option | Description | Selected |
|--------|-------------|----------|
| `NEXT_PUBLIC_CALENDLY_URL` env + iframe + placeholder fallback | Env publique Next.js, fallback vert sapin si absent | ✓ |
| Calendly Popup Widget (JS SDK) | Lib officielle, plus d'API | |
| Lien externe simple (bouton vers Calendly) | Pas d'embed, juste un CTA | |

**User's choice:** iframe + env publique (auto-recommended)
**Notes:** Iframe `loading="lazy"`, placeholder dev-friendly.

---

## PDF refonte

| Option | Description | Selected |
|--------|-------------|----------|
| Refonte complète parallèle | Palette light clinique-claire + Fraunces embedded + structure dashboard | ✓ |
| Swap tokens minimal | Garde structure v1, remplace juste couleurs | |
| Différer à phase séparée | PDF reste dark v1 jusqu'à post-v2 | |

**User's choice:** Refonte complète parallèle (auto-recommended)
**Notes:** SPEC.md le cite explicitement en scope. Fallback Helvetica si Fraunces embedding complexe.

---

## Tokens Tailwind

| Option | Description | Selected |
|--------|-------------|----------|
| Vérifier + ré-utiliser (Phase 1) | Tokens KPI déjà définis, safelist existe | ✓ |
| Redéfinir | Nouvelle passe de tokens | |

**User's choice:** Ré-utiliser (auto-recommended)

---

## Claude's Discretion

- SVG icons inline (pas de lib icons)
- Formatage FR avec NBSP
- Framer-motion optionnel avec `prefers-reduced-motion`

## Deferred Ideas

- Tendance 6 mois (dépend Phase 3)
- Diagnostic Google (Phase 4)
- PDF multi-template
- Comparatif multi-praticiens
- Dark toggle (explicitement banni)
