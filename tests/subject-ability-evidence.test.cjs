const { test, expect } = require("@playwright/test");

const baseURL = process.env.PACEDU_TEST_URL || "http://127.0.0.1:4173/src/index.html";

test("subject revision ability stays unassigned when reviewed evidence is insufficient", async ({ page }) => {
  await page.goto(baseURL, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem("pacificEducationRoleActivityEvidenceV1", "{}");
  });
  await page.addScriptTag({ url: "./js/pacificEducationRoleActivityPacks.js?v=subject-ability-evidence-test" });

  const result = await page.evaluate(() => {
    const context = { subject: "English", level: "Class 4", classReference: "class-4-a" };
    return {
      ability: window.PacificEducationRoleActivityPacks.getCurrentDemonstratedAbility(context),
      activity: window.PacificEducationRoleActivityPacks.getStudentActivity(5, context)
    };
  });
  expect(result.ability.status).toBe("INSUFFICIENT_EVIDENCE");
  expect(result.ability.level).toBe("Insufficient evidence");
  expect(result.activity.currentAbility).toBe("Insufficient evidence");
  expect(result.activity.abilityEvidenceStatus).toBe("INSUFFICIENT_EVIDENCE");
  expect(result.activity.id).toContain("ability-unassessed");
  expect(result.activity.promotionRule).toContain("Missing work");
});

test("subject revision ability requires repeated teacher-reviewed evidence for the same subject and class", async ({ page }) => {
  await page.goto(baseURL, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    const records = {};
    [
      ["eng-day-2", "Developing"],
      ["eng-day-3", "Developing"],
      ["eng-day-4", "Expected"]
    ].forEach(([activityId, ability], index) => {
      records["record-" + index] = {
        role: "student",
        activityId,
        subject: "English",
        level: "Class 4",
        classReference: "class-4-a",
        reviewStatus: "TEACHER_APPROVED",
        teacherReviewedAbility: ability,
        reviewedAt: "2026-10-" + String(20 + index).padStart(2, "0") + "T10:00:00.000Z"
      };
    });
    records["wrong-subject"] = {
      role: "student", activityId: "math-day-4", subject: "Mathematics", level: "Class 4",
      classReference: "class-4-a", reviewStatus: "TEACHER_APPROVED", teacherReviewedAbility: "Advanced",
      reviewedAt: "2026-10-23T10:00:00.000Z"
    };
    localStorage.setItem("pacificEducationRoleActivityEvidenceV1", JSON.stringify(records));
  });
  await page.addScriptTag({ url: "./js/pacificEducationRoleActivityPacks.js?v=subject-ability-evidence-test" });

  const result = await page.evaluate(() => {
    const context = { subject: "English", level: "Class 4", classReference: "class-4-a" };
    const ability = window.PacificEducationRoleActivityPacks.getCurrentDemonstratedAbility(context);
    const activity = window.PacificEducationRoleActivityPacks.getStudentActivity(5, context);
    return { ability, activity };
  });
  expect(result.ability.status).toBe("DEMONSTRATED");
  expect(result.ability.level).toBe("Developing");
  expect(result.ability.evidenceCount).toBe(2);
  expect(result.activity.currentAbility).toBe("Developing");
  expect(result.activity.task).toContain("Ability-level practice (Developing)");
});


test("subject ability evidence cannot be combined across different classes", async ({ page }) => {
  await page.goto(baseURL, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    const records = {
      "class-a-one": {
        role: "student", subject: "English", level: "Class 4", classReference: "class-4-a",
        reviewStatus: "TEACHER_APPROVED", teacherReviewedAbility: "Developing",
        reviewedAt: "2026-10-20T10:00:00.000Z"
      },
      "class-b-one": {
        role: "student", subject: "English", level: "Class 4", classReference: "class-4-b",
        reviewStatus: "TEACHER_APPROVED", teacherReviewedAbility: "Advanced",
        reviewedAt: "2026-10-21T10:00:00.000Z"
      },
      "class-b-two": {
        role: "student", subject: "English", level: "Class 4", classReference: "class-4-b",
        reviewStatus: "TEACHER_APPROVED", teacherReviewedAbility: "Advanced",
        reviewedAt: "2026-10-22T10:00:00.000Z"
      }
    };
    localStorage.setItem("pacificEducationRoleActivityEvidenceV1", JSON.stringify(records));
  });
  await page.addScriptTag({ url: "./js/pacificEducationRoleActivityPacks.js?v=class-isolation-test" });
  const result = await page.evaluate(() => ({
    classA: window.PacificEducationRoleActivityPacks.getCurrentDemonstratedAbility({
      subject: "English", level: "Class 4", classReference: "class-4-a"
    }),
    classB: window.PacificEducationRoleActivityPacks.getCurrentDemonstratedAbility({
      subject: "English", level: "Class 4", classReference: "class-4-b"
    })
  }));
  expect(result.classA.status).toBe("INSUFFICIENT_EVIDENCE");
  expect(result.classA.evidenceCount).toBe(1);
  expect(result.classB.status).toBe("DEMONSTRATED");
  expect(result.classB.level).toBe("Advanced");
  expect(result.classB.evidenceCount).toBe(2);
});

test("subject ability remains unassigned when class reference is missing", async ({ page }) => {
  await page.goto(baseURL, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    localStorage.setItem("pacificEducationRoleActivityEvidenceV1", JSON.stringify({
      "class-a-one": {
        role: "student", subject: "English", level: "Class 4", classReference: "class-4-a",
        reviewStatus: "TEACHER_APPROVED", teacherReviewedAbility: "Expected",
        reviewedAt: "2026-10-20T10:00:00.000Z"
      },
      "class-b-one": {
        role: "student", subject: "English", level: "Class 4", classReference: "class-4-b",
        reviewStatus: "TEACHER_APPROVED", teacherReviewedAbility: "Expected",
        reviewedAt: "2026-10-21T10:00:00.000Z"
      }
    }));
  });
  await page.addScriptTag({ url: "./js/pacificEducationRoleActivityPacks.js?v=missing-class-test" });
  const result = await page.evaluate(() =>
    window.PacificEducationRoleActivityPacks.getCurrentDemonstratedAbility({
      subject: "English", level: "Class 4"
    })
  );
  expect(result.status).toBe("INSUFFICIENT_EVIDENCE");
  expect(result.level).toBe("Insufficient evidence");
  expect(result.evidenceCount).toBe(0);
  expect(result.message).toContain("Select a class");
});
