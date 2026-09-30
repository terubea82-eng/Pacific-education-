/*
 * Pacific Education — Single Pilot Entry / Role Routing
 * v1.0.0
 *
 * Pilot UX rule:
 * - Show one registration box first.
 * - After registration, route the user directly to the tools for that role.
 * - Student goes directly to learning + assessment.
 * - Keep Pacific Guardian comment/request handling inside the user's platform.
 *
 * This is a pilot navigation boundary, not production authentication.
 */
(function (window, document) {
  "use strict";

  var ENTRY_ID = "pacificEducationSingleRegistration";
  var LANGUAGE_KEY = "pacificEducationUserRegistrationLanguageV1";
  var LANGUAGE_OPTIONS = [
    {value:"English",label:"English",direction:"ltr"},
    {value:"French",label:"Français",direction:"ltr"},
    {value:"Spanish",label:"Español",direction:"ltr"},
    {value:"Portuguese",label:"Português",direction:"ltr"},
    {value:"Arabic",label:"العربية",direction:"rtl"},
    {value:"Hindi",label:"हिन्दी",direction:"ltr"},
    {value:"Chinese",label:"中文",direction:"ltr"},
    {value:"Japanese",label:"日本語",direction:"ltr"}
  ];
  function safeLanguageGet(){try{return JSON.parse(sessionStorage.getItem(LANGUAGE_KEY)||"null");}catch(e){return null;}}
  function safeLanguageSet(v){try{sessionStorage.setItem(LANGUAGE_KEY,JSON.stringify(v));}catch(e){}}
  function languageOptionHtml(){return LANGUAGE_OPTIONS.map(function(x){return "<option value=\"" + x.value + "\">" + x.label + "</option>";}).join("");}
  function applyRegistrationLanguage(language){
    var item=LANGUAGE_OPTIONS.filter(function(x){return x.value===language;})[0]||LANGUAGE_OPTIONS[0];
    document.documentElement.dir=item.direction;
    document.documentElement.lang=item.value==="English"?"en":item.value.toLowerCase();
    if(window.PacificEducationLanguagePreferences&&typeof window.PacificEducationLanguagePreferences.configure==="function"){
      window.PacificEducationLanguagePreferences.configure({interfaceLanguage:item.value,learningLanguage:item.value,direction:item.direction},true);
    }
    return item;
  }
  var ROLE_ROUTES = {
    student: ["learningPlatform", "levelSelection", "subjectSelection", "termSelection", "capabilitySelection", "dailyLesson", "pacificEducationTermBaseline", "assessments", "pacificEducationStudentProgressDashboard", "pacificEducationHomeSubmission", "pacificEducationTransferIntake", "pacificGuardianCommentSection"],
    teacher: ["teacherDashboard", "teacherCalendarSection", "pacificEducationTeacherClassDashboard", "pacificEducationCoverageDashboard", "pacificEducationTeacherEvidence", "pacificEducationHomeSubmission", "pacificGuardianCommentSection"],
    "special-education": ["teacherDashboard", "specialEducationDashboard", "specialEducationReviewEvidence", "pacificEducationTeacherClassDashboard", "pacificEducationHomeSubmission", "pacificGuardianCommentSection"],
    parent: ["parentDashboard", "pacificGuardianCommentSection"],
    professional: ["pacificEducationWebsitePilotChecklist", "pacificEducationExternalReviewerPortal", "pacificEducationExternalSpecialistReviewEvidenceRegistry", "pacificEducationExternalSpecialistReviewEvidenceLog", "pacificGuardianCommentSection"],
    ngo: ["pacificEducationWebsitePilotChecklist", "pacificEducationCoverageDashboard", "pacificEducationTeacherEvidence", "pacificGuardianCommentSection"],
    education: ["pacificEducationWebsitePilotChecklist", "pacificEducationCoverageDashboard", "pacificEducationCurriculumMasterControlStatus", "pacificEducationCurriculumEvidenceRegistry", "pacificEducationCurriculumEvidenceTraceability", "pacificGuardianCommentSection"],
    community: ["pacificEducationWebsitePilotChecklist", "pacificEducationCoverageDashboard", "pacificGuardianCommentSection"],
    owner: ["systemStatus", "pacificEducationWebsitePilotChecklist", "pacificEducationProductionReleaseChecklist", "pacificEducationProductionReleaseEvidenceRegistry", "pacificEducationProductionReleaseEvidenceGate", "pacificEducationFinalProductionAuthorizationEvidenceRegistry", "publicationStatus", "pacificEducationOfflineSyncStatus", "pacificGuardianCommentSection"]
  };

  function safeGet(key) {
    try { return window.sessionStorage.getItem(key) || ""; } catch (e) { return ""; }
  }

  function safeSet(key, value) {
    try { window.sessionStorage.setItem(key, value); } catch (e) {}
  }

  function getRoleTitle(role) {
    var map = {
      student: "Student",
      teacher: "Teacher",
      "special-education": "Special Education / Inclusion",
      parent: "Parent / Caregiver",
      professional: "Professional Reviewer",
      ngo: "NGO / Organization",
      education: "Education / Government",
      community: "Community / Partner",
      owner: "Owner / Control"
    };
    return map[role] || "User";
  }

  function hideAllForEntry() {
    var main = document.getElementById("app");
    if (!main) return;

    Array.prototype.forEach.call(main.children, function (el) {
      if (el.id === ENTRY_ID) return;
      if (el.id === "pilotBanner") return;
      el.hidden = true;
    });

    var nav = document.getElementById("userFirstNavigation");
    if (nav) nav.hidden = true;

    var workspace = document.getElementById("pacificEducationPilotUserWorkspaces");
    if (workspace) workspace.hidden = true;
  }

  function showRoute(role) {
    var main = document.getElementById("app");
    if (!main) return;

    Array.prototype.forEach.call(main.children, function (el) {
      if (el.id === ENTRY_ID) return;
      if (el.id === "pilotBanner") return;
      el.hidden = true;
    });

    var routes = ROLE_ROUTES[role] || [];
    routes.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) {
        el.hidden = false;
        /* Reveal hidden ancestors so nested dashboards are actually visible. */
        var parent = el.parentElement;
        while (parent && parent.id !== "app") {
          parent.hidden = false;
          parent = parent.parentElement;
        }
      }
    });

    /* Teacher pilot workspace: ensure the dashboard has a usable synthetic class context. */
    if (role === "teacher" || role === "special-education") {
      try {
        var roster = window.PacificEducationTeacherClassRosterContext;
        if (roster) {
          var classId = roster.getClassId && roster.getClassId();
          if (!classId) {
            roster.createClass("YEAR-7-01", "Class 7", "PILOT-TEACHER-001", "01");
            roster.setClassId("YEAR-7-01");
            roster.addStudent("YEAR-7-01", "PILOT-STUDENT-001");
          } else if (roster.getStudents && roster.getStudents(classId).length === 0) {
            roster.addStudent(classId, "PILOT-STUDENT-001");
          }
          if (typeof roster.render === "function") roster.render("pacificEducationTeacherClassRoster");
        }
        var teacherDashboard = window.PacificEducationTeacherClassDashboardUI;
        if (teacherDashboard && typeof teacherDashboard.render === "function") {
          teacherDashboard.render("pacificEducationTeacherClassDashboard");
        }
        if (window.PacificEducationDashboards && typeof window.PacificEducationDashboards.refreshTeacherDashboard === "function") {
          window.PacificEducationDashboards.refreshTeacherDashboard();
        }
      } catch (teacherDashboardError) {
        console.warn("Pacific Education: teacher pilot dashboard initialization recovered from an error.", teacherDashboardError);
      }
    }

    var learning = document.getElementById("learningPlatform");
    var level = document.getElementById("levelSelection");
    var subject = document.getElementById("subjectSelection");
    var term = document.getElementById("termSelection");
    var capability = document.getElementById("capabilitySelection");

    if (role === "student") {
      if (learning) learning.hidden = false;
      if (level) level.hidden = false;
      if (subject) subject.hidden = false;
      if (term) term.hidden = false;
      if (capability) capability.hidden = false;

      /* Student workspace must initialize its own learning controls after routing. */
      try {
        if (window.PacificEducationLevelSelector && typeof window.PacificEducationLevelSelector.initialise === "function") {
          window.PacificEducationLevelSelector.initialise();
        }
        if (window.PacificEducationSubjectSelector && typeof window.PacificEducationSubjectSelector.initialise === "function") {
          window.PacificEducationSubjectSelector.initialise();
        }
        if (window.PacificEducationTermSelector && typeof window.PacificEducationTermSelector.initialise === "function") {
          window.PacificEducationTermSelector.initialise();
        }
        if (window.PacificEducationCapabilitySelector && typeof window.PacificEducationCapabilitySelector.initialise === "function") {
          window.PacificEducationCapabilitySelector.initialise();
        }
        if (window.PacificEducationCurriculumLessonRenderer && typeof window.PacificEducationCurriculumLessonRenderer.refresh === "function") {
          window.PacificEducationCurriculumLessonRenderer.refresh();
        } else if (typeof window.displayDailyLesson === "function") {
          window.displayDailyLesson();
        }
        if (window.PacificEducationStudentProgressDashboardUI && typeof window.PacificEducationStudentProgressDashboardUI.render === "function") {
          window.PacificEducationStudentProgressDashboardUI.render("pacificEducationStudentProgressDashboard");
        }
      } catch (studentWorkspaceError) {
        console.warn("Pacific Education: student pilot workspace initialization recovered from an error.", studentWorkspaceError);
      }
    }

    var nav = document.getElementById("userFirstNavigation");
    if (nav) nav.hidden = true;

    var workspace = document.getElementById("pacificEducationPilotUserWorkspaces");
    if (workspace) workspace.hidden = true;

    if (window.PacificEducationTeacherStudentCalendarLink && typeof window.PacificEducationTeacherStudentCalendarLink.render === "function") {
      window.PacificEducationTeacherStudentCalendarLink.render();
    }

    var entry = document.getElementById(ENTRY_ID);
    if (entry) {
      entry.innerHTML =
        "<h2>" + getRoleTitle(role) + " Pilot Platform</h2>" +
        "<p><strong>Registration complete.</strong> Your pilot workspace is now linked.</p>" +
        (role === "student"
          ? "<p><strong>Student:</strong> your learning, baseline, assessments, progress, home continuity and Pacific Guardian request area are connected to this workspace.</p>"
          : "<p>Your role-specific pilot tools are connected to this workspace. Other roles and administrative controls are not shown here.</p>") +
        "<p id=\"singleEntryStatus\" aria-live=\"polite\"></p>" +
        "<button type=\"button\" id=\"pilotSignOutButton\" data-pacific-action=\"pilot-sign-out\">Return to registration</button>";

      document.getElementById("pilotSignOutButton").onclick = function () {
        safeSet("pacificEducationPilotRegistered", "");
        safeSet("pacificEducationPilotRole", "");
        location.reload();
      };
    }
  }

  function authorizeStudent() {
    if (window.PacificEducationCore &&
        typeof window.PacificEducationCore.authorizeUser === "function") {
      window.PacificEducationCore.authorizeUser({
        userId: "pilot-student-demo",
        name: "Student",
        role: "student",
        prototypeSession: true,
        authorized: true
      });
    }
  }

  function authorizePrototypeStudent() {
    authorizeStudent();
    var status = document.getElementById("prototypeAccessStatus");
    if (status) status.textContent = "Authorized synthetic Student pilot session. Production authorization remains locked.";
    showRoute("student");
  }

  function registerRole(role, language) {
    if (!role) return;
    var selectedLanguage=language||(document.getElementById("singlePilotLanguage")&&document.getElementById("singlePilotLanguage").value)||"English";
    applyRegistrationLanguage(selectedLanguage);
    safeLanguageSet({interfaceLanguage:selectedLanguage,learningLanguage:selectedLanguage,selectedAt:new Date().toISOString()});

    safeSet("pacificEducationPilotRole", role);
    safeSet("pacificEducationPilotRegistered", "true");

    if (role === "student") {
      authorizeStudent();
      try {
        window.localStorage.setItem("pacificEducationLevel", window.localStorage.getItem("pacificEducationLevel") || "Class 1");
        window.localStorage.setItem("pacificEducationSubject", window.localStorage.getItem("pacificEducationSubject") || "English");
        window.localStorage.setItem("pacificEducationTerm", window.localStorage.getItem("pacificEducationTerm") || "Term 1");
        window.localStorage.setItem("pacificEducationCapability", window.localStorage.getItem("pacificEducationCapability") || "expected");
      } catch (e) {}
    }

    showRoute(role);
  }

  function render() {
    var main = document.getElementById("app");
    if (!main || document.getElementById(ENTRY_ID)) return;

    var section = document.createElement("section");
    section.id = ENTRY_ID;
    section.setAttribute("aria-label", "Pacific Education single user registration");
    section.style.cssText = "border:2px solid currentColor;border-radius:14px;padding:20px;margin:12px 0 20px;background:rgba(127,127,127,.08);box-shadow:0 2px 10px rgba(0,0,0,.08)";
    section.innerHTML =
      "<div style=\"display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap\">" +
        "<div><p style=\"margin:0 0 6px\"><strong>CONTROLLED PILOT • USER ENTRY</strong></p>" +
        "<h2 style=\"margin:0\">Pacific Education Pilot</h2></div>" +
        "<span style=\"border:1px solid currentColor;border-radius:999px;padding:5px 10px;font-size:.85em\">Pilot only • Production locked</span>" +
      "</div>" +
      "<p><strong>Welcome.</strong> Choose your pilot role below. Your role determines which learning, review and dashboard tools are shown.</p>" +
      "<p><strong>Student:</strong> Daily Learning → Activities → Assessments → Progress. <strong>Other roles:</strong> role-specific pilot workspace only.</p>" +
      "<label for=\"singlePilotRole\"><strong>Who are you testing as?</strong></label><br>" +
      "<select id=\"singlePilotRole\" style=\"width:100%;max-width:620px;padding:12px;margin-top:7px;border-radius:8px\">" +
      "<option value=\"\">Select pilot role</option>" +
      "<option value=\"student\">Student</option>" +
      "<option value=\"teacher\">Teacher</option>" +
      "<option value=\"special-education\">Special Education / Inclusion</option>" +
      "<option value=\"parent\">Parent / Caregiver</option>" +
      "<option value=\"professional\">Professional Reviewer</option>" +
      "<option value=\"ngo\">NGO / Organization</option>" +
      "<option value=\"education\">Education / Government</option>" +
      "<option value=\"community\">Community / Partner</option>" +
      "<option value=\"owner\">Owner / Control</option>" +
      "</select><br>" +
      "<button type=\"button\" id=\"singlePilotRegisterButton\" data-pacific-action=\"pilot-enter-workspace\" style=\"margin-top:12px;padding:11px 18px;border-radius:8px\">Enter Pilot Workspace</button>" +
      "<p id=\"singlePilotRegistrationStatus\" role=\"status\" aria-live=\"polite\">Select a role to begin. No other pilot workspace is exposed before entry.</p>" +
      "<div style=\"margin-top:14px;padding:12px;border-left:4px solid currentColor\"><strong>Pilot safety boundary</strong><br><small>Use demonstration/test data only. Do not enter passwords, payment details, sensitive child information or exact location. This pilot entry is not production authentication and cannot authorize production release.</small></div>";
    main.insertBefore(section, main.firstChild);

    document.getElementById("singlePilotRegisterButton").onclick = function () {
      var role = document.getElementById("singlePilotRole").value;
      var language = document.getElementById("singlePilotLanguage").value;
      var status = document.getElementById("singlePilotRegistrationStatus");
      if (!role) {
        status.textContent = "Please select your user type.";
        return;
      }
      status.textContent = "Registration accepted. Linking your " + getRoleTitle(role) + " pilot platform in " + language + "...";
      registerRole(role, language);
    };

    var savedRole = safeGet("pacificEducationPilotRole");
    var registered = safeGet("pacificEducationPilotRegistered") === "true";
    var savedLanguage = safeLanguageGet();
    var languageSelect = document.getElementById("singlePilotLanguage");
    if (languageSelect && savedLanguage && savedLanguage.interfaceLanguage) {
      languageSelect.value = savedLanguage.interfaceLanguage;
      applyRegistrationLanguage(savedLanguage.interfaceLanguage);
    }
    if (registered && ROLE_ROUTES[savedRole]) {
      registerRole(savedRole, savedLanguage && savedLanguage.interfaceLanguage);
    } else {
      hideAllForEntry();
    }

    window.PacificEducationSinglePilotEntry = Object.freeze({
      version: "1.3.0",
      prototype: true,
      productionEligible: false,
      registerRole: registerRole,
      showRoute: showRoute
    });
  }

  window.authorizePrototypeStudent = authorizePrototypeStudent;

  function guardianCommentBridge() {
    window.submitPacificGuardianComment = function () {
      var input = document.getElementById("pacificGuardianComment");
      var status = document.getElementById("pacificGuardianCommentStatus");
      var comment = input ? String(input.value || "").trim() : "";
      if (!comment) {
        if (status) status.textContent = "Please enter a comment or request.";
        return;
      }

      var context = {
        role: safeGet("pacificEducationPilotRole"),
        userId: (window.PacificEducationCore &&
          window.PacificEducationCore.identity &&
          typeof window.PacificEducationCore.identity.getUserId === "function")
          ? window.PacificEducationCore.identity.getUserId()
          : "pilot-user"
      };

      var result = window.PacificEducationGuardian &&
        typeof window.PacificEducationGuardian.submitComment === "function"
        ? window.PacificEducationGuardian.submitComment(comment, context)
        : null;

      if (result && result.accepted) {
        if (status) {
          status.textContent =
            result.acknowledgement +
            " Your request is recorded for Guardian review and needs alignment. Pilot responses remain subject to authorized verification.";
        }
        input.value = "";
      } else if (status) {
        status.textContent = result && result.message
          ? result.message
          : "Pacific Guardian review service is not connected in this pilot.";
      }
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      render();
      guardianCommentBridge();
    });
  } else {
    render();
    guardianCommentBridge();
  }
})(window, document);
