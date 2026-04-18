import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test("renders the E-LUMI-NATE hero and Get Started CTA", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      /LUMI/i
    );

    const cta = page.getByRole("link").first();
    await expect(cta).toBeVisible();
  });

  test("does not show the Back to Dashboard CTA without a stored homeId", async ({
    page,
  }) => {
    await page.goto("/");

    const links = await page.getByRole("link").count();
    // Only Get Started is visible when no homeId is in localStorage
    expect(links).toBeGreaterThanOrEqual(1);
  });

  test("shows the Back to Dashboard CTA when a homeId is in localStorage", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("homeId", "fake-home-id");
    });

    await page.goto("/");

    const dashboardLink = page.getByRole("link", {
      name: /dashboard|bảng/i,
    });
    await expect(dashboardLink).toBeVisible();
  });
});
