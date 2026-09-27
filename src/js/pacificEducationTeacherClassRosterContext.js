/*
 * Pacific Education — Teacher Class Roster Context
 * Version 1.0.0
 *
 * Prototype-only class roster/context. Uses approved student references,
 * not names, addresses, locations, or other sensitive child data.
 * Production class membership must come from secure server-side systems.
 */
(function(window, document) {
    "use strict";

    var VERSION = "1.0.0";
    var CLASS_KEY = "pacificEducationSelectedClassId";
    var ROSTER_KEY = "pacificEducationPrototypeClassRosters";

    function load() {
        try {
            var raw = window.localStorage.getItem(ROSTER_KEY);
            var data = raw ? JSON.parse(raw) : {};
            return data && typeof data === "object" ? data : {};
        } catch (e) {
            return {};
        }
    }

    function save(data) {
        try {
            window.localStorage.setItem(ROSTER_KEY, JSON.stringify(data));
        } catch (e) {}
    }

    function getClassId() {
        try {
            return window.localStorage.getItem(CLASS_KEY) || "";
        } catch (e) {
            return "";
        }
    }

    function setClassId(classId) {
        var id = String(classId || "").trim();
        try {
            if (id) window.localStorage.setItem(CLASS_KEY, id);
            else window.localStorage.removeItem(CLASS_KEY);
        } catch (e) {}

        window.dispatchEvent(new CustomEvent("pacificEducationClassChanged", {
            detail: { classId: id, prototype: true }
        }));
        return id;
    }

    function createClass(classId, level) {
        var id = String(classId || "").trim();
        if (!id) return { success: false, error: "Class reference required" };

        var data = load();
        if (!data[id]) {
            data[id] = {
                classId: id,
                level: level || "",
                studentRefs: [],
                prototype: true,
                productionEligible: false
            };
        } else if (level) {
            data[id].level = level;
        }

        save(data);
        return { success: true, class: data[id], prototype: true };
    }

    function addStudent(classId, studentRef) {
        var id = String(classId || getClassId()).trim();
        var student = String(studentRef || "").trim();
        if (!id) return { success: false, error: "Class reference required" };
        if (!student) return { success: false, error: "Student reference required" };

        var created = createClass(id);
        if (!created.success) return created;

        var data = load();
        if (data[id].studentRefs.indexOf(student) < 0) {
            data[id].studentRefs.push(student);
        }
        save(data);

        return { success: true, class: data[id], prototype: true };
    }

    function removeStudent(classId, studentRef) {
        var id = String(classId || getClassId()).trim();
        var student = String(studentRef || "").trim();
        var data = load();

        if (!data[id]) return { success: false, error: "Class not found" };

        data[id].studentRefs = data[id].studentRefs.filter(function(ref) {
            return ref !== student;
        });
        save(data);

        return { success: true, class: data[id], prototype: true };
    }

    function getClass(classId) {
        var data = load();
        var item = data[String(classId || getClassId()).trim()];
        return item ? JSON.parse(JSON.stringify(item)) : null;
    }

    function getStudents(classId) {
        var item = getClass(classId);
        return item ? item.studentRefs.slice() : [];
    }

    function selectStudent(studentRef) {
        var context = window.PacificEducationStudentCoverageContext;
        if (!context || typeof context.setStudentId !== "function") {
            return { success: false, error: "Student Coverage Context unavailable" };
        }

        var id = String(studentRef || "").trim();
        var classId = getClassId();
        var students = getStudents(classId);

        if (!id || students.indexOf(id) < 0) {
            return {
                success: false,
                error: "Student reference is not in the selected class roster"
            };
        }

        context.setStudentId(id);
        return { success: true, classId: classId, studentId: id, prototype: true };
    }

    function getContext() {
        return {
            classId: getClassId() || null,
            studentRefs: getStudents(),
            prototype: true,
            productionEligible: false
        };
    }

    function render(targetId) {
        var target = document.getElementById(targetId || "pacificEducationTeacherClassRoster");
        if (!target) return { success: false, error: "Class roster target unavailable" };

        var currentClass = getClass();
        var students = currentClass ? currentClass.studentRefs : [];

        target.innerHTML =
            '<div class="pacific-education-class-roster">' +
            '<h2>Teacher Class Roster</h2>' +
            '<p>Prototype class context using approved student references only.</p>' +
            '<label>Class reference ' +
            '<input id="pacificEducationClassRef" type="text" autocomplete="off" placeholder="Class reference">' +
            '</label> ' +
            '<label>Level ' +
            '<select id="pacificEducationRosterLevel">' +
            '<option value="">Select level</option><option>Class 1</option><option>Class 2</option>' +
            '<option>Class 3</option><option>Class 4</option><option>Class 5</option><option>Class 6</option>' +
            '<option>Class 7</option><option>Class 8</option><option>Class 9</option><option>Class 10</option>' +
            '<option>Class 11</option><option>Class 12</option><option>Class 13</option>' +
            '</select></label> ' +
            '<button type="button" id="pacificEducationCreateClass">Set Class</button>' +
            '<hr>' +
            '<label>Approved student reference ' +
            '<input id="pacificEducationRosterStudentRef" type="text" autocomplete="off" placeholder="Student reference">' +
            '</label> ' +
            '<button type="button" id="pacificEducationAddStudent">Add</button>' +
            '<div id="pacificEducationRosterStudents"></div>' +
            '<p id="pacificEducationRosterStatus"></p>' +
            '<small>Prototype only. Do not enter child names, addresses, locations, health information, or other sensitive data.</small>' +
            '</div>';

        var classInput = document.getElementById("pacificEducationClassRef");
        var levelInput = document.getElementById("pacificEducationRosterLevel");
        var studentInput = document.getElementById("pacificEducationRosterStudentRef");
        var list = document.getElementById("pacificEducationRosterStudents");
        var status = document.getElementById("pacificEducationRosterStatus");

        if (classInput) classInput.value = getClassId();
        if (levelInput) levelInput.value = currentClass ? currentClass.level : "";

        function refreshList() {
            var selected = window.PacificEducationStudentCoverageContext &&
                typeof window.PacificEducationStudentCoverageContext.getStudentId === "function" ?
                window.PacificEducationStudentCoverageContext.getStudentId() : "";

            list.innerHTML = students.length ?
                students.map(function(ref) {
                    return '<div><button type="button" data-student-ref="' +
                        String(ref).replace(/"/g, "&quot;") + '">' +
                        String(ref).replace(/&/g, "&amp;").replace(/</g, "&lt;") +
                        '</button> ' + (ref === selected ? "<strong>Selected</strong>" : "") +
                        '</div>';
                }).join("") :
                "<p>No student references added to this class.</p>";

            Array.prototype.forEach.call(
                list.querySelectorAll("[data-student-ref]"),
                function(button) {
                    button.addEventListener("click", function() {
                        var result = selectStudent(button.getAttribute("data-student-ref"));
                        status.textContent = result.success ?
                            "Selected student for this class." : result.error;
                        refreshList();
                        document.dispatchEvent(new CustomEvent("pacificEducationCoverageRefresh"));
                    });
                }
            );
        }

        if (document.getElementById("pacificEducationCreateClass")) {
            document.getElementById("pacificEducationCreateClass").addEventListener("click", function() {
                var result = createClass(classInput.value, levelInput.value);
                if (result.success) {
                    setClassId(classInput.value);
                    currentClass = getClass();
                    students = currentClass ? currentClass.studentRefs : [];
                    status.textContent = "Class context selected.";
                    refreshList();
                } else status.textContent = result.error;
            });
        }

        if (document.getElementById("pacificEducationAddStudent")) {
            document.getElementById("pacificEducationAddStudent").addEventListener("click", function() {
                var result = addStudent(classInput.value, studentInput.value);
                if (result.success) {
                    setClassId(classInput.value);
                    students = result.class.studentRefs;
                    studentInput.value = "";
                    status.textContent = "Student reference added.";
                    refreshList();
                } else status.textContent = result.error;
            });
        }

        refreshList();
        return { success: true, class: currentClass, prototype: true };
    }

    function init() {
        return render("pacificEducationTeacherClassRoster");
    }

    window.PacificEducationTeacherClassRosterContext = Object.freeze({
        name: "PacificEducationTeacherClassRosterContext",
        version: VERSION,
        getClassId: getClassId,
        setClassId: setClassId,
        createClass: createClass,
        addStudent: addStudent,
        removeStudent: removeStudent,
        getClass: getClass,
        getStudents: getStudents,
        selectStudent: selectStudent,
        getContext: getContext,
        render: render,
        init: init
    });

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})(window, document);
