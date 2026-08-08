import { describe, it, expect } from "vitest";
import { interpreterReponseGoogle } from "@/lib/googlePlaces";

describe("interpreterReponseGoogle", () => {
  it("retourne l'établissement quand Google répond OK", () => {
    const r = interpreterReponseGoogle({
      status: "OK",
      candidates: [{ name: "Cabinet Dr Martin", rating: 4.6, user_ratings_total: 87 }],
    });
    expect(r.type).toBe("trouve");
    if (r.type === "trouve") expect(r.place.name).toBe("Cabinet Dr Martin");
  });

  it("distingue une vraie absence de résultat", () => {
    expect(interpreterReponseGoogle({ status: "ZERO_RESULTS", candidates: [] }).type).toBe(
      "introuvable",
    );
    expect(interpreterReponseGoogle({ status: "OK", candidates: [] }).type).toBe("introuvable");
  });

  // Le cœur du correctif : ce cas ressortait en « introuvable » et a masqué
  // une panne de plusieurs mois. Google répond HTTP 200 pour tout cela.
  it("traite REQUEST_DENIED comme une indisponibilité, PAS comme une absence", () => {
    const r = interpreterReponseGoogle({
      status: "REQUEST_DENIED",
      error_message: "You must enable Billing on the Google Cloud Project",
    });
    expect(r.type).toBe("indisponible");
    if (r.type === "indisponible") {
      expect(r.detail).toContain("REQUEST_DENIED");
      expect(r.detail).toContain("Billing");
    }
  });

  it("traite un quota dépassé comme une indisponibilité", () => {
    const r = interpreterReponseGoogle({ status: "OVER_QUERY_LIMIT", candidates: [] });
    expect(r.type).toBe("indisponible");
  });

  it("traite INVALID_REQUEST et UNKNOWN_ERROR comme des indisponibilités", () => {
    expect(interpreterReponseGoogle({ status: "INVALID_REQUEST" }).type).toBe("indisponible");
    expect(interpreterReponseGoogle({ status: "UNKNOWN_ERROR" }).type).toBe("indisponible");
  });

  it("ne prend pas un refus sans error_message pour un succès", () => {
    const r = interpreterReponseGoogle({ status: "REQUEST_DENIED" });
    expect(r.type).toBe("indisponible");
    if (r.type === "indisponible") expect(r.detail).toContain("aucun message");
  });

  it("refuse une réponse sans champ status plutôt que de la croire vide", () => {
    expect(interpreterReponseGoogle({ candidates: [] }).type).toBe("indisponible");
  });

  it("survit à une réponse qui n'est pas un objet", () => {
    expect(interpreterReponseGoogle(null).type).toBe("indisponible");
    expect(interpreterReponseGoogle("<html>502</html>").type).toBe("indisponible");
  });
});
