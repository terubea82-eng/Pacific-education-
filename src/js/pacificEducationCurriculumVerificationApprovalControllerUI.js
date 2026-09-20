/*
 * Pacific Education — Curriculum Verification Approval Controller UI
 * Version 1.0.0
 * PROTOTYPE ONLY.
 */
(function(window,document){
    "use strict";
    function esc(v){return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}

    function render(targetId){
        var target=document.getElementById(targetId||"pacificEducationCurriculumVerificationApprovalController");
        if(!target)return;
        var controller=window.PacificEducationCurriculumVerificationApprovalController;
        if(!controller){target.innerHTML="<p>Verification approval controller unavailable.</p>";return;}
        var rows=controller.list();
        target.innerHTML='<section><h2>Curriculum Verification Approval Controller</h2>'+
            '<p><strong>Sequence:</strong> unverified → source-reviewed → curriculum-verified → owner-approved → production-approved</p>'+
            '<p><strong>Prototype rule:</strong> production-approved remains disabled.</p>'+
            '<div style="overflow:auto"><table><thead><tr><th>Indicator</th><th>Current</th><th>Next</th><th>Source</th><th>Evidence</th><th>Can Advance</th></tr></thead><tbody>'+
            (rows.length?rows.map(function(x){return '<tr><td>'+esc(x.indicatorId)+'</td><td>'+esc(x.currentStatus)+'</td><td>'+esc(x.nextStatus)+'</td><td>'+(x.mappingPresent?"Yes":"No")+'</td><td>'+(x.evidencePresent?"Yes":"No")+'</td><td>'+(x.canAdvance?"Yes":"No")+'</td></tr>';}).join(""):'<tr><td colspan="6">No curriculum indicators loaded.</td></tr>')+
            '</tbody></table></div>'+
            '<p><small>Advancement does not itself certify official curriculum authenticity. Production requires independent verification, authenticated reviewers and appropriate legal, privacy, safeguarding, security and pilot controls.</small></p></section>';
    }
    window.PacificEducationCurriculumVerificationApprovalControllerUI=Object.freeze({version:"1.0.0",render:render});
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){render();});
    else render();
})(window,document);
