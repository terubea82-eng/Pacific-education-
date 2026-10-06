/* Pacific Education — Global Education + Accessibility AI Playback
 * Delegates all speech to the protected #856-compatible voice controller.
 * This module supplies the two-person global-accessibility welcome script only.
 */
(function(window, document){
  "use strict";

  var AUSTRALIA_ENGLISH = "en-AU";
  var WELCOME_DELAY_MS = 5000;

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

  function scheduleWelcome(){
    window.setTimeout(function(){
      var active=document.getElementById("pacificEducationWelcome");
      if(active && !active.hidden && !window.__pacificEducationWelcomePlayed){
        window.__pacificEducationWelcomePlayed=true;
        play();
      }
    },WELCOME_DELAY_MS);
  }

  function install(){
    var button=document.getElementById("pacificEducationAIPlaybackButton");
    if(button && button.getAttribute("data-pe-global-play-bound")!=="true"){
      button.setAttribute("data-pe-global-play-bound","true");
      button.addEventListener("click",function(e){e.preventDefault();play();});
    }
    var topPlay=document.querySelector('[data-pe-top-right-voice-controls] button[aria-label="Play audio instructions for this page"]');
    if(topPlay && topPlay.getAttribute("data-pe-global-voice-bound")!=="true"){
      topPlay.setAttribute("data-pe-global-voice-bound","true");
      topPlay.addEventListener("click",function(){
        var active=document.getElementById("pacificEducationWelcome");
        if(active && !active.hidden)play();
      });
    }
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",function(){install();scheduleWelcome();}); else {install();scheduleWelcome();}
  window.addEventListener("load",install);
  window.PacificEducationGlobalEducationVoice={version:"1.3.0",locale:AUSTRALIA_ENGLISH,welcomeDelayMs:WELCOME_DELAY_MS,lines:GLOBAL_LINES,play:play};
})(window,document);
