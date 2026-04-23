---
phase: 02-refonte-audit-v2
verified: 2026-04-24T01:45:00Z
status: human_needed
score: 28/28 must-haves verified (code-level) — 7 UAT items still pending human review
overrides_applied: 1
overrides:
  - must_have: "components/audit/RapportPDF.tsx uses light clinique-claire palette (bg white, primary #064E3B, KPI pastels) instead of dark #111111 / gold #d4a843"
    reason: "User override during Plan 02-06 — PDF v1 dark conservée explicitement (cleanup-only mode). Refonte PDF light reportée hors phase 02."
    accepted_by: "mndiayepro97"
    accepted_at: "2026-04-24T01:40:00Z"
re_verification:
  previous_status: "(none — initial verification)"
  previous_score: null
  gaps_closed: []
  gaps_remaining: []
  regressions: []
human_verification:
  - test: "Visual parity vs sketches 005–009"
    expected: "Section 1 ≈ sketch 006 A ; Section 2 ≈ 007 A ; Section 3 ≈ 008 B ; Section 4 ≈ 009 C ; Section 5 ≈ 009 C"
    why_human: "Fidélité visuelle et palette — revue humaine requise, non vérifiable par grep"
  - test: "Scrollspy behavior"
    expected: "Le lien actif dans la sidebar change à mesure que chaque section entre au centre du viewport ; barre 3px + bg emerald-50 + aria-current=\"location\""
    why_human: "Comportement temps-réel au scroll (IntersectionObserver) — nécessite navigation manuelle"
  - test: "No horizontal overflow @ 375 / 768 / 1280"
    expected: "document.documentElement.scrollWidth === document.documentElement.clientWidth à chaque largeur"
    why_human: "Nécessite DevTools + rendu effectif du viewport"
  - test: "axe-core audit (blocking violations)"
    expected: "0 violation bloquante sur /audit état resultats"
    why_human: "Exécution axe-core dans un navigateur réel"
  - test: "ca_perdu verbatim — 4 surfaces"
    expected: "Avec stats.ca_perdu = 47 200 et nb_mois = 3 : Argent KPI + MoneyBuildCard breakdown total + PDF Argent KPI + PDF violet hero tous = 47 200 €"
    why_human: "Smoke test end-to-end avec données réelles (les surfaces code sont vérifiées statiquement mais le rendu runtime reste à confirmer)"
  - test: "Calendly env toggle"
    expected: "Sans NEXT_PUBLIC_CALENDLY_URL → placeholder vert sapin ; avec env → iframe Calendly"
    why_human: "Dépend des deux états d'environnement, test manuel"
  - test: "Legacy states untouched"
    expected: "États formulaire / loading / erreur visuellement identiques au pré-Phase-2"
    why_human: "Comparaison visuelle avec l'état antérieur, non automatisable"
---

# Phase 2 — refonte-audit-v2 : Rapport de vérification

**Phase goal :** Remplacer `app/audit/page.tsx` par un tableau de bord navigable (sidebar 240px + 5 sections scrollables avec scrollspy) en direction clinique-claire (bg-gray-50, primary #064E3B, KPI pastels). Règle critique : `ca_perdu` déjà annualisé, ne jamais remultiplier.

**Vérifié :** 2026-04-24 01:45 GMT+2
**Statut :** `human_needed` — 7 items UAT humains en attente (persistés dans `02-HUMAN-UAT.md`)
**Re-verification :** Non — vérification initiale

## Synthèse

Tous les must-haves vérifiables automatiquement passent (28/28, dont 1 override accepté pour le PDF). L'infrastructure du dashboard est en place : layout light scope, helper score pur, sidebar + scrollspy, 5 sections avec composants dédiés, legacy v1 supprimée, invariant `ca_perdu` verbatim respecté partout. Le verdict `human_needed` reflète les 7 items UAT persistés dans `02-HUMAN-UAT.md` par le plan 02-07 (auto-approuvé en mode `--auto` mais tests visuels/runtime restant à exécuter par l'humain).

## Observable Truths (par plan)

### Plan 02-01 — Scaffolding

| # | Truth | Statut | Preuve |
|---|---|---|---|
| 1 | `/audit` force light theme | VERIFIED | `app/audit/layout.tsx` wrap avec `bg-gray-50 text-slate-900`, pas de `"use client"` |
| 2 | Smooth scroll actif | VERIFIED | `app/globals.css` : `html { scroll-behavior: smooth }` + `@media (prefers-reduced-motion: reduce)` |
| 3 | `computeScore(taux)` pur, clampé [0,100] | VERIFIED | `lib/score.ts` : formule `100 - taux * 3.2`, `Math.max(0, Math.min(100, ...))`, guard NaN |
| 4 | Tokens KPI pastels + safelist | VERIFIED | `tailwind.config.ts` : kpiVolume/Signal/Taux/Argent + `primaryDark: "#064E3B"` + safelist regex |

### Plan 02-02 — Shell (sidebar + scrollspy)

| # | Truth | Statut | Preuve |
|---|---|---|---|
| 5 | `resultats` rend `AuditDashboard` | VERIFIED | `app/audit/page.tsx` : `import AuditDashboard from "@/components/audit/AuditDashboard"` + `<AuditDashboard stats={...} rapport={...} />` |
| 6 | Desktop ≥768px : sidebar 240px fixe | VERIFIED | `AuditSidebar.tsx` L25 : `hidden md:flex fixed left-0 top-0 h-screen w-[240px]` + logo + cabinet block + 5 liens |
| 7 | Mobile <768px : topbar sticky scrollable | VERIFIED | `AuditSidebar.tsx` L90 : `md:hidden sticky top-0 z-20` |
| 8 | Scrollspy met `aria-current="location"` | VERIFIED | `AuditSidebar.tsx` L58 : `aria-current={isActive ? "location" : undefined}` + `useScrollSpy.ts` IntersectionObserver `-40% 0px -40% 0px` |
| 9 | États formulaire/loading/erreur intacts | VERIFIED | `app/audit/page.tsx` state machine inchangée (seule la branche `resultats` monte `<AuditDashboard />`) |

### Plan 02-03 — Sections 1 & 2 (Synthèse + Manque à gagner)

| # | Truth | Statut | Preuve |
|---|---|---|---|
| 10 | 4 KPI pastels en grid | VERIFIED | `SyntheseKPIs.tsx` L63 : `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4` |
| 11 | Tokens pastels corrects | VERIFIED | `bg-kpiVolume / bg-kpiSignal / bg-kpiTaux / bg-kpiArgent` + `-fg` variants L29-58 |
| 12 | KPI Argent = `ca_perdu` verbatim | VERIFIED | `SyntheseKPIs.tsx` L53 : `target: stats.global.ca_perdu_an` (commentaire explicite L50) |
| 13 | Section 2 violet plein + hero 96px | VERIFIED | `MoneyBuildCard.tsx` L20 : `bg-[#6B21A8]` + L23 : `font-fraunces text-[72px] md:text-[96px]` |
| 14 | Breakdown `Total CA perdu annualisé` = `ca_perdu` verbatim | VERIFIED | `MoneyBuildCard.tsx` L72-74 : commentaire « VERBATIM — no * 12 » + `fmtEur(stats.global.ca_perdu_an)` |
| 15 | `#6B21A8` dans un seul fichier | VERIFIED | `grep -rn "#6B21A8"` → 1 hit (MoneyBuildCard.tsx L20) |

### Plan 02-04 — Section 3 (Charts)

| # | Truth | Statut | Preuve |
|---|---|---|---|
| 16 | Side-by-side ≥1024px, stacked <1024px | VERIFIED | `AuditDashboard.tsx` L57 : `grid grid-cols-1 lg:grid-cols-2 gap-5` |
| 17 | 7 bars Lun–Dim, DOM Tailwind only | VERIFIED | `ChartParJour.tsx` : `DAY_ORDER = ["Lun","Mar",…,"Dim"]`, pas d'import `chart.js` |
| 18 | 5 tranches horaires DOM Tailwind | VERIFIED | `ChartParHeure.tsx` : pas de `chart.js`, bars DOM |
| 19 | Pic highlight fg tokens | VERIFIED | `bg-[#059669]` pour pic jour, `bg-[#EA580C]` pour pic heure |
| 20 | Insight dynamique | VERIFIED | `ChartParJour` L77 (picIdx), `ChartParHeure` L101 (picSlot + picPct) |
| 21 | Empty state si `par_heure` absent | VERIFIED | `ChartParHeure.tsx` L33-43 : fallback sur `par_heure` undefined |

### Plan 02-05 — Sections 4 & 5 (Score + Plan/CTA)

| # | Truth | Statut | Preuve |
|---|---|---|---|
| 22 | Section 4 `bg-[#064E3B]` + ring SVG 220px | VERIFIED | `ScoreHero.tsx` L29 : `bg-[#064E3B]` + L38-40 : SVG 220×220 |
| 23 | Score = `computeScore(stats.taux_noshow)` | VERIFIED | `ScoreHero.tsx` L2 (import) + L15 : `const score = computeScore(tauxNoshow)` |
| 24 | Badge = `scoreBadge(score).label` | VERIFIED | `ScoreHero.tsx` L16 : `const badge = scoreBadge(score)` |
| 25 | Timeline tricolore 3 items Volume/Signal/Taux | VERIFIED | `PlanTimeline.tsx` : dotColors `#2563EB / #059669 / #EA580C`, meta Volume/Signal/Taux |
| 26 | CalendlyEmbed iframe + fallback placeholder | VERIFIED | `CalendlyEmbed.tsx` L10 : lit `NEXT_PUBLIC_CALENDLY_URL`, iframe si défini, placeholder `bg-[#064E3B]` sinon |

### Plan 02-06 — Cleanup + PDF

| # | Truth | Statut | Preuve |
|---|---|---|---|
| 27 | Legacy v1 supprimés | VERIFIED | `ls components/GaugeBenchmark.tsx components/GraphiqueParJour.tsx components/audit/ScoreGlobal.tsx` → No such file or directory (3/3) |
| 28 | `app/audit/page.tsx` n'importe plus les v1 | VERIFIED | `grep -nE "GaugeBenchmark\|GraphiqueParJour\|ScoreGlobal" app/audit/page.tsx` → aucun match |
| 29 | PDF palette light clinique-claire | **PASSED (override)** | Override utilisateur : PDF v1 dark conservée volontairement. Cleanup-only mode confirmé par 02-06-SUMMARY. |
| 30 | PDF importe `computeScore` | N/A (override) | RapportPDF v1 conservée — import non requis côté PDF tant que palette dark maintenue |
| 31 | PDF `Total CA perdu annualisé` = `ca_perdu_an` verbatim | VERIFIED | `RapportPDF.tsx` L482 : `stats.global.ca_perdu_an ?? 0` sans multiplication |

## Required Artifacts

| Artifact | Existe | Substantiel | Câblé | Statut |
|---|---|---|---|---|
| `app/audit/layout.tsx` | ✓ | ✓ (RSC, bg-gray-50) | ✓ (segment Next.js) | VERIFIED |
| `lib/score.ts` | ✓ | ✓ (2 exports + type) | ✓ (importé par ScoreHero) | VERIFIED |
| `app/globals.css` (scroll) | ✓ | ✓ (3 règles) | ✓ (chargé via root layout) | VERIFIED |
| `tailwind.config.ts` (tokens) | ✓ | ✓ (tous tokens + safelist) | ✓ | VERIFIED |
| `components/audit/AuditDashboard.tsx` | ✓ | ✓ (5 sections orchestrées) | ✓ (depuis page.tsx) | VERIFIED |
| `components/audit/AuditSidebar.tsx` | ✓ | ✓ (desktop + mobile topbar) | ✓ (consommé par Dashboard) | VERIFIED |
| `components/audit/AuditSection.tsx` | ✓ | ✓ (eyebrow + H2 Fraunces + lede) | ✓ | VERIFIED |
| `components/audit/useScrollSpy.ts` | ✓ | ✓ (IntersectionObserver rootMargin centré) | ✓ (importé par Sidebar) | VERIFIED |
| `components/audit/SyntheseKPIs.tsx` | ✓ | ✓ (4 KPI) | ✓ | VERIFIED |
| `components/audit/MoneyBuildCard.tsx` | ✓ | ✓ (violet hero + breakdown) | ✓ | VERIFIED |
| `components/audit/ChartParJour.tsx` | ✓ | ✓ | ✓ | VERIFIED |
| `components/audit/ChartParHeure.tsx` | ✓ | ✓ (+ empty state) | ✓ | VERIFIED |
| `components/audit/ScoreHero.tsx` | ✓ | ✓ (SVG 220 + import score) | ✓ | VERIFIED |
| `components/audit/PlanTimeline.tsx` | ✓ | ✓ (3 items tricolor) | ✓ | VERIFIED |
| `components/audit/CalendlyEmbed.tsx` | ✓ | ✓ (env toggle) | ✓ | VERIFIED |
| `components/audit/RapportPDF.tsx` | ✓ | ✓ (v1 dark, override) | ✓ (dynamic import dans page.tsx) | VERIFIED (override) |
| Legacy `components/GaugeBenchmark.tsx` | ✗ (attendu) | — | — | DELETED (attendu) |
| Legacy `components/GraphiqueParJour.tsx` | ✗ (attendu) | — | — | DELETED (attendu) |
| Legacy `components/audit/ScoreGlobal.tsx` | ✗ (attendu) | — | — | DELETED (attendu) |

## Key Link Verification

| From | To | Via | Statut |
|---|---|---|---|
| `app/audit/page.tsx` | `components/audit/AuditDashboard.tsx` | `etat === "resultats"` branch | WIRED |
| `components/audit/AuditSidebar.tsx` | `useScrollSpy.ts` | `import { useScrollSpy }` | WIRED |
| `components/audit/AuditDashboard.tsx` | `SyntheseKPIs + MoneyBuildCard + ChartParJour + ChartParHeure + ScoreHero + PlanTimeline + CalendlyEmbed` | default imports → 5 sections slots | WIRED |
| `components/audit/ScoreHero.tsx` | `lib/score.ts` | `import { computeScore, scoreBadge }` | WIRED |
| `components/audit/CalendlyEmbed.tsx` | `process.env.NEXT_PUBLIC_CALENDLY_URL` | env var + fallback | WIRED |

## Data-Flow Trace (Level 4)

| Artifact | Variable | Source | Données réelles | Statut |
|---|---|---|---|---|
| `SyntheseKPIs` | `stats.global.ca_perdu_an` + total_rdv + no_shows + taux | prop depuis `AuditDashboard` ← `page.tsx` ← API `/api/audit` ← n8n | ✓ | FLOWING |
| `MoneyBuildCard` | `stats.global.ca_perdu_an` | idem | ✓ | FLOWING |
| `ChartParJour` | `stats.par_jour ?? stats.stats_par_jour` | prop | ✓ (avec fallback) | FLOWING |
| `ChartParHeure` | `stats.par_heure` | prop | ✓ (avec empty state) | FLOWING |
| `ScoreHero` | `stats.taux_noshow` → `computeScore` | prop | ✓ | FLOWING |
| `AuditSidebar` | `stats.nom_cabinet / periode / global.total_rdv` | prop | ✓ | FLOWING |

## Behavioral Spot-Checks

| Comportement | Commande | Résultat | Statut |
|---|---|---|---|
| Type-check | `npx tsc --noEmit` | exit 0 | PASS |
| Build health (per 02-HUMAN-UAT Test 8) | `npm run build` | passed (noté dans HUMAN-UAT) | PASS |

## Requirements Coverage

| Requirement | Description | Source | Statut | Preuve |
|---|---|---|---|---|
| REQ-2 | Tableau de bord audit refondu (sidebar + 5 sections + scrollspy, DA clinique-claire, `ca_perdu` verbatim) — scope étendu par rapport à REQUIREMENTS.md L16 (`Diagnostic Google` originel), remplacé via SPEC.md Phase 2. | Tous les 7 plans | SATISFIED | 28 truths vérifiés + 7 UAT humains à dérouler |

Note : REQUIREMENTS.md L16 décrit REQ-2 comme « Diagnostic Google optionnel ». Le SPEC de phase 02 (`02-SPEC.md`) a redirigé REQ-2 vers la refonte dashboard clinique-claire. Le composant `components/audit/DiagnosticGoogle.tsx` existe (artefact résiduel de l'intention initiale) mais n'est pas câblé au dashboard — ce n'est pas un gap pour la phase 02 telle que re-scopée.

## Anti-Patterns Found

| Fichier | Motif | Sévérité | Impact |
|---|---|---|---|
| (aucun bloqueur) | — | — | — |

Scan effectué :
- Pas de `TODO|FIXME|XXX|HACK|PLACEHOLDER` bloquant dans les artefacts phase 02
- Pas de handlers vides (`onClick={() => {}}`) sur composants critiques
- Pas de `* 12` ou `(12 / nb_mois)` appliqué à `ca_perdu` (seul match : commentaire explicite de non-multiplication dans MoneyBuildCard.tsx L72)
- `#6B21A8` strictement unique dans `MoneyBuildCard.tsx`

## Deferred Items

| # | Item | Adressé dans | Preuve |
|---|---|---|---|
| 1 | Refonte PDF light clinique-claire | Hors phase 02 (override utilisateur) | 02-06 cleanup-only mode — PDF v1 dark conservée par décision explicite. À rouvrir ultérieurement si besoin. |

## Human Verification Required

Sept items UAT sont persistés dans `02-HUMAN-UAT.md` (mode `--auto` du plan 02-07) et attendent un test humain :

1. **Visual parity vs sketches 005–009** — Section 1 ≈ 006A, Section 2 ≈ 007A, Section 3 ≈ 008B, Sections 4/5 ≈ 009C.
2. **Scrollspy behavior** — barre 3px + bg emerald-50 + `aria-current="location"` suivent le centre du viewport.
3. **No horizontal overflow @ 375 / 768 / 1280** — `scrollWidth === clientWidth` aux trois largeurs.
4. **axe-core audit** — 0 violation bloquante sur `/audit` état `resultats`.
5. **`ca_perdu` verbatim — 4 surfaces** — smoke test runtime avec `ca_perdu = 47 200`, `nb_mois = 3` → les 2 surfaces dashboard doivent afficher `47 200 €` (surfaces PDF valables tant que l'invariant est respecté dans le PDF v1 dark, ce qui est confirmé côté code L482 de RapportPDF.tsx).
6. **Calendly env toggle** — placeholder vert sapin sans env, iframe avec env.
7. **Legacy states untouched** — formulaire/loading/erreur visuellement identiques au pré-Phase-2.

Build health (test 8) : déjà passed.

## Gaps Summary

Aucun gap bloquant. L'infrastructure, les 5 sections, la sidebar + scrollspy, les tokens, l'helper `computeScore` et l'invariant `ca_perdu` sont tous en place et cohérents. Le seul élément non-refondu (PDF light) fait l'objet d'un override utilisateur explicite documenté. Il reste 7 items UAT humains à exécuter via `/gsd-verify-work 2` ou test manuel pour clore officiellement la phase.

---

_Verified: 2026-04-24 01:45 GMT+2_
_Verifier: Claude (gsd-verifier)_
