const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const runtime = fs.readFileSync(
  "src/js/pacificEducationAccessibilityRuntime.js",
  "utf8"
);

test("accessibility runtime restricts text scaling to supported values", () => {
  assert.match(runtime, /\["normal","large","x-large"\]/);
  assert.match(runtime, /data-text-scale/);
});

test("accessibility runtime persists and restores text scale", () => {
  assert.match(runtime, /pacificEducationTextScale/);
  assert.match(runtime, /localStorage\.getItem/);
  assert.match(runtime, /localStorage\.setItem/);
  assert.match(runtime, /DOMContentLoaded/);
  assert.match(runtime, /setTextScale\(readScale\(\)\)/);
});

test("accessibility runtime persists and recognizes the UI voice preference", () => {
  assert.match(runtime, /pacificEducationVoicePreference/);
  assert.match(runtime, /value===\"voice\"/);
  assert.match(runtime, /setVoicePreference/);
  assert.match(runtime, /readVoicePreference/);
  assert.match(runtime, /voicePreference:readVoicePreference\(\)/);
});

test("accessibility runtime stores the UI-compatible voice preference values", () => {
  assert.match(runtime, /localStorage\.setItem\(VOICE_KEY,v\?\"voice\":\"text\"\)/);
  assert.match(runtime, /normalizeVoice\(value\)/);
});

test("accessibility runtime exposes speech controls and availability status", () => {
  assert.match(runtime, /speechSynthesis/);
  assert.match(runtime, /SpeechSynthesisUtterance/);
  assert.match(runtime, /stopSpeaking/);
  assert.match(runtime, /textToSpeechAvailable/);
});

test("accessibility runtime handles unavailable speech safely", () => {
  assert.match(runtime, /TEXT_TO_SPEECH_UNAVAILABLE/);
  assert.match(runtime, /if\(!text\|\|!window\.speechSynthesis\|\|!window\.SpeechSynthesisUtterance\)/);
});

test("accessibility runtime preserves production safety state", () => {
  assert.match(runtime, /humanTestingRequired:true/);
  assert.match(runtime, /productionApproved:false/);
  assert.match(runtime, /PacificEducationAccessibilityRuntime/);
});
