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
  var ROLE_ROUTES = {
    student: ["dailyLesson", "assessments", "pacificEducationStudentProgressDashboard", "pacificGuardianCommentSection"],
    teacher: ["teacherDashboard", "teacherCalendarSection", "pacificGuardianCommentSection"],
    "special-education": ["teacherDashboard", "pacificEducationHomeSubmission", "pacificGuardianCommentSection"],
    parent: ["parentDashboard", "pacificGuardianCommentSection"],
    professional: ["pacificEducationWebsitePilotChecklist", "pacificGuardianCommentSection"],
    ngo: ["pacificEducationWebsitePilotChecklist", "pacificGuardianCommentSection"],
    education: ["pacificEducationWebsitePilotChecklist", "pacificGuardianCommentSection"],
    community: ["pacificEducationWebsitePilotChecklist", "pacificGuardianCommentSection"],
    owner: ["systemStatus", "pacificEducationWebsitePilotChecklist", "pacificGuardianCommentSection"]
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
      if (el) el.hidden = false;
    });

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
    }

    var nav = document.getElementById("userFirstNavigation");
    if (nav) nav.hidden = true;

    var workspace = document.getElementById("pacificEducationPilotUserWorkspaces");
    if (workspace) workspace.hidden = true;

    var entry = document.getElementById(ENTRY_ID);
    if (entry) {
      entry.innerHTML =
        "<h2>" + getRoleTitle(role) + " Pilot Platform</h2>" +
        "<p><strong>Registration complete.</strong> Your pilot workspace is now linked.</p>" +
        (role === "student"
          ? "<p><strong>Student:</strong> go directly to Daily Learning and Assessments. Your progress and Pacific Guardian request area are connected to this workspace.</p>"
          : "<p>Your role-specific pilot tools are connected to this workspace. Other roles and administrative controls are not shown here.</p>") +
        "<p id=\"singleEntryStatus\" aria-live=\"polite\"></p>" +
        "<button type=\"button\" id=\"pilotSignOutButton\">Return to registration</button>";

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

  function registerRole(role) {
    if (!role) return;

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
    section.style.border = "2px solid currentColor";
    section.innerHTML =
      "<h2>Pacific Education — Register / Sign In</h2>" +
      "<p><strong>One registration box.</strong> Select your user type once. Pacific Education will connect you to the correct pilot platform automatically.</p>" +
      "<p>Student users go directly to Daily Learning and Assessments. Other roles are routed only to their authorized pilot workspace.</p>" +
      "<label for=\"singlePilotRole\"><strong>User type</strong></label><br>" +
      "<select id=\"singlePilotRole\" style=\"width:100%;max-width:520px;padding:12px;margin-top:6px\">" +
      "<option value=\"\">Select user type</option>" +
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
      "<button type=\"button\" id=\"singlePilotRegisterButton\" style=\"margin-top:10px\">Register / Continue</button>" +
      "<p id=\"singlePilotRegistrationStatus\" role=\"status\" aria-live=\"polite\">Pilot registration is required before any other platform tools appear.</p>" +
      "<p><small>Controlled pilot only. Do not enter real sensitive identity, password, payment or exact-location data. Production authentication and server authorization are still required.</small></p>";

    main.insertBefore(section, main.firstChild);

    document.getElementById("singlePilotRegisterButton").onclick = function () {
      var role = document.getElementById("singlePilotRole").value;
      var status = document.getElementById("singlePilotRegistrationStatus");
      if (!role) {
        status.textContent = "Please select your user type.";
        return;
      }
      status.textContent = "Registration accepted. Linking your " + getRoleTitle(role) + " pilot platform...";
      registerRole(role);
    };

    var savedRole = safeGet("pacificEducationPilotRole");
    var registered = safeGet("pacificEducationPilotRegistered") === "true";
    if (registered && ROLE_ROUTES[savedRole]) {
      registerRole(savedRole);
    } else {
      hideAllForEntry();
    }

    window.PacificEducationSinglePilotEntry = Object.freeze({
      version: "1.0.0",
      prototype: true,
      productionEligible: false,
      registerRole: registerRole,
      showRoute: showRoute
    });
  }

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
