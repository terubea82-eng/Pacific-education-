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

    var VERSION = "1.2.0";

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



    /*
     * SOURCE-GROUNDED ALIGNMENT CANDIDATES
     * These records map verified resource evidence to prototype
     * learning areas. They are NOT official Ministry achievement
     * indicators and remain pending current Ministry validation.
     */
    var SOURCE_GROUNDED_CANDIDATES = Object.freeze([
        Object.freeze({
            candidateId: "Y1-ENG-CAND-001",
            sourceId: "FJ-MOE-Y1-LLC-2019-REPRINT2020",
            level: "Year 1",
            subject: "English",
            term: "UNASSIGNED",
            sourceUnit: 1,
            learningArea: "Speaking and listening",
            evidence: "personal introduction; name, age, clothing and colour questions",
            dailyActivityType: "guided oral language practice",
            assessmentUse: "FORMATIVE_ONLY",
            validationStatus: "NOT_VALIDATED"
        }),
        Object.freeze({
            candidateId: "Y1-ENG-CAND-002",
            sourceId: "FJ-MOE-Y1-LLC-2019-REPRINT2020",
            level: "Year 1",
            subject: "English",
            term: "UNASSIGNED",
            sourceUnit: 1,
            learningArea: "Phonics and early word reading",
            evidence: "letter recognition and beginning-sound practice",
            dailyActivityType: "letter/sound recognition practice",
            assessmentUse: "FORMATIVE_ONLY",
            validationStatus: "NOT_VALIDATED"
        }),
        Object.freeze({
            candidateId: "Y1-ENG-CAND-003",
            sourceId: "FJ-MOE-Y1-LLC-2019-REPRINT2020",
            level: "Year 1",
            subject: "English",
            term: "UNASSIGNED",
            sourceUnit: 5,
            learningArea: "Reading and phonological awareness",
            evidence: "reading familiar words; beginning and middle sound practice",
            dailyActivityType: "guided reading and sound practice",
            assessmentUse: "FORMATIVE_ONLY",
            validationStatus: "NOT_VALIDATED"
        }),
        Object.freeze({
            candidateId: "Y1-ENG-CAND-004",
            sourceId: "FJ-MOE-Y1-LLC-2019-REPRINT2020",
            level: "Year 1",
            subject: "English",
            term: "UNASSIGNED",
            sourceUnit: 8,
            learningArea: "Phonics and word reading",
            evidence: "extended phonics patterns and digraphs",
            dailyActivityType: "sound-pattern and word-reading practice",
            assessmentUse: "FORMATIVE_ONLY",
            validationStatus: "NOT_VALIDATED"
        })
    ]);



    /*
     * YEAR 1 ALIGNMENT DATA MODEL
     * The indicatorText field is deliberately null until the
     * current authorized Ministry prescription is validated.
     */
    var YEAR1_ALIGNMENT_TABLE = Object.freeze([
        Object.freeze({
            rowId: "Y1-ALIGN-001",
            level: "Year 1",
            subject: "English",
            strand: "Language, Literacy and Communication",
            subStrand: "Speaking and listening",
            achievementIndicator: null,
            indicatorStatus: "NOT_VALIDATED",
            sourceUnit: 1,
            sourceEvidence: "Personal introduction; name, age, clothing and colour questions.",
            term: null,
            dailyActivityRange: null,
            assessmentCoverage: "FORMATIVE_ONLY"
        }),
        Object.freeze({
            rowId: "Y1-ALIGN-002",
            level: "Year 1",
            subject: "English",
            strand: "Language, Literacy and Communication",
            subStrand: "Phonics and early word reading",
            achievementIndicator: null,
            indicatorStatus: "NOT_VALIDATED",
            sourceUnit: 1,
            sourceEvidence: "Letter recognition and beginning-sound practice.",
            term: null,
            dailyActivityRange: null,
            assessmentCoverage: "FORMATIVE_ONLY"
        }),
        Object.freeze({
            rowId: "Y1-ALIGN-003",
            level: "Year 1",
            subject: "English",
            strand: "Language, Literacy and Communication",
            subStrand: "Reading and phonological awareness",
            achievementIndicator: null,
            indicatorStatus: "NOT_VALIDATED",
            sourceUnit: 5,
            sourceEvidence: "Reading familiar words; beginning and middle sound practice.",
            term: null,
            dailyActivityRange: null,
            assessmentCoverage: "FORMATIVE_ONLY"
        }),
        Object.freeze({
            rowId: "Y1-ALIGN-004",
            level: "Year 1",
            subject: "English",
            strand: "Language, Literacy and Communication",
            subStrand: "Phonics and word reading",
            achievementIndicator: null,
            indicatorStatus: "NOT_VALIDATED",
            sourceUnit: 8,
            sourceEvidence: "Extended phonics patterns and digraphs.",
            term: null,
            dailyActivityRange: null,
            assessmentCoverage: "FORMATIVE_ONLY"
        })
    ]);

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
