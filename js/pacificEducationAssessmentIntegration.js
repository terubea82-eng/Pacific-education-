/*
 * =========================================================
 * PACIFIC EDUCATION
 * ASSESSMENT INTEGRATION + LESSON CONNECTION
 * Version: 2.1.0
 *
 * EXISTING FILE:
 * js/pacificEducationAssessmentIntegration.js
 *
 * PURPOSE
 * ---------------------------------------------------------
 * Connects the existing:
 *
 *   Daily Lessons
 *        ↕
 *   Assessments
 *        ↕
 *   Dashboards
 *        ↕
 *   Pacific Education Core
 *
 * IMPORTANT
 * ---------------------------------------------------------
 * This file does NOT replace:
 * • the lesson engine
 * • the assessment engine
 * • the dashboard engine
 *
 * It connects those existing systems.
 *
 * Day 30 Alphabet Assessment:
 * • blocks normal completion until passed
 * • records the pass state after finishAssessment()
 * • unlocks Day 31 after a pass
 *
 * Day 60 Phonics Assessment:
 * • blocks normal completion until passed
 * • preserves the existing assessment engine's
 *   Day 61 progression
 *
 * Owner Test Mode:
 * • does not count test lessons as learner progress
 *
 * No payment information is handled here.
 * No payment secrets are stored here.
 * No assessment answers are stored by this connector.
 * =========================================================
 */

(function () {

    "use strict";


    const VERSION = "2.1.0";


    /* =====================================================
       CORE
    ===================================================== */

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
            return false;
        }

        if (
            !core.assessments ||
            typeof core.assessments.add !== "function"
        ) {
            return false;
        }

        if (
            !assessment ||
            typeof assessment !== "object"
        ) {
            return false;
        }

        return core.assessments.add(assessment);

    }


    /* =====================================================
       ENGINE CONNECTIONS
    ===================================================== */

    function getConnections() {

        return {

            core:
                !!window.PacificEducationCore,

            dailyLessons:
                !!window.PacificEducationDailyLessons,

            assessments:
                !!window.PacificEducationAssessments,

            dashboards:
                !!window.PacificEducationDashboards,

            completeLesson:
                typeof window.completeLesson === "function",

            finishAssessment:
                typeof window.finishAssessment === "function"

        };

    }


    function enginesReady() {

        const connections = getConnections();

        return (
            connections.dailyLessons &&
            connections.assessments &&
            connections.dashboards
        );

    }


    /* =====================================================
       CURRENT DAY
    ===================================================== */

    function getCurrentDay() {

        let day = parseInt(
            localStorage.getItem(
                "currentDayNumber"
            ) || "1",
            10
        );

        if (
            !Number.isFinite(day) ||
            day < 1
        ) {
            day = 1;
        }

        if (day > 365) {
            day = 365;
        }

        return day;

    }


    /* =====================================================
       OWNER TEST MODE
    ===================================================== */

    function isOwnerTestMode() {

        return !!localStorage.getItem(
            "pacificOwnerTestDay"
        );

    }


    /* =====================================================
       PASS FLAGS
    ===================================================== */

    function alphabetAssessmentPassed() {

        return (
            localStorage.getItem(
                "alphabetAssessmentPassed"
            ) === "true"
        );

    }


    function phonicsAssessmentPassed() {

        return (
            localStorage.getItem(
                "phonicsAssessmentPassed"
            ) === "true"
        );

    }


    /* =====================================================
       CHECKPOINTS
    ===================================================== */

    function checkpointBlocksCompletion(day) {

        if (day === 30) {

            return !alphabetAssessmentPassed();

        }

        if (day === 60) {

            return !phonicsAssessmentPassed();

        }

        return false;

    }


    /* =====================================================
       DAY 30 PANEL
    ===================================================== */

    function ensureAlphabetAssessmentPanel() {

        const existing =
            document.getElementById(
                "alphabetAssessmentDay30"
            );

        if (existing) {

            return existing;

        }


        const phonicsPanel =
            document.getElementById(
                "phonicsAssessmentDay60"
            );

        if (!phonicsPanel) {

            return null;

        }


        const panel =
            document.createElement("div");

        panel.className = "activity";

        panel.id =
            "alphabetAssessmentDay30";

        panel.style.display = "none";

        panel.innerHTML = `
            <h3>🔤 Day 30 — Alphabet Assessment</h3>

            <p>
                Complete and pass the Day 30 Alphabet
                Assessment before continuing to Day 31.
            </p>

            <button
                type="button"
                id="startAlphabetAssessmentIntegrationButton">
                ▶️ Start Alphabet Assessment
            </button>

            <p
                id="alphabetAssessmentConnectionStatus"
                aria-live="polite">
            </p>
        `;


        if (phonicsPanel.parentNode) {

            phonicsPanel.parentNode.insertBefore(
                panel,
                phonicsPanel
            );

        }


        const button =
            document.getElementById(
                "startAlphabetAssessmentIntegrationButton"
            );


        if (button) {

            button.addEventListener(
                "click",
                startAlphabetAssessment
            );

        }


        return panel;

    }


    /* =====================================================
       ASSESSMENT VISIBILITY
    ===================================================== */

    function updateAssessmentVisibility() {

        const day = getCurrentDay();


        const alphabetPanel =
            document.getElementById(
                "alphabetAssessmentDay30"
            );


        const phonicsPanel =
            document.getElementById(
                "phonicsAssessmentDay60"
            );


        if (alphabetPanel) {

            alphabetPanel.style.display =
                day === 30
                    ? "block"
                    : "none";

        }


        if (phonicsPanel) {

            phonicsPanel.style.display =
                day === 60
                    ? "block"
                    : "none";

        }

    }


    /* =====================================================
       CHECKPOINT MESSAGE
    ===================================================== */

    function showCheckpointMessage(day) {

        let message = "";


        if (day === 30) {

            message =
                "Please complete and pass the Day 30 Alphabet Assessment before continuing to Day 31.";

        }


        if (day === 60) {

            message =
                "Please complete and pass the Day 60 Phonics Assessment before continuing to Day 61.";

        }


        if (!message) {

            return;

        }


        if (
            typeof window.showLesson ===
            "function"
        ) {

            window.showLesson(`
                <div class="activity">

                    <h3>📘 Assessment Checkpoint</h3>

                    <p>${message}</p>

                    <button
                        type="button"
                        id="assessmentCheckpointReturnButton">
                        ↩️ Return to Lesson
                    </button>

                </div>
            `);


            const returnButton =
                document.getElementById(
                    "assessmentCheckpointReturnButton"
                );


            if (returnButton) {

                returnButton.addEventListener(
                    "click",
                    function () {

                        if (
                            typeof window.startDailyLesson ===
                            "function"
                        ) {

                            window.startDailyLesson();

                        }

                    }
                );

            }

            return;

        }


        console.info(
            "Pacific Education:",
            message
        );

    }


    /* =====================================================
       REFRESH CONNECTED SYSTEMS
    ===================================================== */

    function refreshConnectedSystems() {

        if (
            typeof window.displayDailyLesson ===
            "function"
        ) {

            window.displayDailyLesson();

        } else if (
            typeof window.startDailyLesson ===
            "function"
        ) {

            window.startDailyLesson();

        }


        if (
            window.PacificEducationDashboards &&
            typeof
                window.PacificEducationDashboards.refreshAll ===
                "function"
        ) {

            window.PacificEducationDashboards.refreshAll();

        } else if (
            typeof window.refreshAllDashboards ===
            "function"
        ) {

            window.refreshAllDashboards();

        } else {

            if (
                typeof window.refreshTeacherDashboard ===
                "function"
            ) {

                window.refreshTeacherDashboard();

            }


            if (
                typeof window.refreshParentDashboard ===
                "function"
            ) {

                window.refreshParentDashboard();

            }

        }


        ensureAlphabetAssessmentPanel();
        updateAssessmentVisibility();

    }


    /* =====================================================
       LESSON COMPLETION CONNECTION
    ===================================================== */

    let originalCompleteLesson = null;

    let completionConnected = false;


    function connectLessonCompletion() {

        if (completionConnected) {

            return true;

        }


        if (
            typeof window.completeLesson !==
            "function"
        ) {

            return false;

        }


        originalCompleteLesson =
            window.completeLesson;


        window.completeLesson =
            function connectedCompleteLesson() {

                /*
                 * Owner Test Mode is delegated to the
                 * existing dashboard engine.
                 */
                if (isOwnerTestMode()) {

                    originalCompleteLesson();

                    updateAssessmentVisibility();

                    return;

                }


                const day = getCurrentDay();


                /*
                 * Day 30 checkpoint.
                 */
                if (
                    day === 30 &&
                    checkpointBlocksCompletion(30)
                ) {

                    showCheckpointMessage(30);

                    updateAssessmentVisibility();

                    return;

                }


                /*
                 * Day 60 checkpoint.
                 */
                if (
                    day === 60 &&
                    checkpointBlocksCompletion(60)
                ) {

                    showCheckpointMessage(60);

                    updateAssessmentVisibility();

                    return;

                }


                /*
                 * Normal progression remains owned by
                 * dashboards.js.
                 */
                originalCompleteLesson();

                updateAssessmentVisibility();

            };


        completionConnected = true;

        return true;

    }


    /* =====================================================
       ASSESSMENT START — ALPHABET
       ===================================================== */

    function startAlphabetAssessment() {

        const assessments =
            window.PacificEducationAssessments;


        /*
         * IMPORTANT:
         * The verified public API uses startAlphabet().
         */
        if (
            assessments &&
            typeof assessments.startAlphabet ===
            "function"
        ) {

            return assessments.startAlphabet();

        }


        /*
         * Keep compatibility with the existing global
         * assessment function.
         */
        if (
            typeof window.startAlphabetAssessment ===
            "function"
        ) {

            return window.startAlphabetAssessment();

        }


        const status =
            document.getElementById(
                "alphabetAssessmentConnectionStatus"
            );


        if (status) {

            status.textContent =
                "Alphabet Assessment is not available yet. Please try again after the assessment engine has loaded.";

        }


        console.error(
            "Pacific Education: Alphabet Assessment engine unavailable."
        );

        return false;

    }


    /* =====================================================
       ASSESSMENT START — PHONICS
    ===================================================== */

    function startPhonicsAssessment() {

        const assessments =
            window.PacificEducationAssessments;


        /*
         * IMPORTANT:
         * The verified public API uses startPhonics().
         */
        if (
            assessments &&
            typeof assessments.startPhonics ===
            "function"
        ) {

            return assessments.startPhonics();

        }


        if (
            typeof window.startPhonicsAssessment ===
            "function"
        ) {

            return window.startPhonicsAssessment();

        }


        console.error(
            "Pacific Education: Phonics Assessment engine unavailable."
        );

        return false;

    }


    /* =====================================================
       READ LATEST ASSESSMENT RESULT
    ===================================================== */

    function getLatestAssessmentResult() {

        const raw =
            localStorage.getItem(
                "pacificEducationAssessments"
            );


        if (!raw) {

            return null;

        }


        try {

            const data = JSON.parse(raw);


            if (Array.isArray(data)) {

                if (!data.length) {
                    return null;
                }

                return data[data.length - 1];

            }


            if (
                data &&
                Array.isArray(data.history) &&
                data.history.length
            ) {

                return data.history[
                    data.history.length - 1
                ];

            }


            return null;

        } catch (error) {

            console.warn(
                "Pacific Education: Could not read assessment history.",
                error
            );

            return null;

        }

    }


    /* =====================================================
       NORMALIZE ASSESSMENT RESULT
    ===================================================== */

    function getAssessmentResultType(result) {

        if (!result || typeof result !== "object") {
            return "";
        }


        return String(
            result.type ||
            result.assessmentType ||
            ""
        ).toLowerCase();

    }


    function getAssessmentResultDay(result) {

        if (!result || typeof result !== "object") {
            return 0;
        }


        const day = parseInt(
            result.day ||
            result.dayNumber ||
            0,
            10
        );


        return Number.isFinite(day)
            ? day
            : 0;

    }


    function getAssessmentResultPassed(result) {

        if (!result || typeof result !== "object") {
            return false;
        }


        if (
            result.passed === true ||
            result.passed === "true"
        ) {

            return true;

        }


        if (
            result.pass === true ||
            result.pass === "true"
        ) {

            return true;

        }


        const percentage =
            Number(
                result.percentage ??
                result.scorePercentage ??
                result.percent
            );


        return (
            Number.isFinite(percentage) &&
            percentage >= 80
        );

    }


    /* =====================================================
       APPLY DAY 30 RESULT
    ===================================================== */

    function applyAlphabetAssessmentResult(result) {

        const type =
            getAssessmentResultType(result);

        const day =
            getAssessmentResultDay(result);


        if (
            type !== "alphabet" ||
            day !== 30
        ) {

            return false;

        }


        const passed =
            getAssessmentResultPassed(result);


        if (passed) {

            /*
             * Day 30 pass unlocks Day 31.
             */
            localStorage.setItem(
                "alphabetAssessmentPassed",
                "true"
            );

            localStorage.setItem(
                "currentDayNumber",
                "31"
            );

            localStorage.setItem(
                "currentDay",
                "Day 31"
            );

            localStorage.setItem(
                "learningStatus",
                "Passed — Day 31 unlocked"
            );

        } else {

            /*
             * Failed Day 30 assessment keeps the learner
             * at Day 30 for additional practice.
             */
            localStorage.setItem(
                "alphabetAssessmentPassed",
                "false"
            );

            localStorage.setItem(
                "currentDayNumber",
                "30"
            );

            localStorage.setItem(
                "currentDay",
                "Day 30"
            );

            localStorage.setItem(
                "learningStatus",
                "Additional practice recommended"
            );

        }


        refreshConnectedSystems();

        return true;

    }


    /* =====================================================
       ASSESSMENT RESULT CONNECTION
       -----------------------------------------------------
       The existing finishAssessment() remains the owner
       of assessment calculation/history.

       This connector runs AFTER it finishes and then
       applies the Day 30 progression connection.
    ===================================================== */

    let originalFinishAssessment = null;

    let finishAssessmentConnected = false;

    let lastProcessedAssessmentSignature = "";


    function createAssessmentSignature(result) {

        if (!result) {

            return "";

        }


        try {

            return JSON.stringify(result);

        } catch (error) {

            return String(
                Date.now()
            );

        }

    }


    function connectAssessmentResult() {

        if (finishAssessmentConnected) {

            return true;

        }


        if (
            typeof window.finishAssessment !==
            "function"
        ) {

            return false;

        }


        originalFinishAssessment =
            window.finishAssessment;


        window.finishAssessment =
            function connectedFinishAssessment() {

                /*
                 * First let the existing assessment engine
                 * calculate, save and finish normally.
                 */
                const result =
                    originalFinishAssessment.apply(
                        this,
                        arguments
                    );


                /*
                 * Then inspect the newly saved assessment.
                 */
                const latest =
                    getLatestAssessmentResult();


                const signature =
                    createAssessmentSignature(
                        latest
                    );


                if (
                    latest &&
                    signature !==
                    lastProcessedAssessmentSignature
                ) {

                    lastProcessedAssessmentSignature =
                        signature;


                    applyAlphabetAssessmentResult(
                        latest
                    );

                } else {

                    refreshConnectedSystems();

                }


                return result;

            };


        finishAssessmentConnected = true;

        return true;

    }


    /* =====================================================
       INITIALIZATION
    ===================================================== */

    let initializationAttempts = 0;

    const MAX_INITIALIZATION_ATTEMPTS = 20;


    function initializeConnection() {

        ensureAlphabetAssessmentPanel();

        updateAssessmentVisibility();


        const lessonReady =
            connectLessonCompletion();


        const assessmentReady =
            connectAssessmentResult();


        if (
            !lessonReady ||
            !assessmentReady
        ) {

            initializationAttempts += 1;


            if (
                initializationAttempts <
                MAX_INITIALIZATION_ATTEMPTS
            ) {

                setTimeout(
                    initializeConnection,
                    100
                );

            } else {

                console.warn(
                    "Pacific Education: assessment/lesson connections could not all be attached during initialization."
                );

            }

        }

    }


    /* =====================================================
       STORAGE CONNECTION
    ===================================================== */

    function handleStorageChange(event) {

        if (!event) {

            return;

        }


        const relevantKeys = [

            "currentDayNumber",
            "currentDay",
            "alphabetAssessmentPassed",
            "phonicsAssessmentPassed",
            "lessonsCompleted",
            "learningStatus",
            "pacificEducationAssessments"

        ];


        if (
            event.key === null ||
            relevantKeys.indexOf(event.key) !== -1
        ) {

            ensureAlphabetAssessmentPanel();

            refreshConnectedSystems();

        }

    }


    /* =====================================================
       BOUNDED RESULT WATCH
       ===================================================== */

    let lastAlphabetPassed =
        alphabetAssessmentPassed();

    let lastPhonicsPassed =
        phonicsAssessmentPassed();

    let resultWatchAttempts = 0;

    const MAX_RESULT_WATCH_ATTEMPTS = 120;


    function watchAssessmentResults() {

        const currentAlphabetPassed =
            alphabetAssessmentPassed();

        const currentPhonicsPassed =
            phonicsAssessmentPassed();


        if (
            currentAlphabetPassed !==
            lastAlphabetPassed
        ) {

            lastAlphabetPassed =
                currentAlphabetPassed;

            refreshConnectedSystems();

        }


        if (
            currentPhonicsPassed !==
            lastPhonicsPassed
        ) {

            lastPhonicsPassed =
                currentPhonicsPassed;

            refreshConnectedSystems();

        }


        resultWatchAttempts += 1;


        if (
            resultWatchAttempts <
            MAX_RESULT_WATCH_ATTEMPTS
        ) {

            setTimeout(
                watchAssessmentResults,
                500
            );

        }

    }


    /* =====================================================
       MANUAL REFRESH
    ===================================================== */

    function refreshConnection() {

        ensureAlphabetAssessmentPanel();

        updateAssessmentVisibility();

        connectLessonCompletion();

        connectAssessmentResult();

        refreshConnectedSystems();

        return getConnectionStatus();

    }


    /* =====================================================
       CONNECTION STATUS
    ===================================================== */

    function getConnectionStatus() {

        const connections =
            getConnections();


        return {

            version:
                VERSION,

            core:
                connections.core,

            dailyLessons:
                connections.dailyLessons,

            assessments:
                connections.assessments,

            dashboards:
                connections.dashboards,

            completeLesson:
                connections.completeLesson,

            finishAssessment:
                connections.finishAssessment,

            enginesReady:
                enginesReady(),

            currentDay:
                getCurrentDay(),

            ownerTestMode:
                isOwnerTestMode(),

            alphabetAssessmentPassed:
                alphabetAssessmentPassed(),

            phonicsAssessmentPassed:
                phonicsAssessmentPassed(),

            completionConnected:
                completionConnected,

            finishAssessmentConnected:
                finishAssessmentConnected

        };

    }


    /* =====================================================
       PUBLIC API
    ===================================================== */

    window.PacificEducationAssessmentIntegration = {

        version:
            VERSION,

        isAuthorized:
            isAuthorized,

        recordAssessment:
            recordAssessment,

        getConnections:
            getConnections,

        enginesReady:
            enginesReady,

        getCurrentDay:
            getCurrentDay,

        isOwnerTestMode:
            isOwnerTestMode,

        alphabetAssessmentPassed:
            alphabetAssessmentPassed,

        phonicsAssessmentPassed:
            phonicsAssessmentPassed,

        checkpointBlocksCompletion:
            checkpointBlocksCompletion,

        ensureAlphabetAssessmentPanel:
            ensureAlphabetAssessmentPanel,

        updateAssessmentVisibility:
            updateAssessmentVisibility,

        refreshConnectedSystems:
            refreshConnectedSystems,

        connectLessonCompletion:
            connectLessonCompletion,

        connectAssessmentResult:
            connectAssessmentResult,

        startAlphabetAssessment:
            startAlphabetAssessment,

        startPhonicsAssessment:
            startPhonicsAssessment,

        refreshConnection:
            refreshConnection,

        getConnectionStatus:
            getConnectionStatus

    };


    /*
     * Freeze the public connector so other scripts cannot
     * silently replace its API methods.
     */
    Object.freeze(
        window.PacificEducationAssessmentIntegration
    );


    /* =====================================================
       BROWSER STORAGE
    ===================================================== */

    window.addEventListener(
        "storage",
        handleStorageChange
    );


    /* =====================================================
       START
    ===================================================== */

    function startIntegration() {

        initializeConnection();

        watchAssessmentResults();

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            startIntegration,
            {
                once: true
            }
        );

    } else {

        startIntegration();

    }


})();
