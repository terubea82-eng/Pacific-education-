/*
 * Pacific Education — Teacher Evidence Entry UI
 * Version 1.0.0
 * PROTOTYPE ONLY.
 */
(function(window, document) {
    "use strict";

    var VERSION = "1.0.0";
    var STATES = ["taught", "practised", "assessed", "covered"];

    function registry() {
        return window.PacificEducationCurriculumAlignmentRegistry || null;
    }

    function coverage() {
        return window.PacificEducationCurriculumCoverageEngine || null;
    }

    function renderer() {
        return window.PacificEducationCurriculumLessonRenderer || null;
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

        var items = indicators();

        target.innerHTML =
            '<div class="pacific-education-evidence-card">' +
            '<h2>Teacher Evidence</h2>' +
            '<p>Record what has been taught, practised, assessed, or covered.</p>' +
            '<div>' +
            '<label>Level <select id="pacificEducationEvidenceLevel">' +
            '<option value="">All levels</option><option>Class 1</option><option>Class 2</option>' +
            '<option>Class 3</option><option>Class 4</option><option>Class 5</option><option>Class 6</option>' +
            '<option>Form 1</option><option>Form 2</option><option>Form 3</option><option>Form 4</option>' +
            '<option>Form 5</option><option>Form 6</option><option>Form 7</option>' +
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
                return '<div class="pacific-education-evidence-row">' +
                    '<p><strong>' + escapeHtml(item.id) + '</strong><br>' +
                    escapeHtml(item.indicatorText) + '</p>' +
                    '<label>Status <select id="pacificEducationEvidenceStatus' + index + '">' +
                    '<option value="taught">Taught</option>' +
                    '<option value="practised">Practised</option>' +
                    '<option value="assessed">Assessed</option>' +
                    '<option value="covered">Covered</option>' +
                    '</select></label> ' +
                    '<label><input type="checkbox" id="pacificEducationEvidenceConfirm' + index + '"> Teacher confirmed</label> ' +
                    '<input id="pacificEducationEvidenceNotes' + index + '" type="text" placeholder="Optional notes"> ' +
                    '<button type="button" data-evidence-index="' + index + '">Save evidence</button>' +
                    '<span id="pacificEducationEvidenceResult' + index + '"></span>' +
                    '</div>';
            }).join("") : "<p>No curriculum indicators match the selected filters.</p>") +
            '</div></div>';

        ["Level", "Subject", "Term"].forEach(function(label) {
            var el = document.getElementById("pacificEducationEvidence" + label);
            if (el) el.value = get("pacificEducationEvidence" + label, "");
            if (el) el.addEventListener("change", function() { render(targetId); });
        });

        items.forEach(function(item, index) {
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
                    studentId: get("pacificEducationStudentId", null),
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
