import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { logServerError } from "@/lib/safe-log";

describe("logServerError", () => {
  let spy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    spy = vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    spy.mockRestore();
  });

  it("redacts email addresses", () => {
    logServerError("test", new Error("contact foo@bar.com for details"));
    const msg = String(spy.mock.calls[0]?.[0]);
    expect(msg).toContain("[email]");
    expect(msg).not.toContain("foo@bar.com");
  });

  it("redacts long alphanum tokens (≥20 chars)", () => {
    logServerError("test", new Error("key=AIzaSyABCDEFGHIJKLMNOPQRSTU invalid"));
    const msg = String(spy.mock.calls[0]?.[0]);
    expect(msg).toContain("[redacted]");
    expect(msg).not.toContain("AIzaSyABCDEFGHIJKLMNOPQRSTU");
  });

  it("includes context prefix", () => {
    logServerError("api/audit", new Error("oops"));
    expect(String(spy.mock.calls[0]?.[0])).toMatch(/^\[api\/audit\]/);
  });

  it("truncates messages > 200 chars", () => {
    const long = "x".repeat(500);
    logServerError("test", new Error(long));
    const msg = String(spy.mock.calls[0]?.[0]);
    expect(msg.length).toBeLessThan(260);
  });

  it("handles non-Error values", () => {
    logServerError("test", "plain string error");
    expect(spy).toHaveBeenCalledOnce();
    logServerError("test", { weird: "object" });
    expect(spy).toHaveBeenCalledTimes(2);
  });
});
