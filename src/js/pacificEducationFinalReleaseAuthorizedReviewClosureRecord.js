/*
 * Pacific Education — Authorized Review Closure Record
 * v1.0.0 — PROTOTYPE / FAIL-CLOSED
 */
(function(window){
"use strict";
var KEY="pacificEducationFinalReleaseAuthorizedReviewClosures",MAX=200;
function load(){try{return JSON.parse(localStorage.getItem(KEY)||"[]");}catch(e){return[];}}
function save(a){localStorage.setItem(KEY,JSON.stringify(a.slice(-MAX)));return a;}
function create(input){
 input=input||{};
 var allowed=["closed","returned-for-correction","closure-deferred"];
 if(!input.intakeId||!input.reviewerReference||!allowed.includes(input.closureStatus)||!input.evidenceReference)throw new Error("intakeId, reviewerReference, closureStatus and evidenceReference are required");
 var rec={closureId:"ARC-"+Date.now(),intakeId:String(input.intakeId),reviewerReference:String(input.reviewerReference),closureStatus:input.closureStatus,evidenceReference:String(input.evidenceReference),notes:String(input.notes||""),createdAt:new Date().toISOString(),productionApproved:false,productionEligible:false,deploymentAuthorized:false};
 var a=load();a.push(rec);save(a);return rec;
}
function list(){return load();}
function latestForIntake(id){return load().filter(function(x){return x.intakeId===id;}).pop()||null;}
window.PacificEducationFinalReleaseAuthorizedReviewClosureRecord=Object.freeze({version:"1.0.0",create:create,list:list,latestForIntake:latestForIntake,allowedClosureStatuses:["closed","returned-for-correction","closure-deferred"],prototype:true,productionApproved:false,productionEligible:false,deploymentAuthorized:false});
})(window);
