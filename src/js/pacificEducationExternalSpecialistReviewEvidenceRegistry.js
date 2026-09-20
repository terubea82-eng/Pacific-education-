/*
 * Pacific Education — External Specialist Review Evidence Registry
 * Version 1.0.0
 * PROTOTYPE ONLY / FAIL-CLOSED.
 *
 * Records evidence/findings supplied by an independent specialist review.
 * It cannot approve, publish, or authorize production.
 */
(function(window){
"use strict";
var KEY="pacificEducationExternalSpecialistReviewEvidence";
var TYPES=["finding","recommendation","test-result","audit-result","compliance-note","correction-required"];
var STATUSES=["submitted","reviewed","accepted-for-record","requires-correction"];
function load(){try{return JSON.parse(localStorage.getItem(KEY)||"[]");}catch(e){return [];}}
function save(v){localStorage.setItem(KEY,JSON.stringify(v));}
function register(input){
if(!input||!input.reviewRequestId||!input.reviewerReference||!input.evidenceReference||!input.type)
return {ok:false,error:"review-request-reviewer-evidence-and-type-required"};
if(TYPES.indexOf(input.type)<0)return {ok:false,error:"invalid-evidence-type"};
var row={id:"ESRE-"+Date.now(),reviewRequestId:String(input.reviewRequestId),reviewerReference:String(input.reviewerReference),evidenceReference:String(input.evidenceReference),type:String(input.type),status:"submitted",finding:String(input.finding||""),recommendation:String(input.recommendation||""),notes:String(input.notes||""),submittedAt:new Date().toISOString(),productionApproved:false,productionEligible:false};
var v=load();v.push(row);if(v.length>2000)v=v.slice(-2000);save(v);
document.dispatchEvent(new CustomEvent("pacificEducationExternalSpecialistEvidenceChanged",{detail:row}));
return {ok:true,evidence:row,productionApproved:false,productionEligible:false};
}
function update(id,patch){
var v=load(),found=null;
v=v.map(function(x){if(x.id!==id)return x;found=Object.assign({},x,patch||{});found.productionApproved=false;found.productionEligible=false;return found;});
if(!found)return {ok:false,error:"evidence-not-found"};
save(v);document.dispatchEvent(new CustomEvent("pacificEducationExternalSpecialistEvidenceChanged",{detail:found}));
return {ok:true,evidence:found,productionApproved:false,productionEligible:false};
}
function list(){return load();}
function forRequest(id){return load().filter(function(x){return x.reviewRequestId===id;});}
function summary(){var v=load();return {total:v.length,submitted:v.filter(function(x){return x.status==="submitted";}).length,corrections:v.filter(function(x){return x.status==="requires-correction";}).length,productionApproved:false,productionEligible:false};}
function validate(){return {valid:load().every(function(x){return x.id&&x.reviewRequestId&&x.reviewerReference&&x.evidenceReference&&TYPES.indexOf(x.type)>=0&&STATUSES.indexOf(x.status)>=0&&x.productionApproved===false&&x.productionEligible===false;}),prototype:true,productionEligible:false};}
function reset(){localStorage.removeItem(KEY);}
window.PacificEducationExternalSpecialistReviewEvidenceRegistry=Object.freeze({name:"PacificEducationExternalSpecialistReviewEvidenceRegistry",version:"1.0.0",types:TYPES.slice(),statuses:STATUSES.slice(),register:register,update:update,list:list,forRequest:forRequest,summary:summary,validate:validate,reset:reset,prototype:true,productionApproved:false,productionEligible:false});
})(window);
