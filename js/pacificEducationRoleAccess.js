/* Pacific Education — role access foundation
 * Student, Teacher, Parent and External Professional roles.
 * This is an authorization contract/UI helper; production role enforcement
 * must be performed server-side with verified claims/rules.
 */
(function(window){
  'use strict';
  var roles = Object.freeze({
    student:{label:'Student',capabilities:['learn','complete_activities','view_own_progress']},
    teacher:{label:'Teacher',capabilities:['teach','review_student_work','mark','view_authorized_class_progress']},
    parent:{label:'Parent',capabilities:['view_authorized_child_progress','receive_feedback']},
    professional:{label:'External Professional',capabilities:['review_assigned_evidence','submit_review_comments','submit_findings']}
  });
  function capabilities(role){ return roles[role] ? roles[role].capabilities.slice() : []; }
  function can(role, capability){ return capabilities(role).indexOf(capability) !== -1; }
  window.PacificEducationRoleAccess={version:'1.0.0',roles:roles,capabilities:capabilities,can:can};
})(window);
