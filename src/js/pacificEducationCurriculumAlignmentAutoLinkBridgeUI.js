/*
 * Pacific Education — Curriculum Alignment Auto-Link Bridge UI
 * Version 1.0.0
 * PROTOTYPE ONLY.
 */
(function(window,document){
    "use strict";
    function esc(v){return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}

    function render(targetId){
        var target=document.getElementById(targetId||"pacificEducationCurriculumAlignmentAutoLinkBridge");
        if(!target)return;
        var ws=window.PacificEducationCurriculumAlignmentImportWorkspace;
        var bridge=window.PacificEducationCurriculumAlignmentAutoLinkBridge;
        if(!bridge){target.innerHTML="<p>Auto-link bridge unavailable.</p>";return;}

        var rows=ws&&ws.list?ws.list():[];
        target.innerHTML='<section><h2>Curriculum Alignment Auto-Link</h2>'+
          '<p>Imported records can be linked into the document, source-mapping and evidence registries. All linked records remain <strong>unverified</strong>.</p>'+
          '<div style="overflow:auto"><table><thead><tr><th>Indicator</th><th>Document</th><th>Source</th><th>Evidence</th><th>Action</th></tr></thead><tbody>'+
          (rows.length?rows.map(function(x){
              return '<tr><td>'+esc(x.indicatorId)+'</td><td>'+esc(x.documentId)+'</td><td>'+esc(x.sourceReference)+'</td><td>'+esc(x.evidenceReference)+'</td><td><button type="button" data-pacific-link="'+esc(x.indicatorId)+'">Auto-link</button></td></tr>';
          }).join(""):'<tr><td colspan="5">No imported records available.</td></tr>')+
          '</tbody></table></div>'+
          '<p><small>Auto-linking creates references only. It does not verify authenticity, official status or production eligibility.</small></p></section>';

        Array.prototype.forEach.call(target.querySelectorAll("[data-pacific-link]"),function(btn){
            btn.addEventListener("click",function(){
                var item=ws.get(btn.getAttribute("data-pacific-link"));
                var result=bridge.link(item||{});
                btn.textContent=result.success?"Linked":"Blocked";
                btn.disabled=true;
                document.dispatchEvent(new CustomEvent("pacificEducationCurriculumTraceabilityRefresh"));
            });
        });
    }

    window.PacificEducationCurriculumAlignmentAutoLinkBridgeUI=Object.freeze({version:"1.0.0",render:render});
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){render();});
    else render();
    document.addEventListener("pacificEducationCurriculumAlignmentImported",function(){render();});
})(window,document);
