const { test, expect } = require("@playwright/test");

const baseURL = process.env.PACEDU_TEST_URL || "http://127.0.0.1:4173/src/index.html";

test("teacher subject selection shows every class and links the class to matching printable plans", async ({ page }) => {
  await page.goto(baseURL, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    document.body.innerHTML = '<main><section id="teacherDashboard"><section id="pacificEducationTeacherQuickAnswer"><input id="peQuickAnswerClass"><input id="peQuickAnswerSubject"><input id="peQuickAnswerTerm"><input id="peQuickAnswerDay"></section><section id="teacherPerformancePanel">Teacher Daily Activity & Performance</section><div id="paceduTeacherSubjectGrid" data-ready="true"></div><div id="paceduTeacherClassList"></div></section></main>';
    localStorage.clear();
    /* Simulate a stale "ready" grid whose buttons survived but whose class
       selector was replaced outside the subject grid by dashboard rendering. */
    const grid=document.getElementById("paceduTeacherSubjectGrid");
    grid.setAttribute("data-ready","true");
    ["English","Mathematics","Phonics","Science","Social Science","Health","Agriculture","Arts","Technology","Home Economics","Computer Studies","Vosa Vakaviti (iTaukei)","Fiji Hindi","Urdu","Rotuman"].forEach(subject=>{
      const button=document.createElement("button");
      button.setAttribute("data-pacedu-teacher-subject",subject);
      button.textContent=subject;
      grid.appendChild(button);
    });
    window.PacificEducationTeacherClassRosterContext = {
      getClasses() {
        return {
          englishClass: { className: "Class 1", level: "Class 1", subject: "English" },
          scienceClass: { className: "Class 2", level: "Class 2", subject: "English" },
          agricultureForm7Class: { className: "Form 7", level: "Form 7", subject: "Agriculture" }
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
  await page.addScriptTag({ url: "./js/paceduFijiNineSubjectMapping.js?v=linked-workflow-test" });
  await page.addScriptTag({ url: "./js/pacificEducationLinkedTeacherPlans.js?v=linked-workflow-test" });
  await page.addScriptTag({ url: "./js/paceduTeacherTwoResourceWorkspace.js?v=linked-workflow-test" });
  await page.addScriptTag({ url: "./js/pacificEducationTeacherDailyOnlyWorkspace.js?v=linked-workflow-test" });

  await expect(page.locator("#paceduTeacherDailyLearningOnlyShell")).toHaveAttribute("aria-label", "Student daily activities and matching workplans");
  await expect(page.locator("#paceduTeacherDailyLearningOnlyShell")).toContainText("My Teaching Workspace");
  await expect(page.locator("#paceduTeacherSubjectGrid button[data-pacedu-teacher-subject]")).toHaveCount(15);
  await expect(page.locator("#paceduTeacherSubjectGrid")).toContainText("Home Economics");
  await expect(page.locator("#paceduTeacherSubjectGrid")).toContainText("Rotuman");
  await expect(page.locator("#pacificEducationTeacherQuickAnswer")).toHaveCount(1);
  await expect(page.locator("#pacificEducationTeacherQuickAnswer")).toBeHidden();
  await expect(page.locator("#teacherPerformancePanel")).toHaveCount(0);

  await page.getByRole("button", { name: "Agriculture", exact: true }).click();
  await expect(page.locator("#paceduTeacherClassList")).toContainText("Form 7");
  await expect(page.locator("#paceduTeacherClassList")).not.toContainText("Form 1");
  await page.getByRole("button", { name: "Class 1", exact: true }).click();
  await expect(page.locator("#paceduTeacherSubjectMappingNotice")).toContainText("PARTIAL CONTENT");
  await expect(page.locator("#paceduTeacherSubjectMappingNotice")).toContainText("teacher review required");
  await expect(page.locator("#pacificEducationLinkedTeacherPlans")).toBeVisible();
  await expect(page.locator("#paceduTeacherTwoResourcePanel")).toBeVisible();
  await expect(page.locator("#paceduTeacherTwoResourcePanel")).toContainText("PENDING_TEACHER_REVIEW");

  await page.getByRole("button", { name: "English", exact: true }).click();
  await expect(page.locator("#paceduTeacherClassList")).toContainText("Class 1");
  await expect(page.locator("#paceduTeacherClassList")).toContainText("Class 2");

  await page.getByRole("button", { name: "Science", exact: true }).click();
  await expect(page.locator("#paceduTeacherClassList")).toContainText("Class 1");
  await expect(page.locator("#paceduTeacherClassList")).toContainText("Class 2");
  await page.locator('[data-pacedu-teacher-class="scienceClass"]').click();
  await expect(page.locator('#paceduTeacherSubjectGrid [data-pacedu-teacher-subject="Science"]')).toHaveText("Elementary Science");
  await expect(page.locator("#paceduTeacherClassList h3")).toHaveText("Elementary Science — Choose a Class");

  await expect(page.locator("#paceduTeacherTwoResourcePanel")).toContainText("Science — Class 2");
  await expect(page.locator("#paceduTeacherTwoResourcePanel")).toContainText("PENDING_TEACHER_REVIEW");
  await expect(page.locator("#pacificEducationTeacherQuickAnswer")).toBeVisible();
  await expect(page.locator("#paceduTeacherSubjectGrid .pacedu-teacher-subject-card #pacificEducationTeacherQuickAnswer")).toHaveCount(1);
  await expect(page.locator("#peQuickAnswerClass")).toHaveValue("scienceClass");
  await expect(page.locator("#peQuickAnswerSubject")).toHaveValue("Science");
  await expect(page.locator("#paceduTeacherTwoResourcePanel")).toContainText("Teacher Instructions");
  await expect(page.locator("#paceduTeacherTwoResourcePanel")).toContainText("Daily Activities + Revision + Practice Exam");
  await expect(page.getByRole("button", { name: "Print teacher instructions / Save as PDF", exact: true })).toBeEnabled();
  expect(await page.evaluate(() => localStorage.getItem("pacificEducationSubject"))).toBe("Science");
  expect(await page.evaluate(() => localStorage.getItem("pacificEducationClassLevel"))).toBe("Class 2");

  // Simulate the dashboard renderer replacing both controls after initial load.
  await page.evaluate(() => {
    const grid=document.getElementById("paceduTeacherSubjectGrid");
    const replacementGrid=Object.assign(document.createElement("div"),{id:"paceduTeacherSubjectGrid"});
    const replacementList=Object.assign(document.createElement("div"),{id:"paceduTeacherClassList"});
    replacementGrid.appendChild(replacementList);
    grid.replaceWith(replacementGrid);
  });
  await expect(page.locator("#paceduTeacherSubjectGrid [data-pacedu-teacher-subject]")).toHaveCount(15);
  await expect(page.locator("#paceduTeacherSubjectGrid #paceduTeacherClassList")).toHaveCount(1);
  await expect(page.locator("#paceduTeacherSubjectGrid #pacificEducationLinkedTeacherPlans")).toHaveCount(1);
  /* Recovery deliberately hides the old plan until the teacher reselects a class. */
  await expect(page.locator("#paceduLinkedPlanStatus")).toBeHidden();
  expect(await page.evaluate(() => {
    const grid=document.getElementById("paceduTeacherSubjectGrid");
    const list=document.getElementById("paceduTeacherClassList");
    const plans=document.getElementById("pacificEducationLinkedTeacherPlans");
    return !!(grid&&list&&plans&&grid.contains(list)&&grid.contains(plans));
  })).toBe(true);
  await page.getByRole("button", { name: "Science", exact: true }).click();
  await page.locator('[data-pacedu-teacher-class="scienceClass"]').click();
  await expect(page.locator("#paceduLinkedPlanStatus")).toBeVisible();
});
