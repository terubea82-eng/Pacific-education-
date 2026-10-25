const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const flow = fs.readFileSync("src/js/paceduChildFriendlyFlowAndDate.js", "utf8");
const voice = fs.readFileSync("src/js/pacificEducationEveryPageVoiceRepair.js", "utf8");
const index = fs.readFileSync("src/index.html", "utf8");

test("automatic current date uses device-local date and refreshes after resume", () => {
  assert.match(flow, /new Date\\(\\)/);
  assert.match(flow, /Intl\\.DateTimeFormat\\(undefined/);
  assert.match(flow, /window\\.setInterval\\(ensureDate,60000\\)/);
  assert.match(flow, /pageshow/);
  assert.match(flow, /visibilitychange/);
  assert.match(flow, /School calendar dates are set separately/);
});

test("page-specific spoken guidance remains available without a second instruction box", () => {
  for (const id of ["pacificEducationWelcome","paceduPageVision","paceduPageRules","pacificEducationIdentityRegistration","levelSelection","subjectSelection","termSelection","capabilitySelection","dailyLesson","dailyLessonPracticeStage","assessments"]) {
    assert.ok(voice.includes('["' + id + '"'), "missing spoken guidance for " + id);
  }
  assert.match(voice, /Hear Instructions/);
  assert.doesNotMatch(flow, /What to do:/);
  assert.doesNotMatch(flow, /paceduSimplePageHelp.*createElement/s);
});

test("automatic date appears only inside the visible daily activity", () => {
  assert.match(flow, /getElementById\\("dailyLesson"\\)/);
  assert.match(flow, /daily\\.insertBefore\\(dateNode,daily\\.firstChild\\)/);
  assert.match(flow, /removeExtraHelpBox/);
  assert.match(flow, /daily\\.parentNode/);
});

test("automatic date script is loaded in the app with a refreshed cache key", () => {
  assert.match(index, /paceduChildFriendlyFlowAndDate\\.js\\?v=20261025-child-friendly-date-v2/);
});
