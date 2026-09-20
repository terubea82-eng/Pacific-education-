/*
 * Pacific Education — Production Requirement Registry
 * Version 1.0.0
 * PROTOTYPE ONLY.
 *
 * Central owner-controlled checklist. Recording a requirement here does not
 * constitute professional approval, deployment approval, or production access.
 */
(function(window){
"use strict";
var KEY="pacificEducationProductionRequirements";
var TYPES=["curriculum","security","privacy","safeguarding","accessibility","infrastructure","testing","payments"];
var DEFAULTS=[
{id:"curriculum-verification",type:"curriculum",label:"Official curriculum source verification",required:true,status:"pending"},
{id:"owner-approval",type:"curriculum",label:"Owner approval",required:true,status:"pending"},
{id:"production-database",type:"infrastructure",label:"Production database",required:true,status:"pending"},
{id:"secure-production-authentication",type:"security",label:"Secure production authentication",required:true,status:"pending"},
{id:"production-hosting",type:"infrastructure",label:"Production hosting",required:true,status:"pending"},
{id:"cybersecurity-review",type:"security",label:"Cybersecurity review",required:true,status:"pending"},
{id:"privacy-review",type:"privacy",label:"Privacy review",required:true,status:"pending"},
{id:"child-safeguarding-review",type:"safeguarding",label:"Child safeguarding review",required:true,status:"pending"},
{id:"accessibility-review",type:"accessibility",label:"Accessibility review",required:true,status:"pending"},
{id:"controlled-pilot-user-testing",type:"testing",label:"Controlled pilot and user testing",required:true,status:"pending"},
{id:"production-payment-verification",type:"payments",label:"Production payment verification",required:true,status:"pending"}
];
function load(){try{return JSON.parse(localStorage.getItem(KEY)||"[]");}catch(e){return [];}}
function save(v){localStorage.setItem(KEY,JSON.stringify(v));}
function list(){
var current=load(),byId={}; current.forEach(function(x){byId[x.id]=x;});
return DEFAULTS.map(function(d){return Object.assign({},d,byId[d.id]||{});});
}
function get(id){return list().find(function(x){return x.id===id;})||null;}
function record(input){
if(!input||!input.id)return {ok:false,error:"id-required"};
var d=DEFAULTS.find(function(x){return x.id===input.id;});
if(!d)return {ok:false,error:"unknown-requirement"};
if(!["pending","in-review","verified","blocked"].includes(input.status))return {ok:false,error:"invalid-status"};
var v=load().filter(function(x){return x.id!==input.id;});
v.push({id:d.id,status:input.status,evidenceReference:input.evidenceReference||"",reviewerReference:input.reviewerReference||"",notes:input.notes||"",updatedAt:new Date().toISOString()});
save(v);
document.dispatchEvent(new CustomEvent("pacificEducationProductionRequirementChanged",{detail:{id:d.id,status:input.status}}));
return {ok:true,record:get(d.id),productionEligible:false};
}
function summary(){
var rows=list(),verified=rows.filter(function(x){return x.required&&x.status==="verified";}).length;
return {totalRequired:rows.filter(function(x){return x.required;}).length,verified:verified,pending:rows.filter(function(x){return x.required&&x.status!=="verified";}).length,ready:false,productionEligible:false};
}
function validate(){
return {valid:list().every(function(x){return x.id&&x.type&&TYPES.includes(x.type);}),prototype:true,productionEligible:false};
}
function reset(){localStorage.removeItem(KEY);}
window.PacificEducationProductionRequirementRegistry=Object.freeze({name:"PacificEducationProductionRequirementRegistry",version:"1.0.0",list:list,get:get,record:record,summary:summary,validate:validate,reset:reset,types:TYPES.slice(),prototype:true,productionEligible:false});
})(window);
