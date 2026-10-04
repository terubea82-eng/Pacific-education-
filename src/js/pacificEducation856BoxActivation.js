/* Pacific Education — 856-compatible pilot box activation
 * Keeps the existing 856 voice/native engine and pilot integrity boundary.
 * Activates the current web pilot controls without enabling production payments/auth.
 */
(function(window, document){
  "use strict";

  var VERSION = "856-box-activation-1.0.0";

  function show(id){
    var el=document.getElementById(id);
    if(!el) return false;
    el.hidden=false;
    el.removeAttribute("aria-hidden");
    try{el.style.removeProperty("display");}catch(e){}
    return true;
  }

  function go(id){
    var el=document.getElementById(id);
    if(!el) return false;
    show(id);
    try{el.scrollIntoView({behavior:"smooth",block:"start"});}catch(e){try{el.scrollIntoView();}catch(_){}}
    return true;
  }

  function bind(id, action){
    var el=document.getElementById(id);
    if(!el || el.getAttribute("data-pe-856-bound")==="true") return;
    el.setAttribute("data-pe-856-bound","true");
    el.addEventListener("click",function(e){
      try{ if(e){e.preventDefault();} action(e); }catch(err){ console.warn("Pacific Education 856 activation recovery:",err); }
    },false);
    el.style.pointerEvents="auto";
    el.style.touchAction="manipulation";
  }

  function activate(){
    document.body.setAttribute("data-pe-856-box-activation",VERSION);
    document.body.classList.add("pe-pilot-all-features");

    /* Reveal current pilot-facing boxes. Production/payment gates stay protected. */
    [
      "pacificEducationAppMenu","header","userFirstNavigation",
      "pacificEducationSchoolIdentitySection","learningPlatform","pacificEducationAppTools",
      "pacificEducationIdentityRegistration","pacificEducationWebsitePilotChecklist",
      "prototypeAccess","levelSelection","subjectSelection","termSelection","capabilitySelection",
      "dailyLesson","dailyLessonPracticeStage","pacificEducationHomeSubmission",
      "pacificEducationTermBaseline","pacificEducationTransferIntake","assessments",
      "specialEducationDashboard","teacherDashboard","parentDashboard",
      "pacificEducationAIConversation","pacificGuardianCommentSection",
      "pacificEducationAccountRecovery","systemStatus","pacificEducationCoverageDashboard",
      "pacificEducationStudentProgressDashboard","pacificEducationTeacherClassDashboard",
      "pacificEducationTeacherEvidence","pacificEducationExternalReviewerPortal",
      "pacificEducationMailbox","pacificEducationAccessibilityControls"
    ].forEach(show);

    /* The controlled pilot must never activate real purchasing/production entitlement. */
    [
      "buyPlans","pacificEducationPaymentLinksAlways","pacificEducationInstitutionFees",
      "pacificEducationUniversityFeeWorkflow","pacificEducationAccessEntitlement"
    ].forEach(function(id){
      var el=document.getElementById(id);
      if(el){el.hidden=true;el.setAttribute("data-pe-protected","true");}
    });

    /* Registration and guided Next sequence. */
    bind("userRegistrationOpenButton",function(){
      var f=document.getElementById("userRegistrationForm");
      var b=document.getElementById("userRegistrationOpenButton");
      if(!f)return;
      f.hidden=false;
      if(b){b.setAttribute("aria-expanded","true");b.textContent="👤 User Registration — Tap to close";}
      go("userRegistrationForm");
    });

    var flow=[
      ["welcomeNextButton","pacificEducationIdentityRegistration"],
      ["registrationNextButton","prototypeAccess"],
      ["prototypeNextButton","levelSelection"],
      ["levelNextButton","subjectSelection"],
      ["subjectNextButton","termSelection"],
      ["termNextButton","capabilitySelection"],
      ["capabilityNextButton","dailyLesson"],
      ["dailyNextButton","dailyLessonPracticeStage"],
      ["practiceNextButton","assessments"],
      ["assessmentNextButton","pacificEducationCoverageDashboard"]
    ];
    flow.forEach(function(pair){bind(pair[0],function(){go(pair[1]);});});

    bind("dailyActivitiesStartButton",function(){go("dailyLessonActivity");});
    bind("dailyActivitiesContinuePracticeButton",function(){go("dailyLessonPracticeStage");});
    bind("practiceContinueAssessmentButton",function(){go("assessments");});
    bind("assessmentContinueCoverageButton",function(){go("pacificEducationCoverageDashboard");});

    bind("previousLessonButton",function(){
      var d=parseInt(localStorage.getItem("pacificEducationPilotTermDay")||localStorage.getItem("currentDayNumber")||"1",10)||1;
      var n=Math.max(1,d-1);
      localStorage.setItem("pacificEducationPilotTermDay",String(n));
      localStorage.setItem("currentDayNumber",String(n));
      if(window.PacificEducationCurriculumLessonRenderer&&typeof window.PacificEducationCurriculumLessonRenderer.refresh==="function")
        window.PacificEducationCurriculumLessonRenderer.refresh();
    });
    bind("nextLessonButton",function(){
      var d=parseInt(localStorage.getItem("pacificEducationPilotTermDay")||localStorage.getItem("currentDayNumber")||"1",10)||1;
      var n=Math.min(365,d+1);
      localStorage.setItem("pacificEducationPilotTermDay",String(n));
      localStorage.setItem("currentDayNumber",String(n));
      if(window.PacificEducationCurriculumLessonRenderer&&typeof window.PacificEducationCurriculumLessonRenderer.refresh==="function")
        window.PacificEducationCurriculumLessonRenderer.refresh();
    });

    /* Ensure assessment buttons remain callable even if another repair layer has run first. */
    document.querySelectorAll("button").forEach(function(btn){
      var label=String(btn.textContent||"").toLowerCase();
      if(label.indexOf("alphabet assessment")!==-1){
        btn.disabled=false;btn.setAttribute("aria-disabled","false");
        if(btn.getAttribute("data-pe-856-assessment")!=="true"){
          btn.setAttribute("data-pe-856-assessment","true");
          btn.addEventListener("click",function(){if(typeof window.startAlphabetAssessment==="function")window.startAlphabetAssessment();},false);
        }
      }
      if(label.indexOf("phonics assessment")!==-1){
        btn.disabled=false;btn.setAttribute("aria-disabled","false");
        if(btn.getAttribute("data-pe-856-assessment")!=="true"){
          btn.setAttribute("data-pe-856-assessment","true");
          btn.addEventListener("click",function(){if(typeof window.startPhonicsAssessment==="function")window.startPhonicsAssessment();},false);
        }
      }
    });

    var status=document.getElementById("systemStatus");
    if(status)status.textContent="Pacific Education 856-compatible pilot activation is active. Pilot boxes enabled; production/payment gates remain locked.";
  }

  function init(){
    activate();
    window.setTimeout(activate,500);
    window.setTimeout(activate,1500);
    window.setTimeout(activate,3000);
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);
  else init();
})(window);
