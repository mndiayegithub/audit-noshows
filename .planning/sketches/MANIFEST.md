# Sketch Manifest — Refonte site audit v2

## Design Direction

Rapport d'audit dentaire en mode **clinique & factuel**, inspiré des rapports
Apple Health / fiches médicales : blanc clinique, grands nombres avec autorité,
palette neutre avec accents médicaux (bleu `#0066CC`, rouge alerte `#FF3B30`).
Typographie SF Pro / Inter + touche serif pour les chiffres d'autorité.
L'action unique est la prise de RDV Calendly.

On s'éloigne volontairement de la direction dark/premium SaaS des landings
existantes (`landing.html`, `mockup.html`) pour positionner le rapport comme
un document médical sérieux plutôt qu'un dashboard produit.

## Reference Points

- Apple Health — "Health Summary", "Activity Rings", typographie SF Pro Display
- Rapports médicaux cliniques (sobres, data-first, typo serif pour l'autorité)
- Stripe/Linear pour la rigueur des cards et la générosité du whitespace

## Sketches

| # | Name | Design Question | Winner | Tags |
|---|------|-----------------|--------|------|
| 001 | layout-structure | Quelle structure globale pour la page de résultats ? | **C · Stepped reveal (6 steps + graph/section)** | layout, flow |
| 002 | hero-kpi | Comment faire émerger le "chiffre qui fait mal" ? | **D · Money build + reveal latéral du comparatif marché** | hero, kpi |
| 003 | conversion-moment | Comment afficher le score global (step 5) ? | **A · Activity ring + breakdown + sticky CTA** | score, ring |
| 004 | synthesis-cta | Comment traiter la synthèse finale + CTA Calendly (step 6) ? | **C · Split problème / solution + CTA** | cta, calendly, synthesis |

### Landing page (phase 1 · cabinets médicaux FR)

Direction distincte de l'audit : hero commercial dark premium, mais même KPI / typo serif pour les chiffres-clés — cohérence de marque via le **chiffre** et non via la palette. Un toggle dark/light est envisagé à l'implémentation (C = version light du même layout).

| # | Name | Design Question | Winner | Tags |
|---|------|-----------------|--------|------|
| 005 | hero-impact | Quel hero convertit le mieux sur la landing ? | **D · Split dark premium (message + preview rapport)** | landing, hero, dark |
| 006 | how-it-works | Comment expliquer le flow upload → IA → rapport ? | **A · 3 steps numérotés horizontaux (dark premium)** | landing, explainer |
| 007 | social-proof | Comment afficher crédibilité + témoignages ? | **B · Marquee logos + 4 stats (dark premium)** · A aussi viable avec animation à définir | landing, trust |
| 008 | faq-final-cta | Comment clôturer la landing (FAQ + CTA) ? | **C · FAQ minimal 4 Q + section finale full-bleed** | landing, faq, cta |
