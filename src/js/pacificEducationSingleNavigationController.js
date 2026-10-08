(function(window,document){
"use strict";
/* Pacific Education — SINGLE navigation authority.
 * Owns page-to-page Next wiring. Protected #856 voice remains separate.
 * Registration prerequisites remain owned by MandatoryBoxSequence.
 */
var STEPS={
  "prototypeNextButton":[3,"levelSelection"],
  "levelNextButton":[4,"subjectSelection"],
  "subjectNextButton":[5,"termSelection"],
  "capabilityNextButton":[7,"dailyLesson"],
  "dailyNextButton":[8,"dailyLessonPracticeStage"],
  "practiceNextButton":[9,"assessments"],
  "assessmentNextButton":[10,"teacherCalendarSection"]
};
var bound={};
function el(id){return document.getElementById(id);}
function guided(step,targetId){
  document.body.classList.remove("pacedu-entry-mode","pacedu-registration-mode");
  document.body.classList.add("pe-guided-flow","pe-pilot-all-features");
  document.body.setAttribute("data-pe-flow-step",String(step));
  document.body.setAttribute("data-pe-navigation-owner","single");
  var target=el(targetId);
  if(target){
    target.hidden=false;
    target.style.display="";
    try{target.scrollIntoView({behavior:"smooth",block:"start"});}catch(e){target.scrollIntoView();}
  }
}
function gateway(page){
  document.body.classList.remove("pe-guided-flow","pacedu-registration-mode");
  document.body.classList.add("pacedu-entry-mode");
  document.body.setAttribute("data-pac-edu-entry-page",String(page));
  document.body.setAttribute("data-pe-navigation-owner","single");
  var pilot=el("pacificEducationPilotPages"), welcome=el("pacificEducationWelcome");
  if(pilot){pilot.hidden=false;pilot.style.display="";}
  if(welcome){welcome.hidden=page!==1;welcome.style.display=page===1?"":"none";}
  var vision=el("paceduPageVision"), rules=el("paceduPageRules");
  if(vision){vision.hidden=page!==2;vision.style.display=page===2?"block":"none";}
  if(rules){rules.hidden=page!==3;rules.style.display=page===3?"block":"none";}
}
function go(step,targetId){guided(step,targetId);}
function bind(id,fn){
  var b=el(id);
  if(!b||bound[id])return;
  bound[id]=true;
  b.setAttribute("data-pe-single-navigation","true");
  b.addEventListener("click",function(e){
    e.preventDefault();
    e.stopPropagation();
    fn(b);
  },false);
}
function init(){
  document.body.setAttribute("data-pe-navigation-owner","single");
  bind("welcomeNextButton",function(){gateway(2);});
  bind("paceduVisionNext",function(){gateway(3);});
  bind("paceduRulesContinue",function(b){if(!b.disabled)guided(1,"pacificEducationIdentityRegistration");});
  Object.keys(STEPS).forEach(function(id){
    var row=STEPS[id];
    bind(id,function(b){if(!b.disabled)guided(row[0],row[1]);});
  });
  var agreement=el("paceduRulesAgreement"), next=el("paceduRulesContinue");
  if(agreement&&next){
    var sync=function(){next.disabled=!agreement.checked;};
    agreement.addEventListener("change",sync,true);
    sync();
  }
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
window.setTimeout(init,500);
window.setTimeout(init,1500);
window.PacificEducationSingleNavigation={version:"1.0.0",owner:"single",go:go};
})(window,document);
