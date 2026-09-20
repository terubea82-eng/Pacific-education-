/*
 * Pacific Education — Curriculum Master Alignment Workflow Controller UI
 * Version 1.0.0
 * PROTOTYPE ONLY.
 */
(function(window,document){
    "use strict";
    function esc(v){return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
    function render(targetId){
        var target=document.getElementById(targetId||"pacificEducationCurriculumMasterAlignmentWorkflowController");
        if(!target)return;
        var c=window.PacificEducationCurriculumMasterAlignmentWorkflowController;
        if(!c){target.innerHTML="<p>Master alignment workflow controller unavailable.</p>";return;}
        var s=c.summary(), rows=window.PacificEducationCurriculumAlignmentImportWorkspace&&window.PacificEducationCurriculumAlignmentImportWorkspace.list?window.PacificEducationCurriculumAlignmentImportWorkspace.list():[];
        target.innerHTML='<section><h2>Curriculum Master Alignment Workflow</h2>'+
          '<p><strong>Total:</strong> '+s.total+' | Imported: '+(s.states["imported-unverified"]||0)+' | Source reviewed: '+(s.states["source-reviewed"]||0)+' | Curriculum verified: '+(s.states["curriculum-verified"]||0)+' | Owner approved: '+(s.states["owner-approved"]||0)+'</p>'+
          '<div style="overflow:auto"><table><thead><tr><th>Indicator</th><th>Current</th><th>Next action</th><th>Traceable</th></tr></thead><tbody>'+
          (rows.length?rows.map(function(x){var e=c.evaluate(x.indicatorId);return '<tr><td>'+esc(x.indicatorId)+'</td><td>'+esc(x.importedStatus)+'</td><td>'+esc(e.nextAction)+'</td><td>'+(e.traceable?"Yes":"No")+'</td></tr>';}).join(""):'<tr><td colspan="4">No alignment records loaded.</td></tr>')+
          '</tbody></table></div>'+
          '<p><small>Prototype controller. Production approval remains disabled and requires independent curriculum, security, privacy, safeguarding and governance controls.</small></p></section>';
    }
    window.PacificEducationCurriculumMasterAlignmentWorkflowControllerUI=Object.freeze({version:"1.0.0",render:render});
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){render();});
    else render();
    ["pacificEducationCurriculumAlignmentImported","pacificEducationCurriculumAlignmentAutoLinked","pacificEducationCurriculumTraceabilityRefresh"].forEach(function(e){document.addEventListener(e,render);});
})(window,document);
