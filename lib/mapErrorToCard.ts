/**
 * Mapping verbatim AuditErrorCode → { title, hint } selon 07-CONTEXT.md D-05.
 * Plan 07-06 (REQ #2 frontend). Verrouillé : ne pas modifier les chaînes sans amender la SPEC.
 */
import type { AuditErrorCode } from "@/types/audit-errors";

export interface ErrorCardContent {
  title: string;
  hint: string;
}

export function mapErrorToCard(
  code: AuditErrorCode | string,
  details?: Record<string, unknown>,
): ErrorCardContent {
  switch (code) {
    case "MISSING_COLUMNS":
      return {
        title: "Colonnes obligatoires manquantes",
        hint: "Renommez vos colonnes en `date` et `statut`.",
      };
    case "INVALID_DATE_FORMAT":
      return {
        title: "Format de date non reconnu",
        hint: "Format attendu : JJ/MM/AAAA (ex : 12/03/2026).",
      };
    case "EMPTY_AFTER_PARSING":
      return {
        title: "CSV vide ou aucune ligne lisible",
        hint: "Vérifiez que votre fichier n'est pas corrompu.",
      };
    case "ENCODING_ERROR":
      return {
        title: "Encodage non supporté",
        hint: "Réenregistrez en UTF-8 (Excel : Fichier > Enregistrer sous > CSV UTF-8).",
      };
    case "INSUFFICIENT_DATA": {
      const recoRate =
        typeof details?.reco_rate === "number" ? (details.reco_rate as number) : 0;
      const nbValides =
        typeof details?.nb_rdv_valides === "number"
          ? (details.nb_rdv_valides as number)
          : 0;
      return {
        title: "Données trop incomplètes pour produire un audit fiable",
        hint: `${Math.round(recoRate * 100)} % reconnus, ${nbValides} RDV valides — il faut au moins 50 % et 20 RDV.`,
      };
    }
    default:
      return {
        title: "Une erreur est survenue",
        hint: "Vérifiez votre fichier et réessayez.",
      };
  }
}
