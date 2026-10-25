const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const voice = fs.readFileSync("src/js/pacificEducationMandatoryVoiceNavigation.js", "utf8");
const index = fs.readFileSync("src/index.html", "utf8");

test("guided voice page map follows the real Welcome-to-workspace order", () => {
  const expected = [
    'step:0,id:"pacificEducationWelcome"',
    'step:1,id:"paceduPageVision"',
    'step:2,id:"paceduPageRules"',
    'step:3,id:"pacificEducationIdentityRegistration"',
    'step:4,id:"prototypeAccess"',
    'step:5,id:"levelSelection"',
    'step:6,id:"subjectSelection"',
    'step:7,id:"termSelection"',
    'step:8,id:"capabilitySelection"',
    'step:9,id:"dailyLesson"',
    'step:10,id:"dailyLessonPracticeStage"',
    'step:11,id:"assessments"',
    'step:12,id:"teacherCalendarSection"'
  ];
  for (const mapping of expected) assert.ok(voice.includes(mapping), "missing mapping: " + mapping);
});

test("voice visibility check excludes pages hidden by an ancestor", () => {
  assert.match(voice, /while\(node&&node\.nodeType===1\)/);
  assert.match(voice, /node\.hidden\|\|node\.getAttribute\("aria-hidden"\)==="true"/);
  assert.match(voice, /s\.display==="none"\|\|s\.visibility==="hidden"/);
});

test("the updated voice controller is cache-busted in the application shell", () => {
  assert.match(index, /pacificEducationMandatoryVoiceNavigation\.js\?v=20261025-every-page-voice-fix/);
});
