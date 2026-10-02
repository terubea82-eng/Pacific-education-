/* Pacific Education — Speech Voice Controller v1018 */
(function (window) {
  "use strict";

  var selectedVoice = null;
  var pendingText = "";
  var speechUnlocked = false;

  function setVoiceStatus(message) {
    try {
      var status = document.getElementById("pacificEducationVoiceStatus");
      if (status) status.textContent = message;
    } catch (_) {}
  }

  function chooseVoice() {
    if (!window.speechSynthesis || typeof window.speechSynthesis.getVoices !== "function") return null;
    var voices = window.speechSynthesis.getVoices() || [];
    if (!voices.length) {
      selectedVoice = null;
      return null;
    }
    var englishVoices = voices.filter(function (voice) {
      return /^en(-|$)/i.test(String(voice.lang || ""));
    });
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

  function nativeSpeak(text) {
    var bridge = window.PacificEducationNativeTTS;
    if (!bridge || typeof bridge.speak !== "function") return false;
    try {
      if (typeof bridge.available === "function" && !bridge.available()) return false;
    } catch (_) {
      return false;
    }
    try {
      var ok = bridge.speak(String(text || ""));
      if (ok) {
        pendingText = "";
        setVoiceStatus("Voice playing.");
        return true;
      }
    } catch (error) {
      console.warn("Pacific Education native TTS failed:", error);
    }
    return false;
  }

  function speakText(text) {
    text = String(text || "").trim();
    if (!text) return false;

    // The Android pilot uses the device's native TextToSpeech engine.
    // This avoids Android WebView speechSynthesis implementations that can
    // report success but produce no audible output.
    if (nativeSpeak(text)) return true;

    if (!window.speechSynthesis ||
        typeof window.SpeechSynthesisUtterance !== "function") {
      console.warn("Pacific Education speech unavailable in this browser/runtime.");
      setVoiceStatus("Voice engine unavailable in this browser or device.");
      return false;
    }

    pendingText = text;
    var synth = window.speechSynthesis;
    // Some Android browsers/WebViews return from speak() successfully but remain paused.
    // Force a clean queue and resume before and immediately after enqueueing.
    try { synth.cancel(); } catch (_) {}
    try { if (typeof synth.resume === "function") synth.resume(); } catch (_) {}

    try {
      try { synth.cancel(); } catch (_) {}
      if (typeof synth.resume === "function") synth.resume();
      speechUnlocked = true;

      var currentVoice = selectedVoice || chooseVoice();
      var utterance = new window.SpeechSynthesisUtterance(text);
      if (currentVoice) utterance.voice = currentVoice;
      utterance.lang = currentVoice && currentVoice.lang ? currentVoice.lang : "en-US";
      utterance.rate = 0.95;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = function () {
        pendingText = text;
        setVoiceStatus("Voice playing.");
      };
      utterance.onend = function () {
        pendingText = "";
        setVoiceStatus("Voice ready.");
      };
      utterance.onerror = function (event) {
        var code = event && event.error;
        console.warn("Pacific Education speech error:", code);
        setVoiceStatus("Voice error: " + (code || "unknown") + ".");
        if (pendingText !== text) return;

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
            fallback.onstart = function () { pendingText = text; setVoiceStatus("Voice playing."); };
            fallback.onend = function () { pendingText = ""; setVoiceStatus("Voice ready."); };
            fallback.onerror = function (retryEvent) {
              console.warn("Pacific Education fallback speech error:", retryEvent && retryEvent.error);
              pendingText = "";
              setVoiceStatus("Voice error: " + ((retryEvent && retryEvent.error) || "unknown") + ".");
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

      synth.speak(utterance);
      if (typeof synth.resume === "function") synth.resume();
      // Retry once if the engine reports speaking=false immediately after enqueue.
      setTimeout(function () {
        try {
          if (pendingText === text && !synth.speaking) {
            synth.cancel();
            synth.resume();
            synth.speak(utterance);
            synth.resume();
          }
        } catch (_) {}
      }, 180);
      return true;
    } catch (error) {
      console.error("Pacific Education speech failed:", error);
      pendingText = "";
      setVoiceStatus("Voice error.");
      return false;
    }
  }

  function stopSpeech() {
    pendingText = "";
    try {
      if (window.PacificEducationNativeTTS &&
          typeof window.PacificEducationNativeTTS.stop === "function") {
        window.PacificEducationNativeTTS.stop();
      }
    } catch (_) {}
    try {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    } catch (_) {}
    setVoiceStatus("Voice stopped.");
  }

  function retryPendingSpeech() {
    chooseVoice();
    if (pendingText && selectedVoice) {
      var text = pendingText;
      pendingText = "";
      speakText(text);
    }
  }

  function unlockSpeechOnInteraction() {
    try {
      if (window.speechSynthesis && typeof window.speechSynthesis.resume === "function") {
        window.speechSynthesis.resume();
      }
      speechUnlocked = true;
      if (window.PacificEducationNativeTTS &&
          typeof window.PacificEducationNativeTTS.available === "function" &&
          window.PacificEducationNativeTTS.available()) {
        setVoiceStatus("Native voice engine ready. Tap Hear Welcome.");
      } else {
        setVoiceStatus("Voice engine unlocked. Tap Hear Welcome.");
      }
    } catch (error) {
      console.warn("Pacific Education speech unlock deferred:", error);
    }
  }

  ["pointerdown", "touchstart", "keydown"].forEach(function (eventName) {
    document.addEventListener(eventName, unlockSpeechOnInteraction, {
      once: true, capture: true, passive: true
    });
  });

  function refreshVoiceSelection() {
    chooseVoice();
    if (selectedVoice) {
      setVoiceStatus("English voice ready. Tap Hear Welcome.");
    } else if (window.speechSynthesis) {
      setVoiceStatus("Browser voice engine ready. Tap Hear Welcome.");
    }
  }

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
        stopSpeech();
        return false;
      });
    }
  }

  window.PacificEducationSpeech = {
    chooseVoice: chooseVoice,
    speakText: speakText,
    stopSpeech: stopSpeech,
    getSelectedVoice: function () { return selectedVoice; }
  };

  window.speakText = speakText;

  if (window.speechSynthesis &&
      typeof window.speechSynthesis.addEventListener === "function") {
    window.speechSynthesis.addEventListener("voiceschanged", retryPendingSpeech);
  }

  bindVoiceButtons();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindVoiceButtons);
  } else {
    setTimeout(bindVoiceButtons, 0);
  }
  chooseVoice();
  // Android/Chrome can populate the voice list asynchronously.
  setTimeout(refreshVoiceSelection, 250);
  setTimeout(refreshVoiceSelection, 1000);
})(window);
