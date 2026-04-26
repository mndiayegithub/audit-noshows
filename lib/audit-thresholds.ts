/**
 * Seuils métier audit no-shows — single source of truth (D-06 phase 7).
 * Consommé par: components/audit/CSVPreview.tsx, app/api/audit/route.ts, lib/audit-validation.ts.
 * NE PAS dupliquer ces valeurs ailleurs (drift dev/prod garanti).
 */
export const DEGRADED_THRESHOLD = 0.90; // < 90% reconnus → confirmation utilisateur (REQ #3)
export const REJECT_THRESHOLD = 0.50;   // < 50% reconnus → 400 INSUFFICIENT_DATA (REQ #4)
export const MIN_RDV_VALIDES = 20;      // < 20 RDV valides → 400 INSUFFICIENT_DATA (REQ #4)
