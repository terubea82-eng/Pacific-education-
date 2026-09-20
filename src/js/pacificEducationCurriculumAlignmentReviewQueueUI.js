/*
 * Pacific Education — Curriculum Alignment Review Queue UI
 * Version 1.0.0
 * PROTOTYPE ONLY.
 */
(function(window,document){
    "use strict";
    function esc(v){return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
    function render(targetId){
        var target=document.getElementById(targetId||"pacificEducationCurriculumAlignmentReviewQueue");
        if(!target)return;
        var q=window.PacificEducationCurriculumAlignmentReviewQueue;
        if(!q){target.innerHTML="<p>Review queue unavailable.</p>";return;}
        var s=q.summary(), rows=q.list();
        var html='<section><h2>Curriculum Alignment Review Queue</h2>'+
            '<p><strong>Total:</strong> '+s.total+' | <strong>Pending:</strong> '+s.pending+
            ' | <strong>Ready:</strong> '+s.ready+' | <strong>Blocked:</strong> '+s.blocked+'</p>'+
            '<div style="overflow:auto"><table><thead><tr><th>Indicator</th><th>Level</th><th>Subject</th><th>Term</th><th>Status</th><th>Next action</th><th>Traceable</th><th>Blockers</th></tr></thead><tbody>';
        rows.forEach(function(r){
            html+='<tr><td>'+esc(r.indicatorId)+'</td><td>'+esc(r.level)+'</td><td>'+esc(r.subjectId)+'</td><td>'+esc(r.term)+'</td>'+
                '<td>'+esc(r.status)+'</td><td>'+esc(r.nextAction)+'</td><td>'+(r.traceable?"Yes":"No")+'</td>'+
                '<td>'+esc(r.blockers.join(", ")||"None")+'</td></tr>';
        });
        html+='</tbody></table></div>'+
            '<p><small>Reviewer queue only. Production approval remains controlled and disabled by prototype safeguards.</small></p></section>';
        target.innerHTML=html;
    }
    window.PacificEducationCurriculumAlignmentReviewQueueUI=Object.freeze({version:"1.0.0",render:render});
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){render();});
    else render();
    ["pacificEducationCurriculumAlignmentImported","pacificEducationCurriculumAlignmentAutoLinked","pacificEducationCurriculumTraceabilityRefresh","pacificEducationCurriculumVerificationChanged"].forEach(function(e){document.addEventListener(e,render);});
})(window,document);
