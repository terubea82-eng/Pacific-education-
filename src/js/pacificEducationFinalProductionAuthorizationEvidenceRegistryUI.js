(function(window,document){
"use strict";
function esc(v){return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function render(id){
var t=document.getElementById(id||"pacificEducationFinalProductionAuthorizationEvidenceRegistry");if(!t)return;
var g=window.PacificEducationFinalProductionAuthorizationEvidenceRegistry;if(!g)return;
var x=g.evaluate(),h="<section><h2>Final Production Authorization Evidence</h2><p>Records external authorization evidence only. It cannot grant production authorization.</p><p><strong>Records:</strong> "+x.count+" | <strong>Verified:</strong> "+x.verified+"</p><p><strong>Production approved:</strong> NO | <strong>Production eligible:</strong> NO</p><table><thead><tr><th>Evidence</th><th>Authority</th><th>Type</th><th>Status</th><th>Date</th></tr></thead><tbody>";
g.list().slice().reverse().forEach(function(r){h+="<tr><td>"+esc(r.evidenceReference)+"</td><td>"+esc(r.authorityReference)+"</td><td>"+esc(r.authorizationType)+"</td><td>"+esc(r.status)+"</td><td>"+esc(r.recordedAt)+"</td></tr>";});
h+="</tbody></table></section>";t.innerHTML=h;
}
window.PacificEducationFinalProductionAuthorizationEvidenceRegistryUI=Object.freeze({version:"1.0.0",render:render});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){render();});else render();
})(window,document);
