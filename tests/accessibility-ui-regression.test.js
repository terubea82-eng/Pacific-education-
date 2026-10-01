const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const html = fs.readFileSync("src/index.html", "utf8");

test("index loads the accessibility runtime", () => {
  assert.match(
    html,
    /<script[^>]+src=["']js\/pacificEducationAccessibilityRuntime\.js["'][^>]*>/
  );
});

test("index exposes an accessible live status target", () => {
  assert.match(html, /id=["']pacificEducationAccessibilityStatus["']/);
  assert.match(html, /aria-live=["']polite["']/);
});

test("index keeps accessibility controls keyboard operable", () => {
  assert.match(html, /aria-label=["'][^"']*Voice preference[^"']*["']/i);
  assert.match(html, /type=["']button["']/);
});

test("index exposes speech stop and text-scale integration", () => {
  assert.match(html, /id=["']pacificEducationStopSpeechButton["']/);
  assert.match(html, /(?:data-text-scale|textScale|text-scale|large|x-large)/i);
});

test("voice preference UI synchronizes with the accessibility runtime", () => {
  assert.match(html, /PacificEducationAccessibilityRuntime/);
  assert.match(html, /readVoicePreference/);
  assert.match(html, /setVoicePreference/);
  assert.match(html, /aria-pressed/);
  assert.match(html, /Turn off voice preference/);
  assert.match(html, /Turn on voice preference to read choices aloud/);
});

test("voice preference UI retains a safe storage fallback", () => {
  assert.match(html, /localStorage\.setItem\("pacificEducationVoicePreference",next\?"voice":"text"\)/);
  assert.match(html, /localStorage\.getItem\("pacificEducationVoicePreference"\)==="voice"/);
  assert.match(html, /try\{[^}]*localStorage[^}]*\}catch\(_\)\{\}/);
});
