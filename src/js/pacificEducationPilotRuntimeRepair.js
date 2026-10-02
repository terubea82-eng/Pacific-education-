/* Pacific Education — Pilot Runtime Repair v1.0.0
 * Repairs the pilot UI when the curriculum renderer cannot produce a plan.
 * Does not create classes, grant production access, or replace protected
 * assessment/progression authorities.
 */
(function(window, document){
  "use strict";

  var VERSION="1.0.0";

  function day(){
    var n=1;
    try{
      var d=window.PacificEducationDailyLessons;
      if(d&&typeof d.getCurrentCoreDay==="function") n=Number(d.getCurrentCoreDay())||1;
      else n=Number(window.localStorage.getItem("currentDayNumber"))||1;
    }catch(e){}
    return Math.max(1,Math.min(365,Math.floor(n)));
  }

  function lessonForDay(n){
    try{
      var d=window.PacificEducationDailyLessons;
      if(d&&typeof d.getDailyLesson==="function") return d.getDailyLesson(n);
      if(typeof window.getDailyLesson==="function") return window.getDailyLesson(n);
    }catch(e){}
    return null;
  }

  function text(id,value){
    var el=document.getElementById(id);
    if(el) el.textContent=value==null?"":String(value);
  }

  function renderFallback(){
    var host=document.getElementById("dailyLesson");
    if(!host) return false;
    var activity=document.getElementById("dailyLessonActivity");
    var practice=document.getElementById("dailyLessonPractice");
    var title=document.getElementById("dailyLessonTitle");
    var current=String(activity&&activity.textContent||"").trim();
    var n=day();
    var lesson=lessonForDay(n);
    if(!lesson) return false;

    var a=lesson.activity;
    if(typeof a==="object") a=a.questionText||a.text||a.description||"Complete today's learning activity.";
    var p=lesson.practice;
    if(typeof p==="object") p=p.text||p.description||"Practise today's learning.";

    if(title && (!title.textContent.trim() || title.textContent.indexOf("Daily Lesson")>=0)) title.textContent=lesson.title||("Daily Lesson — Day "+n);
    if(activity && (!current || /loading today's learning activity/i.test(current))) activity.textContent=String(a||"Complete today's learning activity.");
    if(practice && (!practice.textContent.trim() || /loading/i.test(practice.textContent))) practice.textContent=String(p||"Practise today's learning.");

    host.setAttribute("data-pacific-runtime-repair",VERSION);
    var status=document.getElementById("pacificEducationCurriculumLessonStatus");
    if(status && /loading/i.test(status.textContent||"")) status.textContent="Daily activity ready for Day "+n+".";
    return true;
  }

  function repairAssessmentButtons(){
    var alphabet=document.querySelector("button[onclick*='startAlphabetAssessment']");
    var phonics=document.querySelector("button[onclick*='startPhonicsAssessment']");
    if(alphabet){ alphabet.disabled=false; alphabet.setAttribute("aria-disabled","false"); }
    if(phonics){ phonics.disabled=false; phonics.setAttribute("aria-disabled","false"); }
    return !!(alphabet||phonics);
  }

  function run(){
    try{
      if(document.getElementById("dailyLesson")) renderFallback();
      repairAssessmentButtons();
    }catch(e){ try{console.warn("Pacific Education pilot runtime repair recovered from error",e);}catch(_){} }
  }

  window.PacificEducationPilotRuntimeRepair={version:VERSION,run:run,renderFallback:renderFallback};
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",function(){setTimeout(run,0);});
  else setTimeout(run,0);
})(window,document);
