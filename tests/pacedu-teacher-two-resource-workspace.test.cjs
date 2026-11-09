const { test, expect } = require("@playwright/test");

const baseURL = process.env.PACEDU_TEST_URL || "http://127.0.0.1:4173/src/index.html";

async function openIsolatedFixture(page) {
  await page.route("**/src/index.html*", route => route.fulfill({
    status: 200,
    contentType: "text/html; charset=utf-8",
    body: "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"></head><body></body></html>"
  }));
  await page.goto(baseURL, { waitUntil: "domcontentloaded" });
}

test("teacher subject/class workspace offers only two resource types and safely checks reviewed evidence", async ({ page }) => {
  await openIsolatedFixture(page);
  await page.evaluate(() => {
    document.body.className = ""; document.body.removeAttribute("data-pe-flow-step"); document.documentElement.removeAttribute("data-pacedu-entry-advanced");
    document.body.innerHTML = '<main><section id="teacherDashboard"><div id="paceduTeacherSubjectGrid"><button data-pacedu-teacher-subject="English" aria-pressed="true">English</button></div><div id="paceduTeacherClassList"><button data-pacedu-teacher-class="class-a" aria-pressed="true">Class 1</button></div><section id="pacificEducationLinkedTeacherPlans"><button>Load Matching Plans</button><button>Print / Save as PDF</button><div id="paceduLinkedPlanStatus"></div></section></section></main>';
    localStorage.setItem("pacificEducationActivityResponses", JSON.stringify([
      { studentReference: "FEMIS-1", classId: "class-a", subject: "English", day: 2, markPercent: 75, reviewStatus: "teacher-reviewed" },
      { studentReference: "FEMIS-2", classId: "class-a", subject: "English", day: 2, markPercent: 10, reviewStatus: "pending-teacher-review" },
      { studentReference: "FEMIS-3", classId: "class-a", subject: "English", day: 2, markPercent: 101, reviewStatus: "teacher-reviewed" }
    ]));
    window.PacificEducationTeacherClassRosterContext = {
      getClass(id) { return id === "class-a" ? { level: "Class 1", studentRefs: ["FEMIS-1", "FEMIS-2", "FEMIS-3"] } : null; }
    };
    window.PacEduDownloadableClassPacks = { download(options) { window.__downloadedAbility = options.ability; return { dailyActivities: 45 }; }, renderControls(holder) {
      const section = document.createElement("section");
      const h = document.createElement("h4"); h.textContent = "Download class activities and assessment pack";
      const p = document.createElement("p"); p.textContent = "Draft pack note";
      section.append(h, p); holder.appendChild(section);
    }};
  });
  await page.addScriptTag({ url: "./js/paceduTeachingAidQualityGate.js" });
  await page.addScriptTag({ url: "./js/paceduTeacherTwoResourceWorkspace.js" });
  await page.evaluate(() => window.PacEduTeacherTwoResourceWorkspace.render());
  const panel = page.locator("#paceduTeacherTwoResourcePanel");
  await expect(panel.getByRole("heading", { name: "1. Teacher Instructions — Read or Print", exact: true })).toBeVisible();
  await expect(panel.getByRole("heading", { name: "2. Daily Activities + Revision + Practice Exam — By Ability", exact: true })).toBeVisible();
  await expect(panel).toContainText("FEMIS-1");
  await expect(panel).toContainText("provisional worksheet recommendation: Silver");
  await expect(panel).toContainText("FEMIS-2");
  await expect(panel).toContainText("No reviewed mark found");
  await expect(panel).toContainText("FEMIS-3 — No reviewed mark found");
  expect(await page.evaluate(() => window.PacEduTeacherTwoResourceWorkspace.recommendedBand(39))).toBe("support");
  expect(await page.evaluate(() => window.PacEduTeacherTwoResourceWorkspace.recommendedBand(59))).toBe("developing");
  expect(await page.evaluate(() => window.PacEduTeacherTwoResourceWorkspace.recommendedBand(79))).toBe("expected");
  expect(await page.evaluate(() => window.PacEduTeacherTwoResourceWorkspace.recommendedBand(80))).toBe("extension");
  expect(await page.evaluate(() => window.PacEduTeacherTwoResourceWorkspace.recommendedBand(-1))).toBeNull();
  expect(await page.evaluate(() => window.PacEduTeacherTwoResourceWorkspace.recommendedBand(101))).toBeNull();
  await expect(panel.getByRole("button", { name: "Prepare Copper pack: daily activities + revision + mock exam (no reviewed marks yet)", exact: true })).toBeEnabled();
  await expect(panel.getByRole("button", { name: "Prepare Bronze pack: daily activities + revision + mock exam (no reviewed marks yet)", exact: true })).toBeEnabled();
  await expect(panel.getByRole("button", { name: "Prepare Silver pack: daily activities + revision + mock exam (1 reviewed learner(s))", exact: true })).toBeEnabled();
  await expect(panel.getByRole("button", { name: "Prepare Gold pack: daily activities + revision + mock exam (no reviewed marks yet)", exact: true })).toBeEnabled();
  await panel.getByRole("button", { name: "Prepare Silver pack: daily activities + revision + mock exam (1 reviewed learner(s))", exact: true }).click();
  expect(await page.evaluate(() => window.__downloadedAbility)).toBe("expected");

  await expect(panel.getByRole("heading", { name: "3. Teacher Resource & Teaching Aid Builder", exact: true })).toBeVisible();
  await panel.getByRole("button", { name: "Save teaching aid draft on this device" }).click();
  await expect(panel).toContainText("Complete these required resource fields first");
  expect(await page.evaluate(() => localStorage.getItem("paceduTeacherTeachingAidDraftsV1"))).toBeNull();

  await panel.getByLabel("Activity ID this resource belongs to").fill("EN-C1-T1-W1-D1");
  await panel.getByLabel("Teaching aid title").fill("Letter S teaching card");
  await panel.getByLabel("Verified achievement indicator / curriculum reference").fill("Teacher to verify official indicator reference");
  await panel.getByLabel("Learning objective and resource notes").fill("Identify the letter S and its sound.");
  await panel.getByLabel("Teacher instructions").fill("Model the letter S and its sound.");
  await panel.getByLabel("Student version / accessible description").fill("Large letter S card with a spoken description.");
  await panel.getByLabel("Source and licence / ownership").fill("Original PacEdu draft; teacher review required.");
  await panel.getByLabel("Accessibility and adaptation note").fill("Offer large print, screen-reader text and verbal description.");
  await panel.getByLabel("Large print").check();
  await panel.getByLabel("Screen-reader text").check();
  await panel.getByLabel("Verbal description").check();
  await panel.getByRole("button", { name: "Save teaching aid draft on this device" }).click();
  await expect(panel).toContainText("PENDING_TEACHER_REVIEW. It is not approved, uploaded or published.");
  await expect(panel).toContainText("Quality gate: PENDING_SOURCE");
  await expect(panel).toContainText("Verified pre-revision Fiji curriculum source");
  const savedAid = await page.evaluate(() => JSON.parse(localStorage.getItem("paceduTeacherTeachingAidDraftsV1") || "[]")[0]);
  expect(savedAid).toMatchObject({
    activityId: "EN-C1-T1-W1-D1",
    subject: "English",
    level: "Class 1",
    term: "T1",
    week: 1,
    day: 1,
    title: "Letter S teaching card",
    reviewStatus: "PENDING_TEACHER_REVIEW",
    curriculumVerification: "NOT_YET_MAPPED",
    qualityGateStatus: "PENDING_SOURCE",
    approved: false,
    published: false
  });
  expect(savedAid.accessibilityFormats).toEqual(["large-print", "screen-reader-text", "verbal-description"]);
});

test("all four ability packs remain available when no reviewed evidence exists", async ({ page }) => {
  await openIsolatedFixture(page);
  await page.evaluate(() => {
    document.body.className = ""; document.body.removeAttribute("data-pe-flow-step"); document.documentElement.removeAttribute("data-pacedu-entry-advanced");
    document.body.innerHTML = '<main><section id="teacherDashboard"><div id="paceduTeacherSubjectGrid"><button data-pacedu-teacher-subject="Science" aria-pressed="true">Science</button></div><div id="paceduTeacherClassList"><button data-pacedu-teacher-class="class-b" aria-pressed="true">Form 4</button></div><section id="pacificEducationLinkedTeacherPlans"><button>Load Matching Plans</button><button>Print / Save as PDF</button><div id="paceduLinkedPlanStatus"></div></section></section></main>';
    localStorage.setItem("pacificEducationActivityResponses", JSON.stringify([]));
    window.PacificEducationTeacherClassRosterContext = {
      getClass(id) { return id === "class-b" ? { level: "Form 4", studentRefs: ["FEMIS-9"] } : null; }
    };
    window.PacEduDownloadableClassPacks = { download(options) { window.__downloadedPack = options; return { dailyActivities: 25, missingSlots: 0 }; } };
  });
  await page.addScriptTag({ url: "./js/paceduFijiNineSubjectMapping.js" });
  await page.addScriptTag({ url: "./js/paceduTeacherTwoResourceWorkspace.js" });
  await page.evaluate(() => window.PacEduTeacherTwoResourceWorkspace.render());
  const panel = page.locator("#paceduTeacherTwoResourcePanel");
  await expect(panel.getByRole("heading", { name: /Basic Science — Form 4/ })).toBeVisible();
  const labels = [
    "Prepare Copper pack: daily activities + revision + mock exam (no reviewed marks yet)",
    "Prepare Bronze pack: daily activities + revision + mock exam (no reviewed marks yet)",
    "Prepare Silver pack: daily activities + revision + mock exam (no reviewed marks yet)",
    "Prepare Gold pack: daily activities + revision + mock exam (no reviewed marks yet)"
  ];
  for (const label of labels) await expect(panel.getByRole("button", { name: label, exact: true })).toBeEnabled();
  await panel.getByRole("button", { name: labels[0], exact: true }).click();
  expect(await page.evaluate(() => window.__downloadedPack)).toEqual({ level: "Form 4", subject: "Science", term: "T1", ability: "support" });
  await expect(panel).toContainText("Prepared 25 daily activities plus term revision practice and a mock practice examination");
});


test("unmapped senior Science cannot open generic worksheets or teaching-aid creation", async ({ page }) => {
  await openIsolatedFixture(page);
  await page.evaluate(() => {
    document.body.className = "";
    document.body.innerHTML = '<main><section id="teacherDashboard"><div id="paceduTeacherSubjectGrid"><button data-pacedu-teacher-subject="Science" aria-pressed="true">Science</button></div><div id="paceduTeacherClassList"><button data-pacedu-teacher-class="form-6" aria-pressed="true">Form 6</button></div><section id="pacificEducationLinkedTeacherPlans"><button>Load Matching Plans</button><div id="paceduLinkedPlanStatus"></div></section></section></main>';
    window.PacificEducationTeacherClassRosterContext = {
      getClass(id) { return id === "form-6" ? { level: "Form 6", studentRefs: [] } : null; }
    };
    window.PacEduDownloadableClassPacks = {
      resolveSubject() { return { available: true, note: "fixture resolver only" }; },
      download() { throw new Error("Generic senior Science pack must not be generated"); }
    };
  });
  await page.addScriptTag({ url: "./js/paceduFijiNineSubjectMapping.js" });
  await page.addScriptTag({ url: "./js/paceduTeacherTwoResourceWorkspace.js" });
  await page.evaluate(() => window.PacEduTeacherTwoResourceWorkspace.render());
  const panel = page.locator("#paceduTeacherTwoResourcePanel");
  await expect(panel.getByRole("heading", { name: /Senior Science — approved course required — Form 6/ })).toBeVisible();
  await expect(panel).toContainText("Teaching-aid creation is locked");
  await expect(panel.getByRole("button", { name: /Save teaching aid draft/ })).toHaveCount(0);
  await expect(panel.getByRole("button", { name: /Prepare .* pack/ })).toHaveCount(0);
});
