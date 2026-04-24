import { describe, it, expect, vi, afterEach } from "vitest";
import { checkRateLimit } from "@/lib/rate-limit";

function req(ip: string): Request {
  return new Request("http://localhost/x", {
    headers: { "x-forwarded-for": ip },
  });
}

afterEach(() => vi.useRealTimers());

describe("checkRateLimit", () => {
  it("allows the first request", () => {
    const r = checkRateLimit(req("1.1.1.1"), { max: 3, windowMs: 60_000, key: "k1" });
    expect(r.allowed).toBe(true);
  });

  it("blocks after max reached", () => {
    const key = "k-block";
    const ip = "2.2.2.2";
    for (let i = 0; i < 3; i++) {
      expect(checkRateLimit(req(ip), { max: 3, windowMs: 60_000, key }).allowed).toBe(true);
    }
    const blocked = checkRateLimit(req(ip), { max: 3, windowMs: 60_000, key });
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSec).toBeGreaterThan(0);
  });

  it("resets when window expires", () => {
    vi.useFakeTimers();
    const key = "k-reset";
    const ip = "3.3.3.3";
    checkRateLimit(req(ip), { max: 1, windowMs: 1000, key });
    expect(checkRateLimit(req(ip), { max: 1, windowMs: 1000, key }).allowed).toBe(false);
    vi.advanceTimersByTime(1500);
    expect(checkRateLimit(req(ip), { max: 1, windowMs: 1000, key }).allowed).toBe(true);
  });

  it("fail-open on malformed request (no IP header)", () => {
    const r = checkRateLimit(
      new Request("http://localhost/x"),
      { max: 1, windowMs: 60_000, key: "k-open" }
    );
    expect(r.allowed).toBe(true);
  });
});
