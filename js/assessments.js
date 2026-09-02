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
        },
        {
            question: "Which letter comes before D?",
            options: ["B", "C", "E"],
            answer: "C"
        }
    ]
},

phonics: {

    
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


        const buttons =
            question.options.map(function(option) {

                return `
                    <button
                        type="button"
                        onclick="answerAssessment(this.dataset.answer)"
                        data-answer="${escapeHTML(option)}">

                        ${escapeHTML(option)}

                    </button>
                `;

            }).join("");


        if (typeof showLesson === "function") {

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


    /* =========================================
       SAVE CURRENT RESULT FOR DASHBOARDS
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
       REFRESH TEACHER + PARENT DASHBOARDS
    ========================================= */

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


    /* =========================================
       SHOW RESULT
    ========================================= */

    showLesson(

        "🎯 Assessment Result",

        `
        <div class="activity">

            <h2>
                🎯 Assessment Complete
            </h2>

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
                <p class="success">
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
                <p class="error">
                    🔴 Additional practice recommended.
                </p>
                `
            }


            <button
                type="button"
                onclick="startAssessment('${type}')">

                🔄 Try Again

            </button>


            <button
                type="button"
                onclick="startDailyLesson()">

                📚 Return to Lesson

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

