/* Pacific Education — mandatory sequential role workspaces.
 * Each registered user receives only the pages permitted for that role.
 * Next advances to a new application page; it never scrolls through the old page.
 * This layer is additive and preserves the protected #856 speech controller.
 */
(function(window, document){
  "use strict";

  var ROLE_SEQUENCES = {
    "student":[
      ["learningPlatform","Student Workspace"],
      ["pacificEducationInitialCapabilityTest","Capability & Ability Test"],
      ["pacificEducationInitialCapabilityResult","Capability Result"],
      ["levelSelection","Class / Level"],
      ["subjectSelection","Subject"],
      ["termSelection","Term"],
      ["capabilitySelection","Learning Capability"],
      ["dailyLesson","Day 1 of 365"],
      ["dailyLessonPracticeStage","Practice"],
      ["assessments","Assessments"],
      ["pacificEducationCoverageDashboard","Curriculum Coverage"],
      ["pacificEducationStudentProgressDashboard","My Progress"],
      ["pacificEducationHomeSubmission","Home Continuity"],
      ["pacificEducationWeekendHolidaySupplementaryActivities","Weekend & Holiday Activities"]
    ],
    "blind-learner":[
      ["learningPlatform","Voice-Guided Student Workspace"],
      ["pacificEducationInitialCapabilityTest","Capability & Ability Test"],
      ["pacificEducationInitialCapabilityResult","Capability Result"],
      ["levelSelection","Class / Level"],
      ["subjectSelection","Subject"],
      ["termSelection","Term"],
      ["capabilitySelection","Capability"],
      ["dailyLesson","Voice-Guided Daily Activities"],
      ["dailyLessonPracticeStage","Voice Practice"],
      ["assessments","Assessments — Original Response Protected"],
      ["pacificEducationStudentProgressDashboard","My Progress"],
      ["pacificEducationHomeSubmission","Home Continuity"]
    ],
    "deaf-learner":[
      ["learningPlatform","Visual Student Workspace"],
      ["pacificEducationInitialCapabilityTest","Capability & Ability Test"],
      ["pacificEducationInitialCapabilityResult","Capability Result"],
      ["levelSelection","Class / Level"],
      ["subjectSelection","Subject"],
      ["termSelection","Term"],
      ["capabilitySelection","Capability"],
      ["dailyLesson","Visual Daily Activities"],
      ["dailyLessonPracticeStage","Visual Practice"],
      ["assessments","Assessments"],
      ["pacificEducationStudentProgressDashboard","My Progress"],
      ["pacificEducationHomeSubmission","Home Continuity"]
    ],
    "teacher":[
      ["teacherDashboard","Teacher Workspace"],
      ["pacificEducationTeacherCapabilityTest","Teacher Capability & Platform Test"],
      ["pacificEducationTeacherCapabilityResult","Teacher Capability Result"],
      ["pacificEducationTeacherClassDashboard","My Classes"],
      ["teacherCalendarSection","Teacher Calendar"],
      ["pacificEducationTeacherEvidence","Student Evidence"],
      ["assessments","Assessment Review"],
      ["pacificEducationCoverageDashboard","Curriculum Coverage"],
      ["pacificEducationStudentProgressDashboard","Student Progress"],
      ["pacificGuardianCommentSection","Teacher/Guardian Communication"]
    ],
    "parent":[
      ["parentDashboard","My Child"],
      ["pacificGuardianCommentSection","Teacher Communication"],
      ["pacificEducationStudentProgressDashboard","Child Progress"]
    ],
    "professional":[
      ["pacificEducationExternalReviewerPortal","Reviewer Portal"],
      ["pacificEducationExternalSpecialistReviewEvidenceRegistry","Review Evidence"],
      ["pacificEducationExternalSpecialistReviewEvidenceLog","Review Evidence Log"],
      ["pacificEducationWebsitePilotChecklist","Pilot Verification"]
    ],
    "ngo":[
      ["pacificEducationWebsitePilotChecklist","Program / Pilot Overview"],
      ["pacificEducationTeacherEvidence","Program Evidence"],
      ["pacificGuardianCommentSection","Feedback & Support"]
    ],
    "education":[
      ["pacificEducationCurriculumMasterControlStatus","Curriculum Control"],
      ["pacificEducationCurriculumEvidenceRegistry","Evidence Registry"],
      ["pacificEducationCurriculumEvidenceTraceability","Evidence Traceability"],
      ["pacificEducationCoverageDashboard","Education Coverage"]
    ],
    "community":[
      ["pacificEducationWebsitePilotChecklist","Pilot Information"],
      ["pacificGuardianCommentSection","Community Feedback"]
    ],
    "head-of-school":[
      ["pacificEducationSchoolIdentitySection","School Identity"],
      ["pacificEducationTeacherClassRoster","Class Lists — View Only"],
      ["pacificEducationExamCalendarSection","School Examination Calendar"],
      ["pacificEducationCoverageDashboard","School Curriculum Coverage"]
    ],
    "institution-admin":[
      ["pacificEducationInstitutionSetup","Institution Setup"],
      ["pacificEducationInstitutionAdvice","Institution Advice"],
      ["pacificEducationExamCalendarSection","Examination Calendar"]
    ],
    "special-education":[
      ["specialEducationDashboard","Inclusion Dashboard"],
      ["pacificEducationTeacherClassDashboard","Learner / Class"],
      ["specialEducationReviewEvidence","Review Evidence"],
      ["pacificEducationHomeSubmission","Home Evidence"],
      ["pacificEducationStudentProgressDashboard","Learner Progress"]
    ],
    "owner":[
      ["systemStatus","System Status"],
      ["pacificEducationWebsitePilotChecklist","Pilot Governance"],
      ["pacificEducationProductionReleaseChecklist","Production Release Checklist"],
      ["pacificEducationProductionReleaseEvidenceRegistry","Release Evidence"],
      ["pacificEducationProductionReleaseEvidenceGate","Release Evidence Gate"],
      ["publicationStatus","Publication Status"],
      ["pacificEducationOfflineSyncStatus","Offline / Sync Status"]
    ],
    "technician":[
      ["pacificEducationTechnicianWorkspace","Technician Workspace"],
      ["systemStatus","System Diagnostics"],
      ["publicationStatus","Deployment / Publication Status"]
    ]
  };

  var LEARNER_ROLES = {"student":1,"blind-learner":1,"deaf-learner":1};
  var PROTECTED = {"buyPlans":1,"pacificEducationPaymentLinksAlways":1,"pacificEducationInstitutionFees":1,"pacificEducationUniversityFeeWorkflow":1,"pacificEducationAccessEntitlement":1};
  var SESSION_KEYS = ["pacificEducationPilotRegistration","pacificEducationPilotRole","pacificEducationActiveRole","pilotRegistrationRole","pilotRegistrationName","pacificEducationPilotCountry","pacificEducationPilotCountryName","pacificEducationPilotRegistered","pacificEducationUserRegistrationLanguageV1"];
  var LOCAL_SESSION_KEYS = ["pacificEducationRegistrationCountryCode","pacificEducationRegistrationCountry","pacificEducationRegistrationLanguage","pacificEducationVoiceLocale","pacificEducationCurriculumCountryCode","pacificEducationCurriculumCountry"];
  var SHARED = {"pacificEducationAIPlaybackButton":1,"pacificEducationWelcomeVoiceButton":1,"pacificEducationStopSpeechButton":1,"pacificEducationAccessibilityControls":1,"pacificEducationAppMenu":1,"pacificEducationWorkspaceLiveStatus":1};
  var movedTargets = [];

  function speak(text){
    if(window.PacificEducationSpeech && typeof window.PacificEducationSpeech.speakText==="function"){
      try{ window.PacificEducationSpeech.speakText(text); }catch(e){}
    }
  }

  function getRole(){
    var role="";
    try{ role=sessionStorage.getItem("pacificEducationPilotRole")||""; }catch(e){}
    var select=document.getElementById("pilotRoleSelector");
    if(!role && select) role=select.value||"";
    return role;
  }

  function hideProtected(){
    Object.keys(PROTECTED).forEach(function(id){
      var el=document.getElementById(id);
      if(el){el.hidden=true;el.setAttribute("data-pe-protected","true");try{el.style.setProperty("display","none","important");}catch(e){}}
    });
  }

  function hideApplicationChildren(app, except){
    Array.prototype.forEach.call(app.children,function(el){
      if(el===except || el.id==="pacificEducationSequentialRoleWorkspace" || SHARED[el.id]) return;
      if(PROTECTED[el.id]){el.hidden=true;el.setAttribute("data-pe-protected","true");try{el.style.setProperty("display","none","important");}catch(e){};return;}
      el.hidden=true;
      el.setAttribute("data-pe-sequential-hidden","true");
    });
    hideProtected();
  }

  function rememberOriginal(target){
    if(!target || target.dataset.peSequentialOriginal==="true") return;
    var parent=target.parentNode;
    if(!parent) return;
    target.__peSequentialOriginalParent=parent;
    target.__peSequentialOriginalNextSibling=target.nextSibling;
    target.dataset.peSequentialOriginal="true";
  }

  function restoreMovedTarget(target){
    if(!target || target.dataset.peSequentialOriginal!=="true") return;
    var parent=target.__peSequentialOriginalParent;
    if(parent){
      var next=target.__peSequentialOriginalNextSibling;
      if(next && next.parentNode===parent) parent.insertBefore(target,next);
      else parent.appendChild(target);
    }
    target.hidden=true;
    target.removeAttribute("data-pe-sequential-page");
    target.dataset.peSequentialMoved="false";
    target.setAttribute("data-pe-sequential-hidden","true");
  }

  function restoreAllMovedTargets(){
    movedTargets.forEach(restoreMovedTarget);
  }

  function moveTargetIntoPage(target,page){
    if(!target) return false;
    rememberOriginal(target);
    target.hidden=false;
    target.removeAttribute("data-pe-sequential-hidden");
    target.setAttribute("data-pe-sequential-page","active");
    target.dataset.peSequentialMoved="true";
    if(movedTargets.indexOf(target)===-1) movedTargets.push(target);
    page.appendChild(target);
    return true;
  }

  function build(role){
    var app=document.getElementById("app");
    if(!app) return;
    var sequence=ROLE_SEQUENCES[role];
    if(!sequence) return;

    var old=document.getElementById("pacificEducationSequentialRoleWorkspace");
    if(old) old.remove();

    var shell=document.createElement("section");
    shell.id="pacificEducationSequentialRoleWorkspace"; shell.setAttribute("data-pe-role",role);
    shell.setAttribute("aria-label","Sequential "+role+" workspace");
    shell.style.cssText="margin:0;padding:20px;border:3px solid #15803d;border-radius:10px;";
    shell.innerHTML="<h2 id=\"peSequentialTitle\"></h2><p id=\"peSequentialProgress\" role=\"status\" aria-live=\"polite\"></p><div id=\"peSequentialPage\" tabindex=\"-1\"></div><div style=\"margin-top:18px;display:flex;justify-content:flex-start;gap:10px;flex-wrap:wrap;\"><button type=\"button\" id=\"peSequentialBack\" style=\"background:#fff;padding:14px 20px;font-weight:700;border-radius:8px;\">⬅️ Back</button><button type=\"button\" id=\"peSequentialNext\" style=\"background:#15803d;color:#fff;padding:14px 20px;font-weight:700;border-radius:8px;\">➡️ Next</button></div><p id=\"peSequentialStatus\" role=\"status\" aria-live=\"polite\"></p><div id=\"peSequentialSignOut\" style=\"margin-top:28px;padding-top:18px;border-top:2px solid currentColor;\"><button type=\"button\" id=\"peSequentialSignOutButton\" style=\"padding:13px 18px;font-weight:700;\">🔴 Sign Out</button><div id=\"peSequentialSignOutConfirm\" hidden style=\"margin-top:10px;padding:12px;border:2px solid currentColor;\"><p>Are you sure you want to sign out?</p><button type=\"button\" id=\"peSequentialSignOutYes\">✓ Confirm Sign Out</button> <button type=\"button\" id=\"peSequentialSignOutNo\">Cancel</button></div></div>";
    app.insertBefore(shell,app.firstChild);

    var title=document.getElementById("peSequentialTitle");
    var progress=document.getElementById("peSequentialProgress");
    var page=document.getElementById("peSequentialPage");
    var back=document.getElementById("peSequentialBack");
    var next=document.getElementById("peSequentialNext");
    restoreAllMovedTargets();
    var status=document.getElementById("peSequentialStatus");
    var index=0;
    var dailyDay=1;

    function renderPage(){
      restoreAllMovedTargets();
      page.innerHTML="";
      var item=sequence[index];
      if(item[0]==="dailyLesson") item=[item[0],"Day "+dailyDay+" of 365"];
      var target=document.getElementById(item[0]);
      if(!target){
        if(item[0]==="pacificEducationExternalReviewerPortal" && window.PacificEducationProductionAppShell && typeof window.PacificEducationProductionAppShell.ensureExternalReviewerPortal==="function") window.PacificEducationProductionAppShell.ensureExternalReviewerPortal();
        if((item[0]==="pacificEducationInstitutionSetup" || item[0]==="pacificEducationInstitutionAdvice") && window.PacificEducationInstitutionSetup && typeof window.PacificEducationInstitutionSetup.render==="function") window.PacificEducationInstitutionSetup.render();
        if(item[0]==="pacificEducationExamCalendarSection" && window.PacificEducationRevisionExamRedistributionUI && typeof window.PacificEducationRevisionExamRedistributionUI.render==="function") window.PacificEducationRevisionExamRedistributionUI.render("pacificEducationExamCalendarSection");
        if(item[0]==="pacificEducationWeekendHolidaySupplementaryActivities" && window.PacificEducationPilotUserWorkspaces && typeof window.PacificEducationPilotUserWorkspaces.ensureWeekendHolidaySupplementarySection==="function") window.PacificEducationPilotUserWorkspaces.ensureWeekendHolidaySupplementarySection();
        target=document.getElementById(item[0]);
      }
      if(target && PROTECTED[item[0]]) target=null;
      title.textContent="STEP "+(index+1)+" — "+(role==="student"?"Student":role==="blind-learner"?"Blind Learner":role==="deaf-learner"?"Deaf Learner":role.replace(/-/g," "))+" Workspace — "+item[1];
      progress.textContent="STEP "+(index+1)+" OF "+sequence.length+" — Follow the numbered order";
      status.textContent="";
      back.disabled=index===0;
      back.setAttribute("aria-label",index===0?"Back unavailable on first workspace page":"Back to "+(sequence[index-1] ? sequence[index-1][1] : "previous page"));
      back.disabled=index===0;
      next.textContent=index===sequence.length-1?"Finish":"➡️ Next";
      if(target){
        moveTargetIntoPage(target,page);

        /*
         * Student-facing key activity shortcuts.
         * These shortcuts do not bypass registration, class, term or capability
         * selection because they are rendered only inside the authorized
         * sequential Daily Activities page.
         */
        if((role==="student" || role==="blind-learner" || role==="deaf-learner") && item[0]==="dailyLesson"){
          var activityNav=document.createElement("div");
          activityNav.id="peKeyLearningActivityShortcuts";
          activityNav.setAttribute("aria-label","Key learning activities");
          activityNav.style.cssText="margin:14px 0;padding:14px;border:2px solid currentColor;border-radius:10px;";
          activityNav.innerHTML="<h3 style=\"margin-top:0\">Key Learning Activities</h3><p>Choose a key activity. Your existing class, term and learning pathway remain in control.</p>"+
            "<div style=\"display:flex;gap:8px;flex-wrap:wrap\">"+
            "<button type=\"button\" id=\"peEnglishActivityShortcut\">📘 English</button>"+
            "<button type=\"button\" id=\"peMathematicsActivityShortcut\">➗ Mathematics</button>"+
            "<button type=\"button\" id=\"pePhonicsActivityShortcut\">🔤 Phonics</button></div>"+
            "<p id=\"peKeyLearningActivityStatus\" role=\"status\" aria-live=\"polite\"></p>";
          page.insertBefore(activityNav,page.firstChild);
          function selectSubject(subject){
            var selector=window.PacificEducationSubjectSelector;
            var ok=selector && typeof selector.setSubject==="function" ? selector.setSubject(subject) : false;
            var status=document.getElementById("peKeyLearningActivityStatus");
            if(status) status.textContent=ok ? subject+" selected. Today's Daily Activity is refreshing." : "Select an existing Class Reference before changing subject.";
            if(ok){
              speak(subject+" selected. Your Daily Activity is refreshing.");
              if(typeof window.startDailyLesson==="function") window.startDailyLesson();
              else if(typeof window.displayDailyLesson==="function") window.displayDailyLesson();
            }
          }
          var english=document.getElementById("peEnglishActivityShortcut");
          var math=document.getElementById("peMathematicsActivityShortcut");
          var phonics=document.getElementById("pePhonicsActivityShortcut");
          if(english) english.onclick=function(){selectSubject("English");};
          if(math) math.onclick=function(){selectSubject("Mathematics");};
          if(phonics) phonics.onclick=function(){
            var status=document.getElementById("peKeyLearningActivityStatus");
            var assessment=window.startPhonicsAssessment;
            if(typeof assessment==="function"){
              status.textContent="Opening the existing Phonics Assessment.";
              speak("Opening Phonics Assessment.");
              assessment();
            }else if(status){
              status.textContent="Phonics Assessment is not connected yet.";
            }
          };
        }
      }else{
        var missing=document.createElement("div");
        missing.style.cssText="padding:16px;border:2px solid #b45309;border-radius:8px;";
        missing.innerHTML="<strong>"+item[1]+" is not connected yet.</strong><p>This page cannot be completed until its existing pilot feature is connected. No placeholder workspace is presented as a working feature.</p>";
        page.appendChild(missing);
        next.disabled=true;
      }
      if(target) next.disabled=false;
      try{
        var focusTitle=document.getElementById("peSequentialTitle");
        if(focusTitle){focusTitle.setAttribute("tabindex","-1");focusTitle.focus();}
        else shell.focus();
      }catch(e){}
      speak("Step "+(index+1)+" of "+sequence.length+". "+item[1]+". Follow this numbered step, then press Next.");
    }

    back.onclick=function(){
      if(index>0){
        index--;
        try{history.replaceState({pacificEducationSequential:true,role:role,index:index},"","#pacificEducationSequentialRoleWorkspace");}catch(e){}
        renderPage();
        speak("Back. Returning to the previous page. "+sequence[index][1]+".");
      }
    };

    next.onclick=function(){
      if(index<sequence.length-1){
        if(sequence[index][0]==="assessments" && (role==="student" || role==="blind-learner" || role==="deaf-learner")){
          if(dailyDay<365){ dailyDay++; index=sequence.findIndex(function(x){return x[0]==="dailyLesson";}); renderPage(); return; }
        }
        index++;
        try{history.pushState({pacificEducationSequential:true,role:role,index:index},"","#pacificEducationSequentialRoleWorkspace");}catch(e){}
        renderPage();
      }else{
        status.textContent="Workspace sequence complete.";
        speak("This workspace sequence is complete. You may sign out at the bottom.");
        document.getElementById("peSequentialSignOutButton").focus();
      }
    };

    document.getElementById("peSequentialSignOutButton").onclick=function(){
      document.getElementById("peSequentialSignOutConfirm").hidden=false;
      speak("Sign Out selected. Confirm Sign Out or Cancel.");
    };
    document.getElementById("peSequentialSignOutNo").onclick=function(){
      document.getElementById("peSequentialSignOutConfirm").hidden=true;
    };
    document.getElementById("peSequentialSignOutYes").onclick=function(){
      try{
        sessionStorage.removeItem("pacificEducationPilotRegistration");
        sessionStorage.removeItem("pacificEducationPilotRegistered");
        sessionStorage.removeItem("pacificEducationPilotRole");
        sessionStorage.removeItem("pacificEducationActiveRole");
        sessionStorage.removeItem("pilotRegistrationRole");
        sessionStorage.removeItem("pilotRegistrationName");
        SESSION_KEYS.forEach(function(key){try{sessionStorage.removeItem(key);}catch(e){}});
      LOCAL_SESSION_KEYS.forEach(function(key){try{localStorage.removeItem(key);}catch(e){}});
      }catch(e){}
      restoreAllMovedTargets();
      shell.remove();
      Array.prototype.forEach.call(app.children,function(el){
        if(el.getAttribute("data-pe-sequential-hidden")==="true"){
          el.hidden=false;
          el.removeAttribute("data-pe-sequential-hidden");
        }
      });
      var reg=document.getElementById("pacificEducationIdentityRegistration")||document.getElementById("userRegistrationForm");
      if(reg){
        reg.hidden=false;
        try{reg.scrollIntoView({behavior:"smooth",block:"start"});}catch(e){}
      }
      try{history.replaceState({pacificEducationSignedOut:true},"","#pacificEducationIdentityRegistration");}catch(e){}
      hideProtected();
      speak("You are signed out. User Registration is ready for the next user.");
    };

    hideApplicationChildren(app,shell);
    shell.hidden=false;
    try{history.replaceState({pacificEducationSequential:true,role:role,index:0},"","#pacificEducationSequentialRoleWorkspace");}catch(e){}
    renderPage();
    hideProtected();
  }

  function bind(){
    var selectors=[document.getElementById("pilotRoleSelector"),document.getElementById("singlePilotRole"),document.getElementById("pilotRegistrationRole")].filter(Boolean);
    selectors.forEach(function(select){
      if(select.getAttribute("data-pe-sequential-role-bound")==="true") return;
      select.setAttribute("data-pe-sequential-role-bound","true");
      select.addEventListener("change",function(){
        var chosen=select.value||getRole();
        var registered=false;
        try{registered=sessionStorage.getItem("pacificEducationPilotRegistered")==="true" || !!sessionStorage.getItem("pacificEducationPilotRegistration");}catch(e){}
        if(registered && chosen && ROLE_SEQUENCES[chosen]) setTimeout(function(){ if(!document.getElementById("pacificEducationSequentialRoleWorkspace")) build(chosen); },0);
      },true);
    });
    var role=getRole();
    if(!role){try{role=sessionStorage.getItem("pacificEducationPilotRole")||"";}catch(e){}}
    var registeredNow=false;
    try{registeredNow=sessionStorage.getItem("pacificEducationPilotRegistered")==="true" || !!sessionStorage.getItem("pacificEducationPilotRegistration");}catch(e){}
    if(role && registeredNow && ROLE_SEQUENCES[role]) setTimeout(function(){ if(!document.getElementById("pacificEducationSequentialRoleWorkspace")) build(role); },100);

    ["singlePilotRegisterButton","pilotRegistrationSaveButton"].forEach(function(id){
      var button=document.getElementById(id);
      if(!button || button.getAttribute("data-pe-sequential-register-bound")==="true") return;
      button.setAttribute("data-pe-sequential-register-bound","true");
      button.addEventListener("click",function(){
        setTimeout(function(){
          var registered=false, chosen=getRole();
          try{registered=sessionStorage.getItem("pacificEducationPilotRegistered")==="true" || !!sessionStorage.getItem("pacificEducationPilotRegistration");}catch(e){}
          if(registered && chosen && ROLE_SEQUENCES[chosen] && !document.getElementById("pacificEducationSequentialRoleWorkspace")) build(chosen);
        },0);
      },false);
    });

    window.addEventListener("popstate",function(event){
      var state=event.state||{};
      if(!state.pacificEducationSequential || state.role!==getRole()) return;
      var shell=document.getElementById("pacificEducationSequentialRoleWorkspace");
      if(!shell) return;
      var backButton=document.getElementById("peSequentialBack");
      if(backButton && state.index>=0){
        backButton.click();
      }
    });
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",bind);
  else bind();

  window.PacificEducationSequentialRoleWorkspaces={
    version:"1.2.0-numbered-user-sequence",
    roles:Object.keys(ROLE_SEQUENCES),
    learnerRoles:LEARNER_ROLES,
    build:build
  };
})(window,document);
