import { expect, test } from "@playwright/test";

test.describe("static HTML content (JS disabled)", () => {
  test.use({ javaScriptEnabled: false });

  test("dashboard renders content without JavaScript", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "What should we automate next?" })).toBeVisible();
    await expect(page.locator("table")).toHaveCount(1);
    await expect(page.locator("table").getByText("Password reset")).toBeVisible();
  });

  test("detail page renders content without JavaScript", async ({ page }) => {
    await page.goto("/opportunities/password-reset");

    await expect(page.locator("h1").first()).toHaveText("Password reset");
    await expect(page.getByText("Opportunity score", { exact: true })).toBeVisible();
    await expect(page.getByText("Score breakdown")).toBeVisible();
  });
});
