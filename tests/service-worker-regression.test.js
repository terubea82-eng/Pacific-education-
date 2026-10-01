const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const serviceWorker = fs.readFileSync("service-worker.js", "utf8");

test("service worker precaches accessibility voice runtime", () => {
  assert.match(
    serviceWorker,
    /\/Pacific-education-\/src\/js\/pacificEducationAccessibilityRuntime\.js/
  );
  assert.match(
    serviceWorker,
    /\/Pacific-education-\/src\/js\/pacificEducationUniversalButtonVoice\.js/
  );
});

test("service worker keeps bounded navigation fallback", () => {
  assert.match(serviceWorker, /NAVIGATION_TIMEOUT_MS=6000/);
  assert.match(serviceWorker, /caches\.match\(ENTRY\)/);
  assert.match(serviceWorker, /status:503/);
});

test("service worker isolates cross-origin requests", () => {
  assert.match(serviceWorker, /if\(url\.origin!==self\.location\.origin\)return;/);
});

test("service worker uses stable cache keys for versioned static assets", () => {
  assert.match(serviceWorker, /const cacheKey=new Request\(url\.origin\+url\.pathname/);
  assert.match(serviceWorker, /cache\.put\(cacheKey,response\.clone\(\)\)/);
});


test("service worker bumps its shell cache when the offline shell changes", () => {
  assert.match(serviceWorker, /CACHE_NAME="pacific-education-shell-v7"/);
});


test("service worker removes superseded Pacific Education shell caches", () => {
  assert.match(serviceWorker, /k\.indexOf\("pacific-education-shell-"\)===0/);
  assert.match(serviceWorker, /k!==CACHE_NAME/);
  assert.match(serviceWorker, /caches\.delete\(k\)/);
});
