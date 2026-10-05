/* Pacific Education — Speech Voice Controller v1023 — reliable English voice */
(function (window) {
  "use strict";

  var selectedVoice = null;
  var pendingText = "";
  var lastSpokenText = "";
  var lastSpokenAt = 0;
  var speechGeneration = 0;
  var conversationGeneration = 0;
  var lastConversationSignature = "";
  var lastConversationAt = 0;
  var speechUnlocked = false;
  var persistedConversationKey = "pacificEducationVoiceResume";
  var persistedConversation = null;
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

  function loadPersistedConversation() {
    try {
      var raw = window.localStorage.getItem(persistedConversationKey);
      persistedConversation = raw ? JSON.parse(raw) : null;
      if (!persistedConversation || !Array.isArray(persistedConversation.lines) ||
          persistedConversation.index >= persistedConversation.lines.length) {
        persistedConversation = null;
        window.localStorage.removeItem(persistedConversationKey);
      }
    } catch (_) { persistedConversation = null; }
    return persistedConversation;
  }

  function savePersistedConversation(lines, index) {
    try {
      var safeLines = (Array.isArray(lines) ? lines : []).map(function(item) {
        return {speaker: String(item && item.speaker || ""), text: String(item && item.text || "")};
      });
      if (!safeLines.length || index >= safeLines.length) {
        window.localStorage.removeItem(persistedConversationKey);
        persistedConversation = null;
        return;
      }
      persistedConversation = {lines: safeLines, index: Math.max(0, Number(index) || 0), savedAt: Date.now()};
      window.localStorage.setItem(persistedConversationKey, JSON.stringify(persistedConversation));
    } catch (_) {}
  }

  function clearPersistedConversation() {
    try { window.localStorage.removeItem(persistedConversationKey); } catch (_) {}
    persistedConversation = null;
  }

  function isFluentMaleEnglishVoice(voice) { var name=String(voice&&voice.name||""); var lang=String(voice&&voice.lang||""); if(!/^en(-|$)/i.test(lang)) return false; if(/(?:female|woman|zira|hazel|susan|samantha|karen|moira|victoria|ava|allison|google.*female)/i.test(name)) return false; return /(?:male|man|david|mark|ryan|guy|george|daniel|alex|fred|james|john|tom|aaron|arthur|oliver|microsoft|google)/i.test(name) && /(?:enhanced|premium|natural|neural|online|uk english|us english|english united states|english united kingdom|microsoft|google)/i.test(name); }

  function chooseVoice() {
    if (!window.speechSynthesis || typeof window.speechSynthesis.getVoices !== "function") return null;
    var voices = window.speechSynthesis.getVoices() || [];
    if (!voices.length) { selectedVoice = null; return null; }
    var englishVoices = voices.filter(function (voice) {
      return /^en(-|$)/i.test(String(voice.lang || ""));
    });
    if (!englishVoices.length) { selectedVoice = null; return null; }
    /* Locked pilot requirement: do not require a male/female voice label.
       Prefer Australia English, then a natural English voice, then any
       installed English voice so Hear Instructions works reliably on Android. */
    var australian = englishVoices.find(function (voice) {
      return /^en[-_]AU$/i.test(String(voice.lang || ""));
    });
    var natural = englishVoices.find(function (voice) {
      return /(?:natural|neural|enhanced|premium|online|google|microsoft)/i.test(String(voice.name || ""));
    });
    selectedVoice = australian || natural || englishVoices[0] || null;
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

  function speakText(text, options) {
    text = String(text || "").trim();
    if (!text) return false;
    options = options || {};
    var now = Date.now();
    if (!options.allowRepeat && text === lastSpokenText && (now - lastSpokenAt) < 8000) {
      return false;
    }
    lastSpokenText = text;
    lastSpokenAt = now;
    speechGeneration += 1;
    var generation = speechGeneration;

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

      var currentVoice = chooseVoice();
      /* Never block playback merely because the browser has not exposed an
         English voice object yet. Android/browser speech engines can still
         synthesize using their system default voice. Prefer en-AU when
         available, otherwise use the default system voice with English
         language requested. */
      var utterance = new window.SpeechSynthesisUtterance(text);
      if (currentVoice) utterance.voice = currentVoice;
      utterance.lang = currentVoice && currentVoice.lang ? currentVoice.lang : "en-AU";
      utterance.rate = 0.95;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = function () {
        pendingText = text;
        setVoiceStatus("Voice playing.");
      };
      utterance.onend = function () {
        if (generation !== speechGeneration) return;
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
        pendingText = "";
      };

      synth.speak(utterance);
      if (typeof synth.resume === "function") synth.resume();
      return true;
    } catch (error) {
      console.error("Pacific Education speech failed:", error);
      pendingText = text;
      setVoiceStatus("Voice waiting for first tap. Tap Hear Welcome.");
      return false;
    }
  }

  function stopSpeech() {
    speechGeneration += 1;
    conversationGeneration += 1;
    clearPersistedConversation();
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
    if (pendingText && !window.speechSynthesis.speaking && (speechUnlocked || window.PacificEducationNativeTTS)) {
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
    if (!english.length) return {a:null,b:null};
    var femaleHints = /(?:female|woman|zira|hazel|susan|samantha|karen|moira|victoria|ava|allison|google.*female)/i;
    var maleHints = /(?:male|man|david|mark|ryan|guy|alex|daniel|fred|james|john|tom|aaron|arthur|oliver|google.*male)/i;
    var strictEnglish = english.filter(function(v){
      var name=String(v.name||"");
      return maleHints.test(name) && !femaleHints.test(name) &&
        /(?:microsoft|google|enhanced|premium|natural|neural|online|uk english|us english|english united states|english united kingdom)/i.test(name);
    });
    var a = strictEnglish[0] || null;
    var b = strictEnglish.find(function(v){return v !== a;}) || a;
    return {a:a,b:b};
  }

  function speakConversation(lines, done) {
    lines = Array.isArray(lines) ? lines : [];
    if (!lines.length) { if (done) done(); return false; }
    var signature = lines.map(function(item){ return String(item && item.text || ""); }).join("\u0001");
    var now = Date.now();
    if (signature === lastConversationSignature && (now - lastConversationAt) < 8000) return false;
    lastConversationSignature = signature;
    lastConversationAt = now;
    conversationGeneration += 1;
    var conversationRun = conversationGeneration;
    speechGeneration += 1;
    var runGeneration = speechGeneration;
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
    var saved = loadPersistedConversation();
    var requestedSignature = lines.map(function(item){ return String(item && item.text || ""); }).join("\u0001");
    if (saved && saved.lines.map(function(item){ return String(item.text || ""); }).join("\u0001") === requestedSignature) {
      index = Math.max(0, Math.min(Number(saved.index) || 0, lines.length - 1));
      setVoiceStatus("Restoring AI Playback from where it stopped.");
    } else {
      clearPersistedConversation();
    }
    try{synth.cancel();if(typeof synth.resume==="function")synth.resume();}catch(_){}
    function next(){
      if(conversationRun!==conversationGeneration || runGeneration!==speechGeneration) return;
      if(index>=lines.length){clearPersistedConversation();setVoiceStatus("AI Playback conversation complete.");if(done)done();return;}
      savePersistedConversation(lines, index);
      var item=lines[index], u=new window.SpeechSynthesisUtterance(String(item.text||""));
      var v=(index%2===0?pair.a:pair.b);
      if(v)u.voice=v;
      u.lang=v&&v.lang?v.lang:"en-US";
      u.rate=0.94;
      u.pitch=index%2===0?0.92:1.08;
      u.volume=1;
      u.onstart=function(){savePersistedConversation(lines, index);setVoiceStatus("AI Playback: "+(index%2===0?"Speaker 1":"Speaker 2")+" is speaking.");};
      u.onend=function(){if(conversationRun!==conversationGeneration || runGeneration!==speechGeneration)return;index++;savePersistedConversation(lines, index);next();};
      u.onerror=function(){if(conversationRun!==conversationGeneration || runGeneration!==speechGeneration)return;index++;next();};
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
          {speaker:"1",text:"Welcome to Pacific Education. We are pleased to welcome you."},
          {speaker:"2",text:"Thank you. Pacific Education supports learners, teachers, parents and education communities with clear, accessible and structured learning."},
          {speaker:"1",text:"What is Pacific Education designed to do?"},
          {speaker:"2",text:"It connects daily learning activities, educational content, practice, assessment and progress so learners can build knowledge step by step."},
          {speaker:"1",text:"Why is that important across the Pacific?"},
          {speaker:"2",text:"It helps make quality and accessible learning more connected for Pacific communities and supports teachers and families in guiding learners."},
          {speaker:"1",text:"What can learners do here?"},
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
        conversationGeneration += 1;
        return false;
      });
    }
  }

  function scheduleAutomaticWelcomeVoice() {
    if (window.__pacificEducationAutoWelcomeVoiceScheduled) return;
    window.__pacificEducationAutoWelcomeVoiceScheduled = true;

    var conversation = [
      {speaker:"1",text:"Welcome to Pacific Education. We are pleased to welcome you."},
      {speaker:"2",text:"Pacific Education supports learners, teachers, parents and education communities with clear, accessible and structured learning."},
      {speaker:"1",text:"What is Pacific Education designed to do?"},
      {speaker:"2",text:"It connects daily learning activities, educational content, practice, assessment and progress so learners can build knowledge step by step."},
      {speaker:"1",text:"Why is that important across the Pacific?"},
      {speaker:"2",text:"It helps make quality and accessible learning more connected for Pacific communities and supports teachers and families in guiding learners."},
      {speaker:"1",text:"What can learners do here?"},
      {speaker:"2",text:"Learn, discover, practise and grow with us."}
    ];

    window.setTimeout(function () {
      var saved = loadPersistedConversation();
      var started = speakConversation(conversation, function(){
        setVoiceStatus("AI Playback complete. Welcome to Pacific Education.");
      });
      if (!started && saved) {
        setVoiceStatus("Voice is ready to restore the saved position. Tap the screen once if the device blocks automatic speech.");
      }
      if (!started) {
        window.setTimeout(function(){ speakConversation(conversation); }, 800);
      }
    }, saved ? 1200 : 5000);
  }

  function restoreVoiceAfterPageReturn() {
    var saved = loadPersistedConversation();
    if (!saved || !saved.lines || !saved.lines.length) return;
    window.setTimeout(function () {
      speakConversation(saved.lines, function(){
        setVoiceStatus("AI Playback complete. Welcome to Pacific Education.");
      });
    }, 900);
  }

  window.addEventListener("pagehide", function () {
    try {
      var active = loadPersistedConversation();
      if (active) savePersistedConversation(active.lines, active.index);
    } catch (_) {}
  });

  window.addEventListener("pageshow", function () {
    if (document.visibilityState !== "hidden") restoreVoiceAfterPageReturn();
  });

  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") restoreVoiceAfterPageReturn();
  });

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
