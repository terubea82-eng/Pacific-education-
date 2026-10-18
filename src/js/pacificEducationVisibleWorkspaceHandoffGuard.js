/* Pacedu visible workspace handoff guard.
 * The registration controller and the protected #856 voice system remain authoritative.
 * This guard only intervenes after the user presses Registration Next and the normal
 * role workspace has failed to render visibly.
 */
(function(window, document){
  "use strict";
  var BOUND = "data-pacedu-visible-handoff-guard";
  function get(id){ return document.getElementById(id); }
  function savedRole(){
    var record = null, role = "";
    try {
      record = JSON.parse(window.sessionStorage.getItem("pacificEducationPilotRegistration") || "null");
      role = record && (record.role || record.userRole) || "";
    } catch (_) {}
    if (!role) {
      try { role = window.sessionStorage.getItem("pacificEducationPilotRole") || ""; } catch (_) {}
    }
    role = String(role || "").trim().toLowerCase().replace(/[_]+/g, " ").replace(/\s+/g, " ");
    var aliases = {
      "learner":"student", "blind learner":"blind-learner", "deaf learner":"deaf-learner",
      "parent/caregiver":"parent", "parent / caregiver":"parent",
      "professional reviewer":"professional", "ngo/organization":"ngo", "ngo / organization":"ngo",
      "education/government":"education", "education / government":"education",
      "community/partner":"community", "community / partner":"community",
      "owner/control":"owner", "owner / control":"owner", "special education / inclusion":"special-education"
    };
    role = aliases[role] || role.replace(/\s+/g, "-");
    var registered = !!(record && (record.registeredAt || record.registered === true));
    try { registered = registered || window.sessionStorage.getItem("pacificEducationPilotRegistered") === "true"; } catch (_) {}
    return registered && role ? role : "";
  }
  function releaseEntryIsolation(){
    var root = document.documentElement, body = document.body;
    if (root) { root.setAttribute("data-pacedu-navigation-ready", "true"); root.removeAttribute("data-pacedu-registration-entry"); }
    if (body) {
      body.setAttribute("data-pe-guided-complete", "true");
      body.classList.add("pe-guided-flow-ended");
      body.classList.remove("pe-guided-flow", "pacedu-entry-mode", "pacedu-registration-mode");
      body.removeAttribute("data-pe-flow-step");
      body.removeAttribute("data-pe-active-guided-page");
    }
    ["pacificEducationPilotPages", "pacificEducationWelcome", "paceduPageVision", "paceduPageRules", "pacificEducationIdentityRegistration"].forEach(function(id){
      var node = get(id);
      if (node) { node.hidden = true; node.setAttribute("aria-hidden", "true"); node.style.setProperty("display", "none", "important"); }
    });
  }
  function visible(node){
    if (!node) return false;
    node.hidden = false;
    node.removeAttribute("hidden");
    node.removeAttribute("aria-hidden");
    node.style.setProperty("display", "block", "important");
    node.style.setProperty("visibility", "visible", "important");
    node.style.setProperty("opacity", "1", "important");
    return true;
  }
  function addRecoveryHome(page, role){
    if (!page || (page.textContent || "").trim()) return false;
    page.replaceChildren();
    var card = document.createElement("section");
    card.id = "paceduRecoveredWorkspaceHome";
    card.setAttribute("aria-label", "Recovered Pacedu workspace home");
    card.style.cssText = "display:block!important;visibility:visible!important;padding:18px;border:2px solid #15803d;border-radius:10px;background:#fff;color:#17202a;";
    var title = document.createElement("h3");
    title.textContent = "Welcome to your Pacedu Workspace";
    card.appendChild(title);
    var intro = document.createElement("p");
    intro.textContent = "Your registration is saved. This visible recovery keeps you moving while the normal workspace page is restored.";
    card.appendChild(intro);
    var heading = document.createElement("h4");
    heading.textContent = role === "student" || role === "blind-learner" || role === "deaf-learner" ? "Your learning pathway" : "Your role workspace";
    card.appendChild(heading);
    var list = document.createElement("ol");
    (role === "student" || role === "blind-learner" || role === "deaf-learner"
      ? ["Class / Level", "Subject and Term", "Daily Activities", "Practice", "Assessment and Progress"]
      : ["Open your role workspace tools", "Review the current page", "Use Back and Next to navigate"]).forEach(function(label){
        var li = document.createElement("li"); li.textContent = label; list.appendChild(li);
      });
    card.appendChild(list);
    var note = document.createElement("p");
    note.textContent = "Controlled pilot only. Use demonstration information; this screen does not verify official records or provide production authentication.";
    card.appendChild(note);
    page.appendChild(card);
    return true;
  }
  function standaloneRecovery(role){
    if (get("paceduVisibleWorkspaceRecovery")) return get("paceduVisibleWorkspaceRecovery");
    var host = document.createElement("main");
    host.id = "paceduVisibleWorkspaceRecovery";
    host.setAttribute("role", "region");
    host.setAttribute("aria-label", "Pacedu recovered workspace");
    host.style.cssText = "display:block!important;visibility:visible!important;opacity:1!important;position:relative!important;z-index:2147483000!important;max-width:980px;margin:12px auto;padding:16px;background:#fff;color:#17202a;border:3px solid #15803d;border-radius:12px;";
    var title = document.createElement("h2");
    title.textContent = "Pacedu Workspace";
    host.appendChild(title);
    var status = document.createElement("p");
    status.setAttribute("role", "status");
    status.textContent = "Your registration is saved. The normal workspace did not become visible, so this recovery workspace is open.";
    host.appendChild(status);
    var page = document.createElement("section");
    page.id = "paceduVisibleWorkspaceRecoveryPage";
    page.style.cssText = "display:block!important;visibility:visible!important;padding:14px;border:1px solid #9fc6d4;border-radius:10px;";
    host.appendChild(page);
    var controls = document.createElement("div");
    controls.style.cssText = "display:flex;gap:10px;flex-wrap:wrap;margin-top:14px;";
    var back = document.createElement("button");
    back.type = "button"; back.textContent = "Back"; back.disabled = true;
    var next = document.createElement("button");
    next.type = "button"; next.textContent = "Next"; next.style.cssText = "background:#15803d;color:#fff;font-weight:700;padding:12px 20px;";
    controls.appendChild(back); controls.appendChild(next); host.appendChild(controls);
    var index = 0;
    function paint(){
      page.replaceChildren();
      var h = document.createElement("h3");
      var p = document.createElement("p");
      if(index === 0){
        h.textContent = "Welcome to your " + (role === "student" ? "Student" : role.replace(/-/g," ")) + " Workspace";
        p.textContent = "Use Next to open the learning activity page. The normal Pacedu workspace can be retried after this recovery.";
      } else {
        h.textContent = "Daily Learning Activity — Starter";
        p.textContent = "Read a short teacher-provided passage or lesson. Write or say three things you learned, then explain one thing you want to practise. Ask your teacher to confirm your class, subject and term.";
      }
      page.appendChild(h); page.appendChild(p);
      back.disabled = index === 0;
      next.textContent = index === 0 ? "Next — Daily Activity" : "Return to Workspace Home";
    }
    back.addEventListener("click", function(){ index = 0; paint(); });
    next.addEventListener("click", function(){ index = index === 0 ? 1 : 0; paint(); });
    releaseEntryIsolation();
    (document.body || document.documentElement).appendChild(host);
    visible(host); paint();
    return host;
  }
  function recover(){
    var role = savedRole();
    if (!role) return;
    releaseEntryIsolation();
    var api = window.PacificEducationSequentialRoleWorkspaces;
    var shell = get("pacificEducationSequentialRoleWorkspace");
    if (!shell && api && typeof api.build === "function") {
      try { api.build(role); } catch (error) {
        try { console.warn("Pacedu workspace build recovered by visible handoff guard.", error); } catch (_) {}
      }
      shell = get("pacificEducationSequentialRoleWorkspace");
    }
    if (shell) {
      visible(shell);
      var page = get("peSequentialPage");
      if (page) {
        visible(page);
        if (!page.children.length || !(page.textContent || "").trim()) addRecoveryHome(page, role);
      } else {
        standaloneRecovery(role);
      }
      var title = get("peSequentialTitle");
      if (title && !(title.textContent || "").trim()) title.textContent = "Pacedu Workspace";
      return;
    }
    standaloneRecovery(role);
  }
  function bind(){
    if (!document.body || document.body.getAttribute(BOUND) === "true") return;
    document.body.setAttribute(BOUND, "true");
    document.addEventListener("click", function(event){
      var target = event.target;
      if (!target || !target.closest) return;
      if (!target.closest("#registrationNextButton, #peSequentialNext")) return;
      /* Let the existing registration/workspace controllers run first. */
      window.setTimeout(recover, 80);
      window.setTimeout(recover, 450);
    }, true);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind);
  else bind();
  window.addEventListener("pageshow", bind);
})(window, document);
