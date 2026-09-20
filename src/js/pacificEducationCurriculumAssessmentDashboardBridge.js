/*
 * Pacific Education
 * Curriculum → Assessment → Dashboard Bridge
 * Version 1.0.0
 *
 * PROTOTYPE ONLY.
 *
 * This file connects the new curriculum evidence layer to the
 * existing Pacific Education assessment and dashboard APIs.
 *
 * It does not replace authentication, authorization, assessment
 * storage, dashboard access control, or production safeguarding.
 */
(function(window) {
    "use strict";

    var VERSION = "1.0.0";

    function curriculumBridge() {
        return window.PacificEducationCurriculumDailyLessonsBridge || null;
    }

    function assessmentBridge() {
        return window.PacificEducationAssessmentBridge || null;
    }

    function dashboards() {
        return window.PacificEducationDashboards || null;
    }

    function core() {
        return window.PacificEducationCore || null;
    }

    function authorized() {
        var c = core();
        return !!(
            c &&
            typeof c.isAuthorized === "function" &&
            c.isAuthorized() === true
        );
    }

    function copy(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function connectionStatus() {
        return {
            curriculumDailyLessonsBridge: !!curriculumBridge(),
            assessmentBridge: !!assessmentBridge(),
            dashboards: !!dashboards(),
            core: !!core(),
            authorized: authorized()
        };
    }

    function generateDailyLearningRecord(config) {
        if (!authorized()) {
            return {
                success: false,
                reason: "authorization_required"
            };
        }

        var bridge = curriculumBridge();

        if (!bridge || typeof bridge.generateDailyLesson !== "function") {
            return {
                success: false,
                reason: "curriculum_bridge_unavailable"
            };
        }

        return bridge.generateDailyLesson(config || {});
    }

    function createAssessmentRecord(indicator, config) {
        config = config || {};
        indicator = indicator || {};

        return {
            id:
                config.assessmentId ||
                ("CURR-ASSESS-" + indicator.id),

            type:
                config.type ||
                "curriculum",

            assessmentType:
                config.assessmentType ||
                "curriculum",

            title:
                config.title ||
                ("Curriculum Assessment — " +
                 (indicator.strand || indicator.subjectId || "Learning")),

            day:
                Number(config.dayNumber || 1),

            indicatorId:
                indicator.id || null,

            subject:
                indicator.subjectId || null,

            level:
                indicator.level || null,

            term:
                indicator.term || null,

            evidenceType:
                config.evidenceType ||
                "teacher-observation",

            status:
                "available",

            prototype:
                true
        };
    }

    function publishAssessmentToExistingSystem(record) {
        if (!authorized()) {
            return {
                success: false,
                reason: "authorization_required"
            };
        }

        var bridge = assessmentBridge();

        if (!bridge || typeof bridge.recordAssessment !== "function") {
            return {
                success: false,
                reason: "assessment_bridge_unavailable"
            };
        }

        var result = bridge.recordAssessment(record);

        return {
            success: !!result,
            result: result
        };
    }

    function recordCurriculumEvidence(config) {
        config = config || {};

        if (!authorized()) {
            return {
                success: false,
                reason: "authorization_required"
            };
        }

        var bridge = curriculumBridge();

        if (!bridge || typeof bridge.recordTeacherEvidence !== "function") {
            return {
                success: false,
                reason: "curriculum_bridge_unavailable"
            };
        }

        var evidenceResult =
            bridge.recordTeacherEvidence(config);

        if (!evidenceResult.success) {
            return evidenceResult;
        }

        var assessmentRecord = createAssessmentRecord(
            {
                id: config.indicatorId,
                subjectId: config.subjectId,
                level: config.level,
                term: config.term,
                strand: config.strand
            },
            config
        );

        var assessmentResult =
            publishAssessmentToExistingSystem(
                assessmentRecord
            );

        refreshDashboards();

        return {
            success: true,
            curriculumEvidence: evidenceResult,
            assessmentConnection: assessmentResult,
            dashboardRefreshed: true,
            prototype: true
        };
    }

    function recordCoverage(c) {
        var e = window.PacificEducationCurriculumCoverageEngine;
        if (!e || typeof e.record !== "function") {
            return { success: false, error: "Coverage Engine unavailable" };
        }
        return e.record(c || {});
    }

    function getCoverageSummary(c) {
        var e = window.PacificEducationCurriculumCoverageEngine;
        return e && typeof e.summarize === "function" ?
            e.summarize(c || {}) : null;
    }

    function refreshDashboards() {
        var d = dashboards();

        if (!d) {
            return false;
        }

        if (typeof d.refreshAllDashboards === "function") {
            d.refreshAllDashboards();
            return true;
        }

        if (typeof window.refreshAllDashboards === "function") {
            window.refreshAllDashboards();
            return true;
        }

        return false;
    }

    function getDashboardSnapshot() {
        var d = dashboards();

        if (!d || typeof d.getStudentData !== "function") {
            return null;
        }

        try {
            return copy(d.getStudentData());
        } catch (error) {
            return null;
        }
    }

    function getExistingAssessments() {
        var bridge = assessmentBridge();

        if (!bridge || typeof bridge.getAssessments !== "function") {
            return [];
        }

        return copy(bridge.getAssessments());
    }

    function getSystemStatus() {
        return {
            version: VERSION,
            prototype: true,
            connections: connectionStatus(),
            dashboardAvailable:
                !!getDashboardSnapshot(),
            assessmentCount:
                getExistingAssessments().length
        };
    }

    window.PacificEducationCurriculumAssessmentDashboardBridge =
        Object.freeze({
            name:
                "PacificEducationCurriculumAssessmentDashboardBridge",

            version:
                VERSION,

            connectionStatus:
                connectionStatus,

            generateDailyLearningRecord:
                generateDailyLearningRecord,

            createAssessmentRecord:
                createAssessmentRecord,

            publishAssessmentToExistingSystem:
                publishAssessmentToExistingSystem,

            recordCurriculumEvidence:
                recordCurriculumEvidence,

            recordCoverage:
                recordCoverage,

            getCoverageSummary:
                getCoverageSummary,

            refreshDashboards:
                refreshDashboards,

            getDashboardSnapshot:
                getDashboardSnapshot,

            getExistingAssessments:
                getExistingAssessments,

            getSystemStatus:
                getSystemStatus
        });

})(window);
