/*
 * Pacific Education
 * Class / Form Level Selector
 * Version 1.0.0
 *
 * Connects the selected learning level to the curriculum
 * lesson renderer.
 *
 * PROTOTYPE ONLY. This does not authenticate or authorize users.
 */
(function(window) {
    "use strict";

    var VERSION = "1.0.0";

    var LEVELS = [
        "Class 1","Class 2","Class 3","Class 4","Class 5","Class 6",
        "Form 1","Form 2","Form 3","Form 4","Form 5","Form 6","Form 7"
    ];

    function getStoredLevel() {
        var value = window.localStorage.getItem("pacificEducationLevel");
        return LEVELS.indexOf(value) !== -1 ? value : "Class 1";
    }

    function setLevel(level) {
        if (LEVELS.indexOf(level) === -1) {
            return false;
        }

        window.localStorage.setItem("pacificEducationLevel", level);

        var status = document.getElementById("pacificEducationLevelStatus");
        if (status) {
            status.textContent = "Selected: " + level + " (prototype curriculum selection)";
        }

        if (window.PacificEducationCore &&
            typeof window.PacificEducationCore.setStudent === "function") {
            try {
                var state = typeof window.PacificEducationCore.getState === "function"
                    ? window.PacificEducationCore.getState()
                    : null;
                var student = state && state.student ? state.student : {};
                window.PacificEducationCore.setStudent({
                    studentId: student.studentId || "prototype-student",
                    name: student.name || "Prototype Student",
                    yearForm: level,
                    className: student.className || "Prototype Class"
                });
            } catch (error) {
                console.warn("Pacific Education: level could not sync to Core.", error);
            }
        }

        if (window.PacificEducationCurriculumLessonRenderer &&
            typeof window.PacificEducationCurriculumLessonRenderer.refresh === "function") {
            window.PacificEducationCurriculumLessonRenderer.refresh();
        } else if (typeof window.displayDailyLesson === "function") {
            window.displayDailyLesson();
        }

        return true;
    }

    function createUI() {
        var host = document.getElementById("pacificEducationLevelSelector");
        if (!host) {
            return false;
        }

        host.innerHTML = "";

        var label = document.createElement("label");
        label.setAttribute("for", "pacificEducationLevel");
        label.textContent = "Learning Level";

        var select = document.createElement("select");
        select.id = "pacificEducationLevel";
        select.name = "pacificEducationLevel";
        select.setAttribute("aria-label", "Learning level");

        LEVELS.forEach(function(level) {
            var option = document.createElement("option");
            option.value = level;
            option.textContent = level;
            select.appendChild(option);
        });

        select.value = getStoredLevel();

        var status = document.createElement("p");
        status.id = "pacificEducationLevelStatus";
        status.setAttribute("aria-live", "polite");
        status.textContent =
            "Selected: " + select.value +
            " (prototype curriculum selection)";

        select.addEventListener("change", function() {
            setLevel(select.value);
        });

        host.appendChild(label);
        host.appendChild(document.createElement("br"));
        host.appendChild(select);
        host.appendChild(status);

        return true;
    }

    function initialise() {
        createUI();
        return {
            version: VERSION,
            level: getStoredLevel(),
            levels: LEVELS.slice(),
            prototype: true
        };
    }

    window.PacificEducationLevelSelector = Object.freeze({
        version: VERSION,
        levels: LEVELS.slice(),
        getLevel: getStoredLevel,
        setLevel: setLevel,
        createUI: createUI,
        initialise: initialise
    });

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialise);
    } else {
        initialise();
    }
})(window);
