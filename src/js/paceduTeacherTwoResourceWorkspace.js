/* PacEdu — two-resource teacher subject/class workspace.
 * Keeps teacher instructions, ability worksheets and activity-linked teaching aids together after subject -> class selection.
 * Learner evidence is used only when an explicit reviewed mark exists for the same roster learner.
 * Camera photos remain pending until reviewed; no AI-marking claim is made.
 */
(function (window, document) {
  "use strict";
  var PANEL_ID = "paceduTeacherTwoResourcePanel";
  var RESPONSE_KEY = "pacificEducationActivityResponses";
  /* Stable internal keys preserve existing pack-builder compatibility;
     learner-facing names follow the approved PacEdu order. */
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
    var rows = readResponses();
    var valid = rows.filter(function (r) {
      var status = String(r.reviewStatus || r.markingStatus || "").toLowerCase();
      var reviewed = ["teacher-reviewed", "reviewed", "teacher-approved", "marked"].indexOf(status) >= 0 ||
        r.teacherReviewed === true || r.teacherApproved === true;
      var rawMark = r.markPercent != null ? r.markPercent : r.scorePercent != null ? r.scorePercent :
        r.mark != null ? r.mark : r.score != null ? r.score : null;
      var numericMark = rawMark === null || rawMark === "" ? NaN : Number(rawMark);
      var hasMark = Number.isFinite(numericMark) && numericMark >= 0 && numericMark <= 100;
      return reviewed && hasMark &&
        String(r.studentReference || r.studentRef || "") === String(studentRef) &&
        String(r.classId || "") === String(classId) &&
        String(r.subject || r.subjectId || "").toLowerCase() === String(subject || "").toLowerCase();
    });
    valid.sort(function (a, b) {
      return Number(b.day || b.dayNumber || 0) - Number(a.day || a.dayNumber || 0);
    });
    return valid;
  }
  function priorReviewedEvidence(studentRef, classId, subject) {
    var valid = reviewedEvidenceFor(studentRef, classId, subject);
    return valid.length ? valid[0] : null;
  }
  /* No numerical placement thresholds or minimum evidence count have been
     approved. A single mark must never auto-place a learner. */
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
    var levelValue = String(classInfo && (classInfo.level || classInfo.className) || selectedClass.textContent.trim());
    var subjectLabel = subject;
    var subjectMappingApi = window.PacEduFijiSubjectMapping || window.PacEduFijiNineSubjectMapping;
    try {
      var subjectMapping = subjectMappingApi && typeof subjectMappingApi.resolve === "function" ? subjectMappingApi.resolve(subject, levelValue) : null;
      if(subjectMapping && subjectMapping.label) subjectLabel = subjectMapping.label;
    } catch (_) {}
    var panel = node("section");
    panel.id = PANEL_ID;
    panel.setAttribute("aria-label", "Teacher instructions and student ability worksheets");
    panel.style.cssText = "margin:14px 0;padding:14px;border:2px solid #7bb9e8;border-radius:12px;";
    panel.appendChild(node("h3", subjectLabel + " — " + selectedClass.textContent.trim()));
    panel.appendChild(node("p", "Daily downloads and teaching aids stay linked to the selected subject and class. A reviewed 0–100 mark is evidence for teacher review only; it never assigns a learner. Confirm placement only after the Day 1 baseline and sufficient reviewed evidence. Missing, pending or invalid work stays unconfirmed and never means low ability."));
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
    var groupCounts = { support: 0, developing: 0, expected: 0, extension: 0 };
    if (!students.length) {
      evidence.appendChild(node("p", "No learner references are connected to this class roster yet. Do not assign an individual ability group until the roster is linked."));
    } else {
      var rosterList = node("ul");
      students.forEach(function (ref) {
        var row = node("li");
        var reviewedRows = reviewedEvidenceFor(ref, classId, subject);
        var mark = reviewedRows.length ? reviewedRows[0] : null;
        var hasDayOne = reviewedRows.some(function (r) {
          return Number(r.day || r.dayNumber || 0) === 1;
        });
        row.textContent = String(ref) + " — " + (mark ?
          "Reviewed evidence: " + reviewedRows.length + " record(s); Day 1 reviewed record: " +
          (hasDayOne ? "present" : "not found") + "; ability placement remains unconfirmed for teacher review." :
          "No valid teacher-reviewed evidence found for this subject; ability group remains unconfirmed.");
        rosterList.appendChild(row);
      });
      evidence.appendChild(rosterList);
    }
    worksheets.appendChild(evidence);
    var api = window.PacEduDownloadableClassPacks;
    var worksheetAvailability = api && typeof api.resolveSubject === "function" ? api.resolveSubject(subject, levelValue) : { available: true, note: "" };
    var aidCreationBlocked=!!(subjectMapping&&(subjectMapping.status==="missing"||subjectMapping.status==="level-gap"||subjectMapping.contentStatus==="CONTENT_NOT_AVAILABLE"))||!worksheetAvailability||!worksheetAvailability.available;
    if(aidCreationBlocked){
      worksheets.appendChild(node("p","Teaching-aid creation is locked for this subject and class until an approved curriculum mapping and matching content are available. No other subject's material will be substituted."));
      panel.appendChild(worksheets);
      planPanel.appendChild(panel);
      return;
    }
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
        groupStatus.textContent = "Reviewed records are shown for teacher consideration only. No learner is automatically placed. The approved minimum evidence rule and placement thresholds are not configured; a teacher must review the Day 1 baseline and sufficient evidence before recording any group. Missing, pending or invalid work never means low ability.";
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
      if (worksheetAvailability.available && (!students.length || !Object.keys(groupCounts).some(function (id) { return groupCounts[id] > 0; }))) {
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
    function aidField(labelText,tagName,placeholder,rows){
      var label=node("label",labelText);
      label.style.cssText="display:block;margin:9px 0;font-weight:600;";
      var control=node(tagName);
      control.style.cssText="display:block;width:100%;max-width:100%;box-sizing:border-box;min-height:42px;padding:9px;margin-top:4px;border:1px solid #8aa5b8;border-radius:6px;font:inherit;";
      if(placeholder)control.placeholder=placeholder;
      if(tagName==="textarea"){control.rows=rows||3;control.maxLength=2400;}
      else control.maxLength=240;
      label.appendChild(control);aids.appendChild(label);return control;
    }
    var activityId=aidField("Activity ID this resource belongs to","input","Enter the exact daily activity ID");
    var weekSelect=aidField("Teaching week","select","");
    function syncAidWeeks(){
      var maxWeeks=String(termSelect&&termSelect.value||window.localStorage.getItem("pacificEducationTerm")||"T1")==="T3"?5:9;
      var previous=weekSelect.value;
      weekSelect.textContent="";
      for(var w=1;w<=maxWeeks;w++){var wo=node("option","Week "+w);wo.value=String(w);weekSelect.appendChild(wo);}
      if(Number(previous)>0&&Number(previous)<=maxWeeks)weekSelect.value=previous;
    }
    syncAidWeeks();
    if(termSelect)termSelect.addEventListener("change",syncAidWeeks);
    var daySelect=aidField("Teaching day","select","");
    for(var d=1;d<=5;d++){var dayOption=node("option","Day "+d);dayOption.value=String(d);daySelect.appendChild(dayOption);}
    var aidTitle=aidField("Teaching aid title","input","Give the card, chart, diagram or worked example a clear title");
    var objectiveLabel=node("label","Learning objective and resource notes");
    objectiveLabel.style.cssText="display:block;margin:9px 0;font-weight:600;";
    var objective=node("textarea"); objective.rows=4; objective.maxLength=1800; objective.placeholder="Enter the approved learning objective, key facts, worked steps or visual description. Do not invent curriculum content.";
    objective.style.cssText="display:block;width:100%;box-sizing:border-box;padding:9px;margin-top:4px;font:inherit;";
    objectiveLabel.appendChild(objective); aids.appendChild(objectiveLabel);
    var teacherInstructions=aidField("Teacher instructions","textarea","Explain how the teacher should introduce and use this aid",4);
    var studentVersion=aidField("Student version / accessible description","textarea","Describe what the learner sees, reads, hears or handles",4);
    var sourceLicence=aidField("Source and licence / ownership","input","e.g. Original PacEdu draft or exact source and licence");
    var formats=node("fieldset");
    formats.style.cssText="margin:10px 0;padding:10px;border:1px solid #9bb0bd;border-radius:8px;";
    formats.appendChild(node("legend","Accessible formats available"));
    var formatInputs=[];
    [["large-print","Large print"],["screen-reader-text","Screen-reader text"],["tactile","Tactile / touch format"],["verbal-description","Verbal description"],["captions","Captions"]].forEach(function(item){
      var label=node("label",item[1]);label.style.cssText="display:flex;gap:8px;align-items:center;margin:7px 0;";
      var check=node("input");check.type="checkbox";check.value=item[0];check.style.cssText="width:22px;height:22px;flex:0 0 auto;";
      label.insertBefore(check,label.firstChild);formats.appendChild(label);formatInputs.push(check);
    });
    aids.appendChild(formats);
    var teacherNote=aidField("Accessibility and adaptation note","textarea","Explain any adjustment or alternative response format",3);
    var aidStatus=node("p","Draft only — PENDING_TEACHER_REVIEW. Saved drafts stay on this device. The builder does not verify curriculum sources or publish resources.");
    aidStatus.setAttribute("role","status"); aidStatus.setAttribute("aria-live","polite"); aids.appendChild(aidStatus);
    function buildAidRecord(){
      var term=String(termSelect&&termSelect.value||window.localStorage.getItem("pacificEducationTerm")||"T1");
      var selectedFormats=formatInputs.filter(function(x){return x.checked;}).map(function(x){return x.value;});
      var missing=[];
      [[activityId,"activity ID"],[aidTitle,"teaching aid title"],[indicator,"curriculum reference"],[objective,"learning objective"],[teacherInstructions,"teacher instructions"],[studentVersion,"student version / accessible description"],[sourceLicence,"source and licence / ownership"],[teacherNote,"accessibility note"]].forEach(function(pair){if(!String(pair[0].value||"").trim())missing.push(pair[1]);});
      if(!selectedFormats.length)missing.push("at least one accessible format");
      if(!Number(weekSelect.value)||!Number(daySelect.value))missing.push("teaching week and day");
      if(missing.length){aidStatus.textContent="Complete these required resource fields first: "+missing.join(", ")+". No draft has been saved.";return null;}
      return {
        id:String(activityId.value).trim()+"-AID-"+Date.now(),
        activityId:String(activityId.value).trim(),
        subject:subjectLabel,
        subjectKey:subject,
        level:levelValue,
        term:term,
        week:Number(weekSelect.value),
        day:Number(daySelect.value),
        resourceType:aidType.value,
        title:String(aidTitle.value).trim(),
        achievementIndicator:String(indicator.value).trim(),
        learningObjective:String(objective.value).trim(),
        teacherInstructions:String(teacherInstructions.value).trim(),
        studentVersion:String(studentVersion.value).trim(),
        sourceLicence:String(sourceLicence.value).trim(),
        accessibilityFormats:selectedFormats,
        teacherNote:String(teacherNote.value).trim(),
        reviewStatus:"PENDING_TEACHER_REVIEW",
        curriculumVerification:"NOT_YET_MAPPED",
        approved:false,
        published:false,
        createdAt:(new Date()).toISOString()
      };
    }
    var aidGateStatus=node("p","Quality gate: not checked yet.");
    aidGateStatus.setAttribute("role","status");aidGateStatus.setAttribute("aria-live","polite");aids.appendChild(aidGateStatus);
    var aidGateDetails=node("ul");
    aidGateDetails.setAttribute("aria-label","Teaching-aid quality gate requirements still missing");
    aids.appendChild(aidGateDetails);
    function validateAidDraft(record){
      var gate=window.PacEduTeachingAidQualityGate;
      if(!gate||typeof gate.validateActivity!=="function")return null;
      var objectiveText=record.learningObjective;
      var activity={
        id:record.activityId,subject:record.subject,level:record.level,term:record.term,
        week:record.week,day:record.day,learningObjective:objectiveText,
        curriculum:{verificationStatus:"PENDING_SOURCE",sourceTitle:"",sourceVersion:"",outcomeOrConcept:"",achievementIndicator:record.achievementIndicator,indicatorStatus:"PENDING_SOURCE"},
        examples:{worked:"",guided:"",independent:""},
        abilityGroups:{
          Copper:{learningObjective:objectiveText,instructions:""},
          Bronze:{learningObjective:objectiveText,instructions:""},
          Silver:{learningObjective:objectiveText,instructions:""},
          Gold:{learningObjective:objectiveText,instructions:""}
        },
        worksheet:{id:"",content:""},teacherWorkplan:"",lessonPlan:"",
        assessment:{method:"",markingGuidance:""},
        accessibility:{formats:record.accessibilityFormats,teacherNote:record.teacherNote},
        teachingAids:[{
          id:record.id,title:record.title,type:record.resourceType,subject:record.subject,
          level:record.level,term:record.term,week:record.week,day:record.day,
          activityId:record.activityId,learningObjective:objectiveText,
          teacherInstructions:record.teacherInstructions,studentVersion:record.studentVersion,
          sourceLicence:record.sourceLicence,reviewStatus:"READY_FOR_TEACHER_REVIEW",
          accessibilityFormats:record.accessibilityFormats,indicator:record.achievementIndicator
        }]
      };
      return gate.validateActivity(activity);
    }
    function showGateResult(result){
      aidGateDetails.textContent="";
      if(!result){
        aidGateStatus.textContent="Quality gate unavailable. Draft remains PENDING_TEACHER_REVIEW.";
        return;
      }
      aidGateStatus.textContent="Quality gate: "+result.status+". "+result.missing.length+" activity requirement(s) and "+result.missingTeachingAids.length+" teaching-aid requirement(s) still need attention. No release is permitted.";
      result.missing.concat(result.missingTeachingAids).forEach(function(item){
        var li=node("li",item);aidGateDetails.appendChild(li);
      });
    }
    var saveAid=node("button","Save teaching aid draft on this device");saveAid.type="button";
    saveAid.style.cssText="display:block;width:100%;min-height:46px;padding:10px;margin:8px 0;font:inherit;font-weight:700;";
    saveAid.addEventListener("click",function(){
      var record=buildAidRecord();if(!record)return;
      var gateResult=validateAidDraft(record);
      if(gateResult){
        record.qualityGateStatus=gateResult.status;
        record.qualityGateMissing=gateResult.missing.slice();
        record.qualityGateMissingTeachingAids=gateResult.missingTeachingAids.slice();
      }else{
        record.qualityGateStatus="NOT_CHECKED";
        record.qualityGateMissing=[];
        record.qualityGateMissingTeachingAids=[];
      }
      try{
        var key="paceduTeacherTeachingAidDraftsV1";
        var rows=JSON.parse(window.localStorage.getItem(key)||"[]");
        if(!Array.isArray(rows))rows=[];
        rows.push(record);
        window.localStorage.setItem(key,JSON.stringify(rows));
        showGateResult(gateResult);
        aidStatus.textContent="Saved on this device: "+record.title+" — PENDING_TEACHER_REVIEW. It is not approved, uploaded or published.";
      }catch(error){aidStatus.textContent="This device could not save the draft. No upload or publication occurred.";}
    });
    aids.appendChild(saveAid);
    var aidDownload=node("button","Download teaching aid brief (.txt)"); aidDownload.type="button";
    aidDownload.addEventListener("click",function(){
      var record=buildAidRecord();if(!record)return;
      var content=[
        "PACEDU TEACHER RESOURCE BRIEF",
        "Status: PENDING_TEACHER_REVIEW",
        "Activity ID: "+record.activityId,
        "Subject: "+record.subject,
        "Internal subject key: "+record.subjectKey,
        "Class: "+record.level,
        "Term / week / day: "+record.term+" / "+record.week+" / "+record.day,
        "Resource type: "+record.resourceType,
        "Title: "+record.title,
        "Curriculum reference: "+record.achievementIndicator,
        "Learning objective and resource notes:",
        record.learningObjective,
        "Teacher instructions:",record.teacherInstructions,
        "Student version / accessible description:",record.studentVersion,
        "Source and licence / ownership:",record.sourceLicence,
        "Accessible formats: "+record.accessibilityFormats.join(", "),
        "Accessibility note:",record.teacherNote,
        "",
        "Curriculum verification: NOT_YET_MAPPED",
        "Approval: No",
        "Publication: No",
        "Teacher check: verify the official source, exact class, term, week, day and objective before use."
      ].join("\n");
      var blob=new Blob([content],{type:"text/plain;charset=utf-8"});
      var url=window.URL.createObjectURL(blob);
      var link=node("a","Download resource brief"); link.href=url; link.download="PacEdu-"+subjectLabel.replace(/[^a-z0-9]+/gi,"-")+"-"+String(levelValue).replace(/[^a-z0-9]+/gi,"-")+"-teaching-aid.txt";
      aids.appendChild(link); link.click(); link.remove();
      window.setTimeout(function(){window.URL.revokeObjectURL(url);},1000);
      aidStatus.textContent="Teaching aid brief downloaded. Status remains PENDING_TEACHER_REVIEW; it is not approved or published.";
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
    reviewedEvidenceFor: reviewedEvidenceFor,
    recommendedBand: bandFor
  });
})(window, document);
