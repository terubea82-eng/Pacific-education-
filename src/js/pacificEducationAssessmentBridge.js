/*
 * Pacific Education — Assessment Bridge
 * Version: 1.0.0
 */

(function () {
    "use strict";

    const VERSION = "1.0.0";

    function getCore() {
        return window.PacificEducationCore || null;
    }

    function isAuthorized() {
        const core = getCore();

        return !!(
            core &&
            core.identity &&
            typeof core.identity.isAuthorized === "function" &&
            core.identity.isAuthorized()
        );
    }

    function recordAssessment(assessment) {
        const core = getCore();

        if (!core || !isAuthorized()) {
            return {
                success: false,
                reason: "authorization_required"
            };
        }

        if (
            !core.assessments ||
            typeof core.assessments.add !== "function"
        ) {
            return {
                success: false,
                reason: "assessment_core_unavailable"
            };
        }

        if (!assessment || typeof assessment !== "object") {
            return {
                success: false,
                reason: "invalid_assessment"
            };
        }

        return core.assessments.add(assessment);
    }

    function getAssessments() {
        const core = getCore();

        if (!core || !isAuthorized()) {
            return [];
        }

        const state =
            typeof core.getState === "function"
                ? core.getState()
                : null;

        return state && Array.isArray(state.assessments)
            ? state.assessments
            : [];
    }

    window.PacificEducationAssessmentBridge =
        Object.freeze({
            version: VERSION,
            isAuthorized: isAuthorized,
            recordAssessment: recordAssessment,
            getAssessments: getAssessments
        });

    window.dispatchEvent(
        new CustomEvent(
            "pacificEducationAssessmentBridgeLoaded",
            {
                detail: {
                    version: VERSION
                }
            }
        )
    );

})();
