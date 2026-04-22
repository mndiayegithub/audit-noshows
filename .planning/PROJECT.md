# PROJECT — Audit No-Shows (PerfIAmatic)

## Identity

- **Name:** Audit de Performance du Cabinet
- **Product:** PerfIAmatic — Audit gratuit (funnel entry)
- **Domain:** B2B SaaS / outil d'acquisition pour cabinets dentaires
- **Owner:** Mansour Ndiaye (mndiaye@perfiamatic.fr)
- **URL cible:** audit.perfiamatic.fr

## Vision

Point d'entrée du funnel commercial PerfIAmatic. Le praticien dentaire
uploade son export CSV Doctolib et reçoit en moins de 60 secondes un
rapport personnalisé qui chiffre ses pertes invisibles. Objectif produit :
générer suffisamment d'inconfort factuel (données issues de son propre
CSV + signaux Google) pour transformer le prospect en RDV Calendly.

**Principe directeur :** chaque section du rapport doit créer plus
d'inconfort que la précédente. Le rapport ne propose jamais la solution —
il montre uniquement l'ampleur du problème. La solution est vendue en RDV.

## Users

- **Primaire :** dentiste libéral / gérant de cabinet dentaire en France
- **Secondaire :** assistant·e dentaire qui exporte le CSV
- **Volume cible v2 :** 100-500 audits/mois

## Scope (v2 — Finalisation)

**Dans le scope :**
1. Upgrade de la page résultats : 5 sections chaînées
   - Section 1 — Chiffre qui fait mal (CA perdu annuel, 3 KPI)
   - Section 2 — Détail no-shows (graphique par jour)
   - Section 3 — Diagnostic Google (optionnel, post-déclenchement)
   - Section 4 — Score global (sur 100 si Google, sur 50 sinon)
   - Section 5 — CTA unique Calendly
2. Intégration Google Places API (note + nombre d'avis + benchmark)
3. Calcul du score global selon règles PRD (no-shows + Google)
4. CTA Calendly avec pré-remplissage email
5. Email récap post-rapport avec indicateurs
6. Responsive mobile sans scroll horizontal

**Hors scope (ne pas toucher) :**
- Page d'upload CSV existante
- Workflow n8n WF12 (parsing)
- URL audit.perfiamatic.fr
- SMTP d'envoi email

## Stack

- **Frontend:** Next.js 14 App Router, TypeScript strict, Tailwind v3
- **Charts:** Chart.js, Framer Motion
- **PDF:** @react-pdf/renderer (client-side)
- **Backend:** proxy Next.js `/api/audit` → n8n self-hosted (Hostinger)
- **IA:** Claude API (via n8n WF12)
- **À ajouter v2:** Google Places API (clé côté serveur uniquement)

## Key Invariants (non négociables)

1. `ca_perdu` / `ca_perdu_an` est déjà annualisé par n8n — **ne jamais multiplier côté frontend**.
2. Temps total upload → rapport affiché < 60 secondes.
3. Clé Google Places API jamais exposée côté client.
4. Fallback gracieux : si Google Places échoue, rapport s'affiche sans Section 3.
5. Aucun nom patient persisté côté Vercel/PerfIAmatic (RGPD — données de santé Art. 9).
6. Données métier en français (`Etat`, `formulaire`, `ca_perdu`). Technique en anglais.

## Current State (avant Finalisation)

- v1 en production : analyse no-shows uniquement, score satisfaction 9.7/10 sur 7 tests
- Dépôt sur `main` avec ~23 fichiers modifiés uncommitted (chantier v2 en cours)
- 3 variantes de landing coexistent : `app/page.tsx`, `landing.html`, `landing-preview.html`, `mockup.html`
- Zéro tests, pas de CI
- Codebase cartographiée dans `.planning/codebase/` (7 docs, 1203 lignes)

## Decisions

- **Monolith Next.js** (pas de séparation front/back) — vitesse d'itération
- **n8n externe comme "cerveau"** (parsing CSV + LLM) — évite d'embarquer Claude côté Vercel
- **PDF client-side** (@react-pdf/renderer) — acceptable pour v2, à réévaluer v3 si perf dégrade
- **localStorage zéro** côté audit — tout est éphémère, le rapport vit le temps de l'onglet

## Links

- PRD v2 source: `./PRD_V2.md`
- Guide Claude Code: `./CLAUDE.md`
- Codebase map: `.planning/codebase/*.md`
