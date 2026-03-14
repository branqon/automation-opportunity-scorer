import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: "http://localhost:3000",
    headless: true,
  },
  webServer: {
    command: process.env.CI ? "npx serve out -l 3000" : "npm run build && npx serve out -l 3000",
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
