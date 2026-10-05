/* Pacific Education — Pilot navigation reliability repair v1.5.1
 * One navigation owner for the controlled pilot. Production/payment gates remain untouched.
 */
(function(window, document){
  "use strict";
  var VERSION="1.5.2";
  var flow=[
    ["welcomeNextButton",1,"pacificEducationIdentityRegistration"],
    ["registrationNextButton",2,"prototypeAccess"],
    ["prototypeNextButton",3,"levelSelection"],
    ["levelNextButton",4,"subjectSelection"],
    ["subjectNextButton",5,"termSelection"],
    ["termNextButton",6,"capabilitySelection"],
    ["capabilityNextButton",7,"dailyLesson"],
    ["dailyNextButton",8,"dailyLessonPracticeStage"],
    ["practiceNextButton",9,"assessments"],
    ["assessmentNextButton",10,"teacherCalendarSection"]
  ];
  var targetById={
    userRegistrationOpenButton:"pacificEducationIdentityRegistration",
    dailyActivitiesStartButton:"dailyLesson",
    dailyActivitiesContinuePracticeButton:"dailyLessonPracticeStage",
    practiceContinueAssessmentButton:"assessments",
    assessmentContinueCoverageButton:"pacificEducationCoverageDashboard",
    pacificTeacherDashboardRefresh:"teacherDashboard",
    pacificParentDashboardRefresh:"parentDashboard"
  };
  var labelTargets=[
    [/^user registration/i,"pacificEducationIdentityRegistration"],
    [/^users?$/i,"pacificEducationIdentityRegistration"],
    [/learning tools/i,"learningPlatform"],
    [/class\s*\/\s*level|learning level/i,"levelSelection"],
    [/curriculum subject|^subject$/i,"subjectSelection"],
    [/school term|^term$/i,"termSelection"],
    [/learning capability|^capability$/i,"capabilitySelection"],
    [/daily activities|daily activity/i,"dailyLesson"],
    [/^practice|student practice/i,"dailyLessonPracticeStage"],
    [/^assessment|student assessments/i,"assessments"],
    [/teacher dashboard|teacher workspace/i,"teacherDashboard"],
    [/parent dashboard|parent workspace/i,"parentDashboard"],
    [/special education|inclusion/i,"specialEducationDashboard"],
    [/coverage|curriculum coverage/i,"pacificEducationCoverageDashboard"],
    [/progress|my progress/i,"pacificEducationStudentProgressDashboard"],
    [/mail box|mailbox/i,"pacificEducationMailbox"],
    [/education ai|pacific education ai/i,"pacificEducationAIConversation"],
    [/guardian|owner oversight/i,"pacificGuardianCommentSection"],
    [/system status/i,"systemStatus"],
    [/external reviewer|reviewer portal/i,"pacificEducationExternalReviewerPortal"]
  ];
  function status(text){
    var a=document.getElementById("pacificEducationVoiceStatus"),b=document.getElementById("pacificEducationInteractionStatus");
    if(a)a.textContent=text;if(b)b.textContent=text;
  }
  function target(id){return document.getElementById(id);}
  function show(id,step){
    var el=target(id);if(!el)return false;
    if(typeof step==="number"){
      document.body.classList.add("pe-guided-flow");
      document.body.setAttribute("data-pe-flow-step",String(step));
    }else{document.body.classList.remove("pe-guided-flow");document.body.removeAttribute("data-pe-flow-step");}
    el.hidden=false;el.removeAttribute("aria-hidden");
    try{el.style.removeProperty("display");}catch(_){ }
    try{el.scrollIntoView({behavior:"smooth",block:"start"});}catch(_2){try{el.scrollIntoView();}catch(_3){}}
    return true;
  }
  function go(id){
    var step=null;for(var i=0;i<flow.length;i++)if(flow[i][2]===id){step=flow[i][1];break;}
    return show(id,step);
  }
  function openRegistration(){
    var form=target("userRegistrationForm");if(!form)return false;
    form.hidden=false;var b=target("userRegistrationOpenButton");
    if(b){b.setAttribute("aria-expanded","true");b.textContent="👤 User Registration — Tap to close";}
    return show("pacificEducationIdentityRegistration",1);
  }
  function nextFromButton(id){for(var i=0;i<flow.length;i++)if(flow[i][0]===id)return show(flow[i][2],flow[i][1]);return false;}
  function textOf(el){return String(el.getAttribute("aria-label")||el.textContent||el.value||"").replace(/\s+/g," ").trim();}
  function mappedTarget(el){
    if(!el)return "";var id=el.id||"";if(targetById[id])return targetById[id];
    var explicit=el.getAttribute("data-pe-target");if(explicit&&target(explicit))return explicit;
    var href=el.getAttribute("href")||"";if(href.charAt(0)==="#"&&target(href.slice(1)))return href.slice(1);
    var code=el.getAttribute("onclick")||"",m=code.match(/getElementById\(['"]([^'"]+)['"]\)\.scrollIntoView/);
    if(m&&target(m[1]))return m[1];
    var label=textOf(el);for(var i=0;i<labelTargets.length;i++)if(labelTargets[i][0].test(label)&&target(labelTargets[i][1]))return labelTargets[i][1];
    return "";
  }
  function isNavigationControl(el){
    if(!el)return false;var tag=el.tagName;if(tag!=="BUTTON"&&tag!=="A"&&el.getAttribute("role")!=="button")return false;
    var id=el.id||"";if(id&&targetById[id])return true;if(flow.some(function(x){return x[0]===id;}))return true;return !!mappedTarget(el);
  }
  function handleNavigation(event){
    var el=event.target&&event.target.closest?event.target.closest("button,a,[role=button]"):null;if(!isNavigationControl(el))return;
    var id=el.id||"";
    var label=textOf(el).toLowerCase();
    if(id==="userRegistrationOpenButton" || /user registration/.test(label) || /^users?$/.test(label)){
      event.preventDefault();event.stopImmediatePropagation();openRegistration();return;
    }
    for(var i=0;i<flow.length;i++)if(flow[i][0]===id){event.preventDefault();event.stopImmediatePropagation();nextFromButton(id);return;}
    var dest=mappedTarget(el);if(!dest)return;
    var navigationWord=/(user registration|users|learning tools|class|level|subject|term|capability|daily activit|practice|assessment|coverage|dashboard|workspace|mail box|mailbox|education ai|guardian|system status|external reviewer|progress)/.test(label);
    if(!navigationWord&&((el.getAttribute("href")||"").charAt(0)!=="#"))return;
    event.preventDefault();event.stopImmediatePropagation();go(dest);
  }
  function repairStyles(){
    document.body.setAttribute("data-pe-front-repair",VERSION);
    document.querySelectorAll("button,a,[role=button]").forEach(function(el){if(isNavigationControl(el)){el.style.pointerEvents="auto";el.style.touchAction="manipulation";}});
  }
  function bindVoice(){var c=window.PacificEducationVoiceNextDirective;if(!c)return;try{if(typeof c.attach==="function")flow.forEach(function(x){c.attach(x[0],"pacificEducationVoiceStatus");});}catch(_){}}
  function audit(){
    var failures=[];flow.forEach(function(x){if(!target(x[0]))failures.push(x[0]+" missing");if(!target(x[2]))failures.push(x[2]+" missing");});
    var result={version:VERSION,passed:failures.length===0,failures:failures,checkedAt:new Date().toISOString()};
    try{localStorage.setItem("pacificEducationFrontRepairAudit",JSON.stringify(result));}catch(_){ }
    status(failures.length?"Navigation recheck: "+failures.length+" issue(s) detected.":"Pacific Education pilot navigation ready: page boxes and Next controls active.");
    return result;
  }
  function init(){
    if(document.body.getAttribute("data-pe-front-repair-bound")==="true")return;
    document.body.setAttribute("data-pe-front-repair-bound","true");document.addEventListener("click",handleNavigation,true);
    repairStyles();bindVoice();if(!document.body.classList.contains("pe-guided-flow"))show("pacificEducationWelcome",0);
    [250,1000,3000].forEach(function(ms){setTimeout(function(){repairStyles();bindVoice();audit();},ms);});setInterval(function(){repairStyles();audit();},5000);
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})(window,document);
