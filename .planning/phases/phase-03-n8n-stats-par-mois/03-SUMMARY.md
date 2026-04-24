# Phase 3 — SUMMARY (Plan 03-01)

**Status :** ✅ Code livré / 🟡 **action utilisateur requise** (import manuel n8n)
**Date close-out :** 2026-04-24
**Spec :** `03-SPEC.md` (5 requirements, ambiguity 0.08)
**Plan :** `03-01-PLAN.md` (3 tasks séquentielles)

## Livrables

| # | Artefact                                                              | Statut    | Commit    |
|---|------------------------------------------------------------------------|-----------|-----------|
| 1 | `n8n-code-node-stats-par-mois.js` (self-contained, smoke-testé 4 cas) | ✅ commit  | `e6faca2` |
| 2 | `types/audit.ts` — champ optionnel `stats_par_mois?:` ajouté          | ✅ build OK| `da75f6d` |
| 3 | Instructions d'import (ce fichier)                                     | ✅ ce doc  | (à venir) |

**Build :** `npm run build` exit 0. Bundle `/audit` inchangé (71 kB / 196 kB).

## Smoke tests passés (mental)

| Cas                              | Attendu                                     | Obtenu |
|----------------------------------|---------------------------------------------|--------|
| CSV vide                         | `[]`                                        | ✅     |
| 3 lignes même mois (nov 2025)    | 1 bucket `{total_rdv:3, no_shows:1, taux:33.3}` | ✅ |
| nov+déc 2025 + fév 2026 (gap)    | 4 buckets dont `2026-01` à zéros            | ✅     |
| Format FR `DD/MM/YYYY` (Doctolib)| Bucket correctement extrait via regex       | ✅     |

Couvre les acceptance criteria 4-6 du SPEC.

---

## 🟡 User Action Required — Import du nœud dans n8n

**Workflow cible :** `Audit Flash No-Shows - Cabinets Dentaires`
**ID n8n :** `Hc3aGjSuNjd4KVuu`
**Console :** https://n8n.srv939707.hstgr.cloud
**Statut workflow :** `active: true` (production)

### Étapes (~3 min)

1. **Ouvrir le workflow** `Audit Flash No-Shows - Cabinets Dentaires` dans la console n8n.
2. **Désactiver temporairement** le toggle "Active" (top-right) pour éviter qu'une exécution prod tombe pendant le rewiring.
3. **Identifier le nœud `Calculer Statistiques`** (Code, position [480, 0]) et le nœud `AI Agent` qui le suit.
4. **Ajouter un nouveau nœud Code** entre les deux :
   - Click-droit sur la connexion `Calculer Statistiques → AI Agent` → "Add node"
   - Type : **Code** (n8n-nodes-base.code)
   - Mode : **Run Once for All Items** (default)
   - Language : **JavaScript** (default)
   - **Nommer le nœud exactement : `Aggregate Par Mois`**
5. **Coller le contenu** de `.planning/phases/phase-03-n8n-stats-par-mois/n8n-code-node-stats-par-mois.js` dans le champ "JavaScript Code".
6. **Vérifier les connexions** :
   - Input : `Calculer Statistiques (main)` → `Aggregate Par Mois (main)`
   - Output : `Aggregate Par Mois (main)` → `AI Agent (main)`
7. **Sauvegarder** (Ctrl+S).
8. **Test :** "Execute Workflow" avec un CSV multi-mois (≥ 3 mois distincts) :
   - Soit via "Test workflow" + injection CSV manuelle
   - Soit en envoyant une requête réelle au webhook `/audit-flash` depuis l'app Next.js
9. **Vérifier dans la sortie de `Aggregate Par Mois`** :
   - [ ] `stats.stats_par_mois` est présent
   - [ ] Tableau trié ascendant (`mois` lexicographique YYYY-MM)
   - [ ] Longueur cohérente (= nb mois calendaires couverts par le CSV, gaps inclus)
   - [ ] `stats.global.ca_perdu_an` **identique** à la valeur d'avant l'ajout (invariant)
   - [ ] Aucun bucket ne contient de champ `ca_*` (uniquement `mois`, `total_rdv`, `no_shows`, `taux`)
10. **Réactiver** le toggle "Active" du workflow.

### Optionnel — Traçabilité repo

Une fois le workflow modifié, exporter le JSON et le commiter :
```bash
# Via n8n UI : workflow menu (•••) → "Download" → enregistrer sous :
.planning/phases/phase-03-n8n-stats-par-mois/WF12-audit-flash.json
git add .planning/phases/phase-03-n8n-stats-par-mois/WF12-audit-flash.json
git commit -m "chore(03/n8n): snapshot WF12 audit-flash with stats_par_mois node"
```

### Rollback

Si problème : rouvrir le workflow, **supprimer le nœud `Aggregate Par Mois`**, reconnecter directement `Calculer Statistiques → AI Agent`. Aucun champ existant n'a été modifié, donc rollback = retrait pur.

---

## Décisions clés (rappel CONTEXT)

- **D-05** : pas de `ca_perdu_mois` par bucket — risque de ré-annualisation, backlog.
- **D-08** : bucketing lexicographique sans conversion timezone (les dates Doctolib sont déjà Europe/Paris en string).
- **D-10** : phase backend-only — aucun composant React ne consomme `stats_par_mois` (vérifié : `grep -r stats_par_mois components/` → 0).

## Suite

- Phase ultérieure : composant "Tendance 6 mois" qui consommera `stats.stats_par_mois`.
- En attendant, le champ traverse passivement le proxy `app/api/audit/route.ts` (aucune modif requise) et est typé `optional` côté frontend.

---

*Phase 3 closed: 2026-04-24 — pending user action #1 (import nœud n8n).*
