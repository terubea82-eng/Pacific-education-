const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const serviceWorker = fs.readFileSync("service-worker.js", "utf8");

test("service worker keeps the offline navigation fallback bounded", () => {
  assert.match(serviceWorker, /NAVIGATION_TIMEOUT_MS=6000/);
  assert.match(serviceWorker, /fetchWithTimeout\(request,NAVIGATION_TIMEOUT_MS\)/);
  assert.match(serviceWorker, /caches\.match\(ENTRY\)/);
  assert.match(serviceWorker, /status:503/);
});

test("service worker precaches the offline learning shell and sync dependencies", () => {
  assert.match(serviceWorker, /const CACHE_NAME="pacific-education-shell-v6"/);
  assert.match(serviceWorker, /src\/js\/pacificEducationOfflineRuntime\.js/);
  assert.match(serviceWorker, /src\/js\/pacificEducationOfflineSyncController\.js/);
  assert.match(serviceWorker, /src\/js\/pacificEducationPerformanceMonitor\.js/);
  assert.match(serviceWorker, /return self\.clients\.claim\(\)/);
});

test("service worker uses stable cache keys for versioned static assets", () => {
  assert.match(serviceWorker, /const cacheKey=new Request\(url\.origin\+url\.pathname/);
  assert.match(serviceWorker, /cache\.put\(cacheKey,response\.clone\(\)\)/);
  assert.match(serviceWorker, /fetch\(request,\{cache:"no-store"\}\)/);
});

test("service worker rejects cross-origin fetch handling", () => {
  assert.match(serviceWorker, /if\(url\.origin!==self\.location\.origin\)return;/);
});
