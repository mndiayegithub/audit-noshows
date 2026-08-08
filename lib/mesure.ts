/**
 * Transport de la mesure d'audience, côté navigateur.
 *
 * Envoie vers `/api/mesure` (route même-origine), qui insère dans la table
 * Supabase `audit_events`. Aucun SDK : `fetch` et `sendBeacon` suffisent, donc
 * zéro kilo-octet ajouté au bundle — et `sendBeacon` est de toute façon le
 * seul transport qui survit à la fermeture de l'onglet.
 *
 * Confidentialité : le seul élément stocké est un identifiant de visite
 * aléatoire, en `sessionStorage`, effacé à la fermeture de l'onglet. Ni
 * adresse IP, ni e-mail, ni contenu de CSV.
 *
 * ⚠️ La dispense de consentement « mesure d'audience » tient à trois interdits.
 * Ne jamais croiser `session_id` avec l'e-mail du formulaire, une adresse IP
 * ou le contenu du fichier déposé (données de patients) ; ne jamais passer à
 * `localStorage` ; ne jamais s'en servir pour du reciblage.
 */

const CLE_SESSION = "pia_audit_sid";
const POINT_DE_COLLECTE = "/api/mesure";

/**
 * Identifiant de la visite en cours, créé au premier appel.
 * Renvoie `undefined` si le stockage est refusé (navigation privée) : on
 * préfère un événement sans identifiant à pas d'événement du tout.
 */
export function idVisite(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const existant = sessionStorage.getItem(CLE_SESSION);
    if (existant) return existant;
    const nouveau =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem(CLE_SESSION, nouveau);
    return nouveau;
  } catch {
    return undefined;
  }
}

export type ProprietesMesure = Record<string, string | number | boolean | null>;

/**
 * Émet un événement. Jamais attendu, jamais bloquant, jamais lancé d'exception.
 *
 * `sendBeacon` d'abord : il est mis en file par le navigateur et part même si
 * la page se ferme dans la seconde. Le corps est envoyé en `text/plain` à
 * dessein — un Blob `application/json` rendrait la requête « non simple » et
 * déclencherait un contrôle préalable que le beacon ne sait pas mener pendant
 * le déchargement. La route lit du texte brut pour cette raison.
 *
 * Repli sur `fetch` avec `keepalive` si le beacon est indisponible ou si sa
 * file est pleine (il renvoie alors `false`).
 */
export function envoyer(eventType: string, proprietes?: ProprietesMesure): void {
  if (typeof window === "undefined") return;
  try {
    const corps = JSON.stringify({
      event_type: eventType,
      page: window.location.pathname,
      session_id: idVisite() ?? null,
      properties: proprietes ?? null,
    });

    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const accepte = navigator.sendBeacon(
        POINT_DE_COLLECTE,
        new Blob([corps], { type: "text/plain;charset=UTF-8" }),
      );
      if (accepte) return;
    }

    void fetch(POINT_DE_COLLECTE, {
      method: "POST",
      body: corps,
      headers: { "Content-Type": "text/plain;charset=UTF-8" },
      keepalive: true,
    }).catch(() => {
      /* silencieux, par construction */
    });
  } catch {
    // Une mesure d'audience ne doit JAMAIS interrompre le parcours commercial.
  }
}
