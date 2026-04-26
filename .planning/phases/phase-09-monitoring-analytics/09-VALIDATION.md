---
phase: 9
slug: monitoring-analytics
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-26
---

# Phase 9 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Reference: `09-RESEARCH.md` §Validation Architecture maps each AC to its verification method.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (already installed in package.json from Phase 6/7 — 79 tests in `lib/__tests__/`) |
| **Config file** | `vitest.config.ts` (existing) |
| **Quick run command** | `npx vitest run lib/__tests__/analytics.test.ts` |
| **Full suite command** | `npm test` (runs all 79 + new analytics tests) |
| **Estimated runtime** | ~5–8 seconds (analytics tests alone), ~25s full suite |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run lib/__tests__/analytics.test.ts` (only the new test file)
- **After every plan wave:** Run `npm test` (full suite)
- **Before `/gsd-verify-work`:** Full suite green + `npm run build` + `npm run lint`
- **Max feedback latency:** ~10 seconds (vitest scoped run)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | Status |
|---------|------|------|-------------|-----------|-------------------|--------|
| 09-01-* | 01 (install + provider) | 1 | R1 | manual | `npm ls @vercel/analytics` + grep `<Analytics />` in `app/layout.tsx` | ⬜ pending |
| 09-02-* | 02 (lib/analytics.ts helpers) | 1 | R2, R3 | unit | `npx vitest run lib/__tests__/analytics.test.ts` | ⬜ pending |
| 09-03-* | 03 (call-sites wiring) | 2 | R2 | grep | `grep -r "track[A-Z]" components/ app/ hooks/` returns 11 distinct call-sites | ⬜ pending |
| 09-04-* | 04 (fail-soft) | 2 | R4 | unit | vitest assertion: `track` throws → helper catches, no rethrow | ⬜ pending |
| 09-05-* | 05 (bundle measure) | 3 | R5 | manual | `npm run build` before/after diff, First Load JS route `/` ≤ +5 KB | ⬜ pending |
| 09-06-* | 06 (smoke prod + SUMMARY) | 3 | R6 | manual | `audit.perfiamatic.fr` parcours golden + rejet → 11 events visibles dashboard Vercel | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

*Note: Plan IDs and counts are indicative — final breakdown will be set by gsd-planner. The structure above is the verification contract.*

---

## Wave 0 Requirements

- [ ] `lib/__tests__/analytics.test.ts` — Vitest tests for the 11 typed helpers (~15-20 tests : 1-2 par helper + edge cases fail-soft)
- [ ] `@vercel/analytics` installé via `npm install @vercel/analytics` (latest 1.x)

*Vitest infrastructure already exists from Phase 6/7 — no framework setup needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Events visibles dans Vercel Analytics dashboard | R6 / AC-1, AC-2, AC-6 | Vercel Analytics ne tracke qu'en prod (cf RESEARCH Q4) — pas testable en local/CI | User : (1) déployer, (2) faire 1 parcours golden complet sur `audit.perfiamatic.fr`, (3) faire 1 parcours rejet (CSV invalide), (4) ouvrir dashboard Vercel projet `audit-no-shows` → onglet Analytics → Custom Events, vérifier que les 11 events apparaissent < 30s |
| Bundle delta ≤ +5 KB gzipped | R5 / AC-4 | Mesure dépend de l'environnement de build (npm install Vercel CI) — capture la valeur de référence | User/dev : `npm run build` AVANT `npm install @vercel/analytics`, capturer `First Load JS` route `/`. Refaire après. Diff ≤ 5 KB. |
| Fonctionnement sans crash si adblocker bloque Vercel | R4 / AC-3 (fail-soft) | uBlock comportement réel browser, pas mockable simplement | User : activer uBlock Origin, faire parcours golden complet → aucune erreur console bloquante |

---

## Validation Sign-Off

- [ ] All helpers ont test Vitest dédié avec mock `vi.mock('@vercel/analytics')`
- [ ] Sampling continuity : pas plus de 3 tâches consécutives sans automated verify (les 3 manuels sont concentrés en Wave 3)
- [ ] Wave 0 : `analytics.test.ts` créé + `@vercel/analytics` installé avant les tâches Wave 2
- [ ] No watch-mode flags dans les commandes de verify
- [ ] Feedback latency < 10s sur les helpers
- [ ] `nyquist_compliant: true` à set dans frontmatter une fois plans validés

**Approval:** pending
