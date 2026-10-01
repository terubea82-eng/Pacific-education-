/* Pacific Education — mandated male speech voice controller.
 * Male English voice is the required voice policy for Pacific Education.
 * The controller never intentionally selects a female voice. If no identifiable
 * male English voice is exposed by the device/browser, speech is withheld rather
 * than silently switching to a female voice.
 */
(function(window) {
  "use strict";

  var selectedVoice = null;
  var pendingText = "";
  var autoplayRetryBound = false;

  function scoreVoice(voice) {
    if (!voice) return -1000;
    var name = String(voice.name || "").toLowerCase();
    var lang = String(voice.lang || "").toLowerCase();
    var score = 0;
    if (lang.indexOf("en") === 0) score += 50;
    else return -100;
    if (/male|man|boy|david|daniel|alex|aaron|fred|tom|george|james|john|michael|mark|paul|richard|thomas|arthur|oliver/.test(name)) score += 100;
    if (/female|woman|girl|zira|samantha|victoria|karen|moira|susan|fiona|google uk english female|google us english/.test(name)) score -= 100;
    if (voice.localService) score += 5;
    return score;
  }

  function chooseVoice() {
    if (!window.speechSynthesis || typeof window.speechSynthesis.getVoices !== "function") return null;
    var voices = window.speechSynthesis.getVoices() || [];
    var best = null;
    var bestScore = -1000;
    voices.forEach(function(voice) {
      var score = scoreVoice(voice);
      if (score > bestScore && score >= 150) {
        bestScore = score;
        best = voice;
      }
    });
    selectedVoice = best;
    return best;
  }

  function speakText(text) {
    text = String(text || "").trim();
    if (!text || !window.speechSynthesis || typeof window.SpeechSynthesisUtterance !== "function") return false;
    var voice = selectedVoice || chooseVoice();
    if (!voice) {
      pendingText = text;
      bindAutoplayRetry();
      return false;
    }
    try {
      window.speechSynthesis.cancel();
      var utterance = new window.SpeechSynthesisUtterance(text);
      utterance.voice = voice;
      utterance.lang = voice.lang || "en";
      window.speechSynthesis.speak(utterance);
      pendingText = "";
      return true;
    } catch (e) {
      return false;
    }
  }

  function bindAutoplayRetry() {
    if (autoplayRetryBound || !window.document) return;
    autoplayRetryBound = true;
    var retry = function() {
      if (!pendingText || !selectedVoice) return;
      var text = pendingText;
      pendingText = "";
      speakText(text);
    };
    ["pointerdown","keydown","touchstart","click"].forEach(function(type) {
      window.document.addEventListener(type, retry, { once: true, capture: true });
    });
  }

  window.PacificEducationSpeech = {
    chooseVoice: chooseVoice,
    speakText: speakText,
    getSelectedVoice: function() { return selectedVoice; }
  };
  window.speakText = speakText;

  if (window.speechSynthesis && typeof window.speechSynthesis.addEventListener === "function") {
    window.speechSynthesis.addEventListener("voiceschanged", function() {
      chooseVoice();
      if (pendingText && selectedVoice) {
        var text = pendingText;
        pendingText = "";
        speakText(text);
      }
    });
  }
  chooseVoice();
})(window);
