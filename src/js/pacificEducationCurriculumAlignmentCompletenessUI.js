/*
 * Pacific Education — Curriculum Alignment Completeness UI
 * Version 1.0.0
 * PROTOTYPE ONLY.
 */
(function(window,document){
    "use strict";
    function esc(v){return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
    function render(targetId){
        var target=document.getElementById(targetId||"pacificEducationCurriculumAlignmentCompleteness");
        if(!target)return;
        var e=window.PacificEducationCurriculumAlignmentCompletenessEngine;
        if(!e){target.innerHTML="<p>Alignment completeness engine unavailable.</p>";return;}
        var s=e.summary(), d=e.build();
        var html='<section><h2>Curriculum Alignment Completeness</h2>'+
          '<p><strong>Indicators:</strong> '+s.total+' | <strong>Traceable:</strong> '+s.traceable+' | <strong>Untraceable:</strong> '+s.untraceable+' | <strong>Verified:</strong> '+s.verified+'</p>'+
          '<div style="overflow:auto"><table><thead><tr><th>Level</th><th>Term</th><th>Indicators</th><th>Traceable</th><th>Verified</th><th>Missing Source</th><th>Missing Evidence</th></tr></thead><tbody>';
        e.levels.forEach(function(level){e.terms.forEach(function(term){
            var x=d[level][term];
            html+='<tr><td>'+esc(level)+'</td><td>'+esc(term)+'</td><td>'+x.total+'</td><td>'+x.traceable+'</td><td>'+x.verified+'</td><td>'+x.missingSource+'</td><td>'+x.missingEvidence+'</td></tr>';
        });});
        html+='</tbody></table></div><p><small>This is a completeness report only. It does not certify official curriculum alignment or source authenticity.</small></p></section>';
        target.innerHTML=html;
    }
    window.PacificEducationCurriculumAlignmentCompletenessUI=Object.freeze({version:"1.0.0",render:render});
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){render();});
    else render();
    ["pacificEducationCurriculumAlignmentImported","pacificEducationCurriculumAlignmentAutoLinked","pacificEducationCurriculumTraceabilityRefresh"].forEach(function(e){document.addEventListener(e,render);});
})(window,document);
