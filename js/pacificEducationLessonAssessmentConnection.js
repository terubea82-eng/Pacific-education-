/*
 * Pacific Education — Lesson / Assessment Connection
 * Version: 1.2.0
 *
 * Purpose:
 * - Connect lesson completion with protected assessment checkpoints.
 * - Core is the authority for real learner progress.
 * - localStorage is used only as a compatibility/UI fallback.
 * - Day 30 requires a passed Core Alphabet assessment.
 * - Day 60 requires a passed Core Phonics assessment.
 * - Owner Test Mode remains separate from real learner progress.
 */

(function (window) {
  "use strict";

  const VERSION = "1.2.0";

  const DAY_ALPHABET = 30;
  const DAY_PHONICS = 60;

  const OWNER_TEST_KEY = "pacificOwnerTestDay";
  const LEGACY_DAY_KEY = "currentDayNumber";

  const ASSESSMENT_TYPES = {
    ALPHABET: "alphabet",
    PHONICS: "phonics"
  };

  let completionConnected = false;
  let monitorStarted = false;
  let resultMonitor = null;
  let lastAssessmentSignature = "";

  function getCore() {
    return window.PacificEducationCore || null;
  }

  function isAuthorized() {
    const core = getCore();

    return !!(
      core &&
      core.identity &&
      typeof core.identity.isAuthorized === "function" &&
      core.identity.isAuthorized()
    );
  }

  function getConnections() {
    return {
      core: !!getCore(),
      assessments: !!window.PacificEducationAssessments,
      dashboards: !!window.PacificEducationDashboards,
      dailyLessons: !!window.PacificEducationDailyLessons
    };
  }

  function enginesReady() {
    const connections = getConnections();

    return (
      connections.core &&
      connections.assessments &&
      connections.dailyLessons
    );
  }

  function safeNumber(value, fallback) {
    const number = Number(value);

    return Number.isFinite(number) ? number : fallback;
  }

  function getCurrentDay() {
    const core = getCore();

    /*
     * Core is the authoritative source for real learner progression.
     */
    if (
      core &&
      typeof core.getState === "function"
    ) {
      try {
        const state = core.getState();

        if (
          state &&
          state.lesson &&
          Number.isFinite(Number(state.lesson.day))
        ) {
          return Math.max(
            1,
            Math.min(
              365,
              Math.floor(Number(state.lesson.day))
            )
          );
        }
      } catch (error) {
        console.warn(
          "Pacific Education: unable to read Core lesson day.",
          error
        );
      }
    }

    /*
     * Compatibility fallback only.
     */
    try {
      const stored = Number(
        window.localStorage.getItem(LEGACY_DAY_KEY)
      );

      if (Number.isFinite(stored)) {
        return Math.max(
          1,
          Math.min(365, Math.floor(stored))
        );
      }
    } catch (error) {
      console.warn(
        "Pacific Education: unable to read legacy day.",
        error
      );
    }

    return 1;
  }

  function isOwnerTestMode() {
    try {
      const value = window.localStorage.getItem(
        OWNER_TEST_KEY
      );

      return (
        value !== null &&
        value !== "" &&
        Number.isFinite(Number(value))
      );
    } catch (error) {
      return false;
    }
  }

  function normalizeAssessmentType(type) {
    if (!type) {
      return "";
    }

    return String(type)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_");
  }

  function assessmentTypeMatches(result, requestedType) {
    if (!result || typeof result !== "object") {
      return false;
    }

    const requested = normalizeAssessmentType(
      requestedType
    );

    const candidates = [
      result.type,
      result.assessmentType,
      result.assessment_type,
      result.name
    ]
      .filter(Boolean)
      .map(normalizeAssessmentType);

    if (requested === ASSESSMENT_TYPES.ALPHABET) {
      return candidates.some(function (value) {
        return (
          value === "alphabet" ||
          value === "alphabet_assessment" ||
          value === "day_30_alphabet" ||
          value === "day30_alphabet"
        );
      });
    }

    if (requested === ASSESSMENT_TYPES.PHONICS) {
      return candidates.some(function (value) {
        return (
          value === "phonics" ||
          value === "phonics_assessment" ||
          value === "day_60_phonics" ||
          value === "day60_phonics"
        );
      });
    }

    return candidates.indexOf(requested) !== -1;
  }

  function assessmentDayMatches(result, day) {
    if (!result || typeof result !== "object") {
      return false;
    }

    const requestedDay = Number(day);

    const candidates = [
      result.day,
      result.dayNumber,
      result.day_number,
      result.lessonDay,
      result.lesson_day
    ];

    return candidates.some(function (value) {
      return (
        Number.isFinite(Number(value)) &&
        Number(value) === requestedDay
      );
    });
  }

  function assessmentTimestamp(result) {
    if (!result || typeof result !== "object") {
      return 0;
    }

    const candidates = [
      result.completedAt,
      result.completed_at,
      result.timestamp,
      result.createdAt,
      result.created_at,
      result.date
    ];

    for (let index = 0; index < candidates.length; index += 1) {
      const value = candidates[index];

      if (!value) {
        continue;
      }

      const parsed = Date.parse(value);

      if (Number.isFinite(parsed)) {
        return parsed;
      }

      const number = Number(value);

      if (Number.isFinite(number)) {
        return number;
      }
    }

    return 0;
  }

  function assessmentPassed(result) {
    if (!result || typeof result !== "object") {
      return false;
    }

    return (
      result.passed === true ||
      result.pass === true ||
      result.status === "passed" ||
      result.status === "PASS"
    );
  }

  function getAllCoreAssessments() {
    const core = getCore();

    if (!core || !isAuthorized()) {
      return [];
    }

    try {
      if (
        core.assessments &&
        typeof core.assessments.getAll === "function"
      ) {
        const records = core.assessments.getAll();

        return Array.isArray(records)
          ? records
          : [];
      }

      if (
        core.assessments &&
        typeof core.assessments.latest === "function"
      ) {
        const latest = core.assessments.latest();

        if (!latest) {
          return [];
        }

        return Array.isArray(latest)
          ? latest
          : [latest];
      }
    } catch (error) {
      console.warn(
        "Pacific Education: unable to read protected assessments.",
        error
      );
    }

    return [];
  }

  function getLatestProtectedAssessment(type, day) {
    const core = getCore();

    if (!core || !isAuthorized()) {
      return null;
    }

    try {
      if (
        core.assessments &&
        typeof core.assessments.latest === "function"
      ) {
        const latest = core.assessments.latest();

        if (
          latest &&
          assessmentTypeMatches(latest, type) &&
          assessmentDayMatches(latest, day)
        ) {
          return latest;
        }
      }
    } catch (error) {
      console.warn(
        "Pacific Education: Core latest assessment lookup failed.",
        error
      );
    }

    const records = getAllCoreAssessments();

    const matches = records.filter(function (record) {
      return (
        assessmentTypeMatches(record, type) &&
        assessmentDayMatches(record, day)
      );
    });

    if (!matches.length) {
      return null;
    }

    matches.sort(function (a, b) {
      return (
        assessmentTimestamp(b) -
        assessmentTimestamp(a)
      );
    });

    return matches[0];
  }

  function hasPassedProtectedAssessment(type, day) {
    if (!isAuthorized()) {
      return false;
    }

    const result = getLatestProtectedAssessment(
      type,
      day
    );

    return assessmentPassed(result);
  }

  function checkpointBlocksCompletion(day) {
    const currentDay = Number(day);

    /*
     * Real learner completion must be authorized by Core.
     */
    if (!isAuthorized()) {
      return true;
    }

    if (currentDay === DAY_ALPHABET) {
      return !hasPassedProtectedAssessment(
        ASSESSMENT_TYPES.ALPHABET,
        DAY_ALPHABET
      );
    }

    if (currentDay === DAY_PHONICS) {
      return !hasPassedProtectedAssessment(
        ASSESSMENT_TYPES.PHONICS,
        DAY_PHONICS
      );
    }

    return false;
  }

  function showCheckpointMessage(day) {
    const currentDay = Number(day);

    let message =
      "This learning checkpoint must be completed before the lesson can be recorded.";

    if (currentDay === DAY_ALPHABET) {
      message =
        "Day 30 requires a passed Alphabet Assessment before this lesson can be completed.";
    }

    if (currentDay === DAY_PHONICS) {
      message =
        "Day 60 requires a passed Phonics Assessment before this lesson can be completed.";
    }

    let existing = document.getElementById(
      "pacificAssessmentCheckpointMessage"
    );

    if (!existing) {
      existing = document.createElement("div");
      existing.id =
        "pacificAssessmentCheckpointMessage";

      existing.setAttribute(
        "role",
        "alert"
      );

      existing.style.padding = "14px";
      existing.style.margin = "12px 0";
      existing.style.border =
        "2px solid #b00020";
      existing.style.borderRadius =
        "8px";
      existing.style.background =
        "#fff4f4";
      existing.style.color =
        "#7a0017";
      existing.style.fontWeight =
        "600";

      const container =
        document.getElementById(
          "dailyLessonContainer"
        ) ||
        document.getElementById(
          "lessonContainer"
        ) ||
        document.body;

      container.prepend(existing);
    }

    existing.textContent = "";

    const text =
      document.createElement("div");

    text.textContent = message;

    existing.appendChild(text);

    const assessmentButton =
      document.createElement("button");

    assessmentButton.type = "button";

    assessmentButton.style.marginTop =
      "10px";

    assessmentButton.textContent =
      currentDay === DAY_PHONICS
        ? "Open Phonics Assessment"
        : "Open Alphabet Assessment";

    assessmentButton.addEventListener(
      "click",
      function () {
        if (
          window.PacificEducationAssessments &&
          typeof window
            .PacificEducationAssessments.startAlphabet ===
            "function" &&
          currentDay === DAY_ALPHABET
        ) {
          window.PacificEducationAssessments.startAlphabet();
          return;
        }

        if (
          window.PacificEducationAssessments &&
          typeof window
            .PacificEducationAssessments.startPhonics ===
            "function" &&
          currentDay === DAY_PHONICS
        ) {
          window.PacificEducationAssessments.startPhonics();
          return;
        }

        if (
          typeof window.startAlphabetAssessment ===
            "function" &&
          currentDay === DAY_ALPHABET
        ) {
          window.startAlphabetAssessment();
          return;
        }

        if (
          typeof window.startPhonicsAssessment ===
            "function" &&
          currentDay === DAY_PHONICS
        ) {
          window.startPhonicsAssessment();
        }
      }
    );

    existing.appendChild(
      assessmentButton
    );

    return false;
  }

  function ensureAlphabetAssessmentPanel() {
    if (getCurrentDay() !== DAY_ALPHABET) {
      return false;
    }

    const existing =
      document.getElementById(
        "alphabetAssessmentPanel"
      );

    if (existing) {
      return true;
    }

    return true;
  }

  function updateAssessmentVisibility() {
    const day = getCurrentDay();

    const alphabetButton =
      document.getElementById(
        "startAlphabetAssessment"
      );

    const phonicsButton =
      document.getElementById(
        "startPhonicsAssessment"
      );

    if (alphabetButton) {
      alphabetButton.style.display =
        day === DAY_ALPHABET
          ? ""
          : "none";
    }

    if (phonicsButton) {
      phonicsButton.style.display =
        day === DAY_PHONICS
          ? ""
          : "none";
    }

    return {
      day,
      alphabetVisible:
        day === DAY_ALPHABET,
      phonicsVisible:
        day === DAY_PHONICS
    };
  }

  function connectLessonCompletion() {
    if (completionConnected) {
      return true;
    }

    if (typeof window.completeLesson !== "function") {
      return false;
    }

    const originalCompleteLesson =
      window.completeLesson;

    if (
      originalCompleteLesson.__pacificEducationProtectedWrapper
    ) {
      completionConnected = true;
      return true;
    }

    function protectedCompleteLesson() {
      /*
       * Owner Test Mode is deliberately separate from real learner
       * progression and may use the original lesson completion flow.
       */
      if (isOwnerTestMode()) {
        return originalCompleteLesson.apply(
          this,
          arguments
        );
      }

      /*
       * Real learner progress must be authorized by Core.
       */
      if (!isAuthorized()) {
        showCheckpointMessage(
          getCurrentDay()
        );

        return false;
      }

      const day = getCurrentDay();

      if (
        day === DAY_ALPHABET ||
        day === DAY_PHONICS
      ) {
        if (checkpointBlocksCompletion(day)) {
          showCheckpointMessage(day);
          return false;
        }
      }

      const result =
        originalCompleteLesson.apply(
          this,
          arguments
        );

      try {
        updateAssessmentVisibility();

        if (
          window.PacificEducationDashboards &&
          typeof window
            .PacificEducationDashboards.refresh ===
            "function"
        ) {
          window.PacificEducationDashboards.refresh();
        }
      } catch (error) {
        console.warn(
          "Pacific Education: post-completion refresh failed.",
          error
        );
      }

      return result;
    }

    protectedCompleteLesson.__pacificEducationProtectedWrapper =
      true;

    protectedCompleteLesson.__pacificEducationOriginal =
      originalCompleteLesson;

    window.completeLesson =
      protectedCompleteLesson;

    completionConnected = true;

    return true;
  }

  function refreshAfterAssessment() {
    updateAssessmentVisibility();

    try {
      if (
        window.PacificEducationDailyLessons &&
        typeof window
          .PacificEducationDailyLessons.refresh ===
          "function"
      ) {
        window.PacificEducationDailyLessons.refresh();
      }
    } catch (error) {
      console.warn(
        "Pacific Education: daily lesson refresh failed.",
        error
      );
    }

    try {
      if (
        window.PacificEducationDashboards &&
        typeof window
          .PacificEducationDashboards.refresh ===
          "function"
      ) {
        window.PacificEducationDashboards.refresh();
      }
    } catch (error) {
      console.warn(
        "Pacific Education: dashboard refresh failed.",
        error
      );
    }

    return true;
  }

  function getAssessmentSignature() {
    if (!isAuthorized()) {
      return "";
    }

    const records =
      getAllCoreAssessments();

    return records
      .map(function (record) {
        return [
          record && record.id,
          record && record.type,
          record && record.day,
          record && record.passed,
          record && record.score,
          assessmentTimestamp(record)
        ].join("|");
      })
      .join(";");
  }

  function monitorAssessmentResults() {
    if (!isAuthorized()) {
      return false;
    }

    const signature =
      getAssessmentSignature();

    if (
      lastAssessmentSignature &&
      signature !== lastAssessmentSignature
    ) {
      refreshAfterAssessment();
    }

    lastAssessmentSignature =
      signature;

    return true;
  }

  function startResultMonitor() {
    if (monitorStarted) {
      return true;
    }

    if (
      typeof window.setInterval !==
      "function"
    ) {
      return false;
    }

    monitorStarted = true;

    lastAssessmentSignature =
      getAssessmentSignature();

    resultMonitor =
      window.setInterval(
        function () {
          monitorAssessmentResults();
        },
        1500
      );

    return true;
  }

  function initialize() {
    connectLessonCompletion();
    updateAssessmentVisibility();

    if (isAuthorized()) {
      startResultMonitor();
    }

    return true;
  }

  const api = {
    version: VERSION,

    getCore,
    isAuthorized,
    getConnections,
    enginesReady,

    getCurrentDay,
    isOwnerTestMode,

    getLatestProtectedAssessment,
    hasPassedProtectedAssessment,

    checkpointBlocksCompletion,

    updateAssessmentVisibility,
    ensureAlphabetAssessmentPanel,

    refreshAfterAssessment,

    connectLessonCompletion,

    get completionConnected() {
      return completionConnected;
    },

    get monitorStarted() {
      return monitorStarted;
    }
  };

  window.PacificEducationLessonAssessmentConnection =
    Object.freeze(api);

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initialize,
      {
        once: true
      }
    );
  } else {
    initialize();
  }

})(window);
