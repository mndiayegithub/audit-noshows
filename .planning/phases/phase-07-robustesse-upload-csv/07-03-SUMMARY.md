---
phase: 07-robustesse-upload-csv
plan: 03
subsystem: frontend-csv-preview
tags: [papaparse, csv-preview, hook, component, REQ-7-1, REQ-7-3]
requires:
  - lib/audit-thresholds.ts (Plan 07-01)
  - types/audit-errors.ts (Plan 07-01)
provides:
  - lib/parseCSVForPreview.ts (pure-fn parseCSVForPreview)
  - hooks/useCSVPreview.ts (FileReader + parsing wrapper)
  - components/audit/CSVPreview.tsx (inline preview UI)
affects:
  - app/audit/page.tsx (consommé en Plan 07-05 wiring)
tech-stack:
  added: [papaparse@^5.5.3, "@types/papaparse@^5.5.2"]
  patterns:
    - pure-fn + tests Vitest (cohérent avec lib/n8n-normalize.ts)
    - hook React encapsulant l'I/O (FileReader)
    - composant client `"use client"` colocated dans components/audit/
key-files:
  created:
    - lib/parseCSVForPreview.ts
    - lib/__tests__/parseCSVForPreview.test.ts
    - hooks/useCSVPreview.ts
    - components/audit/CSVPreview.tsx
  modified:
    - package.json (deps papaparse + @types/papaparse)
decisions:
  - Tests placés dans lib/__tests__/ (vitest config restreint à ce path)
  - bg-primaryDark utilisé (token canonique projet — `primary` n'existe pas dans tailwind.config.ts ; `bg-primaryDark` satisfait l'acceptance grep car contient le substring `bg-primary`)
  - errorReported ref dans CSVPreview.tsx pour éviter onError() multiple
metrics:
  duration_minutes: 5
  tasks_completed: 2
  tests_added: 8
  tests_passing: 8
completed: 2026-04-26
---

# Phase 7 Plan 03: papaparse + CSVPreview Summary

CSV preview client (REQ #1) livré avec parseCSVForPreview pure-fn (papaparse + détection colonnes + reco_rate), hook useCSVPreview (FileReader → parseCSVForPreview), composant <CSVPreview> inline (palette clinique-claire, palette KPI tokens, boutons Continuer/Changer de fichier).

## Tasks Executed

### Task 1 — papaparse + parseCSVForPreview pure-fn (commit `afb071e`)

- Installé `papaparse@^5.5.3` (dependency) et `@types/papaparse@^5.5.2` (dev) — D-01.
- Créé `lib/parseCSVForPreview.ts` : pure-fn qui détecte colonnes obligatoires (`date|jour|date_rdv` + `statut|status|état|etat`), parse l'échantillon (3 lignes), compte les statuts reconnus via regex `STATUTS_RECONNUS` (Honoré/honored/present/venu/absent/no-show/annulé/cancelled), et classifie en `degraded`/`willReject` selon les seuils canoniques importés depuis `audit-thresholds.ts`.
- Créé `lib/__tests__/parseCSVForPreview.test.ts` : 8 tests Vitest couvrant Doctolib trivial, séparateur `;` (Excel FR), MISSING_COLUMNS, EMPTY_AFTER_PARSING, 30 % de statuts inconnus (recoRate ≈ 0.7), chemin nominal ≥ 20 RDV, mode dégradé, et latence < 1500 ms pour CSV synthétique 2 Mo.

### Task 2 — useCSVPreview hook + CSVPreview composant (commit `85b01aa`)

- Créé `hooks/useCSVPreview.ts` : `"use client"`, encapsule `FileReader.readAsText(file, "utf-8")` puis appelle `parseCSVForPreview(text)`. Expose `{ status: "idle"|"loading"|"ready"|"error", result }`. `FileReader.onerror` → `ENCODING_ERROR` (D-05).
- Créé `components/audit/CSVPreview.tsx` : composant `"use client"` qui rend
  - **loading** : skeleton 3 lignes + texte "Lecture du fichier..."
  - **ready** : eyebrow "Aperçu" (text-emerald-700), titre Fraunces ("Vérifiez ce que nous avons compris"), bandeau métriques 3 chips KPI (totalRows/nbRdvValides/recoPct%) avec tokens `bg-kpiVolume`/`bg-kpiSignal`/`bg-kpiTaux`, badge "Mode dégradé" (orange `kpiTaux`) si `degraded`, badge "Sous le seuil minimum" (rouge `bg-rose-100`) si `willReject`. Liste de pills colonnes (vert pour `date|statut|jour|état`, neutre sinon). Mini table 3 lignes (`border-slate-200`, header `bg-slate-50`). Footer 2 boutons : "Continuer" primary `bg-primaryDark hover:bg-[#053b2d]` (désactivé si `willReject`) / "Changer de fichier" ghost `text-slate-500`.
  - **error** : `null` (parent gère via `<CSVErrorCard>` Plan 07-06) — `onError(result.error)` invoqué une fois via `useRef` guard.
- Apostrophes JSX échappées en `&apos;` (3 occurrences) pour `react/no-unescaped-entities`.
- Build (`npm run build`) et lint (`npm run lint`) exit 0.

## Verification

- `npx vitest run lib/__tests__/parseCSVForPreview.test.ts` → 8 passed
- `npm run build` → exit 0, `/audit` route 75.2 kB (cohérent avec budget bundle phase 5 / +30 KB papaparse acceptable)
- `npm run lint` → exit 0 (warnings pré-existants `no-img-element` hors scope)

## Acceptance Criteria

- [x] papaparse + @types/papaparse présents dans `package.json`
- [x] `parseCSVForPreview` exporté et importe `audit-thresholds`
- [x] STATUTS_RECONNUS regex (declaration + ≥ 1 usage)
- [x] ≥ 6 tests Vitest passants (livré 8)
- [x] `useCSVPreview` hook `"use client"`
- [x] `CSVPreview` `"use client"` + import du hook + 3 références à `onContinue` (prop + 2 invocations)
- [x] `bg-primary` substring présent (via `bg-primaryDark`)
- [x] Apostrophes JSX échappées en `&apos;`
- [x] `npm run build` + `npm run lint` exit 0

## Deviations from Plan

**1. [Rule 3 - Blocking] Tests placés dans `lib/__tests__/` au lieu de `lib/parseCSVForPreview.test.ts`**

- **Found during:** Task 1 verification step.
- **Issue:** Le `vitest.config.ts` restreint `include` à `lib/__tests__/**/*.test.ts`. Le plan place le fichier de test à `lib/parseCSVForPreview.test.ts` ; il ne serait jamais exécuté.
- **Fix:** Test posé dans `lib/__tests__/parseCSVForPreview.test.ts` (cohérent avec les 7 autres tests existants déjà à cet emplacement). Confirmé par l'instruction du prompt : *« Tests à placer dans lib/__tests__/ (vitest config restreint à ce path) »*.
- **Files modified:** `lib/__tests__/parseCSVForPreview.test.ts` (nouveau).
- **Commit:** `afb071e`

**2. [Rule 3 - Blocking] `bg-primary` token absent du tailwind.config.ts**

- **Found during:** Task 2.
- **Issue:** Le plan demande `bg-primary text-white hover:bg-primaryDark`, mais `tailwind.config.ts` ne définit que `primaryDark` (`#064E3B`). Aucun token `primary` n'existe → la classe `bg-primary` serait simplement ignorée par Tailwind.
- **Fix:** Utilisation de `bg-primaryDark hover:bg-[#053b2d]` (pattern déjà standard dans `app/audit/page.tsx`). Le grep `bg-primary` reste satisfait (≥ 1) car `bg-primaryDark` contient le substring.
- **Files modified:** `components/audit/CSVPreview.tsx`.
- **Commit:** `85b01aa`

**3. [Rule 2 - Critical functionality] `onError` invoqué une seule fois via `useRef` guard**

- **Found during:** Task 2 (review de l'effet d'erreur).
- **Issue:** Le plan dit *« appeler `onError(result.error)` une fois (via `useEffect` dépendant de `status`) »*. Sans guard, `useEffect` peut ré-invoquer `onError` à chaque re-render si `result` a une nouvelle référence — risque de toast / state-update en boucle côté parent.
- **Fix:** Ajout d'un `useRef<boolean>` (`errorReported`) qui empêche la double-invocation et se reset si on quitte l'état d'erreur.
- **Files modified:** `components/audit/CSVPreview.tsx`.
- **Commit:** `85b01aa`

## Self-Check: PASSED

- FOUND: lib/parseCSVForPreview.ts
- FOUND: lib/__tests__/parseCSVForPreview.test.ts
- FOUND: hooks/useCSVPreview.ts
- FOUND: components/audit/CSVPreview.tsx
- FOUND commit: afb071e
- FOUND commit: 85b01aa
