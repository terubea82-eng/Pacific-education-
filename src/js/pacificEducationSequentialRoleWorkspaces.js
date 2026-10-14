/* Pacific Education — mandatory sequential role workspaces.
 * Each registered user receives only the pages permitted for that role.
 * Next advances to a new application page; it never scrolls through the old page.
 * This layer is additive and preserves the protected #856 speech controller.
 */
(function(window, document){
  "use strict";

  /* Adjustable sequence configuration.
   * Keep stable step IDs; insert/remove/reorder only changes position.
   * Overrides are validated and persisted locally so future reshuffles do not
   * require rewriting navigation logic. Protected voice/payment controls remain
   * outside this configuration layer.
   */
  var ROLE_SEQUENCE_DEFAULTS = {
    "student":[
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
      ["pacificEducationPrivilegedAccessNotice","Owner access verification"]
    ],
    "technician":[
      ["pacificEducationPrivilegedAccessNotice","Technician access verification"]
    ]
  };
  var SEQUENCE_STORAGE_KEY = "paceduSequenceAdjustmentsV1";
  function cloneSequence(value){ try{return JSON.parse(JSON.stringify(value));}catch(e){return [];} }
  function validateSequence(sequence){
    var errors=[],seen={};
    if(!Array.isArray(sequence)||!sequence.length) return {valid:false,errors:["Sequence must contain at least one step."]};
    sequence.forEach(function(step,i){
      if(!Array.isArray(step)||typeof step[0]!=="string"||!step[0]||typeof step[1]!=="string"||!step[1]) errors.push("Invalid step at position "+(i+1)+".");
      else if(seen[step[0]]) errors.push("Duplicate step id: "+step[0]);
      else seen[step[0]]=true;
    });
    return {valid:errors.length===0,errors:errors};
  }
  function loadSequenceOverrides(){
    try{
      var raw=localStorage.getItem(SEQUENCE_STORAGE_KEY);
      if(!raw) return {};
      var data=JSON.parse(raw);
      return data && data.version==="1.0.0" && data.roles ? data.roles : {};
    }catch(e){return {};}
  }
  var ROLE_SEQUENCE_OVERRIDES=loadSequenceOverrides();
  function saveSequenceOverrides(){
    try{localStorage.setItem(SEQUENCE_STORAGE_KEY,JSON.stringify({version:"1.0.0",roles:ROLE_SEQUENCE_OVERRIDES}));return true;}catch(e){return false;}
  }
  var STUDENT_MANDATORY_STEPS=[
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
    "pacificEducationStudentProgressDashboard"
  ];
  function studentSequenceHasMandatoryOrder(sequence){
    if(!Array.isArray(sequence)) return false;
    var cursor=-1;
    for(var i=0;i<STUDENT_MANDATORY_STEPS.length;i++){
      var nextIndex=sequence.findIndex(function(step){return Array.isArray(step)&&step[0]===STUDENT_MANDATORY_STEPS[i];});
      if(nextIndex<=cursor) return false;
      cursor=nextIndex;
    }
    return true;
  }
  function getRoleSequence(role){
    var sequence=ROLE_SEQUENCE_OVERRIDES[role]||ROLE_SEQUENCE_DEFAULTS[role];
    /* Old saved sequence overrides must not silently bypass mandatory student steps. */
    if(role==="student" && !studentSequenceHasMandatoryOrder(sequence)) sequence=ROLE_SEQUENCE_DEFAULTS.student;
    return sequence?cloneSequence(sequence):[];
  }
  function setRoleSequence(role,sequence){
    var check=validateSequence(sequence);
    if(!check.valid) return check;
    if(role==="student" && !studentSequenceHasMandatoryOrder(sequence)){
      return {valid:false,errors:["Student sequence must retain the mandatory capability test, result, class/subject/term, daily activity, practice, assessment, curriculum coverage, and progress steps in order."]};
    }
    ROLE_SEQUENCE_OVERRIDES[role]=cloneSequence(sequence);
    saveSequenceOverrides();
    return {valid:true,sequence:getRoleSequence(role)};
  }
  function insertRoleStep(role,step,index){
    var sequence=getRoleSequence(role);
    if(!Array.isArray(step)||typeof step[0]!=="string"||typeof step[1]!=="string") return {valid:false,errors:["Step must be [stableId,label]."]};
    var position=typeof index==="number"?Math.max(0,Math.min(index,sequence.length)):sequence.length;
    sequence.splice(position,0,step);
    return setRoleSequence(role,sequence);
  }
  function removeRoleStep(role,stepId){
    var sequence=getRoleSequence(role),position=sequence.findIndex(function(step){return step[0]===stepId;});
    if(position<0) return {valid:false,errors:["Step not found: "+stepId]};
    sequence.splice(position,1);
    return setRoleSequence(role,sequence);
  }
  function moveRoleStep(role,stepId,newIndex){
    var sequence=getRoleSequence(role),from=sequence.findIndex(function(step){return step[0]===stepId;});
    if(from<0) return {valid:false,errors:["Step not found: "+stepId]};
    var step=sequence.splice(from,1)[0],to=Math.max(0,Math.min(Number(newIndex)||0,sequence.length));
    sequence.splice(to,0,step);
    return setRoleSequence(role,sequence);
  }
  function resetRoleSequence(role){
    delete ROLE_SEQUENCE_OVERRIDES[role]; saveSequenceOverrides(); return getRoleSequence(role);
  }


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

  function normalizeRole(value){
    var role=String(value||"").trim().toLowerCase().replace(/[_]+/g," ").replace(/\s+/g," ");
    var aliases={
      "blind learner":"blind-learner","blind-learner":"blind-learner",
      "deaf learner":"deaf-learner","deaf-learner":"deaf-learner",
      "student":"student","learner":"student",
      "teacher":"teacher",
      "parent":"parent","parent/caregiver":"parent","parent / caregiver":"parent",
      "professional reviewer":"professional","professional":"professional",
      "ngo/organization":"ngo","ngo / organization":"ngo","ngo":"ngo",
      "education/government":"education","education / government":"education","education":"education",
      "community/partner":"community","community / partner":"community","community":"community",
      "head of school":"head-of-school","head-of-school":"head-of-school",
      "institution administrator":"institution-admin","institution-admin":"institution-admin",
      "special education / inclusion":"special-education","special education/inclusion":"special-education","special-education":"special-education",
      "owner/control":"owner","owner / control":"owner","owner":"owner",
      "technician":"technician"
    };
    return aliases[role]||role.replace(/\s+/g,"-");
  }

  function getRole(){
    /* The verified registration record is authoritative. A stale companion
       role marker must not open a different user's workspace. */
    var role="";
    try{
      var raw=sessionStorage.getItem("pacificEducationPilotRegistration");
      var record=raw?JSON.parse(raw):null;
      role=normalizeRole(record && (record.role||record.userRole));
    }catch(e){}
    if(role && getRoleSequence(role).length) return role;
    try{ role=normalizeRole(sessionStorage.getItem("pacificEducationPilotRole")||""); }catch(e){}
    if(role && getRoleSequence(role).length) return role;
    var select=document.getElementById("pilotRoleSelector");
    if(select) role=normalizeRole(select.value||"");
    return role;
  }

  function hideProtected(){
    Object.keys(PROTECTED).forEach(function(id){
      var el=document.getElementById(id);
      if(el){el.hidden=true;el.setAttribute("data-pe-protected","true");try{el.style.setProperty("display","none","important");}catch(e){}}
    });
  }

  function setRoleWorkspaceIsolation(active){
    /* The legacy pilot activation stylesheet uses display:block!important on
       every feature section. The hidden attribute alone therefore cannot keep
       unrelated dashboards out of the sequential role workspace. Add a
       higher-specificity, scoped isolation rule while this workspace is active. */
    var style=document.getElementById("pacedu-role-workspace-isolation-style");
    if(!style){
      style=document.createElement("style");
      style.id="pacedu-role-workspace-isolation-style";
      document.head.appendChild(style);
    }
    /* Refresh the rules on every activation. A style element can survive a
       repeated handoff/rebuild in the same page; leaving its old text in place
       can retain stale guided-flow visibility rules and hide the new workspace. */
    style.textContent=
      "body.pe-sequential-role-workspace-active main{display:block!important;visibility:visible!important;}"+
      "body.pe-sequential-role-workspace-active main > #app{display:block!important;visibility:visible!important;}"+
      "body.pe-sequential-role-workspace-active #app{display:block!important;visibility:visible!important;}"+
      "body.pe-sequential-role-workspace-active #app > :not(#pacificEducationSequentialRoleWorkspace):not(#pacificEducationAppMenu):not(#pacificEducationAccessibilityControls):not(#pacificEducationWorkspaceLiveStatus){display:none!important;visibility:hidden!important;}"+
      "body.pe-sequential-role-workspace-active #app > #pacificEducationSequentialRoleWorkspace{display:block!important;visibility:visible!important;}"+
      "body.pe-sequential-role-workspace-active #pacificEducationWelcomeVoiceButton,body.pe-sequential-role-workspace-active #pacificEducationAIPlaybackButton{display:none!important;visibility:hidden!important;}"+
      "body.pe-sequential-role-workspace-active #app [data-pe-sequential-hidden='true']{display:none!important;visibility:hidden!important;}";
    document.body.classList.toggle("pe-sequential-role-workspace-active",!!active);
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
    var registeredRole=getRole();
    role=registeredRole && getRoleSequence(registeredRole).length ? registeredRole : normalizeRole(role);
    var sequence=getRoleSequence(role);
    if(!sequence || !sequence.length) return;
    /* Sign Out is a dedicated final page for every role, not an off-screen footer. */
    sequence=cloneSequence(sequence);
    sequence.push(["paceduSignOutPage","Sign Out"]);

    var old=document.getElementById("pacificEducationSequentialRoleWorkspace");
    if(old) old.remove();

    var shell=document.createElement("section");
    shell.id="pacificEducationSequentialRoleWorkspace"; shell.setAttribute("data-pe-role",role);
    shell.setAttribute("aria-label","Sequential "+role+" workspace");
    shell.style.cssText="margin:0;padding:20px;border:3px solid #15803d;border-radius:10px;";
    shell.innerHTML="<h2 id=\"peSequentialTitle\"></h2><p id=\"peSequentialProgress\" role=\"status\" aria-live=\"polite\"></p><div style=\"display:flex;gap:8px;flex-wrap:wrap;margin:12px 0;\"><button type=\"button\" id=\"peSequentialHear\" style=\"padding:12px 16px;font-weight:700;\">🔊 Hear This Page</button><button type=\"button\" id=\"peSequentialStop\" style=\"padding:12px 16px;font-weight:700;\">🔇 Stop Speech</button></div><div id=\"peSequentialPage\" tabindex=\"-1\"></div><div style=\"margin-top:18px;display:flex;justify-content:flex-start;gap:10px;flex-wrap:wrap;\"><button type=\"button\" id=\"peSequentialBack\" style=\"background:#fff;padding:14px 20px;font-weight:700;border-radius:8px;\">⬅️ Back</button><button type=\"button\" id=\"peSequentialNext\" style=\"background:#15803d;color:#fff;padding:14px 20px;font-weight:700;border-radius:8px;\">➡️ Next</button></div><p id=\"peSequentialStatus\" role=\"status\" aria-live=\"polite\"></p><div id=\"peSequentialSignOut\" hidden style=\"margin-top:28px;padding-top:18px;border-top:2px solid currentColor;\"><button type=\"button\" id=\"peSequentialSignOutButton\" style=\"padding:13px 18px;font-weight:700;\">🔴 Sign Out</button><div id=\"peSequentialSignOutConfirm\" hidden style=\"margin-top:10px;padding:12px;border:2px solid currentColor;\"><p>Are you sure you want to sign out?</p><button type=\"button\" id=\"peSequentialSignOutYes\">✓ Confirm Sign Out</button> <button type=\"button\" id=\"peSequentialSignOutNo\">Cancel</button></div></div>";
    app.insertBefore(shell,app.firstChild);

    var title=document.getElementById("peSequentialTitle");
    var progress=document.getElementById("peSequentialProgress");
    var page=document.getElementById("peSequentialPage");
    var back=document.getElementById("peSequentialBack");
    var next=document.getElementById("peSequentialNext");
    restoreAllMovedTargets();
    var status=document.getElementById("peSequentialStatus");
    var hear=document.getElementById("peSequentialHear");
    var stop=document.getElementById("peSequentialStop");
    var index=0;
    if(hear) hear.onclick=function(){ var item=sequence[index]; speak("Step "+(index+1)+" of "+sequence.length+". "+item[1]+". Follow this page, then press Next."); };
    if(stop) stop.onclick=function(){ try{ if(window.PacificEducationSpeech && typeof window.PacificEducationSpeech.stopSpeech==="function") window.PacificEducationSpeech.stopSpeech(); else if(window.speechSynthesis) window.speechSynthesis.cancel(); }catch(e){} };
    var dailyDay=1;


    /* Student daily activity starter: concrete English, Mathematics and Phonics
       tasks, with completion saved locally without replacing the existing lesson engine. */
    function addStudentDailyActivityStarter(day, host){
      if(!host || document.getElementById("peStudentDailyActivityStarter")) return;
      var panel=document.createElement("section");
      panel.id="peStudentDailyActivityStarter";
      panel.setAttribute("aria-label","Student daily learning activities");
      panel.style.cssText="margin:16px 0;padding:16px;border:2px solid #15803d;border-radius:10px;";
      panel.innerHTML="<h3>📚 Student Daily Activities — Day "+day+" of 365</h3>"+
        "<p>Choose one activity, practise it, then mark it complete. This is a starter activity set; your teacher's class, subject and term instructions still apply.</p>"+
        "<label for=\"peStudentDailySubject\"><strong>Subject</strong></label> "+
        "<select id=\"peStudentDailySubject\" style=\"display:block;width:100%;max-width:420px;padding:10px;margin:8px 0\">"+
        "<option value=\"English\">English</option><option value=\"Mathematics\">Mathematics</option><option value=\"Phonics\">Phonics</option></select>"+
        "<p><strong>Learning goal</strong></p><p id=\"peStudentDailyGoal\"></p>"+
        "<p><strong>Learn and practise</strong></p><p id=\"peStudentDailyTask\"></p>"+
        "<p><strong>Check your understanding</strong></p><p id=\"peStudentDailyCheck\"></p>"+
        "<button type=\"button\" id=\"peStudentDailyComplete\" style=\"padding:12px 16px;font-weight:700\">✓ Mark Activity Complete</button>"+
        "<p id=\"peStudentDailyStatus\" role=\"status\" aria-live=\"polite\">Your completion is saved on this device.</p>";
      host.appendChild(panel);
      var select=panel.querySelector("#peStudentDailySubject");
      var goal=panel.querySelector("#peStudentDailyGoal");
      var task=panel.querySelector("#peStudentDailyTask");
      var check=panel.querySelector("#peStudentDailyCheck");
      var status=panel.querySelector("#peStudentDailyStatus");
      var key="pacificEducationStudentDailyActivityProgressV1";
      var activities={
        English:{goal:"Use a greeting and a complete sentence.",task:"Learn: hello, good morning, thank you. Say or write: Good morning. My name is ____.",check:"Which is a greeting: Hello or Chair? Answer: Hello."},
        Mathematics:{goal:"Count objects and compare small numbers.",task:"Count five safe objects near you. Say or write the numbers 1, 2, 3, 4, 5.",check:"Which number is greater: 3 or 5? Answer: 5."},
        Phonics:{goal:"Recognise a letter and its starting sound.",task:"Look at the letter A. Practise its name and the beginning sound in apple. Blind learners may listen to a teacher or approved screen reader; deaf learners may use the written word and letter card.",check:"Which word begins with A: apple or sun? Answer: apple."}
      };
      function readProgress(){try{return JSON.parse(localStorage.getItem(key)||"{}")||{};}catch(e){return {};}}
      function entryKey(){return String(day)+":"+select.value;}
      function paint(){
        var data=activities[select.value]||activities.English;
        goal.textContent=data.goal;task.textContent=data.task;check.textContent=data.check;
        status.textContent=readProgress()[entryKey()] ? "✓ "+select.value+" Day "+day+" activity already completed on this device." : "Complete the activity, then mark it complete. Progress is stored on this device.";
      }
      select.addEventListener("change",paint);
      panel.querySelector("#peStudentDailyComplete").addEventListener("click",function(){
        var saved=readProgress();saved[entryKey()]={completed:true,day:day,subject:select.value};
        try{localStorage.setItem(key,JSON.stringify(saved));status.textContent="✓ Saved: "+select.value+" Day "+day+" activity completed on this device.";speak("Daily activity completed. Your progress is saved on this device.");}
        catch(e){status.textContent="Activity completed for this session, but local storage is unavailable. Please tell your teacher before leaving this page.";}
      });
      paint();
    }

    function renderPage(){
      restoreAllMovedTargets();
      var signOutArea=document.getElementById("peSequentialSignOut");
      if(signOutArea && signOutArea.parentElement===page) shell.appendChild(signOutArea);
      page.innerHTML="";
      var item=sequence[index];
      /* Keep Sign Out and its confirmation off every learning step. */
      if(signOutArea) signOutArea.hidden = item[0] !== "paceduSignOutPage";
      if(item[0]==="dailyLesson") item=[item[0],"Day "+dailyDay+" of 365"];
      var target=document.getElementById(item[0]);

      /* The student intro and assigned-context page are required sequential
       * steps. Legacy role-preview paths create context lazily, so provide a
       * pilot-safe page when absent. This does not authenticate a student or
       * claim that an assignment has been verified.
       */
      if(!target && role==="student" && item[0]==="studentStartLearning"){
        target=document.createElement("section");
        target.id="studentStartLearning";
        target.innerHTML="<h3>Start Learning</h3><p>Welcome to your Student Workspace. Follow your assigned learning pathway, complete daily activities and practice, and check your progress before signing out.</p><p>Use test data only in this controlled pilot.</p>";
        app.appendChild(target);
      }
      if(!target && role==="student" && item[0]==="studentAssignedClassContext"){
        target=document.createElement("section");
        target.id="studentAssignedClassContext";
        target.innerHTML="<h3>My Assigned Class / Year / Teacher</h3><p>Class, year, subject, term and teaching day should be assigned by the teacher.</p><p><strong>Pilot limitation:</strong> this page does not verify an individual assignment. Continue only with approved demonstration data and confirm class setup with the teacher.</p>";
        app.appendChild(target);
      }

      if(!target){
        if(item[0]==="pacificEducationExternalReviewerPortal" && window.PacificEducationProductionAppShell && typeof window.PacificEducationProductionAppShell.ensureExternalReviewerPortal==="function") window.PacificEducationProductionAppShell.ensureExternalReviewerPortal();
        if((item[0]==="pacificEducationInstitutionSetup" || item[0]==="pacificEducationInstitutionAdvice") && window.PacificEducationInstitutionSetup && typeof window.PacificEducationInstitutionSetup.render==="function") window.PacificEducationInstitutionSetup.render();
        if(item[0]==="pacificEducationExamCalendarSection" && window.PacificEducationRevisionExamRedistributionUI && typeof window.PacificEducationRevisionExamRedistributionUI.render==="function") window.PacificEducationRevisionExamRedistributionUI.render("pacificEducationExamCalendarSection");
        if(item[0]==="pacificEducationWeekendHolidaySupplementaryActivities" && window.PacificEducationPilotUserWorkspaces && typeof window.PacificEducationPilotUserWorkspaces.ensureWeekendHolidaySupplementarySection==="function") window.PacificEducationPilotUserWorkspaces.ensureWeekendHolidaySupplementarySection();
        target=document.getElementById(item[0]);
      }

      /* The pilot may be opened before the legacy lesson engine has created its
         dailyLesson node. Create a real, local starter host for learner roles so
         the Daily Activities panel can render instead of showing a dead-end
         "not connected" page with Next disabled. */
      if(!target && item[0]==="dailyLesson" && (role==="student" || role==="blind-learner" || role==="deaf-learner")){
        target=document.createElement("section");
        target.id="dailyLesson";
        target.setAttribute("aria-label","Daily learning activities");
        target.innerHTML="<h3>Daily Learning Activities</h3><p>Choose a starter activity below. Your teacher can confirm your class, subject and term for this pilot.</p>";
        app.appendChild(target);
      }
      if(target && PROTECTED[item[0]]) target=null;
      title.textContent="STEP "+(index+1)+" — "+(role==="student"?"Student":role==="blind-learner"?"Blind Learner":role==="deaf-learner"?"Deaf Learner":role.replace(/-/g," "))+" Workspace — "+item[1];
      progress.textContent="STEP "+(index+1)+" OF "+sequence.length+" — Follow the numbered order";
      status.textContent="";
      back.disabled=index===0;
      back.setAttribute("aria-label",index===0?"Back unavailable on first workspace page":"Back to "+(sequence[index-1] ? sequence[index-1][1] : "previous page"));
      back.disabled=index===0;
      next.textContent=index===sequence.length-1?"Finish":"➡️ Next"; next.classList.add("pacific-mandatory-next"); next.setAttribute("aria-label",index===sequence.length-1?"Finish workspace sequence":"Next to "+(sequence[index+1] ? sequence[index+1][1] : "next page"));
      next.hidden=false;
      if(item[0]==="paceduSignOutPage"){
        var signOutIntro=document.createElement("section");
        signOutIntro.style.cssText="padding:18px;border:3px solid #15803d;border-radius:10px;margin-bottom:16px;";
        signOutIntro.innerHTML="<h3>🔴 Sign Out</h3><p>Your role-specific workspace steps are complete. Use <strong>Sign Out</strong> when you have finished, or use Back to return to your previous workspace page.</p><p>Signing out ends the active workspace session. Saved registration details and completed daily activities are retained on this device.</p>";
        page.appendChild(signOutIntro);
        if(signOutArea) page.appendChild(signOutArea);
        next.hidden=true;
        status.textContent="Final page — Sign Out. Confirm Sign Out when you are ready.";
        speak("Final page. Sign Out. Your workspace sequence is complete. Confirm Sign Out when you are ready.");
        return;
      }
      if(item[0]==="pacificEducationInitialCapabilityTest" || item[0]==="pacificEducationTeacherCapabilityTest"){
        var teacherTest=item[0]==="pacificEducationTeacherCapabilityTest";
        var test=document.createElement("section");
        test.style.cssText="padding:18px;border:3px solid #15803d;border-radius:10px;";
        test.innerHTML="<h3>🧠 "+(teacherTest?"Teacher Capability & Platform Test":"Child Capability & Ability Test")+"</h3><p>"+(teacherTest?"Complete this short readiness test before the teacher daily sequence.":"Complete this short starting-point test so Pacedu can identify the learner's current capability and ability.")+"</p>";
        var qs=teacherTest?[
          ["Can you identify a learner in your class list?","yes"],
          ["Can you review a learner response?","yes"],
          ["Can you use the teacher calendar?","yes"]
        ]:[
          ["Type the letter A.","a"],
          ["Which number is greater: 3 or 5?","5"],
          ["Type the animal word: cat or table.","cat"]
        ];
        qs.forEach(function(q,i){
          var p=document.createElement("p");
          p.innerHTML="<strong>"+(i+1)+". "+q[0]+"</strong><br><input data-pe-cap-answer=\""+q[1]+"\" type=\"text\" style=\"padding:10px;width:100%;max-width:420px;box-sizing:border-box\" aria-label=\"Answer "+(i+1)+"\">";
          test.appendChild(p);
        });
        var submit=document.createElement("button");
        submit.type="button";submit.textContent="✓ Submit Test";submit.style.cssText="padding:12px 18px;font-weight:700;";
        var msg=document.createElement("p");msg.setAttribute("role","status");msg.setAttribute("aria-live","polite");
        test.appendChild(submit);test.appendChild(msg);page.appendChild(test);next.disabled=true;
        submit.onclick=function(){
          var score=0,inputs=test.querySelectorAll("input");
          Array.prototype.forEach.call(inputs,function(input){
            if(String(input.value||"").trim().toLowerCase()===input.getAttribute("data-pe-cap-answer"))score++;
          });
          var result={score:score,total:qs.length,passed:score===qs.length};
          try{sessionStorage.setItem(item[0],JSON.stringify(result));}catch(e){}
          if(result.passed){
            msg.textContent="✓ Successful. The next numbered step is unlocked.";
            next.disabled=false;
            speak("Capability test successful. The next numbered step is unlocked.");
          }else{
            msg.textContent="Please try again. All answers must be correct before the next step is unlocked.";
            speak("Please try the capability test again.");
          }
        };
      }else if(item[0]==="pacificEducationInitialCapabilityResult" || item[0]==="pacificEducationTeacherCapabilityResult"){
        var source=item[0]==="pacificEducationTeacherCapabilityResult"?"pacificEducationTeacherCapabilityTest":"pacificEducationInitialCapabilityTest";
        var raw=null,result=null;
        try{raw=sessionStorage.getItem(source);if(raw)result=JSON.parse(raw);}catch(e){}
        var resultBox=document.createElement("section");
        resultBox.style.cssText="padding:18px;border:3px solid #15803d;border-radius:10px;";
        resultBox.innerHTML="<h3>📊 "+(source==="pacificEducationTeacherCapabilityTest"?"Teacher Capability Result":"Capability Result")+"</h3>";
        if(result && result.passed){
          resultBox.innerHTML+="<p>✓ Test successful. Score: <strong>"+result.score+" / "+result.total+"</strong></p><p>The next numbered step is unlocked.</p>";
          next.disabled=false;
        }else{
          resultBox.innerHTML+="<p>No successful result is recorded. Go Back and complete the test.</p>";
          next.disabled=true;
        }
        page.appendChild(resultBox);
      }else if(target){
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
            "<button type=\"button\" id=\"peEnglishActivityShortcut\" style=\"background:#eef8ff;border:2px solid #7bb9e8;border-radius:8px;padding:10px 14px;font-weight:700;\">📘 English</button>"+
            "<button type=\"button\" id=\"peMathematicsActivityShortcut\" style=\"background:#eef8ff;border:2px solid #7bb9e8;border-radius:8px;padding:10px 14px;font-weight:700;\">➗ Math</button>"+
            "<button type=\"button\" id=\"pePhonicsActivityShortcut\" style=\"background:#eef8ff;border:2px solid #7bb9e8;border-radius:8px;padding:10px 14px;font-weight:700;\">🔤 Phonics</button></div>"+
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
          addStudentDailyActivityStarter(dailyDay,page);
        }
      }else{
        var missing=document.createElement("div");
        missing.style.cssText="padding:16px;border:2px solid #b45309;border-radius:8px;";
        missing.innerHTML="<strong>"+item[1]+" is not connected yet.</strong><p>This page cannot be completed until its existing pilot feature is connected. No placeholder workspace is presented as a working feature.</p>";
        page.appendChild(missing);
        next.disabled=true;
      }
      if(target) next.disabled=false;
      /* Keep Next from scrolling the viewport through unrelated page content. */
      try{
        var focusTitle=document.getElementById("peSequentialTitle");
        if(focusTitle){focusTitle.setAttribute("tabindex","-1");focusTitle.focus({preventScroll:true});}
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

    /* The sequential workspace owns this Next control. Bind at the shell in
       capture phase so legacy page-level delegated handlers cannot swallow or
       redirect the tap. This also survives replacement of the button node. */
    next.onclick=null;
    shell.addEventListener("click",function(event){
      var clicked=event.target && event.target.closest ? event.target.closest("#peSequentialNext") : null;
      if(!clicked || clicked!==next) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      if(clicked.disabled) return;
      if(index<sequence.length-1){
        /* Complete the full daily cycle before advancing to the next day.
           Curriculum Coverage and My Progress are required parts of every day. */
        if(sequence[index][0]==="pacificEducationStudentProgressDashboard" && (role==="student" || role==="blind-learner" || role==="deaf-learner")){
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
    },true);

    document.getElementById("peSequentialSignOutButton").onclick=function(){
      document.getElementById("peSequentialSignOutConfirm").hidden=false;
      speak("Sign Out selected. Confirm Sign Out or Cancel.");
    };
    document.getElementById("peSequentialSignOutNo").onclick=function(){
      document.getElementById("peSequentialSignOutConfirm").hidden=true;
    };
    document.getElementById("peSequentialSignOutYes").onclick=function(){
      try{
        /* Preserve the saved registration record before clearing active session-only state. */
        var savedRegistration=null;
        try{savedRegistration=JSON.parse(sessionStorage.getItem("pacificEducationPilotRegistration")||"null");}catch(_){}
        if(!savedRegistration){
          savedRegistration={
            name:String(sessionStorage.getItem("pilotRegistrationName")||"").trim(),
            role:String(sessionStorage.getItem("pilotRegistrationRole")||role||""),
            country:String(localStorage.getItem("pacificEducationRegistrationCountryName")||localStorage.getItem("pacificEducationRegistrationCountry")||""),
            language:String(localStorage.getItem("pacificEducationRegistrationLanguage")||"")
          };
        }
        if(savedRegistration && (savedRegistration.name || savedRegistration.role)){
          savedRegistration.savedAt=new Date().toISOString();
          localStorage.setItem("pacificEducationPilotSavedRegistrationV1",JSON.stringify(savedRegistration));
        }
        sessionStorage.removeItem("pacificEducationPilotRegistration");
        sessionStorage.removeItem("pacificEducationPilotRegistered");
        sessionStorage.removeItem("pacificEducationPilotRole");
        sessionStorage.removeItem("pacificEducationActiveRole");
        sessionStorage.removeItem("pilotRegistrationRole");
        sessionStorage.removeItem("pilotRegistrationName");
        SESSION_KEYS.forEach(function(key){try{sessionStorage.removeItem(key);}catch(e){}});
      }catch(e){}
      restoreAllMovedTargets();
      setRoleWorkspaceIsolation(false);
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
      speak("You are signed out. Saved registration and learning progress are retained on this device. The registration and sign-in entry is ready.");
    };

    hideApplicationChildren(app,shell);
    setRoleWorkspaceIsolation(true);
    shell.hidden=false;
    shell.style.setProperty("display","block","important");
    shell.style.setProperty("visibility","visible","important");
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
        if(registered && chosen && getRoleSequence(chosen).length) setTimeout(function(){ if(!document.getElementById("pacificEducationSequentialRoleWorkspace")) build(chosen); },0);
      },true);
    });
    var role=getRole();
    if(!role){try{role=sessionStorage.getItem("pacificEducationPilotRole")||"";}catch(e){}}
    var registeredNow=false;
    try{registeredNow=sessionStorage.getItem("pacificEducationPilotRegistered")==="true" || !!sessionStorage.getItem("pacificEducationPilotRegistration");}catch(e){}
    if(role && registeredNow && getRoleSequence(role).length && !(window.PacificEducationSingleNavigation && window.PacificEducationSingleNavigation.owner === "single")) setTimeout(function(){ if(!document.getElementById("pacificEducationSequentialRoleWorkspace")) build(role); },100);

    ["singlePilotRegisterButton","pilotRegistrationSaveButton"].forEach(function(id){
      var button=document.getElementById(id);
      if(!button || button.getAttribute("data-pe-sequential-register-bound")==="true") return;
      button.setAttribute("data-pe-sequential-register-bound","true");
      button.addEventListener("click",function(){
        setTimeout(function(){
          var registered=false, chosen=getRole();
          try{registered=sessionStorage.getItem("pacificEducationPilotRegistered")==="true" || !!sessionStorage.getItem("pacificEducationPilotRegistration");}catch(e){}
          if(registered && chosen && getRoleSequence(chosen) && !document.getElementById("pacificEducationSequentialRoleWorkspace") && !(window.PacificEducationSingleNavigation && window.PacificEducationSingleNavigation.owner === "single")) build(chosen);
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
    version:"1.3.0-adjustable-sequence",
    roles:Object.keys(ROLE_SEQUENCE_DEFAULTS),
    sequenceConfig:{
      get:getRoleSequence,
      set:setRoleSequence,
      insert:insertRoleStep,
      remove:removeRoleStep,
      move:moveRoleStep,
      reset:resetRoleSequence,
      validate:validateSequence,
      defaults:function(role){return cloneSequence(ROLE_SEQUENCE_DEFAULTS[role]||[]);},
      clearOverrides:function(){ROLE_SEQUENCE_OVERRIDES={};saveSequenceOverrides();}
    },
    learnerRoles:LEARNER_ROLES,
    build:build
  };
})(window,document);