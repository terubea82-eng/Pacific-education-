const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

class Element {
  constructor(tag) {
    this.tagName = tag.toUpperCase();
    this.children = [];
    this.attributes = {};
    this.listeners = {};
    this.style = {};
    this.parentNode = null;
    this.value = "";
    this.download = "";
    this._text = "";
  }
  set textContent(value) {
    this._text = String(value == null ? "" : value);
    this.children.forEach(child => { child.parentNode = null; });
    this.children = [];
  }
  get textContent() {
    return this._text + this.children.map(child => child.textContent).join("");
  }
  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
    return child;
  }
  removeChild(child) {
    this.children = this.children.filter(item => item !== child);
    child.parentNode = null;
  }
  remove() {
    if (this.parentNode) this.parentNode.removeChild(this);
  }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  getAttribute(name) { return this.attributes[name] || null; }
  addEventListener(name, callback) {
    (this.listeners[name] ||= []).push(callback);
  }
  click() {
    (this.listeners.click || []).forEach(callback => callback({ target: this }));
  }
  querySelector(selector) {
    if (selector === "[data-pacedu-separate-daily-downloads]") {
      return this.find(item => item.attributes["data-pacedu-separate-daily-downloads"] != null);
    }
    return null;
  }
  find(predicate) {
    for (const child of this.children) {
      if (predicate(child)) return child;
      const nested = child.find(predicate);
      if (nested) return nested;
    }
    return null;
  }
  get options() { return this.children; }
  get selectedOption() {
    return this.children.find(option => option.selected) || this.children[0] || null;
  }
  get value() {
    if (this.tagName === "SELECT") return this.selectedOption ? this.selectedOption.value : "";
    return this._value || "";
  }
  set value(value) {
    this._value = String(value == null ? "" : value);
    if (this.tagName === "SELECT") {
      this.children.forEach(option => { option.selected = option.value === this._value; });
    }
  }
}

test("teacher teaching-aid download uses the selected lesson and produces a lesson-linked file", async () => {
  const source = fs.readFileSync("src/js/paceduSeparateDailyResourceDownloads.js", "utf8");
  let capturedBlob = null;
  let clickedDownload = null;
  const document = {
    createElement: tag => new Element(tag),
    body: new Element("body")
  };
  const window = {
    URL: {
      createObjectURL(blob) { capturedBlob = blob; return "blob:pacedu-test"; },
      revokeObjectURL() {}
    },
    setTimeout() {},
    localStorage: { getItem() { return "T1"; } },
    PacEduDownloadableClassPacks: {
      resolveSubject(subject, level) {
        assert.equal(subject, "English");
        assert.equal(level, "Class 1");
        return { available: true, sourceSubject: "English" };
      }
    },
    PacEduDailyWorksheetContent: {
      getCurriculumWorksheet(options) {
        assert.equal(options.level, "Class 1");
        assert.equal(options.subject, "English");
        assert.equal(options.term, "T1");
        assert.equal(options.week, 2);
        assert.equal(options.day, 3);
        assert.equal(options.ability, "expected");
        return {
          topic: "Short a sound",
          dailyLesson: {
            classLevelObjective: "Identify the short a sound in familiar words",
            concept: "The short a vowel sound",
            workedExample: "c-a-t makes cat",
            steps: [{ mode: "Model", learnerAction: "Say each sound, then blend the word." }],
            materials: ["cat picture cards"],
            keyVocabulary: ["sound", "blend"],
            assessment: "Learner identifies the short a sound."
          },
          questions: [{ prompt: "Which word has the short a sound?", options: ["cat", "kite"] }],
          answerKey: [{ answer: "cat" }],
          curriculumSchedule: {
            verificationStatus: "NOT_YET_MAPPED",
            candidateSource: { title: "Fixture curriculum candidate", reference: "Unit 2, page 3" }
          }
        };
      }
    }
  };

  vm.runInNewContext(source, {
    window, document, Date, Blob, URL: window.URL, setTimeout: window.setTimeout,
    Array, String, Number, JSON
  });

  const host = new Element("div");
  const api = window.PacEduSeparateDailyResourceDownloads;
  assert.equal(api.renderControls(host, {
    level: "Class 1", subject: "English", term: "T1", useSelectedContext: true
  }), true);

  const selects = [];
  const collect = element => {
    if (element.tagName === "SELECT") selects.push(element);
    element.children.forEach(collect);
  };
  collect(host);
  assert.equal(selects.length, 3, "term, week and day selectors are present");
  selects[1].value = "2";
  selects[2].value = "3";

  const button = host.find(element =>
    element.tagName === "BUTTON" && element.textContent === "Download Teacher Teaching Aids"
  );
  assert.ok(button, "teacher teaching-aids download control is rendered");
  button.click();

  assert.ok(capturedBlob, "the real download handler creates a file blob");
  const html = await capturedBlob.text();
  assert.match(html, /Class:.*Class 1/);
  assert.match(html, /Subject:.*English/);
  assert.match(html, /Term:.*T1/);
  assert.match(html, /Week:.*2/);
  assert.match(html, /Day:.*3/);
  assert.match(html, /Identify the short a sound in familiar words/);
  assert.match(html, /c-a-t makes cat/);
  assert.match(html, /Say each sound, then blend the word/);
  assert.match(html, /cat picture cards/);
  assert.match(html, /Which word has the short a sound/);
  assert.match(html, /Teacher guidance:<\/strong> cat/);
  assert.match(html, /NOT_YET_MAPPED/);
  assert.match(html, /PENDING_TEACHER_REVIEW/);
});
