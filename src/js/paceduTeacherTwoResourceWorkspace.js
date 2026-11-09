/* PacEdu — two-resource teacher subject/class workspace.
 * Keeps teacher instructions, ability worksheets and activity-linked teaching aids together after subject -> class selection.
 * Learner evidence is used only when an explicit reviewed mark exists for the same roster learner.
 * Camera photos remain pending until reviewed; no AI-marking claim is made.
 */
(function (window, document) {
  "use strict";
  var PANEL_ID = "paceduTeacherTwoResourcePanel";
  var RESPONSE_KEY = "pacificEducationActivityResponses";
  /* Stable internal keys; learner-facing pathways are not score bands. */
  var BANDS = [
    { id: "support", label: "Copper" },
    { id: "developing", label: "Bronze" },
    { id: "expected", label: "Silver" },
    { id: "extension", label: "Gold" }
  ];
  function node(tag, value) {
    var el = document.createElement(tag);
    if (value != null) el.textContent = value;
    return el;
  }
  function readResponses() {
    try {
      var value = JSON.parse(window.localStorage.getItem(RESPONSE_KEY) || "[]");
      return Array.isArray(value) ? value : [];
    } catch (_) { return []; }
  }
  function reviewedEvidenceFor(studentRef, classId, subject) {
    return readResponses().filter(function (r) {
      var status = String(r.reviewStatus || r.markingStatus || "").toLowerCase();
      var reviewed = ["teacher-reviewed", "reviewed", "teacher-approved", "marked"].indexOf(status) >= 0 ||
        r.teacherReviewed === true || r.teacherApproved === true;
      var rawMark = r.markPercent != null ? r.markPercent : r.scorePercent != null ? r.scorePercent :
        r.mark != null ? r.mark : r.score != null ? r.score : null;
      var numericMark = rawMark === null || rawMark === "" ? NaN : Number(rawMark);
      return reviewed && Number.isFinite(numericMark) && numericMark >= 0 && numericMark <= 100 &&
        String(r.studentReference || r.studentRef || "") === String(studentRef) &&
        String(r.classId || "") === String(classId) &&
        String(r.subject || r.subjectId || "").toLowerCase() === String(subject || "").toLowerCase();
    }).sort(function (a, b) {
      return Number(b.day || b.dayNumber || 0) - Number(a.day || a.dayNumber || 0);
    });
  }
  function priorReviewedEvidence(studentRef, classId, subject) {
    var rows = reviewedEvidenceFor(studentRef, classId, subject);
    return rows.length ? rows[0] : null;
  }
  /* No numerical placement thresholds or minimum evidence count are approved. */
  function bandFor() { return null; }
  function render() {
    var list = document.getElementById("paceduTeacherClassList");
    var planPanel = document.getElementById("pacificEducationLinkedTeacherPlans");
    if (!list || !planPanel || document.getElementById(PANEL_ID)) return;
    var selectedClass = list.querySelector('[data-pacedu-teacher-class][aria-pressed="true"]');
    if (!selectedClass) return;
    var subjectButton = document.querySelector('[data-pacedu-teacher-subject][aria-pressed="true"]');
    var subject = subjectButton ? subjectButton.getAttribute("data-pacedu-teacher-subject") : "English";
    var classId = selectedClass.getAttribute("data-pacedu-teacher-class") || "";
    var roster = window.PacificEducationTeacherClassRosterContext;
    var classInfo = null;
    try { classInfo = roster && classId && roster.getClass ? roster.getClass(classId) : null; } catch (_) {}
    var panel = node("section");
    panel.id = PANEL_ID;
    panel.setAttribute("aria-label", "Teacher instructions and student ability worksheets");
    panel.style.cssText = "margin:14px 0;padding:14px;border:2px solid #7bb9e8;border-radius:12px;";
    panel.appendChild(node("h3", subject + " — " + selectedClass.textContent.trim()));
    panel.appendChild(node("p", "Daily downloads and teaching aids stay linked to the selected subject and class. Reviewed evidence is information for teacher consideration only; no mark automatically assigns a learner. A teacher must review the Day 1 baseline and sufficient evidence, then confirm the group. Missing, pending or invalid work stays unconfirmed and never means low ability."));
    /* Keep the visible workspace to the two requested resource types.
       Existing linked-plan actions remain callable by the resource-1 buttons. */
    Array.prototype.forEach.call(planPanel.querySelectorAll("button"), function (b) {
      var label = String(b.textContent || "").trim().toLowerCase();
      if (label === "download plan (.txt)") b.hidden = true;
      if (label === "print / save as pdf") b.hidden = true;
    });
    var instructions = node("section");
    instructions.setAttribute("aria-label", "Resource type 1: teacher instructions");
    instructions.appendChild(node("h4", "1. Teacher Instructions — Read or Print"));
    instructions.appendChild(node("p", "Daily teaching instructions, lesson/workplan, activity examples, achievement-indicator reference, assessment check and access adjustments. Official indicator alignment must be verified before teaching."));
    var load = node("button", "Load today's teacher instructions");
    load.type = "button";
    load.addEventListener("click", function () {
      var loadButton = Array.prototype.find.call(planPanel.querySelectorAll("button"), function (b) {
        return /load matching plans/i.test(b.textContent || "");
      });
      if (loadButton) loadButton.click();
      var status = document.getElementById("paceduLinkedPlanStatus");
      if (status) status.textContent = "Teacher instructions loaded. Check the achievement-indicator verification status before teaching.";
    });
    instructions.appendChild(load);
    var print = node("button", "Print teacher instructions / Save as PDF");
    print.type = "button";
    print.style.cssText = "display:block;margin-top:8px;min-height:44px;padding:10px;";
    print.addEventListener("click", function () {
      var existing = Array.prototype.find.call(planPanel.querySelectorAll("button"), function (b) {
        return String(b.textContent || "").trim().toLowerCase() === "print / save as pdf";
      });
      if (existing && !existing.disabled) existing.click();
      else {
        var loadButton = Array.prototype.find.call(planPanel.querySelectorAll("button"), function (b) {
          return /load matching plans/i.test(b.textContent || "");
        });
        if (loadButton) loadButton.click();
        var status = document.getElementById("paceduLinkedPlanStatus");
        if (status) status.textContent = "Load matching plans first, then print the teacher instructions.";
      }
    });
    instructions.appendChild(print);
    panel.appendChild(instructions);
    var worksheets = node("section");
    worksheets.setAttribute("aria-label", "Resource type 2: student ability worksheets");
    worksheets.style.cssText = "margin-top:14px;padding-top:12px;border-top:1px solid #c8d7e2;";
    worksheets.appendChild(node("h4", "2. Daily Activities + Revision + Practice Exam — By Ability"));
    worksheets.appendChild(node("p", "Choose a term, then prepare a separate printable pack for any of the four ability groups. Each pack includes daily activities, term revision practice and a mock practice examination for this selected class and subject. Class-wide files never include learner IDs."));
    var evidence = node("div");
    evidence.setAttribute("aria-label", "Learner roster and previous-day reviewed evidence");
    var students = classInfo && Array.isArray(classInfo.studentRefs) ? classInfo.studentRefs : [];
    if (!students.length) {
      evidence.appendChild(node("p", "No learner references are connected to this class roster yet. Do not assign an individual ability group until the roster is linked."));
    } else {
      var rosterList = node("ul");
      students.forEach(function (ref) {
        var row = node("li");
        var reviewedRows = reviewedEvidenceFor(ref, classId, subject);
        var hasDayOne = reviewedRows.some(function (r) {
          return Number(r.day || r.dayNumber || 0) === 1;
        });
        row.textContent = String(ref) + " — " + (reviewedRows.length ?
          "Reviewed evidence: " + reviewedRows.length + " record(s); Day 1 reviewed record: " +
          (hasDayOne ? "present" : "not found") + "; ability placement remains unconfirmed for teacher review." :
          "No reviewed mark found for this subject; ability group remains unconfirmed.");
        rosterList.appendChild(row);
      });
      evidence.appendChild(rosterList);
    }
    worksheets.appendChild(evidence);
    var api = window.PacEduDownloadableClassPacks;
    var worksheetAvailability = api && typeof api.resolveSubject === "function" ? api.resolveSubject(subject, levelValue) : { available: true, note: "" };
    if (api && typeof api.download === "function") {
      var termLabel = node("label", "Term for today's worksheets");
      termLabel.style.cssText = "display:block;margin:10px 0;font-weight:600;";
      var termSelect = node("select");
      termSelect.style.cssText = "display:block;width:100%;padding:10px;margin-top:5px;font:inherit;";
      [["T1","Term 1 — 9 weeks"],["T2","Term 2 — 9 weeks"],["T3","Term 3 — 5 weeks"]].forEach(function (item) {
        var option = node("option", item[1]); option.value = item[0]; termSelect.appendChild(option);
      });
      var savedTerm = String(window.localStorage.getItem("pacificEducationTerm") || "T1");
      if (/^T[123]$/.test(savedTerm)) termSelect.value = savedTerm;
      termLabel.appendChild(termSelect);
      worksheets.appendChild(termLabel);
      var groupHeading = node("h5", "Prepare a pack for any ability group");
      worksheets.appendChild(groupHeading);
      var groupStatus = node("p", "");
      groupStatus.setAttribute("role", "status");
      groupStatus.setAttribute("aria-live", "polite");
      if (!students.length) {
        groupStatus.textContent = "All four class-wide practice packs remain available. Link the roster and complete the Day 1 baseline before considering individual placement.";
      } else {
        groupStatus.textContent = "Reviewed records are shown for teacher consideration only. No learner is automatically placed. Numerical placement thresholds and minimum evidence rules are not configured; a teacher must review the Day 1 baseline and sufficient evidence before confirming any group. Missing, pending or invalid work never means low ability.";
      }
      worksheets.appendChild(groupStatus);
      if (worksheetAvailability.available) BANDS.forEach(function (band) {
        var button = node("button", "Prepare " + band.label + " class-wide pack: daily activities + revision + mock exam");
        button.type = "button";
        button.disabled = false;
        button.style.cssText = "display:block;width:100%;min-height:46px;padding:10px;margin:7px 0;text-align:left;";
        button.addEventListener("click", function () {
          try {
            var pack = api.download({ level: levelValue, subject: subject, term: termSelect.value, ability: band.id });
            groupStatus.textContent = "Prepared " + pack.dailyActivities + " daily activities plus term revision practice and a mock practice examination for " + band.label + ". " + (pack.missingSlots ? pack.missingSlots + " daily slots were unavailable. " : "") + "Review the answer guidance and verify current Fiji syllabus mapping before assigning.";
          } catch (error) {
            groupStatus.textContent = "Could not prepare this worksheet pack: " + String(error && error.message || error);
          }
        });
        worksheets.appendChild(button);
      });
      else {
        groupStatus.textContent = worksheetAvailability.note || "Subject-specific daily worksheets are not available yet. No other subject will be substituted.";
        groupStatus.setAttribute("data-content-status", "CONTENT_NOT_AVAILABLE");
      }
      if (worksheetAvailability.available && !students.length) {
        var baseline = node("p", "For a new class or Day 1 baseline, prepare any ability pack as needed, then review the baseline activity before assigning individual learners. Do not treat absent work as a low score.");
        worksheets.appendChild(baseline);
      }
    } else worksheets.appendChild(node("p", "The worksheet download builder is not available in this session."));
    panel.appendChild(worksheets);

    var aids = node("section");
    aids.setAttribute("aria-label", "Teacher resource library and teaching aid builder");
    aids.style.cssText = "margin-top:14px;padding-top:12px;border-top:1px solid #c8d7e2;";
    aids.appendChild(node("h4", "3. Teacher Resource & Teaching Aid Builder"));
    aids.appendChild(node("p", "Prepare a resource brief linked to this subject, class and learning objective: teaching cards, charts, diagrams, worked examples or visual prompts. Use verified curriculum content only. Every draft is marked PENDING_TEACHER_REVIEW until checked."));
    var dailyDownloadsHost=node("div");
    var dailyDownloadsApi=window.PacEduSeparateDailyResourceDownloads;
    if(dailyDownloadsApi&&typeof dailyDownloadsApi.renderControls==="function"){
      var dailyDownloadTerm="T1";
      try{dailyDownloadTerm=String(window.localStorage.getItem("pacificEducationTerm")||"T1");}catch(_){}
      dailyDownloadsApi.renderControls(dailyDownloadsHost,{level:levelValue,subject:subject,term:dailyDownloadTerm,useSelectedContext:true});
      aids.appendChild(dailyDownloadsHost);
    }else{
      aids.appendChild(node("p","Activity-linked daily downloads are not available in this session."));
    }
    var aidTypeLabel = node("label", "Choose a teaching aid");
    var aidType = node("select");
    [["card","Teaching card"],["chart","Chart"],["diagram","Diagram"],["worked-example","Worked example"],["visual-prompt","Visual prompt"]].forEach(function (item) {
      var option=node("option",item[1]); option.value=item[0]; aidType.appendChild(option);
    });
    aidTypeLabel.appendChild(aidType);
    aids.appendChild(aidTypeLabel);
    var indicatorLabel=node("label","Verified achievement indicator / curriculum reference");
    var indicator=node("input"); indicator.type="text"; indicator.maxLength=240; indicator.placeholder="Enter the official indicator reference";
    indicatorLabel.appendChild(indicator); aids.appendChild(indicatorLabel);
    var objectiveLabel=node("label","Learning objective and resource notes");
    var objective=node("textarea"); objective.rows=4; objective.maxLength=1800; objective.placeholder="Enter the approved learning objective, key facts, worked steps or visual description. Do not invent curriculum content.";
    objectiveLabel.appendChild(objective); aids.appendChild(objectiveLabel);
    var aidStatus=node("p","Draft only — PENDING_TEACHER_REVIEW. This builder does not verify the curriculum source or publish the resource.");
    aidStatus.setAttribute("role","status"); aidStatus.setAttribute("aria-live","polite"); aids.appendChild(aidStatus);
    var aidDownload=node("button","Download teaching aid brief (.txt)"); aidDownload.type="button";
    aidDownload.addEventListener("click",function(){
      if(!indicator.value.trim()||!objective.value.trim()){
        aidStatus.textContent="Enter the verified curriculum reference and learning objective before downloading.";
        return;
      }
      var term=String(window.localStorage.getItem("pacificEducationTerm")||"T1");
      var content=[
        "PACEDU TEACHER RESOURCE BRIEF",
        "Status: PENDING_TEACHER_REVIEW",
        "Subject: "+subject,
        "Class: "+levelValue,
        "Term: "+term,
        "Resource type: "+aidType.options[aidType.selectedIndex].text,
        "Curriculum reference: "+indicator.value.trim(),
        "Learning objective and resource notes:",
        objective.value.trim(),
        "",
        "Teacher check: verify the official source, class, term, week, day and objective before use."
      ].join("\n");
      var blob=new Blob([content],{type:"text/plain;charset=utf-8"});
      var url=window.URL.createObjectURL(blob);
      var link=node("a","Download resource brief"); link.href=url; link.download="PacEdu-"+subject.replace(/[^a-z0-9]+/gi,"-")+"-"+String(levelValue).replace(/[^a-z0-9]+/gi,"-")+"-teaching-aid.txt";
      aids.appendChild(link); link.click(); link.remove();
      window.setTimeout(function(){window.URL.revokeObjectURL(url);},1000);
      aidStatus.textContent="Teaching aid brief downloaded. Status remains PENDING_TEACHER_REVIEW until checked.";
    });
    aids.appendChild(aidDownload);
    panel.appendChild(aids);
    planPanel.appendChild(panel);
  }
  function reset() {
    var old = document.getElementById(PANEL_ID);
    if (old && old.parentNode) old.parentNode.removeChild(old);
  }
  document.addEventListener("click", function (event) {
    var classButton = event.target && event.target.closest ? event.target.closest("[data-pacedu-teacher-class]") : null;
    var subjectButton = event.target && event.target.closest ? event.target.closest("[data-pacedu-teacher-subject]") : null;
    if (classButton || subjectButton) {
      reset();
      window.setTimeout(render, 0);
    }
  });
  window.PacEduTeacherTwoResourceWorkspace = Object.freeze({
    render: render,
    priorReviewedEvidence: priorReviewedEvidence,
    recommendedBand: bandFor
  });
})(window, document);
