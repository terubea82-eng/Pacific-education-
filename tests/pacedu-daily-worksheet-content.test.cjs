const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync("src/js/paceduDailyWorksheetContent.js", "utf8");

function load() {
  const originalDayOne = { title: "Day 1 diagnostic must be preserved", day: 1 };
  const window = {
    PacificEducationEnglishWorksheetLibrary: {
      getWorksheet() { return originalDayOne; },
      levels: ["ECE", "Class 1"],
      subjects: [],
      abilities: []
    }
  };
  vm.runInNewContext(source, { window, Object, Array, String, Number, Math, RegExp });
  return window;
}

test("every listed subject produces four concrete questions with answer explanations", () => {
  const api = load().PacEduDailyWorksheetContent;
  assert.ok(api.subjects.length >= 10);
  for (const subject of api.subjects) {
    const worksheet = api.getWorksheet("Class 1", subject, 2, "developing");
    assert.equal(worksheet.subject, subject);
    assert.equal(worksheet.questions.length, 4, subject);
    assert.equal(worksheet.answerKey.length, 4, subject);
    assert.ok(worksheet.readingText.length > 20, subject);
    assert.ok(worksheet.questions.every(q => q.prompt && q.options && q.answer && q.why), subject);
    assert.ok(worksheet.answerKey.every(a => a.answer && a.explanation), subject);
    assert.equal(worksheet.status, "DRAFT_REQUIRES_OFFICIAL_OUTCOME_MAPPING");
  }
});

test("Maths answer keys calculate correctly for market money and rainfall examples", () => {
  const api = load().PacEduDailyWorksheetContent;
  const market = api.getWorksheet("Class 1", "Mathematics", 3, "expected");
  assert.equal(market.topic, "Market money");
  assert.equal(market.questions[0].answer, "$12");
  assert.equal(market.questions[1].answer, "$8");
  const rain = api.getWorksheet("Form 5", "Mathematics", 4, "expected");
  assert.equal(rain.topic, "Rainfall data");
  assert.equal(rain.questions[1].answer, "16 mm");
  assert.equal(rain.questions[3].answer, "4 mm");
});

test("levels and four ability bands produce differentiated directions", () => {
  const api = load().PacEduDailyWorksheetContent;
  const support = api.getWorksheet("ECE", "English", 2, "support");
  const extension = api.getWorksheet("Form 7", "English", 2, "extension");
  assert.ok(support.tasks[0].includes("SUPPORTED START"));
  assert.ok(extension.tasks[0].includes("EXTENSION"));
  assert.equal(support.responseLines, 2);
  assert.equal(extension.responseLines, 7);
});

test("day one diagnostic is not overwritten and wrapper exposes the daily bank", () => {
  const window = load();
  assert.equal(window.PacificEducationEnglishWorksheetLibrary.getWorksheet("Class 1", "initial-assessment", 1, "English").title,
    "Day 1 diagnostic must be preserved");
  assert.equal(window.PacificEducationEnglishWorksheetLibrary.dailyContentEnhanced, true);
  assert.equal(typeof window.PacificEducationEnglishWorksheetLibrary.getDailyContentWorksheet, "function");
});

test("Fijian language packs require verified teacher-provided text rather than invented translations", () => {
  const api = load().PacEduDailyWorksheetContent;
  for (const subject of ["iTaukei Language", "Hindi"]) {
    const worksheet = api.getWorksheet("Class 4", subject, 2, "developing");
    assert.ok(worksheet.readingText.includes("Teacher: insert"));
    assert.ok(worksheet.sourceNote.includes("current Fiji Ministry syllabus"));
  }
});
