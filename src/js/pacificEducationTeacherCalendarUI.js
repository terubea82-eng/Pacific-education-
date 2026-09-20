/*
 * Pacific Education
 * Teacher Calendar Interface
 * Version 1.0.0
 *
 * Visible prototype interface for teacher-entered school calendar
 * settings, holidays, revision days and examination days.
 *
 * PROTOTYPE ONLY. Production calendar data and permissions require
 * secure server-side controls and official school-calendar validation.
 */
(function(window) {
    "use strict";

    var VERSION = "1.0.0";

    function calendar() {
        return window.PacificEducationTeacherCalendar || null;
    }

    function scheduler() {
        return window.PacificEducationRevisionExamScheduler || null;
    }

    function get(id) {
        return document.getElementById(id);
    }

    function status(message) {
        var node = get("pacificEducationCalendarStatus");
        if (node) node.textContent = message;
    }

    function value(id) {
        var node = get(id);
        return node ? node.value : "";
    }

    function saveStartDate() {
        var cal = calendar();
        var date = value("pacificEducationSchoolStartDate");

        if (!cal || typeof cal.configure !== "function" || !date) {
            status("Please enter a valid school start date.");
            return false;
        }

        cal.configure({ startDate: date });
        status("School start date saved for this prototype session.");
        refreshSummary();
        refreshDistribution();
        return true;
    }

    function addHoliday() {
        var cal = calendar();
        var date = value("pacificEducationHolidayDate");

        if (!cal || typeof cal.addHoliday !== "function" || !date) {
            status("Please enter a holiday date.");
            return false;
        }

        cal.addHoliday(date);
        status("Holiday added: " + date);
        refreshSummary();
        refreshDistribution();
        return true;
    }

    function addRevision() {
        var sched = scheduler();
        var day = value("pacificEducationRevisionDay");

        if (!sched || typeof sched.addRevisionDay !== "function") {
            status("Revision scheduler unavailable.");
            return false;
        }

        var result = sched.addRevisionDay(day);
        if (!result.success) {
            status(result.error || "Revision day could not be added.");
            return false;
        }

        status("Revision day added: Day " + day);
        refreshSummary();
        refreshDistribution();
        return true;
    }

    function addExam() {
        var sched = scheduler();
        var day = value("pacificEducationExamDay");

        if (!sched || typeof sched.addExamDay !== "function") {
            status("Examination scheduler unavailable.");
            return false;
        }

        var result = sched.addExamDay(day);
        if (!result.success) {
            status(result.error || "Examination day could not be added.");
            return false;
        }

        status("Examination day added: Day " + day);
        refreshSummary();
        refreshDistribution();
        return true;
    }

    function refreshSummary() {
        var cal = calendar();
        if (!cal || typeof cal.getConfiguration !== "function") return;

        var config = cal.getConfiguration();

        var holiday = get("pacificEducationHolidayList");
        if (holiday) {
            holiday.textContent =
                "Holidays recorded: " + config.holidays.length;
        }

        var revision = get("pacificEducationRevisionList");
        if (revision) {
            revision.textContent =
                "Revision days recorded: " +
                (config.revisionDayNumbers || []).length;
        }

        var exam = get("pacificEducationExamList");
        if (exam) {
            exam.textContent =
                "Examination days recorded: " +
                (config.examDayNumbers || []).length;
        }

        var start = get("pacificEducationSchoolStartStatus");
        if (start) {
            start.textContent =
                "School start date: " + (config.startDate || "Not set");
        }
    }

    function refreshDistribution() {
        var engine = window.PacificEducationAchievementDistributionEngine;
        if (!engine || typeof engine.distribute !== "function") return;

        var level =
            window.localStorage.getItem("pacificEducationLevel") || "Class 1";
        var subject =
            window.localStorage.getItem("pacificEducationSubject") || "English";
        var term =
            window.localStorage.getItem("pacificEducationTerm") || "Term 1";

        var result = engine.distribute({
            level: level,
            subjectId: subject,
            term: term,
            startDay: 1,
            endDay: 365
        });

        var node = get("pacificEducationDistributionStatus");
        if (node) {
            node.textContent =
                "Learning days available: " +
                result.availableLearningDays +
                " • Indicators distributed: " +
                result.assignments.length;
        }
    }

    function createUI() {
        var host = get("pacificEducationTeacherCalendar");
        if (!host) return false;

        host.innerHTML =
            '<h2>Teacher School Calendar</h2>' +
            '<p><strong>PROTOTYPE ONLY:</strong> Teacher-entered calendar data is local prototype data and is not production authorization or official school-calendar data.</p>' +
            '<label for="pacificEducationSchoolStartDate">School start date</label><br>' +
            '<input type="date" id="pacificEducationSchoolStartDate">' +
            '<button type="button" id="pacificEducationSaveStartDate">Save Start Date</button>' +
            '<p id="pacificEducationSchoolStartStatus" aria-live="polite"></p>' +
            '<hr>' +
            '<label for="pacificEducationHolidayDate">Holiday date</label><br>' +
            '<input type="date" id="pacificEducationHolidayDate">' +
            '<button type="button" id="pacificEducationAddHoliday">Add Holiday</button>' +
            '<p id="pacificEducationHolidayList">Holidays recorded: 0</p>' +
            '<hr>' +
            '<label for="pacificEducationRevisionDay">Revision day number (1–365)</label><br>' +
            '<input type="number" id="pacificEducationRevisionDay" min="1" max="365" value="1">' +
            '<button type="button" id="pacificEducationAddRevision">Add Revision Day</button>' +
            '<p id="pacificEducationRevisionList">Revision days recorded: 0</p>' +
            '<hr>' +
            '<label for="pacificEducationExamDay">Examination day number (1–365)</label><br>' +
            '<input type="number" id="pacificEducationExamDay" min="1" max="365" value="1">' +
            '<button type="button" id="pacificEducationAddExam">Add Examination Day</button>' +
            '<p id="pacificEducationExamList">Examination days recorded: 0</p>' +
            '<hr>' +
            '<p id="pacificEducationDistributionStatus" aria-live="polite"></p>' +
            '<p id="pacificEducationCalendarStatus" aria-live="polite">Calendar interface ready.</p>';

        get("pacificEducationSaveStartDate").addEventListener("click", saveStartDate);
        get("pacificEducationAddHoliday").addEventListener("click", addHoliday);
        get("pacificEducationAddRevision").addEventListener("click", addRevision);
        get("pacificEducationAddExam").addEventListener("click", addExam);

        refreshSummary();
        refreshDistribution();
        return true;
    }

    function initialise() {
        createUI();
        return {
            version: VERSION,
            prototype: true
        };
    }

    window.PacificEducationTeacherCalendarUI = Object.freeze({
        name: "PacificEducationTeacherCalendarUI",
        version: VERSION,
        createUI: createUI,
        initialise: initialise,
        refreshSummary: refreshSummary,
        refreshDistribution: refreshDistribution
    });

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialise);
    } else {
        initialise();
    }
})(window);
