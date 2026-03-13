import { test, expect } from "@playwright/test";

test("loads with summary cards and opportunity table", async ({ page }) => {
  await page.goto("/");

  // Summary cards — scope to paragraph elements to avoid strict mode violations
  await expect(page.getByRole("paragraph").filter({ hasText: /^Monthly hours saved$/ })).toBeVisible();
  await expect(page.getByRole("paragraph").filter({ hasText: /^Annual cost savings$/ })).toBeVisible();
  await expect(page.getByRole("paragraph").filter({ hasText: /^Quick wins$/ })).toBeVisible();
  await expect(page.getByRole("paragraph").filter({ hasText: /^Strategic bets$/ })).toBeVisible();

  // Table heading and a known opportunity
  await expect(page.getByText("Ranked opportunity table")).toBeVisible();
  await expect(page.locator("table").getByText("Password reset")).toBeVisible();
});

test("filters change displayed data", async ({ page }) => {
  await page.goto("/");

  // Select Security Ops team from the first select (Team)
  await page.locator("select").first().selectOption({ label: "Security Ops" });

  // MFA reset belongs to Security Ops — check the table
  await expect(page.locator("table").getByText("MFA reset")).toBeVisible();

  // Password reset belongs to Service Desk — should not be in the table
  await expect(page.locator("table").getByText("Password reset")).not.toBeVisible();
});

test("weight slider re-ranks opportunities", async ({ page }) => {
  await page.goto("/");

  // Open weight panel
  await page.getByRole("button", { name: /adjust weights/i }).click();
  await expect(page.getByText("What-if analysis")).toBeVisible();

  // Capture first row before adjusting
  const firstRow = page.locator("table tbody tr").first();
  const firstRankBefore = await firstRow.textContent();

  // Move SLA risk to 20 and Volume to 1 to shift ranking
  await page.getByLabel("SLA risk importance").fill("20");
  await page.getByLabel("Volume importance").fill("1");

  // Capture first row after adjusting
  const firstRankAfter = await firstRow.textContent();
  expect(firstRankAfter).not.toBe(firstRankBefore);

  // Reset to defaults button should now be visible
  await expect(page.getByRole("button", { name: /reset to defaults/i })).toBeVisible();

  // Click reset
  await page.getByRole("button", { name: /reset to defaults/i }).click();

  // Reset button should disappear
  await expect(page.getByRole("button", { name: /reset to defaults/i })).not.toBeVisible();

  // First row should be restored
  const firstRankRestored = await firstRow.textContent();
  expect(firstRankRestored).toBe(firstRankBefore);
});
