/* =========================================
   PACIFIC EDUCATION
   TEACHER & PARENT DASHBOARDS
   STUDENT PROGRESS STORAGE
   VERSION 1.2.0
========================================= */


/* =========================================
   GET REAL STUDENT PROGRESS
========================================= */

function getPacificStudentData() {

    let currentDayNumber =
        parseInt(
            localStorage.getItem("currentDayNumber") || "1",
            10
        );

    let lessonsCompleted =
        parseInt(
            localStorage.getItem("lessonsCompleted") || "0",
            10
        );

    if (
        isNaN(currentDayNumber) ||
        currentDayNumber < 1
    ) {
        currentDayNumber = 1;
    }

    if (currentDayNumber > 365) {
        currentDayNumber = 365;
    }

    if (
        isNaN(lessonsCompleted) ||
        lessonsCompleted < 0
    ) {
        lessonsCompleted = 0;
    }

    return {

        name:
            localStorage.getItem("studentName") ||
            "Student",

        currentDay:
            "Day " + currentDayNumber,

        currentDayNumber:
            currentDayNumber,

        lessonsCompleted:
            lessonsCompleted,

        alphabetAssessment:
            localStorage.getItem(
                "alphabetAssessment"
            ) || "Not completed",

        phonicsAssessment:
            localStorage.getItem(
                "phonicsAssessment"
            ) || "Not completed",

        learningStatus:
            localStorage.getItem(
                "learningStatus"
            ) || "Monitoring"

    };

}


/* =========================================
   TEACHER DASHBOARD
========================================= */

function refreshTeacherDashboard() {

    const student =
        getPacificStudentData();

    const name =
        document.getElementById(
            "teacherStudentName"
        );

    const day =
        document.getElementById(
            "teacherCurrentDay"
        );

    const lessons =
        document.getElementById(
            "teacherLessonsCompleted"
        );

    const alphabet =
        document.getElementById(
            "teacherAlphabetAssessment"
        );

    const phonics =
        document.getElementById(
            "teacherPhonicsAssessment"
        );

    const status =
        document.getElementById(
            "teacherLearningStatus"
        );

    if (name) {
        name.textContent =
            student.name;
    }

    if (day) {
        day.textContent =
            student.currentDay;
    }

    if (lessons) {
        lessons.textContent =
            student.lessonsCompleted;
    }

    if (alphabet) {
        alphabet.textContent =
            student.alphabetAssessment;
    }

    if (phonics) {
        phonics.textContent =
            student.phonicsAssessment;
    }

    if (status) {
        status.textContent =
            student.learningStatus;
    }

}


/* =========================================
   PARENT DASHBOARD
========================================= */

function refreshParentDashboard() {

    const student =
        getPacificStudentData();

    const name =
        document.getElementById(
            "parentStudentName"
        );

    const day =
        document.getElementById(
            "parentCurrentDay"
        );

    const lessons =
        document.getElementById(
            "parentLessonsCompleted"
        );

    const alphabet =
        document.getElementById(
            "parentAlphabetAssessment"
        );

    const phonics =
        document.getElementById(
            "parentPhonicsAssessment"
        );

    const status =
        document.getElementById(
            "parentLearningStatus"
        );

    if (name) {
        name.textContent =
            student.name;
    }

    if (day) {
        day.textContent =
            student.currentDay;
    }

    if (lessons) {
        lessons.textContent =
            student.lessonsCompleted;
    }

    if (alphabet) {
        alphabet.textContent =
            student.alphabetAssessment;
    }

    if (phonics) {
        phonics.textContent =
            student.phonicsAssessment;
    }

    if (status) {

        if (
            student.learningStatus ===
            "Monitoring"
        ) {

            status.textContent =
                "Keep practising";

        } else {

            status.textContent =
                student.learningStatus;

        }

    }

}


/* =========================================
   REFRESH ALL DASHBOARDS
========================================= */

function refreshAllDashboards() {

    refreshTeacherDashboard();

    refreshParentDashboard();

}


/* =========================================
   EXIT OWNER TEST MODE
========================================= */

function exitOwnerTestMode() {

    localStorage.removeItem(
        "pacificOwnerTestDay"
    );

}


/* =========================================
   COMPLETE DAILY LESSON
========================================= */

function completeLesson() {

    /*
       Owner testing must never count as
       a real learner lesson.
    */

    if (
        localStorage.getItem(
            "pacificOwnerTestDay"
        )
    ) {

        exitOwnerTestMode();

        if (
            typeof displayDailyLesson ===
            "function"
        ) {

            displayDailyLesson();

        }

        refreshAllDashboards();

        return;

    }


    let currentDayNumber =
        parseInt(
            localStorage.getItem(
                "currentDayNumber"
            ) || "1",
            10
        );

    let lessonsCompleted =
        parseInt(
            localStorage.getItem(
                "lessonsCompleted"
            ) || "0",
            10
        );


    /* =========================================
       VALIDATE DAY
    ========================================= */

    if (
        isNaN(currentDayNumber) ||
        currentDayNumber < 1
    ) {
        currentDayNumber = 1;
    }

    if (currentDayNumber > 365) {
        currentDayNumber = 365;
    }


    /* =========================================
       VALIDATE LESSON COUNT
    ========================================= */

    if (
        isNaN(lessonsCompleted) ||
        lessonsCompleted < 0
    ) {
        lessonsCompleted = 0;
    }


    /* =========================================
       DAY 365 COMPLETE
    ========================================= */

    if (currentDayNumber >= 365) {

        if (
            typeof displayDailyLesson ===
            "function"
        ) {

            displayDailyLesson();

        }

        refreshAllDashboards();

        return;

    }


    /* =========================================
       RECORD REAL LESSON
    ========================================= */

    lessonsCompleted++;


    /* =========================================
       DAY 60 CHECKPOINT
    ========================================= */

    if (currentDayNumber !== 60) {

        currentDayNumber++;

    }


    /* =========================================
       MAXIMUM DAY 365
    ========================================= */

    if (currentDayNumber > 365) {

        currentDayNumber = 365;

    }


    /* =========================================
       SAVE REAL PROGRESS
    ========================================= */

    localStorage.setItem(
        "currentDayNumber",
        currentDayNumber.toString()
    );

    localStorage.setItem(
        "currentDay",
        "Day " + currentDayNumber
    );

    localStorage.setItem(
        "lessonsCompleted",
        lessonsCompleted.toString()
    );


    /* =========================================
       REFRESH DASHBOARDS
    ========================================= */

    refreshAllDashboards();


    /* =========================================
       REFRESH LESSON
    ========================================= */

    if (
        typeof displayDailyLesson ===
        "function"
    ) {

        displayDailyLesson();

    }

}


/* =========================================
   OWNER TEST MODE
   IMPORTANT:
   DOES NOT CHANGE REAL PROGRESS.
========================================= */

function setOwnerTestDay(dayNumber) {

    const testDay =
        parseInt(
            dayNumber,
            10
        );


    /* =========================================
       VALIDATE TEST DAY
    ========================================= */

    if (
        isNaN(testDay) ||
        testDay < 1 ||
        testDay > 365
    ) {

        console.warn(
            "Invalid Owner Test Day:",
            dayNumber
        );

        return;

    }


    /* =========================================
       SAVE TEST DAY SEPARATELY
    ========================================= */

    localStorage.setItem(
        "pacificOwnerTestDay",
        testDay.toString()
    );


    /*
       Save the learner's real progress before
       temporarily asking the existing lesson
       engine to display the test lesson.
    */

    const realDay =
        localStorage.getItem(
            "currentDayNumber"
        );

    const realCurrentDay =
        localStorage.getItem(
            "currentDay"
        );


    /* =========================================
       TEMPORARY DISPLAY ONLY
    ========================================= */

    localStorage.setItem(
        "currentDayNumber",
        testDay.toString()
    );

    localStorage.setItem(
        "currentDay",
        "Day " + testDay
    );


    if (
        typeof displayDailyLesson ===
        "function"
    ) {

        displayDailyLesson();

    }


    /* =========================================
       RESTORE REAL LEARNER PROGRESS
    ========================================= */

    if (realDay !== null) {

        localStorage.setItem(
            "currentDayNumber",
            realDay
        );

    } else {

        localStorage.removeItem(
            "currentDayNumber"
        );

    }


    if (realCurrentDay !== null) {

        localStorage.setItem(
            "currentDay",
            realCurrentDay
        );

    } else {

        localStorage.removeItem(
            "currentDay"
        );

    }


    /* =========================================
       REFRESH DASHBOARDS FROM REAL DATA
    ========================================= */

    refreshAllDashboards();


    console.info(
        "Pacific Education Owner Test Mode:",
        "Day " + testDay,
        "Real learner progress preserved."
    );

}


/* =========================================
   GET OWNER TEST DAY
========================================= */

function getOwnerTestDay() {

    const testDay =
        parseInt(
            localStorage.getItem(
                "pacificOwnerTestDay"
            ) || "",
            10
        );

    if (
        isNaN(testDay) ||
        testDay < 1 ||
        testDay > 365
    ) {

        return null;

    }

    return testDay;

}


/* =========================================
   PAGE LOAD
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        refreshAllDashboards();

    }
);


/* =========================================
   PUBLIC DASHBOARD API
========================================= */

window.PacificEducationDashboards =
    Object.freeze({

        version: "1.2.0",

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


/* =========================================
   END DASHBOARDS ENGINE
========================================= */
