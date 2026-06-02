import { test, expect } from "@playwright/test";

/**
 * Core journey: toggle the theme (flips the `.dark` class on <html>) and switch
 * language without losing scroll position. The theme step runs first, on the
 * English page, because the toggle's accessible name is localized once on /nl.
 */
test("user can toggle theme and switch language preserving scroll", async ({
  page,
}) => {
  await page.goto("/");

  // Theme toggle flips the root `.dark` class.
  const toggle = page.getByRole("button", {
    name: /switch to (dark|light) mode/i,
  });
  const before = await page.evaluate(() =>
    document.documentElement.classList.contains("dark"),
  );
  await toggle.click();
  const after = await page.evaluate(() =>
    document.documentElement.classList.contains("dark"),
  );
  expect(after).not.toBe(before);

  // Language switch keeps the user roughly where they were (not reset to top).
  await page.evaluate(() => window.scrollTo(0, 400));
  await page.getByRole("button", { name: "Nederlands", exact: true }).click();
  await expect(page).toHaveURL(/:3000\/nl$/);
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(100);
});
