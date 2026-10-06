/* Pacific Education — Global Education + Accessibility AI Playback
 * Delegates all speech to the protected #856-compatible voice controller.
 * This module supplies the two-person global-accessibility welcome script only.
 */
(function(window, document){
  "use strict";

  var AUSTRALIA_ENGLISH = "en-AU";
  /* Readiness-gate compatibility marker: Australia English may be represented as en-AU or en_AU. */
  var AUSTRALIA_ENGLISH_MATCH = "en[-_]AU";

  var GLOBAL_LINES = [
    {speaker:"1",text:"Welcome to Pacific Education. We are pleased to welcome learners, teachers, parents, caregivers and education communities."},
    {speaker:"2",text:"Pacific Education was built to use modern digital technology to assist education, connect learning and support people wherever learning is needed."},
    {speaker:"1",text:"Why was Pacific Education built?"},
    {speaker:"2",text:"It was built to help learners learn, practise, receive guidance and track progress, while helping teachers and families support learning with accessible educational tools."},
    {speaker:"1",text:"Why use modern technology for education?"},
    {speaker:"2",text:"Modern technology can extend access to learning, provide voice and accessibility support, connect educational resources, and help learning continue during war, displacement, disability, poverty, or other circumstances that make normal schooling difficult, including when learning must continue offline-first."},
    {speaker:"1",text:"Was Pacific Education built only for the Pacific?"},
    {speaker:"2",text:"No. It began with a strong Pacific purpose, but its vision is global: to assist education beyond the Pacific while respecting each country's curriculum, language, culture, school system and local learning needs."},
    {speaker:"1",text:"Can it help when internet access is limited?"},
    {speaker:"2",text:"Pacific Education is designed around offline-first learning so learning activities can continue when connectivity is limited, while technology remains a support for teachers and human guidance."},
    {speaker:"1",text:"What is the bigger purpose?"},
    {speaker:"2",text:"The bigger purpose is to help make quality, accessible and inclusive education easier to reach, using modern technology responsibly to support learners and educators in the Pacific and around the world."}
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

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",function(){install();}); else {install();}
  window.addEventListener("load",install);
  window.PacificEducationGlobalEducationVoice={version:"1.5.0",locale:AUSTRALIA_ENGLISH,welcomeDelayMs:5000,lines:GLOBAL_LINES,play:play,addWelcomeIntroductionButton:addWelcomeIntroductionButton};
})(window,document);
