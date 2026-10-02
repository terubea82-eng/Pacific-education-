/* Pacific Education — Mandated Voice Instruction + Manual Next */
(function(window, document){
  "use strict";
  var nextHref = "../";
  var spokenKey = "pacificEducationMandatoryVoiceInstruction";

  function speak(text){
    try{
      if(window.speakText) return window.speakText(String(text||""));
      if(window.PacificEducationSpeech && window.PacificEducationSpeech.speakText) return window.PacificEducationSpeech.speakText(String(text||""));
    }catch(_){}
    return false;
  }

  function currentGuidedStep(){
    var body=document.body;
    if(!body) return null;
    var n=Number(body.getAttribute("data-pe-flow-step"));
    return Number.isFinite(n) ? n : null;
  }

  function addControl(host, instruction, nextAction){
    if(!host || host.querySelector("[data-pe-mandated-navigation]")) return;
    var wrap=document.createElement("div");
    wrap.setAttribute("data-pe-mandated-navigation","true");
    wrap.style.cssText="display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:12px 0;padding:10px;border:2px solid currentColor;border-radius:8px;";
    var voice=document.createElement("button");
    voice.type="button";
    voice.textContent="🔊 Voice Instruction";
    voice.setAttribute("aria-label","Play voice instruction");
    var next=document.createElement("button");
    next.type="button";
    next.textContent="➡️ Next";
    next.setAttribute("aria-label","Next page or step");
    var status=document.createElement("span");
    status.setAttribute("role","status");
    status.setAttribute("aria-live","polite");
    status.textContent="Voice instruction ready. Manual Next is available.";
    voice.onclick=function(){ if(speak(instruction)){status.textContent="Voice instruction playing."; }else{status.textContent="Voice unavailable. Use the text instruction and Next button."; } };
    next.onclick=function(){ if(typeof nextAction==="function") nextAction(); };
    wrap.appendChild(voice); wrap.appendChild(next); wrap.appendChild(status);
    host.appendChild(wrap);
  }

  function enforceGuided(){
    var step=currentGuidedStep();
    if(step===null) return false;
    var wrapper=document.querySelector(".pacific-flow-next button:not([hidden])");
    if(!wrapper) return false;
    var sectionId=wrapper.closest(".pacific-flow-next") && wrapper.closest(".pacific-flow-next").id;
    var section=document.querySelector('[id$="Selection"],#pacificEducationWelcome,#pacificEducationIdentityRegistration,#prototypeAccess,#dailyLesson,#dailyLessonPracticeStage,#assessments');
    if(section){
      var heading=section.querySelector("h1,h2,h3");
      var text=heading ? heading.textContent.trim() : "this Pacific Education step";
      var instruction="This is "+text+". Follow the written instructions, or use Voice Instruction. When you are ready, press Next.";
      var host=wrapper.closest(".pacific-flow-next").parentElement;
      if(host && !host.querySelector("[data-pe-mandated-navigation]")){
        addControl(host,instruction,function(){ wrapper.click(); });
      }
    }
    return true;
  }

  function enforceStandalone(){
    var path=String(location.pathname||"");
    if(!/pacificEducationCountryCodeRegistration\.html$/.test(path)) return;
    var container=document.querySelector(".container");
    if(!container) return;
    var instruction="Welcome to Pacific Education Country or Territory Registration. This is a pilot information page. Follow the written instructions. During the controlled pilot, do not enter real personal or government contact information.";
    addControl(container,instruction,function(){ location.href="../"; });
    var nav=container.querySelector("[data-pe-mandated-navigation]");
    if(nav){
      var next=nav.querySelector("button[aria-label='Next page or step']");
      if(next) next.textContent="➡️ Next: Pacific Education";
    }
  }

  function init(){
    enforceStandalone();
    enforceGuided();
    var observer=new MutationObserver(function(){ enforceGuided(); });
    if(document.body) observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:["data-pe-flow-step","hidden"]});
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init); else init();
  window.PacificEducationMandatoryVoiceNavigation={speak:speak,enforce:enforceGuided};
})(window,document);
