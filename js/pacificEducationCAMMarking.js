/*
 * Pacific Education — CAM Marking foundation
 * Evidence-based marking scaffold. This is not a substitute for verified
 * official curriculum assessment or authorized teacher judgment.
 */
(function (window) {
  "use strict";

  var VERSION = "1.0.0";

  function normalize(value) {
    return String(value == null ? "" : value).trim().toLowerCase();
  }

  function tokenSet(value) {
    return normalize(value).split(/[^a-z0-9]+/).filter(Boolean);
  }

  function containsConcept(response, concept) {
    var r = normalize(response);
    var c = normalize(concept);
    if (!c) return false;
    if (r.indexOf(c) >= 0) return true;
    var tokens = tokenSet(r);
    var phrase = tokenSet(c);
    if (!phrase.length) return false;
    return phrase.every(function (part) { return tokens.indexOf(part) >= 0; });
  }

  function mark(activity) {
    activity = activity || {};
    var response = activity.response || "";
    var criteria = Array.isArray(activity.criteria) ? activity.criteria : [];
    var awarded = 0;
    var evidence = [];

    criteria.forEach(function (criterion) {
      var points = Number(criterion.points) || 0;
      var concepts = Array.isArray(criterion.concepts) ? criterion.concepts : [];
      var matched = concepts.filter(function (concept) { return containsConcept(response, concept); });
      var score = matched.length && concepts.length ? Math.round(points * (matched.length / concepts.length)) : 0;
      if (criterion.minEvidence && normalize(response).length >= Number(criterion.minEvidence) && score === 0) {
        score = 0;
      }
      awarded += score;
      evidence.push({
        criterion: criterion.id || criterion.title || "criterion",
        matchedConcepts: matched,
        score: score,
        maxScore: points
      });
    });

    return {
      version: VERSION,
      suggestedScore: awarded,
      maxScore: criteria.reduce(function (sum, c) { return sum + (Number(c.points) || 0); }, 0),
      evidence: evidence,
      teacherReviewRequired: true,
      keywordOnlyMarking: false,
      equivalentWording: true
    };
  }

  function buildCriteria(objective, concepts, points) {
    return [{
      id: "objective-evidence",
      title: objective || "Learning objective",
      concepts: Array.isArray(concepts) ? concepts : [],
      points: Number(points) || 1
    }];
  }

  window.PacificEducationCAMMarking = Object.freeze({
    version: VERSION,
    mark: mark,
    buildCriteria: buildCriteria
  });
})(window);
