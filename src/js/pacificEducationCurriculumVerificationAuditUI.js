/*
 * Pacific Education — Curriculum Verification Audit UI
 * Version 1.0.0
 * PROTOTYPE ONLY.
 */
(function(window,document){
    "use strict";

    function esc(v){
        return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
    }

    function render(targetId){
        var target=document.getElementById(targetId||"pacificEducationCurriculumVerificationAudit");
        if(!target) return {success:false,error:"Audit UI target unavailable"};

        var audit=window.PacificEducationCurriculumVerificationAuditTrail;
        if(!audit){
            target.innerHTML="<p>Curriculum verification audit trail unavailable.</p>";
            return {success:false,error:"Audit trail unavailable"};
        }

        var records=audit.list();
        target.innerHTML=
            '<div class="pacific-education-verification-audit">'+
            '<h2>Curriculum Verification Audit Trail</h2>'+
            '<p><strong>Prototype audit records:</strong> '+records.length+'</p>'+
            '<div style="overflow:auto"><table><thead><tr>'+
            '<th>Indicator</th><th>From</th><th>To</th><th>Source</th><th>Reviewer</th><th>Date</th>'+
            '</tr></thead><tbody>'+
            (records.length?records.slice().reverse().map(function(item){
                return '<tr>'+
                    '<td>'+esc(item.indicatorId)+'</td>'+
                    '<td>'+esc(item.fromStatus)+'</td>'+
                    '<td>'+esc(item.toStatus)+'</td>'+
                    '<td>'+esc(item.sourceReference||"Not recorded")+'</td>'+
                    '<td>'+esc(item.reviewerReference||"Not recorded")+'</td>'+
                    '<td>'+esc(item.date)+'</td>'+
                    '</tr>';
            }).join(""):'<tr><td colspan="6">No verification transitions recorded.</td></tr>')+
            '</tbody></table></div>'+
            '<p><small>Prototype local audit only. Production audit records require secure server-side storage, authenticated reviewers, access controls, retention rules and appropriate legal/privacy review.</small></p>'+
            '</div>';

        return {success:true,count:records.length,prototype:true};
    }

    function init(){return render();}

    window.PacificEducationCurriculumVerificationAuditUI=Object.freeze({
        name:"PacificEducationCurriculumVerificationAuditUI",
        version:"1.0.0",
        render:render,
        init:init
    });

    document.addEventListener("pacificEducationMasterControlRefresh",function(){render();});
    if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init);
    else init();
})(window,document);
