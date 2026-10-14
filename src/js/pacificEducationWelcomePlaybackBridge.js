/* Additive welcome playback bridge. Keeps the protected #856 speech engine unchanged. */
(function(window, document){
  "use strict";
  var WELCOME_TEXT = "Welcome to Pacific Education. I am Tion Terubea, Owner of Pacific Education. This is the Pacific Education Owner experience and introduction. I bring 21 years of practical classroom teaching experience in Fiji, a small island nation in the South Pacific. That real classroom experience is the foundation of Pacedu: to reduce unnecessary teacher workload, help teachers understand learners better, identify strengths and areas needing development, and turn daily learning into meaningful evidence of progress. Pacedu is built on a simple belief: education should not stop when the world faces difficulties. During war, conflict, natural disasters, pandemics, emergencies, displacement, isolation, or other disruptions, learners can lose access to schools, teachers, and learning resources. Pacific Education was created to help keep learning moving forward. It is designed to assist students, teachers, parents, caregivers, schools, and communities across the Pacific and, with the right development and verification, support education globally. Through modern technology, Pacific Education aims to provide learning activities, assessments, progress support, accessibility, and educational assistance wherever learners may be. Pacific Education also aims to support learners experiencing disability or poverty and to help maintain offline-first learning when connectivity is limited. Technology should support teachers and communities—not replace them.";
  var LINES = [
    {speaker:"1",text:WELCOME_TEXT},
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
  var automaticStarted=false, userStarted=false, automaticTimer=null;
  function play(){
    var voice=window.PacificEducationSpeech;
    if(voice && typeof voice.speakConversation==="function") return voice.speakConversation(LINES);
    var status=document.getElementById("pacificEducationVoiceStatus");
    if(status)status.textContent="AI Playback is loading. Please try Play again.";
    return false;
  }
  function bind(){
    var button=document.getElementById("pacificEducationAIPlaybackButton");
    if(!button || button.getAttribute("data-pe-ai-playback-bridge")==="true") return !!button;
    button.setAttribute("data-pe-ai-playback-bridge","true");
    button.addEventListener("click",function(event){
      if(event)event.preventDefault();
      userStarted=true; window.__pacificEducationWelcomePlayed=true;
      play();
    });
    return true;
  }
  function scheduleAutomaticWelcome(){
    if(automaticStarted || userStarted || window.__pacificEducationAutoWelcomeVoiceScheduled===false) return;
    automaticStarted=true;
    automaticTimer=window.setTimeout(function(){
      if(userStarted || window.__pacificEducationWelcomePlayed) return;
      var welcome=document.getElementById("pacificEducationWelcome");
      if(welcome && (welcome.hidden || (window.getComputedStyle && window.getComputedStyle(welcome).display==="none"))) return;
      window.__pacificEducationWelcomePlayed=true;
      play();
    },5000);
  }
  function init(){
    bind();
    scheduleAutomaticWelcome();
    var attempts=0;
    var timer=window.setInterval(function(){
      if(bind() || ++attempts>=40) window.clearInterval(timer);
    },250);
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);
  else init();
  window.addEventListener("load",function(){bind();scheduleAutomaticWelcome();});
  window.PacificEducationWelcomePlaybackBridge={version:"2.0.0",play:play,lines:LINES};
})(window,document);
