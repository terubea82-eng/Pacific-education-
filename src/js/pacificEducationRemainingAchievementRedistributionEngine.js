/*
 * Pacific Education — Remaining Achievement Redistribution Engine
 * Version 1.0.0
 *
 * Redistributes uncovered prototype curriculum indicators across the
 * remaining teaching days after teacher-entered revision/exam dates.
 *
 * PROTOTYPE ONLY. It does not rewrite or certify official curriculum.
 */
(function(window) {
    "use strict";

    var VERSION = "1.0.0";

    function copy(v) {
        return JSON.parse(JSON.stringify(v));
    }

    function registry() {
        return window.PacificEducationCurriculumAlignmentRegistry || null;
    }

    function calendar() {
        return window.PacificEducationTeacherCalendar || null;
    }

    function coverage() {
        return window.PacificEducationCurriculumCoverageEngine || null;
    }

    function isTeachingDay(day) {
        return day &&
            day.type !== "weekend" &&
            day.type !== "holiday" &&
            day.type !== "exam";
    }

    function getDays(startDay, endDay) {
        var c = calendar();
        var days = [];
        for (var d = Number(startDay || 1); d <= Number(endDay || 365); d++) {
            var day = c && typeof c.getDayByNumber === "function" ?
                c.getDayByNumber(d) :
                { dayNumber: d, type: "learning" };

            if (isTeachingDay(day)) days.push(copy(day));
        }
        return days;
    }

    function getUncovered(filters) {
        var reg = registry();
        if (!reg || typeof reg.list !== "function") return [];

        var cov = coverage();
        var indicators = reg.list(filters || {});

        return indicators.filter(function(indicator) {
            if (indicator.status === "retired") return false;

            var record = cov && typeof cov.get === "function" ?
                cov.get(indicator.id, filters && filters.studentId) : null;

            return !record || record.status !== "covered";
        }).map(copy);
    }

    function redistribute(config) {
        config = config || {};

        var startDay = Number(config.startDay || config.currentDayNumber || 1);
        var endDay = Number(config.endDay || 365);
        var days = getDays(startDay, endDay);

        var filters = {
            level: config.level,
            subjectId: config.subjectId,
            term: config.term,
            studentId: config.studentId
        };

        var indicators = getUncovered(filters);
        var assignments = [];

        if (!days.length) {
            return {
                success: true,
                startDay: startDay,
                endDay: endDay,
                assignments: [],
                unassignedIndicators: indicators,
                message: "No teaching days remain in the selected range.",
                prototype: true
            };
        }

        indicators.forEach(function(indicator, index) {
            var day = days[index % days.length];

            assignments.push({
                dayNumber: day.dayNumber,
                date: day.date || null,
                indicatorId: indicator.id,
                indicator: indicator,
                sequence: index + 1,
                reason: "redistributed-uncovered-achievement",
                prototype: true
            });
        });

        return {
            success: true,
            startDay: startDay,
            endDay: endDay,
            teachingDayCount: days.length,
            uncoveredIndicatorCount: indicators.length,
            assignments: assignments,
            unassignedIndicators: [],
            productionEligible: false,
            prototype: true
        };
    }

    function getAssignment(config) {
        config = config || {};
        var plan = redistribute(config);

        var dayNumber = Number(config.dayNumber || 1);
        var found = plan.assignments.find(function(a) {
            return a.dayNumber === dayNumber;
        });

        return found ? copy(found) : null;
    }

    function buildRemainingPlan(config) {
        var plan = redistribute(config || {});
        var grouped = {};

        plan.assignments.forEach(function(item) {
            if (!grouped[item.dayNumber]) grouped[item.dayNumber] = [];
            grouped[item.dayNumber].push(copy(item));
        });

        return {
            success: plan.success,
            startDay: plan.startDay,
            endDay: plan.endDay,
            teachingDayCount: plan.teachingDayCount,
            uncoveredIndicatorCount: plan.uncoveredIndicatorCount,
            days: Object.keys(grouped).map(function(day) {
                return {
                    dayNumber: Number(day),
                    indicators: grouped[day]
                };
            }),
            prototype: true
        };
    }

    function validate(config) {
        var plan = redistribute(config || {});
        var errors = [];

        plan.assignments.forEach(function(a) {
            var c = calendar();
            var day = c && typeof c.getDayByNumber === "function" ?
                c.getDayByNumber(a.dayNumber) : null;

            if (day && !isTeachingDay(day)) {
                errors.push("Indicator assigned to non-teaching day: " + a.dayNumber);
            }
        });

        return {
            valid: errors.length === 0,
            errors: errors,
            assignmentCount: plan.assignments.length,
            prototype: true
        };
    }

    window.PacificEducationRemainingAchievementRedistributionEngine =
        Object.freeze({
            name: "PacificEducationRemainingAchievementRedistributionEngine",
            version: VERSION,
            redistribute: redistribute,
            getAssignment: getAssignment,
            buildRemainingPlan: buildRemainingPlan,
            validate: validate
        });
})(window);
