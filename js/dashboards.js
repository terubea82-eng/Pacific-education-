/* =========================================================
   PACIFIC EDUCATION
   TEACHER & PARENT DASHBOARDS
   CORE-AUTHORITATIVE PROGRESS CONNECTION
   VERSION 1.5.0

   RULES
   ---------------------------------------------------------
   • Education Core is the progress authority.
   • Core records completed lessons.
   • localStorage is compatibility/UI fallback only.
   • Owner Test Day never becomes real learner progress.
   • Day 30 requires a passed Alphabet Assessment.
   • Day 60 requires a passed Phonics Assessment.
   • Assessment progression remains controlled by Core.
   • Completing a lesson records the CURRENT lesson first.
   • Only after successful completion does Core advance.
   • The next lesson is never falsely marked completed.
   • Duplicate completion records are blocked.
   ========================================================= */

(function (window) {
    "use strict";

    const VERSION = "1.5.0";
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

    window.__pacificEducationProtectedWrapper = true;

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
            if (typeof window.localStorage === "undefined") {
                return fallback;
            }

            const value = window.localStorage.getItem(key);

            return value === null ? fallback : value;
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
            if (typeof window.localStorage === "undefined") {
                return false;
            }

            window.localStorage.setItem(key, String(value));
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
            if (typeof window.localStorage === "undefined") {
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

        if (isNaN(number) || number < 1) {
            return fallback;
        }

        return Math.min(number, MAX_DAY);
    }

    function toValidLessons(value) {
        const number = parseInt(value, 10);

        if (isNaN(number) || number < 0) {
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

    /* =====================================================
       CORE LEARNING HISTORY
       ===================================================== */

    function getCoreLearningHistory() {
        const core = getCore();

        if (
            core &&
            typeof core.getLearningHistory === "function"
        ) {
            try {
                const history = core.getLearningHistory();

                if (Array.isArray(history)) {
                    return history;
                }
            } catch (error) {
                console.warn(
                    "Pacific Education Core learning history could not be read.",
                    error
                );
            }
        }

        const state = getCoreState();

        if (
            state &&
            Array.isArray(state.learningHistory)
        ) {
            return state.learningHistory;
        }

        return [];
    }

    function getCurrentStudentId() {
        const state = getCoreState();

        if (
            state &&
            state.student &&
            state.student.studentId
        ) {
            return state.student.studentId;
        }

        if (
            state &&
            state.student &&
            state.student.id
        ) {
            return state.student.id;
        }

        return null;
    }

    function isCompletedHistoryEntry(entry) {
        if (
            !entry ||
            typeof entry !== "object"
        ) {
            return false;
        }

        return (
            typeof entry.status === "string" &&
            entry.status.toLowerCase() === "completed"
        );
    }

    function historyEntryMatchesStudent(entry, studentId) {
        if (!studentId) {
            return true;
        }

        if (
            entry.studentId === undefined ||
            entry.studentId === null
        ) {
            return false;
        }

        return (
            String(entry.studentId) ===
            String(studentId)
        );
    }

    function countCoreCompletedLessons() {
        const history = getCoreLearningHistory();

        if (!Array.isArray(history)) {
            return null;
        }

        const studentId = getCurrentStudentId();
        let count = 0;

        for (
            let index = 0;
            index < history.length;
            index += 1
        ) {
            const entry = history[index];

            if (
                isCompletedHistoryEntry(entry) &&
                historyEntryMatchesStudent(
                    entry,
                    studentId
                )
            ) {
                count += 1;
            }
        }

        return count;
    }

    function getCompletedLessonCount() {
        const coreCount = countCoreCompletedLessons();

        if (coreCount !== null) {
            return coreCount;
        }

        return toValidLessons(
            readStorage(
                STORAGE.lessonsCompleted,
                "0"
            )
        );
    }

    function currentLessonAlreadyCompleted(day) {
        const history = getCoreLearningHistory();
        const studentId = getCurrentStudentId();

        for (
            let index = 0;
            index < history.length;
            index += 1
        ) {
            const entry = history[index];

            if (!isCompletedHistoryEntry(entry)) {
                continue;
            }

            if (
                Number(entry.day) !==
                Number(day)
            ) {
                continue;
            }

            if (
                !historyEntryMatchesStudent(
                    entry,
                    studentId
                )
            ) {
                continue;
            }

            return true;
        }

        return false;
    }

    /* =====================================================
       STUDENT DATA
       ===================================================== */

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

        const coreCompleted =
            countCoreCompletedLessons();

        const lessonsCompleted =
            coreCompleted !== null
                ? toValidLessons(coreCompleted)
                : toValidLessons(
                    readStorage(
                        STORAGE.lessonsCompleted,
                        "0"
                    )
                );

        return {
            name: name || "Student",

            currentDay:
                "Day " + currentDayNumber,

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

    /* =====================================================
       DASHBOARD DISPLAY
       ===================================================== */

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

    /* =====================================================
       OWNER TEST MODE
       ===================================================== */

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

    function displayLessonIfAvailable() {
        if (
            typeof window.displayDailyLesson ===
            "function"
        ) {
            try {
                window.displayDailyLesson();
            } catch (error) {
                console.warn(
                    "Pacific Education: daily lesson display failed.",
                    error
                );
            }
        }
    }

    function exitOwnerTestMode() {
        const realDay =
            readStorage(
                STORAGE.currentDayNumber,
                "1"
            );

        removeStorage(
            STORAGE.ownerTestDay
        );

        /*
         * Restore compatibility display only.
         * Core progress was never changed.
         */
        writeStorage(
            STORAGE.currentDayNumber,
            realDay
        );

        writeStorage(
            STORAGE.currentDay,
            "Day " + realDay
        );

        refreshAllDashboards();
        displayLessonIfAvailable();

        return true;
    }

    /* =====================================================
       ASSESSMENT GATE
       ===================================================== */

    function getAssessmentRecords() {
        const state = getCoreState();

        if (
            !state ||
            !Array.isArray(
                state.assessments
            )
        ) {
            return [];
        }

        return state.assessments;
    }

    function assessmentMatches(
        record,
        type,
        day
    ) {
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
            typeof record.assessmentType ===
            "string"
                ? record.assessmentType.toLowerCase()
                : "";

        const requestedType =
            String(type).toLowerCase();

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

        return (
            Number.isFinite(percentage) &&
            percentage >= ASSESSMENT_PASS_MARK
        );
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
            const record = records[index];

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
            getRequiredAssessmentForDay(day);

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
            getRequiredAssessmentForDay(day);

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
            try {
                window.showLesson(
                    "<p>" +
                    message +
                    "</p>"
                );
            } catch (error) {
                console.warn(
                    "Pacific Education: assessment gate display failed.",
                    error
                );
            }
        }
    }

    /* =====================================================
       CURRENT CORE LESSON
       ===================================================== */

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
       RECORD CURRENT LESSON
       ===================================================== */

    function recordCurrentLessonCompletion(
        lesson
    ) {
        const core = getCore();

        if (
            !core ||
            typeof core.recordLessonCompletion !==
            "function"
        ) {
            console.warn(
                "Pacific Education: Core lesson-completion API is unavailable."
            );

            return false;
        }

        if (
            !lesson ||
            typeof lesson !== "object"
        ) {
            return false;
        }

        const day =
            toValidDay(
                lesson.day,
                null
            );

        if (day === null) {
            return false;
        }

        const completionData = {
            day: day,

            studentId:
                getCurrentStudentId(),

            lessonId:
                lesson.lessonId ||
                null,

            subject:
                lesson.subject ||
                "",

            title:
                lesson.title ||
                "",

            concept:
                lesson.concept ||
                "",

            evidence: null,

            source:
                "dashboard_complete_lesson"
        };

        try {
            return !!core.recordLessonCompletion(
                completionData
            );
        } catch (error) {
            console.error(
                "Pacific Education: Core lesson completion failed.",
                error
            );

            return false;
        }
    }

    /* =====================================================
       ADVANCE TO NEXT LESSON
       ===================================================== */

    function advanceToNextLesson(
        currentLesson,
        nextDay
    ) {
        const core = getCore();

        if (
            !core ||
            typeof core.setLesson !==
            "function"
        ) {
            console.warn(
                "Pacific Education: protected Core lesson API is unavailable."
            );

            return false;
        }

        const lessonUpdate = {
            lessonId:
                currentLesson &&
                currentLesson.lessonId
                    ? currentLesson.lessonId
                    : null,

            day: nextDay,

            subject:
                currentLesson &&
                currentLesson.subject
                    ? currentLesson.subject
                    : "",

            title: "",

            concept:
                currentLesson &&
                currentLesson.concept
                    ? currentLesson.concept
                    : "",

            status: "not_started"
        };

        try {
            return !!core.setLesson(
                lessonUpdate
            );
        } catch (error) {
            console.error(
                "Pacific Education: protected lesson advancement failed.",
                error
            );

            return false;
        }
    }

    /* =====================================================
       COMPATIBILITY STORAGE SYNC
       ===================================================== */

    function syncCompatibilityProgress() {
        const coreState =
            getCoreState();

        if (
            coreState &&
            coreState.lesson
        ) {
            const day =
                toValidDay(
                    coreState.lesson.day,
                    null
                );

            if (day !== null) {
                writeStorage(
                    STORAGE.currentDayNumber,
                    day
                );

                writeStorage(
                    STORAGE.currentDay,
                    "Day " + day
                );
            }
        }

        const completed =
            countCoreCompletedLessons();

        if (completed !== null) {
            writeStorage(
                STORAGE.lessonsCompleted,
                completed
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
         * Owner Test Mode never creates real progress.
         */
        if (
            getOwnerTestDay() !== null
        ) {
            console.info(
                "Pacific Education: Owner Test Mode active. No real lesson completion recorded."
            );

            refreshAllDashboards();
            displayLessonIfAvailable();

            return false;
        }

        const currentLesson =
            currentCoreLesson();

        if (!currentLesson) {
            console.warn(
                "Pacific Education: current Core lesson is unavailable."
            );

            return false;
        }

        const currentDay =
            toValidDay(
                currentLesson.day,
                null
            );

        if (currentDay === null) {
            return false;
        }

        /*
         * Assessment gate.
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
         * Never create duplicate completion.
         */
        let completionResult;

        if (
            currentLessonAlreadyCompleted(
                currentDay
            )
        ) {
            completionResult = true;
        } else {
            completionResult =
                recordCurrentLessonCompletion(
                    currentLesson
                );
        }

        if (!completionResult) {
            console.warn(
                "Pacific Education: lesson completion was not recorded. Progress was not advanced."
            );

            return false;
        }

        /*
         * Final day.
         */
        if (currentDay >= MAX_DAY) {
            syncCompatibilityProgress();
            refreshAllDashboards();
            displayLessonIfAvailable();

            return true;
        }

        const nextDay =
            currentDay + 1;

        /*
         * Advance only after current lesson
         * is safely recorded.
         */
        const advanced =
            advanceToNextLesson(
                currentLesson,
                nextDay
            );

        if (!advanced) {
            console.warn(
                "Pacific Education: lesson was recorded, but advancement to the next lesson failed."
            );

            syncCompatibilityProgress();
            refreshAllDashboards();

            return false;
        }

        syncCompatibilityProgress();

        refreshAllDashboards();
        displayLessonIfAvailable();

        return true;
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

        /*
         * Save the test day separately.
         */
        writeStorage(
            STORAGE.ownerTestDay,
            testDay
        );

        /*
         * Compatibility display only.
         * Core lesson/progress is NOT changed.
         */
        writeStorage(
            STORAGE.currentDayNumber,
            testDay
        );

        writeStorage(
            STORAGE.currentDay,
            "Day " + testDay
        );

        refreshAllDashboards();
        displayLessonIfAvailable();

        return true;
    }

    /* =====================================================
       INITIALISATION
       ===================================================== */

    function initialiseDashboards() {
        try {
            refreshAllDashboards();
        } catch (error) {
            console.warn(
                "Pacific Education: dashboard initialization failed.",
                error
            );
        }
    }

    if (
        document.readyState ===
        "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            initialiseDashboards
        );
    } else {
        initialiseDashboards();
    }

    /* =====================================================
       PUBLIC API
       ===================================================== */

    const publicAPI = Object.freeze({
        version:
            VERSION,

        getStudentData:
            getPacificStudentData,

        getCompletedLessonCount:
            getCompletedLessonCount,

        currentLessonAlreadyCompleted:
            currentLessonAlreadyCompleted,

        refreshTeacherDashboard:
            refreshTeacherDashboard,

        refreshParentDashboard:
            refreshParentDashboard,

        refreshAllDashboards:
            refreshAllDashboards,

        completeLesson:
            completeLesson,

        setOwnerTestDay:
            setOwnerTestDay,

        getOwnerTestDay:
            getOwnerTestDay,

        clearOwnerTestDay:
            exitOwnerTestMode,

        exitOwnerTestMode:
            exitOwnerTestMode,

        canProgressFromDay:
            canProgressFromDay,

        hasPassedRequiredAssessment:
            hasPassedRequiredAssessment
    });

    window.PacificEducationDashboards =
        publicAPI;

    /*
     * Backward-compatible global functions.
     */
    window.getPacificStudentData =
        getPacificStudentData;

    window.getCompletedLessonCount =
        getCompletedLessonCount;

    window.currentLessonAlreadyCompleted =
        currentLessonAlreadyCompleted;

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

    window.clearOwnerTestDay =
        exitOwnerTestMode;

    window.exitOwnerTestMode =
        exitOwnerTestMode;

    window.canProgressFromDay =
        canProgressFromDay;

    window.hasPassedRequiredAssessment =
        hasPassedRequiredAssessment;

})(window);
