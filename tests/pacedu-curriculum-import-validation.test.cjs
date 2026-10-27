const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync("src/js/pacificEducationCurriculumBulkImportValidationEngine.js", "utf8");

function loadEngine() {
  const window = {};
  vm.runInNewContext(source, { window, Object, Array, String, Number, Math });
  return window.PacificEducationCurriculumBulkImportValidationEngine;
}

function validRecord(overrides = {}) {
  return {
    id: "FI-ENG-C1-001",
    indicatorId: "FI-ENG-C1-CANDIDATE-001",
    level: "Class 1",
    subjectId: "English",
    term: "Term 1",
    week: 1,
    day: 2,
    indicatorText: "Candidate learning outcome text for educator review.",
    documentId: "FJ-MOE-ENG-C1-SOURCE-001",
    sourceReference: "https://www.education.gov.fj/source-document.pdf",
    sourceTitle: "Candidate English syllabus document",
    sourceVersion: "version to be confirmed",
    sourceAuthority: "Fiji Ministry of Education — pending confirmation",
    sourcePage: "page to be checked",
    scheduleEvidenceReference: "teacher-sequence-review-pending",
    validationStatus: "pending-source-review",
    ...overrides
  };
}

test("accepts a traceable candidate but never makes it production eligible", () => {
  const result = loadEngine().validate([validRecord()]);
  assert.equal(result.valid, true);
  assert.equal(result.validRecords, 1);
  assert.equal(result.productionEligible, false);
});

test("rejects missing source title, version, document, source reference and page/section", () => {
  const record = validRecord({
    documentId: "",
    sourceReference: "",
    sourceTitle: "",
    sourceVersion: "",
    sourcePage: "",
    sourceSection: ""
  });
  const result = loadEngine().validate([record]);
  assert.equal(result.valid, false);
  for (const field of ["documentId", "sourceReference", "sourceTitle", "sourceVersion", "sourcePage or sourceSection"]) {
    assert.ok(result.results[0].errors.some(error => error.includes(field)), field);
  }
});

test("rejects unsupported levels, terms, weeks and days", () => {
  const result = loadEngine().validate([validRecord({ level: "Class 13", term: "Term 5", week: 14, day: 6 })]);
  assert.equal(result.valid, false);
  assert.ok(result.results[0].errors.some(error => error.includes("level")));
  assert.ok(result.results[0].errors.some(error => error.includes("term")));
  assert.ok(result.results[0].errors.some(error => error.includes("week")));
  assert.ok(result.results[0].errors.some(error => error.includes("day")));
});

test("rejects unsupported week/day placement without a schedule evidence reference", () => {
  const result = loadEngine().validate([validRecord({ scheduleEvidenceReference: "" })]);
  assert.equal(result.valid, false);
  assert.ok(result.results[0].errors.some(error => error.includes("scheduleEvidenceReference")));
});

test("rejects duplicate IDs and self-declared official verification", () => {
  const result = loadEngine().validate([
    validRecord({ validationStatus: "curriculum-verified" }),
    validRecord({ indicatorId: "FI-ENG-C1-CANDIDATE-002" })
  ]);
  assert.equal(result.valid, false);
  assert.deepEqual(Array.from(result.duplicateIds), ["FI-ENG-C1-001"]);
  assert.ok(result.results[0].errors.some(error => error.includes("cannot self-certify")));
  assert.equal(result.productionEligible, false);
});

test("supports only ECE, Classes 1–8 and Forms 3–7", () => {
  const engine = loadEngine();
  assert.equal(engine.supportedLevels.length, 14);
  for (const level of engine.supportedLevels) {
    assert.equal(engine.validate([validRecord({ level })]).valid, true, level);
  }
  assert.equal(engine.validate([validRecord({ level: "Kindergarten" })]).valid, false);
});
