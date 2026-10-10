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
    if(status)status.textContent="Welcome narration is Page 1 only. Registration instructions remain available on this page.";
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
  function permit(text){
    var clean=String(text||"").replace(/\s+/g," ").trim();
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
      var wrapped=function(text){if(!permit(text))return false;return original.apply(this,arguments);};
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
        var combined=(Array.isArray(lines)?lines:[]).map(function(item){return String(item&&item.text||"");}).join(" ");
        var isWelcomeConversation=/welcome to (?:pacedu|pacific education)|owner of pacific education|owner'?s experience|21 years(?: of)? (?:practical )?classroom teaching experience|modern education platform created to support learners/i.test(combined);
        if(isWelcomeConversation&&!pageOne()){
          clearPersistedWelcomeConversation();
          setWelcomeBlockedStatus();
          return false;
        }
        return originalConversation.apply(this,arguments);
      };
      guardedConversation.__peWelcomeGuard=true;
      guardedConversation.__peOriginal=originalConversation;
      engine.speakConversation=guardedConversation;
    }
    if(typeof window.speakText==="function"&&!window.speakText.__peWelcomeGuard){
      var originalGlobal=window.speakText;
      var globalWrapped=function(text){if(!permit(text))return false;return originalGlobal.apply(this,arguments);};
      globalWrapped.__peWelcomeGuard=true;globalWrapped.__peOriginal=originalGlobal;window.speakText=globalWrapped;
    }
  }
  wrapSpeechObject();
  var observer=new MutationObserver(function(){wrapSpeechObject();});
  if(document.documentElement)observer.observe(document.documentElement,{subtree:true,childList:true});
  setTimeout(wrapSpeechObject,250);setTimeout(wrapSpeechObject,1000);setTimeout(wrapSpeechObject,2500);
})(window,document);
