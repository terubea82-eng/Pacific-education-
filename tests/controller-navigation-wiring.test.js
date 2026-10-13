const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const html = fs.readFileSync("src/index.html", "utf8");
const controller = fs.readFileSync("src/js/pacificEducationSingleNavigationController.js", "utf8");
const voiceNavigation = fs.readFileSync("src/js/pacificEducationMandatoryVoiceNavigation.js", "utf8");
const htmlIds = new Set([...html.matchAll(/\bid=["']([^"']+)["']/g)].map((match) => match[1]));
const controllerCreatedIds = new Set(
  [...controller.matchAll(/(?:button|wrapper|status|audio)\.id="([^"]+)"/g)].map((match) => match[1])
);
const knownIds = new Set([...htmlIds, ...controllerCreatedIds]);

function objectBody(name) {
  const match = controller.match(new RegExp("var " + name + " = \\{([\\s\\S]*?)\\n\\};"));
  assert.ok(match, name + " mapping must exist");
  return match[1];
}

test("every guided Next mapping points to real source elements", () => {
  const steps = objectBody("STEPS");
  const rows = [...steps.matchAll(/^\s*([A-Za-z][A-Za-z0-9]+):\s*\[(\d+),\s*"([^"]+)"\]/gm)];
  assert.ok(rows.length > 0, "STEPS must contain guided Next mappings");
  for (const [, buttonId, , targetId] of rows) {
    assert.ok(knownIds.has(buttonId), "Next button missing from HTML/controller: " + buttonId);
    assert.ok(knownIds.has(targetId), "Next target missing from HTML/controller: " + targetId);
  }
  assert.ok(!steps.includes("paceduGatewayVision"), "stale non-element gateway target must not be in STEPS");
  assert.ok(!steps.includes("coverageNextButton"), "coverage Next must have one dedicated binding only");
});

test("every Back-map page exists in the source HTML", () => {
  const back = objectBody("BACK");
  const pageIds = [...back.matchAll(/^\s*([A-Za-z][A-Za-z0-9_-]+):/gm)].map((match) => match[1]);
  assert.ok(pageIds.length > 0, "BACK must contain page mappings");
  for (const id of pageIds) assert.ok(htmlIds.has(id), "Back page missing from src/index.html: " + id);
});

test("feature registry IDs match real or controller-created elements", () => {
  const registry = objectBody("FEATURE_REGISTRY");
  const features = [...registry.matchAll(/(\w+):\s*\{\s*label:"([^"]+)",\s*ids:\[([^\]]*)\]\s*\}/g)];
  assert.ok(features.length > 0, "feature registry must have feature entries");
  for (const [, featureKey, , list] of features) {
    const ids = [...list.matchAll(/"([^"]+)"/g)].map((match) => match[1]);
    assert.ok(ids.length > 0, featureKey + " must register at least one source element");
    for (const id of ids) assert.ok(knownIds.has(id), featureKey + " points to missing element: " + id);
  }
});

test("controller preserves the protected voice engine and does not replace it", () => {
  assert.match(html, /pacificEducationSpeechVoice\.js/);
  assert.match(controller, /Protected #856 voice is NOT replaced or rewritten here/);
  assert.match(controller, /var pageInfo=PAGE_GUIDE\[targetId\]/);
});

test("controller-managed activity and transition buttons have explicit bindings", () => {
  for (const id of [
    "dailyActivitiesStartButton",
    "dailyActivitiesContinuePracticeButton",
    "practiceContinueAssessmentButton",
    "assessmentContinueCoverageButton",
    "coverageNextButton",
    "teacherCalendarNextButton"
  ]) {
    assert.match(controller, new RegExp('bind\\("' + id + '"'));
  }
});

test("all-feature visibility cannot override one-page guided flow", () => {
  assert.doesNotMatch(html, /body\\.pe-pilot-all-features:not\\(\\.pe-guided-flow\\) #learningPlatform/);
  assert.match(html, /body\\.pe-pilot-all-features\\.pe-guided-flow-ended #learningPlatform/);
  assert.match(html, /body\.pe-pilot-all-features:not\(\.pe-guided-flow\) #dailyLesson/);
  assert.match(html, /body\.pe-pilot-all-features:not\(\.pe-guided-flow\) \.pacific-flow-next/);
  assert.doesNotMatch(
    html,
    /body\.pe-pilot-all-features #learningPlatform,body\.pe-pilot-all-features #pacificEducationAppTools/
  );
});

test("page changes stop the previous page's audio without replacing the protected voice engine", () => {
  assert.match(controller, /function stopSpeechForPageTransition\(targetId\)/);
  assert.match(controller, /function guided\(step,targetId\)\{\s*stopSpeechForPageTransition\(targetId\)/);
  assert.match(controller, /function gateway\(page\)\{\s*var targetId=.*?stopSpeechForPageTransition\(targetId\)/s);
  assert.match(controller, /Protected #856 voice is NOT replaced or rewritten here/);
});

test("protected #856 voice navigation remains unchanged while guided visibility is managed by the page controller", () => {
  assert.match(voiceNavigation, /The protected #856 voice controller remains the speech engine foundation/);
  assert.match(voiceNavigation, /var STEP_PAGES = \[/);
  assert.match(controller, /data-pe-flow-step/);
  assert.match(controller, /function guided\(step,targetId\)/);
});
test("guided Next transitions use the actual page numbers after registration", () => {
  assert.match(controller, /prototypeNextButton:\s*\[5,\s*"levelSelection"\]/);
  assert.match(controller, /levelNextButton:\s*\[6,\s*"subjectSelection"\]/);
  assert.match(controller, /subjectNextButton:\s*\[7,\s*"termSelection"\]/);
  assert.match(controller, /termNextButton:\s*\[8,\s*"capabilitySelection"\]/);
  assert.match(controller, /capabilityNextButton:\s*\[9,\s*"dailyLesson"\]/);
  assert.match(controller, /dailyNextButton:\s*\[10,\s*"dailyLessonPracticeStage"\]/);
  assert.match(controller, /practiceNextButton:\s*\[11,\s*"assessments"\]/);
  assert.match(controller, /assessmentNextButton:\s*\[12,\s*"pacificEducationCoverageDashboard"\]/);
  assert.match(controller, /guided\(13,"teacherCalendarSection"\)/);
});
