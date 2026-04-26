import { test, expect } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";

/**
 * REQ #4 + #6 — refus dur INSUFFICIENT_DATA.
 *
 * Note d'implémentation: la fixture `malformed_insufficient.csv` (catalogue Plan 07-07)
 * déclenche `willReject` côté client (nb_rdv_valides < MIN_RDV_VALIDES),
 * ce qui désactive le bouton "Continuer" — le path API n'est alors jamais atteint.
 * Ce spec teste donc le contrat API → CSVErrorCard en uploadant un CSV qui passe
 * la validation côté client (doctolib_6mois.csv) et en mockant /api/audit pour
 * renvoyer le payload INSUFFICIENT_DATA. C'est le scenario réaliste où le serveur
 * a une vue plus fine sur la validité des RDV (ex. dates aberrantes filtrées).
 */
test.describe("Audit flow — refus dur INSUFFICIENT_DATA (REQ #4 + #6)", () => {
  test("API renvoie INSUFFICIENT_DATA → CSVErrorCard avec hint 'Choisir un autre fichier'", async ({
    page,
  }) => {
    const rejectBody = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, "fixtures/responses/audit-reject.json"),
        "utf-8",
      ),
    );

    await page.route("**/api/audit", async (route) => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify(rejectBody),
      });
    });

    await page.goto("/audit");
    await page.getByLabel(/nom du cabinet/i).fill("Cabinet Refus");

    // Fixture client-side OK ; le rejet vient du mock API.
    const csvPath = path.join(__dirname, "fixtures/csv/doctolib_6mois.csv");
    const fileChooserPromise = page.waitForEvent("filechooser");
    await page.getByLabel(/Zone de dépôt de fichier CSV/i).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(csvPath);

    const continuerBtn = page.getByRole("button", { name: /^continuer$/i });
    await expect(continuerBtn).toBeEnabled({ timeout: 5000 });
    await continuerBtn.click();

    await expect(
      page.getByRole("heading", {
        name: /Données trop incomplètes pour produire un audit fiable/i,
      }),
    ).toBeVisible({ timeout: 15000 });

    await expect(
      page.getByRole("button", { name: /Choisir un autre fichier/i }),
    ).toBeVisible();
  });
});
