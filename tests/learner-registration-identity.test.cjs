const { test, expect } = require("@playwright/test");

const baseURL = process.env.PACEDU_TEST_URL || "http://127.0.0.1:4173/src/index.html";

async function openStudentRegistration(page, countryCode) {
  await page.addInitScript(() => {
    try { sessionStorage.setItem("pacificEducationRulesAccepted", "yes"); } catch (_) {}
  });
  await page.goto(baseURL + "?entry=registration", { waitUntil: "domcontentloaded" });
  await page.addStyleTag({ content: "*,*::before,*::after{animation:none!important;transition:none!important}" });
  await expect(page.locator("#pacificEducationIdentityRegistration")).toBeVisible();
  await page.locator("#pacificEducationCountrySelect").selectOption(countryCode);
  await page.locator("#registrationNextButton").tap();
  await page.locator("#pacificEducationLanguageSelect").selectOption("en-AU");
  await page.locator("#registrationNextButton").tap();
  await page.locator('#pilotUserRoleCards .pe-user-role-card[data-role="Student"]').tap();
  await page.locator("#registrationNextButton").tap();
  await expect(page.locator("#pilotLearnerIdentityFields")).toBeVisible();
}

test("Fiji learner registration requires FEMIS ID or an explicit pending verification request", async ({ page }) => {
  await openStudentRegistration(page, "FJ");
  await page.locator("#pilotRegistrationName").fill("Fiji learner test");
  await expect(page.locator("#pilotLearnerOfficialId")).toBeRequired();
  await page.locator("#pilotRegistrationSaveButton").click();
  await expect(page.locator("#pilotRegistrationStatus")).toContainText(/requires the correct FEMIS registration ID/i);
  expect(await page.evaluate(() => sessionStorage.getItem("pacificEducationPilotRegistration"))).toBeNull();

  await page.locator("#pilotLearnerPendingVerification").check();
  await page.locator("#pilotRegistrationSaveButton").click();
  await expect(page.locator("#pilotRegistrationStatus")).toContainText(/pending authorized school verification/i);
  const record = await page.evaluate(() => JSON.parse(sessionStorage.getItem("pacificEducationPilotRegistration") || "null"));
  expect(record).toMatchObject({
    role: "Student",
    countryCode: "FJ",
    identityStatus: "pending-authorized-FEMIS-verification",
    identityPending: true,
    learnerIdStored: false
  });
  expect(record).not.toHaveProperty("learnerId");
  expect(record).not.toHaveProperty("femisId");
});

test("non-Fiji learner can use an official local ID or a pilot reference without a name", async ({ page }) => {
  await openStudentRegistration(page, "AU");
  await expect(page.locator("#pilotLearnerOfficialId")).not.toBeRequired();
  await page.locator("#pilotRegistrationSaveButton").click();
  const record = await page.evaluate(() => JSON.parse(sessionStorage.getItem("pacificEducationPilotRegistration") || "null"));
  expect(record).toMatchObject({
    name: "",
    role: "Student",
    countryCode: "AU",
    learnerIdStored: false
  });
  expect(record.learnerReference).toMatch(/^PILOT-LEARNER-/);
  expect(record).not.toHaveProperty("learnerId");
});
