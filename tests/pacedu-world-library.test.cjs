const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const source = fs.readFileSync("src/js/paceduWorldLibrary.js", "utf8");
const html = fs.readFileSync("src/index.html", "utf8");

test("World Library provides age and curriculum level search plus global catalogue sources", () => {
  for (const text of ["World Library", "paceduLibraryTitle", "paceduLibraryAuthor", "paceduLibrarySubject", "paceduLibraryLevel", "ECE", "Form ", "Open Library", "Internet Archive", "Project Gutenberg", "Google Books"]) {
    assert.ok(source.includes(text), "missing expected library feature: " + text);
  }
});

test("World Library builds outbound links safely and does not claim every book is free", () => {
  assert.ok(source.includes("new URLSearchParams"));
  assert.ok(source.includes('link.rel = "noopener noreferrer"'));
  assert.ok(source.includes("Some books are free to read"));
  assert.ok(source.includes("provider’s terms"));
});

test("World Library script is loaded from the PacEdu page with a versioned cache key", () => {
  assert.match(html, /paceduWorldLibrary\.js\?v=20261025-world-library/);
});
