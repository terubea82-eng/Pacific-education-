/*
 * Pacific Education — Teacher Class Dashboard UI
 * Version 1.0.0
 * PROTOTYPE ONLY.
 */
(function(window, document) {
    "use strict";

    var VERSION = "1.0.0";

    function roster() {
        return window.PacificEducationTeacherClassRosterContext || null;
    }

    function coverage() {
        return window.PacificEducationCurriculumCoverageEngine || null;
    }

    function lessonRenderer() {
        return window.PacificEducationCurriculumLessonRenderer || null;
    }

    function escapeHtml(value) {
        return String(value == null ? "" : value)
            .replace(/&/g, "&amp;").replace(/</g, "&lt;")
            .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }

    function render(targetId) {
        var target = document.getElementById(targetId || "pacificEducationTeacherClassDashboard");
        if (!target) return { success: false, error: "Teacher class dashboard target unavailable" };

        var r = roster();
        var e = coverage();

        if (!r || !e) {
            target.innerHTML = "<p>Teacher class dashboard dependencies unavailable.</p>";
            return { success: false, error: "Required dependencies unavailable" };
        }

        var context = r.getContext();
        var students = context.studentRefs || [];
        var classId = context.classId || "No class selected";
        var selectedStudent = window.PacificEducationStudentCoverageContext &&
            typeof window.PacificEducationStudentCoverageContext.getStudentId === "function" ?
            window.PacificEducationStudentCoverageContext.getStudentId() : "";

        var rows = students.map(function(studentRef) {
            var summary = e.summarize({ studentId: studentRef });
            var stageRecords = e.list({ studentId: studentRef }).filter(function(item) { return item && item.evidenceType === "indicator-stage"; });
            return {
                studentId: studentRef,
                summary: summary,
                stageCompleted: stageRecords.length
            };
        });

        target.innerHTML =
            '<div class="pacific-education-teacher-class-dashboard">' +
            '<h2>Teacher Class Dashboard</h2>' +
            '<p><strong>Class:</strong> ' + escapeHtml(classId) + '</p>' +
            '<p>Prototype progress view. Student references are shown instead of child personal details.</p>' +
            '<div class="pacific-education-class-progress">' +
            '<table><thead><tr><th>Student Reference</th><th>Total</th><th>Taught</th>' +
            '<th>Practised</th><th>Stages</th><th>Assessed</th><th>Covered</th><th>Remaining</th></tr></thead><tbody>' +
            (rows.length ? rows.map(function(row) {
                return '<tr' + (row.studentId === selectedStudent ? ' data-selected="true"' : '') + '>' +
                    '<td><button type="button" data-student="' + escapeHtml(row.studentId) + '">' +
                    escapeHtml(row.studentId) + '</button></td>' +
                    '<td>' + row.summary.totalIndicators + '</td>' +
                    '<td>' + row.summary.taught + '</td>' +
                    '<td>' + row.summary.practised + '</td>' +
                    '<td>' + row.stageCompleted + '</td>' +
                    '<td>' + row.summary.assessed + '</td>' +
                    '<td>' + row.summary.covered + '</td>' +
                    '<td>' + row.summary.remaining + '</td></tr>';
            }).join("") : '<tr><td colspan="8">No students in the selected class.</td></tr>') +
            '</tbody></table></div>' +
            '<div id="pacificEducationSelectedStudentProgress"></div><div id="pacificEducationTeacherIndicatorStageDetails"></div>' +
            '<p><small>Prototype only. This dashboard does not establish production authorization or identity.</small></p>' +
            '</div>';

        Array.prototype.forEach.call(target.querySelectorAll("[data-student]"), function(button) {
            button.addEventListener("click", function() {
                var result = r.selectStudent(button.getAttribute("data-student"));
                if (result.success) {
                    render(targetId);
                    var detailTarget = target.querySelector("#pacificEducationTeacherIndicatorStageDetails");
                    if (detailTarget) {
                        var detailRecords = e.list({ studentId: button.getAttribute("data-student") }).filter(function(item) { return item && item.evidenceType === "indicator-stage"; });
                        detailTarget.innerHTML = "<h3>Completed Achievement Indicator Stages</h3>" + (detailRecords.length ? "<ul>" + detailRecords.map(function(item) { return "<li><strong>" + escapeHtml(item.indicatorId || "Indicator") + "</strong> — " + escapeHtml(item.activityType || "stage") + "</li>"; }).join("") + "</ul>" : "<p>No indicator stages recorded yet.</p>");
                    }
                    var lesson = lessonRenderer();
                    if (lesson && typeof lesson.generateAndRender === "function") {
                        lesson.generateAndRender();
                    }
                    document.dispatchEvent(new CustomEvent("pacificEducationCoverageRefresh"));
                }
            });
        });

        return {
            success: true,
            classId: context.classId,
            studentCount: students.length,
            selectedStudent: selectedStudent || null,
            rows: rows,
            prototype: true
        };
    }

    function init() {
        return render("pacificEducationTeacherClassDashboard");
    }

    window.PacificEducationTeacherClassDashboardUI = Object.freeze({
        name: "PacificEducationTeacherClassDashboardUI",
        version: VERSION,
        render: render,
        init: init
    });

    document.addEventListener("pacificEducationCoverageRefresh", function() {
        render("pacificEducationTeacherClassDashboard");
    });

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})(window, document);
