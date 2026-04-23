# SPEC — Phase 1 · Refonte Landing v2

**Status :** 🔒 locked · ready for `/gsd-discuss-phase 1`
**Date :** 2026-04-22
**Ambiguity :** 0.13 (gate ≤ 0.20 ✓)

---

## Goal

Remplacer l'actuelle `app/page.tsx` par une landing B2B refondue en **direction dark premium** (toggle dark/light inclus), ciblant les cabinets médicaux FR (dentistes, médecins, paramédical), structurée conformément aux sketches 005-008 validés et au skill `sketch-findings-landing-system-audit-noshows`.

L'objectif commercial est unique : conduire un visiteur qualifié au CTA `/audit` en 30-60 secondes de lecture. Cohérence de marque avec le rapport d'audit (clinique Apple Health) assurée par les chiffres serif et le ton factuel du corps, pas par la palette.

---

## Scope

### In scope

- Réécriture complète de `app/page.tsx` (dark premium par défaut)
- Implémentation **du toggle dark/light** (bouton dans la nav, persistance `localStorage`, SSR-safe)
- 5 sections ordonnées : **Nav sticky → Hero split → How-it-works 3 steps → Social proof marquee+stats → FAQ minimal + Final CTA full-bleed → Footer minimal**
- Composants landing dédiés (extraction depuis `app/page.tsx` si nécessaire pour lisibilité)
- Archivage des anciens fichiers (`landing.html`, `landing-preview.html`, `mockup.html`) dans `archive/landings-v1/`
- Responsive 3 breakpoints : mobile 375px, tablet 768px, desktop 1440px
- Copy finalisée selon le voice validé dans le skill landing (ton factuel, chiffres-clés serif, reassurance ⏱🔒📎🚫)
- Placeholders "early access / beta" pour tout asset non encore collecté (témoignages, stats, logos cabinets)

### Out of scope

- Refonte de `app/audit/page.tsx` — phase 2 distincte, direction clinique différente
- Modification de `app/api/audit/route.ts` — aucun changement backend
- Refonte du PDF (`components/audit/RapportPDF.tsx`) — direction dark/gold conservée
- Collecte des vrais témoignages / vraies stats / vrais logos — préparation en parallèle hors phase, placeholders "beta" ship-ables
- Intégration Google Places — phase 4
- Conformité RGPD avancée / validation CSV — phase 5
- Tests automatisés (Vitest / Playwright) — phase 6
- Monitoring / analytics (events) — phase 8

---

## Requirements (falsifiables)

### REQ-1.1 — Landing dark premium par défaut

**Current :** `app/page.tsx` rend une landing light `mesh-bg/grid-overlay` avec `ContainerScroll`, `ShuffleTestimonials`, `FaqSection`, Framer Motion, ~891 lignes dans un seul fichier.

**Target :** À l'arrivée sur `/` (sans aucun cookie/localStorage), la page s'affiche en **dark premium** : bg `#0A0A0C`, glassmorphism cards, mesh radial violet/rose, titres en gradient blanc→gris, chiffres-clés en gradient violet→rose serif, CTA pill blanc.

**Acceptance :**
- [ ] `app/page.tsx` (ou composant racine) rend bg `#0A0A0C` au premier paint en mode dark
- [ ] Aucune utilisation de `ContainerScroll` / `ShuffleTestimonials` / `FaqSection` existants dans la version dark (réécrits en nouveaux composants ou refactorisés)
- [ ] Tous les tokens palette/typo du skill `sketch-findings-landing-system-audit-noshows/references/landing-page.md` sont présents dans le CSS/Tailwind utilisé

---

### REQ-1.2 — Toggle dark/light fonctionnel

**Current :** Aucun toggle de thème. Une seule version de la landing.

**Target :** Un bouton dans la nav permet de basculer entre **dark** (variant D hero) et **light** (variant C hero du sketch 005). Le choix est persisté dans `localStorage` et restauré au rechargement. Implémentation SSR-safe (pas de flash-of-incorrect-theme).

**Acceptance :**
- [ ] Un bouton toggle visible dans la nav (icône soleil/lune ou similaire)
- [ ] Cliquer bascule instantanément la palette **sans reload** (tokens CSS variables, pas de classes conditionnelles par composant)
- [ ] Le choix est lu depuis `localStorage` au mount et restauré avant le first paint (pas de flash)
- [ ] Si `localStorage` vide → dark par défaut
- [ ] Les 5 sections (nav, hero, how-it-works, social-proof, faq+cta, footer) respectent le toggle

---

### REQ-1.3 — Nav sticky avec blur

**Current :** Nav existante avec `isScrolled` state et shadow conditionnelle.

**Target :** Nav sticky top 0, fond `rgba(10,10,12,0.85)` (dark) / `rgba(247,247,248,0.85)` (light), `backdrop-filter: saturate(180%) blur(14px)`, border-bottom subtile. Logo gauche + liens centraux + CTA pill droite + toggle thème.

**Acceptance :**
- [ ] Scroll vertical → nav reste visible en top
- [ ] Backdrop blur actif (vérifiable via devtools)
- [ ] CTA nav pointe vers `/audit`
- [ ] Toggle thème présent dans la nav

---

### REQ-1.4 — Hero split (sketch 005 D/C)

**Current :** Hero hero actuel avec H1 + calcul interactif `rdvPerDay`.

**Target :** Hero en **grid 2 colonnes** : gauche = eyebrow + H1 (gradient) + lede + CTA pill + lien ghost + reassurance inline · droite = preview réaliste du rapport (card glassmorphism en rotation `0.6deg`, KPI géant serif gradient `42 380 €`, grid mini-KPIs, mini bar chart 7 jours). Responsive ≤ 860px : 1 colonne, rotation annulée.

**Acceptance :**
- [ ] Grid 2 colonnes en desktop ≥ 1024px (vérifiable via inspector)
- [ ] Preview rapport contient au moins : KPI `42 380 €` serif gradient + score ring + mini bar chart
- [ ] Card preview en rotation légère + halo violet/rose flouté en background
- [ ] Responsive 1 col sous 860px (preview apparaît sous le message)
- [ ] Reassurance 3 items visible (⏱ 60 s · 🔒 RGPD · 📎 PDF sans achat)

---

### REQ-1.5 — Section How-it-works (sketch 006 A)

**Current :** Section "comment-ca-marche" existante avec plusieurs cards.

**Target :** Grid `repeat(3, 1fr)` gap 20px, 3 cards glassmorphism avec **numéro serif gradient 72px** (01/02/03), H3 court, 1 phrase, tag pill discret. Flèches circle entre les cards (absolute, masquées en mobile). Responsive 1 col sous 860px.

**Acceptance :**
- [ ] 3 cards présentes : Upload du CSV · Analyse IA · Rapport chiffré
- [ ] Numéros 01/02/03 en serif 72px avec gradient violet→rose
- [ ] Tag pill présent sur chaque card (ex: "📎 CSV Doctolib", "⏱ 30 à 50 secondes")
- [ ] Hover card : `translateY(-2px)` + bg lighter
- [ ] Flèches entre cards visibles en desktop, cachées en mobile

---

### REQ-1.6 — Section Social proof (sketch 007 B)

**Current :** `ShuffleTestimonials` + metrics.

**Target :** Section composée de : (a) **marquee horizontal** infini de "logos" cabinets (8 items répétés, mask fade sur les bords, animation 30s linear) (b) **grid 4 stats** KPI serif 48px gradient + label + barre de progression gradient. Placeholders "beta" ou indication claire "exemple" sur tous les chiffres/logos non vérifiés.

**Acceptance :**
- [ ] Marquee défile horizontalement sans saccade (CSS animation)
- [ ] Mask fade sur bords gauche/droit visible
- [ ] 4 stats visibles avec chiffre serif + label + barre de progression
- [ ] Mention "bêta" ou "exemples" explicite sur la section (évite de vendre des chiffres non vérifiés)

---

### REQ-1.7 — FAQ minimal + Final CTA full-bleed (sketch 008 C)

**Current :** `FaqSection` existant (composant UI dédié).

**Target :** (a) **FAQ accordéon épuré** border-top/bottom, 4 questions essentielles (data stockées · formats CSV · compte requis · prix), chevron `+` rotate 45° à l'ouverture, max-width 680px. (b) **Section finale full-bleed** avec halo radial violet, H2 géant dégradé + accent serif rouge→rose, CTA pill blanc 17px `Démarrer l'audit gratuit →` avec shadow rose, reassurance inline.

**Acceptance :**
- [ ] Exactement 4 questions FAQ (pas plus, pas moins)
- [ ] Une question ouverte par défaut au chargement
- [ ] Chevron `+` rotate 45° à l'ouverture (animation visible)
- [ ] Section finale contient H2 + CTA + reassurance + halo violet de fond
- [ ] CTA final pointe vers `/audit`

---

### REQ-1.8 — Footer minimal

**Current :** Footer existant.

**Target :** Footer sobre cohérent avec le thème actif (dark ou light), liens légaux minimaux (mentions légales, RGPD), copyright, aucune duplication du CTA principal (le CTA final est déjà juste au-dessus).

**Acceptance :**
- [ ] Footer respecte le toggle dark/light
- [ ] Liens RGPD/mentions légales présents (même si pages cibles à compléter en phase 5)

---

### REQ-1.9 — CTA unique vers `/audit`

**Current :** Plusieurs CTA éparpillés dans `app/page.tsx` (nav, hero avec calcul, plusieurs sections).

**Target :** **Tous les CTA** de la landing conduisent à `/audit` (pas de Calendly direct, pas d'upload inline sur la landing). Nombre de points de CTA : **3** minimum (nav, hero, section finale), 5 maximum.

**Acceptance :**
- [ ] Smoke test : cliquer chaque bouton/lien CTA → arrive sur `/audit`
- [ ] Aucun CTA ne déclenche un popup Calendly depuis la landing
- [ ] Aucun formulaire d'upload CSV sur la landing

---

### REQ-1.10 — Responsive 3 breakpoints

**Target :** La landing fonctionne correctement sur mobile 375px, tablet 768px, desktop 1440px, sans overflow horizontal, sans éléments coupés, sans chevauchement.

**Acceptance :**
- [ ] Mobile 375px : stacking vertical de toutes les sections, nav burger ou nav compressée OK, preview rapport passe sous le hero, marquee toujours fluide
- [ ] Tablet 768px : grid 3 cols how-it-works peut rester OK ou passer en 1 col, reste lisible
- [ ] Desktop 1440px : toutes les sections respectent les max-widths du skill (1120-1280px)
- [ ] Aucun overflow horizontal sur aucun breakpoint (`overflow-x: hidden` au body OK en fallback, mais pas de contournement forcé)

---

### REQ-1.11 — Lighthouse Performance ≥ 85 (desktop)

**Target :** Sur une preview Vercel, le score Lighthouse **Performance** ≥ 85 en mode desktop.

**Acceptance :**
- [ ] Un audit Lighthouse exécuté sur la preview branch retourne Performance ≥ 85
- [ ] Le mesh radial / glassmorphism n'a pas d'impact bloquant sur le LCP
- [ ] Les images (si ajoutées) sont optimisées (Next Image, `priority` sur le hero si applicable)

---

### REQ-1.12 — Zero regression sur `/audit` et API

**Target :** La refonte de la landing ne casse ni la page `/audit`, ni l'API `/api/audit`, ni le build Next.js.

**Acceptance :**
- [ ] `npm run build` passe sans erreur TS ni warning nouveau
- [ ] `/audit` continue de fonctionner : upload CSV → API → résultats (smoke test manuel avec fichier CSV d'exemple)
- [ ] Aucun changement dans `app/api/audit/route.ts`, `types/audit.ts`, `components/audit/*` (sauf extraction propre éventuelle de design tokens partagés)

---

### REQ-1.13 — Archivage des anciens landings

**Current :** `landing.html`, `landing-preview.html`, `mockup.html` à la racine du projet.

**Target :** Ces 3 fichiers sont déplacés dans `archive/landings-v1/` à la fin de la phase 1 (commit dédié).

**Acceptance :**
- [ ] `archive/landings-v1/landing.html` existe
- [ ] `archive/landings-v1/landing-preview.html` existe
- [ ] `archive/landings-v1/mockup.html` existe
- [ ] Les fichiers ne sont plus à la racine
- [ ] Un `archive/landings-v1/README.md` documente la date + raison de l'archivage

---

### REQ-1.14 — Copy conforme au voice validé

**Target :** Tous les titres / ledes / micro-copy utilisent le ton factuel, les phrases courtes finissant sur le chiffre-clé, zéro superlatif marketing ("le meilleur", "leader", "révolutionnaire" = interdits).

**Acceptance :**
- [ ] Hero H1 utilise une formulation-chiffre (ex: "Combien vous coûtent réellement vos rendez-vous manqués ?")
- [ ] Aucun "leader", "meilleur", "révolutionnaire", "optimal", "le #1", ou autre superlatif non chiffrable n'apparaît dans le texte final
- [ ] Les micro-signaux reassurance ⏱🔒📎🚫 sont présents au minimum sur le hero et le CTA final
- [ ] Les termes génériques "cabinet médical" / "praticien" sont privilégiés sur "dentiste" seul (messaging large)

---

## Boundaries (résumé)

### In scope
Page `app/page.tsx` · 5 sections + footer · toggle dark/light · responsive 3 breakpoints · placeholders bêta · archivage anciens landings · copy factuelle.

### Out of scope
Page audit · API backend · PDF · collecte vrais assets · Google Places · RGPD avancée · tests auto · monitoring · page privacy complète.

---

## Acceptance Gate

La phase 1 est considérée **terminée** quand **tous** les acceptance criteria des 14 REQs passent, **et** :

- [ ] Build Next.js sans erreur ni warning nouveau
- [ ] Lighthouse Performance ≥ 85 sur preview Vercel
- [ ] Smoke test manuel sur 3 breakpoints (375 / 768 / 1440)
- [ ] Skill `sketch-findings-landing-system-audit-noshows` reste la source de vérité design (aucune déviation non documentée)
- [ ] Commit final archive les 3 anciens fichiers HTML

---

## Ambiguity Report

| Dimension | Score | Min | Status |
|-----------|-------|-----|--------|
| Goal Clarity | 0.85 | 0.75 | ✓ |
| Boundary Clarity | 0.90 | 0.70 | ✓ |
| Constraint Clarity | 0.85 | 0.65 | ✓ |
| Acceptance Criteria | 0.90 | 0.70 | ✓ |
| **Ambiguity** | **0.13** | **≤ 0.20** | **✓** |

**Gate passed after round 1.** Aucune dimension sous le minimum. Les décisions restantes (librairie pour le toggle, CSS-vars vs Tailwind theme, composants extraits vs monolithe) relèvent de `/gsd-discuss-phase 1`.

---

## References

- Skill : `.claude/skills/sketch-findings-landing-system-audit-noshows/SKILL.md`
- Reference design : `.claude/skills/sketch-findings-landing-system-audit-noshows/references/landing-page.md`
- Sketches sources : `.planning/sketches/005-hero-impact/` à `008-faq-final-cta/`
- Summary : `.planning/sketches/WRAP-UP-SUMMARY-LANDING.md`
- Roadmap entry : `.planning/ROADMAP.md` (phase 1)
