const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const page = fs.readFileSync("src/business-advertising.html", "utf8");
const script = fs.readFileSync("src/js/paceduBusinessAdvertising.js", "utf8");

test("business advertising page explains the pilot and does not claim live payment processing", () => {
  for (const phrase of ["Business & Product Advertising", "not publish an advert", "no payment is currently processed here"]) {
    assert.ok(page.includes(phrase), "missing page safeguard: " + phrase);
  }
  assert.match(page, /paceduBusinessAdvertising\.js\?v=/);
});

test("business draft form validates web links and remains local-only", () => {
  assert.match(script, /new URL\(value\)/);
  assert.match(script, /parsed\.protocol !== "https:" && parsed\.protocol !== "http:"/);
  assert.match(script, /localStorage\.setItem\(STORAGE_KEY/);
  assert.match(script, /PENDING_OWNER_REVIEW/);
  assert.doesNotMatch(script, /fetch\s*\(|XMLHttpRequest|paymentIntent|stripe\.confirm/);
});
