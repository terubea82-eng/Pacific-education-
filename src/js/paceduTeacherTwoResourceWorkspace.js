/* PacEdu — two-resource teacher subject/class workspace.
 * Keeps teacher instructions and ability worksheets together after subject -> class selection.
 * Learner evidence is used only when an explicit reviewed mark exists for the same roster learner.
 * Camera photos remain pending until reviewed; no AI-marking claim is made.
 */
(function (window, document) {
  "use strict";
  var PANEL_ID = "paceduTeacherTwoResourcePanel";
  var RESPONSE_KEY = "pacificEducationActivityResponses";
  var BANDS = [
    { id: "support", label: "Supported start" },
    { id: "developing", label: "Developing" },
    { id: "expected", label: "Working at class goal" },
    { id: "extension", label: "Extension / deeper challenge" }
  ];
  function node(tag, value) {
    var el = document.createElement(tag);
    if (value != null) el.textContent = value;
    return el;
  }
  function readResponses() {
    try {
      var value = JSON.parse(window.localStorage.getItem(RESPONSE_KEY) || "[]");
      return Array.isArray(value) ? value : [];
    } catch (_) { return []; }
  }
  function priorReviewedEvidence(studentRef, classId, subject) {
    var rows = readResponses();
    var valid = rows.filter(function (r) {
      var status = String(r.reviewStatus || r.markingStatus || "").toLowerCase();
      var reviewed = ["teacher-reviewed", "reviewed", "teacher-approved", "marked"].indexOf(status) >= 0 ||
        r.teacherReviewed === true || r.teacherApproved === true;
      var rawMark = r.markPercent != null ? r.markPercent : r.scorePercent != null ? r.scorePercent :
        r.mark != null ? r.mark : r.score != null ? r.score : null;
      var hasMark = rawMark !== null && rawMark !== "" && Number.isFinite(Number(rawMark));
      return reviewed && hasMark &&
        String(r.studentReference || r.studentRef || "") === String(studentRef) &&
        String(r.classId || "") === String(classId) &&
        String(r.subject || r.subjectId || "").toLowerCase() === String(subject || "").toLowerCase();
    });
    if (!valid.length) return null;
    valid.sort(function (a, b) {
      return Number(b.day || b.dayNumber || 0) - Number(a.day || a.dayNumber || 0);
    });
    return valid[0];
  }
  function bandFor(mark) {
    var n = Number(mark);
    if (!Number.isFinite(n)) return null;
    if (n < 40) return "support";
    if (n < 60) return "developing";
    if (n < 80) return "expected";
    return "extension";
  }
  function render() {
    var list = document.getElementById("paceduTeacherClassList");
    var planPanel = document.getElementById("pacificEducationLinkedTeacherPlans");
    if (!list || !planPanel || document.getElementById(PANEL_ID)) return;
    var selectedClass = list.querySelector('[data-pacedu-teacher-class][aria-pressed="true"]');
    if (!selectedClass) return;
    var subjectButton = document.querySelector('[data-pacedu-teacher-subject][aria-pressed="true"]');
    var subject = subjectButton ? subjectButton.getAttribute("data-pacedu-teacher-subject") : "English";
    var classId = selectedClass.getAttribute("data-pacedu-teacher-class") || "";
    var roster = window.PacificEducationTeacherClassRosterContext;
    var classInfo = null;
    try { classInfo = roster && classId && roster.getClass ? roster.getClass(classId) : null; } catch (_) {}
    var panel = node("section");
    panel.id = PANEL_ID;
    panel.setAttribute("aria-label", "Teacher instructions and student ability worksheets");
    panel.style.cssText = "margin:14px 0;padding:14px;border:2px solid #7bb9e8;border-radius:12px;";
    panel.appendChild(node("h3", subject + " — " + selectedClass.textContent.trim()));
    panel.appendChild(node("p", "Only two resource types are provided here. Use a learner's latest reviewed evidence when available; missing or pending work does not mean low ability."));
    /* Keep the visible workspace to the two requested resource types.
       Existing linked-plan actions remain callable by the resource-1 buttons. */
    Array.prototype.forEach.call(planPanel.querySelectorAll("button"), function (b) {
      var label = String(b.textContent || "").trim().toLowerCase();
      if (label === "download plan (.txt)") b.hidden = true;
      if (label === "print / save as pdf") b.hidden = true;
    });
    var instructions = node("section");
    instructions.setAttribute("aria-label", "Resource type 1: teacher instructions");
    instructions.appendChild(node("h4", "1. Teacher Instructions — Read or Print"));
    instructions.appendChild(node("p", "Daily teaching instructions, lesson/workplan, activity examples, achievement-indicator reference, assessment check and access adjustments. Official indicator alignment must be verified before teaching."));
    var load = node("button", "Load today's teacher instructions");
    load.type = "button";
    load.addEventListener("click", function () {
      var loadButton = Array.prototype.find.call(planPanel.querySelectorAll("button"), function (b) {
        return /load matching plans/i.test(b.textContent || "");
      });
      if (loadButton) loadButton.click();
      var status = document.getElementById("paceduLinkedPlanStatus");
      if (status) status.textContent = "Teacher instructions loaded. Check the achievement-indicator verification status before teaching.";
    });
    instructions.appendChild(load);
    var print = node("button", "Print teacher instructions / Save as PDF");
    print.type = "button";
    print.style.cssText = "display:block;margin-top:8px;min-height:44px;padding:10px;";
    print.addEventListener("click", function () {
      var existing = Array.prototype.find.call(planPanel.querySelectorAll("button"), function (b) {
        return String(b.textContent || "").trim().toLowerCase() === "print / save as pdf";
      });
      if (existing && !existing.disabled) existing.click();
      else {
        var loadButton = Array.prototype.find.call(planPanel.querySelectorAll("button"), function (b) {
          return /load matching plans/i.test(b.textContent || "");
        });
        if (loadButton) loadButton.click();
        var status = document.getElementById("paceduLinkedPlanStatus");
        if (status) status.textContent = "Load matching plans first, then print the teacher instructions.";
      }
    });
    instructions.appendChild(print);
    panel.appendChild(instructions);
    var worksheets = node("section");
    worksheets.setAttribute("aria-label", "Resource type 2: student ability worksheets");
    worksheets.style.cssText = "margin-top:14px;padding-top:12px;border-top:1px solid #c8d7e2;";
    worksheets.appendChild(node("h4", "2. Student Ability Worksheets — Download Separately"));
    worksheets.appendChild(node("p", "Choose the class, subject, term and one ability group to download its printable worksheet pack. Class-wide files never include learner IDs."));
    var evidence = node("div");
    evidence.setAttribute("aria-label", "Learner roster and previous-day reviewed evidence");
    var students = classInfo && Array.isArray(classInfo.studentRefs) ? classInfo.studentRefs : [];
    var groupCounts = { support: 0, developing: 0, expected: 0, extension: 0 };
    var levelValue = String(classInfo && (classInfo.level || classInfo.className) || selectedClass.textContent.trim());
    if (!students.length) {
      evidence.appendChild(node("p", "No learner references are connected to this class roster yet. Do not assign an individual ability group until the roster is linked."));
    } else {
      var rosterList = node("ul");
      students.forEach(function (ref) {
        var row = node("li");
        var mark = priorReviewedEvidence(ref, classId, subject);
        var rawMark = mark && (mark.markPercent != null ? mark.markPercent : mark.scorePercent != null ? mark.scorePercent : mark.mark != null ? mark.mark : mark.score);
        var band = mark ? BANDS.filter(function (b) { return b.id === bandFor(rawMark); })[0] : null;
        if (band) groupCounts[band.id] += 1;
        row.textContent = String(ref) + " — " + (mark ?
          "Reviewed mark found (Day " + String(mark.day || mark.dayNumber || "?") + "); provisional worksheet recommendation: " + (band ? band.label : "manual review required") :
          "No reviewed mark found for this subject; ability group remains unconfirmed.");
        rosterList.appendChild(row);
      });
      evidence.appendChild(rosterList);
    }
    worksheets.appendChild(evidence);
    var api = window.PacEduDownloadableClassPacks;
    if (api && typeof api.download === "function") {
      var termLabel = node("label", "Term for today's worksheets");
      termLabel.style.cssText = "display:block;margin:10px 0;font-weight:600;";
      var termSelect = node("select");
      termSelect.style.cssText = "display:block;width:100%;padding:10px;margin-top:5px;font:inherit;";
      [["T1","Term 1 — 9 weeks"],["T2","Term 2 — 9 weeks"],["T3","Term 3 — 5 weeks"]].forEach(function (item) {
        var option = node("option", item[1]); option.value = item[0]; termSelect.appendChild(option);
      });
      var savedTerm = String(window.localStorage.getItem("pacificEducationTerm") || "T1");
      if (/^T[123]$/.test(savedTerm)) termSelect.value = savedTerm;
      termLabel.appendChild(termSelect);
      worksheets.appendChild(termLabel);
      var groupHeading = node("h5", "Download only the groups supported by reviewed evidence");
      worksheets.appendChild(groupHeading);
      var groupStatus = node("p", "");
      groupStatus.setAttribute("role", "status");
      groupStatus.setAttribute("aria-live", "polite");
      if (!students.length) {
        groupStatus.textContent = "Link this class to its registered learner roster before printing individual ability assignments.";
      } else if (!Object.keys(groupCounts).some(function (id) { return groupCounts[id] > 0; })) {
        groupStatus.textContent = "No reviewed marks are available for this subject yet. Use the teacher instructions and baseline assessment first; PacEdu will not guess an ability group.";
      } else {
        groupStatus.textContent = "Counts below include only roster learners with an explicitly reviewed mark for this subject. Missing or pending evidence is excluded.";
      }
      worksheets.appendChild(groupStatus);
      BANDS.forEach(function (band) {
        var count = groupCounts[band.id] || 0;
        var button = node("button", count ? "Download " + band.label + " worksheets (" + count + " learner(s))" : band.label + " — no reviewed learners in this group");
        button.type = "button";
        button.disabled = !students.length || count === 0;
        button.style.cssText = "display:block;width:100%;min-height:46px;padding:10px;margin:7px 0;text-align:left;";
        button.addEventListener("click", function () {
          if (!count) return;
          try {
            var pack = api.download({ level: levelValue, subject: subject, term: termSelect.value, ability: band.id });
            groupStatus.textContent = "Prepared " + pack.dailyActivities + " activities for " + band.label + ". Check the downloaded file and verify syllabus mapping before assigning.";
          } catch (error) {
            groupStatus.textContent = "Could not prepare this worksheet pack: " + String(error && error.message || error);
          }
        });
        worksheets.appendChild(button);
      });
      if (!students.length || !Object.keys(groupCounts).some(function (id) { return groupCounts[id] > 0; })) {
        var baseline = node("p", "For a new class or Day 1 baseline, the teacher must review the baseline activity and deliberately select an appropriate ability group. Do not treat absent work as a low score.");
        worksheets.appendChild(baseline);
      }
    } else worksheets.appendChild(node("p", "The worksheet download builder is not available in this session."));
    panel.appendChild(worksheets);
    planPanel.appendChild(panel);
  }
  function reset() {
    var old = document.getElementById(PANEL_ID);
    if (old && old.parentNode) old.parentNode.removeChild(old);
  }
  document.addEventListener("click", function (event) {
    var classButton = event.target && event.target.closest ? event.target.closest("[data-pacedu-teacher-class]") : null;
    var subjectButton = event.target && event.target.closest ? event.target.closest("[data-pacedu-teacher-subject]") : null;
    if (classButton || subjectButton) {
      reset();
      window.setTimeout(render, 0);
    }
  });
  window.PacEduTeacherTwoResourceWorkspace = Object.freeze({
    render: render,
    priorReviewedEvidence: priorReviewedEvidence,
    recommendedBand: bandFor
  });
})(window, document);
