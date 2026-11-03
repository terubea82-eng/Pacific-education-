'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync('src/js/pacificEducationCurrentAffairsLoader.js', 'utf8');

test('current-affairs loader demotes legacy approval markers until teacher review', async () => {
  const captured = [];
  const approvedSource = {
    id: 'legacy-approved-story',
    title: 'Previously approved story',
    url: 'https://example.org/story',
    approved: true,
    verificationStatus: 'APPROVED_BY_TEACHER',
    levelRecommendationBasis: 'TEACHER_REVIEWED'
  };
  const pendingSource = {
    id: 'new-pending-story',
    title: 'New story awaiting review',
    url: 'https://example.org/new-story',
    approved: false,
    verificationStatus: 'PENDING_TEACHER_REVIEW',
    levelRecommendationBasis: 'AUTOMATED_TOPIC_SCREENING_PENDING_TEACHER_REVIEW'
  };

  const window = {
    PacificEducationCountryConfig: {
      upsertEducationalCurrentAffair(item) {
        captured.push(item);
      }
    }
  };
  const document = {
    readyState: 'loading',
    addEventListener() {},
    dispatchEvent() {}
  };
  const localStorage = { setItem() {} };
  const fetch = async () => ({
    ok: true,
    json: async () => ({
      generatedAt: '2026-10-30T00:00:00.000Z',
      items: [approvedSource, pendingSource]
    })
  });
  function CustomEvent(type, init) {
    this.type = type;
    this.detail = init && init.detail;
  }

  vm.runInNewContext(source, {
    window,
    document,
    localStorage,
    fetch,
    CustomEvent
  });

  const result = await window.PacificEducationCurrentAffairsLoader.load();

  assert.equal(result.loaded, 2);
  assert.equal(captured.length, 2);
  for (const item of captured) {
    assert.equal(item.approved, false);
    assert.equal(item.verificationStatus, 'PENDING_TEACHER_REVIEW');
    assert.equal(
      item.levelRecommendationBasis,
      'AUTOMATED_TOPIC_SCREENING_PENDING_TEACHER_REVIEW'
    );
  }

  // The loader changes its copy; it does not mutate the downloaded source object.
  assert.equal(approvedSource.approved, true);
  assert.equal(approvedSource.verificationStatus, 'APPROVED_BY_TEACHER');
});

const {
  PACEDU_SUBJECTS,
  CURRICULUM_LEVELS,
  mapCurrentAffairsSubjects,
  applicableLevels,
  canPreserveTeacherApproval
} = require('../automation/current-affairs-curriculum');

test('current-affairs mapping uses only the 15 PacEdu Fiji subjects and ECE–Form 7 levels', () => {
  assert.deepEqual(Array.from(CURRICULUM_LEVELS), [
    'ECE',
    'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8',
    'Form 3', 'Form 4', 'Form 5', 'Form 6', 'Form 7'
  ]);
  const allSubjects = mapCurrentAffairsSubjects(
    'English reading phonics mathematics science health agriculture farming arts culture technology design computer digital Vosa Vakaviti iTaukei Fiji Hindi Urdu Rotuman home economics community government'
  );
  assert.deepEqual(new Set(allSubjects), new Set(PACEDU_SUBJECTS));
  assert.deepEqual(Array.from(applicableLevels('children school community')), [
    'ECE', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6'
  ]);
  assert.deepEqual(Array.from(applicableLevels('policy governance research technology')), [
    'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8',
    'Form 3', 'Form 4', 'Form 5', 'Form 6', 'Form 7'
  ]);
});

test('legacy or unsupported subject/level labels cannot preserve a teacher approval', () => {
  const approved = {
    approved: true,
    verificationStatus: 'APPROVED_BY_TEACHER',
    levelRecommendationBasis: 'TEACHER_REVIEWED',
    subjectsApplicable: ['Social Science'],
    levelsApplicable: ['Form 3']
  };
  assert.equal(canPreserveTeacherApproval(approved), true);
  assert.equal(canPreserveTeacherApproval({
    ...approved,
    subjectsApplicable: ['Health Science']
  }), false);
  assert.equal(canPreserveTeacherApproval({
    ...approved,
    levelsApplicable: ['Class 13']
  }), false);
  assert.equal(canPreserveTeacherApproval({
    ...approved,
    verificationStatus: 'PENDING_TEACHER_REVIEW'
  }), false);
});

test('published current-affairs data contains only valid Fiji subjects and levels and stays review-gated', () => {
  const feed = JSON.parse(fs.readFileSync('docs/data/current-affairs.json', 'utf8'));
  assert.ok(Array.isArray(feed.items) && feed.items.length > 0);
  for (const item of feed.items) {
    assert.ok(typeof item.url === 'string' && item.url.startsWith('https://'));
    assert.ok(Array.isArray(item.subjectsApplicable) && item.subjectsApplicable.length > 0);
    for (const subject of item.subjectsApplicable) {
      assert.ok(PACEDU_SUBJECTS.includes(subject), item.title + ' has unsupported subject: ' + subject);
    }
    assert.ok(Array.isArray(item.levelsApplicable) && item.levelsApplicable.length > 0);
    for (const level of item.levelsApplicable) {
      assert.ok(CURRICULUM_LEVELS.includes(level), item.title + ' has unsupported level: ' + level);
    }
    assert.ok(
      (item.approved === false &&
        item.verificationStatus === 'PENDING_TEACHER_REVIEW' &&
        item.levelRecommendationBasis === 'AUTOMATED_TOPIC_SCREENING_PENDING_TEACHER_REVIEW') ||
      canPreserveTeacherApproval(item),
      item.title + ' has an invalid review state'
    );
  }
});

test('daily feed generator uses the shared Fiji mapping and review-preservation guards', () => {
  const workflow = fs.readFileSync('.github/workflows/daily-current-affairs.yml', 'utf8');
  assert.match(workflow, /mapCurrentAffairsSubjects\(combinedText\)/);
  assert.match(workflow, /applicableLevels\(combinedText\)/);
  assert.match(workflow, /canPreserveTeacherApproval\(previous\)/);
  assert.match(workflow, /validSubjects/);
});
