const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const manifest = JSON.parse(fs.readFileSync("manifest.webmanifest", "utf8"));

test("PWA manifest keeps the education app within its GitHub Pages scope", () => {
  assert.equal(manifest.id, "/Pacific-education-/src/index.html");
  assert.equal(manifest.start_url, "/Pacific-education-/src/index.html");
  assert.equal(manifest.scope, "/Pacific-education-/");
  assert.equal(manifest.display, "standalone");
});

test("PWA manifest keeps learning shortcuts on live app anchors", () => {
  assert.ok(Array.isArray(manifest.shortcuts));
  const urls = manifest.shortcuts.map(shortcut => shortcut.url);
  assert.ok(urls.includes("/Pacific-education-/src/index.html#dailyLesson"));
  assert.ok(urls.includes("/Pacific-education-/src/index.html#assessments"));
});

test("PWA manifest provides installable education metadata and icons", () => {
  assert.equal(manifest.name, "Pacific Education");
  assert.equal(manifest.short_name, "Pacific Education");
  assert.equal(manifest.lang, "en");
  assert.equal(manifest.prefer_related_applications, false);
  assert.ok(Array.isArray(manifest.icons));
  assert.ok(manifest.icons.some(icon => icon.sizes === "192x192"));
  assert.ok(manifest.icons.some(icon => icon.sizes === "512x512"));
});
