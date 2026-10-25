const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const source = fs.readFileSync("src/js/paceduSkillsEarnWorkspace.js", "utf8");
const html = fs.readFileSync("src/index.html", "utf8");

test("Skills & Earn workspace supports skill planning, portfolio notes and private adult listing drafts", () => {
  for (const phrase of ["My Skills & Earn", "paceduSkillGoal", "paceduSkillPractice", "paceduSkillPortfolio", "Save private listing draft", "private-draft"]) {
    assert.ok(source.includes(phrase), "missing expected skill workspace feature: " + phrase);
  }
});

test("Learner roles cannot create seller listings and prototype does not claim live payments", () => {
  assert.ok(source.includes('var learnerRoles = ["student", "blind-learner", "deaf-learner"]'));
  assert.ok(source.includes("cannot publish sales listings or receive payments"));
  assert.ok(source.includes("no order, payment or payout can happen in PacEdu yet"));
  assert.ok(source.includes("secure accounts, moderation, buyer protection, refunds"));
});

test("Skill workspace reports device-only saving and script is versioned in index", () => {
  assert.ok(source.includes("stored only in this browser/device"));
  assert.match(html, /paceduSkillsEarnWorkspace\.js\?v=20261025-skills-earn/);
});
