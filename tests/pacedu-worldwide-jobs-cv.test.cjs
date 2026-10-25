const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "src/js/paceduWorldwideJobsWorkspace.js"), "utf8");
const html = fs.readFileSync(path.join(root, "src/index.html"), "utf8");
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));

test("Worldwide Jobs workspace builds CV and job-specific cover-letter drafts", () => {
  assert.match(source, /Prepare my CV and cover letter/);
  assert.match(source, /function buildDocuments\(\)/);
  assert.match(source, /Possible keyword match/);
  assert.match(source, /id="pwMatchAdvice"/);
  assert.match(source, /Download CV/);
  assert.match(source, /Download cover letter/);
});

test("Worldwide employer categories are comprehensive and not falsely verified", () => {
  for (const category of [
    "Government & public services",
    "State-owned enterprises & statutory bodies",
    "Private businesses & companies",
    "Education & research institutions",
    "NGOs, charities & community organisations",
    "International & regional organisations",
    "Licensed recruitment & staffing agencies"
  ]) assert.ok(source.includes(category), category);
  assert.match(source, /categories do not mean an employer has been verified/i);
  assert.match(source, /Live jobs and verified employers are not available yet/);
});

test("employment drafts stay separate from learner records and disclose device-only storage", () => {
  assert.match(source, /pacedu\.worldwideJobsDraft\.v1/);
  assert.match(source, /saved only in this browser\/device/);
  assert.match(source, /Nothing has been submitted to an employer/);
  assert.doesNotMatch(source, /FEMIS|learnerSubmissions|studentMarks/);
});

test("workspace script is included once and regression test is part of npm test", () => {
  assert.equal((html.match(/paceduWorldwideJobsWorkspace\.js/g) || []).length, 1);
  assert.match(pkg.scripts.test, /pacedu-worldwide-jobs-cv\.test\.cjs/);
});
