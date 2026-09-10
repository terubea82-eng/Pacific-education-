/*
 * =========================================================
 * PACIFIC EDUCATION
 * ASSESSMENT INTEGRATION + LESSON CONNECTION
 * Version: 2.0.0
 *
 * EXISTING FILE:
 * js/pacificEducationAssessmentIntegration.js
 *
 * PURPOSE
 * ---------------------------------------------------------
 * This file keeps the existing Core assessment connection
 * and adds the missing:
 *
 *   Daily Lessons
 *        ↕
 *   Assessments
 *        ↕
 *   Dashboards
 *
 * CONNECTIONS
 * ---------------------------------------------------------
 * • Existing Core authorization
 * • Existing assessment recording
 * • Day 30 Alphabet Assessment
 * • Day 60 Phonics Assessment
 * • Day 30 progression checkpoint
 * • Day 60 progression checkpoint
 * • Dashboard refresh after assessment
 * • Daily lesson refresh after assessment
 * • Owner Test Mode protection
 * • Missing Day 30 assessment panel
 *
 * IMPORTANT
 * ---------------------------------------------------------
 * This file does NOT replace the lesson engine,
 * assessment engine or dashboard engine.
 *
 * It connects the existing systems.
 *
 * No payment information is handled here.
 * No payment secrets are stored here.
 * No assessment answers are stored by this connector.
 * =========================================================
 */

(function () {

    "use strict";

    const VERSION = "2.0.0";


    /* =====================================================
       EXISTING CORE CONNECTION
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


    /*
     * Preserve the existing assessment recording API.
     */

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
       ENGINE CONNECTION STATUS
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
                !!window.PacificEducationDashboards

        };

    }


    function enginesReady() {

        const connections =
            getConnections();

        return (
            connections.dailyLessons &&
            connections.assessments &&
            connections.dashboards
        );

    }


    /* =====================================================
       SAFE CURRENT LEARNER DAY
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
       ASSESSMENT PASS STATUS
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
       CHECKPOINT STATUS
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
       DAY 30 ALPHABET PANEL
       -----------------------------------------------------
       Current HTML has the Day 60 panel but the Day 30
       panel is missing.

       This creates the Day 30 panel without requiring a
       second connection file.
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

            console.warn(
                "Pacific Education: Day 60 assessment panel was not found. Day 30 panel cannot yet be inserted."
            );

            return null;

        }


        const panel =
            document.createElement("div");

        panel.className = "activity";

        panel.id =
            "alphabetAssessmentDay30";

        panel.style.display =
            "none";

        panel.innerHTML = `
            <h3>🔤 Day 30 — Alphabet Assessment</h3>

            <p>
                Complete the Day 30 Alphabet Assessment
                before continuing to Day 31.
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


        /*
         * Insert immediately before the Day 60 panel.
         */

        if (
            phonicsPanel.parentNode
        ) {

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
                function () {

                    if (
                        window.PacificEducationAssessments &&
                        typeof
                            window.PacificEducationAssessments
                                .startAlphabetAssessment ===
                            "function"
                    ) {

                        window.PacificEducationAssessments
                            .startAlphabetAssessment();

                        return;

                    }


                    if (
                        typeof window.startAlphabetAssessment ===
                        "function"
                    ) {

                        window.startAlphabetAssessment();

                        return;

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

                }
            );

        }


        return panel;

    }


    /* =====================================================
       ASSESSMENT PANEL VISIBILITY
       ===================================================== */

    function updateAssessmentVisibility() {

        const day =
            getCurrentDay();


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
       SHOW CHECKPOINT
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

            window.showLesson(
                `
                <div class="activity">

                    <h3>📘 Assessment Checkpoint</h3>

                    <p>
                        ${message}
                    </p>

                    <button
                        type="button"
                        id="assessmentCheckpointReturnButton">

                        ↩️ Return to Lesson

                    </button>

                </div>
                `
            );


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

        /*
         * Refresh the daily lesson.
         */

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


        /*
         * Refresh dashboards.
         */

        if (
            window.PacificEducationDashboards &&
            typeof
                window.PacificEducationDashboards
                    .refreshAll ===
                "function"
        ) {

            window.PacificEducationDashboards
                .refreshAll();

        } else if (
            typeof window.refreshAllDashboards ===
            "function"
        ) {

            window.refreshAllDashboards();

        } else {

            /*
             * Try individual dashboard refresh functions
             * when available.
             */

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


        updateAssessmentVisibility();

    }


    /* =====================================================
       CONNECT COMPLETE LESSON
       -----------------------------------------------------
       The existing dashboards.js owns completeLesson().
       We add a controlled checkpoint around it.
    ===================================================== */

    let originalCompleteLesson =
        null;

    let completionConnected =
        false;


    function connectLessonCompletion() {

        if (
            completionConnected
        ) {

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
                 * Owner Test Mode must never be treated as
                 * normal learner progression.
                 */

                if (isOwnerTestMode()) {

                    originalCompleteLesson();

                    updateAssessmentVisibility();

                    return;

                }


                const day =
                    getCurrentDay();


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
                 * All normal lesson progression remains
                 * controlled by the existing dashboard engine.
                 */

                originalCompleteLesson();

                updateAssessmentVisibility();

            };


        completionConnected =
            true;


        return true;

    }


    /* =====================================================
       SAFE CONNECTION RETRY
       -----------------------------------------------------
       This does NOT use a permanent 500 ms polling loop.
       It retries only while the page is initializing.
    ===================================================== */

    let initializationAttempts =
        0;

    const MAX_INITIALIZATION_ATTEMPTS =
        20;


    function initializeConnection() {

        ensureAlphabetAssessmentPanel();

        updateAssessmentVisibility();


        if (
            !connectLessonCompletion()
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
                    "Pacific Education: lesson completion connection could not be attached after initialization."
                );

            }

        }

    }


    /* =====================================================
       STORAGE CHANGE HANDLER
       -----------------------------------------------------
       Used for changes made by another browser context.
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
            "learningStatus"

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
       LOCAL ASSESSMENT RESULT WATCH
       -----------------------------------------------------
       A short bounded watcher is used only to catch the
       assessment engine changing localStorage in the same
       page, because the browser storage event does not fire
       in the same document that made the change.
    ===================================================== */

    let lastAlphabetPassed =
        alphabetAssessmentPassed();

    let lastPhonicsPassed =
        phonicsAssessmentPassed();

    let resultWatchAttempts =
        0;

    const MAX_RESULT_WATCH_ATTEMPTS =
        120;


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
       ASSESSMENT START HELPERS
       ===================================================== */

    function startAlphabetAssessment() {

        if (
            window.PacificEducationAssessments &&
            typeof
                window.PacificEducationAssessments
                    .startAlphabetAssessment ===
                "function"
        ) {

            return window.PacificEducationAssessments
                .startAlphabetAssessment();

        }


        if (
            typeof window.startAlphabetAssessment ===
            "function"
        ) {

            return window.startAlphabetAssessment();

        }


        console.warn(
            "Pacific Education: Alphabet Assessment is unavailable."
        );

        return false;

    }


    function startPhonicsAssessment() {

        if (
            window.PacificEducationAssessments &&
            typeof
                window.PacificEducationAssessments
                    .startPhonicsAssessment ===
                "function"
        ) {

            return window.PacificEducationAssessments
                .startPhonicsAssessment();

        }


        if (
            typeof window.startPhonicsAssessment ===
            "function"
        ) {

            return window.startPhonicsAssessment();

        }


        console.warn(
            "Pacific Education: Phonics Assessment is unavailable."
        );

        return false;

    }


    /* =====================================================
       MANUAL REFRESH API
       ===================================================== */

    function refreshConnection() {

        ensureAlphabetAssessmentPanel();

        updateAssessmentVisibility();

        connectLessonCompletion();

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
                completionConnected

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

        startAlphabetAssessment:
            startAlphabetAssessment,

        startPhonicsAssessment:
            startPhonicsAssessment,

        refreshConnection:
            refreshConnection,

        getConnectionStatus:
            getConnectionStatus

    };


    /* =====================================================
       BROWSER STORAGE CONNECTION
       ===================================================== */

    window.addEventListener(
        "storage",
        handleStorageChange
    );


    /* =====================================================
       PAGE INITIALIZATION
       ===================================================== */

    function startIntegration() {

        initializeConnection();

        /*
         * Start the bounded assessment-result watcher.
         */

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
