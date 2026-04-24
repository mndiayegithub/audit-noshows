/**
 * Server-side validation of the /api/audit payload (Phase 05 — RGPD & Sécurité).
 *
 * Pure, testable, no I/O. Returns a discriminated union so the caller knows
 * whether to forward the payload to n8n or to short-circuit with 400.
 */

const MAX_CSV_BYTES = 2_000_000;
const MAX_CABINET_LEN = 120;
const MAX_EMAIL_LEN = 254;
const MAX_CA = 10_000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface AuditPayload {
  csv: string;
  nom_cabinet: string;
  ca_moyen: number;
  email?: string;
}

export type ValidationResult =
  | { ok: true; values: AuditPayload }
  | { ok: false; error: string };

function detectSeparator(headerLine: string): "," | ";" {
  return (headerLine.match(/;/g)?.length ?? 0) > (headerLine.match(/,/g)?.length ?? 0) ? ";" : ",";
}

export function validateAuditPayload(formData: FormData): ValidationResult {
  const csvRaw = formData.get("csv");
  const nomRaw = formData.get("nom_cabinet");
  const caRaw = formData.get("ca_moyen");
  const emailRaw = formData.get("email");

  if (typeof csvRaw !== "string" || csvRaw.trim().length === 0) {
    return { ok: false, error: "CSV vide ou invalide" };
  }
  if (csvRaw.length > MAX_CSV_BYTES) {
    return { ok: false, error: "CSV trop volumineux (max 2 Mo)" };
  }
  const lines = csvRaw.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    return { ok: false, error: "CSV vide ou invalide" };
  }
  const headerLine = lines[0];
  const sep = detectSeparator(headerLine);
  const headers = headerLine.split(sep).map((h) => h.trim().toLowerCase());
  const hasDate = headers.some((h) => h === "date");
  const hasStatut = headers.some((h) => h === "statut" || h === "status");
  if (!hasDate || !hasStatut) {
    return { ok: false, error: "Colonnes manquantes : date et/ou statut introuvables" };
  }

  if (typeof nomRaw !== "string" || nomRaw.trim().length === 0) {
    return { ok: false, error: "Nom cabinet invalide" };
  }
  const nom = nomRaw.trim();
  if (nom.length > MAX_CABINET_LEN) {
    return { ok: false, error: "Nom cabinet invalide" };
  }

  if (typeof caRaw !== "string" || caRaw.trim().length === 0) {
    return { ok: false, error: "CA moyen invalide" };
  }
  const ca = Number(caRaw);
  if (!Number.isFinite(ca) || ca <= 0 || ca > MAX_CA) {
    return { ok: false, error: "CA moyen invalide" };
  }

  let email: string | undefined;
  if (typeof emailRaw === "string" && emailRaw.trim().length > 0) {
    const e = emailRaw.trim();
    if (e.length > MAX_EMAIL_LEN || !EMAIL_RE.test(e)) {
      return { ok: false, error: "Email invalide" };
    }
    email = e;
  }

  return {
    ok: true,
    values: { csv: csvRaw, nom_cabinet: nom, ca_moyen: ca, email },
  };
}
