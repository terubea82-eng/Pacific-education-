/* PacEdu additive every-page voice repair.
 * The protected #856 speech and mandatory-navigation files remain unchanged.
 * Corrects exported guided-page labels and gives every workspace a local
 * Hear Instructions control, including workspaces revealed after navigation.
 */
(function(window, document){
  "use strict";
  var guided = [
    [0,"pacificEducationWelcome","Welcome to Pacific Education. We are pleased to welcome you. Pacific Education helps learners learn, discover, practise and grow. Press Next to continue."],
    [1,"paceduPageVision","Welcome to the Pacific Education vision, mission and purpose. This page explains why Pacific Education supports accessible learning, teachers, learners and families. Listen carefully, then select Next to continue."],
    [2,"paceduPageRules","Welcome to the Pacific Education rules. Please review the safety, respectful-use and learning rules. Follow the instructions on this page, then select Next to continue."],
    [3,"pacificEducationIdentityRegistration","Welcome to Registration. Complete each required box carefully, review your information, and select Next when you are ready."],
    [4,"prototypeAccess","Welcome to Pacific Education pilot access. Please review the pilot information and instructions. Select Next when you are ready."],
    [5,"levelSelection","Welcome to Learning Level. Choose the class or form that matches the learner's current programme, then select Next."],
    [6,"subjectSelection","Welcome to Subject Selection. Choose the subject you want to study, then select Next."],
    [7,"termSelection","Welcome to Term Selection. Choose the school term for your learning activities, then select Next."],
    [8,"capabilitySelection","Welcome to Learning Capability. Choose the learning pathway or capability you are working on, then select Next."],
    [9,"dailyLesson","Welcome to Daily Activities. Complete today's activity. Listen to the question and instructions whenever you need help."],
    [10,"dailyLessonPracticeStage","Welcome to Practice. Complete the practice task carefully. Use Hear Instructions whenever you need the question or choices read aloud."],
    [11,"assessments","Welcome to Assessments. Follow the spoken instructions, review each question and choice carefully, then submit when ready."],
    [12,"teacherCalendarSection","Welcome to Teacher Calendar and Review. Review school dates, teaching days, holidays, revision and examinations carefully."]
  ];
  var workspaces = [
    ["pacificEducationAppTools","Learning Tools","Welcome to Learning Tools. Choose the learning tool you want to use."],
    ["pacificEducationSchoolIdentitySection","School Identity","Welcome to School Identity. Review the school and existing class information."],
    ["teacherDashboard","Teacher Workspace","Welcome to the Teacher Workspace. Review classes, learners, teaching calendar, daily activities and assessments."],
    ["parentDashboard","Parent and Caregiver Workspace","Welcome to the Parent and Caregiver Workspace. Review the learner's progress and activities."],
    ["specialEducationDashboard","Special Education","Welcome to the Special Education workspace. Review authorised learning support information."],
    ["studentProgressDashboard","Student Progress","Welcome to Student Progress. Review completed learning, practice and assessment evidence."],
    ["pacificEducationStudentProgressDashboard","Student Progress Dashboard","Welcome to the Student Progress Dashboard. Review your learning progress and coverage."],
    ["pacificGuardianCommentSection","Guardian Review","Welcome to Pacific Guardian Review. Review administrative support information and recorded comments."],
    ["pacificEducationExternalReviewerPortal","External Reviewer","Welcome to the External Reviewer Portal. Review curriculum evidence, activities and assessments."],
    ["pacificEducationHomeSubmission","Home Evidence","Welcome to Home Evidence. Provide authorised learning evidence for teacher review."],
    ["pacificEducationWeekendHolidaySupplementaryActivities","Supplementary Activities","Welcome to Supplementary Activities. Review the available weekend and holiday learning activities."],
    ["pacificEducationExamCalendarSection","Exam Calendar","Welcome to the Exam Calendar. Review scheduled examination information."],
    ["pacificEducationAppStudentSchoolCalendar","Student School Calendar","Welcome to the Student School Calendar. Review dates provided by the teacher or school."],
    ["assessments","Assessments","Welcome to Assessments. Follow the spoken instructions carefully."],
    ["dailyLesson","Daily Activities","Welcome to Daily Activities. Complete the assigned activity for the current learning day."],
    ["dailyLessonPracticeStage","Practice","Welcome to Practice. Complete the practice task and use Listen whenever you need the question read aloud."]
  ];
  function speak(text){
    try {
      if(window.PacificEducationSpeech && typeof window.PacificEducationSpeech.speakText==="function") return window.PacificEducationSpeech.speakText(text,{allowRepeat:true});
      if(typeof window.speakText==="function") return window.speakText(text);
    } catch(error) { console.warn("PacEdu page voice repair:",error); }
    var status=document.getElementById("pacificEducationVoiceStatus");
    if(status) status.textContent="Voice is not ready. Use Play or Hear Instructions after the page loads.";
    return false;
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
  function patchGuidedPages(){
    var api=window.PacificEducationMandatoryVoiceNavigation;
    if(!api||!Array.isArray(api.pages))return false;
    guided.forEach(function(entry){
      var page=api.pages.find(function(p){return Number(p.step)===entry[0];});
      if(page){page.id=entry[1];page.label=page.label||entry[1];page.text=entry[2];}
    });
    return true;
  }
  function installWorkspaceControls(){
    workspaces.forEach(function(item){
      var host=document.getElementById(item[0]);if(!host||host.getAttribute("data-pe-all-page-voice")==="true")return;
      host.setAttribute("data-pe-all-page-voice","true");
      var button=document.createElement("button");
      button.type="button";button.textContent="🔊 Hear Instructions";
      button.setAttribute("aria-label","Hear instructions for "+item[1]);
      button.setAttribute("data-pe-every-page-voice-button","true");
      button.style.cssText="min-height:44px;margin:8px 4px;padding:10px 14px;";
      button.addEventListener("click",function(event){if(event)event.preventDefault();speak(item[2]);});
      host.insertBefore(button,host.firstChild);
    });
  }
  function init(){
    patchGuidedPages();
    installWorkspaceControls();
    var last={};
    var spokenWorkspaces=Object.create(null);
    workspaces.forEach(function(item){var el=document.getElementById(item[0]);last[item[0]]=visible(el);});
    var observer=new MutationObserver(function(records){
      patchGuidedPages();
      installWorkspaceControls();
      var changed=[];
      records.forEach(function(record){
        var el=record.target&&record.target.nodeType===1?record.target:null;
        if(!el)return;
        workspaces.forEach(function(item){
          var host=document.getElementById(item[0]);
          if(host&&(host===el||host.contains(el)))changed.push(item);
        });
      });
      var seen={};
      changed.forEach(function(item){
        if(seen[item[0]])return;seen[item[0]]=true;
        var host=document.getElementById(item[0]),now=visible(host),was=last[item[0]];
        last[item[0]]=now;
        /* Avoid repeat narration when a workspace is re-rendered; learners can replay explicitly. */
        if(now&&!was&&!spokenWorkspaces[item[0]]){
          spokenWorkspaces[item[0]]=true;
          speak(item[2]);
        }
      });
    });
    if(document.body)observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:["hidden","aria-hidden","style","class","data-pe-flow-step"]});
    /* The protected controller owns guided-step announcements; do not start a second narrator here. */
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})(window,document);
