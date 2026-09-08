/*
 * Pacific Education — Dashboard Integration
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

    function getState() {
        const core = getCore();

        if (!core || !isAuthorized()) {
            return null;
        }

        if (typeof core.getState !== "function") {
            return null;
        }

        return core.getState();
    }

    function getStudentSummary() {
        const state = getState();

        if (!state) {
            return null;
        }

        return {
            student: state.student || null,
            lesson: state.lesson || null,
            dailyLearningCheck: state.dailyLearningCheck || null,
            assessments: state.assessments || [],
            marks: state.marks || [],
            interventions: state.interventions || [],
            learningHistory: state.learningHistory || []
        };
    }

    function getDashboardData(role) {
        const state = getState();

        if (!state) {
            return null;
        }

        return {
            role: role || state.identity.role || null,
            identity: state.identity || null,
            workspace: state.workspace || null,
            student: state.student || null,
            curriculum: state.curriculum || null,
            lesson: state.lesson || null,
            dailyLearningCheck:
                state.dailyLearningCheck || null,
            activities: state.activities || [],
            learningHistory:
                state.learningHistory || [],
            assessments:
                state.assessments || [],
            marks:
                state.marks || [],
            interventions:
                state.interventions || [],
            audit:
                state.audit || []
        };
    }

    function refresh() {
        if (!isAuthorized()) {
            return {
                success: false,
                reason: "authorization_required"
            };
        }

        const data = getDashboardData();

        window.dispatchEvent(
            new CustomEvent(
                "pacificEducationDashboardRefreshed",
                {
                    detail: data
                }
            )
        );

        return {
            success: true,
            data: data
        };
    }

    window.PacificEducationDashboards = Object.freeze({
        version: VERSION,
        isAuthorized: isAuthorized,
        getState: getState,
        getStudentSummary: getStudentSummary,
        getDashboardData: getDashboardData,
        refresh: refresh
    });

    window.dispatchEvent(
        new CustomEvent(
            "pacificEducationDashboardsLoaded",
            {
                detail: {
                    version: VERSION
                }
            }
        )
    );

})();
