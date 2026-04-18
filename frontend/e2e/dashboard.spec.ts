import { test, expect } from "@playwright/test";

test.describe("Energy Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    // Stub backend API — tests do not require a running backend
    await page.route("**/api/energy/*/dashboard", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            totalMonthlyKwh: 320,
            totalMonthlyCost: 850000,
            evnTier: 4,
            topConsumers: [],
            roomStats: [],
            comparison: { previousKwh: 300, diffPercent: 6.7, trend: "up" },
            anomalies: [],
            co2: { monthlyKg: 292, annualKg: 3504, treesEquivalent: 175 },
            vampireData: { totalStandbyKwh: 0, totalStandbyCost: 0, appliances: [] },
          },
        }),
      });
    });

    await page.addInitScript(() => {
      window.localStorage.setItem("homeId", "fake-home-id");
    });
  });

  test("renders without crashing when a homeId exists", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.locator("body")).toBeVisible();
  });
});
