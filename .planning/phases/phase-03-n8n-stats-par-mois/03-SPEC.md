# Phase 3: Extension n8n WF12 `stats_par_mois[]` — Specification

**Created:** 2026-04-24
**Ambiguity score:** 0.08 (gate ≤ 0.20) — PASS
**Requirements:** 5 locked

## Goal

Faire en sorte que la payload renvoyée par le webhook n8n `/audit-flash` contienne un nouveau champ `stats.stats_par_mois: Array<{ mois: string; total_rdv: number; no_shows: number; taux: number }>` trié ascendant par mois, couvrant 100% des mois présents dans le CSV uploadé (gaps zero-filled), **sans modifier aucun champ existant** ni violer la règle d'annualisation `ca_perdu_an`.

## Background

Aujourd'hui, le workflow n8n `audit-flash` (hébergé sur `n8n.srv939707.hstgr.cloud`, référencé comme WF12 dans le roadmap) agrège les données du CSV Doctolib uploadé selon deux axes :
- `stats.par_jour[]` — agrégat par jour de la semaine (Lun…Dim)
- `stats.par_heure[]` — agrégat par créneau horaire (optionnel)

Il **n'existe aucun agrégat temporel par mois calendaire**. Cette absence empêche toute visualisation de tendance longitudinale (ex: "le taux de no-shows a-t-il baissé depuis novembre ?"). Le ROADMAP Phase 3 (§87-101) spécifie que cette extension débloque un futur composant "Tendance 6 mois" (hors scope de la présente phase).

Côté repo, `types/audit.ts` typé `AuditStats` ne contient aucun champ `stats_par_mois`. Le proxy `app/api/audit/route.ts` (lignes 37-65) normalise trois shapes de réponse n8n (array test mode / wrapped `{output:{...}}` / direct) sans toucher à la structure interne de `stats` — tout nouveau champ additif traverse passivement.

La règle métier critique documentée dans `CLAUDE.md` §"Key Business Rule" interdit toute remultiplication de `ca_perdu` / `ca_perdu_an` : elle est **déjà annualisée** par n8n. Tout ajout de champ monétaire par mois porterait un risque de violation de cet invariant — c'est pourquoi `stats_par_mois` n'inclut pas de `ca_perdu_mois` dans cette phase (D-05 du CONTEXT).

## Requirements

1. **Ajout du nœud n8n "Aggregate Par Mois"** : un nœud Code JavaScript est ajouté au workflow WF12 audit-flash entre le parseur CSV et le nœud `Respond to Webhook`. Il lit les lignes de RDV (`date_rdv`, `status`), groupe par `date_rdv.slice(0,7)` (préfixe `YYYY-MM`, aucune conversion timezone), et émet un tableau d'objets.
   - Current: aucun nœud d'agrégat mensuel dans WF12
   - Target: un nœud nommé explicitement (ex: `Aggregate Par Mois`) qui injecte `stats_par_mois` dans l'objet `stats` transmis au `Respond to Webhook`
   - Acceptance: export JSON du workflow contient ce nœud ; exécution test du webhook avec un CSV de 3+ mois renvoie `stats.stats_par_mois` non vide

2. **Shape et tri du champ `stats_par_mois`** : chaque bucket expose exactement 4 clés : `mois` (string ISO `"YYYY-MM"`), `total_rdv` (number entier ≥ 0), `no_shows` (number entier ≥ 0), `taux` (number en pourcentage décimal, 0-100, arrondi à 1 décimale). Tableau trié ascendant par `mois` (ordre lexicographique = ordre chronologique).
   - Current: n/a (champ inexistant)
   - Target: structure figée, taux = `no_shows / total_rdv * 100` arrondi à 1 décimale, tableau toujours trié ascendant
   - Acceptance: pour toute paire consécutive `(a, b)` dans le tableau, `a.mois < b.mois` ; chaque bucket contient les 4 clés exactes ; `Number.isInteger(bucket.total_rdv) === true` ; `bucket.taux === Math.round(bucket.no_shows / bucket.total_rdv * 1000) / 10` (ou `0` si total_rdv === 0)

3. **Fenêtre complète avec gaps zero-filled** : la plage couvre tous les mois calendaires depuis `min(date_rdv)` jusqu'à `max(date_rdv)` du CSV, inclus. Un mois sans RDV émet un bucket `{ mois, total_rdv: 0, no_shows: 0, taux: 0 }`. Aucun mois manquant au milieu de la plage, aucun mois ajouté avant/après.
   - Current: n/a
   - Target: `stats_par_mois.length === periode.nb_mois` (= nombre de mois calendaires distincts couverts par le CSV)
   - Acceptance: test avec CSV couvrant nov 2025, déc 2025, fév 2026 (janv manquant) → tableau de 4 buckets `[2025-11, 2025-12, 2026-01, 2026-02]` dont `2026-01` a `total_rdv: 0`

4. **Conservation de la règle métier `ca_perdu_an`** : le nœud `Aggregate Par Mois` ne touche à aucun champ monétaire existant (`ca_moyen`, `ca_perdu_mois`, `ca_perdu_an`, `ca_perdu` dans `top_3_*`). Le tableau `stats_par_mois` ne contient volontairement **pas** de champ `ca_perdu` par bucket.
   - Current: `stats.global.ca_perdu_an` est calculé en amont et déjà annualisé
   - Target: cette valeur reste strictement identique avant/après ajout du nœud ; aucun champ monétaire n'apparaît dans les buckets mensuels
   - Acceptance: exécution du workflow avec un CSV identique avant/après modification → `stats.global.ca_perdu_an` est identique au centime près ; clés de chaque bucket ∈ `{mois, total_rdv, no_shows, taux}`

5. **Typage frontend non-breaking** : `types/audit.ts` déclare `stats_par_mois?:` (optionnel) dans l'interface `AuditStats`, alignant la convention avec les autres champs optionnels (`par_jour?`, `stats_par_jour?`, `stats_par_praticien?`). Le build Next.js reste vert. Aucun consommateur actuel n'est cassé.
   - Current: `AuditStats` ne contient aucune référence à `stats_par_mois`
   - Target: nouveau champ optionnel typé avec la shape de la Requirement 2
   - Acceptance: `npm run build` exit 0 ; `grep -r "stats_par_mois" components/` retourne zéro résultat (aucun composant ne consomme encore, confirmation que la phase reste backend-only)

## Boundaries

**In scope :**
- Ajout d'un nœud Code JS dans le workflow n8n WF12 audit-flash
- Export JSON du workflow modifié, versionné dans `.planning/phases/phase-03-n8n-stats-par-mois/WF12-audit-flash.json`
- Livrable `.planning/phases/phase-03-n8n-stats-par-mois/n8n-code-node-stats-par-mois.js` contenant le JS prêt à coller dans le nœud Code
- Update de `types/audit.ts` : ajout du champ `stats_par_mois?` dans `AuditStats`
- Instructions pas-à-pas pour import manuel via UI n8n (documentées dans SUMMARY)

**Out of scope :**
- Tout composant React / dashboard consommant `stats_par_mois` — reporté (phase ultérieure ou retravail Phase 2 ciblé)
- Modification de `app/api/audit/route.ts` — le proxy reste identique, le nouveau champ traverse passivement
- Backfill des audits historiques — les appels antérieurs au déploiement n'auront pas `stats_par_mois`, le frontend future devra gérer `undefined` gracieusement
- Ajout de tests automatisés (Vitest/Playwright) — reporté à Phase 6
- Annualisation du CA perdu par bucket mensuel — risque de conflit avec `ca_perdu_an`, backlog
- Modification de la prompt GPT-4 ou du rapport texte — le `rapport_texte` reste inchangé
- Export d'autres workflows n8n dans le repo — projet d'hygiène séparé

## Constraints

- **Règle métier stricte** : `ca_perdu_an` ne doit jamais être recalculé, transformé, ou remultiplié (CLAUDE.md). Phase 3 ajoute du calcul mensuel **uniquement non-monétaire**.
- **Non-breaking** : aucun champ existant ne change de nom, type, ou contenu. Ajout pur et additif.
- **Performance** : le nœud Code doit traiter un CSV jusqu'à 10 000 lignes (~24 mois × 400 RDV/mois) en < 500 ms. Algorithme O(n) single-pass suffisant.
- **Timezone** : bucketing lexicographique sur `date_rdv.slice(0,7)` sans conversion timezone. Les dates Doctolib sont en Europe/Paris et restent telles quelles dans tout le workflow.
- **Dépendance accès n8n** : édition via UI web `n8n.srv939707.hstgr.cloud` ou via MCP `mcp-n8n` si attaché. Aucune des deux options n'est bloquante — le livrable JS est exécutable standalone.

## Acceptance Criteria

- [ ] Le fichier `.planning/phases/phase-03-n8n-stats-par-mois/n8n-code-node-stats-par-mois.js` existe, est self-contained (aucun `require`/`import`), et implémente la spec des Requirements 1-4.
- [ ] `types/audit.ts` contient le champ optionnel `stats_par_mois?:` avec la shape exacte `{ mois: string; total_rdv: number; no_shows: number; taux: number }[]`.
- [ ] `npm run build` exit 0 après modification de `types/audit.ts`.
- [ ] Le JS du nœud Code gère le cas `total_rdv === 0` sans lancer de division par zéro (retourne `taux: 0`).
- [ ] Le JS du nœud Code gère un CSV vide ou sans lignes valides (retourne `stats_par_mois: []`).
- [ ] Le tableau émis est trié ascendant et sans gap interne (test unitaire mental sur un CSV contrôlé).
- [ ] Un document d'instructions d'import manuel existe (dans SUMMARY.md ou fichier dédié).
- [ ] `03-SUMMARY.md` documente clairement le statut final (complete / partial / blocked) et les actions utilisateur restantes.

## Ambiguity Report

| Dimension           | Score | Min  | Status | Notes |
|---------------------|-------|------|--------|-------|
| Goal Clarity        | 0.92  | 0.75 | PASS   | "ajout d'un champ nommé exactement X avec shape Y, sans toucher au reste" est mesurable. |
| Boundary Clarity    | 0.90  | 0.70 | PASS   | In/Out scope exhaustifs et catégoriques (reportés explicitement vers phases ultérieures ou backlog). |
| Constraint Clarity  | 0.85  | 0.65 | PASS   | Règle métier `ca_perdu_an` verrouillée ; contrainte perf O(n) < 500 ms sur 10k lignes ; timezone explicite. |
| Acceptance Criteria | 0.88  | 0.70 | PASS   | 8 critères tous binaires (fichier existe / build passe / test contrôlé / doc existe). |
| **Ambiguity**       | 0.08  | ≤0.20| PASS   | Spec serrée — downstream planner/researcher a toutes les infos pour décomposer en tasks. |

---

*Phase: 03-n8n-stats-par-mois*
*Spec locked: 2026-04-24*
