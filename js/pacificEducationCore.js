/*
 * PACIFIC EDUCATION
 * CENTRAL EDUCATION CORE
 * Version 1.0
 *
 * Purpose:
 * Connect the existing Pacific Education lesson, assessment,
 * dashboard and five-minute practice modules through one
 * protected education-state layer.
 *
 * Prototype note:
 * localStorage is suitable for the current prototype only.
 * Production deployment requires secure authentication,
 * server-side authorization, encrypted storage, audit controls,
 * backup and jurisdiction-compliant education-record protection.
 */

(function (window) {
  "use strict";

  const STORAGE_KEY = "pacificEducationCoreState";
  const VERSION = "1.0";

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
    return JSON.parse(JSON.stringify(value));
  }

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (!saved) {
        return clone(DEFAULT_STATE);
      }

      const parsed = JSON.parse(saved);

      return mergeState(clone(DEFAULT_STATE), parsed);
    } catch (error) {
      console.error("Pacific Education Core: unable to load state.", error);
      return clone(DEFAULT_STATE);
    }
  }

  function mergeState(base, source) {
    Object.keys(source || {}).forEach(function (key) {
      if (
        source[key] &&
        typeof source[key] === "object" &&
        !Array.isArray(source[key]) &&
        base[key] &&
        typeof base[key] === "object" &&
        !Array.isArray(base[key])
      ) {
        base[key] = mergeState(base[key], source[key]);
      } else {
        base[key] = source[key];
      }
    });

    return base;
  }

  let state = loadState();

  function saveState() {
    state.version = VERSION;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Pacific Education Core: save failed.", error);
    }
  }

  function timestamp() {
    return new Date().toISOString();
  }

  function id(prefix) {
    return (
      prefix +
      "-" +
      Date.now().toString(36) +
      "-" +
      Math.random().toString(36).substring(2, 8)
    );
  }

  function audit(action, details) {
    state.audit.push({
      auditId: id("AUDIT"),
      action: action,
      details: details || {},
      timestamp: timestamp()
    });

    saveState();
  }

  function emit(eventName, payload) {
    const event = {
      eventId: id("EVENT"),
      name: eventName,
      payload: payload || {},
      timestamp: timestamp()
    };

    state.events.push(event);

    window.dispatchEvent(
      new CustomEvent("pacificEducation:" + eventName, {
        detail: payload || {}
      })
    );

    saveState();

    return event;
  }

  function getState() {
    return clone(state);
  }

  function resetPrototypeState() {
    state = clone(DEFAULT_STATE);
    saveState();

    audit("PROTOTYPE_STATE_RESET");

    emit("stateReset");

    return getState();
  }

  /*
   * IDENTITY
   */

  function setIdentity(identity) {
    state.identity = mergeState(state.identity, identity || {});

    audit("IDENTITY_UPDATED", {
      userId: state.identity.userId,
      role: state.identity.role
    });

    emit("identityUpdated", state.identity);

    return getState().identity;
  }

  /*
   * AUTHORIZATION
   *
   * Authorization must never be inferred from identity alone.
   */

  function authorizeUser(permissionContext) {
    const context = permissionContext || {};

    if (context.authorized !== true) {
      state.identity.authorized = false;

      audit("AUTHORIZATION_DENIED", {
        reason: "Explicit authorization was not provided."
      });

      emit("authorizationDenied");

      return false;
    }

    state.identity.authorized = true;

    audit("AUTHORIZATION_GRANTED", {
      userId: state.identity.userId,
      role: state.identity.role
    });

    emit("authorizationGranted");

    return true;
  }

  function isAuthorized() {
    return state.identity.authorized === true;
  }

  /*
   * WORKSPACE
   */

  function setWorkspace(workspace) {
    if (!isAuthorized()) {
      audit("WORKSPACE_BLOCKED", {
        reason: "User is not authorized."
      });

      return false;
    }

    state.workspace = mergeState(state.workspace, workspace || {});

    audit("WORKSPACE_UPDATED", {
      workspaceId: state.workspace.workspaceId
    });

    emit("workspaceUpdated", state.workspace);

    return clone(state.workspace);
  }

  /*
   * STUDENT
   */

  function setStudent(student) {
    if (!isAuthorized()) {
      audit("STUDENT_ACCESS_BLOCKED", {
        reason: "User is not authorized."
      });

      return false;
    }

    state.student = mergeState(state.student, student || {});

    audit("STUDENT_PROFILE_UPDATED", {
      studentId: state.student.studentId
    });

    emit("studentUpdated", state.student);

    return clone(state.student);
  }

  /*
   * CURRICULUM
   */

  function setCurriculum(curriculum) {
    state.curriculum = mergeState(
      state.curriculum,
      curriculum || {}
    );

    audit("CURRICULUM_UPDATED", {
      subject: state.curriculum.subject,
      verified: state.curriculum.verified
    });

    emit("curriculumUpdated", state.curriculum);

    return clone(state.curriculum);
  }

  /*
   * LESSON
   */

  function setLesson(lesson) {
    state.lesson = mergeState(state.lesson, lesson || {});

    audit("LESSON_UPDATED", {
      lessonId: state.lesson.lessonId,
      day: state.lesson.day,
      subject: state.lesson.subject
    });

    emit("lessonUpdated", state.lesson);

    return clone(state.lesson);
  }

  /*
   * DAILY LEARNING CHECK
   *
   * This must appear before the day's normal activities.
   */

  function createDailyLearningCheck(check) {
    const data = check || {};

    state.dailyLearningCheck = {
      checkId: data.checkId || id("CHECK"),
      concept: data.concept || "",
      questions: Array.isArray(data.questions)
        ? data.questions
        : [],
      attempted: false,
      score: null,
      understandingPercent: null,
      status: "not_started"
    };

    audit("DAILY_LEARNING_CHECK_CREATED", {
      checkId: state.dailyLearningCheck.checkId,
      concept: state.dailyLearningCheck.concept
    });

    emit(
      "dailyLearningCheckCreated",
      state.dailyLearningCheck
    );

    return clone(state.dailyLearningCheck);
  }

  function recordDailyLearningCheck(result) {
    const data = result || {};

    const total = Number(data.total || 0);
    const correct = Number(data.correct || 0);

    let understanding = null;

    if (total > 0) {
      understanding = Math.round((correct / total) * 100);
    }

    state.dailyLearningCheck.attempted = true;
    state.dailyLearningCheck.score = {
      correct: correct,
      total: total
    };
    state.dailyLearningCheck.understandingPercent =
      understanding;

    if (understanding === null) {
      state.dailyLearningCheck.status =
        "teacher_review_required";
    } else if (understanding < 80) {
      state.dailyLearningCheck.status =
        "intervention_required";
    } else {
      state.dailyLearningCheck.status =
        "continue";
    }

    audit("DAILY_LEARNING_CHECK_RECORDED", {
      checkId: state.dailyLearningCheck.checkId,
      understandingPercent: understanding,
      status: state.dailyLearningCheck.status
    });

    emit(
      "dailyLearningCheckRecorded",
      state.dailyLearningCheck
    );

    return clone(state.dailyLearningCheck);
  }

  /*
   * ACTIVITIES
   */

  function addActivity(activity) {
    const data = activity || {};

    const record = {
      activityId: data.activityId || id("ACT"),
      date: data.date || timestamp(),
      subject: data.subject || state.lesson.subject,
      concept: data.concept || state.lesson.concept,
      curriculumVersion:
        data.curriculumVersion ||
        state.curriculum.version,
      title: data.title || "",
      instructions: data.instructions || "",
      assessmentRequired:
        data.assessmentRequired !== false,
      attempted: false,
      status: "assigned"
    };

    state.activities.push(record);

    audit("ACTIVITY_ADDED", {
      activityId: record.activityId,
      subject: record.subject,
      concept: record.concept
    });

    emit("activityAdded", record);

    return clone(record);
  }

  function recordActivityAttempt(activityId, result) {
    const activity = state.activities.find(function (item) {
      return item.activityId === activityId;
    });

    if (!activity) {
      return false;
    }

    const data = result || {};

    activity.attempted = true;
    activity.status = data.status || "attempted";
    activity.score =
      data.score !== undefined ? data.score : null;
    activity.evidenceId = data.evidenceId || null;
    activity.teacherReviewRequired =
      data.teacherReviewRequired === true;

    audit("ACTIVITY_ATTEMPT_RECORDED", {
      activityId: activityId,
      status: activity.status
    });

    emit("activityAttemptRecorded", activity);

    return clone(activity);
  }

  /*
   * LEARNING HISTORY
   *
   * Chronological and protected in the prototype.
   * Production requires server-side protected storage.
   */

  function addLearningHistory(entry) {
    const data = entry || {};

    const record = {
      historyId: id("LH"),
      date: timestamp(),

      studentId:
        data.studentId ||
        state.student.studentId,

      subject:
        data.subject ||
        state.lesson.subject,

      concept:
        data.concept ||
        state.lesson.concept,

      activityId:
        data.activityId || null,

      assessmentId:
        data.assessmentId || null,

      evidenceId:
        data.evidenceId || null,

      understandingPercent:
        data.understandingPercent !== undefined
          ? data.understandingPercent
          : null,

      learningStatus:
        data.learningStatus || "not_assessed",

      skills:
        Array.isArray(data.skills)
          ? data.skills
          : [],

      misconceptions:
        Array.isArray(data.misconceptions)
          ? data.misconceptions
          : [],

      interventionId:
        data.interventionId || null,

      teacherObservation:
        data.teacherObservation || "",

      nextStep:
        data.nextStep || ""
    };

    state.learningHistory.push(record);

    audit("LEARNING_HISTORY_ADDED", {
      historyId: record.historyId,
      studentId: record.studentId,
      concept: record.concept
    });

    emit("learningHistoryUpdated", record);

    return clone(record);
  }

  /*
   * UNDERSTANDING
   */

  function calculateUnderstanding(correct, total) {
    const c = Number(correct);
    const t = Number(total);

    if (!Number.isFinite(c) || !Number.isFinite(t)) {
      return null;
    }

    if (t <= 0) {
      return null;
    }

    return Math.round((c / t) * 100);
  }

  function getUnderstandingStatus(percent) {
    if (percent === null || percent === undefined) {
      return "teacher_review_required";
    }

    if (percent < 80) {
      return "intervention_required";
    }

    return "understanding_demonstrated";
  }

  /*
   * INTERVENTION
   */

  function createIntervention(intervention) {
    const data = intervention || {};

    const record = {
      interventionId:
        data.interventionId || id("INT"),

      studentId:
        data.studentId ||
        state.student.studentId,

      subject:
        data.subject ||
        state.lesson.subject,

      concept:
        data.concept ||
        state.lesson.concept,

      reason:
        data.reason ||
        "Understanding below support threshold.",

      targetUnderstanding:
        data.targetUnderstanding || 80,

      durationMinutes:
        data.durationMinutes || 5,

      activity:
        data.activity || "",

      status: "recommended",

      teacherApproved:
        false,

      createdAt: timestamp()
    };

    state.interventions.push(record);

    audit("INTERVENTION_CREATED", {
      interventionId: record.interventionId,
      concept: record.concept
    });

    emit("interventionCreated", record);

    return clone(record);
  }

  function approveIntervention(interventionId) {
    const intervention = state.interventions.find(
      function (item) {
        return item.interventionId === interventionId;
      }
    );

    if (!intervention) {
      return false;
    }

    intervention.teacherApproved = true;
    intervention.status = "approved";
    intervention.approvedAt = timestamp();

    audit("INTERVENTION_APPROVED", {
      interventionId: interventionId
    });

    emit("interventionApproved", intervention);

    return clone(intervention);
  }

  /*
   * ASSESSMENT
   */

  function addAssessment(assessment) {
    const data = assessment || {};

    const record = {
      assessmentId:
        data.assessmentId || id("ASSESS"),

      studentId:
        data.studentId ||
        state.student.studentId,

      subject:
        data.subject ||
        state.lesson.subject,

      concept:
        data.concept ||
        state.lesson.concept,

      type:
        data.type || "daily_activity",

      activityId:
        data.activityId || null,

      evidenceId:
        data.evidenceId || null,

      marksObtained:
        data.marksObtained !== undefined
          ? data.marksObtained
          : null,

      totalMarks:
        data.totalMarks !== undefined
          ? data.totalMarks
          : null,

      understandingPercent:
        data.understandingPercent !== undefined
          ? data.understandingPercent
          : null,

      aiSuggested:
        data.aiSuggested === true,

      teacherReviewed:
        data.teacherReviewed === true,

      teacherApproved:
        data.teacherApproved === true,

      status:
        data.status || "pending_review",

      createdAt: timestamp()
    };

    state.assessments.push(record);

    audit("ASSESSMENT_ADDED", {
      assessmentId: record.assessmentId,
      subject: record.subject,
      status: record.status
    });

    emit("assessmentAdded", record);

    return clone(record);
  }

  /*
   * MARK TRANSFER
   *
   * Marks are never silently moved.
   */

  function transferMark(assessmentId, markData) {
    const assessment = state.assessments.find(
      function (item) {
        return item.assessmentId === assessmentId;
      }
    );

    if (!assessment) {
      return false;
    }

    if (assessment.teacherApproved !== true) {
      audit("MARK_TRANSFER_BLOCKED", {
        assessmentId: assessmentId,
        reason: "Teacher approval required."
      });

      return false;
    }

    if (!state.student.studentId) {
      audit("MARK_TRANSFER_BLOCKED", {
        assessmentId: assessmentId,
        reason: "Student identity unavailable."
      });

      return false;
    }

    const data = markData || {};

    const mark = {
      markId: id("MARK"),

      studentId:
        state.student.studentId,

      studentName:
        state.student.name,

      assessmentId:
        assessmentId,

      subject:
        assessment.subject,

      concept:
        assessment.concept,

      marksObtained:
        data.marksObtained !== undefined
          ? data.marksObtained
          : assessment.marksObtained,

      totalMarks:
        data.totalMarks !== undefined
          ? data.totalMarks
          : assessment.totalMarks,

      percentage:
        data.percentage !== undefined
          ? data.percentage
          : null,

      status: "teacher_approved",

      locked: true,

      createdAt: timestamp(),

      historyVersion: 1
    };

    state.marks.push(mark);

    audit("MARK_TRANSFERRED_AND_LOCKED", {
      markId: mark.markId,
      studentId: mark.studentId,
      assessmentId: assessmentId
    });

    emit("markTransferred", mark);

    return clone(mark);
  }

  /*
   * PROTECTED MARK EDIT
   *
   * Editing creates a new version.
   * Original information is preserved in audit history.
   */

  function editMark(markId, changes, reason) {
    const mark = state.marks.find(function (item) {
      return item.markId === markId;
    });

    if (!mark) {
      return false;
    }

    const data = changes || {};

    const previous = clone(mark);

    Object.keys(data).forEach(function (key) {
      if (key !== "markId" && key !== "locked") {
        mark[key] = data[key];
      }
    });

    mark.historyVersion =
      Number(mark.historyVersion || 1) + 1;

    mark.locked = true;

    audit("MARK_EDITED", {
      markId: markId,
      reason: reason || "Teacher correction",
      previous: previous,
      current: clone(mark)
    });

    emit("markEdited", mark);

    return clone(mark);
  }

  /*
   * MODULE CONNECTIONS
   */

  function connectModules() {
    const connections = {
      dailyLessons:
        !!(
          window.PacificEducationDailyLessons ||
          window.PacificEducationLessons
        ),

      assessments:
        !!window.PacificEducationAssessments,

      dashboards:
        !!window.PacificEducationDashboards,

      fiveMinutePractice:
        !!window.PacificEducationFiveMinutePractice
    };

    audit("MODULE_CONNECTION_CHECK", connections);

    emit("modulesConnected", connections);

    return connections;
  }

  /*
   * DAILY FLOW
   *
   * The Daily Learning Check must happen before activities.
   */

  function startDailyLearning() {
    if (!isAuthorized()) {
      audit("DAILY_LEARNING_BLOCKED", {
        reason: "User is not authorized."
      });

      return {
        success: false,
        reason: "authorization_required"
      };
    }

    const check = state.dailyLearningCheck;

    if (!check.checkId) {
      return {
        success: false,
        reason: "daily_learning_check_required"
      };
    }

    if (!check.attempted) {
      emit("dailyLearningCheckFirst", check);

      return {
        success: false,
        reason: "daily_learning_check_required",
        check: clone(check)
      };
    }

    if (check.understandingPercent !== null) {
      const status = getUnderstandingStatus(
        check.understandingPercent
      );

      if (status === "intervention_required") {
        const intervention =
          createIntervention({
            concept: check.concept,
            reason:
              "Daily Learning Check below 80%."
          });

        return {
          success: true,
          nextStep: "intervention",
          intervention: intervention
        };
      }
    }

    emit("dailyActivitiesReady", {
      lesson: clone(state.lesson),
      check: clone(check)
    });

    return {
      success: true,
      nextStep: "daily_activities"
    };
  }

  /*
   * PUBLIC API
   */

  window.PacificEducationCore = {

    version: VERSION,

    getState: getState,

    save: saveState,

    resetPrototypeState:
      resetPrototypeState,

    identity: {
      set: setIdentity,
      authorize: authorizeUser,
      isAuthorized: isAuthorized
    },

    workspace: {
      set: setWorkspace
    },

    student: {
      set: setStudent
    },

    curriculum: {
      set: setCurriculum
    },

    lesson: {
      set: setLesson
    },

    dailyLearningCheck: {
      create: createDailyLearningCheck,
      record: recordDailyLearningCheck,
      start: startDailyLearning
    },

    activities: {
      add: addActivity,
      recordAttempt: recordActivityAttempt
    },

    learningHistory: {
      add: addLearningHistory
    },

    understanding: {
      calculate:
        calculateUnderstanding,

      status:
        getUnderstandingStatus
    },

    interventions: {
      create:
        createIntervention,

      approve:
        approveIntervention
    },

    assessments: {
      add:
        addAssessment
    },

    marks: {
      transfer:
        transferMark,

      edit:
        editMark
    },

    modules: {
      connect:
        connectModules
    },

    audit: {
      record:
        audit
    },

    events: {
      emit:
        emit
    }
  };

  /*
   * Initial module connection check.
   */

  connectModules();

  /*
   * Make the core available to other Pacific Education modules.
   */

  emit("coreReady", {
    version: VERSION
  });

})(window);
