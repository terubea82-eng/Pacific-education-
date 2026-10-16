const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const controller = fs.readFileSync("src/js/pacificEducationSingleNavigationController.js", "utf8");
const sequential = fs.readFileSync("src/js/pacificEducationSequentialRoleWorkspaces.js", "utf8");

test("Learning Level recovery appears when the existing selector is present but disabled", () => {
  assert.match(controller, /host\.querySelector\("select:not\(:disabled\)"\)/);
  assert.match(controller, /function isRenderedLevelRecoveryHost\(host\)/);
  assert.match(controller, /if\(!isRenderedLevelRecoveryHost\(host\)\) host=el\("levelSelection"\)/, "recovery must mount in the active Learning Level page when the selector host is missing or hidden");
  assert.match(controller, /existingSelect\.getClientRects\(\)\.length>0/);
  assert.match(controller, /style\.visibility==="hidden"/);
  assert.match(controller, /Number\(style\.opacity\)===0/);
  assert.match(controller, /style\.overflowX==="hidden"/);
  assert.match(controller, /style\.overflowY==="clip"/);
  assert.match(controller, /childRect\.right<=clipLeft/);
  assert.match(controller, /while\(selectorIsVisible && node\)/, "visibility check must inspect ancestors above the selector host");
  assert.match(controller, /if\(selectorIsVisible\) return/);
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


test("sequential workspace provides an independent visible Learning Level recovery if selector rendering fails", () => {
  const sequential = fs.readFileSync("src/js/pacificEducationSequentialRoleWorkspaces.js", "utf8");
  assert.match(sequential, /function ensureSequentialLevelRecovery\(target,page\)/);
  assert.match(sequential, /existingSelect\.getClientRects\(\)\.length>0/);
  assert.match(sequential, /selectorStyle\.visibility!=="hidden"/);
  assert.match(sequential, /data-pe-level-recovery.*sequential/);
  assert.match(sequential, /peSequentialLearningLevelRecoverySelect/);
  assert.match(sequential, /if\(item\[0\]==="levelSelection"\) ensureSequentialLevelRecovery\(target,page\)/);
  assert.match(sequential, /does not verify a teacher-assigned class/);
});
