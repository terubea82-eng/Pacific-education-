/*
 * Pacific Education — Universal Interaction Repair Layer
 * Pilot-safe reliability layer: detects dead controls, reports runtime errors,
 * and re-initialises interactive modules without granting production authority.
 */
(function(window, document) {
  "use strict";

  var VERSION = "2.0.3";
  var errors = [];
  var AUTO_REFRESH_INTERVAL_MS = 60000;
  var AUTO_REFRESH_KEY = "pacificEducationAutoRefreshVersion";
  var AUTO_REFRESH_LOCK_KEY = "pacificEducationAutoRefreshLock";

  function getAppVersion() {
    var versionNode = document.documentElement.getAttribute("data-pacific-version");
    if (versionNode) return Promise.resolve(versionNode);
    return fetch(window.location.pathname + "?pacific_version_check=" + Date.now(), {
      cache: "no-store",
      credentials: "same-origin"
    }).then(function(response) {
      if (!response.ok) throw new Error("Version check failed: " + response.status);
      return response.text();
    }).then(function(html) {
      var match = html.match(/VERSION="([^"]+)"/);
      return match ? match[1] : "";
    }).catch(function() {
      return "";
    });
  }

  function autoRefreshOnNewVersion() {
    getAppVersion().then(function(current) {
      if (!current) return;
      var previous = "";
      try { previous = localStorage.getItem(AUTO_REFRESH_KEY) || ""; } catch (e) {}
      if (!previous) {
        try { localStorage.setItem(AUTO_REFRESH_KEY, current); } catch (e) {}
        return;
      }
      if (previous === current) return;
      try {
        if (sessionStorage.getItem(AUTO_REFRESH_LOCK_KEY) === current) return;
        sessionStorage.setItem(AUTO_REFRESH_LOCK_KEY, current);
        localStorage.setItem(AUTO_REFRESH_KEY, current);
      } catch (e) {}
      window.location.reload();
    });
  }

  function startAutomaticRefreshMonitor() {
    autoRefreshOnNewVersion();
    window.setInterval(autoRefreshOnNewVersion, AUTO_REFRESH_INTERVAL_MS);
  }


  function status(text, isError) {
    var el = document.getElementById("pacificEducationInteractionStatus");
    if (!el) {
      var host = document.getElementById("systemStatus");
      if (!host) return;
      el = document.createElement("div");
      el.id = "pacificEducationInteractionStatus";
      el.setAttribute("aria-live", "polite");
      host.appendChild(el);
    }
    el.textContent = text;
    el.setAttribute("data-severity", isError ? "error" : "ok");
  }

  function reportError(message, source) {
    errors.push({
      message: String(message || "Unknown error"),
      source: String(source || "runtime"),
      at: new Date().toISOString()
    });
    errors = errors.slice(-50);
    try {
      localStorage.setItem("pacificEducationInteractionErrors", JSON.stringify(errors));
    } catch (e) {}
    status("Interaction issue detected in " + (source || "the application") + ". The pilot remains available; check System Status.", true);
  }

  function missingInlineHandlers() {
    var missing = [];
    var nodes = document.querySelectorAll("[onclick]");
    for (var i = 0; i < nodes.length; i += 1) {
      var code = nodes[i].getAttribute("onclick") || "";
      var match = code.match(/^\s*([A-Za-z_$][\w$]*)\s*\(/);
      if (match && typeof window[match[1]] !== "function") {
        missing.push(match[1]);
      }
    }
    return missing;
  }

  function ensureGlobalHandler(name, fallback) {
    if (typeof window[name] !== "function" && typeof fallback === "function") {
      window[name] = fallback;
    }
  }

  function openPacificEducationFinance() {
    var target = document.getElementById("buyPlans");
    if (!target) return false;
    target.hidden = false;
    try { target.scrollIntoView({behavior:"smooth", block:"start"}); } catch (e) { target.scrollIntoView(); }
    var statusEl = document.getElementById("pacificEducationPaymentGatewayStatus");
    if (statusEl) {
      var gateway = window.PacificEducationPaymentGateway;
      statusEl.textContent = gateway && gateway.providerConnected ? "Payment provider connected." : "Pilot finance is available for testing; payment verification remains a production-server/provider responsibility.";
    }
    return true;
  }

  function repairKnownHandlers() {
    ensureGlobalHandler("authorizePrototypeStudent", function() {
      if (typeof window.authorizeStudent === "function") window.authorizeStudent();
      if (typeof window.showRoute === "function") window.showRoute("student");
    });
    ensureGlobalHandler("completeLesson", function() {
      if (typeof window.PacificEducationDailyProgressRecorder !== "undefined" &&
          typeof window.PacificEducationDailyProgressRecorder.completeLesson === "function") {
        return window.PacificEducationDailyProgressRecorder.completeLesson();
      }
      if (typeof window.PacificEducationDailyProgressFlow !== "undefined" &&
          typeof window.PacificEducationDailyProgressFlow.completeLesson === "function") {
        return window.PacificEducationDailyProgressFlow.completeLesson();
      }
      return false;
    });
    ensureGlobalHandler("submitPacificGuardianComment", function() {
      var guardian = window.PacificEducationGuardian;
      var input = document.getElementById("pacificGuardianComment");
      var out = document.getElementById("pacificGuardianCommentStatus");
      if (guardian && typeof guardian.submitComment === "function") {
        var result = guardian.submitComment(input ? input.value : "", {source:"guardian-comment-form", pilotOnly:true});
        if (out) out.textContent = result.message || result.acknowledgement || "Comment queued for Guardian review.";
        if (result.accepted && input) input.value = "";
        return result;
      }
      if (out) out.textContent = "Guardian review controller is still loading.";
      return false;
    });
  }

  function runDynamicInteractionAudit() {
    var failures = [];
    var checks = 0;

    function check(condition, message) {
      checks += 1;
      if (!condition) failures.push(message);
    }

    var buttons = document.querySelectorAll("button, input[type=button], input[type=submit]");
    for (var i = 0; i < buttons.length; i += 1) {
      var b = buttons[i];
      if (b.disabled) b.setAttribute("data-pacific-disabled-intentional", "true");
    }

    var ids = {};
    var all = document.querySelectorAll("[id]");
    for (var j = 0; j < all.length; j += 1) {
      var id = all[j].id;
      if (ids[id]) failures.push("Duplicate id: " + id);
      ids[id] = true;
    }

    check(typeof window.openPacificEducationFinance === "function", "Finance handler unavailable");
    check(typeof window.completeLesson === "function", "Complete Lesson handler unavailable");
    check(typeof window.startAlphabetAssessment === "function", "Alphabet Assessment handler unavailable");
    check(typeof window.startPhonicsAssessment === "function", "Phonics Assessment handler unavailable");
    check(typeof window.submitPacificGuardianComment === "function", "Guardian comment handler unavailable");
    check(typeof window.submitPacificEducationDashboardReviewComment === "function", "Dashboard review handler unavailable");
    check(typeof window.authorizePrototypeStudent === "function", "Prototype Access handler unavailable");
    check(typeof window.openPacificEducationFinance === "function", "Finance navigation handler unavailable");

    var renderer = window.PacificEducationCurriculumLessonRenderer;
    check(!!renderer && typeof renderer.refresh === "function" && typeof renderer.initialise === "function",
      "Daily lesson renderer unavailable");
    if (renderer && typeof renderer.status === "function") {
      var rs = renderer.status();
      check(rs.connected === true, "Daily lesson renderer is not connected");
      check(rs.interactiveActivitiesAvailable === true, "Interactive learner activity runtime unavailable");
    }

    check(!!document.getElementById("dailyActivitiesStartButton"), "Daily Activities start button missing");
    check(!!document.getElementById("dailyActivitiesContinuePracticeButton"), "Daily Activities → Practice button missing");
    check(!!document.getElementById("dailyLessonPracticeStage"), "Practice stage missing");
    check(!!document.getElementById("practiceContinueAssessmentButton"), "Practice → Assessment button missing");
    check(!!document.getElementById("assessments"), "Assessment stage missing");
    check(!!document.getElementById("assessmentContinueCoverageButton"), "Assessment → Coverage button missing");
    check(!!document.getElementById("pacificEducationCoverageDashboard"), "Coverage stage missing");

    check(!!document.getElementById("previousLessonButton"), "Previous Day control missing");
    check(!!document.getElementById("nextLessonButton"), "Next Day control missing");
    check(!!document.getElementById("dailyLessonProgress"), "Daily activity progress control missing");
    check(!!document.getElementById("buyPlans"), "Finance target missing");
    check(!!document.getElementById("pacificGuardianCommentSection"), "Guardian section missing");

    var progress = document.getElementById("dailyLessonProgress");
    if (progress) check(String(progress.textContent || "").indexOf("365") !== -1, "Daily activity range is not 365");

    var marked = document.querySelectorAll("[data-pacific-action]");
    for (var k = 0; k < marked.length; k += 1) {
      check(!!marked[k].parentNode, "Detached dynamic control: " + marked[k].getAttribute("data-pacific-action"));
    }

    var entryButton = document.getElementById("singlePilotRegisterButton");
    if (entryButton) {
      check(typeof entryButton.onclick === "function", "Pilot Enter Workspace button has no handler");
    }
    var signOut = document.getElementById("pilotSignOutButton");
    if (signOut) {
      check(typeof signOut.onclick === "function", "Pilot Return to registration button has no handler");
    }

    var result = {
      version: VERSION,
      checks: checks,
      failures: failures,
      passed: failures.length === 0,
      dynamicControls: marked.length,
      totalButtons: buttons.length
    };

    try {
      localStorage.setItem("pacificEducationInteractionAudit", JSON.stringify(result));
    } catch (e) {}

    if (failures.length) {
      status("Interaction audit: " + failures.length + " issue(s) found.", true);
    } else {
      status("Interaction audit passed: " + checks + " checks, " + buttons.length + " controls, " + marked.length + " dynamic controls.", false);
    }
    return result;
  }

  function repairRegistrationSetupControls() {
    /* Country, language and User Registration are pilot entry controls and must remain
       interactive. Do not unlock any payment, production or entitlement controls here. */
    ["pacificEducationCountrySelect","pacificEducationLanguageSelect","userRegistrationOpenButton"].forEach(function(id){
      var el=document.getElementById(id);
      if(!el)return;
      el.disabled=false;
      el.removeAttribute("aria-disabled");
      el.style.pointerEvents="auto";
      el.style.touchAction="manipulation";
    });
    var box=document.getElementById("pacificEducationRegistrationBox");
    if(box){box.setAttribute("data-pacific-registration-state","active");}
    var statusEl=document.getElementById("pilotRegistrationStatus");
    var form=document.getElementById("userRegistrationForm");
    if(statusEl && (!form || form.hidden)){
      statusEl.textContent="User Registration is active. Choose a role to begin.";
    }
  }

  function repairControls() {
    repairRegistrationSetupControls();
    ensureGlobalHandler("openPacificEducationFinance", openPacificEducationFinance);
    repairKnownHandlers();
    var missing = missingInlineHandlers();
    if (missing.length) {
      reportError("Missing controls: " + missing.join(", "), "button wiring");
    }

    var controls = document.querySelectorAll("button, input, textarea, select");
    for (var i = 0; i < controls.length; i += 1) {
      var control = controls[i];
      if (control.tagName === "TEXTAREA" && !control.getAttribute("aria-label") && !control.id) {
        control.setAttribute("aria-label", "Feedback or response");
      }
      if (control.tagName === "BUTTON" && !control.hasAttribute("type")) {
        control.setAttribute("type", "button");
      }
    }

    var activity = window.PacificEducationActivity;
    if (!activity || typeof activity.render !== "function") {
      var activityStatus = document.getElementById("dailyLessonActivity");
      if (activityStatus) {
        activityStatus.setAttribute("data-interaction-status", "waiting");
      }
    }

    var renderer = window.PacificEducationCurriculumLessonRenderer;
    if (renderer && typeof renderer.initialise === "function") {
      try { renderer.initialise(); } catch (e) { reportError(e.message, "daily lesson renderer"); }
    }

    var guardian = window.PacificEducationGuardian;
    if (!guardian || typeof guardian.submitComment !== "function") {
      reportError("Pacific Guardian controller is unavailable.", "Guardian");
    } else if (typeof window.submitPacificGuardianComment !== "function") {
      window.submitPacificGuardianComment = guardian.submitPacificGuardianComment || function() {
        var input = document.getElementById("pacificGuardianComment");
        var result = guardian.submitComment(input ? input.value : "", {source:"guardian-comment-form", pilotOnly:true});
        var out = document.getElementById("pacificGuardianCommentStatus");
        if (out) out.textContent = result.message || result.acknowledgement || "Comment queued for Guardian review.";
        if (result.accepted && input) input.value = "";
        return result;
      };
    }

    runDynamicInteractionAudit();
    status("Interactive controls checked. Pilot interaction layer is active.", false);
  }

  window.addEventListener("error", function(event) {
    reportError(event && event.message ? event.message : "JavaScript error", event && event.filename ? event.filename : "runtime");
  });

  window.addEventListener("unhandledrejection", function(event) {
    reportError(event && event.reason ? String(event.reason) : "Unhandled promise rejection", "promise");
  });

  function getSelectedClassContext() {
    var roster = window.PacificEducationTeacherClassRosterContext;
    if (!roster || typeof roster.getClassId !== "function" || typeof roster.getClass !== "function") return null;
    var classId = String(roster.getClassId() || "").trim();
    if (!classId) return null;
    var record = roster.getClass(classId);
    if (!record) return null;
    return {classId: classId, level: record.level || ""};
  }

  function ensureDailyActivitiesVisible() {
    var daily = document.getElementById("dailyLesson");
    if (!daily) return false;
    var classContext = getSelectedClassContext();
    if (!classContext) return false;

    var existing = document.getElementById("pacificInteractiveActivity");
    if (existing) return true;

    var section = document.createElement("section");
    section.id = "pacificInteractiveActivity";
    section.setAttribute("aria-label", "Daily learner activities");
    section.style.marginTop = "1rem";
    section.style.padding = "1rem";
    section.style.border = "2px solid currentColor";

    var day = Number(localStorage.getItem("currentDayNumber") || "1");
    if (!Number.isFinite(day) || day < 1 || day > 365) day = 1;
    var subject = localStorage.getItem("pacificEducationSubject") || "English";
    var heading = document.createElement("h3");
    heading.textContent = "Daily Activities — Day " + day + " of 365";
    section.appendChild(heading);

    var note = document.createElement("p");
    note.textContent = "Attempt a pilot activity below. Test/demo data only.";
    section.appendChild(note);

    var statusEl = document.createElement("p");
    statusEl.id = "pacificEducationDailyActivityStatus";
    statusEl.setAttribute("aria-live", "polite");
    section.appendChild(statusEl);

    var types = window.PacificEducationActivityTypes ||
      ["multiple_choice","true_false","matching","short_answer","long_answer"];
    var labels = (window.PacificEducationActivity && window.PacificEducationActivity.labels) || {
      multiple_choice:"Multiple Choice", true_false:"True or False", matching:"Matching",
      short_answer:"Short Answer", long_answer:"Long Answer"
    };

    types.forEach(function(type) {
      var button = document.createElement("button");
      button.type = "button";
      button.textContent = "Attempt " + (labels[type] || type);
      button.setAttribute("data-pacific-action", "attempt-daily-" + type);
      button.addEventListener("click", function() {
        var runtime = window.PacificEducationActivity;
        var lesson = {
          dayNumber: day,
          classReference: classContext.classId,
          classId: classContext.classId,
          level: classContext.level || "",
          subjectId: subject,
          term: localStorage.getItem("pacificEducationTerm") || "Term 1",
          title: "Day " + day + " — " + subject + " Daily Activity",
          activity: {
            questionText: subject === "Mathematics" ? "What is 2 + 2?" :
              subject === "Science" ? "Which one is a living thing?" :
              "Which word is a greeting?",
            audioText: "Complete today's " + subject + " daily activity.",
            options: subject === "Mathematics" ? ["3","4","5","6"] :
              subject === "Science" ? ["Tree","Rock","Cup","Pencil"] :
              ["Hello","Pencil","Seven","Green"],
            choices: subject === "Mathematics" ? ["3","4","5","6"] :
              subject === "Science" ? ["Tree","Rock","Cup","Pencil"] :
              ["Hello","Pencil","Seven","Green"],
            answerOptions: subject === "Mathematics" ? ["3","4","5","6"] :
              subject === "Science" ? ["Tree","Rock","Cup","Pencil"] :
              ["Hello","Pencil","Seven","Green"],
            answerIndex: subject === "Mathematics" ? 1 : 0,
            answerKey: subject === "Mathematics" ? "4" : subject === "Science" ? "Tree" : "Hello"
          }
        };

        if (runtime && typeof runtime.render === "function") {
          try {
            runtime.render(type, day, lesson);
            statusEl.textContent = "Activity opened. Submit your answer to record the attempt.";
            return;
          } catch (e) {
            reportError(e && e.message ? e.message : e, "daily activity runtime");
          }
        }

        statusEl.textContent = "Interactive runtime is unavailable. Reloading the Daily Activity system…";
        var renderer = window.PacificEducationCurriculumLessonRenderer;
        if (renderer && typeof renderer.initialise === "function") {
          try { renderer.initialise(); } catch (e2) {}
        }
      });
      section.appendChild(button);
    });

    daily.appendChild(section);
    return true;
  }

  function forcePilotDailyActivityFallback() {
    var daily = document.getElementById("dailyLesson");
    var activityPanel = document.getElementById("dailyLessonActivity");
    var roster = window.PacificEducationTeacherClassRosterContext;
    if (!daily || !activityPanel || !roster || typeof roster.getClassId !== "function" || typeof roster.getClass !== "function") return false;
    var classId = String(roster.getClassId() || "").trim();
    if (!classId || !roster.getClass(classId)) return false;
    var textNow = String(activityPanel.textContent || "").trim();
    if (textNow && textNow.indexOf("Loading today's learning activity") === -1) return true;
    var day = 1;
    try {
      if (window.PacificEducationDailyLessons && typeof window.PacificEducationDailyLessons.getCurrentCoreDay === "function") day = window.PacificEducationDailyLessons.getCurrentCoreDay();
      else day = Number(localStorage.getItem("currentDayNumber") || "1");
    } catch (e) {}
    if (!Number.isFinite(day) || day < 1 || day > 365) day = 1;
    var lesson = null;
    var dailyApi = window.PacificEducationDailyLessons;
    if (dailyApi && typeof dailyApi.getDailyLesson === "function") { try { lesson = dailyApi.getDailyLesson(day); } catch (e2) {} }
    if (!lesson || lesson.blocked) return false;
    var title = document.getElementById("dailyLessonTitle");
    var dayNode = document.getElementById("dailyLessonDay");
    if (title) title.textContent = String(lesson.title || "Daily Activity");
    if (dayNode) dayNode.textContent = "Day " + day;
    var subject = localStorage.getItem("pacificEducationSubject") || "English";
    var term = localStorage.getItem("pacificEducationTerm") || "Term 1";
    var level = (roster.getClass(classId) || {}).level || "Class 1";
    var question = subject === "Mathematics" ? "What is 2 + 2?" : subject === "Science" ? "Which one is a living thing?" : "Which word is a greeting?";
    var options = subject === "Mathematics" ? ["3","4","5","6"] : subject === "Science" ? ["Tree","Rock","Cup","Pencil"] : ["Hello","Pencil","Seven","Green"];
    var runtime = window.PacificEducationActivity;
    if (runtime && typeof runtime.render === "function") {
      try {
        runtime.render("multiple_choice", day, {dayNumber:day,classId:classId,level:level,subjectId:subject,term:term,title:String(lesson.title || "Daily Activity"),activity:{questionText:String(lesson.activity || "")+" "+question,audioText:String(lesson.activity || "")+" "+question,options:options,choices:options,answerOptions:options,answerIndex:subject==="Mathematics"?1:0,answerKey:subject==="Mathematics"?"4":subject==="Science"?"Tree":"Hello",contentBasis:"pilot-daily-lesson-fallback"}});
        var progress=document.getElementById("dailyLessonProgress");
        if(progress) progress.textContent="Day "+day+" of 365 daily activities (school calendar controls teaching, revision and examination)";
        return true;
      } catch (e3) { reportError(e3 && e3.message ? e3.message : e3, "daily activity fallback"); }
    }
    activityPanel.textContent=String(lesson.activity || "Complete today's learning activity.");
    return true;
  }

  function repairDailyActivityRuntime() {
    var runtime = window.PacificEducationActivity;
    if (!runtime || typeof runtime.render !== "function") {
      window.setTimeout(repairDailyActivityRuntime, 500);
      return;
    }

    var renderer = window.PacificEducationCurriculumLessonRenderer;
    if (renderer && typeof renderer.refresh === "function") {
      try { renderer.refresh(); } catch (e) { reportError(e.message, "daily lesson refresh"); }
    }

    window.setTimeout(function() {
      ensureDailyActivitiesVisible();
      forcePilotDailyActivityFallback();
    }, 100);
  }

  window.PacificEducationInteractionRepair = Object.freeze({
    version: VERSION,
    repair: repairControls,
    getErrors: function() { return errors.slice(); },
    status: function() { return {version: VERSION, errors: errors.length}; },
    audit: runDynamicInteractionAudit
  });

  function start() {
    startAutomaticRefreshMonitor();
    repairControls();
    repairDailyActivityRuntime();
    window.setTimeout(repairControls, 500);
    window.setTimeout(repairControls, 1500);
    window.setTimeout(function(){ ensureDailyActivitiesVisible(); forcePilotDailyActivityFallback(); }, 2000);
    window.setTimeout(forcePilotDailyActivityFallback, 3000);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})(window, document);
