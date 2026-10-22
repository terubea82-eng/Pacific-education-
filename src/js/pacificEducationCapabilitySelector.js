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
  function get() {
    var context = activeStudentContext();
    /* Never inherit another child's globally saved ability when a student session is active. */
    var v = context ? context.capability : window.localStorage.getItem("pacificEducationCapability");
    return validCapability(v) ? v : "expected";
  }
  function set(v) {
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
    l.textContent = "Ability (choose from observed evidence)";
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
    var info = document.createElement("div");
    info.id = "pacificEducationCapabilityGuidance";
    info.setAttribute("role", "status");
    info.setAttribute("aria-live", "polite");
    info.style.cssText = "display:block!important;visibility:visible!important;opacity:1!important;margin:10px 0;padding:12px;border:2px solid #7bb9e8;border-radius:8px;background:#eef8ff;color:#17324d;line-height:1.5;white-space:normal;";
    function showGuidance() {
      var context = activeStudentContext();
      var prefix = context
        ? "Ability guidance for " + context.displayName + " (" + context.classLevel + "). "
        : "General ability guidance. ";
      info.textContent = prefix + (GUIDANCE[s.value] || GUIDANCE.expected);
    }
    s.addEventListener("change", function () {
      set(s.value);
      showGuidance();
    });
    s.addEventListener("click", showGuidance);
    s.addEventListener("focus", showGuidance);
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