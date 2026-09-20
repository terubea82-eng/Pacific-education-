/* PACIFIC EDUCATION — PROTOTYPE VERIFICATION RECONCILIATION
 * v1.0.0 — diagnostic/reconciliation only
 * Does not create reviewer evidence and cannot authorize production.
 */
(function(window,document){
"use strict";
var VERSION="1.0.0";
function evaluate(){
 var runner=window.PacificEducationPrototypeTestRunner;
 var matrix=window.PacificEducationFullSystemTestMatrix;
 var report=runner&&typeof runner.run==="function"?runner.run():null;
 var matrixReport=matrix&&typeof matrix.evaluate==="function"?matrix.evaluate():null;
 var staleThresholdMs=24*60*60*1000;
 var now=Date.now();
 var staleTests=[];
 var missingEvidenceTests=[];
 var orphanEvidenceTests=[];
 var legacyEvidenceTests=[];
 var evidenceRecordApi=window.PacificEducationFullSystemTestEvidenceRecord||null;
 var evidenceRecords=evidenceRecordApi&&typeof evidenceRecordApi.read==="function"?evidenceRecordApi.read():[];
 var currentTestIds=[];
 var remediationByStage={};
 var stageMap={
  "offline-sync":"Offline","offline-sync-batch":"Offline","offline-sync-fail-closed":"Offline",
  "accessibility-runtime":"Accessibility",
  "curriculum-alignment":"Curriculum","assessment":"Assessment","calendar":"Calendar",
  "safeguarding":"Safeguarding","testing":"Testing","security":"Security","production":"Production"
 };
 function addRemediation(stage,id,reason){if(!remediationByStage[stage])remediationByStage[stage]=[];remediationByStage[stage].push({testId:id,reason:reason});}
 if(matrixReport&&Array.isArray(matrixReport.tests)){
  currentTestIds=matrixReport.tests.map(function(t){return t[0];});
  matrixReport.tests.forEach(function(t){
   var x=t&&t.status==="pass"&&t.evidence;
   var latest=evidenceRecords.filter(function(r){return r&&r.testId===t[0];}).pop();
   if(latest&&!latest.matrixVersion) {legacyEvidenceTests.push(t[0]);addRemediation(stageMap[t[0]]||"Other",t[0],"Legacy evidence has no matrix version; refresh evidence against the current test matrix");}
   if(!latest||latest.status!=="pass"||!latest.evidenceReference||!latest.reviewerReference||!latest.matrixVersion){ missingEvidenceTests.push(t[0]); addRemediation(stageMap[t[0]]||"Other",t[0],"PASS + current evidence reference + reviewer reference required"); }
   if(latest&&latest.createdAt){var evidenceAge=now-Date.parse(latest.createdAt);if(isFinite(evidenceAge)&&evidenceAge>staleThresholdMs){staleTests.push(t[0]);addRemediation(stageMap[t[0]]||"Other",t[0],"Evidence record older than 24 hours; refresh authorized review evidence");}}
   if(x&&t.updatedAt){var age=now-Date.parse(t.updatedAt);if(isFinite(age)&&age>staleThresholdMs){ staleTests.push(t[0]); addRemediation(stageMap[t[0]]||"Other",t[0],"Evidence older than 24 hours; refresh/review required"); }}
  });
 }
 evidenceRecords.forEach(function(r){if(r&&r.testId&&currentTestIds.indexOf(r.testId)===-1)orphanEvidenceTests.push(r.testId);});
 if(orphanEvidenceTests.length){orphanEvidenceTests.forEach(function(id){addRemediation("Other",id,"Evidence record does not match a current test-matrix ID; reconcile or retire the record");});}
 var automatedPass=!!(report&&report.status==="PASS");
 var matrixComplete=!!(matrixReport&&matrixReport.status==="FULL-SYSTEM-TESTING-EVIDENCE-COMPLETE");
 return{
  version:VERSION,
  timestamp:new Date().toISOString(),
  automatedRuntimeStatus:report?report.status:"MISSING",
  automatedChecks:report?report.passed:0,
  automatedChecksTotal:report?report.total:0,
  matrixEvidenceStatus:matrixReport?matrixReport.status:"MISSING",
  matrixCompletedTests:matrixReport?matrixReport.completedTests:0,
  matrixTotalTests:matrixReport?matrixReport.totalTests:0,
  status:automatedPass&&matrixComplete?"RECONCILIATION-COMPLETE":"BLOCKED",
  automatedRuntimePass:automatedPass,
  matrixEvidenceComplete:matrixComplete,
  missingEvidenceTests:missingEvidenceTests,
  staleTests:staleTests,
  orphanEvidenceTests:orphanEvidenceTests,
  legacyEvidenceTests:legacyEvidenceTests,
  staleThresholdHours:24,
  remediationByStage:remediationByStage,
  remediationStageCount:Object.keys(remediationByStage).length,
  evidenceRecordEvaluationAvailable:!!(evidenceRecordApi&&typeof evidenceRecordApi.evaluate==="function"),
  currentMatrixVersion:matrix&&matrix.version?matrix.version:null,
  reviewerEvidenceRequired:true,
  productionApproved:false,
  productionEligible:false,
  deploymentAuthorized:false,
  externalAuthorizedReviewRequired:true
 };
}
function render(targetId){
 var target=document.getElementById(targetId||"pacificEducationPrototypeVerificationReconciliation");
 if(!target)return false;
 var r=evaluate();target.innerHTML="";
 var h=document.createElement("h3");h.textContent="Prototype Verification Reconciliation v"+VERSION;target.appendChild(h);
 var p=document.createElement("p");p.textContent=r.status;target.appendChild(p);
 var u=document.createElement("ul");
 [["Automated runtime",r.automatedRuntimeStatus],["Automated checks",r.automatedChecks+"/"+r.automatedChecksTotal],["Matrix evidence",r.matrixEvidenceStatus],["Matrix completion",r.matrixCompletedTests+"/"+r.matrixTotalTests]].forEach(function(x){var li=document.createElement("li");li.textContent=x[0]+": "+x[1];u.appendChild(li);});
 target.appendChild(u);
 var n=document.createElement("p");n.textContent="Remediation stages: "+(Object.keys(r.remediationByStage).length?Object.keys(r.remediationByStage).join(", "):"none")+". Missing evidence tests: "+(r.missingEvidenceTests.length?r.missingEvidenceTests.join(", "):"none")+" | Legacy evidence: "+(r.legacyEvidenceTests.length?r.legacyEvidenceTests.join(", "):"none")+" | Stale tests (>24h): "+(r.staleTests.length?r.staleTests.join(", "):"none")+". Reconciliation does not create human reviewer evidence. Production remains blocked until required evidence, independent testing and authorized review are completed.";target.appendChild(n);
 return r;
}
window.PacificEducationPrototypeVerificationReconciliation=Object.freeze({name:"PacificEducationPrototypeVerificationReconciliation",version:VERSION,evaluate:evaluate,render:render});
document.addEventListener("DOMContentLoaded",function(){render("pacificEducationPrototypeVerificationReconciliation");});
})(window,document);
