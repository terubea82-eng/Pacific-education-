/* PacEdu child-friendly flow and automatic current-date helper.
 * Uses the device's local date; does not overwrite school-calendar dates or form values.
 * Additive only: leaves the protected speech engine and page navigation in charge.
 */
(function(window,document){
 "use strict";
 var PAGES=[
  ["pacificEducationWelcome","Welcome","Welcome! This is Pacific Education. Press Next to learn how to use it."],
  ["paceduPageVision","Our purpose","This page tells you how Pacific Education helps children learn. Listen, then press Next."],
  ["paceduPageRules","Our rules","Be kind, be safe, and do your own work. Ask for help if you do not understand. Press Next."],
  ["pacificEducationIdentityRegistration","Sign up","First choose your country and language. Then choose who you are and fill in only the boxes you are asked to complete. Press Next when the page says you are ready."],
  ["prototypeAccess","Get ready","Read or listen to this page. When you are ready, press Next."],
  ["levelSelection","Choose your class","Choose your class or form. If you are in Class 1, choose Class 1. Then press Next."],
  ["subjectSelection","Choose a subject","Choose the subject you want to learn today. Then press Next."],
  ["termSelection","Choose a term","Choose your school term. If you are not sure, ask your teacher before changing it."],
  ["capabilitySelection","Choose your learning level","Choose the learning level your teacher gave you. You can ask your teacher for help."],
  ["dailyLesson","Today's activity","Read or listen to one question at a time. Choose or write your answer, then follow the Next button."],
  ["dailyLessonPracticeStage","Practice time","Try the practice questions. You can listen again if you need help."],
  ["assessments","Show what you know","Take your time. Read or listen to each question. Check your answers before you submit."],
  ["teacherDashboard","Teacher workspace","Teacher: choose your class and subject, check today's activities, and review learner work."],
  ["parentDashboard","Family workspace","Look at the learner's progress and the activities they can practise together."],
  ["studentProgressDashboard","Your progress","See what you have finished and what you can practise next."]
 ];
 var dateNode=null, helpNode=null, lastPage="";
 function localDate(){
  var d=new Date();
  try{return new Intl.DateTimeFormat(undefined,{weekday:"long",year:"numeric",month:"long",day:"numeric"}).format(d);}
  catch(e){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
 }
 function ensureDate(){
  if(!dateNode){
   dateNode=document.getElementById("paceduAutomaticToday");
   if(!dateNode){
    dateNode=document.createElement("p");dateNode.id="paceduAutomaticToday";
    dateNode.setAttribute("role","status");
    dateNode.style.cssText="margin:8px 0;padding:8px 12px;max-width:960px;border-radius:8px;background:#eef5ff;color:#183153;font-size:1rem;font-weight:600;";
   }
  }
  dateNode.textContent="Today: "+localDate();
  dateNode.title="Date comes from this device. School calendar dates are set separately by your teacher.";
 }
 function visible(el){
  if(!el)return false;
  for(var n=el;n&&n.nodeType===1;n=n.parentElement){
   if(n.hidden||n.getAttribute("aria-hidden")==="true")return false;
   var s=window.getComputedStyle?window.getComputedStyle(n):null;
   if(s&&(s.display==="none"||s.visibility==="hidden"||s.visibility==="collapse"))return false;
  }
  return true;
 }
 function speak(text){
  if(window.PacificEducationSpeech&&typeof window.PacificEducationSpeech.speakText==="function"){
   window.PacificEducationSpeech.speakText(text,{allowRepeat:true});return true;
  }
  if(typeof window.speakText==="function"){window.speakText(text);return true;}
  return false;
 }
 function ensureHelp(){
  if(!helpNode){
   helpNode=document.getElementById("paceduSimplePageHelp");
   if(!helpNode){
    helpNode=document.createElement("section");helpNode.id="paceduSimplePageHelp";
    helpNode.style.cssText="margin:8px auto;padding:12px;max-width:960px;border:1px solid #b8cbe3;border-radius:10px;background:#fff;";
    helpNode.style.order="0";
   }
  }
  var active=null;
  for(var i=0;i<PAGES.length;i++){
   var el=document.getElementById(PAGES[i][0]);
   if(visible(el)){active={el:el,page:PAGES[i]};break;}
  }
  if(!active){if(helpNode)helpNode.hidden=true;lastPage="";return;}
  helpNode.hidden=false;
  /* Keep the date and help inside the currently visible page, not in a shell
     that guided-flow isolation may hide. */
  active.el.insertBefore(helpNode,active.el.firstChild);
  if(dateNode&&dateNode.parentNode!==active.el)active.el.insertBefore(dateNode,helpNode);
  if(lastPage===active.page[0])return;
  lastPage=active.page[0];
  helpNode.replaceChildren();
  var title=document.createElement("strong");title.textContent="What to do: "+active.page[1];
  var p=document.createElement("p");p.textContent=active.page[2];p.style.margin="6px 0";
  var button=document.createElement("button");button.type="button";button.textContent="🔊 Hear these instructions";
  button.setAttribute("aria-label","Hear simple instructions for "+active.page[1]);
  button.style.cssText="min-height:44px;padding:10px 14px;";
  button.addEventListener("click",function(){speak(active.page[2]);});
  helpNode.appendChild(title);helpNode.appendChild(p);helpNode.appendChild(button);
 }
 function init(){
  ensureDate();ensureHelp();
  if(window.MutationObserver&&document.body){
   var observer=new MutationObserver(function(){ensureDate();ensureHelp();});
   observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:["hidden","aria-hidden","style","class","data-pe-flow-step"]});
  }
  window.setInterval(ensureDate,60000);
  window.addEventListener("pageshow",ensureDate);
  document.addEventListener("visibilitychange",function(){if(document.visibilityState==="visible")ensureDate();});
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})(window,document);
