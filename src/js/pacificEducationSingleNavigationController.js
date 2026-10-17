(function(window,document){
"use strict";

/*
 * Pacific Education — SINGLE navigation + feature handoff authority.
 *
 * This controller is the only owner of the controlled page-by-page Next chain.
 * Existing feature engines remain owners of their own feature logic:
 * registration, curriculum selectors, daily activity runtime, assessments,
 * dashboards, voice, accessibility, mailbox, Guardian and sign-out.
 *
 * Protected #856 voice is NOT replaced or rewritten here.
 */

var STEPS = {
  prototypeNextButton:  [5, "levelSelection"],
  levelNextButton:      [6, "subjectSelection"],
  subjectNextButton:    [7, "termSelection"],
  termNextButton:       [8, "capabilitySelection"],
  capabilityNextButton: [9, "dailyLesson"],
  dailyNextButton:      [10, "dailyLessonPracticeStage"],
  practiceNextButton:   [11, "assessments"],
  assessmentNextButton: [12, "pacificEducationCoverageDashboard"]
};

var GATEWAY = {
  vision: "paceduPageVision",
  rules: "paceduPageRules",
  welcome: "pacificEducationWelcome"
};

/* One page-back authority for the complete pilot sequence. */
var BACK = {
  paceduPageVision: [1, "welcome"],
  paceduPageRules: [2, "vision"],
  pacificEducationIdentityRegistration: [3, "rules"],
  prototypeAccess: [4, "registration"],
  levelSelection: [5, "prototype"],
  subjectSelection: [6, "level"],
  termSelection: [7, "subject"],
  capabilitySelection: [8, "term"],
  dailyLesson: [9, "capability"],
  dailyLessonPracticeStage: [10, "daily"],
  assessments: [11, "practice"],
  pacificEducationCoverageDashboard: [12, "assessment"],
  teacherCalendarSection: [13, "coverage"]
};

var bound = {};
var backBound = {};
var GUIDED_PAGES = [
  "paceduPageVision",
  "paceduPageRules",
  "pacificEducationIdentityRegistration",
  "prototypeAccess",
  "levelSelection",
  "subjectSelection",
  "termSelection",
  "capabilitySelection",
  "dailyLesson",
  "dailyLessonPracticeStage",
  "assessments",
  "teacherCalendarSection",
  "pacificEducationCoverageDashboard"
];


function el(id){ return document.getElementById(id); }

/* Shared, low-motion page entrance for all 14 guided steps.
 * Visibility remains owned by the single navigation controller; this only animates
 * the incoming panel after isolation, so it cannot expose two pages at once.
 */
function installGuidedTransitionStyle(){
  if(el("pacedu-guided-transition-style")) return;
  var style=document.createElement("style");
  style.id="pacedu-guided-transition-style";
  style.textContent=
    ".pacedu-guided-page-enter{animation:paceduGuidedPageEnter 210ms cubic-bezier(.2,.7,.2,1) both;}"+
    "@keyframes paceduGuidedPageEnter{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}" +
    "@media(prefers-reduced-motion:reduce){.pacedu-guided-page-enter{animation:none!important;transform:none!important;opacity:1!important}}";
  (document.head||document.documentElement).appendChild(style);
}
function animateGuidedPageEntry(targetId){
  var target=el(targetId);
  if(!target || !PAGE_GUIDE[targetId]) return;
  installGuidedTransitionStyle();
  target.classList.remove("pacedu-guided-page-enter");
  /* Restart the brief entrance animation without scrolling or changing page height. */
  try{ void target.offsetWidth; }catch(e){}
  target.classList.add("pacedu-guided-page-enter");
  window.setTimeout(function(){
    if(target && target.classList) target.classList.remove("pacedu-guided-page-enter");
  },280);
}

function setStatus(message){
  var a=el("pacificEducationVoiceStatus");
  var b=el("pacificEducationInteractionStatus");
  if(a) a.textContent=message;
  if(b) b.textContent=message;
}

function safeCall(objectName, method, args){
  try{
    var object=window[objectName];
    if(object && typeof object[method]==="function"){
      return object[method].apply(object,args||[]);
    }
  }catch(e){}
  return false;
}

function isRenderedLevelRecoveryHost(host){
  if(!host) return false;
  try{
    if(host.getClientRects().length===0) return false;
    var node=host;
    while(node){
      var style=window.getComputedStyle(node);
      if(style.display==="none" || style.visibility==="hidden" ||
         Number(style.opacity)===0 || node.hidden) return false;
      node=node.parentElement;
    }
    return true;
  }catch(e){return false;}
}

function ensureVisibleLevelSelectorFallback(){
  var host=el("pacificEducationLevelSelector");
  /* Older layouts may omit the selector host, or legacy CSS may hide it.
     Mount recovery in the active Learning Level page instead of silently
     returning or appending controls inside an invisible host. */
  if(!isRenderedLevelRecoveryHost(host)) host=el("levelSelection");
  if(!host) return;
  /* A selector in the DOM is not proof that the learner can use it. Legacy CSS
     may hide it, make it transparent, or clip it inside a wrapper. Only skip
     recovery when an enabled selector is rendered and its ancestor chain is
     not hidden. Keep this check local to Learning Level. */
  var existingSelect=host.querySelector("select:not(:disabled)");
  if(existingSelect){
    var selectorIsVisible=false;
    try{
      selectorIsVisible=existingSelect.getClientRects().length>0;
      var node=existingSelect;
      while(selectorIsVisible && node){
        var style=window.getComputedStyle(node);
        if(style.display==="none" || style.visibility==="hidden" ||
           Number(style.opacity)===0 || node.hidden){
          selectorIsVisible=false;
          break;
        }
        /* overflow:hidden/clip can leave a selector technically rendered but
           completely outside the visible box. Recover only when fully clipped. */
        if(node!==existingSelect && (style.overflowX==="hidden" || style.overflowX==="clip" ||
           style.overflowY==="hidden" || style.overflowY==="clip")){
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
    }catch(e){}
    if(selectorIsVisible) return;
  }
  /* Recovery UI only: keep the class/level page usable if its selector script
     failed to load. This never claims that a teacher assignment was verified. */
  var box=document.createElement("div");
  box.style.cssText="padding:14px;border:2px solid #b45309;border-radius:8px;margin:12px 0;";
  var label=document.createElement("label");
  label.htmlFor="paceduLevelSelectorRecovery";
  label.textContent="Choose your learning class / level";
  var select=document.createElement("select");
  select.id="paceduLevelSelectorRecovery";
  select.style.cssText="display:block;width:100%;max-width:420px;padding:12px;margin:8px 0;";
  var levels=["Class 1","Class 2","Class 3","Class 4","Class 5","Class 6","Class 7","Class 8","Class 9","Class 10","Class 11","Class 12","Class 13"];
  var saved="";
  try{saved=localStorage.getItem("pacificEducationLevel")||"";}catch(e){}
  levels.forEach(function(level){
    var option=document.createElement("option");
    option.value=level;option.textContent=level;select.appendChild(option);
  });
  select.value=levels.indexOf(saved)>=0?saved:"Class 1";
  var note=document.createElement("p");
  note.setAttribute("role","status");
  note.setAttribute("aria-live","polite");
  note.textContent="Recovery selector is active because the normal selector did not render. This pilot choice does not verify a teacher-assigned class.";
  select.addEventListener("change",function(){
    try{localStorage.setItem("pacificEducationLevel",select.value);}catch(e){}
    note.textContent="Selected "+select.value+". Please confirm your assigned class with your teacher. Continue to Subject when ready.";
    try{document.dispatchEvent(new CustomEvent("pacificEducationSelectionChanged",{detail:{level:select.value,pilotRecovery:true}}));}catch(e){}
  });
  box.appendChild(label);box.appendChild(select);box.appendChild(note);host.appendChild(box);
}
function ensureVisibleDailyActivityFallback(){
  var host=el("dailyLessonActivity");
  if(!host) return;
  var text=String(host.textContent||"").trim();
  if(host.querySelector("input,textarea,select,button,[data-pe-activity-card]") ||
     (text && !/loading today's learning activity/i.test(text))) return;
  /* Only supply a starter if the existing lesson renderer left its loading
     placeholder in place. Preserve any real lesson/activity content. */
  while(host.firstChild) host.removeChild(host.firstChild);
  var card=document.createElement("section");
  card.setAttribute("data-pe-activity-card","daily-starter");
  card.style.cssText="padding:16px;border:2px solid #15803d;border-radius:10px;margin:12px 0;";
  var heading=document.createElement("h3");heading.textContent="📚 Student Daily Activity — Day 1";
  var instruction=document.createElement("p");instruction.textContent="Choose a subject, try the task, and save your response on this device. This is a pilot starter activity, not a verified teacher assignment.";
  var subject=document.createElement("select");
  subject.setAttribute("aria-label","Daily activity subject");
  subject.style.cssText="display:block;width:100%;max-width:420px;padding:10px;margin:8px 0;";
  [["English","English"],["Mathematics","Mathematics"],["Phonics","Phonics"]].forEach(function(pair){
    var option=document.createElement("option");option.value=pair[0];option.textContent=pair[1];subject.appendChild(option);
  });
  var task=document.createElement("p");
  var answer=document.createElement("textarea");
  answer.setAttribute("aria-label","Your daily activity answer");
  answer.placeholder="Write or dictate your answer here";
  answer.rows=3;answer.style.cssText="display:block;width:100%;max-width:620px;box-sizing:border-box;padding:10px;margin:8px 0;";
  var save=document.createElement("button");save.type="button";save.textContent="Save Answer";
  var complete=document.createElement("button");complete.type="button";complete.textContent="✓ Mark Activity Complete";
  var status=document.createElement("p");status.setAttribute("role","status");status.setAttribute("aria-live","polite");
  var tasks={
    English:"Write or say: “Good morning. My name is ____.”",
    Mathematics:"Count five safe objects you can see. Write the total and the numbers from 1 to 5.",
    Phonics:"Choose the letter A. Write one familiar word that begins with A, such as apple."
  };
  function loadSaved(){
    try{
      var key="pacificEducationDailyStarterResponsesV1_"+subject.value;
      answer.value=localStorage.getItem(key+"_answer")||"";
      var completed=localStorage.getItem(key+"_completed")==="true";
      status.textContent=completed?"✓ "+subject.value+" activity completed and saved on this device.":"Starter activity ready. Save your answer when finished.";
    }catch(e){status.textContent="Starter activity ready for this session.";}
  }
  function paintTask(){task.textContent=tasks[subject.value];loadSaved();}
  subject.addEventListener("change",paintTask);
  function persist(completed){
    try{
      var key="pacificEducationDailyStarterResponsesV1_"+subject.value;
      localStorage.setItem(key+"_answer",answer.value);
      localStorage.setItem(key+"_completed",completed?"true":"false");
      localStorage.setItem(key+"_savedAt",new Date().toISOString());
      status.textContent=completed?"✓ "+subject.value+" activity marked complete and saved on this device.":"Answer saved on this device.";
    }catch(e){status.textContent="Storage is unavailable; your answer is not confirmed saved.";}
  }
  save.addEventListener("click",function(){persist(false);});
  complete.addEventListener("click",function(){persist(true);});
  card.appendChild(heading);card.appendChild(instruction);card.appendChild(subject);card.appendChild(task);
  var answerLabel=document.createElement("label");answerLabel.textContent="Your answer";answerLabel.htmlFor="paceduDailyStarterAnswer";answer.id="paceduDailyStarterAnswer";
  card.appendChild(answerLabel);card.appendChild(answer);card.appendChild(save);card.appendChild(complete);card.appendChild(status);
  host.appendChild(card);paintTask();
}
function refreshFeatureForTarget(targetId){
  if(targetId==="levelSelection"){
    safeCall("PacificEducationLevelSelector","initialise");
    ensureVisibleLevelSelectorFallback();
  }
  if(targetId==="subjectSelection") safeCall("PacificEducationSubjectSelector","initialise");
  if(targetId==="termSelection") safeCall("PacificEducationTermSelector","initialise");
  if(targetId==="capabilitySelection") safeCall("PacificEducationCapabilitySelector","initialise");

  if(targetId==="dailyLesson"){
    safeCall("PacificEducationCurriculumLessonRenderer","initialise");
    safeCall("PacificEducationCurriculumLessonRenderer","refresh");
    safeCall("PacificEducationStudentProgressDashboardUI","render",["pacificEducationStudentProgressDashboard"]);
    ensureVisibleDailyActivityFallback();
  }

  if(targetId==="dailyLessonPracticeStage"){
    safeCall("PacificEducationCurriculumLessonRenderer","refresh");
  }

  if(targetId==="assessments"){
    safeCall("PacificEducationStudentProgressDashboardUI","render",["pacificEducationStudentProgressDashboard"]);
  }

  if(targetId==="teacherCalendarSection"){
    safeCall("PacificEducationTeacherClassDashboardUI","render",["pacificEducationTeacherClassDashboard"]);
    safeCall("PacificEducationDashboards","refreshTeacherDashboard");
    safeCall("PacificEducationTeacherReviewQueue","render");
  }
}

function hideOtherGuidedPages(targetId){
  /*
   * LOCKED PAGE-BY-PAGE RULE:
   * Next and Back may reveal only their one mandated destination page.
   * Never leave Welcome, Vision, Rules, or another guided page visible beside it.
   * Back returns to the previous step; Next advances only to the next defined step.
   */
  [GATEWAY.welcome,GATEWAY.vision,GATEWAY.rules].forEach(function(pageId){
    var page=el(pageId);
    if(!page || pageId===targetId) return;
    page.hidden=true;
    page.setAttribute("aria-hidden","true");
    try{ page.style.setProperty("display","none","important"); }catch(e){}
  });
  GUIDED_PAGES.forEach(function(pageId){
    var page=el(pageId);
    if(!page) return;
    /* Coverage Dashboard is nested inside Teacher Calendar in the legacy DOM.
       Keep that required ancestor visible as a container, but expose only the
       dashboard content as the active guided page. */
    var requiredAncestor=targetId==="pacificEducationCoverageDashboard" &&
      pageId==="teacherCalendarSection" && page.contains(el(targetId));
    var visible=pageId===targetId || requiredAncestor;
    page.hidden=!visible;
    if(visible) page.removeAttribute("aria-hidden");
    else page.setAttribute("aria-hidden","true");
    try{ page.style.setProperty("display",visible?"block":"none","important"); }catch(e){}
  });
}

/* Keep isolation scoped to known page panels only.
 * Hiding arbitrary siblings up the DOM tree permanently disabled registration
 * controls and unrelated app features; the page list below is the authority.
 */
function isolateCurrentPage(targetId){
  var target=el(targetId);
  if(!target) return false;
  hideOtherGuidedPages(targetId);
  [GATEWAY.welcome,GATEWAY.vision,GATEWAY.rules].forEach(function(pageId){
    var page=el(pageId);
    if(!page || pageId===targetId) return;
    page.hidden=true;
    page.setAttribute("aria-hidden","true");
    try{ page.style.setProperty("display","none","important"); }catch(e){}
  });
  target.hidden=false;
  target.removeAttribute("aria-hidden");
  try{ target.style.setProperty("display","block","important"); }catch(e){}
  return true;
}

function updateUserBoxDirection(targetId){
  try{
    document.querySelectorAll(".pe-user-box").forEach(function(box){
      box.classList.remove("pe-sequence-user-active");
      box.removeAttribute("data-pe-sequence-direction");
    });
    var target=el(targetId);
    if(!target) return;
    target.querySelectorAll(".pe-user-box").forEach(function(box){
      box.classList.add("pe-sequence-user-active");
      box.setAttribute("data-pe-sequence-direction","current-step");
    });
  }catch(e){}
}

var NEXT_WRAPPERS = {
  /* Gateway pages also need their own Next wrappers; otherwise gateway() hides every Next button. */
  paceduPageVision: "paceduVisionNext",
  paceduPageRules: "paceduRulesContinue",
  pacificEducationWelcome: "welcomeNextWrapper",
  pacificEducationIdentityRegistration: "registrationNextWrapper",
  prototypeAccess: "prototypeNextWrapper",
  levelSelection: "levelNextWrapper",
  subjectSelection: "subjectNextWrapper",
  termSelection: "termNextWrapper",
  capabilitySelection: "capabilityNextWrapper",
  dailyLesson: "dailyNextWrapper",
  dailyLessonPracticeStage: "practiceNextWrapper",
  assessments: "assessmentNextWrapper",
  pacificEducationCoverageDashboard: "coverageNextWrapper",
  teacherCalendarSection: "teacherCalendarNextWrapper"
};

var ALL_NEXT_WRAPPERS = [
  "welcomeNextWrapper","paceduVisionNext","paceduRulesContinue","registrationNextWrapper","prototypeNextWrapper",
  "levelNextWrapper","subjectNextWrapper","termNextWrapper","capabilityNextWrapper",
  "dailyNextWrapper","practiceNextWrapper","assessmentNextWrapper",
  "coverageNextWrapper","teacherCalendarNextWrapper"
];

function syncNextWrapper(targetId){
  ALL_NEXT_WRAPPERS.forEach(function(id){
    var wrapper=el(id);
    if(wrapper) wrapper.style.setProperty("display","none","important");
  });
  var activeId=NEXT_WRAPPERS[targetId];
  var active=activeId && el(activeId);
  if(active) active.style.setProperty("display","flex","important");

  /* Keep each Next control large, tappable, and visibly active on phones. */
  var controls=[
    "welcomeNextButton","paceduVisionNext","paceduRulesContinue","registrationNextButton",
    "prototypeNextButton","levelNextButton","subjectNextButton","termNextButton",
    "capabilityNextButton","dailyNextButton","practiceNextButton","assessmentNextButton",
    "coverageNextButton","teacherCalendarNextButton"
  ];
  controls.forEach(function(id){
    var button=el(id);
    if(!button) return;
    button.type="button";
    button.style.pointerEvents="auto";
    button.style.touchAction="manipulation";
    button.style.cursor="pointer";
    button.style.position="relative";
    button.style.zIndex="51";
    button.classList.add("pe-user-next");
    if(!button.getAttribute("aria-label")) button.setAttribute("aria-label","Next to the following Pacific Education page");
  });
}

function revealTarget(targetId){
  var target=el(targetId);
  if(!target) return false;

  hideOtherGuidedPages(targetId);
  syncNextWrapper(targetId);
  updateUserBoxDirection(targetId);

  target.hidden=false;
  target.removeAttribute("aria-hidden");
  try{ target.style.setProperty("display","block","important"); }catch(e){}

  var parent=target.parentElement;
  while(parent && parent.id!=="app"){
    parent.hidden=false;
    parent.removeAttribute("aria-hidden");
    try{ parent.style.setProperty("display","block","important"); }catch(e){}
    parent=parent.parentElement;
  }

  /* Swap pages without smooth-scrolling through unrelated information. */
  isolateCurrentPage(targetId);
  animateGuidedPageEntry(targetId);
  refreshFeatureForTarget(targetId);
  return true;
}

/* Visible page-by-page sequence guide. This is navigation UI only; it does not change speech. */
var PAGE_GUIDE = {
  pacificEducationWelcome:[1,"Welcome"],
  paceduPageVision:[2,"Pacific Education vision"],
  paceduPageRules:[3,"Pilot rules and agreement"],
  pacificEducationIdentityRegistration:[4,"User registration"],
  prototypeAccess:[5,"Prototype access"],
  levelSelection:[6,"Learning level"],
  subjectSelection:[7,"Subject"],
  termSelection:[8,"Term"],
  capabilitySelection:[9,"Learning capability"],
  dailyLesson:[10,"Daily lesson"],
  dailyLessonPracticeStage:[11,"Practice activity"],
  assessments:[12,"Assessment"],
  pacificEducationCoverageDashboard:[13,"Coverage and progress"],
  teacherCalendarSection:[14,"Teacher calendar and review"]
};
function renderPageGuide(targetId){
  var target=el(targetId);
  var info=PAGE_GUIDE[targetId];
  if(!target || !info) return;
  var guide=target.querySelector(".pacedu-page-sequence-guide");
  if(!guide){
    guide=document.createElement("section");
    guide.className="pacedu-page-sequence-guide";
    guide.setAttribute("aria-label","Page-by-page sequence guide");
    guide.style.cssText="margin:0 0 16px;padding:12px 14px;border:2px solid #1877b7;border-radius:10px;background:#eef8ff;color:#17324d";
    var number=document.createElement("strong");
    number.className="pacedu-page-sequence-number";
    number.style.cssText="display:block;color:#145b8d;font-size:1.05rem";
    var detail=document.createElement("p");
    detail.className="pacedu-page-sequence-detail";
    detail.style.cssText="margin:5px 0 0";
    detail.textContent=targetId==="pacificEducationWelcome"?"Review this welcome and introduction, then use the green Next button. Only the current page should be shown.":"Complete the blue-highlighted entry boxes on this page, then use the green Next button. Only the current page should be shown.";
    guide.appendChild(number);
    guide.appendChild(detail);
    target.insertBefore(guide,target.firstChild);
  }
  var numberEl=guide.querySelector(".pacedu-page-sequence-number");
  if(numberEl) numberEl.textContent="Page "+info[0]+" of 14 — "+info[1];
  guide.setAttribute("data-pac-edu-sequence-page",String(info[0]));
}

function enforceSingleVisiblePage(targetId, expectedStep){
  lockLearningToolsDuringEntry();
  /* The active destination is the navigation authority. Legacy handlers may
     overwrite the numeric step after Back; reject stale repairs by destination,
     then restore the matching step for the still-current destination. */
  if(document.body.getAttribute("data-pe-active-guided-page")!==targetId) return;
  if(document.body.getAttribute("data-pe-flow-step")!==String(expectedStep)){
    document.body.setAttribute("data-pe-flow-step",String(expectedStep));
  }
  document.body.classList.remove("pacedu-entry-mode");
  if(targetId!=="pacificEducationIdentityRegistration"){
    document.body.classList.remove("pacedu-registration-mode");
  }
  GUIDED_PAGES.forEach(function(pageId){
    var page=el(pageId);
    if(!page) return;
    /* Preserve the required DOM ancestor when the Coverage Dashboard is active.
       The ancestor is a layout container, not a second active page. */
    var requiredAncestor=targetId==="pacificEducationCoverageDashboard" &&
      pageId==="teacherCalendarSection" && page.contains(el(targetId));
    var visible=pageId===targetId || requiredAncestor;
    if(page.hidden===visible) page.hidden=!visible;
    if(visible){
      if(page.hasAttribute("aria-hidden")) page.removeAttribute("aria-hidden");
    }else if(page.getAttribute("aria-hidden")!=="true"){
      page.setAttribute("aria-hidden","true");
    }
    try{
      var wantedDisplay=visible?"block":"none";
      if(page.style.getPropertyValue("display")!==wantedDisplay ||
         page.style.getPropertyPriority("display")!=="important"){
        page.style.setProperty("display",wantedDisplay,"important");
      }
    }catch(e){}
  });
  [GATEWAY.welcome,GATEWAY.vision,GATEWAY.rules].forEach(function(pageId){
    var page=el(pageId);
    if(!page) return;
    var active=pageId===targetId;
    page.hidden=!active;
    if(active) page.removeAttribute("aria-hidden");
    else page.setAttribute("aria-hidden","true");
    try{ page.style.setProperty("display",active?"block":"none","important"); }catch(e){}
  });
}

function stopSpeechForPageTransition(targetId){
  var active=document.body.getAttribute("data-pe-active-guided-page")||"";
  if(!active){
    var entry=document.body.getAttribute("data-pac-edu-entry-page");
    active=entry==="1"?GATEWAY.welcome:entry==="2"?GATEWAY.vision:entry==="3"?GATEWAY.rules:"";
  }
  if(!active || active===targetId) return;
  /* A page's audio must not continue into the next page (especially Welcome -> Registration). */
  try{
    var speech=window.PacificEducationSpeech;
    if(speech && typeof speech.stopSpeech==="function"){
      speech.stopSpeech();
      return;
    }
  }catch(e){}
  try{
    if(window.PacificEducationNativeTTS && typeof window.PacificEducationNativeTTS.stop==="function"){
      window.PacificEducationNativeTTS.stop();
    }
    if(window.speechSynthesis && typeof window.speechSynthesis.cancel==="function"){
      window.speechSynthesis.cancel();
    }
  }catch(e){}
}

/* Fail closed for Learning Tools throughout Welcome, Vision, Rules and Registration.
 * Guided navigation owns visibility; #856 activation must not briefly expose this panel.
 */
function lockLearningToolsDuringEntry(){
  var page=el("learningPlatform");
  if(!page) return;
  var activeGuidedPage=document.body.getAttribute("data-pe-active-guided-page")||"";
  var inEntry=document.body.classList.contains("pacedu-entry-mode") ||
               document.body.classList.contains("pacedu-registration-mode") ||
               (document.body.classList.contains("pe-guided-flow") &&
                activeGuidedPage==="pacificEducationIdentityRegistration");
  if(!inEntry) return;
  page.hidden=true;
  page.setAttribute("aria-hidden","true");
  try{ page.style.setProperty("display","none","important"); }catch(e){}
}

function guided(step,targetId){
  lockLearningToolsDuringEntry();
  stopSpeechForPageTransition(targetId);
  if(Number(step)>0) document.documentElement.setAttribute("data-pacedu-entry-advanced","true");
  document.body.classList.remove("pacedu-entry-mode","pacedu-registration-mode");
  document.body.classList.add("pe-guided-flow","pe-pilot-all-features");
  document.body.setAttribute("data-pe-flow-step",String(step));
  document.body.setAttribute("data-pe-active-guided-page",targetId);
  document.body.setAttribute("data-pe-navigation-owner","single");

  lockLearningToolsDuringEntry();
  var ok=revealTarget(targetId);
  lockLearningToolsDuringEntry();
  if(ok){
    renderPageGuide(targetId);
    var pageInfo=PAGE_GUIDE[targetId];
    setStatus(pageInfo?"Pacific Education Page "+pageInfo[0]+" of 14 — "+pageInfo[1]+" is active. Use the green Next button to continue.":"Pacific Education page is active. Use the green Next button to continue.");
    /* Legacy feature handlers can restore a previous panel after navigation.
       Reassert the current destination during the short transition window. Each
       repair verifies the current step, so an old timer cannot override a newer
       user navigation. This is visibility-only and does not touch protected voice. */
    [0,40,80,120,160,220,300,500,800,1100,1400,1800].forEach(function(delay){
      window.setTimeout(function(){ enforceSingleVisiblePage(targetId,step); },delay);
    });
  }
  return ok;
}

function enforceSingleGatewayPage(expectedPage, targetId){
  /* Legacy registration helpers may restore their display state after Back.
     Re-assert the selected Welcome/Vision/Rules gateway after those callbacks. */
  if(!document.body.classList.contains("pacedu-entry-mode") ||
     document.body.getAttribute("data-pac-edu-entry-page")!==String(expectedPage)) return;
  document.body.classList.remove("pe-guided-flow","pacedu-registration-mode");
  GUIDED_PAGES.forEach(function(pageId){
    var node=el(pageId);
    if(!node) return;
    node.hidden=true;
    node.setAttribute("aria-hidden","true");
    try{node.style.setProperty("display","none","important");}catch(e){}
  });
  [GATEWAY.welcome,GATEWAY.vision,GATEWAY.rules].forEach(function(pageId){
    var node=el(pageId);
    if(!node) return;
    var active=pageId===targetId;
    node.hidden=!active;
    if(active) node.removeAttribute("aria-hidden");
    else node.setAttribute("aria-hidden","true");
    try{node.style.setProperty("display",active?"block":"none","important");}catch(e){}
  });
  lockLearningToolsDuringEntry();
}

function gateway(page){
  lockLearningToolsDuringEntry();
  var targetId=page===1?GATEWAY.welcome:page===2?GATEWAY.vision:GATEWAY.rules;
  stopSpeechForPageTransition(targetId);
  /* Fail closed: once guided navigation has advanced, legacy callers may not
     reopen Welcome. The explicit Back-to-Welcome handler clears this lock first. */
  if(Number(page)===1 && document.documentElement.getAttribute("data-pacedu-entry-advanced")==="true") return false;
  if(Number(page)>1) document.documentElement.setAttribute("data-pacedu-entry-advanced","true");
  document.body.classList.remove("pe-guided-flow","pacedu-registration-mode");
  document.body.classList.add("pacedu-entry-mode");
  document.body.setAttribute("data-pac-edu-entry-page",String(page));
  /* Invalidate delayed guided-page repairs before they can reopen the page we just left. */
  document.body.removeAttribute("data-pe-flow-step");
  document.body.removeAttribute("data-pe-active-guided-page");
  document.body.setAttribute("data-pe-navigation-owner","single");

  var pilot=el("pacificEducationPilotPages");
  var welcome=el(GATEWAY.welcome);
  var vision=el(GATEWAY.vision);
  var rules=el(GATEWAY.rules);

  if(pilot){ pilot.hidden=false; pilot.style.display=""; }
  renderPageGuide(page===1?"pacificEducationWelcome":page===2?"paceduPageVision":"paceduPageRules");

  /* Entry pages and guided pages must never remain visible together on Back/Next. */
  GUIDED_PAGES.forEach(function(pageId){
    var page=el(pageId);
    if(!page) return;
    page.hidden=true;
    page.setAttribute("aria-hidden","true");
    try{ page.style.setProperty("display","none","important"); }catch(e){}
  });

  /* Gateway Next/Back shows exactly one of Welcome, Vision, or Rules. */
  [welcome,vision,rules].forEach(function(node,index){
    if(!node) return;
    var active=(index+1)===page;
    node.hidden=!active;
    if(active) node.removeAttribute("aria-hidden");
    else node.setAttribute("aria-hidden","true");
    node.style.display=active?(index===0?"":"block"):"none";
  });

  if(page===1){
    setStatus("Welcome page active. AI Playback and welcome voice are protected.");
  }else if(page===2){
    setStatus("Pacific Education vision page active. Press Next for Rules & Conditions.");
  }else{
    setStatus("Rules & Conditions active. Agree to continue to Registration.");
  }
  var activePageId=page===1 ? "pacificEducationWelcome" : page===2 ? "paceduPageVision" : "paceduPageRules";
  syncNextWrapper(activePageId);
  isolateCurrentPage(activePageId);
  animateGuidedPageEntry(activePageId);
  lockLearningToolsDuringEntry();
  /* Re-check after legacy handlers and their queued display repairs run. */
  window.setTimeout(function(){enforceSingleGatewayPage(page,activePageId);},0);
  window.setTimeout(function(){enforceSingleGatewayPage(page,activePageId);},150);
  return true;
}

function go(step,targetId){
  return guided(step,targetId);
}

function bind(id,fn){
  var button=el(id);
  /* Real entry-page links use browser navigation; do not intercept them as buttons. */
  if(button && button.tagName==="A" && button.getAttribute("href")) return;
  if(!button || bound[id]===button) return;
  /* Replaced DOM nodes must be rebound; a stale ID must never leave a new button dead. */
  bound[id]=button;

  button.setAttribute("data-pe-single-navigation","true");
  button.setAttribute("data-pe-navigation-owner","single");

  button.addEventListener("click",function(event){
    if(button.disabled) return;
    event.preventDefault();
    event.stopPropagation();
    fn(button,event);
  },false);

  button.addEventListener("keydown",function(event){
    if(button.disabled) return;
    if(event.key==="Enter" || event.key===" "){
      event.preventDefault();
      button.click();
    }
  },false);

  button.style.pointerEvents="auto";
  button.style.touchAction="manipulation";
}

/* Create exactly one visible Back control on every guided page. */
function ensureBackButton(targetId){
  var target=el(targetId);
  if(!target || !BACK[targetId]) return;
  var id="pacificEducationBack_"+targetId;
  var button=el(id);
  if(!button){
    button=document.createElement("button");
    button.type="button";
    button.id=id;
    button.textContent="⬅️ Back";
    button.setAttribute("aria-label","Back to previous Pacific Education page");
    button.setAttribute("data-pe-back-button","true");
    button.setAttribute("data-pe-navigation-owner","single");
    button.style.display="block";
    button.style.pointerEvents="auto";
    button.style.touchAction="manipulation";
    button.style.position="relative";
    button.style.zIndex="60";
    button.style.minHeight="44px";
    button.style.cursor="pointer";
    button.style.margin="12px 0";
    button.style.padding="10px 16px";
    target.insertBefore(button,target.firstChild);
  }
  /* Keep the Back control above animated page content and legacy overlays.
     Re-apply these styles to existing nodes too, since feature repair can reuse
     a button created by an earlier script before the single controller binds it. */
  button.style.pointerEvents="auto";
  button.style.touchAction="manipulation";
  button.style.position="relative";
  button.style.zIndex="60";
  button.style.minHeight="44px";
  button.style.cursor="pointer";
  if(backBound[id]===button) return;
  /* Rebind if a repair or feature insertion replaces this page’s Back node. */
  backBound[id]=button;
  button.addEventListener("click",function(event){
    /* Run at the target's capture phase so a legacy bubble handler on a reused
       Back node cannot block the single-navigation action or stall click dispatch. */
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    window.setTimeout(function(){
      var row=BACK[targetId];
      if(!row) return;
      if(row[1]==="welcome"){ document.documentElement.removeAttribute("data-pacedu-entry-advanced"); gateway(1); return; }
      if(row[1]==="vision"){ gateway(2); return; }
      if(row[1]==="rules"){ gateway(3); return; }
      var map={
        registration:["pacificEducationIdentityRegistration",3],
        prototype:["prototypeAccess",4],
        level:["levelSelection",5],
        subject:["subjectSelection",6],
        term:["termSelection",7],
        capability:["capabilitySelection",8],
        daily:["dailyLesson",9],
        practice:["dailyLessonPracticeStage",10],
        assessment:["assessments",11],
        coverage:["pacificEducationCoverageDashboard",12]
      };
      if(map[row[1]]) guided(map[row[1]][1],map[row[1]][0]);
    },0);
  },true);
}

function bindAllBackButtons(){
  Object.keys(BACK).forEach(ensureBackButton);
}

function ensureCoverageNextButton(){
  var target=el("pacificEducationCoverageDashboard");
  if(!target) return;
  var wrapper=el("coverageNextWrapper");
  if(!wrapper){
    wrapper=document.createElement("div");
    wrapper.id="coverageNextWrapper";
    wrapper.className="pacific-flow-next";
    target.appendChild(wrapper);
  }
  if(!el("coverageNextButton")){
    var button=document.createElement("button");
    button.type="button";
    button.id="coverageNextButton";
    button.textContent="➡️ Next — Teacher Calendar";
    button.setAttribute("aria-label","Next: Teacher Calendar and Review");
    button.setAttribute("data-pe-single-navigation","true");
    button.setAttribute("data-pe-navigation-owner","single");
    wrapper.appendChild(button);
    var audio=document.createElement("button");
    audio.type="button";
    audio.className="pe-audio-command";
    audio.setAttribute("data-audio-command-for","coverageNextButton");
    audio.setAttribute("aria-label","Audio command for Coverage Next");
    audio.textContent="🎙️ Say Next";
    wrapper.appendChild(audio);
    var status=document.createElement("span");
    status.className="pe-audio-command-status";
    status.setAttribute("data-audio-status-for","coverageNextButton");
    status.setAttribute("role","status");
    status.setAttribute("aria-live","polite");
    status.textContent="Ready";
    wrapper.appendChild(status);
  }
}

function ensureTeacherCalendarNextButton(){
  var target=el("teacherCalendarSection");
  if(!target) return;
  var wrapper=el("teacherCalendarNextWrapper");
  if(!wrapper){
    wrapper=document.createElement("div");
    wrapper.id="teacherCalendarNextWrapper";
    wrapper.className="pacific-flow-next";
    target.appendChild(wrapper);
  }
  if(!el("teacherCalendarNextButton")){
    var button=document.createElement("button");
    button.type="button";
    button.id="teacherCalendarNextButton";
    button.textContent="➡️ Next — Open Workspace";
    button.setAttribute("aria-label","Next: finish the guided flow and open your workspace");
    button.setAttribute("data-pe-single-navigation","true");
    button.setAttribute("data-pe-navigation-owner","single");
    wrapper.appendChild(button);
    var audio=document.createElement("button");
    audio.type="button";
    audio.className="pe-audio-command";
    audio.setAttribute("data-audio-command-for","teacherCalendarNextButton");
    audio.setAttribute("aria-label","Audio command for final Next");
    audio.textContent="🎙️ Say Next";
    wrapper.appendChild(audio);
    var status=document.createElement("span");
    status.className="pe-audio-command-status";
    status.setAttribute("data-audio-status-for","teacherCalendarNextButton");
    status.setAttribute("role","status");
    status.setAttribute("aria-live","polite");
    status.textContent="Ready";
    wrapper.appendChild(status);
  }
}

function bindGuidedFeatureButtons(){
  bind("dailyActivitiesStartButton",function(){
    var activity=el("dailyLessonActivity");
    if(activity){
      try{ activity.scrollIntoView({behavior:"smooth",block:"start"}); }
      catch(e){ try{ activity.scrollIntoView(); }catch(ignore){} }
    }
    setStatus("Daily Activity is active. Complete the activity, then use Next to continue to Practice.");
  });

  bind("dailyActivitiesContinuePracticeButton",function(){
    guided(10,"dailyLessonPracticeStage");
  });

  bind("practiceContinueAssessmentButton",function(){
    guided(11,"assessments");
  });

  bind("assessmentContinueCoverageButton",function(){
    guided(12,"pacificEducationCoverageDashboard");
  });

  bind("coverageNextButton",function(button){
    if(!button.disabled) guided(13,"teacherCalendarSection");
  });

  bind("teacherCalendarNextButton",function(button){
    if(button.disabled) return;
    var role="";
    try{ role=sessionStorage.getItem("pacificEducationPilotRole")||""; }catch(e){}
    var roleSelect=el("pilotRegistrationRole");
    if(!role && roleSelect) role=roleSelect.value||"";
    if(!role){
      setStatus("Please complete registration and choose your user role before opening the workspace.");
      return;
    }
    document.body.setAttribute("data-pe-guided-complete","true");
    document.body.classList.remove("pe-guided-flow","pacedu-entry-mode","pacedu-registration-mode");
    document.body.removeAttribute("data-pe-flow-step");
    ALL_NEXT_WRAPPERS.forEach(function(id){
      var wrapper=el(id);
      if(wrapper) wrapper.style.setProperty("display","none","important");
    });
    var pages=el("pacificEducationPilotPages");
    if(pages){ pages.hidden=true; pages.style.display="none"; }
    var menu=el("pacificEducationAppMenu");
    if(menu){ menu.hidden=false; menu.style.removeProperty("display"); }
    if(window.PacificEducationSequentialRoleWorkspaces &&
       typeof window.PacificEducationSequentialRoleWorkspaces.build==="function"){
      window.PacificEducationSequentialRoleWorkspaces.build(role);
    }else{
      var workspaces=el("pacificEducationPilotUserWorkspaces");
      if(workspaces){ workspaces.hidden=false; workspaces.style.removeProperty("display"); }
    }
    setStatus("Guided setup complete. Your Pacific Education workspace is ready.");
    if(window.PacificEducationAutoFeatureActivation &&
       typeof window.PacificEducationAutoFeatureActivation.run==="function"){
      window.PacificEducationAutoFeatureActivation.run();
    }
    var shell=el("pacificEducationSequentialRoleWorkspace")||el("pacificEducationPilotUserWorkspaces");
    if(shell){ try{shell.scrollIntoView({behavior:"smooth",block:"start"});}catch(e){} }
  });
}

function syncRules(){
  var agreement=el("paceduRulesAgreement");
  var next=el("paceduRulesContinue");
  if(!agreement || !next) return;
  var sync=function(){ next.disabled=!agreement.checked; };
  if(next.getAttribute("data-pe-rules-sync")!=="true"){
    next.setAttribute("data-pe-rules-sync","true");
    agreement.addEventListener("change",sync,true);
  }
  sync();
}


/* Capture-phase gateway fallback: make the first three entry buttons navigate even
   if another legacy listener consumes the normal bubbling click. This does not touch voice. */
/* Keep Welcome fail-closed from the moment Rules becomes active. Legacy click
 * handlers can briefly restore inline display styles before the single-navigation
 * capture handler runs; this route-level CSS guard prevents those styles painting
 * Welcome during Rules -> Registration. It does not alter the protected voice engine.
 */
function installWelcomeFlashGuard(){
  var id="pacedu-welcome-flash-guard";
  if(el(id)) return;
  var style=document.createElement("style");
  style.id=id;
  style.textContent='body[data-pac-edu-entry-page="3"] #pacificEducationWelcome, body[data-pe-flow-step]:not([data-pe-flow-step="0"]) #pacificEducationWelcome { display:none!important; visibility:hidden!important; }';
  (document.head||document.documentElement).appendChild(style);
}

function bindGatewayCaptureFallback(){
  if(document.documentElement.getAttribute("data-pe-gateway-capture-bound")==="true") return;
  document.documentElement.setAttribute("data-pe-gateway-capture-bound","true");
  document.addEventListener("click",function(event){
    var node=event.target;
    while(node && node!==document && node.nodeType===1 && !node.id) node=node.parentNode;
    if(!node || node===document) return;
    var id=node.id;
    if(id==="welcomeNextButton" && node.tagName==="A" && node.getAttribute("href")) return;
    if(id!=="welcomeNextButton" && id!=="paceduVisionNext" && id!=="paceduRulesContinue") return;
    if(node.disabled) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if(id==="welcomeNextButton"){
      gateway(2);
    }else if(id==="paceduVisionNext"){
      gateway(3);
    }else{
      var agreement=el("paceduRulesAgreement");
      if(agreement && agreement.checked) guided(3,"pacificEducationIdentityRegistration");
    }
  },true);
}

/*
 * Cross-feature activation registry.
 * Navigation owns visibility; feature engines own their own behaviour.
 * This registry reports missing wiring honestly and safely rebinds replaced controls.
 * It never edits the protected #856 voice engine or unlocks payment/production gates.
 */
var FEATURE_REGISTRY = {
  registration: { label:"Registration", ids:["pacificEducationIdentityRegistration","pilotRegistrationRole","pilotRegistrationSaveButton"] },
  learning: { label:"Learning and curriculum", ids:["learningPlatform","levelSelection","subjectSelection","termSelection","capabilitySelection","dailyLesson"] },
  activities: { label:"Daily activities", ids:["dailyLessonActivity","dailyActivitiesStartButton","dailyActivitiesContinuePracticeButton"] },
  practice: { label:"Practice", ids:["dailyLessonPracticeStage","practiceContinueAssessmentButton"] },
  assessment: { label:"Assessments", ids:["assessments","assessmentContinueCoverageButton"] },
  dashboards: { label:"Progress and coverage", ids:["pacificEducationCoverageDashboard","pacificEducationStudentProgressDashboard"] },
  teacher: { label:"Teacher calendar and review", ids:["teacherCalendarSection","teacherCalendarNextButton"] },
  accessibility: { label:"Accessibility", ids:["pacificEducationAccessibilityControls"] },
  mailbox: { label:"Pilot mailbox", ids:["pacificEducationMailbox"] },
  voice: { label:"Protected voice controls", ids:["pacificEducationAIConversation","pacificEducationVoiceStatus"] }
};

function auditFeatures(){
  var report={version:"2.3.0",owner:"single",features:{},missingRequired:[],checkedAt:(new Date()).toISOString()};
  Object.keys(FEATURE_REGISTRY).forEach(function(key){
    var spec=FEATURE_REGISTRY[key], present=[], missing=[];
    spec.ids.forEach(function(id){ (el(id)?present:missing).push(id); });
    report.features[key]={label:spec.label,status:missing.length?"needs-attention":"present",present:present,missing:missing};
    missing.forEach(function(id){ report.missingRequired.push({feature:key,id:id}); });
  });
  document.documentElement.setAttribute("data-pe-feature-audit",report.missingRequired.length?"needs-attention":"present");
  document.documentElement.setAttribute("data-pe-feature-audit-version",report.version);
  var status=el("pacificEducationFeatureActivationStatus");
  if(status){
    var statusMessage=report.missingRequired.length
      ? "Pac edu feature wiring check: "+report.missingRequired.length+" required element(s) need attention. Call PacificEducationSingleNavigation.audit() for details."
      : "Pac edu feature wiring check: all registered elements are present. Behavioural tests are still required.";
    if(status.textContent!==statusMessage) status.textContent=statusMessage;
    status.setAttribute("role","status");
    status.setAttribute("aria-live","polite");
  }
  return report;
}

function observeGuidedPageIsolation(){
  if(!window.MutationObserver || document.documentElement.getAttribute("data-pe-isolation-observer")==="true") return;
  document.documentElement.setAttribute("data-pe-isolation-observer","true");
  var queued=false;
  var observer=new MutationObserver(function(records){
    var changed=records.some(function(record){
      return record.type==="attributes" &&
        (record.attributeName==="hidden" || record.attributeName==="style" || record.attributeName==="aria-hidden");
    });
    if(!changed || queued) return;
    queued=true;
    window.setTimeout(function(){
      queued=false;
      var targetId=document.body.getAttribute("data-pe-active-guided-page");
      var step=document.body.getAttribute("data-pe-flow-step");
      if(!targetId || !step || !document.body.classList.contains("pe-guided-flow")) return;
      /* Reassert the active guided page after legacy visibility changes.
         Idempotent writes avoid observer loops; voice and feature engines are untouched. */
      enforceSingleVisiblePage(targetId,step);
    },0);
  });
  GUIDED_PAGES.concat([GATEWAY.welcome,GATEWAY.vision,GATEWAY.rules]).forEach(function(id){
    var page=el(id);
    if(page) observer.observe(page,{attributes:true,attributeFilter:["hidden","style","aria-hidden"]});
  });
  window.PacificEducationGuidedIsolationObserver=observer;
}

function observeFeatureChanges(){
  if(!window.MutationObserver || document.documentElement.getAttribute("data-pe-activation-observer")==="true") return;
  document.documentElement.setAttribute("data-pe-activation-observer","true");
  var queued=false;
  var observer=new MutationObserver(function(records){
    var relevant=records.some(function(record){
      return record.type==="childList" && (record.addedNodes.length>0 || record.removedNodes.length>0);
    });
    if(!relevant || queued) return;
    queued=true;
    window.setTimeout(function(){
      queued=false;
      /* init() is idempotent and now rebinds replacement DOM nodes by identity. */
      init();
      auditFeatures();
    },60);
  });
  observer.observe(document.documentElement,{childList:true,subtree:true});
  window.PacificEducationFeatureActivationObserver=observer;
}

function init(){
  installWelcomeFlashGuard();
  installGuidedTransitionStyle();
  bindGatewayCaptureFallback();
  if(!document.body.getAttribute("data-pe-single-navigation-started")){
    document.body.setAttribute("data-pe-single-navigation-started","true");
    var entryRoute="";
    var rulesAccepted=false;
    try{
      entryRoute=(new URLSearchParams(window.location.search)).get("entry")||"";
      rulesAccepted=window.sessionStorage.getItem("pacificEducationRulesAccepted")==="yes";
    }catch(e){}
    if(entryRoute==="registration" && rulesAccepted){
      guided(3,"pacificEducationIdentityRegistration");
    }else{
      gateway(1);
    }
  }

  document.body.setAttribute("data-pe-navigation-owner","single");

  bind("welcomeNextButton",function(){ gateway(2); });
  bind("paceduVisionNext",function(){ gateway(3); });
  bind("paceduRulesContinue",function(button){
    if(!button.disabled) guided(3,"pacificEducationIdentityRegistration");
  });

  Object.keys(STEPS).forEach(function(id){
    /* Registration Next belongs exclusively to the mandatory 5-box registration sub-flow.
       It hands control back to SingleNavigation only after a successful save. */
    if(id==="welcomeNextButton" || id==="registrationNextButton") return;
    var row=STEPS[id];
    bind(id,function(button){
      if(!button.disabled) guided(row[0],row[1]);
    });
  });

  ensureCoverageNextButton();
  ensureTeacherCalendarNextButton();
  bindGuidedFeatureButtons();
  syncRules();
  bindAllBackButtons();
  auditFeatures();
  observeGuidedPageIsolation();
  observeFeatureChanges();
  /* Release the first-paint guard only after the single-page route and repair observers are ready. */
  document.documentElement.setAttribute("data-pacedu-navigation-ready","true");
}

if(document.readyState==="loading"){
  document.addEventListener("DOMContentLoaded",init);
}else{
  init();
}

window.setTimeout(init,500);
window.setTimeout(init,1500);
window.setTimeout(ensureCoverageNextButton,2500);
window.setTimeout(ensureTeacherCalendarNextButton,2500);
window.setTimeout(bindGuidedFeatureButtons,2500);
window.setTimeout(bindAllBackButtons,2500);

window.PacificEducationSingleNavigation={
  version:"2.3.0",
  owner:"single",
  go:go,
  gateway:gateway,
  guided:guided,
  refreshFeatureForTarget:refreshFeatureForTarget,
  audit:auditFeatures,
  registerFeature:function(key,spec){
    if(!key || !spec || !Array.isArray(spec.ids)) return false;
    FEATURE_REGISTRY[key]={label:String(spec.label||key),ids:spec.ids.slice()};
    auditFeatures();
    return true;
  },
  status:function(){
    return {
      version:"2.3.0",
      owner:"single",
      featureAudit:auditFeatures(),
      started:!!document.body.getAttribute("data-pe-single-navigation-started"),
      bound:Object.keys(bound).filter(function(id){return bound[id];}),
      backBound:Object.keys(backBound).filter(function(id){return backBound[id];})
    };
  }
};

})(window,document);
