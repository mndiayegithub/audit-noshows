// Pas de "use client" — ce composant est importé dynamiquement, uniquement dans le browser
// Les fonts sont enregistrées dans handleDownloadPDF AVANT d'appeler pdf()

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { AuditResponse } from "@/types/audit";

// ─── DA Color System ──────────────────────────────────────────────────────────
const C = {
  bg:         "#111111",  // Fond principal Noir Obsidienne
  card:       "#15171A",  // Fond cartes Gris Panneau
  border:     "#334155",  // Bordures / séparateurs Gris Carbone
  textMain:   "#F3F4F6",  // Blanc Cassé — titres & texte important
  textSub:    "#94A3B8",  // Gris Ardoise — sous-titres, annotations
  gold:       "#EAB308",  // Or Technique — CA, ROI, solution, pagination
  red:        "#EF4444",  // Critique / perte — no-shows, CA perdu
  blue:       "#3B82F6",  // Information / contact
  cyan:       "#06B6D4",  // Avertissement / attente
  violet:     "#8B5CF6",  // Réputation
  green:      "#10B981",  // Validation / succès
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  // Pages
  pageCover: {
    backgroundColor: C.bg,
    paddingHorizontal: 56,
    paddingTop: 72,
    paddingBottom: 48, // espace pour le bandeau confidentiel absolu
    fontFamily: "Inter",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  page: {
    backgroundColor: C.bg,
    paddingHorizontal: 48,
    paddingTop: 48,
    paddingBottom: 72,
    fontFamily: "Inter",
  },

  // ── COVER ──
  coverTag: {
    fontFamily: "Mono",
    fontSize: 8,
    color: C.textSub,
    letterSpacing: 1.5,
    marginBottom: 48,
  },
  coverCenter: {
    flex: 1,
    justifyContent: "center",
  },
  coverEyebrow: {
    fontFamily: "Mono",
    fontSize: 9,
    color: C.gold,
    letterSpacing: 2,
    marginBottom: 16,
  },
  coverTitle: {
    fontFamily: "PlusJakartaSans",
    fontWeight: 800,
    fontSize: 30,
    color: C.textMain,
    lineHeight: 1.15,
    marginBottom: 10,
  },
  coverCabinet: {
    fontFamily: "PlusJakartaSans",
    fontWeight: 700,
    fontSize: 18,
    color: C.gold,
    marginBottom: 24,
  },
  coverDivider: {
    height: 1,
    backgroundColor: C.border,
    marginBottom: 20,
    width: "100%",
  },
  coverGoldLine: {
    height: 2,
    backgroundColor: C.gold,
    marginBottom: 20,
    width: 48,
  },
  coverMeta: {
    fontFamily: "Inter",
    fontSize: 10,
    color: C.textSub,
    marginBottom: 4,
  },
  coverBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 12,
  },
  coverBottomLeft: {
    fontFamily: "Inter",
    fontSize: 8,
    color: C.textSub,
  },
  coverBottomRight: {
    fontFamily: "Mono",
    fontSize: 8,
    color: C.gold,
    letterSpacing: 1,
  },
  coverConfidential: {
    // position absolute pour couvrir toute la largeur sans marges négatives
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: C.gold,
    paddingVertical: 8,
    paddingHorizontal: 56,
  },
  coverConfidentialText: {
    fontFamily: "Mono",
    fontSize: 8,
    color: C.bg,
    textAlign: "center",
    letterSpacing: 2,
  },

  // ── SECTION HEADER ──
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionBar: {
    width: 3,
    height: 18,
    backgroundColor: C.gold,
    marginRight: 10,
  },
  sectionTitle: {
    fontFamily: "PlusJakartaSans",
    fontWeight: 700,
    fontSize: 12,
    color: C.textMain,
    letterSpacing: 1,
  },
  sectionTag: {
    fontFamily: "Mono",
    fontSize: 8,
    color: C.textSub,
    marginLeft: 8,
    letterSpacing: 1,
  },

  // ── KPI CARDS ──
  // Pas de gap (Yoga ne le supporte pas fiablement) — on utilise marginRight sur les cards gauches
  cardsRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  cardLeft: {
    width: "49%",
    marginRight: "2%",
    padding: 16,
    backgroundColor: C.card,
    borderRadius: 4,
  },
  card: {
    width: "49%",
    padding: 16,
    backgroundColor: C.card,
    borderRadius: 4,
  },
  cardBorderRed:    { borderLeftWidth: 3, borderLeftColor: C.red },
  cardBorderGold:   { borderLeftWidth: 3, borderLeftColor: C.gold },
  cardBorderGreen:  { borderLeftWidth: 3, borderLeftColor: C.green },
  cardBorderBlue:   { borderLeftWidth: 3, borderLeftColor: C.blue },
  cardLabel: {
    fontFamily: "Mono",
    fontSize: 7,
    color: C.textSub,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  cardValue: {
    fontFamily: "Mono",
    fontWeight: 700,
    fontSize: 22,
    color: C.textMain,
    marginBottom: 4,
  },
  cardValueGold:  { color: C.gold },
  cardValueRed:   { color: C.red },
  cardValueGreen: { color: C.green },
  cardSub: {
    fontFamily: "Inter",
    fontSize: 8,
    color: C.textSub,
  },

  // ── BENCHMARK ──
  benchmarkBox: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 4,
    padding: 14,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  benchmarkLabel: {
    fontFamily: "Mono",
    fontSize: 7,
    color: C.textSub,
    letterSpacing: 1,
    marginBottom: 4,
  },
  benchmarkValue: {
    fontFamily: "Mono",
    fontWeight: 700,
    fontSize: 13,
    color: C.textMain,
  },
  benchmarkValueGold: { color: C.gold },
  benchmarkValueRed:  { color: C.red },
  benchmarkSep: {
    width: 1,
    height: 32,
    backgroundColor: C.border,
  },

  // ── TABLE ──
  table: { marginBottom: 24 },
  tableSubHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  tableSubDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  tableSubTitle: {
    fontFamily: "PlusJakartaSans",
    fontWeight: 700,
    fontSize: 10,
    color: C.textMain,
  },
  tableHead: {
    flexDirection: "row",
    backgroundColor: C.card,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.gold,
    borderRadius: 4,
    marginBottom: 2,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  tableRowAlt: { backgroundColor: C.card },
  colA: { width: "38%", fontFamily: "Mono", fontSize: 8, color: C.textMain, letterSpacing: 0.5 },
  colB: { width: "18%", fontFamily: "Mono", fontSize: 8, color: C.textSub },
  colC: { width: "18%", fontFamily: "Mono", fontSize: 8, color: C.textSub },
  colD: { width: "26%", fontFamily: "Mono", fontWeight: 700, fontSize: 9, textAlign: "right" },
  colDRed:   { color: C.red },
  colDGreen: { color: C.green },
  colHead: { fontFamily: "Mono", fontSize: 7, color: C.textSub, letterSpacing: 1.5 },

  // ── RAPPORT IA ──
  rapportWrap: { marginBottom: 56 },
  rapportH1: {
    fontFamily: "PlusJakartaSans",
    fontWeight: 800,
    fontSize: 14,
    color: C.gold,
    marginTop: 20,
    marginBottom: 8,
  },
  rapportH2: {
    fontFamily: "PlusJakartaSans",
    fontWeight: 700,
    fontSize: 11,
    color: C.textMain,
    marginTop: 14,
    marginBottom: 6,
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: C.gold,
  },
  rapportP: {
    fontFamily: "Inter",
    fontSize: 9,
    color: C.textSub,
    lineHeight: 1.65,
    marginBottom: 6,
  },
  rapportLiRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 5,
  },
  rapportBullet: {
    fontFamily: "Mono",
    fontSize: 9,
    color: C.gold,
    marginRight: 8,
    marginTop: 1,
  },
  rapportLiText: {
    fontFamily: "Inter",
    fontSize: 9,
    color: C.textSub,
    lineHeight: 1.65,
    flex: 1,
  },

  // ── FOOTER ──
  footer: {
    position: "absolute",
    bottom: 28,
    left: 48,
    right: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 8,
  },
  footerLeft: {
    fontFamily: "Inter",
    fontSize: 7,
    color: C.textSub,
  },
  footerCenter: {
    fontFamily: "Inter",
    fontSize: 7,
    color: C.textSub,
  },
  footerRight: {
    fontFamily: "Mono",
    fontSize: 7,
    color: C.gold,
    letterSpacing: 1,
  },
});

// ─── Utils ────────────────────────────────────────────────────────────────────
function formatDate(s: string): string {
  if (!s) return "";
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function parseMarkdown(md: string): Array<{ type: "h1" | "h2" | "p" | "li"; text: string }> {
  const blocks: Array<{ type: "h1" | "h2" | "p" | "li"; text: string }> = [];
  for (const line of md.split(/\r?\n/)) {
    const t = line.trim();
    if (!t) continue;
    if (t.startsWith("# "))        blocks.push({ type: "h1", text: t.slice(2).trim() });
    else if (t.startsWith("## "))  blocks.push({ type: "h2", text: t.slice(3).trim() });
    else if (t.startsWith("- ") || t.startsWith("* ")) blocks.push({ type: "li", text: t.slice(2).trim() });
    else if (/^\d+\.\s/.test(t))   blocks.push({ type: "li", text: t.replace(/^\d+\.\s/, "").trim() });
    else                            blocks.push({ type: "p", text: t });
  }
  return blocks;
}

// ─── Footer component ────────────────────────────────────────────────────────
function Footer({ cabinet }: { cabinet: string }) {
  return (
    <View style={S.footer} fixed>
      <Text style={S.footerLeft}>Mansour Ndiaye  •  @PerfIAmatic</Text>
      <Text style={S.footerCenter}>{cabinet}</Text>
      <Text
        style={S.footerRight}
        render={({ pageNumber }) =>
          `[ PAGE_${String(pageNumber).padStart(2, "0")} ]`
        }
      />
    </View>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function RapportPDF({ resultats }: { resultats: AuditResponse }) {
  const { stats, rapport_texte } = resultats;
  const debut    = formatDate(stats.periode.debut);
  const fin      = formatDate(stats.periode.fin);
  const dateGen  = formatDate(new Date().toISOString());
  const bm       = stats.benchmark;
  const blocks   = rapport_texte ? parseMarkdown(rapport_texte) : [];

  const tauxStatus = stats.global.taux > 10
    ? { label: "CRITIQUE", color: C.red }
    : stats.global.taux > 5
    ? { label: "A_SURVEILLER", color: C.gold }
    : { label: "OPTIMAL", color: C.green };

  return (
    <Document>

      {/* ════════════════════════════════════════
          PAGE 1 — COUVERTURE
      ════════════════════════════════════════ */}
      <Page size="A4" style={S.pageCover}>

        {/* Tag système */}
        <Text style={S.coverTag}>[ SYSTEM_AUDIT ]  •  PERFIAMATIC</Text>

        {/* Centre */}
        <View style={S.coverCenter}>
          <Text style={S.coverEyebrow}>{"RAPPORT D'AUDIT NO-SHOWS"}</Text>
          <Text style={S.coverTitle}>
            {"Analyse de performance\ndes rendez-vous manqués."}
          </Text>
          <Text style={S.coverCabinet}>{stats.nom_cabinet}</Text>
          <View style={S.coverGoldLine} />
          <Text style={S.coverMeta}>Période analysée : {debut} → {fin}</Text>
          <Text style={S.coverMeta}>Rapport généré le {dateGen}</Text>
          <Text style={[S.coverMeta, { marginTop: 16, fontFamily: "Mono", fontSize: 8, color: tauxStatus.color, letterSpacing: 1 }]}>
            STATUT : {tauxStatus.label}  |  TAUX : {stats.global.taux} %
          </Text>
        </View>

        {/* Footer couverture */}
        <View style={S.coverBottom}>
          <Text style={S.coverBottomLeft}>PerfIAmatic — Ingénierie de la Performance Médicale</Text>
          <Text style={S.coverBottomRight}>[ 01 / {blocks.length > 0 ? "03" : "02"} ]</Text>
        </View>

        {/* Bandeau confidentiel */}
        <View style={S.coverConfidential}>
          <Text style={S.coverConfidentialText}>
            CONFIDENTIEL  —  DOCUMENT GÉNÉRÉ PAR PERFIAMATIC  —  USAGE STRICTEMENT INTERNE
          </Text>
        </View>
      </Page>

      {/* ════════════════════════════════════════
          PAGE 2 — SYNTHÈSE CHIFFRÉE
      ════════════════════════════════════════ */}
      <Page size="A4" style={S.page}>

        {/* Header section */}
        <View style={S.sectionHeader}>
          <View style={S.sectionBar} />
          <Text style={S.sectionTitle}>SYNTHÈSE CHIFFRÉE</Text>
          <Text style={S.sectionTag}>[ METRICS_OVERVIEW ]</Text>
        </View>

        {/* KPI Cards — 2 rows × 2 cols (pas de gap, marginRight sur la card gauche) */}
        <View style={S.cardsRow}>
          <View style={[S.cardLeft, S.cardBorderRed]}>
            <Text style={S.cardLabel}>TAUX DE NO-SHOWS</Text>
            <Text style={[S.cardValue, S.cardValueRed]}>{stats.global.taux} %</Text>
            <Text style={S.cardSub}>sur {(stats.global.total_rdv ?? 0).toLocaleString("fr-FR")} RDV analysés</Text>
          </View>
          <View style={[S.card, S.cardBorderRed]}>
            <Text style={S.cardLabel}>CA PERDU / AN</Text>
            <Text style={[S.cardValue, S.cardValueRed]}>
              {(stats.global.ca_perdu_an ?? 0).toLocaleString("fr-FR")} €
            </Text>
            <Text style={S.cardSub}>manque à gagner annualisé</Text>
          </View>
        </View>
        <View style={S.cardsRow}>
          <View style={[S.cardLeft, S.cardBorderGold]}>
            <Text style={S.cardLabel}>CA PERDU / MOIS</Text>
            <Text style={[S.cardValue, { color: C.textMain }]}>
              {(stats.global.ca_perdu_mois ?? 0).toLocaleString("fr-FR")} €
            </Text>
            <Text style={S.cardSub}>impact mensuel estimé</Text>
          </View>
          <View style={[S.card, S.cardBorderGreen]}>
            <Text style={S.cardLabel}>POTENTIEL RÉCUPÉRABLE</Text>
            <Text style={[S.cardValue, S.cardValueGold]}>
              {(stats.potentiel?.passage_45 ?? 0).toLocaleString("fr-FR")} €/an
            </Text>
            <Text style={S.cardSub}>si taux ramené à 4.5 %</Text>
          </View>
        </View>

        {/* Benchmark */}
        {bm != null && (
          <View style={S.benchmarkBox}>
            <View>
              <Text style={S.benchmarkLabel}>VOTRE TAUX</Text>
              <Text style={[S.benchmarkValue, S.benchmarkValueRed]}>{bm.votre_taux} %</Text>
            </View>
            <View style={S.benchmarkSep} />
            <View>
              <Text style={S.benchmarkLabel}>TAUX OPTIMAL SECTEUR</Text>
              <Text style={[S.benchmarkValue, S.benchmarkValueGold]}>{bm.optimal}</Text>
            </View>
            <View style={S.benchmarkSep} />
            <View>
              <Text style={S.benchmarkLabel}>ÉCART</Text>
              <Text style={[S.benchmarkValue, bm.ecart > 0 ? S.benchmarkValueRed : { color: C.green }]}>
                {bm.ecart >= 0 ? "+" : ""}{bm.ecart} pts
              </Text>
            </View>
            <View style={S.benchmarkSep} />
            <View>
              <Text style={S.benchmarkLabel}>NO-SHOWS TOTAL</Text>
              <Text style={S.benchmarkValue}>{stats.global.no_shows.toLocaleString("fr-FR")}</Text>
            </View>
          </View>
        )}

        {/* Table : Créneaux critiques */}
        {stats.top_3_pires && stats.top_3_pires.length > 0 && (
          <View style={S.table}>
            <View style={S.tableSubHeader}>
              <View style={[S.tableSubDot, { backgroundColor: C.red }]} />
              <Text style={S.tableSubTitle}>CRÉNEAUX CRITIQUES</Text>
            </View>
            <View style={S.tableHead}>
              <Text style={[S.colA, S.colHead]}>CRÉNEAU</Text>
              <Text style={[S.colB, S.colHead]}>NO-SHOWS</Text>
              <Text style={[S.colC, S.colHead]}>TAUX</Text>
              <Text style={[S.colD, S.colHead, { textAlign: "right" }]}>CA PERDU / AN</Text>
            </View>
            {stats.top_3_pires.map((c, i) => (
              <View key={i} style={[S.tableRow, i % 2 === 1 ? S.tableRowAlt : {}]}>
                <Text style={S.colA}>{c.jour.toUpperCase()} A {c.heure}</Text>
                <Text style={S.colB}>{c.noShows} / {c.total}</Text>
                <Text style={S.colC}>{c.taux} %</Text>
                <Text style={[S.colD, S.colDRed]}>{Math.round(c.ca_perdu).toLocaleString("fr-FR")} €</Text>
              </View>
            ))}
          </View>
        )}

        {/* Table : Créneaux performants */}
        {stats.top_3_meilleurs && stats.top_3_meilleurs.length > 0 && (
          <View style={S.table}>
            <View style={S.tableSubHeader}>
              <View style={[S.tableSubDot, { backgroundColor: C.green }]} />
              <Text style={S.tableSubTitle}>CRÉNEAUX PERFORMANTS</Text>
            </View>
            <View style={S.tableHead}>
              <Text style={[S.colA, S.colHead]}>CRÉNEAU</Text>
              <Text style={[S.colB, S.colHead]}>NO-SHOWS</Text>
              <Text style={[S.colC, S.colHead]}>TAUX</Text>
              <Text style={[S.colD, S.colHead, { textAlign: "right" }]}>STATUT</Text>
            </View>
            {stats.top_3_meilleurs.map((c, i) => (
              <View key={i} style={[S.tableRow, i % 2 === 1 ? S.tableRowAlt : {}]}>
                <Text style={S.colA}>{c.jour.toUpperCase()} A {c.heure}</Text>
                <Text style={S.colB}>{c.noShows} / {c.total}</Text>
                <Text style={S.colC}>{c.taux} %</Text>
                <Text style={[S.colD, S.colDGreen]}>[✓] OPTIMAL</Text>
              </View>
            ))}
          </View>
        )}

        <Footer cabinet={stats.nom_cabinet} />
      </Page>

      {/* ════════════════════════════════════════
          PAGE 3+ — ANALYSE & RECOMMANDATIONS IA
      ════════════════════════════════════════ */}
      {blocks.length > 0 && (
        <Page size="A4" style={S.page}>
          <View style={S.sectionHeader}>
            <View style={S.sectionBar} />
            <Text style={S.sectionTitle}>{"ANALYSE IA & PLAN D'ACTION"}</Text>
            <Text style={S.sectionTag}>[ AI_REPORT ]</Text>
          </View>

          <View style={S.rapportWrap}>
            {blocks.map((block, i) => {
              if (block.type === "h1") {
                return <Text key={i} style={S.rapportH1}>{block.text.toUpperCase()}</Text>;
              }
              if (block.type === "h2") {
                return <Text key={i} style={S.rapportH2}>{block.text}</Text>;
              }
              if (block.type === "li") {
                return (
                  <View key={i} style={S.rapportLiRow}>
                    <Text style={S.rapportBullet}>&gt;</Text>
                    <Text style={S.rapportLiText}>{block.text}</Text>
                  </View>
                );
              }
              return <Text key={i} style={S.rapportP}>{block.text}</Text>;
            })}
          </View>

          <Footer cabinet={stats.nom_cabinet} />
        </Page>
      )}

    </Document>
  );
}
