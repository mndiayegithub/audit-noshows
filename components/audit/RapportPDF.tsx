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
import type { AuditResponse, GoogleData } from "@/types/audit";
import { computeBlendedScore, computeScore, scoreBadge } from "@/lib/score";

// ─── Font registration (module load) ─────────────────────────────────────────
// Inter + Fraunces : fichiers locaux servis par Next.js depuis /public/fonts/*.ttf.
// Le CDN Google Fonts renvoie des sous-ensembles unicode (ou du HTML 404 sur
// les URLs v31 obsolètes), ce qui faisait planter @react-pdf avec
// "Unknown font format". On sert tout en local depuis /public/fonts.

Font.register({
  family: "Inter",
  fonts: [
    { src: "/fonts/Inter-Regular.ttf", fontWeight: 400 },
    { src: "/fonts/Inter-Medium.ttf", fontWeight: 500 },
    { src: "/fonts/Inter-SemiBold.ttf", fontWeight: 600 },
    { src: "/fonts/Inter-Bold.ttf", fontWeight: 700 },
    { src: "/fonts/Inter-Italic.ttf", fontWeight: 400, fontStyle: "italic" },
    { src: "/fonts/Inter-MediumItalic.ttf", fontWeight: 500, fontStyle: "italic" },
    { src: "/fonts/Inter-SemiBoldItalic.ttf", fontWeight: 600, fontStyle: "italic" },
    { src: "/fonts/Inter-BoldItalic.ttf", fontWeight: 700, fontStyle: "italic" },
  ],
});

Font.register({
  family: "Fraunces",
  fonts: [
    { src: "/fonts/Fraunces-Regular.ttf", fontWeight: 400 },
    { src: "/fonts/Fraunces-SemiBold.ttf", fontWeight: 500 },
    { src: "/fonts/Fraunces-SemiBold.ttf", fontWeight: 600 },
    { src: "/fonts/Fraunces-Bold.ttf", fontWeight: 700 },
    { src: "/fonts/Fraunces-Italic.ttf", fontWeight: 400, fontStyle: "italic" },
    { src: "/fonts/Fraunces-SemiBoldItalic.ttf", fontWeight: 500, fontStyle: "italic" },
    { src: "/fonts/Fraunces-SemiBoldItalic.ttf", fontWeight: 600, fontStyle: "italic" },
    { src: "/fonts/Fraunces-BoldItalic.ttf", fontWeight: 700, fontStyle: "italic" },
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

  // ── Google synthèse (Phase 4 — bloc PDF aligné sur DiagnosticGoogle) ──
  googleCard: {
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.signalBg,
    backgroundColor: "#F0FBF4",
    marginBottom: 18,
  },
  googleHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  googleEyebrow: {
    fontFamily: "Inter",
    fontWeight: 600,
    fontSize: 8,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: C.signalFg,
    marginBottom: 4,
  },
  googleTitle: {
    fontFamily: "Fraunces",
    fontWeight: 500,
    fontSize: 14,
    color: C.ink,
    marginBottom: 8,
  },
  googleRow: {
    flexDirection: "row",
    marginTop: 6,
  },
  googleStat: {
    flex: 1,
    paddingRight: 10,
  },
  googleStatLabel: {
    fontFamily: "Inter",
    fontWeight: 500,
    fontSize: 8,
    color: C.muted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 3,
  },
  googleStatValue: {
    fontFamily: "Fraunces",
    fontWeight: 500,
    fontSize: 18,
    color: C.ink,
  },
  googleStatSub: {
    fontFamily: "Inter",
    fontWeight: 400,
    fontSize: 8,
    color: C.muted,
    marginTop: 2,
  },
  googleNarrative: {
    fontFamily: "Inter",
    fontWeight: 400,
    fontSize: 9,
    color: C.muted,
    lineHeight: 1.5,
    marginTop: 10,
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

type MdSeg = { text: string; bold?: boolean; italic?: boolean };
type MdBlock =
  | { type: "h1" | "h2" | "h3" | "p" | "li"; segs: MdSeg[] };

// Split inline text into segments, honoring **bold**, __bold__, *italic*, _italic_
// Also strips residual `#` markers and inline code backticks.
function parseInline(raw: string): MdSeg[] {
  const out: MdSeg[] = [];
  // Strip inline code backticks (keep content)
  let s = raw.replace(/`([^`]+)`/g, "$1");
  // Remove residual leading/trailing hashes some models emit
  s = s.replace(/(^|\s)#{1,6}(?=\s|$)/g, "$1").trim();

  // Tokenize on ** and * markers. Regex splits keeping delimiters.
  const regex = /(\*\*[^*]+\*\*|\*[^*\n]+\*|__[^_]+__|_[^_\n]+_)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(s)) !== null) {
    if (m.index > last) {
      const plain = s.slice(last, m.index);
      if (plain) out.push({ text: plain });
    }
    const tok = m[0];
    if (tok.startsWith("**") || tok.startsWith("__")) {
      out.push({ text: tok.slice(2, -2), bold: true });
    } else {
      out.push({ text: tok.slice(1, -1), italic: true });
    }
    last = m.index + tok.length;
  }
  if (last < s.length) {
    const plain = s.slice(last);
    if (plain) out.push({ text: plain });
  }
  return out.length ? out : [{ text: s }];
}

function parseMarkdown(md: string): MdBlock[] {
  const blocks: MdBlock[] = [];
  for (const rawLine of md.split(/\r?\n/)) {
    const t = rawLine.trim();
    if (!t) continue;
    // Horizontal rules — skip
    if (/^(-{3,}|_{3,}|\*{3,})$/.test(t)) continue;

    let type: MdBlock["type"] = "p";
    let content = t;
    if (t.startsWith("### ")) { type = "h3"; content = t.slice(4).trim(); }
    else if (t.startsWith("## ")) { type = "h2"; content = t.slice(3).trim(); }
    else if (t.startsWith("# ")) { type = "h1"; content = t.slice(2).trim(); }
    else if (t.startsWith("- ") || t.startsWith("* ")) { type = "li"; content = t.slice(2).trim(); }
    else if (/^\d+\.\s/.test(t)) { type = "li"; content = t.replace(/^\d+\.\s/, "").trim(); }

    // Strip trailing colons on headings that models sometimes leave
    if (type !== "p" && type !== "li") content = content.replace(/:$/, "");

    blocks.push({ type, segs: parseInline(content) });
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
export default function RapportPDF({
  resultats,
  google = null,
}: {
  resultats: AuditResponse;
  google?: GoogleData | null;
}) {
  const { stats, rapport_texte } = resultats;
  const debut = formatDate(stats.periode.debut);
  const fin = formatDate(stats.periode.fin);
  const dateGen = formatDate(new Date().toISOString());
  const blocks = rapport_texte ? parseMarkdown(rapport_texte) : [];

  // Score via lib/score.ts — blended si Google analysé, sinon taux pur (même formule que ScoreHero)
  const hasGoogle = !!(google && typeof google.rating === "number" && Number.isFinite(google.rating));
  const baseScore = computeScore(stats.global.taux);
  const score = hasGoogle ? computeBlendedScore(stats.global.taux, google) : baseScore;
  const googleDelta = hasGoogle ? score - baseScore : 0;
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

  // Par heure — normalisation depuis stats.par_heure (Phase 3, miroir ChartParHeure)
  const SLOTS = ["8–10h", "10–12h", "14–16h", "16–18h", "18–20h"] as const;
  const matchSlot = (raw: string): string | null => {
    const s = raw.replace(/\s/g, "").toLowerCase();
    for (const slot of SLOTS) {
      const key = slot.replace(/\s/g, "").toLowerCase();
      if (s.includes(key.replace("–", "-")) || s.includes(key.replace("–", "")) || s === key) return slot;
    }
    const m = s.match(/(\d{1,2})/);
    if (m) {
      const n = parseInt(m[1], 10);
      if (n >= 8 && n < 10) return "8–10h";
      if (n >= 10 && n < 12) return "10–12h";
      if (n >= 14 && n < 16) return "14–16h";
      if (n >= 16 && n < 18) return "16–18h";
      if (n >= 18 && n < 20) return "18–20h";
    }
    return null;
  };
  const parHeureRaw = stats.par_heure ?? [];
  const bySlot = new Map<string, number>(SLOTS.map((s) => [s, 0]));
  for (const item of parHeureRaw) {
    const key = matchSlot(item.tranche ?? item.slot ?? item.heure ?? "");
    const v = Number(item.count ?? item.no_shows ?? item.noShows ?? item.value ?? 0);
    if (key && Number.isFinite(v)) bySlot.set(key, (bySlot.get(key) ?? 0) + v);
  }
  const heureValues = SLOTS.map((s) => bySlot.get(s) ?? 0);
  const maxHeure = Math.max(0, ...heureValues);
  const totalHeure = heureValues.reduce((a, b) => a + b, 0);
  const picHeureIdx = heureValues.indexOf(Math.max(...heureValues));
  const picHeurePct = totalHeure > 0 ? Math.round((heureValues[picHeureIdx] / totalHeure) * 100) : 0;

  // Par mois — stats_par_mois (Phase 3)
  const parMois = stats.stats_par_mois ?? [];
  const maxMois = parMois.reduce((m, d) => Math.max(m, d.no_shows), 0);
  const picMois =
    parMois.length > 0
      ? parMois.reduce((a, b) => (b.no_shows > a.no_shows ? b : a), parMois[0])
      : null;
  const fmtMois = (m: string): string => {
    const [y, mm] = m.split("-");
    const names = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
    const idx = parseInt(mm, 10) - 1;
    return idx >= 0 && idx < 12 ? `${names[idx]} ${y?.slice(2) ?? ""}` : m;
  };

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
            lede="CA perdu sur la période analysée, extrapolé sur 12 mois, valeur annualisée renvoyée par l'analyse."
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
                  Pic le {pic.jour} : {pic.noShows} no-shows (
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

          {parHeureRaw.length > 0 && maxHeure > 0 ? (
            <>
              <View style={S.chartArea}>
                {SLOTS.map((slot, i) => {
                  const v = heureValues[i];
                  const ratio = maxHeure > 0 ? v / maxHeure : 0;
                  const height = Math.max(4, Math.round(ratio * 110));
                  const isPic = i === picHeureIdx && v > 0;
                  return (
                    <View key={slot} style={S.chartCol}>
                      <Text style={S.chartBarValue}>{v}</Text>
                      <View
                        style={[
                          S.chartBar,
                          { height, backgroundColor: isPic ? C.tauxFg : C.tauxBg },
                        ]}
                      />
                    </View>
                  );
                })}
              </View>
              <View style={S.chartLabels}>
                {SLOTS.map((slot) => (
                  <Text key={slot} style={S.chartLabelCol}>{slot}</Text>
                ))}
              </View>
              {heureValues[picHeureIdx] > 0 && (
                <Text style={S.chartInsight}>
                  Créneau critique {SLOTS[picHeureIdx]} :git  {picHeurePct}{NBSP}% des no-shows.
                </Text>
              )}
            </>
          ) : (
            <Text style={S.chartEmpty}>
              Données horaires non disponibles pour cet audit.
            </Text>
          )}
        </View>

        {/* Évolution mensuelle (Phase 3 — stats_par_mois) */}
        {parMois.length > 0 && maxMois > 0 && (
          <View style={S.chartCard}>
            <Text style={S.chartTitle}>Évolution mois par mois</Text>
            <Text style={S.chartSub}>
              Nombre de no-shows détectés sur chaque mois de la période.
            </Text>
            <View style={S.chartArea}>
              {parMois.map((m, i) => {
                const ratio = maxMois > 0 ? m.no_shows / maxMois : 0;
                const height = Math.max(4, Math.round(ratio * 110));
                const isPic = picMois ? m.mois === picMois.mois : false;
                return (
                  <View key={i} style={S.chartCol}>
                    <Text style={S.chartBarValue}>{m.no_shows}</Text>
                    <View
                      style={[
                        S.chartBar,
                        { height, backgroundColor: isPic ? C.argentFg : C.argentBg },
                      ]}
                    />
                  </View>
                );
              })}
            </View>
            <View style={S.chartLabels}>
              {parMois.map((m, i) => (
                <Text key={i} style={S.chartLabelCol}>{fmtMois(m.mois)}</Text>
              ))}
            </View>
            {picMois && (
              <Text style={S.chartInsight}>
                Pic en {fmtMois(picMois.mois)} — {picMois.no_shows} no-shows (
                {picMois.taux.toLocaleString("fr-FR", { maximumFractionDigits: 1 })}
                {NBSP}%)
              </Text>
            )}
          </View>
        )}

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
              {NBSP}%. {hasGoogle
                ? `Score global (no-shows + réputation Google${
                    googleDelta !== 0
                      ? ` — impact Google : ${googleDelta > 0 ? "+" : ""}${googleDelta}${NBSP}pts`
                      : ""
                  }).`
                : "Score no-shows (hors Google)."}{" "}
              Les 3 leviers ci-dessous peuvent faire basculer votre score en
              zone «{NBSP}excellente{NBSP}» sous 60{NBSP}jours.
            </Text>
          </View>
        </View>

        {/* Synthèse Google (Phase 4 — visible uniquement si l'utilisateur a lancé l'analyse) */}
        {hasGoogle && google && (
          <View style={S.googleCard}>
            <Text style={S.googleEyebrow}>Réputation Google</Text>
            <Text style={S.googleTitle}>{google.name}</Text>
            <View style={S.googleRow}>
              <View style={S.googleStat}>
                <Text style={S.googleStatLabel}>Note Google</Text>
                <Text style={S.googleStatValue}>
                  {google.rating?.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} / 5
                </Text>
                <Text style={S.googleStatSub}>moyenne des avis</Text>
              </View>
              <View style={S.googleStat}>
                <Text style={S.googleStatLabel}>Nombre d&apos;avis</Text>
                <Text style={S.googleStatValue}>
                  {google.user_ratings_total.toLocaleString("fr-FR")}
                </Text>
                <Text style={S.googleStatSub}>
                  écart vs benchmark national&nbsp;87&nbsp;:&nbsp;
                  {google.user_ratings_total >= 87 ? "+" : ""}
                  {google.user_ratings_total - 87}
                </Text>
              </View>
              <View style={S.googleStat}>
                <Text style={S.googleStatLabel}>Impact sur le score</Text>
                <Text style={S.googleStatValue}>
                  {googleDelta > 0 ? "+" : ""}
                  {googleDelta}{NBSP}pts
                </Text>
                <Text style={S.googleStatSub}>blending no-shows + Google</Text>
              </View>
            </View>
            <Text style={S.googleNarrative}>
              {google.user_ratings_total < 50
                ? `Volume d'avis faible (${google.user_ratings_total}) — la confiance dans la note est partielle. Un cabinet avec 50 avis de plus convertit en moyenne 3–5 nouveaux patients/mois supplémentaires.`
                : `Volume d'avis robuste — votre note Google pèse pleinement dans le score global. Maintenir la collecte d'avis post-RDV consolide cet effet.`}
            </Text>
          </View>
        )}

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
            Passons en revue votre plan ensemble en 30{NBSP}minutes.
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
            const renderSegs = () =>
              block.segs.map((seg, j) => (
                <Text
                  key={j}
                  style={{
                    fontWeight: seg.bold ? 600 : undefined,
                    fontStyle: seg.italic ? "italic" : undefined,
                    color: seg.bold ? C.ink : undefined,
                  }}
                >
                  {seg.text}
                </Text>
              ));

            if (block.type === "h1") {
              return <Text key={i} style={S.rapportH1}>{renderSegs()}</Text>;
            }
            if (block.type === "h2") {
              return <Text key={i} style={S.rapportH2}>{renderSegs()}</Text>;
            }
            if (block.type === "h3") {
              return <Text key={i} style={S.rapportH3}>{renderSegs()}</Text>;
            }
            if (block.type === "li") {
              return (
                <View key={i} style={S.rapportLiRow}>
                  <Text style={S.rapportBullet}>•</Text>
                  <Text style={S.rapportLiText}>{renderSegs()}</Text>
                </View>
              );
            }
            return <Text key={i} style={S.rapportP}>{renderSegs()}</Text>;
          })}

          <Footer cabinet={stats.nom_cabinet} />
        </Page>
      )}
    </Document>
  );
}
