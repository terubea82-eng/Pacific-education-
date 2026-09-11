/* =========================================================
   PACIFIC EDUCATION
   TEACHER & PARENT DASHBOARDS
   PROTECTED PROGRESS CONNECTION
   VERSION 1.3.0

   RULES
   ---------------------------------------------------------
   • Education Core is the preferred progress authority.
   • Unauthorized progress changes are blocked.
   • localStorage is compatibility storage only.
   • Owner Test Day never becomes real learner progress.
   • Day 30 and Day 60 assessment progression remains
     controlled by assessments.js/Core.
   ========================================================= */

(function (window) {
    "use strict";

    const VERSION = "1.3.0";
    const MAX_DAY = 365;

    const STORAGE = Object.freeze({
        currentDayNumber: "currentDayNumber",
        currentDay: "currentDay",
        lessonsCompleted: "lessonsCompleted",
        studentName: "studentName",
        alphabetAssessment: "alphabetAssessment",
        phonicsAssessment: "phonicsAssessment",
        learningStatus: "learningStatus",
        ownerTestDay: "pacificOwnerTestDay"
    });

    function getCore() {
        if (
            window.PacificEducationCore &&
            typeof window.PacificEducationCore === "object"
        ) {
            return window.PacificEducationCore;
        }

        return null;
    }

    function isAuthorized() {
        const core = getCore();

        if (
            core &&
            typeof core.isAuthorized === "function"
        ) {
            return core.isAuthorized() === true;
        }

        /*
         * Without the protected Core, dashboard actions that
         * change learner progress are not authorized.
         */
        return false;
    }

    function readStorage(key, fallback) {
        try {
            if (
                typeof window.localStorage === "undefined"
            ) {
                return fallback;
            }

            const value =
                window.localStorage.getItem(key);

            return value === null
                ? fallback
                : value;
        } catch (error) {
            console.warn(
                "Pacific Education Dashboard storage read blocked.",
                error
            );

            return fallback;
        }
    }

    function writeStorage(key, value) {
        try {
            if (
                typeof window.localStorage === "undefined"
            ) {
                return false;
            }

            window.localStorage.setItem(
                key,
                String(value)
            );

            return true;
        } catch (error) {
            console.warn(
                "Pacific Education Dashboard storage write blocked.",
                error
            );

            return false;
        }
    }

    function removeStorage(key) {
        try {
            if (
                typeof window.localStorage === "undefined"
            ) {
                return false;
            }

            window.localStorage.removeItem(key);
            return true;
        } catch (error) {
            return false;
        }
    }

    function toValidDay(value, fallback) {
        const number = parseInt(value, 10);

        if (
            isNaN(number) ||
            number < 1
        ) {
            return fallback;
        }

        return Math.min(number, MAX_DAY);
    }

    function toValidLessons(value) {
        const number = parseInt(value, 10);

        if (
            isNaN(number) ||
            number < 0
        ) {
            return 0;
        }

        return number;
    }

    function getCoreState() {
        const core = getCore();

        if (
            core &&
            typeof core.getState === "function"
        ) {
            try {
                const state = core.getState();

                if (
                    state &&
                    typeof state === "object"
                ) {
                    return state;
                }
            } catch (error) {
                console.warn(
                    "Pacific Education Core state could not be read.",
                    error
                );
            }
        }

        return null;
    }

    function getPacificStudentData() {
        const coreState = getCoreState();

        const coreDay =
            coreState &&
            coreState.lesson
                ? toValidDay(
                    coreState.lesson.day,
                    null
                )
                : null;

        const currentDayNumber =
            coreDay ||
            toValidDay(
                readStorage(
                    STORAGE.currentDayNumber,
                    "1"
                ),
                1
            );

        const coreStudent =
            coreState &&
            coreState.student
                ? coreState.student
                : {};

        const coreIdentity =
            coreState &&
            coreState.identity
                ? coreState.identity
                : {};

        const name =
            coreStudent.name ||
            coreIdentity.name ||
            readStorage(
                STORAGE.studentName,
                "Student"
            );

        const lessonsCompleted =
            toValidLessons(
                readStorage(
                    STORAGE.lessonsCompleted,
                    "0"
                )
            );

        return {
            name: name || "Student",

            currentDay:
                "Day " +
                currentDayNumber,

            currentDayNumber:
                currentDayNumber,

            lessonsCompleted:
                lessonsCompleted,

            alphabetAssessment:
                readStorage(
                    STORAGE.alphabetAssessment,
                    "Not completed"
                ),

            phonicsAssessment:
                readStorage(
                    STORAGE.phonicsAssessment,
                    "Not completed"
                ),

            learningStatus:
                readStorage(
                    STORAGE.learningStatus,
                    "Monitoring"
                )
        };
    }

    function setText(id, value) {
        const element =
            document.getElementById(id);

        if (element) {
            element.textContent =
                value === undefined ||
                value === null
                    ? ""
                    : String(value);
        }
    }

    function refreshTeacherDashboard() {
        const student =
            getPacificStudentData();

        setText(
            "teacherStudentName",
            student.name
        );

        setText(
            "teacherCurrentDay",
            student.currentDay
        );

        setText(
            "teacherLessonsCompleted",
            student.lessonsCompleted
        );

        setText(
            "teacherAlphabetAssessment",
            student.alphabetAssessment
        );

        setText(
            "teacherPhonicsAssessment",
            student.phonicsAssessment
        );

        setText(
            "teacherLearningStatus",
            student.learningStatus
        );
    }

    function refreshParentDashboard() {
        const student =
            getPacificStudentData();

        setText(
            "parentStudentName",
            student.name
        );

        setText(
            "parentCurrentDay",
            student.currentDay
        );

        setText(
            "parentLessonsCompleted",
            student.lessonsCompleted
        );

        setText(
            "parentAlphabetAssessment",
            student.alphabetAssessment
        );

        setText(
            "parentPhonicsAssessment",
            student.phonicsAssessment
        );

        setText(
            "parentLearningStatus",
            student.learningStatus ===
            "Monitoring"
                ? "Keep practising"
                : student.learningStatus
        );
    }

    function refreshAllDashboards() {
        refreshTeacherDashboard();
        refreshParentDashboard();
    }

    function getOwnerTestDay() {
        const value =
            readStorage(
                STORAGE.ownerTestDay,
                ""
            );

        const day =
            parseInt(value, 10);

        if (
            isNaN(day) ||
            day < 1 ||
            day > MAX_DAY
        ) {
            return null;
        }

        return day;
    }

    function exitOwnerTestMode() {
        removeStorage(
            STORAGE.ownerTestDay
        );
    }

    function displayLessonIfAvailable() {
        if (
            typeof window.displayDailyLesson ===
            "function"
        ) {
            window.displayDailyLesson();
        }
    }

    /*
     * ---------------------------------------------------------
     * COMPLETE REAL LESSON
     * ---------------------------------------------------------
     */

    function completeLesson() {
        if (!isAuthorized()) {
            console.warn(
                "Pacific Education: lesson completion blocked because the user is not authorized."
            );

            return false;
        }

        /*
         * Owner test mode must never create a real lesson
         * completion or real learner progression.
         */
        if (getOwnerTestDay() !== null) {
            exitOwnerTestMode();
            refreshAllDashboards();
            displayLessonIfAvailable();

            return false;
        }

        const core =
            getCore();

        const current =
            getPacificStudentData();

        const currentDay =
            current.currentDayNumber;

        /*
         * Day 365 is the final programme day.
         */
        if (currentDay >= MAX_DAY) {
            refreshAllDashboards();
            displayLessonIfAvailable();

            return true;
        }

        const nextDay =
            currentDay + 1;

        /*
         * Update the protected Core first.
         * Core authorization is required.
         */
        if (
            !core ||
            typeof core.setLesson !==
            "function"
        ) {
            console.warn(
                "Pacific Education: protected Core lesson API is unavailable. Progress was not changed."
            );

            return false;
        }

        const existingLesson =
            currentCoreLesson();

        const lessonUpdate = {
            lessonId:
                existingLesson &&
                existingLesson.lessonId
                    ? existingLesson.lessonId
                    : null,

            day:
                nextDay,

            subject:
                existingLesson &&
                existingLesson.subject
                    ? existingLesson.subject
                    : "",

            title:
                existingLesson &&
                existingLesson.title
                    ? existingLesson.title
                    : "",

            concept:
                existingLesson &&
                existingLesson.concept
                    ? existingLesson.concept
                    : "",

            status:
                "completed"
        };

        let savedLesson;

        try {
            savedLesson =
                core.setLesson(
                    lessonUpdate
                );
        } catch (error) {
            console.error(
                "Pacific Education: protected lesson update failed.",
                error
            );

            return false;
        }

        if (!savedLesson) {
            console.warn(
                "Pacific Education: Core rejected lesson progression."
            );

            return false;
        }

        /*
         * Compatibility counters are maintained only after
         * Core accepts the progression.
         */
        const lessonsCompleted =
            current.lessonsCompleted + 1;

        writeStorage(
            STORAGE.currentDayNumber,
            nextDay
        );

        writeStorage(
            STORAGE.currentDay,
            "Day " + nextDay
        );

        writeStorage(
            STORAGE.lessonsCompleted,
            lessonsCompleted
        );

        refreshAllDashboards();
        displayLessonIfAvailable();

        return true;
    }

    function currentCoreLesson() {
        const state =
            getCoreState();

        if (
            state &&
            state.lesson &&
            typeof state.lesson ===
            "object"
        ) {
            return state.lesson;
        }

        return null;
    }

    /*
     * ---------------------------------------------------------
     * OWNER TEST DAY
     * ---------------------------------------------------------
     *
     * Test display is temporary and does not modify the
     * learner's permanent Core progress.
     */

    function setOwnerTestDay(dayNumber) {
        if (!isAuthorized()) {
            console.warn(
                "Pacific Education: Owner Test Mode blocked because authorization is not active."
            );

            return false;
        }

        const testDay =
            parseInt(
                dayNumber,
                10
            );

        if (
            isNaN(testDay) ||
            testDay < 1 ||
            testDay > MAX_DAY
        ) {
            console.warn(
                "Invalid Owner Test Day:",
                dayNumber
            );

            return false;
        }

        /*
         * Save the requested test day separately.
         */
        writeStorage(
            STORAGE.ownerTestDay,
            testDay
        );

        /*
         * Save the real compatibility values so the display
         * can be restored after testing.
         */
        const realDay =
            readStorage(
                STORAGE.currentDayNumber,
                "1"
            );

        const realCurrentDay =
            readStorage(
                STORAGE.currentDay,
                "Day 1"
            );

        /*
         * Temporary display only.
         *
         * The protected Core is deliberately NOT changed.
         */
        writeStorage(
            STORAGE.currentDayNumber,
            testDay
        );

        writeStorage(
            STORAGE.currentDay,
            "Day " + testDay
        );

        displayLessonIfAvailable();

        /*
         * Immediately restore the real compatibility
         * progress after the lesson engine has rendered.
         */
        writeStorage(
            STORAGE.currentDayNumber,
            realDay
        );

        writeStorage(
            STORAGE.currentDay,
            realCurrentDay
        );

        refreshAllDashboards();

        console.info(
            "Pacific Education Owner Test Mode:",
            "Day " + testDay,
            "Real learner progress preserved."
        );

        return true;
    }

    /*
     * ---------------------------------------------------------
     * PUBLIC API
     * ---------------------------------------------------------
     */

    window.PacificEducationDashboards =
        Object.freeze({

            version:
                VERSION,

            isAuthorized:
                isAuthorized,

            getStudentData:
                getPacificStudentData,

            refreshTeacher:
                refreshTeacherDashboard,

            refreshParent:
                refreshParentDashboard,

            refreshAll:
                refreshAllDashboards,

            completeLesson:
                completeLesson,

            setOwnerTestDay:
                setOwnerTestDay,

            getOwnerTestDay:
                getOwnerTestDay,

            exitOwnerTestMode:
                exitOwnerTestMode
        });

    /*
     * Preserve existing global functions used by the
     * Class 1 prototype.
     */
    window.getPacificStudentData =
        getPacificStudentData;

    window.refreshTeacherDashboard =
        refreshTeacherDashboard;

    window.refreshParentDashboard =
        refreshParentDashboard;

    window.refreshAllDashboards =
        refreshAllDashboards;

    window.completeLesson =
        completeLesson;

    window.setOwnerTestDay =
        setOwnerTestDay;

    window.getOwnerTestDay =
        getOwnerTestDay;

    window.exitOwnerTestMode =
        exitOwnerTestMode;

    /*
     * ---------------------------------------------------------
     * PAGE LOAD
     * ---------------------------------------------------------
     */

    document.addEventListener(
        "DOMContentLoaded",
        function () {
            refreshAllDashboards();
        }
    );

})(window);
