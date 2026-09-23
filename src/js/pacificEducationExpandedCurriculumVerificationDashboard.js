/* Pacific Education — Expanded Curriculum Verification Dashboard
 * v1.0.0
 * Read-only pilot workspace for Class 7–13 (Form 1–7) expanded activities.
 * Verification evidence must come from authoritative Fiji curriculum sources.
 */
(function () {
  "use strict";

  var STATES = ["unverified","source-reviewed","curriculum-verified","owner-approved","production-approved"];

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
      .replace(/"/g,"&quot;").replace(/'/g,"&#39;");
  }

  function queue() {
    return window.PacificEducationExpandedCurriculumMappingQueue;
  }

  function getRecords(filters) {
    var q = queue();
    if (!q || typeof q.list !== "function") return [];
    return q.list(filters || {}) || [];
  }

  function summary() {
    var q = queue();
    if (q && typeof q.summary === "function") return q.summary();
    var records = getRecords({});
    var out = { total: records.length };
    STATES.forEach(function (s) { out[s] = records.filter(function (r) { return r.verificationStatus === s; }).length; });
    return out;
  }

  function render(targetId) {
    var target = document.getElementById(targetId || "pacificEducationExpandedCurriculumVerificationDashboard");
    if (!target) return;
    var q = queue();
    if (!q) {
      target.innerHTML = "<p><strong>Verification queue unavailable.</strong> Load the expanded curriculum mapping queue first.</p>";
      return;
    }

    var s = summary();
    var records = getRecords({});
    var forms = [];
    var subjects = [];
    records.forEach(function (r) {
      if (forms.indexOf(r.level) < 0) forms.push(r.level);
      if (subjects.indexOf(r.subjectId) < 0) subjects.push(r.subjectId);
    });
    forms.sort();
    subjects.sort();

    target.innerHTML =
      '<h2>Expanded Curriculum Verification Dashboard</h2>' +
      '<div role="note" style="border:2px solid #b36b00;padding:12px;margin:10px 0;">' +
      '<strong>PILOT VERIFICATION WORKSPACE:</strong> No activity is official Fiji curriculum-aligned until authoritative Fiji curriculum evidence is entered and reviewed. This dashboard does not grant production approval.' +
      '</div>' +
      '<p><strong>Total Class 7–13 (Form 1–7) pilot activities:</strong> ' + esc(s.total || 0) + '</p>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin:10px 0;">' +
      STATES.map(function (state) {
        return '<span style="border:1px solid #999;border-radius:6px;padding:8px;"><strong>' +
          esc(state) + '</strong>: ' + esc(s[state] || 0) + '</span>';
      }).join("") + '</div>' +
      '<label>Form <select id="pevcFormFilter"><option value="">All</option>' +
      forms.map(function (x) { return '<option value="' + esc(x) + '">' + esc(x) + '</option>'; }).join("") +
      '</select></label> ' +
      '<label>Subject <select id="pevcSubjectFilter"><option value="">All</option>' +
      subjects.map(function (x) { return '<option value="' + esc(x) + '">' + esc(x) + '</option>'; }).join("") +
      '</select></label> ' +
      '<label>Verification <select id="pevcStateFilter"><option value="">All</option>' +
      STATES.map(function (x) { return '<option value="' + esc(x) + '">' + esc(x) + '</option>'; }).join("") +
      '</select></label> ' +
      '<button type="button" id="pevcRefresh">Refresh queue</button>' +
      '<div id="pevcResults" style="overflow:auto;margin-top:12px;"></div>';

    function updateTable() {
      var form = document.getElementById("pevcFormFilter").value;
      var subject = document.getElementById("pevcSubjectFilter").value;
      var state = document.getElementById("pevcStateFilter").value;
      var rows = getRecords({
        level: form || undefined,
        subjectId: subject || undefined,
        verificationStatus: state || undefined
      });
      var sourceVerifier = window.PacificEducationCurriculumSourceVerification || null;
      var workflowGuard = window.PacificEducationCurriculumVerificationWorkflowGuard || null;
      rows = rows.map(function (r) {
        var sourceRecord = sourceVerifier && typeof sourceVerifier.get === "function"
          ? sourceVerifier.get(r.activityId) : null;
        var workflow = workflowGuard && typeof workflowGuard.evaluate === "function"
          ? workflowGuard.evaluate(r.activityId) : null;
        return {
          record: r,
          sourceStatus: sourceRecord ? sourceRecord.verificationStatus : null,
          sourceReference: sourceRecord && sourceRecord.source
            ? (sourceRecord.source.reference || sourceRecord.sourceReference || "") : (sourceRecord ? sourceRecord.sourceReference || "" : ""),
          workflowReady: workflow ? workflow.blockers.length === 0 : false,
          workflowBlockers: workflow ? workflow.blockers : ["No matching authoritative source-verification record."]
        };
      });
      var html = '<p><strong>Existing source-verification workflow is checked by activity ID:</strong> no source record is created automatically. <strong>Showing:</strong> ' + esc(rows.length) + ' record(s)</p>' +
        '<table style="width:100%;border-collapse:collapse;min-width:900px;"><thead><tr>' +
        ["Activity ID","Form","Subject","Topic","Queue status","Official source","Achievement indicator","Source workflow","Workflow readiness"].map(function (h) {
          return '<th scope="col" style="border:1px solid #aaa;padding:7px;text-align:left;">' + h + '</th>';
        }).join("") + '</tr></thead><tbody>';

      if (!rows.length) {
        html += '<tr><td colspan="7" style="border:1px solid #aaa;padding:10px;">No matching records.</td></tr>';
      } else {
        rows.slice(0, 300).forEach(function (item) {
          var r = item.record;
          var workflowText = item.workflowReady ? "Ready for guarded review" : "Blocked — " + item.workflowBlockers.join(" ");
          html += '<tr>' +
            '<td style="border:1px solid #aaa;padding:7px;">' + esc(r.activityId) + '</td>' +
            '<td style="border:1px solid #aaa;padding:7px;">' + esc(r.level) + '</td>' +
            '<td style="border:1px solid #aaa;padding:7px;">' + esc(r.subjectId) + '</td>' +
            '<td style="border:1px solid #aaa;padding:7px;">' + esc(r.topic) + '</td>' +
            '<td style="border:1px solid #aaa;padding:7px;">' + esc(r.verificationStatus) + '</td>' +
            '<td style="border:1px solid #aaa;padding:7px;">' + esc(item.sourceReference || "No matching source record") + '</td>' +
            '<td style="border:1px solid #aaa;padding:7px;">' + esc(r.achievementIndicatorId || "Not entered") + '</td>' +
            '<td style="border:1px solid #aaa;padding:7px;">' + esc(item.sourceStatus || "unregistered") + '</td>' +
            '<td style="border:1px solid #aaa;padding:7px;">' + esc(workflowText) + '</td>' +
            '</tr>';
        });
      }
      html += '</tbody></table>';
      if (rows.length > 300) html += '<p>First 300 records shown in this prototype view.</p>';
      document.getElementById("pevcResults").innerHTML = html;
    }

    ["pevcFormFilter","pevcSubjectFilter","pevcStateFilter"].forEach(function (id) {
      document.getElementById(id).addEventListener("change", updateTable);
    });
    document.getElementById("pevcRefresh").addEventListener("click", function () {
      if (typeof q.rebuild === "function") q.rebuild();
      render(targetId);
    });
    updateTable();
  }

  window.PacificEducationExpandedCurriculumVerificationDashboard = {
    version: "1.0.0",
    render: render,
    getSummary: summary
  };

  document.addEventListener("DOMContentLoaded", function () {
    render("pacificEducationExpandedCurriculumVerificationDashboard");
  });
})();