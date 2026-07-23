import { test, expect } from "@playwright/test";

/**
 * Landing-page smoke + performance-marker checks. Runs against BASE_URL
 * (local dev by default; set BASE_URL=https://caltodo.me to hit prod).
 *
 * This is the seed for the tracing setup requested during the first-render
 * perf investigation — extend with an authenticated /app/home trace once an
 * auth storageState exists (see playwright.config.ts).
 */
test.describe("landing", () => {
  test("renders hero + nav", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/caltodo/i);
    await expect(page.getByRole("link", { name: /open app/i })).toBeVisible();
  });

  test("captures navigation timing", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    const lcp = await page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            resolve(entries[entries.length - 1]?.startTime ?? 0);
          }).observe({ type: "largest-contentful-paint", buffered: true });
          // Fallback so the test never hangs if no LCP entry fires.
          setTimeout(() => resolve(0), 5000);
        }),
    );
    // Not an assertion gate (env-dependent) — logged for the trace workflow.
    console.log(`Landing LCP: ${Math.round(lcp)}ms`);
    expect(lcp).toBeGreaterThanOrEqual(0);
  });
});
