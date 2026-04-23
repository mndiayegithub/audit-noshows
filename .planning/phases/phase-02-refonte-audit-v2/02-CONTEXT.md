# Phase 2: Refonte Audit — dashboard clinique-claire v2 — Context

**Gathered:** 2026-04-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Refonte du rendu **état "resultats"** de `app/audit/page.tsx` en dashboard clinique-claire v2 : sidebar 240 px fixe + 5 sections scrollables avec scrollspy (Synthèse / Manque à gagner / Où & Quand / Score / Plan+CTA). Les états `formulaire`, `loading`, `erreur`, l'API `/api/audit`, le contrat n8n, et les phases adjacentes (3 n8n, 4 Google, 5 RGPD, 6 tests) sont explicitement hors scope.

</domain>

<spec_lock>
## Requirements (locked via SPEC.md)

**8 requirements locked.** See `02-SPEC.md` for full requirements, boundaries, and acceptance criteria.

Downstream agents MUST read `02-SPEC.md` before planning or implementing. Requirements are not duplicated here.

**In scope (from SPEC.md):**
- Refonte rendu résultats de `app/audit/page.tsx`
- Nouveaux composants : `AuditSidebar`, `AuditSection`, `SyntheseKPIs`, `MoneyBuildCard`, `ChartParJour`, `ChartParHeure`, `ScoreHero`, `PlanTimeline`, `CalendlyEmbed`
- Scrollspy `IntersectionObserver`
- Intégration Calendly (iframe + placeholder fallback)
- Tokens Tailwind `kpi-*` (ajouter si absents)
- Responsive 375 / 768 / 1280 + A11y AA
- Refonte PDF `RapportPDF.tsx` en light thème

**Out of scope (from SPEC.md):**
- États formulaire/loading/erreur de `app/audit/page.tsx`
- API `app/api/audit/route.ts`
- Extension n8n `stats_par_mois[]` (Phase 3)
- Google Places API (Phase 4)
- RGPD renforcé (Phase 5)
- Suite de tests Vitest/Playwright (Phase 6)

</spec_lock>

<decisions>
## Implementation Decisions

### Architecture — Rendu `resultats`
- **D-01:** Extraire le rendu `"resultats"` dans un composant dédié `components/audit/AuditDashboard.tsx` (client component) consommé par `app/audit/page.tsx`. Garde `app/audit/page.tsx` focus sur le state machine (form/loading/erreur/resultats) et isole la refonte dans un seul fichier + ses sous-composants. *[auto: recommandé — sépare proprement la refonte du state machine existant, réduit risque de régression sur les états non-refondus.]*
- **D-02:** Créer `app/audit/layout.tsx` léger qui force `bg-gray-50 text-ink` (pas de dark inherited). Ajoute `scroll-behavior: smooth` sur `<html>` via globals.css si pas déjà présent. *[auto: recommandé — cohérent avec landing v2, force light local sans impacter root layout.]*

### Sidebar mobile
- **D-03:** Mobile (< 768 px) : top bar horizontale **sticky** scrollable avec les 5 liens pastillés + CTA "Prendre RDV" réduit en bouton icône à droite. Pas de hamburger (ajout UX friction inutile pour 5 liens courts). *[auto: recommandé — 5 liens = fits dans une top bar scrollable, évite modal/drawer overhead, meilleur pour scrollspy continu.]*
- **D-04:** Breakpoint sidebar → top bar : `md:` (768 px). En-dessous, top bar sticky `top-0`. Au-dessus, sidebar fixe 240 px.

### Scrollspy
- **D-05:** `IntersectionObserver` avec `rootMargin: "-40% 0px -40% 0px"` (active quand la section occupe le centre viewport). Threshold `[0]` sur ce rootMargin suffit. Hook custom `useScrollSpy(ids: string[]): string | null` dans `components/audit/useScrollSpy.ts`. *[auto: recommandé — rootMargin centré donne un comportement prévisible sur sections de hauteurs variables, plus robuste que threshold 0.4.]*
- **D-06:** `scroll-margin-top: 24px` sur chaque `<section>` pour compenser la top bar mobile sticky.

### Charts
- **D-07:** `ChartParJour` et `ChartParHeure` → **DOM bars Tailwind pures** (pas Chart.js). Les 2 charts sont simples (7 + 5 bars verticales, valeurs au-dessus, 1 bar pic highlightée). Chart.js overkill et lourd pour ce rendu. Garde Chart.js dans le bundle tant que `GraphiqueParJour` legacy n'est pas supprimé (supprimer en fin de Phase 2). *[auto: recommandé — cohérent avec sketch 008 B, zéro JS pour le rendu, accessible natif, responsive gratuit.]*
- **D-08:** `GaugeBenchmark` (doughnut Chart.js actuel) : **supprimé** — remplacé par `ScoreHero` (ring SVG primary-dark). Sketch 009 C adopté.
- **D-09:** `ScoreCard` (SVG 270° v1 dark) : **supprimé** — remplacé par `ScoreHero`.

### Calendly
- **D-10:** Source URL via `NEXT_PUBLIC_CALENDLY_URL` (env publique, pas de secret). Si absente, rendre placeholder card vert sapin avec icône calendrier + texte "Configuration Calendly en cours — contactez-nous". Iframe `<iframe src={url} width="100%" height="360" frameBorder="0">` avec `loading="lazy"`. *[auto: recommandé — env publique classique Next.js, dev-friendly sans config n8n.]*

### PDF refonte
- **D-11:** Refonte `components/audit/RapportPDF.tsx` en **parallèle** dans cette phase : palette light clinique-claire (bg white, texte ink, primary `#064E3B`, KPI pastels). Fraunces embedded via `@react-pdf/renderer` `Font.register`. Structure identique au dashboard (4 KPI + money build + charts simplifiés + score + plan). *[auto: recommandé — SPEC.md le cite explicitement en scope, cohérence visuelle document/écran.]*
- **D-12:** Si `Font.register(Fraunces)` pose problème (fichier .ttf non disponible facilement), fallback Helvetica/Times-Roman. Le visuel est secondaire pour ce sprint — priorité = palette light + structure cohérente.

### Tokens Tailwind
- **D-13:** Ajouter si absents dans `tailwind.config.ts` : `kpiVolume`, `kpiSignal`, `kpiTaux`, `kpiArgent` (`bg`, `fg`, `deep` variants) — déjà ajoutés en Phase 1 a priori, vérifier avant d'ajouter. Safelist pattern pour que les classes composées dynamiquement survivent.

### Claude's Discretion
- Choix exact des icônes (éclair, calendrier, chevrons) : Claude utilise SVG inline cohérents avec la landing (pas de lib icons).
- Formatage français des nombres : `toLocaleString('fr-FR')` avec `NBSP` avant `%` et `€`.
- Animations framer-motion : optionnelles, respecter `prefers-reduced-motion`.

### Folded Todos
[Aucun todo actif relatif à Phase 2 détecté.]

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Spec & design
- `.planning/phases/phase-02-refonte-audit-v2/02-SPEC.md` — Locked requirements (8 items), boundaries, acceptance criteria. MUST read before planning.
- `new_design.md` — DA clinique-claire v2 : palette, typo, composants signature, tokens KPI pastels. Source de vérité de plus haut niveau.
- `.claude/skills/sketch-findings-audit-system-audit-noshows/SKILL.md` — Layout dashboard + 5 sections + non-négociables + règle `ca_perdu`.

### Sketches validés
- `.planning/sketches/005-audit-sidebar-shell/` — Winner A (sidebar 240 px classic)
- `.planning/sketches/006-audit-synthese/` — Winner A (grille 4 KPI égales)
- `.planning/sketches/007-audit-money-build/` — Winner A (hero violet plein + breakdown)
- `.planning/sketches/008-audit-par-jour-heure/` — Winner B (dual charts côte à côte)
- `.planning/sketches/009-audit-score-plan-cta/` — Winner C (hero primary-dark + timeline + Calendly)

### Règle métier
- `CLAUDE.md` — Key Business Rule : `ca_perdu` déjà annualisé par n8n, jamais remultiplier

### Stack existant (lecture à faire par le planner)
- `app/audit/page.tsx` — State machine actuel (à préserver sauf branche résultats)
- `app/api/audit/route.ts` — Proxy n8n, normalisation 3 shapes (inchangé)
- `types/audit.ts` — Types partagés `AuditStats`, `AuditResponse`, `ParJourItem`
- `components/GaugeBenchmark.tsx` + `components/GraphiqueParJour.tsx` + `components/audit/ScoreGlobal.tsx` — À supprimer en fin de phase (remplacés par nouveaux composants)
- `components/audit/RapportPDF.tsx` — À refondre en light

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Tokens KPI pastels : déjà définis en Phase 1 dans `tailwind.config.ts` (`bg-kpiVolume`, `text-kpiVolume-fg`, etc.) — vérifier, ré-utiliser tels quels.
- Fonts Inter + Fraunces : déjà chargées via `next/font/google` dans `app/layout.tsx` (Phase 1).
- `components/ui/CountUpNumber.tsx` : créé Phase 1, réutilisable pour les KPI Synthèse (animer les 4 valeurs au scroll).
- `framer-motion` : déjà dans le bundle, patterns `useInView` + `useReducedMotion` établis en Phase 1.
- `app/globals.css` : ajouter `scroll-behavior: smooth` si pas déjà présent.

### Established Patterns
- Client components isolés avec `"use client"` au top, wrappers RSC quand possible (pattern Phase 1 `StatsBar` → `CountUpNumber`).
- Tokens Tailwind sémantiques avec safelist pour classes dynamiques.
- A11y AA : `aria-label`, `aria-current`, focus visible sur tous les interactifs.

### Integration Points
- `app/audit/page.tsx` : ajouter branchement `etat === "resultats" && <AuditDashboard stats={stats} rapport={rapport} />` à la place des blocs KPI + Score + charts + rapport actuels.
- `app/audit/layout.tsx` : nouveau fichier, force light.
- `tailwind.config.ts` : valider tokens KPI, ajouter scroll utilities si besoin.

</code_context>

<specifics>
## Specific Ideas

- Le violet plein `#6B21A8` apparaît uniquement dans `MoneyBuildCard` — toute autre occurrence du violet sur la page reste pastel (`kpiArgent`).
- Le primary-dark `#064E3B` apparaît en fond plein uniquement dans `ScoreHero` + dans la sidebar (item actif barre 3 px) + dans les CTA.
- Les insights dynamiques des charts ("Pic le jeudi — 12 no-shows, 21 % du total") sont calculés côté client depuis les stats n8n, pas pré-calculés côté back.
- Le calcul du score `100 - taux_noshow × 3.2` doit être extrait dans un helper pur `lib/score.ts` pour réutilisation PDF.

</specifics>

<deferred>
## Deferred Ideas

- **Tendance 6 mois (`stats_par_mois[]`)** — nécessite Phase 3 (extension n8n WF12). À ajouter à la section Synthèse ou créer Section 6 en itération post-Phase 3.
- **Diagnostic Google Places** — Phase 4 dédiée, section séparée à insérer dans le dashboard après completion Phase 4.
- **Export PDF multi-template** (praticien vs direction financière) — backlog post-v2.
- **Comparatif multi-praticiens (sidebar filter)** — backlog, nécessite agrégation côté n8n.
- **Dark toggle** — explicitement hors scope v2 (non-négociable du skill).

### Reviewed Todos (not folded)
[Aucun todo scanné n'a matché Phase 2.]

</deferred>

---

*Phase: 02-refonte-audit-v2*
*Context gathered: 2026-04-23*
