---
phase: 07-robustesse-upload-csv
plan: 05
subsystem: audit-upload-flow
tags: [wiring, ui-state-machine, csv-preview, degraded-mode, error-handling]
requires:
  - components/audit/CSVPreview.tsx (Plan 07-03)
  - components/audit/DegradedConfirmDialog.tsx (Plan 07-04)
  - components/audit/CSVErrorCard.tsx (Plan 07-06)
  - lib/audit-thresholds.ts (Plan 07-01)
  - types/audit-errors.ts (Plan 07-01)
  - types/audit.ts (extended Plan 07-02)
provides:
  - app/audit/page.tsx end-to-end CSV upload flow (formulaire → preview → loading → resultats | erreur)
  - CSVPreviewSnapshot type + onReady callback on <CSVPreview>
affects:
  - Tous les flows e2e Phase 7 (Plan 07-08 Playwright spec)
tech-stack:
  added: []
  patterns:
    - "useState-machine UI flow with 5 states"
    - "Lifted preview snapshot via onReady callback"
    - "Error routing: structuredError state replaces dropzone OR preview"
key-files:
  created: []
  modified:
    - app/audit/page.tsx
    - components/audit/CSVPreview.tsx
decisions:
  - "Bouton 'Generer audit flash' sur formulaire passe maintenant a etat='preview' (pas POST direct) — la dropzone reste un raccourci."
  - "<DegradedConfirmDialog> est toujours monte (controle par open prop), pour eviter unmount/remount sur ouverture."
  - "<CSVErrorCard> rendu dans deux branches : formulaire (parse client) et erreur (API 4xx) — un seul state structuredError les distingue par contexte."
  - "Ajout onReady prop optionnelle a <CSVPreview> (autorise par le plan : edition mineure permise)."
  - "Champ degraded_confirmed est ajoute au FormData en cas de confirmation utilisateur — n8n peut s'en servir si besoin."
metrics:
  duration: ~10min
  completed: 2026-04-26
requirements: [REQ-7-1, REQ-7-2, REQ-7-3, REQ-7-4]
---

# Phase 7 Plan 05: Wiring app/audit/page.tsx — Summary

**One-liner:** End-to-end CSV upload flow câblé dans app/audit/page.tsx — dropzone → preview (CSVPreview) → (DegradedConfirmDialog si degraded) → POST → résultats avec bannière "Audit partiel" conditionnelle ; les erreurs parse client + API 4xx basculent sur CSVErrorCard.

## Tasks Completed

### Task 1: Étendre la machine d'état + intégrer CSVPreview/Dialog/ErrorCard
- **Commit:** 914ac0d
- **Files:** `app/audit/page.tsx`, `components/audit/CSVPreview.tsx`
- État `Etat` étendu avec `"preview"` (5 états au total).
- Nouveaux states : `structuredError`, `degradedDialogOpen`, `previewSnapshot`.
- `onDrop` bascule désormais en `"preview"` après sélection.
- `<CSVPreview>` reçoit `onContinue / onCancel / onError / onReady`.
- `<DegradedConfirmDialog>` toujours monté, contrôlé par `degradedDialogOpen`, alimenté par `previewSnapshot`.
- `<CSVErrorCard>` rendu en deux endroits : sous formulaire (parse client) et plein écran en `etat==="erreur"` (API 4xx).
- `handleSubmit(degradedConfirmed: boolean)` propage flag dégradé via FormData (`degraded_confirmed=true`).
- Bannière `<div className="amber-50 ...">Audit partiel : X lignes ignorées (Y % reconnues)</div>` rendue avant `<AuditDashboard>` si `resultats.degraded === true`.
- `handleResetUpload` nettoie file, structuredError, previewSnapshot, dialog.

### Évolution mineure — `<CSVPreview>` (autorisée par le plan)
- Ajout interface exportée `CSVPreviewSnapshot { recoRate, ignoredCount, totalRows, degraded, willReject }`.
- Ajout prop optionnelle `onReady?: (snapshot) => void` qui se déclenche une seule fois quand le hook passe en `"ready"` (guard via `useRef`).
- `ignoredCount = max(0, totalRows - nbRdvValides)` (le hook ne l'expose pas directement).

## Verification

- `npm run build` → exit 0 (route `/audit` 95.5 kB / 242 kB First Load JS)
- `npm run lint` → exit 0 (uniquement warnings préexistants sur `<img>` dans faq-section et testimonial-cards — hors scope)

## Acceptance Criteria

- [x] `grep -c "import CSVPreview" app/audit/page.tsx` = 1
- [x] `grep -c "import DegradedConfirmDialog" app/audit/page.tsx` = 1
- [x] `grep -c "import CSVErrorCard" app/audit/page.tsx` = 1
- [x] `<CSVPreview` rendu (1 occurrence JSX)
- [x] `<DegradedConfirmDialog` rendu (1 occurrence JSX)
- [x] `<CSVErrorCard` rendu (2 occurrences : formulaire + erreur)
- [x] `structuredError` apparaît 6× (state + setters + branches)
- [x] `Audit partiel` apparaît 1×
- [x] `preview` apparaît 8× (state + render conditional + handlers)
- [x] Apostrophes en `&apos;` dans le JSX (aucun `'` brut introduit)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] CSVPreview ne fournissait pas onReady**
- **Found during:** Task 1
- **Issue:** Plan 07-03 n'avait pas exposé `onReady` sur `<CSVPreview>`, mais Plan 07-05 a besoin du snapshot pour alimenter `<DegradedConfirmDialog>`.
- **Fix:** Ajout d'une prop optionnelle `onReady?: (snapshot: CSVPreviewSnapshot) => void` + interface exportée. Le plan autorisait explicitement cette extension mineure.
- **Files modified:** `components/audit/CSVPreview.tsx`
- **Commit:** 914ac0d

### Notes

- Le bouton "Générer l&apos;audit flash" du formulaire ne POST plus directement : il passe en `etat="preview"` (toast d'erreur si pas de fichier). Cohérent avec le flow D-02 (preview obligatoire avant POST).
- Aucune régression sur ETAPES_LOADING, AuditDashboard, PDF download, navbar.

## Self-Check: PASSED

- File: `app/audit/page.tsx` — FOUND
- File: `components/audit/CSVPreview.tsx` — FOUND
- Commit: 914ac0d — FOUND
- Build exit 0 — CONFIRMED
- Lint exit 0 (warnings préexistants seulement) — CONFIRMED
