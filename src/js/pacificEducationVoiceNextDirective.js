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

  function updateGlobalUI(label,message) {
    var b=document.getElementById("pacificEducationPersistentVoiceButton");
    var s=document.getElementById("pacificEducationPersistentVoiceStatus");
    if(b)b.textContent=label;
    if(s)s.textContent=message;
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
    // The guided-flow controller calls attachVoiceOption() after each step is shown.
  });
})(window, document);
