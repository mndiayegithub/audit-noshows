# ROADMAP — Audit No-Shows v2

## Milestone actif : v2.0 — Finalisation (démarré 2026-04-22)

**Stratégie :** refondre le funnel complet (landing → audit) en direction
clinique cohérente, ajouter les capacités manquantes (Google Places,
RGPD renforcé), sécuriser le delivery (tests, deploy, monitoring).

---

### Phase 1 · Refonte Landing page (clinique-claire v2)

**Status:** 📝 À spec (pivot DA 2026-04-23 — v1 dark-premium archivé)
**Goal:** Remplacer `app/page.tsx` par une landing en direction **clinique-claire**
(rapport d'expertise comptable moderne — `bg-gray-50`, Inter + Fraunces, primary
vert sapin `#064E3B`, 4 KPI pastels sémantiques figés Volume/Signal/Taux/Argent).
Brand placeholder **GetLostRevenue**. 5 sections issues des sketches 001–004
validés : Sticky nav + Hero interrogatif (001 C) → Stats + Pour qui (002 B) →
Timeline tricolore + Score pill (003 C) → Témoignage + FAQ cards + CTA
primary-dark (004 B) → Footer. CTA unique `/audit`. **Pas de dark mode**, pas de
glass, pas de néon.

**Sources of truth:**
- `new_design.md` — spec DA complète
- `new_design_audit.html` — maquette Google Stitch validée
- `.planning/sketches/001-*` à `004-*` — 4 sketches landing validés
- `.claude/skills/sketch-findings-landing-system-audit-noshows/` — skill auto-load

**Archivé:** `.planning/phases/_archive_v1-dark/phase-01-refonte-landing-v1/`

**Plans:** 6 plans

Plans:
- [ ] 01-01-PLAN.md — Foundations: tailwind tokens + globals.css + layout (Inter+Fraunces, bg-gray-50)
- [ ] 01-02-PLAN.md — LandingNav + LandingHero + MiniDashboard (sketch 001 C)
- [ ] 01-03-PLAN.md — StatsBar + TargetGrid + HowItWorksTimeline + ValueProps + ScorePill (sketches 002 B & 003 C)
- [ ] 01-04-PLAN.md — Testimonial + FAQCards + CTABand + LandingFooter (sketch 004 B)
- [ ] 01-05-PLAN.md — Orchestrate app/page.tsx + ScrollFadeUp + build + Lighthouse
- [ ] 01-06-PLAN.md — UAT /gsd-verify-work checkpoint

**Next:** `/gsd-execute-phase 1` (4 waves: Wave 1 foundations → Waves 2 composants (02/03/04 parallèles) → Wave 3 orchestration → Wave 4 UAT).

---

### Phase 2 · Refonte Audit (dashboard clinique-claire v2)

**Status:** 🗂️ Plans créés (7 plans, 5 waves) — ready for /gsd-execute-phase 2
**Goal:** Remplacer `app/audit/page.tsx` par un **tableau de bord navigable**
(sidebar 240 px + 5 sections scrollables avec scrollspy), direction clinique-claire.
Les 5 sections issues des sketches 005–009 validés :
1. Synthèse — 4 KPI pastels grille égale (006 A)
2. Manque à gagner — card violet plein `#6B21A8` + breakdown inline (007 A)
3. Où & Quand — bars par jour émeraude + bars par heure orange côte à côte (008 B)
4. Score cabinet — hero primary-dark `#064E3B` + ring blanc (009 C)
5. Plan d'action timeline tricolore + Calendly embed inline (009 C)

Architecture sidebar validée en 005 A (classic 240 px + bloc infos cabinet + 5 liens pastilles + CTA bas).

**Règle critique:** `ca_perdu` est déjà annualisé par n8n — jamais remultiplier.

**Sources of truth:**
- `new_design.md` — spec DA complète
- `.planning/sketches/005-*` à `009-*` — 5 sketches audit validés
- `.claude/skills/sketch-findings-audit-system-audit-noshows/` — skill auto-load

**Archivé:** `.planning/phases/_archive_v1-dark/phase-02-refonte-audit-v1/`

**Depends on:** DEP-2.5 (n8n `stats_par_mois[]` — livré par phase 3, sinon angle
"tendance 6 mois" non ajouté au dashboard)

**Plans:** 7 plans

Plans:
- [x] 02-01-PLAN.md — Scaffolding (layout light, score helper, tokens audit)
- [x] 02-02-PLAN.md — Dashboard shell (sidebar + scrollspy + AuditSection wrapper + page wiring)
- [ ] 02-03-PLAN.md — Section 1 Synthèse + Section 2 Manque à gagner (violet-plein, ca_perdu verbatim)
- [ ] 02-04-PLAN.md — Section 3 Où & Quand (ChartParJour + ChartParHeure, DOM bars)
- [ ] 02-05-PLAN.md — Section 4 Score + Section 5 Plan + Calendly
- [ ] 02-06-PLAN.md — Cleanup (delete v1 Gauge/Graphique/Score) + RapportPDF refonte light
- [ ] 02-07-PLAN.md — UAT checkpoint (visual + a11y + responsive + ca_perdu invariant)

**Next:** `/gsd-execute-phase 2`

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
