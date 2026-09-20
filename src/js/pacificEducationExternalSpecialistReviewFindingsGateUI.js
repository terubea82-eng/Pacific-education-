/*
 * Pacific Education — External Specialist Review Findings Gate UI
 * Version 1.0.1
 * PROTOTYPE ONLY / FAIL-CLOSED.
 */
(function(window,document){
"use strict";
function esc(v){return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function render(targetId){
var t=document.getElementById(targetId||"pacificEducationExternalSpecialistReviewFindingsGate");if(!t)return;
var g=window.PacificEducationExternalSpecialistReviewFindingsGate;
if(!g){t.innerHTML="<p>Specialist findings gate unavailable.</p>";return;}
var x=g.evaluate(),h="<section><h2>External Specialist Review Findings Gate</h2>";
h+="<p><strong>Status:</strong> "+esc(x.status)+"</p>";
h+="<p><strong>Review evidence complete:</strong> "+(x.reviewEvidenceComplete?"YES":"NO")+"</p>";
h+="<p><strong>Requests:</strong> "+x.requests+" | <strong>Evidence:</strong> "+x.evidence+" | <strong>Corrections:</strong> "+x.correctionsRequired+"</p>";
h+="<h3>Blockers</h3><ul>";
if(!x.blockers.length)h+="<li>None detected by this prototype gate.</li>";
x.blockers.forEach(function(b){h+="<li>"+esc(b)+"</li>";});
h+='</ul><button type="button" id="pacificRefreshSpecialistFindingsGate">Refresh Findings Gate</button>';
h+="<p><small>Evidence completeness does not equal production approval. External authorization remains required.</small></p></section>";
t.innerHTML=h;
document.getElementById("pacificRefreshSpecialistFindingsGate").onclick=function(){render(targetId);};
}
window.PacificEducationExternalSpecialistReviewFindingsGateUI=Object.freeze({version:"1.0.1",render:render});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){render();});else render();
document.addEventListener("pacificEducationExternalSpecialistEvidenceChanged",function(){render();});
document.addEventListener("pacificEducationIndependentProductionReviewChanged",function(){render();});
})(window,document);
