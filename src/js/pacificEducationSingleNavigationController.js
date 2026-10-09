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
  /* Welcome is outside #app/GUIDED_PAGES, so hide it explicitly when a guided page opens. */
  var welcome=el(GATEWAY.welcome);
  if(welcome && targetId!==GATEWAY.welcome){
    welcome.hidden=true;
    welcome.setAttribute("aria-hidden","true");
    try{ welcome.style.display="none"; }catch(e){}
  }
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

  /* Entry pages and guided pages must never remain visible together on Back/Next. */
  GUIDED_PAGES.forEach(function(pageId){
    var page=el(pageId);
    if(!page) return;
    page.hidden=true;
    page.setAttribute("aria-hidden","true");
    try{ page.style.display="none"; }catch(e){}
  });

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
  syncNextWrapper(page===1 ? "pacificEducationWelcome" : page===2 ? "paceduPageVision" : "paceduPageRules");
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
    button.style.margin="12px 0";
    button.style.padding="10px 16px";
    button.style.cursor="pointer";
    target.insertBefore(button,target.firstChild);
  }
  if(backBound[id]===button) return;
  /* Rebind if a repair or feature insertion replaces this page’s Back node. */
  backBound[id]=button;
  button.addEventListener("click",function(event){
    event.preventDefault();
    event.stopPropagation();
    var row=BACK[targetId];
    if(row[1]==="welcome"){ gateway(1); return; }
    if(row[1]==="vision"){ gateway(2); return; }
    if(row[1]==="rules"){ gateway(3); return; }
    var map={
      registration:["pacificEducationIdentityRegistration",1],
      prototype:["prototypeAccess",2],
      level:["levelSelection",3],
      subject:["subjectSelection",4],
      term:["termSelection",5],
      capability:["capabilitySelection",6],
      daily:["dailyLesson",7],
      practice:["dailyLessonPracticeStage",8],
      assessment:["assessments",9],
      coverage:["pacificEducationCoverageDashboard",10]
    };
    if(map[row[1]]) guided(map[row[1]][1],map[row[1]][0]);
  });
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

  bind("teacherCalendarNextButton",function(button){
    if(button.disabled) return;
    var role="";
    try{ role=sessionStorage.getItem("pacificEducationPilotRole")||""; }catch(e){}
    var roleSelect=el("pilotRoleSelector");
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
      if(agreement && agreement.checked) guided(1,"pacificEducationIdentityRegistration");
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
  registration: { label:"Registration", ids:["pacificEducationIdentityRegistration","pilotRoleSelector","pilotRegistrationSaveButton"] },
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
      guided(1,"pacificEducationIdentityRegistration");
    }else{
      gateway(1);
    }
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
  ensureTeacherCalendarNextButton();
  bindGuidedFeatureButtons();
  syncRules();
  bindAllBackButtons();
  auditFeatures();
  observeFeatureChanges();
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
