import { describe, it, expect } from "vitest";
import { normalizeN8nResponse, mapN8nErrorToCode } from "@/lib/n8n-normalize";

describe("normalizeN8nResponse", () => {
  const payload = { success: true, stats: { global: { taux: 10 } }, rapport_texte: "r" };

  it("unwraps array → { output }", () => {
    const raw = [{ output: payload, email: "x@y.com" }];
    expect(normalizeN8nResponse(raw)).toEqual(payload);
  });

  it("unwraps object { output }", () => {
    const raw = { output: payload, email: "x@y.com" };
    expect(normalizeN8nResponse(raw)).toEqual(payload);
  });

  it("passes direct { success, stats } through", () => {
    expect(normalizeN8nResponse(payload)).toEqual(payload);
  });

  it("falls back to first element if array item has no output wrapper", () => {
    const raw = [payload];
    expect(normalizeN8nResponse(raw)).toEqual(payload);
  });

  it("handles null/undefined safely", () => {
    expect(normalizeN8nResponse(null)).toBeNull();
    expect(normalizeN8nResponse(undefined)).toBeUndefined();
  });
});

describe("mapN8nErrorToCode", () => {
  it("classifies ENCODING_ERROR for encodage messages", () => {
    expect(mapN8nErrorToCode("Erreur d'encodage : latin-1 detected")).toBe(
      "ENCODING_ERROR",
    );
    expect(mapN8nErrorToCode("encoding utf-8 invalid")).toBe("ENCODING_ERROR");
  });

  it("classifies INVALID_DATE_FORMAT when date + signal", () => {
    expect(mapN8nErrorToCode("Format de date invalide ligne 12")).toBe(
      "INVALID_DATE_FORMAT",
    );
    expect(mapN8nErrorToCode("date non parsable")).toBe("INVALID_DATE_FORMAT");
  });

  it("classifies EMPTY_AFTER_PARSING for empty/no row messages", () => {
    expect(mapN8nErrorToCode("CSV vide après parsing")).toBe(
      "EMPTY_AFTER_PARSING",
    );
    expect(mapN8nErrorToCode("aucune ligne valide trouvée")).toBe(
      "EMPTY_AFTER_PARSING",
    );
    expect(mapN8nErrorToCode("0 rdv détectés")).toBe("EMPTY_AFTER_PARSING");
  });

  it("classifies INSUFFICIENT_DATA for low-volume messages", () => {
    expect(mapN8nErrorToCode("Trop peu de RDV pour audit fiable")).toBe(
      "INSUFFICIENT_DATA",
    );
    expect(mapN8nErrorToCode("moins de 20 RDV reconnus")).toBe(
      "INSUFFICIENT_DATA",
    );
    expect(mapN8nErrorToCode("pas assez de données")).toBe(
      "INSUFFICIENT_DATA",
    );
  });

  it("classifies MISSING_COLUMNS for header/colonne messages", () => {
    expect(mapN8nErrorToCode("Colonne 'date' manquante")).toBe(
      "MISSING_COLUMNS",
    );
    expect(mapN8nErrorToCode("header introuvable")).toBe("MISSING_COLUMNS");
  });

  it("falls back to EMPTY_AFTER_PARSING for unknown messages", () => {
    expect(mapN8nErrorToCode("erreur générique inattendue")).toBe(
      "EMPTY_AFTER_PARSING",
    );
    expect(mapN8nErrorToCode("")).toBe("EMPTY_AFTER_PARSING");
  });

  it("is case-insensitive", () => {
    expect(mapN8nErrorToCode("ENCODING ERROR")).toBe("ENCODING_ERROR");
    expect(mapN8nErrorToCode("DATE INVALIDE")).toBe("INVALID_DATE_FORMAT");
  });
});

describe("normalizeN8nResponse — degraded passthrough (Phase 7 REQ #3)", () => {
  it("preserves degraded fields from wrapper {output:{...}}", () => {
    const raw = {
      output: {
        success: true,
        stats: { nom_cabinet: "Cabinet A" },
        rapport_texte: "## Rapport",
        degraded: true,
        reco_rate: 0.85,
        ignored_count: 12,
        sample_ignored: [
          { ligne: 5, raison: "date invalide", valeur: "32/13/2024" },
        ],
      },
    };
    const out = normalizeN8nResponse(raw) as Record<string, unknown>;
    expect(out.degraded).toBe(true);
    expect(out.reco_rate).toBe(0.85);
    expect(out.ignored_count).toBe(12);
    expect(Array.isArray(out.sample_ignored)).toBe(true);
  });

  it("preserves degraded fields from direct shape (no wrapper)", () => {
    const raw = {
      success: true,
      stats: { nom_cabinet: "Cabinet B" },
      rapport_texte: "## Direct",
      degraded: true,
      reco_rate: 0.72,
      ignored_count: 30,
      sample_ignored: [],
    };
    const out = normalizeN8nResponse(raw) as Record<string, unknown>;
    expect(out.degraded).toBe(true);
    expect(out.reco_rate).toBe(0.72);
    expect(out.ignored_count).toBe(30);
    expect(out.sample_ignored).toEqual([]);
  });

  it("preserves legacy behavior (no degraded fields = no key)", () => {
    const raw = {
      output: {
        success: true,
        stats: { nom_cabinet: "Cabinet C" },
        rapport_texte: "## Legacy",
      },
    };
    const out = normalizeN8nResponse(raw) as Record<string, unknown>;
    expect(out.success).toBe(true);
    expect("degraded" in out).toBe(false);
  });

  it("handles array test mode with degraded fields", () => {
    const raw = [
      {
        output: {
          success: true,
          stats: {},
          rapport_texte: "## Array",
          degraded: true,
          reco_rate: 0.88,
          ignored_count: 5,
          sample_ignored: [{ ligne: 2 }],
        },
      },
    ];
    const out = normalizeN8nResponse(raw) as Record<string, unknown>;
    expect(out.degraded).toBe(true);
    expect(out.reco_rate).toBe(0.88);
  });
});
