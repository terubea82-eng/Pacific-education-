/*
 * Pacific Education — External Approval Registry
 * Version 1.0.0
 * PROTOTYPE ONLY / FAIL-CLOSED.
 *
 * Records references to independent specialist/external reviews.
 * A browser record is evidence of a reference only; it is not certification.
 */
(function(window){
"use strict";
var KEY="pacificEducationExternalApprovals";
var TYPES=["curriculum","security","privacy","safeguarding","accessibility","infrastructure","testing","payments"];
function load(){try{return JSON.parse(localStorage.getItem(KEY)||"[]");}catch(e){return [];}}
function save(v){localStorage.setItem(KEY,JSON.stringify(v));}
function list(){return load();}
function get(id){return list().find(function(x){return x.id===id;})||null;}
function record(input){
if(!input||!input.id||!input.requirementId||!input.approvalType)return {ok:false,error:"id-requirementId-approvalType-required"};
if(!TYPES.includes(input.approvalType))return {ok:false,error:"invalid-approval-type"};
if(!input.evidenceReference||!input.reviewerReference)return {ok:false,error:"independent-evidence-and-reviewer-reference-required"};
var row={id:String(input.id),requirementId:String(input.requirementId),approvalType:input.approvalType,status:input.status==="verified"?"verified":"pending",evidenceReference:String(input.evidenceReference),reviewerReference:String(input.reviewerReference),notes:String(input.notes||""),recordedAt:new Date().toISOString()};
var v=load().filter(function(x){return x.id!==row.id;});v.push(row);save(v);
document.dispatchEvent(new CustomEvent("pacificEducationExternalApprovalChanged",{detail:row}));
return {ok:true,record:row,productionEligible:false};
}
function getForRequirement(id){return list().filter(function(x){return x.requirementId===id;});}
function isVerified(id){return getForRequirement(id).some(function(x){return x.status==="verified";});}
function summary(){var r=list();return {total:r.length,verified:r.filter(function(x){return x.status==="verified";}).length,pending:r.filter(function(x){return x.status!=="verified";}).length,productionEligible:false};}
function validate(){return {valid:list().every(function(x){return x.id&&x.requirementId&&TYPES.includes(x.approvalType)&&x.evidenceReference&&x.reviewerReference;}),prototype:true,productionEligible:false};}
function reset(){localStorage.removeItem(KEY);}
window.PacificEducationExternalApprovalRegistry=Object.freeze({name:"PacificEducationExternalApprovalRegistry",version:"1.0.0",types:TYPES.slice(),list:list,get:get,record:record,getForRequirement:getForRequirement,isVerified:isVerified,summary:summary,validate:validate,reset:reset,prototype:true,productionEligible:false});
})(window);
