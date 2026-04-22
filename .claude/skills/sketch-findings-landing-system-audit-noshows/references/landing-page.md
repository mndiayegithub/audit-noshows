# Landing Page — Design Reference

Validated direction from sketches 005-008 (2026-04-22).
Target : cabinets médicaux FR (dentistes, médecins, paramédical).
Single CTA strategy : push vers `/audit`.

---

## Overall direction

**Dark premium**, volontairement distinct du rapport d'audit (clinique Apple Health blanc).
Rationale : la landing a un rôle commercial — capter, crédibiliser, convertir. Le contraste entre la landing dark et le rapport light renforce l'effet "document médical sérieux" au moment du rapport.

**Toggle dark/light à prévoir** : la landing peut être livrée en dark uniquement, mais la version light (même structure, palette clinique) est pertinente pour les utilisateurs qui préfèrent. Sketch 005 variant C est la référence light du même layout que D.

---

## Palette

```css
/* Bases */
--bg-dark: #0A0A0C;
--surface-1: rgba(255,255,255,0.04);  /* cards glassmorphism */
--surface-2: rgba(255,255,255,0.06);  /* hover */
--border-1: rgba(255,255,255,0.08);
--border-strong: rgba(255,255,255,0.14);
--text-primary: #F5F5F7;
--text-secondary: rgba(245,245,247,0.7);
--text-tertiary: rgba(245,245,247,0.55);
--text-quaternary: rgba(245,245,247,0.45);

/* Accent gradient (signature de la landing) */
--accent-1: #A78BFA;  /* violet */
--accent-2: #F472B6;  /* rose */
--accent-3: #FB923C;  /* orange (tertiaire) */
--accent-alert: #FF6961;  /* rouge doux pour chiffres négatifs (CA perdu) */

/* Success / status */
--success: #34D399;  /* vert micro-dot pulse */
--warning: #FBBF24;  /* étoiles témoignages */
```

**Mesh radial en fond** (utilisé sur les sections) :
```css
.wrap::before {
  content: ""; position: absolute; inset: 0; pointer-events: none;
  background:
    radial-gradient(700px 500px at 20% 20%, rgba(99,102,241,0.12), transparent 60%),
    radial-gradient(600px 500px at 85% 80%, rgba(236,72,153,0.08), transparent 60%);
}
```

---

## Typographie

- **Titres** : `SF Pro Display` fallback `-apple-system, Inter` · `font-weight: 600` · `letter-spacing: -0.03em` · line-height 1.05-1.1
- **Chiffres-clés / accents** : `New York` fallback `Source Serif Pro, Charter, Georgia serif` · `font-weight: 500` · gradient text
- **Corps** : `SF Pro Text` · `font-size: 15-18px` · `line-height: 1.6` · color `rgba(245,245,247,0.7)`
- **Eyebrows** : 12px, `letter-spacing: 0.14em`, uppercase, couleur `--accent-1`, avec dot pulse

**Pattern gradient text** (réutilisé partout pour les chiffres et accents) :
```css
.accent {
  font-family: var(--font-serif);
  background: linear-gradient(135deg, #A78BFA, #F472B6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

**Pattern titre dégradé blanc→gris** (corps des H1/H2) :
```css
.title {
  background: linear-gradient(180deg, #FFFFFF 0%, #C7C7CC 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

---

## Radius, shadows, effets

- Cards : `border-radius: 14-20px` · border `1px solid rgba(255,255,255,0.08)` · backdrop-filter `blur(10-14px)`
- CTA pills : `border-radius: 999px` · padding `16-18px 26-32px`
- Shadows : pas de couleur, juste des noirs profonds pour les élévations majeures : `0 30px 80px rgba(0,0,0,0.5)`
- Halo violet/rose derrière les cards d'impact (preview rapport, CTA card) :
  ```css
  .card::before {
    content: ""; position: absolute; inset: -14px;
    background: linear-gradient(135deg, rgba(167,139,250,0.25), rgba(244,114,182,0.15));
    border-radius: 28px; z-index: -1; filter: blur(28px);
  }
  ```

---

## Structure de la landing (ordre validé)

```
[Nav sticky blur]
[HERO — Split dark premium]          ← sketch 005 D
[HOW IT WORKS — 3 steps numérotés]   ← sketch 006 A
[SOCIAL PROOF — Marquee + 4 stats]   ← sketch 007 B
[FAQ minimal 4 Q]                    ← sketch 008 C (haut)
[FINAL CTA full-bleed]               ← sketch 008 C (bas)
[Footer minimal]
```

---

## Section 1 — Hero (sketch 005 winner D)

**Layout :** grid 2 colonnes · gauche = message + CTA · droite = preview réaliste du rapport (carte glassmorphism translucide en rotation `0.6deg`, halo violet/rose derrière).

**Contenu gauche :**
- Eyebrow : "Audit gratuit · Sans compte · 60 s" avec dot vert pulse
- H1 dégradé blanc→gris : "Combien vous coûtent réellement vos rendez-vous manqués ?"
- Sous-ligne serif gradient : "Chiffre précis en 60 s."
- Lede 18px `rgba(245,245,247,0.7)` (max-width 520px)
- CTA pill blanc "Démarrer l'audit →" + lien ghost "Voir un exemple →"
- Reassurance inline 3 items : ⏱ 60 s · 🔒 RGPD strict · 📎 PDF sans achat

**Contenu droite (preview rapport) :**
- Carte tag rouge "Rapport généré" + date
- KPI géant serif gradient rouge→rose `42 380 €` + label "Manque à gagner annualisé"
- Grid 2 cols : cellule `14,2 %` (taux) · cellule ring score `54/100`
- Cellule full-width : mini bar chart 7 jours (L-D) en rouge/orange

**Responsive :** grid devient 1 col sous 860px, rotation annulée sur carte.

---

## Section 2 — How it works (sketch 006 winner A)

**Layout :** `grid-template-columns: repeat(3, 1fr); gap: 20px;` · head centré dessus.

**Chaque card (x3) :**
- Numéro serif géant 72px gradient violet→rose (`01` `02` `03`)
- H3 15-22px (Upload du CSV / Analyse IA / Rapport chiffré)
- 1 phrase de description
- Tag pill discret (CSV Doctolib / 30 à 50 s / PDF téléchargeable)
- Flèche circle → positionnée à droite (absolute) pour relier aux cards suivantes (cachée sur mobile)

**Interaction :** hover subtil `background: rgba(255,255,255,0.06); transform: translateY(-2px)`.

---

## Section 3 — Social proof (sketch 007 winner B)

**Layout :** marquee horizontal de logos en haut + grid 4 stats en dessous.

**Marquee :**
- Bande défilante infinie (animation CSS `30s linear infinite`) avec fade sur les bords (mask-image linear-gradient)
- 8 "logos" génériques répétés (ic + nom cabinet) : ◉ Cabinet X / ✚ Clinique Y / ◈ Maison médicale Z...
- Chaque logo = border rounded 12px, bg `rgba(255,255,255,0.03)`, hauteur 56px

**Stats grid (4 cols) :**
- KPI géant serif 48px gradient · label 13px · barre progression gradient en dessous
- Exemples (à remplacer par vrais chiffres) : +240 cabinets · 9,4 M€ CA identifié · 4,8/5 note · 54 s temps moyen

**Alternative à garder en tête :** variant A (cards témoignages) est aussi valide ; une idée d'animation existe côté user à préciser avant implémentation.

---

## Section 4 — FAQ minimal (sketch 008 winner C, partie haute)

**Layout :** accordéon full-width épuré, 680px max-width.

- Border-top + border-bottom sur chaque item (`rgba(255,255,255,0.1)`)
- Bouton question : 24px vertical padding, 17px font, flex justify-between
- Chevron `+` qui rotate 45° quand ouvert + change de couleur vers violet `--accent-1`
- Réponse : `max-height` animation, color `rgba(245,245,247,0.7)`
- 4 questions essentielles (data, formats CSV, compte, prix) — pas plus

---

## Section 5 — Final CTA full-bleed (sketch 008 winner C, partie basse)

**Layout :** section centrée avec halo radial violet.

```css
.final {
  padding: 80px 0;
  border-top: 1px solid rgba(255,255,255,0.08);
  border-radius: 32px;
  background: radial-gradient(600px 400px at 50% 50%, rgba(167,139,250,0.15), transparent 70%);
  text-align: center;
}
```

- H2 géant (36-60px clamp) dégradé blanc→gris + sous-ligne serif gradient rouge→rose
- Lede 17px max-width 540px
- CTA pill blanc 20px vertical padding, 17px font, box-shadow rose `0 20px 60px rgba(244,114,182,0.18)`
- Reassurance ⏱🔒📎 inline en dessous

---

## Interactions signatures

- **Hover cards** : `translateY(-2px)` + bg lighter (`0.04 → 0.06`)
- **Dot pulse vert** (status "live") : keyframes opacity 0.4 ↔ 1 + box-shadow
- **Marquee infinite** : 30s linear, mask fade sur bords
- **Accordéon** : `max-height` + `padding` animés, chevron rotate 45°
- **Gradient text ubiquitaire** pour les chiffres-clés et les accents H1

---

## Nav sticky

```css
position: sticky; top: 0; z-index: 10;
background: rgba(10,10,12,0.85);
backdrop-filter: saturate(180%) blur(14px);
border-bottom: 1px solid rgba(255,255,255,0.06);
padding: 20px 40px;
```

CTA de nav : pill blanc `background: #F5F5F7; color: #0A0A0C; font-weight: 600` (même que le hero — action unique cohérente sur toute la page).

---

## Anti-patterns (testés et rejetés)

- **Variant B sketch 005** (dark full mesh + gradient violet H1 + testimonial inline) : too much, le hero devient surchargé, perd l'ancrage produit. Le split de D avec preview rapport est plus sobre et plus crédible.
- **Variant C sketch 006** (video-like player interactif) : gimmick, le player mock noir au centre ajoute de la complexité sans beaucoup de valeur narrative.
- **Variant A sketch 007** (cards témoignages) en tant que choix principal : trop classique "SaaS 5★". Préserver comme alternative avec animation spéciale à définir.
- **Variant A sketch 008** (accordéon + sticky CTA) : sticky pill peut paraître agressif en fin de landing après que l'utilisateur ait déjà vu 2 CTA.
- **Variant B sketch 008** (6 Q tout ouvert 2 cols) : mur de texte, le visiteur saute.
- **Emoji décoratifs à outrance** — réservés aux 3 micro-signaux reassurance ⏱🔒📎🚫 et aux cards FAQ de 008 B (rejeté).
- **Direction clinique Apple Health** pour la landing entière : discuté, écarté. Cohérence passe par les chiffres serif et le ton, pas par la palette.

---

## Copy voice (validé)

- Phrases courtes finissant sur le chiffre-clé
- Ton factuel, zéro superlatif ("le meilleur", "leader", "révolutionnaire" = interdits)
- Reassurance prioritaire : RGPD, sans compte, sans CB, PDF offert
- Accent commercial toléré dans le hero uniquement (gradient, "Chiffre précis en 60 s.")
- Reste de la landing = registre factuel clinique

**Exemples validés** (pour l'implémentation) :
- Hero H1 : "Combien vous coûtent réellement vos rendez-vous manqués ?"
- Hero accent : "Chiffre précis en 60 s."
- How it works H2 : "3 étapes. 60 secondes. Aucun compte."
- Social proof H2 : "Des cabinets de toute la France."
- FAQ H2 : "L'essentiel, sans détour."
- Final H2 : "Votre audit, maintenant."

---

## Origin

Synthesized from sketches: 005 (hero-impact · winner D), 006 (how-it-works · winner A), 007 (social-proof · winner B), 008 (faq-final-cta · winner C).

Source files in: `sources/005-hero-impact/`, `sources/006-how-it-works/`, `sources/007-social-proof/`, `sources/008-faq-final-cta/`.

Theme: `sources/themes/default.css` (mêmes tokens que le skill audit — la surcouche dark est gérée section par section via les vars locales du fichier HTML).
