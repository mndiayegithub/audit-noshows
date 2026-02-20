"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { AuditResponse } from "@/types/audit";

const COLORS = {
  bg: "#111111",
  bgCard: "#1a1a1a",
  gold: "#d4a843",
  white: "#ffffff",
  grayLight: "#a0a0a0",
  grayDark: "#2a2a2a",
  red: "#e53e3e",
  green: "#38a169",
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: COLORS.bg,
    padding: 40,
    fontFamily: "Helvetica",
  },
  pageCover: {
    backgroundColor: COLORS.bg,
    padding: 40,
    justifyContent: "space-between",
    fontFamily: "Helvetica",
  },
  coverTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoP: {
    color: COLORS.gold,
    fontSize: 32,
    fontWeight: "bold",
    marginRight: 2,
  },
  logoRest: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: "bold",
  },
  coverCenter: {
    flex: 1,
    justifyContent: "center",
    marginVertical: 60,
  },
  coverTitle: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  coverSubtitle: {
    color: COLORS.gold,
    fontSize: 28,
    textAlign: "center",
    marginBottom: 16,
  },
  coverLine: {
    height: 2,
    backgroundColor: COLORS.gold,
    marginVertical: 20,
    width: "80%",
    alignSelf: "center",
  },
  coverMeta: {
    color: COLORS.grayLight,
    fontSize: 11,
    textAlign: "center",
    marginTop: 8,
  },
  coverBanner: {
    backgroundColor: COLORS.gold,
    padding: 12,
    marginHorizontal: -40,
    marginBottom: -40,
  },
  coverBannerText: {
    color: COLORS.bg,
    fontSize: 9,
    textAlign: "center",
    fontWeight: "bold",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionBar: {
    width: 4,
    height: 22,
    backgroundColor: COLORS.gold,
    marginRight: 10,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "bold",
  },
  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  card: {
    width: "48%",
    padding: 14,
    borderRadius: 4,
    marginBottom: 8,
  },
  cardRed: { backgroundColor: COLORS.red + "30", borderLeftWidth: 4, borderLeftColor: COLORS.red },
  cardGold: { backgroundColor: COLORS.gold + "25", borderLeftWidth: 4, borderLeftColor: COLORS.gold },
  cardGreen: { backgroundColor: COLORS.green + "30", borderLeftWidth: 4, borderLeftColor: COLORS.green },
  cardLabel: {
    fontSize: 9,
    color: COLORS.grayLight,
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.white,
  },
  benchmark: {
    backgroundColor: COLORS.grayDark,
    padding: 12,
    marginBottom: 16,
    fontSize: 10,
    color: COLORS.grayLight,
  },
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: COLORS.grayDark,
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gold,
  },
  tableRow: {
    flexDirection: "row",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayDark,
  },
  tableRowAlt: {
    backgroundColor: COLORS.bgCard,
  },
  colCreneau: { width: "35%", fontSize: 9, color: COLORS.white },
  colNoShows: { width: "20%", fontSize: 9, color: COLORS.grayLight },
  colTaux: { width: "20%", fontSize: 9, color: COLORS.grayLight },
  colCa: { width: "25%", fontSize: 9, fontWeight: "bold" },
  colCaRed: { color: COLORS.red },
  colCaGreen: { color: COLORS.green },
  rapportH1: {
    color: COLORS.gold,
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  rapportH2: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 6,
  },
  rapportP: {
    color: COLORS.grayLight,
    fontSize: 10,
    lineHeight: 1.6,
    marginBottom: 8,
  },
  rapportList: {
    marginLeft: 16,
    marginBottom: 8,
  },
  rapportLi: {
    color: COLORS.grayLight,
    fontSize: 10,
    lineHeight: 1.6,
    marginBottom: 4,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  rapportBullet: {
    color: COLORS.gold,
    marginRight: 6,
  },
  rapportContentWrap: {
    marginBottom: 50,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: COLORS.gold,
    paddingTop: 8,
  },
  footerLeft: { fontSize: 8, color: COLORS.grayLight },
  footerCenter: { fontSize: 8, color: COLORS.gold },
  footerRight: { fontSize: 8, color: COLORS.grayLight },
});

function formatDate(s: string): string {
  if (!s) return "";
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function parseMarkdownToBlocks(md: string): Array<{ type: "h1" | "h2" | "p" | "li"; text: string }> {
  const blocks: Array<{ type: "h1" | "h2" | "p" | "li"; text: string }> = [];
  const lines = md.split(/\r?\n/);
  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    if (t.startsWith("# ")) {
      blocks.push({ type: "h1", text: t.slice(2).trim() });
    } else if (t.startsWith("## ")) {
      blocks.push({ type: "h2", text: t.slice(3).trim() });
    } else if (t.startsWith("- ") || t.startsWith("* ")) {
      blocks.push({ type: "li", text: t.slice(2).trim() });
    } else if (/^\d+\.\s/.test(t)) {
      blocks.push({ type: "li", text: t.replace(/^\d+\.\s/, "").trim() });
    } else {
      blocks.push({ type: "p", text: t });
    }
  }
  return blocks;
}

function FooterPDF({
  nomCabinet,
}: {
  nomCabinet: string;
}) {
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerLeft}>PerfIAmatic - Audit No-Shows</Text>
      <Text style={styles.footerCenter}>{nomCabinet}</Text>
      <Text
        style={styles.footerRight}
        render={({ pageNumber, totalPages }) => `Page ${pageNumber}`}
      />
    </View>
  );
}

export default function RapportPDF({ resultats }: { resultats: AuditResponse }) {
  const { stats, rapport_texte } = resultats;
  const nbMois = stats.periode.nb_mois;
  const debut = formatDate(stats.periode.debut);
  const fin = formatDate(stats.periode.fin);
  const dateGen = formatDate(new Date().toISOString());
  const benchmark = stats.benchmark;

  const rapportBlocks = rapport_texte ? parseMarkdownToBlocks(rapport_texte) : [];

  return (
    <Document>
      {/* PAGE 1 : COUVERTURE */}
      <Page size="A4" style={styles.pageCover}>
        <View>
          <View style={styles.coverTop}>
            <Text style={styles.logoP}>P</Text>
            <Text style={styles.logoRest}>erfIAmatic</Text>
          </View>
        </View>
        <View style={styles.coverCenter}>
          <Text style={styles.coverTitle}>{"RAPPORT D'AUDIT NO-SHOWS"}</Text>
          <Text style={styles.coverSubtitle}>{stats.nom_cabinet}</Text>
          <View style={styles.coverLine} />
          <Text style={styles.coverMeta}>
            Période analysée : Du {debut} au {fin}
          </Text>
          <Text style={styles.coverMeta}>Généré le {dateGen}</Text>
        </View>
        <View style={styles.coverBanner}>
          <Text style={styles.coverBannerText}>
            CONFIDENTIEL - Document généré par PerfIAmatic
          </Text>
        </View>
      </Page>

      {/* PAGE 2 : SYNTHÈSE CHIFFRÉE */}
      <Page size="A4" style={styles.page}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionBar} />
          <Text style={styles.sectionTitle}>SYNTHÈSE CHIFFRÉE</Text>
        </View>
        <View style={styles.cardsGrid}>
          <View style={[styles.card, styles.cardRed]}>
            <Text style={styles.cardLabel}>TAUX DE NO-SHOWS</Text>
            <Text style={styles.cardValue}>{stats.global.taux} %</Text>
          </View>
          <View style={[styles.card, styles.cardGold]}>
            <Text style={styles.cardLabel}>CA PERDU / MOIS</Text>
            <Text style={styles.cardValue}>
              {stats.global.ca_perdu_mois.toLocaleString("fr-FR")} €
            </Text>
          </View>
          <View style={[styles.card, styles.cardRed]}>
            <Text style={styles.cardLabel}>CA PERDU / AN</Text>
            <Text style={styles.cardValue}>
              {stats.global.ca_perdu_an.toLocaleString("fr-FR")} €
            </Text>
          </View>
          <View style={[styles.card, styles.cardGreen]}>
            <Text style={styles.cardLabel}>POTENTIEL RÉCUPÉRABLE</Text>
            <Text style={styles.cardValue}>
              {stats.potentiel.passage_45.toLocaleString("fr-FR")} €/an
            </Text>
          </View>
        </View>
        {benchmark != null && (
          <View style={styles.benchmark}>
            <Text>
              Votre taux : {benchmark.votre_taux} % | Taux optimal :{" "}
              {benchmark.optimal} | Écart : {benchmark.ecart >= 0 ? "+" : ""}
              {benchmark.ecart} points
            </Text>
          </View>
        )}
        {stats.top_3_pires && stats.top_3_pires.length > 0 && (
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.colCreneau, { width: "35%" }]}>Créneau</Text>
              <Text style={[styles.colNoShows, { width: "20%" }]}>No-shows</Text>
              <Text style={[styles.colTaux, { width: "20%" }]}>Taux</Text>
              <Text style={[styles.colCa, { width: "25%" }]}>CA Perdu/an</Text>
            </View>
            {stats.top_3_pires.map((c, i) => {
              const caAn = Math.round(c.ca_perdu * (12 / nbMois));
              return (
                <View
                  key={i}
                  style={[styles.tableRow, ...(i % 2 === 1 ? [styles.tableRowAlt] : [])]}
                >
                  <Text style={styles.colCreneau}>
                    {c.jour} à {c.heure}
                  </Text>
                  <Text style={styles.colNoShows}>
                    {c.noShows}/{c.total}
                  </Text>
                  <Text style={styles.colTaux}>{c.taux} %</Text>
                  <Text style={[styles.colCa, styles.colCaRed]}>
                    {caAn.toLocaleString("fr-FR")} €
                  </Text>
                </View>
              );
            })}
          </View>
        )}
        {stats.top_3_meilleurs && stats.top_3_meilleurs.length > 0 && (
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.colCreneau, { width: "35%" }]}>
                Créneau (performants)
              </Text>
              <Text style={[styles.colNoShows, { width: "20%" }]}>No-shows</Text>
              <Text style={[styles.colTaux, { width: "20%" }]}>Taux</Text>
              <Text style={[styles.colCa, { width: "25%" }]}>CA Perdu/an</Text>
            </View>
            {stats.top_3_meilleurs.map((c, i) => {
              const caAn = Math.round(c.ca_perdu * (12 / nbMois));
              return (
                <View
                  key={i}
                  style={[styles.tableRow, ...(i % 2 === 1 ? [styles.tableRowAlt] : [])]}
                >
                  <Text style={styles.colCreneau}>
                    {c.jour} à {c.heure}
                  </Text>
                  <Text style={styles.colNoShows}>
                    {c.noShows}/{c.total}
                  </Text>
                  <Text style={styles.colTaux}>{c.taux} %</Text>
                  <Text style={[styles.colCa, styles.colCaGreen]}>
                    {caAn.toLocaleString("fr-FR")} €
                  </Text>
                </View>
              );
            })}
          </View>
        )}
        <FooterPDF nomCabinet={stats.nom_cabinet} />
      </Page>

      {/* PAGE 3+ : RAPPORT IA */}
      {rapportBlocks.length > 0 && (
        <Page size="A4" style={styles.page}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionBar} />
            <Text style={styles.sectionTitle}>ANALYSE & RECOMMANDATIONS IA</Text>
          </View>
          <View style={styles.rapportContentWrap}>
            {rapportBlocks.map((block, i) => {
              if (block.type === "h1") {
                return (
                  <Text key={i} style={styles.rapportH1}>
                    {block.text}
                  </Text>
                );
              }
              if (block.type === "h2") {
                return (
                  <Text key={i} style={styles.rapportH2}>
                    {block.text}
                  </Text>
                );
              }
              if (block.type === "li") {
                return (
                  <View key={i} style={styles.rapportLi}>
                    <Text style={styles.rapportBullet}>•</Text>
                    <Text style={[styles.rapportP, { marginBottom: 0 }]}>{block.text}</Text>
                  </View>
                );
              }
              return (
                <Text key={i} style={styles.rapportP}>
                  {block.text}
                </Text>
              );
            })}
          </View>
          <FooterPDF nomCabinet={stats.nom_cabinet} />
        </Page>
      )}
    </Document>
  );
}
