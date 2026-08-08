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
    // Attendre l'hydratation avant de toucher à la zone de dépôt : le
    // gestionnaire onChange de react-dropzone n'est attaché qu'une fois React
    // monté. Sans cette attente, setInputFiles part dans le vide et la page
    // reste sur le formulaire, sans la moindre erreur.
    await page.waitForLoadState("networkidle");
    await page.getByLabel(/nom du cabinet/i).fill("Cabinet Dégradé");

    const csvPath = path.join(
      __dirname,
      "fixtures/csv/malformed_statuts_inconnus.csv",
    );
    // On alimente directement l'input caché plutôt que de cliquer la zone de
    // dépôt et d'attendre l'événement "filechooser" : en dev, la barre d'outils
    // Agentation se superpose à la page et intercepte le clic, si bien que la
    // boîte de dialogue ne s'ouvre jamais et que le test expire.
    //
    // Le dépôt est réessayé jusqu'à ce que l'aperçu apparaisse. Tant que React
    // n'a pas monté react-dropzone, l'événement `change` de l'input ne
    // déclenche aucun gestionnaire : le fichier part dans le vide, la page
    // reste sur le formulaire, et rien ne signale l'échec. `networkidle` ne
    // suffit pas à couvrir ce délai.
    // L'input est vidé avant chaque nouvelle tentative : reposer le MÊME
    // fichier sur un input déjà rempli n'émet aucun événement `change`, si
    // bien qu'une boucle de réessai naïve ne réessaie rien du tout.
    await expect(async () => {
      const input = page.locator('input[type="file"]');
      await input.setInputFiles([]);
      await input.setInputFiles(csvPath);
      await expect(page.getByText(/Mode dégradé/i).first()).toBeVisible({
        timeout: 2000,
      });
    }).toPass({ timeout: 20_000 });

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
