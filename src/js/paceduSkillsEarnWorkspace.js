/* PacEdu Skills & Earn — separate from formal school activities.
 * Local prototype only: no live marketplace, buyer messaging, payment or payout.
 */
(function (window, document) {
  "use strict";
  var ID = "paceduSkillsEarnWorkspace";
  var STYLE = "paceduSkillsEarnStyles";
  var STORAGE = "pacedu.skillsEarn.draft.v1";
  var learnerRoles = ["student", "blind-learner", "deaf-learner"];
  function el(tag, text, cls) {
    var n = document.createElement(tag);
    if (text != null) n.textContent = text;
    if (cls) n.className = cls;
    return n;
  }
  function role() {
    var s = document.getElementById("pilotRoleSelector");
    if (s && s.value) return String(s.value).toLowerCase();
    try { return String(localStorage.getItem("pacificEducationRole") || localStorage.getItem("pilotRole") || "").toLowerCase(); }
    catch (e) { return ""; }
  }
  function addStyles() {
    if (document.getElementById(STYLE)) return;
    var s = el("style");
    s.id = STYLE;
    s.textContent =
      "#" + ID + "{margin:14px 0;color:#18364b;line-height:1.5}" +
      "#" + ID + " .pe-skills-panel{display:none;border:2px solid #b6d9c5;border-radius:14px;padding:16px;background:#f5fbf7}" +
      "#" + ID + " .pe-skills-panel[data-open=true]{display:block}" +
      "#" + ID + " .pe-skills-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px}" +
      "#" + ID + " label{display:block;font-weight:700;margin:8px 0 4px}" +
      "#" + ID + " input,#" + ID + " textarea,#" + ID + " select{box-sizing:border-box;width:100%;max-width:100%;padding:10px;border:1px solid #789f8a;border-radius:8px;font:inherit;background:#fff}" +
      "#" + ID + " button{min-height:44px;padding:9px 13px;border:1px solid #668c78;border-radius:8px;font:inherit;font-weight:700;cursor:pointer;margin:4px 4px 4px 0}" +
      "#" + ID + " .pe-skills-card{border:1px solid #c3d8ca;background:#fff;border-radius:10px;padding:12px}" +
      "#" + ID + " .pe-skills-status{padding:10px;border-left:4px solid #397b55;background:#fff}" +
      "@media(max-width:420px){#" + ID + " .pe-skills-panel{padding:11px}}";
    document.head.appendChild(s);
  }
  function loadDraft() {
    try { return JSON.parse(localStorage.getItem(STORAGE) || "{}") || {}; } catch (e) { return {}; }
  }
  function saveDraft(data) {
    try { localStorage.setItem(STORAGE, JSON.stringify(data)); return true; } catch (e) { return false; }
  }
  function render() {
    var app = document.getElementById("app");
    if (!app || document.getElementById(ID)) return;
    addStyles();
    var root = el("section");
    root.id = ID;
    root.setAttribute("aria-label", "Skills development and earning workspace");
    var toggle = el("button", "My Skills & Earn Workspace");
    toggle.type = "button";
    toggle.setAttribute("aria-controls", ID + "Panel");
    toggle.setAttribute("aria-expanded", "false");
    var panel = el("div");
    panel.id = ID + "Panel";
    panel.className = "pe-skills-panel";
    panel.setAttribute("data-open", "false");
    panel.innerHTML =
      '<h2>My Skills & Earn</h2>' +
      '<p>Build a skill beyond schoolwork, practise it, create examples of your work, and prepare a product or service idea.</p>' +
      '<div class="pe-skills-grid">' +
      '<article class="pe-skills-card"><h3>1. Choose a skill</h3><label for="paceduSkillCategory">What would you like to develop?</label><select id="paceduSkillCategory"><option value="crafts">Arts, crafts and sewing</option><option value="food">Cooking and food skills</option><option value="digital">Digital skills and design</option><option value="writing">Writing, translation and tutoring</option><option value="gardening">Gardening and agriculture</option><option value="repair">Repair and practical trades</option><option value="business">Business and customer service</option><option value="other">Other skill</option></select><label for="paceduSkillGoal">My goal</label><input id="paceduSkillGoal" maxlength="180" placeholder="e.g. learn to make woven baskets"><label for="paceduSkillPractice">My next practice step</label><textarea id="paceduSkillPractice" maxlength="500" rows="3" placeholder="What will I practise this week?"></textarea><button type="button" id="paceduSkillSave">Save my skill plan</button></article>' +
      '<article class="pe-skills-card"><h3>2. Build a portfolio</h3><p>Keep examples of your work, what you learned and what you want to improve. Do not include private details, passwords, school records or another person’s image without permission.</p><label for="paceduSkillPortfolio">My work example or progress note</label><textarea id="paceduSkillPortfolio" maxlength="1000" rows="4" placeholder="Describe your work or a sample you have made"></textarea><button type="button" id="paceduSkillPortfolioSave">Save progress note</button></article>' +
      '</div><section class="pe-skills-card" style="margin-top:10px"><h3>3. Prepare to sell (adult-managed pilot feature)</h3>' +
      '<p>Adults can prepare a draft listing for a product or service. A draft is private to this device and is not published to buyers. Real selling requires secure accounts, moderation, buyer protection, refunds, tax/legal checks and an approved payment provider.</p>' +
      '<div id="paceduSkillsAdultListing"><p>Choose an adult role in the pilot role selector to prepare a draft listing. Learner accounts can build skills and portfolios but cannot publish sales listings or receive payments through this prototype.</p></div>' +
      '<p class="pe-skills-status" id="paceduSkillsStatus" role="status" aria-live="polite">Your plan and notes are stored only in this browser/device when local storage is available. They are not backed up or visible to a teacher, buyer or other device.</p></section>';
    root.appendChild(toggle);
    root.appendChild(panel);
    var nav = document.getElementById("userFirstNavigation") || document.getElementById("learningPlatform") || document.getElementById("dailyLesson");
    if (nav && nav.parentNode) nav.parentNode.insertBefore(root, nav.nextSibling);
    else app.appendChild(root);
    toggle.addEventListener("click", function () {
      var open = panel.getAttribute("data-open") !== "true";
      panel.setAttribute("data-open", open ? "true" : "false");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) panel.scrollIntoView({behavior:"smooth", block:"start"});
    });
    var data = loadDraft();
    document.getElementById("paceduSkillCategory").value = data.category || "crafts";
    document.getElementById("paceduSkillGoal").value = data.goal || "";
    document.getElementById("paceduSkillPractice").value = data.practice || "";
    document.getElementById("paceduSkillPortfolio").value = data.portfolio || "";
    function status(msg) { document.getElementById("paceduSkillsStatus").textContent = msg; }
    document.getElementById("paceduSkillSave").addEventListener("click", function () {
      data.category = document.getElementById("paceduSkillCategory").value;
      data.goal = document.getElementById("paceduSkillGoal").value.trim();
      data.practice = document.getElementById("paceduSkillPractice").value.trim();
      status(saveDraft(data) ? "Skill plan saved on this device only. It is not synced to another device." : "Could not save on this device. Copy your plan somewhere safe before leaving.");
    });
    document.getElementById("paceduSkillPortfolioSave").addEventListener("click", function () {
      data.portfolio = document.getElementById("paceduSkillPortfolio").value.trim();
      status(saveDraft(data) ? "Progress note saved on this device only. Do not use this as a public portfolio yet." : "Could not save on this device. Copy your note somewhere safe before leaving.");
    });
    var adultHost = document.getElementById("paceduSkillsAdultListing");
    var currentRole = role();
    if (currentRole && learnerRoles.indexOf(currentRole) === -1) {
      adultHost.replaceChildren();
      var form = el("form");
      form.id = "paceduSkillsListingForm";
      form.innerHTML =
        '<div class="pe-skills-grid"><div><label for="paceduListingTitle">Product or service name</label><input id="paceduListingTitle" maxlength="120" required placeholder="What are you offering?"></div>' +
        '<div><label for="paceduListingType">Listing type</label><select id="paceduListingType"><option value="product">Physical product</option><option value="service">Service or skill</option><option value="digital">Digital item</option></select></div>' +
        '<div><label for="paceduListingPrice">Proposed price (FJD)</label><input id="paceduListingPrice" type="number" min="0" max="100000" step="0.01" inputmode="decimal" placeholder="Optional planning estimate"></div>' +
        '<div><label for="paceduListingDescription">Description</label><textarea id="paceduListingDescription" rows="3" maxlength="700" required placeholder="Describe quality, size, delivery or what the service includes"></textarea></div></div>' +
        '<button type="submit">Save private listing draft</button>';
      adultHost.appendChild(form);
      var draft = data.listing || {};
      document.getElementById("paceduListingTitle").value = draft.title || "";
      document.getElementById("paceduListingType").value = draft.type || "product";
      document.getElementById("paceduListingPrice").value = draft.price || "";
      document.getElementById("paceduListingDescription").value = draft.description || "";
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var price = document.getElementById("paceduListingPrice").value;
        data.listing = {
          title: document.getElementById("paceduListingTitle").value.trim(),
          type: document.getElementById("paceduListingType").value,
          price: price === "" ? "" : String(Number(price)),
          description: document.getElementById("paceduListingDescription").value.trim(),
          state: "private-draft"
        };
        status(saveDraft(data) ? "Private listing draft saved on this device only. It has not been published and no order, payment or payout can happen in PacEdu yet." : "Could not save listing draft. Copy the details before leaving.");
      });
    }
  }
  function init() { render(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
  window.addEventListener("load", init);
  window.setTimeout(init, 700);
})(window, document);
