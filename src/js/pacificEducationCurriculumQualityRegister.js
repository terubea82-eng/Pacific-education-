/* PacEdu — Curriculum Quality, Gaps and Improvement Register.
 * Pilot-only, same-device record store. No Ministry submission is transmitted.
 * Preserves exact source wording; suggested gaps are not official indicators.
 */
(function (window, document) {
  "use strict";
  var PANEL_PREFIX = "paceduCurriculumQualityRegister";
  var STORE_KEY = "paceduCurriculumQualityRegisterV1";
  var ROLE_HOSTS = {
    teacher: "teacherDashboard",
    "head-of-school": "pacificEducationCoverageDashboard",
    education: "pacificEducationCurriculumMasterControlStatus"
  };
  var ROLE_TITLES = {
    teacher: "Repeated Achievement Indicators — Teacher Review",
    "head-of-school": "School Curriculum Repetition and Coverage Review",
    education: "National Curriculum Repetition and Review Register"
  };

  function t(v) { return String(v == null ? "" : v).trim(); }
  function el(tag, value) {
    var n = document.createElement(tag);
    if (value != null) n.textContent = value;
    return n;
  }
  function getRole() {
    var shell = document.getElementById("pacificEducationSequentialRoleWorkspace");
    var role = shell && t(shell.getAttribute("data-pe-role"));
    if (role) return role;
    try {
      return t(localStorage.getItem("pacificEducationActiveRole") ||
        localStorage.getItem("pacificEducationPilotRole") ||
        localStorage.getItem("pilotRegistrationRole")).toLowerCase();
    } catch (_) { return ""; }
  }
  function readRecords() {
    try {
      var data = JSON.parse(localStorage.getItem(STORE_KEY) || '{"version":1,"records":[]}');
      return data && Array.isArray(data.records) ? data.records : [];
    } catch (_) { return []; }
  }
  function saveRecords(records) {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({version:1, records:records}));
      return true;
    } catch (_) { return false; }
  }
  function safeText(value) { return t(value).slice(0, 4000); }
  function currentCountry() {
    try {
      var code = t(localStorage.getItem("pacificEducationCurriculumCountryCode") ||
        localStorage.getItem("pacificEducationRegistrationCountryCode")).toUpperCase();
      var name = t(localStorage.getItem("pacificEducationLinkedCurriculumCountry") ||
        localStorage.getItem("pacificEducationPilotCountryName") ||
        localStorage.getItem("pacificEducationCurriculumCountry") ||
        localStorage.getItem("pacificEducationRegistrationCountry"));
      return {code:code, name:name || code || "Not recorded"};
    } catch (_) { return {code:"", name:"Not recorded"}; }
  }
  function makeField(parent, labelText, type, name, options) {
    var label = el("label", labelText);
    label.style.cssText = "display:block;margin:8px 0;font-weight:600;";
    var input;
    if (type === "select") {
      input = el("select");
      (options || []).forEach(function (option) {
        var o = el("option", option[1]); o.value = option[0]; input.appendChild(o);
      });
    } else if (type === "textarea") {
      input = el("textarea"); input.rows = 2;
    } else {
      input = el("input"); input.type = type || "text";
    }
    input.name = name;
    input.style.cssText = "display:block;width:100%;max-width:100%;box-sizing:border-box;min-height:42px;padding:9px;border:1px solid #8aa5b8;border-radius:6px;font:inherit;";
    label.appendChild(input); parent.appendChild(label);
    return input;
  }
  function button(parent, label, action) {
    var b = el("button", label); b.type = "button";
    b.style.cssText = "min-height:42px;padding:9px 12px;margin:4px 6px 4px 0;font:inherit;font-weight:600;white-space:normal;";
    b.addEventListener("click", action); parent.appendChild(b); return b;
  }
  function cell(row, value, heading) {
    var c = el(heading ? "th" : "td", value);
    c.style.cssText = "border:1px solid #c8d2dc;padding:7px;text-align:left;vertical-align:top;overflow-wrap:anywhere;";
    row.appendChild(c); return c;
  }
  function roleHost(role) {
    var id = ROLE_HOSTS[role];
    if (!id) return null;
    var shell = document.getElementById("pacificEducationSequentialRoleWorkspace");
    if (shell && shell.getAttribute("data-pe-role") === role) {
      var active = shell.querySelector("#peSequentialPage #" + id);
      if (active) return active;
    }
    return document.getElementById(id);
  }
  function makeRecord(data) {
    var country = currentCountry();
    return {
      id: "CQR-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2,7),
      createdAt: new Date().toISOString(),
      countryCode: country.code,
      countryName: country.name,
      level: data.level,
      subject: data.subject,
      term: data.term,
      week: data.week,
      recordType: data.recordType,
      indicatorText: data.indicatorText,
      sourceTitle: data.sourceTitle,
      sourceYear: data.sourceYear,
      sourcePage: data.sourcePage,
      sourceUrl: data.sourceUrl,
      evidence: data.evidence,
      occurrences: data.occurrences,
      category: data.category,
      suggestion: data.suggestion,
      status: "TEACHER_REVIEW",
      mastery: "NOT_CHECKED",
      teacherName: data.teacherName,
      schoolName: data.schoolName,
      schoolReview: "",
      ministryDecision: "",
      audit: [{status:"TEACHER_REVIEW", at:new Date().toISOString(), note:"Created in local PacEdu pilot register."}]
    };
  }
  function statusLabel(status) {
    return ({
      TEACHER_REVIEW:"Teacher review",
      NEEDS_REINFORCEMENT:"Needs reinforcement",
      MASTERED:"Mastered — avoid redundant reteaching/testing",
      SCHOOL_REVIEW:"Submitted to Head of School",
      SCHOOL_VERIFIED:"Head of School verified",
      MINISTRY_REVIEW:"Forwarded for authority review (local record only)",
      AUTHORITY_DECISION:"Authority decision recorded"
    })[status] || status || "Unclassified";
  }
  function exportText(records, role) {
    var out = [
      "PACEDU — CURRICULUM QUALITY, GAPS AND IMPROVEMENT REGISTER",
      "Dashboard role: " + role,
      "Exported: " + new Date().toISOString(),
      "Important: local pilot export only; this action does not transmit data to a school or Ministry.",
      "Possible gaps are proposals for review, not official curriculum indicators.",
      "Repeated wording is not automatically a curriculum error; check reinforcement and progression.",
      ""
    ];
    records.forEach(function (r) {
      out.push("Record: " + r.id, "Country: " + (r.countryName || r.countryCode || "Not recorded"),
        "Class/level: " + (r.level || "Not recorded"), "Subject: " + (r.subject || "Not recorded"),
        "Term/week: " + (r.term || "Not recorded") + " / " + (r.week || "Not recorded"),
        "Type: " + r.recordType, "Original indicator wording / need: " + r.indicatorText,
        "Source: " + [r.sourceTitle, r.sourceYear, r.sourcePage, r.sourceUrl].filter(Boolean).join(" | "),
        "Occurrences: " + (r.occurrences || "Not recorded"), "Evidence: " + (r.evidence || "Not recorded"),
        "Classification: " + (r.category || "Not classified"), "Suggested action: " + (r.suggestion || "Not recorded"),
        "Mastery: " + r.mastery, "Status: " + statusLabel(r.status),
        "School review: " + (r.schoolReview || "Not recorded"), "Authority decision: " + (r.ministryDecision || "Not recorded"), "");
    });
    return out.join("\n");
  }
  function downloadReport(records, role) {
    try {
      var blob = new Blob([exportText(records, role)], {type:"text/plain;charset=utf-8"});
      var url = URL.createObjectURL(blob), a = el("a");
      a.href = url; a.download = "PacEdu-Curriculum-Quality-Register-" + role + ".txt";
      a.style.display = "none"; document.body.appendChild(a); a.click(); a.remove();
      window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    } catch (_) {}
  }
  function renderPanel(host, role) {
    if (!host || host.querySelector("#" + PANEL_PREFIX + "-" + role)) return;
    var panel = el("section");
    panel.id = PANEL_PREFIX + "-" + role;
    panel.setAttribute("aria-label", ROLE_TITLES[role]);
    panel.style.cssText = "margin:16px 0;padding:14px;border:2px solid #176b48;border-radius:10px;box-sizing:border-box;max-width:100%;";
    panel.appendChild(el("h3", ROLE_TITLES[role]));
    panel.appendChild(el("p",
      "One shared pilot register tracks repeated achievement indicators and possible curriculum gaps. Exact Ministry wording and source details must be preserved. This register is stored on this browser/device only; it does not send a report to the Ministry."));
    var notice = el("p",
      "Mandatory rule: when an indicator appears again, compare source wording and learner evidence. If mastery is evidenced, avoid redundant teaching/testing while retaining the official indicator in the record. If mastery is not evidenced, plan targeted reinforcement. Never delete or silently rewrite an official indicator.");
    notice.style.cssText = "padding:10px;border-left:4px solid #b7791f;background:#fff8e8;";
    panel.appendChild(notice);

    var form = el("div");
    form.style.cssText = "display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr));gap:4px 12px;";
    var recordType = makeField(form, "Record type", "select", "recordType", [
      ["REPEATED_INDICATOR","Repeated achievement indicator"],
      ["POSSIBLE_MISSING_INDICATOR","Possible missing achievement indicator"],
      ["EMERGING_COUNTRY_NEED","Emerging country / community learning need"]
    ]);
    var level = makeField(form, "Class / level", "select", "level",
      [["ECE","ECE"]].concat(Array.from({length:13},function(_,i){return ["Class "+(i+1),"Class "+(i+1)];})));
    var subject = makeField(form, "Subject", "text", "subject"); subject.value = "English";
    var term = makeField(form, "Term", "select", "term", [["Term 1","Term 1"],["Term 2","Term 2"],["Term 3","Term 3"],["Intervention","Intervention"]]);
    var week = makeField(form, "Teaching / review week", "text", "week"); week.placeholder = "e.g. Week 3";
    var indicator = makeField(form, "Exact indicator wording or learning need", "textarea", "indicatorText");
    indicator.placeholder = "Paste the exact official wording when reviewing an indicator; label a new need as a proposal.";
    var source = makeField(form, "Curriculum source / document title", "text", "sourceTitle");
    var sourceYear = makeField(form, "Source year / version", "text", "sourceYear");
    var sourcePage = makeField(form, "Page / section", "text", "sourcePage");
    var sourceUrl = makeField(form, "Source URL (optional)", "url", "sourceUrl");
    var occurrences = makeField(form, "Other term/week occurrences", "textarea", "occurrences");
    occurrences.placeholder = "List each term/week and exact match or related wording.";
    var evidence = makeField(form, "Evidence and coverage check", "textarea", "evidence");
    evidence.placeholder = "Learner assessment, daily activity mapping, source comparison, teacher observations.";
    var category = makeField(form, "Review classification", "select", "category", [
      ["EXACT_DUPLICATE","Exact duplicate wording — verify"],
      ["INTENTIONAL_REINFORCEMENT","Likely intentional reinforcement"],
      ["PROGRESSION_OVERLAP","Possible progression / increased demand"],
      ["POSSIBLE_COVERAGE_GAP","Possible coverage gap — source check needed"],
      ["EMERGING_NEED","Emerging local / national need"],
      ["UNCLASSIFIED","Not yet classified"]
    ]);
    var suggestion = makeField(form, "Suggested action for review", "textarea", "suggestion");
    suggestion.placeholder = "Proposed daily activity or curriculum review question; not an official indicator.";
    var teacher = makeField(form, "Teacher / reporter (optional)", "text", "teacherName");
    var school = makeField(form, "School / institution (optional)", "text", "schoolName");
    panel.appendChild(form);
    var status = el("p", "Ready. Save a record only with enough source or evidence detail to support review.");
    status.setAttribute("role","status"); status.setAttribute("aria-live","polite"); panel.appendChild(status);
    var actions = el("div"); actions.style.cssText = "display:flex;flex-wrap:wrap;gap:6px;margin:8px 0;";
    button(actions, "Save Register Record", function () {
      if (!safeText(indicator.value)) { status.textContent = "Enter the exact indicator wording or describe the proposed learning need first."; indicator.focus(); return; }
      var sourceLink = safeText(sourceUrl.value);
      if (sourceLink && !/^https?:\/\//i.test(sourceLink)) { status.textContent = "Source URL must begin with http:// or https://."; sourceUrl.focus(); return; }
      var data = {};
      [recordType,level,subject,term,week,indicator,source,sourceYear,sourcePage,sourceUrl,occurrences,evidence,category,suggestion,teacher,school].forEach(function (f) { data[f.name] = safeText(f.value); });
      var records = readRecords(); records.push(makeRecord(data));
      if (!saveRecords(records)) { status.textContent = "Could not save in this browser storage. Export/copy the evidence and retry later."; return; }
      [indicator,source,sourceYear,sourcePage,sourceUrl,occurrences,evidence,suggestion,teacher,school,week].forEach(function (f) { f.value = ""; });
      status.textContent = "Saved locally. Current status: Teacher review. This has not been sent to the Head of School or Ministry.";
      renderRecords();
    });
    button(actions, "Download Register (.txt)", function () { downloadReport(readRecords(), role); });
    panel.appendChild(actions);

    var calendar = el("div");
    calendar.style.cssText = "margin:12px 0;padding:10px;border:1px solid #c8d2dc;border-radius:8px;";
    calendar.appendChild(el("h4","Fiji teaching and assessment planning guide"));
    calendar.appendChild(el("p","Term 1: 10 core teaching weeks + 2 revision weeks + 2 examination weeks (14 weeks total)."));
    calendar.appendChild(el("p","Term 2: 10 core teaching weeks + 2 revision weeks + 2 examination weeks (14 weeks total). Use the same framework but progress learning; do not copy Term 1 activities unchanged."));
    calendar.appendChild(el("p","Term 3: 5 core teaching weeks. The 13-week term still needs its remaining weeks allocated to revision, examinations, intervention/catch-up and reporting according to the school and class timetable. Do not assume every class has the same external examination schedule."));
    calendar.appendChild(el("p","Intervention plan: 5 targeted weeks — identify gaps, reteach, guided practice, independent application/feedback, reassess and plan next steps. The intervention block is a separate planning sequence and may need to be scheduled across available school weeks."));
    panel.appendChild(calendar);

    var list = el("div"); list.id = PANEL_PREFIX + "-records-" + role; panel.appendChild(list);
    function renderRecords() {
      list.textContent = "";
      var records = readRecords();
      var heading = el("h4","Saved records (" + records.length + ")");
      list.appendChild(heading);
      if (!records.length) { list.appendChild(el("p","No curriculum repetition or gap records have been saved on this browser yet.")); return; }
      var tableWrap = el("div"); tableWrap.style.cssText = "overflow-x:auto;max-width:100%;";
      var table = el("table"); table.style.cssText = "width:100%;border-collapse:collapse;font-size:.92rem;";
      var head = el("tr");
      ["Record / type","Class • subject • term","Indicator / need","Status / evidence action"].forEach(function (v) { cell(head,v,true); });
      table.appendChild(head);
      records.slice().reverse().forEach(function (r) {
        var row = el("tr");
        cell(row, r.id + "\n" + r.recordType + "\n" + (r.countryName || r.countryCode || "Country not recorded"));
        cell(row, (r.level || "—") + " • " + (r.subject || "—") + "\n" + (r.term || "—") + " / " + (r.week || "—"));
        cell(row, r.indicatorText + "\nSource: " + [r.sourceTitle,r.sourceYear,r.sourcePage].filter(Boolean).join(", ") + "\nClassification: " + (r.category || "—"));
        var actionCell = cell(row, "");
        actionCell.appendChild(el("strong",statusLabel(r.status)));
        actionCell.appendChild(el("p","Mastery: " + (r.mastery || "NOT_CHECKED")));
        if (role === "teacher" && r.status === "TEACHER_REVIEW") {
          button(actionCell,"Mark mastered",function(){ update(r.id,"MASTERED","MASTERED","Teacher recorded evidence of mastery."); });
          button(actionCell,"Needs reinforcement",function(){ update(r.id,"NEEDS_REINFORCEMENT","NEEDS_REINFORCEMENT","Targeted reinforcement required."); });
          button(actionCell,"Submit to Head of School",function(){ update(r.id,"SCHOOL_REVIEW",r.mastery,"Teacher submitted record for school review."); });
        }
        if (role === "head-of-school" && r.status === "SCHOOL_REVIEW") {
          button(actionCell,"Verify & forward",function(){ update(r.id,"MINISTRY_REVIEW",r.mastery,"Head of School verified the record and marked it for authority review. Local status only; no transmission occurred."); });
          button(actionCell,"Return for evidence",function(){ update(r.id,"TEACHER_REVIEW",r.mastery,"Returned for further source/evidence checks."); });
        }
        if (role === "education" && (r.status === "MINISTRY_REVIEW" || r.status === "SCHOOL_VERIFIED")) {
          var decision = document.createElement("textarea"); decision.rows = 2; decision.placeholder = "Record an authorised decision / reference"; decision.style.cssText = "display:block;width:100%;box-sizing:border-box;margin:6px 0;";
          actionCell.appendChild(decision);
          button(actionCell,"Record authority decision",function(){
            if (!safeText(decision.value)) { decision.focus(); return; }
            update(r.id,"AUTHORITY_DECISION",r.mastery,safeText(decision.value),safeText(decision.value));
          });
        }
        table.appendChild(row);
      });
      tableWrap.appendChild(table); list.appendChild(tableWrap);
      list.appendChild(el("p","Role labels control the visible workflow only in this pilot; they are not production access control. Keep personal learner details out of this register."));
    }
    function update(id, nextStatus, mastery, note, decision) {
      var records = readRecords();
      var target = records.find(function (r) { return r.id === id; });
      if (!target) return;
      target.status = nextStatus;
      target.mastery = mastery || target.mastery;
      if (role === "head-of-school") target.schoolReview = note;
      if (role === "education" && decision) target.ministryDecision = decision;
      target.audit = Array.isArray(target.audit) ? target.audit : [];
      target.audit.push({status:nextStatus,at:new Date().toISOString(),role:role,note:note});
      if (!saveRecords(records)) { status.textContent = "Unable to save review status in this browser."; return; }
      status.textContent = "Updated locally: " + statusLabel(nextStatus) + ". No external submission was sent.";
      renderRecords();
    }
    renderRecords();
    host.insertBefore(panel, host.firstChild);
  }
  function ensurePanel() {
    var role = getRole();
    if (!ROLE_HOSTS[role]) return;
    var host = roleHost(role);
    if (host) renderPanel(host, role);
  }
  function init() {
    ensurePanel();
    var shell = document.getElementById("pacificEducationSequentialRoleWorkspace");
    if (shell && window.MutationObserver && !shell.getAttribute("data-pacedu-cqr-observer")) {
      shell.setAttribute("data-pacedu-cqr-observer","true");
      var observer = new MutationObserver(function () { ensurePanel(); });
      observer.observe(shell,{childList:true,subtree:true,attributes:true,attributeFilter:["data-pe-role"]});
    }
  }
  window.PacificEducationCurriculumQualityRegister = {
    version:"1.0.0-pilot-local-register",
    getRecords:readRecords,
    exportText:exportText,
    render:init
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded",init);
  else init();
  window.addEventListener("load",init);
  document.addEventListener("pacificEducationSelectionChanged",init);
})(window,document);
