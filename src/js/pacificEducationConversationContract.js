/* Pacific Education — Conversation-to-Runtime Contract
 * This file is the authoritative bridge for requirements agreed in Pacedu work.
 * It converts the locked product requirements into stable runtime IDs/hooks.
 * It does not contain chat history; it contains the executable requirements
 * that the shipped JavaScript must preserve.
 */
(function(window){
  "use strict";

  var CONTRACT = {
    version: "20261009-conversation-contract-v1",
    protectedBaseline: "#856",
    navigationOwner: "single",
    flow: [
      ["welcome", "pacificEducationWelcome"],
      ["vision", "paceduPageVision"],
      ["rules", "paceduPageRules"],
      ["registration", "pacificEducationIdentityRegistration"],
      ["prototype", "prototypeAccess"],
      ["level", "levelSelection"],
      ["subject", "subjectSelection"],
      ["term", "termSelection"],
      ["capability", "capabilitySelection"],
      ["daily", "dailyLesson"],
      ["practice", "dailyLessonPracticeStage"],
      ["assessment", "assessments"],
      ["coverage", "pacificEducationCoverageDashboard"],
      ["teacher", "teacherCalendarSection"]
    ],
    next: [
      "welcomeNextButton","paceduVisionNext","paceduRulesContinue",
      "registrationNextButton","prototypeNextButton","levelNextButton",
      "subjectNextButton","termNextButton","capabilityNextButton",
      "dailyActivitiesStartButton","dailyActivitiesContinuePracticeButton",
      "dailyNextButton","practiceContinueAssessmentButton","practiceNextButton",
      "assessmentContinueCoverageButton","assessmentNextButton","coverageNextButton"
    ],
    requirements: {
      pageByPage: true,
      hideOtherPages: true,
      nextAndBack: true,
      breathingGreenNext: true,
      blueUserBoxes: true,
      mandatoryRegistrationBoxes: true,
      twoPersonAIPlayback: true,
      protected856Voice: true,
      fiveSecondWelcomeVoice: true,
      maleVoicePreferred: true,
      hearWelcome: true,
      stopSpeech: true,
      voiceCommands: ["Next","Read","Read Choices","Sign Out"],
      blindUserSpeakerControls: true,
      offlineFirst: true,
      appScopedTunnelDesign: true,
      mathActivities: true,
      englishActivities: true,
      phonicsActivities: true,
      daily365: true,
      assessments: true,
      curriculumCoverage: true,
      teacherCalendar: true,
      teacherReviewQueue: true,
      studentProgress: true,
      parentWorkspace: true,
      reviewerWorkspace: true,
      specialEducation: true,
      NGOWorkspace: true,
      educationGovernmentWorkspace: true,
      communityWorkspace: true,
      ownerControlWorkspace: true,
      technicianWorkspace: true,
      mailbox: true,
      accessibility: true,
      pwaInstall: true,
      connectivityStatus: true,
      buyPlansFrontPageNoticeOnly: true,
      paymentsLockedDuringPilot: true,
      productionLockedDuringPilot: true
    },
    runtimeFeatures: [
      "registration","prototypeAccess","learningLevel","subject","term",
      "capability","dailyActivities","practice","assessment","coverage",
      "alphabetAssessment","phonicsAssessment","teacherDashboard",
      "parentDashboard","specialEducation","reviewer","voice","accessibility",
      "mailbox","progress","countryLanguage","teacherDailyActivities",
      "blindAttempts","curriculumCoverage","dailyProgress","teacherReview",
      "studentProgress","aiPlayback","externalReviewer","connectivity",
      "offlineSync","pwaInstall","futureSafeRepair","englishActivities",
      "mathActivities","phonicsActivities","daily365","backNavigation",
      "pageHiding","mandatoryRegistration","roleWorkspaces","ownerControl",
      "technicianWorkspace","communityWorkspace","ngoWorkspace",
      "educationGovernmentWorkspace"
    ]
  };

  function get(){ return CONTRACT; }

  function audit(){
    var missingPages=[], missingNext=[];
    CONTRACT.flow.forEach(function(item){
      if(!document.getElementById(item[1])) missingPages.push(item[1]);
    });
    CONTRACT.next.forEach(function(id){
      if(!document.getElementById(id)) missingNext.push(id);
    });
    var result={
      version:CONTRACT.version,
      protectedBaseline:CONTRACT.protectedBaseline,
      navigationOwner:CONTRACT.navigationOwner,
      pagesOk:missingPages.length===0,
      nextIdsOk:missingNext.length===0,
      missingPages:missingPages,
      missingNextIds:missingNext
    };
    document.documentElement.setAttribute("data-pe-conversation-contract",CONTRACT.version);
    document.body.setAttribute("data-pe-conversation-contract-audit",
      result.pagesOk && result.nextIdsOk ? "pass" : "attention");
    window.PacificEducationConversationContractAudit=result;
    return result;
  }

  window.PacificEducationConversationContract = {
    version:CONTRACT.version,
    get:get,
    audit:audit
  };

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",audit);
  }else{
    audit();
  }
})(window);
