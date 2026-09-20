(function(global){
"use strict";
function statusOf(name){
  var x=global[name];
  return x&&typeof x.status==="function"?x.status():{ready:false};
}
function run(){
  var checks={
    curriculumAlignment:statusOf("PacificEducationCurriculumAlignmentNextStage"),
    calendar:statusOf("PacificEducationCalendarNextStage"),
    accessibility:statusOf("PacificEducationAccessibilityNextStage"),
    safeguarding:statusOf("PacificEducationSafeguardingNextStage"),
    offline:statusOf("PacificEducationOfflineNextStage"),
    testing:statusOf("PacificEducationTestingNextStage")
  };
  var ready=Object.keys(checks).every(function(k){return checks[k].ready===true;});
  return {allNextStageModulesReady:ready,productionApproved:false,productionEligible:false,deploymentAuthorized:false,externalReviewRequired:true,checks:checks};
}
function render(){
  var el=document.getElementById("pacificEducationNextStageControl");
  if(!el)return;
  var r=run();
  el.innerHTML="<h2>Next Build Stage Control</h2>"+
    "<p><strong>Status:</strong> "+(r.allNextStageModulesReady?"READY FOR CONTINUED PROTOTYPE WORK":"BLOCKED")+"</p>"+
    "<p><strong>Production approved:</strong> NO</p>"+
    "<p><strong>Deployment authorized:</strong> NO</p>"+
    "<p><strong>External/specialist review required:</strong> YES</p>"+
    "<p>Curriculum, calendar, accessibility, safeguarding, offline and testing controls are registered. This controller does not certify production readiness.</p>";
}
global.PacificEducationNextStageControl=Object.freeze({version:"1.0.0",run:run,render:render});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",render);else render();
})(window);
