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

    var VERSION = "1.1.0";

    function copy(v) {
        return JSON.parse(JSON.stringify(v));
    }

    function registry() {
        return window.PacificEducationCurriculumAlignmentRegistry || null;
    }

    function calendar() {
        return window.PacificEducationTeacherCalendar || null;
    }

    function coverageBridge() {
        return window.PacificEducationCurriculumAssessmentBridge || null;
    }

    function alignment() {
        return window.PacificEducationCurriculumAlignmentRuntimeBridge ||
            window.PacificEducationCurriculumAlignmentDataModel || null;
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
        if (!reg || typeof reg.list !== "function") {
            return { eligible: [], blocked: [] };
        }

        var bridge = coverageBridge();
        var runtime = alignment();
        var indicators = reg.list(filters || {});
        var eligible = [];
        var blocked = [];

        indicators.forEach(function(indicator) {
            if (indicator.status === "retired") return;

            var checked = null;
            if (runtime && typeof runtime.getIndicator === "function") {
                checked = runtime.getIndicator(indicator.id);
            } else if (runtime && typeof runtime.get === "function") {
                checked = runtime.get(indicator.id);
            }

            if (!checked || checked.valid === false) {
                blocked.push({
                    indicatorId: indicator.id,
                    reason: "INDICATOR_SOURCE_VERIFICATION_REQUIRED"
                });
                return;
            }

            var decision = bridge && typeof bridge.getCoverageDecision === "function" ?
                bridge.getCoverageDecision({
                    indicatorId: indicator.id,
                    studentId: filters && filters.studentId
                }) :
                { covered: false };

            if (!decision.covered) eligible.push(copy(indicator));
        });

        return { eligible: eligible, blocked: blocked };
    }


    function buildRemainingPlan(config) {
        config = config || {};
        var startDay = Math.max(1, Number(config.startDay || config.dayNumber || 1));
        var endDay = Math.max(startDay, Number(config.endDay || 365));
        var filters = {
            level: config.level || undefined,
            subject: config.subjectId || config.subject || undefined,
            term: config.term || undefined,
            studentId: config.studentId || undefined
        };

        Object.keys(filters).forEach(function(key) {
            if (filters[key] === undefined || filters[key] === null || filters[key] === "") delete filters[key];
        });

        var uncovered = getUncovered(filters);
        var days = getDays(startDay, endDay);
        var planDays = days.map(function(day) {
            return { dayNumber: day.dayNumber, type: day.type || "learning", indicators: [] };
        });

        uncovered.eligible.forEach(function(indicator, index) {
            if (!planDays.length) return;
            var slot = index % planDays.length;
            planDays[slot].indicators.push({
                indicatorId: indicator.id,
                indicator: copy(indicator)
            });
        });

        return {
            success: true,
            version: VERSION,
            startDay: startDay,
            endDay: endDay,
            level: config.level || null,
            subjectId: config.subjectId || config.subject || null,
            term: config.term || null,
            studentId: config.studentId || null,
            days: planDays,
            teachingDayCount: planDays.length,
            uncoveredIndicatorCount: uncovered.eligible.length,
            blockedIndicatorCount: uncovered.blocked.length,
            blockedIndicators: copy(uncovered.blocked),
            blockedReason: uncovered.blocked.length ? "INDICATOR_SOURCE_VERIFICATION_REQUIRED" : null,
            productionApproved: false,
            productionEligible: false,
            deploymentAuthorized: false,
            prototype: true
        };
    }

    function inspect(config) {
        var plan = buildRemainingPlan(config || {});
        return {
            success: plan.success,
            version: VERSION,
            teachingDayCount: plan.teachingDayCount,
            uncoveredIndicatorCount: plan.uncoveredIndicatorCount,
            blockedIndicatorCount: plan.blockedIndicatorCount,
            blockedIndicators: plan.blockedIndicators,
            productionApproved: false,
            productionEligible: false,
            prototype: true
        };
    }

    window.PacificEducationRemainingAchievementRedistributionEngine = Object.freeze({
        name: "PacificEducationRemainingAchievementRedistributionEngine",
        version: VERSION,
        buildRemainingPlan: buildRemainingPlan,
        inspect: inspect
    });
})(window);
