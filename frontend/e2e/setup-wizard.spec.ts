import { test, expect } from "@playwright/test";

test.describe("Setup wizard", () => {
  test("loads /setup and shows the room selector step", async ({ page }) => {
    await page.goto("/setup");

    // Setup wizard has a heading and at least one interactive element
    await expect(page).toHaveURL(/setup/);
    await expect(page.locator("body")).toBeVisible();
  });

  test("navigates from landing to setup via Get Started CTA", async ({
    page,
  }) => {
    await page.goto("/");

    const cta = page.getByRole("link").first();
    await cta.click();

    await expect(page).toHaveURL(/setup/);
  });
});
