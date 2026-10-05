/* Pacific Education — Front Page Reliability Repair v1.4.0
 * Pilot-safe reliability layer for first-screen navigation, welcome speech,
 * guided Next controls, and automatic recovery of failed bindings.
 *
 * Important: this controller owns each repaired click listener only once.
 * It deliberately does NOT assign element.onclick, preventing the old
 * capture-listener + inline-handler double-navigation bug.
 */
(function(window, document){
  "use strict";

  var VERSION = "1.4.0";
  var bound = false;
  var flow = [
    ["welcomeNextButton", 1, "pacificEducationIdentityRegistration"],
    ["registrationNextButton", 2, "prototypeAccess"],
    ["prototypeNextButton", 3, "levelSelection"],
    ["levelNextButton", 4, "subjectSelection"],
    ["subjectNextButton", 5, "termSelection"],
    ["termNextButton", 6, "capabilitySelection"],
    ["capabilityNextButton", 7, "dailyLesson"],
    ["dailyNextButton", 8, "dailyLessonPracticeStage"],
    ["practiceNextButton", 9, "assessments"],
    ["assessmentNextButton", 10, "teacherCalendarSection"]
  ];

  function setStatus(text){
    var el=document.getElementById("pacificEducationVoiceStatus");
    if(el)el.textContent=text;
    var system=document.getElementById("pacificEducationInteractionStatus");
    if(system)system.textContent=text;
  }

  function stopSpeech(){
    try{if(window.PacificEducationSpeech&&typeof window.PacificEducationSpeech.stopSpeech==="function")window.PacificEducationSpeech.stopSpeech();}catch(_){ }
    try{if(window.speechSynthesis)window.speechSynthesis.cancel();}catch(_2){ }
    setStatus("Voice stopped.");
  }

  function showStep(step,targetId){
    var target=document.getElementById(targetId);
    if(!target)return false;
    document.body.classList.add("pe-guided-flow");
    document.body.setAttribute("data-pe-flow-step",String(step));
    target.hidden=false;
    try{target.scrollIntoView({behavior:"smooth",block:"start"});}catch(_){try{target.scrollIntoView();}catch(_2){}}
    try{target.setAttribute("tabindex","-1");target.focus({preventScroll:true});}catch(_3){}
    return true;
  }

  function fallbackShowStep(step,targetId){
    var target=document.getElementById(targetId);
    if(!target)return false;
    document.body.classList.add("pe-guided-flow");
    document.body.setAttribute("data-pe-flow-step",String(step));
    target.hidden=false;
    target.style.display="block";
    try{target.scrollIntoView();}catch(_){ }
    return true;
  }

  function runWithRecovery(primary,fallback,source){
    try{if(typeof primary==="function"&&primary()!==false)return true;}catch(_){setStatus("Recovered control: "+source+".");}
    try{if(typeof fallback==="function"&&fallback())return true;}catch(_2){setStatus("Recovery failed for "+source+"; automatic recheck continues.");}
    return false;
  }

  function bindClick(id,fn){
    var el=document.getElementById(id);
    if(!el)return false;
    if(el.getAttribute("data-pe-front-repair")==="true")return true;
    el.setAttribute("data-pe-front-repair","true");
    el.addEventListener("click",function(event){
      /* One owner for the repaired event. Do not assign onclick: existing inline
         handlers remain intentionally disabled by this event's stopPropagation. */
      if(event){event.preventDefault();event.stopPropagation();}
      try{return fn(event);}catch(_){setStatus("Control error detected; recovery is running.");return false;}
    },true);
    el.style.pointerEvents="auto";
    el.style.touchAction="manipulation";
    el.style.position=el.style.position||"relative";
    el.style.zIndex="100";
    return true;
  }

  function ensureNextButton(id,step,targetId){
    var existing=document.getElementById(id);
    if(existing)return existing;
    var target=document.getElementById(targetId);
    if(!target||!target.parentNode)return null;
    var button=document.createElement("button");
    button.type="button";button.id=id;button.className="pacific-education-guided-next-recovery";
    button.textContent="Next →";button.setAttribute("aria-label","Next");
    target.parentNode.insertBefore(button,target);
    bindGuidedNext(id,step,targetId);
    return button;
  }

  function bindGuidedNext(id,step,targetId){
    return bindClick(id,function(){return runWithRecovery(function(){return showStep(step,targetId);},function(){return fallbackShowStep(step,targetId);},id);});
  }

  function advanceFromCurrentStep(){
    var step=parseInt(document.body.getAttribute("data-pe-flow-step")||"0",10);
    var item=flow[Math.max(0,Math.min(step,flow.length-1))];
    var button=document.getElementById(item[0]);
    if(button){try{button.click();return true;}catch(_){}}
    return runWithRecovery(function(){return showStep(item[1],item[2]);},function(){return fallbackShowStep(item[1],item[2]);},"voice-next");
  }

  function bindVoiceCommandRecovery(){
    var controllers=[window.PacificEducationVoiceCommands,window.PacificEducationSpeechCommands,window.PacificEducationVoiceNavigation];
    for(var i=0;i<controllers.length;i++){
      var c=controllers[i];if(!c)continue;
      try{
        if(typeof c.registerCommand==="function"){
          c.registerCommand("next",advanceFromCurrentStep);c.registerCommand("next page",advanceFromCurrentStep);return true;
        }
        if(typeof c.addCommand==="function"){
          c.addCommand("next",advanceFromCurrentStep);c.addCommand("next page",advanceFromCurrentStep);return true;
        }
      }catch(_){ }
    }
    return false;
  }

  function repairFlowControls(){
    for(var i=0;i<flow.length;i++){
      var item=flow[i],button=document.getElementById(item[0]);
      if(!button)button=ensureNextButton(item[0],item[1],item[2]);
      if(button)bindGuidedNext(item[0],item[1],item[2]);
    }
  }

  function bind(){
    if(bound)return;
    bound=true;
    bindClick("pacificEducationStopSpeechButton",function(){stopSpeech();return false;});
    repairFlowControls();
    bindVoiceCommandRecovery();
    bindClick("pacificEducationRefreshButton",function(){try{window.location.reload();}catch(_){setStatus("Refresh recovery unavailable.");}return false;});
    bindClick("userRegistrationOpenButton",function(){
      var form=document.getElementById("userRegistrationForm");if(!form)return false;
      var opening=!!form.hidden;form.hidden=!opening;
      var button=document.getElementById("userRegistrationOpenButton");
      if(button){button.setAttribute("aria-expanded",String(opening));button.textContent=opening?"👤 User Registration — Tap to close":"👤 User Registration — Tap to open";}
      if(opening)try{form.scrollIntoView({behavior:"smooth",block:"start"});}catch(_){try{form.scrollIntoView();}catch(_2){}}
      return false;
    });
    bindClick("pacificEducationMailboxRefresh",function(){
      if(typeof window.refreshPacificEducationMailbox==="function")return window.refreshPacificEducationMailbox();
      var status=document.getElementById("pacificEducationMailboxStatus");if(status)status.textContent="Mail Box refreshed. This pilot mailbox is stored on this browser.";return false;
    });
    bindClick("pacificEducationMailboxCompose",function(){var composer=document.getElementById("pacificEducationMailboxComposer");if(composer)composer.hidden=false;return false;});
    setStatus("Navigation repair active: one-click binding, backup recovery and automatic recheck.");
  }

  function recheck(){
    var failures=[];
    for(var i=0;i<flow.length;i++){
      var item=flow[i],button=document.getElementById(item[0]),target=document.getElementById(item[2]);
      if(!button)failures.push(item[0]+" missing");
      if(!target)failures.push(item[2]+" missing");
      if(button&&button.getAttribute("data-pe-front-repair")!=="true")failures.push(item[0]+" unbound");
    }
    var result={version:VERSION,passed:failures.length===0,failures:failures,checkedAt:new Date().toISOString()};
    try{localStorage.setItem("pacificEducationFrontRepairAudit",JSON.stringify(result));}catch(_){ }
    if(failures.length){repairFlowControls();setStatus("Navigation recheck found "+failures.length+" issue(s); recovery attempted.");}
    return result;
  }

  function init(){
    bind();
    try{
      if(!document.body.classList.contains("pe-guided-flow"))showStep(0,"pacificEducationWelcome");
    }catch(_){try{fallbackShowStep(0,"pacificEducationWelcome");}catch(_2){}}
    [250,1000,3000].forEach(function(ms){window.setTimeout(function(){repairFlowControls();recheck();},ms);});
    window.setInterval(function(){repairFlowControls();recheck();},5000);
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})(window,document);
