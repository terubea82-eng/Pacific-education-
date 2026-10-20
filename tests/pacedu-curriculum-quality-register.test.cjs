const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync("src/js/pacificEducationCurriculumQualityRegister.js", "utf8");

function loadRegister() {
  const local = new Map();
  const document = {
    readyState: "loading",
    addEventListener() {},
    getElementById() { return null; }
  };
  const window = {
    addEventListener() {},
    localStorage: {
      getItem(key) { return local.has(key) ? local.get(key) : null; },
      setItem(key, value) { local.set(key, String(value)); }
    }
  };
  vm.runInNewContext(source, {
    window, document, localStorage: window.localStorage,
    Date, Math, JSON, String, Object, Array
  });
  return window.PacificEducationCurriculumQualityRegister;
}

test("detects exact indicator wording repeated across different assigned terms", () => {
  const register = loadRegister();
  const results = register.detectRepeatedIndicators([
    {id:"A1",level:"Class 7",subjectId:"Social Science",term:"Term 1",indicatorText:"Identify and collect evidence.",sourceDocument:"Syllabus 2015"},
    {id:"A2",level:"Class 7",subjectId:"Social Science",term:"Term 2",indicatorText:"Identify and collect evidence.",sourceDocument:"Syllabus 2015"},
    {id:"A3",level:"Class 7",subjectId:"Social Science",term:"Term 3",indicatorText:"Identify and collect evidence.",sourceDocument:"Syllabus 2015"}
  ]);
  assert.equal(results.length, 1);
  assert.deepEqual(JSON.parse(JSON.stringify(results[0].terms)), ["Term 1","Term 2","Term 3"]);
  assert.deepEqual(JSON.parse(JSON.stringify(results[0].indicatorIds)), ["A1","A2","A3"]);
  assert.equal(results[0].scanKey, "repeat:Class 7|Social Science|identify and collect evidence.");
});

test("does not infer repetition from UNASSIGNED indicators or same-term duplicates", () => {
  const register = loadRegister();
  assert.equal(register.detectRepeatedIndicators([
    {id:"A1",level:"Class 7",subjectId:"Social Science",term:"UNASSIGNED",indicatorText:"Repeated wording."},
    {id:"A2",level:"Class 7",subjectId:"Social Science",term:"UNASSIGNED",indicatorText:"Repeated wording."}
  ]).length, 0);
  assert.equal(register.detectRepeatedIndicators([
    {id:"A1",level:"Class 7",subjectId:"Social Science",term:"Term 1",indicatorText:"Repeated wording."},
    {id:"A2",level:"Class 7",subjectId:"Social Science",term:"Term 1",indicatorText:"Repeated wording."}
  ]).length, 0);
});

test("mastery requires specific evidence rather than a status click alone", () => {
  const register = loadRegister();
  assert.equal(register.hasMasteryEvidence(""), false);
  assert.equal(register.hasMasteryEvidence("good"), false);
  assert.equal(register.hasMasteryEvidence("Dated worksheet 12"), true);
});
