/* =========================================
   PACIFIC EDUCATION
   TEACHER & PARENT DASHBOARDS
========================================= */

function getPacificStudentData() {

    return {
        name:
            localStorage.getItem("studentName") ||
            "Student",

        currentDay:
            localStorage.getItem("currentDay") ||
            "Day 1",

        lessonsCompleted:
            localStorage.getItem("lessonsCompleted") ||
            "0",

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


    if (name)
        name.textContent =
            student.name;

    if (day)
        day.textContent =
            student.currentDay;

    if (lessons)
        lessons.textContent =
            student.lessonsCompleted;

    if (alphabet)
        alphabet.textContent =
            student.alphabetAssessment;

    if (phonics)
        phonics.textContent =
            student.phonicsAssessment;

    if (status)
        status.textContent =
            student.learningStatus;

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


    if (name)
        name.textContent =
            student.name;

    if (day)
        day.textContent =
            student.currentDay;

    if (lessons)
        lessons.textContent =
            student.lessonsCompleted;

    if (alphabet)
        alphabet.textContent =
            student.alphabetAssessment;

    if (phonics)
        phonics.textContent =
            student.phonicsAssessment;

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
   REFRESH BOTH DASHBOARDS
========================================= */

function refreshAllDashboards() {

    refreshTeacherDashboard();

    refreshParentDashboard();

}


/* =========================================
   AUTOMATIC STUDENT PROGRESS
========================================= */

function completeLesson() {

    let currentDay =
        parseInt(
            localStorage.getItem(
                "currentDayNumber"
            ) || "1"
        );

    let lessonsCompleted =
        parseInt(
            localStorage.getItem(
                "lessonsCompleted"
            ) || "0"
        );


    lessonsCompleted++;

    currentDay++;


    if (currentDay > 365) {

        currentDay = 365;

    }


    localStorage.setItem(
        "currentDayNumber",
        currentDay
    );

    localStorage.setItem(
        "currentDay",
        "Day " + currentDay
    );

    localStorage.setItem(
        "lessonsCompleted",
        lessonsCompleted
    );


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
