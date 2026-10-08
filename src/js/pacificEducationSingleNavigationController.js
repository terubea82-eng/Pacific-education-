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
  assessmentNextButton: [10, "teacherCalendarSection"]
};

var GATEWAY = {
  vision: "paceduPageVision",
  rules: "paceduPageRules",
  welcome: "pacificEducationWelcome"
};

var bound = {};

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

function revealTarget(targetId){
  var target=el(targetId);
  if(!target) return false;

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

function bindGuidedFeatureButtons(){
  /*
   * These are continuation controls inside existing feature engines.
   * They are wired only when present and never replace the engine itself.
   */
  bind("dailyActivitiesStartButton",function(){
    guided(7,"dailyLesson");
  });

  bind("dailyActivitiesContinuePracticeButton",function(){
    guided(8,"dailyLessonPracticeStage");
  });

  bind("practiceContinueAssessmentButton",function(){
    guided(9,"assessments");
  });

  /*
   * Coverage remains an existing assessment feature. Its own engine owns the
   * target transition, so do not hijack its button here.
   */
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
  /*
   * A fresh app launch ALWAYS starts at Welcome Page 1. This prevents saved
   * registration/workspace state from appearing or speaking before the user
   * passes through the gateway.
   */
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
    if(id==="welcomeNextButton") return;
    var row=STEPS[id];

    bind(id,function(button){
      if(!button.disabled) guided(row[0],row[1]);
    });
  });

  bindGuidedFeatureButtons();
  syncRules();
}

if(document.readyState==="loading"){
  document.addEventListener("DOMContentLoaded",init);
}else{
  init();
}

window.setTimeout(init,500);
window.setTimeout(init,1500);
window.setTimeout(bindGuidedFeatureButtons,2500);

window.PacificEducationSingleNavigation={
  version:"2.0.0",
  owner:"single",
  go:go,
  gateway:gateway,
  guided:guided,
  refreshFeatureForTarget:refreshFeatureForTarget,
  status:function(){
    return {
      version:"2.0.0",
      owner:"single",
      started:!!document.body.getAttribute("data-pe-single-navigation-started"),
      bound:Object.keys(bound).filter(function(id){return bound[id];})
    };
  }
};

})(window,document);
