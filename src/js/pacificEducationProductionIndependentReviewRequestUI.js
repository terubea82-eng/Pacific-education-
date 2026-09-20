/*
 * Pacific Education — Independent Production Review Request UI
 * Version 1.0.0
 * PROTOTYPE ONLY.
 */
(function(window,document){
"use strict";
function esc(v){return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function render(targetId){
var t=document.getElementById(targetId||"pacificEducationProductionIndependentReviewRequest");if(!t)return;
var r=window.PacificEducationProductionIndependentReviewRequest;
if(!r){t.innerHTML="<p>Independent review request module unavailable.</p>";return;}
var s=r.summary(),rows=r.list(),h='<section><h2>Independent Production Review Requests</h2><p><strong>Pending:</strong> '+s.pending+' | <strong>Completed:</strong> '+s.completed+'</p>';
h+='<div><input id="pirScope" placeholder="Review scope"><input id="pirRequester" placeholder="Requester reference"><input id="pirIssue" placeholder="Issue reference (optional)"><button type="button" id="pirCreate">Request Independent Review</button></div>';
h+='<div style="overflow:auto"><table><thead><tr><th>ID</th><th>Scope</th><th>Requester</th><th>Issue</th><th>Status</th></tr></thead><tbody>';
rows.slice().reverse().forEach(function(x){h+="<tr><td>"+esc(x.id)+"</td><td>"+esc(x.scope)+"</td><td>"+esc(x.requesterReference)+"</td><td>"+esc(x.issueReference)+"</td><td>"+esc(x.status)+"</td></tr>";});
h+='</tbody></table></div><p><small>Prototype request only. Independent review is not production authorization.</small></p></section>';
t.innerHTML=h;
var b=document.getElementById("pirCreate");
if(b)b.addEventListener("click",function(){
var scope=document.getElementById("pirScope").value.trim(),requester=document.getElementById("pirRequester").value.trim();
if(!scope||!requester)return;
r.request({scope:scope,requesterReference:requester,issueReference:document.getElementById("pirIssue").value.trim()});
render(targetId);
});
}
window.PacificEducationProductionIndependentReviewRequestUI=Object.freeze({version:"1.0.0",render:render});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){render();});else render();
document.addEventListener("pacificEducationIndependentProductionReviewChanged",function(){render();});
})(window,document);
