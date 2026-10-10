/* Pacific Education — Global Education + Accessibility AI Playback
 * Additive welcome content layered around the protected #856 voice controller.
 * The protected #856 speech controller itself is never replaced by this module.
 */
(function(window, document){
  "use strict";

  var AUSTRALIA_ENGLISH = "en-AU";
  var AUSTRALIA_ENGLISH_MATCH = "en[-_]AU";

  var WELCOME_VOICE_TEXT = "Welcome to Pacific Education. I am Tion Terubea, Owner of Pacific Education. This is the Pacific Education Owner experience and introduction. I bring 21 years of practical classroom teaching experience in Fiji, a small island nation in the South Pacific. That real classroom experience is the foundation of Pacedu: to reduce unnecessary teacher workload, help teachers understand learners better, identify strengths and areas needing development, and turn daily learning into meaningful evidence of progress. Pacedu is built on a simple belief: education should not stop when the world faces difficulties. During war, conflict, natural disasters, pandemics, emergencies, displacement, isolation, or other disruptions, learners can lose access to schools, teachers, and learning resources. Pacific Education was created to help keep learning moving forward. It is designed to assist students, teachers, parents, caregivers, schools, and communities across the Pacific and, with the right development and verification, support education globally. Through modern technology, Pacific Education aims to provide learning activities, assessments, progress support, accessibility, and educational assistance wherever learners may be. Pacific Education also aims to support learners experiencing disability or poverty and to help maintain offline-first learning when connectivity is limited. Technology should support teachers and communities—not replace them.";

  /*
   * SINGLE AUTHORITATIVE MANDATORY WELCOME:
   * Owner introduction + Pacedu explanation + purpose + Next instruction.
   * There are no competing automatic welcome voice messages.
   * The protected #856 controller is preserved.
   */
  var GLOBAL_LINES = [
    {speaker:"1",text:WELCOME_VOICE_TEXT},
    {speaker:"2",text:"Why was Pacific Education built?"},
    {speaker:"1",text:"Because it grew from real classroom experience: teachers need practical support with workload, learners need their skills and needs identified early, and daily activities can provide useful evidence for what should be practised next. Education should also remain possible when distance, disasters, emergencies, conflict, displacement, disability, poverty, or other challenges interrupt normal schooling."},
    {speaker:"2",text:"So is it only for the Pacific?"},
    {speaker:"1",text:"No. It was inspired by the needs of Pacific communities, but its purpose is broader: to develop educational assistance that can help learners and educators around the world."},
    {speaker:"2",text:"And what is the goal?"},
    {speaker:"1",text:"To make education more connected to real life: daily activities help learners learn, discover, practise, and grow while giving teachers practical evidence to guide the next step. The architecture connects daily activities, learner responses, skills and evidence, teacher review, targeted support, progress, and assessment, including offline-first support when connectivity is limited."},
    {speaker:"2",text:"Welcome to Pacific Education."},
    {speaker:"1",text:"Let us learn, discover, practise, and grow together."},
    {speaker:"2",text:"Press Next to continue."}
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
    if(welcome && !welcome.getAttribute("data-pe-welcome-voice-bound") && welcome.getAttribute("data-pe-global-welcome-bound")!=="true"){
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
    version:"2.1.1",
    locale:AUSTRALIA_ENGLISH,
    localeMatch:AUSTRALIA_ENGLISH_MATCH,
    welcomeDelayMs:5000,
    welcomeText:WELCOME_VOICE_TEXT,
    lines:GLOBAL_LINES,
    play:play,
    addWelcomeIntroductionButton:addWelcomeIntroductionButton
  };
})(window,document);
