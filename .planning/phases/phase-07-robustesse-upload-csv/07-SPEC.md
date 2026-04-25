# Phase 7: Robustesse upload CSV (autonomie client) — Specification

**Created:** 2026-04-26
**Ambiguity score:** 0.175 (gate: ≤ 0.20)
**Requirements:** 6 locked

## Goal

Le pipeline d'upload CSV passe d'un échec silencieux 500 générique à un parcours résilient pour client en autonomie : preview pré-submit, erreurs structurées en clair, et confirmation explicite en cas de données partiellement reconnues — sur les 3 sources d'export ciblées (Doctolib, Excel/Google Sheets, logiciels métier français Logos_w/Julie/Veasy).

## Background

État actuel (commit `5c69149`, après Phase 5) :

- **Frontend `app/audit/page.tsx`** : drag-and-drop CSV → POST direct sur `/api/audit`. Aucune validation côté client autre que l'extension `.csv`. L'utilisateur attend 30-50s avant tout retour.
- **Server `lib/audit-validation.ts`** : valide taille ≤ 2 Mo, présence des en-têtes `date` + `statut|status`, format e-mail. Renvoie un 400 textuel monolithique en cas d'échec.
- **n8n `Parse & Validate CSV` node** (workflow `Hc3aGjSuNjd4KVuu`) : auto-détection de colonnes via regex sur date/heure/statut/jour/praticien. Normalisation des statuts vers `Honoré` / `No-show` (FR). Throw si moins de 20 RDV reconnus, message technique.
- **Sources d'erreur observées** mais non gérées proprement : encodage Latin-1 (Excel français), formats date ISO/US, statuts atypiques type "DNA"/"Reporté", lignes métadata avant header (Doctolib), séparateur `;` français, multi-praticiens quotés.
- **Phase 6 (tests)** sera livrée avant Phase 7 ; les fixtures construites ici alimenteront sa suite e2e.

Le client en autonomie totale n'a aujourd'hui aucun feedback exploitable : si son CSV n'est pas Doctolib classique, il reçoit un 500 ou un message technique, et abandonne.

## Requirements

1. **CSV preview avant POST** : Le frontend parse le CSV localement et affiche un récapitulatif que l'utilisateur valide avant l'envoi.
   - Current : aucun preview — POST direct sur `/api/audit`
   - Target : composant `<CSVPreview>` rendu après sélection du fichier ; affiche les colonnes détectées, 3 lignes parsées en exemple, nombre total de RDV reconnus ; boutons "Continuer" / "Annuler / changer de fichier"
   - Acceptance : pour un CSV Doctolib bien formé, le preview liste correctement `date`, `heure`, `statut` et 3 lignes ; le clic "Continuer" déclenche le POST identique à aujourd'hui ; "Annuler" remet le sélecteur de fichier sans toast d'erreur

2. **Erreurs API structurées (5 codes)** : Les routes `/api/audit` et n8n renvoient un objet JSON typé en cas d'échec, exploitable par l'UI.
   - Current : `{ success: false, error: "string libre" }` avec messages techniques
   - Target : `{ success: false, error_code: <CODE>, error: <FR-message>, details: { ... } }` avec les 5 codes : `MISSING_COLUMNS`, `INVALID_DATE_FORMAT`, `EMPTY_AFTER_PARSING`, `ENCODING_ERROR`, `INSUFFICIENT_DATA`
   - Acceptance : un test unitaire simule chacun des 5 cas et vérifie que le JSON renvoyé contient exactement les champs `error_code` + `error` + `details` avec le bon code

3. **Mode dégradé avec confirmation utilisateur** : Quand le taux de reconnaissance est inférieur à 90 %, l'utilisateur est explicitement consulté avant que l'audit ne se lance.
   - Current : silence — les lignes ignorées disparaissent sans signal à l'UI
   - Target : si `nb_reconnus / nb_total < 0.90`, l'API renvoie 200 avec `{ degraded: true, reco_rate, ignored_count, sample_ignored: [...] }` ; le frontend affiche un modal "X lignes non reconnues — voulez-vous continuer en mode dégradé ?" avant d'afficher le rapport
   - Acceptance : un CSV avec 12 % de statuts inconnus (≥ 90 % de seuil échoué) déclenche le modal ; cliquer "Continuer" affiche le rapport avec une bannière "Audit partiel : X lignes ignorées" ; cliquer "Annuler" ramène au sélecteur de fichier
   - **Note opérationnelle** : seuil fixé à **90 % en Wave 1** (palier de tolérance large pendant la phase d'observation prod) ; sera **resserré à 95 %** par l'utilisateur après validation que la friction reste acceptable. Le seuil doit être exposé comme une constante nommée (`DEGRADED_THRESHOLD = 0.90`) dans un seul fichier pour faciliter le ré-ajustement.

4. **Refus dur sous seuil minimum** : L'API refuse de produire un audit quand l'échantillon final est statistiquement non significatif.
   - Current : n8n throw avec "Pas assez de données valides (5 RDV sur 1200)" — texte libre
   - Target : si `reco_rate < 0.50` OU si `nb_rdv_valides < 20`, renvoie un 400 avec `error_code: INSUFFICIENT_DATA` + `details.reco_rate` + `details.nb_rdv_valides` + un message FR clair
   - Acceptance : un CSV où moins de 50 % parse OU moins de 20 RDV valides reste — l'API renvoie 400 et l'UI affiche un message du style "Données trop incomplètes pour produire un audit fiable (X % reconnus, Y RDV valides)"

5. **Catalogue de fixtures CSV** : Un corpus représentatif des 3 sources d'export ciblées est versionné pour servir de regression-set partagé avec Phase 6.
   - Current : 1 seul fichier `e2e/fixtures/sample.csv` (10 lignes, format Doctolib trivial)
   - Target : ≥ 12 fixtures dans `e2e/fixtures/csv/` couvrant : 3 valides Doctolib (6/12/18 mois) + 3 valides Excel/Google Sheets (colonnes nommées librement) + 3 valides logiciels métier (Logos_w / Julie / Veasy ou approximations crédibles) + 3 malformés représentatifs (statuts inconnus, lignes ignorées > 10 %, < 20 RDV valides)
   - Acceptance : `ls e2e/fixtures/csv/*.csv | wc -l` ≥ 12 ; chaque fixture a un commentaire d'en-tête `# source: …` `# expected: ok|degraded|reject:CODE`

6. **Test e2e Playwright des 3 chemins** : Le golden path et les 2 chemins dégradés sont couverts en e2e.
   - Current : 1 spec `e2e/audit-flow.spec.ts` sur le golden path uniquement (et avec la fixture trivial)
   - Target : 3 specs e2e — (a) upload OK → preview → continue → rapport ; (b) upload dégradé < 90 % → modal confirmation → continuer → rapport avec bannière ; (c) upload < 50 % → preview affiche refus + code `INSUFFICIENT_DATA`
   - Acceptance : `npm run test:e2e` exécute les 3 specs vertes en CI ; chaque spec utilise une fixture du catalogue requirement #5

## Boundaries

**In scope (Wave 1 — MVP livrable) :**
- CSV preview frontend (REQ #1)
- Erreurs structurées 5 codes (REQ #2)
- Modal de confirmation mode dégradé (REQ #3)
- Refus dur sous seuil 50 % / 20 RDV (REQ #4)
- Catalogue ≥ 12 fixtures CSV (REQ #5)
- 3 specs Playwright e2e (REQ #6)

**Out of scope (Wave 2 / phase ultérieure) :**
- **Auto-repair LLM des statuts inconnus** — décision utilisateur 2026-04-26 : on ne câble pas de LLM dans le pipeline. La confirmation utilisateur (REQ #3) couvre le cas dégradé sans coût/latence supplémentaire.
- **UI de mapping manuel des statuts** — pas de "X = no-show" tapé à la main par l'utilisateur. Boundary out-of-scope explicite.
- **Détection automatique de l'encodage (Latin-1 → UTF-8)** — Wave 1 = UTF-8 only, on retourne `ENCODING_ERROR` si détecté ; conversion auto = backlog.
- **Skip auto des lignes métadata avant header** (Doctolib "Export du JJ/MM/AAAA") — l'utilisateur doit nettoyer son CSV ; auto-skip = backlog.
- **Telemetry serveur** des `error_code` — déféré : on l'ajoutera quand on aura observé les patterns réels en prod.
- **Préview chart par jour ou métadonnées riches** — preview minimum (colonnes + 3 lignes + total RDV).

## Constraints

- **Pas d'appel LLM** dans le pipeline d'upload — décision verrouillée 2026-04-26.
- **Compatibilité phase 5 RGPD** : l'éventuelle telemetry future doit passer par `lib/safe-log.ts` (déjà en place) ; aucun PII n'est loggé même dans les `details` des erreurs renvoyées au client.
- **Latence du preview** : le parsing client doit rester < 500 ms pour un CSV de 2 Mo (limite serveur déjà fixée Phase 5) — sinon switch obligatoire vers un parsing serveur.
- **Réutilisation existante** : la logique de détection de colonnes côté frontend doit refléter celle de `lib/audit-validation.ts` et du nœud n8n `Parse & Validate CSV` — éviter la divergence des règles.
- **Compatibilité Phase 6** : les fixtures REQ #5 sont également les fixtures consommées par les tests Vitest (parsing, normalize) écrits en Phase 6.

## Acceptance Criteria

- [ ] Composant `<CSVPreview>` affiche colonnes + 3 lignes + total RDV reconnus avant POST (REQ #1)
- [ ] Bouton "Continuer" du preview déclenche le POST `/api/audit` identique à l'existant
- [ ] Bouton "Annuler" du preview remet l'utilisateur au sélecteur de fichier sans erreur
- [ ] `/api/audit` renvoie un JSON `{ error_code, error, details }` typé pour les 5 codes (REQ #2)
- [ ] Modal "données partiellement reconnues — continuer ?" apparaît quand `reco_rate < 0.90` (REQ #3)
- [ ] Bannière "Audit partiel : X lignes ignorées" affichée dans le rapport après confirmation
- [ ] 400 `INSUFFICIENT_DATA` renvoyé si `reco_rate < 0.50` OU `nb_rdv_valides < 20` (REQ #4)
- [ ] `ls e2e/fixtures/csv/*.csv` ≥ 12 fixtures, chacune annotée `# source:` + `# expected:` (REQ #5)
- [ ] 3 specs Playwright (golden path / dégradé / refus dur) passent en CI (REQ #6)
- [ ] Aucun appel LLM dans le pipeline d'upload (audit du diff de la phase)
- [ ] `npm run build` et `npm run lint` exit 0 à la fin de la phase

## Ambiguity Report

| Dimension          | Score | Min  | Status | Notes                                                       |
|--------------------|-------|------|--------|-------------------------------------------------------------|
| Goal Clarity       | 0.90  | 0.75 | ✓      | MVP / Wave 1 délimité, sources cibles fixées (Doctolib + Excel/Sheets + logiciels métier) |
| Boundary Clarity   | 0.80  | 0.70 | ✓      | LLM, mapping manuel, encodage auto, métadata header explicitement out-of-scope |
| Constraint Clarity | 0.70  | 0.65 | ✓      | Pas de LLM, latence preview < 500 ms, compatibilité Phase 5/6 |
| Acceptance Criteria| 0.85  | 0.70 | ✓      | 11 critères pass/fail dont 4 seuils chiffrés (90 %, 50 %, 20 RDV, 12 fixtures, 500 ms) |
| **Ambiguity**      | 0.175 | ≤0.20| ✓      | Gate passé après 4 rounds Socratic                          |

## Interview Log

| Round | Perspective       | Question                                            | Décision verrouillée                                                                                       |
|-------|-------------------|----------------------------------------------------|------------------------------------------------------------------------------------------------------------|
| 1     | Researcher        | Quelles sources d'export à supporter ?              | Doctolib + Excel/Google Sheets + logiciels métier français (Logos_w / Julie / Veasy)                       |
| 1     | Researcher        | Corpus de CSV ratés existant ?                      | Aucun — corpus 100 % synthétique en Phase 7                                                                |
| 1     | Researcher        | Comportement quand 80 % des statuts mappés ?        | Initialement : LLM auto-repair → **rétracté** : confirmation utilisateur (pas de LLM)                      |
| 2     | Researcher+Simpl. | Découpe MVP / nice-to-have ?                        | Wave 1 = preview + erreurs structurées ; tout le reste différé                                             |
| 2     | Researcher+Simpl. | Budget LLM ?                                        | N/A — décision finale : pas de LLM dans cette phase                                                        |
| 3     | Boundary Keeper   | Out-of-scope explicites ?                           | Mapping manuel statuts + lignes métadata avant header                                                      |
| 3     | Boundary Keeper   | Definition of done du preview ?                     | Colonnes + 3 lignes parsées + nombre total RDV reconnus (preview minimum)                                  |
| 3     | Boundary Keeper   | Combien de codes d'erreur structurés ?              | 5 codes : MISSING_COLUMNS / INVALID_DATE_FORMAT / EMPTY_AFTER_PARSING / ENCODING_ERROR / INSUFFICIENT_DATA |
| 4     | Failure Analyst   | Seuil de bascule en mode dégradé ?                  | Confirmation utilisateur si reco_rate < 90 %                                                               |
| 4     | Failure Analyst   | Seuil de refus dur ?                                | < 50 % reconnus OU < 20 RDV valides → 400 INSUFFICIENT_DATA                                                |

---

*Phase: 07-robustesse-upload-csv*
*Spec créée : 2026-04-26*
*Next step : /gsd-discuss-phase 7 — décisions d'implémentation (librairie de parsing client, structure du modal, layout du preview, etc.)*
