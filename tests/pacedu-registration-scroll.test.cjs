const { test, expect } = require("@playwright/test");

const baseURL = process.env.PACEDU_TEST_URL || "http://127.0.0.1:4173/src/index.html";

test("registration scrolling remains user-controlled when role cards receive focus", async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 360, height: 800 },
    isMobile: true,
    hasTouch: true
  });
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  await page.addInitScript(() => {
    try { sessionStorage.setItem("pacificEducationRulesAccepted", "yes"); } catch (_) {}
  });
  await page.goto(baseURL + "?entry=registration", { waitUntil: "domcontentloaded" });
  const registration = page.locator("#pacificEducationIdentityRegistration");
  await expect(registration).toBeVisible();

  // Allow the existing page scripts and MutationObservers to initialise.
  await page.waitForTimeout(900);
  const before = await page.evaluate(() => {
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const target = Math.round(maxScroll * 0.65);
    window.scrollTo(0, target);
    return { target, maxScroll };
  });
  await page.waitForTimeout(150);

  // Focus without browser-native scrolling. The step guide must not override
  // the user's position with its own scrollIntoView() on Registration.
  const teacher = page.locator("#pilotUserRoleCards .pe-user-role-card[data-role='Teacher']");
  await expect(teacher).toBeAttached();
  await teacher.evaluate(el => el.focus({ preventScroll: true }));
  await page.waitForTimeout(750);

  const after = await page.evaluate(() => window.scrollY);
  expect(Math.abs(after - before.target), "registration scroll position must remain user-controlled").toBeLessThanOrEqual(12);
  await expect(registration).toBeVisible();
  await context.close();
});
