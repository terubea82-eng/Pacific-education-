
/*
 * Pacific Education — Assessment Integration
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

  function recordAssessment(assessment) {
    const core = getCore();

    if (!core || !isAuthorized()) {
      return false;
    }

    if (
      !core.assessments ||
      typeof core.assessments.add !== "function"
    ) {
      return false;
    }

    if (!assessment || typeof assessment !== "object") {
      return false;
    }

    return core.assessments.add(assessment);
  }

  window.PacificEducationAssessmentIntegration = {
    version: VERSION,
    isAuthorized,
    recordAssessment
  };

})();
