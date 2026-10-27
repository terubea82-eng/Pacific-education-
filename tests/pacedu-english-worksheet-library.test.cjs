const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync("src/js/pacificEducationEnglishWorksheetLibrary.js", "utf8");
const stored = new Map();
const window = {
  localStorage: {
    getItem(key) { return stored.has(key) ? stored.get(key) : null; },
    setItem(key, value) { stored.set(key, String(value)); }
  },
  PacificEducationRoleActivityPacks: Object.freeze({
    getActivity() { return null; },
    getStudentActivity() { return null; },
    render() { return true; },
    roles: Object.freeze(["teacher", "student"])
  })
};
vm.runInNewContext(source, { window, document: {}, Math, String, Number, Object, encodeURIComponent });
const library = window.PacificEducationEnglishWorksheetLibrary;

test("English worksheets use Fiji labels ECE, Classes 1–8 and Forms 3–7 without a duplicate Kindergarten option", () => {
  assert.equal(library.levels.length, 14);
  assert.ok(library.levels.includes("ECE"));
  assert.ok(library.levels.includes("Class 8"));
  assert.ok(library.levels.includes("Form 3"));
  assert.ok(library.levels.includes("Form 7"));
  assert.equal(library.levels.includes("Class 13"), false);
  assert.equal(library.levels.includes("Kindergarten"), false);
  for (const level of library.levels) {
    const worksheet = library.getWorksheet(level, "developing", 2);
    assert.equal(worksheet.level, level);
    assert.equal(worksheet.day, 2);
    assert.ok(worksheet.title.includes(level));
    assert.ok(worksheet.tasks.length >= 4);
    assert.ok(worksheet.readingText && worksheet.readingText.length > 20, "worksheet should include its own reading passage");
    assert.ok(worksheet.teacherCheck.length > 20);
    assert.match(worksheet.status, /PENDING_TEACHER_REVIEW/);
    assert.match(worksheet.sourceNote, /verify/i);
  }
});

test("each class level supports four differentiated ability bands", () => {
  assert.equal(library.abilities.length, 4);
  for (const level of library.levels) {
    for (const ability of library.abilities) {
      const worksheet = library.getWorksheet(level, ability.id, 8);
      assert.equal(worksheet.level, level);
      assert.equal(worksheet.ability, ability.id);
      assert.ok(worksheet.tasks.some(task => task.includes(ability.id === "support" ? "SUPPORTED START" :
        ability.id === "developing" ? "DEVELOPING" :
        ability.id === "expected" ? "CLASS-GOAL PRACTICE" : "EXTENSION")));
    }
  }
});

test("Day 1 always generates an initial ability check rather than a teaching worksheet", () => {
  for (const level of library.levels) {
    const worksheet = library.getWorksheet(level, "expected", 1);
    assert.equal(worksheet.day, 1);
    assert.equal(worksheet.ability, "initial-assessment");
    assert.match(worksheet.title, /Initial Ability Check/);
    assert.match(worksheet.instructions, /not a pass\/fail exam/i);
    assert.match(worksheet.teacherCheck, /Missing or unclear evidence remains pending/i);
    assert.equal(worksheet.questionPlan.count, worksheet.tasks.length);
    assert.equal(worksheet.questionPlan.questions.length, worksheet.tasks.length);
    assert.ok(worksheet.questionPlan.questions.every((q, i) => q.number === i + 1 && q.prompt.length > 10));
  }
});

test("day and level inputs are bounded safely and legacy Kindergarten maps to ECE", () => {
  assert.equal(library.getWorksheet("Kindergarten", "developing", 2).level, "ECE");
  assert.equal(library.getWorksheet("unknown", "bad", 999).day, 365);
  assert.equal(library.getWorksheet("unknown", "bad", 999).level, "Class 1");
  const legacyClass13 = library.getWorksheet("Class 13", "extension", -5);
  assert.equal(legacyClass13.day, 1);
  assert.equal(legacyClass13.level, "Class 1");
  assert.equal(library.getWorksheet("Form 7", "extension", 2).level, "Form 7");
});

test("teacher dashboard renderer is wrapped without replacing the existing activity renderer", () => {
  assert.equal(window.PacificEducationRoleActivityPacks.englishWorksheetPreviewEnabled, true);
  assert.equal(typeof window.PacificEducationRoleActivityPacks.getActivity, "function");
  assert.equal(typeof window.PacificEducationRoleActivityPacks.getStudentActivity, "function");
  assert.equal(window.PacificEducationRoleActivityPacks.render("student", "dailyLesson", {}, 2), true);
});

test("daily question count and question types adapt to class stage and demonstrated ability", () => {
  const earlySupport = library.getWorksheet("Kindergarten", "support", 2);
  const earlyExtension = library.getWorksheet("Kindergarten", "extension", 2);
  const middleGoal = library.getWorksheet("Class 5", "expected", 2);
  const seniorExtension = library.getWorksheet("Form 7", "extension", 2);
  assert.equal(earlySupport.questionPlan.count, 4);
  assert.equal(earlyExtension.questionPlan.count, 6);
  assert.equal(middleGoal.questionPlan.count, 10);
  assert.equal(seniorExtension.questionPlan.count, 18);
  for (const worksheet of [earlySupport, earlyExtension, middleGoal, seniorExtension]) {
    assert.equal(worksheet.questionPlan.questions.length, worksheet.questionPlan.count);
    assert.ok(worksheet.questionPlan.types.length >= 4);
    assert.ok(worksheet.questionPlan.questions.every((q, i) => q.number === i + 1 && q.prompt.length > 10));
    assert.match(worksheet.questionPlan.note, /verified daily Fiji English achievement indicator/i);
  }
  assert.ok(earlySupport.questionPlan.types.some(type => /picture|listen|oral/.test(type)));
  assert.ok(middleGoal.questionPlan.types.includes("multiple-choice"));
  assert.ok(seniorExtension.questionPlan.types.includes("evidence-or-inference"));
});

test("English button opens the daily worksheet builder for ECE, Classes 1–8 and Forms 3–7", () => {
  assert.match(source, /paceduOpenEnglishDailyActivities/);
  assert.match(source, /English — Daily Activities for All Classes/);
  assert.match(source, /var levelOptions = LEVELS\.map/);
  assert.match(source, /paceduEnglishWorksheetBuilder/);
});

test("ability selector explains each band when tapped or changed", () => {
  assert.match(source, /paceduEnglishWorksheetAbilityInfo/);
  assert.match(source, /abilitySelect\.addEventListener\("click", showAbilityInfo\)/);
  assert.match(source, /abilitySelect\.addEventListener\("focus", showAbilityInfo\)/);
  assert.match(source, /abilitySelect\.addEventListener\("change", function\s*\(\)/);
  for (const phrase of ["Supported start:", "DEVELOPING:", "CLASS-GOAL PRACTICE:", "EXTENSION:"]) {
    assert.ok(source.includes(phrase), "ability information should explain " + phrase);
  }
});

test("retrieves the class-specific saved capability and maps it to a worksheet band", () => {
  stored.clear();
  window.PacificEducationTeacherClassRosterContext = { getClassId() { return "class-7"; } };
  stored.set("pacificEducationCapability:class-7", "advanced");
  stored.set("pacificEducationCapability", "remedial");
  const classResult = library.getStoredAbility();
  assert.equal(classResult.ability, "extension");
  assert.equal(classResult.source, "class assessment");
  assert.equal(classResult.capability, "advanced");

  stored.set("pacificEducationCapability:class-7", "remedial");
  assert.equal(library.getStoredAbility().ability, "support");
  assert.equal(library.getStoredAbility().source, "class assessment");
});

test("retrieves the selected child's saved ability before class or general values", () => {
  stored.clear();
  window.PacificEducationTeacherClassRosterContext = { getClassId() { return "class-7"; } };
  window.PacificEducationStudentCoverageContext = { getStudentId() { return "student-a"; } };
  stored.set("pacificEducationCapability:student:class-7:student-a", "foundation");
  stored.set("pacificEducationCapability:class-7", "advanced");
  stored.set("pacificEducationCapability", "expected");
  const result = library.getStoredAbility();
  assert.equal(result.ability, "support");
  assert.equal(result.source, "student assessment");
  assert.equal(result.capability, "foundation");
  window.PacificEducationStudentCoverageContext = null;
});

test("uses the saved global capability only when no class is selected", () => {
  stored.clear();
  window.PacificEducationTeacherClassRosterContext = null;
  stored.set("pacificEducationCapability", "expected");
  const globalResult = library.getStoredAbility();
  assert.equal(globalResult.ability, "expected");
  assert.equal(globalResult.source, "saved learning capability");
  assert.equal(globalResult.capability, "expected");
});

test("a selected class does not inherit a general ability without class evidence", () => {
  stored.clear();
  window.PacificEducationTeacherClassRosterContext = { getClassId() { return "class-8"; } };
  stored.set("pacificEducationCapability", "advanced");
  const classResult = library.getStoredAbility();
  assert.equal(classResult.ability, "initial-assessment");
  assert.equal(classResult.source, "no saved learner evidence; Day 1 check required");
  assert.equal(classResult.hasEvidence, false);
});

test("does not silently force Developing when a saved worksheet choice is the only available category", () => {
  stored.clear();
  window.PacificEducationTeacherClassRosterContext = null;
  stored.set("paceduEnglishWorksheetAbility", "extension");
  const savedResult = library.getStoredAbility();
  assert.equal(savedResult.ability, "extension");
  assert.equal(savedResult.source, "saved worksheet choice");
  assert.equal(savedResult.capability, "");
});

const levelSelectorSource = fs.readFileSync("src/js/pacificEducationLevelSelector.js", "utf8");

test("legacy saved Kindergarten level migrates to ECE", () => {
  assert.match(levelSelectorSource, /kindergarten\$\/i\.test/);
  assert.match(levelSelectorSource, /setItem\("pacificEducationLevel", "ECE"\)/);
});

const capabilitySource = fs.readFileSync("src/js/pacificEducationCapabilitySelector.js", "utf8");

test("ability selector stores and retrieves a separate ability for each selected student", () => {
  const abilityStore = new Map();
  const selectorWindow = {
    localStorage: {
      getItem(key) { return abilityStore.has(key) ? abilityStore.get(key) : null; },
      setItem(key, value) { abilityStore.set(key, String(value)); }
    },
    PacificEducationStudentCoverageContext: { getStudentId() { return "student-a"; } },
    PacificEducationTeacherClassRosterContext: {
      getClassId() { return "class-7"; },
      getStudents(classId) { return classId === "class-7" ? ["student-a", "student-b"] : []; }
    }
  };
  const selectorDocument = { readyState: "loading", addEventListener() {} };
  vm.runInNewContext(capabilitySource, {
    window: selectorWindow, document: selectorDocument, Object, String, encodeURIComponent
  });
  const selector = selectorWindow.PacificEducationCapabilitySelector;
  assert.equal(selector.setCapability("developing"), true);
  assert.equal(selector.getCapability(), "developing");
  assert.equal(abilityStore.get("pacificEducationCapability:student:class-7:student-a"), "developing");
  assert.equal(abilityStore.has("pacificEducationCapability"), false);

  selectorWindow.PacificEducationStudentCoverageContext = { getStudentId() { return "student-b"; } };
  assert.equal(selector.getCapability(), "expected");
  assert.equal(selector.setCapability("advanced"), true);
  assert.equal(abilityStore.get("pacificEducationCapability:student:class-7:student-b"), "advanced");

  selectorWindow.PacificEducationStudentCoverageContext = { getStudentId() { return "student-a"; } };
  assert.equal(selector.getCapability(), "developing");
});

test("a selected child never inherits the general ability setting", () => {
  const abilityStore = new Map([["pacificEducationCapability", "advanced"]]);
  const selectorWindow = {
    localStorage: {
      getItem(key) { return abilityStore.has(key) ? abilityStore.get(key) : null; },
      setItem(key, value) { abilityStore.set(key, String(value)); }
    },
    PacificEducationStudentCoverageContext: { getStudentId() { return "student-a"; } },
    PacificEducationTeacherClassRosterContext: {
      getClassId() { return "class-7"; },
      getStudents() { return ["student-a", "student-b"]; }
    }
  };
  const selectorDocument = { readyState: "loading", addEventListener() {} };
  vm.runInNewContext(capabilitySource, {
    window: selectorWindow, document: selectorDocument, Object, String, encodeURIComponent
  });
  const selector = selectorWindow.PacificEducationCapabilitySelector;
  assert.equal(selector.getCapability(), "expected");
  assert.equal(abilityStore.get("pacificEducationCapability"), "advanced");
  assert.equal(abilityStore.has("pacificEducationCapability:student:class-7:student-a"), false);
});

test("ability selector falls back to general setting without a valid selected student", () => {
  const abilityStore = new Map();
  const selectorWindow = {
    localStorage: {
      getItem(key) { return abilityStore.has(key) ? abilityStore.get(key) : null; },
      setItem(key, value) { abilityStore.set(key, String(value)); }
    },
    PacificEducationStudentCoverageContext: { getStudentId() { return "not-in-roster"; } },
    PacificEducationTeacherClassRosterContext: {
      getClassId() { return "class-7"; },
      getStudents() { return ["student-a"]; }
    }
  };
  const selectorDocument = { readyState: "loading", addEventListener() {} };
  vm.runInNewContext(capabilitySource, {
    window: selectorWindow, document: selectorDocument, Object, String, encodeURIComponent
  });
  const selector = selectorWindow.PacificEducationCapabilitySelector;
  assert.equal(selector.setCapability("extension"), true);
  assert.equal(abilityStore.get("pacificEducationCapability"), "extension");
  assert.equal(selector.getCapability(), "extension");
});


test("English teacher workspace exposes curriculum-scheduled Term/Week/Day controls for every Fiji level", () => {
  assert.match(source, /paceduEnglishCurriculumScheduleControls/);
  assert.match(source, /paceduEnglishWorksheetTerm/);
  assert.match(source, /paceduEnglishWorksheetWeek/);
  assert.match(source, /paceduEnglishWorksheetWeekDay/);
  assert.match(source, /getCurriculumWorksheet\(/);
  assert.match(source, /ECE, Classes 1–8 and Forms 3–7/);
  assert.match(source, /curriculumSchedule\.verificationStatus/);
  assert.match(source, /exact strand and achievement-indicator reference/);
});

test("English workspace keeps the Day 1 initial ability check separate from scheduled practice", () => {
  assert.match(source, /paceduEnglishInitialAbilityCheck/);
  assert.match(source, /initialCheckToggle\.checked\) \{/);
  assert.match(source, /makeWorksheet\(levelSelect\.value, "initial-assessment", 1, "English"\)/);
  assert.match(source, /The initial ability check is separate/);
});

test("English curriculum schedule selectors expose valid week ranges without claiming official mapping", () => {
  assert.match(source, /T1:10,T2:10,T3:5,ASSESSMENT:1,INTERVENTION:5,REVISION:2,EXAMS:2/);
  assert.match(source, /verificationStatus/);
  assert.match(source, /do not certify an official Fiji term timetable or achievement indicator/);
});
