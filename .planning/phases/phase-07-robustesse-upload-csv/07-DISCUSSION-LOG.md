# Phase 7: Robustesse upload CSV — Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-26
**Phase:** 07-robustesse-upload-csv
**Areas discussed:** CSV parser, Preview UX, Modal dégradé, Catalogue fixtures, UI erreurs, Seuils centraux, Mock e2e

---

## CSV parser

| Option | Description | Selected |
|---|---|---|
| papaparse | Standard de facto JS, robuste, ~30 KB gzipped, auto-détection séparateur | ✓ |
| Port custom du parseur n8n | Re-utilisation 1:1 de la logique n8n, ~80 lignes TS | |
| csv-parse synchroneous | Plus léger que papaparse mais moins riche | |
| Pas de lib — split + parse manuel | Parsing maison ultra-léger | |

**User's choice:** papaparse (Recommended)
**Notes:** User explicitly delegated implementation choices to Claude — decision based on maturity, robustness, and coverage of the 3 sources.

---

## Preview UX

| Option | Description | Selected |
|---|---|---|
| Section inline qui remplace la dropzone | Cohérent avec le pattern actuel, mobile-friendly | ✓ |
| Modal centré par-dessus la page | Ajoute une dépendance Dialog | |
| Split view dropzone gauche / preview droite | Plus rich mais consomme de l'espace | |
| Step supplémentaire dans le flow linéaire | Alourdit le parcours | |

**User's choice:** Section inline (Recommended)
**Notes:** Cohérence visuelle avec le reste du flow upload, élimine les abandons silencieux pendant les 30-50s d'attente.

---

## Modal dégradé

| Option | Description | Selected |
|---|---|---|
| Dialog Radix UI | Accessibilité ARIA + focus trap natifs, ~10 KB | ✓ |
| Modal ad hoc Tailwind + useEffect focus trap | 0 dép, risque accessibilité | |
| shadcn/ui Dialog | Init shadcn requis, scope plus large | |
| Composant inline (pas de modal) | Plus simple mais moins disruptif | |

**User's choice:** Radix Dialog (Recommended)
**Notes:** Composant interruptif → focus trap critique. Réutilisable pour futurs dialogues.

---

## Catalogue fixtures

| Option | Description | Selected |
|---|---|---|
| Script Node générateur paramétré | Reproductible, extensible, ~200 lignes | ✓ |
| Fixtures crafted à la main | 12 fichiers manuels, drift impossible à contrôler | |
| Hybride : généré + 3 captures réelles | Pas de corpus réel disponible (confirmé round 1) | |
| Capture des executions n8n existantes | Cas valides uniquement, manque les fails | |

**User's choice:** Script générateur (Recommended)
**Notes:** Reproductibilité + extensibilité quand on collectera des cas réels en prod.

---

## UI erreurs

| Option | Description | Selected |
|---|---|---|
| Carte d'erreur inline avec hint actionnable | Cohérent avec D-02, garde le contexte | ✓ |
| Toast + retry implicite | L'info se perd vite | |
| Page d'erreur dédiée | Casse le flow | |
| Modal d'erreur avec details collapsibles | Réutiliserait le Radix mais plus disruptif | |

**User's choice:** Carte inline (Recommended)
**Notes:** Mapping code → titre/hint actionnable défini pour les 5 codes (voir CONTEXT.md D-05).

---

## Seuils centraux

| Option | Description | Selected |
|---|---|---|
| Nouveau lib/audit-thresholds.ts | Single source of truth, partagé front + back | ✓ |
| Constants en tête de lib/audit-validation.ts | Mutualisation avec MAX_CSV_BYTES etc. | |
| Variables d'environnement | Overkill pour 3 valeurs métier | |
| Hardcodé inline aux 2 endroits | Drift garanti | |

**User's choice:** lib/audit-thresholds.ts (Recommended)
**Notes:** L'utilisateur a annoncé qu'il voudra resserrer 90 % → 95 % après obs prod. Une constante centrale rend ce changement trivial.

---

## Mock n8n e2e

| Option | Description | Selected |
|---|---|---|
| Mock route /api/audit avec page.route() | Déterministe, < 1s/spec, offline-capable | ✓ |
| Mock direct du webhook n8n | Plus proche du réel mais ajoute la couche /api/audit | |
| Hit n8n live avec fixtures réelles | Lent (30-50s/spec), flaky | |
| MSW (Mock Service Worker) | Surdimensionné pour 3 specs | |

**User's choice:** page.route() (Recommended)
**Notes:** Trade-off accepté : la chaîne `/api/audit → n8n` n'est pas testée en e2e. Mitigé par les tests Vitest unit sur lib/n8n-normalize.ts (déjà couvert) et lib/audit-validation.ts (Phase 6).

---

## Claude's Discretion

L'utilisateur a explicitement délégué les 7 choix d'implémentation à Claude (« je n'ai aucune idée, j'ai juste suivi ta recommandation, pour cette partie, je te laisse vraiment le libre arbitre »). Les décisions reflètent toutes les options "Recommended" présentées par Claude. Les détails fins non tranchés (style boutons, wording final, ordre des hints, copy modal, choix d'icônes lucide) sont arbitrés en plan-phase / execute en respectant la palette clinique-claire.

## Deferred Ideas

Voir la section `<deferred>` de CONTEXT.md pour la liste complète. Highlights :
- Auto-repair LLM (rétracté par l'utilisateur)
- Détection encodage Latin-1 → UTF-8 (backlog)
- Auto-skip métadata header (backlog)
- Telemetry server-side error_code (Phase 9)
- Resserrement seuil 90 % → 95 % (opérationnel post-launch)
