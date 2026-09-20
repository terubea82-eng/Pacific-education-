/*
 * Pacific Education — Final Authorization Reconciliation Gate UI
 * v1.0.0 — PROTOTYPE / FAIL-CLOSED
 */
(function(window,document){
"use strict";
function esc(v){return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function render(id){
var t=document.getElementById(id||"pacificEducationFinalAuthorizationReconciliationGate");if(!t)return;
var g=window.PacificEducationFinalAuthorizationReconciliationGate;if(!g)return;
var x=g.evaluate(),h="<section><h2>Final Authorization Reconciliation Gate</h2>";
h+="<p><strong>Status:</strong> "+esc(x.status)+"</p>";
h+="<p><strong>Authorization evidence:</strong> "+x.authorizationEvidenceCount+" | <strong>Verified:</strong> "+x.verifiedAuthorizationEvidence+"</p>";
h+="<p><strong>External review closed:</strong> "+(x.externalReviewClosed?"YES":"NO")+"</p>";
h+="<p><strong>Production approved:</strong> NO | <strong>Production eligible:</strong> NO</p>";
h+="<h3>Blockers</h3><ul>";
if(!x.blockers.length)h+="<li>None detected by this prototype gate.</li>";
x.blockers.forEach(function(b){h+="<li>"+esc(b)+"</li>";});
h+="</ul><p><small>This gate only determines whether an external authorization check may proceed. It cannot approve, certify, or publish the system.</small></p></section>";
t.innerHTML=h;
}
window.PacificEducationFinalAuthorizationReconciliationGateUI=Object.freeze({version:"1.0.0",render:render});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){render();});else render();
document.addEventListener("pacificEducationExternalReviewCompletionChanged",function(){render();});
})(window,document);
