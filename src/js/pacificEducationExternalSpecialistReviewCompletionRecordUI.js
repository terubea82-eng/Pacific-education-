/*
 * Pacific Education — External Specialist Review Completion Record UI
 * Version 1.0.0
 * PROTOTYPE ONLY / FAIL-CLOSED.
 */
(function(window,document){
"use strict";
function esc(v){return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function render(targetId){
var t=document.getElementById(targetId||"pacificEducationExternalSpecialistReviewCompletionRecord");if(!t)return;
var r=window.PacificEducationExternalSpecialistReviewCompletionRecord;
if(!r){t.innerHTML="<p>Review completion record unavailable.</p>";return;}
var s=r.summary(),rows=r.list(),h="<section><h2>External Specialist Review Completion Records</h2>";
h+="<p><strong>Completed:</strong> "+s.completed+" | <strong>Corrections required:</strong> "+s.correctionsRequired+"</p>";
h+='<div><input id="rcrRequest" placeholder="Review request ID"><input id="rcrReviewer" placeholder="Reviewer reference"><input id="rcrEvidence" placeholder="Completion evidence reference"><input id="rcrFindings" placeholder="Findings reference (optional)"><select id="rcrOutcome">';
r.outcomes.forEach(function(x){h+='<option value="'+x+'">'+x+"</option>";});
h+='</select><button type="button" id="rcrCreate">Record Completion</button></div>';
h+='<div style="overflow:auto"><table><thead><tr><th>ID</th><th>Request</th><th>Reviewer</th><th>Outcome</th><th>Completed</th></tr></thead><tbody>';
rows.slice().reverse().forEach(function(x){h+="<tr><td>"+esc(x.id)+"</td><td>"+esc(x.reviewRequestId)+"</td><td>"+esc(x.reviewerReference)+"</td><td>"+esc(x.outcome)+"</td><td>"+esc(x.completedAt)+"</td></tr>";});
h+='</tbody></table></div><p><small>Completion record only. It is not a production certificate or authorization.</small></p></section>';
t.innerHTML=h;
document.getElementById("rcrCreate").onclick=function(){
var req=document.getElementById("rcrRequest").value.trim(),rev=document.getElementById("rcrReviewer").value.trim(),ev=document.getElementById("rcrEvidence").value.trim();
if(!req||!rev||!ev)return;
r.create({reviewRequestId:req,reviewerReference:rev,completionEvidenceReference:ev,findingsReference:document.getElementById("rcrFindings").value.trim(),outcome:document.getElementById("rcrOutcome").value});
render(targetId);
};
}
window.PacificEducationExternalSpecialistReviewCompletionRecordUI=Object.freeze({version:"1.0.0",render:render});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){render();});else render();
document.addEventListener("pacificEducationExternalReviewCompletionChanged",function(){render();});
})(window,document);
