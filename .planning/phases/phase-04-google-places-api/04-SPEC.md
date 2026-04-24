# Phase 4 : Intégration Google Places API — Specification

**Created:** 2026-04-24
**Ambiguity score:** 0.195 (gate ≤ 0.20) — PASS (auto)
**Requirements:** 5 locked

## Goal

Câbler le composant `DiagnosticGoogle.tsx` (déjà codé, aujourd'hui orphelin) dans le dashboard `/audit` en section 4 "Score cabinet", brancher son appel sur la route serveur déjà en place (`app/api/google-places/route.ts` → Google Places Find Place + fields `rating, user_ratings_total, formatted_address`), et **blender la note Google au score /100** issu de `lib/score.ts` quand l'utilisateur a lancé l'analyse Google. Fallback gracieux sans Google : score taux-only /100 avec libellé explicite "(hors Google)".

## Background

Le repo contient déjà, héritage des phases antérieures :
- `app/api/google-places/route.ts` (54 lignes) — proxy serveur fonctionnel qui lit `process.env.GOOGLE_PLACES_API_KEY` et retourne `{ found, name, rating, user_ratings_total, formatted_address }` ou `{ found: false }` / `{ error }`.
- `components/audit/DiagnosticGoogle.tsx` (263 lignes) — formulaire "Analyser aussi mes avis Google" avec input nom cabinet, loading, rendering du résultat. **N'est importé nulle part** dans le dashboard actuel (`AuditDashboard.tsx`).
- `lib/score.ts` (25 lignes) — `computeScore(tauxNoshow)` sur échelle 0–100 via `100 − taux × 3.2`, `scoreBadge(score)` retourne `{label, tone}`.
- `components/audit/ScoreHero.tsx` — gauge SVG 0–100 alimentée par `computeScore`, rendue en section 4 du dashboard.
- `types/audit.ts` contient déjà `GoogleData { name, rating, user_ratings_total, formatted_address? }`.

Le ROADMAP §4 ligne 112 évoque "mise à jour du score global de /50 vers /100 en intégrant le volet Google". Cette formulation est antérieure à Phase 2 qui a livré un score /100 pur-taux. **Réinterprétation explicite de la Phase 4** : le score reste affiché /100 dans tous les cas ; la présence des données Google modifie la *formule* (blending d'un delta rating) plutôt que l'échelle. Le libellé distingue les deux modes côté UI pour transparence.

La clé `GOOGLE_PLACES_API_KEY` est déjà présente dans `.env.local` (gitignoré). Restriction Cloud Console (domaine referrer + Places-only) à valider hors scope de cette spec mais recommandée dans le SUMMARY.

## Requirements

1. **Câblage de `DiagnosticGoogle` dans `AuditDashboard`** : le composant est rendu dans la section 4 "Score cabinet" (id `score`), au-dessus ou à côté de `ScoreHero`, accompagné d'un intro court ("Enrichissez votre score avec votre réputation en ligne"). Le champ input est pré-rempli avec `stats.nom_cabinet`. Si l'utilisateur clique "Analyser", une requête GET `/api/google-places?input={nom}` est lancée, le résultat `GoogleData` est stocké en state et passé à `ScoreHero` via une prop `google?: GoogleData | null`.
   - Current : `DiagnosticGoogle` existe mais n'est importé dans aucun composant rendu du dashboard.
   - Target : Import + rendu dans `AuditDashboard`, state géré via `useState<GoogleData | null>`, propagation vers `ScoreHero`.
   - Acceptance : `grep -rn "DiagnosticGoogle" components/audit/AuditDashboard.tsx` → 1 match (import + render) ; `grep -rn "google" components/audit/ScoreHero.tsx` → props/usage détectés ; bouton visible en section 4 avec input cabinet pré-rempli.

2. **Blending de la note Google dans le score** : lorsque `google?.rating` est un nombre entre 1 et 5, le score final devient :
   ```
   scoreBlended = clamp(
     scoreTaux + deltaGoogle,
     0, 100
   )
   ```
   avec :
   ```
   deltaGoogle = round( (rating − 4.0) × 5 × confidenceFactor )
   confidenceFactor = min(1, user_ratings_total / 50)   // 50+ avis = confiance pleine
   ```
   Soit : cabinet à 4.8★ avec 100 avis → delta = `round((4.8 − 4.0) × 5 × 1) = +4` points. À 3.5★ avec 30 avis → delta = `round((3.5 − 4.0) × 5 × 0.6) = −2` points. Plafonné par le clamp [0, 100] du wrapper `computeBlendedScore`.
   - Current : `computeScore` ignore Google.
   - Target : nouvelle fonction pure `computeBlendedScore(tauxNoshow, google?): number` exportée depuis `lib/score.ts`. `computeScore` reste inchangée (ne pas casser `RapportPDF` qui ne consomme pas Google).
   - Acceptance : test unitaire mental sur 4 scénarios — sans Google (delta=0), 4.8★/100 (+4), 3.5★/30 (−2), 5★/0 avis (delta=0 par confidence=0) ; clamp à [0, 100] vérifié aux bornes.

3. **Label de score distinguant les 2 modes** : `ScoreHero` affiche sous le chiffre un libellé :
   - Sans Google analysé : `"X / 100 · Score no-shows (hors Google)"`
   - Avec Google analysé : `"X / 100 · Score global (no-shows + réputation Google)"`
   Le chiffre `X` est respectivement `computeScore(taux)` et `computeBlendedScore(taux, google)`.
   - Current : ScoreHero affiche "Score X" sans mention de source.
   - Target : Libellé conditionnel sous la gauge, badge `scoreBadge` appelé avec la valeur blended.
   - Acceptance : rendering visuel sur les 2 états ; libellé différent ; pas de flash de mauvaise valeur au moment de la résolution Google.

4. **Fallback gracieux si l'API échoue** : si `/api/google-places` retourne `{ error }` ou `{ found: false }` ou timeout réseau, `DiagnosticGoogle` affiche un message utilisateur sobre (ex: "Impossible de trouver ce cabinet sur Google. Le score affiché reste basé sur vos no-shows"). Le score reste en mode "hors Google" (pas de regression, pas de spinner bloqué). La page audit ne casse pas, aucune `throw` non-catchée ne remonte.
   - Current : `DiagnosticGoogle` gère déjà `found:false` et `error` dans son state local.
   - Target : le dashboard continue de fonctionner normalement, `ScoreHero` reste en mode taux-only.
   - Acceptance : test manuel avec clé API invalide (retire `GOOGLE_PLACES_API_KEY` de `.env.local`) → message d'erreur affiché, reste de l'audit fonctionnel ; test avec nom fantaisiste ("xyzabc123 no such place") → `found:false`, message sobre.

5. **Sécurité & RGPD de la clé** : `GOOGLE_PLACES_API_KEY` reste strictement côté serveur (aucun préfixe `NEXT_PUBLIC_`), utilisée uniquement dans le handler de `app/api/google-places/route.ts`. Le frontend n'appelle jamais directement `maps.googleapis.com`. Le `.env.example` documente la variable avec commentaire. Note dans le SUMMARY : recommandation de restreindre la clé côté Google Cloud Console (referrer : domaine Vercel prod ; API : Places API uniquement).
   - Current : clé présente dans `.env.local`, absente de `.env.example` avant le commit `105a113` de cette phase.
   - Target : .env.example commenté (déjà fait dans `105a113`), aucun import client-side de la clé, logs serveur (`console.error`) ne dumpent pas la clé.
   - Acceptance : `grep -r "GOOGLE_PLACES" app/ components/ lib/` ne matche que `app/api/google-places/route.ts` ; `grep -r "AIzaSy" .` limité à `.env.local` (gitignored) ; `git log --all -S"AIzaSy"` ne retourne aucun commit ayant jamais contenu la clé.

## Boundaries

**In scope :**
- Import et rendu de `DiagnosticGoogle` dans `AuditDashboard` section 4
- Ajout `computeBlendedScore` dans `lib/score.ts`
- Propagation `GoogleData` via props depuis `AuditDashboard` vers `ScoreHero`
- Modification `ScoreHero` pour afficher le libellé conditionnel et consommer `computeBlendedScore`
- Validation que `DiagnosticGoogle` actuel (263 lignes) est à jour avec le design system clinique-claire — retouche visuelle légère si non (fond blanc, border gray-200, pastel accents si nécessaire)
- Mise à jour de `.env.example` (déjà committée dans `105a113`)

**Out of scope :**
- Analyse sémantique du contenu des avis (via Gemini / LLM) — phase future
- Graphe temporel des avis — pas assez de données dans `user_ratings_total` + `rating` pour justifier
- Response-rate aux avis, taux de réponse du cabinet — pas dans l'API Places Find Place
- Intégration Trustpilot / Pages Jaunes / Doctolib reviews — hors périmètre
- Modification de `RapportPDF.tsx` pour inclure le volet Google — le PDF reste taux-only en Phase 4 (backlog : intégrer `google` au PDF en Phase 4.5 ou plus tard)
- Cache serveur des résultats Google — pas pertinent à ce volume (1 appel/audit/utilisateur)
- Rate-limiting de la route `/api/google-places` — reporté Phase 5 (RGPD & Sécurité)
- Test Playwright E2E de l'intégration Google — reporté Phase 6 (Infra tests)

## Constraints

- **Clé serveur uniquement** : jamais exposée au client, jamais loggée dans `console.error`, jamais commitée. Vérifié via `git log --all -S"AIzaSy"` → doit rester vide.
- **Fallback non-bloquant** : si Google échoue pour quelque raison que ce soit (erreur réseau, clé invalide, quota, cabinet introuvable), le reste du dashboard fonctionne sans regression. Pas de `throw` non-gardée, pas de Suspense qui bloque la page.
- **Performance** : l'appel Google doit revenir en < 8s (déjà cappé via `AbortSignal.timeout(8000)` dans la route). L'UI affiche un spinner pendant l'attente. `maxDuration = 15` sur la route est suffisant.
- **Non-breaking** : `computeScore` existante reste inchangée et reste utilisée par `RapportPDF`. `computeBlendedScore` est additif. Aucune suppression de prop ou de champ `stats`.
- **RGPD** : le nom du cabinet transmis à Google est déjà public (donnée non sensible). Aucune donnée patient n'est envoyée à Google. Aucun log de résultat Google côté serveur (les résultats restent en réponse HTTP, pas persistés).

## Acceptance Criteria

- [ ] `components/audit/AuditDashboard.tsx` importe et rend `DiagnosticGoogle` dans la section 4 "Score cabinet", au-dessus ou à gauche de `ScoreHero`.
- [ ] `lib/score.ts` exporte `computeBlendedScore(tauxNoshow: number, google?: { rating: number | null; user_ratings_total: number } | null): number` avec la formule Requirement 2.
- [ ] `components/audit/ScoreHero.tsx` accepte une prop `google?: GoogleData | null`, utilise `computeBlendedScore` lorsque `google?.rating` est fourni, et affiche le libellé conditionnel Requirement 3.
- [ ] `npm run build` exit 0, `npm run lint` sans erreur bloquante.
- [ ] Test manuel 4 cas : sans cliquer Google (score taux-only) / Google trouvé avec rating > 4.5 (delta positif) / Google trouvé avec rating < 4.0 (delta négatif ou neutre) / Google introuvable (message sobre, score inchangé).
- [ ] `grep -r "GOOGLE_PLACES" components/ lib/ app/` → uniquement `app/api/google-places/route.ts`.
- [ ] `04-SUMMARY.md` documente : status final, commandes test manuel, recommandation restriction clé Cloud Console, note sur l'évolution `/50 → /100` du ROADMAP (réinterprétation).

## Ambiguity Report

| Dimension           | Score | Min  | Status | Notes |
|---------------------|-------|------|--------|-------|
| Goal Clarity        | 0.85  | 0.75 | PASS   | "câbler DG + ajouter computeBlendedScore + propager via props + libellé conditionnel" est mesurable. |
| Boundary Clarity    | 0.75  | 0.70 | PASS   | In/Out scope explicites ; reports phase 5 (rate-limit) / 6 (tests) / 4.5 (PDF) nommés. |
| Constraint Clarity  | 0.80  | 0.65 | PASS   | Clé serveur, 8s timeout, fallback non-bloquant, RGPD Art.9 safe (aucune donnée patient à Google). |
| Acceptance Criteria | 0.80  | 0.70 | PASS   | 7 critères binaires (imports, exports, build, test cas, grep, doc). |
| **Ambiguity**       | 0.195 | ≤0.20| PASS   | Spec serrée — downstream planner a scope + contracts + edge cases nommés. |

## Design Decisions Pre-Locked (pour discuss-phase)

1. **Échelle /100 conservée** (pas /50 → /100 comme ROADMAP) — cohérence UI avec Phase 2 shippée. Décision à documenter dans SUMMARY.
2. **Formule blending `(rating − 4.0) × 5 × confidence`** — simple, symétrique autour de 4.0 (moyenne perçue "bon cabinet"), volume pondère la confiance.
3. **`DiagnosticGoogle` opt-in** — l'utilisateur doit cliquer le bouton, pas un fetch automatique, pour respecter le pattern existant et éviter appels API inutiles.
4. **Pas de cache serveur** — le volume attendu est trop faible (1 appel / audit) pour justifier la complexité.
5. **PDF inchangé en Phase 4** — intégrer Google au PDF implique refonte `RapportPDF`, reporté.

---

*Phase: 04-google-places-api*
*Spec locked: 2026-04-24*
