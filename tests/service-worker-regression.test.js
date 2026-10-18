const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const serviceWorker = fs.readFileSync("service-worker.js", "utf8");

test("service worker precaches the current accessibility runtime", () => {
  assert.match(serviceWorker, /CACHE_NAME="pacific-education-shell-v25"/);
  assert.match(serviceWorker, /pacificEducationAccessibilityRuntime\.js/);
});

test("service worker cache keys preserve asset version query strings", () => {
  assert.match(serviceWorker, /url\.origin\+url\.pathname\+url\.search/);
  assert.doesNotMatch(serviceWorker, /const cacheKey=new Request\(url\.origin\+url\.pathname,/);
});
