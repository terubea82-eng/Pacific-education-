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
  assert.match(serviceWorker, /const navigationCacheKey\\s*=\\s*new Request\\(url\\.origin\\+url\\.pathname/);
  assert.match(serviceWorker, /cache\\.put\\(navigationCacheKey,copy\\)/);
  assert.match(serviceWorker, /caches\\.match\\(navigationCacheKey\\)/);
  assert.match(serviceWorker, /if\\(isAppEntry\\)/);
  assert.doesNotMatch(serviceWorker, /cache\\.put\\(ENTRY,copy\\)/);
  assert.match(serviceWorker, /src\\/business-advertising\\.html/);
  assert.match(serviceWorker, /paceduBusinessAdvertising\\.js\\?v=20261026-business-advertising/);
});
