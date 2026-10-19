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
  var STUDENT_CONTEXT_KEY = "paceduActiveStudentContextV1";
  function readStudentContext(){
    try{
      var value=JSON.parse(sessionStorage.getItem(STUDENT_CONTEXT_KEY)||"null");
      return value && value.role==="student" && value.displayName && /^Class (?:[1-9]|1[0-3])$/.test(value.classLevel) ? value : null;
    }catch(e){return null;}
  }
  function lockStudentClassSelectors(page,role,context){
    if(!page || role!=="student" || !context) return;
    /* Scope teacher-only class-reference controls out of the active student
       view without mutating their hidden state, so the controls return normally
       when the target section is restored after Sign Out. */
    var classStyle=document.getElementById("pacedu-student-class-context-style");
    if(!classStyle){
      classStyle=document.createElement("style");
      classStyle.id="pacedu-student-class-context-style";
      classStyle.textContent=
        '#pacificEducationSequentialRoleWorkspace[data-pe-role="student"] #peSequentialPage #pacificEducationClassReference,'+
        '#pacificEducationSequentialRoleWorkspace[data-pe-role="student"] #peSequentialPage label[for="pacificEducationClassReference"],'+
        '#pacificEducationSequentialRoleWorkspace[data-pe-role="student"] #peSequentialPage label[for="pacificEducationClassReference"] + br,'+
        '#pacificEducationSequentialRoleWorkspace[data-pe-role="student"] #peSequentialPage #pacificEducationClassStatus,'+
        '#pacificEducationSequentialRoleWorkspace[data-pe-role="student"] #peSequentialPage #pacificEducationClassStatus + hr{display:none!important;visibility:hidden!important;}';
      (document.head||document.documentElement).appendChild(classStyle);
    }
    ["#pacificEducationLevel","#peSequentialLearningLevelRecoverySelect","#paceduLevelSelectorRecovery"].forEach(function(selector){
      var control=page.querySelector(selector);
      if(!control) return;
      if(Array.prototype.some.call(control.options||[],function(option){return option.value===context.classLevel;})){
        control.value=context.classLevel;
      }
      if(control.getAttribute("data-pe-student-class-locked")==="true") return;
      control.setAttribute("data-pe-student-class-locked","true");
      control.addEventListener("change",function(event){
        if(event){event.preventDefault();event.stopImmediatePropagation();}
        control.value=context.classLevel;
        try{localStorage.setItem("pacificEducationLevel",context.classLevel);}catch(e){}
        var status=control.parentElement && control.parentElement.querySelector('[role="status"]');
        if(status) status.textContent="This workspace session stays on "+context.classLevel+". To change the pilot level, sign out and start a new session. Teacher assignment is still unverified.";
      },true);
    });
    var levelStatus=page.querySelector("#pacificEducationLevelStatus");
    if(levelStatus) levelStatus.textContent="Current pilot class: "+context.classLevel+". This choice is not a teacher-verified assignment.";
    var sequentialStatus=page.querySelector("[data-pe-level-recovery='sequential'] [role='status']");
    if(sequentialStatus) sequentialStatus.textContent="Current pilot class: "+context.classLevel+". Ask your teacher to confirm the assigned class.";
    var controllerRecoveryStatus=page.querySelector("#paceduLevelSelectorRecovery") && page.querySelector("#paceduLevelSelectorRecovery").parentElement.querySelector('[role="status"]');
    if(controllerRecoveryStatus) controllerRecoveryStatus.textContent="Current pilot class: "+context.classLevel+". This choice is not a teacher-verified assignment.";
  }
  function renderStudentContextBanner(page,role){
    if(!page || !LEARNER_ROLES[role]) return;
    var old=page.querySelector("[data-pe-student-context-banner]");
    if(old) old.remove();
    var context=readStudentContext();
    if(!context) return;
    var banner=document.createElement("aside");
    banner.setAttribute("data-pe-student-context-banner","true");
    banner.setAttribute("aria-label","Current student and class context");
    banner.style.cssText="display:block;padding:10px 12px;margin:0 0 14px;border-left:4px solid #15803d;border-radius:6px;background:#f0fdf4;color:#17202a;";
    var strong=document.createElement("strong");
    strong.textContent="My Workspace: "+context.displayName+" • "+context.classLevel;
    banner.appendChild(strong);
    var note=document.createElement("p");
    note.style.cssText="margin:4px 0 0;font-size:.9em;";
    note.textContent="Pilot class choice only — teacher-confirmed class assignment is not verified in this build.";
    banner.appendChild(note);
    page.insertBefore(banner,page.firstChild);
    lockStudentClassSelectors(page,role,context);
  }
  var SESSION_KEYS = ["paceduActiveStudentContextV1","pacificEducationPilotRegistration","pacificEducationPilotRole","pacificEducationActiveRole","pilotRegistrationRole","pilotRegistrationName","pacificEducationPilotCountry","pacificEducationPilotCountryName","pacificEducationPilotRegistered","pacificEducationUserRegistrationLanguageV1"];
  var LOCAL_SESSION_KEYS = ["pacificEducationRegistrationCountryCode","pacificEducationRegistrationCountry","pacificEducationRegistrationLanguage","pacificEducationVoiceLocale","pacificEducationCurriculumCountryCode","pacificEducationCurriculumCountry"];
  var SHARED = {"pacificEducationAIPlaybackButton":1,"pacificEducationWelcomeVoiceButton":1,"pacificEducationStopSpeechButton":1,"pacificEducationAccessibilityControls":1,"pacificEducationAppMenu":1,"pacificEducationWorkspaceLiveStatus":1};
  var movedTargets = [];
  var appMenuOriginalParent = null;
  var appMenuOriginalNextSibling = null;
  var pilotBoxesMenuOriginalParent = null;
  var pilotBoxesMenuOriginalNextSibling = null;

  /* Keep the global App Menu off the Welcome/registration pages. It is moved
     into the active role workspace only after registration has opened that
     workspace, then restored to its original location on Sign Out. */
  function restorePilotBoxesMenu(){
    var panel=document.getElementById("pe856AllPilotBoxesMenu");
    if(!panel) return;
    if(pilotBoxesMenuOriginalParent && pilotBoxesMenuOriginalParent.isConnected){
      if(pilotBoxesMenuOriginalNextSibling && pilotBoxesMenuOriginalNextSibling.parentNode===pilotBoxesMenuOriginalParent){
        pilotBoxesMenuOriginalParent.insertBefore(panel,pilotBoxesMenuOriginalNextSibling);
      }else{
        pilotBoxesMenuOriginalParent.appendChild(panel);
      }
    }
    panel.hidden=false;
    panel.removeAttribute("aria-hidden");
    panel.style.removeProperty("display");
    panel.style.removeProperty("visibility");
  }

  function placePilotBoxesMenuInWorkspace(shell){
    var panel=document.getElementById("pe856AllPilotBoxesMenu");
    if(!panel || !shell) return;
    if(!pilotBoxesMenuOriginalParent){
      pilotBoxesMenuOriginalParent=panel.parentNode;
      pilotBoxesMenuOriginalNextSibling=panel.nextSibling;
    }
    var menu=document.getElementById("pacificEducationAppMenu");
    if(menu && menu.parentNode===shell && menu.nextSibling!==panel) shell.insertBefore(panel,menu.nextSibling);
    else if(panel.parentNode!==shell) shell.insertBefore(panel,shell.firstChild);
    panel.hidden=false;
    panel.removeAttribute("aria-hidden");
    panel.style.setProperty("display","block","important");
    panel.style.setProperty("visibility","visible","important");
    panel.style.setProperty("margin","0 0 14px","important");
  }

  function restoreAppMenu(){
    var menu=document.getElementById("pacificEducationAppMenu");
    if(!menu) return;
    if(appMenuOriginalParent && appMenuOriginalParent.isConnected){
      if(appMenuOriginalNextSibling && appMenuOriginalNextSibling.parentNode===appMenuOriginalParent){
        appMenuOriginalParent.insertBefore(menu,appMenuOriginalNextSibling);
      }else{
        appMenuOriginalParent.appendChild(menu);
      }
    }
    menu.hidden=false;
    menu.removeAttribute("aria-hidden");
    menu.style.removeProperty("display");
    menu.style.removeProperty("visibility");
    restorePilotBoxesMenu();
  }

  function placeAppMenuInWorkspace(shell){
    var menu=document.getElementById("pacificEducationAppMenu");
    if(!menu || !shell) return;
    if(!appMenuOriginalParent){
      appMenuOriginalParent=menu.parentNode;
      appMenuOriginalNextSibling=menu.nextSibling;
    }
    shell.insertBefore(menu,shell.firstChild);
    menu.hidden=false;
    menu.removeAttribute("aria-hidden");
    menu.style.setProperty("display","block","important");
    menu.style.setProperty("visibility","visible","important");
    menu.style.setProperty("margin","0 0 14px","important");
    placePilotBoxesMenuInWorkspace(shell);
  }

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
      "body.pe-sequential-role-workspace-active #pacificEducationAppMenu,body.pe-sequential-role-workspace-active #pe856AllPilotBoxesMenu{display:block!important;visibility:visible!important;}"+
      "body.pe-sequential-role-workspace-active #app > #pacificEducationSequentialRoleWorkspace{display:block!important;visibility:visible!important;}"+
      "body.pe-sequential-role-workspace-active #pacificEducationWelcomeVoiceButton,body.pe-sequential-role-workspace-active #pacificEducationAIPlaybackButton{display:none!important;visibility:hidden!important;}"+
      "body.pe-sequential-role-workspace-active #app [data-pe-sequential-hidden='true']{display:none!important;visibility:hidden!important;}"+
      "body.pe-sequential-role-workspace-active #pacificEducationSequentialRoleWorkspace #peSequentialPage > [data-pe-sequential-page='active']{display:block!important;visibility:visible!important;}";
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
    target.__peSequentialOriginalDisplay=target.style.getPropertyValue("display");
    target.__peSequentialOriginalDisplayPriority=target.style.getPropertyPriority("display");
    target.__peSequentialOriginalAriaHidden=target.getAttribute("aria-hidden");
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
    /* Restore original inline display and accessibility state when this section
       leaves the active page. It remains hidden in the inactive application shell. */
    target.style.removeProperty("display");
    if(target.__peSequentialOriginalDisplay){
      target.style.setProperty("display",target.__peSequentialOriginalDisplay,target.__peSequentialOriginalDisplayPriority||"");
    }
    if(target.__peSequentialOriginalAriaHidden===null) target.removeAttribute("aria-hidden");
    else target.setAttribute("aria-hidden",target.__peSequentialOriginalAriaHidden);
    target.hidden=true;
    if(target.__peSequentialDescendantHiddenState){
      target.__peSequentialDescendantHiddenState.forEach(function(state){
        if(!state.el) return;
        if(state.hiddenAttr===null) state.el.removeAttribute("data-pe-sequential-hidden");
        else state.el.setAttribute("data-pe-sequential-hidden",state.hiddenAttr);
      });
      target.__peSequentialDescendantHiddenState=null;
    }
    target.removeAttribute("data-pe-sequential-page");
    target.dataset.peSequentialMoved="false";
    target.setAttribute("data-pe-sequential-hidden","true");
  }

  function restoreAllMovedTargets(){
    movedTargets.forEach(restoreMovedTarget);
  }

  function initialiseExistingSelector(target){
    if(!target) return;
    var apiName={
      "levelSelection":"PacificEducationLevelSelector",
      "subjectSelection":"PacificEducationSubjectSelector",
      "termSelection":"PacificEducationTermSelector",
      "capabilitySelection":"PacificEducationCapabilitySelector"
    }[target.id];
    var api=apiName && window[apiName];
    if(api && typeof api.initialise==="function"){
      try{api.initialise();}catch(error){}
    }
  }

  /* Last-resort visible recovery for the Student Learning Level page.
   * The existing selector and navigation-owned recovery remain first choice.
   * This separate panel is added only when neither produced an enabled select,
   * so a workspace step cannot be empty merely because a feature script failed. */
  function ensureSequentialLevelRecovery(target,page){
    if(!page || (target && target.id!=="levelSelection")) return;
    /* A selector in the DOM is not enough: legacy CSS can leave it hidden or
       clipped inside the moved feature. Skip recovery only when a real enabled
       selector is actually rendered in the active page. */
    var existingSelect=target && target.querySelector("select:not(:disabled)");
    if(existingSelect){
      var selectorIsVisible=false;
      try{
        selectorIsVisible=existingSelect.getClientRects().length>0;
        var node=existingSelect;
        while(selectorIsVisible && node){
          var selectorStyle=window.getComputedStyle(node);
          if(selectorStyle.display==="none" || selectorStyle.visibility==="hidden" ||
             Number(selectorStyle.opacity)===0 || node.hidden){
            selectorIsVisible=false;
            break;
          }
          /* Match the navigation controller: a visible-looking select is not
             usable when an ancestor hides it or clips it entirely. */
          if(node!==existingSelect &&
             (selectorStyle.overflowX==="hidden" || selectorStyle.overflowX==="clip" ||
              selectorStyle.overflowY==="hidden" || selectorStyle.overflowY==="clip")){
            var childRect=existingSelect.getBoundingClientRect();
            var parentRect=node.getBoundingClientRect();
            var clipLeft=parentRect.left+(node.clientLeft||0);
            var clipTop=parentRect.top+(node.clientTop||0);
            var clipRight=clipLeft+(node.clientWidth||0);
            var clipBottom=clipTop+(node.clientHeight||0);
            if(childRect.right<=clipLeft || childRect.left>=clipRight ||
               childRect.bottom<=clipTop || childRect.top>=clipBottom){
              selectorIsVisible=false;
              break;
            }
          }
          node=node.parentElement;
        }
      }catch(e){selectorIsVisible=false;}
      if(selectorIsVisible) return;
    }
    if(page.querySelector("[data-pe-level-recovery='sequential']")) return;
    var panel=document.createElement("section");
    panel.setAttribute("data-pe-level-recovery","sequential");
    panel.setAttribute("aria-label","Learning Level recovery");
    panel.style.cssText="display:block!important;visibility:visible!important;opacity:1!important;position:relative!important;padding:16px;border:2px solid #b45309;border-radius:10px;margin:12px 0;background:#fff;";
    var heading=document.createElement("h3");
    heading.textContent="Choose Your Learning Class / Level";
    var note=document.createElement("p");
    note.textContent="The normal class selector is not ready. Choose a pilot level to continue; this does not verify a teacher-assigned class.";
    var label=document.createElement("label");
    label.textContent="Learning class / level";
    label.htmlFor="peSequentialLearningLevelRecoverySelect";
    var select=document.createElement("select");
    select.id="peSequentialLearningLevelRecoverySelect";
    select.setAttribute("aria-label","Learning class or level");
    select.style.cssText="display:block!important;visibility:visible!important;width:100%;max-width:420px;padding:12px;margin:8px 0;background:#fff;color:#111;";
    for(var level=1;level<=13;level++){
      var option=document.createElement("option");
      option.value="Class "+level;
      option.textContent="Class "+level;
      select.appendChild(option);
    }
    var saved="";
    try{saved=localStorage.getItem("pacificEducationLevel")||"";}catch(e){}
    if(/^Class (?:[1-9]|1[0-3])$/.test(saved)) select.value=saved;
    var status=document.createElement("p");
    status.setAttribute("role","status");
    status.setAttribute("aria-live","polite");
    status.textContent="Pilot recovery is ready. Confirm your assigned class with your teacher.";
    select.addEventListener("change",function(){
      try{localStorage.setItem("pacificEducationLevel",select.value);}catch(e){}
      status.textContent="Selected "+select.value+". Please confirm your assigned class with your teacher.";
      try{document.dispatchEvent(new CustomEvent("pacificEducationSelectionChanged",{detail:{level:select.value,pilotRecovery:true}}));}catch(e){}
    });
    panel.appendChild(heading);panel.appendChild(note);panel.appendChild(label);
    panel.appendChild(select);panel.appendChild(status);page.appendChild(panel);
  }

  function moveTargetIntoPage(target,page){
    if(!target) return false;
    rememberOriginal(target);
    /* Legacy guided navigation may leave display:none!important and aria-hidden
       on the moved section. Clear those stale page-hiding states only while the
       existing selector section is the active sequential workspace page. */
    target.hidden=false;
    target.removeAttribute("aria-hidden");
    target.removeAttribute("data-pe-sequential-hidden");
    target.__peSequentialDescendantHiddenState=[];
    Array.prototype.forEach.call(target.querySelectorAll("[data-pe-sequential-hidden]"),function(el){
      target.__peSequentialDescendantHiddenState.push({el:el,hiddenAttr:el.getAttribute("data-pe-sequential-hidden")});
      el.removeAttribute("data-pe-sequential-hidden");
    });
    target.style.removeProperty("display");
    target.setAttribute("data-pe-sequential-page","active");
    target.dataset.peSequentialMoved="true";
    if(movedTargets.indexOf(target)===-1) movedTargets.push(target);
    /* Reassert the active page and its moved feature after legacy CSS/hidden attributes.
       Some guided-flow rules target the original page tree and can otherwise leave
       this sequential workspace showing a blank content area. */
    page.hidden=false;
    page.removeAttribute("aria-hidden");
    page.style.setProperty("display","block","important");
    page.style.setProperty("visibility","visible","important");
    page.style.setProperty("opacity","1","important");
    page.style.setProperty("position","relative","important");
    target.hidden=false;
    target.removeAttribute("aria-hidden");
    target.removeAttribute("data-pe-sequential-hidden");
    target.style.setProperty("display","block","important");
    target.style.setProperty("visibility","visible","important");
    target.style.setProperty("opacity","1","important");
    page.appendChild(target);
    initialiseExistingSelector(target);
    /* Reuse the navigation-owned recovery for a disabled/missing class selector.
       The fallback is additive and labels its class choice as unverified. */
    if(target.id==="levelSelection" &&
       window.PacificEducationSingleNavigation &&
       typeof window.PacificEducationSingleNavigation.refreshFeatureForTarget==="function"){
      try{window.PacificEducationSingleNavigation.refreshFeatureForTarget("levelSelection");}catch(e){}
    }
    return true;
  }

  function build(role){
    /* A late registration/role callback must never replace a completed Sign Out screen. */
    var existingWorkspace=document.getElementById("pacificEducationSequentialRoleWorkspace");
    if(existingWorkspace && existingWorkspace.getAttribute("data-pe-final-signout")==="true") return;
    var app=document.getElementById("app");
    if(!app) return;
    var registeredRole=getRole();
    role=registeredRole && getRoleSequence(registeredRole).length ? registeredRole : normalizeRole(role);
    var sequence=getRoleSequence(role);
    if(!sequence || !sequence.length) return;
    /* Sign Out is a dedicated final page for every role, not an off-screen footer. */
    sequence=cloneSequence(sequence);
    /* Always start in a real role-aware workspace home before opening tools. */
    sequence.unshift(["paceduWorkspaceHome","My Workspace"]);
    sequence.push(["paceduSignOutPage","Sign Out"]);

    var old=document.getElementById("pacificEducationSequentialRoleWorkspace");
    if(old){
      restoreAppMenu();
      restorePilotBoxesMenu();
      old.remove();
    }

    var shell=document.createElement("section");
    shell.id="pacificEducationSequentialRoleWorkspace"; shell.setAttribute("data-pe-role",role);
    shell.setAttribute("aria-label","Sequential "+role+" workspace");
    shell.style.cssText="margin:0;padding:20px;border:3px solid #15803d;border-radius:10px;";
    shell.innerHTML="<h2 id=\"peSequentialTitle\"></h2><p id=\"peSequentialProgress\" role=\"status\" aria-live=\"polite\"></p><div style=\"display:flex;gap:8px;flex-wrap:wrap;margin:12px 0;\"><button type=\"button\" id=\"peSequentialHear\" style=\"padding:12px 16px;font-weight:700;\">🔊 Hear This Page</button><button type=\"button\" id=\"peSequentialStop\" style=\"padding:12px 16px;font-weight:700;\">🔇 Stop Speech</button></div><div id=\"peSequentialPage\" tabindex=\"-1\"></div><div style=\"margin-top:18px;display:flex;justify-content:flex-start;gap:10px;flex-wrap:wrap;\"><button type=\"button\" id=\"peSequentialBack\" style=\"background:#fff;padding:14px 20px;font-weight:700;border-radius:8px;\">⬅️ Back</button><button type=\"button\" id=\"peSequentialNext\" style=\"background:#15803d;color:#fff;padding:14px 20px;font-weight:700;border-radius:8px;\">➡️ Next</button></div><p id=\"peSequentialStatus\" role=\"status\" aria-live=\"polite\"></p><div id=\"peSequentialSignOut\" hidden style=\"margin-top:28px;padding-top:18px;border-top:2px solid currentColor;\"><button type=\"button\" id=\"peSequentialSignOutButton\" style=\"padding:13px 18px;font-weight:700;\">🔴 Sign Out</button><div id=\"peSequentialSignOutConfirm\" hidden style=\"margin-top:10px;padding:12px;border:2px solid currentColor;\"><p>Are you sure you want to sign out?</p><button type=\"button\" id=\"peSequentialSignOutYes\">✓ Confirm Sign Out</button> <button type=\"button\" id=\"peSequentialSignOutNo\">Cancel</button></div></div>";
    var signOutTopArea=shell.querySelector("#peSequentialSignOut");
    if(signOutTopArea){
      /* Keep Sign Out out of the top reading area until the final page is shown. */
      signOutTopArea.hidden=true;
      signOutTopArea.style.cssText="position:static;top:auto;z-index:auto;display:flex;justify-content:flex-start;align-items:flex-start;flex-wrap:wrap;gap:8px;margin:18px 0 0;padding:12px 0 0;background:transparent;border-top:1px solid #d1d5db;";
      var signOutTopButton=signOutTopArea.querySelector("#peSequentialSignOutButton");
      if(signOutTopButton) signOutTopButton.style.cssText="background:#a62e35;color:#fff;padding:10px 14px;font-weight:700;border:0;border-radius:8px;";
    }
    app.insertBefore(shell,app.firstChild);
    placeAppMenuInWorkspace(shell);

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

    /* Visibility guard for real workspace content. A role page must never degrade
       to voice controls alone when legacy CSS, a stale hidden flag, or a late
       feature render interferes. This does not change the protected voice engine. */
    function enforceWorkspaceVisibility(){
      if(!shell || !page) return;
      shell.hidden=false;
      shell.removeAttribute("aria-hidden");
      shell.style.setProperty("display","block","important");
      shell.style.setProperty("visibility","visible","important");
      shell.style.setProperty("opacity","1","important");
      page.hidden=false;
      page.removeAttribute("aria-hidden");
      page.style.setProperty("display","block","important");
      page.style.setProperty("visibility","visible","important");
      page.style.setProperty("opacity","1","important");
      var active=page.querySelector("[data-pe-sequential-page='active']");
      if(active){
        active.hidden=false;
        active.removeAttribute("aria-hidden");
        active.removeAttribute("data-pe-sequential-hidden");
        active.style.setProperty("display","block","important");
        active.style.setProperty("visibility","visible","important");
        active.style.setProperty("opacity","1","important");
      }
      if(!page.firstElementChild && !String(page.textContent||"").trim()){
        var recovery=document.createElement("section");
        recovery.setAttribute("data-pe-workspace-visibility-recovery","true");
        recovery.setAttribute("role","status");
        recovery.style.cssText="display:block!important;visibility:visible!important;opacity:1!important;padding:16px;margin:12px 0;border:2px solid #b45309;border-radius:10px;background:#fff;color:#17202a;";
        var heading=document.createElement("h3");
        heading.textContent="Workspace content recovery";
        var message=document.createElement("p");
        message.textContent="This workspace page did not load its content. Try loading this step again. Your registration and saved activity attempts have not been cleared.";
        var recoveryActions=document.createElement("div");
        recoveryActions.style.cssText="display:flex;gap:10px;flex-wrap:wrap;margin-top:14px;";
        var retry=document.createElement("button");
        retry.type="button";
        retry.textContent="Retry this workspace page";
        retry.style.cssText="display:inline-block!important;visibility:visible!important;padding:12px 16px;font-weight:700;";
        retry.addEventListener("click",function(){ renderPage(); });
        /* Sign In retries the existing registered role workspace; it does not
           create a second session or bypass registration. */
        var signIn=document.createElement("button");
        signIn.type="button";
        signIn.textContent="Sign In / Reopen Workspace";
        signIn.setAttribute("aria-label","Sign in again and reopen the current role workspace");
        signIn.style.cssText="display:inline-block!important;visibility:visible!important;padding:12px 16px;font-weight:700;background:#15803d;color:#fff;";
        signIn.addEventListener("click",function(){ renderPage(); });
        /* Sign Out only takes the user to the existing final sign-out page.
           Actual session clearing still requires the existing confirmation. */
        var signOut=document.createElement("button");
        signOut.type="button";
        signOut.textContent="Sign Out";
        signOut.setAttribute("aria-label","Open the final Sign Out page");
        signOut.style.cssText="display:inline-block!important;visibility:visible!important;padding:12px 16px;font-weight:700;background:#a62e35;color:#fff;";
        signOut.addEventListener("click",function(){
          index=sequence.length-1;
          renderPage();
        });
        recoveryActions.appendChild(retry);
        recoveryActions.appendChild(signIn);
        recoveryActions.appendChild(signOut);
        recovery.appendChild(heading);
        recovery.appendChild(message);
        recovery.appendChild(recoveryActions);
        page.appendChild(recovery);
      }
    }


    /* When a legacy role feature exists but renders no usable content, keep the user
       inside this same workspace page and provide role-aware navigation to the other
       steps already permitted for that role. This is recovery navigation, not a claim
       that a missing feature is working, and it never creates another application page. */
    function roleWorkspaceHasContent(target){
      if(!target) return false;
      if(String(target.textContent||"").replace(/\s+/g,"").length) return true;
      return !!target.querySelector("button,input,select,textarea,a,[role='button']");
    }
    function addRoleWorkspaceLanding(role,item,host){
      if(!host || host.querySelector("[data-pe-role-workspace-recovery='true']")) return;
      var labels={
        "student":"Student","blind-learner":"Blind Learner","deaf-learner":"Deaf Learner",
        "teacher":"Teacher","parent":"Parent / Caregiver","professional":"Professional Reviewer",
        "ngo":"NGO / Organization","education":"Education / Government","community":"Community / Partner",
        "head-of-school":"Head of School","institution-admin":"Institution Administrator",
        "special-education":"Special Education","owner":"Owner","technician":"Technician"
      };
      var descriptions={
        "student":"Open learning level, subject, term, daily activities, practice, assessment and progress tools in the approved order.",
        "blind-learner":"Open the learner pathway with screen-reader-friendly instructions and voice-guided activity options.",
        "deaf-learner":"Open the learner pathway with written instructions and visual activity options.",
        "teacher":"Open class, calendar, learner evidence, assessment and progress tools.",
        "parent":"Open child progress and teacher communication tools.",
        "professional":"Open the reviewer portal, evidence registry and pilot verification tools.",
        "ngo":"Open the pilot overview, program evidence and feedback tools.",
        "education":"Open curriculum control, evidence traceability and coverage tools.",
        "community":"Open pilot information and community feedback tools.",
        "head-of-school":"Open school identity, view-only class lists, exam calendar and curriculum coverage.",
        "institution-admin":"Open institution setup, institution advice and examination calendar tools.",
        "special-education":"Open inclusion, learner/class, evidence and progress tools.",
        "owner":"Open the existing owner access verification step; this pilot does not grant production authority.",
        "technician":"Open the existing technician access verification step; technician mode remains pilot-only."
      };
      var panel=document.createElement("section");
      panel.setAttribute("data-pe-role-workspace-recovery","true");
      panel.setAttribute("aria-label",(labels[role]||role)+" workspace recovery and tools");
      panel.style.cssText="display:block!important;visibility:visible!important;opacity:1!important;box-sizing:border-box;margin:12px 0;padding:16px;border:2px solid #15803d;border-radius:10px;background:#fff;color:#17202a;";
      var heading=document.createElement("h3");
      heading.textContent=(labels[role]||role)+" Workspace";
      var explanation=document.createElement("p");
      explanation.textContent="The usual feature panel did not display its content on this page. Your workspace recovery menu is shown here instead. "+(descriptions[role]||"Open the tools listed for this role.");
      var note=document.createElement("p");
      note.textContent="Choose an available tool below. If a tool itself is not connected, Pacedu will identify it rather than report it as completed. Your saved registration and activity progress are not cleared by this recovery menu.";
      var list=document.createElement("div");
      list.setAttribute("aria-label","Available workspace tools");
      list.style.cssText="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px;";
      var added=0;
      sequence.forEach(function(step,stepIndex){
        if(step[0]==="paceduSignOutPage" || stepIndex===index) return;
        var button=document.createElement("button");
        button.type="button";
        button.textContent="Open "+step[1];
        button.setAttribute("aria-label","Open workspace tool: "+step[1]);
        button.style.cssText="display:inline-block!important;visibility:visible!important;padding:10px 12px;font-weight:700;border:1px solid #64748b;border-radius:8px;background:#f8fafc;color:#17202a;";
        button.addEventListener("click",function(){
          if(shell.getAttribute("data-pe-final-signout")==="true") return;
          index=stepIndex;
          try{history.pushState({pacificEducationSequential:true,role:role,index:index},"","#pacificEducationSequentialRoleWorkspace");}catch(e){}
          renderPage();
        });
        list.appendChild(button);
        added++;
      });
      var noTools=document.createElement("p");
      noTools.textContent="No other role tools are configured in this sequence yet. Use Back or Next where available, or return to the User Type Completed page.";
      panel.appendChild(heading);
      panel.appendChild(explanation);
      panel.appendChild(note);
      if(added) panel.appendChild(list); else panel.appendChild(noTools);
      host.appendChild(panel);
    }

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
      /* Once the final Sign Out page is visible, no incidental render request
         may replace it. The confirmed Sign Out handler removes the shell instead. */
      if(shell.getAttribute("data-pe-final-signout")==="true") return;
      restoreAllMovedTargets();
      var signOutArea=document.getElementById("peSequentialSignOut");
      /* Never expose or focus the Sign Out control during earlier steps. */
      if(signOutArea) signOutArea.hidden=true;
      page.innerHTML="";

      /* Give every role-workspace page the same short, steady entrance used by
         the 14 guided pages. The active page is still replaced synchronously,
         so two workspace pages are never exposed together. Respect reduced motion. */
      var transitionStyle=document.getElementById("pacedu-role-page-transition-style");
      if(!transitionStyle){
        transitionStyle=document.createElement("style");
        transitionStyle.id="pacedu-role-page-transition-style";
        transitionStyle.textContent=
          "#peSequentialPage.pacedu-role-page-enter{animation:paceduRolePageEnter 190ms cubic-bezier(.2,.7,.2,1) both;}"+
          "@keyframes paceduRolePageEnter{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}"+
          "@media(prefers-reduced-motion:reduce){#peSequentialPage.pacedu-role-page-enter{animation:none!important;transform:none!important;opacity:1!important}}";
        (document.head||document.documentElement).appendChild(transitionStyle);
      }
      var item=sequence[index];
      /* Final reading page has no entrance transform/animation or scripted focus.
         The viewport must remain entirely under the user's control. */
      if(item[0]!=="paceduSignOutPage"){
        page.classList.remove("pacedu-role-page-enter");
        try{ void page.offsetWidth; }catch(e){}
        page.classList.add("pacedu-role-page-enter");
        window.setTimeout(function(){
          if(page && page.classList) page.classList.remove("pacedu-role-page-enter");
        },260);
      }else{
        page.classList.remove("pacedu-role-page-enter");
        page.style.transform="none";
        page.style.animation="none";
        page.style.overflowAnchor="auto";
        page.style.scrollBehavior="auto";
      }
      /* Keep the Sign Out action hidden until the user reaches its final page.
         Do not keep a duplicate/early red button visible during reading. */
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

      /*
       * A missing legacy Level section must not leave the learner on an empty
       * sequential page. Create a visible pilot workspace host, then let the
       * existing selector recovery add its clearly labelled fallback control.
       * This preserves Class/Level as a required step; it does not bypass
       * teacher assignment or change protected voice behaviour.
       */
      if(!target && item[0]==="levelSelection"){
        target=document.createElement("section");
        target.id="levelSelection";
        target.setAttribute("aria-label","Learning Level Workspace");
        target.innerHTML="<p>The normal Class / Level controls are not available in this build. The pilot recovery selector will appear below if needed.</p>";
        app.appendChild(target);
      }

      if(!target){
        if(item[0]==="pacificEducationExternalReviewerPortal" && window.PacificEducationProductionAppShell && typeof window.PacificEducationProductionAppShell.ensureExternalReviewerPortal==="function") window.PacificEducationProductionAppShell.ensureExternalReviewerPortal();
        if((item[0]==="pacificEducationInstitutionSetup" || item[0]==="pacificEducationInstitutionAdvice") && window.PacificEducationInstitutionSetup && typeof window.PacificEducationInstitutionSetup.render==="function") window.PacificEducationInstitutionSetup.render();
        if(item[0]==="pacificEducationExamCalendarSection" && window.PacificEducationRevisionExamRedistributionUI && typeof window.PacificEducationRevisionExamRedistributionUI.render==="function") window.PacificEducationRevisionExamRedistributionUI.render("pacificEducationExamCalendarSection");
        if(item[0]==="pacificEducationWeekendHolidaySupplementaryActivities" && window.PacificEducationPilotUserWorkspaces && typeof window.PacificEducationPilotUserWorkspaces.ensureWeekendHolidaySupplementarySection==="function") window.PacificEducationPilotUserWorkspaces.ensureWeekendHolidaySupplementarySection();
        target=document.getElementById(item[0]);
      }
      /* If the Learning Level feature section itself is missing, still render a
         clearly labelled recovery inside the active workspace instead of a blank page. */
      if(!target && item[0]==="levelSelection") ensureSequentialLevelRecovery(null,page);

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
        shell.setAttribute("data-pe-final-signout","true");
        shell.setAttribute("data-pe-signout-page-restored","true");
        /* This is the only page whose viewport must remain fully user-controlled.
           Keep the final reader in normal document flow: no fixed-height inner
           scroller, scroll snap, focus jump, or sticky Sign Out bar. */
        shell.hidden=false;
        shell.removeAttribute("aria-hidden");
        shell.style.setProperty("display","block","important");
        shell.style.setProperty("visibility","visible","important");
        shell.style.setProperty("position","static","important");
        shell.style.setProperty("height","auto","important");
        shell.style.setProperty("max-height","none","important");
        shell.style.setProperty("overflow","visible","important");
        shell.style.setProperty("overflow-anchor","none","important");
        page.hidden=false;
        page.removeAttribute("aria-hidden");
        page.style.setProperty("display","block","important");
        page.style.setProperty("visibility","visible","important");
        page.style.setProperty("opacity","1","important");
        page.style.setProperty("position","static","important");
        page.style.setProperty("height","auto","important");
        page.style.setProperty("max-height","none","important");
        page.style.setProperty("overflow","visible","important");
        page.style.setProperty("overflow-anchor","none","important");
        page.style.setProperty("scroll-snap-type","none","important");
        page.style.setProperty("touch-action","pan-y","important");
        page.style.setProperty("transform","none","important");
        page.style.setProperty("animation","none","important");
        page.style.setProperty("scroll-behavior","auto","important");
        if(signOutTopArea){
          signOutTopArea.style.position="static";
          signOutTopArea.style.top="auto";
          signOutTopArea.style.zIndex="auto";
          signOutTopArea.hidden=true;
          signOutTopArea.style.setProperty("display","none","important");
        }
        var signOutIntro=document.createElement("section");
        signOutIntro.id="peSequentialSignOutInformation";
        signOutIntro.setAttribute("aria-label","Sign Out instructions");
        signOutIntro.style.cssText="display:block!important;visibility:visible!important;position:static!important;height:auto!important;max-height:none!important;overflow:visible!important;padding:18px;border:3px solid #15803d;border-radius:10px;margin:0 0 16px;";
        signOutIntro.innerHTML="<h3>🔴 Sign Out — Final Page</h3><p><strong>Your workspace is complete.</strong> This page will stay here until you deliberately choose to sign out.</p><p><strong>You stay signed in until you choose to sign out.</strong> Nothing is ended just by reading or scrolling this page.</p><p><strong>Saved information:</strong> Saved pilot registration details and completed learning activities are retained on this device.</p><p><strong>To sign out:</strong> select the red Sign Out button below, then select Confirm Sign Out. select Cancel to close the confirmation and remain in your workspace.</p><p><strong>Page movement:</strong> scroll up and down yourself to read this page. Pacedu must not pull the page toward the Sign Out button or move to another workspace page automatically.</p>";
        page.appendChild(signOutIntro);
        /* Restore the real Sign Out and confirmation controls after all reading text. */
        if(signOutTopArea){
          signOutTopArea.hidden=false;
          signOutTopArea.removeAttribute("aria-hidden");
          signOutTopArea.style.removeProperty("visibility");
          signOutTopArea.style.setProperty("display","flex","important");
          signOutTopArea.style.setProperty("position","static","important");
          signOutTopArea.style.setProperty("height","auto","important");
          signOutTopArea.style.setProperty("max-height","none","important");
          signOutTopArea.style.setProperty("overflow","visible","important");
          page.appendChild(signOutTopArea);
        }
        renderStudentContextBanner(page,role);
        /* Final page is a fixed endpoint: Back/Next are not navigation choices here.
           Earlier pages retain their normal Back/Next behavior. */
        back.hidden=true;
        back.disabled=true;
        back.setAttribute("aria-hidden","true");
        back.setAttribute("tabindex","-1");
        next.hidden=true;
        next.disabled=true;
        status.textContent="Final page — this screen will not move on automatically. Scroll up or down yourself. Sign Out occurs only after you choose Sign Out and then Confirm.";
        status.hidden=false;
        status.style.setProperty("display","block","important");
        status.style.setProperty("visibility","visible","important");
        return;
      }
      if(item[0]==="paceduWorkspaceHome"){
        var home=document.createElement("section");
        home.id="peSequentialWorkspaceHome";
        home.setAttribute("aria-label","Pacedu role workspace home");
        home.style.cssText="display:block!important;visibility:visible!important;padding:18px;border:2px solid #15803d;border-radius:10px;background:#fff;color:#17202a;";
        var roleLabels={
          "student":"Student","blind-learner":"Blind Learner","deaf-learner":"Deaf Learner",
          "teacher":"Teacher","parent":"Parent / Caregiver","professional":"Professional Reviewer",
          "ngo":"NGO / Organization","education":"Education / Government","community":"Community / Partner",
          "head-of-school":"Head of School","institution-admin":"Institution Administrator",
          "special-education":"Special Education / Inclusion","owner":"Owner / Control","technician":"Technician"
        };
        var roleLabel=roleLabels[role]||role.replace(/-/g," ");
        var welcome=document.createElement("h3");
        welcome.textContent="Welcome to your Pacedu Workspace";
        home.appendChild(welcome);
        var intro=document.createElement("p");
        intro.textContent="Your registration is saved for the "+roleLabel+" pilot pathway. Use Next to open each workspace tool in the required order. Only the current page is shown.";
        home.appendChild(intro);
        if(role==="student"){
          var entryPanel=document.createElement("section");
          entryPanel.id="peStudentWorkspaceEntry";
          entryPanel.setAttribute("aria-label","Student sign in and class or year level");
          entryPanel.style.cssText="display:block;padding:16px;margin:16px 0;border:2px solid #15803d;border-radius:10px;background:#f8fff9;color:#17202a;";
          var entryHeading=document.createElement("h4");
          entryHeading.textContent="Student Sign In & My Class / Year Level";
          entryPanel.appendChild(entryHeading);
          var entryNote=document.createElement("p");
          entryNote.textContent="Identify your current pilot session and choose a demonstration class level. This is not secure account authentication and does not confirm your teacher-assigned class.";
          entryPanel.appendChild(entryNote);
          var context=readStudentContext();
          var nameLabel=document.createElement("label");
          nameLabel.htmlFor="peStudentWorkspaceIdentity";
          nameLabel.textContent="Student name or pilot learner ID";
          nameLabel.style.cssText="display:block;font-weight:700;margin:10px 0 5px;";
          entryPanel.appendChild(nameLabel);
          var nameInput=document.createElement("input");
          nameInput.id="peStudentWorkspaceIdentity";
          nameInput.type="text";
          nameInput.autocomplete="off";
          nameInput.maxLength=80;
          nameInput.placeholder="Enter student name or demo learner ID";
          var registeredStudentName="";
          try{registeredStudentName=String(sessionStorage.getItem("pilotRegistrationName")||"").trim();}catch(e){}
          nameInput.value=context?context.displayName:registeredStudentName;
          nameInput.style.cssText="display:block;box-sizing:border-box;width:100%;max-width:520px;padding:12px;border:1px solid #64748b;border-radius:6px;";
          entryPanel.appendChild(nameInput);
          var classLabel=document.createElement("label");
          classLabel.htmlFor="peStudentWorkspaceClass";
          classLabel.textContent="Class / Year Level";
          classLabel.style.cssText="display:block;font-weight:700;margin:12px 0 5px;";
          entryPanel.appendChild(classLabel);
          var classSelect=document.createElement("select");
          classSelect.id="peStudentWorkspaceClass";
          classSelect.setAttribute("aria-label","Choose class or year level");
          classSelect.style.cssText="display:block;box-sizing:border-box;width:100%;max-width:520px;padding:12px;border:1px solid #64748b;border-radius:6px;background:#fff;";
          var blankClass=document.createElement("option");
          blankClass.value="";
          blankClass.textContent="Select your class level";
          classSelect.appendChild(blankClass);
          for(var studentLevel=1;studentLevel<=13;studentLevel++){
            var classOption=document.createElement("option");
            classOption.value="Class "+studentLevel;
            classOption.textContent="Class "+studentLevel;
            classSelect.appendChild(classOption);
          }
          if(context) classSelect.value=context.classLevel;
          entryPanel.appendChild(classSelect);
          var assignmentNote=document.createElement("p");
          assignmentNote.style.cssText="font-size:.9em;padding:10px;border-left:3px solid #b45309;background:#fff7ed;";
          assignmentNote.textContent="Class assignment status: not verified. Ask your teacher to confirm your assigned class. The choice here is for controlled demonstration only.";
          entryPanel.appendChild(assignmentNote);
          var enterButton=document.createElement("button");
          enterButton.type="button";
          enterButton.textContent=context?"Confirm Student Session":"Sign In to My Workspace";
          enterButton.style.cssText="margin:8px 0;padding:12px 16px;border:0;border-radius:7px;background:#15803d;color:#fff;font-weight:700;";
          entryPanel.appendChild(enterButton);
          var entryStatus=document.createElement("p");
          entryStatus.setAttribute("role","status");
          entryStatus.setAttribute("aria-live","polite");
          entryStatus.textContent=context?"Student session ready for "+context.classLevel+".":"Enter a student name or demo ID and choose a class level to continue.";
          entryPanel.appendChild(entryStatus);
          enterButton.onclick=function(){
            var displayName=String(nameInput.value||"").trim();
            var classLevel=String(classSelect.value||"").trim();
            if(!displayName){
              entryStatus.textContent="Enter a student name or demonstration learner ID.";
              nameInput.focus();
              return;
            }
            if(!/^Class (?:[1-9]|1[0-3])$/.test(classLevel)){
              entryStatus.textContent="Choose a class level before continuing.";
              classSelect.focus();
              return;
            }
            var savedContext={role:"student",displayName:displayName,classLevel:classLevel,assignmentStatus:"demo-unverified",sessionStartedAt:new Date().toISOString()};
            try{
              sessionStorage.setItem(STUDENT_CONTEXT_KEY,JSON.stringify(savedContext));
              sessionStorage.setItem("pilotRegistrationName",displayName);
              localStorage.setItem("pacificEducationLevel",classLevel);
            }catch(e){
              entryStatus.textContent="This browser could not save the pilot session. Check browser storage settings and try again.";
              return;
            }
            enterButton.textContent="Confirm Student Session";
            entryStatus.textContent="Student session ready for "+classLevel+". The class choice remains demonstration-only until a teacher confirms the assignment.";
            next.disabled=false;
            renderStudentContextBanner(page,role);
          };
          function requireSessionConfirmation(){
            next.disabled=true;
            entryStatus.textContent="You changed the student or class. Press Confirm Student Session before continuing.";
          }
          nameInput.addEventListener("input",function(){requireSessionConfirmation();});
          classSelect.addEventListener("change",function(){requireSessionConfirmation();});
          home.appendChild(entryPanel);
          next.disabled=!context;
        }
        var heading=document.createElement("h4");
        heading.textContent="Your workspace pathway";
        home.appendChild(heading);
        var list=document.createElement("ol");
        list.setAttribute("aria-label","Workspace steps");
        sequence.slice(1,-1).slice(0,6).forEach(function(step){
          var li=document.createElement("li");
          li.textContent=step[1];
          list.appendChild(li);
        });
        home.appendChild(list);
        var nextStep=document.createElement("p");
        nextStep.style.cssText="padding:12px;border-left:4px solid #15803d;background:#f0fdf4;";
        nextStep.textContent="Next step: "+(sequence[1] ? sequence[1][1] : "workspace tools");
        home.appendChild(nextStep);
        var pilotNote=document.createElement("p");
        pilotNote.innerHTML="<strong>Controlled pilot notice:</strong> Use demonstration information only. This workspace does not provide production authentication or verify official learner, school or government records.";
        home.appendChild(pilotNote);
        page.appendChild(home);
        next.disabled=false;
      }else if(item[0]==="pacificEducationInitialCapabilityTest" || item[0]==="pacificEducationTeacherCapabilityTest"){
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
        if(item[0]==="levelSelection"){
          /* Keep a real workspace heading visible even when legacy selector
             markup is missing or hidden. Preserve existing controls below it. */
          var levelIntro=document.getElementById("peStudentLearningLevelWorkspaceIntro");
          if(!levelIntro){
            levelIntro=document.createElement("section");
            levelIntro.id="peStudentLearningLevelWorkspaceIntro";
            levelIntro.setAttribute("aria-label","Student Learning Level Workspace");
            levelIntro.style.cssText="display:block!important;visibility:visible!important;opacity:1!important;position:relative!important;margin:0 0 14px;padding:16px;border:2px solid #15803d;border-radius:10px;background:#fff;color:#111;";
            levelIntro.innerHTML="<h3 style='margin-top:0'>Student Learning Level Workspace</h3><p>Choose or confirm your Class / Level to continue to Subject, Term and Daily Activities. Your teacher remains responsible for confirming your assigned class.</p><p><strong>Controlled pilot:</strong> use demonstration data only. This page does not authenticate users or verify class assignments.</p>";
          }
          target.insertBefore(levelIntro,target.firstChild);
        }
        moveTargetIntoPage(target,page);
        /* Detect an empty legacy feature after it has been moved and made visible.
           Keep its role-specific recovery tools inside this active page. */
        if(!roleWorkspaceHasContent(target)) addRoleWorkspaceLanding(role,item,page);
        /* After the normal selector and navigation recovery have both had a
           chance to initialise, keep Learning Level usable if no enabled
           selector was rendered. This fallback lives in the active page itself. */
        if(item[0]==="levelSelection") ensureSequentialLevelRecovery(target,page);

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
          var activityPackRendered=false;
          if(window.PacificEducationRoleActivityPacks && typeof window.PacificEducationRoleActivityPacks.render==="function"){
            /* The activity-pack module can exist without successfully rendering
               a learner activity (for example, if its role/step context is not
               recognised). Treat the actual rendered card—not module presence—
               as the success condition, and always provide a usable starter task
               when the student page would otherwise be empty. */
            try{
              activityPackRendered=window.PacificEducationRoleActivityPacks.render(role,item[0],page,dailyDay)===true;
            }catch(activityPackError){}
          }
          if(!activityPackRendered || !page.querySelector("#paceduRoleActivityPack")){
            addStudentDailyActivityStarter(dailyDay,page);
          }
        }
      }else{
        var missing=document.createElement("div");
        missing.style.cssText="padding:16px;border:2px solid #b45309;border-radius:8px;";
        missing.innerHTML="<strong>"+item[1]+" is not connected yet.</strong><p>This page cannot be completed until its existing pilot feature is connected. No placeholder workspace is presented as a working feature.</p>";
        page.appendChild(missing);
        addRoleWorkspaceLanding(role,item,page);
        next.disabled=true;
      }
      /* Add one practical, role-specific work task to the relevant workspace page.
         This is additive: protected access/production gates remain in force. */
      if(window.PacificEducationRoleActivityPacks && typeof window.PacificEducationRoleActivityPacks.render==="function" &&
         role!=="student" && role!=="blind-learner" && role!=="deaf-learner"){
        window.PacificEducationRoleActivityPacks.render(role,item[0],page,dailyDay);
      }
      if(target) next.disabled=false;
      /* The student workspace home is a gated entry point. Keep Next disabled
         until the learner explicitly saves a name and demonstration class.
         A later target-visibility recovery must not override this gate. */
      if(role==="student" && item[0]==="paceduWorkspaceHome" && !readStudentContext()) next.disabled=true;
      renderStudentContextBanner(page,role);
      enforceWorkspaceVisibility();
      /* Do not move focus automatically on the final reading page. */
      if(item[0]!=="paceduSignOutPage"){
        try{
          var focusTitle=document.getElementById("peSequentialTitle");
          if(focusTitle){focusTitle.setAttribute("tabindex","-1");focusTitle.focus({preventScroll:true});}
        }catch(e){}
      }
      speak("Step "+(index+1)+" of "+sequence.length+". "+item[1]+". Follow this numbered step, then press Next.");
    }

    /* Expose the existing final Sign Out page to the registration handoff recovery.
       This changes only the current workspace index; confirmation still controls sign-out. */
    shell.__paceduOpenFinalSignOut=function(){
      if(shell.getAttribute("data-pe-final-signout")==="true") return true;
      index=sequence.length-1;
      renderPage();
      return shell.getAttribute("data-pe-final-signout")==="true";
    };

    back.onclick=function(){
      if(shell.getAttribute("data-pe-final-signout")==="true") return;
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
      /* Defensive lock: even a stale/programmatic Next click cannot leave the
         final Sign Out page. */
      if(shell.getAttribute("data-pe-final-signout")==="true") return;
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
        /* Do not move keyboard focus or the viewport automatically on completion.
           The user controls scrolling and chooses Sign Out when ready. */
      }
    },true);

    /* Query within this freshly-built shell. The legacy page may contain
       duplicate IDs, and document.getElementById can bind Cancel to a stale
       confirmation panel instead of the visible final-page panel. */
    var signOutConfirm=shell.querySelector("#peSequentialSignOutConfirm");
    var signOutButton=shell.querySelector("#peSequentialSignOutButton");
    var signOutCancel=shell.querySelector("#peSequentialSignOutNo");
    var signOutYes=shell.querySelector("#peSequentialSignOutYes");
    function setSignOutConfirmationVisible(visible){
      if(!signOutConfirm) return;
      signOutConfirm.hidden=!visible;
      signOutConfirm.setAttribute("aria-hidden",String(!visible));
      /* Some legacy pilot styles use display rules with !important. Explicitly
         synchronize the hidden state with inline important display so Cancel
         really closes the panel in every role workspace and viewport. */
      if(visible){
        signOutConfirm.style.removeProperty("display");
        signOutConfirm.style.removeProperty("visibility");
      }else{
        signOutConfirm.style.setProperty("display","none","important");
        signOutConfirm.style.setProperty("visibility","hidden","important");
      }
    }
    if(signOutConfirm){
      signOutConfirm.hidden=true;
      signOutConfirm.setAttribute("aria-hidden","true");
      signOutConfirm.style.setProperty("display","none","important");
      signOutConfirm.style.setProperty("visibility","hidden","important");
    }
    if(signOutButton) signOutButton.onclick=function(){
      setSignOutConfirmationVisible(true);
      speak("Sign Out selected. Confirm Sign Out or Cancel.");
    };
    /* Handle Cancel at the shell's capture phase as well as on the button.
       This guarantees the visible workspace confirmation closes before legacy
       document-level click handlers can interfere. The button and panel are
       both resolved from this shell, never by a document-wide duplicate ID. */
    if(signOutCancel){
      /* Close on pointerdown as well as click: a legacy document-level click
         capture listener can stop propagation before the shell sees click.
         Pointerdown runs earlier in the normal tap sequence, so the visible
         panel closes before that legacy click path can reopen or preserve it. */
      function cancelSignOut(event){
        if(event){event.preventDefault();event.stopPropagation();}
        setSignOutConfirmationVisible(false);
      }
      signOutCancel.addEventListener("pointerdown",cancelSignOut,true);
      signOutCancel.addEventListener("click",function(event){
        if(event){event.preventDefault();event.stopImmediatePropagation();}
        setSignOutConfirmationVisible(false);
      },true);
      signOutCancel.onclick=function(event){
        if(event){event.preventDefault();event.stopImmediatePropagation();}
        setSignOutConfirmationVisible(false);
      };
    }
    if(signOutYes) signOutYes.onclick=function(){
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
        if(LEARNER_ROLES[role]) localStorage.removeItem("pacificEducationLevel");
      }catch(e){}
      restoreAllMovedTargets();
      restoreAppMenu();
      restorePilotBoxesMenu();
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
      var shell=document.getElementById("pacificEducationSequentialRoleWorkspace");
      if(!shell) return;
      /* Check the final-page lock before inspecting history state: Back may
         point to an older/non-sequential entry, but must not replace this page. */
      if(shell.getAttribute("data-pe-final-signout")==="true"){
        try{history.pushState({pacificEducationSequential:true,role:getRole(),finalSignOut:true},"","#pacificEducationSequentialRoleWorkspace");}catch(e){}
        return;
      }
      if(!state.pacificEducationSequential || state.role!==getRole()) return;
      var backButton=document.getElementById("peSequentialBack");
      if(backButton && state.index>=0){
        backButton.click();
      }
    });
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",bind);
  else bind();

  window.PacificEducationSequentialRoleWorkspaces={
    version:"1.3.2-pilot-boxes-after-registration",
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