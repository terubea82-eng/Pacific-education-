/* Pacific Education — user-box visual activation.
 * UI-only layer: blue/light-blue identifies interactive user-facing boxes.
 * Does not alter navigation, payment gates, governance gates, or #856 voice.
 */
(function(window, document){
  "use strict";

  var USER_BOX_IDS = [
    "pacificEducationWelcome",
    "pacificEducationAccessibilityControls",
    "pacificEducationCountriesBox",
    "pacificEducationLanguageBox",
    "pacificEducationRegistrationBox",
    "pilotUserRoleCards",
    "pilotRoleRegistrationFields",
    "pacificEducationIdentityRegistration",
    "learningPlatform",
    "pacificEducationInitialCapabilityTest",
    "pacificEducationInitialCapabilityResult",
    "levelSelection",
    "subjectSelection",
    "termSelection",
    "capabilitySelection",
    "dailyLesson",
    "dailyLessonPracticeStage",
    "assessments",
    "pacificEducationCoverageDashboard",
    "pacificEducationStudentProgressDashboard",
    "pacificEducationHomeSubmission",
    "pacificEducationWeekendHolidaySupplementaryActivities",
    "teacherDashboard",
    "pacificEducationTeacherCapabilityTest",
    "pacificEducationTeacherCapabilityResult",
    "pacificEducationTeacherClassDashboard",
    "teacherCalendarSection",
    "pacificEducationTeacherEvidence",
    "parentDashboard",
    "pacificGuardianCommentSection",
    "pacificEducationExternalReviewerPortal",
    "pacificEducationExternalSpecialistReviewEvidenceRegistry",
    "pacificEducationExternalSpecialistReviewEvidenceLog",
    "pacificEducationWebsitePilotChecklist",
    "pacificEducationCurriculumMasterControlStatus",
    "pacificEducationCurriculumEvidenceRegistry",
    "pacificEducationCurriculumEvidenceTraceability",
    "specialEducationDashboard",
    "specialEducationReviewEvidence",
    "pacificEducationSchoolIdentitySection",
    "pacificEducationTeacherClassRoster",
    "pacificEducationExamCalendarSection",
    "pacificEducationInstitutionSetup",
    "pacificEducationInstitutionAdvice",
    "systemStatus",
    "publicationStatus",
    "pacificEducationOfflineSyncStatus",
    "pacificEducationTechnicianWorkspace",
    "pacificEducationAppMenu",
    "pacificEducationWorkspaceLiveStatus",
    "pacificEducationAccountRecovery"
  ];

  var USER_BOX_CLASSES = [
    "pe-user-role-card",
    "pacedu-entry-card",
    "pacedu-agreement",
    "peKeyLearningActivityShortcuts"
  ];

  function mark(){
    USER_BOX_IDS.forEach(function(id){
      var el=document.getElementById(id);
      if(el) el.classList.add("pe-user-box");
    });

    USER_BOX_CLASSES.forEach(function(cls){
      document.querySelectorAll("." + cls).forEach(function(el){
        el.classList.add("pe-user-box");
      });
    });

    document.querySelectorAll("#pilotUserRoleCards .pe-user-role-card").forEach(function(card){
      card.classList.add("pe-user-box");
      if(card.getAttribute("aria-pressed")==="true"){
        card.classList.add("pe-user-box-selected");
      }else{
        card.classList.remove("pe-user-box-selected");
      }
    });

    document.querySelectorAll(
      "#levelSelection select,#subjectSelection select,#termSelection select,#capabilitySelection select," +
      "#pilotRoleRegistrationFields input,#pilotRoleRegistrationFields select," +
      "#pacificEducationCountriesBox select,#pacificEducationLanguageBox select"
    ).forEach(function(control){
      control.classList.add("pe-user-control");
    });

    /* Mandatory continuation remains green, not blue. */
    document.querySelectorAll(
      ".pacific-mandatory-next,.pacific-flow-next button,#peSequentialNext," +
      "#registrationNextButton,#pilotRegistrationSaveButton," +
      "[id$=\"NextButton\"],[id$=\"nextButton\"]"
    ).forEach(function(button){
      button.classList.add("pe-user-next");
    });

    /* Keep the guided sequence active on every page: any visible button whose
       accessible/text label is Next is a green continuation control, not a blue box. */
    document.querySelectorAll("button").forEach(function(button){
      var label=(button.getAttribute("aria-label")||button.textContent||"").replace(/\\s+/g," ").trim().toLowerCase();
      if(/^next(?:\\b|\\s|➡️)/.test(label) || /\\bnext page\\b/.test(label)){
        button.classList.add("pe-user-next");
        button.classList.remove("pe-user-box");
      }
    });

    /* Protected AI Playback remains black; never recolour it as a user box. */
    document.querySelectorAll(
      "#pacificEducationAIPlaybackButton,#pacificEducationWelcomeVoiceButton,#pacificEducationStopSpeechButton"
    ).forEach(function(control){
      control.classList.add("pe-protected-voice-control");
      control.classList.remove("pe-user-box","pe-user-next");
    });
  }

  function observe(){
    mark();
    var observer=new MutationObserver(function(){ mark(); });
    observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:["aria-pressed"]});
  }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",observe);
  }else{
    observe();
  }

  window.PacificEducationUserBoxVisualActivation={
    version:"1.1.0",
    refresh:mark,
    userBoxIds:USER_BOX_IDS.slice()
  };
})(window,document);
