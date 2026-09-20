/*
 * Pacific Education — External Authorization Response Validation Gate UI
 * v1.0.0 — PROTOTYPE / FAIL-CLOSED
 */
(function(window,document){
"use strict";
function esc(v){return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function render(id){
var t=document.getElementById(id||"pacificEducationExternalAuthorizationResponseValidationGate");if(!t)return;
var g=window.PacificEducationExternalAuthorizationResponseValidationGate;if(!g)return;
var x=g.evaluate(),h="<section><h2>External Authorization Response Validation Gate</h2>";
h+="<p><strong>Status:</strong> "+esc(x.status)+"</p>";
h+="<p><strong>Latest response:</strong> "+esc(x.latestResponseStatus||"NONE")+"</p>";
h+="<p><strong>Production approved:</strong> NO | <strong>Production eligible:</strong> NO</p>";
h+="<h3>Validation Blockers</h3><ul>";
if(!x.blockers.length)h+="<li>None detected by this prototype gate.</li>";
x.blockers.forEach(function(b){h+="<li>"+esc(b)+"</li>";});
h+="</ul><p><small>This gate validates recorded evidence only. Final authorization, certification, and release remain outside the browser prototype.</small></p></section>";
t.innerHTML=h;
}
window.PacificEducationExternalAuthorizationResponseValidationGateUI=Object.freeze({version:"1.0.0",render:render});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){render();});else render();
})(window,document);
