const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const installRuntime = fs.readFileSync(
  "src/js/pacificEducationPWAInstall.js",
  "utf8"
);

test("PWA install runtime handles browser install prompts", () => {
  assert.match(installRuntime, /beforeinstallprompt/);
  assert.match(installRuntime, /deferredPrompt=event/);
  assert.match(installRuntime, /promptEvent\.prompt\(\)/);
  assert.match(installRuntime, /appinstalled/);
});

test("PWA install runtime provides a browser-menu fallback", () => {
  assert.match(installRuntime, /installed from your browser menu/);
  assert.match(installRuntime, /Install or Add to Home Screen/);
});

test("PWA install runtime exposes accessible install status", () => {
  assert.match(installRuntime, /pacificEducationInstallStatus/);
  assert.match(installRuntime, /PacificEducationPWAInstall/);
  assert.match(installRuntime, /Enter/);
  assert.match(installRuntime, /Space/);
});
