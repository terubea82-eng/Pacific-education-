/* Pacific Education — Speech Voice Controller */
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

    selectedVoice =
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
    var voice = selectedVoice || chooseVoice();

    try {
      // Mobile Chrome/Android can leave the synthesis queue paused after a
      // previous navigation. Resume before every user-triggered utterance.
      synth.cancel();
      if (typeof synth.resume === "function") synth.resume();

      var utterance = new window.SpeechSynthesisUtterance(text);
      if (voice) utterance.voice = voice;
      utterance.lang = voice && voice.lang ? voice.lang : "en-US";
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
        console.warn("Pacific Education speech error:", event && event.error);
        // Do not silently lose a user-requested speech action. If the
        // runtime reports a transient interruption, retry once after resume.
        if (pendingText === text && event && (event.error === "interrupted" || event.error === "canceled")) {
          pendingText = "";
          setTimeout(function () {
            if (window.speechSynthesis && typeof window.speechSynthesis.resume === "function") {
              window.speechSynthesis.resume();
            }
            speakText(text);
          }, 120);
        }
      };

      synth.speak(utterance);

      // Some Android WebView/Chrome versions need a second resume tick.
      if (typeof synth.resume === "function") {
        setTimeout(function () {
          try { synth.resume(); } catch (_) {}
        }, 50);
      }
      return true;
    } catch (error) {
      console.error("Pacific Education speech failed:", error);
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

  chooseVoice();
})(window);
