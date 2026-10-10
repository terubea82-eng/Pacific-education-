/* Pacific Education — compatibility adapter for protected #856 voice module
 * Adds the current UI/test API without changing the protected #856 files.
 * Browser playback remains one utterance at a time; Stop Speech cancels the queue.
 */
(function(window, document){
  "use strict";
  var speech=window.PacificEducationSpeech;
  if(!speech) return;
  if(speech.__compat856Installed) return;

  var queue=[], active=false, selectedIndex=0, voices=[], lastVoiceName="";
  var storageKey="pacificEducationVoiceResume";
  function status(message){
    var node=document.getElementById("pacificEducationVoiceStatus");
    if(node) node.textContent=message;
  }
  function getVoices(){
    try { voices=window.speechSynthesis && window.speechSynthesis.getVoices ? window.speechSynthesis.getVoices()||[] : []; }
    catch(_) { voices=[]; }
    return voices.filter(function(v){return /^en(-|_|$)/i.test(String(v.lang||""));});
  }
  function getEngine(){
    var bridge=window.PacificEducationNativeTTS;
    if(bridge && (typeof bridge.speakConversation==="function" || typeof bridge.speak==="function")) return "native";
    return window.speechSynthesis && typeof window.SpeechSynthesisUtterance==="function" ? "web-speech" : "unavailable";
  }
  function clearSaved(){
    try { if(window.localStorage) window.localStorage.removeItem(storageKey); } catch(_) {}
  }
  function finish(){
    queue=[]; active=false; clearSaved();
    status("AI Playback conversation complete.");
  }
  function next(){
    if(!active) return;
    if(!queue.length){finish();return;}
    var item=queue.shift(), synth=window.speechSynthesis;
    try{
      var english=getVoices();
      var voice=null;
      // Prefer a voice different from the previous utterance. Do not rely only
      // on speaker labels or array parity: some browsers reorder voice lists.
      if(english.length){
        var preferred=english[selectedIndex % english.length];
        if(preferred && String(preferred.name||"")!==lastVoiceName) voice=preferred;
        if(!voice && english.length>1){
          voice=english.find(function(candidate){
            return String(candidate.name||"")!==lastVoiceName;
          })||null;
        }
        if(!voice) voice=preferred||english[0];
        lastVoiceName=String(voice.name||"");
      }
      selectedIndex++;
      var utterance=new window.SpeechSynthesisUtterance(item.text);
      if(voice) utterance.voice=voice;
      utterance.lang=voice&&voice.lang?voice.lang:"en-AU";
      utterance.rate=0.95; utterance.pitch=1; utterance.volume=1;
      utterance.onstart=function(){status("AI Playback: Speaker "+(item.speaker||"1")+" is speaking.");};
      utterance.onend=function(){next();};
      utterance.onerror=function(event){
        active=false; queue=[]; clearSaved();
        status("Voice error: "+((event&&event.error)||"speech unavailable")+".");
      };
      synth.speak(utterance);
      if(typeof synth.resume==="function") synth.resume();
    }catch(error){
      active=false; queue=[]; clearSaved();
      status("Voice error: speech could not start.");
      console.warn("Pacedu #856 compatibility playback failed:",error);
    }
  }
  function speakConversation(lines, done){
    lines=Array.isArray(lines)?lines.filter(function(x){return x&&String(x.text||"").trim();}).map(function(x){return {speaker:String(x.speaker||"1"),text:String(x.text).trim()};}):[];
    if(!lines.length) return false;
    var engine=getEngine();
    if(engine==="unavailable"){
      status("Voice engine unavailable in this browser or device.");
      return false;
    }
    // Use Android's existing native conversation bridge when it is present.
    var bridge=window.PacificEducationNativeTTS;
    if(engine==="native" && bridge && typeof bridge.speakConversation==="function"){
      try{
        var nativeOK=bridge.speakConversation(JSON.stringify(lines));
        if(nativeOK){status("AI Playback: native Android voice active.");return true;}
      }catch(error){console.warn("Pacedu native voice bridge unavailable; trying browser speech.",error);}
    }
    if(!window.speechSynthesis || typeof window.SpeechSynthesisUtterance!=="function"){
      status("Voice engine unavailable in this browser or device.");
      return false;
    }
    try{window.speechSynthesis.cancel();}catch(_){}
    queue=lines.slice(); active=true; selectedIndex=0; lastVoiceName="";
    try{if(window.localStorage)window.localStorage.setItem(storageKey,JSON.stringify({lines:queue,startedAt:Date.now()}));}catch(_){}
    next();
    return true;
  }
  var originalStop=speech.stopSpeech;
  speech.getEngine=getEngine;
  speech.speakConversation=speakConversation;
  speech.stopSpeech=function(){
    active=false; queue=[];
    clearSaved();
    try{if(typeof originalStop==="function")originalStop();else if(window.speechSynthesis)window.speechSynthesis.cancel();}catch(_){}
    status("Voice stopped.");
  };
  speech.__compat856Installed=true;
  speech.__compat856Version="1.0.0";
  if(window.speechSynthesis && typeof window.speechSynthesis.addEventListener==="function"){
    window.speechSynthesis.addEventListener("voiceschanged",getVoices);
  }
})(window,document);
