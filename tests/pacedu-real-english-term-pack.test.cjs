const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const window = {};
const context = { window, document: {}, Date, Math, String, Number, Array, Object, RegExp, Error };

function load(path) {
  vm.runInNewContext(fs.readFileSync(path, 'utf8'), context, { filename: path });
}

// Load the same real source modules used by the browser, not mocked worksheet data.
load('src/js/paceduFijiCurriculumWeeklyActivities.js');
load('src/js/paceduDailyWorksheetContent.js');
load('src/js/paceduAbilityDifferentiation.js');
load('src/js/paceduIndicatorAllocationRegistry.js');
load('src/js/paceduDownloadableClassPacks.js');

test('scheduled Class 1 English T1 source produces 45 draft worksheet sections without claiming official mapping', () => {
  const api = window.PacEduDailyWorksheetContent;
  assert.ok(api && typeof api.getCurriculumWorksheet === 'function');

  const scheduled = [];
  let multipleChoiceCount = 0;
  for (let week = 1; week <= 9; week += 1) {
    for (let day = 1; day <= 5; day += 1) {
      const sheet = api.getCurriculumWorksheet({
        level: 'Class 1', subject: 'English', term: 'T1',
        week, day, ability: 'support', skipTermPlan: true
      });
      assert.notEqual(sheet.status, 'NOT_FOUND', `Week ${week}, Day ${day} must have real English content`);
      assert.ok(sheet.topic && sheet.topic.trim(), `Week ${week}, Day ${day} topic`);
      assert.ok(sheet.readingText && sheet.readingText.trim(), `Week ${week}, Day ${day} passage`);
      assert.equal(sheet.questions.length, 4, `Week ${week}, Day ${day} questions`);
      assert.equal(sheet.answerKey.length, 4, `Week ${week}, Day ${day} answer keys`);
      assert.ok(sheet.answerKey.every((item) => item.answer && item.explanation),
        `Week ${week}, Day ${day} every answer has an explanation`);
      assert.ok(sheet.dailyLesson && sheet.dailyLesson.workedExample,
        `Week ${week}, Day ${day} worked example`);
      assert.equal(sheet.dailyLesson.steps.length, 5,
        `Week ${week}, Day ${day} five-step lesson structure`);
      assert.equal(sheet.curriculumSchedule.verificationStatus, 'NOT_YET_MAPPED',
        `Week ${week}, Day ${day} must not claim official mapping`);
      for (const question of sheet.questions) {
        if (question.type === 'Multiple choice') {
          multipleChoiceCount += 1;
          assert.equal(question.options.length, 4,
            `Week ${week}, Day ${day} multiple-choice item must have four choices`);
        }
      }
      scheduled.push(sheet);
    }
  }

  assert.equal(new Set(scheduled.map((sheet) => sheet.topic)).size, 45,
    'The scheduled template should produce a distinct weekly-theme/day-focus heading for each slot; this is not proof of 45 independently authored lessons.');

  const pack = window.PacEduDownloadableClassPacks.build({
    level: 'Class 1', subject: 'English', term: 'T1', ability: 'support'
  });
  assert.equal(pack.dailyActivities, 45);
  assert.equal(pack.missingSlots, 0);

  const dailyHeadings = [...pack.html.matchAll(/<h2>T1 · Week \d+ · Day \d+ —/g)];
  assert.equal(dailyHeadings.length, 45, 'Rendered HTML must contain all 45 scheduled worksheet headings.');
  assert.equal((pack.html.match(/class="indicator-panel"/g) || []).length, 45,
    'Every daily worksheet must contain its indicator panel.');
  assert.equal((pack.html.match(/<ol type=\"A\">/g) || []).length, multipleChoiceCount,
    'Every four-choice question must render with A, B, C and D labels.');
  assert.equal((pack.html.match(/Teacher answer \/ marking note:/g) || []).length, 180,
    'Every question must render its teacher answer/marking note.');
  assert.equal((pack.html.match(/PENDING_SUBJECT_SPECIFIC_INDICATOR/g) || []).length, 45,
    'The empty indicator registry must remain fail-closed on every day.');
  assert.equal((pack.html.match(/PENDING_TEACHER_REVIEW/g) || []).length, 45,
    'Teacher review must remain pending on every day.');
  assert.doesNotMatch(pack.html, /Ability group:<\/strong> (Foundation|Developing|Expected|Advanced)/,
    'Legacy ability names must not appear as the visible selected group.');
  assert.match(pack.html, /Ability group:<\/strong> Copper/);
  assert.doesNotMatch(pack.html, /Official Fiji syllabus indicator ID:/i,
    'No official indicator identifier may be invented when the registry is empty.');
});

test('all four visible ability selections use Copper, Bronze, Silver and Gold', () => {
  const api = window.PacEduDownloadableClassPacks;
  const expected = {
    support: 'Copper',
    developing: 'Bronze',
    expected: 'Silver',
    extension: 'Gold'
  };
  for (const [ability, label] of Object.entries(expected)) {
    const pack = api.build({ level: 'Class 1', subject: 'English', term: 'T1', ability });
    assert.match(pack.html, new RegExp('Ability group:<\\/strong> ' + label));
    assert.doesNotMatch(pack.html, /Ability group:<\/strong> (Foundation|Developing|Expected|Advanced)/);
  }
});
