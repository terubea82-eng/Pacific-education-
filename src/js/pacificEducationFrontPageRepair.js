/* Pacific Education — Front Page Reliability Repair v1.0.0
 * Pilot-safe repair for first-screen navigation, welcome speech and core controls.
 */
(function(window, document){
  "use strict";

  var WELCOME_TEXT = "Welcome to Pacific Education. We are pleased to welcome you. Learn, discover, practise and grow with us.";
  var bound = false;

  function setStatus(text){
    var el = document.getElementById("pacificEducationVoiceStatus");
    if (el) el.textContent = text;
  }

  function speak(text){
    try {
      if (window.PacificEducationSpeech && typeof window.PacificEducationSpeech.speakText === "function") {
        return window.PacificEducationSpeech.speakText(text);
      }
      if (typeof window.speakText === "function") return window.speakText(text);
    } catch (e) {}
    try {
      if (window.speechSynthesis && typeof window.SpeechSynthesisUtterance === "function") {
        window.speechSynthesis.cancel();
        var u = new SpeechSynthesisUtterance(String(text || ""));
        u.lang = "en-US";
        u.rate = 0.95;
        u.volume = 1;
        window.speechSynthesis.speak(u);
        setStatus("Voice playing.");
        return true;
      }
    } catch (e2) {}
    setStatus("Voice engine unavailable on this device.");
    return false;
  }

  function stopSpeech(){
    try {
      if (window.PacificEducationSpeech && typeof window.PacificEducationSpeech.stopSpeech === "function") window.PacificEducationSpeech.stopSpeech();
      else if (window.speechSynthesis) window.speechSynthesis.cancel();
    } catch (e) {}
    setStatus("Voice stopped.");
  }

  function showStep(step, targetId){
    document.body.classList.add("pe-guided-flow");
    document.body.setAttribute("data-pe-flow-step", String(step));
    var target = document.getElementById(targetId);
    if (target) {
      target.hidden = false;
      try { target.scrollIntoView({behavior:"smooth", block:"start"}); }
      catch (e) { try { target.scrollIntoView(); } catch (_) {} }
    }
    return false;
  }

  function bindClick(id, fn){
    var el = document.getElementById(id);
    if (!el || el.getAttribute("data-pe-front-repair") === "true") return;
    el.setAttribute("data-pe-front-repair", "true");
    el.addEventListener("click", function(event){
      if (event) event.preventDefault();
      try { return fn(event); } catch (e) {
        setStatus("Control error. Please use Refresh Now and try again.");
        return false;
      }
    });
  }

  function bindGuidedNext(id, step, targetId){
    bindClick(id, function(){ return showStep(step, targetId); });
  }

  function bind(){
    if (bound) return;
    bound = true;

    bindClick("pacificEducationWelcomeVoiceButton", function(){
      return speak(WELCOME_TEXT);
    });
    bindClick("pacificEducationStopSpeechButton", function(){
      stopSpeech();
      return false;
    });

    bindGuidedNext("welcomeNextButton", 1, "pacificEducationIdentityRegistration");
    bindGuidedNext("registrationNextButton", 2, "prototypeAccess");
    bindGuidedNext("prototypeNextButton", 3, "levelSelection");
    bindGuidedNext("levelNextButton", 4, "subjectSelection");
    bindGuidedNext("subjectNextButton", 5, "termSelection");
    bindGuidedNext("termNextButton", 6, "capabilitySelection");
    bindGuidedNext("capabilityNextButton", 7, "dailyLesson");
    bindGuidedNext("dailyNextButton", 8, "dailyLessonPracticeStage");
    bindGuidedNext("practiceNextButton", 9, "assessments");
    bindGuidedNext("assessmentNextButton", 10, "teacherCalendarSection");

    bindClick("pacificEducationRefreshButton", function(){
      window.location.reload();
      return false;
    });

    bindClick("userRegistrationOpenButton", function(){
      var form = document.getElementById("userRegistrationForm");
      if (!form) return false;
      var opening = !!form.hidden;
      form.hidden = !opening;
      var button = document.getElementById("userRegistrationOpenButton");
      if (button) {
        button.setAttribute("aria-expanded", String(opening));
        button.textContent = opening ? "👤 User Registration — Tap to close" : "👤 User Registration — Tap to open";
      }
      if (opening) {
        try { form.scrollIntoView({behavior:"smooth", block:"start"}); } catch (e) { form.scrollIntoView(); }
      }
      return false;
    });

    bindClick("pacificEducationMailboxRefresh", function(){
      if (typeof window.refreshPacificEducationMailbox === "function") return window.refreshPacificEducationMailbox();
      var status = document.getElementById("pacificEducationMailboxStatus");
      if (status) status.textContent = "Mail Box refreshed. This pilot mailbox is stored on this browser.";
      return false;
    });

    bindClick("pacificEducationMailboxCompose", function(){
      var composer = document.getElementById("pacificEducationMailboxComposer");
      if (composer) composer.hidden = false;
      return false;
    });

    setStatus("Voice engine ready. Tap Hear Welcome.");
  }

  function init(){
    bind();
    window.setTimeout(bind, 250);
    window.setTimeout(bind, 1000);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})(window, document);
