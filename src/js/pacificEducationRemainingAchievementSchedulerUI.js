/*
 * Pacific Education — Remaining Achievement Scheduler UI
 * Version 1.0.0
 * PROTOTYPE ONLY.
 *
 * Displays redistribution of uncovered achievements across remaining
 * available learning days. It does not alter official curriculum.
 */
(function(window, document) {
    "use strict";

    var VERSION = "1.0.0";

    function engine() {
        return window.PacificEducationRemainingAchievementRedistributionEngine || null;
    }

    function getConfig() {
        var day = 1, level = "Class 1", subjectId = "English", term = "Term 1";
        try {
            day = Number(localStorage.getItem("pacificEducationCurrentDay") || 1);
            level = localStorage.getItem("pacificEducationLevel") || level;
            subjectId = localStorage.getItem("pacificEducationSubject") || subjectId;
            term = localStorage.getItem("pacificEducationTerm") || term;
        } catch (ignore) {}
        return {
            startDay: day,
            endDay: 365,
            dayNumber: day,
            level: level,
            subjectId: subjectId,
            term: term
        };
    }

    function escapeHtml(value) {
        return String(value == null ? "" : value)
            .replace(/&/g, "&amp;").replace(/</g, "&lt;")
            .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }

    function build() {
        var e = engine();
        if (!e || typeof e.buildRemainingPlan !== "function") {
            return { success: false, error: "Remaining Achievement Redistribution Engine unavailable" };
        }
        return e.buildRemainingPlan(getConfig());
    }

    function render(targetId) {
        var target = document.getElementById(
            targetId || "pacificEducationRemainingAchievementScheduler"
        );
        if (!target) return { success: false, error: "Scheduler target unavailable" };

        var plan = build();
        if (!plan.success) {
            target.innerHTML = "<p>" + escapeHtml(plan.error) + "</p>";
            return plan;
        }

        var current = getConfig().startDay;
        var days = (plan.days || []).filter(function(d) {
            return d.dayNumber >= current;
        }).slice(0, 30);

        target.innerHTML =
            '<div class="pacific-education-remaining-scheduler">' +
            '<h2>Remaining Achievement Scheduler</h2>' +
            '<p>Uncovered achievements are distributed across available learning days.</p>' +
            '<p><strong>Remaining indicators:</strong> ' + plan.uncoveredIndicatorCount +
            ' &nbsp; <strong>Teaching days:</strong> ' + plan.teachingDayCount + '</p>' +
            '<table><thead><tr><th>Day</th><th>Indicators</th></tr></thead><tbody>' +
            (days.length ? days.map(function(day) {
                return '<tr><td>Day ' + escapeHtml(day.dayNumber) + '</td><td>' +
                    day.indicators.map(function(item) {
                        return '<div><strong>' + escapeHtml(item.indicatorId) +
                            '</strong> — ' + escapeHtml(item.indicator.indicatorText) + '</div>';
                    }).join("") +
                    '</td></tr>';
            }).join("") :
            '<tr><td colspan="2">No remaining indicators in the selected range.</td></tr>') +
            '</tbody></table>' +
            '<p><small>Prototype only. Official curriculum approval and production scheduling are not established here.</small></p>' +
            '</div>';

        return plan;
    }

    function init() {
        render("pacificEducationRemainingAchievementScheduler");
    }

    window.PacificEducationRemainingAchievementSchedulerUI = Object.freeze({
        name: "PacificEducationRemainingAchievementSchedulerUI",
        version: VERSION,
        getConfig: getConfig,
        build: build,
        render: render,
        init: init
    });

    document.addEventListener("pacificEducationCoverageRefresh", function() {
        render("pacificEducationRemainingAchievementScheduler");
    });

    document.addEventListener("pacificEducationDayChanged", function() {
        render("pacificEducationRemainingAchievementScheduler");
    });

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})(window, document);
