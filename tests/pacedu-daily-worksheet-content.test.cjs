const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync("src/js/paceduDailyWorksheetContent.js", "utf8");

function load() {
  const originalDayOne = { title: "Day 1 diagnostic must be preserved", day: 1 };
  const window = {
    PacificEducationEnglishWorksheetLibrary: {
      getWorksheet() { return originalDayOne; },
      levels: ["ECE", "Class 1"],
      subjects: [],
      abilities: []
    }
  };
  vm.runInNewContext(source, { window, Object, Array, String, Number, Math, RegExp });
  return window;
}

test("every listed subject produces four concrete questions with answer explanations", () => {
  const api = load().PacEduDailyWorksheetContent;
  assert.ok(api.subjects.length >= 10);
  for (const subject of api.subjects) {
    const worksheet = api.getWorksheet("Class 1", subject, 2, "developing");
    assert.equal(worksheet.subject, subject);
    assert.equal(worksheet.questions.length, 4, subject);
    assert.equal(worksheet.answerKey.length, 4, subject);
    assert.ok(worksheet.readingText.length > 20, subject);
    assert.ok(worksheet.questions.every(q => q.prompt && q.options && q.answer && q.why && (q.options.length ? q.options[q.correctOption] === q.answer : q.type === "Oral / picture response")), subject);
    assert.ok(worksheet.answerKey.every(a => a.answer && a.explanation), subject);
    assert.equal(worksheet.status, "DRAFT_REQUIRES_OFFICIAL_OUTCOME_MAPPING");
  }
});

test("Maths answer keys calculate correctly for market money and rainfall examples", () => {
  const api = load().PacEduDailyWorksheetContent;
  const market = api.getWorksheet("Class 1", "Mathematics", 3, "expected");
  assert.equal(market.topic, "Market money");
  assert.equal(market.questions[0].answer, "$12");
  assert.equal(market.questions[1].answer, "$8");
  const rain = api.getWorksheet("Form 5", "Mathematics", 4, "expected");
  assert.equal(rain.topic, "Rainfall data");
  assert.equal(rain.questions[1].answer, "16 mm");
  assert.equal(rain.questions[3].answer, "4 mm");
});

test("levels and four ability bands produce differentiated directions", () => {
  const api = load().PacEduDailyWorksheetContent;
  const support = api.getWorksheet("ECE", "English", 2, "support");
  const extension = api.getWorksheet("Form 7", "English", 2, "extension");
  assert.ok(support.tasks[0].includes("SUPPORTED START"));
  assert.ok(extension.tasks[0].includes("EXTENSION"));
  assert.equal(support.responseLines, 2);
  assert.equal(extension.responseLines, 7);
});

test("day one diagnostic is not overwritten and wrapper exposes the daily bank", () => {
  const window = load();
  assert.equal(window.PacificEducationEnglishWorksheetLibrary.getWorksheet("Class 1", "initial-assessment", 1, "English").title,
    "Day 1 diagnostic must be preserved");
  assert.equal(window.PacificEducationEnglishWorksheetLibrary.dailyContentEnhanced, true);
  assert.equal(typeof window.PacificEducationEnglishWorksheetLibrary.getDailyContentWorksheet, "function");
});

test("Fijian language packs require verified teacher-provided text rather than invented translations", () => {
  const api = load().PacEduDailyWorksheetContent;
  for (const subject of ["iTaukei Language", "Hindi"]) {
    const worksheet = api.getWorksheet("Class 4", subject, 2, "developing");
    assert.ok(worksheet.readingText.includes("Teacher: insert"));
    assert.ok(worksheet.sourceNote.includes("current Fiji Ministry syllabus"));
  }
});

test("all Fiji levels and four ability bands return complete differentiated worksheets", () => {
  const api = load().PacEduDailyWorksheetContent;
  assert.deepEqual(JSON.parse(JSON.stringify(api.levels)), [
    "ECE", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8",
    "Form 3", "Form 4", "Form 5", "Form 6", "Form 7"
  ]);
  for (const level of api.levels) {
    for (const subject of api.subjects) {
      for (const ability of ["support", "developing", "expected", "extension"]) {
        const worksheet = api.getWorksheet(level, subject, 2, ability);
        assert.equal(worksheet.level, level);
        assert.equal(worksheet.subject, subject);
        assert.equal(worksheet.ability, ability);
        assert.equal(worksheet.questions.length, 4);
        assert.equal(worksheet.answerKey.length, 4);
        assert.ok(worksheet.tasks.length >= 3);
        assert.ok(worksheet.sourceNote.includes("source mapping pending"));
        for (const q of worksheet.questions) {
          if (q.options.length) assert.equal(q.options[q.correctOption], q.answer);
          else assert.equal(q.type, "Oral / picture response");
        }
      }
    }
  }
});

test("the scheduled curriculum workspace uses the selected subject, not a hard-coded English worksheet", () => {
  const api = load().PacEduDailyWorksheetContent;
  const library = fs.readFileSync("src/js/pacificEducationEnglishWorksheetLibrary.js", "utf8");
  assert.match(library, /var isCurriculumSchedule/);
  assert.match(library, /subject: subjectSelect\.value, term: termSelect\.value/);
  assert.match(library, /makeWorksheet\(levelSelect\.value, "initial-assessment", 1, subjectSelect\.value\)/);
  for (const subject of api.subjects) {
    const worksheet = api.getCurriculumWorksheet({
      level: "Class 4", subject, term: "T1", week: 2, day: 3, ability: "developing"
    });
    assert.equal(worksheet.subject, subject);
    assert.equal(worksheet.curriculumSchedule.verificationStatus, "NOT_YET_MAPPED");
    assert.equal(worksheet.questions.length, 4);
    assert.equal(worksheet.answerKey.length, 4);
  }
});

test("every scheduled subject and supported level receives a five-step see-read-hear lesson with an honest curriculum trace", () => {
  const api = load().PacEduDailyWorksheetContent;
  const levels = ["ECE","Class 1","Class 2","Class 3","Class 4","Class 5","Class 6","Class 7","Class 8","Form 3","Form 4","Form 5","Form 6","Form 7"];
  for (const level of levels) {
    for (const subject of api.subjects) {
      const worksheet = api.getCurriculumWorksheet({
        level, subject, term: "T1", week: 1, day: 2, ability: "developing"
      });
      assert.equal(worksheet.level, level);
      assert.equal(worksheet.subject, subject);
      assert.ok(worksheet.dailyLesson, level + " / " + subject);
      assert.equal(worksheet.dailyLesson.steps.length, 5);
      assert.equal(Array.from(worksheet.dailyLesson.steps, x => x.mode).join("|"),
        ["SEE / VIDEO FRAME", "READ", "HEAR / AUDIO", "TRY", "CHECK / REFLECT"].join("|"));
      assert.ok(worksheet.dailyLesson.audioNarration.transcript.length > 80);
      assert.ok(worksheet.dailyLesson.learnerText.passage.length > 10);
      assert.ok(worksheet.dailyLesson.workedExample.length > 10);
      assert.equal(worksheet.dailyLesson.curriculumAlignment.level, level);
      assert.equal(worksheet.dailyLesson.curriculumAlignment.subject, subject);
      assert.equal(worksheet.dailyLesson.curriculumAlignment.achievementIndicator, null);
      assert.equal(worksheet.dailyLesson.curriculumAlignment.verificationStatus, "NOT_YET_MAPPED");
      assert.match(worksheet.dailyLesson.curriculumAlignment.rule, /Do not invent an official achievement indicator/);
    }
  }
});

test("daily concept focus changes by day and each supported class has its own learning target", () => {
  const api = load().PacEduDailyWorksheetContent;
  const levels = ["ECE","Class 1","Class 2","Class 3","Class 4","Class 5","Class 6","Class 7","Class 8","Form 3","Form 4","Form 5","Form 6","Form 7"];
  const objectives = levels.map(level => api.getCurriculumWorksheet({
    level,subject:"Mathematics",term:"T1",week:2,day:3,ability:"expected"
  }).dailyLesson.classLevelObjective);
  assert.equal(new Set(objectives).size, levels.length);
  const dailyConcepts = [1,2,3,4,5].map(day => api.getCurriculumWorksheet({
    level:"Class 4",subject:"Science",term:"T1",week:2,day,ability:"developing"
  }).dailyLesson.learningConcept);
  assert.equal(new Set(dailyConcepts).size, 5);
  const learner = api.getCurriculumWorksheet({
    level:"Class 4",subject:"Science",term:"T1",week:2,day:4,ability:"developing"
  }).dailyLesson;
  assert.match(learner.learningIntention, /apply the skill to a new example/i);
  assert.match(learner.classLevelObjective, /Class 4|Explain the concept/i);
});

test("a matching class-specific indicator is attached only as a candidate until reviewed", () => {
  const window = load();
  window.PacificEducationAchievementDistributionEngine = {
    buildDailyIndicatorPlan(filters) {
      assert.equal(filters.classId, "CLASS-1-A");
      assert.equal(filters.level, "Class 1");
      assert.equal(filters.subjectId, "English");
      assert.equal(filters.term, "Term 1");
      return {assignment:{
        classId:"CLASS-1-A",level:"Class 1",subjectId:"English",term:"Term 1",
        indicatorId:"C1-ENG-P-002",indicatorText:"Respond to a short spoken message.",
        strand:"Speaking and Listening",sourceStatus:"unverified",productionEligible:false
      }};
    }
  };
  const worksheet = window.PacEduDailyWorksheetContent.getCurriculumWorksheet({
    level:"Class 1",subject:"English",term:"T1",curriculumTerm:"Term 1",
    week:1,day:2,dayNumber:2,ability:"developing",classReference:"CLASS-1-A"
  });
  assert.equal(worksheet.dailyLesson.curriculumAlignment.candidateIndicator.id,"C1-ENG-P-002");
  assert.equal(worksheet.dailyLesson.curriculumAlignment.candidateIndicator.status,"PENDING_TEACHER_REVIEW");
  assert.equal(worksheet.dailyLesson.curriculumAlignment.achievementIndicator,null);
  assert.equal(worksheet.dailyLesson.curriculumAlignment.verificationStatus,"NOT_YET_MAPPED");
  const mismatched = window.PacEduDailyWorksheetContent.getCurriculumWorksheet({
    level:"Class 1",subject:"English",term:"T1",curriculumTerm:"Term 1",
    week:1,day:2,dayNumber:2,ability:"developing",classReference:"OTHER-CLASS"
  });
  assert.equal(mismatched.dailyLesson.curriculumAlignment.candidateIndicator,undefined);
});

test("Class 1 English Day 2 starts with the planned introduction activity", () => {
  const worksheet = load().PacEduDailyWorksheetContent.getWorksheet("Class 1", "English", 2, "expected");
  assert.equal(worksheet.topic, "Who am I? — Class 1 Term 1 Week 1");
  assert.equal(worksheet.answerKey[0].answer, "Class 1");
});


test("term-week-day scheduler returns concrete worksheets with explicit curriculum verification fields", () => {
  const api = load().PacEduDailyWorksheetContent;
  assert.equal(typeof api.getCurriculumWorksheet, "function");
  for (const term of [
    ["T1", 9], ["T2", 9], ["T3", 5], ["ASSESSMENT", 1],
    ["INTERVENTION", 5], ["REVISION", 2], ["EXAMS", 2]
  ]) {
    for (let week = 1; week <= term[1]; week += 1) {
      for (let day = 1; day <= 5; day += 1) {
        const worksheet = api.getCurriculumWorksheet({
          level: "Class 1", subject: "English", term: term[0],
          week, day, ability: "developing"
        });
        assert.notEqual(worksheet.status, "NOT_FOUND");
        assert.equal(worksheet.curriculumSchedule.termId, term[0]);
        assert.equal(worksheet.curriculumSchedule.week, week);
        assert.equal(worksheet.curriculumSchedule.day, day);
        assert.equal(worksheet.questions.length, 4);
        assert.equal(worksheet.answerKey.length, 4);
        assert.equal(worksheet.curriculumSchedule.verificationStatus, "NOT_YET_MAPPED");
        assert.equal(worksheet.curriculumSchedule.achievementIndicator, null);
      }
    }
  }
  assert.equal(api.getCurriculumWorksheet({term:"T3",week:6,day:1}).status, "NOT_FOUND");
  assert.equal(api.getCurriculumWorksheet({term:"T1",week:10,day:1}).status, "NOT_FOUND");
  assert.equal(api.getCurriculumWorksheet({term:"T2",week:10,day:1}).status, "NOT_FOUND");
});


test("teacher weekly planner selects a day and displays the daily example, questions and teacher key", () => {
  const planner = fs.readFileSync("src/js/paceduFijiCurriculumWeeklyActivities.js", "utf8");
  assert.match(planner, /paceduFijiCurriculumDay/);
  assert.match(planner, /getCurriculumWorksheet/);
  assert.match(planner, /Practice example:/);
  assert.match(planner, /Teacher answer key and curriculum check/);
  assert.match(planner, /daily\.questions\.forEach/);
  assert.match(planner, /Print student worksheet/);
  assert.match(planner, /pacedu-print-daily-worksheet/);
  assert.match(planner, /#paceduFijiWeeklyCurriculumPreview details\{display:none!important\}/);
});


test("scheduled English worksheets provide level-appropriate reading and four answer-keyed questions", () => {
  const api = load().PacEduDailyWorksheetContent;
  const levels = ["ECE","Class 1","Class 3","Class 6","Class 8","Form 3","Form 5","Form 7"];
  for (const level of levels) {
    for (const ability of ["support","developing","expected","extension"]) {
      for (let day = 1; day <= 5; day += 1) {
        const worksheet = api.getCurriculumWorksheet({
          level, subject: "English", term: "T1", week: 1, day, ability
        });
        assert.equal(worksheet.level, level);
        assert.equal(worksheet.subject, "English");
        assert.equal(worksheet.ability, ability);
        assert.equal(worksheet.questions.length, 4);
        assert.equal(worksheet.answerKey.length, 4);
        assert.ok(worksheet.readingText.length > 40);
        assert.ok(worksheet.topic.includes(["main topic","important words","connect sentences","evidence","independent response"][day-1]));
        assert.equal(worksheet.curriculumSchedule.verificationStatus, "NOT_YET_MAPPED");
        assert.equal(worksheet.status, "DRAFT_REQUIRES_OFFICIAL_OUTCOME_MAPPING");
        assert.ok(worksheet.answerKey.every(item => item.answer && item.explanation));
        for (const question of worksheet.questions) {
          if (question.options.length) assert.equal(question.options[question.correctOption], question.answer);
        }
      }
    }
  }
  const ece = api.getCurriculumWorksheet({level:"ECE",subject:"English",term:"T1",week:1,day:1,ability:"support"});
  const form7 = api.getCurriculumWorksheet({level:"Form 7",subject:"English",term:"T1",week:1,day:1,ability:"extension"});
  assert.notEqual(ece.readingText, form7.readingText);
  assert.match(ece.tasks[0], /SUPPORTED START/);
  assert.match(form7.tasks[0], /EXTENSION/);
});


test("English curriculum worksheet carries candidate source metadata without falsely certifying alignment", () => {
  const api = load().PacEduDailyWorksheetContent;
  const candidate = api.getCurriculumWorksheet({level:"Class 1",subject:"English",term:"T1",week:1,day:2,ability:"developing"});
  assert.equal(candidate.curriculumSchedule.verificationStatus, "NOT_YET_MAPPED");
  assert.equal(candidate.status, "DRAFT_REQUIRES_OFFICIAL_OUTCOME_MAPPING");
  assert.equal(candidate.curriculumSchedule.candidateSource.title, "Year 1 English — Language, Literacy and Communication");
  assert.match(candidate.curriculumSchedule.candidateSource.url, /^https:\/\//);
  assert.match(candidate.curriculumSchedule.candidateSource.authorityStatus, /THIRD_PARTY_HOSTED_COPY/);
  assert.match(candidate.sourceNote, /current authorized school\/FEMIS\/Ministry copy/);
  const other = api.getCurriculumWorksheet({level:"Form 7",subject:"English",term:"T2",week:3,day:1,ability:"extension"});
  assert.equal(other.curriculumSchedule.candidateSource, null);
  assert.equal(other.curriculumSchedule.verificationStatus, "NOT_YET_MAPPED");
});


test("English practice targets progress specifically by class from ECE through Form 7", () => {
  const api = load().PacEduDailyWorksheetContent;
  const levels = ["ECE","Class 1","Class 2","Class 3","Class 4","Class 5","Class 6","Class 7","Class 8","Form 3","Form 4","Form 5","Form 6","Form 7"];
  const targets = levels.map(level => {
    const worksheet = api.getCurriculumWorksheet({level,subject:"English",term:"T1",week:1,day:2,ability:"expected"});
    assert.ok(worksheet.tasks.some(task => task.startsWith("Class-level target: ")), level);
    assert.ok(worksheet.tasks.some(task => task.includes("Write") || task.includes("Show,")), level);
    assert.match(worksheet.readingText, /Class-level practice target:/, level);
    assert.equal(worksheet.status, "DRAFT_REQUIRES_OFFICIAL_OUTCOME_MAPPING");
    return worksheet.tasks.find(task => task.startsWith("Class-level target: "));
  });
  assert.equal(new Set(targets).size, levels.length);
  assert.equal(api.getCurriculumWorksheet({level:"ECE",subject:"English",term:"T1",week:1,day:2,ability:"expected"}).responseLines, 2);
  assert.equal(api.getCurriculumWorksheet({level:"Form 7",subject:"English",term:"T1",week:1,day:2,ability:"expected"}).responseLines, 14);
});
