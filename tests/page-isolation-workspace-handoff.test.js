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
  assert.match(index, /pacificEducationSequentialRoleWorkspaces\.js\?v=20261025-child-workspace-simple-v5/);
  assert.match(index, /pacificEducationMandatoryBoxSequence\.js\?v=20261018-registration-handoff-shell-release-v1/);
  assert.match(index, /pacificEducationPageIsolationRepair\.js\?v=20261018-workspace-handoff-shell-release-v1/);
  assert.match(serviceWorker, /const CACHE_NAME="pacific-education-shell-v25";/);
});

test("protected voice script references remain present", () => {
  assert.match(index, /pacificEducationSpeechVoice\.js/);
  assert.match(index, /pacificEducationMandatoryVoiceNavigation\.js/);
});

test("startup fallback preserves the sequential role workspace after registration handoff", () => {
  assert.ok(index.includes('var sequentialWorkspace = document.getElementById("pacificEducationSequentialRoleWorkspace")'));
  assert.ok(index.includes('sequentialWorkspace.getAttribute("data-pe-role")'));
  assert.ok(index.includes('body.classList.add("pe-guided-flow-ended", "pe-sequential-role-workspace-active")'));
  assert.ok(index.includes('root.setAttribute("data-pacedu-navigation-ready", "true")'));
  assert.ok(index.includes("sequentialWorkspace.contains(node)"));
});

test("startup fallback recovers a blank page when an advanced marker has no visible destination", () => {
  assert.match(index, /Recover only when no legitimate destination is visible/);
  assert.match(index, /visibleWorkspaceDestination = workspaceDestinations\.some/);
  assert.match(index, /visibleWorkspaceDestination\) return/);
});

test("advanced blank-page fallback restores Registration instead of Welcome", () => {
  assert.match(index, /var entryAdvanced = document\.documentElement\.getAttribute\("data-pacedu-entry-advanced"\) === "true"/);
  assert.match(index, /4:\s*"pacificEducationIdentityRegistration"/);
  assert.match(index, /var targetId = advancedDestinations\[activePage\] \|\| "pacificEducationIdentityRegistration"/);
  assert.match(index, /target\.hidden = false/);
  assert.match(index, /target\.style\.setProperty\("display", "block", "important"\)/);
  assert.match(index, /body\.setAttribute\("data-pe-initial-entry-fallback", "advanced-destination-restored"\)/);
});
