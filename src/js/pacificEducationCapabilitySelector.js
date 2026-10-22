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
    var scope = selectedStudentScope();
    var v = null;
    var source = "general";
    try {
      if (scope) {
        v = window.localStorage.getItem(studentStorageKey(scope));
        if (v) source = "student";
      }
      if (!v) {
        v = window.localStorage.getItem("pacificEducationCapability");
        source = "general";
      }
    } catch (e) { v = null; }
    if (!C.some(function (x) { return x.id === v; })) {
      return { capability: "expected", source: "default", linked: false };
    }
    return { capability: v, source: source, linked: source === "student" };
  }
  function get() { return getRecord().capability; }
  function set(v) {
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
      var record = getRecord();
      s.value = record.capability;
      var scope = selectedStudentScope();
      var linkStatus = scope ?
        (record.linked ? "Saved for the selected student in this class. " :
          "No ability record is saved for this student yet; this is a general/default value until an observed result is saved. ") :
        "No student-and-class selection is active; changes will be saved as a general setting, not linked to an individual child. ";
      info.textContent = linkStatus + (GUIDANCE[s.value] || GUIDANCE.expected);
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