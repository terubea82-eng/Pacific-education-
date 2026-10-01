/*
 * Pacific Education — Student Coverage Context
 * Version 1.0.0
 *
 * Prototype-only context for keeping curriculum evidence associated with
 * a selected learner. This is not production identity/authentication.
 */
(function(window, document) {
    "use strict";

    var VERSION = "1.1.0";
    var STORAGE_KEY = "pacificEducationSelectedStudentId";
    var CLASS_STORAGE_KEY = "pacificEducationSelectedClassId";

    function getStudentId() {
        try {
            return window.localStorage.getItem(STORAGE_KEY) || "";
        } catch (e) {
            return "";
        }
    }

    function getClassId() {
        var roster = window.PacificEducationTeacherClassRosterContext;
        if (roster && typeof roster.getClassId === "function") {
            return String(roster.getClassId() || "").trim();
        }
        try { return String(window.localStorage.getItem(CLASS_STORAGE_KEY) || "").trim(); } catch (e) { return ""; }
    }

    function studentBelongsToSelectedClass(id) {
        var classId = getClassId();
        var roster = window.PacificEducationTeacherClassRosterContext;
        if (!classId || !roster || typeof roster.getStudents !== "function") return false;
        var students = roster.getStudents(classId) || [];
        return students.some(function(ref) { return String(ref) === String(id); });
    }

    function setStudentId(studentId) {
        var id = String(studentId || "").trim();
        if (id && !studentBelongsToSelectedClass(id)) {
            try { window.localStorage.removeItem(STORAGE_KEY); } catch (e) {}
            window.dispatchEvent(new CustomEvent("pacificEducationStudentChanged", {
                detail: { studentId: "", classId: getClassId(), blocked: true, reason: "Student is not enrolled in the selected Class Reference.", prototype: true }
            }));
            return "";
        }
        try {
            if (id) window.localStorage.setItem(STORAGE_KEY, id);
            else window.localStorage.removeItem(STORAGE_KEY);
        } catch (e) {}

        window.dispatchEvent(new CustomEvent("pacificEducationStudentChanged", {
            detail: { studentId: id, classId: getClassId(), prototype: true }
        }));

        return id;
    }

    function getContext() {
        var id = getStudentId();
        var classId = getClassId();
        if (id && !studentBelongsToSelectedClass(id)) id = "";
        return {
            studentId: id || null,
            classId: classId || null,
            selected: !!id,
            prototype: true,
            productionEligible: false
        };
    }

    function clear() {
        return setStudentId("");
    }

    function render(targetId) {
        var target = document.getElementById(targetId || "pacificEducationStudentCoverageContext");
        if (!target) return { success: false, error: "Student context target unavailable" };

        var context = getContext();

        target.innerHTML =
            '<div class="pacific-education-student-context">' +
            '<h2>Student Coverage Context</h2>' +
            '<p>Prototype learner selector for curriculum evidence.</p>' +
            '<label>Student ID ' +
            '<input id="pacificEducationStudentId" type="text" autocomplete="off" ' +
            'placeholder="Enter approved student reference">' +
            '</label> ' +
            '<button type="button" id="pacificEducationSetStudent">Select Student</button> ' +
            '<button type="button" id="pacificEducationClearStudent">Clear</button>' +
            '<p id="pacificEducationStudentContextStatus"></p>' +
            '<small>Prototype only. Do not enter sensitive personal information.</small>' +
            '</div>';

        var input = document.getElementById("pacificEducationStudentId");
        var status = document.getElementById("pacificEducationStudentContextStatus");

        if (input) input.value = context.studentId || "";

        if (status) {
            status.textContent = context.selected ?
                "Selected student reference: " + context.studentId :
                "No student selected.";
        }

        var selectButton = document.getElementById("pacificEducationSetStudent");
        var clearButton = document.getElementById("pacificEducationClearStudent");

        if (selectButton) {
            selectButton.addEventListener("click", function() {
                var id = setStudentId(input ? input.value : "");
                if (status) {
                    status.textContent = id ?
                        "Selected student reference: " + id :
                        "No student selected.";
                }
                document.dispatchEvent(new CustomEvent("pacificEducationCoverageRefresh"));
            });
        }

        if (clearButton) {
            clearButton.addEventListener("click", function() {
                setStudentId("");
                if (input) input.value = "";
                if (status) status.textContent = "No student selected.";
                document.dispatchEvent(new CustomEvent("pacificEducationCoverageRefresh"));
            });
        }

        return { success: true, context: context, prototype: true };
    }

    function init() {
        return render("pacificEducationStudentCoverageContext");
    }

    window.PacificEducationStudentCoverageContext = Object.freeze({
        name: "PacificEducationStudentCoverageContext",
        version: VERSION,
        getStudentId: getStudentId,
        setStudentId: setStudentId,
        getContext: getContext,
        clear: clear,
        render: render,
        init: init
    });

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})(window, document);
