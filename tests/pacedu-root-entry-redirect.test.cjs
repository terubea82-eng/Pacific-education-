const { test, expect } = require("@playwright/test");

const appURL = process.env.PACEDU_TEST_URL || "http://127.0.0.1:4173/src/index.html";
const rootURL = new URL("../index.html", appURL).toString();

test("repository root opens the Tech Edu landing page and provides a direct PacEdu route", async ({ page }) => {
  await page.goto(rootURL, { waitUntil: "domcontentloaded", timeout: 15000 });
  await page.waitForURL((url) => /\/tech-edu\.html$/.test(url.pathname), { timeout: 15000 });
  await expect(page).toHaveTitle(/Tech Edu/);
  await expect(page.getByRole("link", { name: /Get Started with Pacific Education/ })).toBeVisible();
  await expect(page.locator('a[href="./src/index.html"]').first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Pilot Privacy Policy/ })).toHaveAttribute("href", "./privacy-policy.html");
});
