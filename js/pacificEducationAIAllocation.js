/*
 * Pacific Education — AI Task Allocation Registry
 * Pilot orchestration contract.
 *
 * Each AI owns a defined task. The registry does not let one AI silently
 * assume another AI's responsibility. Cross-system handoffs are explicit.
 * Official curriculum decisions and formal assessment remain human/authorized
 * reviewer responsibilities until independently verified.
 */
(function (window) {
  "use strict";

  var VERSION = "1.0.0";

  var TASKS = Object.freeze({
    guardian: {
      name: "Pacific Guardian",
      responsibility: "security, access gating, threat quarantine and audit evidence",
      mayDo: ["check access", "record security events", "quarantine high-confidence threats", "escalate for review"],
      mayNotDo: ["award academic marks", "approve official curriculum", "approve production release"]
    },
    workflow: {
      name: "AI Workflow",
      responsibility: "coordinate authorized AI assistance and explicit human review",
      mayDo: ["validate authorization", "request AI assistance", "route to human review", "record workflow audit"],
      mayNotDo: ["auto-approve official decisions", "replace teacher review", "guess unclear evidence"]
    },
    cam: {
      name: "CAM Marking",
      responsibility: "apply activity-specific marking criteria and produce evidence-based marking suggestions",
      mayDo: ["map objectives to criteria", "identify evidence", "allow equivalent wording", "calculate suggested marks", "give feedback"],
      mayNotDo: ["use keywords as the sole criterion", "override an authorized teacher", "claim official curriculum validity without verification"]
    },
    teacherGuide: {
      name: "Teacher Guide AI",
      responsibility: "prepare teacher-facing instructions, preparation guidance, examples and support prompts",
      mayDo: ["explain activity steps", "provide preparation checklist", "suggest differentiation", "provide marking guidance"],
      mayNotDo: ["replace teacher judgment", "declare official curriculum compliance"]
    },
    essayStudio: {
      name: "Essay Studio",
      responsibility: "teach and scaffold writing without completing a student's assessed work",
      mayDo: ["brainstorm", "outline", "teach paragraph structure", "prompt revision", "support editing"] ,
      mayNotDo: ["submit work for a student", "write assessed work as the student's own"]
    },
    projectsStudio: {
      name: "Projects Studio",
      responsibility: "guide research and project workflow from proposal through reflection and portfolio",
      mayDo: ["proposal planning", "research prompts", "task sequencing", "evidence checklist", "reflection prompts"],
      mayNotDo: ["fabricate evidence", "claim fieldwork occurred", "replace teacher/project verification"]
    },
    accessibility: {
      name: "Accessibility Support",
      responsibility: "provide multiple appropriate response modes and learner supports",
      mayDo: ["text-to-speech", "speech-to-text where available", "large controls", "step-by-step support", "alternative response modes"],
      mayNotDo: ["silently change formal standards", "remove required assessment evidence without authorized accommodation"]
    }
  });

  function getTask(name) {
    return TASKS[name] || null;
  }

  function getAll() {
    return Object.keys(TASKS).map(function (key) {
      return { id: key, name: TASKS[key].name, responsibility: TASKS[key].responsibility };
    });
  }

  function handoff(from, to, payload) {
    if (!TASKS[from] || !TASKS[to]) {
      return { allowed: false, reason: "unknown_ai_task" };
    }
    return {
      allowed: true,
      from: from,
      to: to,
      payload: payload || null,
      humanReviewRequired: ["cam", "teacherGuide", "essayStudio", "projectsStudio"].indexOf(to) >= 0
    };
  }

  window.PacificEducationAIAllocation = Object.freeze({
    version: VERSION,
    tasks: TASKS,
    getTask: getTask,
    getAll: getAll,
    handoff: handoff
  });
})(window);
