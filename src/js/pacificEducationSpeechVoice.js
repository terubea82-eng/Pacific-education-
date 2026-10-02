/* Pacific Education — Speech Voice Controller v1009 */
(function (window) {
  "use strict";

  var selectedVoice = null;
  var pendingText = "";

  function chooseVoice() {
    if (!window.speechSynthesis || typeof window.speechSynthesis.getVoices !== "function") {
      return null;
    }

    var voices = window.speechSynthesis.getVoices() || [];
    if (!voices.length) {
      selectedVoice = null;
      return null;
    }

    var englishVoices = voices.filter(function (voice) {
      return /^en(-|$)/i.test(String(voice.lang || ""));
    });

    // Prefer a male-presenting English voice for the Pacific Education pilot.
    // Browser speech APIs do not standardize a gender property, so use conservative
    // name hints first, then fall back to a local English voice. The user can still
    // change the device/browser TTS voice independently.
    var maleVoiceHints = /(?:male|man|microsoft\s+(?:david|mark|ryan|guy)|google\s+(?:uk\s+english\s+male|us\s+english\s+male)|alex|daniel|fred|james|john|tom)/i;
    var femaleVoiceHints = /(?:female|woman|microsoft\s+(?:zira|hazel|susan)|google\s+(?:uk\s+english\s+female|us\s+english\s+female)|samantha|karen|moira|victoria)/i;
    var maleEnglishVoice = englishVoices.find(function (voice) {
      return maleVoiceHints.test(String(voice.name || "")) && !femaleVoiceHints.test(String(voice.name || ""));
    });

    selectedVoice =
      maleEnglishVoice ||
      englishVoices.find(function (voice) { return voice.localService; }) ||
      englishVoices[0] ||
      voices[0];

    return selectedVoice;
  }

  function speakText(text) {
    text = String(text || "").trim();

    if (!text || !window.speechSynthesis ||
        typeof window.SpeechSynthesisUtterance !== "function") {
      console.warn("Pacific Education speech unavailable in this browser/runtime.");
      return false;
    }

    pendingText = text;
    var synth = window.speechSynthesis;

    try {
      // Keep speak() inside the caller's user-gesture task. Some Android
      // Chrome/WebView versions reject speech when it is deferred by a timer.
      synth.cancel();
      if (typeof synth.resume === "function") synth.resume();

      var currentVoice = selectedVoice || chooseVoice();
      var utterance = new window.SpeechSynthesisUtterance(text);
      if (currentVoice) utterance.voice = currentVoice;
      utterance.lang = currentVoice && currentVoice.lang ? currentVoice.lang : "en-US";
      utterance.rate = 0.95;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = function () {
        pendingText = text;
      };
      utterance.onend = function () {
        pendingText = "";
      };
      utterance.onerror = function (event) {
        var code = event && event.error;
        console.warn("Pacific Education speech error:", code);
        if (pendingText !== text) return;

        // If a selected device voice is rejected, retry once with the
        // browser's default English TTS voice.
        if (currentVoice && code && code !== "interrupted") {
          pendingText = "";
          selectedVoice = null;
          try {
            synth.cancel();
            if (typeof synth.resume === "function") synth.resume();
            var fallback = new window.SpeechSynthesisUtterance(text);
            fallback.lang = "en-US";
            fallback.rate = 0.95;
            fallback.pitch = 1;
            fallback.volume = 1;
            fallback.onstart = function () { pendingText = text; };
            fallback.onend = function () { pendingText = ""; };
            fallback.onerror = function (retryEvent) {
              console.warn("Pacific Education fallback speech error:", retryEvent && retryEvent.error);
              pendingText = "";
            };
            synth.speak(fallback);
            if (typeof synth.resume === "function") synth.resume();
            return;
          } catch (retryError) {
            console.error("Pacific Education fallback speech failed:", retryError);
          }
        }
        pendingText = "";
      };

      // Critical: do not defer this call with setTimeout; Android/browser
      // user-activation rules can otherwise suppress speech from button taps.
      synth.speak(utterance);
      if (typeof synth.resume === "function") synth.resume();
      return true;
    } catch (error) {
      console.error("Pacific Education speech failed:", error);
      pendingText = "";
      return false;
    }
  }

  function retryPendingSpeech() {
    chooseVoice();
    if (pendingText && selectedVoice) {
      var text = pendingText;
      pendingText = "";
      speakText(text);
    }
  }

  // Android Chrome/WebView can require a user-gesture resume before TTS will play.
  function unlockSpeechOnInteraction() {
    if (!window.speechSynthesis) return;
    try {
      if (typeof window.speechSynthesis.resume === "function") window.speechSynthesis.resume();
    } catch (error) {
      console.warn("Pacific Education speech unlock deferred:", error);
    }
  }

  ["pointerdown", "touchstart", "keydown"].forEach(function (eventName) {
    document.addEventListener(eventName, unlockSpeechOnInteraction, { once: true, capture: true, passive: true });
  });

  function bindVoiceButtons() {
    var welcome = document.getElementById("pacificEducationWelcomeVoiceButton");
    var stop = document.getElementById("pacificEducationStopSpeechButton");

    if (welcome && welcome.getAttribute("data-pe-welcome-voice-bound") !== "true") {
      welcome.setAttribute("data-pe-welcome-voice-bound", "true");
      welcome.addEventListener("click", function (event) {
        if (event) event.preventDefault();
        speakText("Welcome to Pacific Education. We are pleased to welcome you. Learn, discover, practise and grow with us.");
        return false;
      });
    }

    if (stop && stop.getAttribute("data-pe-stop-voice-bound") !== "true") {
      stop.setAttribute("data-pe-stop-voice-bound", "true");
      stop.addEventListener("click", function (event) {
        if (event) event.preventDefault();
        try {
          if (window.speechSynthesis) window.speechSynthesis.cancel();
        } catch (_) {}
        pendingText = "";
        return false;
      });
    }
  }

  window.PacificEducationSpeech = {
    chooseVoice: chooseVoice,
    speakText: speakText,
    getSelectedVoice: function () { return selectedVoice; }
  };

  window.speakText = speakText;

  if (window.speechSynthesis &&
      typeof window.speechSynthesis.addEventListener === "function") {
    window.speechSynthesis.addEventListener("voiceschanged", retryPendingSpeech);
  }

  bindVoiceButtons();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bindVoiceButtons);
  else setTimeout(bindVoiceButtons, 0);
  chooseVoice();
})(window);
