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

test("accessibility runtime exposes speech controls and availability status", () => {
  assert.match(runtime, /speechSynthesis/);
  assert.match(runtime, /SpeechSynthesisUtterance/);
  assert.match(runtime, /stopSpeaking/);
  assert.match(runtime, /textToSpeechAvailable/);
});

test("accessibility runtime preserves production safety state", () => {
  assert.match(runtime, /humanTestingRequired:true/);
  assert.match(runtime, /productionApproved:false/);
  assert.match(runtime, /PacificEducationAccessibilityRuntime/);
});
