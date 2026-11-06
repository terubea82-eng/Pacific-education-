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


test("default PacEdu entry opens business Page 1, then Welcome Page 2 and Workspaces and Rules Page 3", async ({ page }) => {
  const publicEntryURL = new URL("./index.html", appURL).toString();
  await page.goto(publicEntryURL, { waitUntil: "domcontentloaded", timeout: 15000 });
  await page.waitForURL((url) => /\/src\/business-advertising\.html$/.test(url.pathname), { timeout: 15000 });
  await expect(page.getByRole("heading", { name: /Business & Product Advertising/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Global Business Registration & Product Video Ads/ })).toBeVisible();

  await page.getByRole("link", { name: /Next: Welcome/ }).click();
  await page.waitForURL((url) => /\/src\/index\.html$/.test(url.pathname) && url.searchParams.get("entry") === "welcome", { timeout: 15000 });
  await expect(page.locator("#pacificEducationWelcome")).toBeVisible();
  await expect(page.locator("#paceduWelcomeCountry")).toBeVisible();
  await expect(page.locator("#paceduWelcomeLanguage")).toBeVisible();

  await page.locator("#paceduWelcomeCountry").selectOption("Fiji|+679");
  await page.locator("#paceduWelcomeLanguage").selectOption({ label: "Urdu" });
  await expect.poll(() => page.evaluate(() => localStorage.getItem("pacificEducationRegistrationCountryCode"))).toBe("FJ");
  await expect.poll(() => page.evaluate(() => localStorage.getItem("pacificEducationRegistrationLanguage"))).toBe("ur");

  await page.locator("#welcomeNextButton").click();
  await expect(page.locator("#paceduPageRules")).toBeVisible();
  await expect(page.locator("#paceduPageRules")).toContainText("Workspaces and rules");

  await page.locator("#paceduRulesBack").click();
  await expect(page.locator("#pacificEducationWelcome")).toBeVisible();
  await expect(page.locator("#paceduWelcomeCountry")).toBeVisible();

  await page.locator("#welcomeNextButton").click();
  await expect(page.locator("#paceduPageRules")).toBeVisible();
  await page.locator("#paceduRulesAgreement").check();
  await page.locator("#paceduRulesContinue").click();
  await expect(page.locator("#pacificEducationIdentityRegistration")).toBeVisible();
  await expect(page.locator("#pacificEducationCountrySelect")).toHaveValue("FJ");
  await expect(page.locator("#pacificEducationLanguageSelect")).toHaveValue("ur");
  await expect(page.locator("#pacificEducationCountryStatus")).toContainText("Fiji");
  await expect(page.locator("#pacificEducationLanguageStatus")).toContainText("Urdu");
});
