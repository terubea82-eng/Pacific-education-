/* =========================================
   PACIFIC EDUCATION
   TEACHER & PARENT DASHBOARDS
   STUDENT PROGRESS STORAGE
========================================= */


/* =========================================
   GET STUDENT PROGRESS
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

    return {

        name:
            localStorage.getItem("studentName") ||
            "Student",

        currentDay:
            "Day " + currentDayNumber,

        lessonsCompleted:
            lessonsCompleted,

        alphabetAssessment:
            localStorage.getItem("alphabetAssessment") ||
            "Not completed",

        phonicsAssessment:
            localStorage.getItem("phonicsAssessment") ||
            "Not completed",

        learningStatus:
            localStorage.getItem("learningStatus") ||
            "Monitoring"

    };

}


/* =========================================
   TEACHER DASHBOARD
========================================= */

function refreshTeacherDashboard() {

    const student =
        getPacificStudentData();

    const name =
        document.getElementById("teacherStudentName");

    const day =
        document.getElementById("teacherCurrentDay");

    const lessons =
        document.getElementById("teacherLessonsCompleted");

    const alphabet =
        document.getElementById("teacherAlphabetAssessment");

    const phonics =
        document.getElementById("teacherPhonicsAssessment");

    const status =
        document.getElementById("teacherLearningStatus");


    if (name)
        name.textContent = student.name;

    if (day)
        day.textContent = student.currentDay;

    if (lessons)
        lessons.textContent = student.lessonsCompleted;

    if (alphabet)
        alphabet.textContent = student.alphabetAssessment;

    if (phonics)
        phonics.textContent = student.phonicsAssessment;

    if (status)
        status.textContent = student.learningStatus;

}


/* =========================================
   PARENT DASHBOARD
========================================= */

function refreshParentDashboard() {

    const student =
        getPacificStudentData();

    const name =
        document.getElementById("parentStudentName");

    const day =
        document.getElementById("parentCurrentDay");

    const lessons =
        document.getElementById("parentLessonsCompleted");

    const alphabet =
        document.getElementById("parentAlphabetAssessment");

    const phonics =
        document.getElementById("parentPhonicsAssessment");

    const status =
        document.getElementById("parentLearningStatus");


    if (name)
        name.textContent = student.name;

    if (day)
        day.textContent = student.currentDay;

    if (lessons)
        lessons.textContent = student.lessonsCompleted;

    if (alphabet)
        alphabet.textContent = student.alphabetAssessment;

    if (phonics)
        phonics.textContent = student.phonicsAssessment;


    if (status) {

        if (student.learningStatus === "Monitoring") {

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
   COMPLETE DAILY LESSON
========================================= */

function completeLesson() {

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


    /* Prevent invalid numbers */

    if (isNaN(currentDayNumber) || currentDayNumber < 1) {

        currentDayNumber = 1;

    }

    if (isNaN(lessonsCompleted) || lessonsCompleted < 0) {

        lessonsCompleted = 0;

    }


    /* Complete today's lesson */

    lessonsCompleted++;

    currentDayNumber++;


    /* Maximum 365 days */

    if (currentDayNumber > 365) {

        currentDayNumber = 365;

    }


    /* Save progress */

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


    /* Refresh dashboards immediately */

    refreshAllDashboards();

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

/* Refresh dashboards immediately */

refreshAllDashboards();


/* Refresh daily lesson */

if (typeof displayDailyLesson === "function") {

    displayDailyLesson();

}

}
