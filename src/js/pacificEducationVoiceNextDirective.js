/* Pacific Education — Voice User Directive for Next */
(function (window, document) {
  "use strict";

  var recognition = null;
  var listening = false;
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
    attach: attach
  });

  document.addEventListener("DOMContentLoaded", function () {
    // The guided-flow controller calls attachVoiceOption() after each step is shown.
  });
})(window, document);
