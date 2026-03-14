import { expect, test } from "@playwright/test";

test("loads score breakdown and metrics", async ({ page }) => {
  await page.goto("/");
  await page.locator("table tbody tr").first().getByRole("link", { name: /view/i }).click();

  await expect(page.getByText("Opportunity score", { exact: true })).toBeVisible();
  await expect(page.getByText("Monthly hours saved", { exact: true })).toBeVisible();
  await expect(page.getByText("Annual cost savings", { exact: true })).toBeVisible();
  await expect(page.getByText("Monthly volume", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Repeatability", { exact: true }).first()).toBeVisible();
});

test("preserves active weight scenarios on detail pages", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /adjust weights/i }).click();
  await page.getByLabel("SLA risk importance").fill("20");
  await page.getByLabel("Volume importance").fill("1");

  const firstRow = page.locator("table tbody tr").first();
  const firstName = ((await firstRow.locator("td").nth(1).innerText()).split("\n")[0] ?? "").trim();
  const firstScore = (await firstRow.locator("td").nth(3).innerText()).trim();

  await firstRow.getByRole("link", { name: /view/i }).click();

  await expect(page.getByText("What-if scenario active")).toBeVisible();
  await expect(page.locator("h1").first()).toHaveText(firstName);
  await expect(page).toHaveURL(/w_slaRisk=20/);
  await expect(page).toHaveURL(/w_volume=1/);
  await expect(page.getByText("Opportunity score", { exact: true }).locator("..")).toContainText(firstScore);

  await page.getByRole("link", { name: /back to dashboard/i }).click();
  await expect(page).toHaveURL(/w_slaRisk=20/);
  await expect(page).toHaveURL(/w_volume=1/);
  await expect(page.locator("table tbody tr").first().locator("td").nth(1)).toContainText(firstName);
});

test("navigates between neighboring opportunities", async ({ page }) => {
  await page.goto("/");
  await page.locator("table tbody tr").first().getByRole("link", { name: /view/i }).click();

  const heading = page.locator("h1").first();
  const firstName = (await heading.textContent()) ?? "";
  const firstUrl = page.url();
  const rankedLowerLink = page.locator("a").filter({ has: page.getByText("Ranked lower") });

  if (await rankedLowerLink.count() > 0) {
    await rankedLowerLink.first().click();
    await expect(page).not.toHaveURL(firstUrl);
    await expect(heading).not.toHaveText(firstName);
  }

  await page.getByRole("link", { name: /back to dashboard/i }).click();
  await expect(page.getByText("What should we automate next?")).toBeVisible();
});
