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

    var VERSION = "1.5.0";
    function getConfiguredTerms() {
        if (window.PacificEducationCountryConfig && typeof window.PacificEducationCountryConfig.getTerms === "function") return window.PacificEducationCountryConfig.getTerms();
        return ["Term 1", "Term 2", "Term 3"];
    }
    function getTerms() { return getConfiguredTerms(); }

    function getTerm() {
        var value = window.localStorage.getItem("pacificEducationTerm");
        var terms = getConfiguredTerms();
        return terms.indexOf(value) !== -1 ? value : terms[0];
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

    function getClassContext() {
        var roster = window.PacificEducationTeacherClassRosterContext;
        if (!roster || typeof roster.getClassId !== "function" || typeof roster.getClass !== "function") return null;
        var classId = String(roster.getClassId() || "").trim();
        if (!classId) return null;
        var currentClass = roster.getClass(classId);
        return currentClass ? { classId: classId, level: String(currentClass.level || "").trim() } : null;
    }
    function setTerm(term) {
        if (getConfiguredTerms().indexOf(term) === -1) return false;
        var context = getClassContext();
        if (!context) {
            var status = document.getElementById("pacificEducationTermStatus");
            if (status) status.textContent = "Select an existing Class Reference before selecting a term.";
            return false;
        }
        window.localStorage.setItem("pacificEducationTerm", term);
        document.dispatchEvent(new CustomEvent("pacificEducationSelectionChanged", {
            detail: { classId: context.classId, level: context.level || "Class 1", subjectId: window.localStorage.getItem("pacificEducationSubject") || "English", term: term, prototype: true }
        }));

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
                "Selected: " + term;
        }

        refresh();
        return true;
    }

    function syncUI(term) {
        var select = document.getElementById("pacificEducationTerm");
        if (select && getConfiguredTerms().indexOf(term) !== -1 && select.value !== term) {
            select.value = term;
            var status = document.getElementById("pacificEducationTermStatus");
            if (status) status.textContent = "Selected: " + term + " (prototype term selection)";
        }
    }

    document.addEventListener("pacificEducationSelectionChanged", function(event) {
        var detail = event && event.detail ? event.detail : {};
        if (detail.term) syncUI(detail.term);
        var level = window.localStorage.getItem("pacificEducationLevel") || "Class 1";
        var subject = window.localStorage.getItem("pacificEducationSubject") || "English";
        var levelStatus = document.getElementById("pacificEducationLevelStatus");
        var subjectStatus = document.getElementById("pacificEducationSubjectStatus");
        if (levelStatus) levelStatus.textContent = "Selected: " + level + " (prototype curriculum selection)";
        if (subjectStatus) subjectStatus.textContent = "Selected: " + subject + " • " + level + " (pilot — curriculum verification required)";
    });

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

        getConfiguredTerms().forEach(function(term) {
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
        var context = getClassContext();
        return {
            classId: context ? context.classId : null,
            level: context ? (context.level || "Class 1") : (window.localStorage.getItem("pacificEducationLevel") || "Class 1"),
            subjectId: window.localStorage.getItem("pacificEducationSubject") || "English",
            term: getTerm(),
            prototype: true
        };
    }

    document.addEventListener("pacificEducationClassChanged", function(event) {
        var detail = event && event.detail ? event.detail : {};
        var current = getClassContext();
        var status = document.getElementById("pacificEducationTermStatus");
        if (status && current) status.textContent = "Class Reference: " + current.classId + " • Selected: " + getTerm() + " • " + (current.level || "Level not set") + " (prototype term selection)";
    });
    document.addEventListener("pacificEducationCountryConfigChanged", function() { createUI(); });

    function initialise() {
        createUI();
        return getSelection();
    }

    window.PacificEducationTermSelector = Object.freeze({
        version: VERSION,
        terms: getConfiguredTerms(),
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
