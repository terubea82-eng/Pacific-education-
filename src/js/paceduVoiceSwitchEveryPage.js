(function(window,document){
  "use strict";
  var KEY="paceduVoiceEnabled";
  var workspaces=[
    ["pacificEducationAppTools","Learning Tools","Welcome to Learning Tools. Choose the learning tool you want to use."],
    ["pacificEducationSchoolIdentitySection","School Identity","Welcome to School Identity. Review the school and existing class information."],
    ["teacherDashboard","Teacher Workspace","Welcome to the Teacher Workspace. Review classes, learners, activities, the teacher calendar, assessments and learning coverage."],
    ["parentDashboard","Parent and Caregiver Workspace","Welcome to the Parent and Caregiver Workspace. Review the learner's progress, activities and available family support information."],
    ["specialEducationDashboard","Special Education","Welcome to the Special Education workspace. Review authorised learning support information and evidence routing."],
    ["studentProgressDashboard","Student Progress","Welcome to Student Progress. Review completed learning, practice, assessment evidence and areas that may need more practice."],
    ["pacificEducationStudentProgressDashboard","Student Progress Dashboard","Welcome to the Student Progress Dashboard. Review your learning progress and coverage."],
    ["pacificGuardianCommentSection","Guardian Review","Welcome to Pacific Guardian Review. Review administrative support information and recorded comments."],
    ["pacificEducationExternalReviewerPortal","External Reviewer","Welcome to the External Reviewer Portal. Review curriculum evidence, activities, assessments and comments carefully."],
    ["pacificEducationHomeSubmission","Home Evidence","Welcome to Home Evidence. Provide authorised learning evidence for teacher review and approval."],
    ["pacificEducationWeekendHolidaySupplementaryActivities","Supplementary Activities","Welcome to Supplementary Activities. Review the available weekend and holiday learning activities."],
    ["pacificEducationExamCalendarSection","Exam Calendar","Welcome to the Exam Calendar. Review scheduled examination information."],
    ["pacificEducationAppStudentSchoolCalendar","Student School Calendar","Welcome to the Student School Calendar. Review dates provided by the teacher or school."],
    ["assessments","Assessments","Welcome to Assessments. Follow the spoken instructions carefully."],
    ["dailyLesson","Daily Activities","Welcome to Daily Activities. Complete the assigned activity for the current learning day."],
    ["dailyLessonPracticeStage","Practice","Welcome to Practice. Complete the practice task and use Listen whenever you need the question read aloud."]
  ];
  function enabled(){
    try { return window.localStorage.getItem(KEY)!=="false"; } catch(e){ return true; }
  }
  function rawSpeak(text){
    if(!enabled()) return false;
    try {
      if(window.PacificEducationSpeech && typeof window.PacificEducationSpeech.speakText==="function") return window.PacificEducationSpeech.speakText(text,{allowRepeat:true});
      if(typeof window.speakText==="function") return window.speakText(text);
    } catch(e) { console.warn("PacEdu voice switch:",e); }
    return false;
  }
  function stop(){
    try {
      if(window.PacificEducationSpeech && typeof window.PacificEducationSpeech.stopSpeech==="function") window.PacificEducationSpeech.stopSpeech();
      else if(window.speechSynthesis) window.speechSynthesis.cancel();
    } catch(e){}
  }
  function installSwitch(){
    if(document.getElementById("paceduVoiceSwitch")) return;
    var button=document.createElement("button");
    button.id="paceduVoiceSwitch";
    button.type="button";
    button.setAttribute("aria-pressed",enabled()?"true":"false");
    button.style.cssText="position:fixed;right:12px;bottom:12px;z-index:2147483000;min-height:44px;padding:10px 14px;border:2px solid currentColor;border-radius:8px;background:#fff;color:#111;font:inherit;font-weight:600;box-shadow:0 2px 8px rgba(0,0,0,.2)";
    function paint(){
      button.textContent=enabled()?"🔊 Voice On — Mute":"🔇 Voice Muted — Turn On";
      button.setAttribute("aria-label",enabled()?"Mute spoken instructions on every page":"Turn spoken instructions on for every page");
      button.setAttribute("aria-pressed",enabled()?"true":"false");
      button.title=enabled()?"Mute spoken instructions":"Enable spoken instructions";
    }
    button.addEventListener("click",function(){
      var next=!enabled();
      try { window.localStorage.setItem(KEY,next?"true":"false"); } catch(e){}
      if(!next) stop();
      paint();
      if(next) rawSpeak("Voice instructions are on.");
    });
    paint();
    document.body.appendChild(button);
  }
  function visible(el){
    if(!el)return false;
    for(var n=el;n&&n.nodeType===1;n=n.parentElement){
      if(n.hidden||n.getAttribute("aria-hidden")==="true")return false;
      var style=window.getComputedStyle?window.getComputedStyle(n):null;
      if(style&&(style.display==="none"||style.visibility==="hidden"||style.visibility==="collapse"))return false;
    }
    return true;
  }
  function activeGuidedPage(){
    var body=document.body;
    return !!(body && body.classList.contains("pe-guided-flow") && body.getAttribute("data-pe-active-guided-page"));
  }
  function announceVisibleWorkspace(){
    if(activeGuidedPage()) return;
    for(var i=0;i<workspaces.length;i++){
      var item=workspaces[i],el=document.getElementById(item[0]);
      if(el&&visible(el)){
        var key=item[0];
        if(key!==announceVisibleWorkspace.lastKey){
          announceVisibleWorkspace.lastKey=key;
          rawSpeak(item[2]);
        }
        return;
      }
    }
    announceVisibleWorkspace.lastKey="";
  }
  function init(){
    installSwitch();
    /* Wrap the shared speech entry points so the user's mute preference applies globally. */
    var speech=window.PacificEducationSpeech;
    if(speech&&typeof speech.speakText==="function"&&!speech.speakText.__paceduVoiceSwitch){
      var original=speech.speakText;
      var wrapped=function(text,options){ if(!enabled()) return false; return original.call(speech,text,options); };
      wrapped.__paceduVoiceSwitch=true;
      speech.speakText=wrapped;
    }
    if(typeof window.speakText==="function"&&!window.speakText.__paceduVoiceSwitch){
      var originalGlobal=window.speakText;
      var wrappedGlobal=function(text,options){ if(!enabled()) return false; return originalGlobal.call(window,text,options); };
      wrappedGlobal.__paceduVoiceSwitch=true;
      window.speakText=wrappedGlobal;
    }
    announceVisibleWorkspace();
    if(window.MutationObserver&&document.body){
      var observer=new MutationObserver(function(){ installSwitch(); window.clearTimeout(observer._timer); observer._timer=window.setTimeout(announceVisibleWorkspace,100); });
      observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:["hidden","style","aria-hidden","class","data-pe-active-guided-page"]});
    }
    window.PacEduVoiceSwitch={isEnabled:enabled,stop:stop,announceVisibleWorkspace:announceVisibleWorkspace};
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init,{once:true}); else init();
})(window,document);
