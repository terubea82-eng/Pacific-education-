/*
 * Pacific Education — Curriculum Owner Approval Request UI
 * Version 1.0.0
 * PROTOTYPE ONLY.
 */
(function(window,document){
    "use strict";
    function esc(v){return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
    function render(targetId){
        var target=document.getElementById(targetId||"pacificEducationCurriculumOwnerApprovalRequests");
        if(!target)return;
        var c=window.PacificEducationCurriculumOwnerApprovalRequest,g=window.PacificEducationCurriculumOwnerReviewGate;
        if(!c||!g){target.innerHTML="<p>Owner approval request module unavailable.</p>";return;}
        var rows=g.list(), requests=c.list();
        var html='<section><h2>Curriculum Owner Approval Requests</h2>'+
          '<p><strong>Pending requests:</strong> '+requests.filter(function(x){return x.status==="pending-owner-decision";}).length+'</p>'+
          '<div style="overflow:auto"><table><thead><tr><th>Indicator</th><th>Status</th><th>Owner-review ready</th><th>Blockers</th><th>Request</th></tr></thead><tbody>';
        rows.forEach(function(r){
            html+='<tr><td>'+esc(r.indicatorId)+'</td><td>'+esc(r.currentStatus)+'</td><td>'+(r.readyForOwnerReview?"Yes":"No")+'</td>'+
              '<td>'+esc(r.blockers.join(", ")||"None")+'</td><td><button type="button" data-owner-request="'+esc(r.indicatorId)+'" '+(r.readyForOwnerReview?"":"disabled")+'>Request owner decision</button></td></tr>';
        });
        html+='</tbody></table></div><p><small>A request is only a workflow record. It does not itself approve curriculum or enable production.</small></p></section>';
        target.innerHTML=html;
        Array.prototype.forEach.call(target.querySelectorAll("[data-owner-request]"),function(btn){
            btn.addEventListener("click",function(){
                var result=c.request(btn.getAttribute("data-owner-request"),"Submitted from owner-review gate.");
                if(result.ok)render(targetId);else window.alert("Request blocked: "+(result.blockers||[result.error]).join(", "));
            });
        });
    }
    window.PacificEducationCurriculumOwnerApprovalRequestUI=Object.freeze({version:"1.0.0",render:render});
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){render();});else render();
    document.addEventListener("pacificEducationCurriculumOwnerApprovalRequested",function(){render();});
})(window,document);
