/* Pacific Education — welcome narration once repair.
 * Additive compatibility layer: do not edit protected #856 voice files.
 * Keeps the full welcome/Owner experience on the first page, while removing
 * repeated "Welcome to..." prefixes from speech on later pages.
 */
(function(window, document){
  "use strict";
  var MARK="__paceduWelcomeOnceRepair";
  function firstPage(){
    var body=document.body;
    if(!body)return false;
    if(body.classList.contains("pacedu-entry-mode") && body.getAttribute("data-pac-edu-entry-page")==="1")return true;
    if(body.getAttribute("data-pe-flow-step")==="0")return true;
    var welcome=document.getElementById("pacificEducationWelcome");
    if(welcome&&!welcome.hidden){
      var step=body.getAttribute("data-pe-flow-step");
      return step===null || step==="";
    }
    return false;
  }
  function clean(text){
    if(typeof text!=="string"||firstPage())return text;
    return text
      .replace(/\bWelcome to your /gi,"Your ")
      .replace(/\bWelcome to /gi,"")
      .replace(/\bWelcome back to your /gi,"Your ");
  }
  function install(){
    var speech=window.PacificEducationSpeech;
    if(!speech||typeof speech.speakText!=="function"||speech.speakText[MARK])return false;
    var original=speech.speakText;
    function onceOnly(text){
      var args=Array.prototype.slice.call(arguments);
      args[0]=clean(text);
      return original.apply(speech,args);
    }
    onceOnly[MARK]=true;
    speech.speakText=onceOnly;
    document.documentElement.setAttribute("data-pe-welcome-once-repair","active");
    return true;
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install);
  else install();
  window.addEventListener("load",install);
  window.setTimeout(install,0);
  window.setTimeout(install,250);
  window.setTimeout(install,1000);
  window.PacificEducationWelcomeOnceRepair={install:install,version:"1.0.0"};
})(window,document);
