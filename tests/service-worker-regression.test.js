const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const serviceWorker = fs.readFileSync("service-worker.js", "utf8");

test("service worker precaches the current accessibility runtime", () => {
  assert.match(serviceWorker, /CACHE_NAME="pacific-education-shell-v26"/);
  assert.match(serviceWorker, /pacificEducationAccessibilityRuntime\.js/);
});

test("service worker cache keys preserve asset version query strings", () => {
  assert.match(serviceWorker, /url\.origin\+url\.pathname\+url\.search/);
  assert.doesNotMatch(serviceWorker, /const cacheKey=new Request\(url\.origin\+url\.pathname,/);
});

test("navigation pages keep separate offline cache entries and preserve the app entry", () => {
  assert.ok(serviceWorker.includes("const navigationCacheKey=new Request(url.origin+url.pathname"));
  assert.ok(serviceWorker.includes("cache=>cache.put(navigationCacheKey,copy)"));
  assert.ok(serviceWorker.includes("caches.match(navigationCacheKey)"));
  assert.ok(serviceWorker.includes("if(isAppEntry)"));
  assert.ok(!serviceWorker.includes("cache.put(ENTRY,copy)"));
  assert.ok(serviceWorker.includes('"/Pacific-education-/src/business-advertising.html"'));
  assert.ok(serviceWorker.includes('"/Pacific-education-/src/js/paceduBusinessAdvertising.js?v=20261026-business-advertising"'));
});
