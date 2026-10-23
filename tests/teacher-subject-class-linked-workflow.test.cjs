const { test, expect } = require("@playwright/test");

const baseURL = process.env.PACEDU_TEST_URL || "http://127.0.0.1:4173/src/index.html";

test("teacher subject selection shows every class and links the class to matching printable plans", async ({ page }) => {
  await page.goto(baseURL, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    document.body.innerHTML = '<main><section id="teacherDashboard"><div id="paceduTeacherSubjectGrid"></div><div id="paceduTeacherClassList"></div></section></main>';
    localStorage.clear();
    window.PacificEducationTeacherClassRosterContext = {
      getClasses() {
        return {
          englishClass: { className: "Class 1", level: "Class 1", subject: "English" },
          scienceClass: { className: "Class 2", level: "Class 2", subject: "Science" }
        };
      },
      setClassId(id) { window.__selectedTeacherClass = id; },
      getClassId() { return window.__selectedTeacherClass || ""; },
      getClass(id) {
        const all = this.getClasses();
        return all[id] || null;
      }
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
  await page.addScriptTag({ url: "./js/pacificEducationLinkedTeacherPlans.js?v=linked-workflow-test" });
  await page.addScriptTag({ url: "./js/pacificEducationTeacherDailyOnlyWorkspace.js?v=linked-workflow-test" });

  await page.getByRole("button", { name: "English", exact: true }).click();
  await expect(page.locator("#paceduTeacherClassList")).toContainText("Class 1");
  await expect(page.locator("#paceduTeacherClassList")).toContainText("Class 2");

  await page.getByRole("button", { name: "Science", exact: true }).click();
  await expect(page.locator("#paceduTeacherClassList")).toContainText("Class 1");
  await expect(page.locator("#paceduTeacherClassList")).toContainText("Class 2");
  await page.locator('[data-pacedu-teacher-class="scienceClass"]').click();

  await expect(page.locator("#paceduLinkedPlanStatus")).toContainText("Matching workplan and lesson plan ready");
  await expect(page.locator("#paceduLinkedPlanSubject")).toHaveValue("Science");
  await expect(page.locator("#paceduLinkedPlanLevel")).toHaveValue("Class 2");
  await expect(page.locator("#paceduLinkedDailyActivityColumn")).toContainText("Science worksheet for Class 2");
  await expect(page.locator("#paceduLinkedPlanPreview")).toContainText("Subject: Science");
  await expect(page.locator("#paceduLinkedPlanPreview")).toContainText("Class / level: Class 2");
  await expect(page.getByRole("button", { name: "Print / Save as PDF", exact: true })).toBeEnabled();
  await expect(page.getByRole("button", { name: "Download Plan (.txt)", exact: true })).toBeEnabled();
  expect(await page.evaluate(() => localStorage.getItem("pacificEducationSubject"))).toBe("Science");
  expect(await page.evaluate(() => localStorage.getItem("pacificEducationClassLevel"))).toBe("Class 2");
});
