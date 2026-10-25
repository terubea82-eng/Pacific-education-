const { test, expect } = require("@playwright/test");

const baseURL = process.env.PACEDU_TEST_URL || "http://127.0.0.1:4173/src/index.html";

test("Student registration save and green Next open a visible workspace and daily activity", async ({ browser }) => {
  test.setTimeout(60000);
  const context = await browser.newContext({
    viewport: { width: 360, height: 800 },
    isMobile: true,
    hasTouch: true
  });
  const page = await context.newPage();
  const errors = [];
  page.setDefaultTimeout(8000);
  page.on("pageerror", error => errors.push(error.stack || error.message));

  await page.addInitScript(() => {
    try {
      sessionStorage.setItem("pacificEducationRulesAccepted", "yes");
      localStorage.setItem("pacificEducationPrototypeClassRosters", JSON.stringify({
        "TEST-CLASS-1": { classId: "TEST-CLASS-1", level: "Class 1", studentRefs: ["TEST-STUDENT-001"], prototype: true, productionEligible: false }
      }));
    } catch (_) {}
  });
  await page.goto(baseURL + "?entry=registration", { waitUntil: "domcontentloaded" });
  // Disable animation only in the test so touch targets remain stable.
  await page.addStyleTag({
    content: "*, *::before, *::after { animation:none!important; transition:none!important; scroll-behavior:auto!important; }"
  });

  const registration = page.locator("#pacificEducationIdentityRegistration");
  const next = page.locator("#registrationNextButton");
  await expect(registration).toBeVisible();

  // Reproduce the real sequence: country, language, Student, name, Save, green Next.
  await page.locator("#pacificEducationCountrySelect").selectOption("FJ");
  await next.tap();
  await expect(page.locator("#pacificEducationLanguageBox")).toBeVisible();

  await page.locator("#pacificEducationLanguageSelect").selectOption("en-AU");
  await next.tap();

  const student = page.locator('#pilotUserRoleCards .pe-user-role-card[data-role="Student"]');
  await expect(student).toBeVisible();
  await expect(student).toHaveCSS("pointer-events", "auto");
  await student.tap();
  await expect(student).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#pilotRoleRegistrationFields")).toBeVisible();
  await next.tap();

  await page.locator("#pilotRegistrationName").fill("Student Handoff Test");
  // The pilot has no authorized FEMIS verification service yet; explicitly request school verification.
  await page.locator("#pilotLearnerPendingVerification").check();
  await expect(next).toBeDisabled();
  await page.locator("#pilotRegistrationSaveButton").tap();

  // Save confirms the registration; it must not skip the user's explicit Next action.
  await expect(registration).toBeVisible();
  await expect(page.locator("#prototypeAccess")).toBeHidden();
  await expect(next).toContainText(/Open Student Workspace/i);
  await expect(next).toBeEnabled();

  const saved = await page.evaluate(() => ({
    registered: sessionStorage.getItem("pacificEducationPilotRegistered"),
    role: sessionStorage.getItem("pacificEducationPilotRole"),
    record: JSON.parse(sessionStorage.getItem("pacificEducationPilotRegistration") || "null")
  }));
  expect(saved.registered).toBe("true");
  expect(saved.role).toBe("Student");
  expect(saved.record).toMatchObject({ name: "Student Handoff Test", role: "Student", pilotOnly: true });

  // This is the reported failure point: saved confirmation, then green Next.
  await next.tap();
  const workspace = page.locator("#pacificEducationSequentialRoleWorkspace");
  await expect(workspace).toBeVisible();
  await expect(workspace).toHaveAttribute("data-pe-role", "student");
  await expect(page.locator("#peSequentialPage")).toBeVisible();
  await expect(page.locator("#peSequentialTitle")).toContainText("My Workspace");
  await expect(page.locator("#peSequentialNext")).toBeVisible();

  // Student workspace intentionally gates Next until the learner confirms a
  // display name and pilot class. Verify that visible gate, then continue.
  const entry = page.locator("#peStudentWorkspaceEntry");
  await expect(entry).toBeVisible();
  await expect(page.locator("#peStudentWorkspaceIdentity")).toBeVisible();
  await expect(page.locator("#peStudentWorkspaceClass")).toBeVisible();
  await expect(page.locator("#peStudentWorkspaceStudentReference")).toBeVisible();
  await expect(page.locator("#peSequentialNext")).toBeDisabled();
  await page.locator("#peStudentWorkspaceIdentity").fill("Student Handoff Test");
  await page.locator("#peStudentWorkspaceStudentReference").fill("TEST-STUDENT-001");
  await page.locator("#peStudentWorkspaceClass").selectOption("Class 1");
  await entry.locator("button:not(.pacific-voice-speaker)").click();
  await expect(page.locator("#peSequentialNext")).toBeEnabled();
  await expect(page.locator("[data-pe-student-context-banner]")).toContainText("Student Handoff Test");
  await expect(page.locator("[data-pe-student-context-banner]")).toContainText("Class 1");

  // The landing page must proceed to a real daily learning activity, not an empty shell.
  await page.locator("#peSequentialNext").tap();
  await expect(page.locator("#peSequentialTitle")).toContainText("Day 1 of 365");
  const activity = page.locator("#paceduRoleActivityPack, #peStudentDailyActivityStarter");
  await expect(activity).toBeVisible();
  await expect(activity).toContainText(/Learn|Learning goal|Daily Activities/i);
  await expect(page.locator("#peSequentialBack")).toBeVisible();
  await expect(page.locator("#peSequentialNext")).toBeVisible();

  await expect(registration).toBeHidden();
  expect(errors, "uncaught JavaScript errors during Student handoff").toEqual([]);
  await context.close();
});
