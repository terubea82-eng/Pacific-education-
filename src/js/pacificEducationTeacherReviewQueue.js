/* Pacific Education — Teacher Review Queue
 * Controlled pilot only. Teacher review is not production authorization.
 */
(function(window, document){
"use strict";
var KEY="pacificEducationActivityResponses", HOME="pacificEducationHomeSubmissions";
function read(k){try{return JSON.parse(localStorage.getItem(k)||"[]");}catch(e){return[];}}
function write(k,v){try{localStorage.setItem(k,JSON.stringify(v.slice(-500)));}catch(e){}}
function esc(v){return String(v).replace(/[&<>"']/g,function(c){return({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c];});}
function render(){
 var root=document.getElementById("pacificEducationTeacherSubmissionQueue"); if(!root)return;
 var activities=read(KEY).map(function(x,i){x.__index=i;return x;});
 var pending=activities.filter(function(x){return x.reviewStatus==="pending-teacher-review" || !x.reviewStatus;});
 var audio=read(HOME).filter(function(x){return x.type==="daily-activity-audio" || x.status==="pending-special-education-review";});
 var html="<div class=\"activity\"><h3>Teacher Review Queue</h3><p>Pending learner responses: <strong>"+pending.length+"</strong></p>";
 if(!pending.length) html+="<p>No pending text responses.</p>";
 pending.slice(-25).reverse().forEach(function(x){
   html+="<article data-pe-review-index=\""+x.__index+"\" style=\"border:1px solid #ccc;padding:12px;margin:8px 0\">"+(x.teacherEnteredAnswer&&x.learnerNameOrReference?"<p class=\"pe-quick-answer-learner\"><strong>Learner:</strong> "+esc(x.learnerNameOrReference)+"</p>":"")+"<p><strong>Day "+Number(x.day||0)+" — "+esc(x.type||"activity")+"</strong></p><p><strong>Question:</strong> "+esc(x.questionText||"")+"</p><p><strong>Answer:</strong> "+esc(x.response||"")+"</p><p><strong>Context:</strong> "+esc((x.classLevel||"")+" / "+(x.subject||"")+" / "+(x.term||""))+"</p>"+(x.teacherEnteredAnswer?"<p><strong>Assignment:</strong> "+esc(x.assignmentStatus==="verified-roster-match"?"Roster verified":"UNVERIFIED — check learner and class reference")+"</p>":"")+"<label>Teacher guidance <textarea id=\"trq-"+x.__index+"\" rows=\"2\" style=\"width:100%\"></textarea></label><br><button type=\"button\" onclick=\"window.PacificEducationTeacherReview.review("+x.__index+",'approved')\">Approve evidence</button> <button type=\"button\" onclick=\"window.PacificEducationTeacherReview.review("+x.__index+",'needs-practice')\">Needs more practice</button></article>";
 });
 html+="<p><strong>Audio/special-education submissions:</strong> "+audio.length+"</p></div>";
 root.innerHTML=html;
}
function applyAdaptiveReview(item,status){
 /* A single reviewed activity is evidence, not a complete ability classification.
    Keep the result on the learner's response record. PacEdu's evidence engine
    waits for sufficient marked daily work plus a marked term examination. */
 if(item && item.teacherEnteredAnswer){
  document.dispatchEvent(new CustomEvent("pacificEducationTeacherManualAnswerReviewed",{detail:{status:status,responseId:item.responseId||null,learnerNameOrReference:item.learnerNameOrReference||"",classId:item.classId||null,subject:item.subject||"",term:item.term||"",day:Number(item.day)||0,prototype:true}}));
  return;
 }
 document.dispatchEvent(new CustomEvent("pacificEducationEvidenceBasedAbilityUpdated",{detail:{
  status:status,
  responseId:item&&item.responseId||null,
  studentId:item&&item.studentId||null,
  classId:item&&item.classId||null,
  subject:item&&item.subject||"",
  term:item&&item.term||"",
  day:Number(item&&item.day)||0,
  teacherReviewed:true,
  provisionalOnly:true,
  prototype:true
 }}));
}
function review(index,status){
 var a=read(KEY); if(!a[index])return;
 var note=document.getElementById("trq-"+index);
 a[index].reviewStatus=status==="approved"?"teacher-approved":"teacher-needs-practice";
 a[index].teacherGuidance=note?note.value:""; a[index].teacherReviewedAt=new Date().toISOString(); write(KEY,a);
 applyAdaptiveReview(a[index],status);
 if(window.PacificEducationDailyProgressRecorder&&status==="approved"&&!a[index].teacherEnteredAnswer){
  try{window.PacificEducationDailyProgressRecorder.recordPractised({activityId:"reviewed-"+String(a[index].type||"activity")+"-day-"+String(a[index].day||0),dayNumber:Number(a[index].day)||1,notes:"Teacher-approved learner response: "+String(a[index].questionText||"")+" Guidance: "+String(a[index].teacherGuidance||"")});}catch(e){}
 }
 document.dispatchEvent(new CustomEvent("pacificEducationTeacherReviewCompleted",{detail:{status:status,index:index,responseId:a[index].responseId||null,teacherEnteredAnswer:!!a[index].teacherEnteredAnswer,learnerNameOrReference:a[index].learnerNameOrReference||"",classId:a[index].classId||null,subject:a[index].subject||"",term:a[index].term||"",day:Number(a[index].day)||0}})); render();
}
window.PacificEducationTeacherReview={version:"1.0.0",render:render,review:review};
document.addEventListener("DOMContentLoaded",render);
document.addEventListener("pacificEducationDailyProgressRecorded",render);
})(window,document);