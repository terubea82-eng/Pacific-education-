/*
 * Pacific Education — Final Release Authorized Review Intake UI
 * v1.0.0 — PROTOTYPE / FAIL-CLOSED
 */
(function(window,document){
"use strict";
function esc(v){return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function render(id){
 var t=document.getElementById(id||"pacificEducationFinalReleaseAuthorizedReviewIntake");if(!t)return;
 var g=window.PacificEducationFinalReleaseAuthorizedReviewIntake;if(!g)return;
 var rows=g.list().slice().reverse();
 var h="<section><h2>Final Release — Authorized Review Intake</h2><p>Structured intake for an authorized human/external reviewer.</p><p><strong>Production approved:</strong> NO | <strong>Production eligible:</strong> NO | <strong>Deployment authorized:</strong> NO</p><table><thead><tr><th>Intake</th><th>Packet</th><th>Reviewer</th><th>Purpose</th><th>Status</th><th>Date</th></tr></thead><tbody>";
 rows.forEach(function(r){h+="<tr><td>"+esc(r.intakeId)+"</td><td>"+esc(r.packetId)+"</td><td>"+esc(r.reviewerReference)+"</td><td>"+esc(r.reviewPurpose)+"</td><td>"+esc(r.status)+"</td><td>"+esc(r.createdAt)+"</td></tr>";});
 h+="</tbody></table><p><small>Review intake does not constitute approval, certification, deployment, or production authorization.</small></p></section>";
 t.innerHTML=h;
}
window.PacificEducationFinalReleaseAuthorizedReviewIntakeUI=Object.freeze({version:"1.0.0",render:render});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){render();});else render();
})(window,document);
