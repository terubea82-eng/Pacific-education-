const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync("src/js/paceduSeparateDailyResourceDownloads.js", "utf8");
const window = {};
vm.runInNewContext(source, { window, document: {}, Date, Blob, URL, setTimeout, Array, String, Number, JSON });

test("teaching-aid pack is generated from the selected lesson rather than generic blank prompts", () => {
  const api = window.PacEduSeparateDailyResourceDownloads;
  assert.equal(typeof api.buildTeachingAidBody, "function");
  const html = api.buildTeachingAidBody(
    { level: "Class 1", subject: "English", term: "T1", week: 1, day: 2 },
    {
      objective: "Identify the beginning sound in familiar words",
      base: {
        topic: "Beginning sounds",
        questions: [{ prompt: "Which word begins with /s/?", options: ["sun", "mat"] }],
        answerKey: [{ answer: "sun" }],
        curriculumSchedule: {
          verificationStatus: "NOT_YET_MAPPED",
          candidateSource: { title: "Candidate Year 1 English resource", reference: "Unit 1, page 5" }
        }
      },
      lesson: {
        concept: "Initial /s/ sound",
        exampleText: "s is for sun",
        steps: [{ mode: "Model", learnerAction: "Say the sound and point to the letter s." }],
        keyVocabulary: ["sound", "letter"]
      }
    }
  );
  assert.match(html, /Identify the beginning sound in familiar words/);
  assert.match(html, /Initial \/s\/ sound/);
  assert.match(html, /s is for sun/);
  assert.match(html, /Say the sound and point to the letter s/);
  assert.match(html, /Which word begins with \/s\//);
  assert.match(html, /Teacher guidance:<\/strong> sun/);
  assert.match(html, /Candidate Year 1 English resource/);
  assert.match(html, /NOT_YET_MAPPED/);
  assert.match(html, /Do not describe this resource as officially curriculum-aligned/);
  assert.match(html, /large print, tactile, audio, signed/);
  assert.match(html, /Teacher review record/);
});

test("teaching-aid pack escapes lesson data and explicitly flags missing examples", () => {
  const api = window.PacEduSeparateDailyResourceDownloads;
  const html = api.buildTeachingAidBody(
    { level: "Class 2", subject: "Mathematics", term: "T1", week: 1, day: 1 },
    { objective: "<script>alert(1)</script>", base: { topic: "Counting" }, lesson: {} }
  );
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.doesNotMatch(html, /<script>alert/);
  assert.match(html, /No worked example is stored for this lesson yet/);
  assert.match(html, /NOT_RECORDED/);
});
