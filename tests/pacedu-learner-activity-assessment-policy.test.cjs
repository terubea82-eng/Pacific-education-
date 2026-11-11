const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync("src/js/pacificEducationLearnerActivityRuntime.js", "utf8");

function loadRuntime() {
  const window = {};
  const localStorage = { getItem() { return null; }, setItem() {} };
  vm.runInNewContext(source, {
    window,
    document: {},
    localStorage,
    Date,
    Math,
    JSON,
    String,
    Number,
    Array,
    Object
  });
  return window.PacificEducationActivity;
}

test("only keyed multiple-choice and true/false answers can be auto-scored", () => {
  const activity = loadRuntime();
  const ctx = { answerKey: "B" };
  assert.deepEqual(
    JSON.parse(JSON.stringify(activity.assessmentPolicy("multiple_choice", "b", ctx, false))),
    { status: "auto-scored", evidenceType: "daily-assessment", score: 100, assessed: true }
  );
  assert.equal(activity.assessmentPolicy("multiple_choice", "A", ctx, false).score, 0);
  assert.equal(activity.assessmentPolicy("true_false", "True", { answerKey: "true" }, false).score, 100);
});

test("matching and free-response answers remain pending teacher review even when a key exists", () => {
  const activity = loadRuntime();
  for (const type of ["matching", "short_answer", "long_answer"]) {
    const result = activity.assessmentPolicy(type, "learner response", { answerKey: "learner response" }, false);
    assert.equal(result.status, "pending-teacher-review", type);
    assert.equal(result.evidenceType, "daily-practice", type);
    assert.equal(result.score, null, type);
    assert.equal(result.assessed, false, type);
  }
});

test("verified voice responses always remain pending teacher review", () => {
  const activity = loadRuntime();
  const result = activity.assessmentPolicy("multiple_choice", "B", { answerKey: "B" }, true);
  assert.equal(result.status, "pending-teacher-review");
  assert.equal(result.score, null);
  assert.equal(result.assessed, false);
});

test("unfinished learner answers are scoped to a verified learner and exact activity/question", () => {
  assert.ok(source.includes("function draftStorageKey(ctx, type)"));
  assert.ok(source.includes('ctx.identityStatus !== "roster-matched-prototype"'));
  assert.ok(source.includes("ctx.studentId, ctx.classId, ctx.level, ctx.subjectId, ctx.term,"));
  assert.ok(source.includes("ctx.dayNumber, ctx.activityId, ctx.questionId, type"));
});

test("learner activity restores saved text, matching entries, and selected objective answers", () => {
  assert.ok(source.includes("var savedDraft = readDraft(active.context, type)"));
  assert.ok(source.includes('restoreWritten.value = String(savedDraft.response || "")'));
  assert.ok(source.includes("savedDraft.matchingAnswers"));
  assert.ok(source.includes("savedDraft.selectedChoice"));
  assert.ok(source.includes("savedDraft.trueFalse"));
});

test("learner text and matching drafts autosave during input and change, and clear only after a successful submission", () => {
  assert.ok(source.includes('addEventListener("input", persistCurrentDraft)'));
  assert.ok(source.includes('addEventListener("change", persistCurrentDraft)'));
  const saveIndex = source.indexOf("var saved = save(type, response, audio, ctx, verifiedVoice);");
  const failureIndex = source.indexOf("if (!saved) {", saveIndex);
  const clearIndex = source.indexOf("clearDraft(ctx, type)", failureIndex);
  assert.ok(saveIndex >= 0 && failureIndex > saveIndex && clearIndex > failureIndex);
  assert.ok(source.includes("Unfinished answer saved on this device"));
});

test("a failed primary response save keeps the unfinished draft for retry", () => {
  assert.ok(source.includes("localStorage.setItem(key, JSON.stringify(items.slice(-500)));"));
  assert.ok(source.includes("} catch (storageError) {\n      return false;"));
  assert.ok(source.includes("if (!saved) {"));
  assert.ok(source.includes("Your unfinished answer has been kept on this device"));
});

test("optional audio mirror storage failure does not invalidate the already-saved primary answer", () => {
  const audioMirrorWrite = source.indexOf("try { localStorage.setItem(homeKey, JSON.stringify(home.slice(-100))); } catch (homeStorageError) {}");
  const primaryWrite = source.indexOf("localStorage.setItem(key, JSON.stringify(items.slice(-500)));");
  assert.ok(primaryWrite >= 0 && audioMirrorWrite > primaryWrite);
  assert.ok(source.includes("A failure to mirror audio into the optional home-submissions list must"));
});

test("saved learner response records preserve exact activity, question, and sequence identity", () => {
  assert.ok(source.includes("activityId: ctx.activityId || (\"daily-activity-\" + type + \"-day-\" + ctx.dayNumber)"));
  assert.ok(source.includes("questionId: ctx.questionId || null"));
  assert.ok(source.includes("questionSequenceId: ctx.sequenceId || null"));
  assert.ok(source.includes("questionSequencePosition: ctx.sequencePosition"));
  assert.ok(source.includes("questionSequenceVersion: ctx.sequenceVersion"));
  assert.ok(source.includes("sequenceId: source.sequenceId || lesson && lesson.questionSequenceId || null"));
  assert.ok(source.includes("activityId: (active.context && active.context.activityId)"));
});
