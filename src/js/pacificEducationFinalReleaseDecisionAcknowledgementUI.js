/*
 * Pacific Education — Final Release Decision Acknowledgement UI
 * v1.0.0 — PROTOTYPE / FAIL-CLOSED
 */
(function(window,document){
"use strict";
function esc(v){return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function render(id){
var t=document.getElementById(id||"pacificEducationFinalReleaseDecisionAcknowledgement");if(!t)return;
var g=window.PacificEducationFinalReleaseDecisionAcknowledgement;if(!g)return;
var x=g.evaluate(),h="<section><h2>Final Release Decision Acknowledgement</h2><p>Records an external/human decision acknowledgement only.</p><p><strong>Records:</strong> "+x.count+" | <strong>Acknowledged:</strong> "+x.acknowledged+"</p><p><strong>Production approved:</strong> NO | <strong>Production eligible:</strong> NO</p><table><thead><tr><th>Package</th><th>Decision</th><th>Authority</th><th>Status</th><th>Date</th></tr></thead><tbody>";
g.list().slice().reverse().forEach(function(r){h+="<tr><td>"+esc(r.packageId)+"</td><td>"+esc(r.decisionReference)+"</td><td>"+esc(r.authorityReference)+"</td><td>"+esc(r.status)+"</td><td>"+esc(r.recordedAt)+"</td></tr>";});
h+="</tbody></table><p><small>Acknowledgement does not constitute deployment, certification, security clearance, or production authorization.</small></p></section>";t.innerHTML=h;
}
window.PacificEducationFinalReleaseDecisionAcknowledgementUI=Object.freeze({version:"1.0.0",render:render});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){render();});else render();
})(window,document);
