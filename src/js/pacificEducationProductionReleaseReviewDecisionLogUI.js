/*
 * Pacific Education — Production Release Review Decision Log UI
 * Version 1.0.0
 * PROTOTYPE ONLY.
 */
(function(window,document){
"use strict";
function esc(v){return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function render(targetId){
var t=document.getElementById(targetId||"pacificEducationProductionReleaseReviewDecisionLog");if(!t)return;
var c=window.PacificEducationProductionReleaseReviewDecision;
if(!c){t.innerHTML="<p>Decision log unavailable.</p>";return;}
var rows=c.list(),h='<section><h2>Production Release Review Decision Log</h2>';
if(!rows.length)h+="<p>No review decisions recorded.</p>";
else{h+='<div style="overflow:auto"><table><thead><tr><th>Date</th><th>Decision</th><th>Reviewer</th><th>Notes</th></tr></thead><tbody>';
rows.slice().reverse().forEach(function(x){h+="<tr><td>"+esc(x.recordedAt)+"</td><td>"+esc(x.decision)+"</td><td>"+esc(x.reviewerReference)+"</td><td>"+esc(x.notes)+"</td></tr>";});
h+="</tbody></table></div>";}
h+='<p><small>Prototype audit log. Production authorization remains external and fail-closed.</small></p></section>';t.innerHTML=h;
}
window.PacificEducationProductionReleaseReviewDecisionLogUI=Object.freeze({version:"1.0.0",render:render});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){render();});else render();
document.addEventListener("pacificEducationProductionReleaseReviewDecisionRecorded",function(){render();});
})(window,document);
