import { defineConfig, devices } from "@playwright/test";

/**
 * E2E config. Tests run against the production build (next start) so we exercise
 * the real built site, not dev mode. Chromium only — adding WebKit/Firefox
 * triples the run time and rarely catches new bugs at this scale.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // Invoke the Next binary directly: `pnpm start` trips pnpm's
    // verify-deps-before-run gate on this repo's ignored build scripts.
    command: "node_modules/.bin/next start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
