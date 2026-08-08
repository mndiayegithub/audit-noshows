/**
 * Collecte de la mesure d'audience → table Supabase `audit_events`.
 *
 * Pourquoi une route plutôt qu'une insertion directe depuis le client (choix
 * inverse du site vitrine, et c'est délibéré) :
 *
 * 1. `navigator.sendBeacon` ne permet PAS de poser d'en-têtes HTTP. Il ne peut
 *    donc pas envoyer `apikey` / `Authorization` à PostgREST. Or le beacon est
 *    le seul transport qui survit à la fermeture de l'onglet — donc le seul
 *    moyen de mesurer les abandons pendant l'attente n8n de 30-50 s, qui est
 *    précisément le trou qu'on cherche à combler. Une route même-origine n'a
 *    besoin d'aucun en-tête d'authentification.
 * 2. La clé Supabase reste côté serveur : pas de `NEXT_PUBLIC_`, donc pas
 *    d'inlining à la compilation — la variable est lue à l'exécution. C'est ce
 *    piège-là qui avait silencieusement cassé le CTA Calendly en Phase 8.
 * 3. Elle donne un endroit où limiter le débit, ce que RLS ne sait pas faire.
 *
 * Coût : une invocation de fonction par événement. Négligeable au volume
 * actuel, et l'appel est en « tire et oublie » côté client.
 */
import { logServerError } from "@/lib/safe-log";
import { checkRateLimit } from "@/lib/rate-limit";

export const maxDuration = 10;

/** Bornes alignées sur les contraintes CHECK de la table (défense en profondeur). */
const MAX_EVENT_TYPE = 64;
const MAX_PAGE = 200;
const MAX_SESSION_ID = 64;
const MAX_PROPERTIES_BYTES = 2048;
/** Un corps plus gros que ça n'est pas une mesure d'audience. */
const MAX_BODY_BYTES = 4096;

const ALLOWED_ORIGIN_PARTS = ["localhost", "127.0.0.1", "vercel.app", "perfiamatic.fr"];

/**
 * Origine absente = acceptée. Un beacon émis pendant le déchargement de la
 * page peut arriver sans `referer` ; refuser dans ce cas reviendrait à jeter
 * exactement les événements d'abandon qu'on veut mesurer.
 */
function isOriginAllowed(request: Request): boolean {
  const origin = request.headers.get("origin") || request.headers.get("referer") || "";
  if (!origin) return true;
  return ALLOWED_ORIGIN_PARTS.some((d) => origin.includes(d));
}

type Corps = {
  event_type?: unknown;
  page?: unknown;
  session_id?: unknown;
  properties?: unknown;
};

/** `undefined` si le corps est inexploitable ; sinon la ligne prête à insérer. */
function valider(corps: Corps):
  | { event_type: string; page: string | null; session_id: string | null; properties: unknown }
  | undefined {
  const { event_type, page, session_id, properties } = corps;

  if (typeof event_type !== "string" || !event_type || event_type.length > MAX_EVENT_TYPE) {
    return undefined;
  }
  if (page !== undefined && page !== null && (typeof page !== "string" || page.length > MAX_PAGE)) {
    return undefined;
  }
  if (
    session_id !== undefined &&
    session_id !== null &&
    (typeof session_id !== "string" || session_id.length > MAX_SESSION_ID)
  ) {
    return undefined;
  }
  if (properties !== undefined && properties !== null) {
    if (typeof properties !== "object" || Array.isArray(properties)) return undefined;
    if (new TextEncoder().encode(JSON.stringify(properties)).length > MAX_PROPERTIES_BYTES) {
      return undefined;
    }
  }

  return {
    event_type,
    page: typeof page === "string" ? page : null,
    session_id: typeof session_id === "string" ? session_id : null,
    properties: properties ?? null,
  };
}

export async function POST(request: Request) {
  if (!isOriginAllowed(request)) {
    return new Response(null, { status: 403 });
  }

  // ~10 événements par parcours d'audit : 300 laisse largement respirer un
  // usage normal tout en bornant un envoi automatisé.
  const rl = checkRateLimit(request, { max: 300, windowMs: 600_000, key: "mesure" });
  if (!rl.allowed) {
    return new Response(null, {
      status: 429,
      headers: { "Retry-After": String(rl.retryAfterSec ?? 60) },
    });
  }

  // Le corps arrive en `text/plain` quand il vient de sendBeacon (un Blob
  // `application/json` déclencherait un contrôle préalable CORS que le beacon
  // ne sait pas mener pendant le déchargement). On lit donc du texte brut.
  let corps: Corps;
  try {
    const brut = await request.text();
    if (brut.length > MAX_BODY_BYTES) return new Response(null, { status: 413 });
    corps = JSON.parse(brut) as Corps;
  } catch {
    return new Response(null, { status: 400 });
  }

  const ligne = valider(corps);
  if (!ligne) return new Response(null, { status: 400 });

  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const cle = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !cle) {
    // Pas de 500 : une mesure absente ne doit pas ressembler à une panne côté
    // client. On le trace côté serveur, c'est tout.
    logServerError("mesure", new Error("SUPABASE_URL / SUPABASE_ANON_KEY manquantes"));
    return new Response(null, { status: 204 });
  }

  try {
    const reponse = await fetch(`${url}/rest/v1/audit_events`, {
      method: "POST",
      headers: {
        apikey: cle,
        Authorization: `Bearer ${cle}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(ligne),
    });
    if (!reponse.ok) {
      // Cas le plus probable : projet Supabase en pause (plan gratuit, mise en
      // veille après ~1 semaine sans activité). Rien à faire côté client.
      logServerError("mesure", new Error(`Supabase ${reponse.status}`));
    }
  } catch (err) {
    logServerError("mesure", err);
  }

  // Toujours 204 : le client n'a rien à apprendre de l'échec, et surtout rien
  // à en faire. Une mesure d'audience ne doit jamais dégrader le parcours.
  return new Response(null, { status: 204 });
}
