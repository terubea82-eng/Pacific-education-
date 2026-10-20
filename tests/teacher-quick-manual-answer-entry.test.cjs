const { test, expect } = require("@playwright/test");

const baseURL = process.env.PACEDU_TEST_URL || "http://127.0.0.1:4173/src/index.html";

test("teacher quick manual answer entry saves a pending response and clears fields for the next answer", async ({ page }) => {
  await page.goto(baseURL, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    document.body.innerHTML = '<main><section id="teacherDashboard"></section></main>';
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (_) {}
  });
  await page.addScriptTag({ url: "./js/pacificEducationTeacherQuickManualAnswer.js?v=20261021-quick-manual-answer-v1" });
  await page.evaluate(() => window.PacificEducationTeacherQuickAnswer.build());

  const panel = page.locator("#pacificEducationTeacherQuickAnswer");
  await expect(panel).toBeVisible();
  await panel.locator("#peQuickAnswerLearner").fill("Learner A");
  await panel.locator("#peQuickAnswerClass").fill("Class 4");
  await panel.locator("#peQuickAnswerSubject").fill("Mathematics");
  await panel.locator("#peQuickAnswerTerm").fill("Term 2");
  await panel.locator("#peQuickAnswerDay").fill("12");
  await panel.locator("#peQuickAnswerQuestion").fill("How many objects are in the group?");
  await panel.locator("#peQuickAnswerResponse").fill("Eight");

  await panel.getByRole("button", { name: "Save answer & next", exact: true }).click();

  await expect(panel.locator("#peQuickAnswerStatus")).toContainText("pending teacher review");
  await expect(panel.locator("#peQuickAnswerQuestion")).toHaveValue("");
  await expect(panel.locator("#peQuickAnswerResponse")).toHaveValue("");

  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("pacificEducationActivityResponses") || "[]"));
  expect(saved).toHaveLength(1);
  expect(saved[0]).toMatchObject({
    response: "Eight",
    questionText: "How many objects are in the group?",
    responseSource: "teacher-entered-on-behalf-of-learner",
    teacherEnteredAnswer: true,
    learnerNameOrReference: "Learner A",
    classId: "Class 4",
    subject: "Mathematics",
    term: "Term 2",
    day: 12,
    reviewStatus: "pending-teacher-review",
    productionEligible: false
  });
  expect(saved[0].originalResponse).toBe("");
});
