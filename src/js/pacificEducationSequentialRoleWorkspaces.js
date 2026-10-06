/* Pacific Education — mandatory sequential role workspaces.
 * Each registered user receives only the pages permitted for that role.
 * Next advances to a new application page; it never scrolls through the old page.
 * This layer is additive and preserves the protected #856 speech controller.
 */
(function(window, document){
  "use strict";

  var ROLE_SEQUENCES = {
    "student":[
      ["studentStartLearning","Start Learning"],
      ["levelSelection","Class / Level"],
      ["subjectSelection","Subject"],
      ["termSelection","Term"],
      ["dailyLesson","Daily Activities"],
      ["dailyLessonPracticeStage","Practice"],
      ["assessments","Assessments"],
      ["pacificEducationCoverageDashboard","Curriculum Coverage"],
      ["pacificEducationStudentProgressDashboard","My Progress"],
      ["pacificEducationHomeSubmission","Home Continuity"],
      ["pacificEducationWeekendHolidaySupplementaryActivities","Weekend & Holiday Activities"]
    ],
    "blind-learner":[
      ["studentStartLearning","Voice-Guided Learning"],
      ["levelSelection","Class / Level"],
      ["subjectSelection","Subject"],
      ["termSelection","Term"],
      ["dailyLesson","Voice-Guided Daily Activities"],
      ["dailyLessonPracticeStage","Voice Practice"],
      ["assessments","Assessments — Original Response Protected"],
      ["pacificEducationStudentProgressDashboard","My Progress"],
      ["pacificEducationHomeSubmission","Home Continuity"]
    ],
    "deaf-learner":[
      ["studentStartLearning","Visual Learning"],
      ["levelSelection","Class / Level"],
      ["subjectSelection","Subject"],
      ["termSelection","Term"],
      ["dailyLesson","Visual Daily Activities"],
      ["dailyLessonPracticeStage","Visual Practice"],
      ["assessments","Assessments"],
      ["pacificEducationStudentProgressDashboard","My Progress"],
      ["pacificEducationHomeSubmission","Home Continuity"]
    ],
    "teacher":[
      ["teacherDashboard","Teacher Dashboard"],
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
      ["pacificEducationWeekendHolidaySupplementaryActivities","Weekend & Holiday Support"],
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
      ["learningPlatform","Education Services"],
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
  var PROTECTED = {"buyPlans":1,"pacificEducationPaymentLinksAlways":1,"pacificEducationInstitutionFees":1,"pacificEducationUniversityFeeWorkflow":1,"pacificEducationAccessEntitlement":1};\n  var movedTargets = [];

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

  function hideApplicationChildren(app, except){
    Array.prototype.forEach.call(app.children,function(el){
      if(el===except || el.id==="pacificEducationSequentialRoleWorkspace") return;
      if(PROTECTED[el.id]) return;
      el.hidden=true;
      el.setAttribute("data-pe-sequential-hidden","true");
    });
  }

  function restorePrevious(el){
    if(!el) return;
    el.hidden=false;
    el.removeAttribute("data-pe-sequential-hidden");
    if(el.parentNode && el.dataset.peSequentialMoved==="true"){
      el.dataset.peSequentialMoved="false";
    }
  }

  function moveTargetIntoPage(target,page){
    if(!target) return false;
    target.hidden=false;
    target.removeAttribute("data-pe-sequential-hidden");
    target.setAttribute("data-pe-sequential-page","active");
    target.dataset.peSequentialMoved="true";
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
    shell.id="pacificEducationSequentialRoleWorkspace";
    shell.setAttribute("aria-label","Sequential "+role+" workspace");
    shell.style.cssText="margin:0;padding:20px;border:3px solid #15803d;border-radius:10px;";
    shell.innerHTML="<h2 id=\"peSequentialTitle\"></h2><p id=\"peSequentialProgress\" role=\"status\" aria-live=\"polite\"></p><div id=\"peSequentialPage\" tabindex=\"-1\"></div><div style=\"margin-top:18px;display:flex;justify-content:flex-start;gap:10px;\"><button type=\"button\" id=\"peSequentialNext\" style=\"background:#15803d;color:#fff;padding:14px 20px;font-weight:700;border-radius:8px;\">➡️ Next</button></div><p id=\"peSequentialStatus\" role=\"status\" aria-live=\"polite\"></p><div id=\"peSequentialSignOut\" style=\"margin-top:28px;padding-top:18px;border-top:2px solid currentColor;\"><button type=\"button\" id=\"peSequentialSignOutButton\" style=\"padding:13px 18px;font-weight:700;\">🔴 Sign Out</button><div id=\"peSequentialSignOutConfirm\" hidden style=\"margin-top:10px;padding:12px;border:2px solid currentColor;\"><p>Are you sure you want to sign out?</p><button type=\"button\" id=\"peSequentialSignOutYes\">✓ Confirm Sign Out</button> <button type=\"button\" id=\"peSequentialSignOutNo\">Cancel</button></div></div>";
    app.insertBefore(shell,app.firstChild);

    var title=document.getElementById("peSequentialTitle");
    var progress=document.getElementById("peSequentialProgress");
    var page=document.getElementById("peSequentialPage");
    var next=document.getElementById("peSequentialNext");
    var status=document.getElementById("peSequentialStatus");
    var index=0;

    function renderPage(){
      page.innerHTML="";
      var item=sequence[index];
      var target=document.getElementById(item[0]);
      title.textContent=(role==="student"?"Student":role==="blind-learner"?"Blind Learner":role==="deaf-learner"?"Deaf Learner":role.replace(/-/g," "))+" Workspace — "+item[1];
      progress.textContent="Step "+(index+1)+" of "+sequence.length;
      status.textContent="";
      next.textContent=index===sequence.length-1?"Finish":"➡️ Next";
      if(target){
        moveTargetIntoPage(target,page);
      }else{
        var placeholder=document.createElement("div");
        placeholder.style.cssText="padding:16px;border:1px dashed currentColor;border-radius:8px;";
        placeholder.innerHTML="<strong>"+item[1]+"</strong><p>This eligible workspace page is ready for the next connected pilot feature.</p>";
        page.appendChild(placeholder);
      }
      try{ shell.focus(); }catch(e){}
      speak("Step "+(index+1)+" of "+sequence.length+". "+item[1]+". Follow this page, then press Next.");
    }

    next.onclick=function(){
      if(index<sequence.length-1){
        index++;
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
        sessionStorage.removeItem("pacificEducationPilotRole");
        sessionStorage.removeItem("pacificEducationActiveRole");
        sessionStorage.removeItem("pilotRegistrationRole");
        sessionStorage.removeItem("pilotRegistrationName");
      }catch(e){}
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
      speak("You are signed out. User Registration is ready for the next user.");
    };

    hideApplicationChildren(app,shell);
    shell.hidden=false;
    renderPage();
  }

  function bind(){
    var select=document.getElementById("pilotRoleSelector");
    if(!select) return;
    select.addEventListener("change",function(){
      setTimeout(function(){ build(select.value||getRole()); },0);
    },true);
    var role=getRole();
    if(role) setTimeout(function(){build(role);},100);
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",bind);
  else bind();

  window.PacificEducationSequentialRoleWorkspaces={
    version:"1.0.0",
    roles:Object.keys(ROLE_SEQUENCES),
    learnerRoles:LEARNER_ROLES,
    build:build
  };
})(window,document);
