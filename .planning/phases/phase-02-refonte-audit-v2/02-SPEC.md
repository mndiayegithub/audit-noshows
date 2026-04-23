# Phase 2: Refonte Audit — dashboard clinique-claire v2 — Specification

**Created:** 2026-04-23
**Ambiguity score:** 0.11
**Requirements:** 8 locked

## Goal

Remplacer `app/audit/page.tsx` (flow séquentiel stepped-reveal v1 dark-premium) par un **tableau de bord navigable clinique-claire v2** : sidebar fixe 240 px à gauche + 5 sections scrollables avec scrollspy (Synthèse, Manque à gagner, Où & Quand, Score, Plan + CTA Calendly), en respectant la palette `new_design.md` et le skill `sketch-findings-audit-system-audit-noshows`.

## Background

- `app/audit/page.tsx` (actuellement 430 lignes) gère la totalité du flow audit : upload CSV → POST `/api/audit` → affichage des résultats. Le rendu des résultats mélange état `formulaire` / `loading` / `resultats` / `erreur` et empile **stepped reveal dark** : KPI cards → `ScoreCard` gauge SVG 270° → `GaugeBenchmark` doughnut → `GraphiqueParJour` bars → rapport Markdown → bouton PDF. Direction v1 archivée sous `_archive_v1-dark/`.
- Les sketches 005–009 (winners A/A/A/B/C) sont validés et documentés dans le skill `sketch-findings-audit-system-audit-noshows`. Le skill précise le layout sidebar 240 px, les 5 sections, la palette KPI pastels figée, et les règles d'accessibilité.
- La règle métier critique est préservée : `ca_perdu` est déjà annualisé par n8n, jamais remultiplier côté frontend.
- L'API `app/api/audit/route.ts` reste inchangée (elle continue de proxy n8n et de normaliser les 3 shapes de réponse). Seul le rendu des résultats est refondu.
- L'endpoint n8n renverra `stats_par_mois[]` après la Phase 3 ; cette phase ne consomme pas ce champ (éviter tout angle "tendance 6 mois" absent).

## Requirements

1. **Layout dashboard sidebar + main**: la page `/audit`, une fois les résultats reçus, rend une sidebar fixe 240 px à gauche (logo + bloc infos cabinet + nav 5 liens pastillés + CTA bas "Prendre RDV") et une zone main avec 5 sections scrollables.
   - Current: `app/audit/page.tsx` rend un empilement vertical mono-colonne sans sidebar, sans scrollspy.
   - Target: `app/audit/page.tsx` (ou sous-layout `app/audit/layout.tsx`) compose `AuditSidebar` (240 px, `position: sticky; top: 0; height: 100vh`) + main content. Le layout n'est rendu que dans l'état `resultats` (les états `formulaire`, `loading`, `erreur` gardent leur rendu actuel).
   - Acceptance: en état `resultats`, `document.querySelector('[data-audit-sidebar]')` retourne un élément de largeur 240 px avec `position: sticky`, et contient exactement 5 liens de section.

2. **Scrollspy sidebar → sections**: la sidebar met à jour l'item actif selon la section visible dans le viewport.
   - Current: pas de scrollspy.
   - Target: `IntersectionObserver` avec threshold 0.4 sur chaque `<section id>` met à jour l'item actif (barre verticale 3 px `bg-[#064E3B]` + fond `bg-emerald-50` + `aria-current="location"`).
   - Acceptance: scroller dans la page main met à jour la classe `active` du lien correspondant à la section visible (vérifiable via test Playwright ou inspection manuelle : scroller jusqu'à `#score` active uniquement le lien "Score cabinet").

3. **Section 1 — Synthèse (4 KPI pastels grille égale)**: grille 4 colonnes, chaque KPI dans sa pastel sémantique figée.
   - Current: les 4 KPI sont actuellement empilés et utilisent les tokens dark v1.
   - Target: `SyntheseKPIs` rend `grid-cols-4 gap-4`, chaque card `rounded-2xl`, chip uppercase ("Volume"/"Signal"/"Taux"/"Argent"), valeur Fraunces 40 px dans la couleur `fg` pastel, sous-label Inter 13 px muted. Données : `stats.rdv_total`, `stats.no_shows`, `stats.taux_noshow`, `stats.ca_perdu`.
   - Acceptance: la card "Argent" affiche la valeur `stats.ca_perdu` formatée en € sans multiplication (test : mock n8n avec `ca_perdu: 47200` → DOM affiche "47 200 €" exactement).

4. **Section 2 — Manque à gagner (hero violet plein + breakdown)**: card `bg-[#6B21A8]` pleine largeur, radius 28 px, 2 cols (valeur hero 96 px à gauche, breakdown glass blanc à droite).
   - Current: aucun hero violet — la valeur CA perdu est affichée en card KPI seule.
   - Target: `MoneyBuildCard` rend eyebrow blanc "CA perdu / an — extrapolé", valeur Fraunces 96 px, sous-phrase narrative, et breakdown glass (`bg-white/10 border-white/20 rounded-2xl`) avec les lignes de calcul pédagogique (no-shows détectés, CA moyen par RDV, perte période, extrapolation 12 mois, total annualisé).
   - Acceptance: la ligne "Total CA perdu annualisé" du breakdown affiche exactement `stats.ca_perdu` (pas `stats.ca_perdu * 12`, pas `stats.ca_perdu * (12/nb_mois)`).

5. **Section 3 — Où & Quand (dual charts côte à côte)**: grille 2 cols desktop, bars par jour (émeraude Signal) à gauche, bars par tranche horaire (orange Taux) à droite.
   - Current: `GraphiqueParJour` (Chart.js bars) existe ; pas de chart par tranche horaire.
   - Target: `ChartParJour` (7 bars Lun→Dim, bar standard `#DCF4E6`, bar pic `#059669`, valeur Fraunces 14 px au-dessus, insight "Pic le {jour} — {N} no-shows, {pct} % du total") + `ChartParHeure` (5 bars 8–10 / 10–12 / 14–16 / 16–18 / 18–20 ; bar standard `#FCEACC`, bar pic `#EA580C`, insight "Créneau critique {tranche} — {pct} % des no-shows"). Chart.js ou DOM bars Tailwind.
   - Acceptance: les 2 charts sont visibles côte à côte ≥ 1024 px, stackent en colonne < 1024 px, les insights dynamiques sont calculés depuis `stats.par_jour` (ou `stats.stats_par_jour`) et `stats.par_heure` si présent — sinon le chart par heure affiche un état vide "Données horaires non disponibles".

6. **Section 4 — Score cabinet (hero primary-dark + ring blanc)**: card `bg-[#064E3B]` pleine largeur, radius 28 px, ring SVG 220 px blanc + chiffre Fraunces 64 px blanc + badge conditionnel.
   - Current: `ScoreCard` SVG 270° existe (gauge dark v1 or/jaune).
   - Target: `ScoreHero` rend ring SVG track `rgba(255,255,255,0.14)` + progress stroke blanc, chiffre score Fraunces 64 px au centre + "sur 100" `#a7f3d0`, badge pill conditionnel ("Bon · au-dessus du secteur" si ≥ 70, "À améliorer" si 50–69, "Critique" si < 50). Formule `100 - taux_noshow × 3.2`, clamp [0, 100].
   - Acceptance: pour `taux_noshow = 8` → score affiché = `74`, badge "Bon"; pour `taux_noshow = 20` → score = `36`, badge "Critique".

7. **Section 5 — Plan d'action timeline + CTA Calendly inline**: 2 cards blanches, timeline verticale tricolore à gauche + narratif à droite, puis card CTA Calendly pleine largeur avec iframe embed.
   - Current: aucun plan d'action structuré, pas d'intégration Calendly.
   - Target: `PlanTimeline` rend 3 items tricolores (point bleu Volume "Rappels SMS J-2" / point émeraude Signal "Caution créneaux sensibles" / point orange Taux "Liste d'attente temps réel"), connecteur vertical fin gris, col droite narratif Fraunces. `CalendlyEmbed` rend iframe (URL depuis env `NEXT_PUBLIC_CALENDLY_URL` ou placeholder vert sapin avec icône calendrier si env absente) hauteur 360 px, header "30 minutes pour activer votre plan.", footer "Durée 30 min · visio Google Meet · sans engagement".
   - Acceptance: la timeline rend exactement 3 items avec les 3 couleurs pastels sémantiques, et le CTA Calendly affiche soit l'iframe (si env configuré) soit le placeholder (si env absent) — jamais un écran vide.

8. **Accessibilité & responsive**: le dashboard est AA minimum, mobile-first, sans overflow-x.
   - Current: la page v1 est AA partiel (contraste dark faible sur certains textes), pas de `aria-current` sidebar.
   - Target: sidebar `<nav aria-label="Sections du rapport">`, lien actif `aria-current="location"`, focus visible sur tous les liens/CTA, contraste AA minimum (texte `fg` deep sur pastel `bg`). Mobile (< 768 px) : sidebar collapse en top bar horizontale scrollable OU menu hamburger (à arbitrer en discuss-phase). Aucun overflow-x à 375 / 768 / 1280 px.
   - Acceptance: audit axe-core 0 violation bloquante sur `/audit` en état résultats, et aucun overflow-x détecté à 375 / 768 / 1280 px.

## Boundaries

**In scope:**
- Refonte du rendu **résultats** de `app/audit/page.tsx` (état `"resultats"`) en dashboard clinique-claire v2
- Nouveaux composants : `AuditSidebar`, `AuditSection`, `SyntheseKPIs`, `MoneyBuildCard`, `ChartParJour`, `ChartParHeure`, `ScoreHero`, `PlanTimeline`, `CalendlyEmbed`
- Scrollspy via `IntersectionObserver`
- Intégration Calendly embed (iframe + placeholder fallback)
- Tokens Tailwind `kpi-volume/signal/taux/argent` ajoutés à `tailwind.config.ts` si pas déjà présents depuis la landing
- Responsive 375 / 768 / 1280 px + A11y AA
- Refonte PDF (`components/audit/RapportPDF.tsx`) en light thème clinique-claire (même palette, Fraunces embedded)

**Out of scope:**
- États `formulaire`, `loading`, `erreur` de `app/audit/page.tsx` — restent tels quels (refonte visuelle non demandée, seuls les résultats sont repensés)
- API `app/api/audit/route.ts` — aucun changement (la phase consomme le contrat n8n existant)
- Extension n8n pour `stats_par_mois[]` — c'est la Phase 3 ; aucun angle "tendance 6 mois" ajouté ici
- Intégration Google Places API — c'est la Phase 4
- Conformité RGPD renforcée (bannière, consentement, purge) — c'est la Phase 5
- Tests Vitest / Playwright — c'est la Phase 6 (on produit du code testable, mais la suite de tests est hors scope)
- Refonte de la landing — terminée en Phase 1
- Analytics / monitoring — c'est la Phase 8

## Constraints

- **Règle métier critique** : `ca_perdu` / `ca_perdu_an` est déjà annualisé par n8n. Jamais multiplier par 12, ni par `(12 / nb_mois)`. Afficher la valeur renvoyée telle quelle dans les 4 KPI, le breakdown, le PDF.
- **Palette figée** : `new_design.md` + `sketch-findings-audit-system-audit-noshows` sont les sources de vérité. Aucune nouvelle couleur introduite. Le violet plein `#6B21A8` apparaît uniquement dans `MoneyBuildCard`.
- **Typographie** : Inter (UI) + Fraunces (valeurs KPI, titres, score) via `next/font/google`, même config que la landing.
- **Stack** : Next.js 14 App Router, TypeScript strict, Tailwind CSS v3, Chart.js (déjà utilisé), `@react-pdf/renderer` (déjà utilisé). Pas d'ajout de lib charting supplémentaire.
- **Chart.js conservé** pour les charts par jour / heure (cohérent avec le stack existant) ; `GaugeBenchmark` doughnut v1 peut être supprimé (remplacé par `ScoreHero` ring SVG primary-dark, plus aligné avec sketch 009 C).
- **Pas de dark toggle** sur `/audit` (clinique-claire light uniquement ; le primary-dark et le violet plein restent des zones immersives ponctuelles, pas un theme).
- **`app/audit/layout.tsx`** doit forcer light (classe `bg-gray-50 text-ink` sur le `<body>` ou wrapper, override tout dark inherited).

## Acceptance Criteria

- [ ] `AuditSidebar` rendu fixe 240 px en état `resultats`, 5 liens pastillés + CTA bas
- [ ] Scrollspy met à jour `aria-current="location"` sur le lien actif avec threshold 0.4
- [ ] `SyntheseKPIs` rend 4 KPI pastels grille `grid-cols-4`, valeurs Fraunces 40 px, couleurs `fg` sémantiques
- [ ] `MoneyBuildCard` rend valeur hero Fraunces 96 px + breakdown glass avec "Total CA perdu annualisé" = `stats.ca_perdu` (zéro remultiplication)
- [ ] `ChartParJour` + `ChartParHeure` rendus côte à côte ≥ 1024 px, stackés < 1024 px, insights calculés dynamiquement
- [ ] `ScoreHero` rend ring SVG blanc sur fond `#064E3B`, score formulé `100 - taux × 3.2` clamp [0,100], badge conditionnel correct (≥70 / 50–69 / <50)
- [ ] `PlanTimeline` rend 3 items tricolores (Volume bleu / Signal émeraude / Taux orange) avec connecteur vertical
- [ ] `CalendlyEmbed` rend iframe si `NEXT_PUBLIC_CALENDLY_URL` défini, sinon placeholder vert sapin
- [ ] Audit axe-core sur `/audit` état résultats : 0 violation bloquante
- [ ] Aucun overflow-x détecté à 375 / 768 / 1280 px en état résultats
- [ ] `app/audit/layout.tsx` force light (pas de `dark:` actif)
- [ ] États `formulaire`, `loading`, `erreur` de `app/audit/page.tsx` inchangés
- [ ] `app/api/audit/route.ts` inchangé

## Ambiguity Report

| Dimension          | Score | Min  | Status | Notes                                                                 |
|--------------------|-------|------|--------|----------------------------------------------------------------------|
| Goal Clarity       | 0.94  | 0.75 | ✓      | Layout + 5 sections explicitement spécifiés par sketch skill         |
| Boundary Clarity   | 0.92  | 0.70 | ✓      | In/out scope alignés avec roadmap (Phase 3/4/5/6 bien séparées)      |
| Constraint Clarity | 0.85  | 0.65 | ✓      | Règle `ca_perdu`, palette figée, stack existant                      |
| Acceptance Criteria| 0.82  | 0.70 | ✓      | 12 critères pass/fail vérifiables                                    |
| **Ambiguity**      | 0.11  | ≤0.20| ✓      | Gate passé — SPEC écrit directement depuis skill + roadmap           |

## Interview Log

| Round | Perspective     | Question summary                          | Decision locked                                                            |
|-------|-----------------|-------------------------------------------|----------------------------------------------------------------------------|
| —     | auto-selected   | Design system déjà figé ?                 | Oui — `sketch-findings-audit-system-audit-noshows` verrouille layout + palette |
| —     | auto-selected   | Scope minimum ?                           | Rendu `"resultats"` uniquement ; états form/loading/erreur inchangés       |
| —     | auto-selected   | Boundary phases adjacentes ?              | Phase 3 n8n / Phase 4 Google / Phase 5 RGPD / Phase 6 tests explicitement hors scope |
| —     | auto-selected   | Mobile sidebar collapse ?                 | À arbitrer en discuss-phase (flag CONTEXT.md) — top bar OU hamburger       |
| —     | auto-selected   | Calendly env configurable ?               | `NEXT_PUBLIC_CALENDLY_URL` ; fallback placeholder vert sapin               |
| —     | auto-selected   | Règle métier `ca_perdu` ?                 | Jamais remultiplier — acceptance test explicite                            |

[--auto mode: all decisions selected by Claude from the sketch skill + roadmap + CLAUDE.md ; no interactive interview ran.]

---

*Phase: 02-refonte-audit-v2*
*Spec created: 2026-04-23*
*Next step: /gsd-discuss-phase 2 — implementation decisions (scrollspy exact threshold, sidebar mobile collapse strategy, Chart.js vs DOM bars, PDF refonte scope)*
