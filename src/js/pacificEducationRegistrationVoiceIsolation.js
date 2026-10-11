/* Pacedu — final Registration voice isolation layer.
 * Loaded after legacy voice/navigation helpers so the Registration page cannot
 * restart Page 1 narration or auto-speak the registration box sequence.
 * The protected #856 speech engine itself is not modified.
 */
(function(window, document){
  "use strict";
  if(window.__pacEduRegistrationVoiceIsolationInstalled)return;
  window.__pacEduRegistrationVoiceIsolationInstalled=true;

  var manualUntil=0;
  var lastRegistrationState=null;

  function visible(el){
    if(!el || el.hidden)return false;
    try{
      var style=window.getComputedStyle(el);
      if(style.display==="none" || style.visibility==="hidden")return false;
    }catch(_){}
    return typeof el.getClientRects!=="function" || el.getClientRects().length>0;
  }

  function isRegistration(){
    try{
      if(new URLSearchParams(window.location.search).get("entry")==="registration")return true;
    }catch(_){}
    var step=document.body && document.body.getAttribute("data-pe-flow-step");
    if(step==="3")return true;
    return visible(document.getElementById("pacificEducationIdentityRegistration"));
  }

  function isWelcomeIntro(text){
    return /welcome to (?:pacedu|pacific education)|modern education platform created to support learners|owner'?s experience|owner of pacific education|21 years(?: of)? (?:practical )?classroom teaching experience|why was pacific education built|learn, discover, practise, and grow together|education should not stop when/i.test(String(text||""));
  }

  function clearResume(){
    try{window.localStorage.removeItem("pacificEducationVoiceResume");}catch(_){}
    try{window.sessionStorage.removeItem("pacificEducationVoiceResume");}catch(_){}
  }

  function stopCurrentSpeech(){
    clearResume();
    try{
      if(window.PacificEducationSpeech && typeof window.PacificEducationSpeech.stopSpeech==="function"){
        window.PacificEducationSpeech.stopSpeech();
      }
    }catch(_){}
    try{
      if(window.PacificEducationNativeTTS && typeof window.PacificEducationNativeTTS.stop==="function"){
        window.PacificEducationNativeTTS.stop();
      }
    }catch(_){}
    try{
      if(window.speechSynthesis && typeof window.speechSynthesis.cancel==="function"){
        window.speechSynthesis.cancel();
      }
    }catch(_){}
    var status=document.getElementById("pacificEducationVoiceStatus");
    if(status && isRegistration()){
      status.textContent="Registration page active. Welcome narration is stopped. Use Hear Instructions for registration help.";
    }
  }

  function clickedManualInstructions(event){
    var target=event.target;
    var control=target && target.closest ? target.closest("button,[role='button'],input[type='button'],a") : null;
    if(!control)return;
    var label=((control.getAttribute("aria-label")||"")+" "+(control.textContent||"")+" "+(control.value||"")).toLowerCase();
    if(/hear instructions|ai playback|play registration instructions|listen to instructions/.test(label) && !/hear welcome/.test(label)){
      manualUntil=Date.now()+5000;
    }
  }
  document.addEventListener("click",clickedManualInstructions,true);

  function wrapEngine(){
    var engine=window.PacificEducationSpeech;
    if(!engine)return;
    if(typeof engine.speakText==="function" && !engine.speakText.__peRegistrationIsolation){
      var originalText=engine.speakText;
      var guardedText=function(text){
        if(isRegistration()){
          if(isWelcomeIntro(text))return false;
          if(Date.now()>=manualUntil)return false;
        }
        return originalText.apply(this,arguments);
      };
      guardedText.__peRegistrationIsolation=true;
      guardedText.__peOriginal=originalText;
      engine.speakText=guardedText;
    }
    if(typeof engine.speakConversation==="function" && !engine.speakConversation.__peRegistrationIsolation){
      var originalConversation=engine.speakConversation;
      var guardedConversation=function(lines,done){
        if(isRegistration()){
          var combined=(Array.isArray(lines)?lines:[]).map(function(line){
            return String(line && line.text || "");
          }).join(" ");
          if(isWelcomeIntro(combined))return false;
          if(Date.now()>=manualUntil)return false;
        }
        return originalConversation.apply(this,arguments);
      };
      guardedConversation.__peRegistrationIsolation=true;
      guardedConversation.__peOriginal=originalConversation;
      engine.speakConversation=guardedConversation;
    }
  }

  function enforce(){
    wrapEngine();
    var registration=isRegistration();
    if(registration && lastRegistrationState!==true)stopCurrentSpeech();
    lastRegistrationState=registration;
  }

  document.addEventListener("DOMContentLoaded",enforce);
  window.addEventListener("pageshow",enforce);
  window.addEventListener("focus",enforce);
  var observer=new MutationObserver(enforce);
  if(document.body)observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:["class","hidden","style","data-pe-flow-step"]});
  if(document.documentElement)observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:["hidden","style","class","data-pe-flow-step"]});
  enforce();
  window.setTimeout(enforce,0);
  window.setTimeout(enforce,250);
  window.setTimeout(enforce,1000);
})(window,document);
