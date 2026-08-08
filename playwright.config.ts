import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: "list",
  timeout: 120_000,
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
    navigationTimeout: 60_000,
    actionTimeout: 15_000,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    // En CI on sert le build de production : c'est ce que voit l'utilisateur,
    // c'est plus rapide qu'une compilation à la demande, et surtout la barre
    // d'outils Agentation ne s'y injecte pas (en dev elle se superpose à la
    // page et a déjà fait échouer un test en interceptant un clic).
    // Le job CI doit donc lancer `npm run build` avant `npm run test:e2e`.
    command: process.env.CI ? "npm run start" : "npm run dev",
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
