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
      return false;
    }

    var voice = selectedVoice || chooseVoice();

    // Some browsers expose speechSynthesis before their voice list is ready.
    // Do not block playback just because getVoices() is temporarily empty;
    // the browser can still use its default system voice.
    try {
      window.speechSynthesis.cancel();

      var utterance = new window.SpeechSynthesisUtterance(text);
      if (voice) utterance.voice = voice;
      utterance.lang = voice && voice.lang ? voice.lang : "en-US";
      utterance.rate = 0.95;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onend = function () {
        pendingText = "";
      };

      utterance.onerror = function (event) {
        console.warn("Pacific Education speech error:", event.error);
      };

      window.speechSynthesis.speak(utterance);
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
