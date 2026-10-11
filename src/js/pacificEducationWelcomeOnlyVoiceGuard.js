/* Pacedu additive welcome-only automatic voice guard.
 * Keeps the protected #856 voice controller file unchanged.
 * Page 1 may speak automatically once; later-page speech is allowed only after
 * an explicit Play / Hear Instructions / AI Playback click.
 */
(function(window,document){
  "use strict";
  if(window.__pacEduWelcomeOnlyGuardInstalled)return;
  window.__pacEduWelcomeOnlyGuardInstalled=true;
  var manualUntil=0, welcomeAutoUsed=false, lastAutoText="", lastAutoAt=0;
  function visible(el){
    if(!el||el.hidden)return false;
    if(window.getComputedStyle){
      var style=window.getComputedStyle(el);
      if(style.display==="none"||style.visibility==="hidden")return false;
    }
    return typeof el.getClientRects!=="function"||el.getClientRects().length>0;
  }
  function pageOne(){
    /* A direct Registration entry must never trigger the first-page welcome while
       the guided controller is still settling visibility on initial load. */
    try{
      if((new URLSearchParams(window.location.search)).get("entry")==="registration")return false;
    }catch(_){}
    /* Use the rendered page as well as the counter. The flow counter can be stale
       during page transitions; a visible Registration page must always win. */
    var registration=document.getElementById("pacificEducationIdentityRegistration");
    if(visible(registration))return false;
    var welcome=document.getElementById("pacificEducationWelcome");
    if(!visible(welcome))return false;
    var step=document.body&&document.body.getAttribute("data-pe-flow-step");
    if(step!==null&&step!=="")return Number(step)===0;
    return true;
  }
  function clearPersistedWelcomeConversation(){
    try{
      var key="pacificEducationVoiceResume";
      var raw=window.localStorage&&window.localStorage.getItem(key);
      if(!raw)return;
      var saved=JSON.parse(raw);
      var joined=(saved&&Array.isArray(saved.lines)?saved.lines:[]).map(function(item){return String(item&&item.text||"");}).join(" ");
      if(/welcome to (?:pacedu|pacific education)|owner of pacific education|owner'?s experience|21 years(?: of)? (?:practical )?classroom teaching experience|modern education platform created to support learners/i.test(joined)){
        window.localStorage.removeItem(key);
      }
    }catch(_){}
  }
  function setWelcomeBlockedStatus(){
    var status=document.getElementById("pacificEducationVoiceStatus");
    if(status)status.textContent="Registration page active. Use Hear Instructions or AI Playback for registration help.";
  }
  function sanitizeRegistrationStatus(){
    if(pageOne())return;
    var status=document.getElementById("pacificEducationVoiceStatus");
    if(!status)return;
    var message=String(status.textContent||"");
    if(/tap hear welcome|hear welcome(?: & introduction)? again/i.test(message)){
      status.textContent=message.replace(/tap hear welcome(?: & introduction)?/ig,"tap Hear Instructions").replace(/hear welcome(?: & introduction)? again/ig,"Hear Instructions again");
    }
  }
  function manualControl(el){
    if(!el)return false;
    var text=((el.getAttribute&&el.getAttribute("aria-label"))||el.textContent||el.value||"").toLowerCase();
    return /hear instructions|ai playback|play audio|\bplay\b/.test(text);
  }
  document.addEventListener("click",function(event){
    var el=event.target&&event.target.closest?event.target.closest("button,[role='button'],input[type='button']"):null;
    if(manualControl(el))manualUntil=Date.now()+5000;
  },true);
  function sanitizeRegistrationText(text){
    var clean=String(text||"").replace(/\s+/g," ").trim();
    /* The legacy page controller's Registration prompt starts with a welcome
       phrase. Keep its useful instructions but remove that phrase everywhere. */
    if(/^welcome to user registration[.!]?\s*/i.test(clean)){
      clean=clean.replace(/^welcome to user registration[.!]?\s*/i,"User Registration instructions. ");
    }
    return clean;
  }
  function permit(text){
    var clean=sanitizeRegistrationText(text);
    /* Page 1 owns the welcome/Owner introduction. Do not replay that narration
       on page 4 (registration) or any later page, even after a manual tap.
       Other page-specific instructions remain available through explicit controls. */
    var isPageOneWelcome=/welcome to (?:pacedu|pacific education)|modern education platform created to support learners|owner'?s experience|owner of pacific education|21 years(?: of)? (?:practical )?classroom teaching experience|why was pacific education built|so is it only for the pacific|and what is the goal|learn, discover, practise, and grow together|education should not stop when/i.test(clean);
    /* Never replay Page 1 welcome/Owner narration after leaving Page 1. */
    if(isPageOneWelcome&&!pageOne())return false;
    if(Date.now()<manualUntil)return true;
    /* Keep page-specific Registration and learning instructions available. */
    if(!pageOne())return true;
    if(!/welcome|pacific education/i.test(clean))return false;
    var now=Date.now();
    if(clean&&clean===lastAutoText&&now-lastAutoAt<300)return true;
    if(clean&&clean===lastAutoText&&now-lastAutoAt<15000)return false;
    if(welcomeAutoUsed)return false;
    welcomeAutoUsed=true;lastAutoText=clean;lastAutoAt=now;
    return true;
  }
  function wrapSpeechObject(){
    /* The welcome conversation calls speakConversation directly, bypassing speakText.
       Guard the public playback entry point as well so it cannot replay on Page 4. */
    var globalVoice=window.PacificEducationGlobalEducationVoice;
    if(globalVoice&&typeof globalVoice.play==="function"&&!globalVoice.play.__peWelcomeGuard){
      var originalPlay=globalVoice.play;
      var guardedPlay=function(){if(!pageOne())return false;return originalPlay.apply(this,arguments);};
      guardedPlay.__peWelcomeGuard=true;guardedPlay.__peOriginal=originalPlay;globalVoice.play=guardedPlay;
    }
    var engine=window.PacificEducationSpeech;
    if(engine&&typeof engine.speakText==="function"&&!engine.speakText.__peWelcomeGuard){
      var original=engine.speakText;
      var wrapped=function(text){var clean=sanitizeRegistrationText(text);if(!permit(clean))return false;var args=Array.prototype.slice.call(arguments);args[0]=clean;return original.apply(this,args);};
      wrapped.__peWelcomeGuard=true;wrapped.__peOriginal=original;engine.speakText=wrapped;
    }
    /* Automatic welcome playback and screen-reopen recovery call speakConversation
       directly, bypassing speakText and the exported welcome .play wrapper. Block
       the welcome/Owner conversation itself whenever Page 1 is not the visible page.
       Leave ordinary page-specific conversations (including Registration help) alone. */
    engine=window.PacificEducationSpeech;
    if(engine&&typeof engine.speakConversation==="function"&&!engine.speakConversation.__peWelcomeGuard){
      var originalConversation=engine.speakConversation;
      var guardedConversation=function(lines,done){
        /* The legacy Registration prompt can be delivered as conversation lines,
           not only as speakText(). Sanitize each line before it reaches the TTS
           engine so the welcome phrase is never spoken on Registration. */
        var safeLines=Array.isArray(lines)?lines.map(function(item){
          if(!item||typeof item!=="object")return item;
          var copy={};
          Object.keys(item).forEach(function(key){copy[key]=item[key];});
          if(typeof copy.text==="string")copy.text=sanitizeRegistrationText(copy.text);
          return copy;
        }):lines;
        var combined=(Array.isArray(safeLines)?safeLines:[]).map(function(item){return String(item&&item.text||"");}).join(" ");
        var isWelcomeConversation=/welcome to (?:pacedu|pacific education)|owner of pacific education|owner'?s experience|21 years(?: of)? (?:practical )?classroom teaching experience|modern education platform created to support learners/i.test(combined);
        if(isWelcomeConversation&&!pageOne()){
          clearPersistedWelcomeConversation();
          setWelcomeBlockedStatus();
          return false;
        }
        var args=Array.prototype.slice.call(arguments);
        args[0]=safeLines;
        return originalConversation.apply(this,args);
      };
      guardedConversation.__peWelcomeGuard=true;
      guardedConversation.__peOriginal=originalConversation;
      engine.speakConversation=guardedConversation;
    }
    if(typeof window.speakText==="function"&&!window.speakText.__peWelcomeGuard){
      var originalGlobal=window.speakText;
      var globalWrapped=function(text){var clean=sanitizeRegistrationText(text);if(!permit(clean))return false;var args=Array.prototype.slice.call(arguments);args[0]=clean;return originalGlobal.apply(this,args);};
      globalWrapped.__peWelcomeGuard=true;globalWrapped.__peOriginal=originalGlobal;window.speakText=globalWrapped;
    }
  }
  wrapSpeechObject();
  var observer=new MutationObserver(function(){wrapSpeechObject();sanitizeRegistrationStatus();});
  if(document.documentElement)observer.observe(document.documentElement,{subtree:true,childList:true});
  setTimeout(function(){wrapSpeechObject();sanitizeRegistrationStatus();},250);setTimeout(function(){wrapSpeechObject();sanitizeRegistrationStatus();},1000);setTimeout(function(){wrapSpeechObject();sanitizeRegistrationStatus();},2500);

  /* A welcome conversation may already be speaking when the user presses Next.
     The old guard blocked a new welcome call on Registration, but did not cancel
     audio already in progress. Stop and clear only the Page 1 welcome/resume audio
     as soon as the visible flow leaves Page 1. Later-page instructions are started
     by the page-navigation controller after this cancellation. */
  var wasOnWelcomePage=pageOne();
  function cancelWelcomeWhenLeavingPageOne(){
    var onWelcome=pageOne();
    if(wasOnWelcomePage&&!onWelcome){
      clearPersistedWelcomeConversation();
      try{
        if(window.PacificEducationSpeech&&typeof window.PacificEducationSpeech.stopSpeech==="function"){
          window.PacificEducationSpeech.stopSpeech();
        }else if(window.speechSynthesis&&typeof window.speechSynthesis.cancel==="function"){
          window.speechSynthesis.cancel();
        }
      }catch(_){}
      setWelcomeBlockedStatus();
    }
    wasOnWelcomePage=onWelcome;
  }
  var pageTransitionObserver=new MutationObserver(cancelWelcomeWhenLeavingPageOne);
  if(document.body)pageTransitionObserver.observe(document.body,{attributes:true,attributeFilter:["class","data-pe-flow-step"]});
  if(document.documentElement)pageTransitionObserver.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:["hidden","class"]});
  setTimeout(cancelWelcomeWhenLeavingPageOne,0);
})(window,document);
