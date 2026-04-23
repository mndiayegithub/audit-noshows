---
phase: 02-refonte-audit-v2
plan: 02
subsystem: audit-dashboard
tags: [dashboard-shell, sidebar, scrollspy, section-wrapper, wave-2]
requires:
  - Plan 02-01 (layout light, score helper, scroll-margin-top 24px)
  - Phase 1 tokens Tailwind (kpiVolume / kpiSignal / kpiTaux / kpiArgent) + Fraunces font
provides:
  - `useScrollSpy(ids)` — hook IntersectionObserver rootMargin centered (-40% / -40%)
  - `AuditSidebar` — desktop 240px fixed + mobile sticky top-bar, 5 nav links + CTA
  - `AuditSection` — wrapper eyebrow + Fraunces H2 + optional lede, `data-audit-section`
  - `AuditDashboard` — orchestrator client, 5 placeholder sections, ready for Wave 3
affects:
  - app/audit/page.tsx (only `etat === "resultats"` branch)
tech-stack:
  added: []
  patterns:
    - Client hook with IntersectionObserver + rootMargin technique
    - Fragment pattern (`<>`) for dual desktop/mobile sidebar layouts using md: breakpoint
    - Placeholder-first scaffolding: sections have correct IDs so scrollspy works E2E before content lands
key-files:
  created:
    - components/audit/useScrollSpy.ts
    - components/audit/AuditSidebar.tsx
    - components/audit/AuditSection.tsx
    - components/audit/AuditDashboard.tsx
  modified:
    - app/audit/page.tsx (imports + resultats branch JSX replacement)
decisions:
  - Plan snippet used `stats.rdv_total` / `stats.periode` as string — corrected to `stats.global.total_rdv` and `stats.periode.nb_mois` per actual `AuditStats` shape (Rule 1 auto-fix)
  - Dashboard receives `resultats.stats` + `resultats.rapport_texte` (not bare `stats` + `rapport` locals — those don't exist in page.tsx state machine)
  - Legacy imports (ScoreCard fn, GraphiqueParJour, GaugeBenchmark, DiagnosticGoogle, ScoreGlobal, CTACalendly, ReactMarkdown, remarkGfm) kept in page.tsx — cleanup deferred to plan 02-06 per plan directive
  - `text-ink` fallback → `text-slate-900` (consistent with Plan 02-01 — token not defined in tailwind.config.ts)
metrics:
  duration: ~10 min
  completed: 2026-04-24
---

# Phase 2 Plan 02: Dashboard Shell Summary

Shell du dashboard audit v2 livré : hook `useScrollSpy` + composants `AuditSidebar` / `AuditSection` / `AuditDashboard` + wiring chirurgical de `app/audit/page.tsx`. Les 5 sections ont les IDs canoniques (`synthese` / `manque-a-gagner` / `ou-et-quand` / `score` / `plan-et-cta`) et le scrollspy est fonctionnel end-to-end sur la scrollbar. Les états `formulaire` / `loading` / `erreur` n'ont pas été modifiés. Build `/audit` passe (23 kB / 123 kB First Load, -34 % vs résultats v1 car Chart.js / ReactMarkdown ne sont plus mountés dans le render path `resultats`).

## What Was Built

### Task 1 — `components/audit/useScrollSpy.ts`

Hook client `"use client"` :
- Signature : `useScrollSpy(ids: string[]): string | null`
- IntersectionObserver avec `rootMargin: "-40% 0px -40% 0px"` et `threshold: 0`
- Sélection : parmi les sections intersectées, celle dont le `boundingClientRect.top` est le plus proche du haut du viewport
- SSR-safe (`typeof window === "undefined"` guard)
- État initial : `ids[0] ?? null` (évite un flicker "aucun actif" au premier paint)
- Cleanup `observer.disconnect()` au démontage

### Task 2 — `components/audit/AuditSidebar.tsx`

Double layout :
- **Desktop ≥ md** : `<aside>` fixe 240px, `left-0 top-0 h-screen`, `z-20`, border droite. Contient logo *GetLostRevenue* (Fraunces), bloc infos cabinet (nom + date génération + période `nb_mois` mois + total_rdv RDV analysés), nav 5 liens avec pastilles de couleur + barre active 3 px primaryDark, CTA bas *Prendre RDV* en `bg-[#064E3B]`.
- **Mobile < md** : `<div>` sticky top-0, scroll horizontal sur les 5 pills, bouton calendrier rond à droite (CTA condensé).
- `aria-label="Sections du rapport"` sur les deux `<nav>`, `aria-current="location"` sur le lien actif uniquement, `focus-visible` AA sur tous les interactifs.

### Task 3 — `components/audit/AuditSection.tsx`, `components/audit/AuditDashboard.tsx`, `app/audit/page.tsx`

**`AuditSection`** (RSC, pas `"use client"`) :
- Props : `id`, `eyebrow`, `eyebrowColor?`, `title`, `lede?`, `children`
- Rend `<section id data-audit-section className="scroll-mt-6 py-10 md:py-16">` → eyebrow uppercase tracking-wide + H2 Fraunces + lede optionnel + children
- `scroll-mt-6` = 24 px (compense top-bar mobile sticky, cohérent Plan 02-01)

**`AuditDashboard`** (client) :
- Props : `{ stats: AuditStats, rapport: string }`
- Layout : `<div className="min-h-screen"><AuditSidebar stats /><main className="md:ml-[240px] px-4 md:px-10 pb-20">…5 sections…</main></div>`
- Les 5 sections sont **placeholders** (`[Section X — à remplir par Plan 02-0Y]`) — Wave 3 remplace le contenu, les IDs et la structure restent.
- La section `plan-et-cta` rend en bas un `<details>` avec le texte brut du rapport (fallback temporaire tant que la prose stylisée n'est pas réintroduite en 02-05).

**`app/audit/page.tsx`** (edit chirurgicale) :
- Import ajouté : `import AuditDashboard from "@/components/audit/AuditDashboard";`
- Bloc `{etat === "resultats" && resultats && (…206 lignes JSX legacy…)}` remplacé par `{etat === "resultats" && resultats && (<AuditDashboard stats={resultats.stats} rapport={resultats.rapport_texte ?? ""} />)}`
- Les imports legacy (ScoreCard local, GraphiqueParJour, GaugeBenchmark, DiagnosticGoogle, ScoreGlobal, CTACalendly, ReactMarkdown, remarkGfm) sont **conservés** — la cleanup est explicitement scopée à 02-06 par le plan.

## Integration Point — `app/audit/page.tsx`

La ligne :

```tsx
{etat === "resultats" && resultats && (
  <AuditDashboard
    stats={resultats.stats}
    rapport={resultats.rapport_texte ?? ""}
  />
)}
```

est la **seule** modification au state machine. Tous les autres branches (`formulaire`, `loading`, `erreur`) et la `<nav>` header restent intactes.

## Commits

| Task | Hash | Message |
|------|------|---------|
| 1 | `6a6c08b` | feat(02-02): add useScrollSpy hook (IntersectionObserver, -40% rootMargin) |
| 2 | `b4f208e` | feat(02-02): add AuditSidebar (desktop 240px fixed + mobile sticky top-bar) |
| 3 | `b8abdb0` | feat(02-02): wire AuditDashboard shell into /audit resultats branch |

## Verification Run

- `npx tsc --noEmit` — **clean** (zéro erreur TypeScript)
- `npm run lint` — **clean** (seuls les 2 warnings `<img>` pré-existants hors scope dans `components/ui/faq-section.tsx` et `components/ui/testimonial-cards.tsx`)
- `npm run build` — **succès**
  - `/audit` : 23 kB / 123 kB First Load JS (réduction significative vs v1 resultats grâce au détachement de Chart.js, ReactMarkdown du render path actif)
  - 7/7 static pages générées
- Acceptance criteria :
  - Task 1 : 6/6 PASS
  - Task 2 : 11/11 PASS (LINKS count = 5)
  - Task 3 : 12/12 PASS (AuditSection count = 5, TS + build verts)

## Decisions Made

- **Realignement types AuditStats vs snippet plan** : le snippet `AuditSidebar` du plan utilise `stats.rdv_total` (flat) et traite `stats.periode` comme une string. Le fichier `types/audit.ts` réel expose `stats.global.total_rdv` et `stats.periode: { debut, fin, nb_mois }`. Rule 1 (auto-fix bug) appliquée : `{stats.global.total_rdv.toLocaleString("fr-FR")} RDV analysés` et `Période : {stats.periode.nb_mois} mois`. Sans ce fix, `npx tsc --noEmit` aurait échoué — condition sine qua non du plan (Task 2 acceptance `npx tsc --noEmit exits 0`).
- **Props `AuditDashboard` = `resultats.stats` + `resultats.rapport_texte`** : le plan écrivait `{etat === "resultats" && stats && (<AuditDashboard stats={stats} rapport={rapport ?? ""} />)}` mais les variables locales du composant `AuditPage` sont `resultats` (un `AuditResponse` complet) et `nomCabinet`/`email`/`file` — pas de `stats` ni `rapport` au top-level. Rule 1 : utiliser `resultats.stats` et `resultats.rapport_texte`.
- **Sidebar desktop utilise `fixed`** : le layout `md:ml-[240px]` sur `<main>` compense la largeur de la sidebar fixe. Pattern classique, zéro JS.
- **Section `plan-et-cta` affiche le rapport brut dans `<details>`** : transition douce — l'utilisateur ne perd pas l'accès au texte du rapport tant que la version Markdown stylisée n'est pas restaurée par 02-05.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 — Bug] `stats.rdv_total` → `stats.global.total_rdv` dans AuditSidebar**
- **Found during:** Task 2 (édition du composant)
- **Issue:** Le snippet du plan référence `stats.rdv_total` et `stats.periode` comme string. Le type `AuditStats` expose `stats.global.total_rdv: number` et `stats.periode: { debut, fin, nb_mois }`.
- **Fix:** `{stats.global.total_rdv.toLocaleString("fr-FR")} RDV analysés` et `Période : {stats.periode.nb_mois} mois`.
- **Files modified:** components/audit/AuditSidebar.tsx
- **Commit:** b4f208e

**2. [Rule 1 — Bug] Props AuditDashboard alignées sur l'état réel de page.tsx**
- **Found during:** Task 3 (wiring)
- **Issue:** Le plan utilise `stats={stats}` / `rapport={rapport ?? ""}` mais `AuditPage` maintient un unique `resultats: AuditResponse | null` (pas de `stats` / `rapport` top-level).
- **Fix:** `<AuditDashboard stats={resultats.stats} rapport={resultats.rapport_texte ?? ""} />`
- **Files modified:** app/audit/page.tsx
- **Commit:** b8abdb0

### Out-of-scope warnings (logged, not fixed)

- 2 warnings ESLint `@next/next/no-img-element` (components/ui/faq-section.tsx:42 et testimonial-cards.tsx:51) — préexistants, hors scope.

## Known Stubs

- **5 sections placeholders** : chaque `AuditSection` rend `<div className="text-sm text-gray-400">[Section X — à remplir par Plan 02-0Y]</div>`. **Stub intentionnel** scellé par le plan (« Placeholder sections with correct IDs so scrollspy works end-to-end » — `<objective>`). Les stubs seront remplacés par :
  - `synthese` / `manque-a-gagner` → Plan 02-03
  - `ou-et-quand` → Plan 02-04
  - `score` / `plan-et-cta` → Plan 02-05

## Known Legacy Imports (to be cleaned in 02-06)

Dans `app/audit/page.tsx`, les imports suivants ne sont plus utilisés par la branche `resultats` mais restent présents. **Aucune erreur lint**, TypeScript / ESLint ne signalent pas d'unused import ici car :

- `ReactMarkdown`, `remarkGfm` : plus utilisés dans JSX (mais TS ne bloque pas les imports inutilisés par défaut)
- `GraphiqueParJour`, `GaugeBenchmark` : plus mountés
- `DiagnosticGoogle`, `ScoreGlobal`, `CTACalendly` : plus mountés
- `ScoreCard` (fonction locale définie lignes 46–187) : plus utilisée mais encore définie
- `Activity`, `CheckCircle`, `FileText`, `Search`, `Sparkles` : certains encore utilisés par les autres branches (formulaire/loading), d'autres orphelins
- `fadeInUp`, `sectionVariants`, `calcScore`, `getScoreConfig` : orphelins

**Plan 02-06 doit** :
- Supprimer la fonction `ScoreCard` locale (lignes 46–187)
- Supprimer les imports de `GraphiqueParJour`, `GaugeBenchmark`, `DiagnosticGoogle`, `ScoreGlobal`, `CTACalendly`, `ReactMarkdown`, `remarkGfm`
- Supprimer les helpers `calcScore` / `getScoreConfig` locaux (remplacés par `@/lib/score`)
- Supprimer les imports lucide-react inutilisés après cleanup
- Supprimer les fichiers de composants legacy si `rg -l <Component>` ne trouve plus de caller (`components/GaugeBenchmark.tsx`, `components/GraphiqueParJour.tsx`, `components/audit/ScoreGlobal.tsx`)

## Unblocks

- **Wave 3 (plans 02-03 / 02-04 / 02-05)** : peuvent commencer en parallèle, s'insèrent chacun dans un `AuditSection` existant sans toucher au shell.
- **Plan 02-06** : la cleanup des legacy imports peut s'appuyer sur la liste ci-dessus pour atteindre le delta minimal.
- **Scrollspy** : fonctionnel end-to-end — un utilisateur qui scrolle voit `aria-current="location"` migrer entre les 5 liens selon la section centrée.

## Self-Check: PASSED

- FOUND: `components/audit/useScrollSpy.ts`
- FOUND: `components/audit/AuditSidebar.tsx`
- FOUND: `components/audit/AuditSection.tsx`
- FOUND: `components/audit/AuditDashboard.tsx`
- FOUND: `app/audit/page.tsx` (modifié — import AuditDashboard + resultats branch remplacé)
- FOUND commit: `6a6c08b` (Task 1)
- FOUND commit: `b4f208e` (Task 2)
- FOUND commit: `b8abdb0` (Task 3)
- `npx tsc --noEmit` : clean
- `npm run lint` : clean (2 warnings pré-existants hors scope)
- `npm run build` : success (`/audit` → 23 kB / 123 kB FLJS)
