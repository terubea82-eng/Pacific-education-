/*
 * Pacific Education — Production Release Issue Register
 * Version 1.0.0
 * PROTOTYPE ONLY / FAIL-CLOSED.
 *
 * Central register for release blockers discovered during review.
 * It does not resolve, waive, or authorize production issues.
 */
(function(window){
"use strict";
var KEY="pacificEducationProductionReleaseIssues";
var SEVERITIES=["critical","high","medium","low"];
var STATUSES=["open","in-review","resolved","accepted-pending-external-review"];
function load(){try{return JSON.parse(localStorage.getItem(KEY)||"[]");}catch(e){return [];}}
function save(v){localStorage.setItem(KEY,JSON.stringify(v));}
function create(input){
if(!input||!input.title||!input.category)return {ok:false,error:"title-and-category-required"};
var severity=SEVERITIES.includes(input.severity)?input.severity:"high";
var row={id:"PRI-"+Date.now(),title:String(input.title),category:String(input.category),severity:severity,status:"open",description:String(input.description||""),evidenceReference:String(input.evidenceReference||""),ownerReference:String(input.ownerReference||""),createdAt:new Date().toISOString(),productionEligible:false};
var v=load();v.push(row);if(v.length>1000)v=v.slice(-1000);save(v);
document.dispatchEvent(new CustomEvent("pacificEducationProductionReleaseIssueChanged",{detail:row}));
return {ok:true,issue:row,productionEligible:false};
}
function update(id,patch){
var v=load(),found=null;
v=v.map(function(x){if(x.id!==id)return x;found=x=Object.assign({},x,patch||{});x.productionEligible=false;return x;});
if(!found)return {ok:false,error:"issue-not-found"};
save(v);document.dispatchEvent(new CustomEvent("pacificEducationProductionReleaseIssueChanged",{detail:found}));
return {ok:true,issue:found,productionEligible:false};
}
function list(){return load();}
function open(){return load().filter(function(x){return x.status!=="resolved";});}
function summary(){var v=load();return {total:v.length,open:open().length,critical:v.filter(function(x){return x.severity==="critical"&&x.status!=="resolved";}).length,productionEligible:false};}
function validate(){return {valid:load().every(function(x){return x.id&&x.title&&x.category&&SEVERITIES.includes(x.severity)&&STATUSES.includes(x.status)&&x.productionEligible===false;}),prototype:true,productionEligible:false};}
function reset(){localStorage.removeItem(KEY);}
window.PacificEducationProductionReleaseIssueRegister=Object.freeze({name:"PacificEducationProductionReleaseIssueRegister",version:"1.0.0",severities:SEVERITIES.slice(),statuses:STATUSES.slice(),create:create,update:update,list:list,open:open,summary:summary,validate:validate,reset:reset,prototype:true,productionEligible:false});
})(window);
