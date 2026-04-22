# REQUIREMENTS — v2.0 Finalisation

Les requirements de chaque phase vivent dans leur `SPEC.md` (falsifiables,
acceptance criteria explicites). Ce fichier liste les grandes capacités
attendues pour le milestone.

## REQ-1 · Page résultats refondue (stepped reveal)

Remplacer l'actuelle `app/audit/page.tsx` (scroll continu dark) par un
stepped reveal de 6 steps en direction clinique Apple Health. Chaque step
affiche un graphique contextuel. Le praticien progresse via bouton
"Continuer →", une section = un écran. Voir sketches 001-004.

→ SPEC détaillé : `phase-01-SPEC.md`

## REQ-2 · Diagnostic Google optionnel

Intégrer un bloc "Diagnostic Google" déclenchable à la demande (Google Places
API côté serveur). Fallback gracieux si Google absent (score partiel /50 avec
mention explicite).

→ SPEC détaillé : phase 2

## REQ-3 · CTA Calendly unique avec reassurance

Un seul CTA Calendly en fin de parcours (step 06), avec les 3 micro-signaux
de reassurance obligatoires : ⏱ créneau sous 48h · 🔒 RGPD · 📎 plan remis
même sans achat.

→ SPEC détaillé : phase 1 (intégré step 06)

## REQ-4 · Conformité RGPD renforcée

Aucun nom de patient dans les graphes/synthèse. Validation CSV côté serveur.
Logs sans données sensibles. Mention RGPD visible.

→ SPEC détaillé : phase 3

## REQ-5 · Cohérence mobile

Stepped reveal fonctionnel en mobile (<860px) avec stacking vertical des
split views, responsive des graphes SVG.

→ SPEC détaillé : phase 1 (intégré)

---

## Invariants projet (non-négociables, héritent depuis PROJECT.md)

- `ca_perdu` déjà annualisé par n8n → ne jamais re-multiplier côté front
- Clé Google Places API côté serveur uniquement
- Rapport complet affiché en < 60 secondes
- Conformité RGPD stricte (données de santé Art. 9)
- Aucun patient nommé dans les visualisations
