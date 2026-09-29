/* =========================================
   PACIFIC EDUCATION — ASSESSMENTS
========================================= */

const assessmentData = {
    alphabet: {
        title: "Day 30 — Alphabet Assessment",
        questions: [
            { question: "Which letter is this? A", options: ["A", "B", "C"], answer: "A" },
            { question: "Which letter comes after B?", options: ["A", "C", "D"], answer: "C" },
            { question: "Which word begins with A?", options: ["Apple", "Dog", "Sun"], answer: "Apple" }
        ]
    },
    phonics: {
        title: "Day 60 — Phonics Assessment",
        questions: [
            { question: "Which word begins with the /b/ sound?", options: ["Ball", "Cat", "Dog"], answer: "Ball" },
            { question: "Which word begins with the /m/ sound?", options: ["Sun", "Map", "Dog"], answer: "Map" },
            { question: "Blend /c/ /a/ /t/.", options: ["Cat", "Dog", "Sun"], answer: "Cat" }
        ]
    }
};

function speakAssessmentQuestion(question) {\n    if (typeof speakText === "function") speakText(String(question || ""));\n}\n\nfunction renderAudioControls(question) {\n    var safeQuestion = escapeHTML(String(question || ""));\n    return `<div class="activity-audio-controls"><button type="button" onclick="speakAssessmentQuestion(this.dataset.question)" data-question="${safeQuestion}">🔊 Listen to question</button><label> 🎤 Answer by voice <input id="peActivityAudio" type="file" accept="audio/*" capture></label></div>`;\n}\n\nfunction startAssessment(type) {
    const assessment = assessmentData[type];
    if (!assessment) { alert("Assessment not found."); return; }
    let questionNumber = 0;
    let assessmentScore = 0;

    function showQuestion() {
        const question = assessment.questions[questionNumber];
        window.currentAssessmentQuestion = question;
        const buttons = question.options.map(function(option) {
            return `<button type="button" onclick="answerAssessment(this.dataset.answer)" data-answer="${escapeHTML(option)}">${escapeHTML(option)}</button>`;
        }).join("");
        showLesson(assessment.title, `<div class="activity"><p>Question ${questionNumber + 1} of ${assessment.questions.length}</p><h3>${escapeHTML(question.question)}</h3>${renderAudioControls(question.question)}<div>${buttons}</div></div>`);
    }

    window.answerAssessment = function(answer) {
        const question = window.currentAssessmentQuestion;
        if (!question) return;
        if (String(answer).trim().toLowerCase() === String(question.answer).trim().toLowerCase()) {
            assessmentScore++;
            if (typeof speakText === "function") speakText("Correct!");
        } else if (typeof speakText === "function") speakText("Let's keep practising.");
        questionNumber++;
        if (questionNumber < assessment.questions.length) showQuestion();
        else finishAssessment(type, assessmentScore, assessment.questions.length);
    };
    showQuestion();
}

function finishAssessment(type, assessmentScore, total) {
    const percentage = Math.round((assessmentScore / total) * 100);
    const results = JSON.parse(localStorage.getItem("pacificEducationAssessments") || "[]");
    results.push({ assessment: type, score: assessmentScore, total: total, percentage: percentage, date: new Date().toISOString() });
    localStorage.setItem("pacificEducationAssessments", JSON.stringify(results));

    try {
        var firebaseService = window.PacificEducationFirebase;
        if (firebaseService && typeof firebaseService.saveProgress === "function") {
            firebaseService.saveProgress({
                progressId: "assessment-" + String(type) + "-" + String(Date.now()),
                activityId: "assessment-" + String(type),
                status: percentage >= 80 ? "passed" : "needs_practice",
                score: percentage
            }).catch(function(error) {
                console.warn("Firebase assessment sync deferred:", error);
            });
        }
    } catch (firebaseError) {
        console.warn("Firebase assessment sync unavailable:", firebaseError);
    }
    if (typeof refreshAllDashboards === "function") refreshAllDashboards();

    showLesson("🎯 Assessment Result", `<div class="activity"><h2>🎯 Assessment Complete</h2><h3>Score: ${assessmentScore}/${total}</h3><h3>Result: ${percentage}%</h3>${percentage >= 80 ? `<p class="success">🟢 Excellent work!</p>` : percentage >= 60 ? `<p>🟡 Good effort. Keep practising.</p>` : `<p class="error">🔴 Additional practice recommended.</p>`}<button type="button" onclick="startAssessment('${type}')">🔄 Try Again</button><button type="button" onclick="startDailyLesson()">📚 Return to Lesson</button></div>`);
}

function startAlphabetAssessment() { startAssessment("alphabet"); }
function startPhonicsAssessment() { startAssessment("phonics"); }

window.PacificEducationAssessments = Object.freeze({
    version: "1.2.0",
    getAssessment: function(type) { return assessmentData[type] || null; },
    start: function(type) { return startAssessment(type); },
    startAlphabet: function() { return startAlphabetAssessment(); },
    startPhonics: function() { return startPhonicsAssessment(); }
});

/* =========================================
   PACIFIC EDUCATION — LEARNER ACTIVITY TYPES
   Five interactive activity modes for the pilot:
   multiple choice, true/false, matching,
   short answer and long answer.
   ========================================= */
(function(window) {
    "use strict";

    const ACTIVITY_TYPES = [
        "multiple_choice",
        "true_false",
        "matching",
        "short_answer",
        "long_answer"
    ];

    const labels = {
        multiple_choice: "Multiple Choice",
        true_false: "True or False",
        matching: "Matching",
        short_answer: "Short Answer",
        long_answer: "Long Answer"
    };

    function escape(value) {
        if (typeof escapeHTML === "function") return escapeHTML(String(value));
        return String(value).replace(/[&<>\"']/g, function(ch) {
            return {"&":"&amp;","<":"&lt;",">":"&gt;", "\"":"&quot;", "'":"&#39;"}[ch];
        });
    }

    function saveActivity(type, day, response, audioDataUrl) {
        const key = "pacificEducationActivityResponses";
        const data = JSON.parse(localStorage.getItem(key) || "[]");
        data.push({ type: type, day: Number(day) || 0, response: response, audioDataUrl: audioDataUrl || "", date: new Date().toISOString() });
        localStorage.setItem(key, JSON.stringify(data.slice(-500)));

        const service = window.PacificEducationFirebase;
        if (service && typeof service.saveProgress === "function" && service.auth && service.auth.currentUser) {
            service.saveProgress({
                progressId: "activity-" + type + "-day-" + String(Number(day) || 0) + "-" + String(Date.now()),
                activityId: "activity-" + type + "-day-" + String(Number(day) || 0),
                status: "completed",
                score: null
            }).catch(function(error) { console.warn("Activity progress sync deferred:", error); });
        }
    }

    function readAudioFile(done) {
        var input = document.getElementById("peActivityAudio");
        var file = input && input.files && input.files[0];
        if (!file) { done(""); return; }
        var reader = new FileReader();
        reader.onload = function() { done(String(reader.result || "")); };
        reader.onerror = function() { done(""); };
        reader.readAsDataURL(file);
    }

    function result(type, message) {
        var score = null;
        var passingScore = 60;
        if (type === "multiple_choice") {
            score = message === "I can explain it" ? 100 : message === "I need more practice" ? 50 : 0;
        } else if (type === "true_false") {
            score = message === "True" ? 100 : 0;
        } else if (type === "matching") {
            score = message === "practice" ? 100 : 0;
        } else if (type === "short_answer") {
            score = message.length >= 20 ? 100 : message.length >= 8 ? 50 : 0;
        } else if (type === "long_answer") {
            score = message.length >= 80 ? 100 : message.length >= 30 ? 50 : 0;
        }
        if (score !== null) {
            var recorder = window.PacificEducationDailyProgressRecorder;
            if (recorder && typeof recorder.recordAssessed === "function") {
                recorder.recordAssessed({
                    score: score,
                    passingScore: passingScore,
                    assessmentId: "daily-activity-" + type,
                    notes: "Interactive pilot activity assessment"
                });
            }
        }
        showLesson(labels[type] + " — Complete", `<div class="activity"><h3>${escape(message)}</h3><p>Your activity response has been recorded on this device. Signed-in pilot users can also sync progress to the account service.</p><button type="button" onclick="startDailyLesson()">📚 Continue Learning</button></div>`);
    }

    function render(type, day, lesson) {
        const prompt = lesson && lesson.activity ? lesson.activity : "Complete today's learning activity.";
        const title = (lesson && lesson.title ? lesson.title : "Daily Activity") + " — " + labels[type];
        const audioControls = renderAudioControls(prompt);

        if (type === "multiple_choice") {
            const options = ["I can explain it", "I need more practice", "I am not sure"];
            showLesson(title, `<div class="activity"><p>${escape(prompt)}</p>${audioControls}<p>How well can you do this?</p>${options.map(function(o){return `<button type="button" onclick="window.PacificEducationActivity.answer('multiple_choice',${Number(day)},'${escape(o)}')">${escape(o)}</button>`;}).join("")}</div>`);
            return;
        }

        if (type === "true_false") {
            showLesson(title, `<div class="activity"><p>${escape(prompt)}</p>${audioControls}<p>True or False: I completed today's practice.</p><button type="button" onclick="window.PacificEducationActivity.answer('true_false',${Number(day)},'True')">True</button><button type="button" onclick="window.PacificEducationActivity.answer('true_false',${Number(day)},'False')">False</button></div>`);
            return;
        }

        if (type === "matching") {
            showLesson(title, `<div class="activity"><p>${escape(prompt)}</p>${audioControls}<p>Match the learning action to its purpose:</p><select id="peMatchAnswer"><option value="">Choose</option><option value="practice">Practice → build the skill</option><option value="review">Review → remember the skill</option></select><button type="button" onclick="window.PacificEducationActivity.submitField('matching',${Number(day)},'peMatchAnswer')">Submit Match</button></div>`);
            return;
        }

        const rows = type === "short_answer" ? 3 : 8;
        const instruction = type === "short_answer" ? "Write a short answer in one or two sentences." : "Write a detailed answer explaining what you learned, how you used it, and an example.";
        showLesson(title, `<div class="activity"><p>${escape(prompt)}</p>${audioControls}<p>${instruction}</p><textarea id="peWrittenAnswer" rows="${rows}" maxlength="${type === "short_answer" ? 500 : 2000}" placeholder="Write your answer here"></textarea><button type="button" onclick="window.PacificEducationActivity.submitField('${type}',${Number(day)},'peWrittenAnswer')">Submit Answer</button></div>`);
    }

    window.PacificEducationActivity = {
        version: "1.3.0",
        types: Object.freeze(ACTIVITY_TYPES.slice()),
        labels: Object.freeze(Object.assign({}, labels)),
        render: render,
        answer: function(type, day, response) {
            readAudioFile(function(audioDataUrl) { saveActivity(type, day, response, audioDataUrl); });
            result(type, "Activity submitted successfully.");
        },
        submitField: function(type, day, id) {
            const field = document.getElementById(id);
            const value = field ? String(field.value || "").trim() : "";
            if (!value) {
                if (field) field.focus();
                return;
            }
            readAudioFile(function(audioDataUrl) { saveActivity(type, day, value, audioDataUrl); });
            result(type, "Answer submitted successfully.");
        }
    };

    window.PacificEducationActivityTypes = Object.freeze(ACTIVITY_TYPES.slice());
})(window);
