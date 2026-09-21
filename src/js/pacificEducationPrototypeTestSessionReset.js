/* PACIFIC EDUCATION — PROTOTYPE TEST SESSION RESET v1.2.0 — PROTOTYPE ONLY */
(function(window,document){
"use strict";
var VERSION="1.2.0";
function clearPrototypeCachesAndWorker(){
 var tasks=[];
 if(window.caches&&typeof window.caches.keys==="function")tasks.push(window.caches.keys().then(function(keys){return Promise.all(keys.filter(function(k){return k.indexOf("pacific-education-prototype-src-")===0;}).map(function(k){return window.caches.delete(k);}));}).catch(function(){}));
 if(navigator.serviceWorker&&typeof navigator.serviceWorker.getRegistrations==="function")tasks.push(navigator.serviceWorker.getRegistrations().then(function(rs){return Promise.all(rs.filter(function(r){return r&&r.scope&&r.scope.indexOf("/Pacific-education-/")!==-1;}).map(function(r){return r.unregister();}));}).catch(function(){}));
 return Promise.all(tasks);
}
function reset(){
 var core=window.PacificEducationCore,offline=window.PacificEducationOfflineRuntime;
 if(!core||typeof core.resetPrototypeProgress!=="function")return{success:false,reason:"CORE_RESET_UNAVAILABLE",prototype:true};
 if(typeof core.isAuthorized==="function"&&!core.isAuthorized())return{success:false,reason:"PROTOTYPE_AUTHORIZATION_REQUIRED",prototype:true};
 var cleared=[],keys=["currentDayNumber","currentDay","lessonsCompleted","studentName","alphabetAssessment","phonicsAssessment","learningStatus","pacificOwnerTestDay","pacificEducationCurrentDay","dailyLessonDay","pacificEducationSelectedStudentId","pacificEducationSelectedClassId","pacificEducationPrototypeClassRosters","pacificEducationProductionRequirements","pacificEducationExternalApprovals","pacificEducationProductionReleaseIssues","pacificEducationProductionReleaseReviewDecisions"];
 keys.forEach(function(k){try{localStorage.removeItem(k);cleared.push(k);}catch(e){}});
 try{localStorage.removeItem("pacificEducationOfflineProgressQueue");cleared.push("pacificEducationOfflineProgressQueue");}catch(e){}
 try{localStorage.removeItem("pacificEducationFullSystemTestMatrix");cleared.push("pacificEducationFullSystemTestMatrix");}catch(e){}
 var coreReset=core.resetPrototypeProgress(),queueReset=false;
 if(offline&&typeof offline.clearQueue==="function"){var r=offline.clearQueue();queueReset=r&&r.success===true;}
 return{success:coreReset===true,version:VERSION,clearedCompatibilityKeys:cleared,offlineQueueCleared:queueReset,cacheCleanupStarted:true,prototype:true,productionApproved:false,productionEligible:false,deploymentAuthorized:false};
}
function installButton(){
 if(!document||!document.body||document.getElementById("pacificEducationPrototypeResetButton"))return;
 var status=document.getElementById("pacificEducationSystemStatus")||document.querySelector("main")||document.body,wrap=document.createElement("div");
 wrap.id="pacificEducationPrototypeResetControl";wrap.style.margin="1rem 0";wrap.style.padding="0.75rem";wrap.style.border="1px solid currentColor";
 var button=document.createElement("button");button.id="pacificEducationPrototypeResetButton";button.type="button";button.textContent="Reset Prototype Test Session";
 var note=document.createElement("p");note.textContent="Prototype only: clears accumulated learner progress, offline queue, cached prototype assets and local test evidence. Curriculum records and production gates are not changed.";
 button.addEventListener("click",function(){if(!window.confirm("Reset this prototype test session? This clears local prototype progress, offline queue, cached prototype assets and local full-system test evidence."))return;var result=reset();if(result.success)clearPrototypeCachesAndWorker().then(function(){window.location.reload();});else window.alert("Prototype reset was blocked: "+result.reason);});
 wrap.appendChild(button);wrap.appendChild(note);if(status&&status.parentNode)status.parentNode.insertBefore(wrap,status);else document.body.appendChild(wrap);
}
window.PacificEducationPrototypeTestSessionReset=Object.freeze({version:VERSION,reset:reset,clearPrototypeCachesAndWorker:clearPrototypeCachesAndWorker});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",installButton);else installButton();
})(window,document);