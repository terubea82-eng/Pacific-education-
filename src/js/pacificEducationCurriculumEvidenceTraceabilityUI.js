/*
 * Pacific Education — Curriculum Evidence Traceability UI
 * Version 1.0.0
 * PROTOTYPE ONLY.
 */
(function(window,document){
    "use strict";

    function esc(v){return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}

    function render(targetId){
        var target=document.getElementById(targetId||"pacificEducationCurriculumEvidenceTraceability");
        if(!target) return {success:false,error:"Traceability target unavailable"};

        var engine=window.PacificEducationCurriculumEvidenceTraceability;
        if(!engine){
            target.innerHTML="<p>Curriculum evidence traceability unavailable.</p>";
            return {success:false,error:"Traceability engine unavailable"};
        }

        var result=engine.validate();
        var rows=engine.list();

        target.innerHTML=
            '<div class="pacific-education-evidence-traceability">'+
            '<h2>Curriculum Evidence Traceability</h2>'+
            '<p><strong>Traceable:</strong> '+result.traceable+
            ' / '+result.total+
            ' | <strong>Needs evidence/source linkage:</strong> '+result.untraceable+'</p>'+
            '<p><strong>Traceability status:</strong> '+(result.valid?"Complete for loaded records":"Incomplete for one or more records")+'</p>'+
            '<div style="overflow:auto"><table><thead><tr>'+
            '<th>Indicator</th><th>Source</th><th>Evidence</th><th>Document</th><th>Traceable</th><th>Blockers</th>'+
            '</tr></thead><tbody>'+
            (rows.length?rows.map(function(x){
                return '<tr>'+
                    '<td>'+esc(x.indicatorId)+'</td>'+
                    '<td>'+(x.sourceMapped?"Yes":"No")+'</td>'+
                    '<td>'+esc(x.evidence.length)+'</td>'+
                    '<td>'+esc(x.documents.length)+'</td>'+
                    '<td>'+(x.traceable?"Yes":"No")+'</td>'+
                    '<td>'+esc(x.blockers.join(" "))+'</td>'+
                    '</tr>';
            }).join(""):'<tr><td colspan="6">No curriculum indicators loaded.</td></tr>')+
            '</tbody></table></div>'+
            '<p><small>Prototype traceability check only. A complete chain does not itself establish that the source is authentic, current, official or approved.</small></p>'+
            '</div>';

        return result;
    }

    function init(){return render();}
    window.PacificEducationCurriculumEvidenceTraceabilityUI=Object.freeze({
        name:"PacificEducationCurriculumEvidenceTraceabilityUI",
        version:"1.0.0",
        render:render,
        init:init
    });

    ["pacificEducationCurriculumSourceMappingChanged","pacificEducationCurriculumEvidenceChanged","pacificEducationCurriculumDocumentReferenceChanged","pacificEducationCurriculumVerificationChanged"].forEach(function(eventName){
        document.addEventListener(eventName,function(){render();});
    });

    if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init);
    else init();
})(window,document);
