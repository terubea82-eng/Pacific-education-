/*
 * Pacific Education — External Authorization Response Registry
 * v1.0.0 — PROTOTYPE / FAIL-CLOSED
 * Records an external authority response. A browser record never grants production access.
 */
(function(window){
"use strict";
var KEY="pacificEducationExternalAuthorizationResponses",MAX=200;
var VALID=["pending","approved","approved-with-conditions","declined","returned-for-correction"];
function read(){try{return JSON.parse(localStorage.getItem(KEY)||"[]");}catch(e){return[];}}
function write(a){localStorage.setItem(KEY,JSON.stringify(a.slice(-MAX)));}
function record(input){
input=input||{};
if(!input.requestId||!input.authorityReference||!input.responseStatus)return {ok:false,reason:"request-authority-response-required"};
if(VALID.indexOf(String(input.responseStatus))<0)return {ok:false,reason:"invalid-response-status"};
var a=read(),r={id:"ext-auth-response-"+Date.now(),requestId:String(input.requestId),authorityReference:String(input.authorityReference),responseStatus:String(input.responseStatus),evidenceReference:String(input.evidenceReference||""),reviewerReference:String(input.reviewerReference||""),conditions:String(input.conditions||""),notes:String(input.notes||""),recordedAt:new Date().toISOString(),productionApproved:false,productionEligible:false};
a.push(r);write(a);return {ok:true,response:r,productionApproved:false,productionEligible:false};
}
function list(){return read();}
function latest(){var a=read();return a.length?a[a.length-1]:null;}
function evaluate(){
var a=read(),approved=a.filter(function(x){return x.responseStatus==="approved";}).length;
return {count:a.length,approvedResponses:approved,externalResponseRecorded:a.length>0,productionApproved:false,productionEligible:false,failClosed:true,externalAuthorityRequired:true};
}
function validate(){return {valid:read().every(function(x){return x.requestId&&x.authorityReference&&VALID.indexOf(x.responseStatus)>=0&&x.productionApproved===false&&x.productionEligible===false;}),prototype:true,productionEligible:false};}
window.PacificEducationExternalAuthorizationResponseRegistry=Object.freeze({version:"1.0.0",record:record,list:list,latest:latest,evaluate:evaluate,validate:validate,prototype:true,productionApproved:false,productionEligible:false});
})(window);
