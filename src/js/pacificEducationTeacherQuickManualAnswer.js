/* Pacedu — Teacher Quick Manual Answer Entry
 * Controlled pilot UI. This records teacher-entered learner responses locally;
 * it does not automatically award marks or replace the original learner evidence.
 */
(function (window, document) {
  "use strict";

  var PANEL_ID = "pacificEducationTeacherQuickAnswer";
  var RESPONSES_KEY = "pacificEducationActivityResponses";
  var VERSION = "1.0.0";

  function read(key, fallback) {
    try {
      var value = JSON.parse(window.localStorage.getItem(key) || "null");
      return value == null ? fallback : value;
    } catch (_) { return fallback; }
  }

  function text(value) {
    return String(value == null ? "" : value).trim();
  }

  function field(labelText, id, value, required, multiline) {
    var wrapper = document.createElement("div");
    wrapper.style.cssText = "margin:10px 0;";
    var label = document.createElement("label");
    label.htmlFor = id;
    label.textContent = labelText;
    label.style.cssText = "display:block;font-weight:700;margin-bottom:4px;";
    var control = document.createElement(multiline ? "textarea" : "input");
    control.id = id;
    control.name = id;
    control.value = value || "";
    control.required = !!required;
    control.setAttribute("aria-label", labelText);
    control.style.cssText = "display:block;width:100%;max-width:100%;box-sizing:border-box;padding:10px;font:inherit;";
    if (multiline) control.rows = id === "peQuickAnswerQuestion" ? 2 : 3;
    wrapper.appendChild(label);
    wrapper.appendChild(control);
    return { wrapper: wrapper, control: control };
  }

  function resolveAssignment(classValue, learnerName) {
    var roster = window.PacificEducationTeacherClassRosterContext;
    var selectedId = "";
    var selectedClass = null;
    try {
      selectedId = roster && typeof roster.getClassId === "function" ? text(roster.getClassId()) : "";
      selectedClass = selectedId && roster && typeof roster.getClass === "function" ? roster.getClass(selectedId) : null;
    } catch (_) {}
    var students = selectedClass && Array.isArray(selectedClass.studentRefs) ? selectedClass.studentRefs : [];
    var classMatches = !!(selectedId && selectedClass && text(classValue) === selectedId);
    var learnerRef = "";
    students.some(function (ref) {
      if (text(ref).toLowerCase() === text(learnerName).toLowerCase()) { learnerRef = text(ref); return true; }
      return false;
    });
    var verified = classMatches && !!learnerRef;
    return {
      assignmentStatus: verified ? "verified-roster-match" : "unverified-manual-reference",
      verifiedClassId: verified ? selectedId : null,
      verifiedStudentRef: verified ? learnerRef : null
    };
  }

  function build() {
    var host = document.getElementById("teacherDashboard");
    if (!host || document.getElementById(PANEL_ID)) return;

    var panel = document.createElement("section");
    panel.id = PANEL_ID;
    panel.setAttribute("aria-labelledby", "peQuickAnswerTitle");
    panel.style.cssText = "margin:16px 0;padding:16px;border:2px solid #176b48;border-radius:10px;box-sizing:border-box;";
    var heading = document.createElement("h3");
    heading.id = "peQuickAnswerTitle";
    heading.textContent = "Quick Manual Answer Entry";
    panel.appendChild(heading);
    var explanation = document.createElement("p");
    explanation.textContent = "For young learners or learners who cannot easily type, the teacher may enter the learner's spoken, signed, selected or demonstrated answer. Saving records the response for review; it does not automatically mark it correct.";
    panel.appendChild(explanation);

    var rosterContext = window.PacificEducationTeacherClassRosterContext;
    var selectedClassId = "";
    var selectedClass = null;
    try {
      selectedClassId = rosterContext && typeof rosterContext.getClassId === "function" ? text(rosterContext.getClassId()) : "";
      selectedClass = selectedClassId && rosterContext && typeof rosterContext.getClass === "function" ? rosterContext.getClass(selectedClassId) : null;
    } catch (_) {}
    var classRef = text(window.localStorage.getItem("pacificEducationClassReference") || window.localStorage.getItem("pacificEducationClassId") || selectedClassId);
    var classLevel = text((selectedClass && selectedClass.level) || window.localStorage.getItem("pacificEducationLevel") || window.localStorage.getItem("pacificEducationClassLevel"));
    var subject = text(window.localStorage.getItem("pacificEducationSubject")) || "English";
    var term = text(window.localStorage.getItem("pacificEducationTerm")) || "Term 1";
    var day = String(Math.max(1, Math.min(365, Number(window.localStorage.getItem("currentDayNumber") || 1) || 1)));

    var learner = field("Learner name or reference", "peQuickAnswerLearner", "", true, false);
    var cls = field("Class / class reference", "peQuickAnswerClass", classRef || classLevel, true, false);
    var assignmentNote = document.createElement("p");
    assignmentNote.setAttribute("role", "note");
    assignmentNote.textContent = "Assignment matching: a response is roster-verified only when the entered class matches the selected registered class and the learner reference exactly matches a learner on that class roster. Otherwise it is saved as an unverified manual reference for teacher checking.";
    var subj = field("Subject", "peQuickAnswerSubject", subject, true, false);
    var termField = field("Term", "peQuickAnswerTerm", term, true, false);
    var dayField = field("Learning day (1–365)", "peQuickAnswerDay", day, true, false);
    dayField.control.type = "number";
    dayField.control.min = "1";
    dayField.control.max = "365";
    dayField.control.step = "1";
    var question = field("Question or task", "peQuickAnswerQuestion", "", true, true);
    var answer = field("Learner's answer (teacher-entered)", "peQuickAnswerResponse", "", true, true);
    [learner, cls, subj, termField, dayField, question, answer].forEach(function (item) {
      panel.appendChild(item.wrapper);
    });
    panel.appendChild(assignmentNote);

    var actions = document.createElement("div");
    actions.style.cssText = "display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;";
    var save = document.createElement("button");
    save.type = "submit";
    save.textContent = "Save answer & next";
    save.style.cssText = "padding:12px 16px;min-height:44px;font:inherit;font-weight:700;";
    var clear = document.createElement("button");
    clear.type = "button";
    clear.textContent = "Clear answer";
    clear.style.cssText = "padding:12px 16px;min-height:44px;font:inherit;";
    actions.appendChild(save);
    actions.appendChild(clear);
    panel.appendChild(actions);

    var status = document.createElement("p");
    status.id = "peQuickAnswerStatus";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    panel.appendChild(status);

    var form = document.createElement("form");
    form.noValidate = false;
    while (panel.firstChild) form.appendChild(panel.firstChild);
    panel.appendChild(form);
    host.insertBefore(panel, host.firstChild);

    clear.addEventListener("click", function () {
      question.control.value = "";
      answer.control.value = "";
      status.textContent = "Question and answer cleared. Learner and class context retained.";
      question.control.focus();
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var learnerName = text(learner.control.value);
      var classValue = text(cls.control.value);
      var subjectValue = text(subj.control.value);
      var termValue = text(termField.control.value);
      var dayValue = Number(dayField.control.value);
      var questionValue = text(question.control.value);
      var answerValue = text(answer.control.value);
      if (!learnerName || !classValue || !subjectValue || !termValue || !questionValue || !answerValue ||
          !Number.isInteger(dayValue) || dayValue < 1 || dayValue > 365) {
        status.textContent = "Complete the learner, class, subject, term, valid day, question and answer before saving.";
        return;
      }

      var responses = read(RESPONSES_KEY, []);
      if (!Array.isArray(responses)) responses = [];
      var now = new Date().toISOString();
      var assignment = resolveAssignment(classValue, learnerName);
      responses.push({
        responseId: "teacher-manual-" + Date.now(),
        type: "short_answer",
        day: dayValue,
        response: answerValue,
        originalResponse: "",
        questionText: questionValue,
        responseSource: "teacher-entered-on-behalf-of-learner",
        teacherEnteredAnswer: true,
        teacherEnteredAt: now,
        learnerNameOrReference: learnerName,
        classId: classValue,
        classLevel: classLevel || classValue,
        assignmentStatus: assignment.assignmentStatus,
        verifiedClassId: assignment.verifiedClassId,
        verifiedStudentRef: assignment.verifiedStudentRef,
        subject: subjectValue,
        term: termValue,
        curriculumContext: {
          classId: classValue,
          level: classLevel || classValue,
          subjectId: subjectValue,
          term: termValue,
          dayNumber: dayValue,
          questionText: questionValue,
          responseMode: "teacher-manual-entry"
        },
        reviewStatus: "pending-teacher-review",
        date: now,
        productionEligible: false,
        prototype: true
      });
      try {
        window.localStorage.setItem(RESPONSES_KEY, JSON.stringify(responses.slice(-500)));
      } catch (_) {
        status.textContent = "Could not save on this device. Check available storage and try again.";
        return;
      }

      status.textContent = "Answer saved to the local Teacher Review Queue as pending teacher review. No automatic mark was awarded.";
      question.control.value = "";
      answer.control.value = "";
      question.control.focus();
      if (window.PacificEducationTeacherReview && typeof window.PacificEducationTeacherReview.render === "function") {
        window.PacificEducationTeacherReview.render();
      }
      document.dispatchEvent(new CustomEvent("pacificEducationTeacherManualAnswerSaved", {
        detail: { responseSource: "teacher-entered-on-behalf-of-learner", reviewStatus: "pending-teacher-review", prototype: true }
      }));
    });
  }

  function enhanceReviewQueue() {
    var api = window.PacificEducationTeacherReview;
    if (!api || typeof api.render !== "function" || api.__quickManualAnswerEnhanced) return;
    var originalRender = api.render;
    api.render = function () {
      var result = originalRender.apply(this, arguments);
      annotateManualLearners();
      return result;
    };
    api.__quickManualAnswerEnhanced = true;
  }

  function annotateManualLearners() {
    var root = document.getElementById("pacificEducationTeacherSubmissionQueue");
    if (!root) return;
    var all = read(RESPONSES_KEY, []);
    if (!Array.isArray(all)) return;
    var pending = all.map(function (item, index) {
      item = item || {};
      item.__quickIndex = index;
      return item;
    }).filter(function (item) {
      return item.reviewStatus === "pending-teacher-review" || !item.reviewStatus;
    }).slice(-25).reverse();
    var cards = root.querySelectorAll("article");
    for (var i = 0; i < cards.length && i < pending.length; i += 1) {
      var item = pending[i];
      if (!item.teacherEnteredAnswer || !item.learnerNameOrReference ||
          cards[i].querySelector(".pe-quick-answer-learner")) continue;
      var label = document.createElement("p");
      label.className = "pe-quick-answer-learner";
      var strong = document.createElement("strong");
      strong.textContent = "Learner: ";
      label.appendChild(strong);
      label.appendChild(document.createTextNode(text(item.learnerNameOrReference)));
      cards[i].insertBefore(label, cards[i].firstChild ? cards[i].firstChild.nextSibling : null);
    }
  }

  function init() {
    enhanceReviewQueue();
    build();
    annotateManualLearners();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  window.PacificEducationTeacherQuickAnswer = Object.freeze({
    version: VERSION,
    build: build,
    resolveAssignment: resolveAssignment
  });
})(window, document);
