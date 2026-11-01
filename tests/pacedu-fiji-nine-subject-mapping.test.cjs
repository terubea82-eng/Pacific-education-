const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync("src/js/paceduFijiNineSubjectMapping.js", "utf8");
const window = {};
vm.runInNewContext(source, { window, Object, String, Array });
const api = window.PacEduFijiSubjectMapping;

assert.ok(api, "15-subject mapping API is exported");
assert.equal(window.PacEduFijiNineSubjectMapping, api, "legacy mapping API remains compatible");
assert.equal(api.activeSelectorChanged, false, "the mapping does not replace the active navigation selector");
assert.deepEqual(Array.from(api.subjectBoxes, item => item.label), [
  "English", "Mathematics", "Phonics", "Science", "Social Science",
  "Health", "Agriculture", "Arts", "Technology", "Home Economics",
  "Computer Studies", "Vosa Vakaviti (iTaukei)", "Fiji Hindi", "Urdu", "Rotuman"
]);
assert.deepEqual(Array.from(api.levels), [
  "ECE", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
  "Class 6", "Class 7", "Class 8", "Form 3", "Form 4", "Form 5", "Form 6", "Form 7"
]);
assert.equal(api.levels.includes("Form 1"), false);
assert.equal(api.levels.includes("Form 2"), false);

for (const level of api.levels) {
  for (const subject of api.subjectBoxes) {
    const result = api.resolve(subject.id, level);
    assert.equal(result.levelSupport.status, "LEVEL_ENGINE_AVAILABLE");
    assert.equal(result.curriculumVerification, "NOT_YET_MAPPED");
    assert.ok(result.status, "every subject/level pair has an explicit status");
  }
}
assert.deepEqual(Array.from(api.resolve("Social Science", "Class 4").worksheetSourceSubjects), ["Social Studies"]);
assert.deepEqual(Array.from(api.resolve("Health", "Class 4").worksheetSourceSubjects), ["Healthy Living", "Physical Education"]);
assert.deepEqual(Array.from(api.resolve("Arts", "Class 4").worksheetSourceSubjects), ["Arts and Crafts", "Music"]);
assert.equal(api.resolve("Phonics", "Class 1").contentStatus, "CONTENT_PARTIAL");
assert.equal(api.resolve("Science", "Form 6").contentStatus, "CONTENT_PARTIAL");
for (const subject of ["Agriculture", "Home Economics", "Urdu", "Rotuman"]) {
  assert.equal(api.resolve(subject, "Class 3").contentStatus, "CONTENT_NOT_AVAILABLE");
  assert.equal(api.resolve(subject, "Class 3").worksheetSourceSubjects.length, 0);
}
assert.equal(api.resolve("Computer Studies", "Class 3").contentStatus, "CONTENT_PARTIAL");
assert.equal(api.resolve("Vosa Vakaviti (iTaukei)", "Class 3").contentStatus, "CONTENT_PARTIAL");
assert.equal(api.resolve("Fiji Hindi", "Class 3").contentStatus, "CONTENT_PARTIAL");
assert.equal(api.resolve("English", "Form 1").status, "level-gap");
assert.equal(api.resolve("unknown", "Class 1").status, "SUBJECT_NOT_MAPPED");

console.log("PASS: exact 15 Fiji subject boxes; ECE, Classes 1–8, Forms 3–7; explicit partial/missing content; legacy API alias; no unsupported subject substitution.");
