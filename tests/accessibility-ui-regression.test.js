const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const html = fs.readFileSync("src/index.html", "utf8");
const runtime = fs.readFileSync(
  "src/js/pacificEducationAccessibilityRuntime.js",
  "utf8"
);

test("index loads the accessibility runtime", () => {
  assert.match(
    html,
    /<script[^>]+src=["'](?:\.\.\/)?src\/js\/pacificEducationAccessibilityRuntime\.js[?"][^>]*>/
  );
});

test("index exposes an accessible live status target", () => {
  assert.match(html, /id=["']pacificEducationAccessibilityStatus["']/);
  assert.match(html, /aria-live=["']polite["']/);
});

test("index keeps accessibility controls keyboard operable", () => {
  assert.match(html, /id=["']pacificEducationStopSpeechButton["']/);
  assert.match(html, /type=["']button["']/);
});

test("index exposes speech stop and text-scale integration", () => {
  assert.match(html, /id=["']pacificEducationStopSpeechButton["']/);
  assert.match(html, /(?:data-text-scale|textScale|text-scale|large|x-large)/i);
});

test("voice preference runtime is wired and exposes synchronization methods", () => {
  assert.match(runtime, /PacificEducationAccessibilityRuntime/);
  assert.match(runtime, /readVoicePreference/);
  assert.match(runtime, /setVoicePreference/);
  assert.match(runtime, /aria-pressed/);
  assert.match(runtime, /Turn off voice preference/);
  assert.match(runtime, /Turn on voice preference to read choices aloud/);
});

test("accessibility UI exposes speech status and stop control semantics", () => {
  assert.match(html, /id=["']pacificEducationAccessibilityStatus["'][^>]*role=["']status["']/);
  assert.match(html, /id=["']pacificEducationStopSpeechButton["']/);
  assert.match(html, /aria-label=["'][^"']*Stop[^"']*speech[^"']*["']/i);
});

test("voice preference runtime retains a safe storage fallback", () => {
  assert.match(runtime, /localStorage/);
  assert.match(runtime, /pacificEducationVoicePreference/);
  assert.match(runtime, /setVoicePreference/);
  assert.match(runtime, /try\{[^}]*localStorage[^}]*\}catch\(_\)\{\}/);
});
