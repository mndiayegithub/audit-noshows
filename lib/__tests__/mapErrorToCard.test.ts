import { describe, it, expect } from "vitest";
import { mapErrorToCard } from "../mapErrorToCard";

describe("mapErrorToCard — D-05 verbatim mapping", () => {
  it("MISSING_COLUMNS → titre + hint avec colonnes manquantes interpolées", () => {
    const result = mapErrorToCard("MISSING_COLUMNS", { missing: ["statut"] });
    expect(result.title).toBe("Colonnes obligatoires manquantes");
    expect(result.hint).toContain("statut");
    expect(result.hint).toContain("Statut_presence");
  });

  it("MISSING_COLUMNS sans details → hint fallback générique", () => {
    const result = mapErrorToCard("MISSING_COLUMNS");
    expect(result.hint).toContain("date et/ou statut");
  });

  it("INVALID_DATE_FORMAT → titre + hint format JJ/MM/AAAA", () => {
    const result = mapErrorToCard("INVALID_DATE_FORMAT");
    expect(result.title).toBe("Format de date non reconnu");
    expect(result.hint).toContain("JJ/MM/AAAA");
  });

  it("EMPTY_AFTER_PARSING → titre + hint corruption", () => {
    const result = mapErrorToCard("EMPTY_AFTER_PARSING");
    expect(result.title).toBe("CSV vide ou aucune ligne lisible");
    expect(result.hint).toContain("n'est pas corrompu");
  });

  it("ENCODING_ERROR → titre + hint UTF-8", () => {
    const result = mapErrorToCard("ENCODING_ERROR");
    expect(result.title).toBe("Encodage non supporté");
    expect(result.hint).toContain("UTF-8");
  });

  it("INSUFFICIENT_DATA → interpole pourcentage et nb RDV", () => {
    const result = mapErrorToCard("INSUFFICIENT_DATA", {
      reco_rate: 0.42,
      nb_rdv_valides: 14,
    });
    expect(result.title).toBe(
      "Données trop incomplètes pour produire un audit fiable",
    );
    expect(result.hint).toContain("42 %");
    expect(result.hint).toContain("14 RDV");
  });

  it("INSUFFICIENT_DATA sans details → fallback 0 % / 0 RDV (pas de throw)", () => {
    const result = mapErrorToCard("INSUFFICIENT_DATA");
    expect(result.title).toBe(
      "Données trop incomplètes pour produire un audit fiable",
    );
    expect(result.hint).toContain("0 %");
    expect(result.hint).toContain("0 RDV");
  });

  it("Code inconnu → fallback générique sans throw", () => {
    const result = mapErrorToCard("UNKNOWN_CODE_XYZ" as never);
    expect(result.title).toBe("Une erreur est survenue");
    expect(result.hint).toContain("Vérifiez votre fichier");
  });
});
