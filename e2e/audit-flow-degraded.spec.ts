import { test, expect } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";

test.describe("Audit flow — mode dégradé (REQ #3 + #6)", () => {
  test("upload < 90 % reconnu → modal confirmation → bannière 'Audit partiel'", async ({
    page,
  }) => {
    const degradedBody = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, "fixtures/responses/audit-degraded.json"),
        "utf-8",
      ),
    );

    await page.route("**/api/audit", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(degradedBody),
      });
    });

    await page.goto("/audit");
    await page.getByLabel(/nom du cabinet/i).fill("Cabinet Dégradé");

    const csvPath = path.join(
      __dirname,
      "fixtures/csv/malformed_statuts_inconnus.csv",
    );
    const fileChooserPromise = page.waitForEvent("filechooser");
    await page.getByLabel(/Zone de dépôt de fichier CSV/i).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(csvPath);

    await expect(page.getByText(/Mode dégradé/i).first()).toBeVisible({
      timeout: 5000,
    });

    await page.getByRole("button", { name: /^continuer$/i }).click();

    await expect(
      page.getByText(/Données partiellement reconnues/i),
    ).toBeVisible();

    await page
      .getByRole("button", { name: /continuer en mode dégradé/i })
      .click();

    await expect(page.getByText(/Audit partiel/i)).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText(/72/).first()).toBeVisible();
  });
});
