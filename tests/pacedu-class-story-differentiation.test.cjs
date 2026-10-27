const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync("src/js/pacificEducationClassStoryDifferentiation.js", "utf8");
const window = {};
vm.runInNewContext(source, { window, Object, Array, String, Date, RegExp });
const api = window.PacificEducationClassStoryDifferentiation;
const approvedStory = {
  id: "story-fiji-water", title: "Yasawa community water support", url: "https://example.org/story",
  publishedAt: "2026-10-27T00:00:00.000Z", countryOrRegion: "FIJI",
  subjectsApplicable: ["English", "Science"], levelsApplicable: ["Class 4", "Class 5"],
  approved: true, verificationStatus: "TEACHER_APPROVED"
};

test("story selector only returns teacher-approved stories matching both class and subject", () => {
  const pending = { ...approvedStory, id: "pending", approved: false, verificationStatus: "PENDING_TEACHER_REVIEW" };
  assert.equal(api.selectStory([pending], "Class 4", "English"), null);
  assert.equal(api.selectStory([approvedStory], "Class 2", "English"), null);
  assert.equal(api.selectStory([approvedStory], "Class 4", "Mathematics"), null);
  assert.equal(api.selectStory([approvedStory], "Class 4", "English").id, approvedStory.id);
});

test("basic sensitivity screen does not recommend a crime story to ECE–Class 6", () => {
  const sensitive = { ...approvedStory, title: "Singer spared immediate jail sentence", levelsApplicable: ["Class 4", "Class 7"] };
  assert.equal(api.selectStory([sensitive], "Class 4", "English"), null);
  assert.equal(api.selectStory([sensitive], "Class 7", "English").id, sensitive.id);
});

test("all four ability groups use one shared story and one achievement indicator", () => {
  const groups = api.buildAbilityActivities({
    level: "Class 4", subject: "English",
    sharedConcept: "Identify the main idea",
    achievementIndicator: "Identifies the main idea and supports it with one detail",
    story: approvedStory
  });
  assert.deepEqual(JSON.parse(JSON.stringify(groups.map(g => g.abilityGroup))), ["support", "developing", "expected", "extension"]);
  assert.equal(new Set(groups.map(g => g.sharedStoryId)).size, 1);
  assert.equal(new Set(groups.map(g => g.sharedStoryTitle)).size, 1);
  assert.equal(new Set(groups.map(g => g.sharedAchievementIndicator)).size, 1);
  assert.ok(groups.every(g => g.status === "PENDING_TEACHER_REVIEW" && g.teacherMustConfirmStory));
  assert.equal(new Set(groups.map(g => g.task)).size, 4, "activity scaffolding changes across ability groups");
});

test("when no approved suitable story exists, activity generation safely uses local context", () => {
  const groups = api.buildAbilityActivities({ level: "Class 4", subject: "English", sharedConcept: "Identify the main idea", story: null });
  assert.ok(groups.every(g => g.sharedStoryId === null));
  assert.ok(groups.every(g => g.storyUse.includes("local real-life context")));
  assert.ok(groups.every(g => g.sharedConcept === "Identify the main idea"));
});
