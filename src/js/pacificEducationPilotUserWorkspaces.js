/* Pacific Education — controlled pilot role workspaces.
 * Demo-only UI. It does not authenticate users or expose real student data.
 */
(function (window, document) {
  "use strict";

  var roles = [
    { id:"blind-learner", title:"Blind Learner", access:"Dedicated accessible learning workspace with voice-first Daily Activities, pronunciation and spelling guidance, and assessment-response protection", actions:["Open Voice-Guided Learning","Speak Answer","Spell / Clarify Word","Read Question and Choices","View Progress","Help"] },
    { id:"deaf-learner", title:"Deaf Learner", access:"Dedicated visual-first accessible learning workspace with captions, sign-language preferences, text instructions and visual notifications", actions:["Open Deaf Learner Guide","Choose Sign Language","Read Captions","Open Visual Daily Activity","Write Answer","View Progress","Help"] },
    { id:"student", title:"Student", access:"Learning, Daily Activities Days 1–365, assessments, plus separate Weekend & Holiday Supplementary Activities", actions:["Open daily activity","Practice","View my progress","Open weekend/holiday assignment"] },
    { id:"teacher", title:"Teacher", access:"Full Daily Activities Days 1–365, Weekend & Holiday Assignments, class, assessment and learner support tools", actions:["Open daily activity","Open weekend/holiday assignment","Class dashboard","Support student/parent"] },
    { id:"head-of-school", title:"Head of School", access:"School identity and registration control plus read-only oversight of all teacher-created class lists", actions:["Register school","View all class lists","Review school-wide class coverage"] },
    { id:"institution-admin", title:"Institution Administrator", access:"Authorized institution configuration, information management and duplicate/conflict advice", actions:["Configure institution","Manage academic structure","Review duplicate/conflict advice","Configure attendance and academic integrity"] },
    { id:"special-education", title:"Special Education / Inclusion", access:"Daily learner performance tracking, individualized support and mandatory review comments", actions:["Daily performance review","Individual support comment","Review home assessments"] },
    { id:"parent", title:"Parent / Caregiver", access:"Linked-child overview plus automatic Weekend & Holiday Supplementary Activities only", actions:["Open weekend/holiday assignment","Seek teacher help","Send feedback"] },
    { id:"professional", title:"Professional Reviewer", access:"Controlled review evidence and findings", actions:["Review evidence","Record finding","View review status"] },
    { id:"ngo", title:"NGO / Organization", access:"Program-level pilot participation and feedback", actions:["Program overview","Pilot feedback","Request support"] },
    { id:"education", title:"Education / Government", access:"Pilot-level education evidence and reporting view", actions:["Pilot overview","Evidence review","Feedback"] },
    { id:"community", title:"Community / Partner", access:"General education services and pilot feedback", actions:["Explore services","Submit feedback","Pilot information"] },
    { id:"owner", title:"Owner / Control", access:"Owner-controlled pilot oversight and release evidence", actions:["Pilot status","Evidence register","Release gates"] },
    { id:"technician", title:"Technician", access:"Controlled technical workspace for builds, deployment, diagnostics and approved Termux workflow", actions:["GitHub repository","GitHub Actions / builds","Live Pages","Firebase Console","Termux workflow"] }
  ];

  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"]/g, function (c) {
      return ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" })[c];
    });
  }

  function render() {
    var app = document.getElementById("app");
    if (!app || document.getElementById("pacificEducationPilotUserWorkspaces")) return;
    var section = document.createElement("section");
    section.id = "pacificEducationPilotUserWorkspaces";
    section.setAttribute("aria-label", "Pilot user workspaces");
    section.innerHTML =
      "<h2>Pilot User Workspaces</h2>" +
      "<p><strong>Controlled pilot:</strong> Select a role to preview its workspace. This is a synthetic demonstration and is not production authentication.</p>" +
      '<label for="pilotRoleSelector"><strong>User role</strong></label> ' +
      '<select id="pilotRoleSelector" aria-label="Pilot user role" required>' +
      '<option value="" selected disabled>Select your mandatory pilot role</option>' +
      '</select>' +
      '<div id="pilotWorkspaceGate" role="status" aria-live="polite" style="margin-top:10px;padding:10px;border:1px solid currentColor;">' +
      '<strong>Pilot workspace selection is mandatory.</strong> Select your role before continuing with pilot activities.</div>' +
      '<div id="pilotRoleWorkspace" style="margin-top:12px;"></div>' +
      '<p style="font-size:.9em;"><strong>Privacy:</strong> Use test/demo data only. Real child identity, passwords, payment details and exact location must not be entered during the pilot.</p>';
    app.insertBefore(section, document.getElementById("userFirstNavigation") || document.getElementById("learningPlatform") || document.getElementById("dailyLesson") || null);

    var select = document.getElementById("pilotRoleSelector");
    roles.forEach(function (role) {
      var option = document.createElement("option");
      option.value = role.id;
      option.textContent = role.title;
      select.appendChild(option);
    });

    function ensureSchoolIdentity() { if (window.PacificEducationSchoolIdentity) window.PacificEducationSchoolIdentity.render("pacificEducationSchoolIdentity"); }

    function schoolSummary() {
      var p = window.PacificEducationSchoolIdentity && typeof window.PacificEducationSchoolIdentity.getProfile === "function"
        ? window.PacificEducationSchoolIdentity.getProfile() : null;
      if (!p || (!p.schoolName && !p.registrationNumber)) return "School profile: not yet entered.";
      return "School: " + esc(p.schoolName || "Not entered") + " • " + esc(p.country || "Not entered") + " • Registration: " + esc(p.registrationNumber || "Not entered");
    }

    function pilotContextSummary() {
      var classId = "", level = "", subject = "", term = "";
      try {
        var roster = window.PacificEducationTeacherClassRosterContext;
        if (roster && typeof roster.getClassId === "function") classId = String(roster.getClassId() || "").trim();
        var selectedClass = classId && roster && typeof roster.getClass === "function" ? roster.getClass(classId) : null;
        if (selectedClass) level = String(selectedClass.level || "");
        subject = window.localStorage.getItem("pacificEducationSubject") || "";
        term = window.localStorage.getItem("pacificEducationTerm") || "";
      } catch (e) {}
      return schoolSummary() +
        " • Class Reference: " + esc(classId || "Not selected") +
        " • Class/Level: " + esc(level || "Not selected") +
        " • Subject: " + esc(subject || "Not selected") +
        " • Term: " + esc(term || "Not selected");
    }

    function refreshPilotContext() {
      var context = document.getElementById("pilotSchoolContext");
      if (context) context.innerHTML = "<strong>Shared pilot context:</strong> " + pilotContextSummary();
    }
    document.addEventListener("pacificEducationSchoolChanged", ensureSchoolIdentity);

    function setPilotActivityGate(enabled) {
      /*
       * Registration must never be blocked by the workspace gate.
       * The pilot workspace is selected after registration, so disabling the
       * registration controls here creates a deadlock: users cannot register
       * and therefore cannot reach the role workspace. Keep registration and
       * guided navigation usable; gate only post-registration activity tools.
       */
      var registrationIds = {
        "userRegistrationOpenButton": true,
        "pilotRegistrationName": true,
        "pilotRegistrationRole": true,
        "pilotRegistrationSaveButton": true,
        "registrationNextButton": true,
        "prototypeAuthorizeButton": true,
        "prototypeNextButton": true,
        "pilotRoleSelector": true
      };
      var controls = document.querySelectorAll("main button, main select, main input, main textarea");
      Array.prototype.forEach.call(controls, function (el) {
        if (el.closest("#pacificEducationPilotUserWorkspaces") || el.closest("#userRegistrationForm") || registrationIds[el.id]) return;
        if (enabled) {
          if (el.dataset.pilotGateDisabled === "true") {
            el.disabled = false;
            delete el.dataset.pilotGateDisabled;
          }
        } else {
          el.disabled = true;
          el.dataset.pilotGateDisabled = "true";
        }
      });
    }

    function ensureStudentProgressSection() {
      var progress = document.getElementById("pacificEducationStudentProgressDashboard");
      if (!progress) return;
      var host = document.getElementById("studentProgressDashboard");
      if (!host) {
        host = document.createElement("section");
        host.id = "studentProgressDashboard";
        host.setAttribute("aria-label", "Student Progress Dashboard");
        host.innerHTML = "<h2>Student Progress Dashboard</h2><p>Student learning progress for the current pilot session.</p>";
        var daily = document.getElementById("dailyLesson");
        if (daily && daily.parentNode) daily.parentNode.insertBefore(host, daily);
        else {
          var app = document.getElementById("app");
          if (app) app.appendChild(host);
        }
      }
      if (progress.parentNode !== host) host.appendChild(progress);
    }

    function ensureWeekendHolidaySupplementarySection() {
      var section = document.getElementById("pacificEducationWeekendHolidaySupplementaryActivities");
      if (section) return section;
      section = document.createElement("section");
      section.id = "pacificEducationWeekendHolidaySupplementaryActivities";
      section.setAttribute("aria-label", "Weekend and Holiday Supplementary Activities");
      section.innerHTML =
        "<h2>Weekend & Holiday Supplementary Activities</h2>" +
        "<p><strong>Separate from Daily Activities Days 1–365.</strong> This area is for supplementary weekend and school-holiday assignments only.</p>" +
        "<div id=\"pacificEducationWeekendHolidaySupplementaryStatus\" role=\"status\" aria-live=\"polite\"></div>";
      var app = document.getElementById("app");
      if (app) app.appendChild(section);
      return section;
    }

    function refreshWeekendHolidaySupplementaryStatus() {
      var section = ensureWeekendHolidaySupplementarySection();
      var status = document.getElementById("pacificEducationWeekendHolidaySupplementaryStatus");
      if (!status) return;
      var dayNumber = Number.parseInt(window.localStorage.getItem("currentDayNumber") || "1", 10);
      var calendar = window.PacificEducationTeacherCalendar || null;
      var day = calendar && typeof calendar.getDayByNumber === "function"
        ? calendar.getDayByNumber(dayNumber)
        : null;
      if (!day) {
        status.innerHTML = "<strong>Calendar status:</strong> Waiting for an authoritative school calendar. No supplementary assignment is generated or mixed into Daily Activities.";
        return;
      }
      var active = day.type === "weekend" || day.type === "holiday";
      section.hidden = !active;
      if (active) {
        status.innerHTML = "<strong>Automatic access active:</strong> Day " + esc(dayNumber) +
          " is marked " + esc(day.type) +
          ". Student, Teacher and Parent/Caregiver may use the separate supplementary assignment area. Teacher support is available for help requests.";
      } else {
        status.innerHTML = "<strong>Not a weekend/holiday:</strong> Supplementary weekend/holiday activities remain separate and inactive. Daily Activities Days 1–365 remain the normal learning sequence.";
      }
    }

    function organizeDailyActivitiesForRole(roleId) {
      var daily = document.getElementById("dailyLesson");
      if (!daily) return;
      var studentPlatform = document.getElementById("learningPlatform");
      var teacherDashboard = document.getElementById("teacherDashboard");
      var specialDashboard = document.getElementById("specialEducationDashboard");
      var parentDashboard = document.getElementById("parentDashboard");
      var host = roleId === "student" ? studentPlatform :
        roleId === "teacher" ? teacherDashboard :
        roleId === "special-education" ? specialDashboard : null;
      if (host && daily.parentNode !== host) {
        host.appendChild(daily);
      }
    }

    function setRoleVisibility(roleId) {
      ensureStudentProgressSection();
      var schoolSection = document.getElementById("pacificEducationSchoolIdentitySection");
      if (schoolSection) schoolSection.hidden = false;
      refreshWeekendHolidaySupplementaryStatus();

      var roleVisibility = {
        "blind-learner": [
          "learningPlatform","levelSelection","subjectSelection","termSelection","capabilitySelection","pacificEducationSchoolIdentitySection",
          "studentProgressDashboard","dailyLesson","pacificEducationHomeSubmission","assessments","pacificEducationCoverageDashboard",
          "pacificEducationWeekendHolidaySupplementaryActivities","pacificEducationExamCalendarSection"
        ],
        "deaf-learner": [
          "learningPlatform","levelSelection","subjectSelection","termSelection","capabilitySelection","pacificEducationSchoolIdentitySection","studentProgressDashboard","dailyLesson","pacificEducationHomeSubmission","assessments","pacificEducationCoverageDashboard","pacificEducationWeekendHolidaySupplementaryActivities","pacificEducationExamCalendarSection"
        ],
        student: [
          "learningPlatform","levelSelection","subjectSelection","termSelection","capabilitySelection","pacificEducationSchoolIdentitySection",
          "studentProgressDashboard","dailyLesson","pacificEducationHomeSubmission","assessments","pacificEducationCoverageDashboard",
          "pacificGuardianCommentSection","pacificEducationWeekendHolidaySupplementaryActivities","pacificEducationExamCalendarSection","pacificEducationSchoolIdentitySection"
        ],
        teacher: [
          "learningPlatform","levelSelection","subjectSelection","termSelection","capabilitySelection","pacificEducationSchoolIdentitySection",
          "teacherCalendarSection","teacherDashboard","dailyLesson","assessments","pacificEducationHomeSubmission","pacificEducationCoverageDashboard",
          "pacificEducationStudentProgressDashboard","pacificGuardianCommentSection","pacificEducationWeekendHolidaySupplementaryActivities","pacificEducationExamCalendarSection"
        ],
        "special-education": [
          "learningPlatform","levelSelection","subjectSelection","termSelection","capabilitySelection",
          "specialEducationDashboard","dailyLesson","assessments","pacificEducationHomeSubmission",
          "pacificEducationStudentProgressDashboard","pacificGuardianCommentSection","pacificEducationExamCalendarSection"
        ],
        "institution-admin": [
          "pacificEducationInstitutionSetup","pacificEducationInstitutionAdvice","pacificEducationExamCalendarSection"
        ],
        "head-of-school": [
          "pacificEducationSchoolIdentitySection","pacificEducationTeacherClassRoster","pacificEducationTeacherClassDashboard","pacificEducationExamCalendarSection",
          "pacificEducationCoverageDashboard"
        ],
        parent: [
          "parentDashboard","pacificGuardianCommentSection","pacificEducationWeekendHolidaySupplementaryActivities","pacificEducationExamCalendarSection"
        ],
        professional: [
          "learningPlatform","professional",
          "pacificEducationWebsitePilotChecklist","pacificGuardianCommentSection","pacificEducationExamCalendarSection"
        ],
        ngo: [
          "learningPlatform","pacificEducationWebsitePilotChecklist","pacificGuardianCommentSection","pacificEducationExamCalendarSection"
        ],
        education: [
          "learningPlatform","pacificEducationCurriculumMasterControlStatus",
          "pacificEducationCurriculumEvidenceRegistry","pacificEducationCurriculumEvidenceTraceability","pacificEducationExamCalendarSection",
          "pacificEducationCoverageDashboard"
        ],
        community: [
          "learningPlatform","pacificEducationWebsitePilotChecklist","pacificGuardianCommentSection","pacificEducationExamCalendarSection"
        ],
        owner: [
          "systemStatus","pacificEducationWebsitePilotChecklist","pacificEducationProductionReleaseChecklist",
          "pacificEducationProductionReleaseEvidenceRegistry","pacificEducationProductionReleaseEvidenceGate",
          "pacificEducationFinalProductionAuthorizationEvidenceRegistry","publicationStatus",
          "pacificEducationOfflineSyncStatus"
        ]
      };

      var allowed = (roleVisibility[roleId] || []).concat(["pacificEducationAppTools"]);
      var managed = [
        "pacificEducationAppTools","pacificEducationSchoolIdentitySection",
        "teacherCalendarSection","teacherDashboard","parentDashboard","specialEducationDashboard",
        "studentProgressDashboard","dailyLesson","assessments","pacificEducationHomeSubmission",
        "pacificGuardianCommentSection","pacificEducationWeekendHolidaySupplementaryActivities","pacificEducationExamCalendarSection","learningPlatform","levelSelection","subjectSelection",
        "termSelection","capabilitySelection","pacificEducationWebsitePilotChecklist","systemStatus",
        "pacificEducationTeacherClassDashboard","pacificEducationTeacherClassRoster","pacificEducationCoverageDashboard","pacificEducationTeacherEvidence",
        "specialEducationReviewEvidence","pacificEducationExternalReviewerPortal","pacificEducationExternalSpecialistReviewEvidenceRegistry",
        "pacificEducationExternalSpecialistReviewEvidenceLog","pacificEducationCurriculumMasterControlStatus",
        "pacificEducationCurriculumEvidenceRegistry","pacificEducationCurriculumEvidenceTraceability",
        "pacificEducationProductionReleaseChecklist","pacificEducationProductionReleaseEvidenceRegistry",
        "pacificEducationProductionReleaseEvidenceGate","pacificEducationFinalProductionAuthorizationEvidenceRegistry",
        "publicationStatus","pacificEducationOfflineSyncStatus","buyPlans"
      ];

      managed.forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.hidden = allowed.indexOf(id) === -1;
      });

      var progress = document.getElementById("pacificEducationStudentProgressDashboard");
      if (progress) {
        progress.hidden = allowed.indexOf("pacificEducationStudentProgressDashboard") === -1 &&
          allowed.indexOf("studentProgressDashboard") === -1;
      }

      var nav = document.getElementById("userFirstNavigation");
      if (nav) {
        Array.prototype.forEach.call(nav.querySelectorAll("a[href^='#']"), function(link) {
          var id = link.getAttribute("href").slice(1);
          var roleDashboardMap = {
            teacherDashboard:["teacher","special-education"],
            parentDashboard:["parent"],
            dailyLesson:["student","blind-learner","teacher","special-education"],
            assessments:["student","blind-learner","teacher","special-education"],
            learningPlatform:["student","blind-learner","teacher","special-education","parent","professional","ngo","education","community"],
            buyPlans:["owner","community","ngo","education","professional"]
          }
          var rolesForLink = roleDashboardMap[id];
          if (rolesForLink) link.hidden = rolesForLink.indexOf(roleId) === -1;
        });
      }

      // Student Platform owns the learner flow; keep Daily Activities hidden until Student is selected.
      var dailySection = document.getElementById("dailyLesson");
      if (dailySection) {
        dailySection.hidden = roleId !== "student" && roleId !== "blind-learner" && roleId !== "teacher" && roleId !== "special-education";
      }

      var learningNav = document.querySelector('#learningPlatform nav[aria-label="Learning tools"]');
      if (learningNav) {
        Array.prototype.forEach.call(learningNav.querySelectorAll("a[href^='#']"), function(link) {
          var id = link.getAttribute("href").slice(1);
          if (id === "teacherDashboard") link.hidden = roleId !== "teacher";
          if (id === "parentDashboard") link.hidden = roleId !== "parent";
        });
      }
    }


    /*
     * Role-specific workspace activities are deliberately stored separately
     * from formal learner evidence and assessment submissions. This gives each
     * pilot role something actionable to attempt without fabricating marks or
     * mixing teacher/reviewer/partner responses into student progress.
     */
    var WORKSPACE_ACTIVITY_TASKS = {
      "teacher": [
        {id:"plan-learning", title:"Plan a short learning activity", prompt:"Write a short activity for the selected class and subject. Include the learning goal, the task learners will attempt, and how you will check understanding."},
        {id:"support-learner", title:"Plan learner support", prompt:"Describe one practical way to support a learner who needs more time or a different explanation. Use demo information only."}
      ],
      "special-education": [
        {id:"adapt-access", title:"Adapt an activity for access", prompt:"Describe how you would make today's learning task accessible to a learner who needs additional support."},
        {id:"support-evidence", title:"Record a support observation", prompt:"Write a brief, respectful observation about a learner's demonstrated skill and one possible next support step. Use demo information only."}
      ],
      "parent": [
        {id:"home-practice", title:"Support learning at home", prompt:"Describe one short, safe activity you could do with a child to practise today's learning. Do not enter a child's real name or private details."},
        {id:"weekend-plan", title:"Plan a home learning routine", prompt:"Write a simple 10-minute home learning routine using familiar household objects or conversation."}
      ],
      "head-of-school": [
        {id:"review-coverage", title:"Review curriculum coverage", prompt:"List the checks you would make before deciding whether a class has covered its planned learning."},
        {id:"support-teachers", title:"Plan teacher support", prompt:"Describe one practical way school leadership could help teachers identify learner strengths and learning needs."}
      ],
      "institution-admin": [
        {id:"check-setup", title:"Check academic setup", prompt:"List the items to verify before a class begins: class reference, level, subject, term and approved teaching calendar."},
        {id:"resolve-conflict", title:"Review a setup conflict", prompt:"Explain how you would flag a duplicate or conflicting class setup without automatically creating a replacement class."}
      ],
      "professional": [
        {id:"review-quality", title:"Review activity quality", prompt:"Review an activity for clear instructions, age-appropriate language, accessibility and a way for the learner to respond. State one improvement."},
        {id:"review-evidence", title:"Review evidence responsibly", prompt:"Describe what evidence is needed before confirming a learning claim, and what should remain pending review."}
      ],
      "ngo": [
        {id:"plan-support", title:"Plan pilot support", prompt:"Describe one practical resource or service your organisation could offer to support learners or teachers during a controlled pilot."},
        {id:"report-barrier", title:"Identify an access barrier", prompt:"Describe one possible barrier to learning in a low-connectivity setting and a practical way to reduce it."}
      ],
      "education": [
        {id:"curriculum-alignment", title:"Review curriculum alignment", prompt:"List the checks needed to confirm an activity matches the selected country, level, subject and term."},
        {id:"evidence-review", title:"Review pilot evidence", prompt:"Explain how to distinguish recorded activity from verified learning evidence and teacher-approved conclusions."}
      ],
      "community": [
        {id:"local-context", title:"Suggest a local learning example", prompt:"Suggest a safe, familiar community example that could help a learner understand a school subject."},
        {id:"pilot-feedback", title:"Give pilot feedback", prompt:"Describe one thing that would make a learning activity easier to understand or use on a phone."}
      ],
      "owner": [
        {id:"pilot-readiness", title:"Review pilot readiness", prompt:"List the checks needed before a pilot change is accepted: scoped source change, automated checks, deployment status and real-device testing."},
        {id:"preserve-known-good", title:"Protect working features", prompt:"Describe how you would isolate a reported defect while preserving unrelated working features and the known-good voice baseline."}
      ],
      "technician": [
        {id:"test-navigation", title:"Test workspace navigation", prompt:"Record the role, page, action attempted and expected result when checking that only the intended workspace page is visible."},
        {id:"report-defect", title:"Prepare a useful defect report", prompt:"Write a short demo defect report with steps to reproduce, expected behaviour, actual behaviour and the test environment. Do not include secrets."}
      ]
    };

    function getWorkspaceDailyActivity() {
      var day = 1, lesson = null;
      try {
        var engine = window.PacificEducationDailyLessons;
        if (engine && typeof engine.getCurrentCoreDay === "function") day = Number(engine.getCurrentCoreDay()) || 1;
        else day = Number(window.localStorage.getItem("currentDayNumber")) || 1;
        day = Math.max(1, Math.min(365, Math.floor(day)));
        if (engine && typeof engine.getDailyLesson === "function") lesson = engine.getDailyLesson(day);
        else if (typeof window.getDailyLesson === "function") lesson = window.getDailyLesson(day);
      } catch (e) {}
      var activity = lesson && lesson.activity;
      var practice = lesson && lesson.practice;
      if (activity && typeof activity === "object") {
        activity = activity.questionText || activity.learnerTask || activity.description || activity.text || "Complete the learning task for today.";
      }
      if (practice && typeof practice === "object") {
        practice = practice.text || practice.description || "Practise the skill and give an example.";
      }
      return {
        day: day,
        title: String(lesson && lesson.title || "Daily Learning Activity"),
        activity: String(activity || "Complete the learning task for today."),
        practice: String(practice || "Practise the skill and give one example.")
      };
    }

    function workspaceTasksForRole(role) {
      var learners = ["student", "blind-learner", "deaf-learner"];
      if (learners.indexOf(role.id) !== -1) {
        var daily = getWorkspaceDailyActivity();
        var accessNote = role.id === "blind-learner"
          ? " You may type your response or use your preferred accessible response method."
          : role.id === "deaf-learner"
            ? " You may type your response or describe the task using visual/text instructions."
            : "";
        return [
          {
            id:"daily-learning-day-" + daily.day,
            title:"Day " + daily.day + " of 365 — " + daily.title,
            prompt:"Today's activity: " + daily.activity + " Your task: write or describe what you learned and give one example." + accessNote
          },
          {
            id:"practice-day-" + daily.day,
            title:"Practice — Day " + daily.day,
            prompt:daily.practice + " After practising, write one thing you can now do or explain." + accessNote
          }
        ];
      }
      var tasks = WORKSPACE_ACTIVITY_TASKS[role.id];
      if (tasks && tasks.length) return tasks;
      return [
        {id:"role-task", title:"Role workspace check", prompt:"Describe one useful task you can complete in the " + role.title + " workspace and how you would confirm it worked."},
        {id:"role-feedback", title:"Workspace improvement", prompt:"Suggest one practical improvement that would make this pilot workspace clearer or more accessible."}
      ];
    }

    function renderWorkspaceActivities(role) {
      var host = document.getElementById("pacificEducationWorkspaceActivities");
      if (!host) return;
      var tasks = workspaceTasksForRole(role);
      var saved = [];
      try {
        var parsed = JSON.parse(window.localStorage.getItem("pacificEducationWorkspaceActivityAttempts") || "[]");
        if (Array.isArray(parsed)) saved = parsed.filter(function(item) { return item && item.roleId === role.id; });
      } catch (e) {}
      host.innerHTML =
        "<h4>My Activities — Try a task now</h4>" +
        "<p>These are role-specific controlled-pilot activities. Answers are saved on this device separately from formal learner evidence and assessments. Use test/demo information only.</p>" +
        '<p id="peWorkspaceActivityCount" role="status" aria-live="polite">Saved workspace attempts for this role: ' + saved.length + '</p>' +
        '<div id="peWorkspaceActivityCards">' + tasks.map(function(task) {
          var count = saved.filter(function(item) { return item.taskId === task.id; }).length;
          return '<article style="margin:10px 0;padding:12px;border:1px solid currentColor;border-radius:8px;">' +
            '<h5>' + esc(task.title) + '</h5><p>' + esc(task.prompt) + '</p>' +
            '<form data-workspace-task="' + esc(task.id) + '">' +
            '<label for="peWorkspaceAnswer-' + esc(task.id) + '">Your response</label>' +
            '<textarea id="peWorkspaceAnswer-' + esc(task.id) + '" name="response" rows="3" maxlength="2000" required style="display:block;width:100%;box-sizing:border-box;margin:6px 0 10px;"></textarea>' +
            '<button type="submit">Save Activity Attempt</button> ' +
            '<span>Previous attempts: ' + count + '</span>' +
            '</form><p id="peWorkspaceTaskStatus-' + esc(task.id) + '" role="status" aria-live="polite"></p></article>';
        }).join("") + '</div>' +
        '<p><strong>Important:</strong> Saving here records a practice attempt only. Formal assessments, curriculum marks and teacher-approved progress remain in their existing protected workflows.</p>';

      Array.prototype.forEach.call(host.querySelectorAll("form[data-workspace-task]"), function(form) {
        form.addEventListener("submit", function(event) {
          event.preventDefault();
          var input = form.querySelector("textarea[name='response']");
          var response = String(input && input.value || "").trim();
          var taskId = form.getAttribute("data-workspace-task");
          var task = tasks.filter(function(item) { return item.id === taskId; })[0];
          var status = document.getElementById("peWorkspaceTaskStatus-" + taskId);
          if (!response) {
            if (status) status.textContent = "Please enter a response before saving.";
            return;
          }
          var records = [];
          try {
            var raw = JSON.parse(window.localStorage.getItem("pacificEducationWorkspaceActivityAttempts") || "[]");
            if (Array.isArray(raw)) records = raw;
          } catch (e) {}
          var daily = getWorkspaceDailyActivity();
          records.push({
            attemptId:"workspace-attempt-" + Date.now(),
            roleId:role.id,
            roleTitle:role.title,
            taskId:taskId,
            taskTitle:task ? task.title : "Workspace activity",
            prompt:task ? task.prompt : "",
            response:response,
            dayNumber:daily.day,
            subject:String(window.localStorage.getItem("pacificEducationSubject") || ""),
            term:String(window.localStorage.getItem("pacificEducationTerm") || ""),
            status:"workspace-practice-only",
            savedAt:new Date().toISOString()
          });
          try {
            window.localStorage.setItem("pacificEducationWorkspaceActivityAttempts", JSON.stringify(records.slice(-500)));
          } catch (e) {
            if (status) status.textContent = "This device could not save the attempt. Check available device storage and try again.";
            return;
          }
          var sameRole = records.filter(function(item) { return item && item.roleId === role.id; });
          var count = document.getElementById("peWorkspaceActivityCount");
          if (count) count.textContent = "Saved workspace attempts for this role: " + sameRole.length;
          var cardCount = form.querySelector("span");
          if (cardCount) {
            var taskCount = sameRole.filter(function(item) { return item.taskId === taskId; }).length;
            cardCount.textContent = "Previous attempts: " + taskCount;
          }
          if (status) status.textContent = "Attempt saved on this device. It is practice only and has not been treated as a formal assessment.";
          form.reset();
        });
      });
    }

    function renderRole(roleId) {
      var role = roles.filter(function (r) { return r.id === roleId; })[0];
      var gate = document.getElementById("pilotWorkspaceGate");
      var linkedCurriculum = null;
      try { if(window.PacificEducationCountryConfig && typeof window.PacificEducationCountryConfig.linkRegisteredUserToCurriculum==="function"){ linkedCurriculum = window.PacificEducationCountryConfig.linkRegisteredUserToCurriculum({countryCode:window.localStorage.getItem("pacificEducationCurriculumCountryCode")||""}); } } catch(e) {}
      if (!role) {
        document.getElementById("pilotRoleWorkspace").innerHTML = "";
        gate.innerHTML = "<strong>Pilot workspace selection is mandatory.</strong> Select a role before continuing with pilot activities.";
        setPilotActivityGate(false);
        return;
      }
      gate.innerHTML = "<strong>Mandatory pilot workspace selected:</strong> " + esc(role.title) + ". You may now continue testing.";
      /*
       * Controlled pilot only: selecting Student creates an explicit
       * prototype Core authorization session so protected demo actions
       * such as Complete Lesson can be tested. This is NOT production
       * authentication or role authorization.
       */
      if (
        role.id === "student" &&
        window.PacificEducationCore &&
        typeof window.PacificEducationCore.authorizeUser === "function"
      ) {
        window.PacificEducationCore.authorizeUser({
          userId: "pilot-student-demo",
          name: "Student",
          role: "student",
          prototypeSession: true,
          authorized: true
        });
      }
      try { window.sessionStorage.setItem("pacificEducationActiveRole", role.id); } catch (e) {}
      setRoleVisibility(role.id);
      if (window.PacificEducationExamCalendar && typeof window.PacificEducationExamCalendar.render === "function") window.PacificEducationExamCalendar.render();
      var examCalendar = document.getElementById("pacificEducationExamCalendarSection");
      if (examCalendar) examCalendar.hidden = ["student","teacher","special-education","head-of-school","parent","professional","ngo","education","community"].indexOf(role.id) === -1;
      if (role.id === "head-of-school" && window.PacificEducationRevisionExamRedistributionUI && typeof window.PacificEducationRevisionExamRedistributionUI.render === "function") window.PacificEducationRevisionExamRedistributionUI.render("pacificEducationExamCalendarSection");
      var schoolEditor = document.getElementById("pacificEducationSchoolIdentity");
      if (schoolEditor) schoolEditor.hidden = role.id !== "head-of-school";
      organizeDailyActivitiesForRole(role.id);
      setPilotActivityGate(true);

      var workspace = document.getElementById("pilotRoleWorkspace");
      if (role.id === "student" && !document.getElementById("studentAssignedClassContext")) {
        var sc = document.createElement("section"); sc.id = "studentAssignedClassContext"; sc.hidden = true; sc.innerHTML = "<h2>My Assigned Class / Year / Teacher</h2><p>Class, Year, Subject, Term and teaching day are assigned by the teacher. Students cannot edit these settings.</p>"; document.getElementById("app").appendChild(sc);
      }
      var assignedContext = document.getElementById("studentAssignedClassContext");
      if (assignedContext) assignedContext.hidden = role.id !== "student";
      var toolMap = {
        "blind-learner": [
          ["blindLearnerVoiceGuide","1. Voice-Guided Learning"],
          ["levelSelection","2. My Assigned Class / Level"],
          ["subjectSelection","3. Subject"],
          ["termSelection","4. Term"],
          ["dailyLesson","5. Daily Activities — Voice Guidance"],
          ["dailyLessonPracticeStage","6. Practice — Voice Support"],
          ["assessments","7. Assessments — Original Response Protected"],
          ["pacificEducationStudentProgressDashboard","8. My Progress"],
          ["pacificEducationHomeSubmission","9. Home Continuity"],
          ["pacificEducationWeekendHolidaySupplementaryActivities","10. Weekend & Holiday Activities"],
          ["blindLearnerHelp","11. Accessibility Help"]
        ],
        "deaf-learner": [
          ["deafLearnerRegistrationGuide","1. Deaf Learner Registration & Accessibility Guide"],["deafLearnerAccessibility","2. Accessibility Preferences"],["levelSelection","3. My Assigned Class / Level"],["subjectSelection","4. Subject"],["termSelection","5. Term"],["dailyLesson","6. Visual Daily Activities"],["dailyLessonPracticeStage","7. Practice — Text / Visual Support"],["assessments","8. Assessments — Original Response Protected"],["pacificEducationStudentProgressDashboard","9. My Progress"],["pacificEducationWeekendHolidaySupplementaryActivities","10. Weekend & Holiday Activities"],["deafLearnerHelp","11. Deaf Learner Help"]
        ],
        student: [
          ["studentStartLearning","1. Start Learning"],
          ["studentAssignedClassContext","2. My Assigned Class / Year / Teacher"],
          ["learningPlatform","3. Learning Tools"],
          ["levelSelection","4. Class / Level"],
          ["subjectSelection","5. Subject"],
          ["termSelection","6. Term"],
          ["dailyLesson","7. Daily Activities — Days 1–365"],
          ["dailyLessonPracticeStage","8. Practice — All Student Practice Activities"],
          ["assessments","9. Assessments — All Student Assessments"],
          ["pacificEducationCoverageDashboard","10. Curriculum Coverage"],
          ["pacificEducationStudentProgressDashboard","11. My Progress"],
          ["pacificEducationHomeSubmission","12. Home Continuity"],
          ["pacificEducationWeekendHolidaySupplementaryActivities","13. Weekend & Holiday Supplementary Activities"]
        ],
        teacher: [
          ["teacherDashboard","1. Teacher Dashboard"],
          ["pacificEducationTeacherClassDashboard","2. My Classes & Class Lists"],
          ["levelSelection","3. Class / Year Setup"],
          ["subjectSelection","4. Subject Setup"],
          ["termSelection","5. Term & Teaching Day Setup"],
          ["dailyLesson","6. Daily Activities — Days 1–365"],
          ["assessments","7. Assessments"],
          ["pacificEducationCoverageDashboard","8. Curriculum Coverage"],
          ["pacificEducationTeacherEvidence","9. Teacher Evidence"]
        ],
        "special-education": [
          ["specialEducationDashboard","1. Inclusion Dashboard"],
          ["pacificEducationTeacherClassDashboard","2. Learner / Class"],
          ["dailyLesson","3. Daily Learning"],
          ["assessments","4. Assessments"],
          ["specialEducationReviewEvidence","5. Review Evidence"],
          ["pacificEducationHomeSubmission","6. Home Evidence"]
        ],
        parent: [
          ["parentDashboard","1. Parent Dashboard & Child Class"],
          ["pacificEducationWeekendHolidaySupplementaryActivities","2. Weekend & Holiday Activities"],
          ["pacificGuardianCommentSection","3. Send Feedback"]
        ],
        professional: [
          ["pacificEducationExternalReviewerPortal","1. Reviewer Portal"],
          ["pacificEducationExternalSpecialistReviewEvidenceRegistry","2. Review Evidence"],
          ["pacificEducationExternalSpecialistReviewEvidenceLog","3. Review Evidence Log"],
          ["pacificEducationWebsitePilotChecklist","4. Pilot Checklist"]
        ],
        ngo: [
          ["pacificEducationCoverageDashboard","1. Program Coverage"],
          ["pacificEducationTeacherEvidence","2. Teacher Evidence"],
          ["pacificEducationWebsitePilotChecklist","3. Pilot Checklist"],
          ["pacificGuardianCommentSection","4. Feedback"]
        ],
        education: [
          ["pacificEducationCurriculumMasterControlStatus","1. Curriculum Control"],
          ["pacificEducationCurriculumEvidenceRegistry","2. Evidence Registry"],
          ["pacificEducationCurriculumEvidenceTraceability","3. Evidence Traceability"],
          ["pacificEducationCoverageDashboard","4. Coverage"]
        ],
        community: [
          ["learningPlatform","1. Education Services"],
          ["pacificEducationWebsitePilotChecklist","2. Pilot Information"],
          ["pacificGuardianCommentSection","3. Feedback"]
        ],
        "institution-admin": [
          ["pacificEducationInstitutionSetup","1. Institution Setup & Customisation"],
          ["pacificEducationInstitutionAdvice","2. Duplicate & Conflict Advice"],
          ["pacificEducationExamCalendarSection","3. Examination Calendar"]
        ],
        "head-of-school": [
          ["pacificEducationSchoolIdentitySection","1. School Name & Registration"],
          ["pacificEducationTeacherClassRoster","2. All Class Lists — View Only"],
          ["pacificEducationExamCalendarSection","3. Revision & Internal Examination Dates"],
          ["pacificEducationCoverageDashboard","4. School Curriculum Coverage"]
        ],
        owner: [
          ["systemStatus","1. System Status"],
          ["pacificEducationWebsitePilotChecklist","2. Pilot Checklist"],
          ["pacificEducationProductionReleaseChecklist","3. Production Release Checklist"],
          ["pacificEducationProductionReleaseEvidenceRegistry","4. Release Evidence"],
          ["pacificEducationProductionReleaseEvidenceGate","5. Release Evidence Gate"],
          ["publicationStatus","6. Publication Status"],
          ["pacificEducationOfflineSyncStatus","7. Offline / Sync Status"]
        ]
      };

      if (role.id === "blind-learner") {
        var appRoot = document.getElementById("app");
        if (appRoot && !document.getElementById("blindLearnerVoiceGuide")) {
          var blindGuide=document.createElement("section"); blindGuide.id="blindLearnerVoiceGuide"; blindGuide.setAttribute("aria-label","Blind Learner Voice Guided Workspace"); blindGuide.style.cssText="margin:12px 0;padding:16px;border:3px solid #15803d;border-radius:10px;";
          blindGuide.innerHTML="<h2>🔊 Blind Learner Workspace</h2><p><strong>Voice-first access is active.</strong> Daily Activities may provide guidance for pronunciation, spelling, grammar, clarity and completeness. Formal assessments preserve your original response and do not provide corrective coaching.</p><div><button type=\"button\" id=\"blindLearnerHearInstructions\">🔊 Hear Instructions</button> <button type=\"button\" id=\"blindLearnerStopSpeech\">■ Stop Speech</button></div><p id=\"blindLearnerWorkspaceStatus\" role=\"status\" aria-live=\"polite\">Voice guidance ready.</p></section>";
          appRoot.insertBefore(blindGuide, document.getElementById("pacificEducationPilotUserWorkspaces") || null);
        }
        var bh=document.getElementById("blindLearnerHearInstructions"), bs=document.getElementById("blindLearnerStopSpeech");
        if(bh) bh.onclick=function(){var t="Welcome to the Blind Learner Workspace. Your Daily Activities are voice guided. If a spoken word is unclear, you can ask to spell it. Daily Activities may give corrective guidance, but formal assessments preserve your original response without corrective coaching."; if(window.PacificEducationSpeech&&typeof window.PacificEducationSpeech.speakText==="function")window.PacificEducationSpeech.speakText(t);};
        if(bs) bs.onclick=function(){if(window.PacificEducationSpeech&&typeof window.PacificEducationSpeech.stopSpeech==="function")window.PacificEducationSpeech.stopSpeech();};
      }
      var workspaceTools = (window.PacificEducationMandatedWorkspace && typeof window.PacificEducationMandatedWorkspace.resolve === "function")
        ? window.PacificEducationMandatedWorkspace.resolve(role.id, toolMap[role.id] || [])
        : (toolMap[role.id] || []);

      workspace.innerHTML =
        "<h3>" + esc(role.title) + " Workspace</h3>" +
        "<p><strong>Pilot access:</strong> " + esc(role.access) + "</p>" +
        '<p id="pilotSchoolContext" role="status" aria-live="polite"><strong>Shared pilot context:</strong> ' + pilotContextSummary() + '</p>' +
        '<p id="pilotLinkedCurriculum" role="status" aria-live="polite"><strong>Linked country curriculum:</strong> ' + esc(linkedCurriculum && linkedCurriculum.country ? linkedCurriculum.country : "Country registration required") + '. Daily Activities, Practice and Assessments use this linked curriculum space.</p>' +
        '<p><strong>Open a role-specific tool:</strong></p>' +
        '<nav aria-label="Role pilot tools" style="display:flex;flex-direction:column;gap:10px;max-width:520px;">' +
        workspaceTools.map(function(tool) {
          return '<button type="button" data-pilot-target="' + esc(tool[0]) + '" style="display:block;width:100%;text-align:left;padding:12px 14px;border:1px solid currentColor;border-radius:6px;' + (tool[0] === "studentStartLearning" ? "font-size:1.08em;font-weight:bold;" : "") + '">' + esc(tool[1]) + '</button>';
        }).join("") +
        "</nav>" +
        '<p id="pilotWorkspaceStatus" aria-live="polite" style="margin-top:10px;">Choose a tool above to continue.</p>' +
        '<section id="pacificEducationWorkspaceActivities" aria-label="Workspace activities" style="margin-top:18px;padding:16px;border:2px solid currentColor;border-radius:8px;"></section>';

      renderWorkspaceActivities(role);

      var signout=document.createElement("section");
      signout.id="pacificEducationWorkspaceSignOut";
      signout.setAttribute("aria-label","Sign out");
      signout.style.cssText="margin-top:24px;padding:16px;border-top:2px solid currentColor;";
      signout.innerHTML='<h4>Finish this workspace session</h4><button type="button" id="pacificEducationSignOutButton" style="display:block;width:100%;max-width:520px;padding:14px 16px;font-size:1.05em;font-weight:700;border:2px solid currentColor;border-radius:8px;">🔴 Sign Out</button><div id="pacificEducationSignOutConfirm" hidden style="margin-top:12px;padding:12px;border:2px solid currentColor;border-radius:8px;"><p><strong>Are you sure you want to sign out?</strong> Saved pilot learning and evidence records will not be deleted.</p><button type="button" id="pacificEducationSignOutYes" style="margin-right:8px;padding:10px 14px;">✓ Confirm Sign Out</button><button type="button" id="pacificEducationSignOutNo" style="padding:10px 14px;">Cancel</button></div><p id="pacificEducationSignOutStatus" role="status" aria-live="polite">Sign Out is available at the bottom of this workspace.</p>';
      var liveStatus=document.createElement("section");
      liveStatus.id="pacificEducationWorkspaceLiveStatus";
      liveStatus.setAttribute("aria-label","Live pilot status");
      liveStatus.style.cssText="margin-top:18px;padding:16px;border:2px solid currentColor;border-radius:8px;";
      liveStatus.innerHTML='<h4>🔴 Live Status</h4><p id="peLiveConnection"><strong>Connection:</strong> checking…</p><p id="peLiveSync"><strong>Offline/Sync:</strong> device status only; saved pilot records remain available offline.</p><p id="peLiveMessages"><strong>Messages:</strong> checking…</p><p id="peLiveVoice"><strong>Voice:</strong> checking…</p><p id="peLiveCurriculum"><strong>Curriculum:</strong> '+esc(linkedCurriculum && linkedCurriculum.country ? linkedCurriculum.country : "Registration country required")+'</p><p id="peLivePilot"><strong>Pilot:</strong> Controlled pilot — not production.</p><button type="button" id="peLiveRefresh" style="padding:10px 14px;">↻ Refresh Live Status</button><p id="peLiveStatus" role="status" aria-live="polite">Live status ready.</p></section>';
      workspace.appendChild(liveStatus);
      function refreshLiveStatus(){
        var online=navigator.onLine;
        var conn=document.getElementById("peLiveConnection");
        var sync=document.getElementById("peLiveSync");
        var msgs=document.getElementById("peLiveMessages");
        var voice=document.getElementById("peLiveVoice");
        var curriculum=document.getElementById("peLiveCurriculum");
        if(conn) conn.innerHTML="<strong>Connection:</strong> "+(online?"🟢 Online":"⚫ Offline — learning can continue offline");
        if(sync) sync.innerHTML="<strong>Offline/Sync:</strong> "+(online?"Online connection available; server sync status is not claimed by this device indicator.":"Offline mode active; records remain on the device until connectivity returns.");
        var count=0;
        try{var raw=localStorage.getItem("pacificEducationPilotMailbox");if(raw){var parsed=JSON.parse(raw);count=Array.isArray(parsed)?parsed.length:(parsed&&Array.isArray(parsed.messages)?parsed.messages.length:0);}}catch(e){}
        if(msgs) msgs.innerHTML="<strong>Messages:</strong> "+count+" stored pilot message"+(count===1?"":"s");
        var voiceReady=!!(window.PacificEducationSpeech&&typeof window.PacificEducationSpeech.speakText==="function");
        if(voice) voice.innerHTML="<strong>Voice:</strong> "+(voiceReady?"🟢 Pacific Education speech controller available":"🟠 Voice controller not currently available");
        if(curriculum) curriculum.innerHTML="<strong>Curriculum:</strong> "+esc(linkedCurriculum&&linkedCurriculum.country?linkedCurriculum.country:"Registration country required");
      }
      document.getElementById("peLiveRefresh").onclick=function(){refreshLiveStatus();var s=document.getElementById("peLiveStatus");if(s)s.textContent="Live status refreshed.";if(window.PacificEducationSpeech&&typeof window.PacificEducationSpeech.speakText==="function")window.PacificEducationSpeech.speakText("Live status refreshed. Connection, offline status, messages, voice and curriculum context are shown.");};
      window.addEventListener("online",refreshLiveStatus);
      window.addEventListener("offline",refreshLiveStatus);
      refreshLiveStatus();

      var workspaceExtras=document.createElement("section");
      workspaceExtras.id="pacificEducationWorkspaceExtras";
      workspaceExtras.style.cssText="margin-top:18px;padding:16px;border:1px solid currentColor;border-radius:8px;";
      workspaceExtras.innerHTML='<h4>Workspace Home & My Profile</h4><p><strong>You are in your '+esc(role.title)+' Workspace.</strong> Your role controls the tools shown below.</p><div><strong>My Profile</strong><ul><li>Name: '+esc((function(){try{return sessionStorage.getItem("pilotRegistrationName")||"Pilot user";}catch(e){return "Pilot user";}})())+'</li><li>Role: '+esc(role.title)+'</li><li>Registration: Active for this pilot session</li></ul></div><div style="margin-top:12px;"><strong>Voice & Accessibility</strong><br><button type="button" id="peWorkspaceHear">🔊 Hear Instructions</button> <button type="button" id="peWorkspaceRepeat">↻ Repeat</button> <button type="button" id="peWorkspaceStop">■ Stop Speech</button><p>Voice command help: say Next, Read, Read Choices, Help, or Sign Out.</p></div><div style="margin-top:12px;"><strong>My Tasks</strong><p id="peWorkspaceTasks">Loading role tasks…</p></div><div style="margin-top:12px;"><strong>Messages & Notifications</strong><p id="peWorkspaceMessages">No new pilot messages. Important teacher, reviewer and system notices will appear here.</p></div><div style="margin-top:12px;"><strong>Progress & Reports</strong><p id="peWorkspaceProgress">Current pilot workspace progress is available through the role tools above.</p></div><div style="margin-top:12px;"><strong>Help</strong><p id="peWorkspaceHelp">Need help? Use Hear Instructions or ask for the next step. Student and accessibility flows remain voice-guided.</p></div><button type="button" id="peWorkspaceNext" style="margin-top:12px;background:#15803d;color:white;padding:14px 18px;font-weight:700;border-radius:8px;">➡️ Next — Follow the guided step</button><p id="peWorkspaceNextStatus" role="status" aria-live="polite">Next is ready.</p>';
      workspace.appendChild(workspaceExtras);
      document.getElementById("peWorkspaceHear").onclick=function(){var t="Welcome to your "+role.title+" Workspace. "+role.access+". Choose your role-specific tool, use voice help when needed, and use Sign Out at the bottom when finished.";if(window.PacificEducationSpeech&&typeof window.PacificEducationSpeech.speakText==="function")window.PacificEducationSpeech.speakText(t);};
      document.getElementById("peWorkspaceRepeat").onclick=function(){document.getElementById("peWorkspaceHear").click();};
      document.getElementById("peWorkspaceStop").onclick=function(){if(window.PacificEducationSpeech&&typeof window.PacificEducationSpeech.stopSpeech==="function")window.PacificEducationSpeech.stopSpeech();};
      document.getElementById("peWorkspaceNext").onclick=function(){var s=document.getElementById("peWorkspaceNextStatus");s.textContent="Next step: choose the first available role-specific tool above.";var first=workspace.querySelector("[data-pilot-target]");if(first)first.focus();if(window.PacificEducationSpeech&&typeof window.PacificEducationSpeech.speakText==="function")window.PacificEducationSpeech.speakText("Next step: choose the first available role-specific tool above.");};
      var task=document.getElementById("peWorkspaceTasks");if(task)task.textContent=role.actions.join(" • ");
      workspace.appendChild(signout);
      document.getElementById("pacificEducationSignOutButton").onclick=function(){
        var box=document.getElementById("pacificEducationSignOutConfirm");
        if(box) box.hidden=false;
        if(window.PacificEducationSpeech&&typeof window.PacificEducationSpeech.speakText==="function") window.PacificEducationSpeech.speakText("You selected Sign Out. Confirm Sign Out or Cancel.");
      };
      document.getElementById("pacificEducationSignOutNo").onclick=function(){
        var box=document.getElementById("pacificEducationSignOutConfirm");
        if(box) box.hidden=true;
      };
      document.getElementById("pacificEducationSignOutYes").onclick=function(){
        try{sessionStorage.removeItem("pacificEducationPilotRegistration");sessionStorage.removeItem("pacificEducationPilotRole");sessionStorage.removeItem("pacificEducationActiveRole");sessionStorage.removeItem("pacificEducationPilotRegistered");sessionStorage.removeItem("pilotRegistrationRole");sessionStorage.removeItem("pilotRegistrationName");}catch(e){}
        var ws=document.getElementById("pacificEducationPilotUserWorkspaces");
        if(ws) ws.hidden=true;
        var reg=document.getElementById("pacificEducationIdentityRegistration")||document.getElementById("userRegistrationForm");
        if(reg){reg.hidden=false;try{reg.scrollIntoView({behavior:"smooth",block:"start"});}catch(e){}}
        var status=document.getElementById("pacificEducationSignOutStatus");
        if(status) status.textContent="Signed out successfully. User Registration is ready for the next user.";
        if(window.PacificEducationSpeech&&typeof window.PacificEducationSpeech.speakText==="function") window.PacificEducationSpeech.speakText("You are signed out. User Registration is ready for the next user.");
      };

      Array.prototype.forEach.call(workspace.querySelectorAll("[data-pilot-target]"), function(button) {
        button.addEventListener("click", function() {
          var id = button.getAttribute("data-pilot-target");
          if (id === "studentStartLearning") {
            var target = document.getElementById("levelSelection") || document.getElementById("learningPlatform");
            if (target) { try { target.scrollIntoView({behavior:"smooth", block:"start"}); } catch (e) {} }
            var status = document.getElementById("pilotWorkspaceStatus");
            if (status) status.textContent = "Start Learning opened. Select your class/level, subject and term to begin.";
            return;
          }
          var ok = revealTarget(id);
          var status = document.getElementById("pilotWorkspaceStatus");
          if (status) status.textContent = ok ? "Opened " + button.textContent + "." : "That pilot tool is not available in this build.";
        });
      });
    }

    ["pacificEducationSchoolChanged","pacificEducationSelectionChanged"].forEach(function (eventName) {
      document.addEventListener(eventName, function () {
        ensureSchoolIdentity();
        refreshPilotContext();
      });
    });

    select.onchange = function () {
      renderRole(select.value);
      if (select.value) {
        try { window.sessionStorage.setItem("pacificEducationPilotRole", select.value); } catch (e) {}
      }
    };
    var savedRole = "";
    try { savedRole = window.sessionStorage.getItem("pacificEducationPilotRole") || ""; } catch (e) {}
    if (roles.some(function (r) { return r.id === savedRole; })) {
      select.value = savedRole;
    }
    renderRole(select.value);
    window.PacificEducationPilotUserWorkspaces = { roles: roles, render: render, ensureWeekendHolidaySupplementarySection: ensureWeekendHolidaySupplementarySection, refreshWeekendHolidaySupplementaryStatus: refreshWeekendHolidaySupplementaryStatus };
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render);
  else render();
})(window, document);
