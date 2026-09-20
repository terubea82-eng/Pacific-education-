/*
 * Pacific Education — Authorized Review Closure Disposition UI
 * v1.0.0 — PROTOTYPE / FAIL-CLOSED
 */
(function(window,document){
"use strict";
function esc(v){return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function render(id){
 var t=document.getElementById(id||"pacificEducationFinalReleaseAuthorizedReviewClosureDisposition");if(!t)return;
 var api=window.PacificEducationFinalReleaseAuthorizedReviewClosureDisposition;if(!api)return;
 var rows=api.list();
 t.innerHTML="<section><h2>Authorized Review Closure Dispositions</h2><p>Records the factual disposition following closure verification. A disposition does not authorize production.</p><p><strong>Production approved:</strong> NO | <strong>Eligible:</strong> NO | <strong>Deployment authorized:</strong> NO</p>"+(rows.length?"<table><thead><tr><th>Disposition ID</th><th>Closure</th><th>Reviewer</th><th>Disposition</th><th>Evidence</th><th>Created</th></tr></thead><tbody>"+rows.slice().reverse().map(function(x){return "<tr><td>"+esc(x.dispositionId)+"</td><td>"+esc(x.closureId)+"</td><td>"+esc(x.reviewerReference)+"</td><td>"+esc(x.disposition)+"</td><td>"+esc(x.evidenceReference)+"</td><td>"+esc(x.createdAt)+"</td></tr>";}).join("")+"</tbody></table>":"<p>No disposition records yet.</p>")+"</section>";
}
window.PacificEducationFinalReleaseAuthorizedReviewClosureDispositionUI=Object.freeze({version:"1.0.0",render:render});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){render();});else render();
})(window,document);
