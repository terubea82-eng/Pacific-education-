const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync("src/js/paceduStudentLearningCalendar.js", "utf8");
const store = new Map();
const window = {
  localStorage: {
    getItem(key) { return store.has(key) ? store.get(key) : null; },
    setItem(key, value) { store.set(key, String(value)); }
  },
  sessionStorage: { getItem() { return ""; } }
};
const document = { readyState: "loading", addEventListener() {} };
vm.runInNewContext(source, { window, document, Date, String, Number, Array, Object, Math, JSON, RegExp });
const calendar = window.PacEduStudentLearningCalendar;

test("automatic day numbering counts configured school weekdays only", () => {
  const schedule = { startDate: "2026-10-19", learningDays: [1, 2, 3, 4, 5], holidays: [] };
  assert.equal(calendar.dayNumberFor("2026-10-19", schedule), 1);
  assert.equal(calendar.dayNumberFor("2026-10-20", schedule), 2);
  assert.equal(calendar.dayNumberFor("2026-10-24", schedule), 5);
  assert.equal(calendar.dayNumberFor("2026-10-25", schedule), 5);
  assert.equal(calendar.dayNumberFor("2026-10-26", schedule), 6);
});

test("configured holidays do not advance the numbered learning day", () => {
  const schedule = { startDate: "2026-10-19", learningDays: [1, 2, 3, 4, 5], holidays: ["2026-10-20"] };
  assert.equal(calendar.dayNumberFor("2026-10-19", schedule), 1);
  assert.equal(calendar.dayNumberFor("2026-10-20", schedule), 1);
  assert.equal(calendar.dayNumberFor("2026-10-21", schedule), 2);
});

test("dates before the first teaching date and missing calendars do not invent a day number", () => {
  const schedule = { startDate: "2026-10-19", learningDays: [1, 2, 3, 4, 5], holidays: [] };
  assert.equal(calendar.dayNumberFor("2026-10-18", schedule), null);
  assert.equal(calendar.dayNumberFor("2026-10-19", null), null);
});
