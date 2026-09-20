/*
 * Pacific Education — Production Requirement Registry UI
 * Version 1.0.0
 * PROTOTYPE ONLY.
 */
(function(window,document){
"use strict";
function esc(v){return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function render(targetId){
var t=document.getElementById(targetId||"pacificEducationProductionRequirementRegistry"); if(!t)return;
var r=window.PacificEducationProductionRequirementRegistry;
if(!r){t.innerHTML="<p>Production requirement registry unavailable.</p>";return;}
var rows=r.list(),s=r.summary();
var h='<section><h2>Production Requirement Registry</h2><p><strong>Verified:</strong> '+s.verified+' / '+s.totalRequired+' &nbsp; <strong>Pending:</strong> '+s.pending+'</p><div style="overflow:auto"><table><thead><tr><th>Requirement</th><th>Type</th><th>Status</th></tr></thead><tbody>';
rows.forEach(function(x){h+="<tr><td>"+esc(x.label)+"</td><td>"+esc(x.type)+"</td><td>"+esc(x.status)+"</td></tr>";});
h+='</tbody></table></div><p><small>Prototype checklist only. A recorded status is not professional certification or production authorization.</small></p></section>';
t.innerHTML=h;
}
window.PacificEducationProductionRequirementRegistryUI=Object.freeze({version:"1.0.0",render:render});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){render();});else render();
document.addEventListener("pacificEducationProductionRequirementChanged",function(){render();});
})(window,document);
