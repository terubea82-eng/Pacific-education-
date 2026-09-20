/*
 * Pacific Education — External Specialist Review Evidence Registry UI
 * Version 1.0.0
 * PROTOTYPE ONLY / FAIL-CLOSED.
 */
(function(window,document){
"use strict";
function esc(v){return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function render(targetId){
var t=document.getElementById(targetId||"pacificEducationExternalSpecialistReviewEvidenceRegistry");if(!t)return;
var r=window.PacificEducationExternalSpecialistReviewEvidenceRegistry;
if(!r){t.innerHTML="<p>External specialist evidence registry unavailable.</p>";return;}
var s=r.summary(),rows=r.list(),h="<section><h2>External Specialist Review Evidence</h2>";
h+="<p><strong>Total:</strong> "+s.total+" | <strong>Submitted:</strong> "+s.submitted+" | <strong>Corrections:</strong> "+s.corrections+"</p>";
h+='<div><input id="esreRequest" placeholder="Review request ID"><input id="esreReviewer" placeholder="Reviewer reference"><input id="esreEvidence" placeholder="Evidence reference"><select id="esreType">';
r.types.forEach(function(x){h+='<option value="'+x+'">'+x+"</option>";});
h+='</select><button type="button" id="esreAdd">Record Evidence</button></div>';
h+='<div style="overflow:auto"><table><thead><tr><th>ID</th><th>Review Request</th><th>Reviewer</th><th>Type</th><th>Evidence</th><th>Status</th></tr></thead><tbody>';
rows.slice().reverse().forEach(function(x){h+="<tr><td>"+esc(x.id)+"</td><td>"+esc(x.reviewRequestId)+"</td><td>"+esc(x.reviewerReference)+"</td><td>"+esc(x.type)+"</td><td>"+esc(x.evidenceReference)+"</td><td>"+esc(x.status)+"</td></tr>";});
h+='</tbody></table></div><p><small>External evidence is recorded for review only. It cannot authorize production.</small></p></section>';
t.innerHTML=h;
document.getElementById("esreAdd").onclick=function(){
var req=document.getElementById("esreRequest").value.trim(),rev=document.getElementById("esreReviewer").value.trim(),ev=document.getElementById("esreEvidence").value.trim();
if(!req||!rev||!ev)return;
r.register({reviewRequestId:req,reviewerReference:rev,evidenceReference:ev,type:document.getElementById("esreType").value});
render(targetId);
};
}
window.PacificEducationExternalSpecialistReviewEvidenceRegistryUI=Object.freeze({version:"1.0.0",render:render});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){render();});else render();
document.addEventListener("pacificEducationExternalSpecialistEvidenceChanged",function(){render();});
})(window,document);
