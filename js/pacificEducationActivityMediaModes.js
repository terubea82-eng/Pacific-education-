/* Pacific Education — Activity Media Modes
 * Activities keep the curriculum objective unchanged while varying how the
 * learning context is delivered: story, video, voice, reading, discussion,
 * practical activity, or a combination. Media never replaces teacher review.
 */
(function(window){
  'use strict';
  const VERSION = '1.0.0';
  const MODES = Object.freeze([
    'story',
    'video',
    'voice',
    'read_and_listen',
    'discussion',
    'interactive',
    'practical',
    'project'
  ]);

  function normalize(activity){
    const item = Object.assign({}, activity || {});
    const requested = Array.isArray(item.mediaModes) ? item.mediaModes : [];
    item.mediaModes = requested.filter(function(mode){ return MODES.indexOf(mode) !== -1; });
    if (!item.mediaModes.length) item.mediaModes = ['story'];
    item.mediaRequired = item.mediaRequired === true;
    item.teacherReviewRequired = item.teacherReviewRequired !== false;
    return item;
  }

  function buildLearningExperience(activity){
    const item = normalize(activity);
    return {
      version: VERSION,
      curriculumObjective: item.learningObjective || item.objective || '',
      topic: item.topic || item.title || '',
      context: item.context || item.summary || '',
      mediaModes: item.mediaModes,
      studentActions: item.studentActions || ['listen_or_read','think','respond','reflect'],
      teacherReviewRequired: item.teacherReviewRequired,
      mediaRequired: item.mediaRequired,
      note: 'Media provides context and engagement; the curriculum learning objective remains unchanged.'
    };
  }

  window.PacificEducationActivityMediaModes = Object.freeze({
    version: VERSION,
    modes: MODES,
    normalize: normalize,
    buildLearningExperience: buildLearningExperience
  });
})(window);
