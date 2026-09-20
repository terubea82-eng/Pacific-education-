/*
 * Pacific Education — Curriculum Owner Review Gate UI
 * Version 1.0.0
 * PROTOTYPE ONLY.
 */
(function(window,document){
    "use strict";
    function esc(v){return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
    function render(targetId){
        var target=document.getElementById(targetId||"pacificEducationCurriculumOwnerReviewGate");
        if(!target)return;
        var g=window.PacificEducationCurriculumOwnerReviewGate;
        if(!g){target.innerHTML="<p>Owner review gate unavailable.</p>";return;}
        var s=g.summary(), rows=g.list();
        var html='<section><h2>Curriculum Owner Review Gate</h2>'+
          '<p><strong>Total:</strong> '+s.total+' | <strong>Ready:</strong> '+s.ready+' | <strong>Blocked:</strong> '+s.blocked+'</p>'+
          '<div style="overflow:auto"><table><thead><tr><th>Indicator</th><th>Current status</th><th>Ready for owner review</th><th>Blockers</th></tr></thead><tbody>';
        rows.forEach(function(r){
            html+='<tr><td>'+esc(r.indicatorId)+'</td><td>'+esc(r.currentStatus)+'</td><td>'+(r.readyForOwnerReview?"Yes":"No")+'</td><td>'+esc(r.blockers.join(", ")||"None")+'</td></tr>';
        });
        html+='</tbody></table></div><p><small>This gate prepares review; it does not grant owner approval or production authorization.</small></p></section>';
        target.innerHTML=html;
    }
    window.PacificEducationCurriculumOwnerReviewGateUI=Object.freeze({version:"1.0.0",render:render});
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){render();});else render();
    ["pacificEducationCurriculumReviewDecisionRecorded","pacificEducationCurriculumReviewActionCreated"].forEach(function(e){document.addEventListener(e,function(){render();});});
})(window,document);
