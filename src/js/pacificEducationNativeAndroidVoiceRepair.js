/* Pacific Education — Additive native Android voice bridge repair
 * Routes AI Playback to the Android native TTS bridge first.
 * Deduplicates competing automatic/manual starts of the exact same conversation.
 * Does not modify the protected #856 voice controller or speech files.
 */
(function(window){
  "use strict";

  var lastNativeSignature = "";
  var lastNativeStartAt = 0;
  var DUPLICATE_START_WINDOW_MS = 10000;

  function install(){
    var speech=window.PacificEducationSpeech;
    var bridge=window.PacificEducationNativeTTS;
    if(!speech || !bridge || typeof bridge.speakConversation!=="function") return;
    if(speech.__nativeAndroidConversationRepairInstalled) return;

    var originalConversation=speech.speakConversation;
    speech.speakConversation=function(lines, done){
      lines=Array.isArray(lines)?lines:[];
      if(!lines.length) return false;

      var signature;
      try {
        signature=JSON.stringify(lines.map(function(item){
          return {speaker:String(item&&item.speaker||""),text:String(item&&item.text||"")};
        }));
      } catch (_) { signature=""; }

      /* The protected controller and the additive first-page repair both schedule
         a welcome attempt at five seconds. Treat the second identical start as
         the same playback, rather than QUEUE_FLUSH-ing the first native utterance. */
      var now=Date.now();
      if(signature && signature===lastNativeSignature &&
         now-lastNativeStartAt<DUPLICATE_START_WINDOW_MS){
        var duplicateStatus=document.getElementById("pacificEducationVoiceStatus");
        if(duplicateStatus) duplicateStatus.textContent="AI Playback is already starting.";
        return true;
      }

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
            lastNativeSignature=signature;
            lastNativeStartAt=now;
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

    var originalStop=speech.stopSpeech;
    if(typeof originalStop==="function"){
      speech.stopSpeech=function(){
        lastNativeSignature="";
        lastNativeStartAt=0;
        return originalStop.apply(this,arguments);
      };
    }

    speech.__nativeAndroidConversationRepairInstalled=true;
    speech.__nativeAndroidConversationRepairVersion="1.1.0";
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",install);
  else install();
  window.addEventListener("load",install);
  window.setTimeout(install,300);
  window.setTimeout(install,1000);
})(window);
