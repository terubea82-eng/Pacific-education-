/*
 * Pacific Education — Owner Approval Decision Log UI
 * Version 1.0.0
 * PROTOTYPE ONLY.
 */
(function(window,document){
  "use strict";
  function esc(v){return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
  function render(targetId){
    var target=document.getElementById(targetId||"pacificEducationCurriculumOwnerApprovalDecisionLog");
    if(!target)return;
    var c=window.PacificEducationCurriculumOwnerApprovalDecisionController;
    if(!c){target.innerHTML="<p>Owner approval decision controller unavailable.</p>";return;}
    var rows=c.list?c.list():[];
    var html="<section><h2>Owner Approval Decision Log</h2><p><small>Prototype record only. This log does not grant production authority.</small></p>";
    if(!rows.length){html+="<p>No owner approval decisions recorded.</p></section>";target.innerHTML=html;return;}
    html+='<div style="overflow:auto"><table><thead><tr><th>Request</th><th>Decision</th><th>Reviewer</th><th>Date</th><th>Notes</th></tr></thead><tbody>';
    rows.slice().reverse().forEach(function(r){
      html+="<tr><td>"+esc(r.requestId)+"</td><td>"+esc(r.decision)+"</td><td>"+esc(r.decidedBy||r.ownerReference||"")+"</td><td>"+esc(r.decidedAt||r.date||"")+"</td><td>"+esc(r.notes||"")+"</td></tr>";
    });
    html+="</tbody></table></div></section>";
    target.innerHTML=html;
  }
  window.PacificEducationCurriculumOwnerApprovalDecisionLogUI=Object.freeze({version:"1.0.0",render:render});
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){render();});else render();
  document.addEventListener("pacificEducationCurriculumOwnerApprovalDecisionRecorded",function(){render();});
})(window,document);
