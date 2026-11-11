const { test, expect } = require("@playwright/test");

const baseURL = process.env.PACEDU_TEST_URL || "http://127.0.0.1:4173/src/index.html";

test("teacher quick manual answer entry saves a pending response and clears fields for the next answer", async ({ page }) => {
  await page.goto(baseURL, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    document.body.innerHTML = '<main><section id="teacherDashboard"></section></main>';
    try {
      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem("pacificEducationClassReference", "Class 4");
      localStorage.setItem("pacificEducationLevel", "Class 4");
      localStorage.setItem("pacificEducationClassLevel", "Class 4");
      localStorage.setItem("pacificEducationSubject", "Mathematics");
      localStorage.setItem("pacificEducationTerm", "Term 2");
      localStorage.setItem("currentDayNumber", "12");
    } catch (_) {}
  });
  await page.addScriptTag({ url: "./js/pacificEducationTeacherQuickManualAnswer.js?v=20261021-quick-manual-answer-v1" });
  await page.evaluate(() => window.PacificEducationTeacherQuickAnswer.build());

  const panel = page.locator("#pacificEducationTeacherQuickAnswer");
  await expect(panel).toBeVisible();
  await expect(panel.locator("#peQuickAnswerClass")).toHaveValue("Class 4");
  await expect(panel.locator("#peQuickAnswerSubject")).toHaveValue("Mathematics");
  await expect(panel.locator("#peQuickAnswerTerm")).toHaveValue("Term 2");
  await expect(panel.locator("#peQuickAnswerDay")).toHaveValue("12");
  await panel.locator("#peQuickAnswerLearner").fill("Learner A");
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

test("manual answer saves the latest subject and class after switching selections", async ({ page }) => {
  await page.goto(baseURL, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    document.body.innerHTML = '<main><section id="teacherDashboard"><div id="paceduTeacherSubjectGrid"></div><div id="paceduTeacherClassList"></div></section></main>';
    localStorage.clear();
    localStorage.setItem("pacificEducationTerm", "Term 2");
    localStorage.setItem("currentDayNumber", "12");
    window.PacificEducationTeacherClassRosterContext = {
      selected: "",
      getClasses() {
        return {
          scienceClass: { className: "Class 2", level: "Class 2", studentRefs: ["Learner A"] },
          englishClass: { className: "Class 1", level: "Class 1", studentRefs: ["Learner A"] }
        };
      },
      setClassId(id) { this.selected = id; },
      getClassId() { return this.selected; },
      getClass(id) { return this.getClasses()[id] || null; }
    };
    window.PacificEducationRoleActivityPacks = {
      getStudentActivity(day, context) {
        return {
          id: "activity-" + context.level + "-" + context.subject + "-" + day,
          title: context.subject + " worksheet for " + context.level,
          goal: "Demonstrate the selected learning objective",
          task: "Complete the selected class activity",
          check: "Explain the response",
          evidence: "Learner response",
          curriculumStatus: "PENDING_TEACHER_REVIEW"
        };
      }
    };
  });

  await page.addScriptTag({ url: "./js/paceduFijiNineSubjectMapping.js?v=answer-switch-test" });
  await page.addScriptTag({ url: "./js/pacificEducationLinkedTeacherPlans.js?v=answer-switch-test" });
  await page.addScriptTag({ url: "./js/paceduTeacherTwoResourceWorkspace.js?v=answer-switch-test" });
  await page.addScriptTag({ url: "./js/pacificEducationTeacherQuickManualAnswer.js?v=answer-switch-test" });
  await page.addScriptTag({ url: "./js/pacificEducationTeacherDailyOnlyWorkspace.js?v=answer-switch-test" });

  await page.getByRole("button", { name: "Science", exact: true }).click();
  await page.locator('[data-pacedu-teacher-class="scienceClass"]').click();
  const answerPanel = page.locator("#pacificEducationTeacherQuickAnswer");
  await expect(answerPanel).toBeVisible();
  await expect(page.locator("#peQuickAnswerClass")).toHaveValue("scienceClass");
  await expect(page.locator("#peQuickAnswerSubject")).toHaveValue("Science");

  await page.getByRole("button", { name: "English", exact: true }).click();
  await page.locator('[data-pacedu-teacher-class="englishClass"]').click();
  await expect(answerPanel).toBeVisible();
  await expect(page.locator("#peQuickAnswerClass")).toHaveValue("englishClass");
  await expect(page.locator("#peQuickAnswerSubject")).toHaveValue("English");

  await answerPanel.locator("#peQuickAnswerLearner").fill("Learner A");
  await answerPanel.locator("#peQuickAnswerQuestion").fill("Write one complete sentence.");
  await answerPanel.locator("#peQuickAnswerResponse").fill("The child reads a book.");
  await answerPanel.getByRole("button", { name: "Save answer & next", exact: true }).click();

  await expect(answerPanel.locator("#peQuickAnswerStatus")).toContainText("pending teacher review");
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("pacificEducationActivityResponses") || "[]"));
  expect(saved).toHaveLength(1);
  expect(saved[0]).toMatchObject({
    learnerNameOrReference: "Learner A",
    classId: "englishClass",
    classLevel: "Class 1",
    subject: "English",
    term: "Term 2",
    day: 12,
    reviewStatus: "pending-teacher-review",
    productionEligible: false
  });
  expect(saved[0].curriculumContext).toMatchObject({
    classId: "englishClass",
    level: "Class 1",
    subjectId: "English",
    term: "Term 2",
    dayNumber: 12
  });
  expect(saved[0].assignmentStatus).toBe("verified-roster-match");
});
