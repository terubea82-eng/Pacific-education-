/* PacEdu Worldwide Jobs & Hiring — private, local document helper.
 * Prototype only: no live vacancy feed, employer verification, application submission,
 * cloud profile, recruitment agency, or payment integration is claimed.
 */
(function (window, document) {
  "use strict";
  var ROOT = "paceduWorldwideJobsWorkspace";
  var STYLE = "paceduWorldwideJobsStyles";
  var STORAGE = "pacedu.worldwideJobsDraft.v1";
  var EMPLOYER_TYPES = [
    "Government & public services",
    "State-owned enterprises & statutory bodies",
    "Private businesses & companies",
    "Education & research institutions",
    "NGOs, charities & community organisations",
    "International & regional organisations",
    "Licensed recruitment & staffing agencies",
    "Self-employed & household employers"
  ];

  function node(tag, text, className) {
    var n = document.createElement(tag);
    if (text != null) n.textContent = text;
    if (className) n.className = className;
    return n;
  }
  function readDraft() {
    try { return JSON.parse(window.localStorage.getItem(STORAGE) || "{}") || {}; }
    catch (e) { return {}; }
  }
  function writeDraft(data) {
    try { window.localStorage.setItem(STORAGE, JSON.stringify(data)); return true; }
    catch (e) { return false; }
  }
  function addStyles() {
    if (document.getElementById(STYLE)) return;
    var s = node("style");
    s.id = STYLE;
    s.textContent =
      "#" + ROOT + "{margin:14px 0;color:#193548;line-height:1.5}" +
      "#" + ROOT + " .pw-panel{display:none;border:1px solid #b7cbd6;border-radius:12px;padding:14px;background:#f8fbfd}" +
      "#" + ROOT + " .pw-panel[data-open=true]{display:block}" +
      "#" + ROOT + " .pw-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}" +
      "#" + ROOT + " .pw-card{border:1px solid #cbd8df;border-radius:10px;padding:12px;background:#fff;min-width:0}" +
      "#" + ROOT + " label{display:block;font-weight:700;margin:8px 0 4px}" +
      "#" + ROOT + " input,#" + ROOT + " textarea,#" + ROOT + " select{box-sizing:border-box;width:100%;max-width:100%;font:inherit;padding:10px;border:1px solid #7895a5;border-radius:8px;background:#fff}" +
      "#" + ROOT + " button{font:inherit;min-height:44px;padding:9px 12px;border:1px solid #56798b;border-radius:8px;background:#fff;font-weight:700;margin:5px 5px 5px 0}" +
      "#" + ROOT + " .pw-output{min-height:180px;white-space:pre-wrap}" +
      "#" + ROOT + " .pw-note{background:#eef5f8;border-left:4px solid #56798b;padding:10px}" +
      "@media(max-width:420px){#" + ROOT + " .pw-panel{padding:10px}}";
    document.head.appendChild(s);
  }
  function render() {
    var app = document.getElementById("app");
    if (!app || document.getElementById(ROOT)) return;
    addStyles();
    var root = node("section");
    root.id = ROOT;
    root.setAttribute("aria-label", "Worldwide jobs and hiring");
    var toggle = node("button", "Worldwide Jobs & Hiring");
    toggle.type = "button";
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-controls", ROOT + "Panel");
    var panel = node("div");
    panel.id = ROOT + "Panel";
    panel.className = "pw-panel";
    panel.setAttribute("data-open", "false");

    var sectorOptions = EMPLOYER_TYPES.map(function (v) {
      return '<option value="' + v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;") + '">' +
        v.replace(/&/g, "&amp;").replace(/</g, "&lt;") + "</option>";
    }).join("");
    panel.innerHTML =
      "<h2>Find work and prepare your application</h2>" +
      "<p>Prepare a CV and a letter for a specific job. Use truthful information and review every draft before sharing it.</p>" +
      '<p class="pw-note"><strong>Pilot status:</strong> CV and cover-letter drafting works on this device. Verified live vacancies, employer identity checks, account-based applications and employer posting are not connected yet. Do not pay anyone to unlock a job through this prototype.</p>' +
      '<div class="pw-grid">' +
      '<section class="pw-card"><h3>1. Your details</h3>' +
      '<label for="pwName">Name to show on your CV</label><input id="pwName" maxlength="100" autocomplete="name" placeholder="Your name">' +
      '<label for="pwCountry">Country where you want work</label><input id="pwCountry" maxlength="80" autocomplete="country-name" placeholder="e.g. Fiji">' +
      '<label for="pwJob">Job title</label><input id="pwJob" maxlength="140" placeholder="e.g. Office Assistant">' +
      '<label for="pwEmployer">Employer name (if known)</label><input id="pwEmployer" maxlength="160" placeholder="Employer shown in the advertisement">' +
      '<label for="pwSector">Employer type</label><select id="pwSector">' + sectorOptions + '</select>' +
      '<label for="pwContact">Contact details you choose to share</label><input id="pwContact" maxlength="180" placeholder="Email or phone (optional)">' +
      '</section>' +
      '<section class="pw-card"><h3>2. Your background</h3>' +
      '<label for="pwSummary">Skills and strengths</label><textarea id="pwSummary" rows="3" maxlength="1200" placeholder="Skills you can demonstrate"></textarea>' +
      '<label for="pwEducation">Education and training</label><textarea id="pwEducation" rows="3" maxlength="1000" placeholder="Real qualifications, courses or training"></textarea>' +
      '<label for="pwExperience">Work, volunteering or practical experience</label><textarea id="pwExperience" rows="4" maxlength="1800" placeholder="What you did, where and when; include unpaid experience if relevant"></textarea>' +
      '<label for="pwAchievements">Achievements or work examples</label><textarea id="pwAchievements" rows="3" maxlength="1000" placeholder="Examples you can explain or show"></textarea>' +
      '</section></div>' +
      '<section class="pw-card" style="margin-top:12px"><h3>3. Match a real vacancy</h3>' +
      '<label for="pwAdvertisement">Paste the job description or key requirements</label><textarea id="pwAdvertisement" rows="5" maxlength="5000" placeholder="Paste the vacancy text you have checked. Do not paste private IDs or passwords."></textarea>' +
      '<button type="button" id="pwGenerate">Prepare my CV and cover letter</button> <button type="button" id="pwSave">Save draft on this device</button> <button type="button" id="pwClear">Clear my draft</button>' +
      '<p id="pwStatus" role="status" aria-live="polite">Nothing has been submitted to an employer.</p></section>' +
      '<div class="pw-grid" style="margin-top:12px">' +
      '<section class="pw-card"><h3>Your CV</h3><textarea id="pwCv" class="pw-output" rows="14" aria-label="Generated CV" placeholder="Your CV draft will appear here."></textarea><button type="button" id="pwDownloadCv">Download CV (.txt)</button></section>' +
      '<section class="pw-card"><h3>Your cover letter</h3><textarea id="pwLetter" class="pw-output" rows="14" aria-label="Generated cover letter" placeholder="Your cover letter draft will appear here."></textarea><button type="button" id="pwDownloadLetter">Download cover letter (.txt)</button></section>' +
      '</div>' +
      '<section class="pw-card" style="margin-top:12px"><h3>Application advice</h3><h4>Vacancy match check</h4><p id="pwMatchAdvice" role="status" aria-live="polite">Generate your documents to see requirements to review. This is a simple keyword guide, not an eligibility decision.</p><ul>' +
      '<li>Match your examples to the vacancy requirements.</li><li>Never claim a qualification or experience you do not have.</li>' +
      '<li>Check the employer using an official registry or official website where available.</li><li>Confirm pay, duties, location, contract and any work-permit requirements.</li>' +
      '<li>Do not pay recruitment fees or share banking passwords, one-time codes or identity documents with an unverified contact.</li>' +
      '<li>Read and approve both documents before you send them yourself.</li></ul>' +
      '<p><strong>Employer categories planned for verification:</strong> Government/public service; state-owned enterprises; private businesses; education/research; NGOs/charities; international/regional organisations; licensed recruitment agencies; self-employed/household employers. Categories do not mean an employer has been verified.</p></section>';
    root.appendChild(toggle);
    root.appendChild(panel);
    var nav = document.getElementById("userFirstNavigation");
    if (nav && nav.parentNode) nav.parentNode.insertBefore(root, nav.nextSibling);
    else app.insertBefore(root, app.firstChild);
    toggle.addEventListener("click", function () {
      var open = panel.getAttribute("data-open") !== "true";
      panel.setAttribute("data-open", open ? "true" : "false");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) panel.scrollIntoView({ behavior: "auto", block: "start" });
    });

    var fields = ["pwName","pwCountry","pwJob","pwEmployer","pwSector","pwContact","pwSummary","pwEducation","pwExperience","pwAchievements","pwAdvertisement"];
    var data = readDraft();
    fields.forEach(function (id) {
      var field = document.getElementById(id);
      if (field && data[id] != null) field.value = data[id];
    });
    if (data.pwCv) document.getElementById("pwCv").value = data.pwCv;
    if (data.pwLetter) document.getElementById("pwLetter").value = data.pwLetter;
    function collect() {
      var d = {};
      fields.forEach(function (id) { var f = document.getElementById(id); d[id] = f ? f.value.trim() : ""; });
      d.pwCv = document.getElementById("pwCv").value;
      d.pwLetter = document.getElementById("pwLetter").value;
      return d;
    }
    function status(message) { document.getElementById("pwStatus").textContent = message; }
    function buildDocuments() {
      var d = collect();
      if (!d.pwName || !d.pwJob || (!d.pwSummary && !d.pwEducation && !d.pwExperience)) {
        status("Enter your name, job title and at least one real skill, qualification or experience before generating documents.");
        return;
      }
      var cvLines = [d.pwName];
      if (d.pwContact) cvLines.push(d.pwContact);
      if (d.pwCountry) cvLines.push("Target country: " + d.pwCountry);
      cvLines.push("", "TARGET ROLE", d.pwJob + (d.pwEmployer ? " — " + d.pwEmployer : ""));
      if (d.pwSummary) cvLines.push("", "PROFILE AND SKILLS", d.pwSummary);
      if (d.pwEducation) cvLines.push("", "EDUCATION AND TRAINING", d.pwEducation);
      if (d.pwExperience) cvLines.push("", "WORK AND PRACTICAL EXPERIENCE", d.pwExperience);
      if (d.pwAchievements) cvLines.push("", "ACHIEVEMENTS AND WORK EXAMPLES", d.pwAchievements);
      var cv = cvLines.join("\n");

      var evidence = (d.pwSummary + " " + d.pwEducation + " " + d.pwExperience + " " + d.pwAchievements).toLowerCase();
      var requirements = d.pwAdvertisement.split(/[\n•;]+/).map(function (x) { return x.trim(); }).filter(Boolean).slice(0, 8);
      var matching = requirements.length ? requirements.map(function (req) {
        var words = req.toLowerCase().split(/[^a-z0-9]+/).filter(function (w) { return w.length > 4; });
        var found = words.some(function (word) { return evidence.indexOf(word) !== -1; });
        return (found ? "Possible keyword match — verify with your own example: " : "Review this requirement and add honest evidence if you have it: ") + req;
      }) : ["Paste the key requirements from the vacancy to review how your real skills and experience relate to the job."];
      var advice = document.getElementById("pwMatchAdvice");
      if (advice) advice.textContent = matching.join("\n");

      var background = [];
      if (d.pwSummary) background.push("My relevant skills and strengths include " + d.pwSummary + ".");
      if (d.pwEducation) background.push("My education and training includes " + d.pwEducation + ".");
      if (d.pwExperience) background.push("My practical experience includes " + d.pwExperience + ".");
      if (d.pwAchievements) background.push("An example of my work or achievement is " + d.pwAchievements + ".");
      var letterLines = [
        d.pwName,
        d.pwContact,
        d.pwCountry,
        "",
        new Date().toLocaleDateString(),
        "",
        d.pwEmployer || "Hiring Manager",
        "",
        "Subject: Application for " + d.pwJob,
        "",
        "Dear Hiring Manager,",
        "",
        "I am applying for the " + d.pwJob + (d.pwEmployer ? " position at " + d.pwEmployer : " position") + ".",
        "",
        background.join(" "),
        "",
        "Thank you for considering my application. I would welcome the opportunity to discuss my suitability for the role.",
        "",
        "Yours sincerely,",
        d.pwName
      ];
      var letter = letterLines.filter(function (line, index) {
        return line !== null && line !== undefined && !(line === "" && letterLines[index - 1] === "");
      }).join("\n");
      document.getElementById("pwCv").value = cv;
      document.getElementById("pwLetter").value = letter;
      status("Drafts prepared on this device only. Review and correct them; PacEdu has not sent an application.");
    }
    function download(id, filename) {
      var text = document.getElementById(id).value;
      if (!text.trim()) { status("Prepare the document first."); return; }
      try {
        var blob = new Blob([text], { type: "text/plain;charset=utf-8" });
        var url = window.URL.createObjectURL(blob);
        var a = node("a", "Download");
        a.href = url;
        a.download = filename;
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        status("Document download requested. Check the downloaded file before sharing it.");
      } catch (e) { status("Download is unavailable in this browser. You can select and copy the document text."); }
    }
    document.getElementById("pwGenerate").addEventListener("click", buildDocuments);
    document.getElementById("pwSave").addEventListener("click", function () {
      if (writeDraft(collect())) status("Draft saved only in this browser/device. It is not uploaded or backed up.");
      else status("This browser could not save the draft. Copy or download your documents to keep them.");
    });
    document.getElementById("pwClear").addEventListener("click", function () {
      fields.forEach(function (id) { var f = document.getElementById(id); if (f) f.value = ""; });
      document.getElementById("pwCv").value = "";
      document.getElementById("pwLetter").value = "";
      try { window.localStorage.removeItem(STORAGE); } catch (e) {}
      status("This device's saved draft was cleared. Previously downloaded copies are not affected.");
    });
    document.getElementById("pwDownloadCv").addEventListener("click", function () { download("pwCv", "pacedu-cv-draft.txt"); });
    document.getElementById("pwDownloadLetter").addEventListener("click", function () { download("pwLetter", "pacedu-cover-letter-draft.txt"); });
  }
  function init() { render(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})(window, document);
