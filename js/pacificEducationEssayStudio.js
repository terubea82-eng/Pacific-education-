/* Pacific Education — Essay Studio foundation. Scaffold, don't impersonate student work. */
(function (window) {
  "use strict";
  var VERSION = "1.0.0";
  var STEPS = ["Understand the question", "Brainstorm", "Plan", "Write an introduction", "Build body paragraphs", "Add evidence/examples", "Explain ideas", "Write a conclusion", "Edit", "Submit", "Reflect"];
  function start(topic) {
    return { version: VERSION, topic: String(topic || ""), steps: STEPS.slice(), paragraphModel: ["Point", "Evidence/Example", "Explain", "Link"], studentMustAuthorWork: true, teacherReviewRequired: true };
  }
  window.PacificEducationEssayStudio = Object.freeze({ version: VERSION, start: start, steps: Object.freeze(STEPS.slice()) });
})(window);
