const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const camera = fs.readFileSync(path.join(root, "src/js/pacificEducationCameraEvidence.js"), "utf8");
const runtime = fs.readFileSync(path.join(root, "src/js/pacificEducationLearnerActivityRuntime.js"), "utf8");
const queue = fs.readFileSync(path.join(root, "src/js/pacificEducationTeacherReviewQueue.js"), "utf8");
const index = fs.readFileSync(path.join(root, "src/index.html"), "utf8");

test("camera evidence requires roster-matched learner and class context", () => {
  assert.match(camera, /identityVerified !== true/);
  assert.match(camera, /assignmentStatus !== "roster-matched-prototype"/);
  assert.match(camera, /assigned\.studentRefs\.indexOf\(String\(c\.studentReference\)\) < 0/);
});

test("photo submissions remain pending and never claim automatic marking", () => {
  assert.match(camera, /reviewStatus: "pending-teacher-review"/);
  assert.match(camera, /autoMarkStatus: "not-auto-marked"/);
  assert.match(camera, /not automatically marked correct or sent to another device/);
  assert.match(camera, /Photo evidence pending teacher review; not auto-marked/);
});

test("photo evidence uses the active activity identity and exact subject/term context", () => {
  assert.match(runtime, /currentContext: function\(\) \{ return Object\.assign/);
  assert.match(camera, /activityId: activityId/);
  assert.match(camera, /subject: String\(ctx\.subjectId/);
  assert.match(camera, /term: String\(ctx\.term/);
});

test("teacher queue previews only strictly validated local image data", () => {
  assert.match(queue, /function safePhoto/);
  assert.match(queue, /Student work photo — teacher review required/);
  assert.match(queue, /Photo evidence is not automatically marked/);
  assert.match(queue, /img\.setAttribute\("src",photo\)/);
});

test("teacher review queue shows learner name and reference for camera evidence", () => {
  assert.match(queue, /x\.studentName\|\|x\.displayName\|\|x\.learnerNameOrReference/);
  assert.match(queue, /x\.studentReference\|\|x\.learnerReference/);
  assert.match(queue, /pe-review-learner-identity/);
  assert.match(queue, /Learner reference:/);
  assert.match(camera, /studentReference: learner\.studentReference/);
});

test("teacher queue renders submitted text as text and avoids HTML injection sinks", () => {
  assert.match(queue, /textContent=String\(text\)/);
  assert.match(queue, /root\.replaceChildren\(wrap\)/);
  assert.doesNotMatch(queue, /\.innerHTML\s*=/);
  assert.doesNotMatch(queue, /onclick\s*=/i);
  assert.match(queue, /addEventListener\("click"/);
});

test("camera evidence module is loaded after the learner activity runtime", () => {
  assert.match(index, /pacificEducationLearnerActivityRuntime\.js[^<]*<\/script><script src="js\/pacificEducationCameraEvidence\.js\?v=20261023-camera-evidence-review-v1"/);
});
