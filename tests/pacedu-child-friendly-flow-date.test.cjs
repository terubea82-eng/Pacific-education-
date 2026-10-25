const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const flow = fs.readFileSync("src/js/paceduChildFriendlyFlowAndDate.js", "utf8");
const index = fs.readFileSync("src/index.html", "utf8");

test("automatic current date uses device-local date and refreshes after resume", () => {
  assert.match(flow, /new Date\(\)/);
  assert.match(flow, /Intl\.DateTimeFormat\(undefined/);
  assert.match(flow, /window\.setInterval\(ensureDate,60000\)/);
  assert.match(flow, /pageshow/);
  assert.match(flow, /visibilitychange/);
  assert.match(flow, /School calendar dates are set separately/);
});

test("class-one friendly guidance is available for the main learning flow", () => {
  for (const id of ["pacificEducationWelcome","paceduPageVision","paceduPageRules","pacificEducationIdentityRegistration","levelSelection","subjectSelection","termSelection","capabilitySelection","dailyLesson","dailyLessonPracticeStage","assessments"]) {
    assert.ok(flow.includes('["' + id + '"'), "missing child-friendly instruction for " + id);
  }
  assert.match(flow, /Hear these instructions/);
  assert.match(flow, /one question at a time/);
});

test("date and guidance stay within the active visible page", () => {
  assert.match(flow, /active\.el\.insertBefore\(helpNode,active\.el\.firstChild\)/);
  assert.match(flow, /active\.el\.insertBefore\(dateNode,helpNode\)/);
  assert.match(flow, /aria-hidden/);
});

test("automatic date and simple guidance script is loaded in the app", () => {
  assert.match(index, /paceduChildFriendlyFlowAndDate\.js\?v=20261025-child-friendly-date/);
});
