# Phase 9: Monitoring & Analytics - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-26
**Phase:** 09-monitoring-analytics
**Areas discussed:** Architecture provider, Helpers track typage, Stratégie validation, Mesure bundle

---

## Architecture provider analytics

| Option | Description | Selected |
|---|---|---|
| (a) `<Analytics />` brut dans `app/layout.tsx` | Simple, idiomatique Vercel, points d'appel `track()` dispersés | ✓ |
| (b) `<AnalyticsProvider>` custom + hook `useTrack()` | Plus de contrôle, +20 lignes |  |

**User's choice:** (a) — recommandation validée
**Notes:** MVP observabilité, pas besoin d'abstraction. Cohérent avec composants tiers déjà au layout (`<Toaster />`, `<Agentation />`).

---

## Helpers `track()` — typés ou raw ?

| Option | Description | Selected |
|---|---|---|
| (a) Raw | Chaque composant importe `track` de `@vercel/analytics` directement |  |
| (b) Typé centralisé | `lib/analytics.ts` avec 11 fonctions typées, refus statique des PII et typos | ✓ |

**User's choice:** (b) — recommandation validée
**Notes:** Cohérence avec pattern Phase 7 (`lib/audit-*.ts`), guardrail PII automatique, refactor futur facile.

---

## Stratégie de validation

| Option | Description | Selected |
|---|---|---|
| (a) Manuel only | User fait 2 parcours en prod et regarde dashboard |  |
| (b) Vitest sur les 11 helpers + manuel pour ACs prod | Mock `track`, vérifier names + properties + manuel pour AC-1/2/6 | ✓ |
| (c) Playwright E2E qui intercepte les calls | Overkill pour analytics |  |

**User's choice:** (b) — recommandation validée
**Notes:** Vitest rapide et cohérent avec Phase 7 (79 tests). E2E = overkill. Smoke prod manuel pour AC-1, AC-2, AC-6.

---

## Mesure bundle (AC-4 : +5 KB max)

| Option | Description | Selected |
|---|---|---|
| (a) Diff manuel `npm run build` avant/après | One-shot, pas d'outillage permanent | ✓ |
| (b) Script `scripts/measure-bundle.ts` | Setup +30min, overkill pour check one-shot |  |

**User's choice:** (a) — recommandation validée
**Notes:** `@vercel/analytics` pèse ~1 KB gzipped → marge confortable vs budget 5 KB.

---

## Claude's Discretion

- Ordre exact des arguments dans chaque helper
- Granularité fichiers de tests (recommandé : 1 fichier `analytics.test.ts`)
- Choix des fixtures Vitest pour `AuditErrorCode` (réutiliser Phase 7)
- Nommage exact du `location` enum pour `trackCtaCalendlyClick` (ajustable selon call-sites réels)

## Deferred Ideas

- Sentry server-side `/api/audit` → Phase 9-bis
- Alertes email/Slack sur erreur prod → Phase 9-bis
- Dashboard funnel custom `/admin` → Phase 10
- Tracking server-side n8n → Phase 10
- A/B testing / feature flags → v2.1
- Heatmaps / session replay → v2.1
- Bascule Plausible (si Vercel Analytics jugé limité) → v2.1
