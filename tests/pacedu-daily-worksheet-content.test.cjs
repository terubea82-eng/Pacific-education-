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

test("every listed subject is blocked from learner release until its prescription is validated", () => {
  const api=load().PacEduDailyWorksheetContent;
  assert.ok(api.subjects.length>=10);
  for(const subject of api.subjects){
    const w=api.getWorksheet("Class 1",subject,2,"developing");
    assert.equal(w.subject,subject);
    assert.equal(w.status,"BLOCKED_CURRICULUM_SOURCE_REQUIRED");
    assert.equal(w.questions.length,0);
    assert.equal(w.answerKey.length,0);
    assert.equal(w.readingText,"");
    assert.equal(w.learnerReleaseEligible,false);
  }
});

test("unverified mathematics examples are not exposed as daily learner activities", () => {
  const api=load().PacEduDailyWorksheetContent;
  for(const [day,ability] of [[3,"expected"],[4,"expected"]]){
    const w=api.getWorksheet("Class 1","Mathematics",day,ability);
    assert.equal(w.status,"BLOCKED_CURRICULUM_SOURCE_REQUIRED");
    assert.equal(w.questions.length,0);
    assert.equal(w.answerKey.length,0);
  }
});

test("all four ability bands remain blocked until a shared prescribed objective is approved", () => {
  const api=load().PacEduDailyWorksheetContent;
  for(const ability of ["support","developing","expected","extension"]){
    const w=api.getWorksheet("ECE","English",2,ability);
    assert.equal(w.status,"BLOCKED_CURRICULUM_SOURCE_REQUIRED");
    assert.equal(w.questions.length,0);
    assert.equal(w.tasks.length,0);
    assert.equal(w.curriculumGate.serverAuthorizationRequired,true);
  }
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

test("Fijian language packs do not release unverified translations or learner text", () => {
  const api=load().PacEduDailyWorksheetContent;
  for(const subject of ["iTaukei Language","Hindi"]){
    const w=api.getWorksheet("Class 4",subject,2,"developing");
    assert.equal(w.status,"BLOCKED_CURRICULUM_SOURCE_REQUIRED");
    assert.equal(w.readingText,"");
    assert.equal(w.questions.length,0);
    assert.equal(w.learnerReleaseEligible,false);
  }
});

test("all Fiji levels and ability bands are subject to the same curriculum-first lock", () => {
  const api=load().PacEduDailyWorksheetContent;
  assert.deepEqual(JSON.parse(JSON.stringify(api.levels)),["ECE","Class 1","Class 2","Class 3","Class 4","Class 5","Class 6","Class 7","Class 8","Form 3","Form 4","Form 5","Form 6","Form 7"]);
  for(const level of api.levels) for(const subject of api.subjects) for(const ability of ["support","developing","expected","extension"]){
    const w=api.getWorksheet(level,subject,2,ability);
    assert.equal(w.level,level);
    assert.equal(w.subject,subject);
    assert.equal(w.ability,ability);
    assert.equal(w.status,"BLOCKED_CURRICULUM_SOURCE_REQUIRED");
    assert.equal(w.questions.length,0);
    assert.equal(w.answerKey.length,0);
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

test("daily lesson metadata remains available while unverified learner content is suppressed", () => {
  const api=load().PacEduDailyWorksheetContent;
  for(const level of api.levels) for(const subject of api.subjects){
    const w=api.getCurriculumWorksheet({level,subject,term:"T1",week:1,day:2,ability:"developing"});
    assert.ok(w.dailyLesson);
    assert.equal(w.dailyLesson.curriculumAlignment.level,level);
    assert.equal(w.dailyLesson.curriculumAlignment.subject,subject);
    assert.equal(w.status,"BLOCKED_CURRICULUM_SOURCE_REQUIRED");
    assert.equal(w.dailyLesson.steps.length,0);
    assert.equal(w.dailyLesson.learnerText.passage,"");
    assert.equal(w.questions.length,0);
  }
});

test("unverified curriculum slots do not expose daily concepts or learner targets", () => {
  const api=load().PacEduDailyWorksheetContent;
  for(const day of [1,2,3,4,5]){
    const w=api.getCurriculumWorksheet({level:"Class 4",subject:"Science",term:"T1",week:2,day,ability:"developing"});
    assert.equal(w.status,"BLOCKED_CURRICULUM_SOURCE_REQUIRED");
    assert.equal(w.dailyLesson.learningConcept,"");
    assert.equal(w.dailyLesson.learningIntention,"");
    assert.equal(w.dailyLesson.classLevelObjective,"");
    assert.equal(w.questions.length,0);
  }
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

test("Class 1 English Day 2 is blocked until its exact prescribed indicator is validated", () => {
  const w=load().PacEduDailyWorksheetContent.getWorksheet("Class 1","English",2,"expected");
  assert.equal(w.status,"BLOCKED_CURRICULUM_SOURCE_REQUIRED");
  assert.equal(w.topic,"Curriculum source pending");
  assert.equal(w.answerKey.length,0);
  assert.equal(w.questions.length,0);
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
