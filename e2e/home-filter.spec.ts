import { test, expect } from "@playwright/test";

/**
 * Core journey: land on the log, narrow it with a filter (URL reflects the
 * selection so it's shareable), then clear back to the full list.
 */
test("user can filter projects and see results update", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  // The desktop log rows are the only `tr[role=button]`; the mobile cards use a
  // different element, so this counts rows independent of viewport.
  const rows = page.locator('tr[role="button"]');
  const baseline = await rows.count();
  expect(baseline).toBeGreaterThan(0);

  await page.getByRole("button", { name: "Freelance", exact: true }).click();
  await expect(page).toHaveURL(/affiliation=freelance/);

  const filtered = await rows.count();
  expect(filtered).toBeGreaterThan(0);
  expect(filtered).toBeLessThanOrEqual(baseline);

  await page.getByRole("button", { name: /clear all/i }).click();
  await expect(page).toHaveURL(/:3000\/$/);
  expect(await rows.count()).toBe(baseline);
});
