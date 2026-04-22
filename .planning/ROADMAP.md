# ROADMAP — Audit No-Shows v2

## Milestone actif : v2.0 — Finalisation (démarré 2026-04-22)

**Stratégie :** refondre le funnel complet (landing → audit) en direction
clinique cohérente, ajouter les capacités manquantes (Google Places,
RGPD renforcé), sécuriser le delivery (tests, deploy, monitoring).

---

### Phase 1 · Refonte Landing page

**Status:** 📋 Planifiée · 5 plans · 14 REQs
**Goal:** Remplacer `app/page.tsx` par une landing B2B dark premium (toggle dark/light via `next-themes`) ciblant les cabinets médicaux FR. 5 sections ordonnées (Nav sticky → Hero split → How-it-works 3 steps → Social proof marquee+stats → FAQ 4Q + Final CTA full-bleed → Footer). CTA unique vers `/audit`. Archivage des 3 HTML legacy.

**Plans:** 5 plans

Plans:
- [ ] 01-01-PLAN.md — Foundation (next-themes install, Tailwind darkMode, CSS vars, next/font, ThemeProvider, ThemeToggle, CountUpNumber, audit/layout)
- [ ] 01-02-PLAN.md — LandingNav + LandingHero + ReportPreview (above-the-fold)
- [ ] 01-03-PLAN.md — Marquee + LandingHowItWorks + LandingSocialProof (mid-page)
- [ ] 01-04-PLAN.md — LandingFaqCta + LandingFooter (bottom)
- [ ] 01-05-PLAN.md — Orchestration shell + archive HTMLs + build/regression/Lighthouse checkpoint

**Canonical references:**
- SPEC: `.planning/phases/phase-01-refonte-landing-v2/01-SPEC.md` (14 REQs lockés)
- CONTEXT: `.planning/phases/phase-01-refonte-landing-v2/01-CONTEXT.md` (12 locked decisions)
- RESEARCH: `.planning/phases/phase-01-refonte-landing-v2/01-RESEARCH.md`
- Skill: `.claude/skills/sketch-findings-landing-system-audit-noshows/`

---

### Phase 2 · Refonte Audit (stepped reveal)

**Status:** ✅ SPEC locké · 14 REQs
**Goal:** Remplacer `app/audit/page.tsx` par un stepped reveal 5-6 steps
en direction clinique Apple Health, conformément aux sketches 001-004
validés et au skill `sketch-findings-system-audit-noshows`.

**SPEC:** `.planning/phases/phase-02-refonte-audit-v2/02-SPEC.md`
**Ambiguity:** 0.1025 (gate ✓)
**Next:** `/gsd-discuss-phase 2` pour les décisions d'implémentation

**Depends on:** DEP-2.5 (n8n `stats_par_mois[]` — livré par phase 3,
sinon step 04 supprimé du parcours et on passe à 5 steps)

---

### Phase 3 · Extension n8n WF12 (`stats_par_mois[]`)

**Status:** 📝 à spec
**Goal:** Étendre le workflow n8n WF12 pour grouper le CSV Doctolib par
mois et exposer `stats_par_mois: { mois: string; taux: number;
no_shows: number }[]` dans le payload retourné. Débloque le step 04
"Tendance 6 mois" de la phase 2.

**Scope:** modification du workflow n8n côté `n8n.srv939707.hstgr.cloud`,
pas de code frontend dans cette phase (juste la prise en compte du
nouveau champ dans `types/audit.ts`).

**Peut être fait en parallèle de phase 2** si les deux développements
avancent en coordination. Si non livré avant la mise en prod de phase
2, le step 04 est simplement désactivé (fallback à 5 steps).

---

### Phase 4 · Intégration Google Places API

**Status:** 📝 à spec
**Goal:** Ajouter le bloc "Diagnostic Google" mentionné dans PRD_V2.
Intégration Google Places API (clé côté serveur), champ nom de
cabinet → fetch note Google + nombre d'avis + benchmark secteur, mise
à jour du score global de /50 vers /100 en intégrant le volet Google.

**Acceptance global :**
- Step 05 audit affiche `X / 100` si Google analysé, `X / 50` sinon
- Fallback gracieux : si Google Places échoue, rapport complet s'affiche sans le volet Google
- Clé API serveur uniquement (`app/api/google/route.ts` ou équivalent)
- Bouton "Analyser aussi mes avis Google" dans le step 05

**Depends on:** phase 2 livrée (le step Google se plugge sur le
stepped reveal)

---

### Phase 5 · RGPD & Sécurité

**Status:** 📝 à spec
**Goal:** Durcir la conformité RGPD et la sécurité du pipeline
(données de santé Art. 9).

**Scope prévisionnel :**
- Validation CSV côté serveur (`app/api/audit/route.ts`) : taille max, mime type, colonnes obligatoires, rejet si anomalie
- Logs serveur nettoyés (aucune donnée sensible dans les logs Vercel)
- Mention RGPD visible dans le flow utilisateur (landing + audit)
- Page politique confidentialité / mentions légales
- DPA (Data Processing Agreement) avec Hostinger/Vercel si nécessaire
- Audit rapide de la surface d'attaque (CSRF, rate limiting upload)

---

### Phase 6 · Infra tests (Vitest + Playwright)

**Status:** 📝 à spec
**Goal:** Mettre en place l'infra de test minimum pour figer les
invariants métier avant deploy prod.

**Scope prévisionnel :**
- Vitest unit : `calcScore`/normalization n8n (3 shapes), money build
  math, formules benchmarks
- Playwright e2e : parcours complet landing → upload CSV → 6 steps
  reveal → CTA Calendly (mock)
- **Tests de régression `ca_perdu`** : mandatory — guard que le frontend
  ne re-multiplie jamais
- Script npm `test`, `test:e2e` + intégration CI basique

---

### Phase 7 · Déploiement production v2

**Status:** 📝 à spec
**Goal:** Mise en production de la v2 complète (landing + audit
refondus + Google + RGPD + tests verts).

**Scope prévisionnel :**
- Smoke test sur preview Vercel
- Backup de la v1 en prod (branche `v1-backup`)
- Déploiement progressif (optionnel : feature flag)
- Rollback plan documenté
- Communication utilisateurs existants (email si applicable)
- Vérification domaine `audit.perfiamatic.fr` OK

---

### Phase 8 · Monitoring & Analytics

**Status:** 📝 à spec
**Goal:** Instrumenter le funnel v2 pour mesurer la conversion réelle
et détecter les régressions.

**Scope prévisionnel :**
- Events clés : `landing_view`, `audit_upload`, `step_0N_reached`,
  `cta_calendly_click`, `google_diagnostic_triggered`
- Stack analytics (Vercel Analytics, Plausible, ou équivalent
  RGPD-friendly — pas Google Analytics côté EU)
- Dashboard conversion simple (funnel landing → RDV Calendly)
- Alertes sur erreurs `/api/audit` (Sentry ou logs Vercel)

---

## Phases candidates / backlog (non retenues dans v2.0)

- **PDF refonte clinique** — aligner `RapportPDF.tsx` sur la direction
  Apple Health. Hors scope v2.0 (le PDF dark/gold existant reste).
  Candidat milestone v2.1+.
- **Cleanup landings** (suppression `landing.html` / `landing-preview.html`
  / `mockup.html`) — intégré dans phase 1 (la refonte les rend obsolètes,
  on les supprime en fin de phase 1).

---

## Dépendances critiques inter-phases

| Dep | Description | Blocking |
|---|---|---|
| DEP-2.5 | phase 3 (n8n `stats_par_mois[]`) débloque step 04 phase 2 | Non bloquant (fallback 5 steps) |
| DEP-4.phase2 | phase 4 (Google) dépend du stepped reveal phase 2 | Oui |
| DEP-6.features | phase 6 (tests) après feature freeze phases 1-4 | Oui |
| DEP-7.all | phase 7 (deploy) après phases 1-6 vertes | Oui |

---

## Ordre d'exécution recommandé

```
Phase 1 (Landing)  ──┐
                     ├──→  Phase 4 (Google)  ──┐
Phase 2 (Audit)   ──┤                          │
                     │                          ├──→  Phase 6 (Tests) ──→ Phase 7 (Deploy) ──→ Phase 8 (Monitoring)
Phase 3 (n8n)     ──┘                          │
                                                │
Phase 5 (RGPD)    ────────────────────────────┘
```

Phases 1-3 peuvent avancer en parallèle ; phase 4 attend phase 2 ;
phase 5 peut avancer en parallèle ; phase 6 après feature freeze ;
phases 7-8 séquentiels en fin.
