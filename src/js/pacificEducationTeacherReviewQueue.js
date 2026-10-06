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
   html+="<article style=\"border:1px solid #ccc;padding:12px;margin:8px 0\"><p><strong>Day "+Number(x.day||0)+" — "+esc(x.type||"activity")+"</strong></p><p><strong>Question:</strong> "+esc(x.questionText||"")+"</p><p><strong>Answer:</strong> "+esc(x.response||"")+"</p><p><strong>Context:</strong> "+esc((x.classLevel||"")+" / "+(x.subject||"")+" / "+(x.term||""))+"</p><label>Teacher guidance <textarea id=\"trq-"+x.__index+"\" rows=\"2\" style=\"width:100%\"></textarea></label><br><button type=\"button\" onclick=\"window.PacificEducationTeacherReview.review("+x.__index+",'approved')\">Approve evidence</button> <button type=\"button\" onclick=\"window.PacificEducationTeacherReview.review("+x.__index+",'needs-practice')\">Needs more practice</button></article>";
 });
 html+="<p><strong>Audio/special-education submissions:</strong> "+audio.length+"</p></div>";
 root.innerHTML=html;
}
function applyAdaptiveReview(item,status){
 var capability=status==="approved"?"expected":"remedial";
 try{
  localStorage.setItem("pacificEducationCapability",capability);
  localStorage.setItem("pacificEducationAdaptiveLearningStatus",status==="approved"?"Teacher-approved evidence — continue expected-level mixed learning":"Teacher review recommends targeted re-teaching before progressing");
  localStorage.setItem("pacificEducationAdaptiveNextActivity",status==="approved"?"Independent Practice":"Remedial / Re-teaching");
  localStorage.setItem("pacificEducationAdaptiveLastReview",JSON.stringify({status:status,day:Number(item.day)||0,type:item.type||"",questionText:item.questionText||"",studentId:item.studentId||null,classId:item.classId||null,reviewedAt:new Date().toISOString()}));
 }catch(e){}
 document.dispatchEvent(new CustomEvent("pacificEducationAdaptiveLearningUpdated",{detail:{capability:capability,capabilityLabel:status==="approved"?"Expected-level":"Remedial / Re-teaching",score:null,reviewStatus:status,nextActivity:status==="approved"?"Independent Practice":"Remedial / Re-teaching",context:item.curriculumContext||{},teacherReviewed:true,prototype:true}}));
 if(typeof window.displayDailyLesson==="function"){try{window.displayDailyLesson();}catch(e){}}
}
function review(index,status){
 var a=read(KEY); if(!a[index])return;
 var note=document.getElementById("trq-"+index);
 a[index].reviewStatus=status==="approved"?"teacher-approved":"teacher-needs-practice";
 a[index].teacherGuidance=note?note.value:""; a[index].teacherReviewedAt=new Date().toISOString(); write(KEY,a);
 applyAdaptiveReview(a[index],status);
 if(window.PacificEducationDailyProgressRecorder&&status==="approved"){
  try{window.PacificEducationDailyProgressRecorder.recordPractised({activityId:"reviewed-"+String(a[index].type||"activity")+"-day-"+String(a[index].day||0),dayNumber:Number(a[index].day)||1,notes:"Teacher-approved learner response: "+String(a[index].questionText||"")+" Guidance: "+String(a[index].teacherGuidance||"")});}catch(e){}
 }
 document.dispatchEvent(new CustomEvent("pacificEducationTeacherReviewCompleted",{detail:{status:status,index:index}})); render();
}
window.PacificEducationTeacherReview={version:"1.0.0",render:render,review:review};
document.addEventListener("DOMContentLoaded",render);
document.addEventListener("pacificEducationDailyProgressRecorded",render);
})(window,document);