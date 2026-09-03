/* =========================================
   PACIFIC EDUCATION — ASSESSMENTS
   DAY 30 + DAY 60
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
            },
            {
                question: "Which letter comes before D?",
                options: ["B", "C", "E"],
                answer: "C"
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
   HTML SAFETY
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
   ASSESSMENT DISPLAY
========================================= */

function displayAssessment(title, html) {

    document.body.innerHTML = `
        <main class="assessment-screen">

            <div class="activity">

                <h2>${escapeHTML(title)}</h2>

                ${html}

            </div>

        </main>
    `;

}


/* =========================================
   START ASSESSMENT
========================================= */

function startAssessment(type) {

    const assessment = assessmentData[type];

    if (!assessment) {

        alert("Assessment not found.");

        return;
    }

    let questionNumber = 0;

    let assessmentScore = 0;


    function showQuestion() {

        const question =
            assessment.questions[questionNumber];


        window.currentAssessmentQuestion = question;


        let buttons = "";

        question.options.forEach(function(option) {

            buttons += `
                <button
                    type="button"
                    style="display:block; width:100%; margin:10px 0; padding:14px; font-size:18px;"
                    onclick="answerAssessment('${escapeHTML(option)}')">

                    ${escapeHTML(option)}

                </button>
            `;

        });


        displayAssessment(

            assessment.title,

            `
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
            `

        );

    }


    window.answerAssessment = function(answer) {

        const question =
            window.currentAssessmentQuestion;


        if (!question) {

            return;
        }


        if (
            String(answer).trim().toLowerCase()
            ===
            String(question.answer).trim().toLowerCase()
        ) {

            assessmentScore++;


            if (typeof speakText === "function") {

                speakText("Correct!");

            }

        } else {

            if (typeof speakText === "function") {

                speakText("Let's keep practising.");

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


    const results =
        JSON.parse(
            localStorage.getItem(
                "pacificEducationAssessments"
            ) || "[]"
        );


    results.push({

        assessment: type,

        score: assessmentScore,

        total: total,

        percentage: percentage,

        date: new Date().toISOString()

    });


    localStorage.setItem(

        "pacificEducationAssessments",

        JSON.stringify(results)

    );

       /* DAY 60 — COMPLETE PHONICS ASSESSMENT */

    if (type === "phonics") {

        let currentDayNumber =
            parseInt(
                localStorage.getItem("currentDayNumber") || "1",
                10
            );

        if (currentDayNumber === 60) {

            currentDayNumber = 61;

            localStorage.setItem(
                "currentDayNumber",
                currentDayNumber.toString()
            );

            localStorage.setItem(
                "currentDay",
                "Day " + currentDayNumber
            );

        }

    }


    /* SAVE DASHBOARD RESULT */

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


    /* LEARNING STATUS */

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


    /* REFRESH DASHBOARDS */

    if (
        typeof refreshTeacherDashboard === "function"
    ) {

        refreshTeacherDashboard();

    }


    if (
        typeof refreshParentDashboard === "function"
    ) {

        refreshParentDashboard();

    }


    /* SHOW RESULT */

    displayAssessment(

        "🎯 Assessment Result",

        `
        <h3>
            Assessment Complete
        </h3>

        <h3>
            Score: ${assessmentScore}/${total}
        </h3>

        <h3>
            Result: ${percentage}%
        </h3>

        ${
            percentage >= 80

            ?

            `
            <p>
                🟢 Excellent work!
            </p>
            `

            :

            percentage >= 60

            ?

            `
            <p>
                🟡 Good effort. Keep practising.
            </p>
            `

            :

            `
            <p>
                🔴 Additional practice recommended.
            </p>
            `
        }


        <button
            type="button"
            onclick="startAssessment('${type}')">

            🔄 Try Again

        </button>

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
