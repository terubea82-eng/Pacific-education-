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
    assert.ok(worksheet.questions.every(q => q.prompt && q.options && q.answer && q.why && (q.options.length ? q.options[q.correctOption] === q.answer : q.type === "Oral / picture response")), subject);
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
  const practice = window.PacificEducationEnglishWorksheetLibrary.getWorksheet("Class 1", "developing", 2, "English");
  assert.ok(practice.passage.length > 20);
  assert.equal(practice.questionPlan.count, 4);
  assert.equal(practice.answerKey.length, 4);
  assert.ok(Array.isArray(practice.teacherReview));
});

test("Fijian language packs require verified teacher-provided text rather than invented translations", () => {
  const api = load().PacEduDailyWorksheetContent;
  for (const subject of ["iTaukei Language", "Hindi"]) {
    const worksheet = api.getWorksheet("Class 4", subject, 2, "developing");
    assert.ok(worksheet.readingText.includes("Teacher: insert"));
    assert.ok(worksheet.sourceNote.includes("current Fiji Ministry syllabus"));
  }
});

test("all Fiji levels and four ability bands return complete differentiated worksheets", () => {
  const api = load().PacEduDailyWorksheetContent;
  assert.deepEqual(JSON.parse(JSON.stringify(api.levels)), [
    "ECE", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8",
    "Form 3", "Form 4", "Form 5", "Form 6", "Form 7"
  ]);
  for (const level of api.levels) {
    for (const subject of api.subjects) {
      for (const ability of ["support", "developing", "expected", "extension"]) {
        const worksheet = api.getWorksheet(level, subject, 2, ability);
        assert.equal(worksheet.level, level);
        assert.equal(worksheet.subject, subject);
        assert.equal(worksheet.ability, ability);
        assert.equal(worksheet.questions.length, 4);
        assert.equal(worksheet.answerKey.length, 4);
        assert.ok(worksheet.tasks.length >= 3);
        assert.ok(worksheet.sourceNote.includes("source mapping pending"));
        for (const q of worksheet.questions) {
          if (q.options.length) assert.equal(q.options[q.correctOption], q.answer);
          else assert.equal(q.type, "Oral / picture response");
        }
      }
    }
  }
});

test("Class 1 English Day 2 starts with the planned introduction activity", () => {
  const worksheet = load().PacEduDailyWorksheetContent.getWorksheet("Class 1", "English", 2, "expected");
  assert.equal(worksheet.topic, "Who am I? — Class 1 Term 1 Week 1");
  assert.equal(worksheet.answerKey[0].answer, "Class 1");
});


test("term-week-day scheduler returns concrete worksheets with explicit curriculum verification fields", () => {
  const api = load().PacEduDailyWorksheetContent;
  assert.equal(typeof api.getCurriculumWorksheet, "function");
  for (const term of [
    ["T1", 10], ["T2", 10], ["T3", 5], ["ASSESSMENT", 1],
    ["INTERVENTION", 5], ["REVISION", 2], ["EXAMS", 2]
  ]) {
    for (let week = 1; week <= term[1]; week += 1) {
      for (let day = 1; day <= 5; day += 1) {
        const worksheet = api.getCurriculumWorksheet({
          level: "Class 1", subject: "English", term: term[0],
          week, day, ability: "developing"
        });
        assert.notEqual(worksheet.status, "NOT_FOUND");
        assert.equal(worksheet.curriculumSchedule.termId, term[0]);
        assert.equal(worksheet.curriculumSchedule.week, week);
        assert.equal(worksheet.curriculumSchedule.day, day);
        assert.equal(worksheet.questions.length, 4);
        assert.equal(worksheet.answerKey.length, 4);
        assert.equal(worksheet.curriculumSchedule.verificationStatus, "NOT_YET_MAPPED");
        assert.equal(worksheet.curriculumSchedule.achievementIndicator, null);
      }
    }
  }
  assert.equal(api.getCurriculumWorksheet({term:"T3",week:6,day:1}).status, "NOT_FOUND");
});


test("main app loads the worksheet module and package test command includes its regression suite", () => {
  const html = fs.readFileSync("src/index.html", "utf8");
  const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
  assert.match(html, /paceduDailyWorksheetContent\.js/);
  assert.match(html, /pacificEducationEnglishWorksheetLibrary\.js/);
  assert.match(pkg.scripts.test, /pacedu-daily-worksheet-content\.test\.cjs/);
});
