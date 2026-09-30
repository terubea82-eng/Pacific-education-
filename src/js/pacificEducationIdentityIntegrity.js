/* Pacific Education — Identity Integrity & Duplicate Detection
 * Pilot/prototype. Detects conflicts; does not independently declare an identity fraudulent.
 * Confirmed corrections require an authorised source/administrator and an auditable decision.
 */
(function(window,document){"use strict";
var KEY="pacificEducationIdentityIntegrityV1";
var state={version:1,events:[],lastUpdated:null};
function load(){try{var v=JSON.parse(localStorage.getItem(KEY)||"{}");if(v&&Array.isArray(v.events))state=v;}catch(e){}return state;}
function save(){state.lastUpdated=new Date().toISOString();try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){}return state;}
function norm(v){return String(v||"").trim().toUpperCase().replace(/\s+/g,"");}
function esc(v){return String(v==null?"":v).replace(/[&<>"]/g,function(c){return({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c];});}
function record(status,reason,input){
 var e={id:"PE-ID-EVENT-"+Date.now().toString(36).toUpperCase(),status:status,reason:reason,source:String(input.source||""),sourceType:String(input.sourceType||""),institutionId:String(input.institutionId||""),paceduId:String(input.paceduId||""),externalId:String(input.externalId||""),recordedAt:new Date().toISOString(),resolution:String(input.resolution||"pending-authorised-review")};
 state.events.push(e);save();return e;
}
function check(input){
 input=input||{};load();
 var externalId=norm(input.externalId),paceduId=String(input.paceduId||"").trim(),institutionId=String(input.institutionId||"").trim();
 var reasons=[];
 if(!externalId&&!paceduId){reasons.push("missing-identity-key");}
 var links=(window.PacificEducationStudentExternalIdRegistry&&window.PacificEducationStudentExternalIdRegistry.getState().links)||[];
 if(externalId){
   var same=links.filter(function(x){return norm(x.externalId)===externalId;});
   if(same.length>1)reasons.push("duplicate-external-id");
   if(same.some(function(x){return paceduId&&x.paceduId!==paceduId;}))reasons.push("external-id-linked-to-different-pacedu-id");
   if(institutionId&&same.some(function(x){return x.institutionId&&x.institutionId!==institutionId;}))reasons.push("institution-conflict");
 }
 if(paceduId){
   var ids=links.filter(function(x){return x.paceduId===paceduId;});
   if(externalId&&ids.some(function(x){return norm(x.externalId)!==externalId&&x.sourceType===String(input.sourceType||"");}))reasons.push("multiple-external-ids-for-same-source");
 }
 var status=reasons.length?"AMBER_REVIEW":"CLEAR";
 var event=record(status,reasons.join("," )||"no-conflict-detected",input);
 return {status:status,reasons:reasons,event:event};
}
function resolve(eventId,resolution,authorized){
 if(authorized!==true)throw new Error("Authorised identity-integrity review is required.");
 load();var e=state.events.filter(function(x){return x.id===eventId;})[0];if(!e)throw new Error("Identity-integrity event not found.");
 e.resolution=String(resolution||"verified-after-review");e.resolvedAt=new Date().toISOString();save();render();return e;
}
function render(){
 var el=document.getElementById("pacificEducationIdentityIntegrity");if(!el)return;load();
 var amber=state.events.filter(function(x){return x.status==="AMBER_REVIEW"&&x.resolution==="pending-authorised-review";}).length;
 el.innerHTML="<h2>Identity Integrity & Duplicate Detection</h2>"+
 "<p><strong>Continuous rule:</strong> PacEdu checks authorised identity links for duplicate IDs, conflicting links, missing identity keys and institution conflicts whenever identity records are processed.</p>"+
 "<p><strong>Detection is not a fraud finding:</strong> a conflict is flagged for authorised verification. PacEdu does not automatically accuse, delete or merge a person.</p>"+
 "<p><strong>Current review queue:</strong> "+amber+" unresolved identity conflict(s).</p>"+
 "<p><strong>Resolution:</strong> authorised source/administrator verifies the record, corrects the source through the approved process, and records the decision.</p>"+
 "<p><strong>Production requirement:</strong> secure server-side identity matching, access control, encryption, audit logs, retention controls and authorised data-sharing agreements are required before production use.</p>";
}
load();window.PacificEducationIdentityIntegrity=Object.freeze({version:"1.0.0",prototype:true,productionEligible:false,check:check,resolve:resolve,getState:function(){return load();},render:render});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",render);else render();
})(window,document);
