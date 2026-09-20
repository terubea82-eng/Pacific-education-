/*
 * Pacific Education — Curriculum Master Alignment Workspace UI
 * Version 1.0.0
 * PROTOTYPE ONLY.
 */
(function(window,document){
    "use strict";
    function esc(v){return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
    function render(targetId){
        var target=document.getElementById(targetId||"pacificEducationCurriculumMasterAlignmentWorkspace");
        if(!target)return;
        var ws=window.PacificEducationCurriculumMasterAlignmentWorkspace;
        if(!ws){target.innerHTML="<p>Master alignment workspace unavailable.</p>";return;}
        var s=ws.summary(), rows=ws.list();
        target.innerHTML='<section><h2>Curriculum Master Alignment Workspace</h2>'+
          '<p><strong>Total:</strong> '+s.total+' | <strong>Valid:</strong> '+s.valid+' | <strong>Invalid:</strong> '+s.invalid+' | <strong>Traceable:</strong> '+s.traceable+'</p>'+
          '<p>Central view for Class 1 → Form 7 alignment records. Imported curriculum remains subject to source verification.</p>'+
          '<div style="overflow:auto"><table><thead><tr><th>Indicator</th><th>Level</th><th>Subject</th><th>Term</th><th>Status</th><th>Source</th><th>Evidence</th><th>Traceable</th></tr></thead><tbody>'+
          (rows.length?rows.map(function(x){
              var t=window.PacificEducationCurriculumEvidenceTraceability&&window.PacificEducationCurriculumEvidenceTraceability.trace?window.PacificEducationCurriculumEvidenceTraceability.trace(x.indicatorId):null;
              return '<tr><td>'+esc(x.indicatorId)+'</td><td>'+esc(x.level)+'</td><td>'+esc(x.subjectId)+'</td><td>'+esc(x.term)+'</td><td>'+esc(x.status)+'</td><td>'+(t&&t.sourceMapped?"Yes":"No")+'</td><td>'+(t&&t.evidencePresent?"Yes":"No")+'</td><td>'+(t&&t.traceable?"Yes":"No")+'</td></tr>';
          }).join(""):'<tr><td colspan="8">No alignment records loaded.</td></tr>')+
          '</tbody></table></div>'+
          '<p><small>Prototype management view. Production curriculum publication requires official-source verification, owner approval, testing and appropriate governance controls.</small></p></section>';
    }
    window.PacificEducationCurriculumMasterAlignmentWorkspaceUI=Object.freeze({version:"1.0.0",render:render});
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){render();});
    else render();
    ["pacificEducationCurriculumAlignmentImported","pacificEducationCurriculumAlignmentAutoLinked","pacificEducationCurriculumTraceabilityRefresh"].forEach(function(e){document.addEventListener(e,render);});
})(window,document);
