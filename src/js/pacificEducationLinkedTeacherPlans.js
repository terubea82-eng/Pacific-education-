/* PacEdu — linked daily activity, teacher workplan, lesson plan and review evidence.
 * Reuses the existing learner activity generator. Current affairs are optional enrichment
 * and are included only when explicitly approved; pending news never becomes lesson content.
 * Controlled pilot: generated plans require teacher review and are not Ministry-approved.
 */
(function (window, document) {
  "use strict";

  var PANEL_ID = "pacificEducationLinkedTeacherPlans";
  var STYLE_ID = "pacificEducationLinkedTeacherPlansPrintStyle";
  var SUBJECTS = ["English", "Mathematics", "Phonics", "Science", "Social Science", "Health", "Agriculture", "Arts", "Technology"];

  function text(value) { return String(value == null ? "" : value).trim(); }
  function node(tag, value) {
    var el = document.createElement(tag);
    if (value != null) el.textContent = value;
    return el;
  }
  function addLine(parent, label, value) {
    if (!text(value)) return;
    var p = node("p");
    var strong = node("strong", label + ": ");
    p.appendChild(strong);
    p.appendChild(document.createTextNode(text(value)));
    parent.appendChild(p);
  }
  function readContext(dayOverride, levelOverride, subjectOverride) {
    var ctx = {
      countryCode: text(localStorage.getItem("pacificEducationCurriculumCountryCode") || localStorage.getItem("pacificEducationPilotCountry")).toUpperCase(),
      country: text(localStorage.getItem("pacificEducationLinkedCurriculumCountry") || localStorage.getItem("pacificEducationPilotCountryName")),
      level: text(levelOverride || localStorage.getItem("pacificEducationLevel") || localStorage.getItem("pacificEducationClassLevel")),
      subject: text(subjectOverride || localStorage.getItem("pacificEducationSubject") || "English"),
      term: text(localStorage.getItem("pacificEducationTerm") || "Term 1"),
      classReference: text(localStorage.getItem("pacificEducationClassReference") || localStorage.getItem("pacificEducationClassId")),
      day: Math.max(1, Math.min(365, Number(dayOverride || localStorage.getItem("currentDayNumber") || 1) || 1))
    };
    try {
      var roster = window.PacificEducationTeacherClassRosterContext;
      if (roster && typeof roster.getClassId === "function") {
        var classId = text(roster.getClassId());
        if (classId) ctx.classReference = classId;
        if (classId && typeof roster.getClass === "function") {
          var cls = roster.getClass(classId);
          if (cls) {
            ctx.level = text(cls.level || cls.className || ctx.level);
            ctx.subject = text(cls.subject || ctx.subject);
          }
        }
      }
    } catch (_) {}
    return ctx;
  }
  function approvedCurrentAffair(ctx) {
    var cfg = window.PacificEducationCountryConfig;
    if (!cfg || typeof cfg.getCurrentAffairs !== "function" || !ctx.countryCode) return null;
    var list;
    try { list = cfg.getCurrentAffairs(ctx.countryCode) || []; } catch (_) { return null; }
    var subject = ctx.subject.toLowerCase();
    var level = ctx.level.toLowerCase();
    for (var i = 0; i < list.length; i++) {
      var item = list[i] || {};
      var status = text(item.verificationStatus).toUpperCase();
      if (item.approved !== true || (status !== "APPROVED" && status !== "TEACHER_APPROVED" && status !== "VERIFIED")) continue;
      if (!text(item.title) || !/^https?:\/\//i.test(text(item.url))) continue;
      if (Array.isArray(item.subjectsApplicable) && item.subjectsApplicable.length &&
          !item.subjectsApplicable.some(function (s) { return text(s).toLowerCase() === subject; })) continue;
      if (Array.isArray(item.levelsApplicable) && item.levelsApplicable.length &&
          !item.levelsApplicable.some(function (s) { return text(s).toLowerCase() === level; })) continue;
      return item;
    }
    return null;
  }
  function getActivity(ctx) {
    var packs = window.PacificEducationRoleActivityPacks;
    if (!packs || typeof packs.getStudentActivity !== "function") return null;
    try {
      return packs.getStudentActivity(ctx.day, {
        countryCode: ctx.countryCode,
        level: ctx.level,
        subject: ctx.subject,
        term: ctx.term,
        classReference: ctx.classReference,
        classId: ctx.classReference
      });
    } catch (_) { return null; }
  }
  function planText(ctx, activity, news) {
    var lines = [
      "PACEDU — LINKED TEACHER WORKPLAN & LESSON PLAN",
      "Status: PacEdu-generated pilot document — teacher review required; not a claim of Ministry approval.",
      "Country: " + (ctx.country || ctx.countryCode || "Not recorded"),
      "Class / level: " + (ctx.level || "Select a class level"),
      "Subject: " + ctx.subject,
      "Term: " + ctx.term,
      "Teaching day: Day " + ctx.day,
      "Class reference: " + (ctx.classReference || "Not recorded"),
      "Activity ID: " + (activity.id || "Not supplied"),
      "",
      "1. DAILY WORKPLAN",
      "Topic / activity: " + (activity.title || "Daily learning activity"),
      "Learning objective: " + (activity.goal || "Use the stated activity goal."),
      "Resources: existing activity instructions; teacher-selected suitable materials; accessible formats as needed.",
      "Planned learning: " + (activity.task || "Use the matching learner activity."),
      "Evidence to collect: " + (activity.evidence || "Learner response, attempt and assessment note."),
      "Current demonstrated ability: " + (activity.currentAbility || "Insufficient evidence — assess before assigning a revision level."),
      "Ability evidence status: " + (activity.abilityEvidenceStatus || "INSUFFICIENT_EVIDENCE"),
      "Ability evidence note: " + (activity.abilityEvidenceMessage || "Use subject-specific work and reviewed assessment evidence; absence or missing work is not low ability."),
      "Revision decision: " + (activity.abilityEvidenceStatus === "DEMONSTRATED" ? "Prepare revision for the demonstrated level and reassess after practice." : "Collect a short subject check and reviewed evidence before assigning personalised revision."),
      "Curriculum reference status: " + (activity.curriculumStatus || "Verify against the current applicable Fiji curriculum source."),
      "",
      "2. MATCHING DAILY LESSON PLAN",
      "Introduction: explain the learning goal, connect it to prior learning, and check that learners can access the instructions.",
      "Teacher modelling / guided learning: demonstrate the first step of the exact learner activity and think aloud or show an accessible example.",
      "Learner practice: " + (activity.task || "Complete the matching daily activity."),
      "Check for understanding: " + (activity.check || "Ask the learner to explain, demonstrate, select, sign, draw or write their response."),
      "Differentiation and accessibility: " + (activity.accessibilityOptions || "Offer accessible instructions, response modes, suitable materials and extra time where needed."),
      "Success criteria: " + (activity.successCriteria || "The learner demonstrates the stated objective using an appropriate response method."),
      "Reflection / next step: " + (activity.reflectionPrompt || "Record what was achieved, what needs reteaching, and the next practical step."),
      "Suggested lesson duration: follow the school's approved timetable; adjust time to learner need.",
      "",
      "3. TEACHING EVIDENCE — COMPLETE AFTER THE LESSON",
      "Date actually taught: ______________________________",
      "Teacher name / signature: _________________________",
      "Learners present / participation record: _________________________",
      "Assessment result / evidence reference: _________________________",
      "What learners achieved: _________________________",
      "Learners needing follow-up and support provided: _________________________",
      "Teacher reflection / next lesson: _________________________",
      "Reviewer name / date / comments: _________________________",
      "",
      "4. CURRENT AFFAIRS ENRICHMENT",
      news ? ("Approved item: " + text(news.title) + "\nSource: " + text(news.url) + "\nPublished: " + text(news.publishedAt || news.published || "Date not supplied") + "\nUse: connect this item to the stated objective only after checking age suitability and relevance.") :
        "No matching, explicitly approved current-affairs item is available. Teach the existing daily activity as normal; pending items are not treated as approved lesson content.",
      "",
      "Generated on device: " + new Date().toISOString(),
      "Evidence note: this template records planning. Complete the after-lesson fields honestly; a plan alone does not prove teaching took place."
    ];
    return lines.join("\n");
  }
  function installPrintStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var style = node("style");
    style.id = STYLE_ID;
    style.textContent = "@media print { body.pacedu-linked-plan-printing * { visibility:hidden !important; } body.pacedu-linked-plan-printing #" + PANEL_ID + ", body.pacedu-linked-plan-printing #" + PANEL_ID + " * { visibility:visible !important; } body.pacedu-linked-plan-printing #" + PANEL_ID + " { position:absolute !important; left:0 !important; top:0 !important; width:100% !important; margin:0 !important; border:0 !important; box-shadow:none !important; } body.pacedu-linked-plan-printing #" + PANEL_ID + " .pacedu-plan-actions { display:none !important; } }";
    document.head.appendChild(style);
  }
  function buildPanel() {
    var host = document.getElementById("teacherDashboard");
    if (!host || document.getElementById(PANEL_ID)) return;
    var panel = node("section");
    panel.id = PANEL_ID;
    panel.setAttribute("aria-label", "Daily activity linked teacher workplan and lesson plan");
    panel.style.cssText = "margin:16px 0;padding:16px;border:2px solid #176b48;border-radius:10px;box-sizing:border-box;";
    panel.appendChild(node("h3", "Linked Daily Workplan & Lesson Plan"));
    panel.appendChild(node("p", "These documents are generated from the same daily activity used for learners. Select the class, subject and day, then print or download the matching plan. Teacher review is required."));
    var controls = node("div");
    controls.className = "pacedu-plan-actions";
    controls.style.cssText = "display:flex;flex-wrap:wrap;gap:10px;align-items:end;margin:12px 0;";
    var levelLabel = node("label", "Class / level ");
    var level = node("select");
    level.id = "paceduLinkedPlanLevel";
    level.style.cssText = "display:block;min-height:44px;padding:8px;max-width:100%;";
    [["", "Use current class selection"], ["ECE","ECE"]].concat(Array.from({length:13}, function (_, i) { return ["Class " + (i + 1), "Class " + (i + 1)]; })).forEach(function (option) {
      var opt = node("option", option[1]); opt.value = option[0]; level.appendChild(opt);
    });
    levelLabel.appendChild(level);
    var subjectLabel = node("label", "Subject ");
    var subject = node("select");
    subject.id = "paceduLinkedPlanSubject";
    subject.style.cssText = "display:block;min-height:44px;padding:8px;max-width:100%;";
    SUBJECTS.forEach(function (s) { var opt = node("option", s); opt.value = s; subject.appendChild(opt); });
    subjectLabel.appendChild(subject);
    var dayLabel = node("label", "Day (1–365) ");
    var day = node("input");
    day.id = "paceduLinkedPlanDay"; day.type = "number"; day.min = "1"; day.max = "365"; day.step = "1"; day.value = String(Math.max(1, Math.min(365, Number(localStorage.getItem("currentDayNumber") || 1) || 1)));
    day.style.cssText = "display:block;min-height:44px;padding:8px;width:110px;box-sizing:border-box;";
    dayLabel.appendChild(day);
    controls.appendChild(levelLabel); controls.appendChild(subjectLabel); controls.appendChild(dayLabel);
    var refresh = node("button", "Load Matching Plans"); refresh.type = "button"; refresh.style.cssText = "min-height:44px;padding:10px 14px;font-weight:700;"; controls.appendChild(refresh);
    var print = node("button", "Print / Save as PDF"); print.type = "button"; print.style.cssText = "min-height:44px;padding:10px 14px;font-weight:700;"; print.disabled = true; controls.appendChild(print);
    var download = node("button", "Download Plan (.txt)"); download.type = "button"; download.style.cssText = "min-height:44px;padding:10px 14px;font-weight:700;"; download.disabled = true; controls.appendChild(download);
    panel.appendChild(controls);
    var status = node("p", "Choose the class level and day, then load the matching plan.");
    status.id = "paceduLinkedPlanStatus"; status.setAttribute("role", "status"); status.setAttribute("aria-live", "polite"); panel.appendChild(status);
    var content = node("div"); content.id = "paceduLinkedPlanContent";
    content.style.cssText = "display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;align-items:start;";
    var activityColumn = node("section"); activityColumn.id = "paceduLinkedDailyActivityColumn";
    activityColumn.style.cssText = "min-width:0;padding:12px;border:1px solid #c8d7e2;border-radius:8px;overflow-wrap:anywhere;";
    activityColumn.appendChild(node("h4", "Student Daily Activity"));
    var planColumn = node("section"); planColumn.id = "paceduLinkedWorkplanColumn";
    planColumn.style.cssText = "min-width:0;padding:12px;border:1px solid #c8d7e2;border-radius:8px;overflow-wrap:anywhere;";
    planColumn.appendChild(node("h4", "Matching Teacher Workplan & Lesson Plan"));
    content.appendChild(activityColumn); content.appendChild(planColumn); panel.appendChild(content);
    var generated = "";
    var currentContext = null;
    refresh.addEventListener("click", function () {
      var chosenLevel = text(level.value);
      var chosenSubject = text(subject.value) || "English";
      var chosenDay = Math.max(1, Math.min(365, Math.floor(Number(day.value) || 1)));
      day.value = String(chosenDay);
      currentContext = readContext(chosenDay, chosenLevel, chosenSubject);
      activityColumn.textContent = ""; planColumn.textContent = "";
      activityColumn.appendChild(node("h4", "Student Daily Activity"));
      planColumn.appendChild(node("h4", "Matching Teacher Workplan & Lesson Plan"));
      generated = "";
      print.disabled = true; download.disabled = true;
      if (!chosenLevel) {
        status.textContent = "Select a class / level before loading matching plans. No plan was generated because the class context is missing.";
        return;
      }
      var activity = getActivity(currentContext);
      if (!activity) {
        status.textContent = "The existing daily activity generator is unavailable. No unmatched plan was created.";
        return;
      }
      var news = approvedCurrentAffair(currentContext);
      generated = planText(currentContext, activity, news);
      var heading = node("h4", "Day " + chosenDay + " — " + (activity.title || chosenSubject + " activity"));
      activityColumn.appendChild(heading);
      addLine(activityColumn, "Activity ID", activity.id);
      addLine(activityColumn, "Class / level", currentContext.level || "Not selected");
      addLine(activityColumn, "Subject", currentContext.subject);
      addLine(activityColumn, "Learning objective", activity.goal);
      addLine(activityColumn, "Learner activity", activity.task);
      addLine(activityColumn, "Assessment / check", activity.check);
      addLine(activityColumn, "Evidence", activity.evidence);
      addLine(activityColumn, "Current demonstrated ability", activity.currentAbility || "Insufficient evidence — assess before assigning a revision level");
      addLine(activityColumn, "Next ability goal", activity.nextAbility || "Set after reviewing evidence");
      addLine(activityColumn, "Curriculum status", activity.curriculumStatus || "Teacher verification required");
      addLine(activityColumn, "Current affairs", news ? text(news.title) + " (approved enrichment)" : "No approved matching item; daily learning continues normally.");
      var note = node("p", "Plan status: PENDING_TEACHER_REVIEW. The plan reuses the selected daily activity; verify curriculum mapping and complete teaching evidence after the lesson.");
      note.setAttribute("role", "note"); activityColumn.appendChild(note);
      var preview = node("pre", generated);
      preview.id = "paceduLinkedPlanPreview";
      preview.style.cssText = "white-space:pre-wrap;overflow-wrap:anywhere;font:inherit;font-size:.92em;margin:8px 0;";
      planColumn.appendChild(preview);
      status.textContent = "Matching workplan and lesson plan ready for Day " + chosenDay + ". Review before teaching; after-lesson evidence fields are in the printable copy.";
      print.disabled = false; download.disabled = false;
    });
    print.addEventListener("click", function () {
      if (!generated) return;
      installPrintStyle();
      var pre = node("pre", generated);
      pre.style.cssText = "white-space:pre-wrap;overflow-wrap:anywhere;font:12pt/1.45 sans-serif;";
      var old = document.getElementById("paceduLinkedPlanPrintableText");
      if (old) old.parentNode.removeChild(old);
      pre.id = "paceduLinkedPlanPrintableText";
      planColumn.appendChild(pre);
      document.body.classList.add("pacedu-linked-plan-printing");
      var cleanup = function () {
        document.body.classList.remove("pacedu-linked-plan-printing");
        if (pre.parentNode) pre.parentNode.removeChild(pre);
        window.removeEventListener("afterprint", cleanup);
      };
      window.addEventListener("afterprint", cleanup);
      window.print();
      window.setTimeout(cleanup, 1500);
    });
    download.addEventListener("click", function () {
      if (!generated) return;
      try {
        var blob = new Blob([generated], {type:"text/plain;charset=utf-8"});
        var url = URL.createObjectURL(blob);
        var a = node("a"); a.href = url;
        a.download = "PacEdu-" + (currentContext.level || "Class") + "-" + (currentContext.subject || "Subject").replace(/[^a-z0-9]+/gi, "-") + "-Day-" + currentContext.day + "-Workplan-Lesson-Plan.txt";
        a.style.display = "none"; document.body.appendChild(a); a.click(); a.parentNode.removeChild(a);
        window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
        status.textContent = "Plan download started. Complete the teaching-evidence fields after the lesson.";
      } catch (_) { status.textContent = "Download was unavailable in this browser. Use Print / Save as PDF instead."; }
    });
    host.insertBefore(panel, host.firstChild);
    var current = readContext();
    subject.value = SUBJECTS.indexOf(current.subject) >= 0 ? current.subject : "English";
    var levels = Array.prototype.map.call(level.options, function (o) { return o.value; });
    if (levels.indexOf(current.level) >= 0) level.value = current.level;
    refresh.click();
  }
  function init() { buildPanel(); }
  window.PacificEducationLinkedTeacherPlans = {
    version: "1.0.0-linked-daily-activity",
    render: buildPanel,
    getApprovedCurrentAffair: approvedCurrentAffair,
    getPlanText: planText
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
  window.addEventListener("load", init);
  document.addEventListener("pacificEducationSelectionChanged", init);
})(window, document);
