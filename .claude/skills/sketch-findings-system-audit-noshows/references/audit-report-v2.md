# Audit Report v2 — Validated Design Decisions

## Overall Direction

Rapport d'audit dentaire en mode **clinique & factuel**, inspiré Apple Health
et rapports médicaux. Blanc clinique, grands nombres avec autorité,
typographie serif pour les chiffres-clés, palette neutre + accents médicaux.

**À éviter absolument** (directions testées / existantes à ne pas reprendre) :
- Dark premium SaaS (`landing.html`, `mockup.html`, aurora mesh, glassmorphisme)
- Gradients tape-à-l'œil, shadows colorées, effets 3D
- Emoji décoratifs à outrance (sauf micro-signaux dans reassurance CTA)
- Dashboard "growth hacking" (compteur animé 0→X€, équivalents "Dacia / 85 prothèses" — testés en variant B du sketch 002, rejetés comme trop racoleurs)

---

## Palette (tokens)

| Token | Hex | Usage |
|---|---|---|
| `--bg` | `#F7F7F8` | Fond de page (blanc cassé clinique) |
| `--bg-elevated` | `#FFFFFF` | Cards, containers élevés |
| `--bg-subtle` | `#F2F2F4` | Cells secondaires, money-row backgrounds |
| `--border` | `#E5E5E7` | Bordures standards |
| `--border-strong` | `#D2D2D7` | Bordures contrastées |
| `--text` | `#1D1D1F` | Texte principal + cards noires verdict/CTA |
| `--text-secondary` | `#424245` | Texte secondaire (lede, captions) |
| `--text-tertiary` | `#86868B` | Labels, eyebrows, notes footer |
| `--blue` | `#0066CC` | Accent médical (boutons secondaires, liens, ring neutre) |
| `--blue-soft` | `#E8F1FB` | Fonds info |
| **`--red`** | **`#FF3B30`** | **Chiffres d'alerte (CA perdu, taux, score bas). Rouge Apple, pas rouge marketing.** |
| `--red-soft` | `#FFEBEA` | Fonds d'alerte discrets (total money-row, row "yours" comparatif) |
| `--orange` | `#FF9500` | Warnings intermédiaires (jeudi concentration, tendance) |
| `--orange-soft` | `#FFF4E5` | Fonds orange |
| `--green` | `#34C759` | Succès, benchmarks atteignables |
| `--green-soft` | `#E8F8EE` | Fonds success |

Règle d'application couleurs :
- **Rouge** pour les signaux forts (CA perdu, taux no-show élevé, score tiers bas)
- **Orange** pour les warnings intermédiaires (concentration d'un jour spécifique)
- **Bleu** pour les actions (liens, boutons secondaires) et les infos neutres
- **Noir (`--text`)** pour les cards de verdict/CTA — zéro gradient coloré, juste un léger radial subtle rouge au top

---

## Typographie

| Token | Font-stack | Usage |
|---|---|---|
| `--font-sans` | SF Pro Text, Inter, Helvetica, Arial | Corps, UI standard |
| `--font-display` | SF Pro Display, Inter | Titres h1/h2/h3, headlines |
| **`--font-serif`** | **New York, Source Serif, Charter, Georgia** | **Chiffres-clés d'autorité (42 380 €, 14,2 %, 54/100, jeudi, +0,8 pt)** |
| `--font-mono` | SF Mono, JetBrains Mono | Non utilisé dans l'audit v2 |

**Règle d'or :** tout chiffre qui "porte" l'histoire est en `serif`, tabular-nums, couleur selon sévérité. Les chiffres auxiliaires (7, 10, 18, etc. des barres) restent en sans-serif.

Letter-spacing :
- Titres display : `-0.02em`
- Chiffres XXL serif : `-0.03em` à `-0.04em`
- Eyebrows (uppercase small caps) : `+0.08em`

---

## Radius & Spacing

| Token | Valeur | Usage |
|---|---|---|
| `--radius-sm` | 8px | money-rows, d2-cells, small buttons |
| `--radius` | 14px | cards standard, breakdown items |
| `--radius-lg` | 20px | step-cards, verdict cards |
| `--radius-xl` | 28px | containers héros (non utilisé encore) |

Spacing scale : `4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96`. Les valeurs qui reviennent le plus souvent : `--s5` (24px) pour gaps inter-sections, `--s7` (48px) pour padding step-cards.

Shadows — **subtiles, cliniques** :
- `--shadow-sm: 0 1px 2px rgba(0,0,0,0.04)` — toolbar, micro-reliefs
- `--shadow: 0 4px 16px rgba(0,0,0,0.06)` — cards flottantes occasionnelles
- `--shadow-lg: 0 12px 40px rgba(0,0,0,0.08)` — sticky CTA pill uniquement

---

## Layout global — Stepped Reveal 6 steps

**Décision validée (sketch 001, winner C).** La page de résultats audit v2
est un parcours guidé, **une section = un écran**, bouton "Continuer →" en
bas pour passer à la suivante. Chaque step a son propre graphique contextuel.

### Structure du parcours

| Step | Titre | Contenu | Graph |
|---|---|---|---|
| **01** | Synthèse | "Bienvenue Dr. X. Analyse de 2 847 RDV..." | Donut comparatif (cabinet 14,2% / secteur 4% / top 10% 1,8%) |
| **02** | Détail des no-shows | "Votre cabinet perd 42 380 € / an" | Money build + reveal latéral comparatif marché (sketch 002 winner D) |
| **03** | Répartition hebdomadaire | "Le jeudi concentre 38 %..." | Bars horizontales par jour, rouge si > moyenne cabinet |
| **04** | Tendance 6 mois | "La situation s'aggrave..." | Line chart rouge ascendante avec gradient area |
| **05** | Score global | "54 / 100 · Tiers bas" | Activity ring 220px style Apple + breakdown no-shows/Google + sticky CTA (sketch 003 winner A) |
| **06** | Synthèse + Action | Split problème / solution + CTA Calendly | Pas de graph — liste de 4 signaux × liste plan 30min (sketch 004 winner C) |

### Pattern stepper (header top)

```html
<div class="stepper">
  <div class="step-dot done"></div>
  <div class="step-dot done"></div>
  <div class="step-dot current"></div>
  <div class="step-dot"></div>
  <div class="step-dot"></div>
  <div class="step-dot"></div>
</div>
```

```css
.stepper { display: flex; gap: 8px; }
.step-dot { flex: 1; height: 4px; background: var(--bg-subtle); border-radius: 999px; }
.step-dot.done, .step-dot.current { background: var(--blue); }
.step-dot.current { position: relative; }
.step-dot.current::after {
  content: ""; position: absolute; inset: -4px;
  border: 2px solid var(--blue); border-radius: 999px;
}
```

### Pattern step-card (container principal de chaque step)

```html
<div class="step-card">
  <span class="step-num">03</span>       <!-- serif large 56px coin top-right opacity 0.4 -->
  <div class="eyebrow" style="color: var(--red);">Répartition hebdomadaire</div>
  <h2>Le jeudi concentre <span class="serif">38 %</span> de vos no-shows.</h2>
  <p class="lede">Un jour à fort turnover...</p>

  <!-- Graph contextuel ici -->

  <div class="step-nav">
    <button class="btn btn-ghost">← Précédent</button>
    <span class="pos">Section · Répartition</span>
    <button class="btn btn-primary">Continuer →</button>
  </div>
</div>
```

```css
.step-card {
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 48px;
  min-height: 500px;
  position: relative;
}
.step-card .step-num {
  position: absolute; top: 24px; right: 24px;
  font-family: var(--font-serif); font-size: 56px;
  color: var(--text-tertiary); font-weight: 500; opacity: 0.4;
}
.step-nav {
  display: flex; justify-content: space-between; align-items: center;
  margin-top: 48px; padding-top: 24px;
  border-top: 1px solid var(--border);
}
```

---

## Pattern · Step 02 — Hero KPI avec reveal latéral (sketch 002 winner D)

Ce pattern est **la signature** du rapport v2. À répliquer fidèlement.

### Idée

1. Le praticien voit le money build (calcul ligne à ligne : 78 créneaux × 150 € × 12 mois = 42 380 €)
2. Un bouton noir flottant à droite `Comparer au marché →` est centré sur le bord droit
3. Au clic, le panneau de droite se déploie (grille `1fr 0fr` → `1fr 1fr` en 700ms `cubic-bezier(0.22, 1, 0.36, 1)`)
4. Le panneau droit révèle le split comparatif (votre 42 380 € / top 10% 6 200 €) + gap card noir "Écart à combler : 36 180 €"
5. Le bouton migre en bas-center, flèche tourne 180deg, label devient "Masquer —"

### CSS clés

```css
.d-stage {
  display: grid; grid-template-columns: 1fr 0fr;
  transition: grid-template-columns 0.7s cubic-bezier(0.22, 1, 0.36, 1);
  position: relative; min-height: 320px;
}
.d-stage.revealed { grid-template-columns: 1fr 1fr; }
.d-right { opacity: 0; pointer-events: none; overflow: hidden; }
.d-stage.revealed .d-right { opacity: 1; pointer-events: auto; transition-delay: 0.3s; }

.d-reveal {
  position: absolute; top: 50%; left: 100%;
  transform: translate(-50%, -50%);
  background: var(--text); color: white;
  padding: 12px 20px 12px 22px; border-radius: 999px;
  box-shadow: var(--shadow-lg); z-index: 3;
}
.d-stage.revealed .d-reveal {
  top: 100%; left: 50%;
  background: var(--bg-subtle); color: var(--text-secondary);
}
.d-reveal-arrow { transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1); }
.d-stage.revealed .d-reveal-arrow { transform: rotate(180deg); }
```

**Responsive mobile (<860px) :** bascule en stack vertical, `max-height: 0` → `1000px` sur reveal.

### Money build (colonne gauche)

```html
<div class="money-stack">
  <div class="money-row"><span class="lab">Créneaux perdus / mois</span><span class="val serif">78</span></div>
  <div class="money-row"><span class="lab">× Tarif moyen / créneau</span><span class="val serif">150 €</span></div>
  <div class="money-row"><span class="lab">= Perte mensuelle</span><span class="val serif">3 530 €</span></div>
  <div class="money-row total"><span class="lab">Perte annualisée</span><span class="val serif">42 380 €</span></div>
</div>
```

```css
.money-row { display: grid; grid-template-columns: 1fr auto;
  padding: 12px 16px; background: var(--bg-subtle); border-radius: var(--radius-sm); }
.money-row.total { background: var(--red-soft); color: var(--red);
  font-weight: 600; padding: 16px; border: 1.5px solid var(--red); }
.money-row .val.serif { font-family: var(--font-serif); font-variant-numeric: tabular-nums; }
.money-row.total .val { color: var(--red); font-size: 26px; }
```

---

## Pattern · Step 05 — Score global Apple Activity Ring (sketch 003 winner A)

### Ring SVG — circle SVG rotate(-90deg) pour partir du haut

```html
<svg class="ring-big" viewBox="0 0 280 280">
  <circle class="ring-track" cx="140" cy="140" r="115"/>
  <circle class="ring-prog" cx="140" cy="140" r="115"
          stroke="#FF3B30"
          stroke-dasharray="722" stroke-dashoffset="332"/>
  <text class="ring-val" x="140" y="152" fill="#1D1D1F">54</text>
  <text class="ring-unit" x="140" y="178">/ 100</text>
  <text class="ring-lab" x="140" y="216">Tiers bas</text>
</svg>
```

```css
.ring-track { fill: none; stroke: var(--bg-subtle); stroke-width: 20; }
.ring-prog { fill: none; stroke-width: 20; stroke-linecap: round;
  transform: rotate(-90deg); transform-origin: 140px 140px; }
.ring-val { font-family: var(--font-display); font-size: 84px;
  font-weight: 600; text-anchor: middle; letter-spacing: -0.03em; }
```

**Formule stroke-dashoffset :** `circumference (2πr = 722) × (1 - score/100)`.
Pour 54/100 : `722 × 0.46 ≈ 332`.

Règle couleur du ring selon le score :
- `>= 80` → `--green`
- `50–79` → `--orange`
- `< 50` → `--red`
Le score 54 dans le sketch est affiché en rouge car "tiers bas" (règle métier : tout ce qui est sous la moyenne secteur = rouge).

### Breakdown 2 cards sous le ring

```html
<div class="breakdown">
  <div class="bd-item bad">
    <span class="l">Volet no-shows</span>
    <div class="n serif">40 <span class="muted">/ 50</span></div>
    <div class="s">Taux 14,2 % — tiers bas du marché</div>
  </div>
  <div class="bd-item">
    <span class="l">Volet Google</span>
    <div class="n serif">— <span class="muted">/ 50</span></div>
    <div class="s">Non analysé · <a>Lancer l'analyse</a></div>
  </div>
</div>
```

### Sticky CTA pill (toujours visible pendant step 5)

```css
.sticky-cta {
  position: fixed; bottom: 16px; left: 50%; transform: translateX(-50%);
  background: var(--text); color: white;
  padding: 12px 16px 12px 24px; border-radius: 999px;
  box-shadow: var(--shadow-lg);
  display: flex; align-items: center; gap: 16px; z-index: 50;
}
.sticky-cta .btn { background: white; color: var(--text); padding: 10px 18px; }
```

---

## Pattern · Step 06 — Synthèse + CTA Split problème/solution (sketch 004 winner C)

Dernière step du parcours. Deux colonnes côte à côte, mêmes proportions :
- **Gauche (blanc `--bg-elevated`)** : "Ce que votre CSV révèle" — 4 signaux critiques en liste
- **Droite (noir `--text`, inversé)** : "Ce que PerfIAmatic peut faire" — plan d'action en 30 min (4 items : Audit process 10min / 3 leviers 15min / Plan remis 5min / Zéro pitch 100%)

### Block CTA (bas de la colonne droite)

```html
<div class="c-cta-block">
  <div class="big serif tabular">42 380 €</div>
  <p>c'est ce que votre cabinet pourrait récupérer</p>
  <button class="btn btn-primary">Réserver un RDV Calendly →</button>
  <div class="reassure">⏱ Sous 48h · 🔒 RGPD · 📎 Plan remis même sans achat</div>
</div>
```

**Reassurance micro-signaux obligatoires :** ⏱ ⟂ 🔒 ⟂ 📎. Les 3 formulations validées :
- `⏱ Créneau sous 48h`
- `🔒 Conforme RGPD`
- `📎 Vous ressortez avec un plan d'action, même sans achat`

Ces 3 micro-signaux lèvent les 3 objections principales : délai / confidentialité / gratuité réelle.

**Responsive (<860px) :** les 2 colonnes se stackent verticalement, border-right → border-bottom.

---

## Patterns de graphes récurrents

### Bar chart horizontal (step 03 — répartition par jour)

```css
.bar-row { display: grid; grid-template-columns: 80px 1fr 60px;
  align-items: center; gap: 12px; padding: 8px 0; }
.bar-row .bar { height: 10px; background: var(--bg-subtle);
  border-radius: 999px; overflow: hidden; }
.bar-row .bar i { display: block; height: 100%;
  background: var(--blue); border-radius: 999px;
  transition: width 1s ease; }
.bar-row.high .bar i { background: var(--red); }
```

Règle : barre rouge si valeur > moyenne du cabinet, bleue sinon.

### Donut comparatif (step 01 — synthèse)

Circle SVG avec `stroke-dasharray` + `stroke-dashoffset`, même principe que le ring. Donut center affiche la valeur cabinet, légende à côté avec 3 rows : votre cabinet / moyenne / top 10%.

### Line chart sparkline (step 04 — tendance)

```svg
<svg viewBox="0 0 600 160" preserveAspectRatio="none">
  <defs>
    <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FF3B30"/>
      <stop offset="100%" stop-color="#FF3B30" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <path class="line-area" d="..." fill="url(#redGradient)" opacity="0.15"/>
  <path class="line-path" d="..." stroke="#FF3B30" stroke-width="2.5" fill="none"/>
  <circle class="line-dot" cx="..." cy="..." r="4" fill="#FF3B30"/>
</svg>
```

Grid dashed horizontal tous les 40px : `stroke: var(--border); stroke-dasharray: 2 4;`.

### Verdict card (step 06 — récurrent pour CTA)

Pattern noir avec `::before` radial subtle rouge au top :
```css
.verdict-card { background: var(--text); color: white;
  border-radius: var(--radius-lg); position: relative; overflow: hidden; }
.verdict-card::before {
  content: ""; position: absolute; inset: 0;
  background: radial-gradient(circle at 50% 0%, rgba(255,59,48,0.15), transparent 60%);
  pointer-events: none;
}
```

Le chiffre-clé XXL dedans : `font-family: var(--font-serif); font-size: clamp(72px, 10vw, 112px);`.

---

## Copy / ton de voix

Validé à travers les 4 sketches :

- **Titres** : phrases courtes, parfois inachevées, terminant sur le chiffre-clé
  > "Votre cabinet perd **42 380 €** chaque année."
  > "Le jeudi concentre **38 %** de vos no-shows."
  > "Votre cabinet obtient **54 / 100**."

- **Ledes** : 1-2 phrases factuelles, jamais de langage commercial
  > "Calculé ligne à ligne depuis votre CSV. Pas d'estimation au doigt mouillé — votre historique réel annualisé."

- **CTA final** : direct, zéro pitch, focus sur la valeur concrète
  > "Discutons de comment récupérer votre chiffre d'affaires."
  > "30 minutes avec un expert PerfIAmatic. Zéro engagement."

- **Éviter** : "nous sommes leaders", "votre partenaire", "l'excellence de nos services", tout superlatif auto-élogieux.

---

## Rappels métier critiques (invariants techniques)

1. **`ca_perdu` est déjà annualisé** côté n8n — afficher tel quel dans le money build (ne jamais `× 12`).
2. **Clé Google Places API côté serveur uniquement** — step 05 doit fallback gracieux si Google absent (affichage "—/50 · Non analysé · Lancer l'analyse").
3. **Scores affichés** : sur 100 si les 2 volets analysés, sur 50 sinon, avec mention explicite "Score partiel".
4. **Rapport complet < 60 secondes** — le stepped reveal doit être léger (pas de lib de transition lourde, tout CSS/SVG natif).
5. **RGPD** : aucun nom de patient affiché dans les graphes ou la synthèse (le rapport doit rester sur les aggregates).

---

## Origin

Synthetized from sketches :
- `001-layout-structure` (winner C · Stepped reveal 6 steps)
- `002-hero-kpi` (winner D · Money build + reveal latéral)
- `003-conversion-moment` (winner A · Activity ring + sticky CTA)
- `004-synthesis-cta` (winner C · Split problème/solution + CTA)

Source HTML files preserved in `../sources/`.
Theme CSS in `../sources/themes/default.css`.

**Last validated:** 2026-04-22
**Review trigger:** re-sketcher si la direction clinique Apple Health est remise en question.
