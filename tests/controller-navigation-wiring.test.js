const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const html = fs.readFileSync("src/index.html", "utf8");
const controller = fs.readFileSync("src/js/pacificEducationSingleNavigationController.js", "utf8");
const voiceNavigation = fs.readFileSync("src/js/pacificEducationMandatoryVoiceNavigation.js", "utf8");
const boxActivation = fs.readFileSync("src/js/pacificEducation856BoxActivation.js", "utf8");
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

test("Back navigation targets use the same flow-step index as their matching Next route", () => {
  for (const [key, target, step] of [
    ["registration", "pacificEducationIdentityRegistration", 3],
    ["prototype", "prototypeAccess", 4],
    ["level", "levelSelection", 5],
    ["subject", "subjectSelection", 6],
    ["term", "termSelection", 7],
    ["capability", "capabilitySelection", 8],
    ["daily", "dailyLesson", 9],
    ["practice", "dailyLessonPracticeStage", 10],
    ["assessment", "assessments", 11],
    ["coverage", "pacificEducationCoverageDashboard", 12]
  ]) {
    assert.match(controller, new RegExp(key + ":\\[\\\"" + target + "\\\"," + step + "\\]"));
  }
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
  assert.doesNotMatch(boxActivation, /body\.pe-pilot-all-features:not\(\.pe-guided-flow\) #learningPlatform/);
  assert.match(boxActivation, /Learning Tools is intentionally not part of this broad reveal rule/);
  assert.doesNotMatch(html, /body\\.pe-pilot-all-features:not\\(\\.pe-guided-flow\\) #learningPlatform/);
  assert.match(html, /body\.pe-pilot-all-features\.pe-guided-flow-ended #learningPlatform/);
  assert.match(html, /body:not\(\.pe-guided-flow-ended\) #learningPlatform\{display:none!important\}/);
  assert.match(html, /body\.pe-pilot-all-features:not\(\.pe-guided-flow\) #dailyLesson/);
  assert.match(html, /body\.pe-pilot-all-features:not\(\.pe-guided-flow\) \.pacific-flow-next/);
  assert.doesNotMatch(
    html,
    /body\.pe-pilot-all-features #learningPlatform,body\.pe-pilot-all-features #pacificEducationAppTools/
  );
});

test("page changes stop the previous page's audio without replacing the protected voice engine", () => {
  assert.match(controller, /function stopSpeechForPageTransition\(targetId\)/);
  assert.match(controller, /function guided\(step,targetId\)\{\s*lockLearningToolsDuringEntry\(\);\s*stopSpeechForPageTransition\(targetId\)/);
  assert.match(controller, /function gateway\(page\)\{\s*lockLearningToolsDuringEntry\(\);\s*var targetId=.*?stopSpeechForPageTransition\(targetId\)/s);
  assert.match(controller, /Protected #856 voice is NOT replaced or rewritten here/);
});

test("protected #856 voice navigation remains unchanged while guided visibility is managed by the page controller", () => {
  assert.match(voiceNavigation, /The protected #856 voice controller remains the speech engine foundation/);
  assert.match(voiceNavigation, /var STEP_PAGES = \[/);
  assert.match(controller, /data-pe-flow-step/);
  assert.match(controller, /function guided\(step,targetId\)/);
});
test("guided Next transitions retain Learning Level after registration", () => {
  assert.match(controller, /prototypeNextButton:\s*\[5,\s*"levelSelection"\]/);
  assert.doesNotMatch(controller, /prototypeNextButton:\s*\[6,\s*"subjectSelection"\]/, "registration must not bypass Learning Level");
  /* Keep the Learning Level Next route available for recovery when that page is opened directly. */
  assert.match(controller, /levelNextButton:\s*\[6,\s*"subjectSelection"\]/);
  assert.match(controller, /subjectNextButton:\s*\[7,\s*"termSelection"\]/);
  assert.match(controller, /termNextButton:\s*\[8,\s*"capabilitySelection"\]/);
  assert.match(controller, /capabilityNextButton:\s*\[9,\s*"dailyLesson"\]/);
  assert.match(controller, /dailyNextButton:\s*\[10,\s*"dailyLessonPracticeStage"\]/);
  assert.match(controller, /practiceNextButton:\s*\[11,\s*"assessments"\]/);
  assert.match(controller, /assessmentNextButton:\s*\[12,\s*"pacificEducationCoverageDashboard"\]/);
  assert.match(controller, /guided\(13,"teacherCalendarSection"\)/);
  assert.match(controller, /"Page "\+info\[0\]\+" of 14/);
  assert.match(html, /pacificEducationSingleNavigationController\.js\?v=20261017-visible-workspace-guard-v1/);
});


test("final Sign Out button appears below the reading text and never stays at the top", () => {
  const sequential = fs.readFileSync("src/js/pacificEducationSequentialRoleWorkspaces.js", "utf8");
  assert.match(sequential, /if\(signOutArea\) signOutArea\.hidden=true/);
  assert.match(sequential, /if\(item\[0\]!=="paceduSignOutPage"\)[\s\S]*?page\.classList\.add\("pacedu-role-page-enter"\)/);
  assert.match(sequential, /if\(item\[0\]!=="paceduSignOutPage"\)\{[\s\S]*?focusTitle\.focus\(\{preventScroll:true\}\)/);
  assert.match(sequential, /if\(item\[0\]==="paceduSignOutPage"\)\{[\s\S]*?page\.appendChild\(signOutIntro\);[\s\S]*?page\.appendChild\(signOutTopArea\)/);
  assert.doesNotMatch(sequential, /signOutTopArea\.style\.cssText="position:sticky/);
  assert.doesNotMatch(sequential, /shell\.insertBefore\(signOutTopArea,shell\.firstChild\)/);
  assert.match(sequential, /This page will stay here until you deliberately choose to sign out/);
});

test("sequential workspace restores hidden main/app containers after registration", () => {
  const sequential = fs.readFileSync("src/js/pacificEducationSequentialRoleWorkspaces.js", "utf8");
  assert.ok(sequential.includes("main{display:block!important;visibility:visible!important;}"));
  assert.ok(sequential.includes("main > #app{display:block!important;visibility:visible!important;}"));
  assert.ok(sequential.includes("#pacificEducationSequentialRoleWorkspace{display:block!important;visibility:visible!important;}"));
});

test("role workspace content is forced visible and has a recoverable blank-content fallback", () => {
  const sequential = fs.readFileSync("src/js/pacificEducationSequentialRoleWorkspaces.js", "utf8");
  assert.match(sequential, /function enforceWorkspaceVisibility\(\)/);
  assert.match(sequential, /page\.style\.setProperty\("display","block","important"\)/);
  assert.match(sequential, /active\.style\.setProperty\("visibility","visible","important"\)/);
  assert.match(sequential, /Workspace content recovery/);
  assert.match(sequential, /Retry this workspace page/);
  assert.match(sequential, /Sign In \/ Reopen Workspace/);
  assert.match(sequential, /Open the final Sign Out page/);
  assert.match(sequential, /index=sequence\.length-1;\s*renderPage\(\);/);
  assert.match(sequential, /enforceWorkspaceVisibility\(\);/);
  assert.match(html, /pacificEducationSequentialRoleWorkspaces\.js\?v=20261017-role-workspace-content-recovery-v3/);
  assert.match(html, /pacificEducationSingleNavigationController\.js\?v=20261017-visible-workspace-guard-v1/);
});

test("Student registration handoff marks guided flow complete and keeps a workspace recovery action", () => {
  const registration = fs.readFileSync("src/js/pacificEducationMandatoryBoxSequence.js", "utf8");
  const sequential = fs.readFileSync("src/js/pacificEducationSequentialRoleWorkspaces.js", "utf8");
  assert.match(registration, /body\.classList\.add\("pe-guided-flow-ended"\)/);
  assert.match(registration, /paceduWorkspaceHandoffRecovery/);
  assert.match(registration, /paceduWorkspaceHandoffRetry/);
  assert.match(registration, /openedWorkspace\.style\.setProperty\("display","block","important"\)/);
  assert.match(sequential, /shell\.style\.setProperty\("display","block","important"\)/);
});

test("Learning Tools stays fail-closed throughout guided entry and registration handoff", () => {
  assert.doesNotMatch(boxActivation, /"learningPlatform",/);
  assert.match(controller, /function lockLearningToolsDuringEntry\(\)/);
  assert.match(controller, /lockLearningToolsDuringEntry\(\);\s*stopSpeechForPageTransition\(targetId\)/);
  assert.match(controller, /function gateway\(page\)\{\s*lockLearningToolsDuringEntry\(\)/);
  assert.match(controller, /page\.style\.setProperty\("display","none","important"\)/);
  assert.match(html, /body:not\(\.pe-guided-flow-ended\) #learningPlatform\{display:none!important\}/);
});


test("student sequential workspace begins with mandatory Capability Test and preserves the required learning flow", () => {
  const sequential = fs.readFileSync("src/js/pacificEducationSequentialRoleWorkspaces.js", "utf8");
  const student = sequential.match(/"student":\s*\[([\s\S]*?)\n    \],/);
  assert.ok(student, "student default sequence must exist");
  const ids = [...student[1].matchAll(/\["([^"]+)","([^"]+)"\]/g)].map((match) => match[1]);
  assert.deepEqual(ids.slice(0, 3), ["pacificEducationInitialCapabilityTest", "pacificEducationInitialCapabilityResult", "levelSelection"]);
  const required = [
    "pacificEducationInitialCapabilityTest",
    "pacificEducationInitialCapabilityResult",
    "levelSelection",
    "subjectSelection",
    "termSelection",
    "capabilitySelection",
    "dailyLesson",
    "dailyLessonPracticeStage",
    "assessments",
    "pacificEducationCoverageDashboard",
    "pacificEducationStudentProgressDashboard"
  ];
  let previous = -1;
  for (const id of required) {
    const index = ids.indexOf(id);
    assert.ok(index > previous, "mandatory Student step must exist in order: " + id);
    previous = index;
  }
  assert.match(sequential, /studentSequenceHasMandatoryOrder/);
  assert.match(sequential, /does not verify an individual assignment/);
});

test("Sign Out stays hidden before the final page and confirmation starts hidden", () => {
  const sequential = fs.readFileSync("src/js/pacificEducationSequentialRoleWorkspaces.js", "utf8");
  assert.match(sequential, /peSequentialSignOut.*hidden style=/);
  assert.match(sequential, /signOutTopArea\.hidden=true/);
  assert.match(sequential, /if\(signOutArea\) signOutArea\.hidden=true/);
  assert.match(sequential, /if\(item\[0\]==="paceduSignOutPage"\)/);
  assert.match(sequential, /peSequentialSignOutConfirm.*hidden/);
  assert.doesNotMatch(sequential, /position:sticky;top:0;z-index:20;display:flex;justify-content:flex-end/);
  assert.doesNotMatch(sequential, /shell\.insertBefore\(signOutTopArea,shell\.firstChild\)/);
});


test("student daily activities use the curriculum-aware role activity pack", () => {
  const sequential = fs.readFileSync("src/js/pacificEducationSequentialRoleWorkspaces.js", "utf8");
  const activityPacks = fs.readFileSync("src/js/pacificEducationRoleActivityPacks.js", "utf8");
  assert.match(sequential, /PacificEducationRoleActivityPacks\.render\(role,item\[0\],page,dailyDay\)/);
  assert.match(activityPacks, /Fiji Year 1 English/);
  assert.match(activityPacks, /My Friends/);
  assert.match(activityPacks, /Preparing a Family Feast/);
  assert.match(activityPacks, /Mathematics/);
  assert.match(activityPacks, /Phonics/);
  assert.match(activityPacks, /pacificEducationStudentDailyActivityProgressV1/);
  assert.match(activityPacks, /Save Activity on This Device/);
  assert.match(activityPacks, /REQUIRES_CURRENT_MINISTRY_VALIDATION/);
});

test("role activity packs load after the role workspace controller and preserve protected voice files", () => {
  assert.match(html, /pacificEducationSequentialRoleWorkspaces\.js[^\n]*pacificEducationRoleActivityPacks\.js/);
  const activityPacks = fs.readFileSync("src/js/pacificEducationRoleActivityPacks.js", "utf8");
  assert.match(activityPacks, /PENDING_TEACHER_REVIEW/);
  assert.match(activityPacks, /PENDING_TECHNICAL_REVIEW/);
  assert.match(activityPacks, /local-device-pilot/);
  assert.equal((html.match(/pacificEducationRoleActivityPacks\.js/g) || []).length, 1);
  assert.match(voiceNavigation, /protected #856/i);
});

test("final Sign Out page is locked until the user explicitly confirms sign out", () => {
  const sequential = fs.readFileSync("src/js/pacificEducationSequentialRoleWorkspaces.js", "utf8");
  assert.match(sequential, /Final Page/);
  assert.match(sequential, /back\.hidden=true;\s*back\.disabled=true/);
  assert.match(sequential, /next\.hidden=true;\s*next\.disabled=true/);
  assert.match(sequential, /Final page — this screen will not move on/);
  assert.match(sequential, /shell\.getAttribute\("data-pe-final-signout"\)==="true"/);
  assert.match(sequential, /if\(shell\.getAttribute\("data-pe-final-signout"\)==="true"\) return;/);
  assert.match(sequential, /if\(shell\.getAttribute\("data-pe-final-signout"\)==="true"\) return;\s*if\(index>0\)/);
  assert.match(sequential, /Defensive lock: even a stale\/programmatic Next click cannot leave the/);
  assert.match(sequential, /Check the final-page lock before inspecting history state/);
  assert.match(sequential, /var existingWorkspace=document\.getElementById\("pacificEducationSequentialRoleWorkspace"\);\s*if\(existingWorkspace && existingWorkspace\.getAttribute\("data-pe-final-signout"\)==="true"\) return;/);
  assert.match(sequential, /Confirm Sign Out/);
  assert.doesNotMatch(sequential, /use <strong>Sign Out<\/strong> when you have finished, or use Back/);
});

test("Sign Out preserves saved registration and daily progress while clearing active session state", () => {
  const sequential = fs.readFileSync("src/js/pacificEducationSequentialRoleWorkspaces.js", "utf8");
  assert.match(sequential, /pacificEducationPilotSavedRegistrationV1/);
  assert.match(sequential, /pacificEducationStudentDailyActivityProgressV1/);
  assert.doesNotMatch(sequential, /LOCAL_SESSION_KEYS\.forEach\(function\(key\)\{try\{localStorage\.removeItem\(key\)/);
  assert.match(sequential, /registration and sign-in entry is ready/);
});

test("role workspace pages use a short reduced-motion-aware entrance transition", () => {
  const sequential = fs.readFileSync("src/js/pacificEducationSequentialRoleWorkspaces.js", "utf8");
  assert.match(sequential, /pacedu-role-page-transition-style/);
  assert.match(sequential, /animation:paceduRolePageEnter 190ms/);
  assert.match(sequential, /@media\(prefers-reduced-motion:reduce\)/);
  assert.match(sequential, /page\.classList\.add\("pacedu-role-page-enter"\)/);
  assert.match(sequential, /Sign Out selected\. Confirm Sign Out or Cancel/);
});

test("all guided pages use a short shared reduced-motion-aware entrance transition", () => {
  assert.match(controller, /function installGuidedTransitionStyle\(\)/);
  assert.match(controller, /function animateGuidedPageEntry\(targetId\)/);
  assert.match(controller, /animation:paceduGuidedPageEnter 210ms/);
  assert.match(controller, /@media\(prefers-reduced-motion:reduce\)/);
  assert.match(controller, /animateGuidedPageEntry\(targetId\)/);
  assert.match(controller, /animateGuidedPageEntry\(activePageId\)/);
  assert.match(controller, /Protected #856 voice is NOT replaced or rewritten here/);
});

test("blank role workspace pages render role-specific recovery tools without creating extra pages", () => {
  const sequential = fs.readFileSync("src/js/pacificEducationSequentialRoleWorkspaces.js", "utf8");
  assert.match(sequential, /function roleWorkspaceHasContent\(target\)/);
  assert.match(sequential, /function addRoleWorkspaceLanding\(role,item,host\)/);
  assert.match(sequential, /data-pe-role-workspace-recovery/);
  assert.match(sequential, /Available workspace tools/);
  assert.match(sequential, /button\.textContent="Open "\+step\[1\]/);
  assert.match(sequential, /index=stepIndex;[\s\S]*?renderPage\(\)/);
  assert.match(sequential, /if\(!roleWorkspaceHasContent\(target\)\) addRoleWorkspaceLanding\(role,item,page\)/);
  assert.match(sequential, /addRoleWorkspaceLanding\(role,item,page\)/);
  assert.match(sequential, /Your saved registration and activity progress are not cleared by this recovery menu/);
  assert.match(sequential, /Technician mode remains pilot-only/);
  assert.match(sequential, /protected #856 speech controller/);
  assert.match(sequential, /var key="pacificEducationStudentDailyActivityProgressV1"/);
});
