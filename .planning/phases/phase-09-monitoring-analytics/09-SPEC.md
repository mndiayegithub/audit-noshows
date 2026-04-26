# Phase 9: Monitoring & Analytics — Specification

**Created:** 2026-04-26
**Ambiguity score:** 0.14 (gate: ≤ 0.20)
**Requirements:** 6 locked

## Goal

Instrumenter le funnel commercial v2 (`audit.perfiamatic.fr`) avec 11 events client-side via Vercel Web Analytics, pour passer du pilotage au feedback utilisateur à un pilotage par métriques objectives mesurables dans le dashboard Vercel.

## Background

Le site v2 est en production depuis Phase 8 (2026-04-26) sur `audit.perfiamatic.fr` mais **aucune instrumentation n'existe** :
- 0 dépendance analytics (`@vercel/analytics`, Plausible, Sentry, PostHog) dans `package.json`
- 0 appel `track()` dans le code (`app/`, `components/`, `lib/`)
- Aucun catch d'erreur instrumenté côté `/api/audit`
- Le dashboard Vercel Analytics affiche uniquement les page views automatiques (pas les events custom)

Le user pilote actuellement le funnel uniquement via feedback utilisateur direct ("ça plante", "ça marche pas"). Phase 9 livre la **première couche d'observabilité objective** sur le parcours landing → audit → CTA Calendly.

Server-side error tracking (Sentry sur `/api/audit`), alertes prod, et dashboard funnel custom sont **explicitement reportés** (Phase 9-bis et Phase 10).

## Requirements

1. **Vercel Analytics installé**: Le package `@vercel/analytics` est intégré au layout racine.
   - Current: Aucune dépendance analytics. `app/layout.tsx` n'importe ni `Analytics` ni `track`.
   - Target: `@vercel/analytics` listé dans `package.json` ; `<Analytics />` monté dans `app/layout.tsx` (App Router).
   - Acceptance: `npm ls @vercel/analytics` retourne une version installée ; le HTML servi par `audit.perfiamatic.fr` charge le script `_vercel/insights/script.js`.

2. **11 events custom déclenchés aux bons points**: Tous les events listés ci-dessous sont émis via `track(name, properties)` aux endroits exacts du funnel.
   - Current: Aucun event custom. Aucun appel `track()` n'existe dans le repo.
   - Target: 11 events instrumentés selon le tableau ci-dessous.
   - Acceptance: Chaque event apparaît ≥ 1 fois dans Vercel Analytics dashboard après un parcours de test golden + un parcours rejet réalisés par le user sur prod.

   | # | Event | Trigger | Properties |
   |---|---|---|---|
   | 1 | `landing_view` | Mount `/` | `referrer` (string, optionnel) |
   | 2 | `landing_cta_audit_click` | Click bouton "Démarrer l'audit" sur landing | — |
   | 3 | `audit_view` | Mount `/audit` | — |
   | 4 | `csv_preview_loaded` | `useCSVPreview` retourne preview success | `nb_rdv` (number), `reco_rate` (number) |
   | 5 | `csv_rejected` | `CSVErrorCard` rendu | `error_code` (MISSING_COLUMNS \| INVALID_DATE_FORMAT \| EMPTY_AFTER_PARSING \| ENCODING_ERROR \| INSUFFICIENT_DATA) |
   | 6 | `audit_submitted` | POST `/api/audit` lancé depuis client | `degraded` (boolean) |
   | 7 | `audit_success` | Réponse 200 reçue côté client | `score` (number 0-100), `taux_noshow` (number 0-100) |
   | 8 | `audit_failed` | Réponse 4xx/5xx reçue côté client | `error_code` (string) |
   | 9 | `cta_calendly_click` | Click sur n'importe quel bouton/link Calendly | `location` ("hero" \| "footer" \| "audit-results") |
   | 10 | `google_diagnostic_triggered` | `DiagnosticGoogle` lance la requête | — |
   | 11 | `pdf_downloaded` | Click "Télécharger PDF" | — |

3. **Aucun PII transmis**: Les properties d'events ne contiennent aucune donnée personnelle ou contenu CSV.
   - Current: N/A (pas d'events)
   - Target: Aucun event ne transmet `email`, `nom_cabinet`, contenu CSV, noms de patients, ou tout autre identifiant direct/indirect.
   - Acceptance: Revue de code des 11 call-sites `track()` confirme : seuls les types listés au #2 (numbers, enums, booleans) sont passés en properties.

4. **Fail-soft analytics**: Si Vercel Analytics est bloqué (adblocker) ou down, l'app fonctionne normalement.
   - Current: N/A
   - Target: Aucun appel `track()` ne peut interrompre le parcours commercial. Le script `<Analytics />` est non-bloquant par design ; les appels `track()` custom sont safe à appeler même si le script n'a pas chargé.
   - Acceptance: Test manuel avec uBlock Origin actif sur `audit.perfiamatic.fr` → parcours golden complet jusqu'à CTA Calendly fonctionne sans erreur console bloquante (warning OK, error OK seulement si non-bloquant).

5. **Bundle JS contenu**: L'ajout d'analytics ne dégrade pas le poids du bundle landing de plus de +5 KB gzipped.
   - Current: Bundle landing actuel mesuré au build (référence à capturer en début de phase).
   - Target: Bundle landing post-instrumentation ≤ bundle pré + 5 KB gzipped.
   - Acceptance: `npm run build` avant/après comparé sur la route `/` ; delta `First Load JS` ≤ +5 KB.

6. **Dashboard Vercel exploitable**: Les events sont visibles et filtrables dans Vercel Analytics.
   - Current: Dashboard affiche uniquement page views auto.
   - Target: Onglet "Custom Events" du projet Vercel `audit-no-shows` liste les 11 events avec leurs occurrences.
   - Acceptance: Le user peut filtrer/séquencer le funnel `landing_view → landing_cta_audit_click → audit_view → audit_submitted → audit_success → cta_calendly_click` via les filtres natifs Vercel Analytics.

## Boundaries

**In scope:**
- Installation et intégration `@vercel/analytics` (Next.js 14 App Router)
- 11 events custom client-side avec properties typées
- Fail-soft (try/catch ou usage natif non-bloquant de `track()`)
- Vérification PII-free par revue de code
- Documentation rapide dans `.planning/phases/phase-09-monitoring-analytics/SUMMARY.md` listant les events et leurs propriétés
- Note dans SUMMARY.md : action manuelle utilisateur pour s'abonner à `vercel.com/status` (notif email si Vercel infra down — hors code)

**Out of scope:**
- **Sentry / error tracking server-side** sur `/api/audit` errors — reporté Phase 9-bis (server-side observability)
- **Alertes email/Slack sur erreur prod** — reporté Phase 9-bis
- **Dashboard funnel custom** dans `/admin` — reporté Phase 10 (UI custom + Vercel Analytics API)
- **Tracking server-side** de `nb_rdv_valides` / `reco_rate` côté n8n — reporté Phase 10
- **A/B testing / feature flags** — backlog v2.1
- **Heatmaps / session replay** (Hotjar, FullStory) — backlog v2.1
- **Notification email automatique si Vercel Analytics lui-même est down** — non gérable côté app ; user s'abonne manuellement à `vercel.com/status`

## Constraints

- **RGPD-friendly obligatoire** : Vercel Web Analytics est cookieless et ne transmet pas d'IP en clair → pas de bandeau consent requis. Toute alternative future doit respecter cette propriété.
- **Plan Vercel** : free hobby plan = 2.5k events/mois ; à dépasser → upgrade Pro $10/mois. Phase 9 reste sur free, monitoring du quota = action manuelle user.
- **Next.js 14 App Router** : utiliser le package `@vercel/analytics/react` et le composant `<Analytics />` dans `app/layout.tsx` (pas le package legacy pages router).
- **Aucune dépendance serveur ajoutée** : Phase 9 = client-side only ; `app/api/audit/route.ts` n'est pas modifié.

## Acceptance Criteria

- [ ] AC-1 : Les 11 events apparaissent dans le dashboard Vercel Analytics avec ≥ 1 occurrence chacun (test manuel : 1 parcours golden + 1 parcours rejet par le user)
- [ ] AC-2 : Le funnel `landing_view → landing_cta_audit_click → audit_view → audit_submitted → audit_success → cta_calendly_click` est visualisable en filtrant les events dans Vercel Analytics
- [ ] AC-3 : Aucun event ne contient de PII (pas d'email, pas de `nom_cabinet`, pas de contenu CSV) — vérifié par revue des call-sites `track()`
- [ ] AC-4 : Bundle JS landing n'augmente pas de plus de +5 KB gzipped après ajout `@vercel/analytics` (mesuré sur `npm run build`)
- [ ] AC-5 : `npm run build` + `npm run lint` verts
- [ ] AC-6 : Smoke prod sur `audit.perfiamatic.fr` : 1 parcours complet déclenche bien tous les events visibles dans dashboard Vercel < 30s après

## Ambiguity Report

| Dimension          | Score | Min  | Status | Notes                                         |
|--------------------|-------|------|--------|-----------------------------------------------|
| Goal Clarity       | 0.90  | 0.75 | ✓      | 11 events explicites, outil locké             |
| Boundary Clarity   | 0.85  | 0.70 | ✓      | 7 hors-scope listés avec raisons + Phase 9-bis/10 |
| Constraint Clarity | 0.80  | 0.65 | ✓      | RGPD, plan free, App Router, client-only      |
| Acceptance Criteria| 0.85  | 0.70 | ✓      | 6 ACs pass/fail dont mesure bundle et PII     |
| **Ambiguity**      | 0.14  | ≤0.20| ✓      |                                               |

## Interview Log

| Round | Perspective              | Question summary                                        | Decision locked                                                      |
|-------|--------------------------|---------------------------------------------------------|----------------------------------------------------------------------|
| 1     | Researcher               | Quelle métrique unique vise-t-on ? Comment surveille-t-on aujourd'hui ? Client vs server-side ? | Toutes les métriques pertinentes ; aucun monitoring aujourd'hui ; **client-side only** Phase 9 |
| 2     | Researcher + Simplifier  | Outil analytics ? Liste exacte des events ? Dashboard où ? | **Vercel Web Analytics** (free, EU-friendly, plug-and-play) ; **11 events** validés ; dashboard natif Vercel (custom `/admin` reporté Phase 10) |
| 3     | Boundary Keeper + Acceptance | Critères pass/fail ? Hors-scope confirmé ? Comportement si Vercel Analytics down ? | **6 ACs** ; hors-scope = Sentry/alertes/dashboard custom (Phase 9-bis et 10) ; **fail-soft** (l'app continue) ; user s'abonne manuellement à `vercel.com/status` |

---

*Phase: 09-monitoring-analytics*
*Spec created: 2026-04-26*
*Next step: /gsd-discuss-phase 9 — décisions d'implémentation (où exactement instrumenter chaque event, structure du provider analytics, conventions de nommage des call-sites)*
