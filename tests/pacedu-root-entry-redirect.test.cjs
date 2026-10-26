const { test, expect } = require("@playwright/test");

const appURL = process.env.PACEDU_TEST_URL || "http://127.0.0.1:4173/src/index.html";
const rootURL = new URL("../index.html", appURL).toString();

test("repository root redirects to the pilot workspace", async ({ page }) => {
  await page.goto(rootURL, { waitUntil: "domcontentloaded", timeout: 15000 });
  await page.waitForURL((url) => /\/src\/index\.html$/.test(url.pathname), { timeout: 15000 });
  await expect(page).toHaveTitle(/Pacific Education/);
});
