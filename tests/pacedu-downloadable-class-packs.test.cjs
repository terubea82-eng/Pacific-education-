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
 assert.match(p.filename,/Class-1_English_T1_Copper_/);
 assert.match(p.html,/Prepared by PacEdu/);
 assert.match(p.html,/Revision question/);
 assert.match(p.html,/Mock practice examination — not an official or past paper/);
 assert.match(p.html,/NOT_YET_MAPPED/);
 assert.match(p.html,/Subject-specific marking criteria/);
 assert.doesNotMatch(p.html,/FEMIS-123456/);
});

test('Term 3 pack uses 25 planned daily slots and keeps class-wide packs free of learner IDs',()=>{
 const api=loadPack();
 const p=api.build({level:'Form 4',subject:'Science',term:'T3',ability:'extension'});
 assert.equal(p.dailyActivities,25);
 assert.equal(p.level,'Form 4');
 assert.equal(p.subject,'Science');
 assert.equal(p.ability,'extension');
 assert.match(p.html,/T3/);
 assert.match(p.html,/Teacher review/);
 assert.doesNotMatch(p.html,/studentId|FEMIS ID/i);
});

test('unsupported class, subject or ability cannot silently fall back to English',()=>{
 const api=loadPack();
 assert.throws(()=>api.build({level:'Random',subject:'Random',term:'T2',ability:'random'}),/Select one of the 15 subject boxes/);
 const p=api.build({level:'Class 1',subject:'English',term:'T2',ability:'random'});
 assert.equal(p.level,'Class 1');
 assert.equal(p.subject,'English');
 assert.equal(p.ability,'developing');
 assert.equal(p.dailyActivities,45);
});

test('subject-box names route to their own approved draft source labels',()=>{
 const api=loadPack();
 for (const subject of ['English','Mathematics','Science','Social Science','Health','Arts','Technology']) {
   const p=api.build({level:'Class 2',subject,term:'T1',ability:'developing'});
   assert.equal(p.dailyActivities,45,subject+' should provide its own mapped draft worksheet sequence');
   assert.ok(p.html.includes('<strong>Subject:</strong> '+subject),subject+' should remain the visible subject-box label');
 }
});

test('four new subject boxes use their own banks while unverified language boxes remain unavailable',()=>{
 const api=loadPack();
 for (const subject of ['Phonics','Agriculture','Home Economics','Computer Studies']) {
   const p=api.build({level:'Class 1',subject,term:'T1',ability:'support'});
   assert.equal(p.dailyActivities,45,subject);
   assert.equal(p.missingSlots,0,subject);
   assert.ok(p.html.includes('<strong>Subject:</strong> '+subject),subject);
 }
 for (const subject of ['Vosa Vakaviti (iTaukei)','Fiji Hindi','Urdu','Rotuman']) {
   const p=api.build({level:'Class 1',subject,term:'T1',ability:'support'});
   assert.equal(p.dailyActivities,0,subject);
   assert.equal(p.missingSlots,45,subject);
   assert.equal(p.contentStatus,'CONTENT_NOT_AVAILABLE',subject);
   assert.match(p.html,/no other subject has been substituted/i);
 }
});

test('Form 5 to Form 7 Science requires a specific approved science subject pack',()=>{
 const api=loadPack();
 for (const level of ['Form 5','Form 6','Form 7']) {
   const p=api.build({level,subject:'Science',term:'T1',ability:'extension'});
   assert.equal(p.dailyActivities,0);
   assert.equal(p.contentStatus,'CONTENT_NOT_AVAILABLE');
 }
});
