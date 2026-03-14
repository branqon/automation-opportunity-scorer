import { test as base, expect } from "@playwright/test";

/**
 * Extended test fixture that fails on React hydration errors.
 * Catches console errors containing hydration-related messages
 * so regressions don't silently pass in CI.
 */
export const test = base.extend<{ hydrationErrors: string[] }>({
  hydrationErrors: [
    async ({ page }, use) => {
      const errors: string[] = [];

      page.on("pageerror", (error) => {
        errors.push(error.message);
      });

      page.on("console", (msg) => {
        if (
          msg.type() === "error" &&
          (msg.text().includes("Hydration") ||
            msg.text().includes("hydrat") ||
            msg.text().includes("did not match") ||
            msg.text().includes("server-rendered"))
        ) {
          errors.push(msg.text());
        }
      });

      await use(errors);

      expect(
        errors,
        `React hydration errors detected:\n${errors.join("\n")}`,
      ).toHaveLength(0);
    },
    { auto: true },
  ],
});

export { expect } from "@playwright/test";
