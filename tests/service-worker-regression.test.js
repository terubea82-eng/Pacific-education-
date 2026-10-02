const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const serviceWorker = fs.readFileSync("service-worker.js", "utf8");

test("service worker precaches the current accessibility runtime", () => {
  assert.match(serviceWorker, /CACHE_NAME="pacific-education-shell-v14"/);
  assert.match(serviceWorker, /pacificEducationAccessibilityRuntime\.js/);
});
