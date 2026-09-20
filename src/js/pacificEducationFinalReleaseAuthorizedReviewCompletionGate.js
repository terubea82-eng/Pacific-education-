/*
 * Pacific Education — Final Release Authorized Review Completion Gate
 * v1.0.0 — PROTOTYPE / FAIL-CLOSED
 * Checks whether an authorized review has reached a factual completion state.
 * Completion is not approval, certification, deployment, or production authorization.
 */
(function(window){
"use strict";
function build(){
 var intake=window.PacificEducationFinalReleaseAuthorizedReviewIntake;
 var status=window.PacificEducationFinalReleaseAuthorizedReviewStatusController;
 var blockers=[];
 if(!intake||typeof intake.list!=="function")blockers.push("review-intake-unavailable");
 if(!status||typeof status.list!=="function")blockers.push("review-status-controller-unavailable");
 var rows=intake&&intake.list?intake.list():[];
 var statuses=status&&status.list?status.list():[];
 if(!rows.length)blockers.push("no-review-intake-record");
 var latest=rows.length?rows[rows.length-1]:null;
 var history=latest?statuses.filter(function(x){return x.intakeId===latest.intakeId;}):[];
 var current=history.length?history[history.length-1]:null;
 if(latest&&!current)blockers.push("no-status-for-latest-intake");
 if(current&&current.status!=="completed"&&current.status!=="closed")blockers.push("review-not-completed");
 if(current&&current.status==="closed"&&(!current.evidenceReference))blockers.push("closed-review-evidence-reference-missing");
 return {status:blockers.length?"BLOCKED":"REVIEW-COMPLETION-RECORDED",blockers:blockers,intake:latest,currentStatus:current,failClosed:true,productionApproved:false,productionEligible:false,deploymentAuthorized:false,externalAuthorizationRequired:true};
}
function validate(){var x=build();return {valid:Array.isArray(x.blockers)&&x.failClosed===true&&x.productionApproved===false&&x.productionEligible===false&&x.deploymentAuthorized===false,prototype:true,productionEligible:false};}
window.PacificEducationFinalReleaseAuthorizedReviewCompletionGate=Object.freeze({version:"1.0.0",build:build,validate:validate,prototype:true,productionApproved:false,productionEligible:false,deploymentAuthorized:false});
})(window);
