# Design System — PerfIAmatic Audit Financier No-Shows

Source de vérité : `design_audit.html` (maquette Google Stitch validée).
Cible d'application : **landing page** + **5 steps du flux audit** (`app/audit/page.tsx` et ses `components/audit/Step*.tsx`).

Ce document fige les décisions de DA pour que les prochains sketches (plugin `gsd` sur Claude Code CLI) soient strictement cohérents avec la maquette.

---

## 1. Positionnement & direction artistique

**Mood** : clinique-clair, institutionnel, rassurant, orienté ROI financier.
**Contraste référence** : Clinivo (Dribbble) × Stripe Dashboard × Linear light.
**À bannir** : dark mode, effets glow / neon, dégradés cyber, iconographie tech-crypto, gradients violets, glassmorphism opaque, typographies display fantaisistes.
**À préserver** : blanc généreux, bordures fines gris très clair, ombres douces diffuses, coins arrondis généreux, pastels désaturés, une seule couleur forte (vert sapin) qui porte toute la verticalité de marque.

La page ne doit pas évoquer un "SaaS tech". Elle doit évoquer un **rapport d'expertise comptable** — sérieux, chiffré, lisible, mais moderne.

---

## 2. Palette de couleurs

### 2.1 Couleurs de marque (roots)

| Token | Hex | Usage |
|---|---|---|
| `--primary-dark` | `#064E3B` | Logo, titres de marque, CTA principal (fond), bandeau CTA final, score ring stroke (`#065f46` très proche accepté), texte hover des liens |
| `--accent-green` | `#10B981` | Accent secondaire, lignes de graphique, icônes de validation (check), chiffres positifs, dégradé de chart (fill-opacity 0.2) |

### 2.2 Neutres (base Tailwind — ne pas s'en écarter)

| Token | Hex | Usage |
|---|---|---|
| `bg-gray-50` | `#F9FAFB` | Fond global du body |
| `bg-white` | `#FFFFFF` | Surfaces cards, header, sections alternées |
| `border-gray-100` | `#F3F4F6` | Bordures de cards premium (dashboard mockup, score card) |
| `border-gray-200` | `#E5E7EB` | Bordures standards (target audience, FAQ) |
| `text-slate-900` | `#0F172A` | Titres H1/H2, chiffres clés |
| `text-slate-800` | `#1E293B` | Sous-titres, labels forts |
| `text-slate-700` | `#334155` | Corps de texte dense |
| `text-slate-600` | `#475569` | Corps de texte secondaire, liens nav |
| `text-slate-500` | `#64748B` | Labels de stats, légendes |
| `text-slate-400` | `#94A3B8` | Icônes de FAQ (chevrons), texte tertiaire |

### 2.3 Palette sémantique "4 couleurs pastels" — CRITIQUE

C'est **le cœur de la signature visuelle** du projet. Chaque famille de KPI est associée à une couleur fixe, utilisée de manière cohérente sur toute la landing ET sur les 5 steps du rapport.

| Famille | Sémantique | Fond card | Label UPPER | Accent chiffre |
|---|---|---|---|---|
| **Volume / Activité** | RDV analysés, total, activité | `#DFF3FF` | `text-blue-600` `#2563EB` | `text-slate-900` |
| **No-shows / Signal** | No-shows, absences, incidents | `#DCF4E6` | `text-emerald-600` `#059669` | `text-slate-900` |
| **Taux / Performance** | % de no-show, taux, indicateurs de risque | `#FCEACC` | `text-orange-600` `#EA580C` | `text-slate-900` |
| **Argent / Perte** | CA perdu, manque à gagner, impact € | `#ECCDF8` | `text-purple-600` `#9333EA` | `text-purple-800` `#6B21A8` |

**Règle absolue** : sur le flux audit (5 steps), chaque KPI doit reprendre exactement la couleur de sa famille. Ne jamais colorer "CA perdu" en bleu ni "RDV analysés" en violet.

### 2.4 Palette sémantique "sections" (soft tints)

Utilisée pour les cards de la section *Comment ça marche* et des étapes numérotées du flux audit.

| État | Fond | Bordure | Fond icône | Couleur icône |
|---|---|---|---|---|
| Étape 1 — Upload / Entrée | `bg-blue-50` `#EFF6FF` | `border-blue-100` `#DBEAFE` | `bg-blue-200/50` | `text-blue-600` |
| Étape 2 — Analyse / IA | `bg-emerald-50` `#ECFDF5` | `border-emerald-100` `#D1FAE5` | `bg-emerald-200/50` | `text-emerald-600` |
| Étape 3 — Restitution / Rapport | `bg-orange-50` `#FFF7ED` | `border-orange-100` `#FFEDD5` | `bg-orange-200/50` | `text-orange-600` |

---

## 3. Typographie

**Famille unique** : `Inter` (Google Fonts), fallback `sans-serif`.
**Poids chargés** : 400, 500, 600, 700, 800 (et `font-black`/900 pour les stats vedettes).

### Échelle

| Usage | Classes Tailwind | Exemple |
|---|---|---|
| H1 Hero | `text-3xl md:text-5xl font-extrabold leading-tight` | *"Combien votre cabinet perd-il vraiment…"* |
| H2 Section | `text-2xl font-bold` | *"Pour qui"*, *"Comment ça marche"* |
| H3 Card / Step | `text-lg font-bold` | *"Synthèse"* |
| Stat vedette | `text-3xl font-black` (ou `font-extrabold`) | *+200* |
| KPI chiffre | `text-xl font-extrabold` | *4 520*, *€22 400* |
| Corps lead | `text-sm md:text-lg text-slate-600` | sous-titre hero |
| Corps standard | `text-sm font-medium text-slate-700` | bullets, paragraphes |
| Label UPPER | `text-[10px] font-bold uppercase` ou `text-[11px] uppercase tracking-tight` | *"RDV ANALYSÉS"*, légendes stats |
| Micro-copy footer | `text-[10px] uppercase tracking-widest` | copyright |

**Règle** : jamais d'italique sauf citation (`<blockquote>`). Jamais de texte souligné hors liens de navigation (et même là, c'est optionnel).

---

## 4. Vocabulaire de formes

### 4.1 Rayons de bordure

| Token | Usage |
|---|---|
| `rounded-full` | Badge pilule, avatars, pastilles de couleur dans les badges, boutons de navigation arrondis |
| `rounded-lg` | Petites cards KPI internes (dans le dashboard mockup), champs input |
| `rounded-xl` | Boutons CTA, cards de la grille "Pour qui", icônes logo dans *How it works* |
| `rounded-2xl` | Dashboard mockup (preview hero), cards *Comment ça marche* pleine largeur |
| `rounded-3xl` | Score card (jauge 72/100) — rayon le plus marqué réservé aux éléments-héros |

### 4.2 Ombres

| Token | Usage |
|---|---|
| `shadow-sm` | Cards "Pour qui" (sobriété) |
| `shadow-lg` | Boutons CTA principaux |
| `shadow-xl` | Score card, gros CTA final sur fond vert |
| `shadow-2xl` | Dashboard mockup hero (pièce maîtresse, flotte sur la page) |

### 4.3 Bordures

Toujours fines (`border`, soit 1px). Jamais de `border-2` ou plus sur les cards (sauf avatars : `border-4 border-white` pour contraster sur fond gris).

### 4.4 Espacements verticaux de section

- Sections standards : `py-16 px-4`
- Section stats bandeau : `py-12`
- Hero : `pt-12 pb-8`
- Entre deux sections colorées : pas de marge, les sections s'empilent avec leur propre `py-16`

### 4.5 Largeurs conteneurs

- `max-w-7xl` : header nav, footer
- `max-w-4xl` : stats bandeau, section "Ce que révèle"
- `max-w-2xl` : hero paragraph, testimonial, FAQ
- `max-w-xl` : dashboard mockup hero, CTA final
- `max-w-lg` : grille "Pour qui" (2 colonnes compacte)
- `max-w-sm` : cards "Comment ça marche" (empilement vertical mobile-first)

---

## 5. Composants signature

### 5.1 Badge pilule (hero)

```html
<div class="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 border border-gray-200 text-xs font-semibold text-slate-600">
  <span class="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
  Audit financier IA — Version 2.0
</div>
```
Pastille `bg-blue-500` toujours à gauche, diamètre 8px, séparée par `mr-2`.

### 5.2 Card KPI pastel (signature)

```html
<div class="bg-[#dff3ff] p-3 rounded-lg text-left">
  <span class="text-[10px] text-blue-600 font-bold uppercase">RDV analysés</span>
  <div class="text-xl font-extrabold">4 520</div>
</div>
```
- Padding : `p-3` dans le mockup compact, `p-6` sur des cards pleine page.
- Label au-dessus du chiffre, jamais l'inverse.
- Pas d'icône dans ces cards : la couleur EST l'icône.

### 5.3 CTA principal

```html
<button class="px-8 py-4 bg-primary-dark text-white rounded-xl font-bold text-lg shadow-lg">
  Lancer mon audit gratuit
</button>
```
Variantes :
- **Primary** : fond `#064E3B` + texte blanc + `shadow-lg`
- **Secondary** : fond `bg-white` + `border border-slate-300` + texte `text-slate-700`
- **Inverse** (sur bandeau vert foncé) : fond blanc + texte `text-primary-dark` + `shadow-xl`

Padding standard : `px-8 py-4` (hero), `px-10 py-4` (CTA final), `px-4 py-2` (nav).

### 5.4 Dashboard mockup (preview hero)

Structure obligatoire :
1. Conteneur `bg-white rounded-2xl shadow-2xl border border-gray-100 p-4`
2. Barre macOS factice (3 pastilles rouge/jaune/vert + barre grise simulant l'URL)
3. H3 *Synthèse* aligné à gauche
4. Grid `grid-cols-2 gap-2` avec les **4 cards KPI pastels** (ordre : Volume → No-shows → Taux → Argent)
5. Zone de graphique : courbe smooth verte avec fill gradient `from-emerald-100 to-transparent`, stroke `#10B981` 2px

Cette preview est **la plus importante de la page** : ce qu'elle montre = ce que l'utilisateur recevra. Elle est dupliquée conceptuellement dans le Step 1 *Synthèse* du flux audit.

### 5.5 Score card circulaire (jauge 72/100)

```html
<div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl text-center">
  <svg class="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f3f4f6" stroke-width="10"/>
    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#065f46"
            stroke-dasharray="251.2" stroke-dashoffset="70" stroke-width="10"/>
  </svg>
  <!-- valeur centrée absolue : text-2xl font-black -->
</div>
```
- Rayon `r=40`, circonférence ≈ `251.2`
- `stroke-dashoffset = 251.2 * (1 - score/100)`
- Track `#f3f4f6` (gray-100), progress `#065f46` (emerald-900)
- Label sous la jauge : *"Score cabinet"* + une ligne de diagnostic `text-xs text-slate-500`

C'est le **composant-héros du Step 4 (StepScore)**. À conserver tel quel — ne pas passer en dégradé multicolore.

### 5.6 Card étape numérotée

```html
<div class="bg-blue-50 border border-blue-100 p-6 rounded-2xl flex items-center gap-6">
  <div class="bg-blue-200/50 p-3 rounded-lg">
    <svg class="w-8 h-8 text-blue-600">…</svg>
  </div>
  <span class="font-bold text-slate-800">1. Exportez votre CSV</span>
</div>
```
Pattern appliqué identiquement pour les 3 étapes (bleu → émeraude → orange).
**À réutiliser** pour le Stepper interne du flux audit si on veut un fil visuel cohérent.

### 5.7 Bullet check (value prop)

```html
<li class="flex items-start gap-3">
  <svg class="w-5 h-5 text-emerald-500 mt-1" stroke-width="3">…check…</svg>
  <span class="text-sm font-medium text-slate-700">…</span>
</li>
```
Check icon `text-emerald-500` (#10B981), `stroke-width="3"` pour densifier, espacement `gap-3`, texte non gras (`font-medium`).

### 5.8 FAQ accordéon

Balises `<details>/<summary>` natives, divider `divide-y border-t border-b`, chevron `w-5 h-5 text-slate-400` qui pivote avec `group-open:rotate-180 transition-transform`.
Réponse : `text-sm text-slate-600` avec `mt-2`.
**Pas de framework d'accordéon** — HTML natif = accessibilité gratuite + zéro JS.

### 5.9 Bandeau CTA final

```html
<section class="bg-primary-dark py-16 px-4 text-center">
  <h2 class="text-2xl font-bold text-white">Ne laissez plus filer vos revenus.</h2>
  <p class="text-emerald-100 font-medium">…</p>
  <button class="bg-white text-primary-dark px-10 py-4 rounded-xl font-bold text-lg shadow-xl">…</button>
</section>
```
Texte secondaire sur fond vert : **toujours `text-emerald-100`**, jamais `text-white/70` ni `text-gray-200`.

---

## 6. Style d'écriture (copy)

### 6.1 Principes

- **Français direct, concret, chiffré.** On parle argent (€), temps (3 min), volume (+200, 4 520).
- **Phrases interrogatives en hero** pour mettre le lecteur face à son angle mort : *"Combien votre cabinet perd-il vraiment chaque année en rendez-vous manqués ?"*.
- **Verbes à l'impératif** sur les CTA : *Lancer*, *Ne laissez plus*, *Commencez*, *Découvrez*.
- **Nombres jamais écrits en lettres** dès qu'ils portent du sens : *"15k€"*, *"3 minutes"*, *"72/100"*.
- **Zéro jargon tech.** Pas de *"pipeline IA"*, *"machine learning"*, *"transformation digitale"*. À la place : *"notre IA analyse"*, *"audit automatisé"*, *"rapport personnalisé"*.
- **Zéro jargon médical creux.** Pas de *"optimiser le parcours patient"*. À la place : *"vos rendez-vous manqués"*, *"vos patients qui ne viennent pas"*.

### 6.2 Lexique canonique (à réutiliser verbatim)

| Concept | Formulation validée |
|---|---|
| Le produit | *"audit financier"*, *"audit IA"*, *"audit"* (jamais "outil", "plateforme", "solution") |
| L'entrée | *"votre fichier CSV"*, *"vos données"*, *"votre export"* |
| Le sujet | *"rendez-vous manqués"*, *"no-shows"*, *"absences"* |
| L'impact | *"manque à gagner annuel"*, *"CA perdu"*, *"revenus qui filent"*, *"potentiel de récupération"* |
| La cible | *"votre cabinet"*, *"cabinets médicaux"*, *"praticiens libéraux"* |
| La promesse temps | *"en 3 minutes"*, *"instantané"*, *"immédiat"* |
| Le livrable | *"rapport PDF"*, *"plan d'action"*, *"recommandations personnalisées"* |

### 6.3 Titres de section canoniques

Courts, sans verbe, sans ponctuation. Deux à quatre mots max :
- *Pour qui*
- *Comment ça marche*
- *Ce que révèle votre audit*
- *FAQ*
- *Synthèse*, *Manque à gagner*, *Où & Quand*, *Score cabinet*, *Plan d'action* (steps)

### 6.4 Ton par section

| Section | Ton |
|---|---|
| Hero | Interpellation + promesse chiffrée |
| Stats bandeau | Factuel brut, zéro adjectif |
| Pour qui | Taxonomique, sobre |
| Comment ça marche | Pédagogique, verbes d'action |
| Ce que révèle | Enumératif, rassurant, orienté bénéfice |
| Témoignage | Citation avec chiffre concret (*"15k€ récupérés"*) |
| FAQ | Direct, réponses courtes (1 phrase) |
| CTA final | Injonction positive, urgence douce |

---

## 7. Application au flux audit (5 steps)

La DA définie ci-dessus doit être appliquée à chaque step. Mapping recommandé :

| Step | Composant signature à utiliser | Couleur dominante |
|---|---|---|
| 1. Synthèse | 4 cards KPI pastels (§5.2) + mini graphique courbe émeraude | Les 4 couleurs pastels côte à côte |
| 2. Manque à gagner (money build) | Card KPI "CA perdu" pleine taille (violet `#ECCDF8` + chiffre `text-purple-800`) | **Violet** (argent) |
| 3. Où & Quand | Bars chart `fill="#10B981"` sur fond `bg-gray-50`, sparkline conditionnelle émeraude | **Émeraude** (signal) |
| 4. Score cabinet | Score card circulaire 72/100 (§5.5) + breakdown en mini-cards pastels | **Vert sapin** (`#064E3B`) |
| 5. Plan d'action / CTA | Card étape numérotée (§5.6) triplée pour lister les actions + bandeau CTA final (§5.9) | **Vert sapin** |

Le Stepper existant (`components/audit/Stepper.tsx`) doit passer en dots `bg-primary-dark` pour l'étape active, `bg-gray-200` pour les inactives, labels `text-slate-600`.

Le bouton "Précédent / Continuer" récemment ajouté : *Continuer* = CTA primary (`bg-primary-dark text-white rounded-xl`), *Précédent* = CTA secondary (`bg-white border border-slate-300 text-slate-700 rounded-xl`). Padding réduit `px-6 py-3`.

---

## 8. Checklist d'application (pour chaque nouveau sketch)

Avant de livrer un sketch via `gsd`, vérifier :

- [ ] Fond global `bg-gray-50`, surfaces `bg-white`
- [ ] Police Inter chargée, `font-extrabold`/`font-black` sur titres et chiffres
- [ ] CTA primary en `#064E3B`, jamais en émeraude vif `#10B981`
- [ ] Les 4 couleurs pastels KPI respectent leur sémantique (Volume=bleu / Signal=émeraude / Taux=orange / Argent=violet)
- [ ] Rayons : `rounded-xl` boutons, `rounded-2xl` cards, `rounded-3xl` héros uniquement
- [ ] Bordures fines `border-gray-100` ou `border-gray-200` uniquement
- [ ] Aucun gradient autre que le fill de courbe `from-emerald-100 to-transparent`
- [ ] Copy en français, chiffré, impératif sur CTA, zéro jargon
- [ ] Labels KPI en UPPER `text-[10px] font-bold`
- [ ] Aucune trace de dark mode, glow, neon, violet cyber

---

## 9. Hors-scope explicite

Ce document **ne couvre pas** :
- L'identité visuelle du PDF généré (reste dark `#111111` + or `#d4a843`, voir `RapportPDF.tsx`) — c'est un choix produit délibéré pour distinguer le rapport premium du web.
- Les animations Framer Motion (déjà figées par la skill `sketch-findings-system-audit-noshows`).
- La version mobile du flux audit (à traiter en phase dédiée).

En cas de conflit entre ce document et la skill auto-loaded "sketch-findings-system-audit-noshows" (qui décrit le dark clinical précédent) : **ce document prévaut**. La skill devra être mise à jour pour refléter la nouvelle DA clinique-claire.
