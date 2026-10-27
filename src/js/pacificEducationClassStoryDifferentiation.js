/* PacEdu — class-suitable current-affairs stories with one shared learning goal.
 * Recommendations are screening aids only. Teacher approval remains mandatory.
 */
(function (window) {
  "use strict";
  var ABILITIES = ["support", "developing", "expected", "extension"];
  var SENSITIVE = /\b(violence|violent|war|armed conflict|murder|killed|killings|assault|sexual|rape|abuse|suicide|pornography|drug trafficking|terror|hostage|graphic|fatality|fatalities|criminal charge|jail sentence)\b/i;

  function text(value) { return String(value == null ? "" : value).trim(); }
  function normalized(value) { return text(value).toLowerCase().replace(/\s+/g, " "); }
  function normalizedLevel(value) {
    var level = normalized(value);
    var formMatch = level.match(/^form\s*([3-7])$/);
    if (formMatch) return "class " + (Number(formMatch[1]) + 6);
    return level;
  }
  function normalizedSubject(value) {
    var subject = normalized(value);
    if (subject === "health") return "health science";
    if (subject === "maths") return "mathematics";
    return subject;
  }
  function approved(item) {
    var status = normalized(item && item.verificationStatus).toUpperCase();
    return !!item && item.approved === true &&
      ["APPROVED", "TEACHER_APPROVED", "VERIFIED"].indexOf(status) >= 0 &&
      !!text(item.title) && /^https:\/\//i.test(text(item.url));
  }
  function matches(item, level, subject) {
    if (!approved(item)) return false;
    var levels = Array.isArray(item.levelsApplicable) ? item.levelsApplicable : [];
    var subjects = Array.isArray(item.subjectsApplicable) ? item.subjectsApplicable : [];
    if (levels.length && !levels.some(function (v) { return normalizedLevel(v) === normalizedLevel(level); })) return false;
    if (subjects.length && !subjects.some(function (v) { return normalizedSubject(v) === normalizedSubject(subject); })) return false;
    var storyText = text(item.title) + " " + text(item.description) + " " + text(item.educationalRelevance);
    // Avoid recommending sensitive stories to ECE–Class 6. Older classes still
    // require explicit teacher approval and an age-appropriate discussion plan.
    if (SENSITIVE.test(storyText) && /^(?:ece|class [1-6])$/i.test(text(level))) return false;
    return true;
  }
  function selectStory(items, level, subject) {
    var candidates = (Array.isArray(items) ? items : []).filter(function (item) {
      return matches(item, level, subject);
    });
    candidates.sort(function (a, b) {
      var regionRank = { FIJI: 0, PACIFIC: 1, GLOBAL: 2 };
      return (regionRank[a.countryOrRegion] == null ? 3 : regionRank[a.countryOrRegion]) -
        (regionRank[b.countryOrRegion] == null ? 3 : regionRank[b.countryOrRegion]) ||
        (Date.parse(b.publishedAt || "") || 0) - (Date.parse(a.publishedAt || "") || 0);
    });
    return candidates.length ? Object.assign({}, candidates[0], {
      classSuitabilityStatus: "RECOMMENDED_FOR_TEACHER_CONFIRMATION",
      classSuitabilityBasis: "APPROVED_STORY_MATCHES_CLASS_LEVEL_SUBJECT_AND_BASIC_SENSITIVITY_SCREEN"
    }) : null;
  }
  function buildAbilityActivities(options) {
    options = options || {};
    var level = text(options.level) || "Selected class";
    var subject = text(options.subject) || "Selected subject";
    var indicator = text(options.achievementIndicator || options.sharedConcept) || "Teacher-selected daily learning concept";
    var concept = text(options.sharedConcept) || indicator;
    var story = options.story && approved(options.story) ? options.story : null;
    var shared = {
      sharedStoryId: story ? text(story.id || story.sourceId) : null,
      sharedStoryTitle: story ? text(story.title) : null,
      sharedStoryUrl: story ? text(story.url) : null,
      sharedAchievementIndicator: indicator,
      sharedConcept: concept,
      classLevel: level,
      subject: subject,
      status: "PENDING_TEACHER_REVIEW"
    };
    var tasks = {
      support: "Use the same class story with pictures, key words, a short teacher-read extract and a word bank. Match, point, draw or say an answer that demonstrates the shared indicator.",
      developing: "Use the same class story and a short vocabulary list. Answer guided questions and identify one detail that demonstrates the shared indicator.",
      expected: "Read or listen to the same class story independently or with the usual access support. Answer the class-level questions and cite a detail that demonstrates the shared indicator.",
      extension: "Use the same class story to infer, compare viewpoints or evaluate evidence. Justify the response with details while demonstrating the shared indicator."
    };
    return ABILITIES.map(function (ability) {
      return Object.assign({}, shared, {
        abilityGroup: ability,
        task: tasks[ability],
        evidencePrompt: "Show evidence for the same achievement indicator: " + indicator,
        successCriteria: "The learner demonstrates the same stated indicator; support, response format and complexity may differ.",
        storyUse: story ? "Use this exact shared story: " + text(story.title) : "No approved suitable story found. Use the planned age-appropriate local real-life context instead.",
        teacherMustConfirmStory: true
      });
    });
  }
  window.PacificEducationClassStoryDifferentiation = {
    version: "1.0.0",
    abilities: ABILITIES.slice(),
    isSuitableStory: matches,
    selectStory: selectStory,
    buildAbilityActivities: buildAbilityActivities
  };
})(window);
