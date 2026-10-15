/* Pacedu page-isolation repair — prevent stale pages and floating overlays.
 * Navigation/registration remain with their existing controllers; protected #856 voice is untouched.
 */
(function(window,document){
"use strict";
var IDS=["pacificEducationWelcome","paceduPageVision","paceduPageRules","pacificEducationIdentityRegistration","prototypeAccess","levelSelection","subjectSelection","termSelection","capabilitySelection","dailyLesson","dailyLessonPracticeStage","assessments","teacherCalendarSection","pacificEducationCoverageDashboard"];
function get(id){return document.getElementById(id);}
function hide(id){var n=get(id);if(!n)return;n.hidden=true;n.setAttribute("aria-hidden","true");try{n.style.setProperty("display","none","important");}catch(_){}}
function show(id){var n=get(id);if(!n)return false;var body=document.body;var root=document.documentElement;if(id==="pacificEducationWelcome"&&body&&body.getAttribute("data-pe-navigation-owner")==="single"&&body.getAttribute("data-pac-edu-entry-page")!=="1"&&body.getAttribute("data-pe-active-guided-page")!=="pacificEducationWelcome"&&body.getAttribute("data-pe-flow-step")!=="0"&&root&&root.getAttribute("data-pacedu-entry-advanced")==="true")return false;if(n.hidden)n.hidden=false;if(n.hasAttribute("aria-hidden"))n.removeAttribute("aria-hidden");try{if(n.style.getPropertyValue("display")!=="block"||n.style.getPropertyPriority("display")!=="important")n.style.setProperty("display","block","important");}catch(_){}return true;}
function restoreAncestors(target){var ancestor=target&&target.parentElement;while(ancestor&&ancestor!==document.body){if(ancestor.id&&IDS.indexOf(ancestor.id)!==-1)show(ancestor.id);ancestor=ancestor.parentElement;}}
function isolate(id,step){
 var target=get(id);if(!target)return;
 var b=document.body;b.classList.add("pe-guided-flow","pe-pilot-all-features");b.classList.remove("pacedu-entry-mode");
 if(b.getAttribute("data-pe-flow-step")!==String(step))b.setAttribute("data-pe-flow-step",String(step));
 if(b.getAttribute("data-pe-active-guided-page")!==id)b.setAttribute("data-pe-active-guided-page",id);
 if(b.getAttribute("data-pe-navigation-owner")!=="single")b.setAttribute("data-pe-navigation-owner","single");
 /* First hide the known guided panels, then explicitly restore the complete
    ancestor chain of the active panel. This prevents nested workspaces from
    being hidden by a later sibling pass or legacy CSS. */
 IDS.forEach(function(other){if(other!==id)hide(other);});
 restoreAncestors(target);
 show(id);
 var overlay=get("pacificEducationStepGuide");if(overlay){overlay.style.setProperty("display","none","important");overlay.setAttribute("aria-hidden","true");}
 setRegistrationShellHidden(id==="pacificEducationIdentityRegistration"||step==="3");
}
/* Issue 1 repair: Page 4 must not inherit the global shell above its form.
   Save each element's original visibility once and restore it when leaving registration. */
var registrationShellState=[];
var registrationShellSelectors=[
 "#pacificEducationMailbox",
 "#pacificEducationAppMenu",
 "#pacificEducationAccessibilityControls",
 "#pilotBanner",
 "#pacificEducationRefreshNotice",
 "header",
 "#pacificEducationTechnicianActivation",
 "#pacificEducationTechnicianWorkspace",
 "#systemStatus",
 "#publicationStatus",
 "#pacificEducationOfflineSyncStatus",
 "#pacificEducationWorkspaceLiveStatus"
];
function setRegistrationShellHidden(shouldHide){
 var nodes=[];
 registrationShellSelectors.forEach(function(selector){
  try{document.querySelectorAll(selector).forEach(function(node){if(nodes.indexOf(node)===-1)nodes.push(node);});}catch(_){}
 });
 if(shouldHide){
  nodes.forEach(function(node){
   if(registrationShellState.some(function(entry){return entry.node===node;}))return;
   registrationShellState.push({node:node,hidden:node.hidden,hadAria:node.hasAttribute("aria-hidden"),aria:node.getAttribute("aria-hidden"),display:node.style.getPropertyValue("display"),priority:node.style.getPropertyPriority("display")});
   node.hidden=true;node.setAttribute("aria-hidden","true");
   try{node.style.setProperty("display","none","important");}catch(_){}
  });
  return;
 }
 registrationShellState.forEach(function(entry){
  var node=entry.node;if(!node||!node.isConnected)return;
  node.hidden=entry.hidden;
  if(entry.hadAria)node.setAttribute("aria-hidden",entry.aria);else node.removeAttribute("aria-hidden");
  try{if(entry.display)node.style.setProperty("display",entry.display,entry.priority);else node.style.removeProperty("display");}catch(_){}
 });
 registrationShellState=[];
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
var navigationObserver=null, panelObserver=null;
function observeNavigation(){
 var body=document.body;if(!body||navigationObserver)return;
 navigationObserver=new MutationObserver(function(records){
  if(records.some(function(record){return record.attributeName==="data-pe-active-guided-page"||record.attributeName==="data-pe-flow-step";}))current();
 });
 navigationObserver.observe(body,{attributes:true,attributeFilter:["data-pe-active-guided-page","data-pe-flow-step"]});
 panelObserver=new MutationObserver(function(records){
  if(!records.some(function(record){return record.attributeName==="hidden"||record.attributeName==="aria-hidden"||record.attributeName==="style";}))return;
  var id=body.getAttribute("data-pe-active-guided-page");if(!id)return;
  var target=get(id);if(target)restoreAncestors(target);
 });
 panelObserver.observe(body,{subtree:true,attributes:true,attributeFilter:["hidden","aria-hidden","style"]});
}
function init(){bind();observeNavigation();current();}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
window.addEventListener("pageshow",init);window.setTimeout(init,250);window.setTimeout(init,900);
})(window,document);
