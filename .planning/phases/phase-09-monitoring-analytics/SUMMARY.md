---
phase: 09-monitoring-analytics
status: livrée code-side, smoke prod manuel pending user
closed_code_side: 2026-04-26
closed_validated: pending-user-smoke
plans_completed: [09-01, 09-02, 09-03, 09-04, 09-05]
acs:
  pass: [AC-3, AC-4, AC-5]
  pending_user_smoke: [AC-1, AC-2, AC-6]
key_links:
  - 09-04-bundle-delta.md
  - 09-05-SMOKE-PROD-CHECKLIST.md
---

# Phase 9 — Monitoring & Analytics (SUMMARY)

**Status :** Code livré (5 plans en 3 waves), smoke prod manuel à exécuter par le user sur `audit.perfiamatic.fr`.
**Closed code-side :** 2026-04-26
**Closed validated :** pending user smoke (AC-1, AC-2, AC-6)

Une seule action utilisateur reste pour fermer la phase : suivre `09-05-SMOKE-PROD-CHECKLIST.md` sur prod, puis confirmer "approved" pour basculer STATE -> Phase 9 close.

---

## 1. Tableau des 11 events instrumentés

Sources : `lib/analytics.ts` (helpers typés, single import barrier D-03) + call-sites grep réel `2026-04-26 17:28 GMT+2`.

| #  | Event name (verbatim, snake_case) | Helper TypeScript | Trigger (file:line) | Properties |
| -- | --------------------------------- | ----------------- | ------------------- | ---------- |
| 1  | `landing_view`                | `trackLandingView`              | `components/landing/LandingViewTracker.tsx:13` (useEffect mount) | `{ referrer? }` (document.referrer si non-empty) |
| 2  | `landing_cta_audit_click`     | `trackLandingCtaAuditClick`     | `components/landing/LandingHero.tsx:53` , `LandingNav.tsx:53` , `CTABand.tsx:23` , `LandingFooter.tsx:38` | (none) |
| 3  | `audit_view`                  | `trackAuditView`                | `app/audit/page.tsx:60` (useEffect mount) | (none) |
| 4  | `csv_preview_loaded`          | `trackCsvPreviewLoaded`         | `hooks/useCSVPreview.ts:49` | `{ nb_rdv: number, reco_rate: number }` (NaN-guarded) |
| 5  | `csv_rejected`                | `trackCsvRejected`              | `components/audit/CSVErrorCard.tsx:41` (useEffect on `error_code`, gated par `KNOWN_ERROR_CODES`) | `{ error_code: AuditErrorCode }` |
| 6  | `audit_submitted`             | `trackAuditSubmitted`           | `app/audit/page.tsx:100` (avant fetch) | `{ degraded: boolean }` |
| 7  | `audit_success`               | `trackAuditSuccess`             | `app/audit/page.tsx:151` | `{ score: number, taux_noshow: number }` (score = clamp(0,100,100-taux*3.2)) |
| 8  | `audit_failed`                | `trackAuditFailed`              | `app/audit/page.tsx:119` , `:128` , `:133` , `:142` , `:158` (5 branches) | `{ error_code: string }` (server code OR HTTP status OR `UNKNOWN_FAILURE` OR `CLIENT_EXCEPTION`) |
| 9  | `cta_calendly_click`          | `trackCtaCalendlyClick`         | `components/audit/CTACalendly.tsx:66` , `CalendlyEmbed.tsx:43` , `CalendlyEmbed.tsx:51` | `{ location: "audit-results" }` (enum `"hero" \| "footer" \| "audit-results"`) |
| 10 | `google_diagnostic_triggered` | `trackGoogleDiagnosticTriggered`| `components/audit/DiagnosticGoogle.tsx:68` (dans `handleSearch` après guard empty-input) | (none) |
| 11 | `pdf_downloaded`              | `trackPdfDownloaded`            | `app/audit/page.tsx:178` (start of `handleDownloadPDF`, single source of truth) | (none) |

**Total invocations dans le code :** 20 (cf. Plan 09-03 SUMMARY §R2).
**D-03 import barrier :** seul `lib/analytics.ts` importe `@vercel/analytics` (grep verified, Plan 09-03 §D-03).
**R3 / AC-3 PII-free :** zéro `email`/`nomCabinet`/`patient` passé à un helper (grep verified, Plan 09-03 §AC-3).

---

## 2. Mesure bundle (AC-4)

Source détaillée : [`09-04-bundle-delta.md`](./09-04-bundle-delta.md). Synthèse :

| Metric                       | Baseline (09-01) | After (09-04) | Delta    | AC-4 (<= +5 KB) |
| ---------------------------- | ---------------- | ------------- | -------- | --------------- |
| Route `/` First Load JS      | 160 kB           | 162 kB        | **+2 kB** | PASS            |
| Route `/audit` First Load JS | 242 kB           | 243 kB        | +1 kB    | (info)          |
| First Load JS shared by all  | 87.6 kB          | 87.6 kB       | 0 kB     | (info)          |

**Verdict AC-4 : PASS** (+2 kB sur `/`, seuil = +5 KB gzipped).
**R5 :** satisfaite. Build + lint exit 0, 9/9 static pages générées.

---

## 3. Action utilisateur — abonnement infra Vercel

**Action manuelle requise** (non gérable par code) :

S'abonner aux notifications de **`https://www.vercel-status.com/`** (subscribe -> email) pour être notifié si l'infra Vercel Analytics elle-même est down.

Rationale : par définition, si Vercel Analytics est down, l'app ne peut pas observer ses propres events manquants (les `track()` sont fail-soft via `safeTrack` D-04 et avalent l'erreur silencieusement pour ne pas casser le funnel commercial — R4). La seule source de vérité d'une panne est la status page Vercel.

---

## 4. Smoke prod manuel — référence

Procédure pas-à-pas : [`09-05-SMOKE-PROD-CHECKLIST.md`](./09-05-SMOKE-PROD-CHECKLIST.md).

Couvre :
- **Parcours 1 (golden path)** : 8 events (landing_view, landing_cta_audit_click, audit_view, csv_preview_loaded, audit_submitted, audit_success, cta_calendly_click, pdf_downloaded) avec CSV recommandé `01_Leads_CSV/test_01_doctolib_6mois_clean.csv`.
- **Parcours 2 (rejet)** : `csv_rejected` (CSV colonnes manquantes ou statuts non reconnus) + éventuel `audit_failed` si soumission dégradée.
- **Parcours 3 (Google)** : `google_diagnostic_triggered` (saisie nom cabinet -> bouton diagnostic).
- **Vérification dashboard** : `https://vercel.com/mndiayepro97-3818s-projects/audit-no-shows/analytics` onglet Custom Events, < 30s post-parcours.
- **Critères pass/fail explicites** pour AC-1, AC-2, AC-6.
- **Action de fallback** si event manquant (DevTools console + Network tab `_vercel/insights/event`).

---

## 5. Statut des 6 ACs

| AC   | Description                                                              | Statut                  | Vérifié par                                          |
| ---- | ------------------------------------------------------------------------ | ----------------------- | ---------------------------------------------------- |
| AC-1 | 11 events >= 1 occurrence dashboard Vercel < 30s post-parcours           | **PENDING USER SMOKE** | Parcours 1+2+3 checklist                             |
| AC-2 | Funnel `landing_view -> ... -> cta_calendly_click` filtrable             | **PENDING USER SMOKE** | Vercel Analytics filtres natifs                      |
| AC-3 | PII-free (aucun email / nom_cabinet / contenu CSV envoyé)                | PASS                    | Plan 09-02 (typage TS) + Plan 09-03 (grep statique)  |
| AC-4 | Bundle delta <= +5 KB gzipped                                            | PASS (+2 kB)            | Plan 09-04 (`09-04-bundle-delta.md`)                 |
| AC-5 | Build + lint + tests verts                                               | PASS                    | Plan 09-03 Task 5 (98/98 vitest, build/lint exit 0)  |
| AC-6 | Smoke prod parcours complet -> tous events visibles < 30s                | **PENDING USER SMOKE** | Parcours 1+2+3 + vérif détails properties            |

---

## 6. Plans exécutés

| Plan  | Wave | Sujet                                          | Commits clés                               | Durée    |
| ----- | ---- | ---------------------------------------------- | ------------------------------------------ | -------- |
| 09-01 | 1    | Provider mount + bundle baseline               | `760a01a`, `9172c1d`, `694a37c`            | ~3 min   |
| 09-02 | 1    | 11 helpers typés + safeTrack (TDD red->green)  | `b78e58b` (test), `caf218d` (feat)         | ~5 min   |
| 09-03 | 2    | Wire 11 events aux call-sites du funnel        | `879a89c`, `ab32907`, `aa47c40`, `a2e834b` | ~28 min  |
| 09-04 | 3    | Bundle delta measurement + AC-4 verdict        | (artefacts docs)                           | ~5 min   |
| 09-05 | 3    | SUMMARY de phase + checklist smoke prod        | (ce commit)                                | ~10 min  |

**Total :** 5 plans / ~51 min code-side. Smoke prod = ~10 min user.

---

## 7. Ouverture vers Phase 9-bis et Phase 10

### Phase 9-bis (à roadmaper) — Sentry / error tracking server-side

**Déclencheur :** >=1 incident prod silencieux observé OU volume `audit_failed` >= 1%/sem dans dashboard Vercel.
**Scope :** instrumenter `/api/audit/route.ts` côté serveur (Sentry SDK Node), capturer les erreurs proxy n8n + parsing CSV serveur. `audit_failed` côté client reste utile pour les erreurs réseau / 4xx vues du browser, mais ne capture pas les 5xx silencieux.

### Phase 10 (à roadmaper) — Dashboard funnel custom + n8n stats serveur

**Déclencheur :** besoin commercial de visualiser le funnel `landing -> audit -> calendly` agrégé avec rétention 90 j.
**Scope :**
- `/admin` route protégée (auth simple + Vercel Analytics API)
- Visualisation funnel custom (drop-off par étape, conversion globale)
- Tracking server-side `nb_rdv_valides` / `reco_rate` côté n8n (vs aujourd'hui : émis depuis le browser uniquement -> biaisé par adblock)

---

## Statut final

**Phase 9 livrée code-side, smoke prod en attente de validation user.** STATE.md sera basculé à "Phase 9 close" une fois que le user confirme les 11 events visibles dans le dashboard Vercel après exécution de `09-05-SMOKE-PROD-CHECKLIST.md`. Tant que le smoke n'a pas été exécuté en condition réelle sur `audit.perfiamatic.fr`, AC-1 / AC-2 / AC-6 restent en statut PENDING USER SMOKE et la phase ne peut pas être marquée validée — le code est prêt, les artefacts docs sont prêts, l'action utilisateur est triviale (~10 min) mais inévitable car Vercel Analytics ne tracke pas en dev (RESEARCH §Q4).

## Self-Check: PASSED

- [x] `SUMMARY.md` contient les 4 sections lockées par D-10 (events table + bundle + action user vercel-status + ouverture 9-bis/10)
- [x] Les 11 event names listés verbatim en snake_case
- [x] File:line des call-sites verified par grep réel (`grep -rn "track[A-Z]" app/ components/ hooks/` 2026-04-26 17:28)
- [x] Lien vers `09-04-bundle-delta.md` présent (section 2)
- [x] Lien vers `09-05-SMOKE-PROD-CHECKLIST.md` présent (section 4)
- [x] Mention `vercel-status.com` présente (section 3)
- [x] Statut final + 6 ACs explicités
