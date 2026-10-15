const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync("src/js/pacificEducationRoleActivityPacks.js", "utf8");
const local = new Map();
const window = {
  localStorage: {
    getItem(key) { return local.has(key) ? local.get(key) : null; },
    setItem(key, value) { local.set(key, String(value)); }
  }
};
vm.runInNewContext(source, { window, document: {}, Date, Math, JSON, String, Object });

const packs = window.PacificEducationRoleActivityPacks;

test("Fiji Year 1 English daily activities follow the eight resource-topic sequence", () => {
  const expected = [
    "Who am I?", "My Friends", "My School", "Getting Ready for School",
    "A Rainy Day", "What I Do on a Rainy Day", "Preparing a Family Feast", "A Family Feast"
  ];
  expected.forEach((topic, index) => {
    const activity = packs.getStudentActivity(index + 1, { level: "Year 1", subject: "English" });
    assert.match(activity.title, new RegExp(topic.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.equal(activity.unit, index + 1);
    assert.equal(activity.verificationStatus, "REQUIRES_CURRENT_MINISTRY_VALIDATION");
    assert.match(activity.curriculumStatus, /current Ministry curriculum/i);
    assert.ok(activity.task.length > 25);
    assert.ok(activity.check.length > 10);
  });
});

test("Class 1 English uses Fiji resource-topic reference, not an official approval claim", () => {
  const activity = packs.getActivity("student", "dailyLesson", 9, { level: "Class 1", subject: "English" });
  assert.equal(activity.unit, 1);
  assert.match(activity.title, /Who am I\?/);
  assert.match(activity.source, /resource topics only/i);
  assert.match(activity.curriculumStatus, /validation still required/i);
});

test("other learner subjects get practical activities with teacher verification required", () => {
  for (const subject of ["Mathematics", "Phonics", "Science", "Social Science", "Health", "Agriculture", "Arts", "Technology"]) {
    const activity = packs.getActivity("student", "dailyLesson", 1, { level: "Class 4", subject });
    assert.ok(activity, subject + " activity should exist");
    assert.equal(activity.subject, subject);
    assert.equal(activity.verificationStatus, "PENDING_TEACHER_REVIEW");
    assert.match(activity.curriculumStatus, /PENDING TEACHER VERIFICATION/i);
    assert.ok(activity.task.length > 20);
  }
});

test("each configured non-learner workspace has a practical role-specific task", () => {
  const roles = [
    ["teacher", "teacherDashboard"], ["parent", "parentDashboard"],
    ["professional", "pacificEducationExternalReviewerPortal"],
    ["ngo", "pacificEducationWebsitePilotChecklist"],
    ["education", "pacificEducationCurriculumMasterControlStatus"],
    ["community", "pacificEducationWebsitePilotChecklist"],
    ["head-of-school", "pacificEducationTeacherClassRoster"],
    ["institution-admin", "pacificEducationInstitutionSetup"],
    ["special-education", "specialEducationDashboard"],
    ["owner", "pacificEducationPrivilegedAccessNotice"],
    ["technician", "pacificEducationPrivilegedAccessNotice"]
  ];
  for (const [role, step] of roles) {
    const activity = packs.getActivity(role, step, 1, {});
    assert.ok(activity, role + " should have an activity");
    assert.ok(activity.task.length > 30, role + " task should be actionable");
    assert.ok(activity.check.length > 15, role + " should ask for evidence");
    assert.ok(activity.verificationStatus.startsWith("PENDING_"), role + " must not imply approval");
  }
});

test("activities render only on their intended role step and never on unrelated pages", () => {
  assert.equal(packs.getActivity("teacher", "teacherDashboard", 1, {}).title, "Teacher Daily Planning & Review");
  assert.equal(packs.getActivity("teacher", "pacificEducationTeacherEvidence", 1, {}), null);
  assert.equal(packs.getActivity("student", "assessments", 1, {}), null);
  assert.equal(packs.getActivity("blind-learner", "dailyLesson", 1, {level:"Year 1",subject:"English"}).unit, 1);
  assert.equal(packs.getActivity("deaf-learner", "dailyLesson", 1, {level:"Year 1",subject:"English"}).unit, 1);
});
