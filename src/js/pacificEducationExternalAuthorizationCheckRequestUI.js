/*
 * Pacific Education — External Authorization Check Request UI
 * v1.0.0 — PROTOTYPE / FAIL-CLOSED
 */
(function(window,document){
"use strict";
function esc(v){return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function render(id){
var t=document.getElementById(id||"pacificEducationExternalAuthorizationCheckRequest");if(!t)return;
var g=window.PacificEducationExternalAuthorizationCheckRequest;if(!g)return;
var a=g.list(),h="<section><h2>External Authorization Check Request</h2><p>Structured request only. External authority must perform the actual authorization.</p><p><strong>Requests:</strong> "+a.length+" | <strong>Production approved:</strong> NO | <strong>Production eligible:</strong> NO</p><table><thead><tr><th>Packet</th><th>Authority</th><th>Status</th><th>Requested</th></tr></thead><tbody>";
a.slice().reverse().forEach(function(r){h+="<tr><td>"+esc(r.packetReference)+"</td><td>"+esc(r.authorityReference)+"</td><td>"+esc(r.status)+"</td><td>"+esc(r.requestedAt)+"</td></tr>";});
h+="</tbody></table><p><small>Submitting a request does not constitute approval, certification, security clearance, or production release.</small></p></section>";
t.innerHTML=h;
}
window.PacificEducationExternalAuthorizationCheckRequestUI=Object.freeze({version:"1.0.0",render:render});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){render();});else render();
})(window,document);
