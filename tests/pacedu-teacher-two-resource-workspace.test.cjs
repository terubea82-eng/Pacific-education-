const { test, expect } = require("@playwright/test");

const baseURL = process.env.PACEDU_TEST_URL || "http://127.0.0.1:4173/src/index.html";

test("teacher subject/class workspace offers only two resource types and safely checks reviewed evidence", async ({ page }) => {
  await page.goto(baseURL, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    document.body.className = ""; document.body.removeAttribute("data-pe-flow-step"); document.documentElement.removeAttribute("data-pacedu-entry-advanced");
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
  await expect(panel.getByRole("heading", { name: "1. Teacher Instructions — Read or Print", exact: true })).toBeVisible();
  await expect(panel.getByRole("heading", { name: "2. Daily Activities + Revision + Practice Exam — By Ability", exact: true })).toBeVisible();
  await expect(panel).toContainText("FEMIS-1");
  await expect(panel).toContainText("provisional worksheet recommendation: Working at class goal");
  await expect(panel).toContainText("FEMIS-2");
  await expect(panel).toContainText("No reviewed mark found");
  expect(await page.evaluate(() => window.PacEduTeacherTwoResourceWorkspace.recommendedBand(39))).toBe("support");
  expect(await page.evaluate(() => window.PacEduTeacherTwoResourceWorkspace.recommendedBand(59))).toBe("developing");
  expect(await page.evaluate(() => window.PacEduTeacherTwoResourceWorkspace.recommendedBand(79))).toBe("expected");
  expect(await page.evaluate(() => window.PacEduTeacherTwoResourceWorkspace.recommendedBand(80))).toBe("extension");
  await expect(panel.getByRole("button", { name: "Prepare Supported start pack: daily activities + revision + mock exam (no reviewed marks yet)", exact: true })).toBeEnabled();
  await expect(panel.getByRole("button", { name: "Prepare Developing pack: daily activities + revision + mock exam (no reviewed marks yet)", exact: true })).toBeEnabled();
  await expect(panel.getByRole("button", { name: "Prepare Working at class goal pack: daily activities + revision + mock exam (1 reviewed learner(s))", exact: true })).toBeEnabled();
  await expect(panel.getByRole("button", { name: "Prepare Extension / deeper challenge pack: daily activities + revision + mock exam (no reviewed marks yet)", exact: true })).toBeEnabled();
  await panel.getByRole("button", { name: "Download Working at class goal worksheets (1 learner(s))", exact: true }).click();
  expect(await page.evaluate(() => window.__downloadedAbility)).toBe("expected");
});

test("all four ability packs remain available when no reviewed evidence exists", async ({ page }) => {
  await page.goto(baseURL, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    document.body.className = ""; document.body.removeAttribute("data-pe-flow-step"); document.documentElement.removeAttribute("data-pacedu-entry-advanced");
    document.body.innerHTML = '<main><section id="teacherDashboard"><div id="paceduTeacherSubjectGrid"><button data-pacedu-teacher-subject="Science" aria-pressed="true">Science</button></div><div id="paceduTeacherClassList"><button data-pacedu-teacher-class="class-b" aria-pressed="true">Form 4</button></div><section id="pacificEducationLinkedTeacherPlans"><button>Load Matching Plans</button><button>Print / Save as PDF</button><div id="paceduLinkedPlanStatus"></div></section></section></main>';
    localStorage.setItem("pacificEducationActivityResponses", JSON.stringify([]));
    window.PacificEducationTeacherClassRosterContext = {
      getClass(id) { return id === "class-b" ? { level: "Form 4", studentRefs: ["FEMIS-9"] } : null; }
    };
    window.PacEduDownloadableClassPacks = { download(options) { window.__downloadedPack = options; return { dailyActivities: 25, missingSlots: 0 }; } };
  });
  await page.addScriptTag({ url: "./js/paceduTeacherTwoResourceWorkspace.js" });
  await page.evaluate(() => window.PacEduTeacherTwoResourceWorkspace.render());
  const panel = page.locator("#paceduTeacherTwoResourcePanel");
  const labels = [
    "Prepare Supported start pack: daily activities + revision + mock exam (no reviewed marks yet)",
    "Prepare Developing pack: daily activities + revision + mock exam (no reviewed marks yet)",
    "Prepare Working at class goal pack: daily activities + revision + mock exam (no reviewed marks yet)",
    "Prepare Extension / deeper challenge pack: daily activities + revision + mock exam (no reviewed marks yet)"
  ];
  for (const label of labels) await expect(panel.getByRole("button", { name: label, exact: true })).toBeEnabled();
  await panel.getByRole("button", { name: labels[0], exact: true }).click();
  expect(await page.evaluate(() => window.__downloadedPack)).toEqual({ level: "Form 4", subject: "Science", term: "T1", ability: "support" });
  await expect(panel).toContainText("Prepared 25 daily activities plus term revision practice and a mock practice examination");
});
