/*
 * Pacific Education — Curriculum Alignment Review Decision Log UI
 * Version 1.0.0
 * PROTOTYPE ONLY.
 */
(function(window,document){
    "use strict";
    function esc(v){return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
    function render(targetId){
        var target=document.getElementById(targetId||"pacificEducationCurriculumAlignmentReviewDecisionLog");
        if(!target)return;
        var c=window.PacificEducationCurriculumAlignmentReviewDecisionController;
        if(!c){target.innerHTML="<p>Review decision controller unavailable.</p>";return;}
        var rows=c.list().slice().reverse();
        var html='<section><h2>Curriculum Review Decision Log</h2>'+
            '<p><strong>Recorded decisions:</strong> '+rows.length+'</p>'+
            '<div style="overflow:auto"><table><thead><tr><th>Decision ID</th><th>Indicator</th><th>Current status</th><th>Decision</th><th>Notes</th><th>Recorded</th></tr></thead><tbody>';
        rows.forEach(function(r){
            html+='<tr><td>'+esc(r.id)+'</td><td>'+esc(r.indicatorId)+'</td><td>'+esc(r.currentStatus)+'</td>'+
                '<td>'+esc(r.decision)+'</td><td>'+esc(r.notes)+'</td><td>'+esc(r.createdAt)+'</td></tr>';
        });
        html+='</tbody></table></div><p><small>Prototype audit view only. This log does not certify curriculum, alter official source status, or authorize production.</small></p></section>';
        target.innerHTML=html;
    }
    window.PacificEducationCurriculumAlignmentReviewDecisionLogUI=Object.freeze({version:"1.0.0",render:render});
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){render();});else render();
    document.addEventListener("pacificEducationCurriculumReviewDecisionRecorded",function(){render();});
})(window,document);
