const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const controller = fs.readFileSync(
  "src/js/pacificEducationOfflineSyncController.js",
  "utf8"
);
const guidance = fs.readFileSync(
  "docs/LOW-CONNECTIVITY-TESTING.md",
  "utf8"
);

test("conflict review exposes a semantic conflict list", () => {
  assert.match(controller, /data-pacific-conflict-list/);
  assert.match(controller, /<h3>Sync conflict review<\/h3>/);
  assert.match(controller, /<ul[^>]*aria-label="Queued sync conflicts"/);
  assert.match(controller, /Needs review/);
  assert.match(controller, /Reviewed — data preserved/);
});

test("conflict controls meet the mobile touch-target and wrapping rules", () => {
  assert.match(controller, /min-width:\s*44px/);
  assert.match(controller, /min-height:\s*44px/);
  assert.match(controller, /@media\(max-width:600px\)/);
  assert.match(controller, /overflow-wrap:\s*anywhere/);
  assert.match(controller, /@media\(prefers-reduced-motion:reduce\)/);
});

test("conflict review remains a data-preserving manual gate", () => {
  assert.match(controller, /MANUAL_CONFLICT_REVIEW_REQUIRED/);
  assert.match(controller, /data-reviewed/);
  assert.match(controller, /queue preserved/i);
  assert.match(guidance, /Test 7 — Mobile\/accessibility conflict review/);
  assert.match(guidance, /controls at least approx 44px/);
  assert.match(guidance, /reviewing does not delete\/rewrite queue/);
});
