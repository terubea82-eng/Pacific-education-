/* Pacific Education — Speech Voice Controller v1007 */
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

      // Android Chrome/WebView can drop an utterance when speak() is called
      // in the same task immediately after cancel(). Schedule playback on the
      // next short timer so the queue has time to reset.
      setTimeout(function () {
        try {
          if (!window.speechSynthesis ||
              typeof window.SpeechSynthesisUtterance !== "function") return;

          var currentSynth = window.speechSynthesis;
          if (typeof currentSynth.resume === "function") currentSynth.resume();

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
            console.warn("Pacific Education speech error:", event && event.error);
            if (pendingText === text && event && event.error === "interrupted") {
              pendingText = "";
            }
          };

          currentSynth.speak(utterance);
          if (typeof currentSynth.resume === "function") currentSynth.resume();
        } catch (error) {
          console.error("Pacific Education delayed speech failed:", error);
        }
      }, 80);

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
