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

    if (isNaN(currentDayNumber) || currentDayNumber < 1) {
        currentDayNumber = 1;
    }

    if (currentDayNumber > 365) {
        currentDayNumber = 365;
    }

    if (isNaN(lessonsCompleted) || lessonsCompleted < 0) {
        lessonsCompleted = 0;
    }

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


    /* =========================================
       PREVENT REPEATED COMPLETION AFTER DAY 365
    ========================================= */

    if (currentDayNumber >= 365) {

        if (typeof displayDailyLesson === "function") {
            displayDailyLesson();
        }

        refreshAllDashboards();

        return;
    }


    /* =========================================
       COMPLETE TODAY'S LESSON
    ========================================= */

    lessonsCompleted++;


    /* =========================================
       DAY 60 CHECKPOINT
    ========================================= */

    if (currentDayNumber !== 60) {

        currentDayNumber++;

    }


    /* Maximum 365 days */

    if (currentDayNumber > 365) {
        currentDayNumber = 365;
    }


    /* =========================================
       SAVE PROGRESS
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
       REFRESH DAILY LESSON
    ========================================= */

    if (typeof displayDailyLesson === "function") {

        displayDailyLesson();

    }

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
   OWNER TEST MODE
========================================= */

function setOwnerTestDay(dayNumber) {

    let testDay =
        parseInt(dayNumber, 10);

    if (
        isNaN(testDay) ||
        testDay < 1 ||
        testDay > 365
    ) {

        return;

    }


    localStorage.setItem(
        "currentDayNumber",
        testDay.toString()
    );

    localStorage.setItem(
        "currentDay",
        "Day " + testDay
    );


    refreshAllDashboards();


    if (typeof displayDailyLesson === "function") {

        displayDailyLesson();

    }

}

/* =========================================
   PACIFIC EDUCATION — ASSESSMENTS
========================================= */

const assessmentData = {

    alphabet: {
        title: "Day 30 — Alphabet Assessment",

        questions: [
            {
                question: "Which letter is this? A",
                options: ["A", "B", "C"],
                answer: "A"
            },
            {
                question: "Which letter comes after B?",
                options: ["A", "C", "D"],
                answer: "C"
            },
            {
                question: "Which word begins with A?",
                options: ["Apple", "Dog", "Sun"],
                answer: "Apple"
            }
        ]
    },

    phonics: {
        title: "Day 60 — Phonics Assessment",

        questions: [
            {
                question: "Which word begins with the /b/ sound?",
                options: ["Ball", "Cat", "Dog"],
                answer: "Ball"
            },
            {
                question: "Which word begins with the /m/ sound?",
                options: ["Sun", "Map", "Dog"],
                answer: "Map"
            },
            {
                question: "Blend /c/ /a/ /t/.",
                options: ["Cat", "Dog", "Sun"],
                answer: "Cat"
            }
        ]
    }

};


/* =========================================
   HTML ESCAPE
========================================= */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================
   START ASSESSMENT
========================================= */

function startAssessment(type) {

    const assessment =
        assessmentData[type];

    if (!assessment) {

        alert("Assessment not found.");

        return;

    }


    let questionNumber = 0;

    let assessmentScore = 0;


    function showQuestion() {

        const question =
            assessment.questions[questionNumber];

        window.currentAssessmentQuestion =
            question;


        const buttons =
            question.options
                .map(function(option) {

                    return `
                        <button
                            type="button"
                            onclick="answerAssessment(this.dataset.answer)"
                            data-answer="${escapeHTML(option)}">

                            ${escapeHTML(option)}

                        </button>
                    `;

                })
                .join("");


        showLesson(

            assessment.title,

            `
            <div class="activity">

                <p>
                    Question ${questionNumber + 1}
                    of ${assessment.questions.length}
                </p>

                <h3>
                    ${escapeHTML(question.question)}
                </h3>

                <div>
                    ${buttons}
                </div>

            </div>
            `

        );

    }


    window.answerAssessment =
        function(answer) {

            const question =
                window.currentAssessmentQuestion;

            if (!question) {
                return;
            }


            if (
                String(answer)
                    .trim()
                    .toLowerCase()
                ===
                String(question.answer)
                    .trim()
                    .toLowerCase()
            ) {

                assessmentScore++;


                if (
                    typeof speakText === "function"
                ) {

                    speakText("Correct!");

                }

            } else {

                if (
                    typeof speakText === "function"
                ) {

                    speakText(
                        "Let's keep practising."
                    );

                }

            }


            questionNumber++;


            if (
                questionNumber <
                assessment.questions.length
            ) {

                showQuestion();

            } else {

                finishAssessment(
                    type,
                    assessmentScore,
                    assessment.questions.length
                );

            }

        };


    showQuestion();

}


/* =========================================
   SAVE ASSESSMENT RESULT
========================================= */

function finishAssessment(
    type,
    assessmentScore,
    total
) {

    const percentage =
        Math.round(
            (assessmentScore / total) * 100
        );


    /* =========================================
       SAVE ASSESSMENT HISTORY
    ========================================= */

    let results = [];

    try {

        results =
            JSON.parse(
                localStorage.getItem(
                    "pacificEducationAssessments"
                ) || "[]"
            );

        if (!Array.isArray(results)) {
            results = [];
        }

    } catch (error) {

        results = [];

    }


    results.push({

        assessment: type,

        score: assessmentScore,

        total: total,

        percentage: percentage,

        date:
            new Date().toISOString()

    });


    localStorage.setItem(
        "pacificEducationAssessments",
        JSON.stringify(results)
    );


    /* =========================================
       SAVE CURRENT ASSESSMENT RESULT
    ========================================= */

    if (type === "alphabet") {

        localStorage.setItem(
            "alphabetAssessment",
            percentage + "%"
        );

    }


    if (type === "phonics") {

        localStorage.setItem(
            "phonicsAssessment",
            percentage + "%"
        );

    }


    /* =========================================
       UPDATE LEARNING STATUS
    ========================================= */

    if (percentage >= 80) {

        localStorage.setItem(
            "learningStatus",
            "Excellent progress"
        );

    } else if (percentage >= 60) {

        localStorage.setItem(
            "learningStatus",
            "Good progress"
        );

    } else {

        localStorage.setItem(
            "learningStatus",
            "Additional practice recommended"
        );

    }


    /* =========================================
       DAY 60 → DAY 61
    ========================================= */

    if (
        type === "phonics" &&
        parseInt(
            localStorage.getItem(
                "currentDayNumber"
            ) || "1",
            10
        ) === 60
    ) {

        localStorage.setItem(
            "currentDayNumber",
            "61"
        );

        localStorage.setItem(
            "currentDay",
            "Day 61"
        );

    }


    /* =========================================
       REFRESH DASHBOARDS
    ========================================= */

    if (
        typeof refreshAllDashboards ===
        "function"
    ) {

        refreshAllDashboards();

    }


    /* =========================================
       DISPLAY RESULT
    ========================================= */

    showLesson(

        "🎯 Assessment Result",

        `
        <div class="activity">

            <h2>
                🎯 Assessment Complete
            </h2>

            <h3>
                Score:
                ${assessmentScore}/${total}
            </h3>

            <h3>
                Result:
                ${percentage}%
            </h3>

            ${
                percentage >= 80
                ?
                `
                <p class="success">
                    🟢 Excellent work!
                </p>
                `
                :
                percentage >= 60
                ?
                `
                <p>
                    🟡 Good effort.
                    Keep practising.
                </p>
                `
                :
                `
                <p class="error">
                    🔴 Additional practice recommended.
                </p>
                `
            }

            ${
                type === "phonics"
                ?
                `
                <p>
                    📚 You can now continue to
                    Day 61.
                </p>
                `
                :
                ""
            }

            <button
                type="button"
                onclick="startAssessment('${type}')">

                🔄 Try Again

            </button>

            <button
                type="button"
                onclick="startDailyLesson()">

                📚 Continue Learning

            </button>

        </div>
        `

    );

}


/* =========================================
   DAY 30 — ALPHABET
========================================= */

function startAlphabetAssessment() {

    startAssessment("alphabet");

}


/* =========================================
   DAY 60 — PHONICS
========================================= */

function startPhonicsAssessment() {

    startAssessment("phonics");

}
