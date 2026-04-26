import { test, expect } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";

test.describe("Audit flow — golden path (REQ #6)", () => {
  test("upload Doctolib OK → preview → Continuer → rapport résultats", async ({ page }) => {
    const okBody = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, "fixtures/responses/audit-ok.json"),
        "utf-8",
      ),
    );

    await page.route("**/api/audit", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(okBody),
      });
    });

    await page.goto("/audit");

    await page.getByLabel(/nom du cabinet/i).fill("Cabinet Test");

    const csvPath = path.join(__dirname, "fixtures/csv/doctolib_6mois.csv");
    const fileChooserPromise = page.waitForEvent("filechooser");
    await page.getByLabel(/Zone de dépôt de fichier CSV/i).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(csvPath);

    await expect(
      page.getByText(/Vérifiez ce que nous avons compris/i),
    ).toBeVisible({ timeout: 5000 });

    const continuerBtn = page.getByRole("button", { name: /^continuer$/i });
    await expect(continuerBtn).toBeEnabled();
    await continuerBtn.click();

    await expect(page.getByText(/Cabinet Test/)).toBeVisible({
      timeout: 15000,
    });

    await expect(page.getByText(/Audit partiel/i)).toHaveCount(0);
  });
});
