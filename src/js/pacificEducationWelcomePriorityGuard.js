/* Pacific Education — welcome-first narration guard.
 * Additive only: preserves the protected #856 speech controller.
 * The two-speaker AI Playback must finish before page-guidance speech can start.
 */
(function(window, document){
  "use strict";

  var installed = false;
  var observer = null;

  function statusText(){
    var status = document.getElementById("pacificEducationVoiceStatus");
    return String(status && status.textContent || "").replace(/\s+/g, " ").trim();
  }

  function playbackFinished(){
    var text = statusText();
    if (/AI Playback (?:conversation )?complete/i.test(text)) return true;
    if (/two-person AI playback requires a speech engine|speech engine unavailable|could not start speech/i.test(text)) return true;
    return false;
  }

  function markFinishedIfReady(){
    if (!playbackFinished()) return false;
    window.__pacificEducationWelcomeCompleted = true;
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    return true;
  }

  function installSpeechGate(){
    var speech = window.PacificEducationSpeech;
    if (!speech || typeof speech.speakText !== "function") return false;
    if (speech.speakText.__pacificEducationWelcomePriorityGuard) return true;

    var originalSpeakText = speech.speakText;
    function guardedSpeakText(){
      if (!window.__pacificEducationWelcomeCompleted) return false;
      return originalSpeakText.apply(speech, arguments);
    }
    guardedSpeakText.__pacificEducationWelcomePriorityGuard = true;
    speech.speakText = guardedSpeakText;
    return true;
  }

  function install(){
    if (!installed) {
      installed = true;
      if (typeof window.__pacificEducationWelcomeCompleted !== "boolean") {
        window.__pacificEducationWelcomeCompleted = false;
      }
      installSpeechGate();
      var status = document.getElementById("pacificEducationVoiceStatus");
      if (status && typeof MutationObserver === "function") {
        observer = new MutationObserver(markFinishedIfReady);
        observer.observe(status, { childList: true, subtree: true, characterData: true });
      }
    } else {
      installSpeechGate();
    }
    markFinishedIfReady();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once: true });
  else install();
  window.addEventListener("load", install);
  window.setTimeout(install, 0);
  window.setTimeout(install, 250);
  window.setTimeout(install, 1000);

  window.PacificEducationWelcomePriorityGuard = {
    version: "1.0.0",
    isWelcomeCompleted: function(){ return !!window.__pacificEducationWelcomeCompleted; },
    refresh: install
  };
})(window, document);
