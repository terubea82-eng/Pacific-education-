/*
 * Pacific Education — Production Gate Audit UI
 * Version 1.0.0
 * PROTOTYPE ONLY.
 */
(function(window,document){
"use strict";
function esc(v){return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function render(targetId){
var t=document.getElementById(targetId||"pacificEducationProductionGateAudit");if(!t)return;
var a=window.PacificEducationProductionGateAudit;
if(!a){t.innerHTML="<p>Production gate audit unavailable.</p>";return;}
var latest=a.latest(),rows=a.list();
var h='<section><h2>Production Gate Audit</h2><button type="button" id="pacificEducationCreateGateAudit">Create Readiness Snapshot</button>';
if(latest)h+='<p><strong>Latest:</strong> '+esc(latest.createdAt)+' — <strong>Status:</strong> '+esc(latest.status)+'</p><p><strong>Production eligible:</strong> No</p>';
h+='<p><strong>Snapshots:</strong> '+rows.length+'</p><p><small>Snapshots are prototype audit records and cannot constitute approval or certification.</small></p></section>';
t.innerHTML=h;
var b=document.getElementById("pacificEducationCreateGateAudit");
if(b)b.addEventListener("click",function(){a.createSnapshot();render(targetId);});
}
window.PacificEducationProductionGateAuditUI=Object.freeze({version:"1.0.0",render:render});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){render();});else render();
document.addEventListener("pacificEducationProductionGateAuditCreated",function(){render();});
})(window,document);
