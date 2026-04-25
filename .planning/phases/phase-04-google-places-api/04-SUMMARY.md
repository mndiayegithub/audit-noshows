# Phase 4 — SUMMARY

**Status :** ✅ **CODE SHIPPÉ** — commit `7ccace0`, build + lint verts
**Date close-out :** 2026-04-24
**Spec :** `04-SPEC.md` (5 requirements, ambiguity 0.195)
**Plan :** `04-01-PLAN.md` (3 tasks, wave 1)

## Livrables

| # | Artefact | Statut | Commit |
|---|----------|--------|--------|
| 1 | `lib/score.ts` — ajout `computeBlendedScore` | ✅ | `7ccace0` |
| 2 | `components/audit/ScoreHero.tsx` — prop `google`, libellé conditionnel | ✅ | `7ccace0` |
| 3 | `components/audit/AuditDashboard.tsx` — câblage `DiagnosticGoogle` + state | ✅ | `7ccace0` |
| 4 | `components/audit/DiagnosticGoogle.tsx` — DA retouche clinique-claire | ✅ | `7ccace0` |
| 5 | `.env.example` — doc `GOOGLE_PLACES_API_KEY` | ✅ | `105a113` (phase-4 setup) |

## Formule blending (locked)

```ts
computeBlendedScore(taux, google) =
  clamp(computeScore(taux) + round((rating − 4.0) × 5 × confidence), 0, 100)
confidence = min(1, max(0, user_ratings_total / 50))
```

**Exemples :**
- `taux=10` seul → `score = 68`
- `taux=10` + 4.8★ / 100 avis → `68 + round(0.8×5×1) = 68 + 4 = 72`
- `taux=10` + 3.5★ / 30 avis → `68 + round(−0.5×5×0.6) = 68 − 2 = 66`
- `taux=10` + 5★ / 0 avis → `68 + 0 = 68` (confidence=0, delta neutre)

## DA retouche DiagnosticGoogle (aligné clinique-claire)

**Avant :** `bg-white rounded-3xl border border-slate-100 border-t-4 border-t-primary shadow-soft` + H2 interne + `btn-glow` + `bg-primary` (bleu #0ea5e9).
**Après :** `bg-white rounded-3xl border border-gray-200 p-7` + H3 (évite duplication de l'H2 de la section 4) + bouton `bg-primaryDark` (#064E3B) sans glow/shadow-lg, impact-card en `bg-kpiSignal/40` (émeraude pastel cohérent avec le ring ScoreHero).

## Build

```
Route (app)               Size     First Load JS
└ ○ /audit                75.4 kB  221 kB         (+4 kB vs Phase 3 pour framer-motion/DiagnosticGoogle/lucide-react)
└ ƒ /api/google-places    0 B      0 B
```

## Test manuel requis (user)

1. `npm run dev` → ouvrir `/audit` → uploader un CSV → section 4 affichée.
2. **Sans cliquer "Lancer l'analyse"** → score = `computeScore(taux)`, libellé `"Score no-shows (hors Google)"`.
3. **Cliquer "Lancer l'analyse"** avec nom cabinet existant → Google Places répond, score bascule sur `computeBlendedScore`, libellé `"Score global (no-shows + réputation Google)"`.
4. **Nom fantaisiste** ("xyzabc123 no such place") → message `"Cabinet non trouvé — essayez un nom plus précis"`, score reste en mode hors-Google.
5. **Simuler échec API** (retirer temporairement `GOOGLE_PLACES_API_KEY` de `.env.local` + restart dev) → message `"Analyse temporairement indisponible"`, score reste hors-Google.

## 🟡 Actions recommandées (user, hors scope Phase 4)

### 1. Rotation + restriction de la clé API Google (IMPORTANT)

La clé `AIzaSyDXHOsqjeNHJOOjIF6qwOI9RdgeC43Libw` a transité en clair dans cette session de chat. **Rotation recommandée** :

1. Aller sur [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. **Supprimer** l'ancienne clé (ou la régénérer)
3. Créer une nouvelle clé et la **restreindre** :
   - **Application restrictions :** HTTP referrers → `*.vercel.app/*` + domaine prod final
   - **API restrictions :** Places API uniquement (pas Maps/Geocoding)
4. Mettre à jour `.env.local` (dev) + Vercel env vars (prod) : `GOOGLE_PLACES_API_KEY=<nouvelle_clé>`

### 2. Vérifier qu'aucun commit n'a jamais contenu la clé

```bash
git log --all -S"AIzaSy" --oneline    # doit retourner vide
```

## Décisions clés

- **D-01** : Échelle `/100` conservée (réinterprétation de ROADMAP §4 qui disait `/50 → /100`). Phase 2 a déjà shippé `/100` pur taux ; Phase 4 change la formule (blending), pas l'échelle.
- **D-02** : `computeScore` **inchangée** — continue d'être consommée par `RapportPDF.tsx`. `computeBlendedScore` est additive.
- **D-03** : `DiagnosticGoogle` **opt-in** (clic utilisateur), pas de fetch auto.
- **D-04** : **Pas de cache serveur** Google Places (1 appel / audit).
- **D-05** : **PDF inchangé en Phase 4** — intégrer Google au PDF = refonte `RapportPDF`, reporté (backlog Phase 4.5).

## Suite / backlog

- **Phase 4.5 (opt.)** : intégrer le volet Google dans `RapportPDF.tsx` (score blended + note/avis affichés).
- **Phase 5** : rate-limit `/api/google-places` + RGPD formel.
- **Phase 6** : tests E2E Playwright du flux Google (found / not_found / error).

---

*Phase 4 closed: 2026-04-24 — code shipped, build/lint OK, user action = test manuel + rotation clé API.*

## Validation UAT (2026-04-26)

✅ **Phase 4 validée par utilisateur.** Tests manuels OK.

Fix additionnel post-validation :
- `RapportPDF.tsx` — pagination propre quand la synthèse Google est présente (commit `9f138cc`) : `wrap={false}` sur Score / Google card / Plan cards / CTA, `break` conditionnel avant "Plan d'action" si `hasGoogle`, `minPresenceAhead` sur les titres markdown.
