const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function loadApi() {
  const window = {};
  vm.runInNewContext(
    fs.readFileSync('src/js/paceduSeparateDailyResourceDownloads.js', 'utf8'),
    { window, document: {} }
  );
  return window.PacEduSeparateDailyResourceDownloads;
}

test('student worksheet MCQ options are labelled exactly A, B, C and D', () => {
  const api = loadApi();
  const html = api.formatQuestionOptions({
    options: ['First choice', 'Second choice', 'Third choice', 'Fourth choice']
  });
  assert.match(html, /<ol type="A">/);
  assert.equal((html.match(/<li>/g) || []).length, 4);
  assert.match(html, /First choice/);
  assert.match(html, /Fourth choice/);
});

test('invalid MCQ option counts are held for teacher correction', () => {
  const api = loadApi();
  assert.throws(
    () => api.formatQuestionOptions({ options: ['A choice', 'B choice', 'C choice'] }),
    /exactly four non-empty options/
  );
  assert.throws(
    () => api.formatQuestionOptions({ options: ['A choice', 'B choice', 'C choice', ' '] }),
    /exactly four non-empty options/
  );
});

test('non-MCQ questions do not receive artificial answer choices', () => {
  const api = loadApi();
  assert.equal(api.formatQuestionOptions({ prompt: 'Explain your answer.' }), '');
  assert.equal(api.formatQuestionOptions({ options: [] }), '');
});
