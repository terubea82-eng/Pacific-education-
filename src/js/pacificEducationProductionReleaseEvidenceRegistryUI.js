/*
 * Pacific Education — Production Release Evidence Registry UI
 * Version 1.0.0
 * PROTOTYPE ONLY.
 */
(function(window,document){
"use strict";
function esc(v){return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function render(targetId){
var t=document.getElementById(targetId||"pacificEducationProductionReleaseEvidenceRegistry");if(!t)return;
var r=window.PacificEducationProductionReleaseEvidenceRegistry;
if(!r){t.innerHTML="<p>Release evidence registry unavailable.</p>";return;}
var x=r.evaluate(),rows=r.list();
var h='<section><h2>Production Release Evidence Registry</h2><p><strong>Verified checklist items:</strong> '+x.verified+' / '+x.required.length+'</p><div style="overflow:auto"><table><thead><tr><th>Checklist item</th><th>Evidence</th><th>Reviewer</th><th>Status</th></tr></thead><tbody>';
r.required.forEach(function(id){
var a=rows.filter(function(z){return z.itemId===id;}).slice(-1)[0];
h+="<tr><td>"+esc(id)+"</td><td>"+esc(a?a.evidenceReference:"")+"</td><td>"+esc(a?a.reviewerReference:"")+"</td><td>"+esc(a?a.status:"pending")+"</td></tr>";
});
h+='</tbody></table></div><p><small>Evidence references are prototype records and must be independently verified before production.</small></p></section>';
t.innerHTML=h;
}
window.PacificEducationProductionReleaseEvidenceRegistryUI=Object.freeze({version:"1.0.0",render:render});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){render();});else render();
document.addEventListener("pacificEducationProductionReleaseEvidenceChanged",function(){render();});
})(window,document);
