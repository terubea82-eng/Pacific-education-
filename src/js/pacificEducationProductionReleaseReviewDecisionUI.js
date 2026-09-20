/*
 * Pacific Education — Production Release Review Decision UI
 * Version 1.0.0
 * PROTOTYPE ONLY.
 */
(function(window,document){
"use strict";
function esc(v){return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function render(targetId){
var t=document.getElementById(targetId||"pacificEducationProductionReleaseReviewDecision");if(!t)return;
var c=window.PacificEducationProductionReleaseReviewDecision;
if(!c){t.innerHTML="<p>Release review decision controller unavailable.</p>";return;}
var x=c.latest();
var h='<section><h2>Production Release Review Decision</h2><p><strong>Production approval:</strong> Not available in prototype</p><label>Decision <select id="pacificEducationReleaseReviewDecisionSelect">';
c.decisions.forEach(function(d){h+='<option value="'+esc(d)+'">'+esc(d)+"</option>";});
h+='</select></label> <label>Reviewer reference <input id="pacificEducationReleaseReviewerReference" type="text"></label> <label>Notes <input id="pacificEducationProductionReviewNotes" type="text"></label> <button type="button" id="pacificEducationRecordProductionReviewDecision">Record Decision</button>';
if(x)h+='<p><strong>Latest:</strong> '+esc(x.decision)+' — '+esc(x.recordedAt)+'</p>';
h+='<p><small>Prototype record only. No decision here can authorize deployment or production.</small></p></section>';
t.innerHTML=h;
var b=document.getElementById("pacificEducationRecordProductionReviewDecision");
if(b)b.addEventListener("click",function(){
 c.record({decision:document.getElementById("pacificEducationReleaseReviewDecisionSelect").value,reviewerReference:document.getElementById("pacificEducationReleaseReviewerReference").value,notes:document.getElementById("pacificEducationProductionReviewNotes").value});
 render(targetId);
});
}
window.PacificEducationProductionReleaseReviewDecisionUI=Object.freeze({version:"1.0.0",render:render});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){render();});else render();
document.addEventListener("pacificEducationProductionReleaseReviewDecisionRecorded",function(){render();});
})(window,document);
