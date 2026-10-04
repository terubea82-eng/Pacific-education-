/* Pacific Education — Speech Voice Controller v1020 — AI-first mandatory welcome */
(function (window) {
  "use strict";

  var selectedVoice = null;
  var pendingText = "";
  var speechUnlocked = false;
  var platform = (function(){
    var ua = String(navigator && navigator.userAgent || "");
    if (/Android/i.test(ua)) return "android";
    if (/iPad|iPhone|iPod/i.test(ua)) return "ios";
    if (/Macintosh|Mac OS X/i.test(ua)) return "macos";
    if (/Windows/i.test(ua)) return "windows";
    if (/CrOS/i.test(ua)) return "chromeos";
    return "web";
  })();

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
    var maleVoiceHints = /(?:male|man|microsoft\s+(?:david|mark|ryan|guy)|google\s+(?:uk\s+english\s+male|us\s+english\s+male)|alex|daniel|fred|james|john|tom|aaron|arthur|oliver)/i;
    var femaleVoiceHints = /(?:female|woman|microsoft\s+(?:zira|hazel|susan)|google\s+(?:uk\s+english\s+female|us\s+english\s+female)|samantha|karen|moira|victoria|ava|allison)/i;
    var maleEnglishVoice = englishVoices.find(function (voice) {
      return maleVoiceHints.test(String(voice.name || "")) && !femaleVoiceHints.test(String(voice.name || ""));
    });
    selectedVoice =
      maleEnglishVoice ||
      englishVoices.find(function (voice) {
        return voice.localService && maleVoiceHints.test(String(voice.name || "")) && !femaleVoiceHints.test(String(voice.name || ""));
      }) ||
      englishVoices.find(function (voice) { return voice.localService; }) ||
      englishVoices[0] ||
      voices[0];
    return selectedVoice;
  }

  function nativeSpeak(text) {
    var bridge = window.PacificEducationNativeTTS;
    if (!bridge || typeof bridge.speak !== "function") return false;
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

    if (nativeSpeak(text)) return true;

    if (!window.speechSynthesis ||
        typeof window.SpeechSynthesisUtterance !== "function") {
      console.warn("Pacific Education speech unavailable in this browser/runtime.");
      setVoiceStatus("Voice engine unavailable in this browser or device.");
      return false;
    }

    pendingText = text;
    var synth = window.speechSynthesis;
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

        if (code === "not-allowed" || code === "synthesis-unavailable" || code === "voice-unavailable") {
          pendingText = text;
          speechUnlocked = false;
          setVoiceStatus("Voice waiting for first tap. Tap Hear Welcome.");
          return;
        }

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
              if (retryEvent && (retryEvent.error === "not-allowed" || retryEvent.error === "synthesis-unavailable" || retryEvent.error === "voice-unavailable")) {
                pendingText = text;
                speechUnlocked = false;
                setVoiceStatus("Voice waiting for first tap. Tap Hear Welcome.");
                return;
              }
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
      setTimeout(function () {
        try {
          if (pendingText === text && !synth.speaking && speechUnlocked) {
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
      pendingText = text;
      setVoiceStatus("Voice waiting for first tap. Tap Hear Welcome.");
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
    if (pendingText && (speechUnlocked || window.PacificEducationNativeTTS)) {
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
      if (pendingText) {
        var queued = pendingText;
        pendingText = "";
        speakText(queued);
      } else if (window.PacificEducationNativeTTS &&
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

  function scheduleAutomaticWelcomeVoice() {
    if (window.__pacificEducationAutoWelcomeVoiceScheduled) return;
    window.__pacificEducationAutoWelcomeVoiceScheduled = true;

    var welcomeText = "Welcome to Pacific Education. We are pleased to welcome you. Learn, discover, practise and grow with us.";

    function speakAiIntroThenWelcome() {
      var introText = "Pacific Education AI playback voice is active. I will guide you through this pilot.";
      try {
        chooseVoice();
        var nativeBridge = window.PacificEducationNativeTTS;
        if (nativeBridge && typeof nativeBridge.speak === "function") {
          var nativeReady = typeof nativeBridge.available !== "function" || nativeBridge.available();
          if (nativeReady) {
            var nativeStarted = nativeBridge.speak(introText);
            if (nativeStarted) {
              setVoiceStatus("AI playback voice is speaking first.");
              window.setTimeout(function () {
                var secondText = "First, listen to the instructions. Then complete each page in order and use Next when you are ready.";
                try {
                  if (typeof nativeBridge.speak === "function" && (typeof nativeBridge.available !== "function" || nativeBridge.available())) {
                    nativeBridge.speak(secondText);
                    setVoiceStatus("AI playback instructions are speaking. Welcome voice follows.");
                  } else {
                    speakText(secondText);
                  }
                  window.setTimeout(function () {
                    try {
                      if (typeof nativeBridge.speak === "function" && (typeof nativeBridge.available !== "function" || nativeBridge.available())) nativeBridge.speak(welcomeText);
                      else speakText(welcomeText);
                    } catch (_) { speakText(welcomeText); }
                  }, 2600);
                } catch (_) { speakText(welcomeText); }
              }, 2600);
              return true;
            }
          }
          setVoiceStatus("AI voice engine is starting. Retrying automatically.");
          return false;
        }

        if (!window.speechSynthesis || typeof window.SpeechSynthesisUtterance !== "function") {
          return false;
        }

        var synth = window.speechSynthesis;
        try { synth.cancel(); synth.resume(); } catch (_) {}
        var currentVoice = selectedVoice || chooseVoice();
        var introUtterance = new window.SpeechSynthesisUtterance(introText);
        if (currentVoice) introUtterance.voice = currentVoice;
        introUtterance.lang = currentVoice && currentVoice.lang ? currentVoice.lang : "en-US";
        introUtterance.rate = 0.95;
        introUtterance.pitch = 1;
        introUtterance.volume = 1;
        introUtterance.onstart = function () {
          setVoiceStatus("AI voice is speaking first. Welcome voice follows.");
        };
        introUtterance.onend = function () {
          var secondText = "First, listen to the instructions. Then complete each page in order and use Next when you are ready.";
          try {
            var secondUtterance = new window.SpeechSynthesisUtterance(secondText);
            var v = selectedVoice || chooseVoice();
            if (v) secondUtterance.voice = v;
            secondUtterance.lang = v && v.lang ? v.lang : "en-US";
            secondUtterance.rate = 0.95; secondUtterance.pitch = 1; secondUtterance.volume = 1;
            secondUtterance.onend = function(){ speakText(welcomeText); };
            secondUtterance.onerror = function(){ speakText(welcomeText); };
            synth.speak(secondUtterance);
            synth.resume();
          } catch (_) { speakText(welcomeText); }
        };
        introUtterance.onerror = function () {
          window.setTimeout(function () { speakText(welcomeText); }, 500);
        };
        synth.speak(introUtterance);
        synth.resume();
        return true;
      } catch (error) {
        console.warn("Pacific Education AI-first welcome voice failed:", error);
      }
      return false;
    }

    window.setTimeout(function () {
      var started = speakAiIntroThenWelcome();
      if (!started) {
        window.setTimeout(speakAiIntroThenWelcome, 600);
        window.setTimeout(speakAiIntroThenWelcome, 1500);
        window.setTimeout(speakAiIntroThenWelcome, 3000);
        window.setTimeout(speakAiIntroThenWelcome, 5000);
      }
    }, 5000);
  }

  window.PacificEducationSpeech = {
    getPlatform: function () { return platform; },
    getEngine: function () {
      if (window.PacificEducationNativeTTS && typeof window.PacificEducationNativeTTS.speak === "function") return "native";
      if (window.speechSynthesis) return "web-speech";
      return "unavailable";
    },
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
    document.addEventListener("DOMContentLoaded", function () {
      bindVoiceButtons();
      scheduleAutomaticWelcomeVoice();
    });
  } else {
    setTimeout(function () {
      bindVoiceButtons();
      scheduleAutomaticWelcomeVoice();
    }, 0);
  }
  chooseVoice();
  setTimeout(refreshVoiceSelection, 250);
  setTimeout(refreshVoiceSelection, 1000);
})(window);
