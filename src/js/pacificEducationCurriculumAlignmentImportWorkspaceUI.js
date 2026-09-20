/*
 * Pacific Education — Curriculum Alignment Import Workspace UI
 * Version 1.0.0
 * PROTOTYPE ONLY.
 */
(function(window,document){
    "use strict";
    function esc(v){return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}

    function render(targetId){
        var target=document.getElementById(targetId||"pacificEducationCurriculumAlignmentImportWorkspace");
        if(!target)return;
        var ws=window.PacificEducationCurriculumAlignmentImportWorkspace;
        if(!ws){target.innerHTML="<p>Curriculum alignment import workspace unavailable.</p>";return;}
        var rows=ws.list();
        target.innerHTML='<section><h2>Curriculum Alignment Import Workspace</h2>'+
          '<p>Enter or import curriculum records here before source verification. <strong>Imported records remain unverified.</strong></p>'+
          '<div style="overflow:auto"><table><thead><tr><th>ID</th><th>Indicator</th><th>Level</th><th>Subject</th><th>Term</th><th>Document</th><th>Status</th></tr></thead><tbody>'+
          (rows.length?rows.map(function(x){return '<tr><td>'+esc(x.id)+'</td><td>'+esc(x.indicatorText)+'</td><td>'+esc(x.level)+'</td><td>'+esc(x.subjectId)+'</td><td>'+esc(x.term)+'</td><td>'+esc(x.documentId)+'</td><td>'+esc(x.status)+'</td></tr>';}).join(""):'<tr><td colspan="7">No imported records.</td></tr>')+
          '</tbody></table></div>'+
          '<p><small>This workspace does not certify official curriculum content and does not enable production publication.</small></p></section>';
    }

    window.PacificEducationCurriculumAlignmentImportWorkspaceUI=Object.freeze({version:"1.0.0",render:render});
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){render();});
    else render();
    document.addEventListener("pacificEducationCurriculumAlignmentImported",function(){render();});
})(window,document);
