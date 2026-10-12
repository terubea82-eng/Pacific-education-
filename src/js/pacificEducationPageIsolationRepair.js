/* Pacedu page-isolation repair — prevent stale pages and floating overlays.
 * Navigation/registration remain with their existing controllers; protected #856 voice is untouched.
 */
(function(window,document){
"use strict";
var IDS=["pacificEducationWelcome","paceduPageVision","paceduPageRules","pacificEducationIdentityRegistration","prototypeAccess","levelSelection","subjectSelection","termSelection","capabilitySelection","dailyLesson","dailyLessonPracticeStage","assessments","teacherCalendarSection","pacificEducationCoverageDashboard"];
function get(id){return document.getElementById(id);}
function hide(id){var n=get(id);if(!n)return;n.hidden=true;n.setAttribute("aria-hidden","true");try{n.style.setProperty("display","none","important");}catch(_){}}
function show(id){var n=get(id);if(!n)return false;n.hidden=false;n.removeAttribute("aria-hidden");try{n.style.setProperty("display","block","important");}catch(_){}return true;}
function isolate(id,step){
 if(!get(id))return;
 var b=document.body;b.classList.add("pe-guided-flow","pe-pilot-all-features");b.classList.remove("pacedu-entry-mode");
 b.setAttribute("data-pe-flow-step",String(step));b.setAttribute("data-pe-active-guided-page",id);b.setAttribute("data-pe-navigation-owner","single");
 IDS.forEach(function(other){if(other!==id)hide(other);});show(id);
 var overlay=get("pacificEducationStepGuide");if(overlay){overlay.style.setProperty("display","none","important");overlay.setAttribute("aria-hidden","true");}
}
function current(){var b=document.body;if(!b||!b.classList.contains("pe-guided-flow"))return;var id=b.getAttribute("data-pe-active-guided-page"),step=b.getAttribute("data-pe-flow-step");if(id&&step!==null)isolate(id,step);}
function bind(){
 var button=get("registrationNextButton");
 if(button&&button.getAttribute("data-pe-page-isolation-repair")!=="true"){
  button.setAttribute("data-pe-page-isolation-repair","true");
  button.addEventListener("click",function(event){
   /* Keep this click inside the registration box sequence; do not let stale
      bubbling handlers reinterpret it as a Welcome/entry-page navigation. */
   event.stopPropagation();
   window.setTimeout(function(){var b=document.body,id=b.getAttribute("data-pe-active-guided-page"),step=b.getAttribute("data-pe-flow-step");if(id==="prototypeAccess"||step==="4")isolate("prototypeAccess",4);else if(id==="pacificEducationIdentityRegistration"||step==="3")isolate("pacificEducationIdentityRegistration",3);},0);
   window.setTimeout(current,180);window.setTimeout(current,650);
  },true);
 }
}
function init(){bind();current();}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
window.addEventListener("pageshow",init);window.setTimeout(init,250);window.setTimeout(init,900);
})(window,document);
