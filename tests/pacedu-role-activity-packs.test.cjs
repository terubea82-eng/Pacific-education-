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

test("approved learner workspace exposes the five-step see-read-hear lesson and uses PacEdu's protected narrator", () => {
  const renderer = fs.readFileSync("src/js/pacificEducationRoleActivityPacks.js", "utf8");
  const sequential = fs.readFileSync("src/js/pacificEducationSequentialRoleWorkspaces.js", "utf8");
  assert.match(renderer, /if \(learnerRole && global\.PacEduDailyWorksheetContent/);
  assert.match(renderer, /getCurriculumWorksheet/);
  assert.match(renderer, /see|read|hear/i);
  assert.match(renderer, /audioNarration\.transcript/);
  assert.match(renderer, /global\.PacificEducationSpeech\.speakText/);
  assert.match(renderer, /global\.PacificEducationSpeech\.stopSpeech/);
  assert.match(renderer, /verificationStatus/);
  assert.match(sequential, /isTeacherApprovedForStudent/);
  assert.match(renderer, /official achievement indicator: not yet mapped/i);
});

test("unsupported learner subjects are not silently shown English content", () => {
  const renderer = fs.readFileSync("src/js/pacificEducationRoleActivityPacks.js", "utf8");
  assert.match(renderer, /lessonSubjectAliases/);
  assert.match(renderer, /if \(global\.PacEduDailyWorksheetContent\.subjects\.indexOf\(lessonSubject\) < 0\) lessonSubject = ""/);
  assert.match(renderer, /PacEdu will not substitute an English lesson/);
});

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

test("all 365 student days provide a structured, meaningful five-step learning cycle", () => {
  const expectedStages = [
    "Learn and notice", "Guided practice", "Independent practice",
    "Apply learning", "Review and reflect"
  ];
  const ids = new Set();
  for (let day = 1; day <= 365; day += 1) {
    const activity = packs.getStudentActivity(day, { level: "Class 4", subject: "Mathematics" });
    assert.equal(activity.day, day);
    assert.equal(activity.learningStage, expectedStages[(day - 1) % 5]);
    assert.equal(activity.learningStageNumber, ((day - 1) % 5) + 1);
    assert.equal(activity.learningCycle, Math.floor((day - 1) / 5) + 1);
    assert.match(activity.title, new RegExp("Day " + day + " of 365"));
    for (const field of ["goal", "task", "check", "practicePrompt", "successCriteria", "reflectionPrompt", "accessibilityOptions", "evidence", "daySequenceNote"]) {
      assert.ok(typeof activity[field] === "string" && activity[field].trim().length > 10, "Day " + day + " must include " + field);
    }
    assert.match(activity.accessibilityOptions, /sign|screen reader/i);
    assert.match(activity.daySequenceNote, /does not claim 365 separately ministry-authored lessons/i);
    ids.add(activity.id);
  }
  assert.equal(ids.size, 365, "each day must have its own progress/evidence identity");
  const last = packs.getStudentActivity(365, { level: "Class 4", subject: "Mathematics" });
  assert.equal(last.learningStage, "Review and reflect");
  assert.equal(last.learningCycle, 73);
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

test("Class 1 English Day 2 contains a targeted lesson and worksheet", () => {
  const activity = packs.getStudentActivity(2, { level: "Class 1", subject: "English" });
  assert.match(activity.title, /Greetings and Introducing Myself/);
  assert.match(activity.task, /Connect to Day 1/);
  assert.match(activity.task, /Student worksheet/);
  assert.match(activity.task, /DIFFERENTIATION/);
  assert.match(activity.check, /not yet demonstrated/);
  assert.equal(activity.verificationStatus, "PENDING_TEACHER_REVIEW");
  assert.match(activity.curriculumStatus, /not a claim of Ministry approval/i);
});

test("student activity links a matching distributed achievement indicator without claiming approval", () => {
  const original = window.PacificEducationAchievementDistributionEngine;
  window.PacificEducationAchievementDistributionEngine = {
    buildDailyIndicatorPlan(filters) {
      assert.equal(filters.dayNumber, 2);
      return { success: true, assignment: {
        classId: "CLASS-1-A", level: "Class 1", subjectId: "English", term: "Term 1",
        indicatorId: "C1-ENG-P-002", indicatorText: "Respond to a short spoken message.",
        strand: "Speaking and Listening", sourceStatus: "unverified", productionEligible: false
      } };
    }
  };
  try {
    const activity = packs.getStudentActivity(2, {
      level: "Class 1", subject: "English", term: "Term 1", classReference: "CLASS-1-A"
    });
    assert.equal(activity.indicatorId, "C1-ENG-P-002");
    assert.equal(activity.achievementIndicator, "Respond to a short spoken message.");
    assert.equal(activity.indicatorSourceStatus, "unverified");
    assert.equal(activity.indicatorVerificationStatus, "PENDING_TEACHER_REVIEW");
    assert.equal(activity.indicatorProductionEligible, false);
    assert.match(activity.curriculumStatus, /verify the source/i);
  } finally {
    if (original === undefined) delete window.PacificEducationAchievementDistributionEngine;
    else window.PacificEducationAchievementDistributionEngine = original;
  }
});

test("student activity refuses a distributed indicator for a different class", () => {
  const original = window.PacificEducationAchievementDistributionEngine;
  window.PacificEducationAchievementDistributionEngine = {
    buildDailyIndicatorPlan() { return { assignment: {
      classId: "OTHER-CLASS", level: "Class 1", subjectId: "English", term: "Term 1",
      indicatorId: "WRONG-CLASS", indicatorText: "Must not leak across classes.", sourceStatus: "verified"
    } }; }
  };
  try {
    const activity = packs.getStudentActivity(1, {
      level: "Class 1", subject: "English", term: "Term 1", classReference: "CLASS-1-A"
    });
    assert.equal(activity.indicatorId, undefined);
    assert.equal(activity.achievementIndicator, undefined);
  } finally {
    if (original === undefined) delete window.PacificEducationAchievementDistributionEngine;
    else window.PacificEducationAchievementDistributionEngine = original;
  }
});

test("saved learner work carries dated assignment context into the teacher review queue without storing an unverified FEMIS ID", () => {
  const renderer = fs.readFileSync("src/js/pacificEducationRoleActivityPacks.js", "utf8");
  const queue = fs.readFileSync("src/js/pacificEducationTeacherReviewQueue.js", "utf8");
  assert.match(renderer, /var reviewKey = "pacificEducationActivityResponses"/);
  assert.match(renderer, /assignmentId:assignmentId/);
  assert.match(renderer, /learnerIdentityStatus:/);
  assert.match(renderer, /reviewStatus:"pending-teacher-review"/);
  assert.match(renderer, /teacher review queue could not be updated/i);
  assert.match(queue, /Learner ID verification:/);
  assert.match(queue, /Assignment reference:/);
  assert.match(queue, /Prepared \/ submitted:/);
  assert.doesNotMatch(renderer, /studentId:\s*enteredId/);
});
