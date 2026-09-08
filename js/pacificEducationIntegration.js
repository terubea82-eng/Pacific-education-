/*
 * Pacific Education — Daily Learning Compatibility Layer
 * Version: 1.0.0
 *
 * Purpose:
 * - Provide compatibility between the existing Integration Bridge
 *   and the current PacificEducationCore API.
 * - The Core exposes startDailyLearning() at the top level.
 * - The existing bridge may still reference
 *   core.dailyLearningCheck.start().
 *
 * Security:
 * - NEVER grants authorization.
 * - NEVER bypasses Core authorization.
 * - NEVER stores passwords, tokens, payment credentials,
 *   API keys, or confidential secrets.
 * - This layer only provides an API compatibility reference.
 */

(function () {
  "use strict";

  const VERSION = "1.0.0";

  function installCompatibility() {
    const core = window.PacificEducationCore;

    if (!core) {
      return false;
    }

    if (typeof core.startDailyLearning !== "function") {
      return false;
    }

    /*
     * Preserve the existing dailyLearningCheck object.
     * Only add the missing compatibility function when it
     * does not already exist.
     */
    if (!core.dailyLearningCheck) {
      core.dailyLearningCheck = {};
    }

    if (typeof core.dailyLearningCheck.start !== "function") {
      core.dailyLearningCheck.start = function () {
        return core.startDailyLearning();
      };
    }

    return true;
  }

  window.PacificEducationDailyLearningCompatibility = {
    version: VERSION,
    install: installCompatibility
  };

  /*
   * Install after the document has loaded so the Core has
   * an opportunity to become available.
   */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", installCompatibility);
  } else {
    installCompatibility();
  }

})();
