/* PacEdu — Class 1 friendly guided learner workspace.
 * Additive only: leaves registration, role routing, learner evidence, offline records,
 * and protected #856 voice controllers intact.
 */
(function (window, document) {
  "use strict";
  var STYLE_ID = "paceduClass1GuideStyles";
  var PANEL_ID = "paceduClass1GuidedLearning";
  var KEY = "pacedu.class1.breathing.cycles.v1";
  var SUBJECTS = ["English", "Mathematics", "Phonics", "Science", "Social Science", "Health", "Agriculture", "Arts", "Technology"];
  var cycles = 0, timer = null, running = false;

  function activeRole() {
    var select = document.getElementById("pilotRoleSelector");
    if (select && select.value) return String(select.value).toLowerCase();
    try {
      return String(localStorage.getItem("pacificEducationRole") || localStorage.getItem("pilotRole") || "").toLowerCase();
    } catch (e) { return ""; }
  }
  function addStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent =
      "#" + PANEL_ID + "{border:2px solid #b8d8ee;border-radius:16px;padding:16px;margin:0 0 16px;background:#f5fbff;color:#17324d;font-size:18px;line-height:1.5}" +
      "#" + PANEL_ID + " h2,#" + PANEL_ID + " h3{margin:.3em 0 .6em}" +
      "#" + PANEL_ID + " button,#" + PANEL_ID + " input,#" + PANEL_ID + " select{font:inherit;min-height:48px;max-width:100%;box-sizing:border-box;border-radius:10px;padding:10px;border:2px solid #7aaed0}" +
      "#" + PANEL_ID + " button{background:#fff;font-weight:700;touch-action:manipulation}" +
      "#" + PANEL_ID + " .pacedu-subjects{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}" +
      "#" + PANEL_ID + " .pacedu-subjects button[aria-pressed=true]{background:#d7f0df;border-color:#237448}" +
      "#" + PANEL_ID + " .pacedu-breathe-orb{width:94px;height:94px;border-radius:50%;background:#b8e4d2;border:3px solid #347d65;margin:10px auto;animation:paceduClass1Breathe 8s ease-in-out 3;}" +
      "@keyframes paceduClass1Breathe{0%,100%{transform:scale(.72);background:#d8ecff}50%{transform:scale(1);background:#b8e4d2}}" +
      "@media(prefers-reduced-motion:reduce){#" + PANEL_ID + " .pacedu-breathe-orb{animation:none}}" +
      "@media(max-width:360px){#" + PANEL_ID + "{padding:11px;font-size:16px}}";
    document.head.appendChild(style);
  }
  function el(tag, text, cls) {
    var node = document.createElement(tag);
    if (text != null) node.textContent = text;
    if (cls) node.className = cls;
    return node;
  }
  function stopBreathing(save) {
    running = false;
    if (timer) window.clearInterval(timer);
    timer = null;
    var orb = document.querySelector("#" + PANEL_ID + " .pacedu-breathe-orb");
    var status = document.getElementById("paceduBreathingStatus");
    var button = document.getElementById("paceduBreathingToggle");
    if (orb) orb.style.animationPlayState = "paused";
    if (button) button.textContent = "Start breathing";
    if (status) status.textContent = save ? "Well done. You can start your learning now." : "Breathing paused. You can continue when ready.";
    if (save) {
      try { localStorage.setItem(KEY, "0"); } catch (e) {}
    }
  }
  function startBreathing() {
    if (running) { stopBreathing(false); return; }
    running = true;
    cycles = 0;
    var orb = document.querySelector("#" + PANEL_ID + " .pacedu-breathe-orb");
    var status = document.getElementById("paceduBreathingStatus");
    var button = document.getElementById("paceduBreathingToggle");
    if (orb) { orb.style.animation = "none"; void orb.offsetWidth; orb.style.animation = "paceduClass1Breathe 8s ease-in-out 3"; orb.style.animationPlayState = "running"; }
    if (button) button.textContent = "Pause breathing";
    if (status) status.textContent = "Breathe in gently as the circle grows. Breathe out as it gets smaller.";
    try { localStorage.setItem(KEY, "0"); } catch (e) {}
    if (timer) window.clearInterval(timer);
    timer = window.setInterval(function () {
      cycles += 1;
      try { localStorage.setItem(KEY, String(Math.min(cycles, 3))); } catch (e) {}
      if (cycles >= 3) stopBreathing(true);
    }, 8000);
  }
  function render() {
    var role = activeRole();
    var target = document.getElementById("dailyLesson") || document.getElementById("studentStartLearning");
    if (!target || (role && role !== "student" && role !== "blind-learner" && role !== "deaf-learner")) return;
    if (document.getElementById(PANEL_ID)) return;
    addStyles();
    var panel = el("section");
    panel.id = PANEL_ID;
    panel.setAttribute("aria-label", "Simple student daily learning guide");
    panel.innerHTML =
      '<h2>My Learning Today</h2><p>Hello! Let’s learn one step at a time.</p>' +
      '<section aria-labelledby="paceduBreathingHeading"><h3 id="paceduBreathingHeading">1. Get ready</h3>' +
      '<p>Take three gentle breaths. You can skip this.</p><div class="pacedu-breathe-orb" aria-hidden="true"></div>' +
      '<p id="paceduBreathingStatus" role="status" aria-live="polite">Breathe in gently, then breathe out slowly. Follow the circle.</p>' +
      '<button type="button" id="paceduBreathingToggle">Start breathing</button> ' +
      '<button type="button" id="paceduBreathingSkip">Skip breathing</button></section>' +
      '<hr><section aria-labelledby="paceduSubjectHeading"><h3 id="paceduSubjectHeading">2. Choose your subject</h3>' +
      '<div class="pacedu-subjects" id="paceduClass1Subjects"></div></section>' +
      '<section aria-labelledby="paceduLearnerHeading"><h3 id="paceduLearnerHeading">3. My learning details</h3>' +
      '<label for="paceduClass1LearnerId">My school learner ID</label><br>' +
      '<input id="paceduClass1LearnerId" autocomplete="off" placeholder="Enter your learner ID" aria-describedby="paceduClass1IdHelp">' +
      '<p id="paceduClass1IdHelp">Ask your teacher if you need help. Your teacher will check your ID and class.</p></section>' +
      '<section aria-labelledby="paceduTaskHeading"><h3 id="paceduTaskHeading">4. Do my activity</h3>' +
      '<p id="paceduClass1Task">Choose a subject, then open the activity your teacher has approved.</p>' +
      '<button type="button" id="paceduClass1StartTask">Open my activity</button></section>' +
      '<section aria-labelledby="paceduFinishHeading"><h3 id="paceduFinishHeading">5. Send my work</h3>' +
      '<p>Write, speak or show your answer. Send it to your teacher for checking.</p>' +
      '<p>Feedback appears after your teacher reviews it.</p></section>';
    target.insertBefore(panel, target.firstChild);
    var subjectHost = document.getElementById("paceduClass1Subjects");
    var chosen = "English";
    SUBJECTS.forEach(function (subject) {
      var button = el("button", subject);
      button.type = "button";
      button.setAttribute("aria-pressed", subject === chosen ? "true" : "false");
      button.addEventListener("click", function () {
        chosen = subject;
        subjectHost.querySelectorAll("button").forEach(function (b) {
          b.setAttribute("aria-pressed", b.textContent === chosen ? "true" : "false");
        });
        document.getElementById("paceduClass1Task").textContent =
          "Open the " + chosen + " activity assigned to you by your teacher. Read, listen or look at the instructions, then try your best.";
        try { localStorage.setItem("pacificEducationSubject", chosen); } catch (e) {}
      });
      subjectHost.appendChild(button);
    });
    document.getElementById("paceduBreathingToggle").addEventListener("click", startBreathing);
    document.getElementById("paceduBreathingSkip").addEventListener("click", function () { stopBreathing(false); });
    document.getElementById("paceduClass1StartTask").addEventListener("click", function () {
      var idInput = document.getElementById("paceduClass1LearnerId");
      var id = idInput ? idInput.value.trim() : "";
      try {
        if (id) localStorage.setItem("pacedu.pendingLearnerIdForTeacherCheck", id);
        localStorage.setItem("pacificEducationSubject", chosen);
      } catch (e) {}
      var existing = target.querySelector("#dailyLessonStartButton, #startDailyLessonButton, [data-action='start-daily-lesson']");
      if (existing && existing !== this) existing.click();
      else {
        var task = document.getElementById("paceduClass1Task");
        task.textContent = id
          ? "Your subject is selected. Your learner ID is saved on this device for teacher checking. Open the teacher-approved activity below."
          : "Please enter your school learner ID or ask your teacher to help. Then open the teacher-approved activity below.";
        if (!id && idInput) idInput.focus();
      }
    });
  }
  function init() {
    render();
    var selector = document.getElementById("pilotRoleSelector");
    if (selector && !selector.dataset.paceduClass1Guide) {
      selector.dataset.paceduClass1Guide = "true";
      selector.addEventListener("change", function () { window.setTimeout(render, 0); });
    }
    window.setTimeout(render, 600);
    window.setTimeout(render, 1500);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
  window.addEventListener("load", init);
})(window, document);
