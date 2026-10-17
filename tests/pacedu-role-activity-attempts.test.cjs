const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync("src/js/pacificEducationRoleActivityPacks.js", "utf8");

class FakeElement {
  constructor(tag) {
    this.tagName = String(tag || "div").toUpperCase();
    this.children = [];
    this.attributes = {};
    this.listeners = {};
    this.style = {};
    this.parentNode = null;
    this.value = "";
    this.checked = false;
    this.textContent = "";
    this.innerHTML = "";
  }
  appendChild(child) {
    this.children.push(child);
    child.parentNode = this;
    return child;
  }
  removeChild(child) {
    this.children = this.children.filter((item) => item !== child);
    child.parentNode = null;
    return child;
  }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  addEventListener(name, callback) { this.listeners[name] = callback; }
  focus() {}
  click() { if (this.listeners.click) this.listeners.click({ target: this, preventDefault() {} }); }
}

function findElement(root, predicate) {
  if (predicate(root)) return root;
  for (const child of root.children || []) {
    const found = findElement(child, predicate);
    if (found) return found;
  }
  return null;
}

function createHarness() {
  const storage = new Map();
  const localStorage = {
    getItem(key) { return storage.has(key) ? storage.get(key) : null; },
    setItem(key, value) { storage.set(key, String(value)); }
  };
  const window = { localStorage };
  const document = {
    createElement(tag) { return new FakeElement(tag); },
    createTextNode(value) {
      const node = new FakeElement("#text");
      node.textContent = String(value);
      return node;
    },
    getElementById() { return null; }
  };
  vm.runInNewContext(source, { window, document, Date, Math, JSON, String, Object, Array, Number, RegExp });
  return { packs: window.PacificEducationRoleActivityPacks, storage };
}

test("every learner and non-learner role can render, attempt, and save its workspace activity", () => {
  const roles = [
    ["student", "dailyLesson"],
    ["blind-learner", "dailyLesson"],
    ["deaf-learner", "dailyLesson"],
    ["teacher", "teacherDashboard"],
    ["parent", "parentDashboard"],
    ["professional", "pacificEducationExternalReviewerPortal"],
    ["ngo", "pacificEducationWebsitePilotChecklist"],
    ["education", "pacificEducationCurriculumMasterControlStatus"],
    ["community", "pacificEducationWebsitePilotChecklist"],
    ["head-of-school", "pacificEducationTeacherClassRoster"],
    ["institution-admin", "pacificEducationInstitutionSetup"],
    ["special-education", "specialEducationDashboard"],
    ["owner", "pacificEducationPrivilegedAccessNotice"],
    ["technician", "pacificEducationPrivilegedAccessNotice"]
  ];

  const harness = createHarness();
  for (const [role, stepId] of roles) {
    const host = new FakeElement("div");
    assert.equal(harness.packs.render(role, stepId, host, 1), true, role + " activity should render");
    const card = host.children.find((child) => child.attributes && child.attributes["aria-label"]);
    assert.ok(card, role + " should receive a visible activity card");

    const response = findElement(card, (el) => el.tagName === "TEXTAREA");
    const attempted = findElement(card, (el) => el.tagName === "INPUT" && el.type !== "textarea" && el.type !== undefined && el.type !== "button");
    const save = findElement(card, (el) => el.tagName === "BUTTON");
    assert.ok(response, role + " should have a response field");
    assert.ok(attempted, role + " should have an attempt/completion checkbox");
    assert.ok(save, role + " should have a save action");

    response.value = "Test-only response for " + role;
    attempted.checked = true;
    save.click();

    const saved = JSON.parse(harness.storage.get("pacificEducationRoleActivityEvidenceV1") || "{}");
    const records = Object.values(saved);
    const record = records.find((item) => item.role === role);
    assert.ok(record, role + " attempt should be stored separately as role activity evidence");
    assert.equal(record.response, "Test-only response for " + role);
    assert.equal(record.completed, true);
    assert.match(record.reviewStatus, /^PENDING_|^REQUIRES_/);
    assert.equal(record.storage, "local-device-pilot");
  }
});

test("learner workspace attempts remain separate from formal assessment submissions", () => {
  const harness = createHarness();
  const host = new FakeElement("div");
  assert.equal(harness.packs.render("student", "dailyLesson", host, 1), true);
  const card = host.children[0];
  const response = findElement(card, (el) => el.tagName === "TEXTAREA");
  const attempted = findElement(card, (el) => el.tagName === "INPUT" && el.type !== "button");
  const save = findElement(card, (el) => el.tagName === "BUTTON");
  response.value = "I attempted the daily learning task.";
  attempted.checked = true;
  save.click();

  assert.ok(harness.storage.has("pacificEducationRoleActivityEvidenceV1"));
  assert.ok(harness.storage.has("pacificEducationStudentDailyActivityProgressV1"));
  assert.equal(harness.storage.has("pacificEducationAssessmentSubmissions"), false);
  assert.equal(harness.storage.has("pacificEducationActivityResponses"), false);
});
