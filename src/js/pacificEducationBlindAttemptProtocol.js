/* Pacific Education — Blind Learner Listen / Confirm / Report Protocol
 * Pilot-safe accessibility layer. Preserves the protected #856 speech controller.
 * Design: Listen -> Capture exact speech -> Read back -> Confirm/Change -> Record -> Report.
 */
(function(window, document){
  "use strict";

  var VERSION = "1.0.0-blind-confirmed-attempts";
  var AUDIT_KEY = "pacificEducationBlindAttemptAuditV1";
  var Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  var active = {type:null, day:0, question:"", recognition:null, mediaRecorder:null, chunks:[], transcript:"", awaiting:false};

  function speak(text, allowRepeat){
    text=String(text||"").trim(); if(!text) return false;
    try{
      if(window.PacificEducationSpeech && typeof window.PacificEducationSpeech.speakText==="function")
        return window.PacificEducationSpeech.speakText(text,{allowRepeat:!!allowRepeat});
    }catch(e){}
    return false;
  }
  function role(){
    try{
      var r=sessionStorage.getItem("pacificEducationActiveRole");
      if(r)return String(r).toLowerCase();
      var p=JSON.parse(sessionStorage.getItem("pacificEducationPilotRegistration")||"null");
      return String(p&&p.role||"").toLowerCase();
    }catch(e){return "";}
  }
  function readAudit(){
    try{return JSON.parse(localStorage.getItem(AUDIT_KEY)||"[]")||[];}catch(e){return [];}
  }
  function writeAudit(item){
    var a=readAudit(); a.push(item); if(a.length>500)a=a.slice(-500);
    try{localStorage.setItem(AUDIT_KEY,JSON.stringify(a));}catch(e){}
  }
  function esc(v){return String(v==null?"":v).replace(/[&<>"']/g,function(c){return({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]);});}
  function status(text){
    var el=document.getElementById("peBlindAttemptStatus"); if(el)el.textContent=text;
  }
  function announce(text){
    status(text); speak(text,true);
  }
  function contextKey(){
    return [active.day,localStorage.getItem("pacificEducationSubject")||"",localStorage.getItem("pacificEducationTerm")||""].join("|");
  }
  function setBusy(b){
    var btn=document.getElementById("peBlindListenAnswer"); if(btn)btn.disabled=!!b;
    var confirm=document.getElementById("peBlindConfirm"); if(confirm)confirm.disabled=!active.awaiting;
    var change=document.getElementById("peBlindChange"); if(change)change.disabled=!active.awaiting;
  }
  function stopMedia(){
    try{if(active.mediaRecorder&&active.mediaRecorder.state==="recording")active.mediaRecorder.stop();}catch(e){}
    active.mediaRecorder=null; active.chunks=[];
  }
  function beginMedia(){
    if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia||!window.MediaRecorder)return Promise.resolve(null);
    return navigator.mediaDevices.getUserMedia({audio:true}).then(function(stream){
      var recorder=new MediaRecorder(stream), chunks=[];
      recorder.ondataavailable=function(e){if(e.data&&e.data.size)chunks.push(e.data);};
      active.mediaRecorder=recorder; active.chunks=chunks;
      recorder.start();
      return {recorder:recorder,stream:stream,chunks:chunks};
    }).catch(function(){return null;});
  }
  function finishMedia(meta, done){
    if(!meta||!meta.recorder){done("");return;}
    try{
      meta.recorder.onstop=function(){
        try{meta.stream.getTracks().forEach(function(t){t.stop();});}catch(e){}
        var blob=new Blob(meta.chunks,{type:"audio/webm"}), reader=new FileReader();
        reader.onload=function(){done(String(reader.result||""));};
        reader.onerror=function(){done("");}; reader.readAsDataURL(blob);
      };
      if(meta.recorder.state==="recording")meta.recorder.stop(); else done("");
    }catch(e){done("");}
  }
  function startRecognition(){
    if(!Recognition){
      announce("Voice transcription is not available on this browser or device. Use the existing audio recording option or type your answer. PacEdu will not guess your words.");
      return;
    }
    if(active.recognition){try{active.recognition.abort();}catch(e){} active.recognition=null;}
    var meta=null;
    beginMedia().then(function(m){meta=m;});
    var rec=new Recognition();
    active.recognition=rec;
    rec.lang="en-AU"; rec.continuous=false; rec.interimResults=false; rec.maxAlternatives=1;
    rec.onstart=function(){status("Listening. Please speak your complete answer.");speak("Listening. Please speak your complete answer.",true);};
    rec.onresult=function(e){
      var text="";
      try{text=e.results[e.results.length-1][0].transcript||"";}catch(x){}
      text=String(text);
      active.transcript=text; active.awaiting=!!text.trim();
      setBusy(false);
      if(meta)finishMedia(meta,function(audio){active.audioDataUrl=audio||"";});
      var heard=text.trim();
      if(!heard){announce("I did not receive a clear answer. Please say your answer again.");active.awaiting=false;return;}
      status("I heard: "+heard+". Say Confirm to keep it, or Change to record it again.");
      speak("I heard: "+heard+". Say Confirm to keep it, or Change to record it again.",true);
    };
    rec.onerror=function(e){
      active.awaiting=false; setBusy(false); stopMedia();
      var code=e&&e.error||"unknown";
      announce(code==="not-allowed"?"Microphone permission was not granted. Your answer was not recorded.": "I could not reliably capture your speech. No answer was submitted. Please try again.");
    };
    rec.onend=function(){active.recognition=null;};
    try{rec.start();}catch(e){active.awaiting=false;setBusy(false);announce("Voice listening could not start. No answer was submitted. Please try again.");}
  }
  function saveAudit(transcript,confirmed,audioDataUrl){
    writeAudit({
      attemptId:"BLIND-"+Date.now()+"-"+Math.random().toString(36).slice(2,8),
      question:active.question, type:active.type, day:active.day, contextKey:contextKey(),
      exactSpokenText:String(transcript||""), confirmed:!!confirmed,
      audioDataUrl:String(audioDataUrl||""), recordedAt:new Date().toISOString(),
      report:"Exact speech captured by the device recognition service; PacEdu did not silently correct the transcript."
    });
  }
  function submitConfirmed(){
    if(!active.awaiting||!String(active.transcript||"").trim())return;
    var transcript=String(active.transcript), audio=String(active.audioDataUrl||"");
    active.awaiting=false; setBusy(true);
    saveAudit(transcript,true,audio);
    window.__pacificEducationVerifiedVoiceAttempt=true;
    announce("Confirmed. Your exact spoken answer has been recorded. Submitting it for teacher review.");
    try{
      if(window.PacificEducationActivity&&typeof window.PacificEducationActivity.answer==="function"){
        window.PacificEducationActivity.answer(active.type,active.day,transcript);
      }else{
        window.__pacificEducationVerifiedVoiceAttempt=false;
        announce("The activity submission service is not ready. Your answer was not submitted.");
        setBusy(false); return;
      }
    }catch(e){
      window.__pacificEducationVerifiedVoiceAttempt=false;
      announce("The submission could not be completed. Your confirmed answer remains in the blind-attempt audit record.");
      setBusy(false); return;
    }
    setTimeout(function(){
      announce("Your answer has been submitted. Teacher review is required before it is treated as verified.");
    },500);
  }
  function changeAnswer(){
    active.awaiting=false; active.transcript=""; active.audioDataUrl="";
    setBusy(false); status("No answer is confirmed. You can record your answer again.");
    speak("Your previous speech was not confirmed. Please record your answer again.",true);
    startRecognition();
  }
  function install(){
    if(role()!=="student")return;
    var panel=document.getElementById("dailyLessonActivity"); if(!panel)return;
    if(document.getElementById("peBlindAttemptProtocol"))return;
    var box=document.createElement("section"); box.id="peBlindAttemptProtocol";
    box.setAttribute("aria-label","Blind learner voice answer confirmation");
    box.style.cssText="margin:14px 0;padding:16px;border:3px solid #000;border-radius:8px;background:#fff;";
    box.innerHTML="<h3>Blind User Voice Answer Protection</h3>"+
      "<p><strong>Listen → Speak → Read Back → Confirm → Submit</strong></p>"+
      "<p>PacEdu will not silently correct your words. You must confirm the words heard before they are submitted.</p>"+
      '<button type="button" id="peBlindListenAnswer" style="min-height:56px;padding:12px;font-weight:800;">🎙️ Speak Answer</button> '+
      '<button type="button" id="peBlindConfirm" disabled style="min-height:52px;padding:12px;">✓ Confirm</button> '+
      '<button type="button" id="peBlindChange" disabled style="min-height:52px;padding:12px;">↻ Change</button>'+
      '<p id="peBlindAttemptStatus" role="status" aria-live="assertive">Ready. Speak Answer starts the protected voice process.</p>';
    panel.insertBefore(box,panel.firstChild);
    document.getElementById("peBlindListenAnswer").addEventListener("click",startRecognition);
    document.getElementById("peBlindConfirm").addEventListener("click",submitConfirmed);
    document.getElementById("peBlindChange").addEventListener("click",changeAnswer);
    speak("Blind answer protection is ready. Speak Answer starts listening. I will read back exactly what I heard before submission.",true);
  }
  function wrapRender(){
    if(!window.PacificEducationActivity||typeof window.PacificEducationActivity.render!=="function")return;
    if(window.PacificEducationActivity.__blindProtocolWrapped)return;
    var original=window.PacificEducationActivity.render;
    window.PacificEducationActivity.render=function(type,day,lesson){
      var result=original.apply(this,arguments);
      active.type=type; active.day=Number(day)||1;
      var source=lesson&&lesson.activity?lesson.activity:(lesson||{});
      active.question=String(source.questionText||source.learnerTask||source.description||lesson&&lesson.title||"Daily Activity");
      active.transcript=""; active.awaiting=false; active.audioDataUrl="";
      setTimeout(install,50);
      setTimeout(function(){announce("Question "+active.day+" is ready. Listen to the question, then speak your answer when ready.");},120);
      return result;
    };
    window.PacificEducationActivity.__blindProtocolWrapped=true;
  }
  function patchAnswerReview(){
    /* The learner runtime checks this flag during save(), so verified spoken answers
       remain pending teacher review instead of being silently auto-scored. */
    var originalSetTimeout=window.setTimeout;
    if(window.__pacificEducationBlindPatchReady)return;
    window.__pacificEducationBlindPatchReady=true;
  }
  function init(){wrapRender();patchAnswerReview();}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
  window.addEventListener("load",init);
  document.addEventListener("pacificEducationSelectionChanged",function(){setTimeout(init,50);});
  window.PacificEducationBlindAttemptProtocol={version:VERSION,start:startRecognition,confirm:submitConfirmed,change:changeAnswer};
})(window,document);
