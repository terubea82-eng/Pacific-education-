/* Pacific Education — Global Education + Accessibility AI Playback
 * Keeps the protected #856 voice engine and changes only the welcome conversation.
 * Focus: global education access and accessibility for learners affected by disruption.
 */
(function(window, document){
  "use strict";

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

  function chooseVoices(){
    if(!window.speechSynthesis || typeof window.speechSynthesis.getVoices !== "function") return {a:null,b:null};
    var voices=(window.speechSynthesis.getVoices()||[]).filter(function(v){return /^en(-|$)/i.test(String(v.lang||""));});
    if(!voices.length) return {a:null,b:null};
    function score(v){
      var s=0,n=String(v.name||""),l=String(v.lang||"");
      if(/^en[-_]AU$/i.test(l)) s+=100;
      if(/natural|neural|enhanced|premium|online|google|microsoft/i.test(n)) s+=20;
      return s;
    }
    voices.sort(function(a,b){return score(b)-score(a);});
    return {a:voices[0]||null,b:voices.find(function(v){return v!==voices[0];})||voices[0]||null};
  }

  function speakConversation(){
    if(!window.speechSynthesis || typeof window.SpeechSynthesisUtterance !== "function"){
      if(window.PacificEducationSpeech && typeof window.PacificEducationSpeech.speakText === "function"){
        window.PacificEducationSpeech.speakText(GLOBAL_LINES[0].text);
      }
      return;
    }
    var synth=window.speechSynthesis,pair=chooseVoices(),i=0;
    try{synth.cancel();if(typeof synth.resume === "function") synth.resume();}catch(_){ }
    function next(){
      if(i>=GLOBAL_LINES.length) return;
      var item=GLOBAL_LINES[i],u=new SpeechSynthesisUtterance(item.text),v=(i%2===0?pair.a:pair.b);
      if(v) u.voice=v;
      u.lang=v&&v.lang?v.lang:"en-AU";
      u.rate=.94;u.pitch=1;u.volume=1;
      u.onstart=function(){var s=document.getElementById("pacificEducationVoiceStatus");if(s)s.textContent="AI Playback: Speaker "+(i%2===0?"1":"2")+" is speaking.";};
      u.onend=function(){i+=1;next();};
      u.onerror=function(){i+=1;next();};
      try{synth.speak(u);if(typeof synth.resume === "function") synth.resume();}catch(_){i+=1;next();}
    }
    next();
  }

  function install(){
    window.__pacificEducationAutoWelcomeVoiceScheduled=true;
    var button=document.getElementById("pacificEducationWelcomeVoiceButton");
    if(button && !button.getAttribute("data-pe-global-voice-bound")){
      var replacement=button.cloneNode(true);
      replacement.setAttribute("data-pe-global-voice-bound","true");
      button.parentNode.replaceChild(replacement,button);
      replacement.addEventListener("click",function(e){e.preventDefault();e.stopImmediatePropagation();speakConversation();},true);
    }
    var topPlay=document.querySelector('[data-pe-top-right-voice-controls] button[aria-label="Play audio instructions for this page"]');
    if(topPlay && !topPlay.getAttribute("data-pe-global-voice-bound")){
      topPlay.setAttribute("data-pe-global-voice-bound","true");
      topPlay.addEventListener("click",function(){
        var active=document.getElementById("pacificEducationWelcome");
        if(active && !active.hidden) speakConversation();
      },true);
    }
    window.setTimeout(function(){
      var welcome=document.getElementById("pacificEducationWelcome");
      if(welcome && !welcome.hidden) speakConversation();
    },5000);
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",install); else install();
  window.addEventListener("load",install);
  window.PacificEducationGlobalEducationVoice={version:"1.1.0",speakGlobalWelcome:speakConversation};
})(window,document);
