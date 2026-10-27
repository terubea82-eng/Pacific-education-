const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function loadPack(){
  const window = {};
  window.PacEduDailyWorksheetContent = {
    levels:['ECE','Class 1','Class 2','Class 3','Class 4','Class 5','Class 6','Class 7','Class 8','Form 3','Form 4','Form 5','Form 6','Form 7'],
    subjects:['English','Mathematics','Science','Social Studies','Healthy Living','Physical Education','Arts and Crafts','Music','Digital Literacy','iTaukei Language','Hindi'],
    getCurriculumWorksheet(o){
      if(o.week<1||o.week>(o.term==='T3'?5:9)) return {status:'NOT_FOUND'};
      return {topic:'Sample topic',passage:'Sample reading',questions:[{prompt:'Question one?',options:['A','B']}],
        answerKey:[{answer:'A',explanation:'Checked answer'}],dailyLesson:{concept:'Sample concept',classLevelObjective:'Sample objective',exampleText:'A worked example',narration:'Listen to the example.'},
        curriculumSchedule:{suggestedFocus:'Sample focus',verificationStatus:'NOT_YET_MAPPED'}};
    }
  };
  window.PacEduTermLearningPlan={getRevisionPaper(o){return {status:'PRACTICE_PAPER_REQUIRES_TEACHER_REVIEW',questions:[{prompt:'Revision question?'}],answerKey:[{answer:'Revision answer'}]};}};
  window.PacEduPracticeExamPaper={getPaper(o){return {status:'PRACTICE_EXAM_REQUIRES_TEACHER_REVIEW',questions:[{prompt:'Mock exam question?'}],answerKey:[{answer:'Mock answer'}]};}};
  window.PacEduAssessmentBlueprints={buildBlueprint(){return {note:'Draft rubric',blueprint:[{component:'Accuracy',weightPercent:50,questionFormats:'Selected response'}]};}};
  const document = {};
  vm.runInNewContext(fs.readFileSync('src/js/paceduDownloadableClassPacks.js','utf8'),{window,document,Date,Math,String,Number,Array,Object,RegExp,Error});
  return window.PacEduDownloadableClassPacks;
}

test('download pack includes 45 dated Term 1 daily activities and assessment practice',()=>{
 const api=loadPack();
 const p=api.build({level:'Class 1',subject:'English',term:'T1',ability:'support'});
 assert.equal(p.dailyActivities,45);
 assert.equal(p.missingSlots,0);
 assert.match(p.filename,/Class-1_English_T1_support_/);
 assert.match(p.html,/Prepared by PacEdu/);
 assert.match(p.html,/Revision question/);
 assert.match(p.html,/Mock practice examination — not an official or past paper/);
 assert.match(p.html,/NOT_YET_MAPPED/);
 assert.match(p.html,/Subject-specific marking criteria/);
 assert.doesNotMatch(p.html,/FEMIS-123456/);
});

test('Term 3 pack uses 25 planned daily slots and keeps class-wide packs free of learner IDs',()=>{
 const api=loadPack();
 const p=api.build({level:'Form 7',subject:'Science',term:'T3',ability:'extension'});
 assert.equal(p.dailyActivities,25);
 assert.equal(p.level,'Form 7');
 assert.equal(p.subject,'Science');
 assert.equal(p.ability,'extension');
 assert.match(p.html,/T3/);
 assert.match(p.html,/Teacher review/);
 assert.doesNotMatch(p.html,/studentId|FEMIS ID/i);
});

test('unsupported class, subject or ability cannot create arbitrary selectors',()=>{
 const api=loadPack();
 const p=api.build({level:'Random',subject:'Random',term:'T2',ability:'random'});
 assert.equal(p.level,'Class 1');
 assert.equal(p.subject,'English');
 assert.equal(p.ability,'developing');
 assert.equal(p.dailyActivities,45);
});
