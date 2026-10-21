/* PacEdu student learning calendar — pilot schedule guard.
 * Teacher-defined school days determine numbered learning days. Calendar dates are
 * automatic; weekends/holidays are not silently counted as teaching days.
 * Browser storage is device-local only; this is not a shared or authoritative schedule.
 */
(function (window, document) {
  "use strict";
  var KEY = "paceduTeacherLearningCalendarV1";
  var LEARNER_ROLES = { student: true, "blind-learner": true, "deaf-learner": true };
  function readSchedule() {
    try {
      var value = JSON.parse(window.localStorage.getItem(KEY) || "null");
      if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(String(value.startDate || "")) ||
          !Array.isArray(value.learningDays) || !value.learningDays.length) return null;
      return value;
    } catch (_) { return null; }
  }
  function isoLocal(date) {
    return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0");
  }
  function dayNumberFor(dateValue, schedule) {
    if (!schedule || !/^\d{4}-\d{2}-\d{2}$/.test(String(dateValue || ""))) return null;
    var start = new Date(schedule.startDate + "T12:00:00");
    var target = new Date(dateValue + "T12:00:00");
    if (!Number.isFinite(start.getTime()) || !Number.isFinite(target.getTime()) || target < start) return null;
    var learningDays = schedule.learningDays.map(Number).filter(function (d) { return d >= 0 && d <= 6; });
    if (!learningDays.length) return null;
    var holidays = Array.isArray(schedule.holidays) ? schedule.holidays : [];
    var count = 0;
    for (var cursor = new Date(start); cursor <= target; cursor.setDate(cursor.getDate() + 1)) {
      var date = isoLocal(cursor);
      if (learningDays.indexOf(cursor.getDay()) !== -1 && holidays.indexOf(date) === -1) count++;
    }
    return count || null;
  }
  function activeRole() {
    try {
      return String(window.sessionStorage.getItem("pacificEducationActiveRole") ||
        window.sessionStorage.getItem("pilotRegistrationRole") ||
        window.sessionStorage.getItem("pacificEducationPilotRole") || "").toLowerCase().replace(/\s+/g, "-");
    } catch (_) { return ""; }
  }
  function renderTeacherSetup() {
    var host = document.getElementById("teacherDashboard");
    if (!host || document.getElementById("paceduTeacherLearningCalendarSetup")) return;
    var section = document.createElement("section");
    section.id = "paceduTeacherLearningCalendarSetup";
    section.setAttribute("aria-label", "Teacher learning calendar setup");
    section.style.cssText = "margin:16px 0;padding:16px;border:2px solid #176b48;border-radius:10px;";
    var heading = document.createElement("h3"); heading.textContent = "Student Learning Calendar"; section.appendChild(heading);
    var note = document.createElement("p");
    note.textContent = "Set the first teaching date and the school's learning weekdays. PacEdu calculates the date and numbered learning day automatically, skipping configured holidays. This pilot schedule is stored only on this device.";
    section.appendChild(note);
    function field(labelText, id, type) {
      var label = document.createElement("label"); label.style.cssText = "display:block;margin:10px 0;";
      label.appendChild(document.createTextNode(labelText));
      var input = document.createElement("input"); input.id = id; input.type = type;
      input.style.cssText = "display:block;min-height:44px;padding:8px;max-width:100%;";
      label.appendChild(input); section.appendChild(label); return input;
    }
    var start = field("First teaching date", "paceduCalendarStartDate", "date");
    var weekdaysLabel = document.createElement("fieldset");
    var legend = document.createElement("legend"); legend.textContent = "School learning days"; weekdaysLabel.appendChild(legend);
    var dayNames = [{n:"Sunday",v:0},{n:"Monday",v:1},{n:"Tuesday",v:2},{n:"Wednesday",v:3},{n:"Thursday",v:4},{n:"Friday",v:5},{n:"Saturday",v:6}];
    var dayChecks = [];
    dayNames.forEach(function (day) {
      var label = document.createElement("label"); label.style.cssText = "display:inline-flex;gap:5px;align-items:center;margin:6px 10px 6px 0;";
      var input = document.createElement("input"); input.type = "checkbox"; input.value = String(day.v); input.checked = day.v >= 1 && day.v <= 5;
      label.appendChild(input); label.appendChild(document.createTextNode(day.n)); weekdaysLabel.appendChild(label); dayChecks.push(input);
    });
    section.appendChild(weekdaysLabel);
    var holidays = field("Holiday dates (optional, comma-separated YYYY-MM-DD)", "paceduCalendarHolidays", "text");
    holidays.placeholder = "2026-12-25, 2027-01-01";
    var save = document.createElement("button"); save.type = "button"; save.textContent = "Save Learning Calendar"; save.style.cssText = "min-height:44px;padding:10px 14px;font-weight:700;";
    section.appendChild(save);
    var status = document.createElement("p"); status.setAttribute("role", "status"); status.setAttribute("aria-live", "polite"); section.appendChild(status);
    var existing = readSchedule();
    if (existing) {
      start.value = existing.startDate;
      dayChecks.forEach(function (box) { box.checked = existing.learningDays.indexOf(Number(box.value)) !== -1; });
      holidays.value = (existing.holidays || []).join(", ");
    }
    save.addEventListener("click", function () {
      var selected = dayChecks.filter(function (box) { return box.checked; }).map(function (box) { return Number(box.value); });
      if (!start.value || !selected.length) { status.textContent = "Choose the first teaching date and at least one learning weekday."; return; }
      var holidayList = holidays.value.split(",").map(function (v) { return v.trim(); }).filter(Boolean);
      if (holidayList.some(function (v) { return !/^\d{4}-\d{2}-\d{2}$/.test(v) || !Number.isFinite(new Date(v + "T12:00:00").getTime()); })) {
        status.textContent = "Check holiday dates. Use YYYY-MM-DD, separated by commas."; return;
      }
      var schedule = { version: 1, startDate: start.value, learningDays: selected, holidays: holidayList, savedAt: new Date().toISOString(), storage: "device-local-pilot" };
      try {
        window.localStorage.setItem(KEY, JSON.stringify(schedule));
        status.textContent = "Learning calendar saved on this device. Student date/day display will refresh; this schedule is not shared with other devices.";
        renderStudentBadge();
      } catch (_) { status.textContent = "Could not save the calendar on this device."; }
    });
    host.appendChild(section);
  }
  function renderStudentBadge() {
    var role = activeRole();
    if (!LEARNER_ROLES[role]) return;
    var host = document.getElementById("dailyLesson");
    if (!host || document.getElementById("paceduStudentLearningDate")) return;
    var box = document.createElement("section");
    box.id = "paceduStudentLearningDate";
    box.setAttribute("aria-label", "Today's assigned learning date");
    box.style.cssText = "margin:0 0 14px;padding:14px;border:2px solid #176b48;border-radius:10px;";
    var heading = document.createElement("h3"); heading.textContent = "Today's Learning Day"; box.appendChild(heading);
    var date = new Date();
    var dateValue = isoLocal(date);
    var dateLine = document.createElement("p"); dateLine.textContent = "Date: " + date.toLocaleDateString(); box.appendChild(dateLine);
    var schedule = readSchedule();
    var day = dayNumberFor(dateValue, schedule);
    var dayLine = document.createElement("p");
    if (day) {
      dayLine.textContent = "Assigned learning day: Day " + day + ". The day number follows the teacher's configured learning weekdays and holiday dates.";
      box.setAttribute("data-learning-day", String(day));
    } else {
      var fallback = 0;
      try { fallback = Math.max(0, Number(window.localStorage.getItem("currentDayNumber") || 0) || 0); } catch (_) {}
      dayLine.textContent = fallback ? "Teacher-assigned activity reference: Day " + fallback + ". Automatic school-day numbering is waiting for a teacher calendar." : "Automatic school-day numbering is waiting for the teacher to set the class learning calendar. No day number has been guessed.";
      box.setAttribute("data-calendar-status", "teacher-calendar-required");
    }
    box.appendChild(dayLine);
    var note = document.createElement("p");
    note.textContent = "Your activities follow the teacher's assigned class, level, subject and learning-day plan. Weekend or holiday supplementary work is separate from the school-day sequence.";
    box.appendChild(note);
    host.insertBefore(box, host.firstChild);
  }
  function init() {
    renderTeacherSetup();
    renderStudentBadge();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
  window.PacEduStudentLearningCalendar = Object.freeze({
    version: "1.0.0-pilot",
    dayNumberFor: dayNumberFor,
    readSchedule: readSchedule,
    refresh: function () { renderStudentBadge(); }
  });
})(window, document);
