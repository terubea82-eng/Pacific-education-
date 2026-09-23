/*
 * Pacific Education — Daily Progress Flow
 * Version 1.1.0
 * PROTOTYPE ONLY.
 *
 * Single progression authority:
 * PacificEducationCore / protected dashboard flow.
 *
 * This module is a compatibility adapter only. It MUST NOT
 * install a second Complete Lesson click handler or maintain
 * an independent learner-progress day.
 */
(function(window, document) {
    "use strict";

    var VERSION = "1.1.0";
    var MIN_DAY = 1;
    var MAX_DAY = 365;

    function getCore() {
        return window.PacificEducationCore || null;
    }

    function getCoreDay() {
        var core = getCore();

        try {
            if (core && typeof core.getState === "function") {
                var state = core.getState();
                var day = Number(state && state.lesson && state.lesson.day);

                if (Number.isInteger(day) && day >= MIN_DAY && day <= MAX_DAY) {
                    return day;
                }
            }
        } catch (error) {
            console.warn("Pacific Education: Core day could not be read.", error);
        }

        try {
            var fallback = Number.parseInt(
                window.localStorage.getItem("currentDayNumber") || "1",
                10
            );

            if (Number.isInteger(fallback) && fallback >= MIN_DAY && fallback <= MAX_DAY) {
                return fallback;
            }
        } catch (ignore) {}

        return 1;
    }

    function syncCompatibilityDay(day) {
        try {
            window.localStorage.setItem("currentDayNumber", String(day));
            window.localStorage.setItem("currentDay", "Day " + day);
            window.localStorage.setItem("dailyLessonDay", String(day));
        } catch (ignore) {}
    }

    function getDay() {
        return getCoreDay();
    }

    function setDay(day) {
        var safeDay = Math.min(
            MAX_DAY,
            Math.max(MIN_DAY, Math.floor(Number(day) || MIN_DAY))
        );

        var core = getCore();

        if (!core || typeof core.setLesson !== "function") {
            return false;
        }

        var result = core.setLesson({
            lessonId: "class1-day-" + safeDay,
            day: safeDay,
            subject: "English",
            title: "Pacific Education — Day " + safeDay,
            concept: "Daily curriculum learning",
            status: "not_started"
        });

        if (result === false) {
            return false;
        }

        syncCompatibilityDay(safeDay);

        document.dispatchEvent(new CustomEvent(
            "pacificEducationDayChanged",
            { detail: { dayNumber: safeDay, prototype: true } }
        ));

        if (typeof window.displayDailyLesson === "function") {
            window.displayDailyLesson();
        }

        return safeDay;
    }

    function recordCurrentLesson(input) {
        var dashboards = window.PacificEducationDashboards;

        if (!dashboards || typeof dashboards.completeLesson !== "function") {
            return {
                success: false,
                error: "Protected dashboard progression API unavailable"
            };
        }

        return {
            success: !!dashboards.completeLesson(),
            dayNumber: getDay(),
            prototype: true,
            input: input || {}
        };
    }

    function advanceToNextDay() {
        var current = getDay();

        if (current >= MAX_DAY) {
            document.dispatchEvent(
                new CustomEvent("pacificEducationProgrammeComplete")
            );

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

        if (next === false) {
            return {
                success: false,
                completed: false,
                dayNumber: current,
                nextDay: null,
                message: "Protected Core did not accept the next learning day.",
                prototype: true
            };
        }

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
        /*
         * The protected dashboard completion flow already records the
         * current lesson and advances exactly once. Do not advance again.
         */
        var dashboards = window.PacificEducationDashboards;

        if (!dashboards || typeof dashboards.completeLesson !== "function") {
            return {
                success: false,
                error: "Protected dashboard progression API unavailable",
                prototype: true
            };
        }

        var completedDay = getDay();
        var success = !!dashboards.completeLesson();

        if (!success) {
            return {
                success: false,
                recorded: false,
                progression: {
                    dayNumber: completedDay,
                    nextDay: null
                },
                prototype: true
            };
        }

        var nextDay = getDay();

        document.dispatchEvent(
            new CustomEvent(
                "pacificEducationDailyProgressAdvanced",
                {
                    detail: {
                        completedDay: completedDay,
                        nextDay: nextDay === completedDay ? null : nextDay,
                        prototype: true
                    }
                }
            )
        );

        return {
            success: true,
            recorded: true,
            progression: {
                dayNumber: completedDay,
                nextDay: nextDay === completedDay ? null : nextDay
            },
            prototype: true,
            input: input || {}
        };
    }

    function init() {
        /*
         * IMPORTANT:
         * Do not attach another click handler to Complete Lesson.
         * dashboards.js owns that action and is the single progression path.
         */
        syncCompatibilityDay(getCoreDay());
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
