/* Pacific Education — Direct Pilot User Feedback
 * Authenticated pilot users can submit role-aware comments from inside the app.
 * Production authorization and Firestore security rules remain server-side gates.
 */
(function(window){
  'use strict';
  const roles = ['student','teacher','parent','professional'];
  function submit(comment, category, role){
    const api = window.PacificEducationFirebase;
    if (!api || typeof api.submitPilotFeedback !== 'function') {
      throw new Error('Authenticated feedback service is not available.');
    }
    if (!api.auth || !api.auth.currentUser) {
      throw new Error('Please sign in before submitting pilot feedback.');
    }
    const clean = String(comment || '').trim();
    if (!clean) throw new Error('Enter a comment before submitting.');
    const normalizedRole = roles.indexOf(role) >= 0 ? role : 'student';
    return api.submitPilotFeedback({
      message: clean,
      category: String(category || 'general') + ':' + normalizedRole
    });
  }
  function mount(){
    const host = document.getElementById('pacificEducationPilotFeedbackWorkspace');
    if (!host || host.dataset.ready === 'true') return;
    host.dataset.ready = 'true';
    host.innerHTML = '<h2>Direct Pilot Feedback</h2>' +
      '<p>Signed-in students, teachers, parents and authorized pilot professionals can comment directly on the pilot app.</p>' +
      '<label for="pilotFeedbackRole">Your pilot role</label><br>' +
      '<select id="pilotFeedbackRole"><option value="student">Student</option><option value="teacher">Teacher</option><option value="parent">Parent</option><option value="professional">External Professional</option></select><br>' +
      '<label for="pilotFeedbackCategory">Feedback area</label><br>' +
      '<select id="pilotFeedbackCategory"><option value="general">General app</option><option value="learning">Learning</option><option value="assessment">Assessment</option><option value="dashboard">Dashboard</option><option value="accessibility">Accessibility</option><option value="safeguarding">Safeguarding</option><option value="curriculum">Curriculum</option><option value="technical">Technical issue</option></select><br>' +
      '<label for="pilotFeedbackMessage">Comment</label><br>' +
      '<textarea id="pilotFeedbackMessage" rows="5" style="width:100%;max-width:760px" placeholder="Tell us what worked, what did not work, or what should be improved."></textarea><br>' +
      '<button type="button" id="pilotFeedbackSubmit">Submit pilot comment</button>' +
      '<div id="pilotFeedbackStatus" aria-live="polite"></div>';
    document.getElementById('pilotFeedbackSubmit').addEventListener('click', async function(){
      const status = document.getElementById('pilotFeedbackStatus');
      status.textContent = 'Submitting...';
      try {
        await submit(
          document.getElementById('pilotFeedbackMessage').value,
          document.getElementById('pilotFeedbackCategory').value,
          document.getElementById('pilotFeedbackRole').value
        );
        document.getElementById('pilotFeedbackMessage').value = '';
        status.textContent = 'Comment submitted for pilot review.';
      } catch (error) {
        status.textContent = error.message || 'Comment could not be submitted.';
      }
    });
  }
  window.PacificEducationPilotUserFeedback = {version:'1.0.0',submit:submit,mount:mount};
  document.addEventListener('DOMContentLoaded', mount);
})(window);
