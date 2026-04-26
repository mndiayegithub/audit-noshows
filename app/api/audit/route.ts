import {
  validateAuditPayload,
  evaluateRecognition,
} from "@/lib/audit-validation";
import { logServerError } from "@/lib/safe-log";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  normalizeN8nResponse,
  mapN8nErrorToCode,
} from "@/lib/n8n-normalize";
import type { AuditErrorPayload } from "@/types/audit-errors";

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
      // Phase 7 (REQ #2): branche structurée si error_code typé, sinon legacy.
      if ("error_code" in v) {
        const payload: AuditErrorPayload = {
          success: false,
          error_code: v.error_code,
          error: v.error,
          ...(v.details ? { details: v.details } : {}),
        };
        return Response.json(payload, { status: 400 });
      }
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

    const normalized = normalizeN8nResponse(raw);

    // Phase 7 — REQ #2 / #3 / #4 : interpréter la réponse normalisée.
    if (
      normalized &&
      typeof normalized === "object" &&
      !Array.isArray(normalized)
    ) {
      const obj = normalized as Record<string, unknown>;

      // Cas erreur n8n (success=false avec message technique) → mapper sur error_code typé.
      if (obj.success === false && typeof obj.error === "string") {
        const code = mapN8nErrorToCode(obj.error);
        const payload: AuditErrorPayload = {
          success: false,
          error_code: code,
          error: obj.error,
          details: { source: "n8n" },
        };
        return Response.json(payload, { status: 400 });
      }

      // Cas success: évaluer reco_rate / nb_rdv_valides si fournis par n8n (REQ #3 + #4).
      if (obj.success === true) {
        const recoRate =
          typeof obj.reco_rate === "number" ? (obj.reco_rate as number) : null;
        const nbValides =
          typeof obj.nb_rdv_valides === "number"
            ? (obj.nb_rdv_valides as number)
            : null;

        if (recoRate !== null && nbValides !== null) {
          const verdict = evaluateRecognition(recoRate, nbValides);
          if (verdict.outcome === "reject") {
            return Response.json(verdict.error, { status: 400 });
          }
          if (verdict.outcome === "degraded") {
            // Passthrough des champs dégradé fournis par n8n (sample_ignored, ignored_count).
            return Response.json({
              ...obj,
              degraded: true,
              reco_rate: verdict.reco_rate,
            });
          }
          // outcome === "ok" → passthrough standard.
        }
      }
    }

    return Response.json(normalized);
  } catch (error: unknown) {
    logServerError("api/audit", error);
    // Phase 7 — message FR clair, aucun leak (URL webhook, stack trace) côté client.
    const payload: AuditErrorPayload = {
      success: false,
      error_code: "EMPTY_AFTER_PARSING",
      error:
        "Le service d'audit est momentanément indisponible. Veuillez réessayer dans quelques minutes.",
      details: { source: "network" },
    };
    return Response.json(payload, { status: 502 });
  }
}
