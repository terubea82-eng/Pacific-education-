const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync("src/js/paceduDailyWorksheetContent.js", "utf8");
const termPlanSource = fs.readFileSync("src/js/paceduTermLearningPlan.js", "utf8");

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
  vm.runInNewContext(termPlanSource, { window, Object, Array, String, Number, Math, RegExp });
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
  assert.ok(support.tasks[0].includes("FOUNDATION"));
  assert.ok(extension.tasks[0].includes("ADVANCED"));
  assert.equal(support.responseLines, 2);
  assert.equal(extension.responseLines, 7);
});

test("day one cannot bypass the curriculum-first gate", () => {
  const window=load();
  const dayOne=window.PacificEducationEnglishWorksheetLibrary.getWorksheet("Class 1","developing",1,"English");
  assert.equal(window.PacificEducationEnglishWorksheetLibrary.dailyContentEnhanced,true);
  assert.equal(typeof window.PacificEducationEnglishWorksheetLibrary.getDailyContentWorksheet,"function");
  assert.equal(dayOne.status,"BLOCKED_CURRICULUM_SOURCE_REQUIRED");
  assert.equal(dayOne.questions.length,0);
  assert.equal(dayOne.tasks.length,0);
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

test("the scheduled curriculum workspace retains subject metadata but blocks unverified learner content", () => {
  const api=load().PacEduDailyWorksheetContent;
  for(const subject of api.subjects){
    const w=api.getCurriculumWorksheet({level:"Class 4",subject,term:"T1",week:2,day:3,ability:"developing"});
    assert.equal(w.subject,subject);
    assert.equal(w.curriculumSchedule.verificationStatus,"NOT_YET_MAPPED");
    assert.equal(w.status,"BLOCKED_CURRICULUM_SOURCE_REQUIRED");
    assert.equal(w.questions.length,0);
    assert.equal(w.tasks.length,0);
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

test("an unvalidated legacy indicator candidate cannot release learner activities", () => {
  const window=load();
  window.PacificEducationAchievementDistributionEngine={buildDailyIndicatorPlan(){return {assignment:{
    classId:"CLASS-1-A",level:"Class 1",subjectId:"English",term:"Term 1",
    indicatorId:"C1-ENG-P-002",indicatorText:"Respond to a short spoken message.",
    strand:"Speaking and Listening",sourceStatus:"unverified",productionEligible:false
  }};}};
  const w=window.PacEduDailyWorksheetContent.getCurriculumWorksheet({level:"Class 1",subject:"English",term:"T1",curriculumTerm:"Term 1",week:1,day:2,dayNumber:2,ability:"developing",classReference:"CLASS-1-A"});
  assert.equal(w.status,"BLOCKED_CURRICULUM_SOURCE_REQUIRED");
  assert.equal(w.indicatorMappingStatus,"PENDING_TEACHER_REVIEW");
  assert.equal(w.questions.length,0);
  assert.equal(w.answerKey.length,0);
});

test("Class 1 English Day 2 starts with the planned introduction activity", () => {
  const worksheet = load().PacEduDailyWorksheetContent.getWorksheet("Class 1", "English", 2, "expected");
  assert.equal(worksheet.topic, "Who am I? — Class 1 Term 1 Week 1");
  assert.equal(worksheet.answerKey[0].answer, "Class 1");
});

test("unverified daily slots expose no learner questions or answer keys", () => {
  const api=load().PacEduDailyWorksheetContent;
  const opts={level:"Class 1",subject:"English",term:"T1",week:1,day:2};
  const a=api.getCurriculumWorksheet(Object.assign({},opts,{ability:"support"}));
  const b=api.getCurriculumWorksheet(Object.assign({},opts,{ability:"extension"}));
  assert.equal(a.status,"BLOCKED_CURRICULUM_SOURCE_REQUIRED");
  assert.equal(b.status,"BLOCKED_CURRICULUM_SOURCE_REQUIRED");
  assert.equal(a.questions.length,0);
  assert.equal(a.answerKey.length,0);
  assert.equal(a.activityId,b.activityId);
  assert.equal(a.questionSequenceId,b.questionSequenceId);
});


test("term-week-day scheduler retains calendar metadata but blocks unverified activities", () => {
  const api=load().PacEduDailyWorksheetContent;
  for(const term of [["T1",9],["T2",9],["T3",5],["ASSESSMENT",1],["INTERVENTION",5],["REVISION",2],["EXAMS",2]]){
    for(let week=1;week<=term[1];week+=1) for(let day=1;day<=5;day+=1){
      const w=api.getCurriculumWorksheet({level:"Class 1",subject:"English",term:term[0],week,day,ability:"developing"});
      assert.equal(w.curriculumSchedule.termId,term[0]);
      assert.equal(w.curriculumSchedule.week,week);
      assert.equal(w.curriculumSchedule.day,day);
      assert.equal(w.status,"BLOCKED_CURRICULUM_SOURCE_REQUIRED");
      assert.equal(w.questions.length,0);
      assert.equal(w.answerKey.length,0);
    }
  }
  assert.equal(api.getCurriculumWorksheet({term:"T3",week:6,day:1}).status,"NOT_FOUND");
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


test("scheduled English slots remain blocked until their official indicators are validated", () => {
  const api=load().PacEduDailyWorksheetContent;
  for(const level of ["ECE","Class 1","Class 3","Class 6","Class 8","Form 3","Form 5","Form 7"]){
    for(const ability of ["support","developing","expected","extension"]) for(let day=1;day<=5;day+=1){
      const w=api.getCurriculumWorksheet({level,subject:"English",term:"T1",week:1,day,ability});
      assert.equal(w.level,level);
      assert.equal(w.ability,ability);
      assert.equal(w.status,"BLOCKED_CURRICULUM_SOURCE_REQUIRED");
      assert.equal(w.questions.length,0);
      assert.equal(w.answerKey.length,0);
      assert.equal(w.readingText,"");
      assert.equal(w.dailyLesson.steps.length,0);
    }
  }
});


test("English candidate source metadata is retained while learner content remains blocked", () => {
  const w=load().PacEduDailyWorksheetContent.getCurriculumWorksheet({level:"Class 1",subject:"English",term:"T1",week:1,day:2,ability:"developing"});
  assert.equal(w.curriculumSchedule.verificationStatus,"NOT_YET_MAPPED");
  assert.equal(w.status,"BLOCKED_CURRICULUM_SOURCE_REQUIRED");
  assert.equal(w.curriculumSchedule.candidateSource.title,"Year 1 English — Language, Literacy and Communication");
  assert.match(w.curriculumSchedule.candidateSource.url,/^https:\/\//);
  assert.equal(w.questions.length,0);
});


test("all levels remain protected until their prescribed indicators are approved", () => {
  const api=load().PacEduDailyWorksheetContent;
  for(const level of api.levels){
    const w=api.getCurriculumWorksheet({level,subject:"English",term:"T1",week:1,day:2,ability:"expected"});
    assert.equal(w.status,"BLOCKED_CURRICULUM_SOURCE_REQUIRED",level);
    assert.equal(w.curriculumGate.passed,false,level);
    assert.equal(w.questions.length,0,level);
  }
});

test("term plan follows nine weeks in Terms 1 and 2 and five weeks in Term 3", () => {
  const api = load().PacEduTermLearningPlan;
  assert.equal(api.getTermPlan({term:"T1"}).weeks, 9);
  assert.equal(api.getTermPlan({term:"T2"}).weeks, 9);
  assert.equal(api.getTermPlan({term:"T3"}).weeks, 5);
  assert.equal(api.getTermPlan({term:"T1"}).teachingDays, 45);
  assert.equal(api.getTermPlan({term:"T2"}).weeksPlan.length, 9);
  assert.equal(api.getTermPlan({term:"T3"}).weeksPlan.length, 5);
  assert.match(api.getTermPlan({term:"T1"}).note, /current authorised Fiji syllabus/i);
});

test("revision practice remains disabled without a validated prescribed indicator", () => {
  const api=load().PacEduDailyWorksheetContent;
  for(const level of api.levels) for(const subject of api.subjects){
    const w=api.getCurriculumWorksheet({level,subject,term:"REVISION",week:1,day:1,ability:"developing"});
    if(w.status==="NOT_FOUND") continue;
    assert.equal(w.status,"BLOCKED_CURRICULUM_SOURCE_REQUIRED");
    assert.equal(w.revisionPaper,null);
    assert.equal(w.questions.length,0);
  }
});
