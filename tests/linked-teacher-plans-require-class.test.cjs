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
  const level = page.locator("#paceduLinkedPlanLevel");
  const printButton = page.getByRole("button", { name: "Print / Save as PDF", exact: true });
  const downloadButton = page.getByRole("button", { name: "Download Plan (.txt)", exact: true });
  const loadButton = page.getByRole("button", { name: "Load Matching Plans", exact: true });

  await expect(status).toContainText("Select a class / level");
  await expect(content).not.toContainText("Test daily activity");
  await expect(content.locator("#paceduLinkedPlanPreview")).toHaveCount(0);
  await expect(level).toHaveCount(1);
  await expect(level).toHaveValue("");
  expect(await page.evaluate(() => window.__pacEduActivityCalls)).toBe(0);
  await expect(printButton).toBeDisabled();
  await expect(downloadButton).toBeDisabled();

  await level.selectOption("Class 4");
  await loadButton.click();

  await expect(status).toContainText("Matching workplan and lesson plan ready for Day 1");
  await expect(content).toContainText("Class / level: Class 4");
  await expect(content.locator("#paceduLinkedDailyActivityColumn")).toContainText("Student Daily Activity");
  await expect(content.locator("#paceduLinkedWorkplanColumn")).toContainText("Matching Teacher Workplan & Lesson Plan");
  await expect(content.locator("#paceduLinkedPlanPreview")).toContainText("PACEDU — LINKED TEACHER WORKPLAN & LESSON PLAN");
  expect(await page.evaluate(() => window.__pacEduActivityCalls)).toBe(1);
  await expect(printButton).toBeEnabled();
  await expect(downloadButton).toBeEnabled();
});
