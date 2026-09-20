/*
 * Pacific Education — Independent Production Review Log UI
 * Version 1.0.0
 * PROTOTYPE ONLY.
 */
(function(window,document){
"use strict";
function esc(v){return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function render(targetId){
var t=document.getElementById(targetId||"pacificEducationProductionIndependentReviewLog");if(!t)return;
var r=window.PacificEducationProductionIndependentReviewRequest;
if(!r){t.innerHTML="<p>Independent review log unavailable.</p>";return;}
var rows=r.list(),h="<section><h2>Independent Review Log</h2><div style="overflow:auto"><table><thead><tr><th>ID</th><th>Requested</th><th>Status</th><th>Reviewer</th><th>Notes</th></tr></thead><tbody>";
rows.slice().reverse().forEach(function(x){h+="<tr><td>"+esc(x.id)+"</td><td>"+esc(x.requestedAt)+"</td><td>"+esc(x.status)+"</td><td>"+esc(x.reviewerReference)+"</td><td>"+esc(x.notes)+"</td></tr>";});
h+="</tbody></table></div><p><small>Completion of a review does not itself authorize production.</small></p></section>";
t.innerHTML=h;
}
window.PacificEducationProductionIndependentReviewLogUI=Object.freeze({version:"1.0.0",render:render});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){render();});else render();
document.addEventListener("pacificEducationIndependentProductionReviewChanged",function(){render();});
})(window,document);
