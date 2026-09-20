/*
 * Pacific Education — Curriculum Evidence Registry UI
 * Version 1.0.0
 * PROTOTYPE ONLY.
 */
(function(window,document){
    "use strict";

    function esc(v){
        return String(v==null?"":v)
            .replace(/&/g,"&amp;").replace(/</g,"&lt;")
            .replace(/>/g,"&gt;").replace(/"/g,"&quot;");
    }

    function render(targetId){
        var target=document.getElementById(targetId||"pacificEducationCurriculumEvidenceRegistry");
        if(!target) return {success:false,error:"Evidence registry target unavailable"};

        var registry=window.PacificEducationCurriculumEvidenceRegistry;
        if(!registry){
            target.innerHTML="<p>Curriculum evidence registry unavailable.</p>";
            return {success:false,error:"Evidence registry unavailable"};
        }

        var records=registry.list();
        target.innerHTML=
            '<div class="pacific-education-curriculum-evidence">'+
            '<h2>Curriculum Evidence Registry</h2>'+
            '<p><strong>Evidence references:</strong> '+records.length+'</p>'+
            '<p>Each record links an achievement indicator to supporting source evidence. The actual authoritative document remains external unless separately stored in an approved document system.</p>'+
            '<div style="overflow:auto"><table><thead><tr>'+
            '<th>Indicator</th><th>Evidence</th><th>Type</th><th>Source</th><th>Page</th><th>Section</th><th>Status</th>'+
            '</tr></thead><tbody>'+
            (records.length?records.slice().reverse().map(function(x){
                return '<tr>'+
                    '<td>'+esc(x.indicatorId)+'</td>'+
                    '<td>'+esc(x.evidenceReference)+'</td>'+
                    '<td>'+esc(x.evidenceType)+'</td>'+
                    '<td>'+esc(x.sourceTitle||"")+'</td>'+
                    '<td>'+esc(x.page||"")+'</td>'+
                    '<td>'+esc(x.section||"")+'</td>'+
                    '<td>'+esc(x.status)+'</td>'+
                    '</tr>';
            }).join(""):'<tr><td colspan="7">No evidence references registered.</td></tr>')+
            '</tbody></table></div>'+
            '<p><small>Prototype only. Evidence references are not proof of curriculum authenticity. Verification must be performed against the authoritative source.</small></p>'+
            '</div>';

        return {success:true,count:records.length,prototype:true};
    }

    function init(){return render();}

    window.PacificEducationCurriculumEvidenceRegistryUI=Object.freeze({
        name:"PacificEducationCurriculumEvidenceRegistryUI",
        version:"1.0.0",
        render:render,
        init:init
    });

    document.addEventListener("pacificEducationCurriculumEvidenceChanged",function(){render();});
    document.addEventListener("pacificEducationCurriculumSourceMappingChanged",function(){render();});

    if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init);
    else init();
})(window,document);
