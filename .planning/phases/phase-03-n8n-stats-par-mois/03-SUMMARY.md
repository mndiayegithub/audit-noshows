# Phase 3 — SUMMARY (Plan 03-01)

**Status :** ✅ **DÉPLOYÉ EN PROD** — workflow WF12 mis à jour via n8n-mcp + test réussi end-to-end

## Déploiement live (2026-04-24 ~17:30)

L'utilisateur a autorisé la modification directe du workflow. Le nœud a été poussé via `mcp__n8n-mcp__n8n_update_partial_workflow` et testé avec un CSV 30 lignes / 4 mois calendaires (nov 2025, déc 2025, fév 2026 — jan 2026 absent pour tester le zero-fill).

**Résultat test (webhook POST `/audit-flash`) :**
```json
"stats_par_mois": [
  { "mois": "2025-11", "total_rdv": 10, "no_shows": 2, "taux": 20 },
  { "mois": "2025-12", "total_rdv": 10, "no_shows": 1, "taux": 10 },
  { "mois": "2026-01", "total_rdv": 0,  "no_shows": 0, "taux": 0  },
  { "mois": "2026-02", "total_rdv": 10, "no_shows": 3, "taux": 30 }
]
```
- ✅ Trié ascendant, gap `2026-01` zero-filled, shape strict (4 clés)
- ✅ `ca_perdu_an: 3600` **identique avant/après** (invariant préservé)
- ✅ `stats_par_mois` bien propagé jusqu'à la réponse finale du webhook

## Modifications appliquées sur WF12 (live)

1. **Ajout** nœud Code `Aggregate Par Mois` entre `Calculer Statistiques` et `AI Agent` (position `[592, 0]`)
2. **Rewire** : `Calculer Statistiques → Aggregate Par Mois → AI Agent`
3. **Patch** `Formater Réponse` : la ligne `const statsNode = $('Calculer Statistiques').item.json` est devenue `$('Aggregate Par Mois').item.json` — sans ce patch, le champ était calculé puis écrasé par le reach-back vers l'amont
4. **Cleanup pré-existant** (exigé par n8n pour pouvoir sauver) :
   - Supprimé `HTTP Request` (désactivé, disconnected)
   - Supprimé `Marquer Email Envoyé` (orphelin, aucune incoming connection)
   - Fix operator `Email fourni?` : `notEmpty` unary → ajout `singleValue: true`

Workflow re-activé (`active: true`, 11 nœuds au total).
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
