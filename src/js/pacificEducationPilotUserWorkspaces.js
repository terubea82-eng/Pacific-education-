/* Pacific Education — controlled pilot role workspaces.
 * Demo-only UI. It does not authenticate users or expose real student data.
 */
(function (window, document) {
  "use strict";

  var roles = [
    { id:"student", title:"Student", access:"Learning, daily lessons, practice and assessments", actions:["Open daily lesson","Practice","View my progress"] },
    { id:"teacher", title:"Teacher", access:"Class, lesson, assessment and progress tools", actions:["Class dashboard","Lesson/teacher guide","Assessment review"] },
    { id:"parent", title:"Parent / Caregiver", access:"Linked-child learning overview and feedback", actions:["Learning progress","Attendance/activity view","Send feedback"] },
    { id:"professional", title:"Professional Reviewer", access:"Controlled review evidence and findings", actions:["Review evidence","Record finding","View review status"] },
    { id:"ngo", title:"NGO / Organization", access:"Program-level pilot participation and feedback", actions:["Program overview","Pilot feedback","Request support"] },
    { id:"education", title:"Education / Government", access:"Pilot-level education evidence and reporting view", actions:["Pilot overview","Evidence review","Feedback"] },
    { id:"community", title:"Community / Partner", access:"General education services and pilot feedback", actions:["Explore services","Submit feedback","Pilot information"] },
    { id:"owner", title:"Owner / Control", access:"Owner-controlled pilot oversight and release evidence", actions:["Pilot status","Evidence register","Release gates"] }
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

    function setPilotActivityGate(enabled) {
      var controls = document.querySelectorAll("main button, main select, main input, main textarea");
      Array.prototype.forEach.call(controls, function (el) {
        if (el.id === "pilotRoleSelector" || el.closest("#pacificEducationPilotUserWorkspaces")) return;
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

    function renderRole(roleId) {
      var role = roles.filter(function (r) { return r.id === roleId; })[0];
      var gate = document.getElementById("pilotWorkspaceGate");
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
      var workspace = document.getElementById("pilotRoleWorkspace");
      workspace.innerHTML =
        "<h3>" + esc(role.title) + " Workspace</h3>" +
        "<p><strong>Pilot access:</strong> " + esc(role.access) + "</p>" +
        "<ul>" + role.actions.map(function (a) { return "<li>" + esc(a) + "</li>"; }).join("") + "</ul>" +
        '<button type="button" id="pilotWorkspaceAction">Open demo workspace</button>' +
        '<div id="pilotWorkspaceStatus" aria-live="polite" style="margin-top:8px;"></div>';
      document.getElementById("pilotWorkspaceAction").onclick = function () {
        document.getElementById("pilotWorkspaceStatus").textContent =
          role.title + " demo workspace opened. Production authentication and role authorization remain separate requirements.";
      };
    }

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
    window.PacificEducationPilotUserWorkspaces = { roles: roles, render: render };
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render);
  else render();
})(window, document);
