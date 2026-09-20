/*
 * Pacific Education — External Review Closure Gate UI
 * Version 1.0.0
 * PROTOTYPE ONLY / FAIL-CLOSED.
 */
(function(window,document){
"use strict";
function esc(v){return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function render(targetId){
var t=document.getElementById(targetId||"pacificEducationExternalReviewClosureGate");if(!t)return;
var g=window.PacificEducationExternalReviewClosureGate;
if(!g){t.innerHTML="<p>External review closure gate unavailable.</p>";return;}
var x=g.evaluate(),h="<section><h2>External Review Closure Gate</h2>";
h+="<p><strong>Status:</strong> "+esc(x.status)+"</p>";
h+="<p><strong>Review closed:</strong> "+(x.reviewClosed?"YES":"NO")+" | <strong>Completion records:</strong> "+x.completionRecords+"</p>";
h+="<p><strong>Production approved:</strong> NO | <strong>Production eligible:</strong> NO</p><h3>Blockers</h3><ul>";
if(!x.blockers.length)h+="<li>None detected by this prototype gate.</li>";
x.blockers.forEach(function(b){h+="<li>"+esc(b)+"</li>";});
h+='</ul><button type="button" id="pacificRefreshExternalReviewClosureGate">Refresh Closure Gate</button>';
h+="<p><small>READY-FOR-FINAL-RELEASE-CONTROL only returns the package to final controls. It is not production authorization.</small></p></section>";
t.innerHTML=h;
document.getElementById("pacificRefreshExternalReviewClosureGate").onclick=function(){render(targetId);};
}
window.PacificEducationExternalReviewClosureGateUI=Object.freeze({version:"1.0.0",render:render});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){render();});else render();
document.addEventListener("pacificEducationExternalReviewCompletionChanged",function(){render();});
document.addEventListener("pacificEducationExternalSpecialistEvidenceChanged",function(){render();});
})(window,document);
