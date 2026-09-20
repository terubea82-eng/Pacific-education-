/*
 * Pacific Education — Curriculum Owner Approval Decision Controller UI
 * Version 1.0.0
 * PROTOTYPE ONLY.
 */
(function(window,document){
    "use strict";
    function esc(v){return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
    function render(targetId){
        var target=document.getElementById(targetId||"pacificEducationCurriculumOwnerApprovalDecisions");
        if(!target)return;
        var c=window.PacificEducationCurriculumOwnerApprovalDecisionController;
        var rq=window.PacificEducationCurriculumOwnerApprovalRequest;
        if(!c||!rq){target.innerHTML="<p>Owner approval decision module unavailable.</p>";return;}
        var requests=rq.list().filter(function(x){return x.status==="pending-owner-decision";});
        var options=c.decisions.map(function(x){return '<option value="'+esc(x)+'">'+esc(x)+'</option>';}).join("");
        var html='<section><h2>Curriculum Owner Approval Decisions</h2>'+
          '<p><strong>Pending requests:</strong> '+requests.length+'</p>'+
          '<div style="overflow:auto"><table><thead><tr><th>Request</th><th>Indicator</th><th>Decision</th><th>Notes</th><th>Record</th></tr></thead><tbody>';
        requests.forEach(function(r){
            html+='<tr><td>'+esc(r.id)+'</td><td>'+esc(r.indicatorId)+'</td>'+
              '<td><select data-owner-decision="'+esc(r.id)+'">'+options+'</select></td>'+
              '<td><input type="text" data-owner-notes="'+esc(r.id)+'" placeholder="Owner note"></td>'+
              '<td><button type="button" data-owner-record="'+esc(r.id)+'">Record decision</button></td></tr>';
        });
        html+='</tbody></table></div>'+
          '<p><small>Prototype decision record only. A decision here does not change official curriculum verification or authorize production.</small></p></section>';
        target.innerHTML=html;
        Array.prototype.forEach.call(target.querySelectorAll("[data-owner-record]"),function(btn){
            btn.addEventListener("click",function(){
                var id=btn.getAttribute("data-owner-record");
                var sel=target.querySelector('[data-owner-decision="'+id+'"]');
                var note=target.querySelector('[data-owner-notes="'+id+'"]');
                var result=c.record(id,sel.value,note.value);
                if(result.ok)render(targetId);
                else window.alert("Decision could not be recorded: "+result.error);
            });
        });
    }
    window.PacificEducationCurriculumOwnerApprovalDecisionControllerUI=Object.freeze({version:"1.0.0",render:render});
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){render();});else render();
    document.addEventListener("pacificEducationCurriculumOwnerApprovalDecisionRecorded",function(){render();});
    document.addEventListener("pacificEducationCurriculumOwnerApprovalRequested",function(){render();});
})(window,document);
