/* =========================================
   PACIFIC EDUCATION — ASSESSMENTS
   VERSION 1.2.0
   Protected assessment engine

   Day 30 Alphabet Checkpoint
   Day 60 Phonics Checkpoint — 80% pass

   SECURITY:
   Assessment results must pass through
   PacificEducationCore before progression
   is unlocked.

   localStorage is used only as a
   compatibility cache for the existing
   prototype UI. It is NOT the protected
   source of truth.
========================================= */

(function (window) {

    "use strict";


    /* =========================================
       CONFIGURATION
    ========================================= */

    const VERSION = "1.2.0";

    const PASS_MARK = 80;

    const RESULTS_KEY =
        "pacificEducationAssessmentResults";


    /* =========================================
       ASSESSMENT DATA
    ========================================= */

    const assessmentData = Object.freeze({

        alphabet: Object.freeze({

            title:
                "Alphabet Assessment",

            day:
                30,

            questions:
                Object.freeze([

                    {
                        question:
                            "Which letter is this? A",

                        options:
                            ["A", "B", "C"],

                        answer:
                            "A"
                    },

                    {
                        question:
                            "Which letter comes after B?",

                        options:
                            ["A", "C", "D"],

                        answer:
                            "C"
                    },

                    {
                        question:
                            "Which word begins with A?",

                        options:
                            ["Apple", "Ball", "Cat"],

                        answer:
                            "Apple"
                    }

                ])

        }),


        phonics: Object.freeze({

            title:
                "Phonics Assessment",

            day:
                60,

            questions:
                Object.freeze([

                    {
                        question:
                            "Which word begins with the /b/ sound?",

                        options:
                            ["Ball", "Cat", "Sun"],

                        answer:
                            "Ball"
                    },

                    {
                        question:
                            "Which word begins with the /m/ sound?",

                        options:
                            ["Map", "Dog", "Fish"],

                        answer:
                            "Map"
                    },

                    {
                        question:
                            "What word do these sounds make? /c/ /a/ /t/",

                        options:
                            ["Cat", "Dog", "Sun"],

                        answer:
                            "Cat"
                    }

                ])

        })

    });


    /* =========================================
       CORE ACCESS
    ========================================= */

    function getCore() {

        return (
            window.PacificEducationCore ||
            null
        );

    }


    /* =========================================
       AUTHORIZATION
    ========================================= */

    function isAuthorized() {

        const core =
            getCore();

        return !!(

            core &&

            core.identity &&

            typeof core.identity.isAuthorized ===
                "function" &&

            core.identity.isAuthorized()

        );

    }


    /* =========================================
       HTML SAFETY
    ========================================= */

    function escapeHTML(value) {

        return String(value)

            .replace(
                /&/g,
                "&amp;"
            )

            .replace(
                /</g,
                "&lt;"
            )

            .replace(
                />/g,
                "&gt;"
            )

            .replace(
                /"/g,
                "&quot;"
            )

            .replace(
                /'/g,
                "&#039;"
            );

    }


    /* =========================================
       CURRENT DAY
    ========================================= */

    function getCurrentDay() {

        const core =
            getCore();


        /*
         * Prefer the protected Core state.
         */

        if (
            core &&
            typeof core.getState ===
                "function"
        ) {

            const state =
                core.getState();

            const coreDay =
                Number(
                    state &&
                    state.lesson &&
                    state.lesson.day
                );


            if (
                Number.isInteger(coreDay) &&
                coreDay >= 1 &&
                coreDay <= 365
            ) {

                return coreDay;

            }

        }


        /*
         * Compatibility fallback for the
         * existing prototype UI.
         */

        let storedDay = 1;

        try {

            storedDay =
                Number.parseInt(

                    window.localStorage.getItem(
                        "currentDayNumber"
                    ) || "1",

                    10

                );

        } catch (error) {

            storedDay = 1;

        }


        if (
            !Number.isInteger(storedDay) ||
            storedDay < 1 ||
            storedDay > 365
        ) {

            storedDay = 1;

        }


        return storedDay;

    }


    /* =========================================
       PROTECTED PROGRESSION
    ========================================= */

    function setProgressionDay(
        day,
        status
    ) {

        if (!isAuthorized()) {

            return false;

        }


        const core =
            getCore();


        let updated =
            false;


        /*
         * Preferred Core API.
         */

        if (
            core &&
            typeof core.setLesson ===
                "function"
        ) {

            const result =
                core.setLesson({

                    day:
                        day,

                    status:
                        status ||
                        "in_progress"

                });


            updated =
                result !== false;

        }


        /*
         * Compatibility support if a future
         * Core exposes lesson.set().
         */

        else if (
            core &&
            core.lesson &&
            typeof core.lesson.set ===
                "function"
        ) {

            const result =
                core.lesson.set({

                    day:
                        day,

                    status:
                        status ||
                        "in_progress"

                });


            updated =
                result !== false;

        }


        if (!updated) {

            return false;

        }


        /*
         * Compatibility cache only.
         *
         * This does not replace Core state.
         */

        try {

            window.localStorage.setItem(
                "currentDayNumber",
                String(day)
            );

            window.localStorage.setItem(
                "currentDay",
                "Day " + day
            );

        } catch (error) {

            console.warn(
                "Assessment progression cache could not be updated."
            );

        }


        return true;

    }


    /* =========================================
       DISPLAY HELPER
    ========================================= */

    function show(html) {

        if (
            typeof window.showLesson ===
                "function"
        ) {

            window.showLesson(html);

        } else {

            console.error(
                "Pacific Education assessment connection error: showLesson() is unavailable."
            );

        }

    }


    /* =========================================
       PROTECTED BLOCK MESSAGE
    ========================================= */

    function block(message) {

        show(

            '<div class="activity">' +

                '<h2>🔒 Assessment Protected</h2>' +

                '<p>' +

                    escapeHTML(message) +

                '</p>' +

            '</div>'

        );


        return false;

    }


    /* =========================================
       CHECK WHETHER ASSESSMENT CAN START
    ========================================= */

    function canStartAssessment(type) {

        const assessment =
            assessmentData[type];


        if (!assessment) {

            return false;

        }


        /*
         * Assessment sessions require an
         * authorized Core identity.
         */

        if (!isAuthorized()) {

            return block(
                "An authorised learner session is required before an assessment can start."
            );

        }


        const currentDay =
            getCurrentDay();


        /*
         * Assessment must occur on its
         * authorised curriculum day.
         */

        if (
            currentDay !==
            assessment.day
        ) {

            return block(

                "This assessment is authorised for Day " +

                assessment.day +

                ". The learner is currently on Day " +

                currentDay +

                ". Continue the daily learning programme first."

            );

        }


        return true;

    }


    /* =========================================
       START ASSESSMENT
    ========================================= */

    function startAssessment(type) {

        const assessment =
            assessmentData[type];


        if (
            !assessment ||
            !canStartAssessment(type)
        ) {

            return false;

        }


        /*
         * Copy question data so the active
         * session cannot mutate the source
         * curriculum definition.
         */

        window.currentAssessment = {

            type:
                type,

            questions:
                assessment.questions.map(

                    function (question) {

                        return {

                            question:
                                question.question,

                            options:
                                question.options.slice(),

                            answer:
                                question.answer

                        };

                    }

                ),

            currentQuestion:
                0,

            score:
                0,

            startedAt:
                new Date().toISOString()

        };


        showAssessmentQuestion();


        return true;

    }


    /* =========================================
       SHOW CURRENT QUESTION
    ========================================= */

    function showAssessmentQuestion() {

        const assessment =
            window.currentAssessment;


        if (!assessment) {

            return;

        }


        const question =
            assessment.questions[
                assessment.currentQuestion
            ];


        if (!question) {

            finishAssessment();

            return;

        }


        let html =

            '<div class="activity">' +

                '<h2>' +

                    '📝 ' +

                    escapeHTML(

                        assessmentData[
                            assessment.type
                        ].title

                    ) +

                '</h2>' +


                '<h3>' +

                    'Question ' +

                    (
                        assessment.currentQuestion +
                        1
                    ) +

                    ' of ' +

                    assessment.questions.length +

                '</h3>' +


                '<p>' +

                    escapeHTML(
                        question.question
                    ) +

                '</p>';


        question.options.forEach(

            function (option) {

                html +=

                    '<button ' +

                        'type="button" ' +

                        'class="assessment-option" ' +

                        'data-answer="' +

                            escapeHTML(option) +

                        '" ' +

                        'style="display:block;margin:10px 0;"' +

                    '>' +

                        escapeHTML(option) +

                    '</button>';

            }

        );


        html +=

            '</div>';


        show(html);


        /*
         * Use event listeners instead of
         * injecting executable answer text
         * into onclick handlers.
         */

        const buttons =
            document.querySelectorAll(
                ".assessment-option"
            );


        buttons.forEach(

            function (button) {

                button.addEventListener(

                    "click",

                    function () {

                        answerAssessment(

                            button.getAttribute(
                                "data-answer"
                            )

                        );

                    },

                    {
                        once:
                            true
                    }

                );

            }

        );

    }


    /* =========================================
       ANSWER QUESTION
    ========================================= */

    function answerAssessment(answer) {

        const assessment =
            window.currentAssessment;


        if (
            !assessment
        ) {

            return block(
                "No active assessment session is available."
            );

        }


        if (!isAuthorized()) {

            window.currentAssessment =
                null;

            return block(
                "The authorised assessment session is no longer available."
            );

        }


        const question =
            assessment.questions[
                assessment.currentQuestion
            ];


        if (!question) {

            return finishAssessment();

        }


        if (
            String(answer) ===
            String(question.answer)
        ) {

            assessment.score +=
                1;

        }


        assessment.currentQuestion +=
            1;


        if (
            assessment.currentQuestion >=
            assessment.questions.length
        ) {

            finishAssessment();

        } else {

            showAssessmentQuestion();

        }

    }


    /* =========================================
       SAVE RESULT THROUGH CORE
    ========================================= */

    function saveResult(result) {

        const core =
            getCore();


        if (!isAuthorized()) {

            return false;

        }


        /*
         * Core is the protected assessment
         * record layer.
         */

        if (
            core &&
            core.assessments &&
            typeof core.assessments.add ===
                "function"
        ) {

            const saved =
                core.assessments.add(
                    result
                );


            if (!saved) {

                return false;

            }

        } else {

            return false;

        }


        /*
         * Compatibility cache for dashboard/UI
         * only. The protected Core record is
         * authoritative.
         */

        let history = [];


        try {

            const parsed =
                JSON.parse(

                    window.localStorage.getItem(
                        RESULTS_KEY
                    ) || "[]"

                );


            if (
                Array.isArray(parsed)
            ) {

                history =
                    parsed;

            }

        } catch (error) {

            history =
                [];

        }


        history.push(
            result
        );


        try {

            window.localStorage.setItem(

                RESULTS_KEY,

                JSON.stringify(history)

            );


            window.localStorage.setItem(

                result.type +
                "Assessment",

                result.percentage +
                "%"

            );

        } catch (error) {

            console.warn(
                "Assessment compatibility cache could not be updated."
            );

        }


        return true;

    }


    /* =========================================
       FINISH ASSESSMENT
    ========================================= */

    function finishAssessment() {

        const assessment =
            window.currentAssessment;


        if (!assessment) {

            return false;

        }


        if (!isAuthorized()) {

            window.currentAssessment =
                null;

            return block(
                "The authorised assessment session is no longer available."
            );

        }


        const total =
            assessment.questions.length;


        const percentage =
            total > 0

                ? Math.round(
                    (
                        assessment.score /
                        total
                    ) *
                    100
                )

                : 0;


        const passed =
            percentage >=
            PASS_MARK;


        const assessmentDay =
            assessmentData[
                assessment.type
            ].day;


        const result = {

            assessmentId:

                "assessment-" +

                assessment.type +

                "-day-" +

                assessmentDay +

                "-" +

                Date.now(),


            type:
                assessment.type,


            day:
                assessmentDay,


            score:
                assessment.score,


            total:
                total,


            percentage:
                percentage,


            passed:
                passed,


            completedAt:
                new Date().toISOString()

        };


        /*
         * Do not unlock progression until
         * Core accepts the assessment result.
         */

        if (
            !saveResult(result)
        ) {

            window.currentAssessment =
                null;

            return block(

                "The assessment result could not be securely recorded. No progression was unlocked."

            );

        }


        /* =====================================
           DAY 30 ALPHABET
        ===================================== */

        if (
            assessment.type ===
                "alphabet" &&

            assessmentDay ===
                30
        ) {

            if (passed) {

                window.localStorage.setItem(
                    "alphabetAssessmentPassed",
                    "true"
                );


                /*
                 * Day 31 is unlocked only after
                 * a verified saved pass.
                 */

                setProgressionDay(
                    31,
                    "in_progress"
                );

            } else {

                window.localStorage.setItem(
                    "alphabetAssessmentPassed",
                    "false"
                );

            }

        }


        /* =====================================
           DAY 60 PHONICS
        ===================================== */

        if (
            assessment.type ===
                "phonics" &&

            assessmentDay ===
                60
        ) {

            window.localStorage.setItem(

                "phonicsAssessmentPassed",

                passed
                    ? "true"
                    : "false"

            );


            if (passed) {

                /*
                 * Day 61 unlock requires the
                 * saved verified result first.
                 */

                setProgressionDay(
                    61,
                    "in_progress"
                );

            } else {

                /*
                 * Failed Day 60 remains on
                 * the Day 60 checkpoint.
                 */

                setProgressionDay(
                    60,
                    "assessment_practice_required"
                );

            }

        }


        /* =====================================
           DASHBOARD REFRESH
        ===================================== */

        if (
            typeof window.refreshAllDashboards ===
                "function"
        ) {

            window.refreshAllDashboards();

        }


        /* =====================================
           RESULT MESSAGE
        ===================================== */

        let message = "";


        if (passed) {

            message +=

                "<p>" +

                    "🎉 You scored " +

                    "<strong>" +

                        percentage +

                        "%" +

                    "</strong>." +

                "</p>" +


                "<p>" +

                    "✅ Assessment passed." +

                "</p>";

        } else {

            message +=

                "<p>" +

                    "You scored " +

                    "<strong>" +

                        percentage +

                        "%" +

                    "</strong>." +

                "</p>" +


                "<p>" +

                    "📚 The pass mark is " +

                    "<strong>" +

                        PASS_MARK +

                        "%" +

                    "</strong>. " +

                    "Additional practice is recommended." +

                "</p>";

        }


        if (
            assessment.type ===
                "alphabet" &&

            assessmentDay ===
                30 &&

            passed
        ) {

            message +=

                "<
