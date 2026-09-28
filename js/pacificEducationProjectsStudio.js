/* Pacific Education — Projects Studio foundation */
(function (window) {
  "use strict";
  var VERSION = "1.0.0";
  var STEPS = ["Choose topic", "Research", "Project proposal", "Plan", "Collect information/data", "Build/create", "Write report", "Add evidence", "Presentation", "Teacher/parent review", "Reflection", "Portfolio"];
  function start(topic) {
    return { version: VERSION, topic: String(topic || ""), steps: STEPS.slice(), evidenceRequired: true, fabricatedEvidenceAllowed: false, teacherReviewRequired: true };
  }
  window.PacificEducationProjectsStudio = Object.freeze({ version: VERSION, start: start, steps: Object.freeze(STEPS.slice()) });
})(window);
