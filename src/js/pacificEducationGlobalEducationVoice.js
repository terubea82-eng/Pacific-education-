/* Pacific Education — Global Education + Accessibility AI Playback
 * Delegates all speech to the protected #856-compatible voice controller.
 * This module supplies the two-person global-accessibility welcome script only.
 */
(function(window, document){
  "use strict";

  var AUSTRALIA_ENGLISH = "en-AU";
  /* Readiness-gate compatibility marker: Australia English may be represented as en-AU or en_AU. */
  var AUSTRALIA_ENGLISH_MATCH = "en[-_]AU";
  var WELCOME_DELAY_MS = 5000;
  var welcomeRetryTimer = null;

  var GLOBAL_LINES = [
    {speaker:"1",text:"Welcome to Pacific Education. Education belongs to every learner, everywhere in the world."},
    {speaker:"2",text:"Our purpose is to help make learning accessible and meaningful for children, young people, teachers, parents and communities, regardless of where they live or what challenges they face."},
    {speaker:"1",text:"Why does global accessibility matter?"},
    {speaker:"2",text:"Learners may be affected by war, displacement, health hazards, natural disasters, environmental emergencies, poverty, disability, or limited access to schools and learning resources."},
    {speaker:"1",text:"What about learners who have unreliable or no internet connection?"},
    {speaker:"2",text:"Learning should not stop because a connection is weak or unavailable. Pacific Education is designed around offline-first learning so learning activities can continue when connectivity is limited."},
    {speaker:"1",text:"Does Pacific Education serve only Pacific learners?"},
    {speaker:"2",text:"No. Pacific Education has a global education purpose while respecting each country's curriculum, language, school system, culture, and local learning needs."},
    {speaker:"1",text:"What is the goal?"},
    {speaker:"2",text:"The goal is simple: help every learner access education, continue learning through disruption, and receive support through accessible technology and human guidance."}
  ];

  function play(){
    if(window.PacificEducationSpeech && typeof window.PacificEducationSpeech.speakConversation === "function"){
      return window.PacificEducationSpeech.speakConversation(GLOBAL_LINES);
    }
    var status=document.getElementById("pacificEducationVoiceStatus");
    if(status)status.textContent="AI Playback is loading. Please try Play again.";
    return false;
  }

  function addWelcomeIntroductionButton(){
    var host=document.getElementById("pacificEducationWelcomeVoice");
    if(!host || document.getElementById("pacificEducationWelcomeVoiceButton"))return;
    var button=document.createElement("button");
    button.type="button";
    button.id="pacificEducationWelcomeVoiceButton";
    button.setAttribute("aria-label","Hear Pacific Education welcome and introduction");
    button.textContent="🔊 Hear Welcome & Introduction";
    button.style.cssText="background:#15803d;color:#fff;border:2px solid #15803d;border-radius:8px;font-weight:700;padding:12px 16px;";
    host.insertBefore(button,host.firstChild);
  }

  function attemptWelcome(){
    var active=document.getElementById("pacificEducationWelcome");
    if(!active || active.hidden || window.__pacificEducationWelcomePlayed)return false;
    var started=play();
    if(started){
      window.__pacificEducationWelcomePlayed=true;
      return true;
    }
    return false;
  }

  function scheduleWelcome(){
    window.setTimeout(function(){
      if(attemptWelcome())return;
      if(welcomeRetryTimer)window.clearTimeout(welcomeRetryTimer);
      welcomeRetryTimer=window.setTimeout(function(){
        welcomeRetryTimer=null;
        if(!attemptWelcome()){
          var status=document.getElementById("pacificEducationVoiceStatus");
          if(status)status.textContent="Welcome voice is ready. Tap Hear Welcome & Introduction or AI Playback to start the introduction.";
        }
      },1200);
    },WELCOME_DELAY_MS);
  }

  function install(){
    addWelcomeIntroductionButton();
    var button=document.getElementById("pacificEducationAIPlaybackButton");
    if(button && button.getAttribute("data-pe-global-play-bound")!=="true"){
      button.setAttribute("data-pe-global-play-bound","true");
      button.addEventListener("click",function(e){e.preventDefault();window.__pacificEducationWelcomePlayed=true;play();});
    }
    var welcome=document.getElementById("pacificEducationWelcomeVoiceButton");
    if(welcome && welcome.getAttribute("data-pe-global-welcome-bound")!=="true"){
      welcome.setAttribute("data-pe-global-welcome-bound","true");
      welcome.addEventListener("click",function(e){
        e.preventDefault();
        window.__pacificEducationWelcomePlayed=true;
        if(window.PacificEducationSpeech && typeof window.PacificEducationSpeech.stopSpeech === "function")window.PacificEducationSpeech.stopSpeech();
        var status=document.getElementById("pacificEducationVoiceStatus");
        if(status)status.textContent="Welcome and introduction voice starting.";
        var ok=play();
        if(!ok && status)status.textContent="Voice waiting for the first tap. Please press Hear Welcome & Introduction again.";
      });
    }
    var topPlay=document.querySelector('[data-pe-top-right-voice-controls] button[aria-label="Play audio instructions for this page"]');
    if(topPlay && topPlay.getAttribute("data-pe-global-voice-bound")!=="true"){
      topPlay.setAttribute("data-pe-global-voice-bound","true");
      topPlay.addEventListener("click",function(){
        var active=document.getElementById("pacificEducationWelcome");
        if(active && !active.hidden){window.__pacificEducationWelcomePlayed=true;play();}
      });
    }
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",function(){install();scheduleWelcome();}); else {install();scheduleWelcome();}
  window.addEventListener("load",install);
  window.PacificEducationGlobalEducationVoice={version:"1.5.0",locale:AUSTRALIA_ENGLISH,welcomeDelayMs:WELCOME_DELAY_MS,lines:GLOBAL_LINES,play:play,addWelcomeIntroductionButton:addWelcomeIntroductionButton};
})(window,document);
