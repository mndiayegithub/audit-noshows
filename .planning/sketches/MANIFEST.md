# Sketch Manifest — Clinique-claire v2 (DA pivot April 2026)

## Design Direction

Rapport d'audit financier en mode **clinique-claire**, inspiré des rapports
d'expertise comptable modernes (Clinivo × Stripe Dashboard × Linear light).
Fond blanc/gris-50, primary vert sapin `#064E3B`, typo Inter. Signature =
4 couleurs pastels sémantiques fixes pour les KPI (bleu Volume / émeraude
Signal / orange Taux / violet Argent). Objectif : sortir du SaaS tech, entrer
dans le registre du document d'expertise — sérieux, chiffré, lisible, moderne.

## Source of truth

- `new_design.md` — spec DA complète (palette, typo, formes, composants, copy)
- `new_design_audit.html` — maquette Google Stitch validée (landing complète)

## Reference Points

- Clinivo (Dribbble) — rapport clinique-clair avec KPI pastels
- Stripe Dashboard — bords fins gris clair, whitespace généreux
- Linear (light mode) — typographie Inter dense, rigueur des cards

## Sketches

### Phase 1 — Landing (`app/page.tsx`)

| # | Name | Design Question | Winner | Tags |
|---|------|----------------|--------|------|
| 001 | landing-hero-nav | Sticky nav + hero interrogatif + dashboard mockup 4 KPI pastels | **C** ★ (fallback B) | landing, hero, nav |
| 002 | landing-stats-target | Bandeau stats chiffrés + section "Pour qui" (cards icônes) | **B** ★ | landing, stats, audience |
| 003 | landing-how-value | "Comment ça marche" 3 étapes tricolores + "Ce que révèle" + score card | **C** ★ | landing, how-it-works, score |
| 004 | landing-testimonial-faq-cta | Témoignage + FAQ accordéon + bandeau CTA final primary-dark | **B** ★ | landing, faq, cta |

### Phase 2 — Audit dashboard (direction B : sidebar + sections scrollables)

**Architecture pivotée** : fini le flow séquentiel 5 steps, on passe à un **tableau de bord navigable** avec sidebar fixe et 5 sections toujours visibles en scroll continu.

| # | Name | Design Question | Winner | Tags |
|---|------|----------------|--------|------|
| 005 | audit-dashboard-layout | Architecture globale sidebar + sections scrollables | **B** ★ (fallback C) | audit, dashboard, layout |
| 006 | audit-synthese-kpi | Détail zone Synthèse (4 KPI pastels grand format + contexte) | **B** ★ (fallback C) | audit, dashboard, kpi |
| 007 | audit-money-build | Zone Manque à gagner — CA perdu violet plein + breakdown + reveal | **A** ★ | audit, dashboard, money |
| 008 | audit-charts | Zone Où & Quand — bars par jour + angles complémentaires | — | audit, dashboard, chart |
| 009 | audit-score-plan-cta | Zones Score + Plan d'action + CTA Calendly final | — | audit, dashboard, score, cta |

## Archived (v1 dark-premium)

See `_archive_v1-dark/` for the abandoned dark-premium direction (14 sketches).
</content>
</invoke>