/* Pacific Education — Owner / Control Guardian Evidence Workspace
 * v1.0.0 — controlled pilot only.
 * Displays Guardian pilot evidence without granting production authority.
 */
(function (window, document) {
  "use strict";

  var MAX = 50;

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"]/g, function (c) {
      return { "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[c];
    });
  }

  function getGuardianStatus() {
    var guardian = window.PacificEducationPacificGuardian;
    if (!guardian || typeof guardian.getStatus !== "function") {
      return { version: "unavailable", events: [] };
    }
    return guardian.getStatus() || { version: "unknown", events: [] };
  }

  function render() {
    var anchor = document.getElementById("pacificEducationPilotUserWorkspaces");
    if (!anchor || document.getElementById("pacificEducationOwnerGuardianEvidence")) return;

    var section = document.createElement("section");
    section.id = "pacificEducationOwnerGuardianEvidence";
    section.setAttribute("aria-label", "Owner Guardian evidence");
    section.style.marginTop = "16px";
    section.style.padding = "14px";
    section.style.border = "2px solid currentColor";

    section.innerHTML =
      "<h3>Owner / Control — Pacific Guardian Pilot Evidence</h3>" +
      "<p><strong>Status:</strong> <span id=\"ownerGuardianEvidenceStatus\">Loading...</span></p>" +
      "<p><strong>Important:</strong> This register records pilot evidence only. It does not approve production, authenticate users, or change release eligibility.</p>" +
      "<div id=\"ownerGuardianEvidenceList\"></div>";

    anchor.parentNode.insertBefore(section, anchor.nextSibling);
    refresh();
  }

  function refresh() {
    var section = document.getElementById("pacificEducationOwnerGuardianEvidence");
    if (!section) return;

    var status = getGuardianStatus();
    var events = Array.isArray(status.events) ? status.events.slice(-MAX).reverse() : [];
    var statusNode = document.getElementById("ownerGuardianEvidenceStatus");
    var list = document.getElementById("ownerGuardianEvidenceList");

    if (statusNode) {
      statusNode.textContent = events.length
        ? events.length + " recent Guardian audit event(s) recorded"
        : "No Guardian pilot evidence recorded yet";
    }

    if (!list) return;

    if (!events.length) {
      list.innerHTML = "<p>No pilot evidence is available yet.</p>";
      return;
    }

    list.innerHTML = events.map(function (event) {
      var details = event && event.details && typeof event.details === "object"
        ? event.details
        : {};
      var reviewStatus = details.reviewStatus || details.detail && details.detail.reviewStatus || "";
      var capability = details.capability || details.detail && details.detail.capability || "";
      var nextActivity = details.nextActivity || details.detail && details.detail.nextActivity || "";

      return "<article style=\"margin:8px 0;padding:10px;border:1px solid currentColor\">" +
        "<strong>" + escapeHtml(event.type || "guardian_event") + "</strong>" +
        "<br><small>" + escapeHtml(event.timestamp || "") + "</small>" +
        (reviewStatus ? "<br>Review: " + escapeHtml(reviewStatus) : "") +
        (capability ? "<br>Capability: " + escapeHtml(capability) : "") +
        (nextActivity ? "<br>Next activity: " + escapeHtml(nextActivity) : "") +
        "<br><small>Pilot evidence only • production authority: false</small>" +
        "</article>";
    }).join("");
  }

  function initialise() {
    render();
    refresh();
  }

  window.PacificEducationOwnerGuardianEvidence = Object.freeze({
    version: "1.0.0",
    render: render,
    refresh: refresh
  });

  window.addEventListener("pacificEducationTeacherReviewCompleted", refresh);
  window.addEventListener("pacificEducationAdaptiveLearningUpdated", refresh);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialise);
  } else {
    initialise();
  }
})(window);
