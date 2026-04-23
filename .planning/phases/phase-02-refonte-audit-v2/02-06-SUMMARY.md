---
phase: 02-refonte-audit-v2
plan: 06
subsystem: audit-dashboard
tags: [cleanup, legacy, v1-removal, pdf-button-wiring, wave-4, user-override]
wave: 4
requires:
  - 02-02 (shell dashboard — préparé la suppression des legacy imports)
  - 02-05 (AuditDashboard content-complete — prêt à recevoir le bouton PDF)
provides:
  - Suppression de 3 composants v1 (GaugeBenchmark / GraphiqueParJour / ScoreGlobal)
  - Câblage du bouton "Télécharger le rapport PDF" dans AuditDashboard Section 5
affects:
  - app/audit/page.tsx (imports nettoyés + handler PDF transmis au dashboard)
  - components/audit/AuditDashboard.tsx (props onDownloadPDF + isGeneratingPDF, bouton primary-dark dans Section 5)
tech-stack:
  added: []
  removed:
    - Inline `ScoreCard` composant dans page.tsx (270° SVG gauge — v1 dashboard archivé)
    - Imports react-markdown + remark-gfm + framer-motion dans page.tsx
    - Imports DiagnosticGoogle + CTACalendly (inutilisés dans le flow v2, rendu déplacé vers AuditDashboard)
    - Font.register côté page.tsx (fontFamilies v1 Plus Jakarta Sans + Inter + JetBrainsMono — RapportPDF les fournit désormais lui-même s'il en a besoin)
  patterns:
    - "Passage du handler PDF : page.tsx garde le lifecycle (useState isGeneratingPDF + dynamic import @react-pdf/renderer), AuditDashboard reçoit {onDownloadPDF, isGeneratingPDF} et rend le bouton dans Section 5"
    - "Bouton PDF primary-dark (#064E3B) aligné avec la palette clinique-claire du dashboard"
key-files:
  deleted:
    - components/GaugeBenchmark.tsx
    - components/GraphiqueParJour.tsx
    - components/audit/ScoreGlobal.tsx
  modified:
    - app/audit/page.tsx
    - components/audit/AuditDashboard.tsx
  preserved-verbatim:
    - components/audit/RapportPDF.tsx (USER OVERRIDE — aucune modification)
decisions:
  - "PDF refonte (Task 2 du plan) SKIPPED par override utilisateur explicite — RapportPDF.tsx reste en palette dark/gold v1. Documenté comme déviation volontaire."
  - "Bouton PDF vit dans AuditDashboard Section 5 (et non plus dans page.tsx sous le legacy layout) — aligné avec la nouvelle arborescence par sections scrollables."
  - "Suppression des 3 composants legacy confirmée safe : grep sur app/ components/ lib/ ne ramène aucune référence après nettoyage page.tsx."
metrics:
  duration_minutes: 4
  completed_date: 2026-04-24
  tasks_completed: 1
  tasks_skipped: 1
  files_deleted: 3
  files_modified: 2
  files_preserved: 1
---

# Phase 02 Plan 06 : Cleanup legacy v1 (PDF refonte override) Summary

**One-liner :** Suppression des 3 composants dashboard v1 (GaugeBenchmark + GraphiqueParJour + ScoreGlobal) et câblage du bouton PDF dans AuditDashboard Section 5 — RapportPDF.tsx conservé inchangé par override utilisateur.

## Objective atteint (partiellement — scope narrowed)

Le plan 02-06 original avait 2 tasks. **Task 1 (delete legacy + clean imports)** est livrée intégralement. **Task 2 (refonte RapportPDF en palette light clinique-claire)** a été **explicitement écartée par l'utilisateur** avant exécution : RapportPDF.tsx doit rester exactement comme il est (palette dark `#111111` / gold `#d4a843` v1, pas d'import `computeScore`, pas de refonte visuelle). L'argument utilisateur : le PDF sort du scope désiré pour cette itération — le dashboard web est la priorité, le PDF peut rester en v1 tant qu'il fonctionne.

Consequence documentée : le requirement REQ-2 (PDF refonte light) listé dans la frontmatter du plan n'est **pas** complété par ce plan. Il est reporté vers un plan ou milestone ultérieur (candidat backlog "PDF refonte clinique" déjà présent dans ROADMAP.md, ligne 190-191).

## Tasks exécutées

### Task 1 — Delete legacy v1 components + clean imports (commit ec5f8d6)

**3 fichiers legacy supprimés :**
- `components/GaugeBenchmark.tsx` — doughnut Chart.js avec aiguille animée (v1)
- `components/GraphiqueParJour.tsx` — bar chart Chart.js par jour de semaine (v1)
- `components/audit/ScoreGlobal.tsx` — score card standalone (v1)

**`app/audit/page.tsx` — nettoyage massif (192 → 18 lignes d'imports + logique supprimée) :**
- Supprimé imports : `GraphiqueParJour`, `GaugeBenchmark`, `DiagnosticGoogle`, `ScoreGlobal`, `CTACalendly`, `ReactMarkdown`, `remarkGfm`, `framer-motion`, icônes inutilisées (`CheckCircle`, `Search`), hooks inutilisés (`useRef`, `useEffect`)
- Supprimé le composant inline `ScoreCard` (170+ lignes, 270° SVG gauge)
- Supprimé les helpers `calcScore` + `getScoreConfig` (remplacés par lib/score en 02-01)
- Supprimé les variantes Framer Motion `fadeInUp` / `sectionVariants` (inutilisées post-refonte)
- Supprimé state `googleData` / `showGoogleSection` (DiagnosticGoogle hors scope v2)
- Supprimé les `Font.register` pour Plus Jakarta Sans / Inter / JetBrainsMono (RapportPDF gère ses fonts elle-même, pas besoin de pré-register côté page)
- `handleDownloadPDF` préservé + transmis à `AuditDashboard` via props

**`components/audit/AuditDashboard.tsx` — bouton PDF dans Section 5 :**
- Props ajoutées : `onDownloadPDF?: () => void` + `isGeneratingPDF?: boolean`
- Bouton primary-dark `bg-[#064E3B]` rendu dans le container space-y-6 de Section 5 (entre CalendlyEmbed et le `<details rapport>`)
- Disabled state pendant génération (`disabled:opacity-60 disabled:cursor-wait`)
- Label dynamique : "Télécharger le rapport PDF" | "Génération du PDF…"

**Verification :**
- `grep -rn -E "GaugeBenchmark|GraphiqueParJour|ScoreGlobal" app components lib` → 0 résultats
- `npx tsc --noEmit` → exit 0
- `npm run build` → exit 0 (/audit = 27.4 kB, First Load JS 153 kB — vs 26.9 kB post-02-05, delta +0.5 kB = bouton PDF trivial)

### Task 2 — RapportPDF refonte light clinique-claire (SKIPPED)

**Status : user-override, non exécutée.**

Scope original du plan :
- Migrer palette dark `#111111` / gold `#d4a843` → light `#FFFFFF` + primary-dark `#064E3B` + 4 KPI pastels
- Importer `computeScore` + `scoreBadge` depuis `@/lib/score` (éliminer formule dupliquée)
- Restructurer le document PDF en 5 sections alignées sur le dashboard

**Vérification que l'override est respectée :**
- `git diff HEAD~1 HEAD -- components/audit/RapportPDF.tsx | wc -l` → **0 ligne**
- Aucun commit de ce plan ne touche à `components/audit/RapportPDF.tsx`
- La palette dark/gold v1 reste active pour le PDF téléchargé

## Deviations from Plan

### User-Requested Overrides

**1. [User Override - Scope narrowing] Task 2 RapportPDF refonte SKIPPED**
- **Raison :** L'utilisateur a explicitement demandé de ne PAS toucher `components/audit/RapportPDF.tsx`. Le PDF garde sa palette v1 (dark/gold).
- **Impact :** REQ-2 (PDF refonte light) non complété par ce plan. Le `must_haves` de la frontmatter lié à RapportPDF (palette light, import computeScore, ca_perdu verbatim) n'est PAS appliqué à RapportPDF.tsx.
- **Mitigation :** L'invariant `ca_perdu` non-multiplié est déjà appliqué dans le dashboard web (SyntheseKPIs + MoneyBuildCard via 02-03). Le PDF, s'il contenait déjà un bug `ca_perdu * nb_mois`, n'a été NI introduit NI corrigé par ce plan — statu quo.
- **Follow-up recommandé :** Ouvrir un plan dédié "PDF refonte clinique" (déjà en backlog ROADMAP.md ligne 190-191) quand la priorité remonte.
- **Files preserved verbatim :** components/audit/RapportPDF.tsx

### Auto-fixed Issues

**1. [Rule 3 - Plan-required import cleanup] Retrait Font.register côté page.tsx**
- **Found during:** Task 1 Step B (retrait des imports legacy)
- **Issue:** Le plan demande de retirer `@react-pdf/renderer` si plus utilisé dans page.tsx, mais ici on GARDE l'appel `pdf()` (lazy import) pour le bouton PDF. En revanche, les 3 `Font.register(...)` (Plus Jakarta Sans / Inter / JetBrainsMono) côté page.tsx étaient redondants : RapportPDF.tsx enregistre ses propres fonts, et la plupart des woff référencés n'existent même pas en `public/fonts/`.
- **Fix:** Supprimé les 3 blocs Font.register + l'import nommé `Font` depuis `@react-pdf/renderer`. Garde uniquement `pdf` pour le rendering.
- **Files modified:** app/audit/page.tsx
- **Commit:** ec5f8d6

**2. [Rule 2 - Missing functionality] Bouton PDF câblé dans AuditDashboard au lieu d'un orphelin**
- **Found during:** Task 1 Step B
- **Issue:** Dans l'architecture v2, le flow `etat === "resultats"` rend `<AuditDashboard />` avec sidebar + 5 sections. Le bouton PDF qui vivait jadis dans page.tsx ne peut plus s'afficher sous `<AuditDashboard>` (hors sidebar). Sans wire, le feature "télécharger PDF" serait silencieusement cassé.
- **Fix:** Ajout de props `onDownloadPDF` + `isGeneratingPDF` dans `AuditDashboardProps`, bouton rendu dans Section 5 (plan-et-cta) entre CalendlyEmbed et `<details rapport>`. Style primary-dark aligné avec palette dashboard.
- **Files modified:** components/audit/AuditDashboard.tsx, app/audit/page.tsx
- **Commit:** ec5f8d6

## Acceptance Criteria

### Original plan criteria

- [x] `! test -f components/GaugeBenchmark.tsx`
- [x] `! test -f components/GraphiqueParJour.tsx`
- [x] `! test -f components/audit/ScoreGlobal.tsx`
- [x] `! grep -qE "GaugeBenchmark|GraphiqueParJour|ScoreGlobal" app/audit/page.tsx`
- [x] No remaining imports across codebase (`app components lib`) — 0 résultats grep
- [x] `npx tsc --noEmit` exits 0
- [x] `npm run build` exits 0
- [ ] ~~`grep -q "#FFFFFF" components/audit/RapportPDF.tsx`~~ — **SKIPPED** (user override)
- [ ] ~~`grep -q "#064E3B" components/audit/RapportPDF.tsx`~~ — **SKIPPED** (user override)
- [ ] ~~`! grep -q "#d4a843" components/audit/RapportPDF.tsx`~~ — **SKIPPED** (user override, gold reste volontairement)
- [ ] ~~`grep -qE "from ['\"]@/lib/score['\"]" components/audit/RapportPDF.tsx`~~ — **SKIPPED** (user override)

### Additional criteria (plan context)

- [x] RapportPDF.tsx identique à HEAD~1 (`git diff HEAD~1 HEAD -- components/audit/RapportPDF.tsx` = 0 ligne)
- [x] Bouton PDF fonctionnel dans AuditDashboard Section 5 (visible quand `onDownloadPDF` transmis)
- [x] Import `{ resultats }` dans `createElement(RapportPDF, { resultats })` reste compatible avec la signature existante `({ resultats }: { resultats: AuditResponse })` de RapportPDF.tsx

## Verification manuelle (smoke)

- `npm run dev` → `/audit` → upload CSV → dashboard s'affiche avec les 5 sections
- Section 5 affiche désormais `PlanTimeline` + `CalendlyEmbed` + **bouton primary-dark "Télécharger le rapport PDF"** + `<details rapport>`
- Clic sur le bouton → `isGeneratingPDF = true` → label change en "Génération du PDF…" → PDF téléchargé (palette dark/gold v1 — volontaire)
- Aucune erreur console liée à un import manquant

## Self-Check: PASSED

- FOUND deletion: components/GaugeBenchmark.tsx (supprimé)
- FOUND deletion: components/GraphiqueParJour.tsx (supprimé)
- FOUND deletion: components/audit/ScoreGlobal.tsx (supprimé)
- FOUND modified: app/audit/page.tsx (192 lignes retirées, handler PDF transmis)
- FOUND modified: components/audit/AuditDashboard.tsx (+17 lignes, bouton PDF)
- PRESERVED verbatim: components/audit/RapportPDF.tsx (diff HEAD~1 = 0)
- FOUND commit: ec5f8d6 (Task 1 — delete legacy + wire PDF button)
- SKIPPED (documented): Task 2 — RapportPDF refonte (user override)
- BUILD: npm run build exits 0 (/audit = 27.4 kB)
