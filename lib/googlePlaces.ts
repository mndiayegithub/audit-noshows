/**
 * Interprétation de la réponse de l'API Google Places (legacy Find Place).
 *
 * ⚠️ Le piège qui a coûté une panne silencieuse de plusieurs mois :
 * **Google répond HTTP 200 même quand il refuse la requête.** Le refus est
 * porté par le champ `status` du corps (`REQUEST_DENIED`, `OVER_QUERY_LIMIT`,
 * …), accompagné d'un `error_message`, et sans tableau `candidates`.
 *
 * L'ancienne version de la route ne regardait que `candidates` : une clé
 * refusée, une facturation coupée ou un quota dépassé ressortaient donc en
 * « aucun résultat », strictement indiscernables d'un cabinet introuvable.
 * Aucune exception, donc aucune trace dans les logs. Constaté le 2026-08-08 :
 * `REQUEST_DENIED — You must enable Billing on the Google Cloud Project`,
 * pendant que l'interface affichait paisiblement « établissement introuvable ».
 *
 * Cette fonction sépare les trois cas pour que l'interface dise la vérité.
 */

export type ReponseGoogle =
  /** Un établissement correspond. */
  | { type: "trouve"; place: Record<string, unknown> }
  /** Google a répondu correctement : aucun établissement ne correspond. */
  | { type: "introuvable" }
  /** Google a refusé ou échoué. `detail` part dans les logs, jamais à l'écran. */
  | { type: "indisponible"; detail: string };

/** Statuts Google signifiant « requête traitée, mais rien à retourner ». */
const STATUTS_SANS_RESULTAT = new Set(["ZERO_RESULTS", "NOT_FOUND"]);

export function interpreterReponseGoogle(data: unknown): ReponseGoogle {
  if (typeof data !== "object" || data === null) {
    return { type: "indisponible", detail: "réponse Google illisible" };
  }

  const corps = data as {
    status?: unknown;
    error_message?: unknown;
    candidates?: unknown;
  };
  const status = typeof corps.status === "string" ? corps.status : undefined;
  const candidates = Array.isArray(corps.candidates) ? corps.candidates : [];

  if (status && STATUTS_SANS_RESULTAT.has(status)) {
    return { type: "introuvable" };
  }

  // Tout statut autre que OK est un refus ou une panne, jamais une absence de
  // résultat. C'est précisément la distinction qui manquait.
  if (status && status !== "OK") {
    const message =
      typeof corps.error_message === "string" && corps.error_message
        ? corps.error_message
        : "aucun message";
    return { type: "indisponible", detail: `${status} — ${message}` };
  }

  // Pas de champ `status` du tout : la réponse n'a pas la forme attendue.
  if (!status) {
    return { type: "indisponible", detail: "réponse Google sans champ status" };
  }

  if (candidates.length === 0) return { type: "introuvable" };

  return { type: "trouve", place: candidates[0] as Record<string, unknown> };
}
