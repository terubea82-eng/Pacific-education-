/*
 * Pacific Education — Integration Bridge
 * Version: 1.0.0
 *
 * Purpose:
 * - Connect existing Pacific Education modules to PacificEducationCore.
 * - Preserve existing module behaviour.
 * - Provide a controlled migration/compatibility layer.
 * - Keep prototype localStorage compatibility.
 *
 * Important:
 * - This bridge NEVER grants authorization automatically.
 * - This bridge NEVER stores passwords, tokens, payment credentials,
 *   API keys, or other confidential secrets.
 * - Official/production education records require secure backend
 *   authorization, encryption, audit, backup, and applicable privacy controls.
 */

(function () {
  "use strict";

  const VERSION = "1.0.0";

  const CORE = () => window.PacificEducationCore || null;

  const MODULES = {
    lessons: () =>
      window.PacificEducationDailyLessons ||
      window.PacificEducationLessons ||
      null,

    assessments: () =>
      window.PacificEducationAssessments || null,

    dashboards: () =>
      window.PacificEducationDashboards || null,

    fiveMinutePractice: () =>
      window.PacificEducationFiveMinutePractice || null
  };

  const STORAGE_KEYS = {
    currentDay: "currentDayNumber",
    studentName: "studentName",
    learningStatus: "learningStatus",
    assessments: "pacificEducationAssessments"
  };

  function safeRead(key, fallback = null) {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : value;
    } catch (error) {
      console.warn("[PacificEducationIntegration] Storage read blocked:", error);
      return fallback;
    }
  }

  function safeReadJSON(key, fallback = null) {
    try {
      const value = localStorage.getItem(key);
      if (!value) return fallback;

      const parsed = JSON.parse(value);
      return parsed;
    } catch (error) {
      console.warn("[PacificEducationIntegration] JSON read failed:", error);
      return fallback;
    }
  }

  function safeWrite(key, value) {
    try {
      localStorage.setItem(key, String(value));
      return true;
    } catch (error) {
      console.warn("[PacificEducationIntegration] Storage write blocked:", error);
      return false;
    }
  }

  function emit(name, detail = {}) {
    try {
      window.dispatchEvent(
        new CustomEvent("pacificEducation:integration:" + name, {
          detail: {
            version: VERSION,
            ...detail
          }
        })
      );
    } catch (error) {
      console.warn("[PacificEducationIntegration] Event failed:", error);
    }
  }

  function coreAvailable() {
    return !!CORE();
  }

  function coreAuthorized() {
    const core = CORE();

    if (!core || !core.identity || typeof core.identity.isAuthorized !== "function") {
      return false;
    }

    try {
      return core.identity.isAuthorized() === true;
    } catch (error) {
      return false;
    }
  }

  /*
   * Authorization is intentionally NOT inferred from:
   * - having a name
   * - having a student ID
   * - opening the application
   * - being a parent
   * - being a teacher
   * - having localStorage data
   */
  function requireAuthorization(actionName) {
    if (!coreAvailable()) {
      console.warn(
        "[PacificEducationIntegration] Core unavailable for:",
        actionName
      );
      return false;
    }

    if (!coreAuthorized()) {
      console.warn(
        "[PacificEducationIntegration] Authorization required:",
        actionName
      );

      emit("authorizationRequired", {
        action: actionName
      });

      return false;
    }

    return true;
  }

  function getPrototypeDay() {
    const raw = safeRead(STORAGE_KEYS.currentDay, "1");
    const day = Number(raw);

    if (!Number.isFinite(day)) return 1;

    return Math.min(365, Math.max(1, Math.floor(day)));
  }

  function mirrorExistingState() {
    const core = CORE();

    if (!core || typeof core.getState !== "function") {
      return null;
    }

    const state = core.getState();

    if (!state) return null;

    return state;
  }

  /*
   * Synchronise non-sensitive prototype information.
   *
   * This intentionally does NOT copy:
   * passwords, authentication credentials, payment information,
   * API keys, secrets, private tokens, or unrelated confidential data.
   */
  function syncPrototypeState() {
    const core = CORE();

    if (!core) return false;

    const day = getPrototypeDay();
    const studentName = safeRead(STORAGE_KEYS.studentName, "");
    const learningStatus = safeRead(
      STORAGE_KEYS.learningStatus,
      ""
    );

    try {
      if (core.student && typeof core.student.set === "function") {
        const current = mirrorExistingState();

        const previousStudent =
          current && current.student ? current.student : {};

        core.student.set({
          ...previousStudent,
          name: studentName || previousStudent.name || "",
          currentDay: day
        });
      }

      emit("prototypeStateSynchronized", {
        day,
        hasStudentName: !!studentName,
        learningStatus
      });

      return true;
    } catch (error) {
      console.error(
        "[PacificEducationIntegration] State synchronization failed:",
        error
      );

      return false;
    }
  }

  /*
   * LESSON
   */

  function startLesson(dayNumber = getPrototypeDay()) {
    if (!requireAuthorization("startLesson")) return false;

    const core = CORE();
    const lessons = MODULES.lessons();

    const day = Math.min(
      365,
      Math.max(1, Number(dayNumber) || getPrototypeDay())
    );

    try {
      if (core.lesson && typeof core.lesson.set === "function") {
        core.lesson.set({
          lessonId: "day-" + day,
          day
        });
      }

      let result = null;

      if (lessons && typeof lessons.startDailyLesson === "function") {
        result = lessons.startDailyLesson();
      }

      emit("lessonStarted", {
        day,
        result
      });

      return result || true;
    } catch (error) {
      console.error(
        "[PacificEducationIntegration] Lesson start failed:",
        error
      );

      return false;
    }
  }

  /*
   * DAILY LEARNING CHECK
   *
   * This must be completed before the day's main learning activity
   * is considered unlocked by the Central Education Core.
   */

  function createDailyLearningCheck(data = {}) {
    if (!requireAuthorization("createDailyLearningCheck")) return null;

    const core = CORE();

    if (
      !core.dailyLearningCheck ||
      typeof core.dailyLearningCheck.create !== "function"
    ) {
      return null;
    }

    try {
      const result = core.dailyLearningCheck.create({
        concept: data.concept || "",
        questions: Array.isArray(data.questions)
          ? data.questions
          : [],
        day: data.day || getPrototypeDay(),
        subject: data.subject || ""
      });

      emit("dailyLearningCheckCreated", {
        result
      });

      return result;
    } catch (error) {
      console.error(
        "[PacificEducationIntegration] Daily Learning Check creation failed:",
        error
      );

      return null;
    }
  }

  function startDailyLearningCheck() {
    if (!requireAuthorization("startDailyLearningCheck")) return false;

    const core = CORE();

    if (
      !core.dailyLearningCheck ||
      typeof core.dailyLearningCheck.start !== "function"
    ) {
      return false;
    }

    try {
      const result = core.dailyLearningCheck.start();

      emit("dailyLearningCheckStarted", {
        result
      });

      return result;
    } catch (error) {
      console.error(
        "[PacificEducationIntegration] Daily Learning Check start failed:",
        error
      );

      return false;
    }
  }

  function recordDailyLearningCheck(resultData = {}) {
    if (!requireAuthorization("recordDailyLearningCheck")) return null;

    const core = CORE();

    if (
      !core.dailyLearningCheck ||
      typeof core.dailyLearningCheck.record !== "function"
    ) {
      return null;
    }

    try {
      const result = core.dailyLearningCheck.record(resultData);

      emit("dailyLearningCheckRecorded", {
        result
      });

      return result;
    } catch (error) {
      console.error(
        "[PacificEducationIntegration] Daily Learning Check record failed:",
        error
      );

      return null;
    }
  }

  /*
   * ACTIVITY ATTEMPT
   */

  function addActivity(activity = {}) {
    if (!requireAuthorization("addActivity")) return null;

    const core = CORE();

    if (
      !core.activities ||
      typeof core.activities.add !== "function"
    ) {
      return null;
    }

    try {
      const result = core.activities.add(activity);

      emit("activityAdded", {
        result
      });

      return result;
    } catch (error) {
      console.error(
        "[PacificEducationIntegration] Activity creation failed:",
        error
      );

      return null;
    }
  }

  function recordActivityAttempt(attempt = {}) {
    if (!requireAuthorization("recordActivityAttempt")) return null;

    const core = CORE();

    if (
      !core.activities ||
      typeof core.activities.recordAttempt !== "function"
    ) {
      return null;
    }

    try {
      const result = core.activities.recordAttempt(attempt);

      emit("activityAttemptRecorded", {
        result
      });

      return result;
    } catch (error) {
      console.error(
        "[PacificEducationIntegration] Activity attempt failed:",
        error
      );

      return null;
    }
  }

  /*
   * INTERVENTION
   *
   * Below-threshold learning support should be created from actual
   * evidence rather than assuming the learner simply failed.
   */

  function createIntervention(intervention = {}) {
    if (!requireAuthorization("createIntervention")) return null;

    const core = CORE();

    if (
      !core.interventions ||
      typeof core.interventions.create !== "function"
    ) {
      return null;
    }

    try {
      const result = core.interventions.create(intervention);

      emit("interventionCreated", {
        result
      });

      return result;
    } catch (error) {
      console.error(
        "[PacificEducationIntegration] Intervention creation failed:",
        error
      );

      return null;
    }
  }

  function approveIntervention(interventionId) {
    if (!requireAuthorization("approveIntervention")) return false;

    const core = CORE();

    if (
      !core.interventions ||
      typeof core.interventions.approve !== "function"
    ) {
      return false;
    }

    try {
      const result = core.interventions.approve(interventionId);

      emit("interventionApproved", {
        interventionId,
        result
      });

      return result;
    } catch (error) {
      console.error(
        "[PacificEducationIntegration] Intervention approval failed:",
        error
      );

      return false;
    }
  }

  /*
   * ASSESSMENT
   */

  function recordAssessment(assessment = {}) {
    if (!requireAuthorization("recordAssessment")) return null;

    const core = CORE();

    if (
      !core.assessments ||
      typeof core.assessments.add !== "function"
    ) {
      return null;
    }

    try {
      const result = core.assessments.add(assessment);

      emit("assessmentRecorded", {
        result
      });

      return result;
    } catch (error) {
      console.error(
        "[PacificEducationIntegration] Assessment recording failed:",
        error
      );

      return null;
    }
  }

  /*
   * MARK TRANSFER
   *
   * The Core remains responsible for teacher approval and locking.
   */

  function transferMark(mark = {}) {
    if (!requireAuthorization("transferMark")) return null;

    const core = CORE();

    if (
      !core.marks ||
      typeof core.marks.transfer !== "function"
    ) {
      return null;
    }

    try {
      const result = core.marks.transfer(mark);

      emit("markTransferRequested", {
        result
      });

      return result;
    } catch (error) {
      console.error(
        "[PacificEducationIntegration] Mark transfer failed:",
        error
      );

      return null;
    }
  }

  /*
   * TEACHER MARK EDIT
   *
   * Existing Core audit/history controls remain authoritative.
   */

  function editMark(markId, changes = {}) {
    if (!requireAuthorization("editMark")) return null;

    const core = CORE();

    if (
      !core.marks ||
      typeof core.marks.edit !== "function"
    ) {
      return null;
    }

    try {
      const result = core.marks.edit(markId, changes);

      emit("markEdited", {
        markId,
        result
      });

      return result;
    } catch (error) {
      console.error(
        "[PacificEducationIntegration] Mark edit failed:",
        error
      );

      return null;
    }
  }

  /*
   * FIVE-MINUTE PRACTICE
   */

  function getFiveMinutePractice(dayNumber = getPrototypeDay()) {
    const practice = MODULES.fiveMinutePractice();

    if (
      !practice ||
      typeof practice.generateFiveMinutePractice !== "function"
    ) {
      return null;
    }

    try {
      return practice.generateFiveMinutePractice(dayNumber);
    } catch (error) {
      console.error(
        "[PacificEducationIntegration] Five-minute practice failed:",
        error
      );

      return null;
    }
  }

  /*
   * MODULE CONNECTION
   */

  function connectModules() {
    const core = CORE();

    if (
      !core ||
      typeof core.modules?.connect !== "function"
    ) {
      return false;
    }

    try {
      const result = core.modules.connect({
        lessons: MODULES.lessons(),
        assessments: MODULES.assessments(),
        dashboards: MODULES.dashboards(),
        fiveMinutePractice: MODULES.fiveMinutePractice()
      });

      emit("modulesConnected", {
        result
      });

      return result || true;
    } catch (error) {
      console.error(
        "[PacificEducationIntegration] Module connection failed:",
        error
      );

      return false;
    }
  }

  /*
   * CORE EVENT BRIDGE
   *
   * These listeners do not grant authorization.
   */

  function listenForCoreEvents() {
    const events = [
      "lesson:set",
      "dailyLearningCheck:create",
      "dailyLearningCheck:record",
      "activity:add",
      "activity:attempt",
      "assessment:add",
      "intervention:create",
      "intervention:approve",
      "mark:transfer",
      "mark:edit"
    ];

    events.forEach((eventName) => {
      window.addEventListener(
        "pacificEducation:" + eventName,
        function (event) {
          emit("coreEvent", {
            coreEvent: eventName,
            detail: event && event.detail
              ? event.detail
              : null
          });
        }
      );
    });
  }

  /*
   * SAFE INITIALIZATION
   *
   * No automatic authorization.
   * No automatic student access.
   * No automatic parent access.
   */

  function initialize() {
    if (!coreAvailable()) {
      console.warn(
        "[PacificEducationIntegration] PacificEducationCore not available yet."
      );

      emit("coreUnavailable");

      return false;
    }

    syncPrototypeState();
    connectModules();
    listenForCoreEvents();

    emit("initialized", {
      coreAvailable: true,
      authorized: coreAuthorized()
    });

    return true;
  }

  /*
   * Public API
   */

  window.PacificEducationIntegration = {
    version: VERSION,

    initialize,
    coreAvailable,
    coreAuthorized,
    mirrorExistingState,
    syncPrototypeState,

    lesson: {
      start: startLesson
    },

    dailyLearningCheck: {
      create: createDailyLearningCheck,
      start: startDailyLearningCheck,
      record: recordDailyLearningCheck
    },

    activities: {
      add: addActivity,
      recordAttempt: recordActivityAttempt
    },

    interventions: {
      create: createIntervention,
      approve: approveIntervention
    },

    assessments: {
      record: recordAssessment
    },

    marks: {
      transfer: transferMark,
      edit: editMark
    },

    fiveMinutePractice: {
      generate: getFiveMinutePractice
    },

    modules: {
      connect: connectModules
    }
  };

  /*
   * Initialize after the page has loaded.
   *
   * If the Core is loaded later, the public initialize()
   * function can be called again safely.
   */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }

})();
