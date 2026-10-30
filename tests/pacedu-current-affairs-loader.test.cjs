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
