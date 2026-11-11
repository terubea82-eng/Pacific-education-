const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const runtimeSource = fs.readFileSync("src/js/paceduAchievementDistributionRuntime.js", "utf8");
const dailySource = fs.readFileSync("src/js/paceduDailyWorksheetContent.js", "utf8");
const termPlanSource = fs.readFileSync("src/js/paceduTermLearningPlan.js", "utf8");
const assessmentSource = fs.readFileSync("src/js/paceduAssessmentBlueprints.js", "utf8");
const headers = [
  "country","framework_version","class_level","subject_id","term","week","day",
  "term_day","annual_day","indicator_id","indicator_text","strand","sub_strand",
  "learning_objective","source_document_title","issuing_authority","source_version",
  "source_page_or_section","source_url","source_status","educator_review_status",
  "activity_ids","assessment_evidence","accessibility_notes","approved_by","approved_at","review_notes"
];

function csvCell(value) {
  const text = String(value == null ? "" : value);
  return /[",\n]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
}
function makeRow(overrides) {
  const row = Object.assign({
    country: "Fiji", framework_version: "2013-working-baseline", class_level: "Class 1",
    subject_id: "English", term: "Term 1", week: "1", day: "2", term_day: "2", annual_day: "2",
    indicator_id: "FJ-C1-ENG-001", indicator_text: "Recognise and use a familiar greeting in a short spoken or written exchange.",
    strand: "Language and communication", sub_strand: "Speaking and listening",
    learning_objective: "Use a suitable greeting.", source_document_title: "Approved sample syllabus",
    issuing_authority: "Fiji Ministry of Education", source_version: "2026 authorised copy",
    source_page_or_section: "Page 12, outcome 1", source_url: "https://education.gov.fj/example",
    source_status: "SOURCE_VERIFIED", educator_review_status: "VALIDATED",
    activity_ids: "", assessment_evidence: "oral response;written greeting",
    accessibility_notes: "Accept spoken, signed, selected or written response.",
    approved_by: "curriculum-reviewer", approved_at: "2026-11-12T08:00:00Z", review_notes: ""
  }, overrides || {});
  return headers.map(h => csvCell(row[h])).join(",");
}
function load() {
  const window = {
    PacificEducationEnglishWorksheetLibrary: {
      getWorksheet() { return { title: "Day 1 baseline" }; },
      levels: ["ECE", "Class 1"], subjects: [], abilities: []
    }
  };
  vm.runInNewContext(runtimeSource, { window, Object, Array, String, Number, RegExp, JSON, Error });
  vm.runInNewContext(termPlanSource, { window, Object, Array, String, Number, Math, RegExp });
  vm.runInNewContext(dailySource, { window, Object, Array, String, Number, Math, RegExp });
  vm.runInNewContext(assessmentSource, { window, Object, Array, String, Number, Math, RegExp });
  return window;
}

test("distribution CSV imports exact day slots and skips blank planning rows", () => {
  const window = load();
  const csv = headers.join(",") + "\n" + makeRow() + "\n" +
    makeRow({ class_level: "", subject_id: "", indicator_id: "", indicator_text: "", source_status: "PENDING_SOURCE_VERIFICATION", educator_review_status: "PENDING" });
  const result = window.PacEduAchievementDistributionRuntime.importDistributionCsv(csv);
  assert.equal(result.success, true);
  assert.equal(result.imported, 1);
  assert.equal(result.skippedBlankSlots, 1);
  const found = window.PacEduAchievementDistributionRuntime.getDailyAssignment({
    level: "Class 1", subjectId: "English", term: "Term 1", week: 1, day: 2
  });
  assert.equal(found.assignment.indicatorId, "FJ-C1-ENG-001");
  assert.equal(found.status, "VALIDATED");
});

test("daily worksheet receives the exact matching indicator and assessment evidence metadata", () => {
  const window = load();
  window.PacEduAchievementDistributionRuntime.importDistributionCsv(headers.join(",") + "\n" + makeRow());
  const worksheet = window.PacEduDailyWorksheetContent.getCurriculumWorksheet({
    level: "Class 1", subject: "English", term: "T1", week: 1, day: 2, ability: "developing"
  });
  assert.deepEqual(Array.from(worksheet.indicatorIds), ["FJ-C1-ENG-001"]);
  assert.equal(worksheet.indicatorMappingStatus, "VALIDATED");
  assert.equal(worksheet.dailyLesson.curriculumAlignment.candidateIndicator.id, "FJ-C1-ENG-001");
  assert.equal(worksheet.questions[0].indicatorIds[0], "FJ-C1-ENG-001");
  assert.equal(worksheet.assessmentMapping.formalAssessmentEligible, false);
  const evidence = window.PacEduAssessmentBlueprints.buildIndicatorLinkedEvidence(worksheet, [
    { questionId: worksheet.questions[0].questionId, response: "Good morning" }
  ]);
  assert.deepEqual(Array.from(evidence.indicatorIds), ["FJ-C1-ENG-001"]);
  assert.equal(evidence.formalAssessmentEligible, false);
  assert.equal(evidence.serverAuthorizationRequired, true);
  assert.equal(evidence.requiresTeacherReview, true);
});

test("pending or incomplete source review never becomes a validated indicator", () => {
  const window = load();
  const result = window.PacEduAchievementDistributionRuntime.importDistributionCsv(
    headers.join(",") + "\n" + makeRow({ source_status: "PENDING_SOURCE_VERIFICATION", educator_review_status: "PENDING", approved_by: "", approved_at: "" })
  );
  assert.equal(result.pendingReview, 1);
  const found = window.PacEduAchievementDistributionRuntime.getDailyAssignment({
    level: "Class 1", subjectId: "English", term: "Term 1", week: 1, day: 2
  });
  assert.equal(found.status, "PENDING_TEACHER_REVIEW");
  assert.equal(found.assignment.formalAssessmentEligible, false);
});

test("duplicate exact day assignments and out-of-range term weeks are rejected", () => {
  const window = load();
  const duplicate = window.PacEduAchievementDistributionRuntime.importDistributionCsv(
    headers.join(",") + "\n" + makeRow() + "\n" + makeRow({ indicator_id: "FJ-C1-ENG-002" })
  );
  assert.equal(duplicate.success, false);
  assert.match(duplicate.errors.join(" "), /duplicate/i);
  const invalidWeek = window.PacEduAchievementDistributionRuntime.importDistributionCsv(
    headers.join(",") + "\n" + makeRow({ week: "10" })
  );
  assert.equal(invalidWeek.success, false);
  assert.match(invalidWeek.errors.join(" "), /outside/i);
});

test("assessment planner exposes the indicator-linked evidence builder", () => {
  const window = load();
  const result = window.PacEduAssessmentBlueprints.buildIndicatorLinkedEvidence({
    activityId: "activity-1", assessmentMapping: { indicatorIds: ["I-1"], mappingStatus: "VALIDATED" }
  }, []);
  assert.deepEqual(Array.from(result.indicatorIds), ["I-1"]);
  assert.equal(result.formalAssessmentEligible, false);
});

test("Copper-to-Gold ability variants retain the same exact daily indicator ID", () => {
  const window = load();
  window.PacEduAchievementDistributionRuntime.importDistributionCsv(headers.join(",") + "\n" + makeRow());
  const ids = ["support", "developing", "expected", "extension"].map(ability => {
    const worksheet = window.PacEduDailyWorksheetContent.getCurriculumWorksheet({
      level: "Class 1", subject: "English", term: "T1", week: 1, day: 2, ability
    });
    return Array.from(worksheet.indicatorIds).join(",");
  });
  assert.deepEqual(ids, Array(4).fill("FJ-C1-ENG-001"));
});

test("missing exact daily slots remain unassigned instead of borrowing another day's indicator", () => {
  const window = load();
  window.PacEduAchievementDistributionRuntime.importDistributionCsv(headers.join(",") + "\n" + makeRow());
  const worksheet = window.PacEduDailyWorksheetContent.getCurriculumWorksheet({
    level: "Class 1", subject: "English", term: "T1", week: 1, day: 3, ability: "developing"
  });
  assert.deepEqual(Array.from(worksheet.indicatorIds), []);
  assert.equal(worksheet.indicatorMappingStatus, "NO_APPROVED_INDICATOR_SLOT");
  assert.equal(worksheet.assessmentMapping.formalAssessmentEligible, false);
});

test("runtime clearly reports when no distribution file has been imported", () => {
  const window = load();
  const result = window.PacEduAchievementDistributionRuntime.getDailyAssignment({
    level: "Class 1", subjectId: "English", term: "Term 1", week: 1, day: 2
  });
  assert.equal(result.status, "DISTRIBUTION_FILE_NOT_IMPORTED");
  assert.equal(result.assignment, null);
});
