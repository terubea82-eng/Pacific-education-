/* Pacific Education — Additive native Android voice bridge repair
 * Routes AI Playback to the Android native TTS bridge first.
 * Does not modify the protected #856 voice controller or speech files.
 */
(function(window){
  "use strict";

  function install(){
    var speech=window.PacificEducationSpeech;
    var bridge=window.PacificEducationNativeTTS;
    if(!speech || !bridge || typeof bridge.speakConversation!=="function") return;
    if(speech.__nativeAndroidConversationRepairInstalled) return;

    var originalConversation=speech.speakConversation;
    speech.speakConversation=function(lines, done){
      lines=Array.isArray(lines)?lines:[];
      if(!lines.length) return false;

      try{
        if(typeof bridge.available!=="function" || bridge.available()){
          var json=JSON.stringify(lines.map(function(item){
            return {
              speaker:String(item&&item.speaker||""),
              text:String(item&&item.text||"")
            };
          }));
          var nativeStarted=bridge.speakConversation(json);
          if(nativeStarted){
            var status=document.getElementById("pacificEducationVoiceStatus");
            if(status) status.textContent="AI Playback: native Android voice active.";
            return true;
          }
        }
      }catch(error){
        console.warn("Pacific Education native Android AI Playback repair:",error);
      }

      return originalConversation(lines,done);
    };

    speech.__nativeAndroidConversationRepairInstalled=true;
    speech.__nativeAndroidConversationRepairVersion="1.0.0";
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",install);
  else install();
  window.addEventListener("load",install);
  window.setTimeout(install,300);
  window.setTimeout(install,1000);
})(window);
