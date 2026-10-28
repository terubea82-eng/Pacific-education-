const assert = require("node:assert/strict");
const fs = require("node:fs");

const index = fs.readFileSync("src/index.html", "utf8");
const source = fs.readFileSync("src/js/paceduCountrySchoolTeacherClassList.js", "utf8");

assert.match(index, /pacificEducationTeacherClassRosterContext\.js\?v=20261028-class-roster-context/);
assert.match(index, /paceduCountrySchoolTeacherClassList\.js\?v=20261028-country-school-class-list/);
assert.match(source, /Teacher Class List & Student Registration/);
assert.match(source, /Fiji learners require their FEMIS ID/);
assert.match(source, /DEMO REFERENCES ONLY/);
assert.match(source, /do not enter real student names, FEMIS numbers, national IDs/);
assert.match(source, /pacificEducationPrototypeClassRosters/);
assert.match(source, /official student registration and verification remain separate/);
assert.doesNotMatch(source, /localStorage\.setItem\([^\n]*(?:FEMIS|nationalId|officialStudentId)/i);

console.log("PacEdu country/school class-list safeguards passed.");
