---
phase: 07-robustesse-upload-csv
plan: 02
subsystem: api-route + n8n-normalize
tags: [api, error-contract, degraded-mode, rgpd]
requires:
  - 07-01 (audit-thresholds, audit-errors, audit-validation)
provides:
  - Route /api/audit propageant AuditErrorPayload typé
  - mapN8nErrorToCode (5 codes verrouillés)
  - normalizeN8nResponse passthrough degraded fields
affects:
  - app/audit/page.tsx (consommera error_code + degraded au plan 07-03)
tech-stack:
  added: []
  patterns:
    - Discriminated union ValidationResult (error_code vs legacy)
    - Passthrough côté serveur (jamais d'invention de champs)
    - safeLog pour les erreurs réseau (no PII leak)
key-files:
  created:
    - lib/__tests__/n8n-normalize.test.ts (étendu — 16 tests dont 11 nouveaux)
  modified:
    - types/audit.ts (AuditResponse + degraded/error_code optionnels)
    - lib/n8n-normalize.ts (mapN8nErrorToCode + passthrough degraded)
    - app/api/audit/route.ts (4 zones d'extension : validation, n8n-error, n8n-success, catch)
decisions:
  - Fallback EMPTY_AFTER_PARSING choisi pour les messages non classifiés (plus prudent que d'inventer)
  - Catch réseau renvoie 502 (pas 500) — sémantique upstream gateway
  - evaluateRecognition appelé uniquement si reco_rate ET nb_rdv_valides fournis par n8n (legacy ok par défaut)
metrics:
  duration: ~9 min
  tasks: 2/2
  completed_date: 2026-04-26
---

# Phase 7 Plan 02: Route API + n8n-normalize Summary

API route /audit + lib/n8n-normalize étendus pour livrer le contrat d'erreur structuré (REQ #2), propager le mode dégradé (REQ #3) et déclencher INSUFFICIENT_DATA (REQ #4) sur les seuils REJECT_THRESHOLD / MIN_RDV_VALIDES.

## What Was Built

### Task 1 — lib/n8n-normalize.ts + types/audit.ts (commit `e463517`)

- `mapN8nErrorToCode(rawError)`: classifie un message technique n8n vers `AuditErrorCode` parmi les 5 codes verrouillés. Ordre = priorité (ENCODING > INSUFFICIENT > INVALID_DATE > MISSING_COLUMNS > EMPTY_AFTER_PARSING + fallback). Pure, idempotente, case-insensitive, ne stocke pas le message.
- `normalizeN8nResponse`: passthrough des 4 champs dégradé (`degraded`, `reco_rate`, `ignored_count`, `sample_ignored`) quand n8n les fournit. Comportement legacy préservé si absents.
- `types/audit.ts`: `AuditResponse` étendu avec champs optionnels (degraded/reco_rate/ignored_count/sample_ignored + error_code/details). Aucun breaking change.
- 16 tests Vitest (8 mapN8nErrorToCode + 4 degraded passthrough + 5 legacy preserved + autres pré-existants couverts).

### Task 2 — app/api/audit/route.ts (commit `b619983`)

4 zones d'extension :

1. **Branche validation** : si `result.error_code` présent → `AuditErrorPayload` 400 ; sinon legacy `{ success:false, error }` 400 (compat email/nom_cabinet/ca_moyen).
2. **n8n erreur (success=false)** : `mapN8nErrorToCode(error)` puis `{ success:false, error_code, error, details:{source:"n8n"} }` 400.
3. **n8n succès (success=true)** : si `reco_rate` ET `nb_rdv_valides` fournis → `evaluateRecognition`. `outcome:reject` → 400 INSUFFICIENT_DATA fourni par evaluate ; `outcome:degraded` → 200 avec `{ ...obj, degraded:true, reco_rate }` ; `outcome:ok` → passthrough standard.
4. **Catch (réseau/timeout)** : 502 + `error_code:"EMPTY_AFTER_PARSING"` + message FR clair, pas de leak (URL webhook, stack). `safeLog` (Phase 5) utilisé.

Origin allowlist, rate-limit, `maxDuration=60` **inchangés**. Aucune PII (`csv_text`, `email`, `nom_cabinet`) dans les `details` retournés au client.

## Verification

- `npx vitest run lib/__tests__/n8n-normalize.test.ts` → **16/16 passed**
- `npx vitest run lib/__tests__/n8n-normalize.test.ts lib/__tests__/audit-validation.test.ts lib/__tests__/audit-thresholds.test.ts` → **41/41 passed**
- `npx tsc --noEmit` → exit 0
- `npm run lint` → exit 0 (warnings préexistants `<img>` hors scope)
- `npm run build` → exit 0 (route `/api/audit` rebâtie ƒ dynamique)

## Acceptance Criteria

| Critère                                                          | Résultat |
| ---------------------------------------------------------------- | -------- |
| `mapN8nErrorToCode` exporté                                      | 1        |
| `degraded` dans n8n-normalize                                    | 2        |
| `sample_ignored` dans n8n-normalize                              | 2        |
| `error_code` dans types/audit.ts                                 | 1        |
| `evaluateRecognition` dans route                                 | 2        |
| `mapN8nErrorToCode` dans route                                   | 2        |
| `AuditErrorPayload` dans route                                   | 4        |
| `error_code` dans route                                          | 6        |
| `degraded` dans route                                            | 2        |
| PII leak (csv_text/nom_cabinet/email + "details")                | 0        |
| Vitest n8n-normalize.test.ts                                     | 16/16    |
| Build + lint                                                     | exit 0   |

## Deviations from Plan

**[Rule 3 - Blocking config]** Le plan référence `lib/n8n-normalize.test.ts` à la racine de `lib/`, mais `vitest.config.ts` filtre uniquement `lib/__tests__/**/*.test.ts`. Test étendu à `lib/__tests__/n8n-normalize.test.ts` (déjà existant, contenait 5 tests legacy de Phase 6). 11 nouveaux tests fusionnés sans casser les existants. Aucun doublon.

Aucune autre déviation. Pas de Rule 1 (bug) ni Rule 2 (sécurité) déclenchée — Plan 07-01 avait déjà câblé les types et thresholds proprement.

## Threat Flags

Aucun. Surface réseau inchangée (mêmes endpoints, mêmes headers, mêmes contrôles origin/rate-limit). Le contrat d'erreur structuré **réduit** la surface (pas de leak du message brut n8n côté client en cas de catch — mapping vers code typé + message FR contrôlé).

## Self-Check: PASSED

- types/audit.ts: FOUND
- lib/n8n-normalize.ts: FOUND (mapN8nErrorToCode exporté, degraded passthrough)
- lib/__tests__/n8n-normalize.test.ts: FOUND (16 tests)
- app/api/audit/route.ts: FOUND (AuditErrorPayload + evaluateRecognition + mapN8nErrorToCode)
- Commit e463517: FOUND
- Commit b619983: FOUND
