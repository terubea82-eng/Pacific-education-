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

    /* Guided flow must advance when a flow box is opened, while ordinary
       dashboard/menu boxes must escape the single-page guided overlay. */
    var steps={
      "pacificEducationWelcome":0,
      "pacificEducationIdentityRegistration":1,
      "prototypeAccess":2,
      "levelSelection":3,
      "subjectSelection":4,
      "termSelection":5,
      "capabilitySelection":6,
      "dailyLesson":7,
      "dailyLessonPracticeStage":8,
      "assessments":9,
      "teacherCalendarSection":10
    };
    if(Object.prototype.hasOwnProperty.call(steps,id)){
      document.body.classList.add("pe-guided-flow");
      document.body.setAttribute("data-pe-flow-step",String(steps[id]));
    }else{
      document.body.classList.remove("pe-guided-flow");
      document.removeAttribute("data-pe-flow-step");
    }

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

    /* Mandatory internal-link repair: every pilot navigation link must open its target box. */
    document.querySelectorAll('a[href^="#"]').forEach(function(link){
      if(link.getAttribute("data-pe-856-link-bound")==="true") return;
      var href=link.getAttribute("href")||"";
      var targetId=href.slice(1);
      if(!targetId || !document.getElementById(targetId)) return;
      link.setAttribute("data-pe-856-link-bound","true");
      link.addEventListener("click",function(e){
        if(e){e.preventDefault();}
        go(targetId);
      },false);
      link.style.pointerEvents="auto";
      link.style.touchAction="manipulation";
    });

    /* Mandatory pilot activity targets: reveal and keep the complete learning path callable. */
    [
      "pacificEducationIdentityRegistration","prototypeAccess","levelSelection","subjectSelection",
      "termSelection","capabilitySelection","dailyLesson","dailyLessonPracticeStage","assessments",
      "teacherCalendarSection","teacherDashboard","parentDashboard","specialEducationDashboard",
      "pacificEducationCoverageDashboard","pacificEducationStudentProgressDashboard",
      "pacificEducationTeacherClassDashboard","pacificEducationTeacherEvidence",
      "pacificEducationExternalReviewerPortal","pacificEducationAIConversation",
      "pacificGuardianCommentSection","pacificEducationMailbox","systemStatus"
    ].forEach(show);

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

    /* Direct pilot boxes must remain usable even when the guided overlay is active. */
    [
      ["userRegistrationOpenButton","pacificEducationIdentityRegistration"],
      ["dailyActivitiesStartButton","dailyLesson"],
      ["dailyActivitiesContinuePracticeButton","dailyLessonPracticeStage"],
      ["practiceContinueAssessmentButton","assessments"],
      ["assessmentContinueCoverageButton","pacificEducationCoverageDashboard"],
      ["pacificTeacherDashboardRefresh","teacherDashboard"],
      ["pacificParentDashboardRefresh","parentDashboard"]
    ].forEach(function(pair){
      bind(pair[0],function(){go(pair[1]);});
    });

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

    /* Mandatory cross-device voice + interaction bridge.
     * Preserve the 856 engine: every important pilot control gets a spoken action cue,
     * dynamic activity buttons are covered, and internal links are re-scanned after renders.
     */
    function installInteractiveVoiceBridge(){
      if(document.body.getAttribute("data-pe-856-voice-bridge")==="true") return;
      document.body.setAttribute("data-pe-856-voice-bridge","true");

      function importantLabel(el){
        return String(el && (el.getAttribute("aria-label") || el.textContent || el.value || "") || "").replace(/\\s+/g," ").trim();
      }

      function prepare(root){
        var scope=root||document;
        scope.querySelectorAll("button,a[href^='#'],summary").forEach(function(el){
          if(el.getAttribute("data-pe-856-interactive-ready")==="true") return;
          el.setAttribute("data-pe-856-interactive-ready","true");
          el.style.pointerEvents="auto";
          el.style.touchAction="manipulation";
          var label=importantLabel(el);
          if(label && !el.getAttribute("aria-label") && el.tagName.toLowerCase()==="button") el.setAttribute("aria-label",label);
        });
      }

      prepare(document);

      document.addEventListener("focusin",function(e){
        var el=e.target;
        if(!el || !el.matches || !el.matches("button,a[href^='#'],summary")) return;
        var label=importantLabel(el);
        if(!label || /^(▶️ Play|⏹|🔇 Stop Speech|🔊 Listen to question)$/i.test(label)) return;
        if(window.PacificEducationSpeech && typeof window.PacificEducationSpeech.speakText==="function"){
          window.PacificEducationSpeech.speakText(label.replace(/^➡️\\s*/,"") + ".");
        } else if(typeof window.speakText==="function") {
          window.speakText(label + ".");
        }
      },true);

      document.addEventListener("click",function(e){
        var el=e.target && e.target.closest ? e.target.closest("button,a[href^='#'],summary") : null;
        if(!el) return;
        var label=importantLabel(el);
        if(!label) return;
        var lower=label.toLowerCase();
        if(/(math|mathematics|english|phonics|daily activit|practice|assessment|alphabet|submit|continue learning|next)/.test(lower)){
          var message=label.replace(/^➡️\\s*/,"").trim()+".";
          if(window.PacificEducationSpeech && typeof window.PacificEducationSpeech.speakText==="function") window.PacificEducationSpeech.speakText(message);
          else if(typeof window.speakText==="function") window.speakText(message);
        }
      },false);

      var observer=new MutationObserver(function(mutations){
        mutations.forEach(function(m){ if(m.addedNodes && m.addedNodes.length) prepare(m.target); });
      });
      observer.observe(document.body,{childList:true,subtree:true});
    }

    installInteractiveVoiceBridge();
    window.setTimeout(installInteractiveVoiceBridge,500);
    window.setTimeout(function(){
      document.querySelectorAll('a[href^="#"]').forEach(function(link){
        var targetId=(link.getAttribute("href")||"").slice(1);
        if(targetId && document.getElementById(targetId) && link.getAttribute("data-pe-856-link-bound")!=="true"){
          link.setAttribute("data-pe-856-link-bound","true");
          link.addEventListener("click",function(e){ if(e)e.preventDefault(); go(targetId); },false);
        }
      });
    },1200);

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
