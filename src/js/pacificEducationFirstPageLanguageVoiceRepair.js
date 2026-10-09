/* Pacedu first-page language selector and welcome auto-attempt.
 * Additive repair only: never edits the protected #856 speech controller.
 */
(function(window, document){
  "use strict";
  var DEFAULT_LANGUAGE = "en-AU";
  var languageOptions = [
    ["en-AU","English — Australia (pilot voice)"],["en-FJ","English — Fiji"],
    ["fj","Vosa Vakaviti"],["hi","Hindi"],["ur","Urdu"],["fr","French"],
    ["sm","Samoan"],["to","Tongan"],["tvl","Tuvaluan"],["gil","Kiribati / Gilbertese"],
    ["bi","Bislama"],["ho","Hiri Motu"],["tpi","Tok Pisin"],["other","Other"]
  ];
  function byId(id){ return document.getElementById(id); }
  function savedLanguage(){
    try { return localStorage.getItem("pacificEducationRegistrationLanguage") || ""; }
    catch(_) { return ""; }
  }
  function setStatus(message){
    var status=byId("pacificEducationWelcomeLanguageStatus");
    if(status) status.textContent=message;
  }
  function syncLanguage(value, source){
    if(!value) return;
    var welcome=byId("pacificEducationWelcomeLanguageSelect");
    var registration=byId("pacificEducationLanguageSelect");
    if(welcome && welcome.value!==value) welcome.value=value;
    if(registration && registration.value!==value) registration.value=value;
    try {
      localStorage.setItem("pacificEducationRegistrationLanguage",value);
      localStorage.setItem("pacificEducationVoiceLocale",
        value==="en-AU" || value==="en-FJ" ? "en-AU" : value);
    } catch(_) {}
    var label=(languageOptions.filter(function(item){return item[0]===value;})[0]||[])[1]||value;
    setStatus("✓ Language selected: "+label+". This choice will be kept during registration.");
    if(source==="welcome" && registration) registration.dispatchEvent(new Event("change",{bubbles:true}));
    if(source==="registration" && welcome) welcome.dispatchEvent(new Event("change",{bubbles:true}));
  }
  function ensureWelcomeSelector(){
    var welcome=byId("pacificEducationWelcomeLanguageSelect");
    if(!welcome) return false;
    if(!welcome.options.length){
      languageOptions.forEach(function(item){
        var option=document.createElement("option");
        option.value=item[0]; option.textContent=item[1]; welcome.appendChild(option);
      });
    }
    var registration=byId("pacificEducationLanguageSelect");
    var chosen=savedLanguage() || (registration && registration.value) || DEFAULT_LANGUAGE;
    if(!languageOptions.some(function(item){return item[0]===chosen;})) chosen=DEFAULT_LANGUAGE;
    welcome.value=chosen;
    if(registration) registration.value=chosen;
    syncLanguage(chosen);
    if(welcome.getAttribute("data-pe-language-bound")!=="true"){
      welcome.setAttribute("data-pe-language-bound","true");
      welcome.addEventListener("change",function(){syncLanguage(welcome.value,"welcome");});
    }
    if(registration && registration.getAttribute("data-pe-welcome-language-bound")!=="true"){
      registration.setAttribute("data-pe-welcome-language-bound","true");
      registration.addEventListener("change",function(){syncLanguage(registration.value,"registration");});
    }
    return true;
  }
  function startWelcomeAttempt(){
    if(window.__pacificEducationWelcomeAutoAttempted) return;
    window.__pacificEducationWelcomeAutoAttempted=true;
    var voice=window.PacificEducationSpeech;
    if(voice && typeof voice.speakConversation==="function"){
      var lines=[
        {speaker:"1",text:"Welcome to Pacific Education."},
        {speaker:"2",text:"Choose your language, then press Next to continue. You can use AI Playback or Hear Welcome at any time."}
      ];
      var started=voice.speakConversation(lines);
      var status=byId("pacificEducationVoiceStatus");
      if(!started && status) status.textContent="Automatic voice was attempted. Tap AI Playback or Hear Welcome to try again.";
    } else {
      var statusFallback=byId("pacificEducationVoiceStatus");
      if(statusFallback) statusFallback.textContent="Automatic voice was attempted. Tap AI Playback or Hear Welcome; check this device's speech settings if silent.";
    }
  }
  function init(){
    ensureWelcomeSelector();
    var attempts=0;
    var retry=window.setInterval(function(){
      attempts++;
      ensureWelcomeSelector();
      if(byId("pacificEducationWelcomeLanguageSelect") || attempts>=40) window.clearInterval(retry);
    },250);
    window.setTimeout(startWelcomeAttempt,5000);
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
  window.addEventListener("pageshow",ensureWelcomeSelector);
})(window,document);
