/* Pacific Education — Pilot navigation reliability repair v1.5.1
 * One navigation owner for the controlled pilot. Production/payment gates remain untouched.
 */
(function(window, document){
  "use strict";
  var VERSION="1.5.3";
  var flow=[
    ["welcomeNextButton",1,"pacificEducationIdentityRegistration"],
    ["registrationNextButton",2,"pacificEducationPilotUserWorkspaces"],
    ["prototypeNextButton",3,"levelSelection"],
    ["levelNextButton",4,"subjectSelection"],
    ["subjectNextButton",5,"termSelection"],
    ["termNextButton",6,"capabilitySelection"]
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
  function openRegisteredWorkspace(){
    var role=document.getElementById("pilotRegistrationRole"), name=document.getElementById("pilotRegistrationName");
    var selected=(role&&role.value)||"", display=(name&&name.value||"").trim();
    if(!selected){status("Please choose your user role before continuing.");return false;}
    if(!display){status("Please enter your name or display name before continuing.");if(name)name.focus();return false;}
    try{sessionStorage.setItem("pacificEducationPilotRegistration",JSON.stringify({name:display,role:selected,registeredAt:new Date().toISOString(),pilotOnly:true}));}catch(_){ }
    var map={"Student":"student","Blind Learner":"blind-learner","Deaf Learner":"deaf-learner","Teacher":"teacher","Parent/Caregiver":"parent","Professional Reviewer":"professional","NGO/Organization":"ngo","Education/Government":"education","Community/Partner":"community","Technician":"technician","Owner/Control":"owner"};
    var workspaceRole=map[selected], selector=document.getElementById("pilotRoleSelector");
    if(selector&&workspaceRole){selector.value=workspaceRole;selector.dispatchEvent(new Event("change",{bubbles:true}));}
    document.body.classList.remove("pe-guided-flow");document.body.removeAttribute("data-pe-flow-step");
    var ws=document.getElementById("pacificEducationPilotUserWorkspaces");
    if(ws){ws.hidden=false;try{ws.scrollIntoView({behavior:"smooth",block:"start"});}catch(_){ws.scrollIntoView();}}
    var message=selected==="Student"?"Registration complete. Your Student Workspace is ready. Your teacher guides your class, subject and term. Open Start Learning to begin Daily Activities.":"Registration complete. Your "+selected+" Workspace is ready.";
    status(message);
    if(window.PacificEducationSpeech&&typeof window.PacificEducationSpeech.speakText==="function")window.PacificEducationSpeech.speakText(message);else if(window.speakText)window.speakText(message);
    return true;
  }
  function finishIntroduction(){
    document.body.classList.remove("pe-guided-flow");
    document.body.removeAttribute("data-pe-flow-step");
    var ws=document.getElementById("pacificEducationPilotUserWorkspaces");
    if(ws){ws.hidden=false;try{ws.scrollIntoView({behavior:"smooth",block:"start"});}catch(_){} }
    return true;
  }
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
    if(id==="prototypeNextButton" || id==="levelNextButton"){
      var roster=window.PacificEducationTeacherClassRosterContext;
      var classId=roster&&typeof roster.getClassId==="function"?String(roster.getClassId()||"").trim():"";
      if(!classId){
        event.preventDefault();event.stopImmediatePropagation();
        status("Please select an existing Class Reference before continuing to Curriculum Subject.");
        var classPicker=target("pacificEducationClassReference");
        if(classPicker){try{classPicker.focus({preventScroll:false});}catch(_){classPicker.focus();}}
        return;
      }
    }
    if(id==="registrationNextButton"){event.preventDefault();event.stopImmediatePropagation();openRegisteredWorkspace();return;}
    if(id==="capabilityNextButton"){event.preventDefault();event.stopImmediatePropagation();finishIntroduction();return;}
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


/* Green Guided Steps — simple pilot navigation aid.
 * Visual guidance only: preserves existing #856 voice/navigation behavior.
 */
(function(){
  "use strict";
  var GREEN="#15803d";
  var steps=[
    ["welcomeNextButton","Step 1","Welcome","Next"],
    ["registrationNextButton","Step 2","Student Workspace","Open workspace"],
    ["prototypeNextButton","Step 3","Workspace access","Next"],
    ["levelNextButton","Step 4","Class / Level","Next"],
    ["subjectNextButton","Step 5","Subject","Next"],
    ["termNextButton","Step 6","Term","Next"],
    ["capabilityNextButton","Step 7","Learning capability","Open workspace"]
  ];
  function css(){
    if(document.getElementById("pe-green-guided-style"))return;
    var s=document.createElement("style");s.id="pe-green-guided-style";
    s.textContent=
      ".pe-green-guide{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:8px 0 4px;font-weight:700;color:"+GREEN+";font-size:1rem}"+
      ".pe-green-guide .pe-green-arrow{font-size:1.35rem;line-height:1}"+
      ".pe-green-guide .pe-green-step{font-weight:800}"+
      ".pacific-flow-next .pe-green-next-button{background:"+GREEN+"!important;color:#fff!important;border:2px solid "+GREEN+"!important;box-shadow:0 2px 5px rgba(0,0,0,.18);font-weight:800!important}"+
      ".pacific-flow-next .pe-green-next-button:focus-visible{outline:4px solid #facc15!important;outline-offset:3px}"+
      ".pe-green-role-hint{margin:8px 0;padding:10px 12px;border-left:5px solid "+GREEN+";background:#f0fdf4;font-weight:700}"+
      "@media(max-width:520px){.pe-green-guide{font-size:.98rem}.pacific-flow-next .pe-green-next-button{width:100%;min-height:62px;font-size:1.15rem}}";
    document.head.appendChild(s);
  }
  function addGuide(button,step,title,label){
    if(!button)return;
    button.classList.add("pe-green-next-button");
    button.setAttribute("data-pe-green-step",step);
    button.setAttribute("aria-label",step+". "+title+". "+label+". Follow the green button to continue.");
    var wrap=button.parentElement;
    if(wrap&&wrap.classList.contains("pacific-flow-next")&&!wrap.querySelector(".pe-green-guide")){
      var g=document.createElement("div");g.className="pe-green-guide";
      g.innerHTML='<span class="pe-green-step">'+step+'</span><span>'+title+'</span><span class="pe-green-arrow" aria-hidden="true">→</span><span>Follow the green button</span>';
      wrap.insertBefore(g,wrap.firstChild);
    }
  }
  function roleHint(){
    var form=document.getElementById("userRegistrationForm");
    if(!form||form.querySelector(".pe-green-role-hint"))return;
    var hint=document.createElement("div");hint.className="pe-green-role-hint";
    hint.setAttribute("role","status");
    hint.textContent="Step 2: Choose your user role, complete the registration boxes, then follow the green Next button.";
    form.insertBefore(hint,form.firstChild);
  }
  function init(){
    css();
    steps.forEach(function(x){addGuide(document.getElementById(x[0]),x[1],x[2],x[3]);});
    roleHint();
    var roleCards=document.querySelectorAll(".pe-user-role-card");
    roleCards.forEach(function(card){
      if(card.getAttribute("data-pe-green-role-bound")==="true")return;
      card.setAttribute("data-pe-green-role-bound","true");
      card.style.borderColor=GREEN;
      card.style.cursor="pointer";
    });
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
  [500,1500,3000].forEach(function(ms){setTimeout(init,ms);});
})();
