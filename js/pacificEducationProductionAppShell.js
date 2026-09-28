/* Pacific Education — production app shell integration layer.
 * Connects separated learning services and the authenticated external-review portal
 * without allowing them to bypass authorization, human review, curriculum verification
 * or production gates.
 */
(function (window, document) {
  "use strict";
  var VERSION = "1.1.0";
  var state = { activeActivity: null };

  function el(id) { return document.getElementById(id); }
  function text(value) { return String(value == null ? "" : value); }

  function render(target, title, body) {
    var node = el(target);
    if (!node) return;
    node.innerHTML = "<h3>" + title + "</h3><div>" + body + "</div>";
  }

  function currentActivity() {
    var lesson = window.PacificEducationDailyLessons;
    var day = lesson && typeof lesson.getCurrentCoreDay === "function" ? lesson.getCurrentCoreDay() : 1;
    var data = lesson && typeof lesson.getDailyLesson === "function" ? lesson.getDailyLesson(day) : null;
    return data || { id: "daily-day-" + day, title: "Daily Lesson", objective: "Complete today's learning activity." };
  }

  function runGuarded(task, payload) {
    var guardian = window.PacificEducationPacificGuardian;
    if (guardian && typeof guardian.checkAccess === "function") {
      var access = guardian.checkAccess();
      if (access && access.allowed === false) return { blocked: true, reason: "guardian_access_blocked" };
    }
    var allocation = window.PacificEducationAIAllocation;
    return allocation && typeof allocation.handoff === "function"
      ? allocation.handoff("workflow", task, payload)
      : { allowed: false, reason: "ai_allocation_unavailable" };
  }

  function openTeacherGuide() {
    var activity = currentActivity();
    var result = runGuarded("teacherGuide", { activity: activity });
    if (result.blocked || !result.allowed) return render("pacificEducationTeacherGuideStudio", "Teacher Guide", "Access or AI allocation is not available.");
    var guide = window.PacificEducationTeacherGuideAI && window.PacificEducationTeacherGuideAI.prepare
      ? window.PacificEducationTeacherGuideAI.prepare(activity) : null;
    render("pacificEducationTeacherGuideStudio", "Teacher Guide", guide ?
      "<p><strong>Objective:</strong> " + text(guide.objective || activity.objective) + "</p><ol>" + (guide.steps || []).map(function (s) { return "<li>" + text(s) + "</li>"; }).join("") + "</ol><p><strong>Teacher review:</strong> required.</p>" : "Teacher Guide AI is not loaded.");
  }

  function openEssayStudio() {
    var result = runGuarded("essayStudio", { activity: currentActivity() });
    if (result.blocked || !result.allowed) return render("pacificEducationEssayStudio", "Essay Studio", "Access or AI allocation is not available.");
    var studio = window.PacificEducationEssayStudio;
    var data = studio && studio.create ? studio.create(currentActivity()) : null;
    render("pacificEducationEssayStudio", "Essay Studio", data ? "<p>Use the guided writing process. The student remains the author.</p><ol>" + (data.steps || []).map(function (s) { return "<li>" + text(s) + "</li>"; }).join("") + "</ol>" : "Essay Studio is not loaded.");
  }

  function openProjectsStudio() {
    var result = runGuarded("projectsStudio", { activity: currentActivity() });
    if (result.blocked || !result.allowed) return render("pacificEducationProjectsStudio", "Projects Studio", "Access or AI allocation is not available.");
    var studio = window.PacificEducationProjectsStudio;
    var data = studio && studio.create ? studio.create(currentActivity()) : null;
    render("pacificEducationProjectsStudio", "Projects Studio", data ? "<p>Project evidence must be genuine and reviewable.</p><ol>" + (data.steps || []).map(function (s) { return "<li>" + text(s) + "</li>"; }).join("") + "</ol>" : "Projects Studio is not loaded.");
  }

  function showAccessibility() {
    var a = window.PacificEducationAccessibilitySupport;
    var modes = a && a.responseModes ? a.responseModes : ["write", "speak", "draw", "match", "sequence", "demonstrate", "evidence_photo", "picture_select", "listen_and_answer"];
    render("pacificEducationAccessibilityStudio", "Accessibility Support", "<p>Choose an appropriate way to demonstrate the same learning goal.</p><ul>" + modes.map(function (m) { return "<li>" + text(m) + "</li>"; }).join("") + "</ul><p>Formal standards are not silently changed; authorized accommodations remain subject to review.</p>");
  }

  function ensureExternalReviewerPortal() {
    if (window.PacificEducationExternalReviewerPortal && typeof window.PacificEducationExternalReviewerPortal.render === "function") {
      window.PacificEducationExternalReviewerPortal.render();
      return;
    }
    var script = document.createElement("script");
    script.src = "js/pacificEducationExternalReviewerPortal.js";
    script.onload = function () {
      if (window.PacificEducationExternalReviewerPortal) window.PacificEducationExternalReviewerPortal.render();
    };
    script.onerror = function () {
      var app = el("app");
      if (app && !el("pacificEducationExternalReviewerPortal")) {
        var section = document.createElement("section");
        section.id = "pacificEducationExternalReviewerPortal";
        section.innerHTML = "<h2>External Professional Review Portal</h2><p>Reviewer portal could not be loaded in this build.</p>";
        app.appendChild(section);
      }
    };
    document.head.appendChild(script);
  }

  function init() {
    [
      ["pacificEducationTeacherGuideStudio", "Teacher Guide"],
      ["pacificEducationEssayStudio", "Essay Studio"],
      ["pacificEducationProjectsStudio", "Projects Studio"],
      ["pacificEducationAccessibilityStudio", "Accessibility Support"]
    ].forEach(function (item) {
      var app = el("app");
      if (app && !el(item[0])) {
        var s = document.createElement("section");
        s.id = item[0];
        s.innerHTML = "<h2>" + item[1] + "</h2><p>Available from the learning workspace.</p>";
        app.appendChild(s);
      }
    });
    var app = el("app");
    if (app && !el("pacificEducationProductionLearningTools")) {
      var controls = document.createElement("section");
      controls.id = "pacificEducationProductionLearningTools";
      controls.setAttribute("aria-label", "Learning tools");
      controls.innerHTML = "<h2>Learning Tools</h2><button type=\"button\" id=\"openTeacherGuideAI\">Teacher Guide</button><button type=\"button\" id=\"openEssayStudio\">Essay Studio</button><button type=\"button\" id=\"openProjectsStudio\">Projects Studio</button><button type=\"button\" id=\"openAccessibilityStudio\">Accessibility Support</button>";
      app.insertBefore(controls, el("dailyLesson"));
    }
    if (el("openTeacherGuideAI")) el("openTeacherGuideAI").onclick = openTeacherGuide;
    if (el("openEssayStudio")) el("openEssayStudio").onclick = openEssayStudio;
    if (el("openProjectsStudio")) el("openProjectsStudio").onclick = openProjectsStudio;
    if (el("openAccessibilityStudio")) el("openAccessibilityStudio").onclick = showAccessibility;
    ensureExternalReviewerPortal();
    window.PacificEducationProductionAppShell.ready = true;
  }

  window.PacificEducationProductionAppShell = {
    version: VERSION,
    state: state,
    init: init,
    openTeacherGuide: openTeacherGuide,
    openEssayStudio: openEssayStudio,
    openProjectsStudio: openProjectsStudio,
    showAccessibility: showAccessibility,
    ensureExternalReviewerPortal: ensureExternalReviewerPortal
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})(window, document);
