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
  welcomeNextButton:    [1, "paceduGatewayVision"],
  prototypeNextButton:  [3, "levelSelection"],
  levelNextButton:      [4, "subjectSelection"],
  subjectNextButton:    [5, "termSelection"],
  termNextButton:       [6, "capabilitySelection"],
  capabilityNextButton: [7, "dailyLesson"],
  dailyNextButton:      [8, "dailyLessonPracticeStage"],
  practiceNextButton:   [9, "assessments"],
  assessmentNextButton: [10, "pacificEducationCoverageDashboard"],
  coverageNextButton:   [11, "teacherCalendarSection"]
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

function refreshFeatureForTarget(targetId){
  if(targetId==="levelSelection") safeCall("PacificEducationLevelSelector","initialise");
  if(targetId==="subjectSelection") safeCall("PacificEducationSubjectSelector","initialise");
  if(targetId==="termSelection") safeCall("PacificEducationTermSelector","initialise");
  if(targetId==="capabilitySelection") safeCall("PacificEducationCapabilitySelector","initialise");

  if(targetId==="dailyLesson"){
    safeCall("PacificEducationCurriculumLessonRenderer","initialise");
    safeCall("PacificEducationCurriculumLessonRenderer","refresh");
    safeCall("PacificEducationStudentProgressDashboardUI","render",["pacificEducationStudentProgressDashboard"]);
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
  GUIDED_PAGES.forEach(function(pageId){
    var page=el(pageId);
    if(!page) return;
    if(pageId===targetId){
      page.hidden=false;
      page.removeAttribute("aria-hidden");
      try{ page.style.removeProperty("display"); }catch(e){}
      return;
    }
    page.hidden=true;
    page.setAttribute("aria-hidden","true");
    try{ page.style.display="none"; }catch(e){}
  });
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

function revealTarget(targetId){
  var target=el(targetId);
  if(!target) return false;

  hideOtherGuidedPages(targetId);
  updateUserBoxDirection(targetId);

  target.hidden=false;
  target.removeAttribute("aria-hidden");
  try{ target.style.removeProperty("display"); }catch(e){}

  var parent=target.parentElement;
  while(parent && parent.id!=="app"){
    parent.hidden=false;
    parent=parent.parentElement;
  }

  try{ target.scrollIntoView({behavior:"smooth",block:"start"}); }
  catch(e){ try{ target.scrollIntoView(); }catch(ignore){} }

  refreshFeatureForTarget(targetId);
  return true;
}

function guided(step,targetId){
  document.body.classList.remove("pacedu-entry-mode","pacedu-registration-mode");
  document.body.classList.add("pe-guided-flow","pe-pilot-all-features");
  document.body.setAttribute("data-pe-flow-step",String(step));
  document.body.setAttribute("data-pe-navigation-owner","single");

  var ok=revealTarget(targetId);
  if(ok) setStatus("Pacific Education page "+String(step+1)+" is active. Use the green Next button to continue.");
  return ok;
}

function gateway(page){
  document.body.classList.remove("pe-guided-flow","pacedu-registration-mode");
  document.body.classList.add("pacedu-entry-mode");
  document.body.setAttribute("data-pac-edu-entry-page",String(page));
  document.body.setAttribute("data-pe-navigation-owner","single");

  var pilot=el("pacificEducationPilotPages");
  var welcome=el(GATEWAY.welcome);
  var vision=el(GATEWAY.vision);
  var rules=el(GATEWAY.rules);

  if(pilot){ pilot.hidden=false; pilot.style.display=""; }

  if(welcome){
    welcome.hidden=page!==1;
    welcome.style.display=page===1?"":"none";
  }
  if(vision){
    vision.hidden=page!==2;
    vision.style.display=page===2?"block":"none";
  }
  if(rules){
    rules.hidden=page!==3;
    rules.style.display=page===3?"block":"none";
  }

  if(page===1){
    setStatus("Welcome page active. AI Playback and welcome voice are protected.");
  }else if(page===2){
    setStatus("Pacific Education vision page active. Press Next for Rules & Conditions.");
  }else{
    setStatus("Rules & Conditions active. Agree to continue to Registration.");
  }
  return true;
}

function go(step,targetId){
  return guided(step,targetId);
}

function bind(id,fn){
  var button=el(id);
  if(!button || bound[id]) return;
  bound[id]=true;

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
    button.style.margin="12px 0";
    button.style.padding="10px 16px";
    button.style.cursor="pointer";
    target.insertBefore(button,target.firstChild);
  }
  if(backBound[id]) return;
  backBound[id]=true;
  button.addEventListener("click",function(event){
    event.preventDefault();
    event.stopPropagation();
    var row=BACK[targetId];
    if(row[1]==="welcome"){ gateway(1); return; }
    if(row[1]==="vision"){ gateway(2); return; }
    if(row[1]==="rules"){ gateway(3); return; }
    var map={
      registration:"pacificEducationIdentityRegistration",
      prototype:"prototypeAccess",
      level:"levelSelection",
      subject:"subjectSelection",
      term:"termSelection",
      capability:"capabilitySelection",
      daily:"dailyLesson",
      practice:"dailyLessonPracticeStage",
      assessment:"assessments"
    };
    if(map[row[1]]) guided(row[0],map[row[1]]);
  });
}

function bindAllBackButtons(){
  Object.keys(BACK).forEach(ensureBackButton);
}

function ensureCoverageNextButton(){
  var target=el("pacificEducationCoverageDashboard");
  if(!target || el("coverageNextButton")) return;
  var button=document.createElement("button");
  button.type="button";
  button.id="coverageNextButton";
  button.className="pacific-flow-next";
  button.textContent="➡️ Next";
  button.setAttribute("aria-label","Next: Teacher Calendar and Review");
  button.setAttribute("data-pe-single-navigation","true");
  button.setAttribute("data-pe-navigation-owner","single");
  target.appendChild(button);
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
    guided(8,"dailyLessonPracticeStage");
  });

  bind("practiceContinueAssessmentButton",function(){
    guided(9,"assessments");
  });

  bind("assessmentContinueCoverageButton",function(){
    guided(10,"pacificEducationCoverageDashboard");
  });

  bind("coverageNextButton",function(button){
    if(!button.disabled) guided(11,"teacherCalendarSection");
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

function init(){
  if(!document.body.getAttribute("data-pe-single-navigation-started")){
    document.body.setAttribute("data-pe-single-navigation-started","true");
    gateway(1);
  }

  document.body.setAttribute("data-pe-navigation-owner","single");

  bind("welcomeNextButton",function(){ gateway(2); });
  bind("paceduVisionNext",function(){ gateway(3); });
  bind("paceduRulesContinue",function(button){
    if(!button.disabled) guided(1,"pacificEducationIdentityRegistration");
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
  bindGuidedFeatureButtons();
  syncRules();
  bindAllBackButtons();
}

if(document.readyState==="loading"){
  document.addEventListener("DOMContentLoaded",init);
}else{
  init();
}

window.setTimeout(init,500);
window.setTimeout(init,1500);
window.setTimeout(ensureCoverageNextButton,2500);
window.setTimeout(bindGuidedFeatureButtons,2500);
window.setTimeout(bindAllBackButtons,2500);

window.PacificEducationSingleNavigation={
  version:"2.2.0",
  owner:"single",
  go:go,
  gateway:gateway,
  guided:guided,
  refreshFeatureForTarget:refreshFeatureForTarget,
  status:function(){
    return {
      version:"2.2.0",
      owner:"single",
      started:!!document.body.getAttribute("data-pe-single-navigation-started"),
      bound:Object.keys(bound).filter(function(id){return bound[id];}),
      backBound:Object.keys(backBound).filter(function(id){return backBound[id];})
    };
  }
};

})(window,document);
