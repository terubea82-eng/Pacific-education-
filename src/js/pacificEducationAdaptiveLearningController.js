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

  var VERSION = "1.1.0";
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

  function selectedClassId() {
    try {
      var roster = window.PacificEducationTeacherClassRosterContext;
      if (!roster || typeof roster.getClassId !== "function" || typeof roster.getClass !== "function") return "";
      var id = String(roster.getClassId() || "").trim();
      return id && roster.getClass(id) ? id : "";
    } catch (e) { return ""; }
  }

  function selectedStudentId() {
    try {
      var context = window.PacificEducationStudentCoverageContext;
      return context && typeof context.getStudentId === "function" ? String(context.getStudentId() || "").trim() : "";
    } catch (e) { return ""; }
  }

  function studentCapabilityKey(classId, studentId) {
    return CAPABILITY_KEY + ":student:" + encodeURIComponent(classId) + ":" + encodeURIComponent(studentId);
  }

  function currentContext() {
    var day = 1;
    try {
      day = Number(localStorage.getItem("currentDayNumber") || 1);
    } catch (e) {}
    return {
      classId: selectedClassId(),
      studentId: selectedStudentId(),
      level: (function(){ try { return (function(){var rr=window.PacificEducationTeacherClassRosterContext;var id=selectedClassId();var cc=rr&&typeof rr.getClass==="function"?rr.getClass(id):null;return cc&&cc.level?String(cc.level):"";})(); } catch(e){ return ""; } })(),
      subject: (function(){ try { return localStorage.getItem("pacificEducationSubject") || "English"; } catch(e){ return "English"; } })(),
      term: (function(){ try { return localStorage.getItem("pacificEducationTerm") || "Term 1"; } catch(e){ return "Term 1"; } })(),
      day: Number.isFinite(day) ? day : 1
    };
  }

  function saveAdaptation(result) {
    var score = numberFrom(result);
    var capability = chooseCapability(score);
    var context = currentContext();
    if (!context.classId) return {success:false,error:"Class Reference required",prototype:true};
    if (result && result.classId && String(result.classId) !== String(context.classId)) return {success:false,error:"Assessment belongs to a different Class Reference",prototype:true};
    if (!context.studentId) return {success:false,error:"Select the learner from the class roster before updating ability from assessment evidence",prototype:true};
    if (result && result.studentId && String(result.studentId) !== context.studentId) return {success:false,error:"Assessment belongs to a different learner",prototype:true};
    var passed = result && (result.passed === true || result.pass === true);
    if (!passed && Number.isFinite(score)) passed = score >= 60;

    try {
      localStorage.setItem(studentCapabilityKey(context.classId, context.studentId), capability);
      localStorage.setItem("pacificEducationAdaptiveLastScore:" + context.classId + ":" + context.studentId, score === null ? "" : String(score));
      localStorage.setItem("pacificEducationAdaptiveLearningStatus:" + context.classId + ":" + context.studentId,
        capability === "remedial"
          ? "Targeted re-teaching recommended"
          : capability === "developing"
            ? "Guided practice recommended"
            : capability === "advanced"
              ? "Extension activity recommended"
              : "Independent expected-level learning recommended");
      localStorage.setItem("pacificEducationAdaptiveNextActivity:" + context.classId + ":" + context.studentId,
        capability === "remedial"
          ? "Remedial / Re-teaching"
          : capability === "developing"
            ? "Guided Practice"
            : capability === "advanced"
              ? "Extension / Challenge"
              : "Independent Practice");
      localStorage.setItem(LAST_SIGNATURE_KEY + ":" + context.classId + ":" + context.studentId, JSON.stringify(result));
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
        classId: context.classId,
        studentId: context.studentId,
        source: "assessment-evidence",
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
      classId: context.classId,
      studentId: context.studentId,
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
    var classId = selectedClassId();
    if (!classId) return null;
    try {
      var core = window.PacificEducationCore;
      if (core && core.assessments && typeof core.assessments.getAll === "function") {
        var items = core.assessments.getAll() || [];
        return items.filter(function(x){ return String(x.classId || "") === String(classId); }).slice(-1)[0] || null;
      }
    } catch (e) {}
    try {
      var raw = localStorage.getItem("pacificEducationAssessments");
      if (!raw) return null;
      var data = JSON.parse(raw);
      var items = Array.isArray(data) ? data : (data && Array.isArray(data.history) ? data.history : []);
      return items.filter(function(x){ return String(x.classId || "") === String(classId); }).slice(-1)[0] || null;
    } catch (e) {}
    return null;
  }

  function processLatest() {
    var result = getLatestAssessment();
    if (!result) return null;
    var signature;
    try { signature = JSON.stringify(result); } catch (e) { signature = String(result); }
    var previous = "";
    try { previous = localStorage.getItem(LAST_SIGNATURE_KEY + ":" + selectedClassId() + ":" + selectedStudentId()) || ""; } catch (e) {}
    if (signature === previous) return null;
    return saveAdaptation(result);
  }

  function connectBaselineCompletion() {
    if (window.__pacificEducationAdaptiveBaselineConnected) return true;
    document.addEventListener("pacificEducationBaselineCompleted", function(event) {
      if (event && event.detail) saveAdaptation(event.detail);
    });
    window.__pacificEducationAdaptiveBaselineConnected = true;
    return true;
  }

  function connectAssessmentFinish() {
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
    var classId = selectedClassId();
    var studentId = selectedStudentId();
    var capability = "expected";
    try { if (classId && studentId) capability = localStorage.getItem(studentCapabilityKey(classId, studentId)) || localStorage.getItem(CAPABILITY_KEY + ":" + classId) || "expected"; } catch(e) {}
    document.dispatchEvent(new CustomEvent("pacificEducationCapabilityChanged", {
      detail: { capability: capability, classId: classId, studentId: studentId, prototype: true }
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
    applyAssessmentResult: saveAdaptation,
    applyBaselineResult: saveAdaptation,
    processLatest: processLatest,
    getLatestAssessment: getLatestAssessment
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window, document);
