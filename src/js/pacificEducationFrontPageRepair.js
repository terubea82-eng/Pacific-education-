/* Pacific Education — Front Page Reliability Repair v1.1.0
 * Pilot-safe reliability layer for first-screen navigation, welcome speech,
 * guided Next controls, and automatic recovery of failed bindings.
 *
 * Design: primary handler -> independent fallback -> repair/rebind -> recheck.
 * This reduces single-point UI failures but does not claim zero-failure operation.
 */
(function(window, document){
  "use strict";

  var VERSION = "1.2.0";
  var WELCOME_TEXT = "Welcome to Pacific Education. We are pleased to welcome you. Learn, discover, practise and grow with us.";
  var bound = false;
  var flow = [
    ["welcomeNextButton", 1, "pacificEducationIdentityRegistration"],
    ["registrationNextButton", 2, "prototypeAccess"],
    ["prototypeNextButton", 3, "levelSelection"],
    ["levelNextButton", 4, "subjectSelection"],
    ["subjectNextButton", 5, "termSelection"],
    ["termNextButton", 6, "capabilitySelection"],
    ["capabilityNextButton", 7, "dailyLesson"],
    ["dailyNextButton", 8, "dailyLessonPracticeStage"],
    ["practiceNextButton", 9, "assessments"],
    ["assessmentNextButton", 10, "teacherCalendarSection"]
  ];

  function setStatus(text){
    var el = document.getElementById("pacificEducationVoiceStatus");
    if (el) el.textContent = text;
    var system = document.getElementById("pacificEducationInteractionStatus");
    if (system) system.textContent = text;
  }

  function speak(text){
    var primaryOk = false;
    try {
      if (window.PacificEducationSpeech && typeof window.PacificEducationSpeech.speakText === "function") {
        primaryOk = window.PacificEducationSpeech.speakText(text) !== false;
      }
      if (!primaryOk && typeof window.speakText === "function") {
        primaryOk = window.speakText(text) !== false;
      }
    } catch (e) { primaryOk = false; }
    if (primaryOk) { setStatus("Voice playback requested."); return true; }

    /* Independent browser SpeechSynthesis fallback. */
    try {
      if (window.speechSynthesis && typeof window.SpeechSynthesisUtterance === "function") {
        window.speechSynthesis.cancel();
        var u = new SpeechSynthesisUtterance(String(text || ""));
        u.lang = "en-US";
        u.rate = 0.95;
        u.volume = 1;
        window.speechSynthesis.speak(u);
        setStatus("Voice playback requested.");
        return true;
      }
    } catch (e2) {}
    setStatus("Voice engine unavailable on this device.");
    return false;
  }

  function stopSpeech(){
    var stopped = false;
    try {
      if (window.PacificEducationSpeech && typeof window.PacificEducationSpeech.stopSpeech === "function") {
        window.PacificEducationSpeech.stopSpeech();
        stopped = true;
      }
    } catch (e) {}
    try {
      if (window.speechSynthesis) { window.speechSynthesis.cancel(); stopped = true; }
    } catch (e2) {}
    setStatus(stopped ? "Voice stopped." : "Voice stop control ready.");
  }

  function showStep(step, targetId){
    document.body.classList.add("pe-guided-flow");
    document.body.setAttribute("data-pe-flow-step", String(step));
    var target = document.getElementById(targetId);
    if (!target) return false;
    target.hidden = false;
    try { target.scrollIntoView({behavior:"smooth", block:"start"}); }
    catch (e) { try { target.scrollIntoView(); } catch (_) {} }
    try { target.setAttribute("tabindex", "-1"); target.focus({preventScroll:true}); } catch (_) {}
    return true;
  }

  function fallbackShowStep(step, targetId){
    var target = document.getElementById(targetId);
    if (!target) return false;
    target.hidden = false;
    target.style.display = "block";
    document.body.setAttribute("data-pe-flow-step", String(step));
    try { target.scrollIntoView(); } catch (e) {}
    return true;
  }

  function runWithRecovery(primary, fallback, source){
    try {
      if (typeof primary === "function" && primary() !== false) return true;
    } catch (e) {
      setStatus("Primary control recovered by backup: " + source + ".");
    }
    try {
      if (typeof fallback === "function" && fallback()) return true;
    } catch (e2) {
      setStatus("Backup control failed: " + source + ". Recheck is running.");
    }
    return false;
  }

  function bindClick(id, fn){
    var el = document.getElementById(id);
    if (!el) return false;
    if (el.getAttribute("data-pe-front-repair") === "true") return true;
    el.setAttribute("data-pe-front-repair", "true");
    el.addEventListener("click", function(event){
      if (event) event.preventDefault();
      try { return fn(event); } catch (e) {
        setStatus("Control error detected. Backup recovery is running.");
        return false;
      }
    });
    return true;
  }

  function ensureNextButton(id, step, targetId){
    var existing = document.getElementById(id);
    if (existing) return existing;

    /* Do not invent a new page. If the expected target exists, add one mobile-safe
       fallback button immediately before that target. */
    var target = document.getElementById(targetId);
    if (!target || !target.parentNode) return null;
    var button = document.createElement("button");
    button.type = "button";
    button.id = id;
    button.className = "pacific-education-guided-next-recovery";
    button.textContent = "Next →";
    button.setAttribute("aria-label", "Next");
    button.setAttribute("data-pe-recovery-line", "2");
    target.parentNode.insertBefore(button, target);
    bindGuidedNext(id, step, targetId);
    return button;
  }

  function bindGuidedNext(id, step, targetId){
    return bindClick(id, function(){
      return runWithRecovery(
        function(){ return showStep(step, targetId); },
        function(){ return fallbackShowStep(step, targetId); },
        id
      );
    });
  }

  function bindVoiceCommandRecovery(){
    /* Connect to an existing voice-command controller when available. No automatic
       microphone permission request is made by this repair layer. */
    var controllers = [
      window.PacificEducationVoiceCommands,
      window.PacificEducationSpeechCommands,
      window.PacificEducationVoiceNavigation
    ];
    for (var i = 0; i < controllers.length; i += 1) {
      var c = controllers[i];
      if (!c) continue;
      try {
        if (typeof c.registerCommand === "function") {
          c.registerCommand("next", function(){ return advanceFromCurrentStep(); });
          c.registerCommand("next page", function(){ return advanceFromCurrentStep(); });
          return true;
        }
        if (typeof c.addCommand === "function") {
          c.addCommand("next", function(){ return advanceFromCurrentStep(); });
          c.addCommand("next page", function(){ return advanceFromCurrentStep(); });
          return true;
        }
      } catch (e) {}
    }
    return false;
  }

  function advanceFromCurrentStep(){
    var step = parseInt(document.body.getAttribute("data-pe-flow-step") || "0", 10);
    var index = Math.max(0, step);
    var item = flow[index];
    if (!item) item = flow[0];
    var button = document.getElementById(item[0]);
    if (button) {
      try { button.click(); return true; } catch (e) {}
    }
    return runWithRecovery(
      function(){ return showStep(item[1], item[2]); },
      function(){ return fallbackShowStep(item[1], item[2]); },
      "voice-next"
    );
  }

  function repairFlowControls(){
    for (var i = 0; i < flow.length; i += 1) {
      var item = flow[i];
      var button = document.getElementById(item[0]);
      if (!button) button = ensureNextButton(item[0], item[1], item[2]);
      if (button) bindGuidedNext(item[0], item[1], item[2]);
    }
  }

  function bind(){
    if (!bound) bound = true;

    bindClick("pacificEducationWelcomeVoiceButton", function(){ return speak(WELCOME_TEXT); });
    bindClick("pacificEducationStopSpeechButton", function(){ stopSpeech(); return false; });

    repairFlowControls();
    bindVoiceCommandRecovery();

    bindClick("pacificEducationRefreshButton", function(){
      try { window.location.reload(); } catch (e) { setStatus("Refresh recovery unavailable."); }
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

    setStatus("Reliability repair ready: primary + backup + automatic recheck.");
  }

  function recheck(){
    var failures = [];
    for (var i = 0; i < flow.length; i += 1) {
      var item = flow[i];
      var button = document.getElementById(item[0]);
      var target = document.getElementById(item[2]);
      if (!button) failures.push(item[0] + " missing");
      if (!target) failures.push(item[2] + " missing");
      if (button && button.getAttribute("data-pe-front-repair") !== "true") failures.push(item[0] + " unbound");
    }
    var result = {version: VERSION, passed: failures.length === 0, failures: failures, checkedAt: new Date().toISOString()};
    try { localStorage.setItem("pacificEducationFrontRepairAudit", JSON.stringify(result)); } catch (e) {}
    if (failures.length) {
      repairFlowControls();
      setStatus("Navigation recheck found " + failures.length + " issue(s); recovery attempted.");
    }
    return result;
  }

  function init(){
    bind();
    /* Mandatory guided-flow start: never expose the complete pilot page at once. */
    try {
      if (!document.body.classList.contains("pe-guided-flow")) showStep(0, "pacificEducationWelcome");
    } catch (e) {
      try { fallbackShowStep(0, "pacificEducationWelcome"); } catch (_) {}
    }
    window.setTimeout(function(){ repairFlowControls(); recheck(); }, 250);
    window.setTimeout(function(){ repairFlowControls(); recheck(); }, 1000);
    window.setTimeout(function(){ repairFlowControls(); recheck(); }, 3000);
    window.setInterval(function(){ repairFlowControls(); recheck(); }, 5000);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})(window, document);
