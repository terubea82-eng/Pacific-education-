/* =========================================
   PACIFIC EDUCATION — ASSESSMENTS
   Day 60 Phonics Pass Mark: 80%
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
                question: "Which word begins with the /b/ sound?",
                options: ["Ball", "Cat", "Sun"],
                answer: "Ball"
            },
            {
                question: "Which word begins with the /m/ sound?",
                options: ["Map", "Dog", "Fish"],
                answer: "Map"
            },
            {
                question: "What word do these sounds make? /c/ /a/ /t/",
                options: ["Cat", "Dog", "Sun"],
                answer: "Cat"
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
   START ASSESSMENT
========================================= */

function startAssessment(type) {

    const assessment = assessmentData[type];

    if (!assessment) {
        console.error("Assessment not found:", type);
        return;
    }

    window.currentAssessment = {
        type: type,
        questions: assessment.questions,
        currentQuestion: 0,
        score: 0
    };

    showAssessmentQuestion();
}


/* =========================================
   SHOW QUESTION
========================================= */

function showAssessmentQuestion() {

    const assessment = window.currentAssessment;

    if (!assessment) return;

    const question =
        assessment.questions[assessment.currentQuestion];

    if (!question) {
        finishAssessment();
        return;
    }

    let html = `
        <div class="activity">

            <h2>📝 Assessment</h2>

            <h3>
                Question ${assessment.currentQuestion + 1}
                of ${assessment.questions.length}
            </h3>

            <p>
                ${escapeHTML(question.question)}
            </p>
    `;

    question.options.forEach(option => {

        html += `
            <button
                type="button"
                onclick="answerAssessment('${escapeHTML(option)}')"
                style="display:block;margin:10px 0;"
            >
                ${escapeHTML(option)}
            </button>
        `;
    });

    html += `</div>`;

    showLesson(html);
}


/* =========================================
   ANSWER QUESTION
========================================= */

function answerAssessment(answer) {

    const assessment = window.currentAssessment;

    if (!assessment) return;

    const question =
        assessment.questions[assessment.currentQuestion];

    if (answer === question.answer) {
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

    const assessment = window.currentAssessment;

    if (!assessment) return;

    const total = assessment.questions.length;

    const percentage = Math.round(
        (assessment.score / total) * 100
    );

    const passed = percentage >= 80;

    const today = new Date().toISOString();

    /* -----------------------------------------
       SAVE ASSESSMENT HISTORY
    ----------------------------------------- */

    let history = [];

    try {
        history = JSON.parse(
            localStorage.getItem(
                "pacificEducationAssessments"
            ) || "[]"
        );

        if (!Array.isArray(history)) {
            history = [];
        }

    } catch (error) {
        history = [];
    }

    history.push({
        type: assessment.type,
        day: assessmentData[assessment.type].day,
        score: assessment.score,
        total: total,
        percentage: percentage,
        passed: passed,
        date: today
    });

    localStorage.setItem(
        "pacificEducationAssessments",
        JSON.stringify(history)
    );


    /* -----------------------------------------
       SAVE CURRENT RESULT
    ----------------------------------------- */

    localStorage.setItem(
        assessment.type + "Assessment",
        percentage + "%"
    );


    /* -----------------------------------------
       DAY 60 PHONICS CHECKPOINT
    ----------------------------------------- */

    const currentDay = parseInt(
        localStorage.getItem("currentDayNumber") || "1",
        10
    );


    if (
        assessment.type === "phonics" &&
        currentDay === 60
    ) {

        if (passed) {

            /* PASS → UNLOCK DAY 61 */

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

            /* FAIL → REMAIN ON DAY 60 */

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


    /* -----------------------------------------
       GENERAL LEARNING STATUS
    ----------------------------------------- */

    if (assessment.type !== "phonics") {

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
    }


    /* -----------------------------------------
       REFRESH DASHBOARDS
    ----------------------------------------- */

    if (typeof refreshAllDashboards === "function") {
        refreshAllDashboards();
    }


    /* -----------------------------------------
       RESULT SCREEN
    ----------------------------------------- */

    let resultMessage = "";

    if (assessment.type === "phonics") {

        if (passed) {

            resultMessage = `
                <p>🎉 <strong>Well done!</strong></p>

                <p>
                    You scored ${percentage}%.
                </p>

                <p>
                    ✅ You passed the Day 60 Phonics Assessment.
                </p>

                <p>
                    🔓 <strong>Day 61 is now unlocked.</strong>
                </p>
            `;

        } else {

            resultMessage = `
                <p>
                    You scored ${percentage}%.
                </p>

                <p>
                    ❌ You need <strong>80%</strong> to pass.
                </p>

                <p>
                    📚 Stay on Day 60 and practise your phonics
                    before trying the assessment again.
                </p>
            `;
        }

    } else {

        resultMessage = `
            <p>
                You scored ${percentage}%.
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


    showLesson(`
        <div class="activity">

            <h2>📊 Assessment Result</h2>

            ${resultMessage}

            <button
                type="button"
                onclick="startDailyLesson()"
            >
                📚 Continue Learning
            </button>

        </div>
    `);

    window.currentAssessment = null;
}


/* =========================================
   PHONICS ASSESSMENT BUTTON
========================================= */

function startPhonicsAssessment() {
    startAssessment("phonics");
}


/* =========================================
   ALPHABET ASSESSMENT BUTTON
========================================= */

function startAlphabetAssessment() {
    startAssessment("alphabet");
}
