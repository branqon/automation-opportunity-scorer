import { test, expect } from "@playwright/test";

test("loads score breakdown and metrics", async ({ page }) => {
  await page.goto("/");

  // Click first View link in the table
  await page.locator("table tbody tr").first().getByRole("link", { name: /view/i }).click();

  // Key metric cards — use exact text in paragraph elements
  await expect(page.getByText("Opportunity score", { exact: true })).toBeVisible();
  await expect(page.getByText("Monthly hours saved", { exact: true })).toBeVisible();
  await expect(page.getByText("Annual cost savings", { exact: true })).toBeVisible();

  // Score breakdown section — factor labels
  await expect(page.getByText("Monthly volume", { exact: true })).toBeVisible();
  await expect(page.getByText("Repeatability", { exact: true })).toBeVisible();
});

test("navigates between neighboring opportunities", async ({ page }) => {
  await page.goto("/");

  // Click first View link in the table
  await page.locator("table tbody tr").first().getByRole("link", { name: /view/i }).click();

  // Capture current page h1 text
  const firstName = await page.locator("h1").first().textContent();

  // Find the "Ranked lower" link — it's an <a> tag when a lower neighbor exists
  const rankedLowerLink = page.locator("a").filter({ has: page.getByText("Ranked lower") });
  if (await rankedLowerLink.count() > 0) {
    await rankedLowerLink.first().click();
    const secondName = await page.locator("h1").first().textContent();
    expect(secondName).not.toBe(firstName);
  }

  // Navigate back to dashboard via "Back to dashboard" link
  await page.getByRole("link", { name: /back to dashboard/i }).click();
  await expect(page.getByText("What should we automate next?")).toBeVisible();
});
