(function(window, document) {
  "use strict";
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
      return context && context.role === "student" && context.displayName &&
        /^Class (?:[1-9]|1[0-3])$/.test(context.classLevel) ? context : null;
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
  function get() {
    var context = activeStudentContext();
    /* Student sessions never read the device-wide ability key. */
    if (context) {
      var result = studentRecommendation(context);
      if (result && result.status === "recommendation-ready") {
        var recommended = result.finalLevel || result.recommendation;
        if (validCapability(recommended)) return recommended;
      }
      return validCapability(context.capability) ? context.capability : "expected";
    }
    var v = window.localStorage.getItem("pacificEducationCapability");
    return validCapability(v) ? v : "expected";
  }
  function set(v) {
    /* Students do not self-select an ability level; PacEdu derives a provisional recommendation from marked evidence. */
    if (activeStudentContext()) return false;
    if (!validCapability(v)) return false;
    try {
      var context = activeStudentContext();
      if (context) {
        context.capability = v;
        window.sessionStorage.setItem(STUDENT_CONTEXT_KEY, JSON.stringify(context));
      }
      /* Retain this key for existing lesson-renderer integrations and non-student pilot use. */
      window.localStorage.setItem("pacificEducationCapability", v);
    } catch (error) {
      return false;
    }
    if (window.PacificEducationCurriculumLessonRenderer &&
        typeof window.PacificEducationCurriculumLessonRenderer.refresh === "function") {
      window.PacificEducationCurriculumLessonRenderer.refresh();
    }
    return true;
  }
  function init() {
    var h = document.getElementById("pacificEducationCapabilitySelector");
    if (!h) return;
    h.textContent = "";
    var l = document.createElement("label");
    l.htmlFor = "pacificEducationCapability";
    l.textContent = activeStudentContext()
      ? "Learning level — set by PacEdu from marked evidence"
      : "Ability guidance (teacher / general pilot use)";
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
      var context = activeStudentContext();
      if (context) {
        if (context.identityVerified !== true || !context.studentId || !context.classId) {
          info.textContent = "Learning level is not yet recommended. Enter the exact school-issued learner reference and ask the teacher to add it to the correct class roster. PacEdu will not match by name or count unverified work.";
          return;
        }
        var result = studentRecommendation(context);
        if (!result) {
          info.textContent = "Evidence service is not available yet. The current level is only a neutral starting point; no ability recommendation has been made.";
          return;
        }
        if (result.status === "recommendation-ready") {
          info.textContent = "Provisional PacEdu recommendation: " + (result.recommendationLabel || result.recommendation) +
            ". Based on " + result.markedActivities + " teacher-marked daily activities and a term examination (" +
            result.examPercentage + "%). Teacher review is required before this is confirmed. " +
            (result.review && result.review.status ? "Teacher review: " + result.review.status + "." : "Awaiting teacher review.") +
            " This is not a diagnosis or permanent label.";
          return;
        }
        info.textContent = (result.message || "Awaiting sufficient marked learning evidence.") +
          " The current level is only a neutral starting point, not an ability judgement. Your teacher reviews any provisional recommendation.";
        return;
      }
      info.textContent = "General ability guidance. " + (GUIDANCE[s.value] || GUIDANCE.expected);
    }
    s.addEventListener("change", function () {
      set(s.value);
      showGuidance();
    });
    s.addEventListener("click", showGuidance);
    s.addEventListener("focus", showGuidance);
    document.addEventListener("pacificEducationEvidenceBasedAbilityUpdated", function() {
      showGuidance();
      if (window.PacificEducationCurriculumLessonRenderer &&
          typeof window.PacificEducationCurriculumLessonRenderer.refresh === "function") {
        try { window.PacificEducationCurriculumLessonRenderer.refresh(); } catch (error) {}
      }
    });
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