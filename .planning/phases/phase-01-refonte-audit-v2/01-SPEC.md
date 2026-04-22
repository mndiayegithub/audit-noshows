# SPEC — Phase 1 · Refonte audit v2 (stepped reveal)

**Status:** locked · 2026-04-22
**Milestone:** v2.0 Finalisation
**Upstream artifacts:**
- `.planning/PROJECT.md` · identity, vision, invariants
- `.planning/REQUIREMENTS.md` · REQ-1, REQ-3, REQ-5 scope
- `.planning/ROADMAP.md` · phase 1 entry
- `.planning/sketches/MANIFEST.md` · 4 winners
- `.planning/sketches/WRAP-UP-SUMMARY.md`
- `.claude/skills/sketch-findings-system-audit-noshows/` · auto-loaded

## Goal (une phrase)

Remplacer `app/audit/page.tsx` (scroll continu dark) par un **stepped reveal
clinique Apple Health** de 5 ou 6 steps (selon tendance 6 mois), avec
graphique contextuel par step, CTA Calendly unique popup en fin, et restyle
cohérent du formulaire d'upload, conformément aux sketches 001-004 validés
et au skill `sketch-findings-system-audit-noshows`.

---

## Requirements (falsifiables)

### REQ-1.1 · Page audit refondue en stepped reveal

- **Current:** `app/audit/page.tsx` (708 lignes) — scroll continu dark, ScoreCard inline 270° gauge, rapport Markdown AI affiché, PDF download, composants dispersés
- **Target:** page unique stepped-reveal 5 ou 6 steps (voir REQ-1.4), un écran = une section, navigation via bouton `Continuer →`. Stepper top (dots progress). Palette/typo tokens conformes au skill (`--bg #F7F7F8`, `--text #1D1D1F`, `--red #FF3B30`, `--font-serif` pour chiffres-clés).
- **Acceptance:**
  - [ ] `app/audit/page.tsx` utilise 0 composant de l'ancien flow dark (pas de `ScoreCard`, `ScoreGlobal`, `GaugeBenchmark`, `GraphiqueParJour`, `DiagnosticGoogle` existants)
  - [ ] Stepper top affiche N dots, dont 1 `current` et 0-N `done`
  - [ ] Chaque step occupe la hauteur minimum de la viewport sans scroll interne sur desktop
  - [ ] Palette tokens appliquée — aucune couleur hors skill (grep — absence de `#0ea5e9`, `#8b5cf6`, `bg-navy`, `bg-surface` dans le rendu refondu)

### REQ-1.2 · Step 01 · Synthèse avec donut comparatif

- **Current:** n'existe pas
- **Target:** section d'accueil avec donut SVG (cabinet 14,2 % / secteur 4 % / top 10 % 1,8 %), légende 3 rows, lede contextuelle nommant le cabinet et le nombre de RDV analysés (`stats.nom_cabinet`, `stats.global.total_rdv`).
- **Acceptance:**
  - [ ] Donut SVG rendu avec 3 valeurs (votre cabinet · secteur · top 10 %)
  - [ ] `stats.nom_cabinet` et `stats.global.total_rdv` visibles dans la lede
  - [ ] Si `stats.benchmark.optimal` absent, fallback "4 %" hardcodé + "3-4 % moyenne France"

### REQ-1.3 · Step 02 · Money build + reveal latéral comparatif marché

- **Current:** n'existe pas
- **Target:** panneau gauche = money build animé (`stats.global.no_shows` / `stats.periode.nb_mois` × `stats.global.ca_moyen` × 12 = `stats.global.ca_perdu_an`), bouton noir flottant `Comparer au marché →`. Au clic, panneau droit révèle (transition 700ms `cubic-bezier(0.22, 1, 0.36, 1)`) : split "Votre cabinet / Top 10 %" + gap card noir "Écart à combler : X €".
- **Acceptance:**
  - [ ] 4 rows money-build affichés en ordre : créneaux/mois, × tarif, = perte mensuelle, = perte annualisée
  - [ ] La dernière row (`total`) affiche **exactement** `stats.global.ca_perdu_an` formatté français (espace insécable milliers, €)
  - [ ] **Aucune multiplication de `ca_perdu_an`** sur le frontend (grep — absence de `* 12`, `* (12 / nb_mois)`, `* nb_mois`)
  - [ ] Le reveal se déclenche au clic du bouton, tient sur une page, transition visible
  - [ ] Gap card calcule `ca_perdu_an − ca_top10_an` où `ca_top10_an = total_rdv × 0.018 × ca_moyen × (12 / nb_mois)` (benchmark 1,8 %)

### REQ-1.4 · Step 03 · Répartition par jour (bars)

- **Current:** `components/GraphiqueParJour.tsx` (124L, palette dark à supprimer)
- **Target:** nouveau composant bars horizontales style skill (`.bar-row`), rouge si `taux > stats.global.taux`, bleu sinon, couleur label jour selon seuil. Source : `stats.par_jour[]` (fallback `stats.stats_par_jour[]`).
- **Acceptance:**
  - [ ] Ordre des jours fixe : Lundi → Samedi
  - [ ] Largeur de barre = `no_shows / max(no_shows)` × 100 %
  - [ ] Barre rouge ssi `par_jour[i].taux > global.taux`
  - [ ] Valeur numérique affichée à droite de la barre (tabular-nums)
  - [ ] Headline dynamique : "Le {jour_pic} concentre {pct} % de vos no-shows"

### REQ-1.5 · Step 04 · Tendance 6 mois (conditionnel)

- **Current:** aucune donnée historique exposée par n8n WF12
- **Target:** sparkline SVG rouge ascendante avec gradient area (skill pattern line-chart), 6 points mensuels, headline "La situation s'aggrave depuis {mois}" si pente > 0.
- **Décision scope :** Step 04 **intégré dans phase 1 uniquement si** WF12 expose `stats.stats_par_mois: { mois: string; taux: number; no_shows: number }[]`. Sinon le parcours devient 5 steps (02-03 deviennent 03-04 et le step 04 actuel est supprimé).
- **Dépendance externe bloquante :** extension WF12 (tracked comme `DEP-1.5-n8n-mensuel`, hors scope code phase 1 mais bloque cette REQ).
- **Acceptance:**
  - [ ] Si `stats.stats_par_mois` présent : sparkline rendue, pente calculée, headline affichée
  - [ ] Si absent : step 04 supprimé, stepper passe à 5 dots, le step 05 devient step 04 dans le parcours utilisateur
  - [ ] Aucune donnée factice ou placeholder de tendance affichée

### REQ-1.6 · Step 05 · Score global (activity ring + sticky CTA)

- **Current:** `components/audit/ScoreGlobal.tsx` (194L) avec gauge 270°, et ScoreCard inline dans page.tsx
- **Target:** activity ring Apple-like 220px, score centré SF Pro 72px, couleur dynamique (vert ≥80 / orange 50-79 / rouge <50), breakdown 2 cards (no-shows /50, Google /50), pill CTA noire fixe en bas `Discutons de comment récupérer ces X € · Réserver un RDV →`.
- **Formule score :** `scoreNoShows = max(0, min(50, round(50 − taux × 1.6)))` (équivalent de l'actuel `calcScore` divisé par 2). `scoreGoogle = null` en phase 1 → score affiché "X / 50" avec mention "Score partiel — volet Google non analysé". Phase 2 ajoutera Google pour passer sur 100.
- **Acceptance:**
  - [ ] Ring SVG rendu, `stroke-dashoffset` calculé depuis le score
  - [ ] Couleur du ring respecte les seuils
  - [ ] 2 breakdown cards affichées, la 2ème (Google) en état "non analysé" avec lien `Lancer l'analyse` (href placeholder en phase 1)
  - [ ] Mention "Score partiel — volet Google non analysé" visible
  - [ ] Sticky CTA pill visible tant qu'on est sur step 05

### REQ-1.7 · Step 06 · Synthèse + CTA Calendly popup

- **Current:** `components/audit/CTACalendly.tsx` (83L)
- **Target:** split 2 colonnes — gauche blanc "Ce que votre CSV révèle" (4 signaux : CA perdu, taux no-show, jour critique, tendance — ce dernier caché si step 04 absent), droite noire "Ce que PerfIAmatic peut faire en 30 min" (4 items plan). Block CTA bas de colonne droite : `ca_perdu_an` serif XXL + bouton Calendly + reassurance.
- **Calendly mechanism :** popup JS SDK Calendly (`Calendly.initPopupWidget({ url, prefill: { email } })`). Email pré-rempli depuis le formulaire upload (stocké en sessionStorage ou passé via state React).
- **Reassurance obligatoire :** 3 micro-signaux — `⏱ Créneau sous 48h · 🔒 Conforme RGPD · 📎 Vous ressortez avec un plan d'action, même sans achat`.
- **Acceptance:**
  - [ ] Split rendu 2 colonnes sur desktop, stack vertical <860px
  - [ ] Colonne gauche affiche exactement 3 ou 4 signaux (selon step 04)
  - [ ] Colonne droite affiche les 4 items du plan 30 min
  - [ ] Clic sur "Réserver un RDV Calendly →" ouvre la popup Calendly (pas de redirect, pas d'iframe embed)
  - [ ] Email pré-rempli dans la popup Calendly (lecture du state ou sessionStorage)
  - [ ] Les 3 micro-signaux exacts sont présents sous le bouton (strict match)

### REQ-1.8 · Formulaire upload restyle

- **Current:** `app/audit/page.tsx` state `formulaire` — drop zone react-dropzone existante, styling dark
- **Target:** logique fonctionnelle préservée (dropzone, FormData POST `/api/audit`, `Etat` state machine), **palette et typo refondues** selon skill (blanc clinique, bouton bleu médical, drop zone border dashed `--border-strong`, titres SF Pro Display).
- **Acceptance:**
  - [ ] Drag-drop toujours fonctionnel, rejet fichiers non-CSV
  - [ ] Upload POST `/api/audit` inchangé (zéro régression API — voir REQ-1.11)
  - [ ] Palette conforme au skill, aucune classe `bg-navy`, `bg-primary` (dans le sens dark ancien), `bg-surface` résiduelle
  - [ ] État `loading` affiche un pattern cohérent avec la direction (pas de spinner coloré primary ancien)

### REQ-1.9 · Retrait du `rapport_texte` de l'affichage web

- **Current:** `rapport_texte` (Markdown) rendu via `ReactMarkdown` + `remarkGfm` en milieu de page résultats
- **Target:** **aucun rendu** de `rapport_texte` sur le web. Le champ reste dans le payload API (`AuditResponse.rapport_texte`) et est injecté **uniquement dans le PDF** (voir REQ-1.10).
- **Acceptance:**
  - [ ] Grep — aucun `<ReactMarkdown>` ni `rapport_texte` dans le rendu de la page `/audit`
  - [ ] Imports `react-markdown` et `remark-gfm` retirés de `app/audit/page.tsx`
  - [ ] Champ `rapport_texte` continue d'arriver dans la réponse API (zéro régression côté n8n)

### REQ-1.10 · PDF préservé + narratif AI intégré

- **Current:** `components/audit/RapportPDF.tsx` (619L) — direction dark/gold, ne contient pas le `rapport_texte` AI
- **Target:** PDF conservé tel quel (dark/gold) en phase 1, avec **ajout d'une section** "Analyse détaillée" injectant le `rapport_texte` Markdown (rendu en texte simple — `@react-pdf/renderer` ne supporte pas Markdown nativement, splitter par `\n\n` suffit).
- **Acceptance:**
  - [ ] Le PDF télécharge toujours
  - [ ] Le PDF contient une nouvelle section "Analyse détaillée" avec le contenu de `rapport_texte`
  - [ ] Le style du PDF (palette dark/gold) reste inchangé — **refonte visuelle du PDF hors scope phase 1**

### REQ-1.11 · Zéro régression API `/api/audit`

- **Current:** `app/api/audit/route.ts` normalise 3 shapes n8n (array test / wrapped production / direct legacy). `maxDuration = 60`.
- **Target:** identique — **aucune modification** du route handler en phase 1.
- **Acceptance:**
  - [ ] `app/api/audit/route.ts` reste inchangé (git diff sur ce fichier doit être vide pour phase 1)
  - [ ] Test manuel : upload d'un CSV → réponse parsée correctement sur les 3 shapes (array, wrapped, direct)
  - [ ] `types/audit.ts` ajoute au plus `stats_par_mois?: []` (rétrocompatible)

### REQ-1.12 · Performance < 60s upload → premier step visible

- **Current:** non mesuré, mais `maxDuration = 60` de la route suggère ~30-50s typique
- **Target:** temps entre clic "Analyser" et rendu du step 01 < 60 secondes sur connexion 4G simulée.
- **Acceptance:**
  - [ ] Mesure chronométrée sur 3 CSV témoins (petit <500 RDV, moyen ~3000 RDV, gros >10000 RDV)
  - [ ] Tous ≤ 60 s sur Chrome DevTools Throttling "Fast 4G"
  - [ ] Le parsing/rendering des 6 steps (après réception des données) < 500 ms

### REQ-1.13 · Responsive mobile validé sur device réel

- **Target:** parcours complet utilisable en portrait sur iPhone (Safari) + Android (Chrome), pas juste DevTools emulator.
- **Acceptance:**
  - [ ] Aucun scroll horizontal sur device (tous les steps)
  - [ ] Step 02 reveal latéral bascule en stack vertical avec `max-height` animé
  - [ ] Step 06 split 2 colonnes stacke verticalement proprement (bordure-right → border-bottom)
  - [ ] Stepper top reste lisible (6 dots ne débordent pas)
  - [ ] CTA sticky pill (step 05) reste fixée en bas sans masquer le contenu
  - [ ] Test documenté : capture d'écran ou note "testé sur iPhone 14 Safari + Pixel 7 Chrome"

### REQ-1.14 · Composants obsolètes supprimés du code source

- **Current:** 5 composants orientés dark theme subsistent dans `components/` et `components/audit/`
- **Target:** après la refonte, ces composants ne sont plus référencés et sont supprimés.
- **Acceptance:**
  - [ ] `components/audit/ScoreGlobal.tsx` supprimé
  - [ ] `components/audit/DiagnosticGoogle.tsx` supprimé (sera remplacé en phase 2 par un composant clinique intégré au step 01/05)
  - [ ] `components/audit/CTACalendly.tsx` supprimé (logique intégrée inline dans le step 06 ou dans un nouveau composant `StepCTASynthese.tsx`)
  - [ ] `components/GaugeBenchmark.tsx` supprimé
  - [ ] `components/GraphiqueParJour.tsx` supprimé (remplacé par le composant `StepBarsParJour.tsx`)
  - [ ] `components/audit/RapportPDF.tsx` conservé avec modif REQ-1.10 uniquement

---

## Boundaries

### In scope (phase 1)

- Refonte complète de `app/audit/page.tsx` en stepped reveal 5 ou 6 steps
- Création des nouveaux composants de step (ex. `components/audit/StepSynthese.tsx`, `StepMoneyBuildReveal.tsx`, `StepBarsParJour.tsx`, `StepTendance.tsx`, `StepScoreRing.tsx`, `StepSyntheseCTA.tsx`, `Stepper.tsx`)
- Application du theme clinique (tokens dans `app/globals.css` ou config Tailwind)
- Restyle du formulaire d'upload CSV (état `formulaire`)
- Retrait de `rapport_texte` du rendu web
- Injection de `rapport_texte` dans le PDF (section "Analyse détaillée", texte simple)
- Suppression des composants dark obsolètes
- Calendly popup avec pré-remplissage email
- Tests manuels de performance (3 CSV) et responsive (2 devices réels)

### Out of scope (phase 1)

- **Intégration Google Places API** (phase 2) — le step 05 affiche "— / 50 · Non analysé" en phase 1
- **Conformité RGPD renforcée** (phase 3) — validation CSV serveur, logs, audit complet
- **Modification de `app/api/audit/route.ts`** — le proxy reste identique
- **Refonte visuelle du PDF** (`RapportPDF.tsx`) — dark/gold conservé, ajout du narratif seulement
- **Modifications du workflow n8n WF12** — sauf ajout du champ `stats_par_mois[]` qui est **tracké comme dépendance externe** (DEP-1.5) mais pas réalisé dans le code de cette phase
- **Landing page** (`app/page.tsx`, `landing.html`, `landing-preview.html`, `mockup.html`) — direction visuelle distincte, scope séparé
- **Tests unitaires / e2e** formels — tests manuels seulement en phase 1, infra test arrive en phase 3
- **Rolling deploy / feature flag** — remplacement direct (backup `main` via branche avant merge)
- **Internationalisation** — français uniquement, inchangé
- **Auth / compte utilisateur** — zéro session persistée, inchangé

### Dependencies

- **DEP-1.5** (externe, bloquante pour step 04 uniquement) : extension n8n WF12 pour exposer `stats.stats_par_mois: { mois: string; taux: number; no_shows: number }[]` calculé en regroupant le CSV par mois. Si non livré avant la mise en prod phase 1, step 04 est supprimé du parcours (5 steps au lieu de 6).
- **DEP-1.7** (externe, non bloquante) : clé API Calendly valide + URL du calendrier cible. À vérifier dans `.env` (`NEXT_PUBLIC_CALENDLY_URL` à ajouter).

---

## Constraints

- **Langage UI :** français (identifiants métier en français — `Etat`, `ca_perdu`, `formulaire` — identifiants techniques en anglais)
- **Invariant métier :** `ca_perdu_an` déjà annualisé côté n8n — jamais re-multiplier côté front
- **Sécurité :** clé Google Places API (future phase 2) jamais côté client
- **RGPD :** zéro nom patient rendu dans les visualisations ou le narratif
- **Performance :** rapport complet < 60s, rendering post-API < 500ms
- **Accessibilité :** contrastes WCAG AA minimum (`--text` sur `--bg` = 16.3:1 ✓, `--red` sur blanc = 4.1:1 ✓ à surveiller sur petits textes)
- **Pas de lib lourde** de transitions JS — CSS/SVG natif + Framer Motion déjà installé si besoin
- **Pas de changement de stack** — Next.js 14, Tailwind v3, TypeScript strict, Chart.js optionnel (probablement supprimable si tous les graphs sont SVG inline)

---

## Ambiguity Report

| Dimension | Score final | Min | Status |
|---|---|---|---|
| Goal Clarity | 0.95 | 0.75 | ✓ |
| Boundary Clarity | 0.90 | 0.70 | ✓ |
| Constraint Clarity | 0.85 | 0.65 | ✓ |
| Acceptance Criteria | 0.85 | 0.70 | ✓ |
| **Ambiguity** | **0.1025** | **≤ 0.20** | **✓ gate passed** |

**Gaps résiduels :**
- Aucun gap bloquant. Les REQs sont falsifiables et pass/fail.
- Le traitement précis de l'email (sessionStorage vs state vs prop drilling) pour Calendly pré-remplissage est laissé à discuss-phase.
- Le détail des 4 items du plan RDV (step 06) peut être affiné en copy review.

---

## Next step

`/gsd-discuss-phase 1` — traitera les décisions d'implémentation (architecture des composants, état global, Calendly integration technique, gestion du email prefill, Chart.js stay or go, etc.) à partir de ce SPEC.

**Requirements lockées :** 14 (REQ-1.1 à REQ-1.14)
