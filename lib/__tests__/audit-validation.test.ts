import { describe, it, expect } from "vitest";
import { validateAuditPayload } from "@/lib/audit-validation";

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
});
