/*
 * Pacific Education — AI Conversation Layer
 * Version: 1.0.0 — pilot conversation interface
 *
 * Users converse with Pacific Education AI. Pacific Guardian remains the
 * owner-accountable governance and oversight layer and is not the user-facing
 * conversational identity.
 *
 * Pilot limitation: browser/localStorage only. No production AI service,
 * secure identity authentication, safeguarding backend, or server audit is
 * claimed by this prototype.
 */
(function (global) {
  "use strict";

  var VERSION = "1.0.0";
  var HISTORY_KEY = "pacificEducationAIConversationHistory";
  var MAX_HISTORY = 100;

  function speak(text) {
    try {
      if (typeof global.speakText === "function") {
        global.speakText(String(text || ""));
        return true;
      }
      if ("speechSynthesis" in global) {
        global.speechSynthesis.cancel();
        var u = new global.SpeechSynthesisUtterance(String(text || ""));
        u.lang = "en";
        u.rate = 0.95;
        global.speechSynthesis.speak(u);
        return true;
      }
    } catch (_) {}
    return false;
  }

  function readHistory() {
    try {
      var raw = global.localStorage.getItem(HISTORY_KEY);
      var data = raw ? JSON.parse(raw) : [];
      return Array.isArray(data) ? data : [];
    } catch (_) { return []; }
  }

  function writeHistory(history) {
    try {
      global.localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(-MAX_HISTORY)));
      return true;
    } catch (_) { return false; }
  }

  function addMessage(role, text) {
    var history = readHistory();
    history.push({ role: role, text: String(text || ""), createdAt: new Date().toISOString(), pilotOnly: true });
    writeHistory(history);
  }

  function respond(text) {
    var value = String(text || "").trim();
    if (!value) return "Please tell Pacific Education AI what you need help with.";
    var lower = value.toLowerCase();
    var response;

    if (/^(hi|hello|hey)\\b/.test(lower)) {
      response = "Hello. I am Pacific Education AI. You can ask me about learning, daily activities, practice, assessments, accessibility, or using Pacific Education.";
    } else if (lower.indexOf("guardian") !== -1) {
      response = "Pacific Guardian is the owner-accountable governance and oversight layer. Your conversation is with Pacific Education AI; Guardian is not the user-facing conversational assistant.";
    } else if (lower.indexOf("daily") !== -1 || lower.indexOf("lesson") !== -1) {
      response = "I can help you work through Pacific Education daily learning activities. Choose your class, subject and term, then open Daily Activities.";
    } else if (lower.indexOf("practice") !== -1 || lower.indexOf("assessment") !== -1) {
      response = "I can help explain the learning task and guide practice. Assessment decisions and formal learning records remain subject to the authorized teacher and system controls.";
    } else if (lower.indexOf("owner") !== -1) {
      response = "Pacific Guardian is responsible to the Pacific Education Owner for governance, oversight, architecture controls and owner-authorized decisions. The AI cannot transfer ownership or control.";
    } else {
      response = "I can help you understand and use Pacific Education. Tell me your question or the learning task you are working on, and I will guide you within the pilot controls.";
    }
    addMessage("user", value);
    addMessage("assistant", response);
    return response;
  }

  function render() {
    if (!global.document) return;
    var box = global.document.getElementById("pacificEducationAIConversationMessages");
    if (!box) return;
    var history = readHistory();
    if (!history.length) {
      box.innerHTML = "<p><strong>Pacific Education AI:</strong> Hello. How can I help you today?</p>";
      return;
    }
    box.innerHTML = history.map(function (m) {
      var safe = String(m.text || "").replace(/[&<>\"]/g, function (ch) {
        return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[ch] || ch;
      });
      return "<p><strong>" + (m.role === "user" ? "You" : "Pacific Education AI") + ":</strong> " + safe + "</p>";
    }).join("");
    box.scrollTop = box.scrollHeight;
  }

  function init() {
    var input = global.document && global.document.getElementById("pacificEducationAIMessage");
    var send = global.document && global.document.getElementById("pacificEducationAISend");
    var voice = global.document && global.document.getElementById("pacificEducationAIVoice");
    var stop = global.document && global.document.getElementById("pacificEducationAIStopVoice");
    var status = global.document && global.document.getElementById("pacificEducationAIStatus");
    if (!input || !send) return;

    function submit() {
      var text = input.value.trim();
      if (!text) return;
      var answer = respond(text);
      input.value = "";
      render();
      if (status) status.textContent = "Pacific Education AI responded.";
      speak(answer);
    }
    send.onclick = submit;
    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); submit(); }
    });

    var Recognition = global.SpeechRecognition || global.webkitSpeechRecognition;
    if (!Recognition) {
      if (voice) voice.disabled = true;
      if (status) status.textContent = "Voice input is not available in this browser. You can type to Pacific Education AI.";
    } else if (voice) {
      var recognition = new Recognition();
      recognition.lang = "en";
      recognition.interimResults = false;
      recognition.continuous = false;
      recognition.onstart = function () { voice.disabled = true; if (status) status.textContent = "Listening to you…"; };
      recognition.onresult = function (event) {
        var transcript = event.results && event.results[0] && event.results[0][0] ? event.results[0][0].transcript : "";
        if (transcript) { input.value = transcript; submit(); }
      };
      recognition.onerror = function () { voice.disabled = false; if (status) status.textContent = "Voice input could not be captured. You can type instead."; };
      recognition.onend = function () { voice.disabled = false; };
      voice.onclick = function () { try { recognition.start(); } catch (_) {} };
      if (stop) stop.onclick = function () { try { recognition.abort(); } catch (_) {} try { global.speechSynthesis.cancel(); } catch (_) {} if (status) status.textContent = "Voice stopped."; };
    }
    render();
  }

  global.PacificEducationAIConversation = Object.freeze({ version: VERSION, respond: respond, getHistory: readHistory, render: render });
  if (global.document) {
    if (global.document.readyState === "loading") global.document.addEventListener("DOMContentLoaded", init);
    else init();
  }
})(window);
