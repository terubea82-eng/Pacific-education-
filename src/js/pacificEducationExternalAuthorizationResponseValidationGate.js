/*
 * Pacific Education — External Authorization Response Validation Gate
 * v1.0.0 — PROTOTYPE / FAIL-CLOSED
 * Validates recorded external responses against the authorization request
 * and final production controls. It never grants production authorization.
 */
(function(window){
"use strict";
function get(n){return window[n]||null;}
function evaluate(){
var responses=get("PacificEducationExternalAuthorizationResponseRegistry");
var requests=get("PacificEducationExternalAuthorizationCheckRequest");
var authGate=get("PacificEducationFinalAuthorizationReconciliationGate");
var release=get("PacificEducationFinalReleaseControlReconciliation");
var blockers=[];
if(!responses)blockers.push("authorization-response-registry-missing");
if(!requests)blockers.push("authorization-check-request-missing");
if(!authGate)blockers.push("authorization-reconciliation-gate-missing");
if(!release)blockers.push("final-release-reconciliation-missing");
var rr=responses&&responses.evaluate?responses.evaluate():null;
var latest=responses&&responses.latest?responses.latest():null;
var req=requests&&requests.latest?requests.latest():null;
var ag=authGate&&authGate.evaluate?authGate.evaluate():null;
var rel=release&&release.evaluate?release.evaluate():null;
if(!req)blockers.push("no-external-authorization-request-recorded");
if(!latest)blockers.push("no-external-authorization-response-recorded");
if(latest&&req&&latest.requestId!==req.id)blockers.push("response-does-not-match-latest-request");
if(latest&&latest.responseStatus!=="approved")blockers.push("external-authorization-not-approved");
if(ag&&ag.authorizationCheckReady!==true)blockers.push("authorization-reconciliation-not-ready");
if(rel&&rel.reconciled!==true)blockers.push("final-control-not-reconciled");
return {
status:blockers.length===0?"READY-FOR-FINAL-EXTERNAL-VERIFICATION":"BLOCKED",
validationPassed:blockers.length===0,
blockers:blockers,
latestResponseStatus:latest?latest.responseStatus:null,
requestId:req?req.id:null,
responseId:latest?latest.id:null,
productionApproved:false,
productionEligible:false,
failClosed:true,
externalAuthorityRequired:true,
validatedAt:new Date().toISOString()
};
}
function validate(){var x=evaluate();return {valid:Array.isArray(x.blockers)&&x.productionApproved===false&&x.productionEligible===false,prototype:true,productionEligible:false};}
window.PacificEducationExternalAuthorizationResponseValidationGate=Object.freeze({
version:"1.0.0",evaluate:evaluate,validate:validate,prototype:true,productionApproved:false,productionEligible:false
});
})(window);
