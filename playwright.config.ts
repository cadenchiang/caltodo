import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for capturing performance traces + smoke E2E of the
 * deployed or local app.
 *
 * - `npm run e2e`   run the specs in ./e2e
 * - `npm run trace` run with full tracing, then `npx playwright show-trace`
 *
 * Set BASE_URL to point at production (https://caltodo.me) or a preview; it
 * defaults to a local dev server, which Playwright starts automatically.
 *
 * To trace the AUTHENTICATED home page, generate an auth storageState once
 * (`npx playwright codegen --save-storage=e2e/.auth/user.json <url>`), then
 * pass `storageState: "e2e/.auth/user.json"` to a project/test. The .auth
 * dir is gitignored.
 */
const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  // Only auto-start a dev server when pointing at localhost.
  webServer: BASE_URL.includes("localhost")
    ? {
        command: "npm run dev",
        url: BASE_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      }
    : undefined,
});
