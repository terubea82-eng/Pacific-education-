/* Pacific Education — Speech Voice Controller v1024 — reliable English voice + reopen resume */
(function (window) {
  "use strict";

  var selectedVoice = null;
  var pendingText = "";
  var lastSpokenText = "";
  var lastSpokenAt = 0;
  var speechGeneration = 0;
  var conversationGeneration = 0;
  var lastConversationSignature = "";
  var lastConversationAt = 0;
  var speechUnlocked = false;
  var resumeRetryTimer = null;
  var resumeAttempted = false;
  var persistedConversationKey = "pacificEducationVoiceResume";
  var persistedConversation = null;
  var platform = (function(){
    var ua = String(navigator && navigator.userAgent || "");
    if (/Android/i.test(ua)) return "android";
    if (/iPad|iPhone|iPod/i.test(ua)) return "ios";
    if (/Macintosh|Mac OS X/i.test(ua)) return "macos";
    if (/Windows/i.test(ua)) return "windows";
    if (/CrOS/i.test(ua)) return "chromeos";
    return "web";
  })();

  function setVoiceStatus(message) {
    try { var status = document.getElementById("pacificEducationVoiceStatus"); if (status) status.textContent = message; } catch (_) {}
  }

  function loadPersistedConversation() {
    try {
      var raw = window.localStorage.getItem(persistedConversationKey);
      persistedConversation = raw ? JSON.parse(raw) : null;
      if (!persistedConversation || !Array.isArray(persistedConversation.lines) || persistedConversation.index < 0 || persistedConversation.index >= persistedConversation.lines.length) {
        persistedConversation = null;
        window.localStorage.removeItem(persistedConversationKey);
      } else {
        persistedConversation.charOffset = Math.max(0, Number(persistedConversation.charOffset) || 0);
        persistedConversation.state = String(persistedConversation.state || "paused");
      }
    } catch (_) { persistedConversation = null; }
    return persistedConversation;
  }

  function savePersistedConversation(lines, index, charOffset, state) {
    try {
      var safeLines = (Array.isArray(lines) ? lines : []).map(function(item){ return {speaker:String(item && item.speaker || ""), text:String(item && item.text || "")}; });
      if (!safeLines.length || index >= safeLines.length) { window.localStorage.removeItem(persistedConversationKey); persistedConversation = null; return; }
      var safeIndex = Math.max(0, Number(index) || 0), safeOffset = Math.max(0, Number(charOffset) || 0);
      if (safeIndex < safeLines.length) safeOffset = Math.min(safeOffset, safeLines[safeIndex].text.length);
      persistedConversation = {lines:safeLines,index:safeIndex,charOffset:safeOffset,state:String(state || "paused"),savedAt:Date.now()};
      window.localStorage.setItem(persistedConversationKey, JSON.stringify(persistedConversation));
    } catch (_) {}
  }

  function clearPersistedConversation() {
    try { window.localStorage.removeItem(persistedConversationKey); } catch (_) {}
    persistedConversation = null;
  }

  function nativeSpeak(text) {
    var bridge = window.PacificEducationNativeTTS;
    if (!bridge || typeof bridge.speak !== "function") return false;
    try { var ok = bridge.speak(String(text || "")); if (ok) { pendingText=""; setVoiceStatus("Voice playing."); return true; } } catch (error) { console.warn("Pacific Education native TTS failed:", error); }
    return false;
  }

  function speakText(text, options) {
    text=String(text||"").trim(); if(!text) return false; options=options||{};
    var now=Date.now(); if(!options.allowRepeat && text===lastSpokenText && now-lastSpokenAt<8000) return false;
    lastSpokenText=text; lastSpokenAt=now; speechGeneration+=1; var generation=speechGeneration;
    if(nativeSpeak(text)) return true;
    if(!window.speechSynthesis || typeof window.SpeechSynthesisUtterance!=="function") { setVoiceStatus("Voice engine unavailable in this browser or device."); return false; }
    pendingText=text; var synth=window.speechSynthesis;
    try { synth.cancel(); if(typeof synth.resume==="function") synth.resume(); } catch(_){ }
    try {
      var currentVoice=chooseVoice(), utterance=new window.SpeechSynthesisUtterance(text);
      if(currentVoice) utterance.voice=currentVoice;
      utterance.lang=currentVoice&&currentVoice.lang?currentVoice.lang:"en-AU"; utterance.rate=.95; utterance.pitch=1; utterance.volume=1;
      utterance.onstart=function(){pendingText=text;setVoiceStatus("Voice playing.");};
      utterance.onend=function(){if(generation!==speechGeneration)return;pendingText="";setVoiceStatus("Voice ready.");};
      utterance.onerror=function(event){var code=event&&event.error;console.warn("Pacific Education speech error:",code);if(code==="not-allowed"||code==="synthesis-unavailable"||code==="voice-unavailable"){pendingText=text;speechUnlocked=false;setVoiceStatus("Voice waiting for first tap. Tap Hear Welcome.");return;}pendingText="";};
      synth.speak(utterance); if(typeof synth.resume==="function") synth.resume(); return true;
    } catch(error){pendingText=text;setVoiceStatus("Voice waiting for first tap. Tap Hear Welcome.");return false;}
  }

  function stopSpeech(){speechGeneration+=1;conversationGeneration+=1;clearPersistedConversation();pendingText="";try{if(window.PacificEducationNativeTTS&&typeof window.PacificEducationNativeTTS.stop==="function")window.PacificEducationNativeTTS.stop();}catch(_){ }try{if(window.speechSynthesis)window.speechSynthesis.cancel();}catch(_){ }setVoiceStatus("Voice stopped.");}

  function retryPendingSpeech(){chooseVoice();if(pendingText&&!window.speechSynthesis.speaking&&(speechUnlocked||window.PacificEducationNativeTTS)){var text=pendingText;pendingText="";speakText(text,{allowRepeat:true});}}

  function unlockSpeechOnInteraction(){
    try {
      if(window.speechSynthesis&&typeof window.speechSynthesis.resume==="function")window.speechSynthesis.resume();
      speechUnlocked=true;
      if(pendingText){var queued=pendingText;pendingText="";speakText(queued,{allowRepeat:true});}
      else { resumeVoiceAfterReopen(true); }
    } catch(error){console.warn("Pacific Education speech unlock deferred:",error);}
  }

  ["pointerdown","touchstart","keydown"].forEach(function(eventName){document.addEventListener(eventName,unlockSpeechOnInteraction,{once:true,capture:true,passive:true});});

  function refreshVoiceSelection(){chooseVoice();if(selectedVoice)setVoiceStatus("English voice ready. Tap Hear Welcome.");else if(window.speechSynthesis)setVoiceStatus("Browser voice engine ready. Tap Hear Welcome.");}

  function chooseConversationVoices(){
    if(!window.speechSynthesis||typeof window.speechSynthesis.getVoices!=="function")return{a:null,b:null};
    var voices=window.speechSynthesis.getVoices()||[],english=voices.filter(function(v){return/^en(-|$)/i.test(String(v.lang||""));});
    if(!english.length)return{a:null,b:null};
    function rank(v){var score=0;if(/^en[-_]AU$/i.test(String(v.lang||"")))score+=100;if(/(?:natural|neural|enhanced|premium|online|google|microsoft)/i.test(String(v.name||"")))score+=20;return score;}
    english.sort(function(a,b){return rank(b)-rank(a);}); var a=english[0]||null,b=english.find(function(v){return v!==a;})||a; return{a:a,b:b};
  }

  function speakConversation(lines,done){
    lines=Array.isArray(lines)?lines:[];if(!lines.length){if(done)done();return false;}
    var signature=lines.map(function(item){return String(item&&item.text||"");}).join("\u0001"),now=Date.now();
    if(signature===lastConversationSignature&&now-lastConversationAt<8000)return false;
    lastConversationSignature=signature;lastConversationAt=now;conversationGeneration+=1;var conversationRun=conversationGeneration;speechGeneration+=1;var runGeneration=speechGeneration;
    if(!window.speechSynthesis||typeof window.SpeechSynthesisUtterance!=="function"){
      if(window.PacificEducationNativeTTS&&typeof window.PacificEducationNativeTTS.speak==="function"){var ni=0;(function nativeNext(){if(ni>=lines.length){clearPersistedConversation();if(done)done();return;}try{window.PacificEducationNativeTTS.speak(String(lines[ni++].text||""));setTimeout(nativeNext,3200);}catch(_){if(done)done();}})();return true;}
      setVoiceStatus("Two-person AI playback requires a speech engine.");return false;
    }
    var synth=window.speechSynthesis,pair=chooseConversationVoices(),index=0,charOffset=0,saved=loadPersistedConversation();
    if(saved&&saved.lines.map(function(item){return String(item.text||"");}).join("\u0001")===signature){index=Math.max(0,Math.min(Number(saved.index)||0,lines.length-1));charOffset=Math.max(0,Number(saved.charOffset)||0);charOffset=Math.min(charOffset,String(lines[index].text||"").length);setVoiceStatus(charOffset>0?"Restoring AI Playback from the saved position.":"Restoring AI Playback from the saved sentence.");}else clearPersistedConversation();
    try{synth.cancel();if(typeof synth.resume==="function")synth.resume();}catch(_){ }
    function next(){
      if(conversationRun!==conversationGeneration||runGeneration!==speechGeneration)return;
      if(index>=lines.length){clearPersistedConversation();setVoiceStatus("AI Playback conversation complete.");if(done)done();return;}
      var fullText=String(lines[index].text||""),offsetForLine=charOffset,remainingText=offsetForLine>0?fullText.slice(offsetForLine):fullText;
      if(!remainingText.trim()){index+=1;charOffset=0;if(index<lines.length)savePersistedConversation(lines,index,0,"paused");next();return;}
      savePersistedConversation(lines,index,offsetForLine,"speaking");var u=new window.SpeechSynthesisUtterance(remainingText),v=(index%2===0?pair.a:pair.b);if(v)u.voice=v;u.lang=v&&v.lang?v.lang:"en-AU";u.rate=.94;u.pitch=1;u.volume=1;
      u.onstart=function(){savePersistedConversation(lines,index,offsetForLine,"speaking");setVoiceStatus("AI Playback: "+(index%2===0?"Speaker 1":"Speaker 2")+" is speaking.");};
      u.onboundary=function(event){if(conversationRun!==conversationGeneration||runGeneration!==speechGeneration)return;var boundary=Number(event&&event.charIndex);if(!isFinite(boundary)||boundary<0)return;charOffset=Math.min(fullText.length,offsetForLine+boundary);savePersistedConversation(lines,index,charOffset,"speaking");};
      u.onend=function(){if(conversationRun!==conversationGeneration||runGeneration!==speechGeneration)return;index+=1;charOffset=0;if(index<lines.length)savePersistedConversation(lines,index,0,"paused");next();};
      u.onerror=function(event){if(conversationRun!==conversationGeneration||runGeneration!==speechGeneration)return;savePersistedConversation(lines,index,charOffset,"paused");setVoiceStatus("Voice paused. Restoring from the saved position.");};
      try{synth.speak(u);if(typeof synth.resume==="function")synth.resume();}catch(_){savePersistedConversation(lines,index,charOffset,"paused");setVoiceStatus("Voice paused. Restoring from the saved position.");}
    }
    next();return true;
  }

  function welcomeConversation(){return[
    {speaker:"1",text:"Welcome to Pacific Education. We are pleased to welcome you."},
    {speaker:"2",text:"Pacific Education supports learners, teachers, parents and education communities with clear, accessible and structured learning."},
    {speaker:"1",text:"What is Pacific Education designed to do?"},
    {speaker:"2",text:"It connects daily learning activities, educational content, practice, assessment and progress so learners can build knowledge step by step."},
    {speaker:"1",text:"Why is that important across the Pacific?"},
    {speaker:"2",text:"It helps make quality and accessible learning more connected for Pacific communities and supports teachers and families in guiding learners."},
    {speaker:"1",text:"What can learners do here?"},
    {speaker:"2",text:"Learn, discover, practise and grow with us."}
  ];}

  function resumeVoiceAfterReopen(fromInteraction){
    var saved=loadPersistedConversation();if(!saved||!saved.lines||!saved.lines.length)return false;
    if(resumeAttempted&&!fromInteraction)return true;
    resumeAttempted=true;
    if(resumeRetryTimer){clearTimeout(resumeRetryTimer);resumeRetryTimer=null;}
    try{if(window.speechSynthesis&&typeof window.speechSynthesis.resume==="function")window.speechSynthesis.resume();}catch(_){ }
    var started=speakConversation(saved.lines,function(){setVoiceStatus("AI Playback complete. Welcome to Pacific Education.");});
    if(!started){setVoiceStatus(fromInteraction?"Restoring AI Playback now.":"AI Playback saved. Restoring voice now.");return false;}
    return true;
  }

  function scheduleAutomaticWelcomeVoice(){
    if(window.__pacificEducationAutoWelcomeVoiceScheduled)return;
    window.__pacificEducationAutoWelcomeVoiceScheduled=true;
    var saved=loadPersistedConversation();
    window.setTimeout(function(){
      if(saved){
        resumeVoiceAfterReopen(false);
        if(!loadPersistedConversation())return;
        resumeRetryTimer=window.setTimeout(function(){if(!window.speechSynthesis||!window.speechSynthesis.speaking)resumeVoiceAfterReopen(false);},1400);
        return;
      }
      var started=speakConversation(welcomeConversation(),function(){setVoiceStatus("AI Playback complete. Welcome to Pacific Education.");});
      if(!started)window.setTimeout(function(){if(!loadPersistedConversation())speakConversation(welcomeConversation());},1200);
    },5000);
  }

  function bindVoiceButtons(){
    var welcome=document.getElementById("pacificEducationWelcomeVoiceButton"),stop=document.getElementById("pacificEducationStopSpeechButton");
    if(welcome&&welcome.getAttribute("data-pe-welcome-voice-bound")!=="true"){
      welcome.setAttribute("data-pe-welcome-voice-bound","true");welcome.addEventListener("click",function(event){if(event)event.preventDefault();speechUnlocked=true;resumeAttempted=false;speakConversation([
        {speaker:"1",text:"Welcome to Pacific Education. We are pleased to welcome you."},{speaker:"2",text:"Thank you. Pacific Education supports learners, teachers, parents and education communities with clear, accessible and structured learning."},{speaker:"1",text:"What is Pacific Education designed to do?"},{speaker:"2",text:"It connects daily learning activities, educational content, practice, assessment and progress so learners can build knowledge step by step."},{speaker:"1",text:"Why is that important across the Pacific?"},{speaker:"2",text:"It helps make quality and accessible learning more connected for Pacific communities and supports teachers and families in guiding learners."},{speaker:"1",text:"What can learners do here?"},{speaker:"2",text:"Learn, discover, practise and grow with us."}
      ]);return false;});
    }
    if(stop&&stop.getAttribute("data-pe-stop-voice-bound")!=="true"){stop.setAttribute("data-pe-stop-voice-bound","true");stop.addEventListener("click",function(event){if(event)event.preventDefault();stopSpeech();return false;});}
  }

  window.addEventListener("pagehide",function(){try{var active=loadPersistedConversation();if(active)savePersistedConversation(active.lines,active.index,active.charOffset,"paused");}catch(_){ }});
  window.addEventListener("pageshow",function(){if(document.visibilityState!=="hidden")window.setTimeout(function(){resumeVoiceAfterReopen(false);},300);});
  document.addEventListener("visibilitychange",function(){if(document.visibilityState==="visible")window.setTimeout(function(){resumeVoiceAfterReopen(false);},300);});

  window.PacificEducationSpeech={getPlatform:function(){return platform;},getEngine:function(){if(window.PacificEducationNativeTTS&&typeof window.PacificEducationNativeTTS.speak==="function")return"native";if(window.speechSynthesis)return"web-speech";return"unavailable";},chooseVoice:chooseVoice,speakText:speakText,stopSpeech:stopSpeech,getSelectedVoice:function(){return selectedVoice;}};
  window.speakText=speakText;
  if(window.speechSynthesis&&typeof window.speechSynthesis.addEventListener==="function")window.speechSynthesis.addEventListener("voiceschanged",retryPendingSpeech);
  bindVoiceButtons();
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){bindVoiceButtons();scheduleAutomaticWelcomeVoice();});else setTimeout(function(){bindVoiceButtons();scheduleAutomaticWelcomeVoice();},0);
  chooseVoice();setTimeout(refreshVoiceSelection,250);setTimeout(refreshVoiceSelection,1000);
})(window);
