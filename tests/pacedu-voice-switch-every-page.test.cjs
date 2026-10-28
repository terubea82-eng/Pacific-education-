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
