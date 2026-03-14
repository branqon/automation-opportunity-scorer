import { expect, test } from "@playwright/test";

test("loads with summary cards and opportunity table", async ({ page }) => {
  await page.goto("/");

  const metricLabel = (text: string) =>
    page.getByRole("paragraph").filter({ hasText: new RegExp(`^${text}$`) });

  await expect(metricLabel("Monthly hours saved")).toBeVisible();
  await expect(metricLabel("Annual cost savings")).toBeVisible();
  await expect(metricLabel("Quick wins")).toBeVisible();
  await expect(metricLabel("Strategic bets")).toBeVisible();

  await expect(page.getByText("Ranked opportunity table")).toBeVisible();
  await expect(page.locator("table").getByText("Password reset")).toBeVisible();
});

test("filters change displayed data", async ({ page }) => {
  await page.goto("/");

  await page.locator("select").first().selectOption({ label: "Security Ops" });

  await expect(page.locator("table").getByText("MFA reset")).toBeVisible();
  await expect(page.locator("table").getByText("Password reset")).not.toBeVisible();
});

test("weight slider re-ranks opportunities", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /adjust weights/i }).click();
  await expect(page.getByText("What-if analysis")).toBeVisible();

  const firstRow = page.locator("table tbody tr").first();
  const firstRankBefore = await firstRow.textContent();

  await page.getByLabel("SLA risk importance").fill("20");
  await page.getByLabel("Volume importance").fill("1");

  await expect(page).toHaveURL(/w_slaRisk=20/);
  await expect(page).toHaveURL(/w_volume=1/);
  await expect
    .poll(async () => await page.locator("table tbody tr").first().textContent())
    .not.toBe(firstRankBefore);

  await expect(page.getByRole("button", { name: /reset to defaults/i })).toBeVisible();

  await page.getByRole("button", { name: /reset to defaults/i }).click();

  await expect(page.getByRole("button", { name: /reset to defaults/i })).not.toBeVisible();
  await expect(page).not.toHaveURL(/w_slaRisk=20/);
  await expect(page).not.toHaveURL(/w_volume=1/);
  await expect
    .poll(async () => await page.locator("table tbody tr").first().textContent())
    .toBe(firstRankBefore);
});

test("dashboard reproduces shared weight scenarios from the URL", async ({ page }) => {
  await page.goto("/?w_slaRisk=20&w_volume=1");

  await page.getByRole("button", { name: /adjust weights/i }).click();
  await expect(page.getByRole("button", { name: /reset to defaults/i })).toBeVisible();
  await expect(page.getByLabel("SLA risk importance")).toHaveValue("20");
  await expect(page.getByLabel("Volume importance")).toHaveValue("1");
});
