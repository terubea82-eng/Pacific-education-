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

function escapeHTML(value) { return String(value == null ? "" : value).replace(/[&<>"\']/g, function (ch) { return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","\'":"&#039;"}[ch]; }); }

function speakAssessmentQuestion(question) {    if (typeof speakText === "function") speakText(String(question || ""));}function renderAudioControls(question) {    var safeQuestion = escapeHTML(String(question || ""));    return `<div class="activity-audio-controls"><button type="button" onclick="speakAssessmentQuestion(this.dataset.question)" data-question="${safeQuestion}">🔊 Listen to question</button><label> 🎤 Answer by voice <input id="peActivityAudio" type="file" accept="audio/*" capture></label></div>`;}function readFormalAssessmentAudio(done) {
    var input=document.getElementById("peActivityAudio"), file=input&&input.files&&input.files[0];
    if(!file){done("");return;}
    var reader=new FileReader();
    reader.onload=function(){done(String(reader.result||""));};
    reader.onerror=function(){done("");};
    reader.readAsDataURL(file);
}
function getAssessmentClassId() { var r=window.PacificEducationTeacherClassRosterContext; return r&&typeof r.getClassId==="function"?String(r.getClassId()||"").trim():""; }
function saveFormalAssessmentEvidence(type, questionNumber, questionText, selectedAnswer, audioDataUrl) {
    if(!audioDataUrl) return;
    var classId=getAssessmentClassId();
    if(!classId) return;
    var key="pacificEducationHomeSubmissions", items=[];
    try{items=JSON.parse(localStorage.getItem(key)||"[]");}catch(e){items=[];}
    var state=window.PacificEducationCore&&typeof window.PacificEducationCore.getState==="function"?window.PacificEducationCore.getState():{};
    var student=state&&state.student?state.student:{};
    var item={submissionId:"formal-audio-"+type+"-"+Date.now()+"-"+questionNumber,studentId:student.studentId||student.id||"pilot-student-demo",studentName:student.name||"Student",classId:classId,classLevel:(function(){var rr=window.PacificEducationTeacherClassRosterContext;var cc=rr&&typeof rr.getClass==="function"?rr.getClass(getAssessmentClassId()):null;return cc&&cc.level?String(cc.level):"";})(),subject:localStorage.getItem("pacificEducationSubject")||"",term:localStorage.getItem("pacificEducationTerm")||"",type:"formal-assessment-audio",activityType:type,day:type==="alphabet"?30:60,answers:[{questionNumber:questionNumber,question:questionText,answer:selectedAnswer||""}],audioDataUrl:audioDataUrl,imageDataUrl:"",status:"pending-special-education-review",mark:null,specialEducationMark:null,specialEducationComment:"",specialEducationReviewedAt:null,teacherGuidance:"",teacherAuthorizationComment:"",teacherAuthorizedAt:null,submittedAt:new Date().toISOString(),reviewedAt:null};
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
        level: (function(){ var rr=window.PacificEducationTeacherClassRosterContext; var id=getAssessmentClassId(); var cc=rr&&typeof rr.getClass==="function"?rr.getClass(id):null; return cc&&cc.level?String(cc.level):""; })(),
        subjectId: localStorage.getItem("pacificEducationSubject") || "",
        term: localStorage.getItem("pacificEducationTerm") || "",
        dayNumber: day,
        activityId: "formal-" + type,
        status: percentage >= 80 ? "assessed" : "practised",
        notes: "Formal " + type + " assessment evidence"
    });
}

function finishAssessment(type, assessmentScore, total) {
    const classId = getAssessmentClassId();
    if (!classId) { console.warn("Pacific Education: assessment completion blocked because no Class Reference is selected."); return; }
    const percentage = Math.round((assessmentScore / total) * 100);
    recordFormalAssessmentProgress(type, percentage);
    const results = JSON.parse(localStorage.getItem("pacificEducationAssessments") || "[]");
    results.push({ assessment: type, score: assessmentScore, total: total, percentage: percentage, classId: classId, date: new Date().toISOString() });
    localStorage.setItem("pacificEducationAssessments", JSON.stringify(results));

    try {
        var firebaseService = window.PacificEducationFirebase;
        if (firebaseService && typeof firebaseService.saveProgress === "function") {
            firebaseService.saveProgress({
                progressId: "assessment-" + String(type) + "-" + String(Date.now()),
                classId: classId,
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
    version: "1.3.1",
    getAssessment: function(type) { return assessmentData[type] || null; },
    start: function(type) { return startAssessment(type); },
    startAlphabet: function() { return startAlphabetAssessment(); },
    startPhonics: function() { return startPhonicsAssessment(); }
});
