const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync("src/js/paceduFijiNineSubjectMapping.js", "utf8");
const window = {};
vm.runInNewContext(source, { window, Object, String, Array });
const api = window.PacEduFijiNineSubjectMapping;

assert.ok(api, "nine-subject mapping API is exported");
assert.equal(api.activeSelectorChanged, false, "the active subject selector remains unchanged");
assert.deepEqual(Array.from(api.subjectBoxes, item => item.label), [
  "English", "Mathematics", "Phonics", "Science", "Social Science",
  "Health", "Agriculture", "Arts", "Technology"
]);
assert.ok(api.levels.includes("ECE"));
assert.ok(api.levels.includes("Class 8"));
assert.ok(api.levels.includes("Form 1") && api.levels.includes("Form 2"));
assert.ok(api.levels.includes("Form 7"));
assert.ok(!api.worksheetEngineLevels.includes("Form 1"));
assert.ok(!api.worksheetEngineLevels.includes("Form 2"));

for (const level of api.levels) {
  for (const subject of api.subjectBoxes) {
    const result = api.resolve(subject.id, level);
    assert.equal(result.levelSupport.status,
      ["Form 1", "Form 2"].includes(level) ? "LEVEL_NOT_SUPPORTED" : "LEVEL_ENGINE_AVAILABLE",
      subject.id + " level coverage must be explicit for " + level);
    assert.equal(result.curriculumVerification, "NOT_YET_MAPPED");
    assert.ok(result.status, "every subject/level pair has an explicit status");
  }
}
assert.deepEqual(Array.from(api.resolve("Social Science", "Class 4").worksheetSourceSubjects), ["Social Studies"]);
assert.deepEqual(Array.from(api.resolve("Health", "Class 4").worksheetSourceSubjects), ["Healthy Living", "Physical Education"]);
assert.deepEqual(Array.from(api.resolve("Arts", "Class 4").worksheetSourceSubjects), ["Arts and Crafts", "Music"]);
assert.equal(api.resolve("Phonics", "Class 1").contentStatus, "CONTENT_PARTIAL");
assert.equal(api.resolve("Science", "Form 6").contentStatus, "CONTENT_PARTIAL");
assert.equal(api.resolve("Agriculture", "Class 3").contentStatus, "CONTENT_NOT_AVAILABLE");
assert.equal(api.resolve("Agriculture", "Class 3").worksheetSourceSubjects.length, 0);
assert.equal(api.resolve("English", "Form 1").status, "level-gap");
assert.equal(api.resolve("Technology", "Class 5").contentStatus, "CONTENT_PARTIAL");
assert.equal(api.resolve("unknown", "Class 1").status, "SUBJECT_NOT_MAPPED");

console.log("PASS: nine canonical Fiji subject boxes; legacy source aliases; ECE–Form 7 coverage reporting; Form 1–2 gaps; Phonics, Science, Agriculture and Technology limitations; no active selector change.");
