/*
 * Pacific Education
 * Curriculum Term Selector
 * Version 1.0.0
 *
 * Connects selected term to the curriculum lesson layer and
 * the prototype teacher calendar.
 *
 * PROTOTYPE ONLY. Dates and curriculum coverage must be verified
 * against the applicable Fiji school calendar and official curriculum.
 */
(function(window) {
    "use strict";

    var VERSION = "1.1.0";
    var TERMS = ["Term 1", "Term 2", "Term 3"];

    function getTerm() {
        var value = window.localStorage.getItem("pacificEducationTerm");
        return TERMS.indexOf(value) !== -1 ? value : "Term 1";
    }

    function refresh() {
        if (window.PacificEducationCurriculumLessonRenderer &&
            typeof window.PacificEducationCurriculumLessonRenderer.refresh === "function") {
            return window.PacificEducationCurriculumLessonRenderer.refresh();
        }
        if (typeof window.displayDailyLesson === "function") {
            return window.displayDailyLesson();
        }
        return false;
    }

    function setTerm(term) {
        if (TERMS.indexOf(term) === -1) return false;

        window.localStorage.setItem("pacificEducationTerm", term);

        var calendar = window.PacificEducationTeacherCalendar;
        if (calendar && typeof calendar.getDayByNumber === "function") {
            var day = Number.parseInt(
                window.localStorage.getItem("currentDayNumber") || "1",
                10
            );
            if (!Number.isInteger(day) || day < 1 || day > 365) day = 1;
            calendar.getDayByNumber(day);
        }

        var status = document.getElementById("pacificEducationTermStatus");
        if (status) {
            status.textContent =
                "Selected: " + term + " (prototype term selection)";
        }

        refresh();
        return true;
    }

    function createUI() {
        var host = document.getElementById("pacificEducationTermSelector");
        if (!host) return false;

        host.innerHTML = "";

        var label = document.createElement("label");
        label.setAttribute("for", "pacificEducationTerm");
        label.textContent = "Choose school term";

        var select = document.createElement("select");
        select.id = "pacificEducationTerm";
        select.name = "pacificEducationTerm";
        select.setAttribute("aria-label", "School term");

        TERMS.forEach(function(term) {
            var option = document.createElement("option");
            option.value = term;
            option.textContent = term;
            select.appendChild(option);
        });

        select.value = getTerm();

        var status = document.createElement("p");
        status.id = "pacificEducationTermStatus";
        status.setAttribute("aria-live", "polite");
        status.textContent =
            "Selected: " + select.value + " (prototype term selection)";

        select.addEventListener("change", function() {
            setTerm(select.value);
        });

        host.appendChild(label);
        host.appendChild(document.createElement("br"));
        host.appendChild(select);
        host.appendChild(status);

        return true;
    }

    function getSelection() {
        return {
            level: window.localStorage.getItem("pacificEducationLevel") || "Class 1",
            subjectId: window.localStorage.getItem("pacificEducationSubject") || "English",
            term: getTerm(),
            prototype: true
        };
    }

    function initialise() {
        createUI();
        return getSelection();
    }

    window.PacificEducationTermSelector = Object.freeze({
        version: VERSION,
        terms: TERMS.slice(),
        getTerm: getTerm,
        setTerm: setTerm,
        getSelection: getSelection,
        createUI: createUI,
        initialise: initialise
    });

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialise);
    } else {
        initialise();
    }
})(window);
