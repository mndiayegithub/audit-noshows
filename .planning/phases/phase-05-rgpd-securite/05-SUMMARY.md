# Phase 5 — SUMMARY (RGPD & Sécurité)

**Status :** ✅ **CODE SHIPPÉ** — commits `8a0ba8b` (plans), `d5af5a2` (code), build + lint verts
**Date close-out :** 2026-04-24
**Spec :** `05-SPEC.md` (6 requirements, ambiguity 0.190)
**Plans :** `05-01-PLAN.md` (server hardening, 5 tasks) + `05-02-PLAN.md` (pages légales + headers, 6 tasks)

## Livrables

| # | Fichier | Rôle | Statut |
|---|---------|------|--------|
| 1 | `lib/audit-validation.ts` | `validateAuditPayload(formData)` — CSV ≤2Mo, colonnes date+statut, nom, CA, email | ✅ |
| 2 | `lib/safe-log.ts` | `logServerError(ctx, err)` — redact email + tokens ≥20 chars + tronque 200 chars | ✅ |
| 3 | `lib/rate-limit.ts` | `checkRateLimit(req, opts)` — Map in-memory par IP, fail-open | ✅ |
| 4 | `app/api/audit/route.ts` | origin allowlist + 10/10min + validation + safe-log | ✅ |
| 5 | `app/api/google-places/route.ts` | origin allowlist + 30/10min + safe-log | ✅ |
| 6 | `app/politique-confidentialite/page.tsx` | 8 sections RGPD dont Art. 9 | ✅ |
| 7 | `app/mentions-legales/page.tsx` | Éditeur + hébergeurs Vercel/Hostinger + PI | ✅ |
| 8 | `components/Footer.tsx` | Liens vers pages légales + © année courante | ✅ |
| 9 | `app/layout.tsx` | Footer importé + `flex-col` sur body | ✅ |
| 10 | `app/audit/page.tsx` | "Conforme RGPD" → `<Link>` vers politique | ✅ |
| 11 | `next.config.js` | 4 security headers | ✅ |

## Build

```
Route (app)                           Size     First Load JS
┌ ○ /                                 2.55 kB  143 kB
├ ○ /_not-found                       876 B    88.5 kB
├ ƒ /api/audit                        0 B      0 B
├ ƒ /api/google-places                0 B      0 B
├ ○ /audit                            75.5 kB  221 kB
├ ○ /mentions-legales                 147 B    87.7 kB
└ ○ /politique-confidentialite        147 B    87.7 kB
```

Exit 0. Lint : seulement les warnings pré-existants `<img>` des composants landing (non-Phase 5).

## Surface d'attaque analysée

| Vecteur | Mitigation |
|---------|------------|
| CSV upload (XSS, bomb, injection) | `validateAuditPayload` : taille 2 Mo max, colonnes obligatoires, rejet 400 avant forward n8n |
| Google Places API key exposure | Server-side only (`process.env`), jamais loggée grâce à `safe-log` (token ≥20 chars redact) |
| Log leakage (email, tokens) | `logServerError` redact emails + long tokens + tronque 200 chars |
| Rate abuse `/api/audit` | 10 req/10 min/IP → 429 + `Retry-After` |
| Rate abuse `/api/google-places` | 30 req/10 min/IP → 429 + `Retry-After` |
| CSRF (cross-origin POST) | Check `origin`/`referer` sur les 2 routes → 403 si non autorisé (whitelist: localhost, 127.0.0.1, vercel.app, perfiamatic.fr) |
| MIME sniffing | `X-Content-Type-Options: nosniff` |
| Clickjacking | `X-Frame-Options: DENY` |
| Leak de referer vers 3rd party | `Referrer-Policy: strict-origin-when-cross-origin` |
| Downgrade attack | `Strict-Transport-Security: max-age=63072000; includeSubDomains` |
| Session/cookie hijacking | N/A — app stateless, aucun cookie posé |
| XSS via user content | React escapes par défaut + `ReactMarkdown` (composants whitelistés, pas `dangerouslySetInnerHTML`) |

## Test manuel à effectuer (user)

1. `npm run dev` → ouvrir `/politique-confidentialite` + `/mentions-legales` → pages rendues OK.
2. Ouvrir `/` (landing) puis `/audit` → footer visible sur les 2 avec les 2 liens légaux cliquables.
3. **Validation CSV** : uploader un CSV vide → message `"CSV vide ou invalide"`. Uploader un CSV sans colonne `date` → `"Colonnes manquantes"`. Laisser CA à 0 → `"CA moyen invalide"`.
4. **Rate limit** : POST `/api/audit` 11× rapides depuis `curl` avec header `-H "Origin: http://localhost:3000"` → 11ème réponse = 429 avec header `Retry-After`.
5. **Origine bloquée** : `curl -X POST localhost:3000/api/audit` sans header Origin → 403.
6. **Security headers** : `curl -I localhost:3000/` → voir `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Strict-Transport-Security`.
7. **Flow end-to-end** : parcours complet CSV → audit → rapport toujours fonctionnel (pas de regression).

## 🟡 Actions recommandées (user, hors-code)

### 1. DPA (Data Processing Agreement)
- **Vercel** : DPA standard auto-accepté à l'inscription (consultable sur `vercel.com/legal/dpa`). Rien à signer.
- **Hostinger (n8n)** : signer un DPA formel → ouvrir un ticket support Hostinger pour demander leur DPA entreprise. **Important pour couvrir le transfert des CSV d'audit**.
- **Google Cloud (Places API)** : DPA couvert par les CGU Cloud, mais vérifier que le compte est bien en région UE pour éviter les transferts hors-UE.

### 2. Mentions légales — champs à compléter
- SIREN / forme juridique → remplacer `[à compléter]` dans `app/mentions-legales/page.tsx` lignes 14-15 avant prod.
- Médiateur de la consommation (si applicable au statut juridique).

### 3. Rotation clé Google Places (reminder Phase 4)
Clé `AIzaSy…` passée en clair dans la session chat. Rotation + restriction Cloud Console (referrer + Places-only) toujours pending.

## Décisions clés (locked)

- **D-01** : Rate-limit **in-memory** (pas Upstash/KV) — trafic actuel faible, migration documentée si multi-region.
- **D-02** : Limite CSV **2 Mo** (≈10 Mo = 3 ans d'export cabinet). Large marge.
- **D-03** : Logs **non-structurés** (`console.error` avec scrub). Refonte `pino`/`winston` hors scope.
- **D-04** : Check origin **simple whitelist** (pas de signed CSRF tokens) — suffisant car app stateless, pas d'auth session.
- **D-05** : **Pas de cookie banner** — aucun cookie tracking posé (pas d'analytics, pas de pixel).
- **D-06** : Pages légales **React statique** — pas de CMS, édition directe dans le code.
- **D-07** : Mentions légales avec `[à compléter]` pour SIREN — structure en place, l'user remplit les champs business.
- **D-08** : **Fail-open** sur exception dans `rate-limit` — meilleur que fail-closed qui 429 des users légitimes si store corrompu.

## Suite / backlog

- **Phase 6** : tests Vitest + Playwright, incl. tests des validations 400/403/429.
- **Phase 7** : Content Security Policy (CSP) stricte après inventaire des 3rd parties (Calendly iframe, Google Places host, n8n webhook).
- **Post-MVP** : passer rate-limit à Upstash/Vercel KV si scale multi-region.
- **Post-MVP** : passer logs à structuré (`pino` + Datadog/Logtail) si observability devient critique.

---

*Phase 5 closed: 2026-04-24 — code shipped, build/lint OK, user action = compléter SIREN + signer DPA Hostinger + test manuel.*
