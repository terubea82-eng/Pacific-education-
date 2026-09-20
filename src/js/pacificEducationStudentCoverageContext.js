/*
 * Pacific Education — Student Coverage Context
 * Version 1.0.0
 *
 * Prototype-only context for keeping curriculum evidence associated with
 * a selected learner. This is not production identity/authentication.
 */
(function(window, document) {
    "use strict";

    var VERSION = "1.0.0";
    var STORAGE_KEY = "pacificEducationSelectedStudentId";

    function getStudentId() {
        try {
            return window.localStorage.getItem(STORAGE_KEY) || "";
        } catch (e) {
            return "";
        }
    }

    function setStudentId(studentId) {
        var id = String(studentId || "").trim();
        try {
            if (id) window.localStorage.setItem(STORAGE_KEY, id);
            else window.localStorage.removeItem(STORAGE_KEY);
        } catch (e) {}

        window.dispatchEvent(new CustomEvent("pacificEducationStudentChanged", {
            detail: { studentId: id, prototype: true }
        }));

        return id;
    }

    function getContext() {
        var id = getStudentId();
        return {
            studentId: id || null,
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
