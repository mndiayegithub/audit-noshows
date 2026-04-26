# Phase 9: Monitoring & Analytics - Context

**Gathered:** 2026-04-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Instrumenter le funnel commercial v2 (`audit.perfiamatic.fr`) avec 11 events client-side via Vercel Web Analytics. Aucun changement server-side, aucun error tracking — Phase 9 = première couche d'observabilité objective uniquement.

</domain>

<spec_lock>
## Requirements (locked via SPEC.md)

**6 requirements sont verrouillées.** Voir `09-SPEC.md` pour les requirements complètes, boundaries, et acceptance criteria.

Downstream agents DOIVENT lire `09-SPEC.md` avant planning ou implementation. Les requirements ne sont pas dupliquées ici.

**In scope (depuis SPEC.md):**
- Installation et intégration `@vercel/analytics` (Next.js 14 App Router)
- 11 events custom client-side avec properties typées
- Fail-soft (try/catch ou usage natif non-bloquant de `track()`)
- Vérification PII-free par revue de code
- Documentation rapide dans SUMMARY.md listant les events et leurs propriétés
- Note SUMMARY.md : action manuelle utilisateur pour s'abonner à `vercel.com/status`

**Out of scope (depuis SPEC.md):**
- Sentry / error tracking server-side `/api/audit` → Phase 9-bis
- Alertes email/Slack sur erreur prod → Phase 9-bis
- Dashboard funnel custom `/admin` → Phase 10
- Tracking server-side de `nb_rdv_valides` / `reco_rate` côté n8n → Phase 10
- A/B testing / feature flags → backlog v2.1
- Heatmaps / session replay → backlog v2.1
- Notif email auto si Vercel Analytics down → user s'abonne manuellement à `vercel.com/status`

</spec_lock>

<decisions>
## Implementation Decisions

### Architecture provider
- **D-01:** `<Analytics />` brut monté dans `app/layout.tsx` (RootLayout). Pas de `<AnalyticsProvider>` custom, pas de hook wrapper — on reste idiomatique Vercel/Next.js 14 App Router. Position : à côté du `<Toaster />` et `<Agentation />` existants.

### Helpers `track()` — couche typée centralisée
- **D-02:** Tous les events passent par `lib/analytics.ts` qui exporte **11 fonctions typées**, une par event :
  ```ts
  trackLandingView(referrer?: string)
  trackLandingCtaAuditClick()
  trackAuditView()
  trackCsvPreviewLoaded(nbRdv: number, recoRate: number)
  trackCsvRejected(errorCode: AuditErrorCode)
  trackAuditSubmitted(degraded: boolean)
  trackAuditSuccess(score: number, tauxNoshow: number)
  trackAuditFailed(errorCode: string)
  trackCtaCalendlyClick(location: 'hero' | 'footer' | 'audit-results')
  trackGoogleDiagnosticTriggered()
  trackPdfDownloaded()
  ```
- **D-03:** Aucun composant n'importe `track` directement de `@vercel/analytics` — passage obligatoire par les helpers. Cela rend l'injection accidentelle de PII statiquement impossible (aucun helper n'accepte `email`, `nom_cabinet`, ou champ string libre risqué).
- **D-04:** Chaque helper enveloppe l'appel `track()` dans un `try { } catch { }` silencieux (fail-soft AC ↔ AC-3 indirectement, AC visible dans AC-1/AC-6).
- **D-05:** Cohérence avec pattern Phase 7 — `lib/analytics.ts` rejoint `lib/audit-thresholds.ts`, `lib/audit-validation.ts`, `lib/audit-errors.ts` et réutilise le type `AuditErrorCode` déjà exporté de `types/audit-errors.ts`.

### Validation / tests
- **D-06:** **Vitest** sur les 11 helpers (mock du `track` importé de `@vercel/analytics`, assertions sur event name + properties exact). Ajoute `lib/__tests__/analytics.test.ts` au pool des 79 tests Phase 7. Cible ~15-20 tests (1-2 par helper + edge cases fail-soft).
- **D-07:** **Pas de Playwright E2E** sur les events — overkill, le mock Vitest couvre la logique. Les 3 specs Playwright Phase 7 (`audit-flow-{ok,degraded,reject}.spec.ts`) restent inchangées.
- **D-08:** **Smoke prod manuel** par le user pour AC-1, AC-2, AC-6 : 1 parcours golden complet + 1 parcours rejet sur `audit.perfiamatic.fr`, puis vérification dashboard Vercel Analytics < 30s après.

### Mesure bundle (AC-4 : +5 KB max)
- **D-09:** **Diff manuel `npm run build`** : capture du `First Load JS` route `/` avant installation, puis après. Pas d'outillage permanent (`scripts/measure-bundle.ts` jugé overkill pour un check one-shot). Si delta > +5 KB → investiguer (mais `@vercel/analytics` pèse ~1 KB gzipped → marge confortable).

### Documentation
- **D-10:** SUMMARY.md de phase contient :
  1. Tableau des 11 events (name, trigger, properties, file:line de chaque call-site)
  2. Mesure bundle avant/après
  3. Action user : s'abonner à `vercel.com/status` (notif email si infra Vercel down)
  4. Note ouverture vers Phase 9-bis (Sentry server-side) et Phase 10 (dashboard custom + server-side analytics)

### Claude's Discretion
- Ordre exact des arguments dans chaque helper (cohérence interne)
- Granularité des fichiers de tests (1 fichier `analytics.test.ts` ou 1 fichier par helper) — recommandé : 1 fichier unique
- Choix des fixtures Vitest pour `AuditErrorCode` (réutiliser celles de Phase 7)
- Nommage exact du `location` enum pour `trackCtaCalendlyClick` (`'hero' | 'footer' | 'audit-results'` proposé, ajustable selon les call-sites réels)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 9 specs
- `.planning/phases/phase-09-monitoring-analytics/09-SPEC.md` — **Locked requirements — MUST read before planning.** Contient les 6 requirements, les 11 events avec triggers/properties exacts, les boundaries explicites, et les 6 ACs pass/fail.

### Vercel Web Analytics — outil officiel
- https://vercel.com/docs/analytics/quickstart — Quickstart Next.js 14 App Router (intégration `<Analytics />` dans `app/layout.tsx`)
- https://vercel.com/docs/analytics/custom-events — API `track(name, properties)` + contraintes (event name string, properties = primitives uniquement)
- https://vercel.com/docs/analytics/limits-and-pricing — Plan free hobby = 2.5k events/mois, plan Pro = $10/mois illimité

### Phase 7 — pattern à reprendre pour cohérence
- `lib/audit-thresholds.ts` — Single source of truth typée (pattern à dupliquer pour `lib/analytics.ts`)
- `lib/audit-validation.ts` — Style de typage strict
- `types/audit-errors.ts` — `AuditErrorCode` enum à réutiliser dans `trackCsvRejected` et `trackAuditFailed`
- `lib/__tests__/` — Cible d'ajout pour `analytics.test.ts`

### Roadmap & state
- `.planning/ROADMAP.md` §220-233 — Phase 9 scope d'origine
- `.planning/STATE.md` — Phase 8 close, milestone v2 à 89%

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`types/audit-errors.ts:AuditErrorCode`** — Enum typé déjà exporté (5 codes : MISSING_COLUMNS, INVALID_DATE_FORMAT, EMPTY_AFTER_PARSING, ENCODING_ERROR, INSUFFICIENT_DATA). À réutiliser dans `trackCsvRejected`.
- **`lib/audit-thresholds.ts` / `lib/audit-validation.ts` / `lib/audit-errors.ts`** — Pattern de fichiers `lib/` typés établi en Phase 7. `lib/analytics.ts` doit suivre le même style (default export d'objets ou named exports cohérents avec le voisinage).
- **`lib/__tests__/`** — Infrastructure Vitest déjà en place (79 tests Phase 7). Ajout de `analytics.test.ts` zéro friction.
- **`hooks/useCSVPreview.ts`** — Hook typé qui retourne preview success → call-site naturel pour `trackCsvPreviewLoaded`.
- **`components/audit/CSVErrorCard.tsx`** — Rendu conditionnel sur `errorCode` → call-site pour `trackCsvRejected` (probablement via `useEffect` sur mount).
- **`components/audit/CalendlyEmbed.tsx`, `CTACalendly.tsx`** — 3 emplacements probables pour `trackCtaCalendlyClick` (à confirmer en planning).
- **`components/audit/DiagnosticGoogle.tsx`** — Composant qui déclenche la requête Google Places → call-site pour `trackGoogleDiagnosticTriggered`.
- **`components/audit/RapportPDF.tsx`** + bouton download dans `AuditDashboard` Section 5 → call-site pour `trackPdfDownloaded`.

### Established Patterns
- **Typage strict** : tout fichier `lib/` est `.ts` strict, exports nommés, types explicites. `lib/analytics.ts` doit suivre.
- **Tests Vitest co-localisés** : `lib/__tests__/*.test.ts` (pattern Phase 7).
- **Composants App Router** : Tous les call-sites `track*()` doivent être appelés depuis composants `"use client"` (Vercel Analytics nécessite client runtime).
- **Imports `@/`** : tsconfig path alias configuré → `import { trackAuditSuccess } from "@/lib/analytics"`.

### Integration Points
- **`app/layout.tsx`** — Insertion `<Analytics />` (1 ligne import + 1 ligne JSX, à côté de `<Toaster />` et `<Agentation />`).
- **`app/page.tsx` (landing)** — Mount → `trackLandingView()`. Bouton "Démarrer l'audit" → `trackLandingCtaAuditClick()`.
- **`app/audit/page.tsx`** — Mount → `trackAuditView()`. Submit `/api/audit` → `trackAuditSubmitted(degraded)`. Réponse → `trackAuditSuccess` ou `trackAuditFailed`.
- **`hooks/useCSVPreview.ts`** — Sur preview success → `trackCsvPreviewLoaded(nbRdv, recoRate)`.
- **`components/audit/CSVErrorCard.tsx`** — Sur mount → `trackCsvRejected(errorCode)`.
- **`components/audit/{CTACalendly,CalendlyEmbed}.tsx`** + tout autre call-to-Calendly → `trackCtaCalendlyClick(location)`.
- **`components/audit/DiagnosticGoogle.tsx`** — Au déclenchement de la requête → `trackGoogleDiagnosticTriggered()`.
- **`components/audit/AuditDashboard.tsx`** (Section 5 PDF) — Sur click download → `trackPdfDownloaded()`.

### Dépendances à ajouter
- `@vercel/analytics` (^1.x) — runtime
- Aucune dépendance dev supplémentaire (vitest déjà en place Phase 6/7)

</code_context>

<specifics>
## Specific Ideas

- User a explicitement validé toutes les recommandations en bloc — confiance dans les choix par défaut idiomatiques.
- Cohérence de pattern avec Phase 7 (`lib/*.ts` typé + tests Vitest co-localisés) prioritaire sur toute autre considération.
- Fail-soft est non négociable : analytics ne doit JAMAIS bloquer le funnel commercial (cf SPEC R4 + AC-1/AC-6).
- L'ordre de magnitude utilisateur est ~quelques centaines d'events/mois → plan free Vercel largement suffisant, pas besoin d'optimisation event-rate.

</specifics>

<deferred>
## Deferred Ideas

- **Sentry / error tracking server-side** sur `/api/audit` errors → **Phase 9-bis** (à roadmaper après observation Phase 9 ; déclencheur = ≥1 incident prod silencieux ou volume erreurs ≥1%/sem).
- **Alertes email/Slack sur erreur prod** → **Phase 9-bis**.
- **Dashboard funnel custom `/admin`** (filtre auth + requête Vercel Analytics API) → **Phase 10**.
- **Tracking server-side** de `nb_rdv_valides` / `reco_rate` côté n8n (pour analyse offline plus poussée) → **Phase 10**.
- **A/B testing / feature flags** (Vercel Edge Config ou GrowthBook) → backlog **v2.1**.
- **Heatmaps / session replay** (Hotjar, FullStory, PostHog session replay) → backlog **v2.1**.
- **Bascule outil analytics vers Plausible** (si dashboard Vercel jugé trop limité après usage réel) → backlog **v2.1**.

</deferred>

---

*Phase: 09-monitoring-analytics*
*Context gathered: 2026-04-26*
