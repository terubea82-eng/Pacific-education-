/* Pacific Education — Mandatory Page + Box Voice Controller v20261005
 * Complete page-by-page instructions with box-by-box guidance.
 * Uses the existing native/web speech engine. No production/payment changes.
 */
(function(window, document){
  "use strict";

  var STEP_PAGES = [
    {step:0,id:"pacificEducationWelcome",label:"Welcome",text:"Welcome to Pacific Education. We are pleased to welcome you. Pacific Education helps learners learn, discover, practise and grow. Select Next to begin your learning journey."},
    {step:1,id:"pacificEducationIdentityRegistration",label:"Registration",text:"Welcome to User Registration. Please complete each required box carefully. Enter your information one box at a time. When all required information is complete, review it and select Next to continue."},
    {step:2,id:"prototypeAccess",label:"Pilot Access",text:"Welcome to Pacific Education pilot access. Please review the pilot information and instructions. When you are ready to continue, select Next."},
    {step:3,id:"levelSelection",label:"Learning Level",text:"Welcome to Learning Level. Please choose the class or form that matches your current learning programme. Review your selection, then select Next to choose your subject."},
    {step:4,id:"subjectSelection",label:"Subject",text:"Welcome to Subject Selection. Please choose the subject you want to study. Listen to the available choices if you need help, then select Next."},
    {step:5,id:"termSelection",label:"Term",text:"Welcome to Term Selection. Please choose the school term for your learning activities. Your daily activities, practice and assessments will follow the selected term. Select Next when ready."},
    {step:6,id:"capabilitySelection",label:"Learning Capability",text:"Welcome to Learning Capability. Choose the learning pathway or capability you are working on. Review your choice, then select Next."},
    {step:10,id:"teacherCalendarSection",label:"Teacher Calendar and Review",text:"Welcome to Teacher Calendar and Review. Authorised teachers can manage school dates, teaching days, holidays, revision and examinations. Review information carefully before saving changes."}
  ];

  var WORKSPACE_PAGES = [
    ["pacificEducationAppTools","Learning Tools","Welcome to Learning Tools. Choose the learning tool you want to use. Users come first, followed by Learning Level, Subject, Term, Daily Activities, Practice, Assessment and Coverage."],
    ["pacificEducationSchoolIdentitySection","School Identity","Welcome to School Identity. Review the school and existing class information. Use the existing unique Class Reference where one already exists."],
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
    ["pacificEducationAppStudentSchoolCalendar","Student School Calendar","Welcome to the Student School Calendar. Review dates provided by the teacher or school. Students do not create school dates."],
    ["assessments","Assessments","Welcome to Assessments. Choose an assessment and follow the spoken instructions carefully."],
    ["dailyLesson","Daily Activities","Welcome to Daily Activities. Complete the assigned activity for the current learning day."],
    ["dailyLessonPracticeStage","Practice","Welcome to Practice. Complete the practice task and use Listen whenever you need the question read aloud."]
  ];

  var BOX_INSTRUCTIONS = {
    name:"Please enter your name in this box. Use the name you want Pacific Education to display for your learning account.",
    fullname:"Please enter your full name in this box. Check the spelling before continuing.",
    email:"Please enter your email address in this box. Check that the address is correct before continuing.",
    password:"Please enter your password in this box. Keep your password private.",
    confirm:"Please enter the requested confirmation information in this box and make sure it matches the information you entered previously.",
    role:"Please choose the user role that best describes how you will use Pacific Education.",
    class:"Please choose the class or form that matches the learner's current level.",
    level:"Please choose the learning level that matches the learner's current programme.",
    subject:"Please choose the subject you want to study.",
    term:"Please choose the current school term for this learning programme.",
    date:"Please select the authorised date requested by this page.",
    message:"Please enter your message in this box. Use clear and complete sentences.",
    answer:"Please enter your answer in this answer space. Read or listen to the question carefully before responding.",
    shortanswer:"Please provide a clear short answer in this box.",
    longanswer:"Please explain your answer using complete sentences in this answer area.",
    textarea:"Please enter your response in this text area. Take your time and review your response before continuing.",
    select:"Please choose one of the available options in this selection box.",
    checkbox:"Please select this option if it applies to you.",
    file:"Use this upload box only when the page asks for authorised evidence. Select the appropriate file and review it before continuing."
  };

  var lastAnnouncementKey="", announcementTimer=null, installed=false, topRightPlayButton=null, topRightStopButton=null, currentPageVoiceText="", lastSpokenText="", lastSpokenAt=0, lastFocusedBox=null, pendingNextVoice=false, nextVoiceTimer=null, lastRegistrationSignature="", finalNextInstalled=false;

  function speak(text){
    text=String(text||"").replace(/\\s+/g," ").trim(); if(!text)return false;
    var now=Date.now();
    if(text===lastSpokenText && (now-lastSpokenAt)<4500)return false;
    lastSpokenText=text; lastSpokenAt=now;
    try{
      if(window.PacificEducationSpeech&&typeof window.PacificEducationSpeech.speakText==="function")return window.PacificEducationSpeech.speakText(text);
      if(typeof window.speakText==="function")return window.speakText(text);
    }catch(e){console.warn("Pacific Education page voice failed:",e);}
    return false;
  }
  function stop(){
    try{
      if(window.PacificEducationSpeech&&typeof window.PacificEducationSpeech.stopSpeech==="function"){window.PacificEducationSpeech.stopSpeech();return;}
      if(window.speechSynthesis)window.speechSynthesis.cancel();
    }catch(_){}
  }
  function currentStep(){var b=document.body;if(!b)return null;var n=Number(b.getAttribute("data-pe-flow-step"));return Number.isFinite(n)?n:null;}
  function pageForStep(step){for(var i=0;i<STEP_PAGES.length;i++)if(STEP_PAGES[i].step===step)return STEP_PAGES[i];return null;}
  function visibleElement(id){
    var e=document.getElementById(id);if(!e||e.hidden)return null;
    var s=window.getComputedStyle?window.getComputedStyle(e):null;
    if(s&&(s.display==="none"||s.visibility==="hidden"))return null;return e;
  }

  function ensureTopRightVoiceControls(){
    if(topRightPlayButton)return;
    var wrap=document.createElement("div");
    wrap.setAttribute("data-pe-top-right-voice-controls","true");
    wrap.style.cssText="position:fixed;top:10px;right:10px;z-index:99999;display:flex;gap:6px;align-items:center;";
    topRightPlayButton=document.createElement("button");
    topRightPlayButton.type="button";topRightPlayButton.textContent="▶️ Play";
    topRightPlayButton.setAttribute("aria-label","Play audio instructions for this page");
    topRightPlayButton.style.cssText="min-height:44px;padding:10px 14px;font-weight:bold;border:2px solid currentColor;border-radius:8px;background:Canvas;color:CanvasText;box-shadow:0 2px 8px rgba(0,0,0,.2);";
    topRightPlayButton.addEventListener("click",function(){speak(currentPageVoiceText);});
    topRightStopButton=document.createElement("button");
    topRightStopButton.type="button";topRightStopButton.textContent="⏹";
    topRightStopButton.setAttribute("aria-label","Stop Pacific Education voice");
    topRightStopButton.style.cssText="min-height:44px;padding:10px 12px;font-weight:bold;border:2px solid currentColor;border-radius:8px;background:Canvas;color:CanvasText;box-shadow:0 2px 8px rgba(0,0,0,.2);";
    topRightStopButton.addEventListener("click",stop);
    wrap.appendChild(topRightPlayButton);wrap.appendChild(topRightStopButton);document.body.appendChild(wrap);
  }

  function addVoiceControl(host,text){
    currentPageVoiceText=String(text||"").trim();ensureTopRightVoiceControls();
    if(host){
      var old=host.querySelectorAll("[data-pe-page-voice-control]");
      Array.prototype.forEach.call(old,function(e){e.remove();});
      var b=document.createElement("button");
      b.type="button";b.textContent="🔊 Hear Instructions";
      b.setAttribute("aria-label","Hear instructions for "+(host.getAttribute("aria-label")||"this page"));
      b.setAttribute("data-pe-page-voice-control","true");
      b.style.cssText="min-height:44px;margin:8px 4px;padding:10px 14px;";
      b.addEventListener("click",function(){speak(text);});
      host.insertBefore(b,host.firstChild);
    }
  }

  function announcePage(page,reason){
    if(!page)return false;
    var key=String(page.step)+":"+page.id;
    if(key===lastAnnouncementKey && reason!=="manual")return false;
    lastAnnouncementKey=key;
    var target=document.getElementById(page.id);if(target)addVoiceControl(target,page.text);
    if(announcementTimer)clearTimeout(announcementTimer);
    var delay=reason==="startup"?700:220;
    announcementTimer=setTimeout(function(){speak(page.text);},delay);
    return true;
  }

  function announceNextPageAfterNavigation(){
    pendingNextVoice=true;
    if(nextVoiceTimer)clearTimeout(nextVoiceTimer);
    nextVoiceTimer=setTimeout(function(){
      pendingNextVoice=false;
      var page=pageForStep(currentStep());
      if(page)announcePage(page,"next");
    },350);
  }
  function announceCurrentStep(reason){return announcePage(pageForStep(currentStep()),reason||"step");}

  function labelText(el){
    var id=el.id||"", name=el.name||"", aria=el.getAttribute("aria-label")||"", ph=el.getAttribute("placeholder")||"";
    var label="";
    if(id){try{var l=document.querySelector('label[for="'+CSS.escape(id)+'"]');if(l)label=l.textContent;}catch(_){}}
    if(!label&&name){try{var nl=document.querySelector('label[for="'+CSS.escape(name)+'"]');if(nl)label=nl.textContent;}catch(_){}}
    return String(aria||label||ph||name||id||"").replace(/\s+/g," ").trim();
  }
  function boxInstruction(el){
    var text=(labelText(el)+"").toLowerCase();
    var type=(el.type||el.tagName||"").toLowerCase();
    if(/email/.test(type)||/email/.test(text))return BOX_INSTRUCTIONS.email;
    if(/password/.test(type)||/password/.test(text))return /confirm|repeat|again/.test(text)?BOX_INSTRUCTIONS.confirm:BOX_INSTRUCTIONS.password;
    if(/name|full name/.test(text))return /full/.test(text)?BOX_INSTRUCTIONS.fullname:BOX_INSTRUCTIONS.name;
    if(/role/.test(text))return BOX_INSTRUCTIONS.role;
    if(/class|form/.test(text))return BOX_INSTRUCTIONS.class;
    if(/level/.test(text))return BOX_INSTRUCTIONS.level;
    if(/subject/.test(text))return BOX_INSTRUCTIONS.subject;
    if(/term/.test(text))return BOX_INSTRUCTIONS.term;
    if(/date/.test(text)||type==="date")return BOX_INSTRUCTIONS.date;
    if(/message|body/.test(text))return BOX_INSTRUCTIONS.message;
    if(/long answer|essay/.test(text))return BOX_INSTRUCTIONS.longanswer;
    if(/short answer/.test(text))return BOX_INSTRUCTIONS.shortanswer;
    if(type==="textarea")return BOX_INSTRUCTIONS.textarea;
    if(type==="checkbox")return BOX_INSTRUCTIONS.checkbox;
    if(type==="file")return BOX_INSTRUCTIONS.file;
    if(el.tagName.toLowerCase()==="select")return BOX_INSTRUCTIONS.select;
    if(/answer|response/.test(text))return BOX_INSTRUCTIONS.answer;
    return "Please enter or choose the information requested in this box. Listen carefully to the instruction on the page before continuing.";
  }
  function installBoxVoice(){
    var root=document.body;if(!root)return;
    var boxes=root.querySelectorAll("input,select,textarea");
    Array.prototype.forEach.call(boxes,function(el){
      if(el.getAttribute("data-pe-box-voice")==="true")return;
      el.setAttribute("data-pe-box-voice","true");
      el.addEventListener("focus",function(){
        if(lastFocusedBox===el)return;
        lastFocusedBox=el;
        speak(boxInstruction(el));
      });
      el.addEventListener("blur",function(){if(lastFocusedBox===el)lastFocusedBox=null;});
    });
  }

  function installStepWatcher(){
    var body=document.body;if(!body||body.getAttribute("data-pe-voice-watcher")==="true")return;
    body.setAttribute("data-pe-voice-watcher","true");
    var last=currentStep();
    var observer=new MutationObserver(function(){
      var s=currentStep();if(s!==last){last=s;if(!pendingNextVoice)announceCurrentStep("step");installBoxVoice();installFinalNext();}
    });
    observer.observe(body,{attributes:true,attributeFilter:["data-pe-flow-step","class"]});
  }

  function installWorkspaceWatcher(){
    var body=document.body;if(!body||body.getAttribute("data-pe-workspace-voice-watcher")==="true")return;
    body.setAttribute("data-pe-workspace-voice-watcher","true");
    var lastId="";
    function scan(){
      installBoxVoice();
      for(var i=0;i<WORKSPACE_PAGES.length;i++){
        var item=WORKSPACE_PAGES[i],el=visibleElement(item[0]);if(!el)continue;
        if(item[0]===lastId)return;
        lastId=item[0];addVoiceControl(el,item[2]);speak(item[2]);return;
      }
    }
    var observer=new MutationObserver(function(){clearTimeout(observer._timer);observer._timer=setTimeout(scan,120);});
    observer.observe(body,{childList:true,subtree:true,attributes:true,attributeFilter:["hidden","style","class"]});
    setTimeout(scan,350);
  }

  function registrationSignature(){
    try{
      var saved=JSON.parse(sessionStorage.getItem("pacificEducationPilotRegistration")||"null");
      if(!saved||!saved.registeredAt||!saved.role)return "";
      return String(saved.registeredAt)+"|"+String(saved.name||"")+"|"+String(saved.role||"");
    }catch(_){return "";}
  }
  function workspaceWelcomeForRole(role){
    var map={
      "Student":"Welcome to your Student Workspace. Your learning tools, class or level, subject, term, daily activities, practice, assessments, coverage and progress are ready for you.",
      "Teacher":"Welcome to your Teacher Workspace. Your classes, learners, teaching calendar, daily activities, assessments and curriculum coverage tools are ready.",
      "Parent/Caregiver":"Welcome to your Parent and Caregiver Workspace. You can review your learner's progress, activities and available family support information.",
      "Professional Reviewer":"Welcome to your Professional Reviewer Workspace. Curriculum evidence, activities, assessments and review information are ready for authorised review.",
      "NGO/Organization":"Welcome to your NGO and Organization Workspace. Programme coverage, evidence and pilot information are ready for authorised use.",
      "Education/Government":"Welcome to your Education and Government Workspace. Curriculum control, evidence, traceability and coverage information are ready for authorised review.",
      "Community/Partner":"Welcome to your Community and Partner Workspace. Education services, pilot information and feedback tools are ready.",
      "Technician":"Welcome to your Technician Workspace. Pilot diagnostics and authorised technical tools are ready.",
      "Owner/Control":"Welcome to your Owner and Control Workspace. Pilot status, release evidence and authorised control information are ready."
    };
    return map[role]||("Welcome to your "+role+" Workspace. Your authorised Pacific Education tools are ready.");
  }
  function announceRegistrationCompletion(){
    var sig=registrationSignature();
    if(!sig||sig===lastRegistrationSignature)return;
    lastRegistrationSignature=sig;
    try{
      var saved=JSON.parse(sessionStorage.getItem("pacificEducationPilotRegistration")||"null");
      var role=String(saved.role||"");
      var name=String(saved.name||"").trim();
      var completion="Registration completed successfully. "+(name?"Registered name: "+name+". ":"")+"Registered role: "+role+". Your registration has been saved for this pilot session. Your individual workspace is now opening.";
      speak(completion);
      setTimeout(function(){speak(workspaceWelcomeForRole(role));},900);
      setTimeout(function(){
        var workspace=document.getElementById("pacificEducationPilotUserWorkspaces");
        if(workspace&&!workspace.hidden){try{workspace.scrollIntoView({behavior:"smooth",block:"start"});}catch(_){} }
        speak(workspaceWelcomeForRole(role));
      },1800);
    }catch(_){ }
  }
  function installRegistrationCompletionWatcher(){
    announceRegistrationCompletion();
    if(window.__peRegistrationVoiceTimer)return;
    window.__peRegistrationVoiceTimer=setInterval(announceRegistrationCompletion,350);
  }
  function installFinalNext(){
    if(finalNextInstalled)return;
    var step=currentStep();
    if(step!==10)return;
    var host=document.getElementById("teacherCalendarSection")||document.getElementById("pacificEducationExternalReviewerPortal");
    if(!host)return;
    finalNextInstalled=true;
    var wrap=document.createElement("div");
    wrap.className="pacific-flow-next";
    wrap.setAttribute("data-pe-final-next","true");
    var b=document.createElement("button");
    b.type="button";b.textContent="➡️ Next";
    b.setAttribute("aria-label","Next page. Finish the guided sequence and return to your workspace.");
    b.addEventListener("click",function(){
      document.body.classList.remove("pe-guided-flow");
      document.body.removeAttribute("data-pe-flow-step");
      var ws=document.getElementById("pacificEducationPilotUserWorkspaces");
      if(ws){ws.hidden=false;try{ws.scrollIntoView({behavior:"smooth",block:"start"});}catch(_){} }
      speak("Guided sequence completed. Welcome to your individual Pacific Education workspace. Choose your workspace tool to continue.");
    });
    wrap.appendChild(b);host.appendChild(wrap);
  }

  function installNextSafety(){
    var ids=["welcomeNextButton","registrationNextButton","prototypeNextButton","levelNextButton","subjectNextButton","termNextButton","capabilityNextButton"];
    ids.forEach(function(id){
      var b=document.getElementById(id);if(!b||b.getAttribute("data-pe-voice-next")==="true")return;
      b.setAttribute("data-pe-voice-next","true");
      b.setAttribute("aria-label","Next page. Complete this page, then select Next. The next page will be read aloud.");
      b.addEventListener("click",function(){
        if(b.disabled||b.hidden)return;
        announceNextPageAfterNavigation();
      },true);
    });
  }

  function installDynamicObserver(){
    var body=document.body;if(!body||body.getAttribute("data-pe-box-observer")==="true")return;
    body.setAttribute("data-pe-box-observer","true");
    var observer=new MutationObserver(function(){clearTimeout(observer._timer);observer._timer=setTimeout(function(){installBoxVoice();installNextSafety();installFinalNext();},100);});
    observer.observe(body,{childList:true,subtree:true});
  }

  function enforce(){
    installNextSafety();installStepWatcher();installWorkspaceWatcher();installBoxVoice();installDynamicObserver();installRegistrationCompletionWatcher();installFinalNext();announceCurrentStep("startup");return true;
  }
  function init(){if(installed)return;installed=true;enforce();setTimeout(enforce,500);setTimeout(enforce,1200);}

  window.PacificEducationMandatoryVoiceNavigation={speak:speak,stop:stop,announceCurrentStep:announceCurrentStep,announcePage:announcePage,announceNextPageAfterNavigation:announceNextPageAfterNavigation,enforce:enforce,pages:STEP_PAGES,boxInstruction:boxInstruction};
  window.PacificEducationPageVoice=window.PacificEducationMandatoryVoiceNavigation;

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})(window,document);
