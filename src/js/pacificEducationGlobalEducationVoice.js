/* Pacific Education — Global Education + Accessibility AI Playback
 * Additive welcome content layered around the protected #856 voice controller.
 * The protected #856 speech controller itself is never replaced by this module.
 */
(function(window, document){
  "use strict";

  var AUSTRALIA_ENGLISH = "en-AU";
  var AUSTRALIA_ENGLISH_MATCH = "en[-_]AU";

  var WELCOME_VOICE_TEXT = "Welcome to Pacific Education. Pacific Education was built on a simple belief: education should not stop when the world faces difficulties. During war, conflict, natural disasters, pandemics, emergencies, displacement, isolation, or other disruptions, learners can lose access to schools, teachers, and learning resources. Pacific Education was created to help keep learning moving forward. It is designed to assist students, teachers, parents, caregivers, schools, and communities across the Pacific and, with the right development and verification, support education globally. Through modern technology, Pacific Education aims to provide learning activities, assessments, progress support, accessibility, and educational assistance wherever learners may be. Technology should support teachers and communities—not replace them.";

  /*
   * The first line is the mandatory welcome voice.
   * The remaining lines are the locked two-person AI Playback conversation.
   * Keeping the complete sequence here lets the protected #856 controller
   * speak the welcome first without modifying the protected controller.
   */
  var GLOBAL_LINES = [
    {speaker:"1",text:WELCOME_VOICE_TEXT},
    {speaker:"1",text:"Why was Pacific Education built?"},
    {speaker:"2",text:"Because education should remain possible even when distance, disasters, emergencies, conflict, or other challenges interrupt normal schooling."},
    {speaker:"1",text:"So is it only for the Pacific?"},
    {speaker:"2",text:"No. It was inspired by the needs of Pacific communities, but its purpose is broader: to develop educational assistance that can help learners and educators around the world."},
    {speaker:"1",text:"And what is the goal?"},
    {speaker:"2",text:"To help learners learn, discover, practise, and grow—and to help teachers, families, schools, and communities keep education moving forward."},
    {speaker:"1",text:"Welcome to Pacific Education."},
    {speaker:"2",text:"Let us learn, discover, practise, and grow together."},
    {speaker:"1",text:"Press Next to begin registration."}
  ];

  GLOBAL_LINES.forEach(function(line){ Object.freeze(line); });
  Object.freeze(GLOBAL_LINES);

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

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",function(){install();}); else install();
  window.addEventListener("load",install);
  window.PacificEducationGlobalEducationVoice={
    version:"1.8.0",
    locale:AUSTRALIA_ENGLISH,
    localeMatch:AUSTRALIA_ENGLISH_MATCH,
    welcomeDelayMs:5000,
    welcomeText:WELCOME_VOICE_TEXT,
    lines:GLOBAL_LINES,
    play:play,
    addWelcomeIntroductionButton:addWelcomeIntroductionButton
  };
})(window,document);
