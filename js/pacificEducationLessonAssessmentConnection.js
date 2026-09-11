/*
 * =========================================================
 * PACIFIC EDUCATION
 * LESSON / ASSESSMENT CONNECTION
 * VERSION 1.3.0
 * =========================================================
 *
 * PURPOSE
 * ---------------------------------------------------------
 * • Connect the Core, daily lessons and assessment engine.
 * • Core remains the authority for real learner progression.
 * • Day 30 requires a passed Alphabet Assessment.
 * • Day 60 requires a passed Phonics Assessment.
 * • Dashboard remains the SINGLE lesson-completion authority.
 * • This file MUST NOT wrap or replace window.completeLesson().
 * • localStorage is compatibility/UI fallback only.
 * • Owner Test Mode remains separate from real learner data.
 * • Assessment completion triggers safe UI refresh.
 *
 * ARCHITECTURE
 * ---------------------------------------------------------
 *
 *     PACIFIC EDUCATION CORE
 *             |
 *             +---- DAILY LESSONS
 *             |
 *             +---- ASSESSMENTS
 *             |
 *             +---- THIS CONNECTION
 *             |
 *             +---- DASHBOARDS
 *                       |
 *                       +---- COMPLETE LESSON AUTHORITY
 *
 * IMPORTANT
 * ---------------------------------------------------------
 * The protected completeLesson() function belongs to
 * dashboards.js.
 *
 * This file may CHECK the protected completion authority,
 * but must never create a second wrapper around it.
 * =========================================================
 */

(function (window) {

    "use strict";


    /* =====================================================
       VERSION / CONSTANTS
    ===================================================== */

    const VERSION = "1.3.0";

    const DAY_ALPHABET = 30;
    const DAY_PHONICS = 60;

    const OWNER_TEST_KEY =
        "pacificOwnerTestDay";

    const LEGACY_DAY_KEY =
        "currentDayNumber";

    const ASSESSMENT_TYPES = {

        ALPHABET:
            "alphabet",

        PHONICS:
            "phonics"
    };


    /* =====================================================
       INTERNAL STATE
    ===================================================== */

    let completionConnected = false;

    let monitorStarted = false;

    let resultMonitor = null;

    let lastAssessmentSignature = "";


    /* =====================================================
       CORE
    ===================================================== */

    function getCore() {

        return (
            window.PacificEducationCore ||
            null
        );
    }


    /* =====================================================
       AUTHORIZATION
    ===================================================== */

    function isAuthorized() {

        const core =
            getCore();

        return !!(
            core &&
            core.identity &&
            typeof
                core.identity.isAuthorized ===
                "function" &&
            core.identity.isAuthorized()
        );
    }


    /* =====================================================
       CONNECTION STATUS
    ===================================================== */

    function getConnections() {

        return {

            core:
                !!getCore(),

            assessments:
                !!window.PacificEducationAssessments,

            dashboards:
                !!window.PacificEducationDashboards,

            dailyLessons:
                !!window.PacificEducationDailyLessons
        };
    }


    function enginesReady() {

        const connections =
            getConnections();

        return (

            connections.core &&

            connections.assessments &&

            connections.dailyLessons
        );
    }


    /* =====================================================
       SAFE NUMBER
    ===================================================== */

    function safeNumber(
        value,
        fallback
    ) {

        const number =
            Number(value);

        return Number.isFinite(number)
            ? number
            : fallback;
    }


    /* =====================================================
       CURRENT DAY
       
       CORE FIRST.
       localStorage FALLBACK ONLY.
    ===================================================== */

    function getCurrentDay() {

        const core =
            getCore();


        if (
            core &&
            typeof core.getState ===
                "function"
        ) {

            try {

                const state =
                    core.getState();

                if (
                    state &&
                    state.lesson &&
                    Number.isFinite(
                        Number(
                            state.lesson.day
                        )
                    )
                ) {

                    return Math.max(
                        1,
                        Math.min(
                            365,
                            Math.floor(
                                Number(
                                    state.lesson.day
                                )
                            )
                        )
                    );
                }

            } catch (error) {

                console.warn(
                    "Pacific Education: unable to read Core lesson day.",
                    error
                );
            }
        }


        /* =============================================
           COMPATIBILITY FALLBACK
        ============================================= */

        try {

            const stored =
                Number(
                    window.localStorage.getItem(
                        LEGACY_DAY_KEY
                    )
                );

            if (
                Number.isFinite(stored)
            ) {

                return Math.max(
                    1,
                    Math.min(
                        365,
                        Math.floor(stored)
                    )
                );
            }

        } catch (error) {

            console.warn(
                "Pacific Education: unable to read legacy day.",
                error
            );
        }


        return 1;
    }


    /* =====================================================
       OWNER TEST MODE
    ===================================================== */

    function isOwnerTestMode() {

        try {

            const value =
                window.localStorage.getItem(
                    OWNER_TEST_KEY
                );

            return (
                value !== null &&
                value !== "" &&
                Number.isFinite(
                    Number(value)
                )
            );

        } catch (error) {

            return false;
        }
    }


    /* =====================================================
       ASSESSMENT TYPE NORMALIZATION
    ===================================================== */

    function normalizeAssessmentType(
        type
    ) {

        if (!type) {

            return "";
        }

        return String(type)
            .trim()
            .toLowerCase()
            .replace(
                /\s+/g,
                "_"
            );
    }


    /* =====================================================
       ASSESSMENT TYPE MATCHING
    ===================================================== */

    function assessmentTypeMatches(
        result,
        requestedType
    ) {

        if (
            !result ||
            typeof result !==
                "object"
        ) {

            return false;
        }

        const requested =
            normalizeAssessmentType(
                requestedType
            );

        const candidates = [

            result.type,

            result.assessmentType,

            result.assessment_type,

            result.name

        ]
            .filter(Boolean)
            .map(
                normalizeAssessmentType
            );


        if (
            requested ===
            ASSESSMENT_TYPES.ALPHABET
        ) {

            return candidates.some(
                function (value) {

                    return (

                        value ===
                            "alphabet" ||

                        value ===
                            "alphabet_assessment" ||

                        value ===
                            "day_30_alphabet" ||

                        value ===
                            "day30_alphabet"
                    );
                }
            );
        }


        if (
            requested ===
            ASSESSMENT_TYPES.PHONICS
        ) {

            return candidates.some(
                function (value) {

                    return (

                        value ===
                            "phonics" ||

                        value ===
                            "phonics_assessment" ||

                        value ===
                            "day_60_phonics" ||

                        value ===
                            "day60_phonics"
                    );
                }
            );
        }


        return (
            candidates.indexOf(
                requested
            ) !== -1
        );
    }


    /* =====================================================
       ASSESSMENT DAY MATCHING
    ===================================================== */

    function assessmentDayMatches(
        result,
        day
    ) {

        if (
            !result ||
            typeof result !==
                "object"
        ) {

            return false;
        }

        const requestedDay =
            Number(day);

        const candidates = [

            result.day,

            result.dayNumber,

            result.day_number,

            result.lessonDay,

            result.lesson_day

        ];


        return candidates.some(
            function (value) {

                return (

                    Number.isFinite(
                        Number(value)
                    ) &&

                    Number(value) ===
                        requestedDay
                );
            }
        );
    }


    /* =====================================================
       ASSESSMENT TIMESTAMP
    ===================================================== */

    function assessmentTimestamp(
        result
    ) {

        if (
            !result ||
            typeof result !==
                "object"
        ) {

            return 0;
        }

        const candidates = [

            result.completedAt,

            result.completed_at,

            result.timestamp,

            result.createdAt,

            result.created_at,

            result.date

        ];


        for (
            let index = 0;
            index < candidates.length;
            index += 1
        ) {

            const value =
                candidates[index];

            if (!value) {

                continue;
            }


            const parsed =
                Date.parse(value);

            if (
                Number.isFinite(parsed)
            ) {

                return parsed;
            }


            const number =
                Number(value);

            if (
                Number.isFinite(number)
            ) {

                return number;
            }
        }


        return 0;
    }


    /* =====================================================
       ASSESSMENT PASSED
    ===================================================== */

    function assessmentPassed(
        result
    ) {

        if (
            !result ||
            typeof result !==
                "object"
        ) {

            return false;
        }

        return (

            result.passed === true ||

            result.pass === true ||

            result.status ===
                "passed" ||

            result.status ===
                "PASS"
        );
    }


    /* =====================================================
       GET ALL CORE ASSESSMENTS
    ===================================================== */

    function getAllCoreAssessments() {

        const core =
            getCore();


        if (
            !core ||
            !isAuthorized()
        ) {

            return [];
        }


        try {

            if (
                core.assessments &&
                typeof
                    core.assessments.getAll ===
                    "function"
            ) {

                const records =
                    core.assessments.getAll();

                return Array.isArray(
                    records
                )
                    ? records
                    : [];
            }


            if (
                core.assessments &&
                typeof
                    core.assessments.latest ===
                    "function"
            ) {

                const latest =
                    core.assessments.latest();

                if (!latest) {

                    return [];
                }

                return Array.isArray(
                    latest
                )
                    ? latest
                    : [latest];
            }

        } catch (error) {

            console.warn(
                "Pacific Education: unable to read protected assessments.",
                error
            );
        }


        return [];
    }


    /* =====================================================
       GET LATEST PROTECTED ASSESSMENT
    ===================================================== */

    function getLatestProtectedAssessment(
        type,
        day
    ) {

        const core =
            getCore();


        if (
            !core ||
            !isAuthorized()
        ) {

            return null;
        }


        try {

            if (
                core.assessments &&
                typeof
                    core.assessments.latest ===
                    "function"
            ) {

                const latest =
                    core.assessments.latest();

                if (
                    latest &&
                    assessmentTypeMatches(
                        latest,
                        type
                    ) &&
                    assessmentDayMatches(
                        latest,
                        day
                    )
                ) {

                    return latest;
                }
            }

        } catch (error) {

            console.warn(
                "Pacific Education: Core latest assessment lookup failed.",
                error
            );
        }


        const records =
            getAllCoreAssessments();


        const matches =
            records.filter(
                function (record) {

                    return (

                        assessmentTypeMatches(
                            record,
                            type
                        ) &&

                        assessmentDayMatches(
                            record,
                            day
                        )
                    );
                }
            );


        if (!matches.length) {

            return null;
        }


        matches.sort(
            function (a, b) {

                return (

                    assessmentTimestamp(b) -

                    assessmentTimestamp(a)
                );
            }
        );


        return matches[0];
    }


    /* =====================================================
       PASSED PROTECTED ASSESSMENT
    ===================================================== */

    function hasPassedProtectedAssessment(
        type,
        day
    ) {

        if (
            !isAuthorized()
        ) {

            return false;
        }


        const result =
            getLatestProtectedAssessment(
                type,
                day
            );


        return assessmentPassed(
            result
        );
    }


    /* =====================================================
       CHECKPOINT BLOCK
       
       This CHECKS the checkpoint.
       It does NOT complete the lesson.
    ===================================================== */

    function checkpointBlocksCompletion(
        day
    ) {

        const currentDay =
            Number(day);


        if (
            !isAuthorized()
        ) {

            return true;
        }


        if (
            currentDay ===
            DAY_ALPHABET
        ) {

            return !hasPassedProtectedAssessment(

                ASSESSMENT_TYPES.ALPHABET,

                DAY_ALPHABET
            );
        }


        if (
            currentDay ===
            DAY_PHONICS
        ) {

            return !hasPassedProtectedAssessment(

                ASSESSMENT_TYPES.PHONICS,

                DAY_PHONICS
            );
        }


        return false;
    }


    /* =====================================================
       CHECKPOINT MESSAGE
    ===================================================== */

    function showCheckpointMessage(
        day
    ) {

        const currentDay =
            Number(day);


        let message =
            "This learning checkpoint must be completed before the lesson can be recorded.";


        if (
            currentDay ===
            DAY_ALPHABET
        ) {

            message =
                "Day 30 requires a passed Alphabet Assessment before this lesson can be completed.";
        }


        if (
            currentDay ===
            DAY_PHONICS
        ) {

            message =
                "Day 60 requires a passed Phonics Assessment before this lesson can be completed.";
        }


        let existing =
            document.getElementById(
                "pacificAssessmentCheckpointMessage"
            );


        if (!existing) {

            existing =
                document.createElement(
                    "div"
                );

            existing.id =
                "pacificAssessmentCheckpointMessage";


            existing.setAttribute(
                "role",
                "alert"
            );


            existing.style.padding =
                "14px";

            existing.style.margin =
                "12px 0";

            existing.style.border =
                "2px solid #b00020";

            existing.style.borderRadius =
                "8px";

            existing.style.background =
                "#fff4f4";

            existing.style.color =
                "#7a0017";

            existing.style.fontWeight =
                "600";


            const container =

                document.getElementById(
                    "dailyLessonContainer"
                ) ||

                document.getElementById(
                    "lessonContainer"
                ) ||

                document.body;


            container.prepend(
                existing
            );
        }


        existing.textContent =
            "";


        const text =
            document.createElement(
                "div"
            );

        text.textContent =
            message;


        existing.appendChild(
            text
        );


        const assessmentButton =
            document.createElement(
                "button"
            );


        assessmentButton.type =
            "button";


        assessmentButton.style.marginTop =
            "10px";


        assessmentButton.textContent =

            currentDay ===
            DAY_PHONICS

                ? "Open Phonics Assessment"

                : "Open Alphabet Assessment";


        assessmentButton.addEventListener(
            "click",
            function () {

                if (
                    window.PacificEducationAssessments &&

                    typeof
                        window.PacificEducationAssessments.startAlphabet ===
                        "function" &&

                    currentDay ===
                        DAY_ALPHABET
                ) {

                    window.PacificEducationAssessments.startAlphabet();

                    return;
                }


                if (
                    window.PacificEducationAssessments &&

                    typeof
                        window.PacificEducationAssessments.startPhonics ===
                        "function" &&

                    currentDay ===
                        DAY_PHONICS
                ) {

                    window.PacificEducationAssessments.startPhonics();

                    return;
                }


                if (
                    typeof
                        window.startAlphabetAssessment ===
                        "function" &&

                    currentDay ===
                        DAY_ALPHABET
                ) {

                    window.startAlphabetAssessment();

                    return;
                }


                if (
                    typeof
                        window.startPhonicsAssessment ===
                        "function" &&

                    currentDay ===
                        DAY_PHONICS
                ) {

                    window.startPhonicsAssessment();
                }
            }
        );


        existing.appendChild(
            assessmentButton
        );


        return false;
    }


    /* =====================================================
       ASSESSMENT VISIBILITY
    ===================================================== */

    function updateAssessmentVisibility() {

        const day =
            getCurrentDay();


        const alphabetButton =
            document.getElementById(
                "startAlphabetAssessment"
            );


        const phonicsButton =
            document.getElementById(
                "startPhonicsAssessment"
            );


        if (
            alphabetButton
        ) {

            alphabetButton.style.display =

                day === DAY_ALPHABET

                    ? ""

                    : "none";
        }


        if (
            phonicsButton
        ) {

            phonicsButton.style.display =

                day === DAY_PHONICS

                    ? ""

                    : "none";
        }


        return {

            day,

            alphabetVisible:
                day === DAY_ALPHABET,

            phonicsVisible:
                day === DAY_PHONICS
        };
    }


    /* =====================================================
       ALPHABET PANEL CHECK
       
       Kept for compatibility with existing callers.
       Does not fabricate UI.
    ===================================================== */

    function ensureAlphabetAssessmentPanel() {

        if (
            getCurrentDay() !==
            DAY_ALPHABET
        ) {

            return false;
        }


        return !!document.getElementById(
            "alphabetAssessmentPanel"
        );
    }


    /* =====================================================
       SINGLE COMPLETION AUTHORITY CHECK
       
       IMPORTANT:
       We DO NOT WRAP completeLesson().
       
       dashboards.js owns the protected completion
       implementation.
    ===================================================== */

    function connectLessonCompletion() {

        const completeLesson =
            window.completeLesson;


        if (
            typeof completeLesson !==
            "function"
        ) {

            completionConnected =
                false;

            return false;
        }


        /*
         * Confirm that the dashboard/core lesson
         * completion authority is already installed.
         */
        completionConnected = !!(
            completeLesson.__pacificEducationProtectedWrapper
        );


        /*
         * If dashboards.js has not marked the function,
         * we still do NOT create another wrapper.
         *
         * This prevents duplicate protection layers.
         */
        if (!completionConnected) {

            console.warn(
                "Pacific Education: protected completeLesson authority not yet marked by dashboards."
            );
        }


        return (
            typeof completeLesson ===
            "function"
        );
    }


    /* =====================================================
       REFRESH AFTER ASSESSMENT
    ===================================================== */

    function refreshAfterAssessment() {

        updateAssessmentVisibility();


        try {

            if (
                window.PacificEducationDailyLessons &&

                typeof
                    window.PacificEducationDailyLessons.start ===
                    "function"
            ) {

                /*
                 * Do not force scrolling here.
                 * Only restore the lesson UI if explicitly
                 * needed by the daily lesson engine.
                 */
            }

        } catch (error) {

            console.warn(
                "Pacific Education: daily lesson refresh check failed.",
                error
            );
        }


        try {

            if (
                window.PacificEducationDashboards &&

                typeof
                    window.PacificEducationDashboards.refresh ===
                    "function"
            ) {

                window.PacificEducationDashboards.refresh();
            }

        } catch (error) {

            console.warn(
                "Pacific Education: dashboard refresh failed.",
                error
            );
        }


        try {

            if (
                window.displayDailyLesson &&

                typeof
                    window.displayDailyLesson ===
                    "function"
            ) {

                window.displayDailyLesson();
            }

        } catch (error) {

            console.warn(
                "Pacific Education: daily lesson display refresh failed.",
                error
            );
        }


        return true;
    }


    /* =====================================================
       ASSESSMENT SIGNATURE
    ===================================================== */

    function getAssessmentSignature() {

        if (
            !isAuthorized()
        ) {

            return "";
        }


        const records =
            getAllCoreAssessments();


        return records
            .map(
                function (record) {

                    return [

                        record &&
                            record.id,

                        record &&
                            record.type,

                        record &&
                            record.day,

                        record &&
                            record.passed,

                        record &&
                            record.score,

                        assessmentTimestamp(
                            record
                        )

                    ].join("|");
                }
            )
            .join(";");
    }


    /* =====================================================
       MONITOR ASSESSMENT RESULTS
    ===================================================== */

    function monitorAssessmentResults() {

        if (
            !isAuthorized()
        ) {

            return false;
        }


        const signature =
            getAssessmentSignature();


        if (
            lastAssessmentSignature &&
            signature !==
                lastAssessmentSignature
        ) {

            refreshAfterAssessment();
        }


        lastAssessmentSignature =
            signature;


        return true;
    }


    /* =====================================================
       START RESULT MONITOR
    ===================================================== */

    function startResultMonitor() {

        if (
            monitorStarted
        ) {

            return true;
        }


        if (
            typeof window.setInterval !==
            "function"
        ) {

            return false;
        }


        monitorStarted =
            true;


        lastAssessmentSignature =
            getAssessmentSignature();


        resultMonitor =
            window.setInterval(
                function () {

                    monitorAssessmentResults();

                },
                1500
            );


        return true;
    }


    /* =====================================================
       STOP RESULT MONITOR
    ===================================================== */

    function stopResultMonitor() {

        if (
            resultMonitor !==
            null &&

            typeof window.clearInterval ===
                "function"
        ) {

            window.clearInterval(
                resultMonitor
            );
        }


        resultMonitor =
            null;

        monitorStarted =
            false;

        lastAssessmentSignature =
            "";


        return true;
    }


    /* =====================================================
       INITIALIZE
    ===================================================== */

    function initialize() {

        /*
         * Confirm the existing single completion authority.
         */
        connectLessonCompletion();


        /*
         * Set Day 30 / Day 60 assessment visibility.
         */
        updateAssessmentVisibility();


        /*
         * Start assessment monitoring only
         * after authorization.
         */
        if (
            isAuthorized()
        ) {

            startResultMonitor();
        }


        return true;
    }


    /* =====================================================
       PUBLIC API
    ===================================================== */

    const api = {

        version:
            VERSION,

        getCore:
            getCore,

        isAuthorized:
            isAuthorized,

        getConnections:
            getConnections,

        enginesReady:
            enginesReady,

        getCurrentDay:
            getCurrentDay,

        isOwnerTestMode:
            isOwnerTestMode,

        safeNumber:
            safeNumber,

        getLatestProtectedAssessment:
            getLatestProtectedAssessment,

        getAllCoreAssessments:
            getAllCoreAssessments,

        hasPassedProtectedAssessment:
            hasPassedProtectedAssessment,

        checkpointBlocksCompletion:
            checkpointBlocksCompletion,

        showCheckpointMessage:
            showCheckpointMessage,

        updateAssessmentVisibility:
            updateAssessmentVisibility,

        ensureAlphabetAssessmentPanel:
            ensureAlphabetAssessmentPanel,

        refreshAfterAssessment:
            refreshAfterAssessment,

        connectLessonCompletion:
            connectLessonCompletion,

        monitorAssessmentResults:
            monitorAssessmentResults,

        startResultMonitor:
            startResultMonitor,

        stopResultMonitor:
            stopResultMonitor,

        get completionConnected() {

            return completionConnected;
        },

        get monitorStarted() {

            return monitorStarted;
        }
    };


    /* =====================================================
       GLOBAL PUBLIC API
    ===================================================== */

    window.PacificEducationLessonAssessmentConnection =
        Object.freeze(api);


    /* =====================================================
       PAGE INITIALIZATION
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


})(window);
