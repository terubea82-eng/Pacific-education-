const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const dataSource = fs.readFileSync("src/js/paceduDailyWorksheetContent.js", "utf8");
const termSource = fs.readFileSync("src/js/paceduTermLearningPlan.js", "utf8");
const mappingSource = fs.readFileSync("src/js/paceduFijiNineSubjectMapping.js", "utf8");
const packSource = fs.readFileSync("src/js/paceduDownloadableClassPacks.js", "utf8");

function load() {
  const window = {
    PacificEducationEnglishWorksheetLibrary: {
      getWorksheet() { return { title: "Preserved Day 1 diagnostic" }; },
      levels: [], subjects: [], abilities: []
    }
  };
  const document = { createElement() {}, getElementById() { return null; } };
  vm.runInNewContext(termSource, { window, Object, Array, String, Number, Math, RegExp });
  vm.runInNewContext(dataSource, { window, Object, Array, String, Number, Math, RegExp });
  vm.runInNewContext(mappingSource, { window, Object, Array, String, Number, Math, RegExp });
  vm.runInNewContext(packSource, { window, document, Object, Array, String, Number, Math, RegExp, Date });
  return window;
}

test("Phonics, Agriculture, Home Economics and Computer Studies each have independent daily banks", () => {
  const window = load();
  const api = window.PacEduDailyWorksheetContent;
  const subjects = ["Phonics", "Agriculture", "Home Economics", "Computer Studies"];
  for (const subject of subjects) {
    assert.ok(api.subjects.includes(subject), subject);
    for (const level of api.levels) {
      for (const ability of ["support", "developing", "expected", "extension"]) {
        const sheet = api.getWorksheet(level, subject, 2, ability);
        assert.equal(sheet.subject, subject);
        assert.equal(sheet.level, level);
        assert.equal(sheet.ability, ability);
        assert.equal(sheet.questions.length, 4);
        assert.equal(sheet.answerKey.length, 4);
        assert.ok(sheet.readingText.length > 30);
        assert.ok(sheet.questions.every(q => q.options.length === 4));
        assert.ok(sheet.answerKey.every(a => a.answer && a.explanation));
        assert.equal(sheet.status, "DRAFT_REQUIRES_OFFICIAL_OUTCOME_MAPPING");
      }
    }
  }
});

test("each new subject box resolves only to its own worksheet bank", () => {
  const window = load();
  const expected = {
    Phonics: "Phonics",
    Agriculture: "Agriculture",
    "Home Economics": "Home Economics",
    "Computer Studies": "Computer Studies"
  };
  for (const [label, source] of Object.entries(expected)) {
    const resolved = window.PacEduFijiSubjectMapping.resolve(label, "Class 4");
    assert.equal(resolved.status, "mapped");
    assert.deepEqual(Array.from(resolved.worksheetSourceSubjects), [source]);
    assert.equal(window.PacEduDownloadableClassPacks.resolveSubject(label, "Class 4").sourceSubject, source);
  }
});

test("Form 5–7 science restriction and unrelated language safeguards remain intact", () => {
  const window = load();
  for (const level of ["Form 5", "Form 6", "Form 7"]) {
    assert.equal(window.PacEduDownloadableClassPacks.resolveSubject("Science", level).available, false);
  }
  for (const subject of ["Vosa Vakaviti (iTaukei)", "Fiji Hindi", "Urdu", "Rotuman"]) {
    assert.equal(window.PacEduDownloadableClassPacks.resolveSubject(subject, "Class 4").available, false);
  }
});

test("the new banks remain draft content pending official syllabus mapping and teacher review", () => {
  const window = load();
  for (const subject of ["Phonics", "Agriculture", "Home Economics", "Computer Studies"]) {
    const sheet = window.PacEduDailyWorksheetContent.getCurriculumWorksheet({
      level: "Class 4", subject, term: "T1", week: 1, day: 2, ability: "developing"
    });
    assert.equal(sheet.subject, subject);
    assert.equal(sheet.curriculumSchedule.verificationStatus, "NOT_YET_MAPPED");
    assert.equal(sheet.status, "DRAFT_REQUIRES_OFFICIAL_OUTCOME_MAPPING");
  }
});
