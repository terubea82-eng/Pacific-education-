/*
 * Pacific Education — Production Release Issue Register UI
 * Version 1.0.0
 * PROTOTYPE ONLY.
 */
(function(window,document){
"use strict";
function esc(v){return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function render(targetId){
var t=document.getElementById(targetId||"pacificEducationProductionReleaseIssueRegister");if(!t)return;
var r=window.PacificEducationProductionReleaseIssueRegister;
if(!r){t.innerHTML="<p>Release issue register unavailable.</p>";return;}
var s=r.summary(),rows=r.list(),h='<section><h2>Production Release Issue Register</h2><p><strong>Open issues:</strong> '+s.open+' | <strong>Critical open:</strong> '+s.critical+'</p>';
h+='<div><input id="pacificReleaseIssueTitle" placeholder="Issue title"><input id="pacificReleaseIssueCategory" placeholder="Category"><select id="pacificReleaseIssueSeverity">';
r.severities.forEach(function(x){h+='<option value="'+x+'">'+x+"</option>";});
h+='</select><button type="button" id="pacificCreateReleaseIssue">Record Issue</button></div>';
h+='<div style="overflow:auto"><table><thead><tr><th>ID</th><th>Issue</th><th>Category</th><th>Severity</th><th>Status</th></tr></thead><tbody>';
rows.slice().reverse().forEach(function(x){h+="<tr><td>"+esc(x.id)+"</td><td>"+esc(x.title)+"</td><td>"+esc(x.category)+"</td><td>"+esc(x.severity)+"</td><td>"+esc(x.status)+"</td></tr>";});
h+="</tbody></table></div><p><small>Prototype register only. Recording or resolving an issue cannot authorize production.</small></p></section>";
t.innerHTML=h;
var b=document.getElementById("pacificCreateReleaseIssue");
if(b)b.addEventListener("click",function(){
var title=document.getElementById("pacificReleaseIssueTitle").value.trim(),category=document.getElementById("pacificReleaseIssueCategory").value.trim();
if(!title||!category)return;
r.create({title:title,category:category,severity:document.getElementById("pacificReleaseIssueSeverity").value});
render(targetId);
});
}
window.PacificEducationProductionReleaseIssueRegisterUI=Object.freeze({version:"1.0.0",render:render});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){render();});else render();
document.addEventListener("pacificEducationProductionReleaseIssueChanged",function(){render();});
})(window,document);
