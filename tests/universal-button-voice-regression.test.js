const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const runtime = fs.readFileSync(
  "src/js/pacificEducationUniversalButtonVoice.js",
  "utf8"
);

test("universal button voice uses semantic speaker controls", () => {
  assert.match(runtime, /speaker\.type="button"/);
  assert.match(runtime, /speaker\.setAttribute\("aria-label","Speak button:/);
  assert.match(runtime, /speaker\.setAttribute\("title","Speak this button"\)/);
});

test("universal button voice keeps touch targets accessible", () => {
  assert.match(runtime, /speaker\.style\.minWidth="44px"/);
  assert.match(runtime, /speaker\.style\.minHeight="44px"/);
});

test("universal button voice avoids recursive speaker binding", () => {
  assert.match(runtime, /pacific-voice-speaker/);
  assert.match(runtime, /pacific-voice-next-directive/);
  assert.match(runtime, /new WeakSet/);
  assert.match(runtime, /MutationObserver/);
});

test("dedicated voice controls do not receive duplicate speaker buttons", () => {
  assert.match(runtime, /pacificEducationWelcomeVoiceButton/);
  assert.match(runtime, /pacificEducationStopSpeechButton/);
  assert.match(runtime, /pacificEducationInstallButton/);
  assert.match(runtime, /dedicatedVoiceButtons\[button\.id\]/);
});
