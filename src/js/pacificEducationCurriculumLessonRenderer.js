/*
 * Pacific Education
 * Curriculum Lesson Renderer
 * Version 1.0.0
 *
 * PURPOSE
 * Connects the curriculum engine to the existing visible
 * Daily English Lesson screen.
 *
 * The existing dailyLessons.js remains the fallback lesson source.
 *
 * PROTOTYPE ONLY.
 */
(function(window) {
    "use strict";

    var VERSION = "1.1.0";
    var originalDisplay = null;
    var connected = false;

    function engine() {
        return window.PacificEducationDailyCurriculumEngine || null;
    }

    function bridge() {
        return window.PacificEducationCurriculumDailyLessonsBridge || null;
    }

    function getDay() {
        var daily = window.PacificEducationDailyLessons;

        if (daily && typeof daily.getCurrentCoreDay === "function") {
            return daily.getCurrentCoreDay();
        }

        var value = Number.parseInt(
            window.localStorage.getItem("currentDayNumber") || "1",
            10
        );

        return Number.isInteger(value) && value >= 1 && value <= 365
            ? value
            : 1;
    }

    function getLevel() {
        return window.localStorage.getItem("pacificEducationLevel") || "Class 1";
    }

    function getSubject() {
        return window.localStorage.getItem("pacificEducationSubject") || "English";
    }

    function getTerm() {
        return window.localStorage.getItem("pacificEducationTerm") || "Term 1";
    }

    function setText(id, value) {
        var element = document.getElementById(id);
        if (element) {
            element.textContent = value == null ? "" : String(value);
        }
    }

    function render(plan) {
        if (!plan || !plan.success || !plan.lesson) {
            return false;
        }

        var lesson = plan.lesson;
        var areas = Array.isArray(lesson.learningAreas)
            ? lesson.learningAreas
            : [];

        setText("dailyLessonDay", "Day " + lesson.dayNumber);
        setText(
            "dailyLessonTitle",
            lesson.title || ("Daily " + (lesson.subjectId || "Curriculum") + " Lesson")
        );

        var activityText = [];
        var practiceText = [];

        areas.forEach(function(area) {
            if (area.title) {
                activityText.push(area.title);
            }

            if (Array.isArray(area.activities)) {
                area.activities.forEach(function(activity) {
                    if (activity.instructions) {
                        activityText.push(activity.instructions);
                    }
                });
            }

            if (area.integration && Array.isArray(area.integration.integrated)) {
                area.integration.integrated.forEach(function(item) {
                    if (item.subjectId) {
                        activityText.push(
                            "Integration: " +
                            item.subjectId +
                            " — " +
                            (item.activitySuggestion || "")
                        );
                    }
                });
            }

            if (Array.isArray(area.assessments)) {
                area.assessments.forEach(function(assessment) {
                    if (assessment.title) {
                        practiceText.push(
                            "Assessment: " + assessment.title
                        );
                    }
                });
            }
        });

        if (!activityText.length) {
            activityText.push(
                "Complete today's curriculum-linked English activity."
            );
        }

        if (!practiceText.length) {
            practiceText.push(
                "Practise today's learning and explain what you learned to a teacher or parent."
            );
        }

        setText(
            "dailyLessonActivity",
            activityText.join(" ")
        );

        setText(
            "dailyLessonPractice",
            practiceText.join(" ")
        );

        var container = document.getElementById("dailyLesson");
        if (container) {
            container.setAttribute(
                "data-curriculum-linked",
                "true"
            );
        }

        return true;
    }

    function generateAndRender() {
        ensureCurriculumData();

        var e = engine();

        if (!e || typeof e.generateDailyPlan !== "function") {
            return false;
        }

        var result = e.generateDailyPlan({
            level: getLevel(),
            subjectId: getSubject(),
            term: getTerm(),
            dayNumber: getDay()
        });

        return render({
            success: result.success,
            lesson: result.success
                ? {
                    dayNumber: result.dayNumber,
                    level: result.level,
                    subjectId: result.subjectId,
                    term: result.term,
                    title:
                        result.level +
                        " — " +
                        result.subjectId +
                        " — Day " +
                        result.dayNumber,
                    learningAreas: result.indicators,
                    activities: result.activities,
                    assessments: result.assessments,
                    calendar: result.calendar
                }
                : null
        });
    }

    function connect() {
        if (connected) {
            return true;
        }

        if (typeof window.displayDailyLesson !== "function") {
            return false;
        }

        originalDisplay = window.displayDailyLesson;

        window.displayDailyLesson = function() {
            /*
             * First let the existing lesson system render.
             * Then replace its visible content only when a valid
             * curriculum plan can be generated.
             */
            originalDisplay();

            var rendered = generateAndRender();

            if (!rendered) {
                var subject = getSubject();
                if (subject && subject !== "English") {
                    setText("dailyLessonTitle", "Daily " + subject + " Lesson — Prototype");
                    setText("dailyLessonActivity", "A subject-specific curriculum lesson is not yet available for this selection. Use the expanded pilot activity area for prototype testing; official curriculum evidence is required before production use.");
                    setText("dailyLessonPractice", "Do not treat this prototype content as an official Fiji curriculum prescription.");
                    var fallback = document.getElementById("dailyLesson");
                    if (fallback) fallback.setAttribute("data-curriculum-linked", "false");
                    return false;
                }
                return originalDisplay();
            }

            return true;
        };

        connected = true;
        return true;
    }

    function refresh() {
        if (!connected) {
            connect();
        }

        if (typeof window.displayDailyLesson === "function") {
            return window.displayDailyLesson();
        }

        return false;
    }

    function status() {
        return {
            version: VERSION,
            connected: connected,
            engineAvailable: !!engine(),
            dailyLessonsAvailable: !!window.PacificEducationDailyLessons,
            bridgeAvailable: !!bridge(),
            curriculumLinked: !!document.getElementById("dailyLesson") &&
                document.getElementById("dailyLesson").getAttribute(
                    "data-curriculum-linked"
                ) === "true",
            prototype: true
        };
    }

    function initialise() {
        connect();
        refresh();
        return status();
    }

    window.PacificEducationCurriculumLessonRenderer =
        Object.freeze({
            name: "PacificEducationCurriculumLessonRenderer",
            version: VERSION,
            connect: connect,
            refresh: refresh,
            generateAndRender: generateAndRender,
            status: status,
            initialise: initialise
        });

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initialise
        );
    } else {
        initialise();
    }

})(window);
