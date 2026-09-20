/*
 * Pacific Education — Curriculum Alignment Review Action Controller UI
 * Version 1.0.0
 * PROTOTYPE ONLY.
 */
(function(window,document){
    "use strict";
    function esc(v){return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
    function render(targetId){
        var target=document.getElementById(targetId||"pacificEducationCurriculumAlignmentReviewActions");
        if(!target)return;
        var c=window.PacificEducationCurriculumAlignmentReviewActionController;
        var q=window.PacificEducationCurriculumAlignmentReviewQueue;
        if(!c||!q){target.innerHTML="<p>Review action controller unavailable.</p>";return;}
        var rows=q.list(), actions=c.list();
        var html='<section><h2>Curriculum Review Actions</h2>'+
          '<p><strong>Open actions:</strong> '+actions.filter(function(x){return x.status==="open";}).length+
          ' | <strong>Total actions:</strong> '+actions.length+'</p>'+
          '<div style="overflow:auto"><table><thead><tr><th>Indicator</th><th>Status</th><th>Next action</th><th>Blockers</th><th>Review action</th></tr></thead><tbody>';
        rows.forEach(function(r){
            var action=r.nextAction||"review-source";
            html+='<tr><td>'+esc(r.indicatorId)+'</td><td>'+esc(r.status)+'</td><td>'+esc(r.nextAction)+'</td>'+
              '<td>'+esc(r.blockers.join(", ")||"None")+'</td>'+
              '<td><button type="button" data-review-indicator="'+esc(r.indicatorId)+'" data-review-action="'+esc(action)+'">Create review action</button></td></tr>';
        });
        html+='</tbody></table></div><p><small>Actions are local prototype records for controlled review planning. They do not approve curriculum or enable production.</small></p></section>';
        target.innerHTML=html;
        Array.prototype.forEach.call(target.querySelectorAll("[data-review-indicator]"),function(btn){
            btn.addEventListener("click",function(){
                var result=c.create(btn.getAttribute("data-review-indicator"),btn.getAttribute("data-review-action"),"Created from central review queue.");
                if(result.ok)render(targetId); else window.alert("Review action could not be created: "+result.error);
            });
        });
    }
    window.PacificEducationCurriculumAlignmentReviewActionControllerUI=Object.freeze({version:"1.0.0",render:render});
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){render();});
    else render();
    document.addEventListener("pacificEducationCurriculumReviewActionCreated",function(){render();});
})(window,document);
