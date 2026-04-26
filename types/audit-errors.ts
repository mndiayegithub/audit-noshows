/**
 * Contrat d'erreur structurée — Phase 7 REQ #2.
 * Codes verrouillés dans 07-SPEC.md (5 codes). Ne pas en ajouter sans amender la SPEC.
 */
export type AuditErrorCode =
  | "MISSING_COLUMNS"
  | "INVALID_DATE_FORMAT"
  | "EMPTY_AFTER_PARSING"
  | "ENCODING_ERROR"
  | "INSUFFICIENT_DATA";

export interface AuditErrorPayload {
  success: false;
  error_code: AuditErrorCode;
  error: string;        // Message FR à afficher (carte d'erreur D-05)
  details?: Record<string, unknown>;
}

/** Utilitaire helper pour produire une erreur typée (consommé par lib/audit-validation.ts et app/api/audit/route.ts). */
export function makeAuditError(
  error_code: AuditErrorCode,
  error: string,
  details?: Record<string, unknown>,
): AuditErrorPayload {
  return { success: false, error_code, error, ...(details ? { details } : {}) };
}
