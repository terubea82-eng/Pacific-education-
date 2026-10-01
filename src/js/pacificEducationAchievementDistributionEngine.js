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

    var VERSION = "1.1.0";

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

    function getIntegrationRule() {
        var bridge = window.PacificEducationCurriculumAlignmentRuntimeBridge;
        if (bridge && typeof bridge.getIntegrationRule === "function") {
            return bridge.getIntegrationRule();
        }
        return {
            coreShare: 0.5,
            crossSubjectShare: 0.5,
            crossSubjectMustBeLevelled: true,
            crossSubjectMustHaveApprovedMapping: true
        };
    }

    function isRevisionDay(calendar, dayNumber) {
        if (!calendar || typeof calendar.getDayByNumber !== "function") return false;
        var result = calendar.getDayByNumber(dayNumber);
        return !!result && result.type === "revision";
    }

    function getEligibleIndicators(filters) {
        var registry = getRegistry();
        if (!registry || typeof registry.list !== "function") return [];

        filters = filters || {};
        var items = [];
        if (filters.annual) {
            ["Term 1", "Term 2", "Term 3"].forEach(function(term) {
                registry.list({ level: filters.level, subjectId: filters.subjectId, term: term }).forEach(function(item) {
                    if (!items.some(function(existing) { return existing.id === item.id; })) items.push(item);
                });
            });
            registry.list({ level: filters.level, subjectId: filters.subjectId, term: "UNASSIGNED" }).forEach(function(item) {
                if (!items.some(function(existing) { return existing.id === item.id; })) items.push(item);
            });
        } else {
            items = registry.list(filters);
        }

        var verifier = getSourceVerification();
        items = items.filter(function(item) {
            if (verifier && typeof verifier.canUseForPrototype === "function") return verifier.canUseForPrototype(item.id);
            return true;
        });

        if (filters.annual) {
            var termOrder = {"Term 1": 1, "Term 2": 2, "Term 3": 3, "UNASSIGNED": 4};
            items.sort(function(a, b) {
                var aOrder = Object.prototype.hasOwnProperty.call(termOrder, a.term) ? termOrder[a.term] : 4;
                var bOrder = Object.prototype.hasOwnProperty.call(termOrder, b.term) ? termOrder[b.term] : 4;
                if (aOrder !== bOrder) return aOrder - bOrder;
                return String(a.id || "").localeCompare(String(b.id || ""));
            });
        }

        return items;
    }

    function isTeachingDay(calendar, dayNumber) {
        if (!calendar || typeof calendar.getDayByNumber !== "function") {
            return true;
        }

        var result = calendar.getDayByNumber(dayNumber);
        if (!result) return true;

        if (result.type === "weekend" ||
            result.type === "holiday" ||
            result.type === "exam" ||
            result.type === "revision") {
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

    function getClassId(filters) {
        filters = filters || {};

        var roster =
            window.PacificEducationTeacherClassRosterContext;

        if (filters.classId) {
            return String(filters.classId).trim();
        }

        if (
            roster &&
            typeof roster.getClassId === "function"
        ) {
            var classId = roster.getClassId();
            return classId ? String(classId).trim() : "";
        }

        return "";
    }

    function distribute(filters) {
        filters = filters || {};

        var classId = getClassId(filters);

        if (!classId) {
            return {
                success: false,
                blocked: true,
                reason: "Class Reference required",
                assignments: [],
                prototype: true
            };
        }

        var startDay = Number.parseInt(filters.startDay || 1, 10);
        var endDay = Number.parseInt(filters.endDay || 365, 10);

        if (!Number.isInteger(startDay) || startDay < 1) startDay = 1;
        if (!Number.isInteger(endDay) || endDay > 365) endDay = 365;
        if (endDay < startDay) endDay = startDay;

        var annual = filters.annual === true;
        var indicators = getEligibleIndicators({
            level: filters.level,
            subjectId: filters.subjectId,
            term: annual ? null : filters.term,
            annual: annual
        });

        var days = getAvailableDays(startDay, endDay);
        var calendar = getCalendar();
        var authorizedDays = calendar && typeof calendar.getConfiguration === "function"
            ? Number(calendar.getConfiguration().authorizedTeachingDays)
            : 180;
        if (!Number.isInteger(authorizedDays) || authorizedDays < 1) authorizedDays = 180;
        if (annual) days = days.slice(0, authorizedDays);
        var assignments = [];
        var index = 0;
        var integrationRule = getIntegrationRule();

        if (!days.length || !indicators.length) {
            return {
                success: true,
                startDay: startDay,
                endDay: endDay,
                availableLearningDays: days.length,
                authorizedTeachingDays: annual ? days.length : null,
                allocationModel: annual ? "annual-contiguous-equal-blocks" : "round-robin",
                indicatorCount: indicators.length,
                integrationAllocation: integrationRule,
                assignments: [],
                prototype: true
            };
        }

        /*
         * Deterministic round-robin allocation. An indicator may span
         * multiple learning days when there are fewer indicators than days.
         */
        days.forEach(function(dayNumber, dayIndex) {
            var indicatorIndex = annual
                ? Math.min(indicators.length - 1, Math.floor(dayIndex * indicators.length / days.length))
                : index % indicators.length;
            var indicator = indicators[indicatorIndex];

            assignments.push({
                classId: classId,
                dayNumber: dayNumber,
                teachingDayIndex: dayIndex + 1,
                authorizedTeachingDays: days.length,
                indicatorCount: indicators.length,
                indicatorPosition: indicatorIndex + 1,
                indicatorId: indicator.id,
                level: indicator.level,
                subjectId: indicator.subjectId,
                term: indicator.term,
                strand: indicator.strand || null,
                indicatorText: indicator.indicatorText,
                sourceStatus: indicator.source
                    ? indicator.source.status
                    : "unverified",
                integrationAllocation: {
                    coreShare: integrationRule.coreShare,
                    crossSubjectShare: integrationRule.crossSubjectShare
                },
                productionEligible: false,
                prototype: true
            });

            index += 1;
        });

        return {
            success: true,
            classId: classId,
            startDay: startDay,
            endDay: endDay,
            availableLearningDays: days.length,
            indicatorCount: indicators.length,
            integrationAllocation: integrationRule,
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
            annual: filters.annual === true,
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
            if (item.integrationAllocation && (item.integrationAllocation.coreShare !== 0.5 || item.integrationAllocation.crossSubjectShare !== 0.5)) {
                errors.push("Integration allocation must remain 50/50");
            }
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
