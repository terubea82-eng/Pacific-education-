/* =========================================================
   PACIFIC EDUCATION
   TEACHER & PARENT DASHBOARDS
   PROTECTED PROGRESS CONNECTION
   VERSION 1.4.0

   RULES
   ---------------------------------------------------------
   • Education Core is the preferred progress authority.
   • Unauthorized progress changes are blocked.
   • localStorage is compatibility storage only.
   • Owner Test Day never becomes real learner progress.
   • Day 30 requires a passed Alphabet Assessment.
   • Day 60 requires a passed Phonics Assessment.
   • Assessment progression remains controlled by
     assessments.js/Core.
   ========================================================= */

(function (window) {
    "use strict";

    const VERSION = "1.4.0";
    const MAX_DAY = 365;
    const ASSESSMENT_PASS_MARK = 80;

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

    /* =====================================================
       ASSESSMENT GATE
       ===================================================== */

    function getAssessmentRecords() {
        const state =
            getCoreState();

        if (
            !state ||
            !Array.isArray(state.assessments)
        ) {
            return [];
        }

        return state.assessments;
    }

    function assessmentMatches(record, type, day) {
        if (
            !record ||
            typeof record !== "object"
        ) {
            return false;
        }

        const recordType =
            typeof record.type === "string"
                ? record.type.toLowerCase()
                : "";

        const recordTitle =
            typeof record.title === "string"
                ? record.title.toLowerCase()
                : "";

        const recordAssessmentType =
            typeof record.assessmentType === "string"
                ? record.assessmentType.toLowerCase()
                : "";

        const requestedType =
            type.toLowerCase();

        const typeMatches =
            recordType === requestedType ||
            recordAssessmentType === requestedType ||
            recordTitle.indexOf(
                requestedType
            ) !== -1;

        if (!typeMatches) {
            return false;
        }

        if (
            record.day !== undefined &&
            record.day !== null
        ) {
            const recordDay =
                parseInt(
                    record.day,
                    10
                );

            if (
                !isNaN(recordDay) &&
                recordDay !== day
            ) {
                return false;
            }
        }

        return true;
    }

    function assessmentRecordPassed(record) {
        if (
            !record ||
            typeof record !== "object"
        ) {
            return false;
        }

        if (record.passed === true) {
            return true;
        }

        if (
            typeof record.status === "string" &&
            record.status.toLowerCase() ===
            "passed"
        ) {
            return true;
        }

        const percentage =
            Number(
                record.percentage !== undefined
                    ? record.percentage
                    : record.score
            );

        if (
            Number.isFinite(percentage) &&
            percentage >= ASSESSMENT_PASS_MARK
        ) {
            return true;
        }

        return false;
    }

    function hasPassedRequiredAssessment(
        type,
        day
    ) {
        if (!isAuthorized()) {
            return false;
        }

        const records =
            getAssessmentRecords();

        for (
            let index = 0;
            index < records.length;
            index += 1
        ) {
            const record =
                records[index];

            if (
                assessmentMatches(
                    record,
                    type,
                    day
                ) &&
                assessmentRecordPassed(record)
            ) {
                return true;
            }
        }

        return false;
    }

    function getRequiredAssessmentForDay(day) {
        if (day === 30) {
            return {
                type: "alphabet",
                title: "Alphabet Assessment"
            };
        }

        if (day === 60) {
            return {
                type: "phonics",
                title: "Phonics Assessment"
            };
        }

        return null;
    }

    function canProgressFromDay(day) {
        const required =
            getRequiredAssessmentForDay(
                day
            );

        if (!required) {
            return true;
        }

        return hasPassedRequiredAssessment(
            required.type,
            day
        );
    }

    function showAssessmentGate(day) {
        const required =
            getRequiredAssessmentForDay(
                day
            );

        if (!required) {
            return;
        }

        const message =
            "Day " +
            day +
            " requires a passed " +
            required.title +
            " before learning can progress.";

        console.warn(
            "Pacific Education:",
            message
        );

        if (
            typeof window.showLesson ===
            "function"
        ) {
            window.showLesson(
                "<p>" +
                message +
                "</p>"
            );
        }
    }

    /* =====================================================
       COMPLETE REAL LESSON
       ===================================================== */

    function completeLesson() {
        if (!isAuthorized()) {
            console.warn(
                "Pacific Education: lesson completion blocked because the user is not authorized."
            );

            return false;
        }

        /*
         * Owner Test Mode must never create a real
         * lesson completion.
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
         * Day 30 and Day 60 are protected assessment gates.
         *
         * The learner must pass the required assessment
         * before progression is allowed.
         */
        if (
            !canProgressFromDay(
                currentDay
            )
        ) {
            showAssessmentGate(
                currentDay
            );

            refreshAllDashboards();

            return false;
        }

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
         * Protected Core lesson API is mandatory.
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
         * Compatibility counters are updated only after
         * Core accepts the protected lesson change.
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

    /* =====================================================
       OWNER TEST DAY
       ===================================================== */

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

        writeStorage(
            STORAGE.ownerTestDay,
            testDay
        );

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
         * Temporary compatibility display only.
         * The protected Core is NOT changed.
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
         * Restore the real compatibility values.
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

    /* =====================================================
       DASHBOARD PUBLIC API
       ===================================================== */

    window.PacificEducationDashboards =
        Object.freeze({

            version:
                VERSION,

            assessmentPassMark:
                ASSESSMENT_PASS_MARK,

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
                exitOwnerTestMode,

            hasPassedRequiredAssessment:
                hasPassedRequiredAssessment,

            canProgressFromDay:
                canProgressFromDay
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
     * =====================================================
       PAGE LOAD
       =====================================================
     */

    document.addEventListener(
        "DOMContentLoaded",
        function () {
            refreshAllDashboards();
        }
    );

})(window);
