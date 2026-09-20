/*
 * Pacific Education — Curriculum Source Mapping UI
 * Version 1.0.0
 * PROTOTYPE ONLY.
 */
(function(window,document){
    "use strict";

    function esc(v){
        return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
    }

    function render(targetId){
        var target=document.getElementById(targetId||"pacificEducationCurriculumSourceMapping");
        if(!target) return {success:false,error:"Source mapping target unavailable"};

        var workspace=window.PacificEducationCurriculumSourceMappingWorkspace;
        var data=window.PacificEducationCurriculumData;

        if(!workspace){
            target.innerHTML="<p>Curriculum source mapping workspace unavailable.</p>";
            return {success:false,error:"Workspace unavailable"};
        }

        var records=data&&typeof data.list==="function"?data.list():[];
        var mappings=workspace.list();

        target.innerHTML=
            '<div class="pacific-education-source-mapping">'+
            '<h2>Curriculum Source Mapping Workspace</h2>'+
            '<p>Map each curriculum indicator to the authoritative source location. Enter the official reference exactly as verified; do not create replacement curriculum content.</p>'+
            '<p><strong>Curriculum records:</strong> '+records.length+
            ' | <strong>Mapped:</strong> '+mappings.length+
            ' | <strong>Unmapped:</strong> '+Math.max(0,records.length-mappings.length)+'</p>'+
            '<div style="overflow:auto"><table><thead><tr>'+
            '<th>Indicator</th><th>Level</th><th>Subject</th><th>Source Reference</th><th>Page/Section</th><th>Status</th>'+
            '</tr></thead><tbody>'+
            (records.length?records.map(function(item){
                var mapping=workspace.get(item.id);
                return '<tr>'+
                    '<td>'+esc(item.id)+'</td>'+
                    '<td>'+esc(item.level)+'</td>'+
                    '<td>'+esc(item.subjectId)+'</td>'+
                    '<td>'+esc(mapping?mapping.sourceReference:"Not mapped")+'</td>'+
                    '<td>'+esc(mapping?((mapping.sourcePage||"")+(mapping.sourceSection?" / "+mapping.sourceSection:"")):"")+'</td>'+
                    '<td>'+esc(mapping?mapping.sourceStatus:"unverified")+'</td>'+
                    '</tr>';
            }).join(""):'<tr><td colspan="6">No curriculum records available.</td></tr>')+
            '</tbody></table></div>'+
            '<h3>Required Mapping Fields</h3>'+
            '<ul>'+
            '<li>Indicator ID</li>'+
            '<li>Authoritative source reference</li>'+
            '<li>Source title/version where available</li>'+
            '<li>Page or section where available</li>'+
            '<li>Evidence/reference notes</li>'+
            '</ul>'+
            '<p><small>Prototype workspace only. Mapping a source does not verify the curriculum, approve the indicator, or make it production eligible.</small></p>'+
            '</div>';

        return {success:true,recordCount:records.length,mappingCount:mappings.length,prototype:true};
    }

    function init(){return render();}

    window.PacificEducationCurriculumSourceMappingUI=Object.freeze({
        name:"PacificEducationCurriculumSourceMappingUI",
        version:"1.0.0",
        render:render,
        init:init
    });

    document.addEventListener("pacificEducationCurriculumSourceMappingChanged",function(){render();});
    if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init);
    else init();
})(window,document);
