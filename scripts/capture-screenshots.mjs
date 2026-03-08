import { chromium } from "@playwright/test";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const screenshotDir = path.resolve(__dirname, "../docs/screenshots");

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

async function capture() {
  const browser = await chromium.launch();

  // Desktop: dashboard overview
  const desktopCtx = await browser.newContext({
    viewport: { width: 1440, height: 1700 },
    deviceScaleFactor: 2,
  });
  const dashboard = await desktopCtx.newPage();
  await dashboard.goto(BASE_URL, { waitUntil: "networkidle" });
  await dashboard.waitForTimeout(1000);
  await dashboard.screenshot({
    path: path.join(screenshotDir, "dashboard-overview.png"),
    fullPage: true,
  });
  console.log("captured dashboard-overview.png");

  // Desktop: opportunity detail (password-reset is rank #1)
  const detail = await desktopCtx.newPage();
  await detail.goto(`${BASE_URL}/opportunities/password-reset`, {
    waitUntil: "networkidle",
  });
  await detail.waitForTimeout(1000);
  await detail.screenshot({
    path: path.join(screenshotDir, "opportunity-detail.png"),
    fullPage: true,
  });
  console.log("captured opportunity-detail.png");

  // Desktop: score breakdown section (cropped from detail page)
  const scoreSection = detail.locator("text=Score breakdown").first();
  await scoreSection.scrollIntoViewIfNeeded();
  await detail.waitForTimeout(500);
  const scoreBounds = await scoreSection.evaluateHandle((el) => {
    const section = el.closest("section") || el.parentElement?.parentElement;
    return section;
  });
  const scoreElement = scoreBounds.asElement();
  if (scoreElement) {
    await scoreElement.screenshot({
      path: path.join(screenshotDir, "score-breakdown.png"),
    });
    console.log("captured score-breakdown.png");
  }
  await desktopCtx.close();

  // Mobile: dashboard
  const mobileCtx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  const mobile = await mobileCtx.newPage();
  await mobile.goto(BASE_URL, { waitUntil: "networkidle" });
  await mobile.waitForTimeout(1000);
  await mobile.screenshot({
    path: path.join(screenshotDir, "dashboard-mobile.png"),
    fullPage: true,
  });
  console.log("captured dashboard-mobile.png");
  await mobileCtx.close();

  await browser.close();
  console.log("done — all screenshots saved to docs/screenshots/");
}

capture().catch((err) => {
  console.error(err);
  process.exit(1);
});
