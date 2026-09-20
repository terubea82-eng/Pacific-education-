/*
 * Pacific Education — Final Release Authorized Review Outcome Record UI
 * v1.0.0 — PROTOTYPE / FAIL-CLOSED
 */
(function(window,document){
"use strict";
function esc(v){return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function render(id){
 var t=document.getElementById(id||"pacificEducationFinalReleaseAuthorizedReviewOutcomeRecord");if(!t)return;
 var api=window.PacificEducationFinalReleaseAuthorizedReviewOutcomeRecord;if(!api)return;
 var rows=api.list();
 t.innerHTML="<section><h2>Authorized Review Outcome Records</h2><p>Recorded factual outcomes from authorized review. This is not production approval or deployment authorization.</p><p><strong>Production approved:</strong> NO | <strong>Eligible:</strong> NO | <strong>Deployment authorized:</strong> NO</p>"+(rows.length?"<table><thead><tr><th>Outcome ID</th><th>Intake</th><th>Reviewer</th><th>Outcome</th><th>Evidence</th><th>Created</th></tr></thead><tbody>"+rows.slice().reverse().map(function(x){return "<tr><td>"+esc(x.outcomeId)+"</td><td>"+esc(x.intakeId)+"</td><td>"+esc(x.reviewerReference)+"</td><td>"+esc(x.outcome)+"</td><td>"+esc(x.evidenceReference)+"</td><td>"+esc(x.createdAt)+"</td></tr>";}).join("")+"</tbody></table>":"<p>No outcome records yet.</p>")+"</section>";
}
window.PacificEducationFinalReleaseAuthorizedReviewOutcomeRecordUI=Object.freeze({version:"1.0.0",render:render});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){render();});else render();
})(window,document);
