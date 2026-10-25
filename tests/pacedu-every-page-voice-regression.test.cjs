const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const repair = fs.readFileSync("src/js/pacificEducationEveryPageVoiceRepair.js", "utf8");
const protectedController = fs.readFileSync("src/js/pacificEducationMandatoryVoiceNavigation.js", "utf8");
const index = fs.readFileSync("src/index.html", "utf8");

test("additive voice repair maps every guided step to the actual page sequence", () => {
  const expected = [
    '[0,"pacificEducationWelcome"',
    '[1,"paceduPageVision"',
    '[2,"paceduPageRules"',
    '[3,"pacificEducationIdentityRegistration"',
    '[4,"prototypeAccess"',
    '[5,"levelSelection"',
    '[6,"subjectSelection"',
    '[7,"termSelection"',
    '[8,"capabilitySelection"',
    '[9,"dailyLesson"',
    '[10,"dailyLessonPracticeStage"',
    '[11,"assessments"',
    '[12,"teacherCalendarSection"'
  ];
  for (const mapping of expected) assert.ok(repair.includes(mapping), "missing mapping: " + mapping);
});

test("every workspace receives a Hear Instructions control and hidden ancestors are respected", () => {
  assert.match(repair, /data-pe-every-page-voice-button/);
  assert.match(repair, /workspaces\.forEach/);
  assert.match(repair, /for\(var n=el;n&&n\.nodeType===1;n=n\.parentElement\)/);
  assert.match(repair, /n\.hidden\|\|n\.getAttribute\("aria-hidden"\)==="true"/);
});

test("protected #856 mandatory voice controller is not modified by the repair", () => {
  assert.match(protectedController, /function announceCurrentStep/);
  assert.match(protectedController, /window\.PacificEducationMandatoryVoiceNavigation/);
  assert.doesNotMatch(protectedController, /20261025-every-page-voice-fix/);
});

test("the additive voice repair is loaded after the protected controller", () => {
  const protectedAt = index.indexOf("pacificEducationMandatoryVoiceNavigation.js?v=20261005-userbox-nextvoice");
  const repairAt = index.indexOf("pacificEducationEveryPageVoiceRepair.js?v=20261025-every-page-voice-fix");
  assert.ok(protectedAt >= 0, "protected controller script missing");
  assert.ok(repairAt > protectedAt, "additive repair must load after protected controller");
});
