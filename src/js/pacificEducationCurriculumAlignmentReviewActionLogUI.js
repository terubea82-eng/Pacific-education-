/*
 * Pacific Education — Curriculum Alignment Review Action Log UI
 * Version 1.0.0
 * PROTOTYPE ONLY.
 */
(function(window,document){
    "use strict";
    function esc(v){return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
    function render(targetId){
        var target=document.getElementById(targetId||"pacificEducationCurriculumAlignmentReviewActionLog");
        if(!target)return;
        var c=window.PacificEducationCurriculumAlignmentReviewActionController;
        if(!c){target.innerHTML="<p>Review action controller unavailable.</p>";return;}
        var rows=c.list();
        var html='<section><h2>Curriculum Review Action Log</h2>'+
            '<div style="overflow:auto"><table><thead><tr><th>Action ID</th><th>Indicator</th><th>Action</th><th>Status</th><th>Created</th><th>Notes</th><th>Control</th></tr></thead><tbody>';
        rows.slice().reverse().forEach(function(r){
            html+='<tr><td>'+esc(r.id)+'</td><td>'+esc(r.indicatorId)+'</td><td>'+esc(r.action)+'</td>'+
                '<td>'+esc(r.status)+'</td><td>'+esc(r.createdAt)+'</td><td>'+esc(r.notes)+'</td>'+
                '<td>'+(r.status==="open"?'<button type="button" data-close-action="'+esc(r.id)+'">Close</button>':'Closed')+'</td></tr>';
        });
        html+='</tbody></table></div><p><small>Prototype review log only. Closing an action does not change curriculum verification status or production eligibility.</small></p></section>';
        target.innerHTML=html;
        Array.prototype.forEach.call(target.querySelectorAll("[data-close-action]"),function(btn){
            btn.addEventListener("click",function(){
                c.close(btn.getAttribute("data-close-action"));
                render(targetId);
            });
        });
    }
    window.PacificEducationCurriculumAlignmentReviewActionLogUI=Object.freeze({version:"1.0.0",render:render});
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){render();});
    else render();
    document.addEventListener("pacificEducationCurriculumReviewActionCreated",function(){render();});
})(window,document);
