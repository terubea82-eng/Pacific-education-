/*
 * PACIFIC EDUCATION — CURRICULUM ALIGNMENT RUNTIME BRIDGE
 * Version: 1.0.0
 *
 * Connects the existing curriculum data/registry to the
 * controlled alignment data model.
 *
 * Prototype only. Existing prototype curriculum records are
 * never upgraded to official/verified status by this bridge.
 */

(function (window) {
    "use strict";

    var VERSION = "1.0.0";

    function model() {
        return window.PacificEducationCurriculumAlignmentDataModel || null;
    }

    function data() {
        return window.PacificEducationCurriculumData || null;
    }

    function registry() {
        return window.PacificEducationCurriculumAlignmentRegistry || null;
    }

    function normalize(record) {
        if (!record) return null;

        return {
            indicatorId: record.id || record.indicatorId,
            jurisdiction: "Fiji",
            curriculumVersion:
                record.curriculumVersion ||
                (record.source && record.source.document) ||
                "UNVERIFIED-PROTOTYPE",
            level: record.level || null,
            subject: record.subjectId || record.subject || null,
            term: record.term || null,
            strand: record.strand || null,
            subStrand: record.subStrand || "UNSPECIFIED",
            indicatorText: record.indicatorText || null,
            sourceDocumentId:
                record.source && record.source.id
                    ? record.source.id
                    : null,
            sourceDocumentTitle:
                record.source && record.source.title
                    ? record.source.title
                    : null,
            sourceLocation:
                record.source && record.source.document
                    ? record.source.document
                    : null,
            validationStatus:
                record.source &&
                record.source.status === "verified"
                    ? "VERIFIED"
                    : "PENDING_SOURCE_VERIFICATION"
        };
    }

    function getIndicator(indicatorId) {
        var d = data();
        var m = model();

        if (!d || !m || typeof d.get !== "function") {
            return {
                valid: false,
                indicator: null,
                errors: ["Curriculum alignment data model unavailable."]
            };
        }

        var normalized = normalize(d.get(indicatorId));
        if (!normalized) {
            return {
                valid: false,
                indicator: null,
                errors: ["Indicator not found: " + indicatorId]
            };
        }

        var validation = m.validateIndicator(normalized);

        return {
            valid: validation.valid,
            indicator: normalized,
            validation: validation
        };
    }

    function validateDailyActivity(activity) {
        var m = model();
        return m
            ? m.validateDailyActivity(activity)
            : { valid: false, errors: ["Data model unavailable."] };
    }

    function validateAssessmentActivity(assessment) {
        var m = model();
        return m
            ? m.validateAssessmentActivity(assessment)
            : { valid: false, errors: ["Data model unavailable."] };
    }

    function canScheduleExam(assessment) {
        var m = model();
        return m
            ? m.canScheduleExam(assessment)
            : { allowed: false, errors: ["Data model unavailable."] };
    }

    function buildDailyActivity(indicatorId) {
        var result = getIndicator(indicatorId);

        if (!result.valid) {
            return {
                success: false,
                status: "BLOCKED_PENDING_SOURCE_VERIFICATION",
                errors: result.validation
                    ? result.validation.errors
                    : result.errors
            };
        }

        var activity = {
            id: indicatorId + "-DAILY-1",
            indicatorIds: [indicatorId],
            title: "Daily practice — " + result.indicator.strand,
            instructions: result.indicator.indicatorText,
            prototype: true
        };

        var validation = validateDailyActivity(activity);

        return {
            success: validation.valid,
            activity: validation.valid ? activity : null,
            validation: validation
        };
    }

    function getIntegrationRule() {
        var m = model();
        return m
            ? m.integrationAllocation
            : { coreShare: 0.5, crossSubjectShare: 0.5 };
    }

    function status() {
        var d = data();
        var r = registry();
        var m = model();

        return {
            version: VERSION,
            dataAvailable: Boolean(d),
            registryAvailable: Boolean(r),
            modelAvailable: Boolean(m),
            prototypeOnly: true,
            officialSourceVerificationRequired: true,
            integrationAllocation: getIntegrationRule()
        };
    }

    window.PacificEducationCurriculumAlignmentRuntimeBridge =
        Object.freeze({
            name: "PacificEducationCurriculumAlignmentRuntimeBridge",
            version: VERSION,
            getIndicator: getIndicator,
            validateDailyActivity: validateDailyActivity,
            validateAssessmentActivity: validateAssessmentActivity,
            canScheduleExam: canScheduleExam,
            buildDailyActivity: buildDailyActivity,
            getIntegrationRule: getIntegrationRule,
            status: status
        });

})(window);
