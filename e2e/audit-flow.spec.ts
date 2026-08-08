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

  // Le formulaire (nom du cabinet, CA moyen) n'existe que dans l'état
  // "formulaire". Dès qu'un fichier est déposé, la Phase 7 bascule sur l'écran
  // d'aperçu CSV et le formulaire disparaît : on remplit donc AVANT le dépôt.
  await page.getByLabel(/nom du cabinet/i).fill("Cabinet Test");
  const caInput = page.locator('input[type="number"]').first();
  if (await caInput.count()) {
    await caInput.fill("80");
  }

  // Upload CSV. On alimente directement l'input caché plutôt que de passer par
  // l'événement "filechooser" : la zone de dépôt peut être recouverte en dev
  // par la barre d'outils Agentation, qui intercepte alors le clic.
  const csvPath = join(__dirname, "fixtures/sample.csv");
  await page.locator('input[type="file"]').setInputFiles(csvPath);

  // Écran d'aperçu introduit en Phase 7. « Continuer » reste désactivé si le
  // CSV est refusé — d'où une fixture d'au moins MIN_RDV_VALIDES (20) lignes.
  await expect(page.getByRole("heading", { name: /Vérifiez ce que nous avons compris/i })).toBeVisible();
  await page.getByRole("button", { name: /^continuer$/i }).click();

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

  // Score section visible. `.first()` obligatoire : « Score cabinet » apparaît
  // trois fois dans le dashboard v2 (barre latérale, en-tête de section,
  // ScoreHero), et le mode strict de Playwright échoue sur un locator ambigu.
  await expect(page.locator("text=Score cabinet").first()).toBeVisible();

  // Footer with privacy link
  await expect(page.getByRole("link", { name: /politique de confidentialit/i })).toBeVisible();
});
