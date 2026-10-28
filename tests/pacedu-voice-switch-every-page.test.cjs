const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const runtime = fs.readFileSync("src/js/paceduVoiceSwitchEveryPage.js", "utf8");
const index = fs.readFileSync("src/index.html", "utf8");
const protectedVoice = fs.readFileSync("src/js/pacificEducationMandatoryVoiceNavigation.js", "utf8");

test("global Voice On/Mute control is accessible and remembers the preference", () => {
  assert.match(runtime, /paceduVoiceSwitch/);
  assert.match(runtime, /aria-pressed/);
  assert.match(runtime, /aria-label/);
  assert.match(runtime, /localStorage\.setItem\(KEY,next\?"true":"false"\)/);
  assert.match(runtime, /Voice On — Mute/);
  assert.match(runtime, /Voice Muted — Turn On/);
});

test("mute stops current speech and blocks future speech through shared speech entry points", () => {
  assert.match(runtime, /if\(!next\) stop\(\)/);
  assert.match(runtime, /if\(!enabled\(\)\) return false/);
  assert.match(runtime, /window\.PacificEducationSpeech/);
  assert.match(runtime, /window\.speakText/);
});

test("workspace narration is page-specific and does not compete with guided-page narration", () => {
  assert.match(runtime, /activeGuidedPage\(\)/);
  assert.match(runtime, /rawSpeak\(item\[2\]\)/);
  assert.match(runtime, /announceVisibleWorkspace\.lastKey/);
  assert.match(protectedVoice, /function announceCurrentStep/);
});

test("voice-switch runtime loads after existing page voice repair", () => {
  const repairAt = index.indexOf("pacificEducationEveryPageVoiceRepair.js?v=20261025-every-page-voice-fix-v2");
  const switchAt = index.indexOf("paceduVoiceSwitchEveryPage.js?v=20261028-voice-switch-v1");
  assert.ok(repairAt >= 0, "existing voice repair script missing");
  assert.ok(switchAt > repairAt, "voice switch must load after existing voice scripts");
});

const commands = fs.readFileSync("src/js/pacificEducationVoiceNextDirective.js", "utf8");

test("global voice commands support Back, Repeat, and Stop alongside Next", () => {
  assert.match(commands, /function commandBack\(\)/);
  assert.match(commands, /function commandRepeat\(\)/);
  assert.match(commands, /function commandStopSpeech\(\)/);
  assert.match(commands, /\^\(back\|go back\|previous\|previous page\|back page\)\$/);
  assert.match(commands, /\^\(repeat\|repeat instructions\|repeat page\|read instructions again\)\$/);
  assert.match(commands, /\^\(stop\|stop speaking\|stop speech\|mute speech\)\$/);
  assert.match(commands, /function startGlobal\(\)/);
});

test("voice commands route Back through existing back controls and Repeat through current page voice", () => {
  assert.match(commands, /querySelectorAll\("\[data-pe-back-button\],button,a,\[role='button'\]"\)/);
  assert.match(commands, /PacificEducationMandatoryVoiceNavigation\.announceCurrentStep\(\)/);
  assert.match(commands, /data-pe-every-page-voice-button/);
  assert.match(commands, /PacEduVoiceSwitch\.stop\(\)/);
});

test("daily worksheets provide short action-based teacher steps for all supported subjects", () => {
  const daily = fs.readFileSync("src/js/paceduDailyWorksheetContent.js", "utf8");
  for (const subject of ["English", "Mathematics", "Science", "Social Studies", "Healthy Living", "Physical Education", "Arts and Crafts", "Music", "Digital Literacy", "iTaukei Language", "Hindi"]) {
    assert.match(daily, new RegExp('"' + subject.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + '": \\['));
  }
  assert.match(daily, /worksheet\.teacherInstructions =/);
  assert.match(daily, /worksheet\.dailyLesson\.teacherInstructions = worksheet\.teacherInstructions\.slice\(\)/);
  assert.match(daily, /SHORT_NUMBERED_ACTION_STEPS/);
});


test("every generated worksheet question has a worked example and accessible format options", () => {
  const daily = fs.readFileSync("src/js/paceduDailyWorksheetContent.js", "utf8");
  assert.match(daily, /var examples = questions\.map\(function\(q, i\)/);
  assert.match(daily, /workedAnswer: q\.answer/);
  assert.match(daily, /explanation: q\.why/);
  assert.match(daily, /showBeforeQuestion: true/);
  assert.match(daily, /exampleRequiredBeforeEachQuestion:true/);
  for (const format of ["text", "picture-or-object", "audio-read-aloud", "short-video-when-needed"]) {
    assert.ok(daily.includes(format), "missing example format: " + format);
  }
});


test("weekly curriculum activities include examples and teacher instructions", () => {
  const curriculum = fs.readFileSync("src/js/paceduFijiCurriculumWeeklyActivities.js", "utf8");
  const renderer = fs.readFileSync("src/js/pacificEducationEnglishWorksheetLibrary.js", "utf8");
  assert.match(curriculum, /var examples = questions\.map/);
  assert.match(curriculum, /teacherInstructions:\[/);
  assert.match(curriculum, /showBeforeQuestion:true/);
  assert.match(renderer, /Examples first — then try/);
  assert.match(renderer, /Now answer/);
});
