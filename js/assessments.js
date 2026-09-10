/* =========================================
   PACIFIC EDUCATION — ASSESSMENTS
   VERSION 1.1.0
   Day 30 Alphabet Checkpoint
   Day 60 Phonics Checkpoint
   Day 60 Phonics Pass Mark: 80%
========================================= */


/* =========================================
   ASSESSMENT DATA
========================================= */

const assessmentData = {

    alphabet: {

        title: "Alphabet Assessment",

        day: 30,

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
                options: ["Apple", "Ball", "Cat"],
                answer: "Apple"
            }

        ]

    },


    phonics: {

        title: "Phonics Assessment",

        day: 60,

        questions: [

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

        ]

    }

};


/* =========================================
   SECURITY
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
   GET CURRENT LEARNING DAY
========================================= */

function getAssessmentCurrentDay() {

    let day = parseInt(
        localStorage.getItem(
            "currentDayNumber"
        ) || "1",
        10
    );

    if (
        isNaN(day) ||
        day < 1
    ) {

        day = 1;

    }

    if (day > 365) {

        day = 365;

    }

    return day;

}


/* =========================================
   CHECKPOINT VALIDATION
========================================= */

function canStartAssessment(type) {

    const assessment =
        assessmentData[type];

    if (!assessment) {

        return false;

    }

    const currentDay =
        getAssessmentCurrentDay();


    /*
       Assessment can only be started on
       its authorised curriculum day.
    */

    if (
        currentDay !== assessment.day
    ) {

        console.warn(
            "Assessment blocked.",
            assessment.title,
            "requires Day " + assessment.day +
            " but learner is on Day " +
            currentDay
        );

        showLesson(`

            <div class="activity">

                <h2>📚 Assessment Checkpoint</h2>

                <p>
                    This assessment is available on
                    <strong>Day ${assessment.day}</strong>.
                </p>

                <p>
                    The learner is currently on
                    <strong>Day ${currentDay}</strong>.
                </p>

                <p>
                    Continue the authorised daily
                    learning programme first.
                </p>

                <button
                    type="button"
                    onclick="startDailyLesson()"
                >
                    📚 Continue Learning
                </button>

            </div>

        `);

        return false;

    }

    return true;

}


/* =========================================
   START ASSESSMENT
========================================= */

function startAssessment(type) {

    const assessment =
        assessmentData[type];

    if (!assessment) {

        console.error(
            "Assessment not found:",
            type
        );

        return false;

    }


    /*
       Enforce the curriculum checkpoint
       before starting any assessment.
    */

    if (!canStartAssessment(type)) {

        return false;

    }


    window.currentAssessment = {

        type:
            type,

        questions:
            assessment.questions,

        currentQuestion:
            0,

        score:
            0

    };

    showAssessmentQuestion();

    return true;

}


/* =========================================
   SHOW QUESTION
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


    let html = `

        <div class="activity">

            <h2>📝 Assessment</h2>

            <h3>

                Question
                ${assessment.currentQuestion + 1}
                of
                ${assessment.questions.length}

            </h3>

            <p>
                ${escapeHTML(question.question)}
            </p>

    `;


    question.options.forEach(
        function (option) {

            html += `

                <button
                    type="button"
                    onclick="answerAssessment('${escapeHTML(option)}')"
                    style="display:block;margin:10px 0;"
                >

                    ${escapeHTML(option)}

                </button>

            `;

        }
    );


    html += `

        </div>

    `;


    if (
        typeof showLesson ===
        "function"
    ) {

        showLesson(html);

    } else {

        console.error(
            "Pacific Education assessment connection error: showLesson() is unavailable."
        );

    }

}


/* =========================================
   ANSWER QUESTION
========================================= */

function answerAssessment(answer) {

    const assessment =
        window.currentAssessment;

    if (!assessment) {

        console.warn(
            "No active assessment."
        );

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


    if (
        answer === question.answer
    ) {

        assessment.score++;

    }


    assessment.currentQuestion++;


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
   FINISH ASSESSMENT
========================================= */

function finishAssessment() {

    const assessment =
        window.currentAssessment;

    if (!assessment) {

        return;

    }


    const total =
        assessment.questions.length;


    const percentage =
        Math.round(
            (assessment.score / total) * 100
        );


    const passed =
        percentage >= 80;


    const today =
        new Date().toISOString();


    /* =========================================
       SAVE ASSESSMENT HISTORY
    ========================================= */

    let history = [];

    try {

        history = JSON.parse(
            localStorage.getItem(
                "pacificEducationAssessments"
            ) || "[]"
        );


        if (
            !Array.isArray(history)
        ) {

            history = [];

        }

    } catch (error) {

        history = [];

    }


    history.push({

        type:
            assessment.type,

        day:
            assessmentData[
                assessment.type
            ].day,

        score:
            assessment.score,

        total:
            total,

        percentage:
            percentage,

        passed:
            passed,

        date:
            today

    });


    localStorage.setItem(

        "pacificEducationAssessments",

        JSON.stringify(history)

    );


    /* =========================================
       SAVE CURRENT RESULT
    ========================================= */

    localStorage.setItem(

        assessment.type +
        "Assessment",

        percentage + "%"

    );


    /* =========================================
       GET CURRENT DAY
    ========================================= */

    const currentDay =
        getAssessmentCurrentDay();


    /* =========================================
       DAY 60 PHONICS CHECKPOINT
    ========================================= */

    if (

        assessment.type ===
        "phonics" &&

        currentDay === 60

    ) {


        if (passed) {


            /* ---------------------------------
               PASS → UNLOCK DAY 61
            --------------------------------- */

            localStorage.setItem(

                "phonicsAssessmentPassed",

                "true"

            );


            localStorage.setItem(

                "currentDayNumber",

                "61"

            );


            localStorage.setItem(

                "currentDay",

                "Day 61"

            );


            localStorage.setItem(

                "learningStatus",

                "Passed — Day 61 unlocked"

            );


        } else {


            /* ---------------------------------
               FAIL → REMAIN ON DAY 60
            --------------------------------- */

            localStorage.setItem(

                "phonicsAssessmentPassed",

                "false"

            );


            localStorage.setItem(

                "currentDayNumber",

                "60"

            );


            localStorage.setItem(

                "currentDay",

                "Day 60"

            );


            localStorage.setItem(

                "learningStatus",

                "Additional practice recommended"

            );

        }

    }


    /* =========================================
       GENERAL LEARNING STATUS
    ========================================= */

    if (
        assessment.type !==
        "phonics"
    ) {


        if (
            percentage >= 80
        ) {

            localStorage.setItem(

                "learningStatus",

                "Excellent progress"

            );


        } else if (
            percentage >= 60
        ) {

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
       RESULT SCREEN
    ========================================= */

    let resultMessage = "";


    if (
        assessment.type ===
        "phonics"
    ) {


        if (passed) {

            resultMessage = `

                <p>
                    🎉 <strong>Well done!</strong>
                </p>

                <p>
                    You scored
                    <strong>${percentage}%</strong>.
                </p>

                <p>
                    ✅ You passed the Day 60
                    Phonics Assessment.
                </p>

                <p>
                    🔓
                    <strong>
                        Day 61 is now unlocked.
                    </strong>
                </p>

            `;

        } else {

            resultMessage = `

                <p>
                    You scored
                    <strong>${percentage}%</strong>.
                </p>

                <p>
                    ❌ You need
                    <strong>80%</strong>
                    to pass.
                </p>

                <p>
                    📚 Stay on Day 60 and practise
                    your phonics before trying the
                    assessment again.
                </p>

            `;

        }


    } else {


        resultMessage = `

            <p>
                You scored
                <strong>${percentage}%</strong>.
            </p>

            <p>

                ${
                    passed

                    ? "🎉 Excellent progress!"

                    : "📚 Additional practice is recommended."

                }

            </p>

        `;

    }


    if (
        typeof showLesson ===
        "function"
    ) {

        showLesson(`

            <div class="activity">

                <h2>
                    📊 Assessment Result
                </h2>

                ${resultMessage}

                <button
                    type="button"
                    onclick="startDailyLesson()"
                >
                    📚 Continue Learning
                </button>

            </div>

        `);

    }


    window.currentAssessment =
        null;

}


/* =========================================
   PHONICS ASSESSMENT BUTTON
========================================= */

function startPhonicsAssessment() {

    return startAssessment(
        "phonics"
    );

}


/* =========================================
   ALPHABET ASSESSMENT BUTTON
========================================= */

function startAlphabetAssessment() {

    return startAssessment(
        "alphabet"
    );

}


/* =========================================
   PACIFIC EDUCATION ASSESSMENT API
========================================= */

window.PacificEducationAssessments =
    Object.freeze({

        version:
            "1.1.0",

        getAssessment:
            function (type) {

                return (
                    assessmentData[type] ||
                    null
                );

            },

        getCurrentDay:
            function () {

                return getAssessmentCurrentDay();

            },

        canStart:
            function (type) {

                return canStartAssessment(
                    type
                );

            },

        start:
            function (type) {

                return startAssessment(
                    type
                );

            },

        startAlphabet:
            function () {

                return startAlphabetAssessment();

            },

        startPhonics:
            function () {

                return startPhonicsAssessment();

            }

    });


/* =========================================
   END ASSESSMENT ENGINE
========================================= */
