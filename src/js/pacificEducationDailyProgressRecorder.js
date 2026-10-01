/*
 * Pacific Education — Daily Progress Recorder
 * Version 1.0.0
 * PROTOTYPE ONLY.
 *
 * Records lesson completion/evidence for the selected student and
 * curriculum indicator. Production persistence and authorization
 * must be server-side.
 */
(function(window, document) {
    "use strict";

    var VERSION = "1.1.0";

    function getStudentId() {
        var c = window.PacificEducationStudentCoverageContext;
        return c && typeof c.getStudentId === "function" ? c.getStudentId() : null;
    }

    function getConfig(input) {
        input = input || {};
        var level = input.level || "";
        var subjectId = input.subjectId || "";
        var term = input.term || "";
        var dayNumber = Number(input.dayNumber || 1);

        try {
            level = level || localStorage.getItem("pacificEducationLevel") || "Class 1";
            subjectId = subjectId || localStorage.getItem("pacificEducationSubject") || "English";
            term = term || localStorage.getItem("pacificEducationTerm") || "Term 1";
            dayNumber = Number(localStorage.getItem("pacificEducationCurrentDay") || dayNumber || 1);
        } catch (ignore) {}

        return {
            level: level,
            subjectId: subjectId,
            term: term,
            dayNumber: dayNumber,
            studentId: input.studentId || getStudentId()
        };
    }

    function generatePlan(config) {
        var bridge = window.PacificEducationCurriculumDailyLessonsBridge;
        if (!bridge || typeof bridge.generateDailyLesson !== "function") {
            return { success: false, error: "Curriculum Daily Lessons Bridge unavailable" };
        }
        return bridge.generateDailyLesson(config);
    }

    function record(input) {
        var config = getConfig(input);
        if (!config.studentId) {
            return {
                success: false,
                error: "Select a student before recording daily progress"
            };
        }

        var coverage = window.PacificEducationCurriculumCoverageEngine;
        if (!coverage || typeof coverage.record !== "function") {
            return { success: false, error: "Curriculum Coverage Engine unavailable" };
        }

        var plan = generatePlan(config);
        if (!plan.success) return plan;

        var indicators = plan.lesson.learningAreas || [];
        if (!indicators.length) {
            return {
                success: false,
                error: "No curriculum indicator is assigned to this daily plan"
            };
        }

        var records = [];
        var activityId = input.activityId || ("daily-"+String(config.dayNumber)+"-"+String(config.subjectId));
        var automaticStage = null;
        var assessmentPassed = true;
        var assessmentScore = Number(input.score);
        var passingScore = Number(input.passingScore);
        if (!Number.isFinite(passingScore)) passingScore = 60;
        if (input.evidenceType === "daily-lesson-completion") automaticStage = "teach";
        else if (input.evidenceType === "daily-practice") automaticStage = "independent-practice";
        else if (input.evidenceType === "daily-assessment") {
            automaticStage = "check-assessment";
            if (Number.isFinite(assessmentScore)) assessmentPassed = assessmentScore >= passingScore;
        }
        indicators.forEach(function(item) {
            var indicator = item.indicator || item;
            if (!indicator || !indicator.id) return;

            records.push(coverage.record({
                indicatorId: indicator.id,
                studentId: config.studentId,
                status: input.status || "taught",
                evidenceType: input.evidenceType || "daily-lesson",
                teacherConfirmed: input.teacherConfirmed === true,
                notes: input.notes || ("Daily lesson completed — Day " + config.dayNumber),
                date: input.date || new Date().toISOString().slice(0, 10)
            }));
            if (automaticStage) {
                records.push(coverage.record({
                    indicatorId: indicator.id,
                    studentId: config.studentId,
                    status: input.status || "taught",
                    evidenceType: "indicator-stage",
                    activityId: activityId,
                    level: config.level,
                    subjectId: config.subjectId,
                    term: config.term,
                    dayNumber: config.dayNumber,
                    stageType: automaticStage,
                    activityType: automaticStage,
                    assessmentId: input.assessmentId || null,
                    teacherConfirmed: input.teacherConfirmed === true,
                    notes: "Automatic stage evidence from " + String(input.evidenceType) + " — Day " + config.dayNumber + (Number.isFinite(assessmentScore) ? " — Score " + assessmentScore + "% / Pass " + passingScore + "%" : ""),
                    date: input.date || new Date().toISOString().slice(0, 10)
                }));
                if (input.evidenceType === "daily-assessment" && Number.isFinite(assessmentScore) && !assessmentPassed) {
                    records.push(coverage.record({
                        indicatorId: indicator.id,
                        studentId: config.studentId,
                        status: "practised",
                        evidenceType: "indicator-stage",
                        stageType: "remedial-extension",
                        activityType: "remedial-extension",
                        assessmentId: input.assessmentId || null,
                        teacherConfirmed: input.teacherConfirmed === true,
                        notes: "Automatic remedial trigger: score " + assessmentScore + "% below passing score " + passingScore + "%",
                        date: input.date || new Date().toISOString().slice(0, 10)
                    }));
                }
            }
        });

        document.dispatchEvent(new CustomEvent("pacificEducationDailyProgressRecorded", { detail: { studentId: config.studentId, dayNumber: config.dayNumber, activityId: activityId, subjectId: config.subjectId, term: config.term } }));
        document.dispatchEvent(new CustomEvent("pacificEducationCoverageRefresh"));
        try {
            var firebaseService = window.PacificEducationFirebase;
            if (firebaseService && typeof firebaseService.saveProgress === "function" && config.studentId) {
                firebaseService.saveProgress({
                    progressId: String(config.studentId) + "-day-" + String(config.dayNumber),
                    activityId: "daily-lesson-day-" + String(config.dayNumber),
                    status: input.status || "taught",
                    score: Number.isFinite(input.score) ? input.score : null
                }).catch(function(error) {
                    console.warn("Firebase progress sync deferred:", error);
                });
            }
        } catch (firebaseError) {
            console.warn("Firebase progress sync unavailable:", firebaseError);
        }

        return {
            success: true,
            status: "recorded",
            studentId: config.studentId,
            dayNumber: config.dayNumber,
            indicatorCount: records.length,
            records: records,
            assessment: input.evidenceType === "daily-assessment" ? {
                score: Number.isFinite(assessmentScore) ? assessmentScore : null,
                passingScore: passingScore,
                passed: Number.isFinite(assessmentScore) ? assessmentPassed : null,
                remedialTriggered: Number.isFinite(assessmentScore) ? !assessmentPassed : false
            } : null,
            productionEligible: false,
            prototype: true
        };
    }

    function completeDailyLesson(input) {
        input = input || {};
        input.status = input.status || "taught";
        input.evidenceType = input.evidenceType || "daily-lesson-completion";
        return record(input);
    }

    function recordPractised(input) {
        input = input || {};
        input.status = "practised";
        input.evidenceType = input.evidenceType || "daily-practice";
        return record(input);
    }

    function recordAssessed(input) {
        input = input || {};
        input.status = "assessed";
        input.evidenceType = input.evidenceType || "daily-assessment";
        return record(input);
    }

    function recordCovered(input) {
        input = input || {};
        input.status = "covered";
        input.teacherConfirmed = true;
        input.evidenceType = input.evidenceType || "teacher-confirmed-coverage";
        return record(input);
    }

    window.PacificEducationDailyProgressRecorder = Object.freeze({
        name: "PacificEducationDailyProgressRecorder",
        version: VERSION,
        getConfig: getConfig,
        generatePlan: generatePlan,
        record: record,
        completeDailyLesson: completeDailyLesson,
        recordPractised: recordPractised,
        recordAssessed: recordAssessed,
        recordCovered: recordCovered
    });
})(window, document);

/* Pilot integration loader: keeps the world clock automatic and read-only. */
(function(window, document) {
    'use strict';
    function loadWorldClock() {
        if (window.PacificEducationWorldClock || document.getElementById('pacificEducationWorldClockScript')) return;
        var script = document.createElement('script');
        script.id = 'pacificEducationWorldClockScript';
        script.src = 'js/pacificEducationWorldClock.js?v=1101';
        script.async = true;
        document.head.appendChild(script);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', loadWorldClock);
    else loadWorldClock();
})(window, document);

/* Pilot integration loader: align visible learning features to each registered user. */
(function(window, document) {
    'use strict';
    function loadIndividualAlignment() {
        if (window.PacificEducationIndividualUserAlignment || document.getElementById('pacificEducationIndividualUserAlignmentScript')) return;
        var script = document.createElement('script');
        script.id = 'pacificEducationIndividualUserAlignmentScript';
        script.src = 'js/pacificEducationIndividualUserAlignment.js?v=1000';
        script.async = false;
        document.head.appendChild(script);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', loadIndividualAlignment);
    else loadIndividualAlignment();
})(window, document);
