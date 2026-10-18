const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const index = fs.readFileSync("src/index.html", "utf8");
const guard = fs.readFileSync("src/js/pacificEducationVisibleWorkspaceHandoffGuard.js", "utf8");

test("visible workspace handoff guard is loaded after page isolation repair", () => {
  const isolation = index.indexOf("pacificEducationPageIsolationRepair.js");
  const recovery = index.indexOf("pacificEducationVisibleWorkspaceHandoffGuard.js");
  assert.ok(isolation >= 0, "page isolation repair remains wired");
  assert.ok(recovery > isolation, "handoff guard runs after page isolation repair");
});

test("handoff guard waits until registration Next handlers have run", () => {
  assert.match(guard, /closest\("#registrationNextButton"\)/);
  assert.match(guard, /setTimeout\(recover, 80\)/);
  assert.match(guard, /setTimeout\(recover, 450\)/);
});

test("handoff guard tries the existing role workspace before creating recovery UI", () => {
  assert.match(guard, /PacificEducationSequentialRoleWorkspaces/);
  assert.match(guard, /api\.build\(role\)/);
  assert.match(guard, /pacificEducationSequentialRoleWorkspace/);
  assert.match(guard, /paceduRecoveredWorkspaceHome/);
});

test("fallback includes a real student learning activity and usable navigation", () => {
  assert.match(guard, /Daily Learning Activity — Starter/);
  assert.match(guard, /Back/);
  assert.match(guard, /Next — Daily Activity/);
  assert.match(guard, /teacher to confirm your class, subject and term/);
});

test("handoff recovery releases entry-page isolation before showing workspace", () => {
  assert.match(guard, /data-pacedu-navigation-ready/);
  assert.match(guard, /pe-guided-flow-ended/);
  assert.match(guard, /remove\("pe-guided-flow", "pacedu-entry-mode", "pacedu-registration-mode"\)/);
});
