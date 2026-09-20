/*
 * Pacific Education — Individual Student Progress Dashboard
 * Version 1.0.0
 * PROTOTYPE ONLY.
 */
(function(window, document) {
    "use strict";

    var VERSION = "1.0.0";

    function context() {
        return window.PacificEducationStudentCoverageContext || null;
    }

    function roster() {
        return window.PacificEducationTeacherClassRosterContext || null;
    }

    function coverage() {
        return window.PacificEducationCurriculumCoverageEngine || null;
    }

    function integrationPlanner() {
        return window.PacificEducationDailyIntegrationPlanner || null;
    }

    function dailyEngine() {
        return window.PacificEducationDailyCurriculumEngine || null;
    }

    function progressRecorder() {
        return window.PacificEducationDailyProgressRecorder || null;
    }

    function assessmentMap() {
        return window.PacificEducationCurriculumAssessmentMap || null;
    }

    function escapeHtml(value) {
        return String(value == null ? "" : value)
            .replace(/&/g, "&amp;").replace(/</g, "&lt;")
            .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }

    function render(targetId) {
        var target = document.getElementById(
            targetId || "pacificEducationStudentProgressDashboard"
        );

        if (!target) {
            return { success: false, error: "Student progress target unavailable" };
        }

        var c = context();
        var e = coverage();

        if (!c || !e) {
            target.innerHTML = "<p>Student progress dependencies unavailable.</p>";
            return { success: false, error: "Required dependencies unavailable" };
        }

        var studentId = c.getStudentId();
        var classContext = roster() ? roster().getContext() : { classId: null };

        if (!studentId) {
            target.innerHTML =
                '<div class="pacific-education-student-progress-card">' +
                '<h2>Student Progress</h2>' +
                '<p>Select a student from the teacher class roster first.</p>' +
                '</div>';
            return { success: true, selected: false, prototype: true };
        }

        var filters = { studentId: studentId };
        var summary = e.summarize(filters);
        var records = e.list(filters);
        var remaining = e.getRemaining(filters);

        var currentDay = 1;
        try {
            currentDay = Number(
                window.localStorage.getItem("pacificEducationCurrentDay") || 1
            );
        } catch (ignore) {}

        var level = "";
        var subjectId = "English";
        var term = "Term 1";

        try {
            level = window.localStorage.getItem("pacificEducationLevel") || "";
            subjectId = window.localStorage.getItem("pacificEducationSubject") || "English";
            term = window.localStorage.getItem("pacificEducationTerm") || "Term 1";
        } catch (ignore2) {}

        var dailyPlan = dailyEngine() &&
            typeof dailyEngine().generateDailyPlan === "function" ?
            dailyEngine().generateDailyPlan({
                dayNumber: currentDay,
                level: level || "Class 1",
                subjectId: subjectId,
                term: term,
                studentId: studentId
            }) : null;

        var integration = integrationPlanner() &&
            typeof integrationPlanner().build === "function" ?
            integrationPlanner().build({
                dayNumber: currentDay,
                level: level || "Class 1",
                subjectId: subjectId,
                term: term,
                studentId: studentId
            }) : null;

        var assessments = assessmentMap() &&
            typeof assessmentMap().getForIndicator === "function" ?
            (dailyPlan && dailyPlan.indicators.length ?
                assessmentMap().getForIndicator(dailyPlan.indicators[0].indicator.id) : []) : [];

        target.innerHTML =
            '<div class="pacific-education-student-progress-card">' +
            '<h2>Student Progress Dashboard</h2>' +
            '<p><strong>Student reference:</strong> ' + escapeHtml(studentId) + '</p>' +
            '<p><strong>Class:</strong> ' + escapeHtml(classContext.classId || "Not selected") + '</p>' +
            '<div class="pacific-education-progress-summary">' +
            '<div><strong>' + summary.totalIndicators + '</strong><span>Total</span></div>' +
            '<div><strong>' + summary.taught + '</strong><span>Taught</span></div>' +
            '<div><strong>' + summary.practised + '</strong><span>Practised</span></div>' +
            '<div><strong>' + summary.assessed + '</strong><span>Assessed</span></div>' +
            '<div><strong>' + summary.covered + '</strong><span>Covered</span></div>' +
            '<div><strong>' + summary.remaining + '</strong><span>Remaining</span></div>' +
            '</div>' +
            '<h3>Current Daily Learning</h3>' +
            '<p>Day ' + currentDay + ' — ' + escapeHtml(subjectId) +
            ' — ' + escapeHtml(term) + '</p>' +
            (dailyPlan && dailyPlan.success ?
                '<p>' + escapeHtml(
                    dailyPlan.indicators.length ?
                    dailyPlan.indicators[0].indicator.indicatorText :
                    "No indicator assigned for this day."
                ) + '</p>' : '<p>Daily plan unavailable.</p>') +
            '<h3>Daily 50/50 Integration</h3>' +
            '<p>Core: 50% &nbsp; | &nbsp; Integrated: 50%</p>' +
            '<p>' + escapeHtml(
                integration && integration.integrated ?
                String(integration.integrated.subjects.length) +
                " integrated subject connection(s) available." :
                "Integration plan unavailable."
            ) + '</p>' +
            '<h3>Daily Progress</h3><p>Record the current daily lesson for the selected student.</p><button type="button" id="pacificEducationRecordDailyProgress">Record Lesson as Taught</button> <button type="button" id="pacificEducationRecordDailyPractice">Record Practice</button> <button type="button" id="pacificEducationRecordDailyAssessment">Record Assessment</button><div id="pacificEducationDailyProgressMessage" role="status"></div>
<h3>Current Assessment Evidence</h3>' +
            '<p>' + (assessments.length ?
                escapeHtml(String(assessments.length) + " assessment record(s) linked.") :
                "No assessment records linked to the current indicator.") + '</p>' +
            '<h3>Remaining Achievements</h3>' +
            '<ul>' +
            (remaining.length ? remaining.slice(0, 50).map(function(item) {
                return '<li><strong>' + escapeHtml(item.id) + '</strong> — ' +
                    escapeHtml(item.indicatorText) + '</li>';
            }).join("") : "<li>No remaining indicators.</li>") +
            '</ul>' +
            '<p><small>Prototype only. Student reference data is not production identity or authorization.</small></p>' +
            '</div>';

        var recorder = progressRecorder();
        var message = target.querySelector("#pacificEducationDailyProgressMessage");
        function saveProgress(method) {
            if (!recorder || typeof recorder[method] !== "function") {
                if (message) message.textContent = "Daily Progress Recorder unavailable.";
                return;
            }
            var result = recorder[method]({
                level: level || "Class 1",
                subjectId: subjectId,
                term: term,
                dayNumber: currentDay,
                studentId: studentId
            });
            if (message) {
                message.textContent = result.success ?
                    "Progress recorded for Day " + currentDay + "." :
                    (result.error || "Progress could not be recorded.");
            }
            if (result.success) {
                render(targetId);
                document.dispatchEvent(new CustomEvent("pacificEducationCoverageRefresh"));
            }
        }
        var taughtButton = target.querySelector("#pacificEducationRecordDailyProgress");
        var practiceButton = target.querySelector("#pacificEducationRecordDailyPractice");
        var assessmentButton = target.querySelector("#pacificEducationRecordDailyAssessment");
        if (taughtButton) taughtButton.addEventListener("click", function() {
            saveProgress("completeDailyLesson");
        });
        if (practiceButton) practiceButton.addEventListener("click", function() {
            saveProgress("recordPractised");
        });
        if (assessmentButton) assessmentButton.addEventListener("click", function() {
            saveProgress("recordAssessed");
        });

        return {
            success: true,
            selected: true,
            studentId: studentId,
            classId: classContext.classId || null,
            summary: summary,
            dailyPlanAvailable: !!dailyPlan,
            integrationAvailable: !!integration,
            prototype: true
        };
    }

    function init() {
        return render("pacificEducationStudentProgressDashboard");
    }

    window.PacificEducationStudentProgressDashboardUI = Object.freeze({
        name: "PacificEducationStudentProgressDashboardUI",
        version: VERSION,
        render: render,
        init: init
    });

    document.addEventListener("pacificEducationCoverageRefresh", function() {
        render("pacificEducationStudentProgressDashboard");
    });

    document.addEventListener("pacificEducationStudentChanged", function() {
        render("pacificEducationStudentProgressDashboard");
    });

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})(window, document);
