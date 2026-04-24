import { validateAuditPayload } from "@/lib/audit-validation";
import { logServerError } from "@/lib/safe-log";
import { checkRateLimit } from "@/lib/rate-limit";

export const maxDuration = 60;

const ALLOWED_ORIGIN_PARTS = [
  "localhost",
  "127.0.0.1",
  "vercel.app",
  "perfiamatic.fr",
];

function isOriginAllowed(request: Request): boolean {
  const origin = request.headers.get("origin") || request.headers.get("referer") || "";
  if (!origin) return false;
  return ALLOWED_ORIGIN_PARTS.some((d) => origin.includes(d));
}

export async function POST(request: Request) {
  if (!isOriginAllowed(request)) {
    return Response.json(
      { success: false, error: "Origine non autorisée" },
      { status: 403 }
    );
  }

  const rl = checkRateLimit(request, { max: 10, windowMs: 600_000, key: "audit" });
  if (!rl.allowed) {
    return Response.json(
      { success: false, error: "Trop de requêtes, réessayez dans quelques minutes" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec ?? 60) } }
    );
  }

  try {
    const formData = await request.formData();

    const v = validateAuditPayload(formData);
    if (!v.ok) {
      return Response.json({ success: false, error: v.error }, { status: 400 });
    }

    const webhookUrl =
      process.env.N8N_WEBHOOK_URL ??
      "https://n8n.srv939707.hstgr.cloud/webhook/audit-flash";
    const response = await fetch(webhookUrl, {
      method: "POST",
      body: formData,
      signal: AbortSignal.timeout(55000),
    });

    if (!response.ok) {
      throw new Error(`n8n a répondu avec le statut : ${response.status}`);
    }

    const bodyText = await response.text();
    if (!bodyText || !bodyText.trim()) {
      throw new Error(
        "n8n a renvoyé une réponse vide. Vérifiez que le workflow 'audit-flash' est actif et qu'il se termine par un nœud 'Respond to Webhook' renvoyant du JSON."
      );
    }

    let raw: unknown;
    try {
      raw = JSON.parse(bodyText);
    } catch {
      throw new Error(
        `n8n a renvoyé une réponse non-JSON (${bodyText.length} car.). Début : ${bodyText.slice(0, 200)}`
      );
    }

    // n8n peut renvoyer plusieurs formats selon le mode d'exécution :
    // 1) Production (Respond to Webhook + JSON.stringify) :
    //    { output: { success, stats, rapport_texte }, email }
    // 2) Test webhook (n8n retourne un tableau) :
    //    [{ output: { success, stats, rapport_texte }, email }]
    // 3) Direct (ancienne version) :
    //    { success, stats, rapport_texte }
    let data: unknown = raw;

    if (Array.isArray(raw)) {
      const first = raw[0];
      if (first?.output && typeof first.output === "object" && "success" in first.output) {
        data = first.output;
      } else {
        data = first;
      }
    } else if (
      raw &&
      typeof raw === "object" &&
      "output" in raw &&
      (raw as { output?: unknown }).output &&
      typeof (raw as { output: unknown }).output === "object" &&
      "success" in ((raw as { output: Record<string, unknown> }).output)
    ) {
      data = (raw as { output: unknown }).output;
    }

    return Response.json(data);
  } catch (error: unknown) {
    logServerError("api/audit", error);
    const message = error instanceof Error ? error.message : "Erreur serveur";
    return Response.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
