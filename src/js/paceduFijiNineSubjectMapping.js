/* PacEdu Fiji 15-box subject mapping — non-activating pilot registry.
 * Preserves the requested 15 subject boxes and ECE, Classes 1–8, Forms 3–7.
 * Missing/partial content stays explicit; this registry never certifies Ministry alignment.
 */
(function (global) {
  "use strict";
  var LEVELS = ["ECE"];
  for (var c = 1; c <= 8; c += 1) LEVELS.push("Class " + c);
  for (var f = 3; f <= 7; f += 1) LEVELS.push("Form " + f);

  var SUBJECTS = [
    { id:"English", label:"English", worksheet:["English"], weekly:["English"], status:"partial", note:"Original English practice content is available; exact current Fiji syllabus outcomes, school adoption and daily sequence remain pending teacher verification." },
    { id:"Mathematics", label:"Mathematics", worksheet:["Mathematics"], weekly:["Mathematics"], status:"partial", note:"Original Mathematics practice content is available; verify the current Years 1–4 revised curriculum adoption and exact outcomes for each level." },
    { id:"Phonics", label:"Phonics", worksheet:["Phonics"], weekly:["Phonics"], status:"partial", note:"A distinct original Phonics practice bank exists; verify the adopted literacy programme, sound sequence and exact syllabus outcomes with a qualified Fiji literacy teacher." },
    { id:"Science", label:"Science", worksheet:["Science"], weekly:["Science"], status:"partial", note:"Course naming rule for review: Class 1–6 Elementary Science; Class 7–Form 4 Basic Science; Forms 5–7 only the selected, currently approved senior science courses (such as Biology or Chemistry where offered). Each level still needs its exact authorized syllabus and outcome mapping." },
    { id:"Social Science", label:"Social Science", worksheet:["Social Studies"], weekly:["Social Studies"], status:"partial", note:"Social Studies is an internal source-content label displayed inside the PacEdu Social Science box. Confirm the actual school subject and current syllabus for each level; no KLA or outcome mapping is certified." },
    { id:"Health", label:"Health", worksheet:["Healthy Living","Physical Education"], weekly:["Healthy Living","Physical Education"], status:"partial", note:"Healthy Living and Physical Education are separate internal source banks under the requested PacEdu Health box. Confirm the school's actual subject structure and applicable outcomes before formal alignment." },
    { id:"Agriculture", label:"Agriculture", worksheet:["Agriculture"], weekly:["Agriculture"], status:"partial", note:"Original Agriculture practice content exists; level-specific syllabus, practical requirements, safety and official outcomes remain pending review." },
    { id:"Arts", label:"Arts", worksheet:["Arts and Crafts","Music"], weekly:["Arts and Crafts","Music"], status:"partial", note:"Arts and Crafts and Music are separate internal strands inside the requested PacEdu Arts box. Confirm the school's offered strands and exact syllabus outcomes." },
    { id:"Technology", label:"Technology", worksheet:["Digital Literacy"], weekly:["Digital Literacy"], status:"partial", note:"Digital Literacy is only one possible Technology strand. Practical design, materials, tools, making and any approved technical courses need separate level-specific mapping." },
    { id:"Home Economics", label:"Home Economics", worksheet:["Home Economics"], weekly:["Home Economics"], status:"partial", note:"Original Home Economics practice content exists; confirm that the school offers it at the selected level and verify its current syllabus, practical outcomes and safety." },
    { id:"Computer Studies", label:"Computer Studies", worksheet:["Computer Studies"], weekly:["Computer Studies"], status:"partial", note:"Original Computer Studies practice content exists; verify whether it is offered at the selected level and map the current syllabus and outcomes before release." },
    { id:"Vosa Vakaviti (iTaukei)", label:"Vosa Vakaviti (iTaukei)", worksheet:["iTaukei Language"], weekly:["iTaukei Language"], status:"partial", note:"A separate iTaukei-language practice bank is used as a candidate for this box. A fluent Vosa Vakaviti educator must verify dialect, orthography, vocabulary and each outcome before student release." },
    { id:"Fiji Hindi", label:"Fiji Hindi", worksheet:[], weekly:["Hindi"], status:"partial", note:"Hindi weekly examples are only a temporary source. Fiji Hindi-specific vocabulary, script/orthography choices and teacher-reviewed worksheets are still required." },
    { id:"Urdu", label:"Urdu", worksheet:[], weekly:[], status:"missing", note:"Urdu-specific learning content and teacher-reviewed worksheets have not yet been built." },
    { id:"Rotuman", label:"Rotuman", worksheet:[], weekly:[], status:"missing", note:"Rotuman-specific learning content and teacher-reviewed worksheets have not yet been built." }
  ];

  function findSubject(id) {
    var key = String(id || "").trim().toLowerCase();
    return SUBJECTS.filter(function (item) {
      return item.id.toLowerCase() === key || item.label.toLowerCase() === key;
    })[0] || null;
  }
  function levelSupport(level) {
    var supported = LEVELS.indexOf(level) >= 0;
    return {
      level: level,
      worksheetEngine: supported,
      weeklyActivityEngine: supported,
      status: supported ? "LEVEL_ENGINE_AVAILABLE" : "LEVEL_NOT_SUPPORTED"
    };
  }
  function resolve(subjectId, level) {
    var subject = findSubject(subjectId);
    if (!subject) return { status:"SUBJECT_NOT_MAPPED", subject:subjectId || "", level:level || "" };
    var support = levelSupport(level);
    var status = subject.status;
    var displayLabel = subject.label;
    var note = subject.note;
    var contentStatus = subject.status === "missing" ? "CONTENT_NOT_AVAILABLE" :
      (subject.status === "partial" ? "CONTENT_PARTIAL" : "CONTENT_AVAILABLE_DRAFT");
    if (subject.id === "Science") {
      if (/^Class [1-6]$/.test(String(level || ""))) {
        displayLabel = "Elementary Science";
        note = "Class 1–6: display and review this subject as Elementary Science. The current official syllabus outcomes and daily sequence still require teacher verification.";
      } else if (/^Class 7$|^Form [3-4]$/.test(String(level || ""))) {
        displayLabel = "Basic Science";
        note = "Class 7–Form 4: display and review this subject as Basic Science. The current official syllabus outcomes and daily sequence still require teacher verification.";
      } else {
        status = "level-gap";
        contentStatus = "CONTENT_NOT_AVAILABLE";
        displayLabel = /^Form [5-7]$/.test(String(level || "")) ?
          "Senior Science — approved course required" : "Science — curriculum mapping required";
        note = "A generic Science worksheet is blocked for this level. Form 5–7 requires a separately selected, currently approved senior course (for example Biology or Chemistry where offered); Class 8 also requires explicit curriculum mapping. No other subject or course will be substituted.";
      }
    }
    if (!support.worksheetEngine || !support.weeklyActivityEngine) status = "level-gap";
    return {
      subject:subject.id,
      label:displayLabel,
      level:level,
      status:status,
      contentStatus:contentStatus,
      worksheetSourceSubjects:status === "level-gap" ? [] : subject.worksheet.slice(),
      weeklyActivitySourceSubjects:status === "level-gap" ? [] : subject.weekly.slice(),
      levelSupport:support,
      note:note,
      curriculumVerification:"NOT_YET_MAPPED"
    };
  }
  function getSubjectBoxes() {
    return SUBJECTS.map(function (item) {
      return {
        id:item.id, label:item.label, status:item.status,
        worksheetSourceSubjects:item.worksheet.slice(),
        weeklyActivitySourceSubjects:item.weekly.slice(),
        note:item.note
      };
    });
  }
  function getCoverage() {
    return LEVELS.map(function (level) {
      return {
        level:level,
        subjects:SUBJECTS.map(function (subject) { return resolve(subject.id, level); })
      };
    });
  }
  var api = Object.freeze({
    version:"0.2.0-15-box-non-activating",
    activeSelectorChanged:false,
    levels:LEVELS.slice(),
    worksheetEngineLevels:LEVELS.slice(),
    subjectBoxes:getSubjectBoxes(),
    getSubjectBoxes:getSubjectBoxes,
    resolve:resolve,
    getCoverage:getCoverage
  });
  global.PacEduFijiSubjectMapping = api;
  global.PacEduFijiNineSubjectMapping = api; // compatibility alias for existing callers
})(window);
