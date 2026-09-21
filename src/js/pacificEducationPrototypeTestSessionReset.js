/* PACIFIC EDUCATION — PROTOTYPE TEST SESSION RESET v1.3.0 — PROTOTYPE ONLY */
(function(window,document){
"use strict";

var VERSION="1.3.0";

var PROGRESS_KEYS=[
 "currentDayNumber",
 "currentDay",
 "lessonsCompleted",
 "studentName",
 "alphabetAssessment",
 "phonicsAssessment",
 "learningStatus",
 "pacificOwnerTestDay",
 "pacificEducationCurrentDay",
 "dailyLessonDay",
 "pacificEducationSelectedStudentId",
 "pacificEducationSelectedClassId",
 "pacificEducationPrototypeClassRosters"
];

var TEST_EVIDENCE_KEYS=[
 "pacificEducationFullSystemTestMatrix",
 "pacificEducationFullSystemTestEvidenceRecords",
 "pacificEducationFullSystemTestReconciliationRecords",
 "pacificEducationFullSystemTestReconciliationAcknowledgements",
 "pacificEducationOwnerPrototypeTestChecklist",
 "pacificEducationOwnerPrototypeTestSession",
 "pacificEducationPrototypeVerificationReconciliation",
 "pacificEducationPrototypeRuntimeDiagnostics",
 "pacificEducationPrototypeTestEvidence",
 "pacificEducationTestEvidence"
];

function removeKeys(keys){
 keys.forEach(function(k){
  try{localStorage.removeItem(k);}catch(e){}
 });
}

function clearOfflineQueue(){
 var offline=window.PacificEducationOfflineRuntime;
 try{localStorage.removeItem("pacificEducationOfflineProgressQueue");}catch(e){}
 if(offline&&typeof offline.clearQueue==="function"){
  try{offline.clearQueue();}catch(e){}
 }
}

function clearPrototypeCachesAndWorker(){
 var tasks=[];

 if(window.caches&&typeof window.caches.keys==="function"){
  tasks.push(
   window.caches.keys().then(function(keys){
    return Promise.all(
     keys.filter(function(k){
      return k.indexOf("pacific-education-prototype-src-")===0;
     }).map(function(k){
      return window.caches.delete(k);
     })
    );
   }).catch(function(){})
  );
 }

 if(
  navigator.serviceWorker&&
  typeof navigator.serviceWorker.getRegistrations==="function"
 ){
  tasks.push(
   navigator.serviceWorker.getRegistrations().then(function(rs){
    return Promise.all(
     rs.filter(function(r){
      return r&&r.scope&&
       r.scope.indexOf("/Pacific-education-/")!==-1;
     }).map(function(r){
      return r.unregister();
     })
    );
   }).catch(function(){})
  );
 }

 return Promise.all(tasks);
}

function reset(){
 var core=window.PacificEducationCore;

 if(!core||typeof core.resetPrototypeProgress!=="function"){
  return Promise.resolve({
   success:false,
   reason:"CORE_RESET_UNAVAILABLE",
   prototype:true
  });
 }

 if(
  typeof core.isAuthorized==="function"&&
  !core.isAuthorized()
 ){
  return Promise.resolve({
   success:false,
   reason:"PROTOTYPE_AUTHORIZATION_REQUIRED",
   prototype:true
  });
 }

 try{
  if(core.resetPrototypeProgress()!==true){
   return Promise.resolve({
    success:false,
    reason:"CORE_RESET_FAILED",
    prototype:true
   });
  }
 }catch(e){
  return Promise.resolve({
   success:false,
   reason:"CORE_RESET_ERROR",
   prototype:true
  });
 }

 /*
  * Clear learner/test-session compatibility state only.
  *
  * IMPORTANT:
  * Production requirement, approval, release, curriculum and external-review
  * records are deliberately NOT removed by this button.
  */
 removeKeys(PROGRESS_KEYS);
 removeKeys(TEST_EVIDENCE_KEYS);
 clearOfflineQueue();

 return clearPrototypeCachesAndWorker().then(function(){
  window.dispatchEvent(
   new CustomEvent(
    "pacificEducationPrototypeTestSessionReset",
    {
     detail:{
      version:VERSION,
      progressCleared:true,
      offlineQueueCleared:true,
      cachedPrototypeAssetsCleared:true,
      localTestEvidenceCleared:true,
      curriculumRecordsPreserved:true,
      productionRequirementsPreserved:true,
      productionApprovalsPreserved:true,
      productionReleaseRecordsPreserved:true
     }
    }
   )
  );

  return {
   success:true,
   version:VERSION,
   progressCleared:true,
   offlineQueueCleared:true,
   cachedPrototypeAssetsCleared:true,
   localTestEvidenceCleared:true,
   curriculumRecordsPreserved:true,
   productionRequirementsPreserved:true,
   productionApprovalsPreserved:true,
   productionReleaseRecordsPreserved:true,
   prototype:true,
   productionApproved:false,
   productionEligible:false,
   deploymentAuthorized:false
  };
 });
}

function installButton(){
 if(
  !document||
  !document.body||
  document.getElementById(
   "pacificEducationPrototypeResetButton"
  )
 )return;

 var status=
  document.getElementById(
   "pacificEducationSystemStatus"
  )||
  document.querySelector("main")||
  document.body;

 var wrap=document.createElement("div");
 wrap.id="pacificEducationPrototypeResetControl";
 wrap.style.margin="1rem 0";
 wrap.style.padding="0.75rem";
 wrap.style.border="1px solid currentColor";

 var button=document.createElement("button");
 button.id="pacificEducationPrototypeResetButton";
 button.type="button";
 button.textContent="Reset Prototype Test Session";

 var note=document.createElement("p");
 note.textContent=
  "Prototype only: clears accumulated learner progress, offline queue, cached prototype assets and local test evidence. Curriculum records and production-gate records are not changed.";

 button.addEventListener("click",function(){
  if(
   !window.confirm(
    "Reset this prototype test session? This clears local prototype progress, offline queue, cached prototype assets and local test evidence. Curriculum and production-gate records are preserved."
   )
  )return;

  button.disabled=true;
  button.textContent="Resetting…";

  reset().then(function(result){
   if(result.success){
    window.location.reload();
    return;
   }

   button.disabled=false;
   button.textContent="Reset Prototype Test Session";

   var statusNode=
    document.getElementById(
     "prototypeAccessStatus"
    );

   if(statusNode){
    statusNode.textContent=
     "Prototype reset was blocked: "+result.reason;
   }
  });
 });

 wrap.appendChild(button);
 wrap.appendChild(note);

 if(status&&status.parentNode){
  status.parentNode.insertBefore(wrap,status);
 }else{
  document.body.appendChild(wrap);
 }
}

window.PacificEducationPrototypeTestSessionReset=
 Object.freeze({
  version:VERSION,
  reset:reset,
  clearPrototypeCachesAndWorker:clearPrototypeCachesAndWorker,
  prototype:true
 });

if(document.readyState==="loading"){
 document.addEventListener(
  "DOMContentLoaded",
  installButton,
  {once:true}
 );
}else{
 installButton();
}

})(window,document);