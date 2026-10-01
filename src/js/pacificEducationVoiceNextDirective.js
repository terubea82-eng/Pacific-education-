/* Pacific Education — Voice User Directive for Next */
(function (window, document) {
  "use strict";

  var recognition = null;
  var listening = false;
  var globalListening = false;
  var globalRecognition = null;
  var globalRestart = null;
  var globalStopRequested = false;
  var nextButtonId = "";
  var statusId = "";
  var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  function getStatus() {
    return statusId ? document.getElementById(statusId) : null;
  }

  function setStatus(message) {
    var el = getStatus();
    if (el) {
      el.textContent = message;
      el.setAttribute("aria-live", "polite");
    }
  }

  function stopListening() {
    if (recognition) {
      try { recognition.stop(); } catch (_) {}
    }
    listening = false;
    var button = nextButtonId ? document.getElementById(nextButtonId) : null;
    if (button) {
      button.disabled = false;
      button.textContent = "🎙️ Voice Next — Say “Next”";
    }
  }

  function matchesNextCommand(text) {
    var normalized = String(text || "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return /^(next|next step|continue|go next|next stage|move next|move to next)$/.test(normalized);
  }

  function start(nextId, statusElementId) {
    nextButtonId = nextId;
    statusId = statusElementId || "";
    var button = document.getElementById(nextId);

    if (!SpeechRecognition) {
      setStatus("Voice directive is not available in this browser. Use the Next button.");
      return false;
    }

    if (listening) {
      stopListening();
      setStatus("Voice directive stopped. Use the button again when ready.");
      return false;
    }

    try {
      recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.continuous = false;
      recognition.maxAlternatives = 3;

      recognition.onstart = function () {
        listening = true;
        if (button) {
          button.textContent = "🎙️ Listening… Say “Next”";
          button.disabled = false;
        }
        setStatus("Listening for the voice directive: Next.");
        if (window.speakText) window.speakText("Listening. Say Next to continue.");
      };

      recognition.onresult = function (event) {
        var transcript = "";
        try {
          transcript = event.results[0][0].transcript || "";
        } catch (_) {}

        if (matchesNextCommand(transcript)) {
          setStatus("Voice directive accepted: Next.");
          stopListening();
          var nextButton = document.getElementById(nextId);
          if (nextButton) {
            nextButton.click();
          }
        } else {
          setStatus("Voice directive not recognized. Please say Next, then try again.");
          stopListening();
          if (window.speakText) window.speakText("Please say Next to continue.");
        }
      };

      recognition.onerror = function (event) {
        stopListening();
        var error = event && event.error ? event.error : "unknown";
        if (error === "not-allowed" || error === "service-not-allowed") {
          setStatus("Microphone permission is required for Voice Next. You can still use the Next button.");
        } else {
          setStatus("Voice directive could not be heard. Please try again or use Next.");
        }
      };

      recognition.onend = function () {
        if (listening) {
          listening = false;
          if (button) {
            button.textContent = "🎙️ Voice Next — Say “Next”";
          }
        }
      };

      recognition.start();
      return true;
    } catch (error) {
      stopListening();
      setStatus("Voice directive could not start. Please use the Next button.");
      return false;
    }
  }


  function globalCommand(text) {
    var normalized = String(text || "").toLowerCase().replace(/[^a-z0-9\\s]/g, " ").replace(/\\s+/g, " ").trim();
    var install = /^(install|install pacific education|download pacific education)$/.test(normalized);
    if (install) {
      var installEvent = getInstallEvent();
      if (installEvent && typeof installEvent.prompt === "function") {
        installEvent.prompt().then(function () {
          try { installEvent.userChoice.then(function(choice){ if(choice && choice.outcome === "accepted") speakAndUpdate("Pacific Education installation started."); }); } catch (_) {}
        });
      } else {
        speakAndUpdate("Pacific Education is ready on the web. If your browser offers Add to Home Screen or Install, choose it to install the web app.");
      }
      return;
    }
    var dictation = normalized.match(/^(?:dictate|type|enter|write) (.+)$/);
    if (dictation) {
      if (fillFocusedField(dictation[1])) speakAndUpdate("Entered the spoken text.");
      else speakAndUpdate("Focus a text field, then say Dictate followed by your message.");
      return;
    }
    var choose = normalized.match(/^choose option ([1-9][0-9]*)$/);
    if (choose) {
      speakAndUpdate(chooseOption(Number(choose[1])) ? "Option " + choose[1] + " selected." : "That option is not available.");
      return;
    }
    if (/^(start voice|start listening|voice on)$/.test(normalized)) {
      startGlobal();
      return;
    }
    if (/^(stop listening|voice off|stop voice control)$/.test(normalized)) {
      stopGlobal();
      return;
    }
    if (/^(next|next step|continue|go next|next stage|move next|move to next)$/.test(normalized)) {
      var next = document.querySelector(".pacific-flow-next button:not([hidden])");
      if (next) { next.click(); return; }
      var ids = ["welcomeNextButton","registrationNextButton","prototypeNextButton","levelNextButton","subjectNextButton","termNextButton","capabilityNextButton","dailyNextButton","practiceNextButton","assessmentNextButton"];
      for (var i=0;i<ids.length;i++) {
        var b=document.getElementById(ids[i]);
        if(b && !b.hidden){b.click();return;}
      }
      if(window.speakText)window.speakText("Next is not available.");
      return;
    }
    if (/^(read choices|read options|multiple choice)$/.test(normalized)) {
      var choices=[].slice.call(document.querySelectorAll("input[type=radio],input[type=checkbox],select option")).map(function(e){
        var l=e.id?document.querySelector("label[for='"+CSS.escape(e.id)+"']"):null;
        return String(l?l.textContent:e.textContent||e.getAttribute("aria-label")||e.value||"").replace(/\\s+/g," ").trim();
      }).filter(Boolean);
      if(window.speakText)window.speakText(choices.length ? "Choices available. "+choices.join(". ") : "No choices are currently available.");
      return;
    }
    if (/^(read|read page|read screen|read section)$/.test(normalized)) {
      var active=document.querySelector("body.pe-guided-flow main > *:not([hidden])")||document.querySelector("main");
      var content=active?String(active.innerText||active.textContent||"").replace(/\\s+/g," ").trim():"";
      if(content && window.speakText)window.speakText(content.slice(0,2400));
      return;
    }
    if (/^(sign out|log out|logout)$/.test(normalized)) {
      stopGlobal();
      var links=[].slice.call(document.querySelectorAll("button,a,[role=button]"));
      var sign=links.find(function(e){return /^(sign out|log out|logout)$/i.test(String(e.getAttribute("aria-label")||e.textContent||"").replace(/\\s+/g," ").trim());});
      if(sign)sign.click();
      return;
    }
  }

  function startGlobal() {
    if(!SpeechRecognition) return false;
    if(globalListening) return true;
    globalStopRequested=false;
    try {
      globalRecognition=new SpeechRecognition();
      globalRecognition.lang="en-US";
      globalRecognition.continuous=true;
      globalRecognition.interimResults=false;
      globalRecognition.maxAlternatives=2;
      globalRecognition.onstart=function(){globalListening=true;updateGlobalUI("🎙️ Voice Control: Listening","Voice control listening. Say Next, Read, Read Choices, or Sign Out.");};
      globalRecognition.onresult=function(event){
        for(var i=event.resultIndex;i<event.results.length;i++){
          if(event.results[i].isFinal)globalCommand(event.results[i][0].transcript);
        }
      };
      globalRecognition.onerror=function(event){
        if(event && (event.error==="not-allowed"||event.error==="service-not-allowed")){
          globalListening=false;
          updateGlobalUI("🎙️ Start Voice Control","Allow microphone access, then press Start Voice Control.");
        }
      };
      globalRecognition.onend=function(){
        globalListening=false;
        updateGlobalUI("🎙️ Start Voice Control","Voice control ready.");
        if(!globalStopRequested)globalRestart=setTimeout(startGlobal,700);
      };
      globalRecognition.start();
      return true;
    } catch (_) {
      globalListening=false;
      updateGlobalUI("🎙️ Start Voice Control","Voice control ready. Press Start Voice Control if automatic listening was blocked.");
      return false;
    }
  }

  function stopGlobal() {
    globalStopRequested=true;
    if(globalRestart)clearTimeout(globalRestart);
    try{if(globalRecognition)globalRecognition.stop();}catch(_){}
    globalListening=false;
    updateGlobalUI("🎙️ Start Voice Control","Voice control stopped.");
  }

  function getInstallEvent() {
    return window.PacificEducationInstallPrompt || null;
  }

  function speakAndUpdate(message) {
    updateGlobalUI(globalListening ? "🎙️ Voice Control: Listening" : "🎙️ Start Voice Control", message);
    if (window.speakText) window.speakText(message);
  }

  function fillFocusedField(text) {
    var value = String(text || "").trim();
    if (!value) return false;
    var active = document.activeElement;
    if (!active || !/^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName)) return false;
    if (active.tagName === "SELECT") {
      var options = [].slice.call(active.options || []);
      var match = options.find(function (o) {
        return String(o.textContent || "").toLowerCase().trim() === value.toLowerCase();
      });
      if (match) { active.value = match.value; active.dispatchEvent(new Event("change", {bubbles:true})); return true; }
      return false;
    }
    var setter = Object.getOwnPropertyDescriptor(active.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype, "value");
    if (setter && setter.set) setter.set.call(active, value);
    else active.value = value;
    active.dispatchEvent(new Event("input", {bubbles:true}));
    active.dispatchEvent(new Event("change", {bubbles:true}));
    return true;
  }

  function chooseOption(number) {
    var choices = [].slice.call(document.querySelectorAll('input[type="radio"], input[type="checkbox"]')).filter(function(e){return !e.disabled;});
    var index = Number(number) - 1;
    if (index >= 0 && index < choices.length) {
      choices[index].click();
      return true;
    }
    return false;
  }

  function updateGlobalUI(label,message) {
    var b=document.getElementById("pacificEducationPersistentVoiceButton");
    var s=document.getElementById("pacificEducationPersistentVoiceStatus");
    var db=document.getElementById("pacificEducationVoiceDockButton");
    var ds=document.getElementById("pacificEducationVoiceDockStatus");
    if(b)b.textContent=label;
    if(s)s.textContent=message;
    if(db)db.textContent=label;
    if(ds)ds.textContent=message;
  }

  function initGlobalVoiceUI() {
    var controls=document.getElementById("pacificEducationAccessibilityControls");
    if(controls && !document.getElementById("pacificEducationPersistentVoiceButton")){
      var wrap=document.createElement("div");
      wrap.style.cssText="display:flex;align-items:center;gap:6px;flex-wrap:wrap;width:100%;";
      var b=document.createElement("button");
      b.type="button";b.id="pacificEducationPersistentVoiceButton";
      b.textContent="🎙️ Start Voice Control";
      b.setAttribute("aria-label","Start voice control");
      var s=document.createElement("span");
      s.id="pacificEducationPersistentVoiceStatus";
      s.setAttribute("role","status");s.setAttribute("aria-live","polite");
      s.textContent="Voice control ready from page load. You can use voice directives without typing.";
      wrap.appendChild(b);wrap.appendChild(s);controls.insertBefore(wrap,controls.firstChild);
      b.onclick=function(){globalListening?stopGlobal():startGlobal();};
    }
    if(SpeechRecognition)setTimeout(startGlobal,400);
    if (!document.getElementById("pacificEducationVoiceDock")) {
      var dock=document.createElement("section");
      dock.id="pacificEducationVoiceDock";
      dock.setAttribute("aria-label","Pacific Education voice and installation controls");
      dock.style.cssText="position:fixed;left:8px;right:8px;bottom:8px;z-index:9999;background:#fff;border:2px solid currentColor;border-radius:10px;padding:8px;box-shadow:0 2px 10px rgba(0,0,0,.18);display:flex;gap:6px;align-items:center;flex-wrap:wrap;";
      var vb=document.createElement("button"); vb.type="button"; vb.textContent="🎙️ Start Voice Control"; vb.id="pacificEducationVoiceDockButton"; vb.setAttribute("aria-label","Start or stop voice control");
      var ib=document.createElement("button"); ib.type="button"; ib.textContent="📲 Install Pacific Education"; ib.id="pacificEducationInstallButton"; ib.hidden=true;
      var vs=document.createElement("span"); vs.id="pacificEducationVoiceDockStatus"; vs.setAttribute("role","status"); vs.setAttribute("aria-live","polite"); vs.textContent="Voice-first mode ready. Say Start Voice, Next, Read, Read Choices, Dictate, or Sign Out.";
      vb.onclick=function(){globalListening?stopGlobal():startGlobal();};
      ib.onclick=function(){var ev=getInstallEvent(); if(ev&&ev.prompt){ev.prompt();}};
      dock.appendChild(vb); dock.appendChild(ib); dock.appendChild(vs); document.body.appendChild(dock);
    }
    if (window.PacificEducationInstallPrompt) {
      var ib2=document.getElementById("pacificEducationInstallButton"); if(ib2)ib2.hidden=false;
    }
    document.addEventListener("click",function(e){
      var x=e.target&&e.target.closest?e.target.closest("button,a,[role=button]"):null;
      if(x && /^(sign out|log out|logout)$/i.test(String(x.getAttribute("aria-label")||x.textContent||"").replace(/\s+/g," ").trim())) stopGlobal();
    },true);
  }

  function attach(nextId, statusElementId) {
    var button = document.getElementById(nextId);
    if (!button || button.dataset.peVoiceNextBound === "true") return;

    button.dataset.peVoiceNextBound = "true";
    button.setAttribute("aria-label", "Voice Next: say Next to continue");
    button.addEventListener("click", function (event) {
      if (event && event.detail === 0) return;
      // The guided Next handler remains responsible for navigation.
      // This listener only exists for the voice-directive control when invoked by the API.
    });
  }

  window.PacificEducationVoiceNextDirective = Object.freeze({
    supported: !!SpeechRecognition,
    start: start,
    stop: stopListening,
    matchesNextCommand: matchesNextCommand,
    attach: attach,
    startGlobal: startGlobal,
    stopGlobal: stopGlobal,
    globalListening: function(){return globalListening;}
  });

  document.addEventListener("DOMContentLoaded", function () {
    initGlobalVoiceUI();
    // The guided-flow controller calls attachVoiceOption() after each step is shown.
  });
})(window, document);
