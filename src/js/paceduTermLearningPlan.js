/* PacEdu term schedule and revision builder. Draft framework, not official syllabus mapping. */
(function (global) {
"use strict";
var TERMS = {
  T1:{label:"Term 1",weeks:9,purpose:"Introduce and practise concepts."},
  T2:{label:"Term 2",weeks:9,purpose:"Extend skills and apply concepts."},
  T3:{label:"Term 3",weeks:5,purpose:"Consolidate priority concepts before approved assessments."}
};
var DAYS = [
  {name:"Introduce and notice",goal:"Identify the concept and connect it to prior learning."},
  {name:"See a worked example",goal:"Read, watch or hear a model and explain its steps."},
  {name:"Guided practice",goal:"Practise with prompts, pictures, objects or teacher support."},
  {name:"Independent application",goal:"Complete a new example with less support."},
  {name:"Review and evidence",goal:"Correct errors and show what has been learned."}
];
var BANDS = {
 support:{label:"Supported start",guidance:"Use short instructions, pictures, objects, worked steps and fewer choices."},
 developing:{label:"Developing",guidance:"Use a model and guided questions, then reduce prompts."},
 expected:{label:"Expected",guidance:"Complete the core task independently and explain the method."},
 extension:{label:"Extension",guidance:"Compare methods, justify decisions and solve a more complex task."}
};
function termId(value){value=String(value||"T1").toUpperCase();return TERMS[value]?value:"T1";}
function getTermPlan(options){
 options=options||{};var id=termId(options.term),t=TERMS[id],band=BANDS[options.ability]||BANDS.developing;
 return {country:"Fiji",term:t.label,termId:id,weeks:t.weeks,teachingDays:t.weeks*5,purpose:t.purpose,
 level:options.level||"Class 1",subject:options.subject||"English",abilityLabel:band.label,differentiation:band.guidance,
 weeksPlan:Array.from({length:t.weeks},function(_,i){return {week:i+1,focus:DAYS[i%5].name,dailySequence:DAYS.map(function(d,j){return {day:j+1,stage:d.name,goal:d.goal};}),mappingStatus:"DRAFT_REQUIRES_OFFICIAL_INDICATOR_MAPPING"};}),
 revision:{timing:"After this term's daily activities",sections:["Recall and understanding","Application","Reasoning or explanation","Correction and reflection"],status:"PRACTICE_PAPER_REQUIRES_TEACHER_REVIEW"},
 curriculumStatus:"NOT_YET_MAPPED",note:"Planning framework only. Verify each concept against the current authorised Fiji syllabus before claiming official alignment."};
}
function getRevisionPaper(options){
 options=options||{};var id=termId(options.term),t=TERMS[id],api=global.PacEduDailyWorksheetContent,qs=[],keys=[];
 if(api&&typeof api.getCurriculumWorksheet==="function"){
  for(var w=Math.max(1,t.weeks-1);w<=t.weeks;w++)for(var d=1;d<=5;d++){
   var sheet=api.getCurriculumWorksheet({level:options.level,subject:options.subject,term:id,week:w,day:d,ability:options.ability,skipTermPlan:true});
   if(!sheet||sheet.status==="NOT_FOUND")continue;
   (sheet.questions||[]).forEach(function(q,i){if(qs.length>=20)return;var n=qs.length+1,k=(sheet.answerKey||[])[i]||{};
    qs.push({number:n,week:w,day:d,prompt:q.prompt||q.question||q.text||"Answer the subject question.",options:Array.isArray(q.options)?q.options.slice():[],type:q.options&&q.options.length?"Multiple choice":"Short response"});
    keys.push({number:n,answer:k.answer||q.answer||"",explanation:k.explanation||"Review the worked example and explain your reasoning."});
   });
  }
 }
 return {title:t.label+" "+(options.subject||"Subject")+" Revision Practice",level:options.level||"Class 1",subject:options.subject||"English",term:t.label,
 ability:options.ability||"developing",instructions:"Complete after the term's daily activities. Teacher must review questions and answer key.",questions:qs,answerKey:keys,questionCount:qs.length,
 status:"PRACTICE_PAPER_REQUIRES_TEACHER_REVIEW",officialExamPaper:false,sourceWeeks:[Math.max(1,t.weeks-1),t.weeks],curriculumMappingStatus:"NOT_YET_MAPPED"};
}
global.PacEduTermLearningPlan=Object.freeze({terms:TERMS,stages:DAYS,abilityBands:BANDS,getTermPlan:getTermPlan,getRevisionPaper:getRevisionPaper});
})(window);
