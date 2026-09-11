/* =========================================
   PACIFIC EDUCATION — ASSESSMENTS
   VERSION 1.2.1
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

    const VERSION = "1.2.1";

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

                    Object.freeze({
                        question:
                            "Which letter is this? A",

                        options:
                            Object.freeze([
                                "A",
                                "B",
                                "C"
                            ]),

                        answer:
                            "A"
                    }),

                    Object.freeze({
                        question:
                            "Which letter comes after B?",

                        options:
                            Object.freeze([
                                "A",
                                "C",
                                "D"
                            ]),

                        answer:
                            "C"
                    }),

                    Object.freeze({
                        question:
                            "Which word begins with A?",

                        options:
                            Object.freeze([
                                "Apple",
                                "Ball",
                                "Cat"
                            ]),

                        answer:
                            "Apple"
                    })

                ])

        }),


        phonics: Object.freeze({

            title:
                "Phonics Assessment",

            day:
                60,

            questions:
                Object.freeze([

                    Object.freeze({
                        question:
                            "Which word begins with the /b/ sound?",

                        options:
                            Object.freeze([
                                "Ball",
                                "Cat",
                                "Sun"
                            ]),

                        answer:
                            "Ball"
                    }),

                    Object.freeze({
                        question:
                            "Which word begins with the /m/ sound?",

                        options:
                            Object.freeze([
                                "Map",
                                "Dog",
                                "Fish"
                            ]),

                        answer:
                            "Map"
                    }),

                    Object.freeze({
                        question:
                            "What word do these sounds make? /c/ /a/ /t/",

                        options:
                            Object.freeze([
                                "Cat",
                                "Dog",
                                "Sun"
                            ]),

                        answer:
                            "Cat"
                    })

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
         * Protected Core state is preferred.
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
         * Compatibility fallback only.
         */

        let storedDay =
            1;

        try {

            storedDay =
                Number.parseInt(

                    window.localStorage.getItem(
                        "currentDayNumber"
                    ) || "1",

                    10

                );

        } catch (error) {

            storedDay =
                1;

        }


        if (

            !Number.isInteger(storedDay) ||

            storedDay < 1 ||

            storedDay > 365

        ) {

            storedDay =
                1;

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


        const safeDay =
            Number(day);


        if (

            !Number.isInteger(safeDay) ||

            safeDay < 1 ||

            safeDay > 365

        ) {

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
                        safeDay,

                    status:
                        status ||
                        "in_progress"

                });


            updated =
                result !== false;

        }


        /*
         * Compatibility support for a future
         * Core lesson.set() implementation.
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
                        safeDay,

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
         */

        try {

            window.localStorage.setItem(

                "currentDayNumber",

                String(safeDay)

            );

            window.localStorage.setItem(

                "currentDay",

                "Day " +
                safeDay

            );

        } catch (error) {

            console.warn(
                "Assessment progression compatibility cache could not be updated."
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
       CHECK ASSESSMENT ACCESS
    ========================================= */

    function canStartAssessment(type) {

        const assessment =
            assessmentData[type];


        if (!assessment) {

            return false;

        }


        if (!isAuthorized()) {

            return block(

                "An authorised learner session is required before an assessment can start."

            );

        }


        const currentDay =
            getCurrentDay();


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

                        'style="display:block;margin:10px 0;padding:10px;font-size:1rem;"' +

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
         * executable inline answer handlers.
         */

        if (
            typeof document ===
                "undefined"
        ) {

            return;

        }


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


        if (!assessment) {

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


        if (

            !core ||

            !core.assessments ||

            typeof core.assessments.add !==
                "function"

        ) {

            return false;

        }


        const saved =
            core.assessments.add(result);


        if (!saved) {

            return false;

        }


        /*
         * Compatibility cache only.
         */

        let history =
            [];


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


        history.push(result);


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
         * Core must accept the result before
         * any progression is unlocked.
         */

        if (!saveResult(result)) {

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

            try {

                window.localStorage.setItem(

                    "alphabetAssessmentPassed",

                    passed
                        ? "true"
                        : "false"

                );

            } catch (error) {

                console.warn(
                    "Alphabet assessment status cache could not be updated."
                );

            }


            if (passed) {

                setProgressionDay(

                    31,

                    "in_progress"

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

            try {

                window.localStorage.setItem(

                    "phonicsAssessmentPassed",

                    passed
                        ? "true"
                        : "false"

                );

            } catch (error) {

                console.warn(
                    "Phonics assessment status cache could not be updated."
                );

            }


            if (passed) {

                setProgressionDay(

                    61,

                    "in_progress"

                );

            } else {

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

        let message =
            "";


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

                "<p>" +

                    "🔓 Day 31 has been unlocked." +

                "</p>";

        }


        if (

            assessment.type ===
                "phonics" &&

            assessmentDay ===
                60 &&

            passed

        ) {

            message +=

                "<p>" +

                    "🔓 Day 61 has been unlocked." +

                "</p>";

        }


        if (

            assessment.type ===
                "phonics" &&

            assessmentDay ===
                60 &&

            !passed

        ) {

            message +=

                "<p>" +

                    "📖 Please continue practising before attempting the Day 60 checkpoint again." +

                "</p>";

        }


        show(

            '<div class="activity">' +

                '<h2>Assessment Result</h2>' +

                message +

            '</div>'

        );


        window.currentAssessment =
            null;


        return result;

    }


    /* =========================================
       PUBLIC FUNCTIONS
    ========================================= */

    window.startAssessment =
        startAssessment;


    window.finishAssessment =
        finishAssessment;


    window.startAlphabetAssessment =
        function () {

            return startAssessment(
                "alphabet"
            );

        };


    window.startPhonicsAssessment =
        function () {

            return startAssessment(
                "phonics"
            );

        };


    /* =========================================
       PUBLIC API
    ========================================= */

    window.PacificEducationAssessments = {

        version:
            VERSION,

        passMark:
            PASS_MARK,

        getAssessment:
            function (type) {

                return assessmentData[type] ||
                    null;

            },

        getCurrentDay:
            getCurrentDay,

        canStart:
            canStartAssessment,

        start:
            startAssessment,

        startAlphabet:
            function () {

                return startAssessment(
                    "alphabet"
                );

            },

        startPhonics:
            function () {

                return startAssessment(
                    "phonics"
                );

            },

        finish:
            finishAssessment

    };


})(window);
