/*
 * Pacific Education
 * Curriculum Subject Selector
 * Version 1.0.0
 *
 * Connects selected level + subject to the curriculum lesson layer.
 *
 * PROTOTYPE ONLY. Subject names are planning categories until
 * verified against the authoritative Fiji curriculum source.
 */
(function(window) {
    "use strict";

    var VERSION = "1.0.0";

    var SUBJECTS = [
        { id: "English", name: "English" },
        { id: "Mathematics", name: "Mathematics" },
        { id: "Science", name: "Science" },
        { id: "Social Science", name: "Social Science" },
        { id: "Health & Physical Education", name: "Health & Physical Education" },
        { id: "Arts", name: "Arts" },
        { id: "Technology", name: "Technology" },
        { id: "Other", name: "Other / Integrated Learning" }
    ];

    function getSubject() {
        var value = window.localStorage.getItem("pacificEducationSubject");
        return SUBJECTS.some(function(item) { return item.id === value; })
            ? value
            : "English";
    }

    function getLevel() {
        if (window.PacificEducationLevelSelector &&
            typeof window.PacificEducationLevelSelector.getLevel === "function") {
            return window.PacificEducationLevelSelector.getLevel();
        }
        return window.localStorage.getItem("pacificEducationLevel") || "Class 1";
    }

    function refreshLesson() {
        if (window.PacificEducationCurriculumLessonRenderer &&
            typeof window.PacificEducationCurriculumLessonRenderer.refresh === "function") {
            return window.PacificEducationCurriculumLessonRenderer.refresh();
        }
        if (typeof window.displayDailyLesson === "function") {
            return window.displayDailyLesson();
        }
        return false;
    }

    function setSubject(subjectId) {
        var valid = SUBJECTS.some(function(item) { return item.id === subjectId; });
        if (!valid) return false;

        window.localStorage.setItem("pacificEducationSubject", subjectId);

        var status = document.getElementById("pacificEducationSubjectStatus");
        if (status) {
            status.textContent =
                "Selected: " + subjectId + " • " + getLevel() +
                " (prototype curriculum selection)";
        }

        refreshLesson();
        return true;
    }

    function createUI() {
        var host = document.getElementById("pacificEducationSubjectSelector");
        if (!host) return false;

        host.innerHTML = "";

        var label = document.createElement("label");
        label.setAttribute("for", "pacificEducationSubject");
        label.textContent = "Curriculum Subject";

        var select = document.createElement("select");
        select.id = "pacificEducationSubject";
        select.name = "pacificEducationSubject";
        select.setAttribute("aria-label", "Curriculum subject");

        SUBJECTS.forEach(function(subject) {
            var option = document.createElement("option");
            option.value = subject.id;
            option.textContent = subject.name;
            select.appendChild(option);
        });

        select.value = getSubject();

        var status = document.createElement("p");
        status.id = "pacificEducationSubjectStatus";
        status.setAttribute("aria-live", "polite");
        status.textContent =
            "Selected: " + select.value + " • " + getLevel() +
            " (prototype curriculum selection)";

        select.addEventListener("change", function() {
            setSubject(select.value);
        });

        host.appendChild(label);
        host.appendChild(document.createElement("br"));
        host.appendChild(select);
        host.appendChild(status);

        return true;
    }

    function getSelection() {
        return {
            level: getLevel(),
            subjectId: getSubject(),
            prototype: true
        };
    }

    function initialise() {
        createUI();
        return getSelection();
    }

    window.PacificEducationSubjectSelector = Object.freeze({
        version: VERSION,
        subjects: SUBJECTS.map(function(item) { return Object.assign({}, item); }),
        getSubject: getSubject,
        setSubject: setSubject,
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
