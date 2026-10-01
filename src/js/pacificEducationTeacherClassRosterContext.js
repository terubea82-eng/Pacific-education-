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

    var VERSION = "1.1.0";
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

        var selectedClass = id ? getClass(id) : null;\n        if (selectedClass && selectedClass.level) {\n            try { window.localStorage.setItem("pacificEducationLevel", String(selectedClass.level)); } catch (e) {}\n        }\n        window.dispatchEvent(new CustomEvent("pacificEducationClassChanged", {
            detail: { classId: id, prototype: true }
        }));
        return id;
    }

    function createClass(classId, level, teacherRef, section) {
        var id = String(classId || "").trim();
        if (!id) return { success: false, error: "Class reference required" };

        var data = load();
        if (!data[id]) {
            data[id] = {
                classId: id,
                level: level || "",
                section: section || "",
                teacherRef: teacherRef || "",
                studentRefs: [],
                prototype: true,
                productionEligible: false
            };
        } else {
            if (level) data[id].level = level;
            if (section !== undefined) data[id].section = String(section || "").trim();
            if (teacherRef !== undefined) data[id].teacherRef = String(teacherRef || "").trim();
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
        var current = getClass();
        return {
            classId: getClassId() || null,
            level: current ? (current.level || null) : null,
            section: current ? (current.section || null) : null,
            teacherRef: current ? (current.teacherRef || null) : null,
            studentRefs: getStudents(),
            prototype: true,
            productionEligible: false
        };
    }

    function getActiveRole() {
        try { return window.sessionStorage.getItem("pacificEducationActiveRole") || window.sessionStorage.getItem("pacificEducationPilotRole") || ""; } catch (e) { return ""; }
    }

    function canEditRoster() {
        var role = getActiveRole();
        return role === "teacher";
    }

    function render(targetId) {
        var target = document.getElementById(targetId || "pacificEducationTeacherClassRoster");
        if (!target) return { success: false, error: "Class roster target unavailable" };

        var currentClass = getClass();
        var students = currentClass ? currentClass.studentRefs : [];

        target.innerHTML =
            '<div class="pacific-education-class-roster">' +
            '<h2>' + (canEditRoster() ? 'Teacher Class Roster' : 'All Class Lists — View Only') + '</h2>' +
            '<p>Each class/section has its own unique class reference and teacher assignment, even when several classes share the same level.</p>' +
            (canEditRoster() ? (
              '<label>Class reference <input id="pacificEducationClassRef" type="text" autocomplete="off" placeholder="Class reference"></label> ' +
              '<label>Teacher reference <input id="pacificEducationRosterTeacherRef" type="text" autocomplete="off" placeholder="e.g. PILOT-TEACHER-001"></label> ' +
              '<label>Section <input id="pacificEducationRosterSection" type="text" autocomplete="off" placeholder="e.g. 01"></label> ' +
              '<label>Level <select id="pacificEducationRosterLevel">' +
              '<option value="">Select level</option><option>Class 1</option><option>Class 2</option><option>Class 3</option><option>Class 4</option><option>Class 5</option><option>Class 6</option><option>Class 7</option><option>Class 8</option><option>Class 9</option><option>Class 10</option><option>Class 11</option><option>Class 12</option><option>Class 13</option>' +
              '</select></label> <button type="button" id="pacificEducationCreateClass">Set Class</button><hr>' +
              '<label>Approved student reference <input id="pacificEducationRosterStudentRef" type="text" autocomplete="off" placeholder="Student reference"></label> ' +
              '<button type="button" id="pacificEducationAddStudent">Add</button>'
            ) : '<p><strong>Head of School access:</strong> All teacher-created class lists are visible here for school-wide oversight. Class lists are read-only for this role.</p>') +
            '<div id="pacificEducationRosterStudents"></div>' +
            '<p id="pacificEducationRosterStatus"></p><p id="pacificEducationRosterIdentity"></p>' +
            '<small>Prototype only. Do not enter child names, addresses, locations, health information, or other sensitive data.</small>' +
            '</div>';

        var classInput = document.getElementById("pacificEducationClassRef");
        var levelInput = document.getElementById("pacificEducationRosterLevel");
        var studentInput = document.getElementById("pacificEducationRosterStudentRef");
        var teacherInput = document.getElementById("pacificEducationRosterTeacherRef");
        var sectionInput = document.getElementById("pacificEducationRosterSection");
        var list = document.getElementById("pacificEducationRosterStudents");
        var status = document.getElementById("pacificEducationRosterStatus");

        if (classInput) classInput.value = getClassId();
        if (levelInput) levelInput.value = currentClass ? currentClass.level : "";
        if (teacherInput) teacherInput.value = currentClass ? (currentClass.teacherRef || "") : "";
        if (sectionInput) sectionInput.value = currentClass ? (currentClass.section || "") : "";

        function refreshList() {
            var identity = document.getElementById("pacificEducationRosterIdentity");
            if (identity) {
                if (getActiveRole() === "head-of-school") {
                    var all = load();
                    var ids = Object.keys(all);
                    identity.innerHTML = "<strong>School-wide view:</strong> " + ids.length + " class list(s) visible. Head of School cannot edit teacher-created lists.";
                } else {
                    identity.innerHTML = currentClass ? "<strong>Class:</strong> " + String(currentClass.classId) + " &nbsp; <strong>Level:</strong> " + String(currentClass.level || "—") + " &nbsp; <strong>Section:</strong> " + String(currentClass.section || "—") + " &nbsp; <strong>Teacher:</strong> " + String(currentClass.teacherRef || "—") : "";
                }
            }
            if (getActiveRole() === "head-of-school") {
                var allClasses = load();
                var ids = Object.keys(allClasses);
                list.innerHTML = ids.length ? ids.map(function(id) {
                    var item = allClasses[id] || {};
                    var refs = Array.isArray(item.studentRefs) ? item.studentRefs : [];
                    return '<div style="margin:8px 0;padding:8px;border:1px solid currentColor;">' +
                        '<strong>' + String(item.classId || id).replace(/&/g,"&amp;").replace(/</g,"&lt;") + '</strong> — ' +
                        'Level: ' + String(item.level || "—").replace(/&/g,"&amp;").replace(/</g,"&lt;") +
                        ' • Section: ' + String(item.section || "—").replace(/&/g,"&amp;").replace(/</g,"&lt;") +
                        ' • Teacher: ' + String(item.teacherRef || "—").replace(/&/g,"&amp;").replace(/</g,"&lt;") +
                        ' • Students: ' + refs.length +
                        '</div>';
                }).join("") : "<p>No teacher-created class lists are available yet.</p>";
                return;
            }
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
                var result = createClass(classInput.value, levelInput.value, teacherInput.value, sectionInput.value);
                if (result.success) {
                    setClassId(classInput.value);
                    currentClass = getClass();
                    students = currentClass ? currentClass.studentRefs : [];
                    status.textContent = "Class/section and teacher context selected.";
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
        getClasses: function() { return load(); },
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