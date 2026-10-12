/* Pacedu Registration Flow V2
 * Isolated replacement for MandatoryBoxSequence.
 * Delegated click handling survives replacement of the Next button by legacy UI repairs.
 * Protected #856 voice files and the overall SingleNavigation controller are untouched.
 */
(function (window, document) {
  "use strict";

  var BOXES = [
    { id: "pacificEducationCountriesBox", label: "Country" },
    { id: "pacificEducationLanguageBox", label: "Language" },
    { id: "pacificEducationRegistrationBox", label: "User Registration" },
    { id: "pilotRoleRegistrationFields", label: "Your Registration" }
  ];
  var state = 0;
  var ready = false;
  var scheduled = false;
  var saveFailure = false;

  function el(id) { return document.getElementById(id); }
  function selectedRole() {
    var role = el("pilotRegistrationRole");
    if (role && String(role.value || "").trim()) return true;
    return !!document.querySelector("#pilotUserRoleCards .pe-user-role-card[aria-pressed='true']");
  }
  function validName() {
    var name = el("pilotRegistrationName");
    return !!(name && String(name.value || "").trim());
  }
  function roleCardValue() {
    var role = el("pilotRegistrationRole");
    if (role && String(role.value || "").trim()) return String(role.value).trim();
    var card = document.querySelector("#pilotUserRoleCards .pe-user-role-card[aria-pressed='true']");
    return card ? String(card.getAttribute("data-role") || "").trim() : "";
  }
  function hide(elm, hidden) {
    if (!elm) return;
    elm.hidden = !!hidden;
    elm.setAttribute("aria-hidden", String(!!hidden));
    try { elm.style.setProperty("display", hidden ? "none" : "block", "important"); } catch (e) {}
  }
  function update() {
    var registration = el("pacificEducationIdentityRegistration");
    var form = el("userRegistrationForm");
    var next = el("registrationNextButton");
    if (!registration || !form || !next) return false;

    BOXES.forEach(function (item) { hide(el(item.id), true); });
    hide(form, true);
    hide(el("pilotUserRoleCards"), true);
    hide(el("pilotRoleRegistrationFields"), true);

    var current = BOXES[state];
    if (current) hide(el(current.id), false);

    if (state === 2) {
      hide(form, false);
      hide(el("pilotUserRoleCards"), false);
      hide(el("pilotRoleRegistrationFields"), !selectedRole());
    } else if (state === 3) {
      hide(el("pacificEducationRegistrationBox"), false);
      hide(form, false);
      hide(el("pilotUserRoleCards"), false);
      hide(el("pilotRoleRegistrationFields"), false);
    }
    /* Legacy registration helpers can leave role cards disabled after rebuilding
       the form. The active role-selection step must always expose tappable cards. */
    if (state === 2 || state === 3) {
      document.querySelectorAll("#pilotUserRoleCards .pe-user-role-card").forEach(function (card) {
        card.disabled = false;
        card.removeAttribute("aria-disabled");
      });
    }

    var title = el("peBoxSequenceTitle");
    var progress = el("peBoxSequenceProgress");
    if (title) title.textContent = "Mandatory registration — Step " + (state + 1) + " of 4";
    if (progress && !saveFailure) {
      progress.textContent = state === 0 ? "Choose your country, then press Next."
        : state === 1 ? "Choose your language, then press Next."
        : state === 2 ? (selectedRole() ? "Role selected. Press Next to complete your registration details." : "Choose one user role, then press Next.")
        : "Complete your name and required details, then press Save Registration.";
    }

    next.textContent = state === 3 ? "✓ Save Registration" : "➡️ Next";
    var country = el("pacificEducationCountrySelect");
    var language = el("pacificEducationLanguageSelect");
    next.disabled = (state === 0 && !(country && country.value))
      || (state === 1 && !(language && language.value))
      || (state === 2 && !selectedRole())
      || (state === 3 && !validName());
    next.setAttribute("aria-disabled", String(next.disabled));

    var save = el("pilotRegistrationSaveButton");
    if (save) {
      save.disabled = !(state === 3 && selectedRole() && validName());
      save.setAttribute("aria-disabled", String(save.disabled));
    }
    registration.setAttribute("data-pe-registration-flow-step", String(state + 1));
    registration.setAttribute("data-pe-registration-flow-version", "2");
    return true;
  }

  function advance(event) {
    var next = el("registrationNextButton");
    if (!next || (event && event.target !== next && !(event.target.closest && event.target.closest("#registrationNextButton")))) return;
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    }
    /* A replaced button can retain a stale disabled marker. Recompute from the
       actual current input before deciding whether this tap is valid. */
    update();
    if (next.disabled) {
      var progress = el("peBoxSequenceProgress");
      if (progress) progress.textContent = state === 0 ? "Choose a country before continuing."
        : state === 1 ? "Choose a language before continuing."
        : state === 2 ? "Choose a user role before continuing."
        : "Enter your name before saving registration.";
      return;
    }
    if (state < 3) {
      saveFailure = false;
      state += 1;
      update();
      return;
    }

    var save = el("pilotRegistrationSaveButton");
    if (!save || save.disabled) return;
    save.click();
    var progress = el("peBoxSequenceProgress");
    if (progress) progress.textContent = "Checking that registration was saved…";
    window.setTimeout(function () {
      var registered = false;
      try {
        registered = window.sessionStorage.getItem("pacificEducationPilotRegistered") === "true";
        if (!registered) {
          var raw = window.sessionStorage.getItem("pacificEducationPilotRegistration");
          if (raw) {
            var record = JSON.parse(raw);
            var recordRole = String(record && record.role || "").trim();
            var recordName = String(record && (record.name || record.displayName) || "").trim();
            var selected = roleCardValue();
            registered = !!(recordName && recordRole && selected && recordRole.toLowerCase() === selected.toLowerCase());
          }
        }
      } catch (e) { registered = false; }
      if (!registered) {
        saveFailure = true;
        if (progress) progress.textContent = "Registration is not confirmed as saved. Check the required details and try again.";
        update();
        return;
      }
      if (progress) progress.textContent = "Registration confirmed. Opening the next guided page.";
      var navigation = window.PacificEducationSingleNavigation;
      if (navigation && typeof navigation.go === "function") {
        navigation.go(5, "prototypeAccess");
      } else if (progress) {
        progress.textContent = "Registration saved, but page navigation is not ready. Reload Pacedu and try again.";
      }
    }, 600);
  }

  function bindRoleCards() {
    var cards = document.querySelectorAll("#pilotUserRoleCards .pe-user-role-card");
    cards.forEach(function (card) {
      if (card.getAttribute("data-pe-reg-flow-v2-bound") === "true") return;
      card.setAttribute("data-pe-reg-flow-v2-bound", "true");
      card.addEventListener("click", function () {
        var value = card.getAttribute("data-role") || "";
        if (!value) return;
        cards.forEach(function (other) {
          other.setAttribute("aria-pressed", String(other === card));
          other.disabled = false;
        });
        var role = el("pilotRegistrationRole");
        if (role) role.value = value;
        var status = el("pilotSelectedRole");
        if (status) status.textContent = "Selected role: " + value;
        update();
      }, true);
    });
  }

  function setup() {
    if (ready) { bindRoleCards(); update(); return; }
    var registration = el("pacificEducationIdentityRegistration");
    var form = el("userRegistrationForm");
    var next = el("registrationNextButton");
    if (!registration || !form || !next) return;
    ready = true;

    if (!el("pacificEducationMandatoryBoxSequence")) {
      var controller = document.createElement("section");
      controller.id = "pacificEducationMandatoryBoxSequence";
      controller.setAttribute("aria-label", "Mandatory registration sequence");
      controller.style.cssText = "margin:0 0 16px;padding:16px;border:3px solid #15803d;border-radius:12px;background:inherit;";
      controller.innerHTML = "<strong id=\"peBoxSequenceTitle\"></strong><p id=\"peBoxSequenceProgress\" role=\"status\" aria-live=\"polite\"></p>";
      registration.insertBefore(controller, registration.firstChild);
    }

    document.addEventListener("click", advance, true);
    document.addEventListener("change", function (event) {
      var target = event.target;
      if (target && ["pacificEducationCountrySelect", "pacificEducationLanguageSelect", "pilotRegistrationRole", "pilotRegistrationName"].indexOf(target.id) >= 0) update();
    }, true);
    document.addEventListener("input", function (event) {
      if (event.target && event.target.id === "pilotRegistrationName") update();
    }, true);

    var observer = new MutationObserver(function () {
      if (scheduled) return;
      scheduled = true;
      window.setTimeout(function () {
        scheduled = false;
        bindRoleCards();
        /* Refresh the button reference/eligibility after legacy repair scripts replace it. */
        update();
      }, 0);
    });
    observer.observe(registration, { childList: true, subtree: true });
    bindRoleCards();
    update();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", setup);
  else setup();
  window.setTimeout(setup, 500);
  window.setTimeout(setup, 1500);
  window.PacificEducationRegistrationFlowV2 = {
    version: "2.0.0",
    status: function () { return { version: "2.0.0", ready: ready, step: state + 1, label: BOXES[state] && BOXES[state].label }; },
    refresh: update
  };
})(window, document);
