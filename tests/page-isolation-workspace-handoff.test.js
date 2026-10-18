const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const isolation = fs.readFileSync(path.join(root, "src/js/pacificEducationPageIsolationRepair.js"), "utf8");
const index = fs.readFileSync(path.join(root, "src/index.html"), "utf8");
const serviceWorker = fs.readFileSync(path.join(root, "service-worker.js"), "utf8");

test("registration shell is restored when guided flow ends for workspace handoff", () => {
  assert.match(isolation, /!body\.classList\.contains\("pe-guided-flow"\) && registrationShellState\.length/);
  assert.match(isolation, /setRegistrationShellHidden\(false\);/);
  assert.match(isolation, /attributeFilter:\["data-pe-active-guided-page","data-pe-flow-step","class"\]/);
});

test("handoff assets and offline cache are versioned", () => {
  assert.match(index, /pacificEducationMandatoryBoxSequence\.js\?v=20261018-registration-handoff-shell-release-v1/);
  assert.match(index, /pacificEducationPageIsolationRepair\.js\?v=20261018-workspace-handoff-shell-release-v1/);
  assert.match(serviceWorker, /const CACHE_NAME="pacific-education-shell-v23";/);
});

test("protected voice script references remain present", () => {
  assert.match(index, /pacificEducationSpeechVoice\.js/);
  assert.match(index, /pacificEducationMandatoryVoiceNavigation\.js/);
});
