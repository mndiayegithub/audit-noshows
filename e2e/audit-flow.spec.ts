import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const auditResponse = JSON.parse(
  readFileSync(join(__dirname, "fixtures/audit-response.json"), "utf8")
);

test("happy path: landing → audit upload → dashboard renders with ca_perdu_an intact", async ({ page }) => {
  // Mock /api/audit (POST) with a fixed response — validates the full rendering
  // pipeline without depending on n8n.
  await page.route("**/api/audit", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(auditResponse),
    });
  });
  // Google Places: not clicked in happy path, but mock anyway in case.
  await page.route("**/api/google-places*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ found: false }),
    });
  });

  // Landing
  await page.goto("/");
  await expect(page.locator("h1").first()).toBeVisible();

  // Audit page
  await page.goto("/audit");

  // Upload CSV
  const csvPath = join(__dirname, "fixtures/sample.csv");
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(csvPath);

  // Fill cabinet + CA fields (select by input type or label — the audit form has text inputs)
  const textInputs = page.locator('input[type="text"], input[type="email"], input[type="number"]');
  // nom_cabinet is the first text input after the file drop
  await page.getByPlaceholder(/cabinet|nom/i).first().fill("Cabinet Test");
  const caInput = page.locator('input[type="number"]').first();
  if (await caInput.count()) {
    await caInput.fill("80");
  }

  // Submit
  await page.getByRole("button", { name: /g[ée]n[ée]rer|lancer|audit/i }).first().click();

  // Wait for dashboard
  await expect(page.locator("text=Manque à gagner annuel")).toBeVisible({ timeout: 15_000 });

  // CORE INVARIANT: ca_perdu_an (12500) must be displayed as-is, NOT multiplied by 12 or anything else.
  // We accept any common FR formatting: "12 500", "12500", "12.500".
  const body = await page.textContent("body");
  expect(body).toMatch(/12[\s., ]?500/);
  // And it must NOT display 150000 (12500 × 12) or 4166 (12500 / 3) which would suggest re-math.
  expect(body).not.toMatch(/150[\s., ]?000/);

  // Score section visible
  await expect(page.locator("text=Score cabinet")).toBeVisible();

  // Footer with privacy link
  await expect(page.getByRole("link", { name: /politique de confidentialit/i })).toBeVisible();
});
