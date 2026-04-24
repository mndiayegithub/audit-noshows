import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * Regression guard (Phase 06) — the business rule is that `ca_perdu` /
 * `ca_perdu_an` is already annualized by n8n. The frontend must NEVER
 * multiply it by 12 or by `12 / nb_mois`. This test scans all files under
 * `components/audit/` and `app/audit/` for forbidden patterns.
 */

const FORBIDDEN = /ca_perdu[A-Za-z0-9_]*\s*\*\s*(12|\(\s*12\s*\/)/;

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) out.push(...walk(p));
    else if (p.endsWith(".tsx") || p.endsWith(".ts")) out.push(p);
  }
  return out;
}

describe("no-reannualization guard", () => {
  it("rejects `ca_perdu* * 12` or `* (12 /` in audit UI files", () => {
    const roots = ["components/audit", "app/audit"];
    const violations: Array<{ file: string; line: number; text: string }> = [];

    for (const root of roots) {
      for (const file of walk(root)) {
        const lines = readFileSync(file, "utf8").split("\n");
        lines.forEach((text, i) => {
          if (FORBIDDEN.test(text)) {
            violations.push({ file, line: i + 1, text: text.trim() });
          }
        });
      }
    }

    if (violations.length > 0) {
      const report = violations
        .map((v) => `  ${v.file}:${v.line} — ${v.text}`)
        .join("\n");
      throw new Error(
        `ca_perdu re-annualization detected — forbidden by business rule:\n${report}`
      );
    }
    expect(violations).toHaveLength(0);
  });

  it("the guard itself catches a planted violation (meta-test)", () => {
    const sample = "const x = stats.ca_perdu_an * 12;";
    expect(FORBIDDEN.test(sample)).toBe(true);
    const sample2 = "const y = ca_perdu_mois * (12 / nbMois);";
    expect(FORBIDDEN.test(sample2)).toBe(true);
    const safe = "const ca = stats.ca_perdu_an; // display as-is";
    expect(FORBIDDEN.test(safe)).toBe(false);
  });
});
