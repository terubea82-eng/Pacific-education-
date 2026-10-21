const { test, expect } = require("@playwright/test");

const baseURL = process.env.PACEDU_TEST_URL || "http://127.0.0.1:4173/src/index.html";

test("linked teacher plans require an explicit class before generating a plan", async ({ page }) => {
  await page.goto(baseURL, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    document.body.innerHTML = '<main><section id="teacherDashboard"></section></main>';
    localStorage.clear();
    sessionStorage.clear();
    window.__pacEduActivityCalls = 0;
    window.PacificEducationRoleActivityPacks = {
      getStudentActivity(day, context) {
        window.__pacEduActivityCalls += 1;
        return {
          id: "test-day-" + day,
          title: "Test daily activity",
          goal: "Demonstrate understanding",
          task: "Complete one practical task",
          check: "Explain the answer",
          evidence: "Learner response",
          curriculumStatus: "Pending teacher verification"
        };
      }
    };
  });
  await page.addScriptTag({ url: "./js/pacificEducationLinkedTeacherPlans.js?v=class-required-test" });

  const status = page.locator("#paceduLinkedPlanStatus");
  const content = page.locator("#paceduLinkedPlanContent");
  await expect(status).toContainText("Select a class / level");
  await expect(content).toBeEmpty();
  expect(await page.evaluate(() => window.__pacEduActivityCalls)).toBe(0);
  await expect(page.locator("#paceduLinkedPlanLevel")).toHaveCount(0);

  const level = page.locator("#paceduLinkedPlanLevel");
  await level.selectOption("Class 4");
  await page.getByRole("button", { name: "Load Matching Plans" }).click();

  await expect(status).toContainText("Matching workplan and lesson plan ready for Day 1");
  await expect(content).toContainText("Class / level: Class 4");
  expect(await page.evaluate(() => window.__pacEduActivityCalls)).toBe(1);
});
