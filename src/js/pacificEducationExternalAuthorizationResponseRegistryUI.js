/*
 * Pacific Education — External Authorization Response Registry UI
 * v1.0.0 — PROTOTYPE / FAIL-CLOSED
 */
(function(window,document){
"use strict";
function esc(v){return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function render(id){
var t=document.getElementById(id||"pacificEducationExternalAuthorizationResponseRegistry");if(!t)return;
var g=window.PacificEducationExternalAuthorizationResponseRegistry;if(!g)return;
var x=g.evaluate(),h="<section><h2>External Authorization Response Registry</h2><p>Records responses supplied by an external authority; it cannot activate production.</p><p><strong>Responses:</strong> "+x.count+" | <strong>Approved responses recorded:</strong> "+x.approvedResponses+"</p><p><strong>Production approved:</strong> NO | <strong>Production eligible:</strong> NO</p><table><thead><tr><th>Request</th><th>Authority</th><th>Response</th><th>Evidence</th><th>Date</th></tr></thead><tbody>";
g.list().slice().reverse().forEach(function(r){h+="<tr><td>"+esc(r.requestId)+"</td><td>"+esc(r.authorityReference)+"</td><td>"+esc(r.responseStatus)+"</td><td>"+esc(r.evidenceReference)+"</td><td>"+esc(r.recordedAt)+"</td></tr>";});
h+="</tbody></table><p><small>An external response must still be validated against the full production release controls. This registry does not certify or authorize deployment.</small></p></section>";
t.innerHTML=h;
}
window.PacificEducationExternalAuthorizationResponseRegistryUI=Object.freeze({version:"1.0.0",render:render});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){render();});else render();
})(window,document);
