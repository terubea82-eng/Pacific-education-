const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const controller = fs.readFileSync("src/js/pacificEducationSingleNavigationController.js", "utf8");
const sequential = fs.readFileSync("src/js/pacificEducationSequentialRoleWorkspaces.js", "utf8");

test("Learning Level recovery appears when the existing selector is present but disabled", () => {
  assert.match(controller, /host\.querySelector\("select:not\(:disabled\)"\)/);
  assert.match(controller, /Recovery selector is active because the normal selector did not render/);
  assert.match(controller, /This pilot choice does not verify a teacher-assigned class/);
});

test("sequential role workspace explicitly reveals the active moved page and retries Learning Level recovery", () => {
  assert.match(sequential, /page\.style\.setProperty\("display","block","important"\)/);
  assert.match(sequential, /page\.style\.setProperty\("visibility","visible","important"\)/);
  assert.match(sequential, /target\.style\.setProperty\("display","block","important"\)/);
  assert.match(sequential, /target\.style\.setProperty\("visibility","visible","important"\)/);
  assert.match(sequential, /refreshFeatureForTarget\("levelSelection"\)/);
});
