---
name: sketch-findings-audit-system-audit-noshows
description: Validated design decisions (DA clinique-claire v2) for the audit dashboard (`app/audit/page.tsx`) of system-audit-noshows. Architecture = tableau de bord avec sidebar 240 px + 5 sections scrollables (Synthèse, Manque à gagner, Où & Quand, Score, Plan+CTA). Auto-loaded when implementing or iterating on the audit UI. Triggers on terms like "refonte audit", "audit dashboard", "page d'audit", "app/audit/page.tsx", "tableau de bord audit", "score cabinet", "money build", "par jour chart".
---

<context>

## Project

system-audit-noshows (PerfIAmatic) — outil d'audit SaaS des no-shows pour cabinets
dentaires. La page de résultats `app/audit/page.tsx` est refondue v2 en
**tableau de bord navigable** (plus de flow séquentiel 5 steps), avec sidebar
240 px à gauche et 5 sections visibles en scroll continu avec scrollspy.

Registre visuel : **clinique-claire**, "rapport d'expertise comptable moderne".
Distinct de tout SaaS tech / dark / glass / neon.

## Source of truth

Lire **avant toute implémentation** :
- `new_design.md` — spec DA complète (palette, typo, composants signature)
- `.planning/sketches/005-*` à `009-*` — 5 sketches audit validés (winners A/A/A/B/C)

En cas de conflit, `new_design.md` > sketch README > sketch HTML > ce SKILL.md.

## Non-négociables (bannis)

- ❌ Dark mode / fond sombre (sauf exceptions expresses ci-dessous : hero score C + bandeau CTA)
- ❌ Glassmorphism, verre, backdrop-blur
- ❌ Gradients néon, mesh radial, halos cyber
- ❌ Violet cyber saturé — le violet autorisé est le pastel sémantique Argent + `#6B21A8`
- ❌ Flow séquentiel étape par étape — on est en dashboard
- ❌ Re-multiplier `ca_perdu` par 12 ou par `(12 / nb_mois)` — il est **déjà annualisé par n8n**

</context>

<design_tokens>

## Palette — figée (partagée avec la landing)

- Fond global : `bg-gray-50` (`#f9fafb`)
- Surfaces : `bg-white` + `border-gray-200`
- Primary dark : `#064E3B` (sidebar active, CTA, hero score variant)
- Accent green : `#10B981` (éléments live, rings)
- Ink / muted / border : mêmes valeurs que landing skill

## KPI pastels sémantiques — figés (intouchables)

| Sémantique | BG pastel | Texte valeur | Usage dashboard |
|---|---|---|---|
| Volume / RDV analysés | `#DFF3FF` | `#2563EB` | KPI 1, charts par praticien |
| Signal / No-shows | `#DCF4E6` | `#059669` | KPI 2, bars par jour, score ring |
| Taux / Performance | `#FCEACC` | `#EA580C` | KPI 3, bars par tranche horaire |
| Argent / CA perdu | `#ECCDF8` | `#9333EA` / deep `#6B21A8` | KPI 4, hero Manque à gagner (violet plein) |

**Règle violet plein** : le fond violet saturé (`#6B21A8`) n'apparaît **que** dans la zone "Manque à gagner" (sketch 007 A). Partout ailleurs, le violet reste pastel.

## Typographie

Idem landing : **Inter** (UI) + **Fraunces** (valeurs KPI, titres section, nom cabinet, chiffre score).

</design_tokens>

<dashboard_structure>

## Layout global (sketch 005 — variante **A**)

### Sidebar 240 px, fixe, gauche

- Header sidebar : logo "GetLostRevenue" (vert sapin)
- **Bloc infos cabinet** (compact) :
  - Nom cabinet Fraunces 16 px
  - Généré le (date courte)
  - Période analysée
  - RDV analysés (chiffre)
- **Liste 5 liens de navigation** avec pastille de couleur à gauche (reprise sémantique) :
  1. Synthèse — pastille bleu Volume
  2. Manque à gagner — pastille violet Argent
  3. Où & Quand — pastille émeraude Signal
  4. Score cabinet — pastille vert sapin primary-dark
  5. Plan d'action — pastille orange Taux
  - Item actif : barre verticale 3 px `bg-[#064E3B]` à gauche + fond `bg-emerald-50`
  - Scrollspy : met à jour l'item actif selon la section visible
- **CTA "Prendre RDV"** en bas de sidebar, bouton primary-dark plein largeur
- Pas d'icônes seules — labels lisibles. Pas de tooltip hover.

### Main content

- Pas de topbar horizontale riche (différence vs variant B rejeté).
- Chaque section = bloc vertical avec :
  - Eyebrow Inter 12 px uppercase `tracking-wide` coloré selon la zone
  - Titre H2 Fraunces 28–32 px
  - Lede Inter 15 px muted (optionnel)
  - Contenu de la section

## Section 1 — Synthèse (sketch 006 — variante **A**)

**Grid 4 colonnes pures**, 4 KPI cards de taille égale, chacune pastel sémantique :

```
[ Volume #DFF3FF ]  [ Signal #DCF4E6 ]  [ Taux #FCEACC ]  [ Argent #ECCDF8 ]
    412                  57                  13,8 %              47 200 €
    RDV analysés         No-shows            Taux de no-show     CA perdu estimé
```

- Radius `rounded-2xl` (20 px)
- Chip uppercase en haut (label sémantique : "Volume" / "Signal" / "Taux" / "Argent")
- Valeur Fraunces 40 px, texte dans la couleur `fg` de la sémantique
- Sous-label Inter 13 px muted
- Pas de hero violet ici (le hero violet est sketch 007). Les 4 KPI sont traités à **égalité**.

## Section 2 — Manque à gagner (sketch 007 — variante **A**)

**Card violet plein pleine largeur** — seule occurrence du violet plein du dashboard.

- Fond `bg-[#6B21A8]`, texte blanc, radius `rounded-3xl` (28 px)
- Glow radial subtil en top-left (`radial-gradient` pastel violet transparent)
- Layout 2 cols :
  - **Gauche** : eyebrow "CA perdu / an — extrapolé" + valeur Fraunces 96 px `47 200 €` + sous-phrase "Soit l'équivalent de 3,8 semaines de CA qui s'évaporent..."
  - **Droite** : **breakdown card** glass blanc transparent (`bg-white/10 border-white/20 rounded-2xl`) avec le calcul ligne par ligne :
    - No-shows détectés (3 mois) : 57
    - CA moyen par RDV : 95 €
    - Perte sur la période : 5 415 €
    - Extrapolation 12 mois : × 4
    - **Total CA perdu annualisé : 47 200 €** (ligne séparée, fond plus clair)

**⚠ `ca_perdu` est déjà annualisé par n8n** — jamais le remultiplier, juste l'afficher tel quel dans le "total".

## Section 3 — Où & Quand (sketch 008 — variante **B**)

**Deux charts côte à côte**, grille 2 col desktop :

### Chart gauche — Bars par jour (émeraude Signal)

- Titre Fraunces : "No-shows par jour"
- 7 bars verticales (Lun → Dim)
- Bar standard : `bg-[#DCF4E6]`
- Bar pic : `bg-[#059669]` (émeraude plein)
- Valeur affichée au-dessus de chaque barre (Fraunces 14 px)
- Insight ligne en dessous : "Pic le **jeudi** — 12 no-shows, soit 21 % du total"

### Chart droit — Bars par tranche horaire (orange Taux)

- Titre Fraunces : "Par tranche horaire"
- 5 bars (8–10h, 10–12h, 14–16h, 16–18h, 18–20h)
- Bar standard : `bg-[#FCEACC]`
- Bar pic : `bg-[#EA580C]`
- Insight ligne : "Créneau critique **16h–18h** — 32 % des no-shows"

Utiliser Chart.js (déjà dans le stack) ou bars DOM Tailwind pures. Pas de doughnut. Pas de pie.

## Sections 4+5 — Score + Plan + CTA (sketch 009 — variante **C**)

### Score cabinet — **hero immersif primary-dark**

Seule autre zone fond plein coloré du dashboard (avec sketch 007).

- Card pleine largeur `bg-[#064E3B]` text-white, radius 28 px
- Glow vert émeraude subtil en bottom-right
- Layout 2 cols :
  - **Gauche** : ring SVG 220 px, track `rgba(255,255,255,0.14)` + progress stroke blanc, chiffre `72` Fraunces 64 px blanc au centre + "sur 100" a7f3d0
  - **Droite** : badge pill "Bon · au-dessus du secteur" (fond emerald transparent), H3 Fraunces 26 px blanc, paragraphe d1fae5 15 px

Formule score : `100 - taux_noshow × 3.2`, clamp [0, 100]. Badge conditionnel :
- ≥ 70 : "Bon" / "Performance correcte"
- 50–69 : "À améliorer"
- < 50 : "Critique"

### Plan d'action — **timeline verticale + narratif**

Card blanche bordée, radius 24 px, padding 28 px, grid 2 cols :

- **Col gauche (280 px)** : timeline verticale avec 3 items tricolores
  - Item 1 : point bleu Volume, titre "Rappels SMS J-2", meta "Mois 1 · Volume"
  - Item 2 : point émeraude Signal, titre "Caution créneaux sensibles", meta "Mois 1–2 · Signal"
  - Item 3 : point orange Taux, titre "Liste d'attente temps réel", meta "Mois 2 · Taux"
  - Connecteur vertical fin gris entre les points
- **Col droite** : narratif éditorial Fraunces h4 + 2 paragraphes, avec gain chiffré en gras bleu Volume

### CTA Calendly inline

Card fond `bg-white` bordée `border-[#064E3B]` 1 px, radius 24 px :

- Header : eyebrow primary-dark "Prendre rendez-vous" + H3 "30 minutes pour activer votre plan." + bouton secondaire droite "Voir plus de créneaux"
- Body : **iframe Calendly embed** 360 px de haut (ou placeholder avec icône calendrier vert sapin pendant le dev)
- Footer : "Durée 30 min · visio Google Meet · sans engagement" + lien "Ou m'envoyer le PDF du rapport"

</dashboard_structure>

<copy_guidelines>

## Ton & copy (dashboard audit)

- Registre **rapport d'expertise** : sobre, posé, chiffré
- Jamais de point d'exclamation marketing
- Éviter "incroyable", "énorme", "massif", "choquant"
- Chiffres avec unité explicite (`47 200 €`, `13,8 %`, jamais `47k2`)
- Espace insécable avant `%`, `€`, `:` — utiliser ` ` ou `&nbsp;`
- Narratif possible uniquement en appui du chiffre, jamais en substitut
- Ne jamais prétendre à de la data qu'on n'a pas (ex: pas de "vs. 89 cabinets similaires" si n8n ne renvoie pas cette info)

</copy_guidelines>

<implementation_notes>

## Stack & conventions

- Même config Tailwind + fonts que la landing (Inter + Fraunces via next/font)
- Classes Tailwind custom dans `tailwind.config.ts` : `kpi-volume`, `kpi-signal`, `kpi-taux`, `kpi-argent` composables (ou variables CSS + utility classes)
- `app/audit/layout.tsx` : forcer light (le dashboard n'a pas de dark toggle)
- Charts : Chart.js (déjà présent pour `GraphiqueParJour`) ou DOM bars pour les petits charts. Doughnut `GaugeBenchmark` actuel peut être conservé OU remplacé par la stacked bar de sketch 007 C (à arbitrer au moment du Plan — hors scope du sketch 008 winner B)
- PDF (`@react-pdf/renderer`) : refonte du document en parallèle avec palette light + Fraunces embedded (cf. `new_design.md`)
- Scrollspy : `IntersectionObserver` sur chaque `<section id="...">` avec threshold 0.4, met à jour l'item sidebar actif

## Composants à créer / adapter

- `AuditSidebar` (logo + infos cabinet + nav 5 liens + scrollspy + CTA bottom)
- `AuditSection` (wrapper : eyebrow + title + lede + children)
- `SyntheseKPIs` (grid 4 égales pastels)
- `MoneyBuildCard` (violet plein pleine largeur + breakdown glass)
- `ChartParJour` + `ChartParHeure` (dual côte à côte)
- `ScoreHero` (primary-dark + ring blanc + badge conditionnel)
- `PlanTimeline` + `CalendlyEmbed`

## Règles critiques

- `ca_perdu` jamais remultiplié — copier/coller la valeur renvoyée par n8n
- Ring SVG score : dasharray calculé selon `score / 100 * 540.4` (rayon 86 px)
- Couleur ring score respecte la formule (émeraude par défaut, orange 50–69, rouge < 50) SAUF dans le hero variant C où le ring reste blanc (thème vert sapin uniforme)
- Espacement inter-sections : 80 px vertical minimum
- Scroll smooth : `scroll-behavior: smooth` sur `<html>` + `scroll-margin-top` sur chaque `<section>` pour compenser sticky elements éventuels

## Accessibilité

- `<nav aria-label="Sections du rapport">` sur la sidebar
- Scrollspy met à jour `aria-current="location"` sur le lien actif
- Focus visible sur tous les liens sidebar + boutons CTA
- Contraste AA minimum sur les pastels (utiliser toujours `fg` deep sur pastel `bg`)

</implementation_notes>

<when_to_use>

Active quand la demande concerne :
- Refonte ou évolution de `app/audit/page.tsx`
- Composants du dashboard audit (sidebar, KPI cards, money card, charts par jour/heure, score hero, plan timeline, Calendly embed)
- API `app/api/audit/route.ts` **uniquement** si la réponse affecte le rendu dashboard
- PDF `components/audit/RapportPDF.tsx` si refonte en light thème clinique-claire

Ne pas activer pour la landing (`app/page.tsx`) — utiliser `sketch-findings-landing-system-audit-noshows`.

</when_to_use>
