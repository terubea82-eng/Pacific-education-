/*
 * Pacific Education — External Approval Registry UI
 * Version 1.0.0
 * PROTOTYPE ONLY.
 */
(function(window,document){
"use strict";
function esc(v){return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function render(targetId){
var t=document.getElementById(targetId||"pacificEducationExternalApprovalRegistry");if(!t)return;
var r=window.PacificEducationExternalApprovalRegistry;
if(!r){t.innerHTML="<p>External approval registry unavailable.</p>";return;}
var s=r.summary(),rows=r.list();
var h='<section><h2>External Approval Registry</h2><p><strong>Verified references:</strong> '+s.verified+' &nbsp; <strong>Pending:</strong> '+s.pending+'</p>';
if(!rows.length){h+="<p>No external approvals recorded.</p>";}
else{h+='<div style="overflow:auto"><table><thead><tr><th>Requirement</th><th>Type</th><th>Status</th><th>Reviewer</th><th>Evidence</th></tr></thead><tbody>';
rows.slice().reverse().forEach(function(x){h+="<tr><td>"+esc(x.requirementId)+"</td><td>"+esc(x.approvalType)+"</td><td>"+esc(x.status)+"</td><td>"+esc(x.reviewerReference)+"</td><td>"+esc(x.evidenceReference)+"</td></tr>";});
h+="</tbody></table></div>";}
h+='<p><small>Recording a reference here does not itself certify compliance or authorize production.</small></p></section>';t.innerHTML=h;
}
window.PacificEducationExternalApprovalRegistryUI=Object.freeze({version:"1.0.0",render:render});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){render();});else render();
document.addEventListener("pacificEducationExternalApprovalChanged",function(){render();});
})(window,document);
