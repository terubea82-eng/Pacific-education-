/*
 * Pacific Education
 * Revision & Examination Scheduler
 * Version 1.0.0
 *
 * Coordinates teacher-entered revision/exam dates with achievement
 * indicator distribution.
 *
 * PROTOTYPE ONLY. Official school calendars and examination rules
 * must be verified before production.
 */
(function(window) {
    "use strict";

    var VERSION = "1.1.0";

    function copy(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function calendar() {
        return window.PacificEducationTeacherCalendar || null;
    }

    function distribution() {
        return window.PacificEducationAchievementDistributionEngine || null;
    }

    function normaliseDay(day) {
        var value = Number.parseInt(day, 10);
        return Number.isInteger(value) && value >= 1 && value <= 365
            ? value
            : null;
    }

    function addRevisionDay(day, label) {
        var cal = calendar();
        var dayNumber = normaliseDay(day);

        if (!cal || typeof cal.addRevisionDate !== "function" || dayNumber === null) {
            return { success: false, error: "Teacher calendar or day unavailable" };
        }

        var result = typeof cal.addRevisionDay === "function" ? cal.addRevisionDay(dayNumber) : cal.addRevisionDate(dayNumber);
        return {
            success: true,
            dayNumber: dayNumber,
            result: copy(result),
            prototype: true
        };
    }

    function addExamDay(day, label, indicatorIds, studentId) {
        var dayNumber = normaliseDay(day);
        var ids = Array.isArray(indicatorIds) ? indicatorIds.filter(Boolean) : [];
        var bridge = window.PacificEducationCurriculumAssessmentBridge || null;

        if (dayNumber === null) {
            return { success: false, error: "Teacher calendar or day unavailable" };
        }
        if (!ids.length) {
            return { success: false, error: "Exam indicator IDs are required; exams must identify covered indicators." };
        }
        if (!bridge || typeof bridge.scheduleExam !== "function") {
            return { success: false, error: "Assessment coverage bridge unavailable" };
        }

        var eligibility = bridge.scheduleExam({
            indicatorIds: ids,
            studentId: studentId || null,
            date: label || null
        });
        if (!eligibility.scheduled) {
            return {
                success: false,
                error: eligibility.reason || "Exam blocked by curriculum coverage rules",
                eligibility: copy(eligibility),
                prototype: true
            };
        }

        var cal = calendar();
        if (!cal || typeof cal.addExamDate !== "function") {
            return { success: false, error: "Teacher calendar unavailable", eligibility: copy(eligibility) };
        }

        var result = typeof cal.addExamDay === "function" ? cal.addExamDay(dayNumber) : cal.addExamDate(dayNumber);
        return {
            success: true,
            dayNumber: dayNumber,
            indicatorIds: ids,
            eligibility: copy(eligibility),
            result: copy(result),
            prototype: true
        };
    }

    function getCalendarDay(day) {
        var cal = calendar();
        var dayNumber = normaliseDay(day);

        if (!cal || typeof cal.getDayByNumber !== "function" || dayNumber === null) {
            return null;
        }

        return copy(cal.getDayByNumber(dayNumber));
    }

    function redistributeRemaining(config) {
        var e = window.PacificEducationRemainingAchievementRedistributionEngine;
        if (!e || typeof e.redistribute !== "function") {
            return {
                success: false,
                error: "Remaining Achievement Redistribution Engine unavailable"
            };
        }
        return e.redistribute(config || {});
    }

    function buildRemainingPlan(config) {
        var e = window.PacificEducationRemainingAchievementRedistributionEngine;
        if (!e || typeof e.buildRemainingPlan !== "function") {
            return {
                success: false,
                error: "Remaining Achievement Redistribution Engine unavailable"
            };
        }
        return e.buildRemainingPlan(config || {});
    }

    function redistribute(filters) {
        filters = filters || {};

        var engine = distribution();
        if (!engine || typeof engine.distribute !== "function") {
            return {
                success: false,
                error: "Achievement Distribution Engine unavailable"
            };
        }

        /*
         * Rebuild the distribution after the current calendar has been
         * updated. Revision and exam days are therefore excluded by the
         * distribution engine when the calendar marks them accordingly.
         */
        var result = engine.distribute({
            level: filters.level,
            subjectId: filters.subjectId,
            term: filters.term,
            startDay: filters.startDay || 1,
            endDay: filters.endDay || 365
        });

        return {
            success: true,
            availableLearningDays: result.availableLearningDays,
            indicatorCount: result.indicatorCount,
            assignments: copy(result.assignments),
            prototype: true
        };
    }

    function buildDayPlan(filters) {
        filters = filters || {};

        var day = normaliseDay(filters.dayNumber || 1);
        if (day === null) day = 1;

        var calendarDay = getCalendarDay(day);
        var engine = distribution();

        var assignment = engine &&
            typeof engine.getAssignment === "function"
            ? engine.getAssignment({
                level: filters.level,
                subjectId: filters.subjectId,
                term: filters.term,
                dayNumber: day,
                startDay: filters.startDay || 1,
                endDay: filters.endDay || 365
            })
            : null;

        return {
            success: true,
            dayNumber: day,
            calendar: calendarDay,
            assignment: assignment,
            instructionalDay: !!assignment &&
                (!calendarDay ||
                 ["weekend", "holiday", "exam", "revision"].indexOf(
                     calendarDay.type
                 ) === -1),
            prototype: true
        };
    }

    function validate(filters) {
        var result = redistribute(filters || {});
        var errors = [];

        if (!result.success) {
            errors.push(result.error);
        }

        return {
            valid: errors.length === 0,
            errors: errors,
            assignmentCount: result.assignments
                ? result.assignments.length
                : 0,
            prototype: true
        };
    }

    window.PacificEducationRevisionExamScheduler =
        Object.freeze({
            name: "PacificEducationRevisionExamScheduler",
            version: VERSION,
            addRevisionDay: addRevisionDay,
            addExamDay: addExamDay,
            getCalendarDay: getCalendarDay,
            redistribute: redistribute,
            redistributeRemaining: redistributeRemaining,
            buildRemainingPlan: buildRemainingPlan,
            buildDayPlan: buildDayPlan,
            validate: validate
        });
})(window);
