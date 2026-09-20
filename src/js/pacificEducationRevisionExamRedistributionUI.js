/*
 * Pacific Education — Revision & Examination Redistribution UI
 * Version 1.0.0
 * PROTOTYPE ONLY.
 *
 * Teacher-entered revision/exam dates are treated as scheduling inputs.
 * Official curriculum authority remains external to this prototype.
 */
(function(window, document) {
    "use strict";

    var VERSION = "1.1.0";

    function scheduler() {
        return window.PacificEducationRevisionExamScheduler || null;
    }

    function remainingEngine() {
        return window.PacificEducationRemainingAchievementRedistributionEngine || null;
    }

    function config() {
        var level = "Class 1", subjectId = "English", term = "Term 1", day = 1;
        try {
            level = localStorage.getItem("pacificEducationLevel") || level;
            subjectId = localStorage.getItem("pacificEducationSubject") || subjectId;
            term = localStorage.getItem("pacificEducationTerm") || term;
            day = Number(localStorage.getItem("pacificEducationCurrentDay") || 1);
        } catch (ignore) {}
        return { level: level, subjectId: subjectId, term: term, startDay: day, endDay: 365 };
    }

    function escapeHtml(value) {
        return String(value == null ? "" : value)
            .replace(/&/g, "&amp;").replace(/</g, "&lt;")
            .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }

    function addRevision(dayNumber) {
        var s = scheduler();
        if (!s || typeof s.addRevisionDay !== "function") {
            return { success: false, error: "Revision/Exam Scheduler unavailable" };
        }
        var raw = window.prompt("Enter indicator ID(s) for revision, separated by commas:");
        var ids = raw ? raw.split(",").map(function(v){ return v.trim(); }).filter(Boolean) : [];
        return s.addRevisionDay(Number(dayNumber), null, ids, null);
    }

    function addExam(dayNumber) {
        var s = scheduler();
        if (!s || typeof s.addExamDay !== "function") {
            return { success: false, error: "Revision/Exam Scheduler unavailable" };
        }
        var raw = window.prompt("Enter covered indicator ID(s), separated by commas:");
        var ids = raw ? raw.split(",").map(function(v){ return v.trim(); }).filter(Boolean) : [];
        return s.addExamDay(Number(dayNumber), null, ids, null);
    }

    function rebuild() {
        var e = remainingEngine();
        if (!e || typeof e.buildRemainingPlan !== "function") {
            return { success: false, error: "Remaining redistribution engine unavailable" };
        }
        return e.buildRemainingPlan(config());
    }

    function render(targetId) {
        var target = document.getElementById(
            targetId || "pacificEducationRevisionExamRedistribution"
        );
        if (!target) return { success: false, error: "Revision/exam UI target unavailable" };

        var s = scheduler();
        if (!s) {
            target.innerHTML = "<p>Revision/Exam Scheduler unavailable.</p>";
            return { success: false, error: "Scheduler unavailable" };
        }

        var cfg = config();
        var plan = rebuild();
        var calendar = [];
        for (var day = cfg.startDay; day <= cfg.endDay; day++) {
            var item = typeof s.getCalendarDay === "function" ? s.getCalendarDay(day) : null;
            if (item && (item.type === "revision" || item.type === "exam")) {
                calendar.push(item);
            }
        }

        target.innerHTML =
            '<div class="pacific-education-revision-exam-ui">' +
            '<h2>Revision & Examination Redistribution</h2>' +
            '<p>Enter teacher scheduling days. Remaining achievements recalculate around them.</p>' +
            '<label>Revision day <input id="pacificEducationRevisionDay" type="number" min="1" max="365"></label>' +
            '<button type="button" id="pacificEducationAddRevisionDay">Add Revision Day</button>' +
            '<label>Examination day <input id="pacificEducationExamDay" type="number" min="1" max="365"></label>' +
            '<button type="button" id="pacificEducationAddExamDay">Add Examination Day</button>' +
            '<div id="pacificEducationRevisionExamMessage" role="status"></div>' +
            '<h3>Scheduled Days</h3>' +
            '<ul>' +
            (calendar.length ? calendar.map(function(item) {
                return '<li>Day ' + escapeHtml(item.dayNumber) + ' — ' +
                    escapeHtml(item.type) + '</li>';
            }).join("") : '<li>No revision or examination days entered.</li>') +
            '</ul>' +
            '<h3>Updated Redistribution</h3>' +
            '<p>' + (plan.success ?
                escapeHtml(String(plan.uncoveredIndicatorCount) +
                    " eligible uncovered indicator(s) across " + String(plan.teachingDayCount) +
                    " remaining teaching day(s)." +
                    (plan.blockedIndicatorCount ? " " + String(plan.blockedIndicatorCount) + " indicator(s) remain blocked pending source verification." : "")) :
                escapeHtml(plan.error || "Redistribution unavailable.")) + '</p>' +
            '<p><small>Prototype only. Production teacher authorization and curriculum approval are required.</small></p>' +
            '</div>';

        var message = target.querySelector("#pacificEducationRevisionExamMessage");

        target.querySelector("#pacificEducationAddRevisionDay").addEventListener("click", function() {
            var value = Number(target.querySelector("#pacificEducationRevisionDay").value);
            var result = addRevision(value);
            if (message) message.textContent = result.success ?
                "Revision Day " + value + " added. Redistribution recalculated." :
                (result.error || "Could not add revision day.");
            if (result.success) {
                render(targetId);
                document.dispatchEvent(new CustomEvent("pacificEducationScheduleChanged"));
            }
        });

        target.querySelector("#pacificEducationAddExamDay").addEventListener("click", function() {
            var value = Number(target.querySelector("#pacificEducationExamDay").value);
            var result = addExam(value);
            if (message) message.textContent = result.success ?
                "Examination Day " + value + " added. Redistribution recalculated." :
                (result.error || "Could not add examination day.");
            if (result.success) {
                render(targetId);
                document.dispatchEvent(new CustomEvent("pacificEducationScheduleChanged"));
            }
        });

        return { success: true, scheduledDays: calendar, redistribution: plan, prototype: true };
    }

    function init() {
        render("pacificEducationRevisionExamRedistribution");
    }

    window.PacificEducationRevisionExamRedistributionUI = Object.freeze({
        name: "PacificEducationRevisionExamRedistributionUI",
        version: VERSION,
        addRevision: addRevision,
        addExam: addExam,
        rebuild: rebuild,
        render: render,
        init: init
    });

    document.addEventListener("pacificEducationCoverageRefresh", function() {
        render("pacificEducationRevisionExamRedistribution");
    });
    document.addEventListener("pacificEducationScheduleChanged", function() {
        render("pacificEducationRevisionExamRedistribution");
    });
    document.addEventListener("pacificEducationDayChanged", function() {
        render("pacificEducationRevisionExamRedistribution");
    });

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})(window, document);
