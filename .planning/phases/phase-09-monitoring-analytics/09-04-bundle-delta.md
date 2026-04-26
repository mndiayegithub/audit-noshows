# Phase 9 — Bundle Delta (AC-4)

| Metric | Baseline (09-01) | After (09-04) | Delta | AC-4 (≤ +5 KB) |
|---|---|---|---|---|
| Route `/` First Load JS | 160 kB | 162 kB | **+2 kB** | PASS |
| Route `/` Page size | 19.3 kB | 20.3 kB | +1.0 kB | (info) |
| Route `/audit` First Load JS | 242 kB | 243 kB | +1 kB | (info) |
| Route `/audit` Page size | 95.8 kB | 96.4 kB | +0.6 kB | (info) |
| First Load JS shared by all | 87.6 kB | 87.6 kB | 0 kB | (info) |

Mesure : `npm run build` (Next.js 14 — values reported by Next build output, KB compressed; `First Load JS` est proche du gzipped strict).
Date : 2026-04-26.
Node version : v20.20.2.
Commande exacte :
```bash
rm -rf .next
npm run build
```

## Analyse

L'instrumentation Vercel Analytics + Speed Insights (Plan 09-02) ajoute **+2 kB** au First Load JS de la route `/` (landing). Ce delta est largement sous le seuil AC-4 de +5 KB.

Le shared chunk total reste identique (87.6 kB) — les bundles `@vercel/analytics/next` et `@vercel/speed-insights/next` sont chargés dans les chunks de page, pas dans le shared common bundle, ce qui est cohérent avec l'import effectué dans `app/layout.tsx` (RSC component injectant les `<Analytics />` / `<SpeedInsights />` côté client).

## Verdict

**AC-4 : PASS** (delta route `/` = +2 kB, seuil = +5 KB).

Aucune investigation supplémentaire requise. R5 satisfaite.
