/* =========================================================
   PACIFIC EDUCATION
   LESSON ↔ ASSESSMENT ↔ DASHBOARD CONNECTION
   VERSION 1.1.0

   PURPOSE
   ---------------------------------------------------------
   Controlled connection layer for:
     • Daily Lesson Engine
     • Assessment Engine
     • Dashboard Engine

   Provides:
     • Day 30 Alphabet Assessment display
     • Day 30 progression checkpoint
     • Day 60 progression checkpoint
     • Assessment/dashboard refresh connection
     • Safe Owner Test Mode handling

   IMPORTANT
   ---------------------------------------------------------
   This file does NOT replace the existing lesson,
   assessment or dashboard engines.

   Owner Test Mode must never modify real learner
   progression through this connection layer.
========================================================= */

(function () {

    "use strict";


    /* =====================================================
       VERSION
    ===================================================== */

    const VERSION = "1.1.0";


    /* =====================================================
       CONNECTION STATE
       -----------------------------------------------------
       Kept outside the public API so it cannot be lost
       when the public API object is created.
    ===================================================== */

    let completionConnected = false;

    let monitorStarted = false;


    /* =====================================================
       REQUIRED ENGINE CHECK
    ===================================================== */

    function getConnections() {

        return {

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
       CURRENT REAL LEARNER DAY
       -----------------------------------------------------
       Owner test day is deliberately ignored.
    ===================================================== */

    function getCurrentDay() {

        let day = parseInt(
            localStorage.getItem(
                "currentDayNumber"
            ) || "1",
            10
        );

        if (
            isNaN(day) ||
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
       OWNER TEST MODE CHECK
    ===================================================== */

    function isOwnerTestMode() {

        return !!localStorage.getItem(
            "pacificOwnerTestDay"
        );

    }


    /* =====================================================
       CREATE DAY 30 ASSESSMENT PANEL
    ===================================================== */

    function ensureAlphabetAssessmentPanel() {

        const existingPanel =
            document.getElementById(
                "alphabetAssessmentDay30"
            );

        if (existingPanel) {

            return;

        }


        const phonicsPanel =
            document.getElementById(
                "phonicsAssessmentDay60"
            );

        if (!phonicsPanel) {

            console.warn(
                "Pacific Education: Day 60 assessment panel not found."
            );

            return;

        }


        const panel =
            document.createElement(
                "div"
            );

        panel.className =
            "activity";

        panel.id =
            "alphabetAssessmentDay30";

        panel.style.display =
            "none";


        panel.innerHTML = `
            <h3>🔤 Day 30 — Alphabet Assessment</h3>

            <p>
                Test your knowledge of letters,
                letter names and basic alphabet skills.
            </p>

            <button
                type="button"
                id="startAlphabetAssessmentConnectionButton">

                ▶️ Start Alphabet Assessment

            </button>
        `;


        phonicsPanel.parentNode.insertBefore(
            panel,
            phonicsPanel
        );


        const button =
            document.getElementById(
                "startAlphabetAssessmentConnectionButton"
            );

        if (!button) {

            return;

        }


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


                console.error(
                    "Pacific Education: Alphabet Assessment engine is unavailable."
                );

            }
        );

    }


    /* =====================================================
       ASSESSMENT VISIBILITY
    ===================================================== */

    function updateAssessmentVisibility() {

        const day =
            getCurrentDay();


        const alphabet =
            document.getElementById(
                "alphabetAssessmentDay30"
            );

        const phonics =
            document.getElementById(
                "phonicsAssessmentDay60"
            );


        if (alphabet) {

            alphabet.style.display =
                day === 30
                    ? "block"
                    : "none";

        }


        if (phonics) {

            phonics.style.display =
                day === 60
                    ? "block"
                    : "none";

        }

    }


    /* =====================================================
       CHECKPOINT CONTROL
    ===================================================== */

    function checkpointBlocksCompletion(day) {

        if (day === 30) {

            return (
                localStorage.getItem(
                    "alphabetAssessmentPassed"
                ) !== "true"
            );

        }


        if (day === 60) {

            return (
                localStorage.getItem(
                    "phonicsAssessmentPassed"
                ) !== "true"
            );

        }


        return false;

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

            window.showLesson(
                `
                <div class="activity">

                    <h3>📘 Assessment Checkpoint</h3>

                    <p>
                        ${message}
                    </p>

                    <button
                        type="button"
                        onclick="startDailyLesson()">

                        ↩️ Return to Lesson

                    </button>

                </div>
                `
            );

            return;

        }


        console.info(
            "Pacific Education:",
            message
        );

    }


    /* =====================================================
       CONTROLLED LESSON COMPLETION
       -----------------------------------------------------
       Wraps the existing dashboard completion function
       exactly once.

       The state flag is stored in this closure and is
       therefore not overwritten by the public API object.
    ===================================================== */

    function connectLessonCompletion() {

        if (completionConnected) {

            return;

        }


        if (
            typeof window.completeLesson !==
            "function"
        ) {

            console.warn(
                "Pacific Education: completeLesson() is not available yet."
            );

            return;

        }


        const originalCompleteLesson =
            window.completeLesson;


        function connectedCompleteLesson() {

            /*
             * Owner Test Mode is intentionally excluded
             * from real learner checkpoint control.
             *
             * The existing dashboard engine remains
             * responsible for Owner Test Mode behaviour.
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
             * Normal lesson progression.
             */

            originalCompleteLesson();

            updateAssessmentVisibility();

        }


        window.completeLesson =
            connectedCompleteLesson;


        completionConnected =
            true;

    }


    /* =====================================================
       REFRESH AFTER ASSESSMENT
    ===================================================== */

    function refreshAfterAssessment() {

        if (
            typeof window.displayDailyLesson ===
            "function"
        ) {

            window.displayDailyLesson();

        }


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

        }


        updateAssessmentVisibility();

    }


    /* =====================================================
       ASSESSMENT RESULT MONITOR
       -----------------------------------------------------
       Only watches pass/fail state keys already written
       by the assessment engine.

       No assessment answers are collected here.
    ===================================================== */

    let lastAlphabetResult =
        localStorage.getItem(
            "alphabetAssessmentPassed"
        );


    let lastPhonicsResult =
        localStorage.getItem(
            "phonicsAssessmentPassed"
        );


    function monitorAssessmentResults() {

        const alphabetResult =
            localStorage.getItem(
                "alphabetAssessmentPassed"
            );


        const phonicsResult =
            localStorage.getItem(
                "phonicsAssessmentPassed"
            );


        if (
            alphabetResult !==
            lastAlphabetResult
        ) {

            lastAlphabetResult =
                alphabetResult;

            refreshAfterAssessment();

        }


        if (
            phonicsResult !==
            lastPhonicsResult
        ) {

            lastPhonicsResult =
                phonicsResult;

            refreshAfterAssessment();

        }

    }


    /* =====================================================
       START RESULT MONITOR
       -----------------------------------------------------
       Prevents multiple monitoring intervals.
    ===================================================== */

    function startResultMonitor() {

        if (monitorStarted) {

            return;

        }


        monitorStarted =
            true;


        window.setInterval(
            monitorAssessmentResults,
            500
        );

    }


    /* =====================================================
       INITIALIZE CONNECTION
    ===================================================== */

    function initialize() {

        ensureAlphabetAssessmentPanel();

        updateAssessmentVisibility();

        connectLessonCompletion();

        startResultMonitor();


        /*
         * A zero-delay retry allows any DOMContentLoaded
         * initialization performed by connected engines
         * to complete before the connection is checked
         * again.
         */

        window.setTimeout(
            function () {

                ensureAlphabetAssessmentPanel();

                updateAssessmentVisibility();

                connectLessonCompletion();

            },
            0
        );

    }


    /* =====================================================
       PUBLIC CONNECTION API
       -----------------------------------------------------
       completionConnected is exposed as read-only through
       a getter so the internal state cannot accidentally
       be replaced by another object assignment.
    ===================================================== */

    const publicAPI = {

        version:
            VERSION,

        getConnections:
            getConnections,

        enginesReady:
            enginesReady,

        getCurrentDay:
            getCurrentDay,

        isOwnerTestMode:
            isOwnerTestMode,

        updateAssessmentVisibility:
            updateAssessmentVisibility,

        ensureAlphabetAssessmentPanel:
            ensureAlphabetAssessmentPanel,

        checkpointBlocksCompletion:
            checkpointBlocksCompletion,

        refreshAfterAssessment:
            refreshAfterAssessment,

        connectLessonCompletion:
            connectLessonCompletion

    };


    Object.defineProperty(
        publicAPI,
        "completionConnected",
        {
            enumerable: true,

            get:
                function () {
                    return completionConnected;
                }
        }
    );


    window.PacificEducationLessonAssessmentConnection =
        publicAPI;


    /* =====================================================
       PAGE START
    ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initialize,
            {
                once: true
            }
        );

    } else {

        initialize();

    }


})();
