/*
 * Pacific Education — External Specialist Review Completion Log UI
 * Version 1.0.0 / PROTOTYPE ONLY.
 */
(function(window,document){
"use strict";
function esc(v){return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function render(targetId){
var t=document.getElementById(targetId||"pacificEducationExternalSpecialistReviewCompletionLog");if(!t)return;
var r=window.PacificEducationExternalSpecialistReviewCompletionRecord;
if(!r){t.innerHTML="<p>Completion log unavailable.</p>";return;}
var h="<section><h2>External Specialist Review Completion Log</h2><div style="overflow:auto"><table><thead><tr><th>ID</th><th>Date</th><th>Request</th><th>Reviewer</th><th>Outcome</th><th>Findings</th></tr></thead><tbody>";
r.list().slice().reverse().forEach(function(x){h+="<tr><td>"+esc(x.id)+"</td><td>"+esc(x.completedAt)+"</td><td>"+esc(x.reviewRequestId)+"</td><td>"+esc(x.reviewerReference)+"</td><td>"+esc(x.outcome)+"</td><td>"+esc(x.findingsReference)+"</td></tr>";});
h+="</tbody></table></div><p><small>Recorded completion does not authorize production.</small></p></section>";
t.innerHTML=h;
}
window.PacificEducationExternalSpecialistReviewCompletionLogUI=Object.freeze({version:"1.0.0",render:render});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){render();});else render();
document.addEventListener("pacificEducationExternalReviewCompletionChanged",function(){render();});
})(window,document);
