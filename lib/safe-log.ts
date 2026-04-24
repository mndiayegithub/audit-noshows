/**
 * Redacting error logger (Phase 05 — RGPD).
 *
 * Replaces direct `console.error` of raw error objects in API routes to avoid
 * dumping emails, API keys, or long alphanumeric tokens into Vercel logs.
 */

const EMAIL_RE = /\S+@\S+\.\S+/g;
const LONG_TOKEN_RE = /\b[A-Za-z0-9_-]{20,}\b/g;
const MAX_MSG_LEN = 200;

function sanitize(msg: string): string {
  return msg
    .replace(EMAIL_RE, "[email]")
    .replace(LONG_TOKEN_RE, "[redacted]")
    .slice(0, MAX_MSG_LEN);
}

export function logServerError(context: string, err: unknown): void {
  let name = "Error";
  let message = "";
  if (err instanceof Error) {
    name = err.name || "Error";
    message = err.message || "";
  } else if (typeof err === "string") {
    message = err;
  } else {
    try {
      message = JSON.stringify(err);
    } catch {
      message = String(err);
    }
  }
  // eslint-disable-next-line no-console
  console.error(`[${context}] ${name}: ${sanitize(message)}`);
}
