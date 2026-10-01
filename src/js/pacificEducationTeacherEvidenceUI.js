/*
 * Pacific Education — Teacher Evidence Entry UI
 * Version 1.0.0
 * PROTOTYPE ONLY.
 */
(function(window, document) {
    "use strict";

    var VERSION = "1.1.0";
    var STATES = ["not-started", "taught", "practised", "assessed", "covered"];

    function registry() {
        return window.PacificEducationCurriculumAlignmentRegistry || null;
    }

    function coverage() {
        return window.PacificEducationCurriculumCoverageEngine || null;
    }

    function renderer() {
        return window.PacificEducationCurriculumLessonRenderer || null;
    }

    function rosterContext() { return window.PacificEducationTeacherClassRosterContext || null; }

    function studentContext() {
        return window.PacificEducationStudentCoverageContext || null;
    }

    function escapeHtml(value) {
        return String(value == null ? "" : value)
            .replace(/&/g, "&amp;").replace(/</g, "&lt;")
            .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }

    function get(id, fallback) {
        var el = document.getElementById(id);
        return el && el.value ? el.value : fallback;
    }

    function indicators() {
        var r = registry();
        if (!r || typeof r.list !== "function") return [];
        return r.list({
            level: get("pacificEducationEvidenceLevel", null),
            subjectId: get("pacificEducationEvidenceSubject", null),
            term: get("pacificEducationEvidenceTerm", null)
        });
    }

    function render(targetId) {
        var target = document.getElementById(targetId || "pacificEducationTeacherEvidence");
        if (!target) return { success: false, error: "Teacher evidence target unavailable" };

        var roster = rosterContext();
        var classCtx = roster && typeof roster.getContext === "function" ? roster.getContext() : null;
        if (!classCtx || !classCtx.classId) { target.innerHTML = "<p>Select an existing Class Reference before entering curriculum evidence.</p>"; return { success:false, error:"Class Reference required" }; }
        var items = indicators();

        target.innerHTML =
            '<div class="pacific-education-evidence-card" id="pacificTeacherEvidenceWorkspace">' +
            '<h2>CURRICULUM EVIDENCE — TEACHER CONFIRMATION</h2>' +
            '<p><strong>Separate from Daily Activities.</strong> Record evidence for each curriculum indicator here. These evidence records are not part of the student\'s Daily Activities Days 1–365 sequence.</p>' +
            '<div>' +
            '<label>Level <select id="pacificEducationEvidenceLevel">' +
            '<option value="">All levels</option><option>Class 1</option><option>Class 2</option>' +
            '<option>Class 3</option><option>Class 4</option><option>Class 5</option><option>Class 6</option>' +
            '<option>Class 7</option><option>Class 8</option><option>Class 9</option><option>Class 10</option>' +
            '<option>Class 11</option><option>Class 12</option><option>Class 13</option>' +
            '</select></label> ' +
            '<label>Subject <select id="pacificEducationEvidenceSubject">' +
            '<option value="">All subjects</option><option>English</option><option>Mathematics</option>' +
            '<option>Science</option><option>Social Science</option><option>Health & Physical Education</option>' +
            '<option>Arts</option><option>Technology</option><option>Other / Integrated Learning</option>' +
            '</select></label> ' +
            '<label>Term <select id="pacificEducationEvidenceTerm">' +
            '<option value="">All terms</option><option>Term 1</option><option>Term 2</option><option>Term 3</option>' +
            '</select></label></div>' +
            '<div id="pacificEducationEvidenceList">' +
            (items.length ? items.map(function(item, index) {
                var saved = coverage() && typeof coverage().get === "function" ?
                    coverage().get(item.id, get("pacificEducationStudentId", null)) : null;
                var savedStatus = saved && STATES.indexOf(saved.status) >= 0 ? saved.status : "not-started";
                var savedNotes = saved && saved.notes ? saved.notes : "";
                var savedConfirmed = !!(saved && saved.teacherConfirmed);
                return '<article class="pacific-education-evidence-row" id="pacificEvidenceCard' + index + '" style="margin:12px 0;padding:14px;border:1px solid currentColor;border-radius:8px;">' +
                    '<h3 style="margin-top:0;">Curriculum Indicator ' + escapeHtml(item.id) + '</h3>' +
                    '<p><strong>Achievement Indicator:</strong><br>' + escapeHtml(item.indicatorText) + '</p>' +
                    '<label>Status <select id="pacificEducationEvidenceStatus' + index + '">' +
                    '<option value="not-started">Not started</option>' +
                    '<option value="taught">Taught</option>' +
                    '<option value="practised">Practised</option>' +
                    '<option value="assessed">Assessed</option>' +
                    '<option value="covered">Covered</option>' +
                    '</select></label> ' +
                    '<label><input type="checkbox" id="pacificEducationEvidenceConfirm' + index + '"> Teacher confirmed</label> ' +
                    '<input id="pacificEducationEvidenceNotes' + index + '" type="text" placeholder="Optional notes" value="' + escapeHtml(savedNotes) + '"> ' +
                    '<button type="button" data-evidence-index="' + index + '" data-pacific-action="save-teacher-evidence">Save Evidence</button>' +
                    '<span style="margin-left:8px;">' + (saved ? "Saved: " + escapeHtml(savedStatus) : "Not yet saved") + '</span>' +
                    '<span id="pacificEducationEvidenceResult' + index + '" role="status" aria-live="polite"></span>' +
                    '</div>';
            }).join("") : "<p>No curriculum indicators match the selected filters.</p>") +
            '</div></div>';

        ["Level", "Subject", "Term"].forEach(function(label) {
            var el = document.getElementById("pacificEducationEvidence" + label);
            if (el) el.value = get("pacificEducationEvidence" + label, "");
            if (el) el.addEventListener("change", function() { render(targetId); });
        });

        items.forEach(function(item, index) {
            var saved = coverage() && typeof coverage().get === "function" ?
                coverage().get(item.id, get("pacificEducationStudentId", null)) : null;
            var statusEl = document.getElementById("pacificEducationEvidenceStatus" + index);
            var confirmEl = document.getElementById("pacificEducationEvidenceConfirm" + index);
            if (statusEl) statusEl.value = saved && STATES.indexOf(saved.status) >= 0 ? saved.status : "not-started";
            if (confirmEl) confirmEl.checked = !!(saved && saved.teacherConfirmed);
            var button = document.querySelector('[data-evidence-index="' + index + '"]');
            if (!button) return;

            button.addEventListener("click", function() {
                var e = coverage();
                if (!e || typeof e.record !== "function") return;

                var status = get("pacificEducationEvidenceStatus" + index, "taught");
                var confirmed = !!document.getElementById("pacificEducationEvidenceConfirm" + index).checked;
                var notes = get("pacificEducationEvidenceNotes" + index, "");

                var result = e.record({
                    indicatorId: item.id,
                    studentId: (studentContext() && typeof studentContext().getStudentId === "function" ? studentContext().getStudentId() : get("pacificEducationStudentId", null)),
                    classId: classCtx.classId,
                    level: classCtx.level || null,
                    subjectId: get("pacificEducationEvidenceSubject", null),
                    term: get("pacificEducationEvidenceTerm", null),
                    assessmentId: null,
                    evidenceType: "teacher-entry",
                    status: status,
                    teacherConfirmed: confirmed,
                    notes: notes,
                    date: new Date().toISOString()
                });

                var output = document.getElementById("pacificEducationEvidenceResult" + index);
                if (output) {
                    output.textContent = result.success ?
                        " Saved." : " " + result.error;
                }

                var dashboard = window.PacificEducationCurriculumCoverageDashboardUI;
                if (dashboard && typeof dashboard.render === "function") dashboard.render();

                var lesson = renderer();
                if (lesson && typeof lesson.generateAndRender === "function") lesson.generateAndRender();
            });
        });

        return { success: true, indicatorCount: items.length, prototype: true };
    }

    function init() {
        return render("pacificEducationTeacherEvidence");
    }

    window.PacificEducationTeacherEvidenceUI = Object.freeze({
        name: "PacificEducationTeacherEvidenceUI",
        version: VERSION,
        states: STATES,
        render: render,
        init: init
    });

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})(window, document);
