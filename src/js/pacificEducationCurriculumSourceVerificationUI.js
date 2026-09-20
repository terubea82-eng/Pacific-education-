/*
 * Pacific Education — Curriculum Source Verification UI
 * Version 1.0.0
 * PROTOTYPE ONLY.
 *
 * Provides a controlled workflow for reviewing curriculum-source records.
 * It does not create or certify official Fiji curriculum content.
 */
(function(window, document) {
    "use strict";

    var STATES = [
        "unverified",
        "source-reviewed",
        "curriculum-verified",
        "owner-approved",
        "production-approved"
    ];

    function verifier() {
        return window.PacificEducationCurriculumSourceVerification || null;
    }

    function data() {
        return window.PacificEducationCurriculumData || null;
    }

    function esc(value) {
        return String(value == null ? "" : value)
            .replace(/&/g,"&amp;")
            .replace(/</g,"&lt;")
            .replace(/>/g,"&gt;")
            .replace(/"/g,"&quot;");
    }

    function list() {
        var v=verifier();
        if(v && typeof v.list==="function") return v.list();
        var d=data();
        if(d && typeof d.list==="function") return d.list();
        return [];
    }

    function render(targetId) {
        var target=document.getElementById(targetId||"pacificEducationCurriculumSourceVerification");
        if(!target) return {success:false,error:"Source verification target unavailable"};

        var v=verifier();
        if(!v) {
            target.innerHTML="<p>Curriculum Source Verification module unavailable.</p>";
            return {success:false,error:"Verification module unavailable"};
        }

        var records=list();
        var counts={};
        STATES.forEach(function(state){counts[state]=0;});
        records.forEach(function(record){
            var state=record.verificationStatus||"unverified";
            if(counts[state] == null) counts[state]=0;
            counts[state]++;
        });

        target.innerHTML=
            '<div class="pacific-education-source-verification">'+
            '<h2>Curriculum Source Verification</h2>'+
            '<p>Controlled prototype workflow for curriculum provenance. Official curriculum content must be checked against the authoritative source before verification.</p>'+
            '<p><strong>Total records:</strong> '+records.length+'</p>'+
            '<ul>'+
            STATES.map(function(state){
                return '<li><strong>'+esc(state)+'</strong>: '+counts[state]+'</li>';
            }).join("")+
            '</ul>'+
            '<h3>Curriculum Records</h3>'+
            '<div style="overflow:auto">'+
            '<table><thead><tr><th>ID</th><th>Level</th><th>Subject</th><th>Source</th><th>Status</th><th>Production</th></tr></thead>'+
            '<tbody>'+
            (records.length ? records.map(function(record){
                var status=record.verificationStatus||"unverified";
                var production=(status==="production-approved");
                return '<tr>'+
                    '<td>'+esc(record.id)+'</td>'+
                    '<td>'+esc(record.level)+'</td>'+
                    '<td>'+esc(record.subjectId)+'</td>'+
                    '<td>'+esc(record.sourceId||record.source||"Not recorded")+'</td>'+
                    '<td>'+esc(status)+'</td>'+
                    '<td>'+(production?"Eligible flag":"Not eligible")+'</td>'+
                    '</tr>';
            }).join("") : '<tr><td colspan="6">No curriculum-source records registered.</td></tr>')+
            '</tbody></table></div>'+
            '<p><small>Prototype only. No record is made production-eligible merely by displaying this interface. Verification requires appropriate source evidence, owner approval and specialist review before production use.</small></p>'+
            '</div>';

        return {
            success:true,
            total:records.length,
            counts:counts,
            productionEligibleCount:counts["production-approved"]||0,
            prototype:true
        };
    }

    function init(){return render("pacificEducationCurriculumSourceVerification");}

    window.PacificEducationCurriculumSourceVerificationUI=Object.freeze({
        name:"PacificEducationCurriculumSourceVerificationUI",
        version:"1.0.0",
        states:STATES,
        render:render,
        init:init
    });

    document.addEventListener("pacificEducationMasterControlRefresh",function(){render();});
    document.addEventListener("pacificEducationCoverageRefresh",function(){render();});

    if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init);
    else init();
})(window,document);
