const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync("src/js/pacificEducationEnglishWorksheetLibrary.js", "utf8");
const window = {
  localStorage: { getItem() { return null; } },
  PacificEducationRoleActivityPacks: Object.freeze({
    getActivity() { return null; },
    getStudentActivity() { return null; },
    render() { return true; },
    roles: Object.freeze(["teacher", "student"])
  })
};
vm.runInNewContext(source, { window, document: {}, Math, String, Number, Object });
const library = window.PacificEducationEnglishWorksheetLibrary;

test("English worksheets are available for ECE, Kindergarten and Classes 1–13", () => {
  assert.equal(library.levels.length, 15);
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
  }
});

test("day and level inputs are bounded safely", () => {
  assert.equal(library.getWorksheet("unknown", "bad", 999).day, 365);
  assert.equal(library.getWorksheet("unknown", "bad", 999).level, "Class 1");
  assert.equal(library.getWorksheet("Class 13", "extension", -5).day, 1);
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
  const seniorExtension = library.getWorksheet("Class 13", "extension", 2);
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
