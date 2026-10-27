/* Pacific Education — Teacher Review Queue
 * Controlled pilot only. Teacher review is not production authorization.
 */
(function(window, document){
"use strict";
var KEY="pacificEducationActivityResponses", HOME="pacificEducationHomeSubmissions";
function read(k){try{var v=JSON.parse(window.localStorage.getItem(k)||"[]");return Array.isArray(v)?v:[];}catch(e){return[];}}
function write(k,v){try{window.localStorage.setItem(k,JSON.stringify(v.slice(-500)));return true;}catch(e){return false;}}
function safePhoto(v){return typeof v==="string"&&v.length<=900000&&/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(v)?v:"";}
function node(tag,text){var n=document.createElement(tag);if(text!==undefined&&text!==null)n.textContent=String(text);return n;}
function appendText(parent,tag,label,value){var p=node(tag);p.appendChild(node("strong",label));p.appendChild(document.createTextNode(" "+String(value==null?"":value)));parent.appendChild(p);return p;}
function render(){
 var root=document.getElementById("pacificEducationTeacherSubmissionQueue"); if(!root)return;
 var activities=read(KEY).map(function(x,i){return Object.assign({},x,{__index:i});});
 var pending=activities.filter(function(x){return x.reviewStatus==="pending-teacher-review"||!x.reviewStatus;});
 var audio=read(HOME).filter(function(x){return x.type==="daily-activity-audio"||x.status==="pending-special-education-review";});
 var wrap=node("div");wrap.className="activity";
 wrap.appendChild(node("h3","Teacher Review Queue"));
 var count=node("p");count.appendChild(node("strong","Pending learner responses: "+pending.length));wrap.appendChild(count);
 if(!pending.length)wrap.appendChild(node("p","No pending text responses."));
 pending.slice(-25).reverse().forEach(function(x){
  var index=x.__index, article=node("article");
  article.setAttribute("data-pe-review-index",String(index));
  article.style.cssText="border:1px solid #ccc;padding:12px;margin:8px 0";
  /* Show identity on every learner response so the teacher can match work to the correct roster entry. */
  var learnerLabel=String(x.studentName||x.displayName||x.learnerNameOrReference||"").trim();
  var learnerRef=String(x.studentReference||x.learnerReference||"").trim();
  var learnerId=String(x.studentId||"").trim();
  var learnerLine=node("p");learnerLine.className="pe-review-learner-identity";
  learnerLine.appendChild(node("strong","Learner:"));
  learnerLine.appendChild(document.createTextNode(" "+(learnerLabel||"Name not recorded")));
  if(learnerRef) learnerLine.appendChild(document.createTextNode(" · Learner reference: "+learnerRef));
  else if(learnerId) learnerLine.appendChild(document.createTextNode(" · Student ID: "+learnerId));
  article.appendChild(learnerLine);
  var day=node("p");day.appendChild(node("strong","Day "+(Number(x.day)||0)+" — "+String(x.type||"activity")));article.appendChild(day);
  appendText(article,"p","Question:",x.questionText||"");
  appendText(article,"p","Answer:",x.response||"");
  var photo=safePhoto(x.photoDataUrl);
  if(photo){
   var photoTitle=node("p");photoTitle.appendChild(node("strong","Student work photo — teacher review required"));article.appendChild(photoTitle);
   var img=node("img");img.alt="Student work submitted for teacher review";img.setAttribute("src",photo);img.style.cssText="display:block;max-width:100%;max-height:320px;object-fit:contain;border:1px solid #ccc;margin:8px 0";article.appendChild(img);
   article.appendChild(node("p","Photo evidence is not automatically marked. Check readability and the answer against the activity criteria."));
  }
  appendText(article,"p","Context:",(x.classLevel||"")+" / "+(x.subject||"")+" / "+(x.term||""));
  if(x.assignmentId)appendText(article,"p","Assignment reference:",x.assignmentId);
  if(x.preparedDate||x.savedAt)appendText(article,"p","Prepared / submitted:",(x.preparedDate||"date unavailable")+" / "+(x.savedAt||"submission time unavailable"));
  if(x.learnerIdentityStatus)appendText(article,"p","Learner ID verification:",x.learnerIdentityStatus+(x.learnerIdentityPending?" — pending; do not treat as verified":""));
  if(x.teacherEnteredAnswer)appendText(article,"p","Assignment:",x.assignmentStatus==="verified-roster-match"?"Roster verified":"UNVERIFIED — check learner and class reference");
  var label=node("label","Teacher guidance ");
  var textarea=node("textarea");textarea.id="trq-"+index;textarea.rows=2;textarea.style.width="100%";label.appendChild(textarea);article.appendChild(label);
  article.appendChild(node("br"));
  var approve=node("button","Approve evidence");approve.type="button";
  var needs=node("button","Needs more practice");needs.type="button";
  approve.addEventListener("click",function(){review(index,"approved");});
  needs.addEventListener("click",function(){review(index,"needs-practice");});
  article.appendChild(approve);article.appendChild(document.createTextNode(" "));article.appendChild(needs);
  wrap.appendChild(article);
 });
 var audioLine=node("p");audioLine.appendChild(node("strong","Audio/special-education submissions: "+audio.length));wrap.appendChild(audioLine);
 root.replaceChildren(wrap);
}
function applyAdaptiveReview(item,status){
 /* A single reviewed activity is evidence, not a complete ability classification.
    Keep the result on the learner's response record. PacEdu's evidence engine
    waits for sufficient marked daily work plus a marked term examination. */
 if(item&&item.teacherEnteredAnswer){
  document.dispatchEvent(new CustomEvent("pacificEducationTeacherManualAnswerReviewed",{detail:{status:status,responseId:item.responseId||null,learnerNameOrReference:item.learnerNameOrReference||"",classId:item.classId||null,subject:item.subject||"",term:item.term||"",day:Number(item.day)||0,prototype:true}}));
  return;
 }
 document.dispatchEvent(new CustomEvent("pacificEducationEvidenceBasedAbilityUpdated",{detail:{
  status:status,responseId:item&&item.responseId||null,studentId:item&&item.studentId||null,
  classId:item&&item.classId||null,subject:item&&item.subject||"",term:item&&item.term||"",
  day:Number(item&&item.day)||0,teacherReviewed:true,provisionalOnly:true,prototype:true
 }}));
}
function review(index,status){
 if(status!=="approved"&&status!=="needs-practice")return;
 var a=read(KEY);if(!a[index])return;
 var note=document.getElementById("trq-"+index);
 a[index].reviewStatus=status==="approved"?"teacher-approved":"teacher-needs-practice";
 a[index].teacherGuidance=note?note.value:"";a[index].teacherReviewedAt=new Date().toISOString();
 if(!write(KEY,a))return;
 applyAdaptiveReview(a[index],status);
 if(window.PacificEducationDailyProgressRecorder&&status==="approved"&&!a[index].teacherEnteredAnswer){
  try{window.PacificEducationDailyProgressRecorder.recordPractised({activityId:"reviewed-"+String(a[index].type||"activity")+"-day-"+String(a[index].day||0),dayNumber:Number(a[index].day)||1,notes:"Teacher-approved learner response: "+String(a[index].questionText||"")+" Guidance: "+String(a[index].teacherGuidance||"")});}catch(e){}
 }
 document.dispatchEvent(new CustomEvent("pacificEducationTeacherReviewCompleted",{detail:{status:status,index:index,responseId:a[index].responseId||null,teacherEnteredAnswer:!!a[index].teacherEnteredAnswer,learnerNameOrReference:a[index].learnerNameOrReference||"",classId:a[index].classId||null,subject:a[index].subject||"",term:a[index].term||"",day:Number(a[index].day)||0}}));
 render();
}
window.PacificEducationTeacherReview={version:"1.0.1",render:render,review:review};
document.addEventListener("DOMContentLoaded",render);
document.addEventListener("pacificEducationDailyProgressRecorded",render);
})(window,document);
