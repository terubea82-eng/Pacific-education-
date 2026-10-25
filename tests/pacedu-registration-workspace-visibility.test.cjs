const { test, expect } = require("@playwright/test");

const baseURL = process.env.PACEDU_TEST_URL || "http://127.0.0.1:4173/src/index.html";

test("direct Registration handoff releases startup guard and keeps the role workspace uncluttered", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    try { sessionStorage.setItem("pacificEducationRulesAccepted", "yes"); } catch (_) {}
    class FakeUtterance { constructor(text) { this.text = text; this.lang = ""; this.rate = 1; this.volume = 1; this.voice = null; } }
    const synth = { speaking: false, pending: false, paused: false, cancel() {}, resume() {}, getVoices() { return []; }, speak() {} };
    Object.defineProperty(window, "SpeechSynthesisUtterance", { configurable: true, value: FakeUtterance });
    Object.defineProperty(window, "speechSynthesis", { configurable: true, value: synth });
  });
  await page.goto(baseURL + "?entry=registration", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#pacificEducationIdentityRegistration")).toBeVisible();
  await page.locator("#pacificEducationCountrySelect").selectOption("FJ");
  await page.locator("#registrationNextButton").click();
  await page.locator("#pacificEducationLanguageSelect").selectOption("en-AU");
  await page.locator("#registrationNextButton").click();
  await page.locator('#pilotUserRoleCards .pe-user-role-card[data-role="Teacher"]').click();
  await page.locator("#registrationNextButton").click();
  await page.locator("#pilotRegistrationName").fill("Visibility Guard Test");
  await page.locator("#pilotRegistrationSaveButton").click();
  await expect(page.locator("#pilotRegistrationSaveButton")).toHaveText(/Registration Saved/);
  await page.locator("#registrationNextButton").click();

  await expect(page.locator("#pacificEducationSequentialRoleWorkspace")).toBeVisible();
  await expect(page.locator("#pacificEducationSequentialRoleWorkspace")).toHaveAttribute("data-pe-role", "teacher");
  await expect(page.locator("html")).toHaveAttribute("data-pacedu-navigation-ready", "true");
  await expect(page.locator("html")).not.toHaveAttribute("data-pacedu-registration-entry");
  await expect(page.locator("#pacificEducationAppMenu")).toBeVisible();
  await expect(page.locator("#peSequentialBack")).toBeVisible();
  await expect(page.locator("#peSequentialNext")).toBeVisible();
  await expect(page.locator("#peSequentialTitle")).toContainText("My Workspace");
  await expect(page.locator("#peSequentialWorkspaceHome")).toBeVisible();
  await expect(page.locator("#peSequentialWorkspaceHome")).toContainText("Teacher");
  await page.locator("#peSequentialNext").click();
  await expect(page.locator("#peSequentialTitle")).toContainText("Teacher Daily Activities");
  await expect(page.locator("#teacherDashboard")).toBeVisible();
});

test("guided Rules to Registration opens the role workspace and keeps it visible after startup recovery", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    class FakeUtterance { constructor(text) { this.text = text; this.lang = ""; this.rate = 1; this.volume = 1; this.voice = null; } }
    const synth = { speaking: false, pending: false, paused: false, cancel() {}, resume() {}, getVoices() { return []; }, speak() {} };
    Object.defineProperty(window, "SpeechSynthesisUtterance", { configurable: true, value: FakeUtterance });
    Object.defineProperty(window, "speechSynthesis", { configurable: true, value: synth });
  });
  await page.goto(baseURL, { waitUntil: "load" });
  await expect(page.locator("#pacificEducationWelcome")).toBeVisible();
  await page.locator("#welcomeNextButton").click();
  await expect(page.locator("#paceduPageVision")).toBeVisible();
  await page.locator("#paceduVisionNext").click();
  await expect(page.locator("#paceduPageRules")).toBeVisible();
  await page.locator("#paceduRulesAgreement").check();
  await page.locator("#paceduRulesContinue").click();
  await expect(page.locator("#pacificEducationIdentityRegistration")).toBeVisible();

  await page.locator("#pacificEducationCountrySelect").selectOption("FJ");
  await page.locator("#registrationNextButton").click();
  await page.locator("#pacificEducationLanguageSelect").selectOption("en-AU");
  await page.locator("#registrationNextButton").click();
  await page.locator('#pilotUserRoleCards .pe-user-role-card[data-role="Teacher"]').click();
  await page.locator("#registrationNextButton").click();
  await page.locator("#pilotRegistrationName").fill("Guided Handoff Test");
  await page.locator("#pilotRegistrationSaveButton").click();
  await expect(page.locator("#pilotRegistrationSaveButton")).toHaveText(/Registration Saved/);
  await page.locator("#registrationNextButton").click();

  await expect(page.locator("#pacificEducationSequentialRoleWorkspace")).toBeVisible();
  await expect(page.locator("#pacificEducationSequentialRoleWorkspace")).toHaveAttribute("data-pe-role", "teacher");
  // Keep the main learner/teacher flow uncluttered; role navigation is provided by the sequential workspace.
  await expect(page.locator("#pacificEducationAppMenu")).toBeHidden();
  await expect(page.locator("#teacherDashboard")).toBeHidden();
  await expect(page.locator("#peSequentialBack")).toBeVisible();
  await expect(page.locator("#peSequentialNext")).toBeVisible();
  await page.locator("#peSequentialNext").click();
  await expect(page.locator("#peSequentialTitle")).toContainText("Teacher Daily Activities");
  await expect(page.locator("#teacherDashboard")).toBeVisible();
  await page.waitForTimeout(1500);
  await expect(page.locator("#pacificEducationSequentialRoleWorkspace")).toBeVisible();
  await expect(page.locator("#teacherDashboard")).toBeVisible();
  await expect(page.locator("#pacificEducationIdentityRegistration")).toBeHidden();
  await expect(page.locator("#pacificEducationWelcome")).toBeHidden();
});
