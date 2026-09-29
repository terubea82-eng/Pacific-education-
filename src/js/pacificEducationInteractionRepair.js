/*
 * Pacific Education — Universal Interaction Repair Layer
 * Pilot-safe reliability layer: detects dead controls, reports runtime errors,
 * and re-initialises interactive modules without granting production authority.
 */
(function(window, document) {
  "use strict";

  var VERSION = "1.0.0";
  var errors = [];

  function status(text, isError) {
    var el = document.getElementById("pacificEducationInteractionStatus");
    if (!el) {
      var host = document.getElementById("systemStatus");
      if (!host) return;
      el = document.createElement("div");
      el.id = "pacificEducationInteractionStatus";
      el.setAttribute("aria-live", "polite");
      host.appendChild(el);
    }
    el.textContent = text;
    el.setAttribute("data-severity", isError ? "error" : "ok");
  }

  function reportError(message, source) {
    errors.push({
      message: String(message || "Unknown error"),
      source: String(source || "runtime"),
      at: new Date().toISOString()
    });
    errors = errors.slice(-50);
    try {
      localStorage.setItem("pacificEducationInteractionErrors", JSON.stringify(errors));
    } catch (e) {}
    status("Interaction issue detected in " + (source || "the application") + ". The pilot remains available; check System Status.", true);
  }

  function missingInlineHandlers() {
    var missing = [];
    var nodes = document.querySelectorAll("[onclick]");
    for (var i = 0; i < nodes.length; i += 1) {
      var code = nodes[i].getAttribute("onclick") || "";
      var match = code.match(/^\s*([A-Za-z_$][\w$]*)\s*\(/);
      if (match && typeof window[match[1]] !== "function") {
        missing.push(match[1]);
      }
    }
    return missing;
  }

  function repairControls() {
    var missing = missingInlineHandlers();
    if (missing.length) {
      reportError("Missing controls: " + missing.join(", "), "button wiring");
    }

    var controls = document.querySelectorAll("button, input, textarea, select");
    for (var i = 0; i < controls.length; i += 1) {
      var control = controls[i];
      if (control.tagName === "TEXTAREA" && !control.getAttribute("aria-label") && !control.id) {
        control.setAttribute("aria-label", "Feedback or response");
      }
      if (control.tagName === "BUTTON" && !control.hasAttribute("type")) {
        control.setAttribute("type", "button");
      }
    }

    var activity = window.PacificEducationActivity;
    if (!activity || typeof activity.render !== "function") {
      var activityStatus = document.getElementById("dailyLessonActivity");
      if (activityStatus) {
        activityStatus.setAttribute("data-interaction-status", "waiting");
      }
    }

    var renderer = window.PacificEducationCurriculumLessonRenderer;
    if (renderer && typeof renderer.initialise === "function") {
      try { renderer.initialise(); } catch (e) { reportError(e.message, "daily lesson renderer"); }
    }

    var guardian = window.PacificEducationGuardian;
    if (!guardian || typeof guardian.submitComment !== "function") {
      reportError("Pacific Guardian controller is unavailable.", "Guardian");
    } else if (typeof window.submitPacificGuardianComment !== "function") {
      window.submitPacificGuardianComment = guardian.submitPacificGuardianComment || function() {
        var input = document.getElementById("pacificGuardianComment");
        var result = guardian.submitComment(input ? input.value : "", {source:"guardian-comment-form", pilotOnly:true});
        var out = document.getElementById("pacificGuardianCommentStatus");
        if (out) out.textContent = result.message || result.acknowledgement || "Comment queued for Guardian review.";
        if (result.accepted && input) input.value = "";
        return result;
      };
    }

    status("Interactive controls checked. Pilot interaction layer is active.", false);
  }

  window.addEventListener("error", function(event) {
    reportError(event && event.message ? event.message : "JavaScript error", event && event.filename ? event.filename : "runtime");
  });

  window.addEventListener("unhandledrejection", function(event) {
    reportError(event && event.reason ? String(event.reason) : "Unhandled promise rejection", "promise");
  });

  window.PacificEducationInteractionRepair = Object.freeze({
    version: VERSION,
    repair: repairControls,
    getErrors: function() { return errors.slice(); },
    status: function() { return {version: VERSION, errors: errors.length}; }
  });

  function start() {
    repairControls();
    window.setTimeout(repairControls, 500);
    window.setTimeout(repairControls, 1500);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})(window, document);
