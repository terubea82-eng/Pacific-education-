const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "src/js/paceduEducationResources.js"), "utf8");
const html = fs.readFileSync(path.join(root, "src/index.html"), "utf8");
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));

test("education resource hub contains official country and global education sources", () => {
  for (const url of [
    "https://www.education.gov.fj/",
    "https://tsls.com.fj/",
    "https://apply.tsls.com.fj/",
    "https://openlearning.unesco.org/",
    "https://www.chevening.org/apply/",
    "https://www.nzscholarships.govt.nz/",
    "https://openstax.org/"
  ]) assert.ok(source.includes(url), url);
});

test("users can filter resources by country, type and keyword", () => {
  assert.match(source, /perCountry/);
  assert.match(source, /perCategory/);
  assert.match(source, /perSearch/);
  assert.match(source, /function renderResults\(\)/);
  assert.match(source, /Open official resource/);
});

test("resource hub warns that eligibility and dates change and never claims complete live coverage", () => {
  assert.match(source, /Deadlines, eligibility and fees can change/);
  assert.match(source, /not a guarantee of funding or admission/);
  assert.match(source, /No matching links in this starter directory/);
});

test("resource script is loaded once and its regression test is in npm test", () => {
  assert.equal((html.match(/paceduEducationResources\.js/g) || []).length, 1);
  assert.match(pkg.scripts.test, /pacedu-education-resources\.test\.cjs/);
});
