const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const entry = fs.readFileSync("src/js/pacificEducationSinglePilotEntry.js", "utf8");
const sequential = fs.readFileSync("src/js/pacificEducationSequentialRoleWorkspaces.js", "utf8");
const html = fs.readFileSync("src/index.html", "utf8");

test("student registration can continue when a Class Reference has not been created", () => {
  assert.doesNotMatch(entry, /Select an existing Class Reference before entering this class-based pilot workspace/);
  assert.match(entry, /Student registration must not be blocked by a missing Class Reference/);
  assert.match(entry, /individual class assignment is not available in this pilot entry yet/);
});

test("student workspace home provides a session identity and class-level entry panel", () => {
  assert.match(sequential, /peStudentWorkspaceEntry/);
  assert.match(sequential, /Student Sign In & My Class \/ Year Level/);
  assert.match(sequential, /peStudentWorkspaceIdentity/);
  assert.match(sequential, /peStudentWorkspaceClass/);
  assert.match(sequential, /Sign In to My Workspace/);
  assert.match(sequential, /Choose a class level before continuing/);
  assert.match(sequential, /next\.disabled=!context/);
});

test("student identity and chosen class are retained across workspace pages only for the active session", () => {
  assert.match(sequential, /var STUDENT_CONTEXT_KEY = "paceduActiveStudentContextV1"/);
  assert.match(sequential, /sessionStorage\.setItem\(STUDENT_CONTEXT_KEY,JSON\.stringify\(savedContext\)\)/);
  assert.match(sequential, /renderStudentContextBanner\(page,role\)/);
  assert.match(sequential, /My Workspace: "\+context\.displayName\+" • "\+context\.classLevel/);
  assert.match(sequential, /teacher-confirmed class assignment is not verified in this build/);
  assert.match(sequential, /function lockStudentClassSelectors\(page,role,context\)/);
  assert.match(sequential, /This workspace session stays on/);
  assert.match(sequential, /SESSION_KEYS = \["paceduActiveStudentContextV1"/);
});

test("student class selection does not pretend a global roster choice is an individual assignment", () => {
  assert.match(entry, /A global teacher roster selection is not proof of individual assignment/);
  assert.doesNotMatch(entry, /localStorage\.setItem\("pacificEducationLevel", String\(studentClass\.level\)\)/);
  assert.match(sequential, /assignmentStatus:"demo-unverified"/);
});

test("student sign-out clears the active student context and active class, not saved progress", () => {
  assert.match(sequential, /SESSION_KEYS\.forEach\(function\(key\)\{try\{sessionStorage\.removeItem\(key\);\}catch\(e\)\{\}\}\)/);
  assert.match(sequential, /if\(LEARNER_ROLES\[role\]\) localStorage\.removeItem\("pacificEducationLevel"\)/);
  assert.match(sequential, /Saved registration and learning progress are retained on this device/);
});

test("updated entry scripts receive a cache-busting query while preserving the existing navigation check", () => {
  assert.match(html, /pacificEducationSequentialRoleWorkspaces\.js\?v=20261019-workspace-home-cache-bust-v1&student-session-context=20261019-v1/);
  assert.match(html, /pacificEducationSinglePilotEntry\.js\?v=20261006-single-entry-2&student-session-context=20261019-v1/);
});
