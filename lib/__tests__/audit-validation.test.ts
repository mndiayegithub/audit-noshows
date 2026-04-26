import { describe, it, expect } from "vitest";
import { validateAuditPayload, evaluateRecognition } from "@/lib/audit-validation";

function fd(fields: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.append(k, v);
  return f;
}

const validCsv = "date,statut,heure\n01/01/2026,Honoré,09:00\n02/01/2026,Absent,10:00";

describe("validateAuditPayload", () => {
  it("accepts a valid payload", () => {
    const r = validateAuditPayload(fd({
      csv: validCsv, nom_cabinet: "Dr Martin", ca_moyen: "80",
    }));
    expect(r.ok).toBe(true);
  });

  it("rejects empty csv", () => {
    const r = validateAuditPayload(fd({ csv: "", nom_cabinet: "x", ca_moyen: "80" }));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/vide|invalide/i);
  });

  it("rejects csv > 2 Mo", () => {
    const big = "a,b\n" + "x".repeat(2_000_001);
    const r = validateAuditPayload(fd({ csv: big, nom_cabinet: "x", ca_moyen: "80" }));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/volumineux/i);
  });

  it("rejects csv without date/statut headers", () => {
    const bad = "foo,bar\n1,2\n3,4";
    const r = validateAuditPayload(fd({ csv: bad, nom_cabinet: "x", ca_moyen: "80" }));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/colonnes/i);
  });

  it("accepts semicolon-separated csv", () => {
    const semi = "date;statut;heure\n01/01/2026;Honoré;09:00\n02/01/2026;Absent;10:00";
    const r = validateAuditPayload(fd({ csv: semi, nom_cabinet: "x", ca_moyen: "80" }));
    expect(r.ok).toBe(true);
  });

  it("rejects empty nom_cabinet", () => {
    const r = validateAuditPayload(fd({ csv: validCsv, nom_cabinet: "   ", ca_moyen: "80" }));
    expect(r.ok).toBe(false);
  });

  it("rejects ca_moyen <= 0 or > 10000", () => {
    expect(validateAuditPayload(fd({ csv: validCsv, nom_cabinet: "x", ca_moyen: "0" })).ok).toBe(false);
    expect(validateAuditPayload(fd({ csv: validCsv, nom_cabinet: "x", ca_moyen: "-10" })).ok).toBe(false);
    expect(validateAuditPayload(fd({ csv: validCsv, nom_cabinet: "x", ca_moyen: "20000" })).ok).toBe(false);
  });

  it("rejects invalid email when provided", () => {
    const r = validateAuditPayload(fd({
      csv: validCsv, nom_cabinet: "x", ca_moyen: "80", email: "not-an-email",
    }));
    expect(r.ok).toBe(false);
  });

  it("accepts omitted email", () => {
    const r = validateAuditPayload(fd({ csv: validCsv, nom_cabinet: "x", ca_moyen: "80" }));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.values.email).toBeUndefined();
  });

  // ───── Phase 7 REQ #2: error_code typed contract ─────

  it("Phase7: empty csv → error_code EMPTY_AFTER_PARSING", () => {
    const r = validateAuditPayload(fd({ csv: "", nom_cabinet: "x", ca_moyen: "80" }));
    expect(r.ok).toBe(false);
    if (!r.ok && "error_code" in r) expect(r.error_code).toBe("EMPTY_AFTER_PARSING");
    else throw new Error("expected error_code branch");
  });

  it("Phase7: csv > 2 Mo → error_code EMPTY_AFTER_PARSING", () => {
    const big = "a,b\n" + "x".repeat(2_000_001);
    const r = validateAuditPayload(fd({ csv: big, nom_cabinet: "x", ca_moyen: "80" }));
    expect(r.ok).toBe(false);
    if (!r.ok && "error_code" in r) expect(r.error_code).toBe("EMPTY_AFTER_PARSING");
    else throw new Error("expected error_code branch");
  });

  it("Phase7: missing date column → MISSING_COLUMNS, details.missing=['date']", () => {
    const bad = "statut,heure\nHonore,09:00\nAbsent,10:00";
    const r = validateAuditPayload(fd({ csv: bad, nom_cabinet: "x", ca_moyen: "80" }));
    expect(r.ok).toBe(false);
    if (!r.ok && "error_code" in r) {
      expect(r.error_code).toBe("MISSING_COLUMNS");
      expect(r.details).toEqual({ missing: ["date"] });
    } else throw new Error("expected error_code branch");
  });

  it("Phase7: missing statut column → MISSING_COLUMNS, details.missing=['statut']", () => {
    const bad = "date,heure\n01/01/2026,09:00\n02/01/2026,10:00";
    const r = validateAuditPayload(fd({ csv: bad, nom_cabinet: "x", ca_moyen: "80" }));
    expect(r.ok).toBe(false);
    if (!r.ok && "error_code" in r) {
      expect(r.error_code).toBe("MISSING_COLUMNS");
      expect(r.details).toEqual({ missing: ["statut"] });
    } else throw new Error("expected error_code branch");
  });

  it("Phase7: both columns missing → details.missing=['date','statut']", () => {
    const bad = "foo,bar\n1,2\n3,4";
    const r = validateAuditPayload(fd({ csv: bad, nom_cabinet: "x", ca_moyen: "80" }));
    expect(r.ok).toBe(false);
    if (!r.ok && "error_code" in r) {
      expect(r.error_code).toBe("MISSING_COLUMNS");
      expect(r.details).toEqual({ missing: ["date", "statut"] });
    } else throw new Error("expected error_code branch");
  });

  it("Phase7: invalid email keeps legacy untyped branch (no error_code)", () => {
    const r = validateAuditPayload(fd({
      csv: validCsv, nom_cabinet: "x", ca_moyen: "80", email: "not-an-email",
    }));
    expect(r.ok).toBe(false);
    if (!r.ok) expect("error_code" in r).toBe(false);
  });
});

// ───── Phase 7 REQ #4: evaluateRecognition (D-06 thresholds) ─────

describe("evaluateRecognition", () => {
  it("reject when reco_rate < 0.50 (INSUFFICIENT_DATA)", () => {
    const r = evaluateRecognition(0.40, 100);
    expect(r.outcome).toBe("reject");
    if (r.outcome === "reject") {
      expect(r.error.error_code).toBe("INSUFFICIENT_DATA");
      expect(r.error.success).toBe(false);
      expect(r.error.details).toMatchObject({ reco_rate: 0.40, nb_rdv_valides: 100 });
    }
  });

  it("reject when nb_rdv_valides < 20 even if reco_rate is high", () => {
    const r = evaluateRecognition(0.99, 15);
    expect(r.outcome).toBe("reject");
    if (r.outcome === "reject") {
      expect(r.error.error_code).toBe("INSUFFICIENT_DATA");
    }
  });

  it("degraded when 0.50 <= reco_rate < 0.90 and rdv >= 20", () => {
    const r = evaluateRecognition(0.75, 50);
    expect(r.outcome).toBe("degraded");
    if (r.outcome === "degraded") {
      expect(r.reco_rate).toBe(0.75);
    }
  });

  it("ok when reco_rate >= 0.90 and rdv >= 20", () => {
    const r = evaluateRecognition(0.95, 30);
    expect(r.outcome).toBe("ok");
  });

  it("boundary: reco_rate exactly 0.50 with 20 rdv → degraded (not reject)", () => {
    const r = evaluateRecognition(0.50, 20);
    expect(r.outcome).toBe("degraded");
  });

  it("boundary: reco_rate exactly 0.90 with 20 rdv → ok (not degraded)", () => {
    const r = evaluateRecognition(0.90, 20);
    expect(r.outcome).toBe("ok");
  });
});
