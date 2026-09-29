/*
 * Pacific Education — Teacher Controlled School Calendar Link
 * Version 1.0.0
 *
 * Pilot rule:
 * - Teacher role creates/updates the shared school calendar.
 * - Student role receives a read-only view.
 * - Students cannot create, edit, or publish dates.
 * - Pilot persistence uses shared browser localStorage only.
 * - Production must move this authority to a secure server/database.
 */
(function(window, document) {
  "use strict";

  var VERSION = "1.0.0";
  var STORAGE_KEY = "pacificEducationSharedSchoolCalendar";

  function role() {
    try { return window.sessionStorage.getItem("pacificEducationPilotRole") || ""; }
    catch (e) { return ""; }
  }

  function isTeacher() {
    return role() === "teacher";
  }

  function copy(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function emptySchedule() {
    return {
      version: VERSION,
      publishedAt: null,
      updatedByRole: null,
      terms: {
        "Term 1": { start: "", end: "" },
        "Term 2": { start: "", end: "" },
        "Term 3": { start: "", end: "" }
      },
      schoolDays: [],
      revisionDates: [],
      examDates: []
    };
  }

  function read() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return emptySchedule();
      var data = JSON.parse(raw);
      var base = emptySchedule();
      data = data && typeof data === "object" ? data : {};
      base.terms = data.terms || base.terms;
      base.schoolDays = Array.isArray(data.schoolDays) ? data.schoolDays : [];
      base.revisionDates = Array.isArray(data.revisionDates) ? data.revisionDates : [];
      base.examDates = Array.isArray(data.examDates) ? data.examDates : [];
      base.publishedAt = data.publishedAt || null;
      base.updatedByRole = data.updatedByRole || null;
      return base;
    } catch (e) {
      return emptySchedule();
    }
  }

  function write(schedule) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schedule));
    document.dispatchEvent(new CustomEvent("pacificEducationSchoolCalendarPublished"));
  }

  function validDate(value) {
    return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""));
  }

  function addUnique(list, date) {
    if (validDate(date) && list.indexOf(date) === -1) list.push(date);
    list.sort();
  }

  function removeDate(list, date) {
    var i = list.indexOf(date);
    if (i >= 0) list.splice(i, 1);
  }

  function saveTerm(term, start, end) {
    if (!isTeacher()) return { success: false, error: "Only the Teacher role can set term dates." };
    if (!["Term 1", "Term 2", "Term 3"].includes(term)) return { success: false, error: "Invalid school term." };
    if (!validDate(start) || !validDate(end) || start > end) {
      return { success: false, error: "Enter valid term start and end dates." };
    }
    var schedule = read();
    schedule.terms[term] = { start: start, end: end };
    schedule.updatedByRole = "teacher";
    schedule.publishedAt = new Date().toISOString();
    write(schedule);
    return { success: true, schedule: copy(schedule) };
  }

  function addSchoolDay(date) {
    if (!isTeacher()) return { success: false, error: "Only the Teacher role can set school days." };
    if (!validDate(date)) return { success: false, error: "Enter a valid school-day date." };
    var schedule = read();
    addUnique(schedule.schoolDays, date);
    removeDate(schedule.revisionDates, date);
    removeDate(schedule.examDates, date);
    schedule.updatedByRole = "teacher";
    schedule.publishedAt = new Date().toISOString();
    write(schedule);
    return { success: true, schedule: copy(schedule) };
  }

  function addRevisionDate(date) {
    if (!isTeacher()) return { success: false, error: "Only the Teacher role can set revision dates." };
    if (!validDate(date)) return { success: false, error: "Enter a valid revision date." };
    var schedule = read();
    addUnique(schedule.revisionDates, date);
    removeDate(schedule.schoolDays, date);
    removeDate(schedule.examDates, date);
    schedule.updatedByRole = "teacher";
    schedule.publishedAt = new Date().toISOString();
    write(schedule);
    return { success: true, schedule: copy(schedule) };
  }

  function addExamDate(date) {
    if (!isTeacher()) return { success: false, error: "Only the Teacher role can set examination dates." };
    if (!validDate(date)) return { success: false, error: "Enter a valid examination date." };
    var schedule = read();
    addUnique(schedule.examDates, date);
    removeDate(schedule.schoolDays, date);
    removeDate(schedule.revisionDates, date);
    schedule.updatedByRole = "teacher";
    schedule.publishedAt = new Date().toISOString();
    write(schedule);
    return { success: true, schedule: copy(schedule) };
  }

  function clearAll() {
    if (!isTeacher()) return { success: false, error: "Only the Teacher role can clear the pilot calendar." };
    write(emptySchedule());
    return { success: true };
  }

  function formatList(list) {
    return list.length ? list.join(", ") : "None published";
  }

  function renderTeacher() {
    var target = document.getElementById("pacificEducationTeacherSchoolCalendarLink");
    if (!target || !isTeacher()) return false;

    var schedule = read();
    target.innerHTML =
      '<div class="pacific-education-teacher-school-calendar-link">' +
      '<h2>Teacher School Terms & Dates</h2>' +
      '<p><strong>Teacher-controlled schedule:</strong> set the school terms, school days, revision days and examination days here. The published schedule is automatically shown in the Student Platform.</p>' +
      '<p><strong>Student restriction:</strong> students have read-only access and cannot create, change or publish school dates.</p>' +

      '<fieldset><legend>Term dates</legend>' +
      '<label>Term <select id="peCalendarTerm"><option>Term 1</option><option>Term 2</option><option>Term 3</option></select></label> ' +
      '<label>Start <input id="peCalendarTermStart" type="date"></label> ' +
      '<label>End <input id="peCalendarTermEnd" type="date"></label> ' +
      '<button type="button" id="peCalendarSaveTerm">Publish Term Dates</button></fieldset>' +

      '<fieldset><legend>School days</legend>' +
      '<input id="peCalendarSchoolDay" type="date"><button type="button" id="peCalendarAddSchoolDay">Publish School Day</button>' +
      '<p><strong>Published school days:</strong> <span id="peCalendarSchoolDays"></span></p></fieldset>' +

      '<fieldset><legend>Revision days</legend>' +
      '<input id="peCalendarRevisionDay" type="date"><button type="button" id="peCalendarAddRevisionDay">Publish Revision Day</button>' +
      '<p><strong>Published revision days:</strong> <span id="peCalendarRevisionDays"></span></p></fieldset>' +

      '<fieldset><legend>Examination days</legend>' +
      '<input id="peCalendarExamDay" type="date"><button type="button" id="peCalendarAddExamDay">Publish Examination Day</button>' +
      '<p><strong>Published examination days:</strong> <span id="peCalendarExamDays"></span></p></fieldset>' +

      '<button type="button" id="peCalendarClear">Clear Pilot Calendar</button>' +
      '<p id="peCalendarTeacherStatus" role="status"></p>' +
      '<small>Pilot only: this shared calendar uses browser storage. Production must use secure server-side teacher authorization and a shared database.</small>' +
      '</div>';

    function refresh() {
      schedule = read();
      document.getElementById("peCalendarSchoolDays").textContent = formatList(schedule.schoolDays);
      document.getElementById("peCalendarRevisionDays").textContent = formatList(schedule.revisionDates);
      document.getElementById("peCalendarExamDays").textContent = formatList(schedule.examDates);
    }

    document.getElementById("peCalendarSaveTerm").onclick = function() {
      var term = document.getElementById("peCalendarTerm").value;
      var result = saveTerm(term, document.getElementById("peCalendarTermStart").value, document.getElementById("peCalendarTermEnd").value);
      document.getElementById("peCalendarTeacherStatus").textContent = result.success ? term + " dates published to Student Platform." : result.error;
    };
    document.getElementById("peCalendarAddSchoolDay").onclick = function() {
      var result = addSchoolDay(document.getElementById("peCalendarSchoolDay").value);
      document.getElementById("peCalendarTeacherStatus").textContent = result.success ? "School day published to Student Platform." : result.error;
      refresh();
    };
    document.getElementById("peCalendarAddRevisionDay").onclick = function() {
      var result = addRevisionDate(document.getElementById("peCalendarRevisionDay").value);
      document.getElementById("peCalendarTeacherStatus").textContent = result.success ? "Revision day published to Student Platform." : result.error;
      refresh();
    };
    document.getElementById("peCalendarAddExamDay").onclick = function() {
      var result = addExamDate(document.getElementById("peCalendarExamDay").value);
      document.getElementById("peCalendarTeacherStatus").textContent = result.success ? "Examination day published to Student Platform." : result.error;
      refresh();
    };
    document.getElementById("peCalendarClear").onclick = function() {
      var result = clearAll();
      document.getElementById("peCalendarTeacherStatus").textContent = result.success ? "Pilot calendar cleared." : result.error;
      refresh();
    };

    refresh();
    return true;
  }

  function renderStudent() {
    var target = document.getElementById("pacificEducationStudentSchoolCalendar");
    if (!target || role() !== "student") return false;

    var schedule = read();
    function termLine(name) {
      var t = schedule.terms[name] || {};
      return '<li><strong>' + name + ':</strong> ' + (t.start || "Not published") + ' → ' + (t.end || "Not published") + '</li>';
    }

    target.innerHTML =
      '<div class="pacific-education-student-school-calendar">' +
      '<h2>School Calendar & Term Dates</h2>' +
      '<p><strong>Teacher published — read only.</strong> These dates come from the Teacher Dashboard. Students cannot initiate or edit dates.</p>' +
      '<h3>School Terms</h3><ul>' + termLine("Term 1") + termLine("Term 2") + termLine("Term 3") + '</ul>' +
      '<h3>School Days</h3><p>' + formatList(schedule.schoolDays) + '</p>' +
      '<h3>Revision Days</h3><p>' + formatList(schedule.revisionDates) + '</p>' +
      '<h3>Examination Days</h3><p>' + formatList(schedule.examDates) + '</p>' +
      '<p><small>Last teacher publication: ' + (schedule.publishedAt || "Not yet published") + '</small></p>' +
      '</div>';
    return true;
  }

  function render() {
    renderTeacher();
    renderStudent();
  }

  window.PacificEducationTeacherStudentCalendarLink = Object.freeze({
    name: "PacificEducationTeacherStudentCalendarLink",
    version: VERSION,
    getSchedule: function() { return copy(read()); },
    saveTerm: saveTerm,
    addSchoolDay: addSchoolDay,
    addRevisionDate: addRevisionDate,
    addExamDate: addExamDate,
    clearAll: clearAll,
    render: render,
    prototype: true,
    productionEligible: false
  });

  document.addEventListener("pacificEducationSchoolCalendarPublished", render);
  document.addEventListener("pacificEducationPilotRoleChanged", render);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render);
  else render();
})(window);
