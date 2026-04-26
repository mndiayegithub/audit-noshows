# Phase 7: Robustesse upload CSV (autonomie client) — Context

**Gathered:** 2026-04-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Le pipeline d'upload CSV passe d'un échec silencieux 500 générique à un parcours résilient pour client en autonomie : preview pré-submit, erreurs structurées en clair, et confirmation explicite en cas de données partiellement reconnues — sur 3 sources d'export (Doctolib, Excel/Google Sheets, logiciels métier français).

</domain>

<spec_lock>
## Requirements (locked via SPEC.md)

**6 requirements sont verrouillées.** Voir `07-SPEC.md` pour les requirements complets, boundaries et acceptance criteria.

Les agents downstream **DOIVENT** lire `07-SPEC.md` avant de planifier ou implémenter. Les requirements ne sont pas dupliqués ici.

**In scope (extrait SPEC.md) :**
- CSV preview frontend (REQ #1)
- Erreurs structurées 5 codes (REQ #2)
- Modal de confirmation mode dégradé (REQ #3)
- Refus dur sous seuil 50 % / 20 RDV (REQ #4)
- Catalogue ≥ 12 fixtures CSV (REQ #5)
- 3 specs Playwright e2e (REQ #6)

**Out of scope (extrait SPEC.md) :**
- Auto-repair LLM des statuts inconnus
- UI de mapping manuel des statuts
- Détection automatique de l'encodage (Latin-1 → UTF-8)
- Skip auto des lignes métadata avant header
- Telemetry serveur des `error_code`
- Préview chart par jour ou métadonnées riches

</spec_lock>

<decisions>
## Implementation Decisions

> **Note sur la prise de décision :** L'utilisateur a explicitement délégué le libre arbitre sur ces choix d'implémentation à Claude (« je te laisse le libre arbitre »). Chaque décision ci-dessous est documentée avec son rationale pour permettre un audit ultérieur ou un revirement si l'usage prouve un meilleur choix.

### Parsing CSV côté client

- **D-01 :** Utiliser **`papaparse`** (~30 KB gzipped) pour parser le CSV côté frontend dans le composant `<CSVPreview>`.
  - **Rationale :** Standard de facto JS pour CSV, maintenance active (>40M downloads/sem). Auto-détection séparateur (`,` vs `;`), gestion native des quotes/multi-line/headers, hint d'encoding. Couvre les 3 sources cibles sans code custom.
  - **Alternative écartée :** Port custom du parseur n8n — augmente la dette de maintenance (deux parseurs à synchroniser) sans bénéfice fonctionnel ; papaparse couvre les mêmes cas.
  - **Risque :** Bundle size +30 KB sur `/audit` (acceptable, page actuelle = 75 KB).

### UX du preview

- **D-02 :** Le preview s'affiche dans une **section inline qui remplace la dropzone** après sélection du fichier. Le composant `<CSVPreview>` montre : colonnes détectées (badges), 3 lignes parsées (mini table), nombre total de RDV reconnus + taux de reconnaissance. Boutons : "Continuer" (primary `#064E3B`) / "Changer de fichier" (ghost slate-500).
  - **Rationale :** Cohérent avec le pattern actuel de `app/audit/page.tsx` (linéaire, pas de modal pour la dropzone elle-même). Permet à l'utilisateur de relire ce que le système a compris avant le POST de 30-50s — élimine les abandons silencieux. Mobile-friendly (pas de split view).
  - **Alternative écartée :** Modal centré — friction visuelle inutile et incohérent avec le reste de la page (pas de modal ailleurs dans le flow upload).

### Modal de confirmation mode dégradé

- **D-03 :** Construire le modal de confirmation avec **`@radix-ui/react-dialog`** (ajout d'une dépendance ~10 KB).
  - **Rationale :** Accessibilité ARIA + focus trap natifs (critique pour un composant interruptif), keyboard navigation correcte hors-the-box, support SSR. Évite la dette d'un focus trap maison fragile. Composant réutilisable pour toute future modale (export PDF, settings, etc.).
  - **Alternative écartée :** shadcn/ui Dialog — initialiser shadcn sur ce projet introduit une migration plus large (config tailwind, generators, CLI) hors scope. Radix seul est suffisant.
  - **Style :** match du design system existant (clinique-claire, primary `#064E3B`, fond white, overlay `bg-slate-900/40`, rounded-xl).

### Catalogue de fixtures

- **D-04 :** Construire un **script générateur Node** `scripts/gen-csv-fixtures.ts` paramétrable, et l'exécuter une fois pour produire les 12 fixtures versionnées dans `e2e/fixtures/csv/`. Le script reste dans le repo pour permettre la régénération si on découvre de nouvelles variantes en prod.
  - **Rationale :** Reproductibilité (un changement de paramètre régénère toute la fixture), couvre les 4 catégories de la SPEC (3 Doctolib + 3 Excel/Sheets + 3 logiciels métier + 3 malformés) avec une logique partagée. Documenté = facile à étendre quand on aura collecté des cas réels.
  - **Paramètres exposés :** source (`doctolib`/`excel`/`logos_w`/`julie`/`veasy`), nb_mois, taux_no_show, encoding (`utf-8`/`latin-1`), separator (`,`/`;`), statuts (custom array), include_meta_header (bool), corrupt_pct (% lignes invalides).
  - **En-tête de fixture :** chaque fichier est annoté `# source: doctolib`, `# expected: ok|degraded|reject:CODE` (lisible par les specs Playwright pour assertions).

### UI des erreurs API

- **D-05 :** En cas de 400/500, le composant `<CSVPreview>` (ou son parent) affiche une **carte d'erreur inline** à la place du preview, avec : icône Alert (lucide), titre court mappé au code (`Colonnes manquantes`, `Format de date non reconnu`, etc.), message FR du backend, hint actionnable contextualisé, bouton "Choisir un autre fichier" (ghost).
  - **Rationale :** Cohérent avec D-02 (pas de modal pour ce qui n'est pas une décision interruptive). Réutilise la palette `kpiSignal`/`kpiTaux` du design system pour la sévérité. L'utilisateur garde le contexte de la page (dropzone visible en arrière-plan effacé).
  - **Mapping code → titre/hint :**
    - `MISSING_COLUMNS` → "Colonnes obligatoires manquantes" + "Renommez vos colonnes en `date` et `statut`"
    - `INVALID_DATE_FORMAT` → "Format de date non reconnu" + "Format attendu : JJ/MM/AAAA (ex : 12/03/2026)"
    - `EMPTY_AFTER_PARSING` → "CSV vide ou aucune ligne lisible" + "Vérifiez que votre fichier n'est pas corrompu"
    - `ENCODING_ERROR` → "Encodage non supporté" + "Réenregistrez en UTF-8 (Excel : Fichier > Enregistrer sous > CSV UTF-8)"
    - `INSUFFICIENT_DATA` → "Données trop incomplètes pour produire un audit fiable" + "{X} % reconnus, {Y} RDV valides — il faut au moins 50 % et 20 RDV"

### Localisation des seuils

- **D-06 :** Créer un nouveau fichier **`lib/audit-thresholds.ts`** qui expose les 3 constantes (`DEGRADED_THRESHOLD = 0.90`, `REJECT_THRESHOLD = 0.50`, `MIN_RDV_VALIDES = 20`) consommé par le frontend (`<CSVPreview>`), le serveur (`app/api/audit/route.ts`), et la validation (`lib/audit-validation.ts`).
  - **Rationale :** Single source of truth — l'utilisateur a déjà annoncé qu'il voudra resserrer 90 % → 95 % après obs prod. Une constante centrale rend ce changement à un seul endroit, sans risque de drift dev/prod ni de divergence frontend/backend.
  - **Alternative écartée :** Variables d'environnement — overkill pour 3 valeurs métier ; introduit complexité de config Vercel sans gain.
  - **Format :**
    ```ts
    export const DEGRADED_THRESHOLD = 0.90; // < 90% reconnus → confirmation utilisateur
    export const REJECT_THRESHOLD = 0.50;   // < 50% reconnus → 400 INSUFFICIENT_DATA
    export const MIN_RDV_VALIDES = 20;      // < 20 RDV valides → 400 INSUFFICIENT_DATA
    ```

### Mock n8n pour Playwright e2e

- **D-07 :** Les 3 specs Playwright (REQ #6) **mocquent `/api/audit`** via `page.route("**/api/audit", ...)` et renvoient des fixtures JSON pré-faites par scénario (golden / dégradé / refus dur). Aucun appel réel à n8n.
  - **Rationale :** Tests déterministes (< 1s/spec vs 30-50s en live), pas de pollution des executions n8n, exécution offline possible en CI, pas de flake si n8n est temporairement down.
  - **Trade-off accepté :** On ne teste pas la chaîne `/api/audit → n8n` en e2e. Mitigé par les tests Vitest unit sur `lib/n8n-normalize.ts` (déjà couvert) et `lib/audit-validation.ts` (Phase 6).
  - **Fixtures de réponse mock :**
    - `e2e/fixtures/responses/audit-ok.json` — réponse 200 success normale
    - `e2e/fixtures/responses/audit-degraded.json` — 200 avec `degraded: true`, `reco_rate: 0.85`, `ignored_count: 12`
    - `e2e/fixtures/responses/audit-reject.json` — 400 avec `error_code: INSUFFICIENT_DATA`

### Claude's Discretion

L'utilisateur a explicitement délégué les choix d'implémentation à Claude. Pour les détails fins non capturés ici (style exact des boutons, wording final des messages d'erreur, ordonnancement des hints actionnables, copy du modal de confirmation, choix d'icônes lucide), Claude tranche en plan-phase et execute en respectant la palette clinique-claire (Inter, Fraunces titres, primary `#064E3B`, KPI tokens Volume/Signal/Taux/Argent).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Spec & contracts
- `.planning/phases/phase-07-robustesse-upload-csv/07-SPEC.md` — **Locked requirements — MUST read before planning**. 6 requirements, 11 acceptance criteria, seuils chiffrés.
- `.planning/ROADMAP.md` §"Phase 7" — phase goal, deps, in/out of scope.

### Code de référence existant
- `lib/audit-validation.ts` — pattern de validation Zod-style + types `ValidationResult`. La nouvelle logique de seuils (D-06) doit suivre cette convention.
- `lib/n8n-normalize.ts` — pattern de pure-fn testable + sanitize fallback. Le contrat d'erreur (D-05) doit s'inspirer de ce style.
- `app/api/audit/route.ts` — origin allowlist + rate-limit + validation déjà en place (Phase 5). La phase 7 étend uniquement le contrat d'erreur retourné.
- `app/audit/page.tsx:39-90` — flow actuel de l'upload (useDropzone + FileReader + POST). C'est ici qu'on insère `<CSVPreview>`.

### Design system
- `tailwind.config.ts` — palette clinique-claire (primary `#064E3B`, KPI tokens, Inter + Fraunces).
- `new_design.md` + `new_design_audit.html` — DA canonique, hiérarchie typographique, espacements.
- `components/audit/AuditDashboard.tsx` — pattern de section avec eyebrow + lede, cohérence à respecter pour les états du `<CSVPreview>`.

### Phase 6 (à venir, dépendance soft)
- Phase 6 (tests Vitest + Playwright) sera livrée **avant** Phase 7. Les fixtures REQ #5 sont également les fixtures consommées par les tests Vitest. Coordination à prévoir : générer les fixtures dans Phase 7 et les utiliser dans Phase 6 si Phase 6 démarre en parallèle.

### Documentation externe
- papaparse docs : https://www.papaparse.com/docs (auto-detect, encoding, headers)
- Radix Dialog primitive : https://www.radix-ui.com/primitives/docs/components/dialog (accessibility patterns à respecter)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `react-dropzone` ^14.2.3 — déjà utilisé dans `app/audit/page.tsx`, pas besoin de l'ajouter
- `react-hot-toast` ^2.4.1 — pour les toasts (erreurs réseau, confirmations légères) ; ne pas l'utiliser pour le modal D-03 (pas adapté à un dialogue interruptif)
- `lib/audit-validation.ts` — pattern de validation FormData + ValidationResult discriminé (réutiliser pour la couche serveur étendue)
- `lib/n8n-normalize.ts` — pattern pure-fn + tests déjà en place (étendre pour mapper les nouveaux error_code)
- `lib/safe-log.ts` — logger redacté Phase 5 (utiliser pour log côté serveur sans PII)
- `lib/rate-limit.ts` — rate-limit Phase 5 (déjà câblé sur les 2 routes API)
- Composants `AuditSection`, `SectionHead` du dashboard — pattern visuel à émuler pour les états de preview/erreur

### Established Patterns
- **Validation FormData → ValidationResult discriminé** : `{ ok: true; values: T } | { ok: false; error: string }`. Étendre vers `{ ok: false; error_code: T; error: string; details: unknown }`.
- **Routes API minces** : la logique métier vit dans `lib/`, la route fait orchestration (origin → rate-limit → validate → forward). Conserver ce pattern pour Phase 7.
- **Tests Vitest unit dans `lib/`** : pattern à étendre pour les nouvelles fonctions (`parseCSVForPreview`, `mapErrorToCode`, etc.).
- **Composants client `"use client"` colocated dans `components/audit/`** — c'est là que vit `<CSVPreview>` et `<DegradedConfirmDialog>`.

### Integration Points
- `app/audit/page.tsx:39-90` — point d'insertion du flow preview (entre `useDropzone` et le POST).
- `app/api/audit/route.ts:38-43` — point d'extension des erreurs (validateAuditPayload retourne déjà un ValidationResult ; étendre le type d'erreur).
- `lib/audit-validation.ts` — extension naturelle des règles (CSV parsing avancé, comptage statuts non reconnus → reco_rate).
- n8n workflow `Hc3aGjSuNjd4KVuu` Parse & Validate node — éventuellement à modifier pour propager `error_code` structuré dans la réponse JSON. À discuter en plan-phase : on peut tout garder côté Next API (proxy) si on préfère ne pas toucher à n8n.

</code_context>

<specifics>
## Specific Ideas

- **Wave structure** : la phase est livrable en une seule wave (W1) — toute la SPEC est in-scope. Le plan-phase peut découper en plans atomiques (1 plan = 1 REQ ou regroupement logique) mais sans étapes Wave 2.
- **Ordre suggéré des plans** (à arbitrer en plan-phase) :
  1. `lib/audit-thresholds.ts` + extension `lib/audit-validation.ts` (REQ #2 + #4 backend)
  2. Étendre `app/api/audit/route.ts` pour propager error_code (REQ #2 backend)
  3. Composant `<CSVPreview>` avec papaparse (REQ #1)
  4. Composant `<DegradedConfirmDialog>` Radix (REQ #3 frontend)
  5. Wiring `app/audit/page.tsx` (preview + dialog + error card)
  6. Carte d'erreur inline `<CSVErrorCard>` (REQ #2 frontend)
  7. Script `scripts/gen-csv-fixtures.ts` + génération initiale (REQ #5)
  8. 3 specs Playwright e2e (REQ #6)
- **Composants à créer (5)** : `<CSVPreview>`, `<DegradedConfirmDialog>`, `<CSVErrorCard>`, plus 1 hook `useCSVPreview` qui encapsule le parsing papaparse + détection colonnes + comptage reco_rate.
- **Tests Vitest à créer (3)** : `parseCSVForPreview.test.ts`, `mapErrorToCode.test.ts`, `audit-thresholds.test.ts` (sanity sur les valeurs).

</specifics>

<deferred>
## Deferred Ideas

Ces idées ont été évoquées en spec/discuss mais sortent du scope Phase 7 :

- **Auto-repair LLM des statuts inconnus** — décision rétractée par l'utilisateur (2026-04-26). Pas de LLM dans le pipeline upload.
- **UI de mapping manuel des statuts** — out-of-scope SPEC. Si besoin émerge, créer une phase dédiée.
- **Détection automatique encodage (Latin-1 → UTF-8)** — backlog. Wave 1 = UTF-8 only avec `ENCODING_ERROR` explicite.
- **Auto-skip des lignes métadata avant header** — backlog. Doctolib préfixe parfois "Export du JJ/MM/AAAA" — pour l'instant l'utilisateur doit cleaner.
- **Telemetry serveur des error_code** — déféré jusqu'à observation des patterns réels en prod. Phase 9 (Monitoring) reprendra cette piste.
- **Resserrement seuil 90 % → 95 %** — opérationnel post-launch (l'utilisateur observera la friction réelle avant de décider).
- **Évolution shadcn/ui** — non bloquante pour Phase 7 (Radix seul suffit), mais à considérer pour Phase 9 si on multiplie les composants UI complexes.
- **Mock MSW** au lieu de page.route() — surdimensionné pour 3 specs ; à reconsidérer si on a 10+ specs e2e à Phase 9.

</deferred>

---

*Phase: 07-robustesse-upload-csv*
*Context gathered: 2026-04-26*
