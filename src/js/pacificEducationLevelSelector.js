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

    var VERSION = "1.5.0";

    function getConfiguredLevels() {
        if (window.PacificEducationCountryConfig && typeof window.PacificEducationCountryConfig.getLevels === "function") {
            return window.PacificEducationCountryConfig.getLevels();
        }
        return ["Class 1","Class 2","Class 3","Class 4","Class 5","Class 6","Class 7","Class 8","Class 9","Class 10","Class 11","Class 12","Class 13"];
    }
    function getLevels() { return getConfiguredLevels(); }

    function getRoster() {
        return window.PacificEducationTeacherClassRosterContext &&
            typeof window.PacificEducationTeacherClassRosterContext.getClasses === "function"
            ? window.PacificEducationTeacherClassRosterContext : null;
    }
    function getSelectedClassId() {
        var roster = getRoster();
        return roster && typeof roster.getClassId === "function" ? String(roster.getClassId() || "").trim() : "";
    }
    function selectExistingClass(classId) {
        var roster = getRoster(), id = String(classId || "").trim();
        if (!roster || !id || typeof roster.getClass !== "function" || !roster.getClass(id) || typeof roster.setClassId !== "function") return false;
        roster.setClassId(id);
        var item = roster.getClass(id);
        if (item && item.level) window.localStorage.setItem("pacificEducationLevel", String(item.level));
        document.dispatchEvent(new CustomEvent("pacificEducationClassSelected", {detail:{classId:id,class:item,prototype:true}}));
        createUI();
        return true;
    }

    function getStoredLevel() {
        var value = window.localStorage.getItem("pacificEducationLevel");
        var levels = getConfiguredLevels();
        if (levels.indexOf(value) !== -1) return value;
        var legacy = {"Form 1":"Class 7","Form 2":"Class 8","Form 3":"Class 9","Form 4":"Class 10","Form 5":"Class 11","Form 6":"Class 12","Form 7":"Class 13"};
        if (legacy[value]) { window.localStorage.setItem("pacificEducationLevel", legacy[value]); return legacy[value]; }
        return "Class 1";
    }

    function setLevel(level) {
        if (getConfiguredLevels().indexOf(level) === -1) {
            return false;
        }

        var roster = window.PacificEducationTeacherClassRosterContext;
        if (roster && typeof roster.getClassId === "function" && typeof roster.getClass === "function") {
            var classId = roster.getClassId();
            if (classId) {
                var currentClass = roster.getClass(classId);
                if (!currentClass) return false;
                if (currentClass.level && String(currentClass.level) !== String(level)) {
                    var status = document.getElementById("pacificEducationLevelStatus");
                    if (status) status.textContent = "Level does not match selected Class Reference " + classId + ". Select the correct class first.";
                    return false;
                }
            }
        }

        window.localStorage.setItem("pacificEducationLevel", level);
        document.dispatchEvent(new CustomEvent("pacificEducationSelectionChanged", {
            detail: { level: level, prototype: true }
        }));

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
            if (window.PacificEducationExpandedSubjectActivityUI && typeof window.PacificEducationExpandedSubjectActivityUI.render === "function") window.PacificEducationExpandedSubjectActivityUI.render();
        } else if (typeof window.displayDailyLesson === "function") {
            window.displayDailyLesson();
        }

        return true;
    }

    function syncUI(level) {
        var select = document.getElementById("pacificEducationLevel");
        if (select && getConfiguredLevels().indexOf(level) !== -1 && select.value !== level) {
            select.value = level;
            var status = document.getElementById("pacificEducationLevelStatus");
            if (status) status.textContent = "Selected: " + level + " (prototype curriculum selection)";
        }
    }

    document.addEventListener("pacificEducationSelectionChanged", function(event) {
        var detail = event && event.detail ? event.detail : {};
        if (detail.level) syncUI(detail.level);
        var subjectStatus = document.getElementById("pacificEducationSubjectStatus");
        if (subjectStatus) {
            var subject = window.localStorage.getItem("pacificEducationSubject") || "English";
            subjectStatus.textContent = "Selected: " + subject + " • " + getStoredLevel() + " (pilot — curriculum verification required)";
        }
    });

    function createUI() {
        var host = document.getElementById("pacificEducationLevelSelector");
        if (!host) {
            return false;
        }

        host.innerHTML = "";

        var roster = getRoster();
        var classes = roster ? roster.getClasses() : {};
        var classIds = Object.keys(classes || {}).filter(function(id) { return classes[id] && String(id).trim(); }).sort();

        var classLabel = document.createElement("label");
        classLabel.setAttribute("for", "pacificEducationClassReference");
        classLabel.textContent = "🏫 Choose existing Class Reference";

        var classSelect = document.createElement("select");
        classSelect.id = "pacificEducationClassReference";
        classSelect.name = "pacificEducationClassReference";
        classSelect.setAttribute("aria-label", "Choose existing Class Reference");

        var placeholder = document.createElement("option");
        placeholder.value = "";
        placeholder.textContent = classIds.length ? "Select a class" : "No existing Class References available";
        classSelect.appendChild(placeholder);

        classIds.forEach(function(id) {
            var item = classes[id] || {};
            var option = document.createElement("option");
            option.value = id;
            option.textContent = String(id) + (item.section ? " • " + item.section : "") + (item.level ? " • " + item.level : "");
            classSelect.appendChild(option);
        });
        classSelect.value = getSelectedClassId();
        classSelect.disabled = classIds.length === 0;
        classSelect.addEventListener("change", function() {
            if (!selectExistingClass(classSelect.value)) {
                var cs = document.getElementById("pacificEducationClassStatus");
                if (cs) cs.textContent = "Select an existing Class Reference before continuing.";
            }
        });

        var classStatus = document.createElement("p");
        classStatus.id = "pacificEducationClassStatus";
        classStatus.setAttribute("aria-live", "polite");
        var selectedId = getSelectedClassId();
        var selected = selectedId && classes[selectedId] ? classes[selectedId] : null;
        classStatus.textContent = selected
            ? "Selected Class Reference: " + selectedId + (selected.level ? " • " + selected.level : "")
            : (classIds.length ? "Class Reference is required before choosing the learner level." : "No existing Class References are available. A teacher/authorized class setup must create one first.");

        host.appendChild(classLabel);
        host.appendChild(document.createElement("br"));
        host.appendChild(classSelect);
        host.appendChild(classStatus);
        host.appendChild(document.createElement("hr"));

        var label = document.createElement("label");
        label.setAttribute("for", "pacificEducationLevel");
        label.textContent = "Choose learning level";

        var select = document.createElement("select");
        select.id = "pacificEducationLevel";
        select.name = "pacificEducationLevel";
        select.setAttribute("aria-label", "Learning level");

        getConfiguredLevels().forEach(function(level) {
            var option = document.createElement("option");
            option.value = level;
            option.textContent = level;
            select.appendChild(option);
        });

        var selectedClassId = getSelectedClassId();
        var selectedClass = selectedClassId && roster && typeof roster.getClass === "function" ? roster.getClass(selectedClassId) : null;
        if (selectedClass && selectedClass.level && getConfiguredLevels().indexOf(String(selectedClass.level)) !== -1) window.localStorage.setItem("pacificEducationLevel", String(selectedClass.level));
        select.value = getStoredLevel();

        var status = document.createElement("p");
        status.id = "pacificEducationLevelStatus";
        status.setAttribute("aria-live", "polite");
        status.textContent =
            "Selected: " + select.value + (selectedClass ? " • linked to Class Reference " + selectedClassId : " • select an existing Class Reference first");

        if (!selectedClassId) select.disabled = true;

        select.addEventListener("change", function() {
            setLevel(select.value);
        });

        host.appendChild(label);
        host.appendChild(document.createElement("br"));
        host.appendChild(select);
        host.appendChild(status);

        return true;
    }

    document.addEventListener("pacificEducationCountryConfigChanged", function() { createUI(); });

    function initialise() {
        createUI();
        return {
            version: VERSION,
            level: getStoredLevel(),
            levels: getConfiguredLevels(),
            prototype: true
        };
    }

    window.PacificEducationLevelSelector = Object.freeze({
        version: VERSION,
        levels: getConfiguredLevels(),
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