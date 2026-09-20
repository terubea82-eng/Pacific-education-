/*
 * Pacific Education
 * Daily 50/50 Integration Planner
 * Version 1.0.0
 *
 * Builds a daily learning structure using:
 *   50% current-subject core learning
 *   50% levelled integrated learning
 *
 * PROTOTYPE ONLY. The 50/50 model is an owner-defined planning model,
 * not an assertion about official Fiji curriculum requirements.
 */
(function(window) {
    "use strict";

    var VERSION = "1.0.0";
    var CORE_SHARE = 0.50;
    var INTEGRATED_SHARE = 0.50;

    function copy(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function registry() {
        return window.PacificEducationCurriculumAlignmentRegistry || null;
    }

    function integrationEngine() {
        return window.PacificEducationCurriculumIntegrationEngine || null;
    }

    function distributionEngine() {
        return window.PacificEducationAchievementDistributionEngine || null;
    }

    function selectCoreIndicator(filters) {
        var distributor = distributionEngine();
        if (distributor && typeof distributor.getAssignment === "function") {
            var assignment = distributor.getAssignment(filters);
            if (assignment && assignment.indicatorId) {
                var reg = registry();
                if (reg && typeof reg.getIndicator === "function") {
                    return reg.getIndicator(assignment.indicatorId);
                }
            }
        }

        var regFallback = registry();
        if (!regFallback || typeof regFallback.list !== "function") return null;

        var items = regFallback.list({
            level: filters.level,
            subjectId: filters.subjectId,
            term: filters.term
        });

        return items.length ? items[0] : null;
    }

    function build(filters) {
        filters = filters || {};

        var level = filters.level || "Class 1";
        var subjectId = filters.subjectId || "English";
        var term = filters.term || "Term 1";
        var dayNumber = Number(filters.dayNumber || 1);

        var core = selectCoreIndicator({
            level: level,
            subjectId: subjectId,
            term: term,
            dayNumber: dayNumber,
            startDay: filters.startDay || 1,
            endDay: filters.endDay || 365
        });

        var integrated = [];

        if (core) {
            var engine = integrationEngine();

            if (engine && typeof engine.buildFromIndicator === "function") {
                var result = engine.buildFromIndicator(
                    core,
                    level,
                    subjectId
                );

                if (result && Array.isArray(result.integrated)) {
                    integrated = copy(result.integrated);
                }
            }

            /*
             * If the indicator has no integration subjects, retain a
             * transparent empty list rather than inventing curriculum.
             */
            if (!integrated.length &&
                Array.isArray(core.integrationSubjects)) {
                integrated = core.integrationSubjects.map(function(subject) {
                    return {
                        subjectId: subject,
                        activitySuggestion:
                            "Levelled integration activity connected to the core learning.",
                        sourceStatus: "requires-curriculum-verification",
                        productionEligible: false,
                        prototype: true
                    };
                });
            }
        }

        return {
            success: true,
            dayNumber: dayNumber,
            level: level,
            subjectId: subjectId,
            term: term,
            model: "Pacific Education prototype 50/50",
            core: {
                share: CORE_SHARE,
                indicator: core ? copy(core) : null
            },
            integrated: {
                share: INTEGRATED_SHARE,
                subjects: integrated
            },
            productionEligible: false,
            prototype: true
        };
    }

    function validate(filters) {
        var plan = build(filters || {});
        var errors = [];

        if (plan.core.share !== 0.50) {
            errors.push("Core share must remain 50%");
        }

        if (plan.integrated.share !== 0.50) {
            errors.push("Integrated share must remain 50%");
        }

        if (plan.productionEligible === true) {
            errors.push("Planner cannot grant production eligibility");
        }

        return {
            valid: errors.length === 0,
            errors: errors,
            hasCoreIndicator: !!plan.core.indicator,
            integratedSubjectCount: plan.integrated.subjects.length,
            prototype: true
        };
    }

    window.PacificEducationDailyIntegrationPlanner =
        Object.freeze({
            name: "PacificEducationDailyIntegrationPlanner",
            version: VERSION,
            coreShare: CORE_SHARE,
            integratedShare: INTEGRATED_SHARE,
            build: build,
            validate: validate
        });
})(window);
