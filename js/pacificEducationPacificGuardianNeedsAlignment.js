/* Pacific Education — Pacific Guardian User Needs Alignment
 * Version: 1.0.0
 *
 * Converts authenticated pilot feedback into explicit user-needs evidence.
 * Guardian aligns the product to documented user needs; it does not silently
 * change curriculum, permissions, marks, or production status.
 */
(function(window){
  'use strict';
  const VERSION = '1.0.0';
  const VALID_ROLES = ['student','teacher','parent','professional'];
  const VALID_CATEGORIES = ['general','learning','assessment','dashboard','accessibility','safeguarding','curriculum','technical'];

  function normalize(entry){
    entry = entry || {};
    const role = VALID_ROLES.indexOf(String(entry.role || '')) >= 0 ? String(entry.role) : 'unknown';
    const category = VALID_CATEGORIES.indexOf(String(entry.category || '')) >= 0 ? String(entry.category) : 'general';
    const message = String(entry.message || '').trim();
    return { role, category, message, needsEvidence: !!message };
  }

  function align(entry){
    const item = normalize(entry);
    return {
      version: VERSION,
      aligned: item.needsEvidence,
      status: item.needsEvidence ? 'user_need_recorded_for_review' : 'needs_user_input',
      role: item.role,
      category: item.category,
      need: item.message,
      action: 'record_and_review',
      automaticProductChange: false,
      automaticCurriculumChange: false,
      automaticAuthorizationChange: false,
      automaticProductionApproval: false,
      humanReviewRequired: true
    };
  }

  function reviewQueue(entries){
    return (Array.isArray(entries) ? entries : []).map(align);
  }

  window.PacificEducationPacificGuardianNeedsAlignment = Object.freeze({
    version: VERSION,
    normalize: normalize,
    align: align,
    reviewQueue: reviewQueue
  });
})(window);
