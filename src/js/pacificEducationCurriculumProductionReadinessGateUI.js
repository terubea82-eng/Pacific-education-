/*
 * Pacific Education — Curriculum Production Readiness Gate UI
 * Version 1.0.0
 * PROTOTYPE ONLY.
 */
(function(window,document){
    "use strict";
    function esc(v){return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
    function render(targetId){
        var target=document.getElementById(targetId||"pacificEducationCurriculumProductionReadinessGate");
        if(!target)return;
        var g=window.PacificEducationCurriculumProductionReadinessGate;
        if(!g){target.innerHTML="<p>Production readiness gate unavailable.</p>";return;}
        var x=g.check();
        var html='<section><h2>Curriculum Production Readiness Gate</h2>'+
          '<p><strong>Status:</strong> '+(x.ready?"Ready":"Blocked")+'</p>'+
          '<p><strong>Fail-closed:</strong> '+(x.failClosed?"Yes":"No")+'</p>'+
          '<h3>Required before production</h3><ul>';
        x.blockers.forEach(function(b){html+='<li>'+esc(b)+'</li>';});
        html+='</ul><p><small>This gate is a prototype control. It cannot publish, deploy, or authorize production.</small></p></section>';
        target.innerHTML=html;
    }
    window.PacificEducationCurriculumProductionReadinessGateUI=Object.freeze({version:"1.0.0",render:render});
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){render();});else render();
    ["pacificEducationCurriculumOwnerApprovalDecisionRecorded","pacificEducationCurriculumOwnerApprovalRequested","pacificEducationCurriculumReviewDecisionRecorded"].forEach(function(e){document.addEventListener(e,function(){render();});});
})(window,document);
