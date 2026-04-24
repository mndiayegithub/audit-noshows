# Phase 3: Extension n8n WF12 (`stats_par_mois[]`) — Context

**Gathered:** 2026-04-24
**Status:** Ready for planning
**Mode:** auto (7 gray areas decided by Claude from project conventions)

<domain>
## Phase Boundary

Étendre le workflow n8n **audit-flash / WF12** hébergé sur `n8n.srv939707.hstgr.cloud` pour grouper les lignes du CSV Doctolib uploadé par **mois calendaire** et exposer un nouveau champ `stats_par_mois: { mois: string; total_rdv: number; no_shows: number; taux: number }[]` dans la payload retournée à `/api/audit`.

Côté frontend : **un seul fichier touché** — `types/audit.ts` — pour typer le champ optionnel. Aucun composant React consommé dans cette phase : la visualisation "Tendance 6 mois" est explicitement reportée (phase ultérieure ou retravail Phase 2).

**Hors scope :**
- Tout composant de visualisation consommant `stats_par_mois` (`ChartTendanceMois`, etc.)
- Modification du contrat proxy dans `app/api/audit/route.ts` (la normalisation des 3 shapes reste identique, le champ traverse passivement)
- Backfill des audits historiques (le champ n'apparaît que sur les nouveaux appels post-déploiement)
- Refonte d'autres champs existants de `stats` (seul ajout additif)
- Annualisation côté n8n du CA perdu mensuel (règle métier `ca_perdu_an` déjà annualisé reste intouchée)

</domain>

<decisions>
## Implementation Decisions

### Accès au workflow n8n
- **D-01:** Édition via **UI web n8n** (`n8n.srv939707.hstgr.cloud`) en premier recours, avec export JSON du workflow modifié versionné dans `04_Scripts_Workflows/` (workspace racine) ou `.planning/phases/phase-03-n8n-stats-par-mois/WF12-audit-flash.json` pour traçabilité. *[auto: le MCP `mcp-n8n` existe dans `08_Projets_Dev/mcp-n8n/` mais n'est pas attaché à ce projet Claude Code — l'UI web est accessible immédiatement et le JSON exporté fait office de source-of-truth versionnée.]*
- **D-02:** Fallback optionnel : si l'utilisateur attache `mcp-n8n` via `/mcp` au cours de la phase, basculer sur l'API n8n (`POST /workflows/:id` + `POST /workflows/:id/activate`) pour édition automatisée. Sinon UI web + export manuel.

### Structure du champ `stats_par_mois`
- **D-03:** Shape : `{ mois: string; total_rdv: number; no_shows: number; taux: number }[]`. On ajoute `total_rdv` (absent du ROADMAP) pour contexte de lecture côté UI future et cohérence avec `stats.par_jour[]` qui porte déjà `total_rdv`. `taux` en pourcentage décimal (ex: `12.4`) comme `stats.global.taux`. *[auto: cohérence avec le schéma existant `par_jour`, évite une division dans le frontend plus tard.]*
- **D-04:** Format `mois` : **ISO court `YYYY-MM`** (ex: `"2025-11"`, `"2026-01"`). Trié ascendant. *[auto: format lexicographiquement triable, locale-agnostique, facile à formatter côté React avec `Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' })` sans parsing fragile.]*
- **D-05:** **Pas de `ca_perdu_mois`** dans chaque bucket — le champ existe déjà au niveau `stats.global.ca_perdu_mois` (moyenne) ; recalculer par mois dupliquerait la logique métier sensible et ferait dériver la règle "`ca_perdu_an` déjà annualisé". Si nécessaire, ajouter en phase ultérieure. *[auto: protège l'invariant métier critique.]*

### Fenêtre de mois et gaps
- **D-06:** Fenêtre = **tous les mois couverts par le CSV uploadé**, bornée par la première et la dernière date de RDV du fichier. Pas de limitation arbitraire à 6 ou 12 mois côté n8n. Le frontend slicera si besoin. *[auto: n8n reste pur backend/agnostique ; la décision d'affichage "6 derniers mois" appartient à la phase UI qui consommera.]*
- **D-07:** **Mois sans RDV = bucket rempli avec zéros** (`total_rdv: 0, no_shows: 0, taux: 0`). Garantit une série continue, simplifie tout rendu trend (barres/courbe) côté front. *[auto: alternative "skip" forcerait le front à interpoler, source de bugs visuels.]*

### Groupement et timezone
- **D-08:** Bucketing par `date_rdv.slice(0, 7)` (partie `YYYY-MM` de la chaîne ISO brute Doctolib), **sans conversion timezone**. Doctolib exporte des dates locales Europe/Paris ; réinterpréter en UTC décalerait les RDV de fin de mois à 23h vers le mois suivant. *[auto: cohérent avec le reste du workflow WF12 qui traite les dates en string brut.]*

### Typage frontend
- **D-09:** Ajouter dans `types/audit.ts` :
  ```ts
  stats_par_mois?: Array<{
    mois: string;       // "YYYY-MM"
    total_rdv: number;
    no_shows: number;
    taux: number;       // %
  }>;
  ```
  Dans `AuditStats`, **champ optionnel** (`?`) pour rétrocompat avec audits historiques qui ne l'auront pas. *[auto: additif non-breaking.]*

### Validation & tests
- **D-10:** Test manuel post-modif : uploader `06_Documentation/sample-doctolib.csv` (ou un CSV test) via `/audit`, inspecter `stats.stats_par_mois` dans la réponse DevTools. Critère : tableau non vide, longueur = `periode.nb_mois`, somme de `no_shows` sur tous les buckets ≈ `stats.global.no_shows` (tolérance 0). *[auto: aucune suite de tests Vitest/Playwright prévue avant Phase 6, validation manuelle suffisante pour une phase backend de ~1 node n8n modifié.]*

### Claude's Discretion
- Node n8n précis à utiliser (Code JS vs. Function vs. Set + expression) — laissé au planner après exploration du workflow.
- Nommage exact du champ si collision détectée lors de l'inspection du workflow actuel.
- Gestion des erreurs dans le node (try/catch autour du groupement, fallback `[]` si parsing échoue).

</decisions>

<specifics>
## Specific Ideas

- Le champ `stats_par_mois` doit traverser **sans modification** le proxy `app/api/audit/route.ts`. La normalisation des 3 shapes (array test mode / wrapped output / direct) déjà en place le préservera — vérifier juste que la structure `output.stats` reste le conteneur.
- Format `mois` "YYYY-MM" a été choisi en anticipation d'une future UI qui affichera "janv. 2026" via `Intl.DateTimeFormat` locale-aware, sans que n8n ait à connaître le locale du visiteur.
- Garder l'ordre des champs stable dans chaque bucket (`mois` → `total_rdv` → `no_shows` → `taux`) pour lisibilité en debug.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Contrat n8n ↔ frontend
- `app/api/audit/route.ts` — Proxy Next.js ; lignes 37-65 : normalisation des 3 shapes de réponse n8n (array / `{output: {...}}` / direct). Le nouveau champ doit traverser sans modification.
- `types/audit.ts` — Définition actuelle de `AuditStats` et `AuditResponse` ; seul fichier à modifier côté repo.
- `CLAUDE.md` (racine repo) §"Key Business Rule" — Règle métier critique : `ca_perdu` / `ca_perdu_an` **jamais remultiplier côté frontend**. Phase 3 ne doit pas introduire un champ qui violerait cette règle (d'où D-05).

### Roadmap et phase context
- `.planning/ROADMAP.md` §"Phase 3 · Extension n8n WF12" — Goal, scope, dépendance DEP-2.5.
- `.planning/phases/phase-02-refonte-audit-v2/02-SPEC.md` — Confirme que Phase 2 ne consomme pas `stats_par_mois` ("éviter tout angle tendance 6 mois absent").

### Workspace n8n
- `../mcp-n8n/README.md` (workspace PerfIAmatic) — MCP server personnel avec 41 outils n8n, disponible si attaché via `/mcp` pendant l'exécution (D-02).
- Console n8n : `https://n8n.srv939707.hstgr.cloud` (accès UI manuel — D-01).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`types/audit.ts`** — Extension triviale en bout de l'interface `AuditStats`. Pattern déjà en place avec les champs optionnels `par_jour?`, `stats_par_jour?`, `stats_par_praticien?` — aligner sur cette convention.
- **`app/api/audit/route.ts`** — Proxy transparent, aucune modification nécessaire.

### Established Patterns
- Tous les champs issus de n8n portent des noms snake_case français (`no_shows`, `ca_perdu_an`, `stats_par_praticien`). Le nom `stats_par_mois` respecte la convention.
- Champs optionnels `?` pour tout ajout post-contrat initial — rétrocompat soft garantie.

### Integration Points
- **n8n workflow WF12 `audit-flash`** — nœud de sortie `Respond to Webhook`. Le nouveau champ doit être ajouté dans l'objet `stats` avant le `Respond to Webhook`.
- **Frontend consommation** — aucune pour cette phase. Phase ultérieure (non scopée ici) introduira un composant trend qui slicera `stats_par_mois.slice(-6)`.

</code_context>

<deferred>
## Deferred Ideas

- **Composant UI "Tendance 6 mois"** (bars ou ligne) consommant `stats_par_mois` — phase ultérieure (ré-ouverture ciblée de Phase 2 ou Phase 2.5 ajoutée au roadmap). Le sketch 005 variant C n'en prévoit pas de section dédiée — décider de l'emplacement (dans section "Où & Quand", ou nouvelle section 3bis).
- **Backfill des audits historiques** — les audits antérieurs au déploiement n'auront pas `stats_par_mois`. Le frontend future devra gérer `undefined` gracieusement. Pas de migration prévue.
- **`ca_perdu_mois` par bucket** — si besoin futur de série CA par mois, nécessite revue de la règle d'annualisation pour éviter conflit avec `ca_perdu_an`. Backlog.
- **Export du workflow n8n dans le repo** — au-delà du fichier JSON de Phase 3, versionner l'ensemble des workflows WFxx de n8n.srv939707 dans `04_Scripts_Workflows/` (workspace racine) serait un projet d'hygiène séparé.

</deferred>

---

*Phase: 03-n8n-stats-par-mois*
*Context gathered: 2026-04-24 (auto mode — 7 gray areas decided)*
