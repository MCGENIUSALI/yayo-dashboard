import path from "node:path";
import { defineConfig, devices } from "@playwright/test";
import { E2E_DATABASE_URL, MAIL_DIR, STAFF_STATE } from "./e2e/env";

const PORT = Number(process.env.PORT ?? 3100);

/**
 * Interaction and authentication tests against the production build:
 * `npm run build && npm run test:e2e`. Needs a Postgres server
 * (TEST_DATABASE_ADMIN_URL, default postgres://postgres:postgres@localhost:5432/postgres):
 * a throwaway `yayo_e2e` database is recreated and seeded on each run.
 */
export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  globalSetup: "./e2e/global-setup.ts",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    // One simulated client IP per worker so per-IP rate limits do not leak between tests.
    extraHTTPHeaders: { "x-forwarded-for": `198.51.100.${Math.floor(Math.random() * 250) + 1}` },
    ...(process.env.PW_CHROMIUM_PATH ? { launchOptions: { executablePath: process.env.PW_CHROMIUM_PATH } } : {}),
  },
  projects: [
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    { name: "desktop", dependencies: ["setup"], testIgnore: /auth\//, use: { ...devices["Desktop Chrome"], viewport: { width: 1366, height: 860 }, storageState: STAFF_STATE } },
    { name: "mobile", dependencies: ["setup"], testIgnore: /auth\//, use: { ...devices["Pixel 7"], storageState: STAFF_STATE } },
    { name: "auth-desktop", testMatch: /auth\/.*\.spec\.ts/, use: { ...devices["Desktop Chrome"], viewport: { width: 1366, height: 860 } } },
    { name: "auth-mobile", testMatch: /auth\/ui\.spec\.ts/, use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}/connexion`,
    reuseExistingServer: false,
    timeout: 60_000,
    env: {
      APP_URL: `http://localhost:${PORT}`,
      DATABASE_URL: E2E_DATABASE_URL,
      AUTH_SECRET: "e2e-secret-e2e-secret-e2e-secret-e2e-secret",
      EMAIL_TRANSPORT: "file",
      EMAIL_FILE_DIR: MAIL_DIR,
      AUTH_PASSWORD_BREACH_CHECK: "off",
      AUTH_TRUST_PROXY: "1",
      // Fake client: the tests intercept the redirect to Google and never reach it.
      GOOGLE_CLIENT_ID: "e2e-client.apps.googleusercontent.com",
      GOOGLE_CLIENT_SECRET: "e2e-not-a-secret",
    },
  },
  outputDir: path.join("test-results"),
});
