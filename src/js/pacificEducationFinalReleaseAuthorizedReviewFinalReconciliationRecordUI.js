/*
 * Pacific Education — Authorized Review Final Reconciliation Record UI
 * v1.0.0 — PROTOTYPE / FAIL-CLOSED
 */
(function(window,document){
"use strict";
function esc(v){return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function render(id){
 var t=document.getElementById(id||"pacificEducationFinalReleaseAuthorizedReviewFinalReconciliationRecord");if(!t)return;
 var api=window.PacificEducationFinalReleaseAuthorizedReviewFinalReconciliationRecord;if(!api)return;
 var rows=api.list();
 t.innerHTML="<section><h2>Authorized Review Final Reconciliation Records</h2><p>Records the factual reconciliation state after review-control checks. This record does not authorize production.</p><p><strong>Production approved:</strong> NO | <strong>Eligible:</strong> NO | <strong>Deployment authorized:</strong> NO</p>"+(rows.length?"<table><thead><tr><th>ID</th><th>Reviewer</th><th>Status</th><th>Evidence</th><th>Created</th></tr></thead><tbody>"+rows.slice().reverse().map(function(x){return "<tr><td>"+esc(x.reconciliationId)+"</td><td>"+esc(x.reviewerReference)+"</td><td>"+esc(x.reconciliationStatus)+"</td><td>"+esc(x.evidenceReference)+"</td><td>"+esc(x.createdAt)+"</td></tr>";}).join("")+"</tbody></table>":"<p>No reconciliation records yet.</p>")+"</section>";
}
window.PacificEducationFinalReleaseAuthorizedReviewFinalReconciliationRecordUI=Object.freeze({version:"1.0.0",render:render});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){render();});else render();
})(window,document);
