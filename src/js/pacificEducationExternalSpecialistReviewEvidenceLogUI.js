/*
 * Pacific Education — External Specialist Review Evidence Log UI
 * Version 1.0.0
 * PROTOTYPE ONLY.
 */
(function(window,document){
"use strict";
function esc(v){return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function render(targetId){
var t=document.getElementById(targetId||"pacificEducationExternalSpecialistReviewEvidenceLog");if(!t)return;
var r=window.PacificEducationExternalSpecialistReviewEvidenceRegistry;
if(!r){t.innerHTML="<p>Evidence log unavailable.</p>";return;}
var rows=r.list(),h="<section><h2>External Specialist Review Evidence Log</h2><div style="overflow:auto"><table><thead><tr><th>ID</th><th>Date</th><th>Request</th><th>Reviewer</th><th>Finding</th><th>Recommendation</th></tr></thead><tbody>";
rows.slice().reverse().forEach(function(x){h+="<tr><td>"+esc(x.id)+"</td><td>"+esc(x.submittedAt)+"</td><td>"+esc(x.reviewRequestId)+"</td><td>"+esc(x.reviewerReference)+"</td><td>"+esc(x.finding)+"</td><td>"+esc(x.recommendation)+"</td></tr>";});
h+="</tbody></table></div><p><small>Prototype record only. Final authorization remains outside this browser module.</small></p></section>";
t.innerHTML=h;
}
window.PacificEducationExternalSpecialistReviewEvidenceLogUI=Object.freeze({version:"1.0.0",render:render});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){render();});else render();
document.addEventListener("pacificEducationExternalSpecialistEvidenceChanged",function(){render();});
})(window,document);
