/* Pacific Education — Website Pilot Launch Checklist */
(function(window,document){
  "use strict";
  var VERSION="1.0.0";
  function check(){
    var checks=[
      ["Controlled pilot notice",!!document.getElementById("pilotBanner")],
      ["Pilot user workspaces",!!window.PacificEducationPilotUserWorkspaces],
      ["Learning level selector",!!window.PacificEducationLevelSelector],
      ["Subject selector",!!window.PacificEducationSubjectSelector],
      ["Term selector",!!window.PacificEducationTermSelector],
      ["Capability selector",!!window.PacificEducationCapabilitySelector],
      ["Daily curriculum engine",!!window.PacificEducationDailyCurriculumEngine],
      ["Daily lesson renderer",!!window.PacificEducationCurriculumLessonRenderer],
      ["Text/audio learning controls",!!window.speechSynthesis||typeof window.speakText==="function"],
      ["Term baseline assessment",!!window.PacificEducationTermBaselineAssessment],
      ["School transfer intake",!!window.PacificEducationSchoolTransfer],
      ["Home/audio submission",!!window.PacificEducationHomeSubmission],
      ["Assessment system",!!window.PacificEducationAssessmentBridge],
      ["Student progress dashboard",!!window.PacificEducationStudentProgressDashboardUI],
      ["Teacher dashboard",!!window.PacificEducationTeacherClassDashboardUI],
      ["Parent dashboard",!!document.getElementById("parentDashboard")],
      ["Identity registration boundary",!!window.PacificEducationIdentityRegistry],
      ["Account recovery boundary",!!window.PacificEducationAccountRecovery],
      ["Owner-only headcount",!!window.PacificEducationOwnerHeadcount],
      ["Pilot connection diagnostics",!!window.PacificEducationPilotConnectionReadiness]
    ];
    var passed=checks.filter(function(x){return x[1];}).length;
    var ready=passed===checks.length;
    var target=document.getElementById("pacificEducationWebsitePilotChecklist");
    if(target){
      target.innerHTML="<h2>Website Pilot Launch Checklist</h2>"
        +"<p><strong>"+passed+"/"+checks.length+" pilot components detected.</strong></p>"
        +"<ul>"+checks.map(function(x){return "<li>"+(x[1]?"✓ ":"✗ ")+x[0]+"</li>";}).join("")+"</ul>"
        +"<p><strong>Status:</strong> "+(ready?"Website pilot components are connected.":"Some pilot components need repair before pilot use.")+"</p>"
        +"<p><strong>Pilot boundary:</strong> This checklist does not certify official curriculum, production security, payment, safeguarding, identity verification or production readiness.</p>"
        +"<p><strong>Pilot use:</strong> Use synthetic/demo data only. Production authentication and server-side authorization are required before real-user production service.</p>";
    }
    return {version:VERSION,passed:passed,total:checks.length,ready:ready,productionApproved:false};
  }
  window.PacificEducationWebsitePilotChecklist=Object.freeze({version:VERSION,check:check});
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",check);else check();
})(window,document);
