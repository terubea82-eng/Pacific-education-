const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const flow = fs.readFileSync("src/js/paceduChildFriendlyFlowAndDate.js", "utf8");
const voice = fs.readFileSync("src/js/pacificEducationEveryPageVoiceRepair.js", "utf8");
const index = fs.readFileSync("src/index.html", "utf8");

test("automatic current date uses device-local date and refreshes after resume", () => {
  assert.ok(flow.includes("new Date()"));
  assert.ok(flow.includes("Intl.DateTimeFormat(undefined"));
  assert.ok(flow.includes("window.setInterval(ensureDate,60000)"));
  assert.ok(flow.includes("pageshow"));
  assert.ok(flow.includes("visibilitychange"));
  assert.ok(flow.includes("School calendar dates are set separately"));
});

test("page-specific spoken guidance remains available without a second instruction box", () => {
  for (const id of ["pacificEducationWelcome","paceduPageVision","paceduPageRules","pacificEducationIdentityRegistration","levelSelection","subjectSelection","termSelection","capabilitySelection","dailyLesson","dailyLessonPracticeStage","assessments"]) {
    assert.ok(voice.includes('["' + id + '"'), "missing spoken guidance for " + id);
  }
  assert.ok(voice.includes("Hear Instructions"));
  assert.ok(!flow.includes("What to do:"));
  assert.ok(!flow.includes('createElement("section")'));
});

test("automatic date appears only inside the visible daily activity", () => {
  assert.ok(flow.includes('getElementById("dailyLesson")'));
  assert.ok(flow.includes("daily.insertBefore(dateNode,daily.firstChild)"));
  assert.ok(flow.includes("removeExtraHelpBox"));
  assert.ok(flow.includes("if(!daily||!visible(daily))"));
});

test("automatic date script is loaded in the app with a refreshed cache key", () => {
  assert.ok(index.includes("paceduChildFriendlyFlowAndDate.js?v=20261025-child-friendly-date-v2"));
});
