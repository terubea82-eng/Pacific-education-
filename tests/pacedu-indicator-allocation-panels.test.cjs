const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const registrySource = fs.readFileSync("src/js/paceduIndicatorAllocationRegistry.js", "utf8");
const packSource = fs.readFileSync("src/js/paceduDownloadableClassPacks.js", "utf8");

const validIndicator = {
  indicatorId: "TEST-INDICATOR-001",
  officialWording: "Official test indicator wording.",
  paceduAdaptedWording: "Verified test wording — not an official Fiji indicator.",
  authorityType: "PACEDU_ADAPTED_SOURCE_ALIGNED",
  sourceTitle: "Automated test source",
  sourceEdition: "Test edition",
  sourcePage: "1",
  verificationStatus: "SOURCE_VERIFIED"
};
const validAllocation = {
  allocationId: "TEST-ALLOCATION-001",
  level: "Class 1", subject: "English", term: "T1", week: 1, day: 1,
  indicatorIds: ["TEST-INDICATOR-001"],
  verificationStatus: "ALLOCATION_VERIFIED",
  learnerGoal: "Read and explain a short sentence.",
  evidenceOfLearning: "Learner reads and answers a comprehension question.",
  teacherReviewStatus: "PENDING_TEACHER_REVIEW"
};

function makeRegistry(masterRecords, allocationRecords) {
  const window = {
    PacEduIndicatorMasterRecords: masterRecords || [],
    PacEduTeachingAllocationRecords: allocationRecords || []
  };
  vm.runInNewContext(registrySource, { window, Object, Array, Number, String });
  return window.PacEduIndicatorAllocationRegistry;
}

function buildPack(config = {}) {
  const window = {
    PacEduIndicatorMasterRecords: config.masterRecords || [],
    PacEduTeachingAllocationRecords: config.allocationRecords || [],
    PacEduDailyWorksheetContent: {
      getCurriculumWorksheet(options) {
        if (config.missingDay === options.day) return { status: "NOT_FOUND" };
        return {
          status: "OK", topic: "Sample daily topic",
          dailyLesson: { classLevelObjective: "Practise the daily learning task.", concept: "Sample concept" },
          questions: [{ prompt: "What did you learn?", options: ["A", "B", "C", "D"] }],
          answerKey: [{ answer: "A", explanation: "Test explanation." }]
        };
      }
    }
  };
  vm.runInNewContext(registrySource, { window, Object, Array, Number, String });
  vm.runInNewContext(packSource, {
    window, document: {}, Date, Math, String, Number, Array, Object, RegExp, Error
  });
  return window.PacEduDownloadableClassPacks.build({
    level: "Class 1", subject: "English", term: "T1", ability: "support"
  });
}

// Empty registry: fail closed and show the pending state.
const pending = buildPack();
assert.equal(pending.dailyActivities, 45);
assert.equal(pending.missingSlots, 0);
assert.match(pending.html, /Curriculum indicator/);
assert.match(pending.html, /PENDING_SUBJECT_SPECIFIC_INDICATOR/);
assert.match(pending.html, /PENDING_TEACHER_REVIEW/);
assert.match(pending.html, /No verified class-and-subject indicator is linked/);
assert.match(pending.html, /Copper/);
assert.match(pending.html, /Worksheet coverage/);

// Missing daily content is counted and clearly marks the pack incomplete.
const incomplete = buildPack({ missingDay: 3 });
assert.equal(incomplete.dailyActivities, 40);
assert.equal(incomplete.missingSlots, 5);
assert.match(incomplete.html, /Missing scheduled days:<\/strong> 5/);
assert.match(incomplete.html, /PACK INCOMPLETE/);

// A verified adapted indicator renders its source, goal and evidence, while
// teacher approval remains a separate pending gate.
const adapted = buildPack({
  masterRecords: [validIndicator],
  allocationRecords: [validAllocation]
});
assert.match(adapted.html, /TEST-INDICATOR-001/);
assert.match(adapted.html, /Verified test wording/);
assert.match(adapted.html, /Automated test source/);
assert.match(adapted.html, /Read and explain a short sentence/);
assert.match(adapted.html, /Evidence of learning/);
assert.match(adapted.html, /PENDING_TEACHER_REVIEW/);
assert.match(adapted.html, /break-before:page/);

// Allocation lookup must match every dimension exactly.
const registry = makeRegistry([validIndicator], [validAllocation]);
assert.equal(registry.resolve({ level: "Class 2", subject: "English", term: "T1", week: 1, day: 1 }).status,
  "PENDING_SUBJECT_SPECIFIC_INDICATOR");
assert.equal(registry.resolve({ level: "Class 1", subject: "Mathematics", term: "T1", week: 1, day: 1 }).status,
  "PENDING_SUBJECT_SPECIFIC_INDICATOR");
assert.equal(registry.resolve({ level: "Class 1", subject: "English", term: "T2", week: 1, day: 1 }).status,
  "PENDING_SUBJECT_SPECIFIC_INDICATOR");
assert.equal(registry.resolve({ level: "Class 1", subject: "English", term: "T1", week: 2, day: 1 }).status,
  "PENDING_SUBJECT_SPECIFIC_INDICATOR");
assert.equal(registry.resolve({ level: "Class 1", subject: "English", term: "T1", week: 1, day: 2 }).status,
  "PENDING_SUBJECT_SPECIFIC_INDICATOR");

// An unverified allocation or incomplete source record must not leak wording.
const unverifiedAllocation = { ...validAllocation, verificationStatus: "PENDING" };
const blockedAllocation = makeRegistry([validIndicator], [unverifiedAllocation])
  .resolve({ level: "Class 1", subject: "English", term: "T1", week: 1, day: 1 });
assert.equal(blockedAllocation.status, "PENDING_SUBJECT_SPECIFIC_INDICATOR");
assert.equal(blockedAllocation.indicators.length, 0);

const unverifiedSource = { ...validIndicator, verificationStatus: "PENDING" };
const blockedSource = makeRegistry([unverifiedSource], [validAllocation])
  .resolve({ level: "Class 1", subject: "English", term: "T1", week: 1, day: 1 });
assert.equal(blockedSource.status, "PENDING_SUBJECT_SPECIFIC_INDICATOR");
assert.equal(blockedSource.indicators.length, 0);

const noPage = { ...validIndicator, sourcePage: "" };
const blockedMissingCitation = makeRegistry([noPage], [validAllocation])
  .resolve({ level: "Class 1", subject: "English", term: "T1", week: 1, day: 1 });
assert.equal(blockedMissingCitation.status, "PENDING_SUBJECT_SPECIFIC_INDICATOR");

// Official-source wording is kept distinct from PacEdu-adapted wording.
const official = { ...validIndicator, authorityType: "OFFICIAL_SOURCE_WORDING", paceduAdaptedWording: "" };
const officialResult = makeRegistry([official], [validAllocation])
  .resolve({ level: "Class 1", subject: "English", term: "T1", week: 1, day: 1 });
assert.equal(officialResult.status, "ALLOCATION_VERIFIED");
assert.equal(officialResult.indicators[0].wording, "Official test indicator wording.");

// Explicit teacher approval is required before the final approval status.
const approved = { ...validAllocation, teacherReviewStatus: "APPROVED_FOR_USE" };
const approvedResult = makeRegistry([validIndicator], [approved])
  .resolve({ level: "Class 1", subject: "English", term: "T1", week: 1, day: 1 });
assert.equal(approvedResult.status, "ALLOCATION_VERIFIED");
assert.equal(approvedResult.teacherReviewStatus, "APPROVED_FOR_USE");

console.log("PASS: pending fail-closed state; missing-day reporting; Copper–Gold label; exact allocation matching; source and allocation verification gates; official/adapted wording separation; teacher approval gate; print page breaks.");
