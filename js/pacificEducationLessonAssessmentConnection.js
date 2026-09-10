/* =========================================================
   PACIFIC EDUCATION
   LESSON ↔ ASSESSMENT ↔ DASHBOARD CONNECTION
   VERSION 1.0.0

   PURPOSE
   ---------------------------------------------------------
   Connects the existing:
     • Daily Lesson Engine
     • Assessment Engine
     • Dashboard Engine

   Repairs:
     • Missing Day 30 Alphabet Assessment display
     • Day 30 lesson-progression bypass
     • Day 60 lesson-progression bypass
     • Assessment/dashboard refresh connection

   IMPORTANT
   ---------------------------------------------------------
   This file does NOT replace the existing lesson,
   assessment or dashboard engines.

   It provides a controlled connection layer around them.

   Owner Test Mode:
     • Must never change real learner progress.
========================================================= */

(function () {

    "use strict";


    /* =====================================================
       VERSION
    ===================================================== */

    const VERSION = "1.0.0";


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

        const connections = getConnections();

        return (
            connections.dailyLessons &&
            connections.assessments &&
            connections.dashboards
        );

    }


    /* =====================================================
       CURRENT REAL LEARNER DAY
       -----------------------------------------------------
       Owner test mode is deliberately ignored here.
    ===================================================== */

    function getCurrentDay() {

        let day = parseInt(
            localStorage.getItem("currentDayNumber") || "1",
            10
        );

        if (isNaN(day) || day < 1) {
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
       -----------------------------------------------------
       The current HTML contains Day 60 but not Day 30.
       This creates the missing Day 30 panel safely.
    ===================================================== */

    function ensureAlphabetAssessmentPanel() {

        if (
            document.getElementById(
                "alphabetAssessmentDay30"
            )
        ) {

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
            document.createElement("div");

        panel.className = "activity";

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

        if (button) {

            button.addEventListener(
                "click",
                function () {

                    if (
                        window.PacificEducationAssessments &&
                        typeof window.PacificEducationAssessments.startAlphabetAssessment ===
                            "function"
                    ) {

                        window.PacificEducationAssessments
                            .startAlphabetAssessment();

                    } else if (
                        typeof window.startAlphabetAssessment ===
                        "function"
                    ) {

                        window.startAlphabetAssessment();

                    } else {

                        console.error(
                            "Pacific Education: Alphabet Assessment engine is unavailable."
                        );

                    }

                }
            );

        }

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
       CHECK WHETHER A CHECKPOINT BLOCKS PROGRESSION
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
       SHOW CHECKPOINT MESSAGE
    ===================================================== */

    function showCheckpointMessage(day) {

        let message = "";


        if (day === 30) {

            message =
                "Please complete and pass the Day 30 Alphabet Assessment before continuing to Day 31.";

        } else if (day === 60) {

            message =
                "Please complete and pass the Day 60 Phonics Assessment before continuing to Day 61.";

        }


        if (
            message &&
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

        } else {

            console.info(
                "Pacific Education:",
                message
            );

        }

    }


    /* =====================================================
       CONTROLLED LESSON COMPLETION
       -----------------------------------------------------
       This wraps the EXISTING dashboard function.

       It does not replace the dashboard engine's
       storage or owner-test logic.
    ===================================================== */

    function connectLessonCompletion() {

        if (
            typeof window.completeLesson !==
            "function"
        ) {

            console.warn(
                "Pacific Education: completeLesson() is not available yet."
            );

            return;

        }


        if (
            window.PacificEducationLessonAssessmentConnection &&
            window.PacificEducationLessonAssessmentConnection
                .completionConnected
        ) {

            return;

        }


        const originalCompleteLesson =
            window.completeLesson;


        function connectedCompleteLesson() {

            /*
               Owner Test Mode must remain completely
               separate from real learner progress.
            */

            if (isOwnerTestMode()) {

                originalCompleteLesson();

                updateAssessmentVisibility();

                return;

            }


            const day =
                getCurrentDay();


            /*
               Day 30 checkpoint
            */

            if (
                day === 30 &&
                checkpointBlocksCompletion(day)
            ) {

                showCheckpointMessage(30);

                updateAssessmentVisibility();

                return;

            }


            /*
               Day 60 checkpoint
            */

            if (
                day === 60 &&
                checkpointBlocksCompletion(day)
            ) {

                showCheckpointMessage(60);

                updateAssessmentVisibility();

                return;

            }


            /*
               Normal lesson progression.
            */

            originalCompleteLesson();

            updateAssessmentVisibility();

        }


        window.completeLesson =
            connectedCompleteLesson;


        window.PacificEducationLessonAssessmentConnection =
            window.PacificEducationLessonAssessmentConnection || {};

        window.PacificEducationLessonAssessmentConnection
            .completionConnected = true;

    }


    /* =====================================================
       ASSESSMENT RESULT MONITOR
       -----------------------------------------------------
       The existing assessment engine writes:
         alphabetAssessmentPassed
         phonicsAssessmentPassed
         currentDayNumber

       This connection simply refreshes the lesson,
       dashboards and visibility afterward.
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
            typeof window.PacificEducationDashboards
                .refreshAll ===
                "function"
        ) {

            window.PacificEducationDashboards
                .refreshAll();

        } else {

            if (
                typeof window.refreshAllDashboards ===
                "function"
            ) {

                window.refreshAllDashboards();

            }

        }


        updateAssessmentVisibility();

    }


    /* =====================================================
       ASSESSMENT STORAGE WATCH
       -----------------------------------------------------
       Detects a completed assessment without modifying
       the assessment engine itself.
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
       INITIALIZE CONNECTION
    ===================================================== */

    function initialize() {

        ensureAlphabetAssessmentPanel();

        updateAssessmentVisibility();

        /*
           dashboards.js is loaded after dailyLessons.js
           and assessments.js in the current HTML.
           Therefore connect after the page has loaded.
        */

        connectLessonCompletion();


        /*
           Run again after all DOMContentLoaded handlers
           have had a chance to initialize.
        */

        setTimeout(
            function () {

                ensureAlphabetAssessmentPanel();

                updateAssessmentVisibility();

                connectLessonCompletion();

            },
            0
        );


        /*
           Lightweight result monitoring.
           No assessment answers are collected here.
        */

        setInterval(
            monitorAssessmentResults,
            500
        );

    }


    /* =====================================================
       PUBLIC CONNECTION API
    ===================================================== */

    window.PacificEducationLessonAssessmentConnection = {

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

        refreshAfterAssessment:
            refreshAfterAssessment

    };


    /* =====================================================
       PAGE START
    ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initialize
        );

    } else {

        initialize();

    }


})();
