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
