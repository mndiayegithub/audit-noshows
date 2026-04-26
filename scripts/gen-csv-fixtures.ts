/**
 * scripts/gen-csv-fixtures.ts
 *
 * Phase 7 — REQ #5 (D-04) : générateur paramétrable de fixtures CSV pour les
 * tests Vitest (Phase 6) et Playwright (Plan 07-08).
 *
 * Usage : `npm run gen:fixtures`
 *
 * Sorties : `e2e/fixtures/csv/*.csv` (≥ 12 fichiers, déterministes).
 *
 * RGPD (Phase 5) : aucun PII — patients fictifs `Patient_NNN`, praticiens
 * `Dr_X`, pas d'email, pas de numéro téléphone réel.
 *
 * Reproducibilité : RNG seed déterministe (mulberry32) → mêmes fixtures à
 * chaque exécution. Re-générable après collecte de patterns réels.
 */

import * as fs from "node:fs";
import * as path from "node:path";

// ---------------------------------------------------------------------------
// Types & paramètres exposés (verbatim D-04)
// ---------------------------------------------------------------------------

type Source = "doctolib" | "excel" | "logos_w" | "julie" | "veasy";
type Encoding = "utf-8" | "latin-1";
type Separator = "," | ";";
type Expected =
  | "ok"
  | "degraded"
  | "reject:MISSING_COLUMNS"
  | "reject:INSUFFICIENT_DATA"
  | "reject:ENCODING_ERROR"
  | "reject:INVALID_DATE_FORMAT"
  | "reject:EMPTY_AFTER_PARSING";

interface FixtureParams {
  source: Source;
  nb_mois: number;
  taux_no_show: number;
  encoding: Encoding;
  separator: Separator;
  statuts: string[];
  include_meta_header: boolean;
  corrupt_pct: number;
  outFile: string;
  expected: Expected;
  /** Override total RDV (utilisé pour le cas INSUFFICIENT_DATA). */
  total_override?: number;
  /** Seed RNG pour reproducibilité (default = hash(outFile)). */
  seed?: number;
}

// ---------------------------------------------------------------------------
// RNG déterministe (mulberry32)
// ---------------------------------------------------------------------------

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// ---------------------------------------------------------------------------
// Helpers de génération
// ---------------------------------------------------------------------------

const PRACTICIENS = ["Dr_Martin", "Dr_Dupont", "Dr_Bernard", "Dr_Petit"];

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

/** Format date selon la source. */
function formatDate(d: Date, source: Source): string {
  const dd = pad2(d.getDate());
  const mm = pad2(d.getMonth() + 1);
  const yyyy = d.getFullYear();
  // Doctolib / Julie / Excel-FR utilisent DD/MM/YYYY ; Logos_w / Veasy utilisent ISO.
  if (source === "logos_w" || source === "veasy") {
    return `${yyyy}-${mm}-${dd}`;
  }
  return `${dd}/${mm}/${yyyy}`;
}

function formatTime(rng: () => number): string {
  const hours = [8, 9, 10, 11, 14, 15, 16, 17, 18];
  const h = hours[Math.floor(rng() * hours.length)];
  const m = rng() < 0.5 ? "00" : "30";
  return `${pad2(h)}:${m}`;
}

interface HeaderSpec {
  cols: string[];
  separator: Separator;
}

/** Header par source (D-04). */
function headerForSource(source: Source, separator: Separator): HeaderSpec {
  switch (source) {
    case "doctolib":
      return { cols: ["Date", "Heure", "Praticien", "Patient", "Statut"], separator };
    case "excel":
      return {
        cols: ["Jour", "Heure visite", "Nom du soignant", "Patient", "Etat RDV"],
        separator,
      };
    case "logos_w":
      return {
        cols: ["date_rdv", "heure", "praticien", "patient", "status"],
        separator: ";",
      };
    case "julie":
      return {
        cols: ["Date du rendez-vous", "Heure", "Praticien", "Statut"],
        separator: ";",
      };
    case "veasy":
      return {
        cols: ["RDV_DATE", "RDV_HEURE", "PRATICIEN", "ETAT"],
        separator: ";",
      };
  }
}

// ---------------------------------------------------------------------------
// Générateur principal
// ---------------------------------------------------------------------------

function generate(params: FixtureParams): { filepath: string; lines: number } {
  const seed = params.seed ?? hashString(params.outFile);
  const rng = mulberry32(seed);

  const total = params.total_override ?? params.nb_mois * 80;
  const corrupt = Math.floor(total * params.corrupt_pct);
  const valid = total - corrupt;

  const header = headerForSource(params.source, params.separator);
  const sep = header.separator;

  // Date de départ : (today - nb_mois)
  const today = new Date(2026, 3, 1); // 1er avril 2026, déterministe
  const start = new Date(today);
  start.setMonth(start.getMonth() - params.nb_mois);

  const out: string[] = [];

  // En-tête de fixture (commentaires CSV)
  out.push(`# source: ${params.source}`);
  out.push(`# expected: ${params.expected}`);
  out.push(
    `# nb_mois: ${params.nb_mois} ; taux_no_show: ${params.taux_no_show} ; encoding: ${params.encoding} ; separator: ${sep === "," ? "," : ";"}`,
  );

  // Meta-header Doctolib (export)
  if (params.include_meta_header) {
    out.push("Export du 12/03/2026");
  }

  // Header colonnes
  out.push(header.cols.join(sep));

  // Lignes valides
  const includesPatient = header.cols.some((c) => /patient/i.test(c));
  const includesPraticien = header.cols.some(
    (c) => /praticien|soignant/i.test(c),
  );
  const includesHeure = header.cols.some((c) => /heure/i.test(c));

  for (let i = 0; i < valid; i++) {
    const dayOffset = Math.floor(rng() * params.nb_mois * 30);
    const d = new Date(start);
    d.setDate(d.getDate() + dayOffset);

    const isNoShow = rng() < params.taux_no_show;
    const honoreLabel = params.statuts[0] ?? "Honoré";
    const noShowLabel = params.statuts[1] ?? "Absent";
    const statut = isNoShow ? noShowLabel : honoreLabel;

    const row: string[] = [];
    for (const col of header.cols) {
      if (/date|jour|rdv_date/i.test(col)) {
        row.push(formatDate(d, params.source));
      } else if (/heure|rdv_heure/i.test(col)) {
        row.push(formatTime(rng));
      } else if (/praticien|soignant/i.test(col)) {
        row.push(PRACTICIENS[Math.floor(rng() * PRACTICIENS.length)]);
      } else if (/patient/i.test(col)) {
        row.push(`Patient_${pad2(Math.floor(rng() * 999))}`);
      } else if (/statut|status|etat/i.test(col)) {
        row.push(statut);
      } else {
        row.push("");
      }
    }
    out.push(row.join(sep));
    void includesPatient;
    void includesPraticien;
    void includesHeure;
  }

  // Lignes corrompues
  for (let i = 0; i < corrupt; i++) {
    const corruptType = Math.floor(rng() * 3);
    const row: string[] = [];
    for (const col of header.cols) {
      if (/date|jour|rdv_date/i.test(col)) {
        // Date pourrie 1/3 du temps, sinon valide
        if (corruptType === 0) {
          row.push("01-32-9999");
        } else {
          const d = new Date(start);
          d.setDate(d.getDate() + Math.floor(rng() * 30));
          row.push(formatDate(d, params.source));
        }
      } else if (/heure|rdv_heure/i.test(col)) {
        row.push(formatTime(rng));
      } else if (/praticien|soignant/i.test(col)) {
        row.push(PRACTICIENS[Math.floor(rng() * PRACTICIENS.length)]);
      } else if (/patient/i.test(col)) {
        row.push(`Patient_${pad2(Math.floor(rng() * 999))}`);
      } else if (/statut|status|etat/i.test(col)) {
        // Statuts inconnus
        const unknownStatuts = ["DNA", "Reporté", "À confirmer", "?", ""];
        row.push(unknownStatuts[Math.floor(rng() * unknownStatuts.length)]);
      } else {
        row.push("");
      }
    }
    out.push(row.join(sep));
  }

  const content = out.join("\n") + "\n";
  const filepath = path.join("e2e", "fixtures", "csv", params.outFile);

  if (params.encoding === "latin-1") {
    fs.writeFileSync(filepath, Buffer.from(content, "latin1"));
  } else {
    fs.writeFileSync(filepath, content, "utf-8");
  }

  return { filepath, lines: out.length };
}

// ---------------------------------------------------------------------------
// Catalogue verrouillé : 12 fixtures
// ---------------------------------------------------------------------------

const CATALOG: FixtureParams[] = [
  // 3 Doctolib (6/12/18 mois)
  {
    source: "doctolib",
    nb_mois: 6,
    taux_no_show: 0.12,
    encoding: "utf-8",
    separator: ",",
    statuts: ["Honoré", "Non honoré", "Excusé"],
    include_meta_header: true,
    corrupt_pct: 0.0,
    outFile: "doctolib_6mois.csv",
    expected: "ok",
  },
  {
    source: "doctolib",
    nb_mois: 12,
    taux_no_show: 0.10,
    encoding: "utf-8",
    separator: ",",
    statuts: ["Honoré", "Non honoré", "Excusé"],
    include_meta_header: true,
    corrupt_pct: 0.0,
    outFile: "doctolib_12mois.csv",
    expected: "ok",
  },
  {
    source: "doctolib",
    nb_mois: 18,
    taux_no_show: 0.14,
    encoding: "utf-8",
    separator: ",",
    statuts: ["Honoré", "Non honoré", "Excusé"],
    include_meta_header: true,
    corrupt_pct: 0.0,
    outFile: "doctolib_18mois.csv",
    expected: "ok",
  },

  // 3 Excel/Sheets (libres, séparateurs variés)
  {
    source: "excel",
    nb_mois: 6,
    taux_no_show: 0.11,
    encoding: "utf-8",
    separator: ",",
    statuts: ["présent", "absent"],
    include_meta_header: false,
    corrupt_pct: 0.0,
    outFile: "excel_freenamed_a.csv",
    expected: "ok",
  },
  {
    source: "excel",
    nb_mois: 9,
    taux_no_show: 0.13,
    encoding: "utf-8",
    separator: ";",
    statuts: ["OK", "NoShow"],
    include_meta_header: false,
    corrupt_pct: 0.0,
    outFile: "excel_googlesheets_b.csv",
    expected: "ok",
  },
  {
    source: "excel",
    nb_mois: 12,
    taux_no_show: 0.10,
    encoding: "latin-1",
    separator: ";",
    statuts: ["Honoré", "Manqué"],
    include_meta_header: false,
    corrupt_pct: 0.0,
    outFile: "excel_libre_c.csv",
    expected: "ok",
  },

  // 3 logiciels métier
  {
    source: "logos_w",
    nb_mois: 6,
    taux_no_show: 0.12,
    encoding: "utf-8",
    separator: ";",
    statuts: ["honored", "noshow", "cancelled"],
    include_meta_header: false,
    corrupt_pct: 0.0,
    outFile: "logos_w_typique.csv",
    expected: "ok",
  },
  {
    source: "julie",
    nb_mois: 6,
    taux_no_show: 0.13,
    encoding: "utf-8",
    separator: ";",
    statuts: ["Honoré", "Non honoré"],
    include_meta_header: false,
    corrupt_pct: 0.0,
    outFile: "julie_typique.csv",
    expected: "ok",
  },
  {
    source: "veasy",
    nb_mois: 6,
    taux_no_show: 0.11,
    encoding: "utf-8",
    separator: ";",
    statuts: ["HONORE", "ABSENT"],
    include_meta_header: false,
    corrupt_pct: 0.0,
    outFile: "veasy_typique.csv",
    expected: "ok",
  },

  // 3 malformés
  {
    source: "doctolib",
    nb_mois: 6,
    taux_no_show: 0.12,
    encoding: "utf-8",
    separator: ",",
    statuts: ["Honoré", "Non honoré"],
    include_meta_header: true,
    corrupt_pct: 0.20, // > 10% → degraded (statuts inconnus)
    outFile: "malformed_statuts_inconnus.csv",
    expected: "degraded",
  },
  {
    source: "excel",
    nb_mois: 6,
    taux_no_show: 0.12,
    encoding: "utf-8",
    separator: ",",
    statuts: ["Honoré", "Absent"],
    include_meta_header: false,
    corrupt_pct: 0.15, // > 10% → degraded (lignes ignorées)
    outFile: "malformed_lignes_ignorees.csv",
    expected: "degraded",
  },
  {
    source: "doctolib",
    nb_mois: 1,
    taux_no_show: 0.12,
    encoding: "utf-8",
    separator: ",",
    statuts: ["Honoré", "Non honoré"],
    include_meta_header: true,
    corrupt_pct: 0.0,
    total_override: 15, // < 20 RDV → reject INSUFFICIENT_DATA
    outFile: "malformed_insufficient.csv",
    expected: "reject:INSUFFICIENT_DATA",
  },
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
  const outDir = path.join("e2e", "fixtures", "csv");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  console.log(`[gen-csv-fixtures] Generating ${CATALOG.length} fixtures into ${outDir}/`);
  for (const params of CATALOG) {
    const result = generate(params);
    console.log(
      `  ✓ ${params.outFile.padEnd(40)} (${result.lines} lines, expected=${params.expected})`,
    );
  }
  console.log(`[gen-csv-fixtures] Done. ${CATALOG.length} fixtures generated.`);
}

main();
