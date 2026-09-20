/*
 * Pacific Education — Curriculum Dependency Validator
 * Version 1.0.0
 * PROTOTYPE ONLY.
 *
 * Validates that the curriculum/progression modules required by the
 * prototype are present before dependent features are considered ready.
 * It does not certify official Fiji curriculum content.
 */
(function(window) {
    "use strict";

    var VERSION = "1.0.0";

    var dependencies = [
        { name:"Curriculum Alignment Registry", key:"PacificEducationCurriculumAlignmentRegistry", requiredFor:["curriculum"] },
        { name:"Curriculum Source Verification", key:"PacificEducationCurriculumSourceVerification", requiredFor:["curriculum"] },
        { name:"Curriculum Data", key:"PacificEducationCurriculumData", requiredFor:["curriculum"] },
        { name:"Curriculum Coverage Engine", key:"PacificEducationCurriculumCoverageEngine", requiredFor:["coverage"] },
        { name:"Teacher Calendar", key:"PacificEducationTeacherCalendar", requiredFor:["scheduling"] },
        { name:"Revision/Exam Scheduler", key:"PacificEducationRevisionExamScheduler", requiredFor:["scheduling"] },
        { name:"Remaining Achievement Redistribution", key:"PacificEducationRemainingAchievementRedistributionEngine", requiredFor:["redistribution"] },
        { name:"Term Progression Gate", key:"PacificEducationTermProgressionGate", requiredFor:["progression"] }
    ];

    function check() {
        var results = dependencies.map(function(item) {
            return {
                name:item.name,
                key:item.key,
                loaded:!!window[item.key],
                requiredFor:item.requiredFor.slice()
            };
        });

        var missing = results.filter(function(item) { return !item.loaded; });
        return {
            success: missing.length === 0,
            valid: missing.length === 0,
            total: results.length,
            loaded: results.length - missing.length,
            missing: missing,
            dependencies: results,
            prototype: true,
            productionEligible: false
        };
    }

    function checkFeature(feature) {
        var result = check();
        var relevant = result.dependencies.filter(function(item) {
            return item.requiredFor.indexOf(feature) >= 0;
        });
        var missing = relevant.filter(function(item) { return !item.loaded; });
        return {
            feature:feature,
            ready:missing.length === 0,
            missing:missing,
            dependencies:relevant,
            prototype:true
        };
    }

    window.PacificEducationCurriculumDependencyValidator = Object.freeze({
        name:"PacificEducationCurriculumDependencyValidator",
        version:VERSION,
        check:check,
        checkFeature:checkFeature
    });
})(window);
