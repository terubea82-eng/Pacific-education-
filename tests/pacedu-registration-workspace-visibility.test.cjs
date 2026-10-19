const { test, expect } = require("@playwright/test");

const baseURL = process.env.PACEDU_TEST_URL || "http://127.0.0.1:4173/src/index.html";

test("direct Registration handoff releases startup guard and reveals the role workspace and App Menu", async ({ page }) => {
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
  await expect(page.locator("#peSequentialTitle")).toContainText("Teacher Workspace");
  await expect(page.locator("#teacherDashboard")).toBeVisible();
});

test("guided Rules to Registration save opens a visible role workspace and stays visible after startup recovery", async ({ page }) => {
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
  await expect(page.locator("#pacificEducationAppMenu")).toBeVisible();
  await expect(page.locator("#peSequentialBack")).toBeVisible();
  await expect(page.locator("#peSequentialNext")).toBeVisible();
  await page.waitForTimeout(1500);
  await expect(page.locator("#pacificEducationSequentialRoleWorkspace")).toBeVisible();
  await expect(page.locator("#pacificEducationIdentityRegistration")).toBeHidden();
  await expect(page.locator("#pacificEducationWelcome")).toBeHidden();
});


test("student registration always opens the visible Student Workspace home before class-level tools", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    class FakeUtterance { constructor(text) { this.text = text; this.lang = ""; this.rate = 1; this.volume = 1; this.voice = null; } }
    const synth = { speaking: false, pending: false, paused: false, cancel() {}, resume() {}, getVoices() { return []; }, speak() {} };
    Object.defineProperty(window, "SpeechSynthesisUtterance", { configurable: true, value: FakeUtterance });
    Object.defineProperty(window, "speechSynthesis", { configurable: true, value: synth });
  });
  await page.goto(baseURL, { waitUntil: "domcontentloaded" });
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
  await page.locator('#pilotUserRoleCards .pe-user-role-card[data-role="Student"]').click();
  await page.locator("#registrationNextButton").click();
  await page.locator("#pilotRegistrationName").fill("Student Workspace Visibility Test");
  await page.locator("#pilotRegistrationSaveButton").click();
  await expect(page.locator("#pilotRegistrationSaveButton")).toHaveText(/Registration Saved/);
  await page.locator("#registrationNextButton").click();

  const shell = page.locator("#pacificEducationSequentialRoleWorkspace");
  const home = page.locator("#peSequentialWorkspaceHome");
  await expect(shell).toBeVisible();
  await expect(shell).toHaveAttribute("data-pe-role", "student");
  await expect(page.locator("#peSequentialTitle")).toContainText("My Workspace");
  await expect(home).toBeVisible();
  await expect(home).toContainText("Student Sign In & My Class / Year Level");
  await expect(page.locator("#peStudentWorkspaceIdentity")).toBeVisible();
  await expect(page.locator("#peStudentWorkspaceClass")).toBeVisible();
  await expect(page.locator("#peSequentialNext")).toBeDisabled();

  await page.locator("#peStudentWorkspaceIdentity").fill("Student Workspace Visibility Test");
  await page.locator("#peStudentWorkspaceClass").selectOption("Class 8");
  await page.getByRole("button", { name: "Sign In to My Workspace" }).click();
  await expect(page.locator("#peSequentialNext")).toBeEnabled();
  await page.waitForTimeout(1200);
  await expect(shell).toBeVisible();
  await expect(home).toBeVisible();
  await expect(home).toContainText("Class 8");
});
