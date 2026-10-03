/* Pacific Education — Single Page-by-Page Voice Controller
 * Uses the proven v1019/native voice engine from #855.
 * One controller owns automatic page announcements, manual Voice Instruction,
 * and guided Next navigation across the pilot flow and major workspaces.
 */
(function(window, document){
  "use strict";

  var STEP_PAGES = [
    { step: 0, id: "pacificEducationWelcome", label: "Welcome", text: "Welcome to Pacific Education. We are pleased to welcome you. Learn, discover, practise and grow with us. Press Next to begin." },
    { step: 1, id: "pacificEducationIdentityRegistration", label: "Registration", text: "Pacific Education registration. Complete the required pilot registration information. When you are ready, press Next." },
    { step: 2, id: "prototypeAccess", label: "Prototype Access", text: "Pacific Education pilot access. Review the pilot information and continue when ready." },
    { step: 3, id: "levelSelection", label: "Learning Level", text: "Learning Level. Choose your class or learning level. Then continue to Subject." },
    { step: 4, id: "subjectSelection", label: "Subject", text: "Subject selection. Choose the subject you want to learn or review." },
    { step: 5, id: "termSelection", label: "Term", text: "Term selection. Choose the school term for your learning activities." },
    { step: 6, id: "capabilitySelection", label: "Learning Capability", text: "Learning capability. Choose the learning pathway or capability you are working on." },
    { step: 7, id: "dailyLesson", label: "Daily Activities", text: "Daily Activities. Your assigned learning activity is ready. Listen to the instructions and complete today's activity." },
    { step: 8, id: "dailyLessonPracticeStage", label: "Practice", text: "Practice. Complete the practice activity. You can use voice controls to hear the instructions and questions." },
    { step: 9, id: "assessments", label: "Assessment", text: "Assessment. Complete the assessment carefully. Questions and answer choices can be read aloud." },
    { step: 10, id: "teacherCalendarSection", label: "Teacher Calendar and Review", text: "Teacher Calendar and Review. Teachers can manage school dates, learning coverage and review information here." }
  ];

  var WORKSPACE_PAGES = [
    ["pacificEducationAppTools", "Learning Tools", "Learning Tools. Choose an available learning tool."],
    ["pacificEducationSchoolIdentitySection", "School Identity", "School identity. Review the school and class information."],
    ["teacherDashboard", "Teacher Workspace", "Teacher workspace. Review classes, learners, activities, calendar and coverage."],
    ["parentDashboard", "Parent and Caregiver Workspace", "Parent and caregiver workspace. Review learner progress and available family support."],
    ["specialEducationDashboard", "Special Education", "Special Education workspace. Review supported learning needs and evidence routing."],
    ["studentProgressDashboard", "Student Progress", "Student progress. Review learning progress, evidence and coverage."],
    ["pacificEducationStudentProgressDashboard", "Student Progress Dashboard", "Student progress dashboard. Review learning progress and coverage."],
    ["pacificGuardianCommentSection", "Guardian Review", "Pacific Guardian review. Review comments and administrative support information."],
    ["pacificEducationExternalReviewerPortal", "External Reviewer", "External reviewer portal. Review curriculum evidence, activities, assessments and comments."],
    ["pacificEducationHomeSubmission", "Home Evidence", "Home evidence. Review and submit learning evidence for teacher approval."],
    ["pacificEducationWeekendHolidaySupplementaryActivities", "Supplementary Activities", "Supplementary activities. Review weekend and holiday learning activities."],
    ["pacificEducationExamCalendarSection", "Exam Calendar", "Exam calendar. Review scheduled examination information."],
    ["pacificEducationAppStudentSchoolCalendar", "Student School Calendar", "Student school calendar. Review dates provided by the teacher or school."],
    ["assessments", "Assessments", "Assessments. Choose an assessment and follow the spoken instructions."],
    ["dailyLesson", "Daily Activities", "Daily Activities. Complete the assigned activity for the current learning day."],
    ["dailyLessonPracticeStage", "Practice", "Practice. Complete the practice task and use Listen when you need the question read aloud."]
  ];

  var lastAnnouncementKey = "";
  var announcementTimer = null;
  var installed = false;

  function speak(text){
    text = String(text || "").trim();
    if(!text) return false;
    try{
      if(window.PacificEducationSpeech && typeof window.PacificEducationSpeech.speakText === "function"){
        return window.PacificEducationSpeech.speakText(text);
      }
      if(typeof window.speakText === "function") return window.speakText(text);
    }catch(error){
      console.warn("Pacific Education page voice failed:", error);
    }
    return false;
  }

  function stop(){
    try{
      if(window.PacificEducationSpeech && typeof window.PacificEducationSpeech.stopSpeech === "function"){
        window.PacificEducationSpeech.stopSpeech();
        return;
      }
      if(window.speechSynthesis) window.speechSynthesis.cancel();
    }catch(_){ }
  }

  function currentStep(){
    var body = document.body;
    if(!body) return null;
    var value = Number(body.getAttribute("data-pe-flow-step"));
    return Number.isFinite(value) ? value : null;
  }

  function pageForStep(step){
    for(var i=0;i<STEP_PAGES.length;i++) if(STEP_PAGES[i].step === step) return STEP_PAGES[i];
    return null;
  }

  function visibleElement(id){
    var el = document.getElementById(id);
    if(!el) return null;
    if(el.hidden) return null;
    var style = window.getComputedStyle ? window.getComputedStyle(el) : null;
    if(style && (style.display === "none" || style.visibility === "hidden")) return null;
    return el;
  }

  function addVoiceControl(host, text){
    if(!host || host.querySelector("[data-pe-page-voice-control]")) return;
    var wrap = document.createElement("div");
    wrap.setAttribute("data-pe-page-voice-control","true");
    wrap.style.cssText = "display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:12px 0;padding:10px;border:2px solid currentColor;border-radius:8px;";

    var voice = document.createElement("button");
    voice.type = "button";
    voice.textContent = "🔊 Voice Instruction";
    voice.setAttribute("aria-label","Read this Pacific Education page aloud");
    voice.addEventListener("click", function(){ speak(text); });

    var stopButton = document.createElement("button");
    stopButton.type = "button";
    stopButton.textContent = "⏹ Stop Voice";
    stopButton.setAttribute("aria-label","Stop Pacific Education voice");
    stopButton.addEventListener("click", stop);

    var status = document.createElement("span");
    status.setAttribute("role","status");
    status.setAttribute("aria-live","polite");
    status.textContent = "Voice active. Page instructions are read automatically.";

    wrap.appendChild(voice);
    wrap.appendChild(stopButton);
    wrap.appendChild(status);
    host.insertBefore(wrap, host.firstChild);
  }

  function announcePage(page, reason){
    if(!page) return false;
    var key = String(page.step) + ":" + String(page.id) + ":" + String(reason || "auto");
    if(key === lastAnnouncementKey) return false;
    lastAnnouncementKey = key;
    var target = document.getElementById(page.id);
    if(target) addVoiceControl(target, page.text);
    if(announcementTimer) clearTimeout(announcementTimer);
    announcementTimer = setTimeout(function(){ speak(page.text); }, reason === "startup" ? 500 : 180);
    return true;
  }

  function announceCurrentStep(reason){
    var page = pageForStep(currentStep());
    if(!page) return false;
    return announcePage(page, reason || "step");
  }

  function installStepWatcher(){
    var body = document.body;
    if(!body || body.getAttribute("data-pe-voice-watcher") === "true") return;
    body.setAttribute("data-pe-voice-watcher","true");
    var lastStep = currentStep();
    var observer = new MutationObserver(function(){
      var step = currentStep();
      if(step !== lastStep){
        lastStep = step;
        announceCurrentStep("step");
      }
    });
    observer.observe(body,{attributes:true,attributeFilter:["data-pe-flow-step","class"],subtree:false});
  }

  function installWorkspaceWatcher(){
    var body = document.body;
    if(!body || body.getAttribute("data-pe-workspace-voice-watcher") === "true") return;
    body.setAttribute("data-pe-workspace-voice-watcher","true");
    var lastId = "";
    function scan(){
      for(var i=0;i<WORKSPACE_PAGES.length;i++){
        var item = WORKSPACE_PAGES[i];
        var el = visibleElement(item[0]);
        if(!el) continue;
        var key = item[0];
        if(key === lastId) return;
        lastId = key;
        addVoiceControl(el,item[2]);
        speak(item[2]);
        return;
      }
    }
    var observer = new MutationObserver(function(){
      window.clearTimeout(observer._timer);
      observer._timer = window.setTimeout(scan,120);
    });
    observer.observe(body,{childList:true,subtree:true,attributes:true,attributeFilter:["hidden","style","class"]});
    window.setTimeout(scan,350);
  }

  function installNextSafety(){
    var ids=["welcomeNextButton","registrationNextButton","prototypeNextButton","levelNextButton","subjectNextButton","termNextButton","capabilityNextButton","dailyNextButton","practiceNextButton","assessmentNextButton"];
    ids.forEach(function(id){
      var button=document.getElementById(id);
      if(!button || button.getAttribute("data-pe-voice-next") === "true") return;
      button.setAttribute("data-pe-voice-next","true");
      button.setAttribute("aria-label","Next page. The next page will be read aloud.");
    });
  }

  function enforce(){
    installNextSafety();
    installStepWatcher();
    installWorkspaceWatcher();
    announceCurrentStep("startup");
    return true;
  }

  function init(){
    if(installed) return;
    installed=true;
    enforce();
    window.setTimeout(enforce,500);
    window.setTimeout(enforce,1200);
  }

  window.PacificEducationMandatoryVoiceNavigation = {
    speak:speak,
    stop:stop,
    announceCurrentStep:announceCurrentStep,
    announcePage:announcePage,
    enforce:enforce,
    pages:STEP_PAGES
  };

  window.PacificEducationPageVoice = window.PacificEducationMandatoryVoiceNavigation;

  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded",init);
  else init();
})(window,document);
