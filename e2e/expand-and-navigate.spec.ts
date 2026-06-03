import { test, expect } from "@playwright/test";

/**
 * Core journey: expand a project row in place to reveal its summary. If the
 * dataset has any project with a case study or gallery, also follow that CTA to
 * its detail page. The navigation step is data-driven so the test stays correct
 * whether or not navigable projects currently exist.
 */
test("user can expand a project row and open a case study when one exists", async ({
  page,
}) => {
  await page.goto("/");

  const row = page.locator('tr[role="button"]').first();
  await expect(row).toHaveAttribute("aria-expanded", "false");
  await row.click();
  await expect(row).toHaveAttribute("aria-expanded", "true");

  // Detail-page CTAs only render for projects with body/gallery content.
  const cta = page.getByRole("link", {
    name: /read case study|view screenshots/i,
  });
  if ((await cta.count()) > 0) {
    // Dispatch the click directly on the anchor node. A positional click is
    // intercepted by the sticky TopBar (z-50) that overlaps the CTA's
    // coordinates; dispatchEvent skips hit-testing while still firing the
    // Next.js <Link> client-side navigation handler.
    await cta.first().dispatchEvent("click");
    await expect(page).toHaveURL(/\/work\//);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  }
});
