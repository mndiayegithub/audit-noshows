/**
 * In-memory rate limiter (Phase 05 — RGPD & Sécurité).
 *
 * Adequate for single-region Vercel deployment at current volume. If the app
 * scales to multi-region or high traffic, swap the Map for Upstash/Vercel KV.
 *
 * Fail-open: if anything throws inside the check, allow the request — better
 * to accept a small amount of extra traffic than to 429 legitimate users when
 * the limiter is broken.
 */

export interface RateLimitOptions {
  max: number;
  windowMs: number;
  key: string;
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSec?: number;
}

interface Bucket {
  count: number;
  resetAt: number;
}

const store = new Map<string, Bucket>();

function getIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]?.trim() || "unknown";
  const real = request.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

export function checkRateLimit(request: Request, opts: RateLimitOptions): RateLimitResult {
  try {
    const ip = getIp(request);
    const key = `${opts.key}:${ip}`;
    const now = Date.now();
    const bucket = store.get(key);

    if (!bucket || now > bucket.resetAt) {
      store.set(key, { count: 1, resetAt: now + opts.windowMs });
      return { allowed: true };
    }
    if (bucket.count < opts.max) {
      bucket.count += 1;
      return { allowed: true };
    }
    return {
      allowed: false,
      retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  } catch {
    return { allowed: true };
  }
}
