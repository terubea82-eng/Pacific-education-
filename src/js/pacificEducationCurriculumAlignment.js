/* =========================================================
 * PACIFIC EDUCATION — CURRICULUM ALIGNMENT REGISTRY
 * Version: 1.0.0
 *
 * Purpose:
 * Establish a controlled alignment layer between Pacific
 * Education daily learning and the official curriculum.
 *
 * IMPORTANT:
 * This registry does NOT invent, replace, or reinterpret the
 * official Fiji curriculum. Official Ministry prescriptions,
 * scope/sequence, achievement indicators and authorized
 * curriculum updates remain authoritative.
 *
 * Prototype only. Production curriculum authority/versioning
 * must be validated and controlled server-side where required.
 * ========================================================= */

(function (global) {
    "use strict";

    var VERSION = "1.0.0";

    var AUTHORITY = Object.freeze({
        jurisdiction: "Fiji",
        authority: "Fiji Ministry of Education",
        officialCurriculumIsAuthoritative: true,
        platformReplacesOfficialCurriculum: false,
        platformMayAlignWithOfficialCurriculum: true,
        manualAuthorityValidationRequired: true
    });

    var ALIGNMENT_RULES = Object.freeze({
        sourcePrescriptions: true,
        sourceAchievementIndicators: true,
        sourceScopeAndSequence: true,
        dailyActivitiesMustMapToCoveredIndicators: true,
        assessmentsMustUseCoveredIndicatorsOnly: true,
        examsMustNotIntroduceNewMaterial: true,
        curriculumChangesRequireVersionRecord: true,
        teacherCalendarMayRedistributeRemainingActivities: true,
        calendarMustNotSilentlyChangeCurriculum: true,
        integrationMustNotOverrideCoreAchievementIndicators: true,
        offlineCachedAlignmentMayBeUsedUntilAuthorizedUpdate: true
    });

    var INTEGRATION_MODEL = Object.freeze({
        currentSubjectCoreShare: 0.50,
        levelledCrossSubjectIntegrationShare: 0.50,
        integrationIsLevelled: true,
        integrationRequiresApprovedIndicatorMapping: true
    });

    var RECORD_SCHEMA = Object.freeze([
        "jurisdiction",
        "curriculumVersion",
        "subject",
        "level",
        "term",
        "strand",
        "subStrand",
        "achievementIndicator",
        "sourceDocument",
        "sourceLocation",
        "effectiveDate",
        "authorizedChange",
        "mappedDailyActivities",
        "coverageStatus",
        "validationStatus"
    ]);

    var STATUS = Object.freeze({
        NOT_VALIDATED: "NOT_VALIDATED",
        VALIDATED: "VALIDATED",
        RETIRED: "RETIRED"
    });

    var api = Object.freeze({
        version: VERSION,
        authority: AUTHORITY,
        alignmentRules: ALIGNMENT_RULES,
        integrationModel: INTEGRATION_MODEL,
        recordSchema: RECORD_SCHEMA,
        status: STATUS,

        getAuthority: function () {
            return AUTHORITY;
        },

        getAlignmentRules: function () {
            return ALIGNMENT_RULES;
        },

        getIntegrationModel: function () {
            return INTEGRATION_MODEL;
        },

        getRecordSchema: function () {
            return RECORD_SCHEMA;
        }
    });

    global.PacificEducationCurriculumAlignment = api;

})(window);
