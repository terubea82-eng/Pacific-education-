const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

function loadPrototype() {
  const storage = new Map();
  const listeners = {};
  const document = {
    readyState: "complete",
    head: { appendChild() {} },
    getElementById() { return null; },
    createElement() {
      return {
        setAttribute() {},
        appendChild() {},
        addEventListener() {},
        style: {},
        textContent: "",
        innerHTML: "",
        hidden: false
      };
    }
  };
  const window = {
    navigator: { onLine: true },
    localStorage: {
      getItem(key) { return storage.has(key) ? storage.get(key) : null; },
      setItem(key, value) { storage.set(key, String(value)); },
      removeItem(key) { storage.delete(key); }
    },
    addEventListener(type, fn) {
      (listeners[type] ||= []).push(fn);
    },
    dispatchEvent() { return true; },
    CustomEvent: function(type, init) { this.type = type; this.detail = init && init.detail; },
    document,
    setTimeout,
    clearTimeout
  };
  const context = { window, document, navigator: window.navigator, localStorage: window.localStorage, console, setTimeout, clearTimeout };
  context.globalThis = context;
  const runtimeCode = fs.readFileSync("src/js/pacificEducationOfflineRuntime.js", "utf8");
  const controllerCode = fs.readFileSync("src/js/pacificEducationOfflineSyncController.js", "utf8");
  vm.runInNewContext(runtimeCode, context, { filename: "pacificEducationOfflineRuntime.js" });
  vm.runInNewContext(controllerCode, context, { filename: "pacificEducationOfflineSyncController.js" });
  return { window, storage };
}

test("offline runtime rejects invalid day numbers", () => {
  const { window } = loadPrototype();
  const result = window.PacificEducationOfflineRuntime.queueProgress({
    lessonId: "math-1",
    dayNumber: 0,
    completed: false
  });
  assert.equal(result.success, false);
  assert.equal(result.reason, "INVALID_PROTOTYPE_QUEUE_ITEM");
});

test("offline runtime suppresses exact duplicate progress events", () => {
  const { window } = loadPrototype();
  const item = { type: "progress", lessonId: "math-1", dayNumber: 1, completed: true };
  const first = window.PacificEducationOfflineRuntime.queueProgress(item);
  const second = window.PacificEducationOfflineRuntime.queueProgress(item);
  assert.equal(first.success, true);
  assert.equal(second.duplicate, true);
  assert.equal(window.PacificEducationOfflineRuntime.getQueueStatus().count, 1);
});

test("conflicting completion states require manual review before retry", () => {
  const { window } = loadPrototype();
  const runtime = window.PacificEducationOfflineRuntime;
  runtime.queueProgress({ type: "progress", lessonId: "math-1", dayNumber: 2, completed: false });
  runtime.queueProgress({ type: "progress", lessonId: "math-1", dayNumber: 2, completed: true });

  const summary = window.PacificEducationOfflineSyncController.conflictSummary();
  assert.equal(summary.count, 1);
  assert.equal(summary.pendingCount, 1);
  assert.equal(summary.requiresManualReview, true);

  const blocked = window.PacificEducationOfflineSyncController.canRetrySync(0);
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.reason, "MANUAL_CONFLICT_REVIEW_REQUIRED");

  const review = window.PacificEducationOfflineSyncController.markConflictReviewed(summary.conflicts[0].key);
  assert.equal(review.success, true);

  const afterReview = window.PacificEducationOfflineSyncController.conflictSummary();
  assert.equal(afterReview.pendingCount, 0);
  assert.equal(afterReview.requiresManualReview, false);

  const retry = window.PacificEducationOfflineSyncController.canRetrySync(0);
  assert.equal(retry.allowed, true);

  assert.equal(runtime.getQueueStatus().count, 2);
});

test("requiring review again restores the retry gate without changing queued data", () => {
  const { window } = loadPrototype();
  const runtime = window.PacificEducationOfflineRuntime;
  runtime.queueProgress({ type: "progress", lessonId: "math-2", dayNumber: 3, completed: false });
  runtime.queueProgress({ type: "progress", lessonId: "math-2", dayNumber: 3, completed: true });

  const summary = window.PacificEducationOfflineSyncController.conflictSummary();
  const key = summary.conflicts[0].key;
  window.PacificEducationOfflineSyncController.markConflictReviewed(key);
  const before = runtime.getQueueStatus().items;

  const reset = window.PacificEducationOfflineSyncController.clearConflictReview(key);
  assert.equal(reset.success, true);

  const after = runtime.getQueueStatus().items;
  assert.deepEqual(after, before);
  assert.equal(window.PacificEducationOfflineSyncController.canRetrySync(0).reason, "MANUAL_CONFLICT_REVIEW_REQUIRED");
});

test("offline state blocks retry even after conflicts are reviewed", () => {
  const { window } = loadPrototype();
  window.navigator.onLine = false;
  const result = window.PacificEducationOfflineSyncController.canRetrySync(0);
  assert.equal(result.allowed, false);
  assert.equal(result.reason, "OFFLINE");
});
