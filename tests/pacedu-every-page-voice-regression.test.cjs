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
    '[12,"pacificEducationCoverageDashboard"',
    '[13,"teacherCalendarSection"'
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
  assert.doesNotMatch(protectedController, /20261025-every-page-voice-fix-v2/);
});

test("the additive voice repair is loaded after the protected controller", () => {
  const protectedAt = index.indexOf("pacificEducationMandatoryVoiceNavigation.js?v=20261005-userbox-nextvoice");
  const repairAt = index.indexOf("pacificEducationEveryPageVoiceRepair.js?v=20261025-every-page-voice-fix-v2");
  assert.ok(protectedAt >= 0, "protected controller script missing");
  assert.ok(repairAt > protectedAt, "additive repair must load after protected controller");
});


test("workspace narration is manual replay only and does not compete with protected navigation voice", () => {
  assert.doesNotMatch(repair, /spokenWorkspaces/);
  assert.doesNotMatch(repair, /now&&!was/);
  assert.ok(repair.includes('button.addEventListener("click",function(event){if(event)event.preventDefault();speak(item[2]);});'));
  assert.match(repair, /protected controller owns guided-step announcements/);
});

test("the additive repair does not duplicate the protected guided-step narrator", () => {
  assert.doesNotMatch(repair, /announceCurrentStep\("step"\)/);
  assert.match(repair, /protected controller owns guided-step announcements/);
});

test("guided page replay covers both Coverage and the final Teacher Calendar page", () => {
  assert.match(repair, /\[12,"pacificEducationCoverageDashboard"/);
  assert.match(repair, /\[13,"teacherCalendarSection"/);
  assert.match(repair, /function installGuidedPageControls/);
  assert.match(repair, /data-pe-guided-page-voice/);
  assert.match(repair, /installGuidedPageControls\(\)/);
});

test("guided page replay is manual and does not replace protected automatic narration", () => {
  assert.match(repair, /button\.addEventListener\("click",function\(event\).*speak\(item\[2\]\)/);
  assert.match(repair, /protected controller owns guided-step announcements/);
  assert.doesNotMatch(protectedController, /data-pe-guided-page-voice/);
});


test("voice command directive does not install a competing step-by-step guide", () => {
  const voiceNext = fs.readFileSync("src/js/pacificEducationVoiceNextDirective.js", "utf8");
  const stepGuide = fs.readFileSync("src/js/pacificEducationStepByStepGuidance.js", "utf8");
  assert.doesNotMatch(voiceNext, /function guideHighlight|function guideCandidates|function guidePanelEnsure/);
  assert.doesNotMatch(voiceNext, /data-pe-step-guide-installed/);
  assert.doesNotMatch(voiceNext, /pacificEducationStepGuide/);
  assert.match(stepGuide, /function install\(\)/);
  assert.match(stepGuide, /data-pe-step-guide-installed/);
  assert.match(voiceNext, /initGlobalVoiceUI\(\)/);
  assert.doesNotMatch(voiceNext, /installGuide\(\);/);
});

test("voice command directive retains Next, Back, Repeat and Stop Speech commands", () => {
  const voiceNext = fs.readFileSync("src/js/pacificEducationVoiceNextDirective.js", "utf8");
  for (const command of ["commandBack", "commandRepeat", "commandStopSpeech", "matchesNextCommand"]) {
    assert.match(voiceNext, new RegExp("function " + command + "\\("));
  }
  assert.match(voiceNext, /Start Voice Control/);
  assert.match(voiceNext, /stopGlobal/);
});
