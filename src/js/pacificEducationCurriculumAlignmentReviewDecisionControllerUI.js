/*
 * Pacific Education — Curriculum Alignment Review Decision Controller UI
 * Version 1.0.0
 * PROTOTYPE ONLY.
 */
(function(window,document){
    "use strict";
    function esc(v){return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
    function render(targetId){
        var target=document.getElementById(targetId||"pacificEducationCurriculumAlignmentReviewDecisions");
        if(!target)return;
        var c=window.PacificEducationCurriculumAlignmentReviewDecisionController,q=window.PacificEducationCurriculumAlignmentReviewQueue;
        if(!c||!q){target.innerHTML="<p>Review decision controller unavailable.</p>";return;}
        var rows=q.list();
        var options=c.decisions.map(function(x){return '<option value="'+esc(x)+'">'+esc(x)+'</option>';}).join("");
        var html='<section><h2>Curriculum Review Decisions</h2>'+
          '<div style="overflow:auto"><table><thead><tr><th>Indicator</th><th>Current status</th><th>Decision</th><th>Notes</th><th>Record</th></tr></thead><tbody>';
        rows.forEach(function(r){
            html+='<tr><td>'+esc(r.indicatorId)+'</td><td>'+esc(r.status)+'</td><td><select data-decision="'+esc(r.indicatorId)+'">'+options+'</select></td>'+
              '<td><input type="text" data-notes="'+esc(r.indicatorId)+'" placeholder="Reviewer note"></td>'+
              '<td><button type="button" data-record="'+esc(r.indicatorId)+'">Record decision</button></td></tr>';
        });
        html+='</tbody></table></div><p><small>Decision records are reviewer workflow notes only. They do not change verification status or production eligibility.</small></p></section>';
        target.innerHTML=html;
        Array.prototype.forEach.call(target.querySelectorAll("[data-record]"),function(btn){
            btn.addEventListener("click",function(){
                var id=btn.getAttribute("data-record");
                var sel=target.querySelector('[data-decision="'+id+'"]');
                var note=target.querySelector('[data-notes="'+id+'"]');
                var result=c.record(id,sel.value,note.value);
                if(result.ok)render(targetId);else window.alert("Decision could not be recorded: "+result.error);
            });
        });
    }
    window.PacificEducationCurriculumAlignmentReviewDecisionControllerUI=Object.freeze({version:"1.0.0",render:render});
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){render();});else render();
    document.addEventListener("pacificEducationCurriculumReviewDecisionRecorded",function(){render();});
})(window,document);
