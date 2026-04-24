// Pas de "use client" — ce composant est importé dynamiquement, uniquement dans le browser.
// Les fonts sont enregistrées en MODULE-LOAD-TIME (avant toute création de styles),
// ce qui évite l'erreur runtime "Font family not registered: Inter".

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { AuditResponse } from "@/types/audit";
import { computeScore, scoreBadge } from "@/lib/score";

// ─── Font registration (module load) ─────────────────────────────────────────
// Inter : fichiers locaux servis par Next.js depuis /public/fonts/*.ttf
// Fraunces : fichiers chargés depuis Google Fonts CDN (pas présent en local).
// @react-pdf/renderer accepte les URLs HTTP(S) et les chemins relatifs
// servis par le serveur Next en dev et en prod. Ce composant n'étant rendu
// que côté browser (via import dynamique dans app/audit/page.tsx), les URLs
// relatives `/fonts/…` résolvent correctement.

Font.register({
  family: "Inter",
  fonts: [
    { src: "/fonts/Inter-Regular.ttf", fontWeight: 400 },
    { src: "/fonts/Inter-Medium.ttf", fontWeight: 500 },
    // Pas de SemiBold local — on réutilise Medium pour le weight 600
    // (approximation volontaire, pas de téléchargement CDN requis).
    { src: "/fonts/Inter-Medium.ttf", fontWeight: 600 },
    { src: "/fonts/Inter-Bold.ttf", fontWeight: 700 },
  ],
});

Font.register({
  family: "Fraunces",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/fraunces/v31/6NUh8FyLNQOQZAnv9ZwNjucMHVn85Ni7emAe9lKqZTnbB-jpxlxdY7Wp7rcBvNIYxA.ttf",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/fraunces/v31/6NUh8FyLNQOQZAnv9ZwNjucMHVn85Ni7emAe9lKqZTnbB-jpxlxdY7Wp7rcBxNIYxA.ttf",
      fontWeight: 500,
    },
    {
      src: "https://fonts.gstatic.com/s/fraunces/v31/6NUh8FyLNQOQZAnv9ZwNjucMHVn85Ni7emAe9lKqZTnbB-jpxlxdY7Wp7rcBitIYxA.ttf",
      fontWeight: 600,
    },
  ],
});

// ─── DA Color System — clinique-claire v2 ────────────────────────────────────
const C = {
  bg:         "#FFFFFF",   // page background
  surface:    "#F9FAFB",   // cards alt
  border:     "#E5E7EB",
  ink:        "#0F172A",   // titres, valeurs
  muted:      "#64748B",   // sous-titres, narratif
  primary:    "#064E3B",   // primary-dark — vert sapin
  // KPI pastels (bg / fg)
  volumeBg:   "#DFF3FF", volumeFg:  "#2563EB",
  signalBg:   "#DCF4E6", signalFg:  "#059669",
  tauxBg:     "#FCEACC", tauxFg:    "#EA580C",
  argentBg:   "#ECCDF8", argentFg:  "#9333EA",
  // Manque à gagner (violet plein) + blancs translucides
  moneyDark:  "#6B21A8",
  moneyTint:  "#F3E8FF",
  // Score tones
  scoreGood:  "#059669",
  scoreWarn:  "#EA580C",
  scoreBad:   "#DC2626",
  trackGray:  "#E5E7EB",
};

const NBSP = " ";

// ─── Styles ──────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  page: {
    backgroundColor: C.bg,
    paddingHorizontal: 48,
    paddingTop: 48,
    paddingBottom: 64,
    fontFamily: "Inter",
    color: C.ink,
  },

  // ── Footer (fixed) ──
  footer: {
    position: "absolute",
    bottom: 24,
    left: 48,
    right: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 8,
  },
  footerText: {
    fontFamily: "Inter",
    fontWeight: 400,
    fontSize: 8,
    color: C.muted,
  },
  footerTextStrong: {
    fontFamily: "Inter",
    fontWeight: 500,
    fontSize: 8,
    color: C.ink,
  },

  // ── Section header ──
  sectionHead: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 20,
  },
  sectionNum: {
    fontFamily: "Fraunces",
    fontWeight: 500,
    fontSize: 14,
    color: C.primary,
    marginRight: 10,
  },
  sectionTitle: {
    fontFamily: "Fraunces",
    fontWeight: 500,
    fontSize: 22,
    color: C.ink,
    letterSpacing: -0.3,
  },
  sectionLede: {
    fontFamily: "Inter",
    fontWeight: 400,
    fontSize: 10,
    color: C.muted,
    marginTop: -12,
    marginBottom: 18,
    lineHeight: 1.5,
  },

  // ══════ PAGE 1 — COVER ══════
  cover: {
    backgroundColor: C.bg,
    paddingHorizontal: 56,
    paddingTop: 60,
    paddingBottom: 48,
    fontFamily: "Inter",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  brandBolt: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: C.primary,
    color: "#FFFFFF",
    textAlign: "center",
    fontFamily: "Inter",
    fontWeight: 700,
    fontSize: 11,
    lineHeight: 1.6,
    marginRight: 8,
  },
  brandName: {
    fontFamily: "Fraunces",
    fontWeight: 600,
    fontSize: 16,
    color: C.ink,
  },
  coverCenter: {
    flex: 1,
    justifyContent: "center",
  },
  coverEyebrow: {
    fontFamily: "Inter",
    fontWeight: 600,
    fontSize: 9,
    color: C.primary,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 14,
  },
  coverTitle: {
    fontFamily: "Fraunces",
    fontWeight: 500,
    fontSize: 34,
    color: C.ink,
    lineHeight: 1.12,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  coverCabinet: {
    fontFamily: "Fraunces",
    fontWeight: 500,
    fontSize: 20,
    color: C.primary,
    marginBottom: 28,
  },
  coverMeta: {
    fontFamily: "Inter",
    fontWeight: 400,
    fontSize: 10,
    color: C.muted,
    marginBottom: 4,
  },
  coverHeroBox: {
    marginTop: 36,
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 20,
    backgroundColor: C.moneyDark,
    color: "#FFFFFF",
  },
  coverHeroEyebrow: {
    fontFamily: "Inter",
    fontWeight: 600,
    fontSize: 9,
    color: "#E9D5FF",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  coverHeroAmount: {
    fontFamily: "Fraunces",
    fontWeight: 500,
    fontSize: 46,
    color: "#FFFFFF",
    lineHeight: 1,
    letterSpacing: -1,
  },
  coverHeroSub: {
    fontFamily: "Inter",
    fontWeight: 400,
    fontSize: 10,
    color: "#F3E8FF",
    marginTop: 6,
  },
  coverFooterBar: {
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  // ══════ KPI cards (page 2) ══════
  kpiRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  kpiCard: {
    width: "48.5%",
    padding: 14,
    borderRadius: 14,
    marginRight: "3%",
  },
  kpiCardLast: {
    width: "48.5%",
    padding: 14,
    borderRadius: 14,
  },
  kpiChip: {
    fontFamily: "Inter",
    fontWeight: 600,
    fontSize: 7,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 9,
    backgroundColor: "#FFFFFF",
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  kpiValue: {
    fontFamily: "Fraunces",
    fontWeight: 500,
    fontSize: 24,
    color: C.ink,
    lineHeight: 1.1,
    marginBottom: 4,
  },
  kpiSub: {
    fontFamily: "Inter",
    fontWeight: 400,
    fontSize: 9,
    color: "#374151",
  },

  // ══════ Money build card (page 2) ══════
  moneyCard: {
    marginTop: 6,
    padding: 22,
    borderRadius: 20,
    backgroundColor: C.moneyDark,
    color: "#FFFFFF",
  },
  moneyEyebrow: {
    fontFamily: "Inter",
    fontWeight: 600,
    fontSize: 8,
    color: "#E9D5FF",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  moneyHero: {
    fontFamily: "Fraunces",
    fontWeight: 500,
    fontSize: 40,
    color: "#FFFFFF",
    lineHeight: 1,
    letterSpacing: -0.6,
    marginBottom: 8,
  },
  moneyNarrative: {
    fontFamily: "Inter",
    fontWeight: 400,
    fontSize: 10,
    color: "#F3E8FF",
    lineHeight: 1.55,
    marginBottom: 14,
  },
  moneyBreakdown: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  moneyLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  moneyLabel: {
    fontFamily: "Inter",
    fontWeight: 400,
    fontSize: 10,
    color: "#E9D5FF",
  },
  moneyVal: {
    fontFamily: "Fraunces",
    fontWeight: 500,
    fontSize: 11,
    color: "#FFFFFF",
  },
  moneyTotalLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.3)",
  },
  moneyTotalLabel: {
    fontFamily: "Inter",
    fontWeight: 500,
    fontSize: 10,
    color: "#FFFFFF",
  },
  moneyTotalVal: {
    fontFamily: "Fraunces",
    fontWeight: 500,
    fontSize: 13,
    color: "#FFFFFF",
  },

  // ══════ Where & when bars (page 3) ══════
  chartCard: {
    marginBottom: 18,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.bg,
  },
  chartTitle: {
    fontFamily: "Fraunces",
    fontWeight: 500,
    fontSize: 14,
    color: C.ink,
    marginBottom: 4,
  },
  chartSub: {
    fontFamily: "Inter",
    fontWeight: 400,
    fontSize: 9,
    color: C.muted,
    marginBottom: 14,
  },
  chartArea: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 140,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    paddingBottom: 4,
  },
  chartCol: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-end",
    marginHorizontal: 2,
  },
  chartBarValue: {
    fontFamily: "Inter",
    fontWeight: 600,
    fontSize: 8,
    color: C.ink,
    marginBottom: 3,
  },
  chartBar: {
    width: "72%",
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  chartLabels: {
    flexDirection: "row",
    marginTop: 6,
  },
  chartLabelCol: {
    flex: 1,
    textAlign: "center",
    fontFamily: "Inter",
    fontWeight: 500,
    fontSize: 8,
    color: C.muted,
  },
  chartInsight: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: C.border,
    fontFamily: "Inter",
    fontWeight: 500,
    fontSize: 10,
    color: C.ink,
  },
  chartEmpty: {
    fontFamily: "Inter",
    fontWeight: 400,
    fontSize: 10,
    color: C.muted,
    fontStyle: "italic",
    paddingVertical: 24,
    textAlign: "center",
  },

  // ══════ Score + Plan + CTA (page 4) ══════
  scoreCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.bg,
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "center",
  },
  scoreRingWrap: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 10,
    borderColor: C.trackGray,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 22,
    position: "relative",
  },
  scoreRingArc: {
    // Arc coloré simulé via un second cercle translucide par-dessus.
    position: "absolute",
    top: -10,
    left: -10,
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 10,
    borderTopColor: C.scoreGood,
    borderRightColor: C.scoreGood,
    borderBottomColor: "transparent",
    borderLeftColor: "transparent",
  },
  scoreValue: {
    fontFamily: "Fraunces",
    fontWeight: 500,
    fontSize: 40,
    color: C.ink,
    lineHeight: 1,
  },
  scoreSlash: {
    fontFamily: "Inter",
    fontWeight: 400,
    fontSize: 9,
    color: C.muted,
    marginTop: 4,
  },
  scoreBadge: {
    alignSelf: "flex-start",
    fontFamily: "Inter",
    fontWeight: 600,
    fontSize: 8,
    letterSpacing: 1,
    textTransform: "uppercase",
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: 12,
    marginBottom: 8,
  },
  scoreTitle: {
    fontFamily: "Fraunces",
    fontWeight: 500,
    fontSize: 17,
    color: C.ink,
    lineHeight: 1.25,
    marginBottom: 6,
  },
  scoreNarrative: {
    fontFamily: "Inter",
    fontWeight: 400,
    fontSize: 10,
    color: C.muted,
    lineHeight: 1.55,
  },

  planRow: {
    flexDirection: "row",
    marginBottom: 14,
  },
  planCard: {
    width: "31.3%",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.bg,
    marginRight: "3%",
  },
  planCardLast: {
    width: "31.3%",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.bg,
  },
  planBadge: {
    width: 26,
    height: 26,
    borderRadius: 6,
    textAlign: "center",
    fontFamily: "Fraunces",
    fontWeight: 500,
    fontSize: 14,
    lineHeight: 1.7,
    marginBottom: 10,
  },
  planTitle: {
    fontFamily: "Fraunces",
    fontWeight: 500,
    fontSize: 12,
    color: C.ink,
    marginBottom: 6,
    lineHeight: 1.3,
  },
  planDesc: {
    fontFamily: "Inter",
    fontWeight: 400,
    fontSize: 9,
    color: C.muted,
    lineHeight: 1.5,
    marginBottom: 8,
  },
  planGain: {
    fontFamily: "Inter",
    fontWeight: 600,
    fontSize: 7,
    color: C.muted,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },

  ctaBand: {
    padding: 22,
    borderRadius: 20,
    backgroundColor: C.primary,
    color: "#FFFFFF",
  },
  ctaEyebrow: {
    fontFamily: "Inter",
    fontWeight: 600,
    fontSize: 8,
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  ctaTitle: {
    fontFamily: "Fraunces",
    fontWeight: 500,
    fontSize: 18,
    color: "#FFFFFF",
    lineHeight: 1.25,
    marginBottom: 6,
  },
  ctaBody: {
    fontFamily: "Inter",
    fontWeight: 400,
    fontSize: 10,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 1.55,
    marginBottom: 10,
  },
  ctaUrl: {
    fontFamily: "Inter",
    fontWeight: 500,
    fontSize: 10,
    color: "#FFFFFF",
  },

  // ══════ Rapport IA (page 5, optionnelle) ══════
  rapportH1: {
    fontFamily: "Fraunces",
    fontWeight: 600,
    fontSize: 16,
    color: C.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  rapportH2: {
    fontFamily: "Fraunces",
    fontWeight: 500,
    fontSize: 13,
    color: C.ink,
    marginTop: 12,
    marginBottom: 6,
  },
  rapportH3: {
    fontFamily: "Fraunces",
    fontWeight: 500,
    fontSize: 11,
    color: C.ink,
    marginTop: 10,
    marginBottom: 4,
  },
  rapportP: {
    fontFamily: "Inter",
    fontWeight: 400,
    fontSize: 10,
    color: "#334155",
    lineHeight: 1.6,
    marginBottom: 6,
  },
  rapportLiRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  rapportBullet: {
    fontFamily: "Inter",
    fontWeight: 600,
    fontSize: 10,
    color: C.primary,
    marginRight: 8,
    marginTop: 1,
  },
  rapportLiText: {
    fontFamily: "Inter",
    fontWeight: 400,
    fontSize: 10,
    color: "#334155",
    lineHeight: 1.6,
    flex: 1,
  },
});

// ─── Utils ───────────────────────────────────────────────────────────────────
function formatDate(s: string): string {
  if (!s) return "";
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

const fmtEur = (n: number) =>
  `${Math.round(n).toLocaleString("fr-FR")}${NBSP}€`;

type MdBlock =
  | { type: "h1" | "h2" | "h3" | "p" | "li"; text: string };

function parseMarkdown(md: string): MdBlock[] {
  const blocks: MdBlock[] = [];
  for (const line of md.split(/\r?\n/)) {
    const t = line.trim();
    if (!t) continue;
    if (t.startsWith("### ")) blocks.push({ type: "h3", text: t.slice(4).trim() });
    else if (t.startsWith("## ")) blocks.push({ type: "h2", text: t.slice(3).trim() });
    else if (t.startsWith("# ")) blocks.push({ type: "h1", text: t.slice(2).trim() });
    else if (t.startsWith("- ") || t.startsWith("* ")) blocks.push({ type: "li", text: t.slice(2).trim() });
    else if (/^\d+\.\s/.test(t)) blocks.push({ type: "li", text: t.replace(/^\d+\.\s/, "").trim() });
    else blocks.push({ type: "p", text: t });
  }
  return blocks;
}

// ─── Footer component ────────────────────────────────────────────────────────
function Footer({ cabinet }: { cabinet: string }) {
  return (
    <View style={S.footer} fixed>
      <Text style={S.footerText}>GetLostRevenue · PerfIAmatic</Text>
      <Text style={S.footerTextStrong}>{cabinet}</Text>
      <Text
        style={S.footerText}
        render={({ pageNumber, totalPages }) =>
          `${pageNumber} / ${totalPages}`
        }
      />
    </View>
  );
}

// ─── Section header component ────────────────────────────────────────────────
function SectionHead({
  num,
  title,
  lede,
}: {
  num: string;
  title: string;
  lede?: string;
}) {
  return (
    <>
      <View style={S.sectionHead}>
        <Text style={S.sectionNum}>{num}.</Text>
        <Text style={S.sectionTitle}>{title}</Text>
      </View>
      {lede ? <Text style={S.sectionLede}>{lede}</Text> : null}
    </>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function RapportPDF({ resultats }: { resultats: AuditResponse }) {
  const { stats, rapport_texte } = resultats;
  const debut = formatDate(stats.periode.debut);
  const fin = formatDate(stats.periode.fin);
  const dateGen = formatDate(new Date().toISOString());
  const blocks = rapport_texte ? parseMarkdown(rapport_texte) : [];

  // Score via lib/score.ts — même formule que ScoreHero (pas de duplication)
  const score = computeScore(stats.global.taux);
  const badge = scoreBadge(score);

  // Money build — miroir MoneyBuildCard
  const noShows = stats.global.no_shows;
  const caMoyen = stats.global.ca_moyen ?? 0;
  const nbMois = stats.periode?.nb_mois ?? 3;
  const pertePeriode = Math.round(noShows * caMoyen);
  const facteur =
    nbMois > 0 ? (12 / nbMois).toFixed(1).replace(".", ",") : "—";

  // Score tone → couleur badge
  const scoreToneColor =
    badge.tone === "good"
      ? { bg: C.signalBg, fg: C.signalFg }
      : badge.tone === "warn"
      ? { bg: C.tauxBg, fg: C.tauxFg }
      : { bg: "#FEE2E2", fg: C.scoreBad };

  const scoreTitle =
    badge.tone === "good"
      ? `Il reste ${100 - score} points à aller chercher.`
      : badge.tone === "warn"
      ? `Score correct, ${100 - score} points à aller chercher.`
      : `Score critique — priorité absolue sur le plan d'action.`;

  // Par jour — normalisation depuis stats.par_jour (préféré) ou stats_par_jour
  type DayBar = { jour: string; noShows: number; total: number; taux: number };
  const parJourRaw = stats.par_jour ?? stats.stats_par_jour ?? [];
  const parJour: DayBar[] = parJourRaw.map((d) => {
    // stats.par_jour : { jour, total_rdv, no_shows, taux }
    // stats.stats_par_jour : { jour, total, noShows, taux }
    const anyD = d as unknown as Record<string, number | string>;
    return {
      jour: String(anyD.jour ?? ""),
      total:
        Number(anyD.total_rdv ?? anyD.total ?? 0) || 0,
      noShows:
        Number(anyD.no_shows ?? anyD.noShows ?? 0) || 0,
      taux: Number(anyD.taux ?? 0) || 0,
    };
  });
  const maxNoShows = parJour.reduce((m, d) => Math.max(m, d.noShows), 0);
  const pic =
    parJour.length > 0
      ? parJour.reduce((a, b) => (b.noShows > a.noShows ? b : a), parJour[0])
      : null;

  // Plan d'action — miroir PlanTimeline
  const planItems: Array<{
    num: "1" | "2" | "3";
    bg: string;
    fg: string;
    title: string;
    desc: string;
    gain: string;
  }> = [
    {
      num: "1",
      bg: C.volumeBg,
      fg: C.volumeFg,
      title: "Rappels SMS automatiques J-2",
      desc:
        "Réduit les no-shows de 35 % en moyenne sur les créneaux du matin. Paramétrable depuis votre logiciel de prise de RDV.",
      gain: "Gain estimé · 18 k€ / an",
    },
    {
      num: "2",
      bg: C.signalBg,
      fg: C.signalFg,
      title: "Caution symbolique sur créneaux sensibles",
      desc:
        "10 € de caution remboursable pour les RDV du jeudi 16h–18h et du samedi. Dissuade les no-shows opportunistes.",
      gain: "Gain estimé · 12 k€ / an",
    },
    {
      num: "3",
      bg: C.tauxBg,
      fg: C.tauxFg,
      title: "Liste d'attente en temps réel",
      desc:
        "Un créneau se libère → SMS groupé aux patients en attente. Remplissage en moyenne 6 min après l'annulation.",
      gain: "Gain estimé · 9 k€ / an",
    },
  ];

  const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL;

  return (
    <Document>

      {/* ════════════════════════════════════════
          PAGE 1 — COVER
      ════════════════════════════════════════ */}
      <Page size="A4" style={S.cover}>

        {/* Brand */}
        <View style={S.brandRow}>
          <Text style={S.brandBolt}>⚡</Text>
          <Text style={S.brandName}>GetLostRevenue</Text>
        </View>

        {/* Centre */}
        <View style={S.coverCenter}>
          <Text style={S.coverEyebrow}>Audit No-Shows</Text>
          <Text style={S.coverTitle}>
            {"Analyse de performance\ndes rendez-vous manqués."}
          </Text>
          <Text style={S.coverCabinet}>Cabinet · {stats.nom_cabinet}</Text>
          <Text style={S.coverMeta}>Période analysée : {debut} → {fin}</Text>
          <Text style={S.coverMeta}>Rapport généré le {dateGen}</Text>

          {/* Hero chiffre clé — ca_perdu_an VERBATIM */}
          <View style={S.coverHeroBox}>
            <Text style={S.coverHeroEyebrow}>CA perdu annuel estimé</Text>
            <Text style={S.coverHeroAmount}>{fmtEur(stats.global.ca_perdu_an)}</Text>
            <Text style={S.coverHeroSub}>
              Valeur déjà annualisée — extrapolée sur 12{NBSP}mois.
            </Text>
          </View>
        </View>

        <View style={S.coverFooterBar}>
          <Text style={S.footerText}>Confidentiel — usage interne</Text>
          <Text style={S.footerTextStrong}>PerfIAmatic</Text>
        </View>
      </Page>

      {/* ════════════════════════════════════════
          PAGE 2 — SYNTHÈSE + MANQUE À GAGNER
      ════════════════════════════════════════ */}
      <Page size="A4" style={S.page}>
        <SectionHead num="1" title="Synthèse" />

        {/* KPI row 1 : Volume / Signal */}
        <View style={S.kpiRow}>
          <View style={[S.kpiCard, { backgroundColor: C.volumeBg }]}>
            <Text style={[S.kpiChip, { color: C.volumeFg }]}>Volume</Text>
            <Text style={S.kpiValue}>
              {(stats.global.total_rdv ?? 0).toLocaleString("fr-FR")}
            </Text>
            <Text style={S.kpiSub}>RDV analysés</Text>
          </View>
          <View style={[S.kpiCardLast, { backgroundColor: C.signalBg }]}>
            <Text style={[S.kpiChip, { color: C.signalFg }]}>Signal</Text>
            <Text style={S.kpiValue}>
              {(stats.global.no_shows ?? 0).toLocaleString("fr-FR")}
            </Text>
            <Text style={S.kpiSub}>No-shows détectés</Text>
          </View>
        </View>

        {/* KPI row 2 : Taux / Argent */}
        <View style={S.kpiRow}>
          <View style={[S.kpiCard, { backgroundColor: C.tauxBg }]}>
            <Text style={[S.kpiChip, { color: C.tauxFg }]}>Taux</Text>
            <Text style={S.kpiValue}>
              {stats.global.taux.toLocaleString("fr-FR", { maximumFractionDigits: 1 })}
              {NBSP}%
            </Text>
            <Text style={S.kpiSub}>Taux de no-show</Text>
          </View>
          <View style={[S.kpiCardLast, { backgroundColor: C.argentBg }]}>
            <Text style={[S.kpiChip, { color: C.argentFg }]}>Argent</Text>
            {/* ca_perdu_an VERBATIM — déjà annualisé par n8n */}
            <Text style={S.kpiValue}>{fmtEur(stats.global.ca_perdu_an)}</Text>
            <Text style={S.kpiSub}>CA perdu estimé</Text>
          </View>
        </View>

        {/* Money build card */}
        <View style={{ marginTop: 14 }}>
          <SectionHead
            num="2"
            title="Manque à gagner annuel"
            lede="CA perdu sur la période analysée, extrapolé sur 12 mois — valeur annualisée renvoyée par l'analyse."
          />
        </View>
        <View style={S.moneyCard}>
          <Text style={S.moneyEyebrow}>CA perdu / an — extrapolé</Text>
          {/* VERBATIM — pas de * 12 */}
          <Text style={S.moneyHero}>{fmtEur(stats.global.ca_perdu_an)}</Text>
          <Text style={S.moneyNarrative}>
            Soit l&apos;équivalent de plusieurs semaines de CA qui s&apos;évaporent
            chaque année, faute de process anti no-show.
          </Text>
          <View style={S.moneyBreakdown}>
            <View style={S.moneyLine}>
              <Text style={S.moneyLabel}>
                No-shows détectés ({nbMois}{NBSP}mois)
              </Text>
              <Text style={S.moneyVal}>{noShows.toLocaleString("fr-FR")}</Text>
            </View>
            <View style={S.moneyLine}>
              <Text style={S.moneyLabel}>CA moyen par RDV</Text>
              <Text style={S.moneyVal}>{fmtEur(caMoyen)}</Text>
            </View>
            <View style={S.moneyLine}>
              <Text style={S.moneyLabel}>Perte sur la période</Text>
              <Text style={S.moneyVal}>{fmtEur(pertePeriode)}</Text>
            </View>
            <View style={S.moneyLine}>
              <Text style={S.moneyLabel}>Extrapolation 12{NBSP}mois</Text>
              <Text style={S.moneyVal}>×{NBSP}{facteur}</Text>
            </View>
            <View style={S.moneyTotalLine}>
              <Text style={S.moneyTotalLabel}>Total CA perdu annualisé</Text>
              <Text style={S.moneyTotalVal}>{fmtEur(stats.global.ca_perdu_an)}</Text>
            </View>
          </View>
        </View>

        <Footer cabinet={stats.nom_cabinet} />
      </Page>

      {/* ════════════════════════════════════════
          PAGE 3 — OÙ & QUAND
      ════════════════════════════════════════ */}
      <Page size="A4" style={S.page}>
        <SectionHead
          num="3"
          title="Où & quand vos no-shows apparaissent"
          lede="Répartition des no-shows par jour de semaine — identification des pics."
        />

        {/* Chart par jour */}
        <View style={S.chartCard}>
          <Text style={S.chartTitle}>No-shows par jour de semaine</Text>
          <Text style={S.chartSub}>Barres proportionnelles au nombre de no-shows.</Text>

          {parJour.length > 0 && maxNoShows > 0 ? (
            <>
              <View style={S.chartArea}>
                {parJour.map((d, i) => {
                  const ratio = maxNoShows > 0 ? d.noShows / maxNoShows : 0;
                  const height = Math.max(4, Math.round(ratio * 110));
                  return (
                    <View key={i} style={S.chartCol}>
                      <Text style={S.chartBarValue}>{d.noShows}</Text>
                      <View
                        style={[
                          S.chartBar,
                          {
                            height,
                            backgroundColor: C.signalFg,
                          },
                        ]}
                      />
                    </View>
                  );
                })}
              </View>
              <View style={S.chartLabels}>
                {parJour.map((d, i) => (
                  <Text key={i} style={S.chartLabelCol}>
                    {d.jour.slice(0, 3)}
                  </Text>
                ))}
              </View>
              {pic && (
                <Text style={S.chartInsight}>
                  Pic le {pic.jour} — {pic.noShows} no-shows (
                  {pic.taux.toLocaleString("fr-FR", { maximumFractionDigits: 1 })}
                  {NBSP}%)
                </Text>
              )}
            </>
          ) : (
            <Text style={S.chartEmpty}>
              Données par jour non disponibles pour cet audit.
            </Text>
          )}
        </View>

        {/* Horaires */}
        <View style={S.chartCard}>
          <Text style={S.chartTitle}>No-shows par tranche horaire</Text>
          <Text style={S.chartSub}>
            Répartition sur la journée (matin / après-midi / soir).
          </Text>
          <Text style={S.chartEmpty}>
            Données horaires non disponibles pour cet audit.
          </Text>
        </View>

        <Footer cabinet={stats.nom_cabinet} />
      </Page>

      {/* ════════════════════════════════════════
          PAGE 4 — SCORE + PLAN + CTA
      ════════════════════════════════════════ */}
      <Page size="A4" style={S.page}>
        <SectionHead num="4" title="Score cabinet" />

        <View style={S.scoreCard}>
          <View style={S.scoreRingWrap}>
            <Text style={S.scoreValue}>{score}</Text>
            <Text style={S.scoreSlash}>sur 100</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={[
                S.scoreBadge,
                { backgroundColor: scoreToneColor.bg, color: scoreToneColor.fg },
              ]}
            >
              {badge.label}
            </Text>
            <Text style={S.scoreTitle}>{scoreTitle}</Text>
            <Text style={S.scoreNarrative}>
              Votre taux de no-show est de{" "}
              {stats.global.taux.toLocaleString("fr-FR", {
                maximumFractionDigits: 1,
              })}
              {NBSP}%. Les 3 leviers ci-dessous peuvent faire basculer votre
              score en zone «{NBSP}excellente{NBSP}» sous 60{NBSP}jours.
            </Text>
          </View>
        </View>

        {/* Plan d'action */}
        <View style={{ marginTop: 6 }}>
          <SectionHead num="5" title="Plan d'action" />
        </View>
        <View style={S.planRow}>
          {planItems.map((p, i) => (
            <View
              key={p.num}
              style={i === planItems.length - 1 ? S.planCardLast : S.planCard}
            >
              <Text
                style={[
                  S.planBadge,
                  { backgroundColor: p.bg, color: p.fg },
                ]}
              >
                {p.num}
              </Text>
              <Text style={S.planTitle}>{p.title}</Text>
              <Text style={S.planDesc}>{p.desc}</Text>
              <Text style={S.planGain}>{p.gain}</Text>
            </View>
          ))}
        </View>

        {/* CTA band */}
        <View style={S.ctaBand}>
          <Text style={S.ctaEyebrow}>Prochaine étape</Text>
          <Text style={S.ctaTitle}>
            Passons en revue votre plan ensemble — 30{NBSP}minutes.
          </Text>
          <Text style={S.ctaBody}>
            Un diagnostic personnalisé et la feuille de route sur-mesure pour
            activer ces 3 leviers dans votre cabinet. Sans engagement.
          </Text>
          {calendlyUrl ? (
            <Text style={S.ctaUrl}>→ {calendlyUrl}</Text>
          ) : (
            <Text style={S.ctaUrl}>→ Réservez votre créneau sur getlostrevenue.com</Text>
          )}
        </View>

        <Footer cabinet={stats.nom_cabinet} />
      </Page>

      {/* ════════════════════════════════════════
          PAGE 5 — RAPPORT IA (optionnel)
      ════════════════════════════════════════ */}
      {blocks.length > 0 && (
        <Page size="A4" style={S.page}>
          <SectionHead
            num="6"
            title="Analyse IA détaillée"
            lede="Rapport généré par l'analyse IA — diagnostic et recommandations."
          />

          {blocks.map((block, i) => {
            if (block.type === "h1") {
              return <Text key={i} style={S.rapportH1}>{block.text}</Text>;
            }
            if (block.type === "h2") {
              return <Text key={i} style={S.rapportH2}>{block.text}</Text>;
            }
            if (block.type === "h3") {
              return <Text key={i} style={S.rapportH3}>{block.text}</Text>;
            }
            if (block.type === "li") {
              return (
                <View key={i} style={S.rapportLiRow}>
                  <Text style={S.rapportBullet}>•</Text>
                  <Text style={S.rapportLiText}>{block.text}</Text>
                </View>
              );
            }
            return <Text key={i} style={S.rapportP}>{block.text}</Text>;
          })}

          <Footer cabinet={stats.nom_cabinet} />
        </Page>
      )}
    </Document>
  );
}
