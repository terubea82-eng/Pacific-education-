/*
 * Pacific Education — Adaptive Learning Controller
 * Version 1.0.0 — Controlled Pilot
 *
 * Connects assessment evidence to the pilot learner pathway:
 * assessment result -> progress/capability signal -> next activity.
 *
 * This is a prototype adaptation layer. It does not establish
 * official curriculum placement or production authorization.
 */
(function(window, document) {
  "use strict";

  var VERSION = "1.0.0";
  var LAST_SIGNATURE_KEY = "pacificEducationAdaptiveLastAssessment";
  var CAPABILITY_KEY = "pacificEducationCapability";

  function numberFrom(result) {
    if (!result) return null;
    var candidates = [
      result.percentage,
      result.scorePercentage,
      result.percent,
      result.score
    ];
    for (var i = 0; i < candidates.length; i += 1) {
      var n = Number(candidates[i]);
      if (Number.isFinite(n) && n >= 0 && n <= 100) return n;
    }
    return null;
  }

  function chooseCapability(score) {
    if (!Number.isFinite(score)) return "expected";
    if (score < 60) return "remedial";
    if (score < 80) return "developing";
    if (score < 95) return "expected";
    return "advanced";
  }

  function capabilityLabel(capability) {
    return {
      remedial: "Remedial / Re-teaching",
      developing: "Developing",
      expected: "Expected-level",
      advanced: "Advanced / Extension"
    }[capability] || "Expected-level";
  }

  function currentContext() {
    var day = 1;
    try {
      day = Number(localStorage.getItem("currentDayNumber") || 1);
    } catch (e) {}
    return {
      level: (function(){ try { return localStorage.getItem("pacificEducationLevel") || "Class 1"; } catch(e){ return "Class 1"; } })(),
      subject: (function(){ try { return localStorage.getItem("pacificEducationSubject") || "English"; } catch(e){ return "English"; } })(),
      term: (function(){ try { return localStorage.getItem("pacificEducationTerm") || "Term 1"; } catch(e){ return "Term 1"; } })(),
      day: Number.isFinite(day) ? day : 1
    };
  }

  function saveAdaptation(result) {
    var score = numberFrom(result);
    var capability = chooseCapability(score);
    var context = currentContext();
    var passed = result && (result.passed === true || result.pass === true);
    if (!passed && Number.isFinite(score)) passed = score >= 60;

    try {
      localStorage.setItem(CAPABILITY_KEY, capability);
      localStorage.setItem("pacificEducationAdaptiveLastScore", score === null ? "" : String(score));
      localStorage.setItem("pacificEducationAdaptiveLearningStatus",
        capability === "remedial"
          ? "Targeted re-teaching recommended"
          : capability === "developing"
            ? "Guided practice recommended"
            : capability === "advanced"
              ? "Extension activity recommended"
              : "Independent expected-level learning recommended");
      localStorage.setItem("pacificEducationAdaptiveNextActivity",
        capability === "remedial"
          ? "Remedial / Re-teaching"
          : capability === "developing"
            ? "Guided Practice"
            : capability === "advanced"
              ? "Extension / Challenge"
              : "Independent Practice");
      localStorage.setItem(LAST_SIGNATURE_KEY, JSON.stringify(result));
    } catch (e) {}

    document.dispatchEvent(new CustomEvent("pacificEducationAdaptiveLearningUpdated", {
      detail: {
        capability: capability,
        capabilityLabel: capabilityLabel(capability),
        score: score,
        passed: passed,
        nextActivity: capability === "remedial"
          ? "Remedial / Re-teaching"
          : capability === "developing"
            ? "Guided Practice"
            : capability === "advanced"
              ? "Extension / Challenge"
              : "Independent Practice",
        context: context,
        prototype: true
      }
    }));

    if (window.PacificEducationDailyProgressRecorder &&
        typeof window.PacificEducationDailyProgressRecorder.recordAssessed === "function" &&
        score !== null) {
      try {
        window.PacificEducationDailyProgressRecorder.recordAssessed({
          score: score,
          passingScore: 60,
          assessmentId: result && (result.id || result.assessmentId || result.type) || "pilot-assessment",
          notes: "Adaptive pilot assessment result connected to learning pathway."
        });
      } catch (e) {
        console.warn("Pacific Education adaptive progress recording deferred.", e);
      }
    }

    return {
      success: true,
      capability: capability,
      capabilityLabel: capabilityLabel(capability),
      score: score,
      nextActivity: capability === "remedial"
        ? "Remedial / Re-teaching"
        : capability === "developing"
          ? "Guided Practice"
          : capability === "advanced"
            ? "Extension / Challenge"
            : "Independent Practice",
      prototype: true
    };
  }

  function getLatestAssessment() {
    try {
      var raw = localStorage.getItem("pacificEducationAssessments");
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (Array.isArray(data)) return data.length ? data[data.length - 1] : null;
      if (data && Array.isArray(data.history)) {
        return data.history.length ? data.history[data.history.length - 1] : null;
      }
    } catch (e) {}
    return null;
  }

  function processLatest() {
    var result = getLatestAssessment();
    if (!result) return null;
    var signature;
    try { signature = JSON.stringify(result); } catch (e) { signature = String(result); }
    var previous = "";
    try { previous = localStorage.getItem(LAST_SIGNATURE_KEY) || ""; } catch (e) {}
    if (signature === previous) return null;
    return saveAdaptation(result);
  }

  function connectBaselineCompletion() {\n    if (window.__pacificEducationAdaptiveBaselineConnected) return true;\n    document.addEventListener("pacificEducationBaselineCompleted", function(event) {\n      if (event && event.detail) saveAdaptation(event.detail);\n    });\n    window.__pacificEducationAdaptiveBaselineConnected = true;\n    return true;\n  }\n\n  function connectAssessmentFinish() {
    if (window.__pacificEducationAdaptiveFinishConnected) return true;
    if (typeof window.finishAssessment !== "function") return false;

    var original = window.finishAssessment;
    window.finishAssessment = function adaptiveFinishAssessment() {
      var result = original.apply(this, arguments);
      var latest = getLatestAssessment();
      if (latest) saveAdaptation(latest);
      return result;
    };
    window.__pacificEducationAdaptiveFinishConnected = true;
    return true;
  }

  function refreshSelectors() {
    document.dispatchEvent(new CustomEvent("pacificEducationCapabilityChanged", {
      detail: { capability: (function(){ try { return localStorage.getItem(CAPABILITY_KEY) || "expected"; } catch(e){ return "expected"; } })(), prototype: true }
    }));
    if (typeof window.displayDailyLesson === "function") {
      try { window.displayDailyLesson(); } catch (e) {}
    }
  }

  function init() {
    connectAssessmentFinish();
    processLatest();
    refreshSelectors();
    setTimeout(function retry(){ connectBaselineCompletion(); connectAssessmentFinish(); processLatest(); }, 500);
  }

  window.PacificEducationAdaptiveLearning = Object.freeze({
    name: "PacificEducationAdaptiveLearning",
    version: VERSION,
    prototype: true,
    productionEligible: false,
    chooseCapability: chooseCapability,
    applyAssessmentResult: saveAdaptation,\n    applyBaselineResult: saveAdaptation,
    processLatest: processLatest,
    getLatestAssessment: getLatestAssessment
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window, document);
