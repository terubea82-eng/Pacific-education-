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
  assert.match(controller, /heading\.textContent="Sync conflict review"/);
  assert.match(controller, /list\.setAttribute\("aria-label","Queued sync conflicts"\)/);
  assert.match(controller, /status\.textContent=conflict\.reviewed\?"Reviewed — data preserved":"Needs review"/);
  assert.match(controller, /row\.setAttribute\("data-reviewed",conflict\.reviewed\?"true":"false"\)/);
});

test("conflict controls meet the mobile touch-target and wrapping rules", () => {
  assert.match(controller, /button\.type="button"/);
  assert.match(controller, /min-width:\s*44px/);
  assert.match(controller, /min-height:\s*44px/);
  assert.match(controller, /@media\(max-width:600px\)/);
  assert.match(controller, /overflow-wrap:\s*anywhere/);
  assert.match(controller, /@media\(prefers-reduced-motion:reduce\)/);
  assert.match(controller, /button\.setAttribute\("aria-label"/);
  assert.match(controller, /button:focus-visible/);
});

test("conflict review remains a data-preserving manual gate", () => {
  assert.match(controller, /MANUAL_CONFLICT_REVIEW_REQUIRED/);
  assert.match(controller, /data-reviewed/);
  assert.match(controller, /queuePreserved:true/);
  assert.match(guidance, /Test 7 — Mobile\/accessibility conflict review/);
  assert.match(guidance, /controls are at least approximately 44px high\/wide/);
  assert.match(guidance, /does not delete or rewrite either queued record/);
});
