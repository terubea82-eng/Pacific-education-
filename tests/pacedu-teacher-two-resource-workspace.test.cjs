const { test, expect } = require("@playwright/test");

const baseURL = process.env.PACEDU_TEST_URL || "http://127.0.0.1:4173/src/index.html";

test("teacher subject/class workspace offers only two resource types and safely checks reviewed evidence", async ({ page }) => {
  await page.goto(baseURL, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    document.body.innerHTML = '<main><section id="teacherDashboard"><div id="paceduTeacherSubjectGrid"><button data-pacedu-teacher-subject="English" aria-pressed="true">English</button></div><div id="paceduTeacherClassList"><button data-pacedu-teacher-class="class-a" aria-pressed="true">Class 1</button></div><section id="pacificEducationLinkedTeacherPlans"><button>Load Matching Plans</button><button>Print / Save as PDF</button><div id="paceduLinkedPlanStatus"></div></section></section></main>';
    localStorage.setItem("pacificEducationActivityResponses", JSON.stringify([
      { studentReference: "FEMIS-1", classId: "class-a", subject: "English", day: 2, markPercent: 75, reviewStatus: "teacher-reviewed" },
      { studentReference: "FEMIS-2", classId: "class-a", subject: "English", day: 2, markPercent: 10, reviewStatus: "pending-teacher-review" }
    ]));
    window.PacificEducationTeacherClassRosterContext = {
      getClass(id) { return id === "class-a" ? { level: "Class 1", studentRefs: ["FEMIS-1", "FEMIS-2"] } : null; }
    };
    window.PacEduDownloadableClassPacks = { download(options) { window.__downloadedAbility = options.ability; return { dailyActivities: 45 }; }, renderControls(holder) {
      const section = document.createElement("section");
      const h = document.createElement("h4"); h.textContent = "Download class activities and assessment pack";
      const p = document.createElement("p"); p.textContent = "Draft pack note";
      section.append(h, p); holder.appendChild(section);
    }};
  });
  await page.addScriptTag({ url: "./js/paceduTeacherTwoResourceWorkspace.js" });
  await page.evaluate(() => window.PacEduTeacherTwoResourceWorkspace.render());
  const panel = page.locator("#paceduTeacherTwoResourcePanel");
  await expect(panel.getByRole("heading", { name: "1. Teacher Instructions — Read or Print" })).toBeVisible();
  await expect(panel.getByRole("heading", { name: "2. Student Ability Worksheets — Download Separately" })).toBeVisible();
  await expect(panel).toContainText("FEMIS-1");
  await expect(panel).toContainText("provisional worksheet recommendation: Working at class goal");
  await expect(panel).toContainText("FEMIS-2");
  await expect(panel).toContainText("No reviewed mark found");
  expect(await page.evaluate(() => window.PacEduTeacherTwoResourceWorkspace.recommendedBand(39))).toBe("support");
  expect(await page.evaluate(() => window.PacEduTeacherTwoResourceWorkspace.recommendedBand(59))).toBe("developing");
  expect(await page.evaluate(() => window.PacEduTeacherTwoResourceWorkspace.recommendedBand(79))).toBe("expected");
  expect(await page.evaluate(() => window.PacEduTeacherTwoResourceWorkspace.recommendedBand(80))).toBe("extension");
  await expect(panel.getByRole("button", { name: "Download Working at class goal worksheets (1 learner(s))" })).toBeVisible();
  await panel.getByRole("button", { name: "Download Working at class goal worksheets (1 learner(s))" }).click();
  expect(await page.evaluate(() => window.__downloadedAbility)).toBe("expected");
});
