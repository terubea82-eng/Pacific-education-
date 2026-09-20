/*
 * Pacific Education — Final Release Decision Package UI
 * v1.0.0 — PROTOTYPE / FAIL-CLOSED
 */
(function(window,document){
"use strict";
function esc(v){return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function render(id){
var t=document.getElementById(id||"pacificEducationFinalReleaseDecisionPackage");if(!t)return;
var g=window.PacificEducationFinalReleaseDecisionPackage;if(!g)return;
var p=g.build(),h="<section><h2>Final Release Decision Package</h2>";
h+="<p><strong>Decision:</strong> "+esc(p.decision)+"</p>";
h+="<p><strong>Validation:</strong> "+esc(p.validationStatus)+" | <strong>Reconciliation:</strong> "+esc(p.reconciliationStatus)+"</p>";
h+="<p><strong>Authorization evidence:</strong> "+p.authorizationEvidence+" | <strong>Handoff:</strong> "+esc(p.handoffStatus)+"</p>";
h+="<p><strong>Production approved:</strong> NO | <strong>Production eligible:</strong> NO</p>";
h+="<h3>Blockers</h3><ul>";
if(!p.blockers.length)h+="<li>None reported by the validation layer.</li>";
p.blockers.forEach(function(b){h+="<li>"+esc(b)+"</li>";});
h+='</ul><button type="button" id="pacificRefreshFinalReleaseDecisionPackage">Refresh Package</button>';
h+="<p><small>Final release decisions must be made by the authorized human/external authority using verified evidence and applicable legal, security, privacy, safeguarding, accessibility, infrastructure, testing, and payment controls.</small></p></section>";
t.innerHTML=h;
document.getElementById("pacificRefreshFinalReleaseDecisionPackage").onclick=function(){render(id);};
}
window.PacificEducationFinalReleaseDecisionPackageUI=Object.freeze({version:"1.0.0",render:render});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){render();});else render();
})(window,document);
