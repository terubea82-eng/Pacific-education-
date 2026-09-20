/*
 * Pacific Education — Final Release Authorized Review Outcome Record
 * v1.0.0 — PROTOTYPE / FAIL-CLOSED
 */
(function(window){
"use strict";
var KEY="pacificEducationFinalReleaseAuthorizedReviewOutcomes",MAX=200;
function load(){try{return JSON.parse(localStorage.getItem(KEY)||"[]");}catch(e){return[];}}
function save(a){localStorage.setItem(KEY,JSON.stringify(a.slice(-MAX)));return a;}
function create(input){
 input=input||{};
 var allowed=["no-corrections-required","corrections-required","review-only","unable-to-complete"];
 if(!input.intakeId||!input.reviewerReference||!allowed.includes(input.outcome)||!input.evidenceReference)throw new Error("intakeId, reviewerReference, outcome and evidenceReference are required");
 var rec={outcomeId:"ARO-"+Date.now(),intakeId:String(input.intakeId),reviewerReference:String(input.reviewerReference),outcome:input.outcome,evidenceReference:String(input.evidenceReference),notes:String(input.notes||""),createdAt:new Date().toISOString(),productionApproved:false,productionEligible:false,deploymentAuthorized:false};
 var a=load();a.push(rec);save(a);return rec;
}
function list(){return load();}
function latestForIntake(id){return load().filter(function(x){return x.intakeId===id;}).pop()||null;}
window.PacificEducationFinalReleaseAuthorizedReviewOutcomeRecord=Object.freeze({version:"1.0.0",create:create,list:list,latestForIntake:latestForIntake,allowedOutcomes:["no-corrections-required","corrections-required","review-only","unable-to-complete"],prototype:true,productionApproved:false,productionEligible:false,deploymentAuthorized:false});
})(window);
