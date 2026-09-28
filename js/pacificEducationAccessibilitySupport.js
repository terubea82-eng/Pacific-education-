/* Pacific Education — Accessibility Support foundation */
(function (window) {
  "use strict";
  var VERSION = "1.0.0";
  var MODES = ["write", "speak", "draw", "match", "sequence", "demonstrate", "evidence_photo", "picture_select", "listen_and_answer"];
  var SUPPORTS = ["text_to_speech", "speech_to_text", "large_text", "large_controls", "step_by_step", "extra_practice", "repetition", "additional_time_when_authorized"];
  function options() { return { version: VERSION, responseModes: MODES.slice(), supports: SUPPORTS.slice(), formalStandardsRemainUnchanged: true, accommodationsRequireAuthorizedDecision: true }; }
  window.PacificEducationAccessibilitySupport = Object.freeze({ version: VERSION, options: options, responseModes: Object.freeze(MODES.slice()), supports: Object.freeze(SUPPORTS.slice()) });
})(window);
