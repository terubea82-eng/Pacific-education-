/*
 * Pacific Education — Marks Integration
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

  function transferMark(mark) {
    const core = getCore();

    if (!core || !isAuthorized()) {
      return false;
    }

    if (
      !core.marks ||
      typeof core.marks.transfer !== "function"
    ) {
      return false;
    }

    if (!mark || typeof mark !== "object") {
      return false;
    }

    return core.marks.transfer(mark);
  }

  function editMark(markId, changes) {
    const core = getCore();

    if (!core || !isAuthorized()) {
      return false;
    }

    if (
      !core.marks ||
      typeof core.marks.edit !== "function"
    ) {
      return false;
    }

    if (!markId || !changes || typeof changes !== "object") {
      return false;
    }

    return core.marks.edit(markId, changes);
  }

  window.PacificEducationMarksIntegration = {
    version: VERSION,
    isAuthorized,
    transferMark,
    editMark
  };

})();
