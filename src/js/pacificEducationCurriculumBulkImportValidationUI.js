/*
 * Pacific Education — Curriculum Bulk Import Validation UI
 * Version 1.0.0
 * PROTOTYPE ONLY.
 */
(function(window,document){
    "use strict";
    function esc(v){return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
    function render(targetId){
        var target=document.getElementById(targetId||"pacificEducationCurriculumBulkImportValidation");
        if(!target)return;
        var engine=window.PacificEducationCurriculumBulkImportValidationEngine;
        if(!engine){target.innerHTML="<p>Bulk import validation unavailable.</p>";return;}
        var r=engine.validateWorkspace();
        target.innerHTML='<section><h2>Curriculum Bulk Import Validation</h2>'+
          '<p><strong>Total:</strong> '+r.total+' | <strong>Valid:</strong> '+r.validRecords+' | <strong>Invalid:</strong> '+r.invalidRecords+'</p>'+
          '<p><strong>Batch status:</strong> '+(r.valid?"Ready for controlled import":"Blocked until validation errors are corrected")+'</p>'+
          '<div style="overflow:auto"><table><thead><tr><th>ID</th><th>Indicator</th><th>Status</th><th>Errors</th></tr></thead><tbody>'+
          (r.results.length?r.results.map(function(x){return '<tr><td>'+esc(x.id)+'</td><td>'+esc(x.indicatorId)+'</td><td>'+esc(x.valid?"Valid":"Invalid")+'</td><td>'+esc(x.errors.join("; "))+'</td></tr>';}).join(""):'<tr><td colspan="4">No imported records to validate.</td></tr>')+
          '</tbody></table></div>'+
          '<p><small>Validation checks data completeness only. It does not establish that a curriculum source is official, current or authentic.</small></p></section>';
    }
    window.PacificEducationCurriculumBulkImportValidationUI=Object.freeze({version:"1.0.0",render:render});
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){render();});
    else render();
    document.addEventListener("pacificEducationCurriculumAlignmentImported",function(){render();});
})(window,document);
