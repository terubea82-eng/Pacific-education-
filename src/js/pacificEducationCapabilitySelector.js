(function(window, document) {
  "use strict";
  var hostObserver = null, renderedHost = null, refreshCurrent = null;
  var C = [
    { id: "foundation", name: "Foundation" },
    { id: "developing", name: "Developing" },
    { id: "expected", name: "Expected-level" },
    { id: "advanced", name: "Advanced" },
    { id: "remedial", name: "Remedial / Re-teaching" },
    { id: "extension", name: "Extension / Challenge" }
  ];
  var GUIDANCE = {
    foundation: "Foundation: start with clear modelling, familiar examples, pictures or objects, and short guided steps. Record what the learner can do independently and what support helps.",
    developing: "Developing: let the learner try first, then offer a hint, word bank, worked example, or guided practice when needed.",
    expected: "Expected-level: practise the current class learning goal and check the response against clear success criteria. Do not assume mastery without evidence.",
    advanced: "Advanced: offer a deeper application of the same learning goal, with reasoning, comparison, or a new context.",
    remedial: "Remedial / Re-teaching: reteach the missing step in a different accessible way, model it, practise together, and check again without penalty.",
    extension: "Extension / Challenge: after the core task, invite the learner to justify a choice, compare alternatives, solve a new problem, or create an example."
  };
  var STUDENT_CONTEXT_KEY = "paceduActiveStudentContextV1";
  function activeStudentContext() {
    try {
      var context = JSON.parse(window.sessionStorage.getItem(STUDENT_CONTEXT_KEY) || "null");
      /* Student names may be optional in some country workflows. A role-scoped
       * session is a learner context even when identity display text is absent;
       * the verified student/class IDs remain the evidence gate. */
      return context && context.role === "student" ? context : null;
    } catch (error) { return null; }
  }
  function validCapability(value) {
    return C.some(function (item) { return item.id === value; });
  }
  function studentRecommendation(context) {
    if (!context || context.identityVerified !== true || !context.studentId || !context.classId) return null;
    var engine = window.PacificEducationEvidenceBasedAbility;
    if (!engine || typeof engine.evaluate !== "function") return null;
    try {
      return engine.evaluate({
        studentId: context.studentId,
        classId: context.classId,
        term: window.localStorage.getItem("pacificEducationTerm") || "Term 1",
        subject: window.localStorage.getItem("pacificEducationSubject") || "English"
      });
    } catch (error) { return null; }
  }
  function selectedStudentScope() {
    try {
      var context = window.PacificEducationStudentCoverageContext;
      var roster = window.PacificEducationTeacherClassRosterContext;
      if (!context || typeof context.getStudentId !== "function" ||
          !roster || typeof roster.getClassId !== "function") return null;
      var studentId = String(context.getStudentId() || "").trim();
      var classId = String(roster.getClassId() || "").trim();
      if (!studentId || !classId) return null;
      if (typeof roster.getStudents === "function") {
        var students = roster.getStudents(classId) || [];
        if (!students.some(function (id) { return String(id) === studentId; })) return null;
      }
      return { studentId: studentId, classId: classId };
    } catch (e) { return null; }
  }
  function studentStorageKey(scope) {
    return "pacificEducationCapability:student:" +
      encodeURIComponent(scope.classId) + ":" + encodeURIComponent(scope.studentId);
  }
  function getRecord() {
    var learner = activeStudentContext();
    if (learner) {
      var recommendation = studentRecommendation(learner);
      var proposed = recommendation && recommendation.status === "recommendation-ready"
        ? (recommendation.finalLevel || recommendation.recommendation) : null;
      if (validCapability(proposed)) {
        return { capability: proposed, source: "PacEdu evidence recommendation", linked: true, recommendation: recommendation };
      }
      return { capability: validCapability(learner.capability) ? learner.capability : "expected",
        source: "awaiting marked evidence", linked: false, recommendation: recommendation };
    }
    var scope = selectedStudentScope();
    var v = null;
    var source = "general";
    try {
      if (scope) {
        v = window.localStorage.getItem(studentStorageKey(scope));
        if (v) source = "student";
        /* Never borrow a general setting when a specific child is selected. */
      } else {
        v = window.localStorage.getItem("pacificEducationCapability");
        if (v) source = "general";
      }
    } catch (e) { v = null; }
    if (!C.some(function (x) { return x.id === v; })) {
      return { capability: "expected", source: scope ? "no learner evidence yet" : "default", linked: false };
    }
    return { capability: v, source: source, linked: source === "student" };
  }
  function get() { return getRecord().capability; }
  function set(v) {
    /* Student ability is evidence-derived; students cannot self-select or overwrite it. */
    if (activeStudentContext()) return false;
    if (!C.some(function (x) { return x.id === v; })) return false;
    var scope = selectedStudentScope();
    try {
      if (scope) window.localStorage.setItem(studentStorageKey(scope), v);
      else window.localStorage.setItem("pacificEducationCapability", v);
    } catch (e) { return false; }
    if (window.PacificEducationCurriculumLessonRenderer &&
        typeof window.PacificEducationCurriculumLessonRenderer.refresh === "function") {
      window.PacificEducationCurriculumLessonRenderer.refresh();
    }
    return true;
  }
  function init() {
    var h = document.getElementById("pacificEducationCapabilitySelector");
    if (!h) {
      /* The guided flow can reveal this host after the script first loads.
         Retry when it is inserted instead of silently leaving the ability box blank. */
      if (!hostObserver && document.body && typeof window.MutationObserver === "function") {
        hostObserver = new window.MutationObserver(function () {
          if (document.getElementById("pacificEducationCapabilitySelector")) {
            hostObserver.disconnect();
            hostObserver = null;
            init();
          }
        });
        hostObserver.observe(document.body, { childList: true, subtree: true });
      }
      return false;
    }
    if (hostObserver) { hostObserver.disconnect(); hostObserver = null; }
    if (renderedHost === h && h.querySelector("#pacificEducationCapability")) {
      if (refreshCurrent) refreshCurrent();
      return true;
    }
    h.textContent = "";
    var l = document.createElement("label");
    l.htmlFor = "pacificEducationCapability";
    l.textContent = activeStudentContext() ? "Learning level — set by PacEdu from marked evidence" : "Ability (choose from observed evidence)";
    var s = document.createElement("select");
    s.id = "pacificEducationCapability";
    s.setAttribute("aria-describedby", "pacificEducationCapabilityGuidance");
    C.forEach(function (x) {
      var o = document.createElement("option");
      o.value = x.id;
      o.textContent = x.name;
      s.appendChild(o);
    });
    s.value = get();
    if (activeStudentContext()) {
      s.disabled = true;
      s.hidden = true;
      s.setAttribute("aria-hidden", "true");
    }
    var info = document.createElement("div");
    info.id = "pacificEducationCapabilityGuidance";
    info.setAttribute("role", "status");
    info.setAttribute("aria-live", "polite");
    info.style.cssText = "display:block!important;visibility:visible!important;opacity:1!important;margin:10px 0;padding:12px;border:2px solid #7bb9e8;border-radius:8px;background:#eef8ff;color:#17324d;line-height:1.5;white-space:normal;";
    function showGuidance() {
      var learner = activeStudentContext();
      var record = getRecord();
      s.value = record.capability;
      if (learner) {
        if (learner.identityVerified !== true || !learner.studentId || !learner.classId) {
          info.textContent = "Learning level is not yet recommended. Enter the exact school-issued learner reference and use a matching class roster. PacEdu will not match by name or count unverified work.";
          return;
        }
        var evidence = studentRecommendation(learner);
        if (!evidence) {
          info.textContent = "Learning level is awaiting verified evidence. Your teacher must review the learner and class references.";
          return;
        }
        if (evidence.status === "recommendation-ready") {
          var level = evidence.finalLevel || evidence.recommendation;
          info.textContent = "PacEdu provisional recommendation for " + (learner.displayName || "this learner") + " (" + (learner.classLevel || "class not recorded") + "): " + (evidence.finalLevelLabel || evidence.recommendationLabel || level) + ". Teacher review is required before this is confirmed.";
        } else {
          info.textContent = (evidence.message || "Awaiting teacher-marked learning evidence.") + " The current level is only a neutral starting point; this is not a diagnosis or permanent label.";
        }
        return;
      }
      var scope = selectedStudentScope();
      var linkStatus = scope ?
        (record.linked ? "Saved for the selected student in this class. " :
          "No ability result is saved for this student yet. Use Day 1 evidence first; do not copy another learner's or a general ability setting. ") :
        "No student-and-class selection is active; changes will be saved as a general setting, not linked to an individual child. ";
      info.textContent = linkStatus + (GUIDANCE[s.value] || GUIDANCE.expected);
    }
    s.addEventListener("change", function () {
      set(s.value);
      showGuidance();
    });
    s.addEventListener("click", showGuidance);
    s.addEventListener("focus", showGuidance);
    s.addEventListener("input", showGuidance);
    s.addEventListener("pointerup", showGuidance);
    refreshCurrent = showGuidance;
    renderedHost = h;
    window.addEventListener("pacificEducationStudentChanged", showGuidance);
    document.addEventListener("pacificEducationStudentChanged", showGuidance);
    window.addEventListener("storage", showGuidance);
    document.addEventListener("pacificEducationCoverageRefresh", showGuidance);
    document.addEventListener("pacificEducationCapabilityChanged", showGuidance);
    document.addEventListener("pacificEducationAdaptiveLearningUpdated", showGuidance);
    document.addEventListener("pacificEducationEvidenceBasedAbilityUpdated", showGuidance);
    document.addEventListener("pacificEducationTermExaminationMarked", showGuidance);
    h.appendChild(l);
    h.appendChild(document.createElement("br"));
    h.appendChild(s);
    h.appendChild(info);
    showGuidance();
  }
  window.PacificEducationCapabilitySelector = Object.freeze({
    capabilities: C,
    getCapability: get,
    setCapability: set,
    initialise: init
  });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})(window, document);