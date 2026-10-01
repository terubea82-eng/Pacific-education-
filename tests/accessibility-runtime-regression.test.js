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

test("accessibility runtime synchronizes the voice preference control", () => {
  assert.match(runtime, /pacificEducationVoicePreferenceButton/);
  assert.match(runtime, /aria-pressed/);
  assert.match(runtime, /syncVoiceControl/);
  assert.match(runtime, /Turn off voice preference/);
  assert.match(runtime, /Turn on voice preference to read choices aloud/);
});

test("accessibility runtime synchronizes the control after preference changes", () => {
  assert.match(runtime, /setVoicePreference\(enabled\).*syncVoiceControl\(\)/);
  assert.match(runtime, /voicePreferenceValue:readVoiceValue\(\)/);
  assert.match(runtime, /function readVoiceValue\(\)/);
});

test("accessibility runtime announces voice preference changes", () => {
  assert.match(runtime, /announce\(v\?\"Voice preference enabled\.\"\:\"Voice preference disabled\.\?"\)/);
  assert.match(runtime, /aria-live/);
  assert.match(runtime, /pacificEducationAccessibilityStatus/);
});

test("accessibility runtime fails safely when browser storage is unavailable", () => {
  assert.match(runtime, /try\{return normalizeScale\(window\.localStorage&&window\.localStorage\.getItem\(SCALE_KEY\)\);\}catch\(_\)\{return\"normal\";\}/);
  assert.match(runtime, /try\{return normalizeVoice\(window\.localStorage&&window\.localStorage\.getItem\(VOICE_KEY\)\);\}catch\(_\)\{return false;\}/);
  assert.match(runtime, /try\{if\(window\.localStorage\)window\.localStorage\.setItem\(VOICE_KEY,v\?\"voice\":\"text\"\);\}catch\(_\)\{\}/);
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


test("accessibility runtime synchronizes text scale across browser tabs", () => {
  assert.match(runtime, /event\.key===SCALE_KEY\|\|event\.key===null/);
  assert.match(runtime, /setTextScale\(readScale\(\)\)/);
});

test("accessibility runtime synchronizes voice preference across browser tabs", () => {
  assert.match(runtime, /function handleStorage\(event\)/);
  assert.match(runtime, /event\.key===VOICE_KEY\|\|event\.key===null/);
  assert.match(runtime, /syncVoiceControl\(\)/);
  assert.match(runtime, /Voice preference enabled in another tab\./);
  assert.match(runtime, /Voice preference disabled in another tab\./);
  assert.match(runtime, /addEventListener\("storage",handleStorage\)/);
});
