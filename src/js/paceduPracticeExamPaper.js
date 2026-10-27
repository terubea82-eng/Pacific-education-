/* Practice examination wrapper; uses the reviewed term question bank and never claims to be an official exam. */
(function(global){
"use strict";
function getPaper(options){
 options=options||{};
 var api=global.PacEduTermLearningPlan;
 if(!api||typeof api.getRevisionPaper!=="function")return {status:"NOT_READY",questions:[],answerKey:[]};
 var paper=api.getRevisionPaper(options);
 return Object.assign({},paper,{
  title:paper.term+" "+paper.subject+" Practice Examination",
  instructions:"Mock practice only, built from the term revision question bank. This is not an official or past examination paper. Teacher must check the current syllabus, question suitability and answer key.",
  status:"PRACTICE_EXAM_REQUIRES_TEACHER_REVIEW",
  officialExamPaper:false,
  paperType:"practice-exam"
 });
}
global.PacEduPracticeExamPaper=Object.freeze({getPaper:getPaper});
})(window);
