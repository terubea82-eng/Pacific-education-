
/*
 * Pacific Education — Daily Learning Integration
 * Version: 1.0.0
 */

(function () {
  "use strict";

  const VERSION = "1.0.0";

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

  function createCheck(check) {
    const core = getCore();

    if (!core || !isAuthorized()) {
      return false;
    }

    if (
      !core.dailyLearningCheck ||
      typeof core.dailyLearningCheck.create !== "function"
    ) {
      return false;
    }

    if (!check || typeof check !== "object") {
      return false;
    }

    return core.dailyLearningCheck.create(check);
  }

  function recordCheck(result) {
    const core = getCore();

    if (!core || !isAuthorized()) {
      return false;
    }

    if (
      !core.dailyLearningCheck ||
      typeof core.dailyLearningCheck.record !== "function"
    ) {
      return false;
    }

    if (!result || typeof result !== "object") {
      return false;
    }

    return core.dailyLearningCheck.record(result);
  }

  function start() {
    const core = getCore();

    if (!core || !isAuthorized()) {
      return {
        success: false,
        reason: "authorization_required"
      };
    }

    if (
      !core.dailyLearningCheck ||
      typeof core.dailyLearningCheck.start !== "function"
    ) {
      return {
        success: false,
        reason: "daily_learning_check_unavailable"
      };
    }

    return core.dailyLearningCheck.start();
  }

  window.PacificEducationDailyLearningIntegration = {
    version: VERSION,
    isAuthorized,
    createCheck,
    recordCheck,
    start
  };

})();
