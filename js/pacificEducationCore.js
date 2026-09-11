/* PACIFIC EDUCATION - CENTRAL EDUCATION CORE - Version 1.2.2 */
(function (window) {
  "use strict";

  const VERSION = "1.2.2";
  const STORAGE_KEY = "pacificEducationCoreState";
  const PASS_MARK = 80;

  const ROLES = Object.freeze([
    "student",
    "teacher",
    "parent",
    "ministry",
    "head_of_school",
    "examiner",
    "owner",
    "admin"
  ]);

  const DEFAULT_STATE = {
    version: VERSION,

    identity: {
      userId: null,
      name: "",
      role: null,
      country: "",
      jurisdiction: "",
      schoolId: null,
      classId: null,
      authorized: false
    },

    workspace: {
      workspaceId: null,
      type: "personal",
      status: "active"
    },

    student: {
      studentId: null,
      name: "",
      yearForm: "",
      className: "",
      subjects: []
    },

    curriculum: {
      country: "",
      jurisdiction: "",
      version: "",
      yearForm: "",
      subject: "",
      currentConcept: "",
      verified: false
    },

    lesson: {
      lessonId: null,
      day: null,
      subject: "",
      title: "",
      concept: "",
      status: "not_started"
    },

    dailyLearningCheck: {
      checkId: null,
      concept: "",
      questions: [],
      attempted: false,
      score: null,
      understandingPercent: null,
      status: "not_started"
    },

    activities: [],
    learningHistory: [],
    assessments: [],
    marks: [],
    interventions: [],
    audit: [],
    events: []
  };

  function clone(value) {
    try {
      return JSON.parse(JSON.stringify(value));
    } catch (error) {
      return null;
    }
  }

  function isObject(value) {
    return !!(
      value &&
      typeof value === "object" &&
      !Array.isArray(value)
    );
  }

  function merge(target, source) {
    if (!isObject(source)) return target;

    Object.keys(source).forEach(function (key) {
      if (
        isObject(source[key]) &&
        isObject(target[key])
      ) {
        merge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    });

    return target;
  }

  function now() {
    return new Date().toISOString();
  }

  function makeId(prefix) {
    return (
      prefix +
      "-" +
      Date.now().toString(36) +
      "-" +
      Math.random().toString(36).slice(2, 9)
    );
  }

  function loadState() {
    try {
      const raw =
        window.localStorage &&
        window.localStorage.getItem(STORAGE_KEY);

      if (!raw) {
        return clone(DEFAULT_STATE);
      }

      return merge(
        clone(DEFAULT_STATE),
        JSON.parse(raw)
      );
    } catch (error) {
      return clone(DEFAULT_STATE);
    }
  }

  let state = loadState();

  function saveState() {
    state.version = VERSION;

    try {
      if (window.localStorage) {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(state)
        );
      }
    } catch (error) {
      console.error(
        "Pacific Education Core save failed",
        error
      );
    }
  }

  function audit(action, details) {
    state.audit.push({
      auditId: makeId("AUDIT"),
      action: action,
      details: isObject(details)
        ? clone(details)
        : {},
      timestamp: now()
    });

    saveState();
  }

  function emit(name, payload) {
    const event = {
      eventId: makeId("EVENT"),
      name: name,
      payload: clone(payload) || {},
      timestamp: now()
    };

    state.events.push(event);

    if (
      typeof window.dispatchEvent === "function" &&
      typeof window.CustomEvent === "function"
    ) {
      window.dispatchEvent(
        new CustomEvent(
          "pacificEducation:" + name,
          {
            detail: event.payload
          }
        )
      );
    }

    saveState();

    return clone(event);
  }

  function isAuthorized() {
    return !!(
      state.identity &&
      state.identity.authorized === true
    );
  }

  function requireAuthorization(action) {
    if (isAuthorized()) {
      return true;
    }

    audit(
      String(action || "ACTION") + "_BLOCKED",
      {
        reason: "User is not authorized."
      }
    );

    return false;
  }

  function setIdentity(value) {
    if (!isObject(value)) {
      return false;
    }

    state.identity = merge(
      state.identity,
      value
    );

    if (value.authorized !== true) {
      state.identity.authorized = false;
    }

    audit(
      "IDENTITY_UPDATED",
      {
        userId: state.identity.userId,
        role: state.identity.role,
        authorized: state.identity.authorized
      }
    );

    emit(
      "identityUpdated",
      state.identity
    );

    return clone(state.identity);
  }

  function authorizeUser(context) {
    if (
      !isObject(context) ||
      context.authorized !== true
    ) {
      state.identity.authorized = false;

      audit(
        "AUTHORIZATION_DENIED",
        {}
      );

      return false;
    }

    if (
      context.role &&
      ROLES.indexOf(context.role) === -1
    ) {
      audit(
        "AUTHORIZATION_DENIED",
        {
          reason: "Invalid role."
        }
      );

      return false;
    }

    state.identity = merge(
      state.identity,
      context
    );

    state.identity.authorized = true;

    audit(
      "AUTHORIZATION_GRANTED",
      {
        userId: state.identity.userId,
        role: state.identity.role
      }
    );

    emit(
      "authorizationGranted",
      state.identity
    );

    return true;
  }

  function getIdentity() {
    return clone(state.identity);
  }

  const identity = {
    set: setIdentity,
    get: getIdentity,
    isAuthorized: isAuthorized,
    authorize: authorizeUser
  };

  function protectedSet(
    section,
    value,
    action,
    eventName
  ) {
    if (
      !requireAuthorization(action) ||
      !isObject(value)
    ) {
      return false;
    }

    state[section] = merge(
      state[section],
      value
    );

    audit(
      action + "_UPDATED",
      value
    );

    emit(
      eventName,
      state[section]
    );

    return clone(state[section]);
  }

  function setWorkspace(value) {
    return protectedSet(
      "workspace",
      value,
      "WORKSPACE",
      "workspaceUpdated"
    );
  }

  function getWorkspace() {
    return clone(state.workspace);
  }

  function setStudent(value) {
    return protectedSet(
      "student",
      value,
      "STUDENT",
      "studentUpdated"
    );
  }

  function getStudent() {
    return clone(state.student);
  }

  function setCurriculum(value) {
    return protectedSet(
      "curriculum",
      value,
      "CURRICULUM",
      "curriculumUpdated"
    );
  }

  function getCurriculum() {
    return clone(state.curriculum);
  }

  function setLesson(value) {
    return protectedSet(
      "lesson",
      value,
      "LESSON",
      "lessonUpdated"
    );
  }

  function getLesson() {
    return clone(state.lesson);
  }

  function createDailyLearningCheck(value) {
    if (
      !requireAuthorization(
        "DAILY_LEARNING_CHECK_CREATE"
      )
    ) {
      return false;
    }

    value = isObject(value)
      ? value
      : {};

    state.dailyLearningCheck = {
      checkId:
        value.checkId ||
        makeId("CHECK"),

      concept:
        typeof value.concept === "string"
          ? value.concept
          : "",

      questions:
        Array.isArray(value.questions)
          ? clone(value.questions)
          : [],

      attempted: false,
      score: null,
      understandingPercent: null,
      status: "not_started"
    };

    audit(
      "DAILY_LEARNING_CHECK_CREATED",
      {
        checkId:
          state.dailyLearningCheck.checkId
      }
    );

    emit(
      "dailyLearningCheckCreated",
      state.dailyLearningCheck
    );

    return clone(
      state.dailyLearningCheck
    );
  }

  /*
   * IMPORTANT COMPATIBILITY API
   * Existing modules require:
   * core.startDailyLearning()
   */
  function startDailyLearning(options) {
    if (
      !requireAuthorization(
        "DAILY_LEARNING_START"
      )
    ) {
      return false;
    }

    options = isObject(options)
      ? options
      : {};

    if (isObject(options.lesson)) {
      setLesson(options.lesson);
    }

    return createDailyLearningCheck(
      isObject(options.check)
        ? options.check
        : {
            concept:
              options.concept ||
              state.lesson.concept ||
              "",

            questions:
              Array.isArray(options.questions)
                ? options.questions
                : []
          }
    );
  }

  function recordDailyLearningCheck(value) {
    if (
      !requireAuthorization(
        "DAILY_LEARNING_CHECK_RECORD"
      )
    ) {
      return false;
    }

    value = isObject(value)
      ? value
      : {};

    const total = Number(value.total);
    const correct = Number(value.correct);

    let percentage = null;

    if (
      Number.isFinite(total) &&
      total > 0 &&
      Number.isFinite(correct)
    ) {
      percentage = Math.round(
        (
          Math.max(
            0,
            Math.min(correct, total)
          ) /
          total
        ) * 100
      );
    }

    state.dailyLearningCheck.attempted =
      true;

    state.dailyLearningCheck.score = {
      correct:
        Number.isFinite(correct)
          ? correct
          : 0,

      total:
        Number.isFinite(total)
          ? total
          : 0
    };

    state.dailyLearningCheck
      .understandingPercent =
      percentage;

    state.dailyLearningCheck.status =
      percentage === null
        ? "teacher_review_required"
        : percentage < PASS_MARK
          ? "intervention_required"
          : "continue";

    audit(
      "DAILY_LEARNING_CHECK_RECORDED",
      {
        checkId:
          state.dailyLearningCheck.checkId,

        understandingPercent:
          percentage,

        status:
          state.dailyLearningCheck.status
      }
    );

    emit(
      "dailyLearningCheckRecorded",
      state.dailyLearningCheck
    );

    return clone(
      state.dailyLearningCheck
    );
  }

  const dailyLearningCheck = {
    start: startDailyLearning,
    create: createDailyLearningCheck,
    record: recordDailyLearningCheck,

    get: function () {
      return clone(
        state.dailyLearningCheck
      );
    }
  };

  function addActivity(value) {
    if (
      !requireAuthorization(
        "ACTIVITY_ADD"
      )
    ) {
      return false;
    }

    value = isObject(value)
      ? value
      : {};

    const activity = {
      activityId:
        value.activityId ||
        makeId("ACT"),

      date:
        value.date ||
        now(),

      subject:
        value.subject ||
        "",

      title:
        value.title ||
        "",

      concept:
        value.concept ||
        "",

      status:
        value.status ||
        "assigned",

      evidence:
        value.evidence ||
        null,

      attempts: []
    };

    state.activities.push(activity);

    audit(
      "ACTIVITY_ADDED",
      {
        activityId:
          activity.activityId
      }
    );

    emit(
      "activityAdded",
      activity
    );

    return clone(activity);
  }

  function recordActivityAttempt(
    activityId,
    result
  ) {
    if (
      !requireAuthorization(
        "ACTIVITY_ATTEMPT"
      )
    ) {
      return false;
    }

    const activity =
      state.activities.find(
        function (item) {
          return (
            item.activityId ===
            activityId
          );
        }
      );

    if (!activity) {
      return false;
    }

    if (
      !Array.isArray(
        activity.attempts
      )
    ) {
      activity.attempts = [];
    }

    const attempt = {
      attemptId:
        makeId("ATTEMPT"),

      result:
        clone(result),

      timestamp:
        now()
    };

    activity.attempts.push(attempt);

    audit(
      "ACTIVITY_ATTEMPT_RECORDED",
      {
        activityId:
          activityId
      }
    );

    emit(
      "activityAttemptRecorded",
      {
        activityId:
          activityId,

        result:
          clone(result)
      }
    );

    return clone(activity);
  }

  function getActivities() {
    return clone(state.activities);
  }

  function addAssessment(value) {
    if (
      !requireAuthorization(
        "ASSESSMENT_ADD"
      ) ||
      !isObject(value)
    ) {
      return false;
    }

    const assessment =
      clone(value);

    assessment.assessmentId =
      assessment.assessmentId ||
      makeId("ASSESSMENT");

    assessment.createdAt =
      assessment.createdAt ||
      now();

    if (
      typeof assessment.score ===
        "number" &&
      typeof assessment.pass !==
        "boolean"
    ) {
      assessment.pass =
        assessment.score >=
        PASS_MARK;
    }

    state.assessments.push(
      assessment
    );

    audit(
      "ASSESSMENT_ADDED",
      {
        assessmentId:
          assessment.assessmentId,

        type:
          assessment.type ||
          assessment.assessmentType ||
          "",

        score:
          assessment.score,

        pass:
          assessment.pass
      }
    );

    emit(
      "assessmentAdded",
      assessment
    );

    return clone(assessment);
  }

  const assessments = {
    add: addAssessment,
    record: addAssessment,

    getAll: function () {
      return clone(
        state.assessments
      );
    },

    getById: function (assessmentId) {
      return clone(
        state.assessments.find(
          function (item) {
            return (
              item.assessmentId ===
              assessmentId
            );
          }
        ) || null
      );
    },

    latest: function () {
      return clone(
        state.assessments[
          state.assessments.length - 1
        ] || null
      );
    }
  };

  function transferMark(
    assessmentId,
    value
  ) {
    if (
      !requireAuthorization(
        "MARK_TRANSFER"
      ) ||
      typeof assessmentId !==
        "string" ||
      !assessmentId.trim()
    ) {
      return false;
    }

    value = isObject(value)
      ? clone(value)
      : {};

    const mark = {
      markId:
        makeId("MARK"),

      assessmentId:
        assessmentId,

      studentId:
        value.studentId ||
        state.student.studentId ||
        null,

      score:
        value.score !== undefined
          ? value.score
          : null,

      percentage:
        value.percentage !==
        undefined
          ? value.percentage
          : value.score !== undefined
            ? value.score
            : null,

      grade:
        value.grade ||
        "",

      subject:
        value.subject ||
        state.lesson.subject ||
        "",

      status:
        value.status ||
        "verified",

      source:
        value.source ||
        "assessment",

      createdAt:
        now(),

      updatedAt:
        now()
    };

    state.marks.push(mark);

    audit(
      "MARK_TRANSFERRED",
      {
        markId:
          mark.markId,

        assessmentId:
          assessmentId
      }
    );

    emit(
      "markTransferred",
      mark
    );

    return clone(mark);
  }

  function editMark(
    markId,
    changes,
    reason
  ) {
    if (
      !requireAuthorization(
        "MARK_EDIT"
      )
    ) {
      return false;
    }

    const mark =
      state.marks.find(
        function (item) {
          return (
            item.markId ===
            markId
          );
        }
      );

    if (!mark) {
      return false;
    }

    changes = isObject(changes)
      ? changes
      : {};

    Object.keys(changes)
      .forEach(function (key) {
        if (key !== "markId") {
          mark[key] =
            clone(changes[key]);
        }
      });

    mark.updatedAt = now();

    mark.editReason =
      typeof reason === "string"
        ? reason
        : "Authorized mark correction";

    audit(
      "MARK_EDITED",
      {
        markId:
          markId,

        reason:
          mark.editReason
      }
    );

    emit(
      "markEdited",
      mark
    );

    return clone(mark);
  }

  const marks = {
    transfer: transferMark,
    edit: editMark,

    getAll: function () {
      return clone(state.marks);
    },

    getById: function (markId) {
      return clone(
        state.marks.find(
          function (item) {
            return (
              item.markId ===
              markId
            );
          }
        ) || null
      );
    }
  };

  function createIntervention(value) {
    if (
      !requireAuthorization(
        "INTERVENTION_CREATE"
      )
    ) {
      return false;
    }

    value = isObject(value)
      ? value
      : {};

    const intervention = {
      interventionId:
        makeId("INTERVENTION"),

      studentId:
        value.studentId ||
        state.student.studentId ||
        null,

      reason:
        value.reason ||
        "",

      target:
        value.target ||
        "",

      action:
        value.action ||
        "",

      status:
        "proposed",

      createdAt:
        now()
    };

    state.interventions.push(
      intervention
    );

    audit(
      "INTERVENTION_CREATED",
      {
        interventionId:
          intervention.interventionId
      }
    );

    emit(
      "interventionCreated",
      intervention
    );

    return clone(
      intervention
    );
  }

  function approveIntervention(
    interventionId,
    approver
  ) {
    if (
      !requireAuthorization(
        "INTERVENTION_APPROVE"
      )
    ) {
      return false;
    }

    const intervention =
      state.interventions.find(
        function (item) {
          return (
            item.interventionId ===
            interventionId
          );
        }
      );

    if (!intervention) {
      return false;
    }

    intervention.status =
      "approved";

    intervention.approvedBy =
      approver ||
      state.identity.userId ||
      state.identity.name ||
      "";

    intervention.approvedAt =
      now();

    audit(
      "INTERVENTION_APPROVED",
      {
        interventionId:
          interventionId
      }
    );

    emit(
      "interventionApproved",
      intervention
    );

    return clone(
      intervention
    );
  }

  function getInterventions() {
    return clone(
      state.interventions
    );
  }

  function recordLearningHistory(
    value
  ) {
    if (
      !requireAuthorization(
        "LEARNING_HISTORY_RECORD"
      )
    ) {
      return false;
    }

    value = isObject(value)
      ? value
      : {};

    const entry = {
      historyId:
        makeId("HISTORY"),

      timestamp:
        now(),

      studentId:
        value.studentId ||
        state.student.studentId ||
        null,

      day:
        value.day !== undefined
          ? value.day
          : state.lesson.day,

      subject:
        value.subject ||
        state.lesson.subject ||
        "",

      concept:
        value.concept ||
        state.lesson.concept ||
        "",

      status:
        value.status ||
        "recorded",

      evidence:
        value.evidence ||
        null
    };

    state.learningHistory.push(
      entry
    );

    audit(
      "LEARNING_HISTORY_RECORDED",
      {
        historyId:
          entry.historyId
      }
    );

    emit(
      "learningHistoryRecorded",
      entry
    );

    return clone(entry);
  }

  function getLearningHistory() {
    return clone(
      state.learningHistory
    );
  }

  function getUnderstandingStatus() {
    return {
      percentage:
        state.dailyLearningCheck
          .understandingPercent,

      status:
        state.dailyLearningCheck
          .status,

      interventionRequired:
        state.dailyLearningCheck
          .status ===
        "intervention_required"
    };
  }

  function getAssessments() {
    return clone(
      state.assessments
    );
  }

  function getAssessmentById(
    assessmentId
  ) {
    return assessments.getById(
      assessmentId
    );
  }

  function getLatestAssessment() {
    return assessments.latest();
  }

  function getMarks() {
    return clone(
      state.marks
    );
  }

  function getMarkById(markId) {
    return marks.getById(
      markId
    );
  }

  function getStatus() {
    return {
      version:
        VERSION,

      authorized:
        isAuthorized(),

      identity:
        clone(state.identity),

      workspace:
        clone(state.workspace),

      student:
        clone(state.student),

      curriculum:
        clone(state.curriculum),

      lesson:
        clone(state.lesson),

      dailyLearningCheck:
        clone(
          state.dailyLearningCheck
        ),

      assessments:
        state.assessments.length,

      marks:
        state.marks.length,

      interventions:
        state.interventions.length,

      activities:
        state.activities.length,

      learningHistory:
        state.learningHistory.length
    };
  }

  function connectModules(modules) {
    modules = isObject(modules)
      ? modules
      : {};

    audit(
      "MODULES_CONNECTED",
      {
        modules:
          Object.keys(modules)
      }
    );

    emit(
      "modulesConnected",
      {
        modules:
          Object.keys(modules)
      }
    );

    return {
      connected: true,

      modules:
        Object.keys(modules),

      version:
        VERSION
    };
  }

  function resetPrototypeState() {
    state =
      clone(DEFAULT_STATE);

    saveState();

    audit(
      "PROTOTYPE_STATE_RESET",
      {}
    );

    emit(
      "prototypeStateReset",
      {}
    );

    return true;
  }

  const api = {
    version: VERSION,
    PASS_MARK: PASS_MARK,
    ROLES: ROLES,

    identity: identity,

    isAuthorized:
      isAuthorized,

    authorizeUser:
      authorizeUser,

    requireAuthorization:
      requireAuthorization,

    setIdentity:
      setIdentity,

    getIdentity:
      getIdentity,

    setWorkspace:
      setWorkspace,

    getWorkspace:
      getWorkspace,

    setStudent:
      setStudent,

    getStudent:
      getStudent,

    setCurriculum:
      setCurriculum,

    getCurriculum:
      getCurriculum,

    setLesson:
      setLesson,

    getLesson:
      getLesson,

    /*
     * Compatibility aliases required by
     * existing Pacific Education modules.
     */
    startDailyLearning:
      startDailyLearning,

    dailyLearningCheck:
      dailyLearningCheck,

    createDailyLearningCheck:
      createDailyLearningCheck,

    recordDailyLearningCheck:
      recordDailyLearningCheck,

    addActivity:
      addActivity,

    recordActivityAttempt:
      recordActivityAttempt,

    getActivities:
      getActivities,

    assessments:
      assessments,

    addAssessment:
      addAssessment,

    getAssessments:
      getAssessments,

    getAssessmentById:
      getAssessmentById,

    getLatestAssessment:
      getLatestAssessment,

    marks:
      marks,

    transferMark:
      transferMark,

    editMark:
      editMark,

    getMarks:
      getMarks,

    getMarkById:
      getMarkById,

    createIntervention:
      createIntervention,

    approveIntervention:
      approveIntervention,

    getInterventions:
      getInterventions,

    recordLearningHistory:
      recordLearningHistory,

    getLearningHistory:
      getLearningHistory,

    getUnderstandingStatus:
      getUnderstandingStatus,

    getStatus:
      getStatus,

    connectModules:
      connectModules,

    resetPrototypeState:
      resetPrototypeState
  };

  window.PacificEducationCore =
    Object.freeze(api);

  emit(
    "coreReady",
    {
      version:
        VERSION
    }
  );

})(window);
