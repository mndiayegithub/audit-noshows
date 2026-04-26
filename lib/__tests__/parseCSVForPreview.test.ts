/**
 * Tests unitaires `parseCSVForPreview` — Phase 7 Plan 07-03.
 *
 * Cas couverts:
 *  - CSV Doctolib trivial (séparateur ',')
 *  - CSV Excel FR (séparateur ';')
 *  - Colonnes manquantes (MISSING_COLUMNS)
 *  - CSV vide (EMPTY_AFTER_PARSING)
 *  - 30 % de statuts inconnus → recoRate ≈ 0.7
 *  - Latence < 1500 ms pour CSV synthétique 2 Mo
 *  - Cas bord: header seul sans data, willReject pour < 20 RDV valides
 */
import { describe, it, expect } from "vitest";
import { parseCSVForPreview } from "../parseCSVForPreview";

function buildCSV(header: string[], rows: string[][], sep = ","): string {
  return [header.join(sep), ...rows.map((r) => r.join(sep))].join("\n");
}

describe("parseCSVForPreview", () => {
  it("CSV Doctolib trivial — colonnes + 3 sample + total + recoRate=1", () => {
    const csv = buildCSV(
      ["date", "heure", "statut"],
      [
        ["12/03/2026", "09:00", "Honoré"],
        ["12/03/2026", "10:00", "no-show"],
        ["13/03/2026", "11:00", "Honoré"],
        ["13/03/2026", "14:00", "absent"],
        ["14/03/2026", "15:00", "venu"],
      ],
    );

    const r = parseCSVForPreview(csv);
    expect(r.ok).toBe(true);
    if (!r.ok) return;

    expect(r.preview.columns).toEqual(["date", "heure", "statut"]);
    expect(r.preview.sampleRows.length).toBe(3);
    expect(r.preview.totalRows).toBe(5);
    expect(r.preview.recoRate).toBe(1);
    expect(r.preview.nbRdvValides).toBe(5);
    expect(r.preview.willReject).toBe(true); // 5 < MIN_RDV_VALIDES (20)
  });

  it("CSV séparateur ';' (Excel FR) — papaparse auto-détecte", () => {
    const csv = buildCSV(
      ["date", "heure", "statut"],
      [
        ["12/03/2026", "09:00", "Honoré"],
        ["12/03/2026", "10:00", "no-show"],
        ["13/03/2026", "11:00", "Honoré"],
      ],
      ";",
    );

    const r = parseCSVForPreview(csv);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.preview.columns).toEqual(["date", "heure", "statut"]);
    expect(r.preview.totalRows).toBe(3);
  });

  it("Colonnes manquantes — error_code MISSING_COLUMNS, details.missing inclut 'statut'", () => {
    const csv = buildCSV(
      ["date", "heure"],
      [
        ["12/03/2026", "09:00"],
        ["12/03/2026", "10:00"],
      ],
    );

    const r = parseCSVForPreview(csv);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error.error_code).toBe("MISSING_COLUMNS");
    expect((r.error.details as { missing: string[] }).missing).toEqual([
      "statut",
    ]);
  });

  it("CSV vide — error_code EMPTY_AFTER_PARSING", () => {
    const r = parseCSVForPreview("");
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error.error_code).toBe("EMPTY_AFTER_PARSING");

    const r2 = parseCSVForPreview("   \n  \n");
    expect(r2.ok).toBe(false);
    if (r2.ok) return;
    expect(r2.error.error_code).toBe("EMPTY_AFTER_PARSING");
  });

  it("CSV avec ~30 % statuts inconnus — recoRate ≈ 0.7", () => {
    // 10 lignes : 7 reconnus, 3 inconnus (Reporté, DNA, Reporté)
    const csv = buildCSV(
      ["date", "statut"],
      [
        ["01/03/2026", "Honoré"],
        ["02/03/2026", "Honoré"],
        ["03/03/2026", "no-show"],
        ["04/03/2026", "absent"],
        ["05/03/2026", "venu"],
        ["06/03/2026", "Honoré"],
        ["07/03/2026", "annulé"],
        ["08/03/2026", "Reporté"],
        ["09/03/2026", "DNA"],
        ["10/03/2026", "Reporté"],
      ],
    );

    const r = parseCSVForPreview(csv);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.preview.totalRows).toBe(10);
    expect(r.preview.nbRdvValides).toBe(7);
    expect(r.preview.recoRate).toBeCloseTo(0.7, 5);
  });

  it("CSV avec ≥ 20 RDV reconnus — willReject=false, degraded=false si recoRate >= 0.90", () => {
    // 25 lignes toutes reconnues
    const rows = Array.from({ length: 25 }, (_, i) => [
      `${String((i % 28) + 1).padStart(2, "0")}/03/2026`,
      "Honoré",
    ]);
    const csv = buildCSV(["date", "statut"], rows);
    const r = parseCSVForPreview(csv);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.preview.willReject).toBe(false);
    expect(r.preview.degraded).toBe(false);
    expect(r.preview.recoRate).toBe(1);
  });

  it("Mode dégradé — 25 lignes, 20 reconnues (80 %) → degraded=true, willReject=false", () => {
    const rows: string[][] = [];
    for (let i = 0; i < 20; i++)
      rows.push([`${String((i % 28) + 1).padStart(2, "0")}/03/2026`, "Honoré"]);
    for (let i = 0; i < 5; i++)
      rows.push([`${String((i % 28) + 1).padStart(2, "0")}/04/2026`, "Reporté"]);
    const csv = buildCSV(["date", "statut"], rows);
    const r = parseCSVForPreview(csv);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.preview.recoRate).toBeCloseTo(0.8, 5);
    expect(r.preview.degraded).toBe(true);
    expect(r.preview.willReject).toBe(false);
  });

  it("Latence < 1500 ms pour CSV synthétique ~2 Mo", () => {
    // ~2 Mo : ~50000 lignes de ~40 octets
    const rows = Array.from({ length: 50_000 }, (_, i) => [
      `${String((i % 28) + 1).padStart(2, "0")}/03/2026`,
      "09:00",
      i % 5 === 0 ? "no-show" : "Honoré",
    ]);
    const csv = buildCSV(["date", "heure", "statut"], rows);

    const t0 = Date.now();
    const r = parseCSVForPreview(csv);
    const elapsed = Date.now() - t0;

    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.preview.totalRows).toBe(50_000);
    expect(elapsed).toBeLessThan(1500);
  });
});
