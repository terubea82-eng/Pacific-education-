/* Pacific Education — simple speech voice controller
 * Prefers an available English male voice when the device exposes one.
 * Falls back safely to the browser/device default voice.
 */
(function(window) {
  "use strict";

  var selectedVoice = null;

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
      if (score > bestScore) {
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
    try {
      window.speechSynthesis.cancel();
      var utterance = new window.SpeechSynthesisUtterance(text);
      var voice = selectedVoice || chooseVoice();
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang || "en";
      } else {
        utterance.lang = "en";
      }
      window.speechSynthesis.speak(utterance);
      return true;
    } catch (e) {
      return false;
    }
  }

  window.PacificEducationSpeech = {
    chooseVoice: chooseVoice,
    speakText: speakText,
    getSelectedVoice: function() { return selectedVoice; }
  };
  window.speakText = speakText;

  if (window.speechSynthesis && typeof window.speechSynthesis.addEventListener === "function") {
    window.speechSynthesis.addEventListener("voiceschanged", chooseVoice);
  }
  chooseVoice();
})(window);
