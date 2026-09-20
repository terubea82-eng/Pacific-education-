/*
 * =========================================================
 * PACIFIC EDUCATION — CURRICULUM ALIGNMENT DATA MODEL
 * Version: 1.0.0
 *
 * Purpose:
 * Provide the runtime data contract between official
 * curriculum evidence, daily activities and assessments.
 *
 * IMPORTANT:
 * This module does not invent Fiji achievement indicators.
 * Existing Year 1 resource evidence remains reference-only
 * until the current authorized Ministry prescription and
 * achievement indicators are validated.
 *
 * Prototype only. Production curriculum authority and
 * version control must be enforced server-side.
 * ========================================================= */

(function (global) {
    "use strict";

    var VERSION = "1.0.0";

    var STATUS = Object.freeze({
        PENDING_SOURCE_VERIFICATION: "PENDING_SOURCE_VERIFICATION",
        VERIFIED: "VERIFIED",
        RETIRED: "RETIRED"
    });

    var DATA_CONTRACT = Object.freeze({
        requiredIndicatorFields: Object.freeze([
            "indicatorId",
            "jurisdiction",
            "curriculumVersion",
            "level",
            "subject",
            "term",
            "strand",
            "subStrand",
            "indicatorText",
            "sourceDocumentId",
            "sourceDocumentTitle",
            "sourceLocation",
            "validationStatus"
        ]),
        dailyActivityRequiresIndicatorIds: true,
        assessmentRequiresIndicatorIds: true,
        assessmentRequiresCoveredIndicator: true,
        examRequiresCoveredIndicator: true,
        unverifiedIndicatorsCannotAuthorizeAssessment: true
    });

    var INTEGRATION_ALLOCATION = Object.freeze({
        coreShare: 0.50,
        crossSubjectShare: 0.50,
        crossSubjectMustBeLevelled: true,
        crossSubjectMustHaveApprovedMapping: true
    });

    function copy(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function getSourceData() {
        return global.PacificEducationCurriculumSourceData || null;
    }

    function getAlignmentRegistry() {
        return global.PacificEducationCurriculumAlignment || null;
    }

    /*
     * Converts existing source evidence into safe alignment
     * candidates. No official achievement-indicator text is
     * created here.
     */
    function getPendingCandidates() {
        var registry = getAlignmentRegistry();

        if (registry && Array.isArray(registry.sourceGroundedCandidates)) {
            return copy(registry.sourceGroundedCandidates);
        }

        var sourceData = getSourceData();
        if (!sourceData || !Array.isArray(sourceData.unitEvidence)) {
            return [];
        }

        return sourceData.unitEvidence.map(function (unit) {
            return {
                candidateId: "SOURCE-UNIT-" + unit.unit,
                level: "Year 1",
                subject: "English",
                unit: unit.unit,
                title: unit.title,
                evidence: copy(unit.evidence),
                validationStatus: STATUS.PENDING_SOURCE_VERIFICATION
            };
        });
    }

    function validateIndicator(indicator) {
        var errors = [];

        if (!indicator || typeof indicator !== "object") {
            return {
                valid: false,
                status: STATUS.PENDING_SOURCE_VERIFICATION,
                errors: ["Indicator record is missing."]
            };
        }

        DATA_CONTRACT.requiredIndicatorFields.forEach(function (field) {
            if (
                indicator[field] === undefined ||
                indicator[field] === null ||
                indicator[field] === ""
            ) {
                errors.push("Missing required field: " + field);
            }
        });

        if (indicator.jurisdiction !== "Fiji") {
            errors.push("Jurisdiction must be Fiji.");
        }

        if (
            indicator.validationStatus !== STATUS.VERIFIED &&
            indicator.validationStatus !== STATUS.RETIRED
        ) {
            errors.push(
                "Indicator is not authorized for production alignment until source validation is complete."
            );
        }

        return {
            valid: errors.length === 0,
            status:
                errors.length === 0
                    ? indicator.validationStatus
                    : STATUS.PENDING_SOURCE_VERIFICATION,
            errors: errors
        };
    }

    function validateDailyActivity(activity) {
        var errors = [];

        if (!activity || typeof activity !== "object") {
            return {
                valid: false,
                errors: ["Daily activity is missing."]
            };
        }

        if (
            !Array.isArray(activity.indicatorIds) ||
            activity.indicatorIds.length === 0
        ) {
            errors.push("Daily activity must contain indicatorIds.");
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    function validateAssessmentActivity(assessment) {
        var errors = [];
        var activityResult = validateDailyActivity(assessment);

        if (!activityResult.valid) {
            errors = errors.concat(activityResult.errors);
        }

        if (
            assessment &&
            assessment.assessmentType === "EXAM" &&
            (!Array.isArray(assessment.coveredIndicatorIds) ||
             assessment.coveredIndicatorIds.length === 0)
        ) {
            errors.push("Exam must identify covered indicator IDs.");
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    function isIndicatorCovered(indicatorId, coveredIndicatorIds) {
        return (
            typeof indicatorId === "string" &&
            Array.isArray(coveredIndicatorIds) &&
            coveredIndicatorIds.indexOf(indicatorId) !== -1
        );
    }

    function canUseIndicatorForAssessment(indicator, coveredIndicatorIds) {
        var validation = validateIndicator(indicator);

        return (
            validation.valid &&
            isIndicatorCovered(indicator.indicatorId, coveredIndicatorIds)
        );
    }

    function canScheduleExam(assessment) {
        var validation = validateAssessmentActivity(assessment);

        if (!validation.valid) {
            return {
                allowed: false,
                errors: validation.errors
            };
        }

        if (assessment.assessmentType !== "EXAM") {
            return {
                allowed: true,
                errors: []
            };
        }

        return {
            allowed: assessment.coveredIndicatorIds.length > 0,
            errors:
                assessment.coveredIndicatorIds.length > 0
                    ? []
                    : ["Exam cannot be scheduled without covered indicators."]
        };
    }

    function createVerifiedIndicator(input) {
        var record = copy(input || {});
        record.validationStatus = STATUS.VERIFIED;

        var validation = validateIndicator(record);

        if (!validation.valid) {
            return {
                created: false,
                record: null,
                validation: validation
            };
        }

        return {
            created: true,
            record: record,
            validation: validation
        };
    }

    var api = Object.freeze({
        version: VERSION,
        status: STATUS,
        dataContract: DATA_CONTRACT,
        integrationAllocation: INTEGRATION_ALLOCATION,

        getPendingCandidates: getPendingCandidates,
        validateIndicator: validateIndicator,
        validateDailyActivity: validateDailyActivity,
        validateAssessmentActivity: validateAssessmentActivity,
        isIndicatorCovered: isIndicatorCovered,
        canUseIndicatorForAssessment: canUseIndicatorForAssessment,
        canScheduleExam: canScheduleExam,
        createVerifiedIndicator: createVerifiedIndicator
    });

    global.PacificEducationCurriculumAlignmentDataModel = api;

})(window);
