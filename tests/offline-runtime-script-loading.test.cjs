const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const html = fs.readFileSync("src/index.html", "utf8");
const worker = fs.readFileSync("service-worker.js", "utf8");

test("the app loads offline progress runtime before its sync controller", () => {
  const runtime = html.indexOf('src="js/pacificEducationOfflineRuntime.js?');
  const sync = html.indexOf('src="js/pacificEducationOfflineSyncController.js?');
  assert.ok(runtime >= 0, "offline progress runtime must be loaded by the app entry page");
  assert.ok(sync > runtime, "sync controller must load after the runtime it depends on");
});

test("offline queue scripts load before connectivity status initialization", () => {
  const sync = html.indexOf('src="js/pacificEducationOfflineSyncController.js?');
  const connectivity = html.indexOf('src="js/pacificEducationConnectivity.js?');
  assert.ok(connectivity > sync, "connectivity initialization must run after offline queue dependencies");
});

test("service worker precaches both offline queue scripts", () => {
  assert.match(worker, /\/src\/js\/pacificEducationOfflineRuntime\.js/);
  assert.match(worker, /\/src\/js\/pacificEducationOfflineSyncController\.js/);
});
