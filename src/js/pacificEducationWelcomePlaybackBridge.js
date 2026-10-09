/* Additive welcome playback bridge. Keeps the protected #856 speech engine unchanged. */
(function(window, document){
  "use strict";
  var fallbackLines = [
    {speaker:"1", text:"Welcome to Pacific Education. We are pleased to welcome you."},
    {speaker:"2", text:"Pacific Education supports learners, teachers, parents and education communities with clear, accessible and structured learning."},
    {speaker:"1", text:"What is Pacific Education designed to do?"},
    {speaker:"2", text:"It connects daily learning activities, educational content, practice, assessment and progress so learners can build knowledge step by step."},
    {speaker:"1", text:"Why is that important across the Pacific?"},
    {speaker:"2", text:"It helps make quality and accessible learning more connected for Pacific communities and supports teachers and families in guiding learners."},
    {speaker:"1", text:"What can learners do here?"},
    {speaker:"2", text:"Learn, discover, practise and grow with us."}
  ];
  function lines(){
    var globalVoice = window.PacificEducationGlobalEducationVoice;
    return globalVoice && Array.isArray(globalVoice.lines) && globalVoice.lines.length
      ? globalVoice.lines : fallbackLines;
  }
  function bind(){
    var button = document.getElementById("pacificEducationAIPlaybackButton");
    if(!button || button.getAttribute("data-pe-ai-playback-bridge")==="true") return !!button;
    button.setAttribute("data-pe-ai-playback-bridge","true");
    button.addEventListener("click", function(event){
      if(event) event.preventDefault();
      var voice = window.PacificEducationSpeech;
      if(voice && typeof voice.speakConversation==="function"){
        var started = voice.speakConversation(lines());
        var status = document.getElementById("pacificEducationVoiceStatus");
        if(!started && status) status.textContent = "If automatic playback was blocked, tap Hear Welcome & Introduction once to allow speech.";
      } else if(typeof window.speakText==="function"){
        window.speakText("Welcome to Pacific Education. Please tap Hear Welcome and Introduction to start the two-person AI playback.");
      } else {
        var statusFallback = document.getElementById("pacificEducationVoiceStatus");
        if(statusFallback) statusFallback.textContent = "Voice engine unavailable. Please check this device's speech settings.";
      }
      return false;
    });
    return true;
  }
  function init(){
    bind();
    var attempts=0;
    var timer=window.setInterval(function(){
      if(bind() || ++attempts>=40) window.clearInterval(timer);
    },250);
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init);
  else init();
  window.addEventListener("load",bind);
})(window);
