/*
 * Pacific Education — Authorized Review Closure Disposition
 * v1.0.0 — PROTOTYPE / FAIL-CLOSED
 */
(function(window){
"use strict";
var KEY="pacificEducationFinalReleaseAuthorizedReviewClosureDispositions",MAX=200;
function load(){try{return JSON.parse(localStorage.getItem(KEY)||"[]");}catch(e){return[];}}
function save(a){localStorage.setItem(KEY,JSON.stringify(a.slice(-MAX)));return a;}
function create(input){
 input=input||{};
 var allowed=["closure-confirmed","corrections-required","closure-deferred","review-incomplete"];
 if(!input.closureId||!input.reviewerReference||!allowed.includes(input.disposition)||!input.evidenceReference)throw new Error("closureId, reviewerReference, disposition and evidenceReference are required");
 var rec={dispositionId:"ARD-"+Date.now(),closureId:String(input.closureId),reviewerReference:String(input.reviewerReference),disposition:input.disposition,evidenceReference:String(input.evidenceReference),notes:String(input.notes||""),createdAt:new Date().toISOString(),productionApproved:false,productionEligible:false,deploymentAuthorized:false};
 var a=load();a.push(rec);save(a);return rec;
}
function list(){return load();}
function latestForClosure(id){return load().filter(function(x){return x.closureId===id;}).pop()||null;}
window.PacificEducationFinalReleaseAuthorizedReviewClosureDisposition=Object.freeze({version:"1.0.0",create:create,list:list,latestForClosure:latestForClosure,allowedDispositions:["closure-confirmed","corrections-required","closure-deferred","review-incomplete"],prototype:true,productionApproved:false,productionEligible:false,deploymentAuthorized:false});
})(window);
