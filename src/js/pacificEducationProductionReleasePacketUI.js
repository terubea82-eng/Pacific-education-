/*
 * Pacific Education — Production Release Packet UI
 * Version 1.0.0
 * PROTOTYPE ONLY.
 */
(function(window,document){
"use strict";
function esc(v){return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function render(targetId){
var t=document.getElementById(targetId||"pacificEducationProductionReleasePacket");if(!t)return;
var p=window.PacificEducationProductionReleasePacket;
if(!p){t.innerHTML="<p>Production release packet unavailable.</p>";return;}
var x=p.build();
var h='<section><h2>Production Release Packet</h2><p><strong>Status:</strong> BLOCKED</p><p><strong>Production eligible:</strong> No</p><p><strong>Packet:</strong> '+esc(x.packetId)+'</p><button type="button" id="pacificEducationBuildReleasePacket">Refresh Release Packet</button><pre id="pacificEducationReleasePacketPreview"></pre><p><small>Read-only prototype packet. It does not authorize deployment or publication.</small></p></section>';
t.innerHTML=h;
var pre=document.getElementById("pacificEducationReleasePacketPreview");
if(pre)pre.textContent=p.exportJSON();
var b=document.getElementById("pacificEducationBuildReleasePacket");
if(b)b.addEventListener("click",function(){render(targetId);});
}
window.PacificEducationProductionReleasePacketUI=Object.freeze({version:"1.0.0",render:render});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){render();});else render();
["pacificEducationProductionGateAuditCreated","pacificEducationProductionRequirementChanged","pacificEducationExternalApprovalChanged"].forEach(function(e){document.addEventListener(e,function(){render();});});
})(window,document);
