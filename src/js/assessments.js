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

function speakAssessmentQuestion(question) {    if (typeof speakText === "function") speakText(String(question || ""));}function renderAudioControls(question) {    var safeQuestion = escapeHTML(String(question || ""));    return `<div class="activity-audio-controls"><button type="button" onclick="speakAssessmentQuestion(this.dataset.question)" data-question="${safeQuestion}">🔊 Listen to question</button><label> 🎤 Answer by voice <input id="peActivityAudio" type="file" accept="audio/*" capture></label></div>`;}function readFormalAssessmentAudio(done) {
    var input=document.getElementById("peActivityAudio"), file=input&&input.files&&input.files[0];
    if(!file){done("");return;}
    var reader=new FileReader();
    reader.onload=function(){done(String(reader.result||""));};
    reader.onerror=function(){done("");};
    reader.readAsDataURL(file);
}
function saveFormalAssessmentEvidence(type, questionNumber, questionText, selectedAnswer, audioDataUrl) {
    if(!audioDataUrl) return;
    var key="pacificEducationHomeSubmissions", items=[];
    try{items=JSON.parse(localStorage.getItem(key)||"[]");}catch(e){items=[];}
    var state=window.PacificEducationCore&&typeof window.PacificEducationCore.getState==="function"?window.PacificEducationCore.getState():{};
    var student=state&&state.student?state.student:{};
    var item={submissionId:"formal-audio-"+type+"-"+Date.now()+"-"+questionNumber,studentId:student.studentId||student.id||"pilot-student-demo",studentName:student.name||"Student",classLevel:localStorage.getItem("pacificEducationLevel")||"",subject:localStorage.getItem("pacificEducationSubject")||"",term:localStorage.getItem("pacificEducationTerm")||"",type:"formal-assessment-audio",activityType:type,day:type==="alphabet"?30:60,answers:[{questionNumber:questionNumber,question:questionText,answer:selectedAnswer||""}],audioDataUrl:audioDataUrl,imageDataUrl:"",status:"pending-special-education-review",mark:null,specialEducationMark:null,specialEducationComment:"",specialEducationReviewedAt:null,teacherGuidance:"",teacherAuthorizationComment:"",teacherAuthorizedAt:null,submittedAt:new Date().toISOString(),reviewedAt:null};
    items.push(item);
    localStorage.setItem(key,JSON.stringify(items.slice(-100)));
    var f=window.PacificEducationFirebase;
    if(f&&typeof f.submitHomeSubmission==="function")f.submitHomeSubmission(item).catch(function(e){console.warn("Formal assessment audio sync deferred:",e);});
}
function startAssessment(type) {
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
        readFormalAssessmentAudio(function(audioDataUrl) {
            saveFormalAssessmentEvidence(type, questionNumber + 1, question.question, answer, audioDataUrl);
            if (String(answer).trim().toLowerCase() === String(question.answer).trim().toLowerCase()) {
                assessmentScore++;
                if (typeof speakText === "function") speakText("Correct!");
            } else if (typeof speakText === "function") speakText("Lets keep practising.");
            questionNumber++;
            if (questionNumber < assessment.questions.length) showQuestion();
            else finishAssessment(type, assessmentScore, assessment.questions.length);
        });
    };
    showQuestion();
}

function recordFormalAssessmentProgress(type, percentage) {
    var recorder = window.PacificEducationDailyProgressRecorder;
    if (!recorder || typeof recorder.recordAssessed !== "function") return;
    var day = type === "alphabet" ? 30 : 60;
    recorder.recordAssessed({
        score: percentage,
        passingScore: 80,
        assessmentId: "formal-" + type + "-day-" + String(day),
        level: localStorage.getItem("pacificEducationLevel") || "Class 1",
        subjectId: localStorage.getItem("pacificEducationSubject") || "English",
        term: localStorage.getItem("pacificEducationTerm") || "Term 1",
        dayNumber: day,
        activityId: "formal-" + type,
        status: percentage >= 80 ? "assessed" : "practised",
        notes: "Formal " + type + " assessment evidence"
    });
}

function finishAssessment(type, assessmentScore, total) {
    const percentage = Math.round((assessmentScore / total) * 100);
    recordFormalAssessmentProgress(type, percentage);
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
    version: "1.3.0",
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

    function saveActivity(type, day, response, audioDataUrl, questionText, context) {
        const key = "pacificEducationActivityResponses";
        const data = JSON.parse(localStorage.getItem(key) || "[]");
        data.push({ type: type, day: Number(day) || 0, response: response, questionText: questionText || "", curriculumContext: context || {}, audioDataUrl: audioDataUrl || "", classLevel: localStorage.getItem("pacificEducationLevel") || "", subject: localStorage.getItem("pacificEducationSubject") || "", term: localStorage.getItem("pacificEducationTerm") || "", date: new Date().toISOString() });
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

    function queueAudioForSpecialEducation(type, day, response, audioDataUrl, questionText) {
        if (!audioDataUrl) return;
        var key = "pacificEducationHomeSubmissions", items = [];
        try { items = JSON.parse(localStorage.getItem(key) || "[]"); } catch (e) { items = []; }
        var state = window.PacificEducationCore && typeof window.PacificEducationCore.getState === "function" ? window.PacificEducationCore.getState() : {};
        var student = state && state.student ? state.student : {};
        var item = { submissionId: "audio-activity-" + Date.now(), studentId: student.studentId || student.id || "pilot-student-demo", studentName: student.name || "Student", classLevel: localStorage.getItem("pacificEducationLevel") || "", subject: localStorage.getItem("pacificEducationSubject") || "", term: localStorage.getItem("pacificEducationTerm") || "", type: "daily-activity-audio", activityType: type, day: Number(day) || 0, answers: [{ questionNumber: 1, question: questionText || "", answer: response || "" }], audioDataUrl: audioDataUrl, imageDataUrl: "", status: "pending-special-education-review", mark: null, specialEducationMark: null, specialEducationComment: "", specialEducationReviewedAt: null, teacherGuidance: "", teacherAuthorizationComment: "", teacherAuthorizedAt: null, submittedAt: new Date().toISOString(), reviewedAt: null };
        items.push(item);
        localStorage.setItem(key, JSON.stringify(items.slice(-100)));
        var f = window.PacificEducationFirebase;
        if (f && typeof f.submitHomeSubmission === "function") f.submitHomeSubmission(item).catch(function(error) { console.warn("Audio evidence remote sync deferred:", error); });
    }
    function result(type, message, audioDataUrl, day, response, questionText, context) {
        var recorder = window.PacificEducationDailyProgressRecorder;
        var hasVerifiedKey = !!(context && context.answerKey !== undefined && context.answerKey !== null && String(context.answerKey) !== "");
        var score = null;
        var reviewStatus = hasVerifiedKey ? "auto-scored" : "pending-teacher-review";
        if (hasVerifiedKey) {
            var expected = String(context.answerKey).trim().toLowerCase();
            score = String(response || "").trim().toLowerCase() === expected ? 100 : 0;
        }
        if (recorder && typeof recorder.record === "function") {
            try {
                recorder.record({
                    status: hasVerifiedKey ? "assessed" : "practised",
                    evidenceType: hasVerifiedKey ? "daily-assessment" : "daily-practice",
                    score: score,
                    passingScore: 60,
                    activityId: "daily-activity-" + type + "-day-" + String(day),
                    assessmentId: "daily-activity-" + type,
                    level: context && context.level,
                    subjectId: context && context.subjectId,
                    term: context && context.term,
                    dayNumber: Number(day) || 0,
                    notes: "Learner response recorded. Review status: " + reviewStatus + ". Question: " + String(questionText || "")
                });
            } catch (e) { console.warn("Activity progress recording deferred.", e); }
        }
        if (audioDataUrl) queueAudioForSpecialEducation(type, day, response, audioDataUrl, questionText);
        showLesson(labels[type] + " — Complete", '<div class="activity"><h3>Response submitted</h3><p>Your answer and the curriculum question have been recorded.</p><p><strong>Review:</strong> ' + escape(reviewStatus) + '</p><p>Teacher/Pacific Guardian review is required when no verified answer key is available.</p><button type="button" onclick="startDailyLesson()">📚 Continue Learning</button></div>');
    }

    function buildContext(lesson, day) {
        var activityContext = lesson && lesson.activity ? lesson.activity : (lesson || {});
        var stage = lesson && lesson.stageActivity ? lesson.stageActivity : {};
        return {
            level: lesson && lesson.level || localStorage.getItem("pacificEducationLevel") || "",
            subjectId: lesson && lesson.subjectId || localStorage.getItem("pacificEducationSubject") || "",
            term: lesson && lesson.term || localStorage.getItem("pacificEducationTerm") || "",
            dayNumber: Number(day) || 0,
            activityTitle: stage.activityTitle || activityContext.activityTitle || lesson && lesson.title || "",
            contentBasis: stage.contentBasis || activityContext.contentBasis || "concept-based-pilot-prototype",
            responseMode: "text-or-audio",
            questionText: stage.questionText || activityContext.questionText || activityContext.learnerTask || activityContext.description || "Complete today's learning activity.",
            audioText: stage.audioText || activityContext.audioText || stage.questionText || activityContext.questionText || "",
            answerKey: stage.answerKey !== undefined ? stage.answerKey : activityContext.answerKey,
            indicatorId: stage.indicatorId || activityContext.indicatorId || null,
            stageType: lesson && lesson.stageType || stage.stageType || null
        };
    }

    function render(type, day, lesson) {
        const curriculumContext = buildContext(lesson, day);
        const prompt = curriculumContext.questionText;
        const audioPrompt = curriculumContext.audioText || prompt;
        const title = (lesson && lesson.title ? lesson.title : "Daily Activity") + " — " + labels[type];
        const audioControls = renderAudioControls(audioPrompt);
        const dataQuestion = escape(prompt).replace(/"/g, "&quot;");

        if (type === "multiple_choice") {
            showLesson(title, '<div class="activity"><p>' + escape(prompt) + '</p>' + audioControls + '<p>Choose your answer and submit it for review.</p><input id="peWrittenAnswer" data-question-text="' + dataQuestion + '" placeholder="Type your selected answer"><button type="button" onclick="window.PacificEducationActivity.submitField(\'multiple_choice\',' + Number(day) + ',\'peWrittenAnswer\')">Submit Answer</button></div>');
            return;
        }
        if (type === "true_false") {
            showLesson(title, '<div class="activity"><p>' + escape(prompt) + '</p>' + audioControls + '<button type="button" onclick="window.PacificEducationActivity.answer(\'true_false\',' + Number(day) + ',\'True\')">True</button><button type="button" onclick="window.PacificEducationActivity.answer(\'true_false\',' + Number(day) + ',\'False\')">False</button></div>');
            return;
        }
        if (type === "matching") {
            showLesson(title, '<div class="activity"><p>' + escape(prompt) + '</p>' + audioControls + '<input id="peMatchAnswer" data-question-text="' + dataQuestion + '" placeholder="Enter your matching answer"><button type="button" onclick="window.PacificEducationActivity.submitField(\'matching\',' + Number(day) + ',\'peMatchAnswer\')">Submit Match</button></div>');
            return;
        }
        const rows = type === "short_answer" ? 3 : 8;
        const instruction = type === "short_answer" ? "Write a short answer." : "Write a detailed answer with an explanation or example.";
        showLesson(title, '<div class="activity"><p>' + escape(prompt) + '</p>' + audioControls + '<p>' + instruction + '</p><textarea id="peWrittenAnswer" data-question-text="' + dataQuestion + '" rows="' + rows + '" maxlength="' + (type === "short_answer" ? 500 : 2000) + '"></textarea><button type="button" onclick="window.PacificEducationActivity.submitField(\'' + type + '\',' + Number(day) + ',\'peWrittenAnswer\')">Submit Answer</button></div>');
    },
        answer: function(type, day, response) {
            var lesson = window.PacificEducationCurrentLesson || {};
            var curriculumContext = buildContext(lesson, day);
            readAudioFile(function(audioDataUrl) {
                saveActivity(type, day, response, audioDataUrl, curriculumContext.questionText, curriculumContext);
                result(type, "Response submitted", audioDataUrl, day, response, curriculumContext.questionText, curriculumContext);
            });
        }==================================
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

function speakAssessmentQuestion(question) {    if (typeof speakText === "function") speakText(String(question || ""));}function renderAudioControls(question) {    var safeQuestion = escapeHTML(String(question || ""));    return `<div class="activity-audio-controls"><button type="button" onclick="speakAssessmentQuestion(this.dataset.question)" data-question="${safeQuestion}">🔊 Listen to question</button><label> 🎤 Answer by voice <input id="peActivityAudio" type="file" accept="audio/*" capture></label></div>`;}function readFormalAssessmentAudio(done) {
    var input=document.getElementById("peActivityAudio"), file=input&&input.files&&input.files[0];
    if(!file){done("");return;}
    var reader=new FileReader();
    reader.onload=function(){done(String(reader.result||""));};
    reader.onerror=function(){done("");};
    reader.readAsDataURL(file);
}
function saveFormalAssessmentEvidence(type, questionNumber, questionText, selectedAnswer, audioDataUrl) {
    if(!audioDataUrl) return;
    var key="pacificEducationHomeSubmissions", items=[];
    try{items=JSON.parse(localStorage.getItem(key)||"[]");}catch(e){items=[];}
    var state=window.PacificEducationCore&&typeof window.PacificEducationCore.getState==="function"?window.PacificEducationCore.getState():{};
    var student=state&&state.student?state.student:{};
    var item={submissionId:"formal-audio-"+type+"-"+Date.now()+"-"+questionNumber,studentId:student.studentId||student.id||"pilot-student-demo",studentName:student.name||"Student",classLevel:localStorage.getItem("pacificEducationLevel")||"",subject:localStorage.getItem("pacificEducationSubject")||"",term:localStorage.getItem("pacificEducationTerm")||"",type:"formal-assessment-audio",activityType:type,day:type==="alphabet"?30:60,answers:[{questionNumber:questionNumber,question:questionText,answer:selectedAnswer||""}],audioDataUrl:audioDataUrl,imageDataUrl:"",status:"pending-special-education-review",mark:null,specialEducationMark:null,specialEducationComment:"",specialEducationReviewedAt:null,teacherGuidance:"",teacherAuthorizationComment:"",teacherAuthorizedAt:null,submittedAt:new Date().toISOString(),reviewedAt:null};
    items.push(item);
    localStorage.setItem(key,JSON.stringify(items.slice(-100)));
    var f=window.PacificEducationFirebase;
    if(f&&typeof f.submitHomeSubmission==="function")f.submitHomeSubmission(item).catch(function(e){console.warn("Formal assessment audio sync deferred:",e);});
}
function startAssessment(type) {
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
        readFormalAssessmentAudio(function(audioDataUrl) {
            saveFormalAssessmentEvidence(type, questionNumber + 1, question.question, answer, audioDataUrl);
            if (String(answer).trim().toLowerCase() === String(question.answer).trim().toLowerCase()) {
                assessmentScore++;
                if (typeof speakText === "function") speakText("Correct!");
            } else if (typeof speakText === "function") speakText("Lets keep practising.");
            questionNumber++;
            if (questionNumber < assessment.questions.length) showQuestion();
            else finishAssessment(type, assessmentScore, assessment.questions.length);
        });
    };
    showQuestion();
}

function recordFormalAssessmentProgress(type, percentage) {
    var recorder = window.PacificEducationDailyProgressRecorder;
    if (!recorder || typeof recorder.recordAssessed !== "function") return;
    var day = type === "alphabet" ? 30 : 60;
    recorder.recordAssessed({
        score: percentage,
        passingScore: 80,
        assessmentId: "formal-" + type + "-day-" + String(day),
        level: localStorage.getItem("pacificEducationLevel") || "Class 1",
        subjectId: localStorage.getItem("pacificEducationSubject") || "English",
        term: localStorage.getItem("pacificEducationTerm") || "Term 1",
        dayNumber: day,
        activityId: "formal-" + type,
        status: percentage >= 80 ? "assessed" : "practised",
        notes: "Formal " + type + " assessment evidence"
    });
}

function finishAssessment(type, assessmentScore, total) {
    const percentage = Math.round((assessmentScore / total) * 100);
    recordFormalAssessmentProgress(type, percentage);
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
    version: "1.3.0",
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

    function saveActivity(type, day, response, audioDataUrl, questionText, context) {
        const key = "pacificEducationActivityResponses";
        const data = JSON.parse(localStorage.getItem(key) || "[]");
        data.push({ type: type, day: Number(day) || 0, response: response, questionText: questionText || "", curriculumContext: context || {}, audioDataUrl: audioDataUrl || "", classLevel: localStorage.getItem("pacificEducationLevel") || "", subject: localStorage.getItem("pacificEducationSubject") || "", term: localStorage.getItem("pacificEducationTerm") || "", date: new Date().toISOString() });
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

    function queueAudioForSpecialEducation(type, day, response, audioDataUrl, questionText) {
        if (!audioDataUrl) return;
        var key = "pacificEducationHomeSubmissions", items = [];
        try { items = JSON.parse(localStorage.getItem(key) || "[]"); } catch (e) { items = []; }
        var state = window.PacificEducationCore && typeof window.PacificEducationCore.getState === "function" ? window.PacificEducationCore.getState() : {};
        var student = state && state.student ? state.student : {};
        var item = { submissionId: "audio-activity-" + Date.now(), studentId: student.studentId || student.id || "pilot-student-demo", studentName: student.name || "Student", classLevel: localStorage.getItem("pacificEducationLevel") || "", subject: localStorage.getItem("pacificEducationSubject") || "", term: localStorage.getItem("pacificEducationTerm") || "", type: "daily-activity-audio", activityType: type, day: Number(day) || 0, answers: [{ questionNumber: 1, question: questionText || "", answer: response || "" }], audioDataUrl: audioDataUrl, imageDataUrl: "", status: "pending-special-education-review", mark: null, specialEducationMark: null, specialEducationComment: "", specialEducationReviewedAt: null, teacherGuidance: "", teacherAuthorizationComment: "", teacherAuthorizedAt: null, submittedAt: new Date().toISOString(), reviewedAt: null };
        items.push(item);
        localStorage.setItem(key, JSON.stringify(items.slice(-100)));
        var f = window.PacificEducationFirebase;
        if (f && typeof f.submitHomeSubmission === "function") f.submitHomeSubmission(item).catch(function(error) { console.warn("Audio evidence remote sync deferred:", error); });
    }
    function result(type, message, audioDataUrl, day, response, questionText, context) {
        var recorder = window.PacificEducationDailyProgressRecorder;
        var hasVerifiedKey = !!(context && context.answerKey !== undefined && context.answerKey !== null && String(context.answerKey) !== "");
        var score = null;
        var reviewStatus = hasVerifiedKey ? "auto-scored" : "pending-teacher-review";
        if (hasVerifiedKey) {
            var expected = String(context.answerKey).trim().toLowerCase();
            score = String(response || "").trim().toLowerCase() === expected ? 100 : 0;
        }
        if (recorder && typeof recorder.record === "function") {
            try {
                recorder.record({
                    status: hasVerifiedKey ? "assessed" : "practised",
                    evidenceType: hasVerifiedKey ? "daily-assessment" : "daily-practice",
                    score: score,
                    passingScore: 60,
                    activityId: "daily-activity-" + type + "-day-" + String(day),
                    assessmentId: "daily-activity-" + type,
                    level: context && context.level,
                    subjectId: context && context.subjectId,
                    term: context && context.term,
                    dayNumber: Number(day) || 0,
                    notes: "Learner response recorded. Review status: " + reviewStatus + ". Question: " + String(questionText || "")
                });
            } catch (e) { console.warn("Activity progress recording deferred.", e); }
        }
        if (audioDataUrl) queueAudioForSpecialEducation(type, day, response, audioDataUrl, questionText);
        showLesson(labels[type] + " — Complete", '<div class="activity"><h3>Response submitted</h3><p>Your answer and the curriculum question have been recorded.</p><p><strong>Review:</strong> ' + escape(reviewStatus) + '</p><p>Teacher/Pacific Guardian review is required when no verified answer key is available.</p><button type="button" onclick="startDailyLesson()">📚 Continue Learning</button></div>');
    }

    function buildContext(lesson, day) {
        var activityContext = lesson && lesson.activity ? lesson.activity : (lesson || {});
        var stage = lesson && lesson.stageActivity ? lesson.stageActivity : {};
        return {
            level: lesson && lesson.level || localStorage.getItem("pacificEducationLevel") || "",
            subjectId: lesson && lesson.subjectId || localStorage.getItem("pacificEducationSubject") || "",
            term: lesson && lesson.term || localStorage.getItem("pacificEducationTerm") || "",
            dayNumber: Number(day) || 0,
            activityTitle: stage.activityTitle || activityContext.activityTitle || lesson && lesson.title || "",
            contentBasis: stage.contentBasis || activityContext.contentBasis || "concept-based-pilot-prototype",
            responseMode: "text-or-audio",
            questionText: stage.questionText || activityContext.questionText || activityContext.learnerTask || activityContext.description || "Complete today's learning activity.",
            audioText: stage.audioText || activityContext.audioText || stage.questionText || activityContext.questionText || "",
            answerKey: stage.answerKey !== undefined ? stage.answerKey : activityContext.answerKey,
            indicatorId: stage.indicatorId || activityContext.indicatorId || null,
            stageType: lesson && lesson.stageType || stage.stageType || null
        };
    }

    function render(type, day, lesson) {
        const curriculumContext = buildContext(lesson, day);
        const prompt = curriculumContext.questionText;
        const audioPrompt = curriculumContext.audioText || prompt;
        const title = (lesson && lesson.title ? lesson.title : "Daily Activity") + " — " + labels[type];
        const audioControls = renderAudioControls(audioPrompt);
        const dataQuestion = escape(prompt).replace(/"/g, "&quot;");

        if (type === "multiple_choice") {
            showLesson(title, '<div class="activity"><p>' + escape(prompt) + '</p>' + audioControls + '<p>Choose your answer and submit it for review.</p><input id="peWrittenAnswer" data-question-text="' + dataQuestion + '" placeholder="Type your selected answer"><button type="button" onclick="window.PacificEducationActivity.submitField(\'multiple_choice\',' + Number(day) + ',\'peWrittenAnswer\')">Submit Answer</button></div>');
            return;
        }
        if (type === "true_false") {
            showLesson(title, '<div class="activity"><p>' + escape(prompt) + '</p>' + audioControls + '<button type="button" onclick="window.PacificEducationActivity.answer(\'true_false\',' + Number(day) + ',\'True\')">True</button><button type="button" onclick="window.PacificEducationActivity.answer(\'true_false\',' + Number(day) + ',\'False\')">False</button></div>');
            return;
        }
        if (type === "matching") {
            showLesson(title, '<div class="activity"><p>' + escape(prompt) + '</p>' + audioControls + '<input id="peMatchAnswer" data-question-text="' + dataQuestion + '" placeholder="Enter your matching answer"><button type="button" onclick="window.PacificEducationActivity.submitField(\'matching\',' + Number(day) + ',\'peMatchAnswer\')">Submit Match</button></div>');
            return;
        }
        const rows = type === "short_answer" ? 3 : 8;
        const instruction = type === "short_answer" ? "Write a short answer." : "Write a detailed answer with an explanation or example.";
        showLesson(title, '<div class="activity"><p>' + escape(prompt) + '</p>' + audioControls + '<p>' + instruction + '</p><textarea id="peWrittenAnswer" data-question-text="' + dataQuestion + '" rows="' + rows + '" maxlength="' + (type === "short_answer" ? 500 : 2000) + '"></textarea><button type="button" onclick="window.PacificEducationActivity.submitField(\'' + type + '\',' + Number(day) + ',\'peWrittenAnswer\')">Submit Answer</button></div>');
    }        submitField: function(type, day, id) {
            const field = document.getElementById(id);
            const value = field ? String(field.value || "").trim() : "";
            if (!value) { if (field) field.focus(); return; }
            var lesson = window.PacificEducationCurrentLesson || {};
            var curriculumContext = buildContext(lesson, day);
            var questionText = field.getAttribute("data-question-text") || curriculumContext.questionText;
            readAudioFile(function(audioDataUrl) {
                saveActivity(type, day, value, audioDataUrl, questionText, curriculumContext);
                result(type, "Answer submitted", audioDataUrl, day, value, questionText, curriculumContext);
            });
        }===================================
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

function speakAssessmentQuestion(question) {    if (typeof speakText === "function") speakText(String(question || ""));}function renderAudioControls(question) {    var safeQuestion = escapeHTML(String(question || ""));    return `<div class="activity-audio-controls"><button type="button" onclick="speakAssessmentQuestion(this.dataset.question)" data-question="${safeQuestion}">🔊 Listen to question</button><label> 🎤 Answer by voice <input id="peActivityAudio" type="file" accept="audio/*" capture></label></div>`;}function readFormalAssessmentAudio(done) {
    var input=document.getElementById("peActivityAudio"), file=input&&input.files&&input.files[0];
    if(!file){done("");return;}
    var reader=new FileReader();
    reader.onload=function(){done(String(reader.result||""));};
    reader.onerror=function(){done("");};
    reader.readAsDataURL(file);
}
function saveFormalAssessmentEvidence(type, questionNumber, questionText, selectedAnswer, audioDataUrl) {
    if(!audioDataUrl) return;
    var key="pacificEducationHomeSubmissions", items=[];
    try{items=JSON.parse(localStorage.getItem(key)||"[]");}catch(e){items=[];}
    var state=window.PacificEducationCore&&typeof window.PacificEducationCore.getState==="function"?window.PacificEducationCore.getState():{};
    var student=state&&state.student?state.student:{};
    var item={submissionId:"formal-audio-"+type+"-"+Date.now()+"-"+questionNumber,studentId:student.studentId||student.id||"pilot-student-demo",studentName:student.name||"Student",classLevel:localStorage.getItem("pacificEducationLevel")||"",subject:localStorage.getItem("pacificEducationSubject")||"",term:localStorage.getItem("pacificEducationTerm")||"",type:"formal-assessment-audio",activityType:type,day:type==="alphabet"?30:60,answers:[{questionNumber:questionNumber,question:questionText,answer:selectedAnswer||""}],audioDataUrl:audioDataUrl,imageDataUrl:"",status:"pending-special-education-review",mark:null,specialEducationMark:null,specialEducationComment:"",specialEducationReviewedAt:null,teacherGuidance:"",teacherAuthorizationComment:"",teacherAuthorizedAt:null,submittedAt:new Date().toISOString(),reviewedAt:null};
    items.push(item);
    localStorage.setItem(key,JSON.stringify(items.slice(-100)));
    var f=window.PacificEducationFirebase;
    if(f&&typeof f.submitHomeSubmission==="function")f.submitHomeSubmission(item).catch(function(e){console.warn("Formal assessment audio sync deferred:",e);});
}
function startAssessment(type) {
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
        readFormalAssessmentAudio(function(audioDataUrl) {
            saveFormalAssessmentEvidence(type, questionNumber + 1, question.question, answer, audioDataUrl);
            if (String(answer).trim().toLowerCase() === String(question.answer).trim().toLowerCase()) {
                assessmentScore++;
                if (typeof speakText === "function") speakText("Correct!");
            } else if (typeof speakText === "function") speakText("Lets keep practising.");
            questionNumber++;
            if (questionNumber < assessment.questions.length) showQuestion();
            else finishAssessment(type, assessmentScore, assessment.questions.length);
        });
    };
    showQuestion();
}

function recordFormalAssessmentProgress(type, percentage) {
    var recorder = window.PacificEducationDailyProgressRecorder;
    if (!recorder || typeof recorder.recordAssessed !== "function") return;
    var day = type === "alphabet" ? 30 : 60;
    recorder.recordAssessed({
        score: percentage,
        passingScore: 80,
        assessmentId: "formal-" + type + "-day-" + String(day),
        level: localStorage.getItem("pacificEducationLevel") || "Class 1",
        subjectId: localStorage.getItem("pacificEducationSubject") || "English",
        term: localStorage.getItem("pacificEducationTerm") || "Term 1",
        dayNumber: day,
        activityId: "formal-" + type,
        status: percentage >= 80 ? "assessed" : "practised",
        notes: "Formal " + type + " assessment evidence"
    });
}

function finishAssessment(type, assessmentScore, total) {
    const percentage = Math.round((assessmentScore / total) * 100);
    recordFormalAssessmentProgress(type, percentage);
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
    version: "1.3.0",
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

    function saveActivity(type, day, response, audioDataUrl, questionText, context) {
        const key = "pacificEducationActivityResponses";
        const data = JSON.parse(localStorage.getItem(key) || "[]");
        data.push({ type: type, day: Number(day) || 0, response: response, questionText: questionText || "", curriculumContext: context || {}, audioDataUrl: audioDataUrl || "", classLevel: localStorage.getItem("pacificEducationLevel") || "", subject: localStorage.getItem("pacificEducationSubject") || "", term: localStorage.getItem("pacificEducationTerm") || "", date: new Date().toISOString() });
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

    function queueAudioForSpecialEducation(type, day, response, audioDataUrl, questionText) {
        if (!audioDataUrl) return;
        var key = "pacificEducationHomeSubmissions", items = [];
        try { items = JSON.parse(localStorage.getItem(key) || "[]"); } catch (e) { items = []; }
        var state = window.PacificEducationCore && typeof window.PacificEducationCore.getState === "function" ? window.PacificEducationCore.getState() : {};
        var student = state && state.student ? state.student : {};
        var item = { submissionId: "audio-activity-" + Date.now(), studentId: student.studentId || student.id || "pilot-student-demo", studentName: student.name || "Student", classLevel: localStorage.getItem("pacificEducationLevel") || "", subject: localStorage.getItem("pacificEducationSubject") || "", term: localStorage.getItem("pacificEducationTerm") || "", type: "daily-activity-audio", activityType: type, day: Number(day) || 0, answers: [{ questionNumber: 1, question: questionText || "", answer: response || "" }], audioDataUrl: audioDataUrl, imageDataUrl: "", status: "pending-special-education-review", mark: null, specialEducationMark: null, specialEducationComment: "", specialEducationReviewedAt: null, teacherGuidance: "", teacherAuthorizationComment: "", teacherAuthorizedAt: null, submittedAt: new Date().toISOString(), reviewedAt: null };
        items.push(item);
        localStorage.setItem(key, JSON.stringify(items.slice(-100)));
        var f = window.PacificEducationFirebase;
        if (f && typeof f.submitHomeSubmission === "function") f.submitHomeSubmission(item).catch(function(error) { console.warn("Audio evidence remote sync deferred:", error); });
    }
    function result(type, message, audioDataUrl, day, response, questionText, context) {
        var recorder = window.PacificEducationDailyProgressRecorder;
        var hasVerifiedKey = !!(context && context.answerKey !== undefined && context.answerKey !== null && String(context.answerKey) !== "");
        var score = null;
        var reviewStatus = hasVerifiedKey ? "auto-scored" : "pending-teacher-review";
        if (hasVerifiedKey) {
            var expected = String(context.answerKey).trim().toLowerCase();
            score = String(response || "").trim().toLowerCase() === expected ? 100 : 0;
        }
        if (recorder && typeof recorder.record === "function") {
            try {
                recorder.record({
                    status: hasVerifiedKey ? "assessed" : "practised",
                    evidenceType: hasVerifiedKey ? "daily-assessment" : "daily-practice",
                    score: score,
                    passingScore: 60,
                    activityId: "daily-activity-" + type + "-day-" + String(day),
                    assessmentId: "daily-activity-" + type,
                    level: context && context.level,
                    subjectId: context && context.subjectId,
                    term: context && context.term,
                    dayNumber: Number(day) || 0,
                    notes: "Learner response recorded. Review status: " + reviewStatus + ". Question: " + String(questionText || "")
                });
            } catch (e) { console.warn("Activity progress recording deferred.", e); }
        }
        if (audioDataUrl) queueAudioForSpecialEducation(type, day, response, audioDataUrl, questionText);
        showLesson(labels[type] + " — Complete", '<div class="activity"><h3>Response submitted</h3><p>Your answer and the curriculum question have been recorded.</p><p><strong>Review:</strong> ' + escape(reviewStatus) + '</p><p>Teacher/Pacific Guardian review is required when no verified answer key is available.</p><button type="button" onclick="startDailyLesson()">📚 Continue Learning</button></div>');
    }

    function buildContext(lesson, day) {
        var activityContext = lesson && lesson.activity ? lesson.activity : (lesson || {});
        var stage = lesson && lesson.stageActivity ? lesson.stageActivity : {};
        return {
            level: lesson && lesson.level || localStorage.getItem("pacificEducationLevel") || "",
            subjectId: lesson && lesson.subjectId || localStorage.getItem("pacificEducationSubject") || "",
            term: lesson && lesson.term || localStorage.getItem("pacificEducationTerm") || "",
            dayNumber: Number(day) || 0,
            activityTitle: stage.activityTitle || activityContext.activityTitle || lesson && lesson.title || "",
            contentBasis: stage.contentBasis || activityContext.contentBasis || "concept-based-pilot-prototype",
            responseMode: "text-or-audio",
            questionText: stage.questionText || activityContext.questionText || activityContext.learnerTask || activityContext.description || "Complete today's learning activity.",
            audioText: stage.audioText || activityContext.audioText || stage.questionText || activityContext.questionText || "",
            answerKey: stage.answerKey !== undefined ? stage.answerKey : activityContext.answerKey,
            indicatorId: stage.indicatorId || activityContext.indicatorId || null,
            stageType: lesson && lesson.stageType || stage.stageType || null
        };
    }

    function render(type, day, lesson) {
        const curriculumContext = buildContext(lesson, day);
        const prompt = curriculumContext.questionText;
        const audioPrompt = curriculumContext.audioText || prompt;
        const title = (lesson && lesson.title ? lesson.title : "Daily Activity") + " — " + labels[type];
        const audioControls = renderAudioControls(audioPrompt);
        const dataQuestion = escape(prompt).replace(/"/g, "&quot;");

        if (type === "multiple_choice") {
            showLesson(title, '<div class="activity"><p>' + escape(prompt) + '</p>' + audioControls + '<p>Choose your answer and submit it for review.</p><input id="peWrittenAnswer" data-question-text="' + dataQuestion + '" placeholder="Type your selected answer"><button type="button" onclick="window.PacificEducationActivity.submitField(\'multiple_choice\',' + Number(day) + ',\'peWrittenAnswer\')">Submit Answer</button></div>');
            return;
        }
        if (type === "true_false") {
            showLesson(title, '<div class="activity"><p>' + escape(prompt) + '</p>' + audioControls + '<button type="button" onclick="window.PacificEducationActivity.answer(\'true_false\',' + Number(day) + ',\'True\')">True</button><button type="button" onclick="window.PacificEducationActivity.answer(\'true_false\',' + Number(day) + ',\'False\')">False</button></div>');
            return;
        }
        if (type === "matching") {
            showLesson(title, '<div class="activity"><p>' + escape(prompt) + '</p>' + audioControls + '<input id="peMatchAnswer" data-question-text="' + dataQuestion + '" placeholder="Enter your matching answer"><button type="button" onclick="window.PacificEducationActivity.submitField(\'matching\',' + Number(day) + ',\'peMatchAnswer\')">Submit Match</button></div>');
            return;
        }
        const rows = type === "short_answer" ? 3 : 8;
        const instruction = type === "short_answer" ? "Write a short answer." : "Write a detailed answer with an explanation or example.";
        showLesson(title, '<div class="activity"><p>' + escape(prompt) + '</p>' + audioControls + '<p>' + instruction + '</p><textarea id="peWrittenAnswer" data-question-text="' + dataQuestion + '" rows="' + rows + '" maxlength="' + (type === "short_answer" ? 500 : 2000) + '"></textarea><button type="button" onclick="window.PacificEducationActivity.submitField(\'' + type + '\',' + Number(day) + ',\'peWrittenAnswer\')">Submit Answer</button></div>');
    }        answer: function(type, day, response) {
            var lesson = window.PacificEducationCurrentLesson || {};
            var curriculumContext = buildContext(lesson, day);
            readAudioFile(function(audioDataUrl) {
                saveActivity(type, day, response, audioDataUrl, curriculumContext.questionText, curriculumContext);
                result(type, "Response submitted", audioDataUrl, day, response, curriculumContext.questionText, curriculumContext);
            });
        }==================================
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

function speakAssessmentQuestion(question) {    if (typeof speakText === "function") speakText(String(question || ""));}function renderAudioControls(question) {    var safeQuestion = escapeHTML(String(question || ""));    return `<div class="activity-audio-controls"><button type="button" onclick="speakAssessmentQuestion(this.dataset.question)" data-question="${safeQuestion}">🔊 Listen to question</button><label> 🎤 Answer by voice <input id="peActivityAudio" type="file" accept="audio/*" capture></label></div>`;}function readFormalAssessmentAudio(done) {
    var input=document.getElementById("peActivityAudio"), file=input&&input.files&&input.files[0];
    if(!file){done("");return;}
    var reader=new FileReader();
    reader.onload=function(){done(String(reader.result||""));};
    reader.onerror=function(){done("");};
    reader.readAsDataURL(file);
}
function saveFormalAssessmentEvidence(type, questionNumber, questionText, selectedAnswer, audioDataUrl) {
    if(!audioDataUrl) return;
    var key="pacificEducationHomeSubmissions", items=[];
    try{items=JSON.parse(localStorage.getItem(key)||"[]");}catch(e){items=[];}
    var state=window.PacificEducationCore&&typeof window.PacificEducationCore.getState==="function"?window.PacificEducationCore.getState():{};
    var student=state&&state.student?state.student:{};
    var item={submissionId:"formal-audio-"+type+"-"+Date.now()+"-"+questionNumber,studentId:student.studentId||student.id||"pilot-student-demo",studentName:student.name||"Student",classLevel:localStorage.getItem("pacificEducationLevel")||"",subject:localStorage.getItem("pacificEducationSubject")||"",term:localStorage.getItem("pacificEducationTerm")||"",type:"formal-assessment-audio",activityType:type,day:type==="alphabet"?30:60,answers:[{questionNumber:questionNumber,question:questionText,answer:selectedAnswer||""}],audioDataUrl:audioDataUrl,imageDataUrl:"",status:"pending-special-education-review",mark:null,specialEducationMark:null,specialEducationComment:"",specialEducationReviewedAt:null,teacherGuidance:"",teacherAuthorizationComment:"",teacherAuthorizedAt:null,submittedAt:new Date().toISOString(),reviewedAt:null};
    items.push(item);
    localStorage.setItem(key,JSON.stringify(items.slice(-100)));
    var f=window.PacificEducationFirebase;
    if(f&&typeof f.submitHomeSubmission==="function")f.submitHomeSubmission(item).catch(function(e){console.warn("Formal assessment audio sync deferred:",e);});
}
function startAssessment(type) {
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
        readFormalAssessmentAudio(function(audioDataUrl) {
            saveFormalAssessmentEvidence(type, questionNumber + 1, question.question, answer, audioDataUrl);
            if (String(answer).trim().toLowerCase() === String(question.answer).trim().toLowerCase()) {
                assessmentScore++;
                if (typeof speakText === "function") speakText("Correct!");
            } else if (typeof speakText === "function") speakText("Lets keep practising.");
            questionNumber++;
            if (questionNumber < assessment.questions.length) showQuestion();
            else finishAssessment(type, assessmentScore, assessment.questions.length);
        });
    };
    showQuestion();
}

function recordFormalAssessmentProgress(type, percentage) {
    var recorder = window.PacificEducationDailyProgressRecorder;
    if (!recorder || typeof recorder.recordAssessed !== "function") return;
    var day = type === "alphabet" ? 30 : 60;
    recorder.recordAssessed({
        score: percentage,
        passingScore: 80,
        assessmentId: "formal-" + type + "-day-" + String(day),
        level: localStorage.getItem("pacificEducationLevel") || "Class 1",
        subjectId: localStorage.getItem("pacificEducationSubject") || "English",
        term: localStorage.getItem("pacificEducationTerm") || "Term 1",
        dayNumber: day,
        activityId: "formal-" + type,
        status: percentage >= 80 ? "assessed" : "practised",
        notes: "Formal " + type + " assessment evidence"
    });
}

function finishAssessment(type, assessmentScore, total) {
    const percentage = Math.round((assessmentScore / total) * 100);
    recordFormalAssessmentProgress(type, percentage);
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
    version: "1.3.0",
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

    function saveActivity(type, day, response, audioDataUrl, questionText, context) {
        const key = "pacificEducationActivityResponses";
        const data = JSON.parse(localStorage.getItem(key) || "[]");
        data.push({ type: type, day: Number(day) || 0, response: response, questionText: questionText || "", curriculumContext: context || {}, audioDataUrl: audioDataUrl || "", classLevel: localStorage.getItem("pacificEducationLevel") || "", subject: localStorage.getItem("pacificEducationSubject") || "", term: localStorage.getItem("pacificEducationTerm") || "", date: new Date().toISOString() });
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

    function queueAudioForSpecialEducation(type, day, response, audioDataUrl, questionText) {
        if (!audioDataUrl) return;
        var key = "pacificEducationHomeSubmissions", items = [];
        try { items = JSON.parse(localStorage.getItem(key) || "[]"); } catch (e) { items = []; }
        var state = window.PacificEducationCore && typeof window.PacificEducationCore.getState === "function" ? window.PacificEducationCore.getState() : {};
        var student = state && state.student ? state.student : {};
        var item = { submissionId: "audio-activity-" + Date.now(), studentId: student.studentId || student.id || "pilot-student-demo", studentName: student.name || "Student", classLevel: localStorage.getItem("pacificEducationLevel") || "", subject: localStorage.getItem("pacificEducationSubject") || "", term: localStorage.getItem("pacificEducationTerm") || "", type: "daily-activity-audio", activityType: type, day: Number(day) || 0, answers: [{ questionNumber: 1, question: questionText || "", answer: response || "" }], audioDataUrl: audioDataUrl, imageDataUrl: "", status: "pending-special-education-review", mark: null, specialEducationMark: null, specialEducationComment: "", specialEducationReviewedAt: null, teacherGuidance: "", teacherAuthorizationComment: "", teacherAuthorizedAt: null, submittedAt: new Date().toISOString(), reviewedAt: null };
        items.push(item);
        localStorage.setItem(key, JSON.stringify(items.slice(-100)));
        var f = window.PacificEducationFirebase;
        if (f && typeof f.submitHomeSubmission === "function") f.submitHomeSubmission(item).catch(function(error) { console.warn("Audio evidence remote sync deferred:", error); });
    }
    function result(type, message, audioDataUrl, day, response, questionText, context) {
        var recorder = window.PacificEducationDailyProgressRecorder;
        var hasVerifiedKey = !!(context && context.answerKey !== undefined && context.answerKey !== null && String(context.answerKey) !== "");
        var score = null;
        var reviewStatus = hasVerifiedKey ? "auto-scored" : "pending-teacher-review";
        if (hasVerifiedKey) {
            var expected = String(context.answerKey).trim().toLowerCase();
            score = String(response || "").trim().toLowerCase() === expected ? 100 : 0;
        }
        if (recorder && typeof recorder.record === "function") {
            try {
                recorder.record({
                    status: hasVerifiedKey ? "assessed" : "practised",
                    evidenceType: hasVerifiedKey ? "daily-assessment" : "daily-practice",
                    score: score,
                    passingScore: 60,
                    activityId: "daily-activity-" + type + "-day-" + String(day),
                    assessmentId: "daily-activity-" + type,
                    level: context && context.level,
                    subjectId: context && context.subjectId,
                    term: context && context.term,
                    dayNumber: Number(day) || 0,
                    notes: "Learner response recorded. Review status: " + reviewStatus + ". Question: " + String(questionText || "")
                });
            } catch (e) { console.warn("Activity progress recording deferred.", e); }
        }
        if (audioDataUrl) queueAudioForSpecialEducation(type, day, response, audioDataUrl, questionText);
        showLesson(labels[type] + " — Complete", '<div class="activity"><h3>Response submitted</h3><p>Your answer and the curriculum question have been recorded.</p><p><strong>Review:</strong> ' + escape(reviewStatus) + '</p><p>Teacher/Pacific Guardian review is required when no verified answer key is available.</p><button type="button" onclick="startDailyLesson()">📚 Continue Learning</button></div>');
    }

    function buildContext(lesson, day) {
        var activityContext = lesson && lesson.activity ? lesson.activity : (lesson || {});
        var stage = lesson && lesson.stageActivity ? lesson.stageActivity : {};
        return {
            level: lesson && lesson.level || localStorage.getItem("pacificEducationLevel") || "",
            subjectId: lesson && lesson.subjectId || localStorage.getItem("pacificEducationSubject") || "",
            term: lesson && lesson.term || localStorage.getItem("pacificEducationTerm") || "",
            dayNumber: Number(day) || 0,
            activityTitle: stage.activityTitle || activityContext.activityTitle || lesson && lesson.title || "",
            contentBasis: stage.contentBasis || activityContext.contentBasis || "concept-based-pilot-prototype",
            responseMode: "text-or-audio",
            questionText: stage.questionText || activityContext.questionText || activityContext.learnerTask || activityContext.description || "Complete today's learning activity.",
            audioText: stage.audioText || activityContext.audioText || stage.questionText || activityContext.questionText || "",
            answerKey: stage.answerKey !== undefined ? stage.answerKey : activityContext.answerKey,
            indicatorId: stage.indicatorId || activityContext.indicatorId || null,
            stageType: lesson && lesson.stageType || stage.stageType || null
        };
    }

    function render(type, day, lesson) {
        const curriculumContext = buildContext(lesson, day);
        const prompt = curriculumContext.questionText;
        const audioPrompt = curriculumContext.audioText || prompt;
        const title = (lesson && lesson.title ? lesson.title : "Daily Activity") + " — " + labels[type];
        const audioControls = renderAudioControls(audioPrompt);
        const dataQuestion = escape(prompt).replace(/"/g, "&quot;");

        if (type === "multiple_choice") {
            showLesson(title, '<div class="activity"><p>' + escape(prompt) + '</p>' + audioControls + '<p>Choose your answer and submit it for review.</p><input id="peWrittenAnswer" data-question-text="' + dataQuestion + '" placeholder="Type your selected answer"><button type="button" onclick="window.PacificEducationActivity.submitField(\'multiple_choice\',' + Number(day) + ',\'peWrittenAnswer\')">Submit Answer</button></div>');
            return;
        }
        if (type === "true_false") {
            showLesson(title, '<div class="activity"><p>' + escape(prompt) + '</p>' + audioControls + '<button type="button" onclick="window.PacificEducationActivity.answer(\'true_false\',' + Number(day) + ',\'True\')">True</button><button type="button" onclick="window.PacificEducationActivity.answer(\'true_false\',' + Number(day) + ',\'False\')">False</button></div>');
            return;
        }
        if (type === "matching") {
            showLesson(title, '<div class="activity"><p>' + escape(prompt) + '</p>' + audioControls + '<input id="peMatchAnswer" data-question-text="' + dataQuestion + '" placeholder="Enter your matching answer"><button type="button" onclick="window.PacificEducationActivity.submitField(\'matching\',' + Number(day) + ',\'peMatchAnswer\')">Submit Match</button></div>');
            return;
        }
        const rows = type === "short_answer" ? 3 : 8;
        const instruction = type === "short_answer" ? "Write a short answer." : "Write a detailed answer with an explanation or example.";
        showLesson(title, '<div class="activity"><p>' + escape(prompt) + '</p>' + audioControls + '<p>' + instruction + '</p><textarea id="peWrittenAnswer" data-question-text="' + dataQuestion + '" rows="' + rows + '" maxlength="' + (type === "short_answer" ? 500 : 2000) + '"></textarea><button type="button" onclick="window.PacificEducationActivity.submitField(\'' + type + '\',' + Number(day) + ',\'peWrittenAnswer\')">Submit Answer</button></div>');
    }
