/*
 * Pacific Education
 * Achievement Indicator Distribution Engine
 * Version 1.0.0
 *
 * Distributes curriculum indicators across available learning days.
 *
 * PROTOTYPE ONLY. Official curriculum scope, weighting, school dates,
 * holidays, revisions and examinations must be verified before production.
 */
(function(window) {
    "use strict";

    var VERSION = "1.0.0";

    function copy(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function getRegistry() {
        return window.PacificEducationCurriculumAlignmentRegistry || null;
    }

    function getCalendar() {
        return window.PacificEducationTeacherCalendar || null;
    }

    function getSourceVerification() {
        return window.PacificEducationCurriculumSourceVerification || null;
    }

    function getEligibleIndicators(filters) {
        var registry = getRegistry();
        if (!registry || typeof registry.list !== "function") return [];

        var items = registry.list(filters || {});
        var verifier = getSourceVerification();

        return items.filter(function(item) {
            /*
             * Prototype planning may use unverified records, but the
             * production flag is never granted by this engine.
             */
            if (verifier && typeof verifier.canUseForPrototype === "function") {
                return verifier.canUseForPrototype(item.id);
            }
            return true;
        });
    }

    function isTeachingDay(calendar, dayNumber) {
        if (!calendar || typeof calendar.getDayByNumber !== "function") {
            return true;
        }

        var result = calendar.getDayByNumber(dayNumber);
        if (!result) return true;

        if (result.type === "weekend" ||
            result.type === "holiday" ||
            result.type === "exam") {
            return false;
        }

        return true;
    }

    function getAvailableDays(startDay, endDay) {
        var calendar = getCalendar();
        var days = [];

        for (var day = startDay; day <= endDay; day++) {
            if (isTeachingDay(calendar, day)) {
                days.push(day);
            }
        }

        return days;
    }

    function distribute(filters) {
        filters = filters || {};

        var startDay = Number.parseInt(filters.startDay || 1, 10);
        var endDay = Number.parseInt(filters.endDay || 365, 10);

        if (!Number.isInteger(startDay) || startDay < 1) startDay = 1;
        if (!Number.isInteger(endDay) || endDay > 365) endDay = 365;
        if (endDay < startDay) endDay = startDay;

        var indicators = getEligibleIndicators({
            level: filters.level,
            subjectId: filters.subjectId,
            term: filters.term
        });

        var days = getAvailableDays(startDay, endDay);
        var assignments = [];
        var index = 0;

        if (!days.length || !indicators.length) {
            return {
                success: true,
                startDay: startDay,
                endDay: endDay,
                availableLearningDays: days.length,
                indicatorCount: indicators.length,
                assignments: [],
                prototype: true
            };
        }

        /*
         * Deterministic round-robin allocation. An indicator may span
         * multiple learning days when there are fewer indicators than days.
         */
        days.forEach(function(dayNumber) {
            var indicator = indicators[index % indicators.length];

            assignments.push({
                dayNumber: dayNumber,
                indicatorId: indicator.id,
                level: indicator.level,
                subjectId: indicator.subjectId,
                term: indicator.term,
                strand: indicator.strand || null,
                indicatorText: indicator.indicatorText,
                sourceStatus: indicator.source
                    ? indicator.source.status
                    : "unverified",
                productionEligible: false,
                prototype: true
            });

            index += 1;
        });

        return {
            success: true,
            startDay: startDay,
            endDay: endDay,
            availableLearningDays: days.length,
            indicatorCount: indicators.length,
            assignments: assignments,
            prototype: true
        };
    }

    function getAssignment(filters) {
        filters = filters || {};

        var dayNumber = Number.parseInt(filters.dayNumber || 1, 10);
        var result = distribute({
            level: filters.level,
            subjectId: filters.subjectId,
            term: filters.term,
            startDay: filters.startDay || 1,
            endDay: filters.endDay || 365
        });

        return result.assignments.find(function(item) {
            return item.dayNumber === dayNumber;
        }) || null;
    }

    function buildDailyIndicatorPlan(filters) {
        filters = filters || {};

        var assignment = getAssignment(filters);

        return {
            success: true,
            dayNumber: Number.parseInt(filters.dayNumber || 1, 10),
            assignment: assignment,
            indicators: assignment ? [copy(assignment)] : [],
            prototype: true
        };
    }

    function validate(filters) {
        var result = distribute(filters || {});
        var errors = [];

        result.assignments.forEach(function(item) {
            if (!item.indicatorId) errors.push("Missing indicator id on day " + item.dayNumber);
            if (!item.indicatorText) errors.push("Missing indicator text on day " + item.dayNumber);
            if (item.productionEligible === true) {
                errors.push("Distribution engine cannot grant production eligibility");
            }
        });

        return {
            valid: errors.length === 0,
            errors: errors,
            assignmentCount: result.assignments.length,
            indicatorCount: result.indicatorCount,
            prototype: true
        };
    }

    window.PacificEducationAchievementDistributionEngine =
        Object.freeze({
            name: "PacificEducationAchievementDistributionEngine",
            version: VERSION,
            distribute: distribute,
            getAssignment: getAssignment,
            buildDailyIndicatorPlan: buildDailyIndicatorPlan,
            validate: validate
        });
})(window);
