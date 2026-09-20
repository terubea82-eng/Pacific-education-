/*
 * Pacific Education — Daily Progress Flow
 * Version 1.0.0
 * PROTOTYPE ONLY.
 *
 * Connects lesson completion -> progress evidence -> next learning day.
 * Production progression must be server-authorized and persisted.
 */
(function(window, document) {
    "use strict";

    var VERSION = "1.0.0";
    var MIN_DAY = 1;
    var MAX_DAY = 365;
    var DAY_KEY = "pacificEducationCurrentDay";

    function getDay() {
        var day = 1;
        try {
            day = Number(localStorage.getItem(DAY_KEY) || 1);
        } catch (ignore) {}
        if (!Number.isFinite(day)) day = 1;
        return Math.min(MAX_DAY, Math.max(MIN_DAY, Math.floor(day)));
    }

    function setDay(day) {
        day = Math.min(MAX_DAY, Math.max(MIN_DAY, Math.floor(Number(day) || 1)));
        try {
            localStorage.setItem(DAY_KEY, String(day));
            localStorage.setItem("dailyLessonDay", String(day));
        } catch (ignore) {}

        var core = window.PacificEducationCore;
        if (core && typeof core.setLesson === "function") {
            core.setLesson({
                lessonId: "class1-day-" + day,
                day: day,
                subject: localStorage.getItem("pacificEducationSubject") || "English",
                title: "Pacific Education — Day " + day,
                concept: "Daily curriculum learning",
                status: "not_started"
            });
        }

        document.dispatchEvent(new CustomEvent("pacificEducationDayChanged", {
            detail: { dayNumber: day, prototype: true }
        }));

        if (typeof window.displayDailyLesson === "function") {
            window.displayDailyLesson();
        }

        return day;
    }

    function recordCurrentLesson(input) {
        var recorder = window.PacificEducationDailyProgressRecorder;
        if (!recorder || typeof recorder.completeDailyLesson !== "function") {
            return { success: false, error: "Daily Progress Recorder unavailable" };
        }

        input = input || {};
        input.dayNumber = getDay();

        return recorder.completeDailyLesson(input);
    }

    function advanceToNextDay() {
        var current = getDay();

        if (current >= MAX_DAY) {
            document.dispatchEvent(new CustomEvent("pacificEducationProgrammeComplete"));
            return {
                success: true,
                completed: true,
                dayNumber: current,
                nextDay: null,
                message: "The 365-day prototype programme has reached Day 365.",
                prototype: true
            };
        }

        var next = setDay(current + 1);
        return {
            success: true,
            completed: false,
            dayNumber: current,
            nextDay: next,
            message: "Advanced to Day " + next + ".",
            prototype: true
        };
    }

    function completeLessonAndAdvance(input) {
        var result = recordCurrentLesson(input);

        if (!result.success) return result;

        var progression = advanceToNextDay();

        document.dispatchEvent(new CustomEvent("pacificEducationDailyProgressAdvanced", {
            detail: {
                completedDay: result.dayNumber,
                nextDay: progression.nextDay,
                prototype: true
            }
        }));

        return {
            success: true,
            recorded: result,
            progression: progression,
            prototype: true
        };
    }

    function init() {
        setDay(getDay());
        var button = document.querySelector('#dailyLesson button[onclick="completeLesson()"]');

        if (button) {
            button.removeAttribute("onclick");
            button.addEventListener("click", function() {
                var result = completeLessonAndAdvance({});
                var status = document.getElementById("dailyLessonPractice");

                if (status) {
                    status.setAttribute("role", "status");
                    status.textContent = result.success ?
                        (result.progression && result.progression.nextDay ?
                            "Lesson recorded. Next learning day: Day " +
                            result.progression.nextDay + "." :
                            "Lesson recorded. Day 365 completed.") :
                        (result.error || "Lesson could not be recorded.");
                }
            });
        }
    }

    window.PacificEducationDailyProgressFlow = Object.freeze({
        name: "PacificEducationDailyProgressFlow",
        version: VERSION,
        getDay: getDay,
        setDay: setDay,
        recordCurrentLesson: recordCurrentLesson,
        advanceToNextDay: advanceToNextDay,
        completeLessonAndAdvance: completeLessonAndAdvance,
        init: init
    });

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})(window, document);
