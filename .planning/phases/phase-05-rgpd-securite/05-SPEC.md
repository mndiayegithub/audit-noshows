# Phase 5 : RGPD & Sécurité — Specification

**Created:** 2026-04-24
**Ambiguity score:** 0.190 (gate ≤ 0.20) — PASS (auto)
**Requirements:** 6 locked

## Goal

Durcir la conformité RGPD (Art. 9 données de santé) et la sécurité du pipeline audit : valider rigoureusement le CSV côté serveur avant forward n8n, nettoyer les logs Vercel de toute donnée sensible, exposer une page **politique de confidentialité + mentions légales** liée depuis le footer, ajouter un rate-limit simple aux routes API publiques, documenter la surface d'attaque. Le tout sans casser le parcours utilisateur existant.

## Background

État actuel du pipeline (audit réalisé lors de la phase 5 spec) :
- `app/api/audit/route.ts` (80 lignes) fait un pur proxy `multipart/form-data` → n8n webhook. **Aucune validation** : pas de check taille, pas de check mime, pas de vérification des colonnes CSV, pas de rejet de CSV anormal. La seule limite est `maxDuration = 60`.
- Les champs envoyés par le client (`app/audit/page.tsx` lignes 64-68) sont `csv` (string), `nom_cabinet`, `ca_moyen`, `email?`. Pas de File upload — c'est le texte du CSV qui est transmis en field texte.
- `console.error("Erreur API audit:", error)` (ligne 69) et `console.error("Erreur Google Places API:", error)` peuvent potentiellement dumper le message d'erreur contenant des segments de CSV ou des noms de cabinet dans les logs Vercel.
- Il n'existe **aucune page** `/mentions-legales`, `/privacy`, `/politique-confidentialite` — `ls app/` ne montre que `api/`, `audit/`, `globals.css`, `layout.tsx`, `page.tsx`.
- La landing `app/page.tsx` n'a **aucune mention RGPD visible** (grep retourne 0 matches).
- La page `/audit` affiche déjà une mention micro-copy : `"Chiffrement 256-bit · Conforme RGPD · Aucun nom patient stocké"` (ligne 257) — à garder / renforcer.
- Aucun rate-limit ni CSRF token sur les 2 routes API publiques. Next.js 14 + fetch same-origin protège partiellement contre CSRF cross-site mais un script tiers sur le domaine pourrait spammer.
- REQ-4 dans `.planning/REQUIREMENTS.md` : "Aucun nom de patient dans les graphes/synthèse. Validation CSV côté serveur. Logs sans données sensibles. Mention RGPD visible."

La robustesse côté n8n (parsing CSV, filtrage) est hors scope : cette phase traite la **première ligne de défense** Next.js avant le forward.

## Requirements

1. **Validation serveur stricte du CSV dans `/api/audit`** : avant tout forward vers n8n, la route doit valider :
   - **Taille** : le champ `csv` (string) ≤ 2 Mo (soit ~2 000 000 caractères). Au-delà → `400 { error: "CSV trop volumineux (max 2 Mo)" }`.
   - **Non-vide** : `csv` présent et contient au moins une ligne d'en-tête + 1 ligne de données. Sinon → `400 { error: "CSV vide ou invalide" }`.
   - **Colonnes obligatoires** : la première ligne (séparateur `,` ou `;` auto-détecté) doit contenir au minimum les en-têtes `date` (ou `Date`) et `statut` (ou `Statut`/`status`) — matching insensible à la casse après trim. Sinon → `400 { error: "Colonnes manquantes : date et/ou statut introuvables" }`.
   - **`nom_cabinet`** : string non-vide après trim, longueur ≤ 120. Sinon → `400 { error: "Nom cabinet invalide" }`.
   - **`ca_moyen`** : doit parser en nombre fini > 0 et ≤ 10 000. Sinon → `400 { error: "CA moyen invalide" }`.
   - **`email?`** : si fourni, doit matcher une regex email simple (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`) ET longueur ≤ 254. Sinon → `400 { error: "Email invalide" }`.
   - Current : aucune de ces validations n'existe.
   - Target : une fonction `validateAuditPayload(formData)` extraite dans `lib/audit-validation.ts` (pur, testable) qui retourne `{ ok: true, values }` ou `{ ok: false, error, field? }`. La route appelle cette fonction avant le fetch n8n.
   - Acceptance : `grep -n "validateAuditPayload" app/api/audit/route.ts lib/audit-validation.ts` → matches dans les 2 fichiers ; upload manuel d'un CSV 3 Mo → 400 ; upload d'un CSV sans en-tête `date` → 400 ; `ca_moyen=-10` → 400.

2. **Logs serveur sans données sensibles** : les `console.error` des 2 routes API (`/api/audit`, `/api/google-places`) ne doivent **jamais** dumper :
   - Le contenu brut du CSV (potentiellement des noms patients).
   - Le `nom_cabinet` complet (donnée identifiante).
   - L'email utilisateur.
   - La clé `GOOGLE_PLACES_API_KEY` (ou tout token).
   Un helper `logServerError(context, err)` dans `lib/safe-log.ts` doit logger : `[context] <error.name>: <error.message sanitized>` où `message sanitized` = message tronqué à 200 chars + regex-redact des patterns d'email (`/\S+@\S+\.\S+/g` → `[email]`) + redact des séquences ≥ 20 caractères alphanumériques mixtes (clés type `AIzaSy…`).
   - Current : `console.error("Erreur API audit:", error)` logge l'objet `error` complet.
   - Target : les 2 routes utilisent `logServerError("api/audit", error)` / `logServerError("api/google-places", error)`.
   - Acceptance : `grep -rn "console.error" app/api/` → 0 matches ; `grep -rn "logServerError" app/api/` → 2 matches ; test manuel : trigger une erreur avec email dans le message → log final ne contient pas l'email en clair.

3. **Rate-limit basique sur `/api/audit` et `/api/google-places`** : rate-limit en mémoire process (suffisant pour un déploiement Vercel serverless single-region à ce volume) via `lib/rate-limit.ts` :
   - Clé = IP (`x-forwarded-for` premier segment, fallback `unknown`).
   - Limite : **10 requêtes / 10 minutes** sur `/api/audit`, **30 requêtes / 10 minutes** sur `/api/google-places`.
   - Dépassement → `429 { error: "Trop de requêtes, réessayez dans quelques minutes" }` + header `Retry-After` en secondes.
   - Current : aucun rate-limit.
   - Target : les 2 routes appellent `checkRateLimit(request, { max, windowMs })` en tout début de handler.
   - Acceptance : `grep -n "checkRateLimit" app/api/audit/route.ts app/api/google-places/route.ts` → matches ; test manuel : 11 POST `/api/audit` rapides depuis même IP → 11ème renvoie 429.

4. **Page `/politique-confidentialite` + `/mentions-legales` + lien footer** : 2 pages statiques MD-like en React (App Router) avec contenu minimal mais complet :
   - `/politique-confidentialite` : finalité du traitement (audit no-shows), données collectées (CSV rdv + cabinet + email optionnel), base légale (consentement + intérêt légitime), durée de conservation (CSV non stocké, supprimé après traitement ; nom cabinet + email conservés sur demande de rapport), destinataires (n8n hostinger, Google Places si opt-in, Calendly si prise de RDV, éventuellement email SMTP), droits (accès/rectification/suppression via email contact), DPO (mndiayepro97@gmail.com). Mention **Art. 9 RGPD** : les données transmises sont des métadonnées de rendez-vous (date, statut, heure), **aucune donnée de santé identifiante** n'est envoyée à la plateforme.
   - `/mentions-legales` : éditeur (PerfIAmatic / Mouhamed Ndiaye), hébergeur (Vercel Inc. + Hostinger pour n8n), contact, n° SIREN si applicable (mettre `[à compléter]` si non-ready).
   - Footer ajouté à `app/layout.tsx` (ou composant `components/Footer.tsx` rendu dans layout) avec liens vers ces 2 pages + © année en cours + mention `PerfIAmatic`.
   - Current : pas de footer, pas de pages légales.
   - Target : 2 nouveaux fichiers `app/politique-confidentialite/page.tsx` + `app/mentions-legales/page.tsx` + `components/Footer.tsx` importé dans `app/layout.tsx`.
   - Acceptance : `ls app/politique-confidentialite/page.tsx app/mentions-legales/page.tsx components/Footer.tsx` → 3 fichiers ; visite `/politique-confidentialite` et `/mentions-legales` → rendu OK ; footer présent sur landing + audit avec 2 liens fonctionnels.

5. **Mention RGPD visible dans le flow utilisateur** : ajouter sur la landing (près du CTA primaire ou dans le footer) une phrase courte : `"Vos données sont traitées conformément au RGPD. Aucune donnée patient identifiante n'est collectée. En savoir plus."` avec "En savoir plus" → lien vers `/politique-confidentialite`. Renforcer la mention existante sur `/audit` ligne 257 (déjà `"Chiffrement · Conforme RGPD · Aucun nom patient stocké"`) en y ajoutant un lien cliquable vers `/politique-confidentialite`.
   - Current : `/audit` a un micro-copy, landing n'en a aucun.
   - Target : landing contient 1 mention RGPD (dans un composant de section existant ou dans le footer) ; `/audit` ligne 257 a un lien `<Link>` vers la politique.
   - Acceptance : `grep -rn "RGPD\|politique-confidentialite" app/page.tsx components/landing/` → ≥ 1 match ; `grep -n "politique-confidentialite" app/audit/page.tsx` → 1 match.

6. **Durcissement général + documentation** :
   - **CSRF** : vérifier que les routes `/api/audit` et `/api/google-places` n'acceptent que des POST (pour `/api/audit`) et GET (pour `/api/google-places`) ; le POST vérifie le header `origin` ou `referer` ET rejette si absent ou si ne matche pas le domaine de prod (`audit.perfiamatic.fr`, preview Vercel `*.vercel.app`, ou `localhost` en dev). Dépassement → `403 { error: "Origine non autorisée" }`.
   - **Header de sécurité** : ajouter dans `next.config.js` (ou `next.config.ts` équivalent) les headers : `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Strict-Transport-Security: max-age=63072000; includeSubDomains` (prod only, via env gating si nécessaire).
   - **Documentation** : `05-SUMMARY.md` expose un tableau "Surface d'attaque analysée" recensant : CSV upload (limité via REQ-1), Google Places (limité via REQ-3), email user (validé via REQ-1, transmis à n8n SMTP), clés API (server-only via env), session/cookies (aucun — app stateless), XSS (React escapes par défaut + pas de `dangerouslySetInnerHTML` hors `ReactMarkdown` contrôlé). Note DPA : recommandation de signer un DPA avec Hostinger (n8n hébergé) ET vérifier le DPA Vercel standard.
   - Current : aucun check origin ; aucun header custom ; aucune doc.
   - Target : origin-check dans les 2 routes ; headers dans `next.config.js` ; tableau DPA dans SUMMARY.
   - Acceptance : `grep -n "origin\|referer" app/api/audit/route.ts` → match ; `grep -n "X-Content-Type-Options\|X-Frame-Options" next.config.*` → matches ; `05-SUMMARY.md` contient la section "Surface d'attaque" avec ≥ 6 lignes.

## Boundaries

**In scope :**
- `lib/audit-validation.ts` (nouveau) + intégration dans `app/api/audit/route.ts`
- `lib/safe-log.ts` (nouveau) + remplacement des 2 `console.error` des routes API
- `lib/rate-limit.ts` (nouveau) + intégration dans les 2 routes
- `app/politique-confidentialite/page.tsx` + `app/mentions-legales/page.tsx` + `components/Footer.tsx` + import dans `app/layout.tsx`
- Mention RGPD + lien dans landing + `/audit`
- Check origin/referer + headers sécurité dans `next.config.*`
- `05-SUMMARY.md` avec surface d'attaque

**Out of scope :**
- Véritable store distribué pour le rate-limit (Upstash / Vercel KV) — reporté si usage augmente
- Consent management platform (OneTrust, Cookiebot) — l'app ne pose pas de cookies tiers à ce stade
- Tests automatisés (Vitest/Playwright) des validations → Phase 6
- Banner cookies — aucun cookie tracking n'est posé aujourd'hui
- CAPTCHA — reporté si spam réel constaté
- SOC2 / ISO27001 formalization — hors échelle produit
- Chiffrement au repos des CSV (ils ne sont pas stockés, donc N/A)
- DPA formel signé avec Hostinger/Vercel — action hors-code, mentionné dans SUMMARY comme recommandation
- Audit pentesting externe — reporté Phase 7
- Content Security Policy (CSP) stricte — reporté phase déploiement (besoin de mapper les 3rd parties : Calendly iframe, Google Places proxy, n8n domain)

## Constraints

- **Pas de breaking change utilisateur** : les CSV valides actuels doivent continuer à passer. La validation REQ-1 est additive et ne rejette que les payloads manifestement invalides (vide, trop gros, colonnes absentes, valeurs impossibles).
- **Performance** : validation CSV purement synchrone en mémoire (pas de streaming). Avec une limite 2 Mo, le coût est ~ms, négligeable vs les ~30 s de n8n.
- **Rate-limit in-memory** : accepté pour la phase actuelle (single-region Vercel). Le SUMMARY note que si le déploiement passe en multi-region, passer à Upstash/KV. Aucune perte de DX locale : compteur reset à chaque redémarrage dev.
- **Pas de log structuré** (JSON, Datadog) : `console.error` est conservé comme surface, seul le contenu est scrubé. Passage à `pino`/`winston` hors scope.
- **Pas de dépendance runtime ajoutée** : tout le code Phase 5 est écrit à la main (pas d'import `zod`, pas de `helmet` équivalent — Next.js gère les headers nativement via `next.config`). Exception tolérée : si une regex email ultra-stricte est souhaitée plus tard, un lib externe sera justifié, pas maintenant.
- **Fallback non-bloquant** : si le rate-limit store est dysfonctionnel (ex. Map corrompue après un very-hot-reload en dev), la route fail-open (laisser passer) plutôt que fail-closed. Commentaire dans le code pour documenter ce choix.
- **Pas d'exposition des clés** : vérifier par `git log -S"AIzaSy"` que la clé Places n'a jamais été commitée. (Vérifié dans Phase 4, à re-vérifier dans SUMMARY.)
- **Timezone Europe/Paris** pour la mention `©2026` dans le footer (année courante calculée `new Date().getFullYear()`).

## Acceptance Criteria

- [ ] `lib/audit-validation.ts` exporte `validateAuditPayload(formData: FormData): { ok: true; values: {...} } | { ok: false; error: string }`, couvre les 6 validations REQ-1.
- [ ] `app/api/audit/route.ts` appelle `validateAuditPayload` en première instruction du handler, renvoie 400 si `!ok`.
- [ ] `lib/safe-log.ts` exporte `logServerError(context: string, err: unknown): void` avec redaction email + long-secret.
- [ ] 2 routes API n'utilisent plus `console.error` directement (`grep -rn "console.error" app/api/` → 0 match).
- [ ] `lib/rate-limit.ts` exporte `checkRateLimit(request, opts): { allowed: boolean; retryAfterSec?: number }`, store `Map<ip, {count, windowStart}>`.
- [ ] 2 routes appellent `checkRateLimit` avant tout autre travail, renvoient 429 + `Retry-After` si bloquées.
- [ ] `app/politique-confidentialite/page.tsx` + `app/mentions-legales/page.tsx` existent, rendent un contenu non-vide avec les sections listées dans REQ-4.
- [ ] `components/Footer.tsx` existe, est importé dans `app/layout.tsx`, rendu sur TOUTES les pages (landing + audit + légales).
- [ ] Footer contient 2 liens cliquables (`Link` Next.js) vers les pages légales + `©{year} PerfIAmatic`.
- [ ] Landing (`app/page.tsx` ou composant de section existant) mentionne RGPD avec lien vers `/politique-confidentialite`.
- [ ] `/audit` ligne 257 (approx.) a un lien `Link` vers `/politique-confidentialite` sur la mention existante.
- [ ] 2 routes API vérifient `origin` ou `referer`, rejettent 403 si absent ou non autorisé.
- [ ] `next.config.js` (ou `.ts`) exporte `headers()` avec les 4 headers de sécurité listés dans REQ-6.
- [ ] `npm run build` exit 0, `npm run lint` sans nouvelle erreur bloquante.
- [ ] `05-SUMMARY.md` contient la section "Surface d'attaque analysée" ≥ 6 lignes + recommandation DPA.
- [ ] Test manuel : upload CSV 3 Mo → 400 ; spam `/api/audit` 11× → 429 ; visite `/politique-confidentialite` → contenu OK ; footer visible sur landing et audit.

## Ambiguity Report

| Dimension           | Score | Min  | Status | Notes |
|---------------------|-------|------|--------|-------|
| Goal Clarity        | 0.85  | 0.75 | PASS   | 6 requirements binaires (validate, log-scrub, rate-limit, pages légales, mention RGPD, durcissement/doc). |
| Boundary Clarity    | 0.75  | 0.70 | PASS   | In/Out explicites : pas de Upstash, pas de cookie banner, pas de CSP full, pas de tests auto (→ phase 6). |
| Constraint Clarity  | 0.80  | 0.65 | PASS   | Pas de breaking change, rate-limit in-memory accepté, pas de nouvelle dépendance runtime, fail-open si store down. |
| Acceptance Criteria | 0.80  | 0.70 | PASS   | 16 critères grep-able / test-able (fichiers existent, symbols présents, routes rejettent 400/403/429, build OK). |
| **Ambiguity**       | 0.190 | ≤0.20| PASS   | Downstream planner a contracts, fichiers cibles, limites numériques, messages d'erreur FR. |

## Design Decisions Pre-Locked

1. **Rate-limit in-memory** (pas Upstash/KV) — trafic actuel faible, éviter dépendance cloud supplémentaire. Migration documentée dans SUMMARY pour le jour où ça bouge.
2. **Limite CSV à 2 Mo** — largement au-dessus des volumes réels (un an de RDV Doctolib pour un cabinet ≈ 100-300 Ko). Marge pour les gros cabinets / 3-ans export.
3. **Logs non-structurés (`console.error`)** — pas de refonte logging cette phase. Seul le contenu est scrubé.
4. **Check origin simple** (whitelist domaines) — pas de signed CSRF tokens. Suffisant car pas d'auth session, pas d'action destructrice cross-user.
5. **Pas de cookie banner** — zéro cookie tracking actuellement (ni analytics, ni Meta pixel). S'il y en a plus tard, refonte dédiée.
6. **Pages légales en React statique** — pas de CMS, pas de MDX. Texte en JSX, facile à éditer.
7. **Mentions légales minimales avec `[à compléter]`** pour SIREN — l'user remplit les champs business lui-même après déploiement, la structure est en place.
8. **DPA** — mention dans SUMMARY, action user hors-code.

---

*Phase: 05-rgpd-securite*
*Spec locked: 2026-04-24*
