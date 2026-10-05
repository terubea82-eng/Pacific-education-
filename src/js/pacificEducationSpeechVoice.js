/* Pacific Education — Speech Voice Controller v1022 — strict fluent English male voice */
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

  function isFluentMaleEnglishVoice(voice) { var name=String(voice&&voice.name||""); var lang=String(voice&&voice.lang||""); if(!/^en(-|$)/i.test(lang)) return false; if(/(?:female|woman|zira|hazel|susan|samantha|karen|moira|victoria|ava|allison|google.*female)/i.test(name)) return false; return /(?:male|man|david|mark|ryan|guy|george|daniel|alex|fred|james|john|tom|aaron|arthur|oliver|microsoft|google)/i.test(name) && /(?:enhanced|premium|natural|neural|online|uk english|us english|english united states|english united kingdom|microsoft|google)/i.test(name); }\n\n  function chooseVoice() {
    if (!window.speechSynthesis || typeof window.speechSynthesis.getVoices !== "function") return null;
    var voices = window.speechSynthesis.getVoices() || [];
    if (!voices.length) {
      selectedVoice = null;
      return null;
    }
    var englishVoices = voices.filter(function (voice) {
      return /^en(-|$)/i.test(String(voice.lang || ""));
    });
    var maleVoiceHints = /(?:microsoft\\s+(?:david|mark|ryan|guy|george)|google\\s+(?:uk\\s+english\\s+male|us\\s+english\\s+male)|daniel|alex|fred|james|john|tom|aaron|arthur|oliver)/i;
    var femaleVoiceHints = /(?:female|woman|zira|hazel|susan|samantha|karen|moira|victoria|ava|allison|google.*female)/i;
    var fluentEnglishHints = /(?:microsoft|google|enhanced|premium|natural|neural|online|uk english|us english|english united states|english united kingdom)/i;
    var maleEnglishVoice = englishVoices.find(function (voice) {
      var name = String(voice.name || "");
      return maleVoiceHints.test(name) && !femaleVoiceHints.test(name);
    });
    var naturalMaleEnglishVoice = englishVoices.find(function (voice) {
      var name = String(voice.name || "");
      return /male|man|david|mark|ryan|guy|daniel|alex|james|john|tom|aaron|arthur|oliver/i.test(name) &&
             fluentEnglishHints.test(name) && !femaleVoiceHints.test(name);
    });
    selectedVoice =
      maleEnglishVoice ||
      naturalMaleEnglishVoice ||
      englishVoices.find(function (voice) {
        return voice.localService && fluentEnglishHints.test(String(voice.name || "")) && !femaleVoiceHints.test(String(voice.name || ""));
      }) ||
      englishVoices.find(function (voice) { return voice.localService && !femaleVoiceHints.test(String(voice.name || "")); }) ||
      englishVoices.find(function (voice) { return !femaleVoiceHints.test(String(voice.name || "")); }) ||
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

  function chooseConversationVoices() {
    if (!window.speechSynthesis || typeof window.speechSynthesis.getVoices !== "function") return {a:null,b:null};
    var voices = window.speechSynthesis.getVoices() || [];
    var english = voices.filter(function(v){ return /^en(-|$)/i.test(String(v.lang||"")); });
    if (!english.length) english = voices;
    var femaleHints = /(?:female|woman|zira|hazel|susan|samantha|karen|moira|victoria|ava|allison|google.*female)/i;
    var maleHints = /(?:male|man|david|mark|ryan|guy|alex|daniel|fred|james|john|tom|aaron|arthur|oliver|google.*male)/i;
    var a = english.find(function(v){return maleHints.test(String(v.name||"")) && !femaleHints.test(String(v.name||""));}) ||
            english.find(function(v){return v.localService && !femaleHints.test(String(v.name||""));}) ||
            english[0] || null;
    var b = english.find(function(v){return v !== a && maleHints.test(String(v.name||""));}) ||
            english.find(function(v){return v !== a && v.localService;}) ||
            english.find(function(v){return v !== a;}) || a;
    return {a:a,b:b};
  }

  function speakConversation(lines, done) {
    lines = Array.isArray(lines) ? lines : [];
    if (!lines.length) { if (done) done(); return false; }
    if (!window.speechSynthesis || typeof window.SpeechSynthesisUtterance !== "function") {
      if (window.PacificEducationNativeTTS && typeof window.PacificEducationNativeTTS.speak === "function") {
        var i=0;
        function nativeNext(){
          if(i>=lines.length){if(done)done();return;}
          try{
            window.PacificEducationNativeTTS.speak(String(lines[i++].text||""));
            setTimeout(nativeNext, 3200);
          }catch(_){if(done)done();}
        }
        nativeNext();
        return true;
      }
      setVoiceStatus("Two-person AI playback requires a speech engine.");
      return false;
    }
    var synth=window.speechSynthesis, pair=chooseConversationVoices(), index=0;
    try{synth.cancel();synth.resume();}catch(_){}
    function next(){
      if(index>=lines.length){setVoiceStatus("AI Playback conversation complete.");if(done)done();return;}
      var item=lines[index], u=new window.SpeechSynthesisUtterance(String(item.text||""));
      var v=(index%2===0?pair.a:pair.b);
      if(v)u.voice=v;
      u.lang=v&&v.lang?v.lang:"en-US";
      u.rate=0.94;
      u.pitch=index%2===0?0.92:1.08;
      u.volume=1;
      u.onstart=function(){setVoiceStatus("AI Playback: "+(index%2===0?"Speaker 1":"Speaker 2")+" is speaking.");};
      u.onend=function(){index++;next();};
      u.onerror=function(){index++;next();};
      try{synth.speak(u);synth.resume();}catch(_){index++;next();}
    }
    next();
    return true;
  }

  function bindVoiceButtons() {
    var welcome = document.getElementById("pacificEducationWelcomeVoiceButton");
    var stop = document.getElementById("pacificEducationStopSpeechButton");

    if (welcome && welcome.getAttribute("data-pe-welcome-voice-bound") !== "true") {
      welcome.setAttribute("data-pe-welcome-voice-bound", "true");
      welcome.addEventListener("click", function (event) {
        if (event) event.preventDefault();
        speakConversation([
          {speaker:"1",text:"What is Pacific Education, and why is it important?"},
          {speaker:"2",text:"Pacific Education is designed to support learners, teachers, parents and education communities. Its purpose is to make learning clear, accessible and connected."},
          {speaker:"1",text:"What does it help learners do?"},
          {speaker:"2",text:"It brings learning activities, educational content, practice, assessment and progress together so learners can learn step by step."},
          {speaker:"1",text:"And why does that matter across the Pacific?"},
          {speaker:"2",text:"Because every learner should have opportunities to learn, discover, practise and grow, while teachers and families can work together to support learning."},
          {speaker:"1",text:"Welcome to Pacific Education."},
          {speaker:"2",text:"Learn, discover, practise and grow with us."}
        ]);
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

    var conversation = [
      {speaker:"1",text:"What is Pacific Education, and why is it important?"},
      {speaker:"2",text:"Pacific Education is designed to support learners, teachers, parents and education communities. Its purpose is to make learning clear, accessible and connected."},
      {speaker:"1",text:"What is its purpose for learning?"},
      {speaker:"2",text:"It connects daily learning activities, educational content, practice, assessment and progress so learners can build knowledge step by step."},
      {speaker:"1",text:"Why is that important across the Pacific?"},
      {speaker:"2",text:"It helps make quality and accessible learning more connected for Pacific communities and supports teachers and families in guiding learners."},
      {speaker:"1",text:"Welcome to Pacific Education."},
      {speaker:"2",text:"Learn, discover, practise and grow with us."}
    ];

    window.setTimeout(function () {
      var started = speakConversation(conversation, function(){
        setVoiceStatus("AI Playback complete. Welcome to Pacific Education.");
      });
      if (!started) {
        window.setTimeout(function(){ speakConversation(conversation); }, 800);
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
