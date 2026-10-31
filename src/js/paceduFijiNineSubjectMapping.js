/* PacEdu Fiji nine-box subject mapping — non-activating pilot registry.
 * Maps the nine requested workspace boxes to existing content engines without
 * changing the active subject selector. Missing content and level gaps remain
 * explicit; this registry does not certify Ministry syllabus alignment.
 */
(function (global) {
  "use strict";
  var LEVELS = ["ECE"];
  for (var c = 1; c <= 8; c += 1) LEVELS.push("Class " + c);
  for (var f = 1; f <= 7; f += 1) LEVELS.push("Form " + f);

  var SUBJECTS = [
    { id:"English", label:"English", worksheet:["English"], weekly:["English"], status:"mapped", note:"Existing English content is available as pilot practice." },
    { id:"Mathematics", label:"Mathematics", worksheet:["Mathematics"], weekly:["Mathematics"], status:"mapped", note:"Existing Mathematics content is available as pilot practice." },
    { id:"Phonics", label:"Phonics", worksheet:["English"], weekly:["English"], status:"partial", note:"Uses the English engine as a temporary source only; a distinct phonics progression, sound sequence and phonics-specific worksheets are still required." },
    { id:"Science", label:"Science", worksheet:["Science"], weekly:["Science"], status:"partial", note:"Existing Science practice is generic. Keep the requested Fiji split visible: Basic Science for Classes 1–8 and Forms 3–4; Biology/Chemistry for Forms 5–7 requires separate verified mapping and content." },
    { id:"Social Science", label:"Social Science", worksheet:["Social Studies"], weekly:["Social Studies"], status:"mapped", note:"Social Studies is the current source label; preserve its existing content under the Social Science box." },
    { id:"Health", label:"Health", worksheet:["Healthy Living","Physical Education"], weekly:["Healthy Living","Physical Education"], status:"mapped", note:"Healthy Living is the core source; Physical Education is retained as related health-and-movement content." },
    { id:"Agriculture", label:"Agriculture", worksheet:[], weekly:[], status:"missing", note:"No Agriculture-specific worksheet or weekly-activity engine exists yet. Do not substitute unrelated Science or English work." },
    { id:"Arts", label:"Arts", worksheet:["Arts and Crafts","Music"], weekly:["Arts and Crafts","Music"], status:"mapped", note:"Arts and Crafts and Music remain distinct source strands inside the single Arts workspace box." },
    { id:"Technology", label:"Technology", worksheet:["Digital Literacy"], weekly:["Digital Literacy"], status:"partial", note:"Digital Literacy is available; practical/basic technology, design, tools, materials and making content still needs its own verified mapping." }
  ];

  var WORKSHEET_LEVELS = ["ECE"];
  for (var wc = 1; wc <= 8; wc += 1) WORKSHEET_LEVELS.push("Class " + wc);
  for (var wf = 3; wf <= 7; wf += 1) WORKSHEET_LEVELS.push("Form " + wf);

  function findSubject(id) {
    var key = String(id || "").trim().toLowerCase();
    return SUBJECTS.filter(function (item) {
      return item.id.toLowerCase() === key || item.label.toLowerCase() === key;
    })[0] || null;
  }
  function levelSupport(level) {
    return {
      level: level,
      worksheetEngine: WORKSHEET_LEVELS.indexOf(level) >= 0,
      weeklyActivityEngine: WORKSHEET_LEVELS.indexOf(level) >= 0,
      status: WORKSHEET_LEVELS.indexOf(level) >= 0 ? "LEVEL_ENGINE_AVAILABLE" : "LEVEL_NOT_SUPPORTED"
    };
  }
  function resolve(subjectId, level) {
    var subject = findSubject(subjectId);
    if (!subject) return { status:"SUBJECT_NOT_MAPPED", subject:subjectId || "", level:level || "" };
    var support = levelSupport(level);
    var status = subject.status;
    if (!support.worksheetEngine || !support.weeklyActivityEngine) status = "level-gap";
    return {
      subject:subject.id,
      label:subject.label,
      level:level,
      status:status,
      contentStatus:subject.status === "missing" ? "CONTENT_NOT_AVAILABLE" :
        (subject.status === "partial" ? "CONTENT_PARTIAL" : "CONTENT_AVAILABLE_DRAFT"),
      worksheetSourceSubjects:subject.worksheet.slice(),
      weeklyActivitySourceSubjects:subject.weekly.slice(),
      levelSupport:support,
      note:subject.note,
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
  global.PacEduFijiNineSubjectMapping = Object.freeze({
    version:"0.1.0-non-activating",
    activeSelectorChanged:false,
    levels:LEVELS.slice(),
    worksheetEngineLevels:WORKSHEET_LEVELS.slice(),
    subjectBoxes:getSubjectBoxes(),
    getSubjectBoxes:getSubjectBoxes,
    resolve:resolve,
    getCoverage:getCoverage
  });
})(window);
