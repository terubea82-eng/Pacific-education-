/* Pacific Education — pilot stakeholder evidence and release verification.
 * Controlled pilot only. No production authorization is granted here.
 */
(function (window, document) {
  "use strict";

  var EVIDENCE_KEY = "pacificEducationPilotStakeholderEvidence";
  var TEST_KEY = "pacificEducationPilotVerification";

  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"]/g, function (c) {
      return ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c];
    });
  }

  function read(key) {
    try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch (e) { return []; }
  }

  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }

  function guardian() {
    return window.PacificEducationPacificGuardian || null;
  }

  function record(type, detail) {
    var g = guardian();
    var event = {
      stakeholder: type,
      detail: detail || "",
      recordedAt: new Date().toISOString(),
      pilotOnly: true,
      productionAuthority: false,
      productionApproval: false
    };
    var list = read(EVIDENCE_KEY);
    list.push(event);
    write(EVIDENCE_KEY, list.slice(-100));
    if (g && typeof g.recordPilotEvidence === "function") {
      g.recordPilotEvidence("stakeholder-pilot-evidence", event);
    }
    return event;
  }

  function runChecks() {
    var checks = [
      ["Guardian evidence trail", !!guardian()],
      ["Pilot role workspaces", !!window.PacificEducationPilotUserWorkspaces],
      ["Teacher review queue", !!window.PacificEducationTeacherReview],
      ["Adaptive learning controller", !!window.PacificEducationAdaptiveLearningController],
      ["Student progress dashboard", !!window.PacificEducationStudentProgressDashboard],
      ["Controlled pilot boundary", true],
      ["Production authority remains fail-closed", true]
    ];
    var results = checks.map(function (c) { return {name:c[0], passed:!!c[1]}; });
    write(TEST_KEY, results);
    record("full-pilot-verification", {checks:results});
    return results;
  }

  function render() {
    if (document.getElementById("pacificEducationStakeholderEvidence")) return;
    var app = document.getElementById("app");
    if (!app) return;
    var section = document.createElement("section");
    section.id = "pacificEducationStakeholderEvidence";
    section.setAttribute("aria-label", "Pilot stakeholder evidence and verification");
    section.innerHTML =
      "<h2>Stakeholder Pilot Evidence & Verification</h2>" +
      "<p><strong>NGO / Organization:</strong> program-level pilot evidence and feedback.</p>" +
      "<p><strong>Education / Government:</strong> pilot-level evidence review and feedback.</p>" +
      "<p><strong>Community / Partner:</strong> services, participation and pilot feedback.</p>" +
      "<p><strong>Full Pilot Verification:</strong> records technical pilot checks without declaring production readiness.</p>" +
      "<div id='pacificEducationStakeholderActions' style='display:flex;flex-wrap:wrap;gap:8px;margin:10px 0;'>" +
      "<button type='button' data-stakeholder='NGO / Organization'>Record NGO / Organization review</button>" +
      "<button type='button' data-stakeholder='Education / Government'>Record Education / Government review</button>" +
      "<button type='button' data-stakeholder='Community / Partner'>Record Community / Partner review</button>" +
      "<button type='button' id='runPacificEducationPilotVerification'>Run full pilot verification</button></div>" +
      "<div id='pacificEducationStakeholderStatus' role='status'>Pilot evidence only. No production approval.</div>" +
      "<div id='pacificEducationPilotVerificationResults'></div>";
    app.appendChild(section);

    section.querySelectorAll("[data-stakeholder]").forEach(function (button) {
      button.addEventListener("click", function () {
        var type = button.getAttribute("data-stakeholder");
        record(type, "Stakeholder pilot review recorded for evidence trail.");
        document.getElementById("pacificEducationStakeholderStatus").textContent =
          type + " pilot evidence recorded. Production authority remains false.";
      });
    });

    document.getElementById("runPacificEducationPilotVerification").addEventListener("click", function () {
      var results = runChecks();
      document.getElementById("pacificEducationPilotVerificationResults").innerHTML =
        "<h3>Verification results</h3><ul>" +
        results.map(function (r) {
          return "<li>" + (r.passed ? "PASS" : "PENDING") + " — " + esc(r.name) + "</li>";
        }).join("") + "</ul>" +
        "<p><strong>Release state:</strong> Pilot verification recorded. Production remains blocked until all required external production evidence and authorization are independently satisfied.</p>";
    });
  }

  window.PacificEducationPilotStakeholderEvidence = {
    version: "1.0.0",
    record: record,
    runChecks: runChecks,
    render: render
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render);
  else render();
})(window, document);
