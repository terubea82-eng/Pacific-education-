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
    { id:"English", label:"English", worksheet:["English"], weekly:["English"], status:"mapped", note:"Existing English content is available as pilot practice; official outcome mapping remains required." },
    { id:"Mathematics", label:"Mathematics", worksheet:["Mathematics"], weekly:["Mathematics"], status:"mapped", note:"Existing Mathematics content is available as pilot practice; official outcome mapping remains required." },
    { id:"Phonics", label:"Phonics", worksheet:["English"], weekly:["English"], status:"partial", note:"English is only a temporary source. A distinct phonics progression, sound sequence and phonics-specific worksheets are still required." },
    { id:"Science", label:"Science", worksheet:["Science"], weekly:["Science"], status:"partial", note:"Existing Science practice is generic. Basic Science for Classes 1–8 and Forms 3–4, then separately verified Biology/Chemistry for Forms 5–7, still needs authoritative mapping." },
    { id:"Social Science", label:"Social Science", worksheet:["Social Studies"], weekly:["Social Studies"], status:"mapped", note:"Social Studies is the current source label and is retained inside the Social Science box; official outcomes still require verification." },
    { id:"Health", label:"Health", worksheet:["Healthy Living","Physical Education"], weekly:["Healthy Living","Physical Education"], status:"mapped", note:"Healthy Living is the core source; Physical Education remains a related strand inside the single Health box." },
    { id:"Agriculture", label:"Agriculture", worksheet:[], weekly:[], status:"missing", note:"No Agriculture-specific worksheet or weekly-activity engine exists yet. Do not substitute unrelated Science or English work." },
    { id:"Arts", label:"Arts", worksheet:["Arts and Crafts","Music"], weekly:["Arts and Crafts","Music"], status:"mapped", note:"Arts and Crafts and Music remain separate strands inside the single Arts box." },
    { id:"Technology", label:"Technology", worksheet:["Digital Literacy"], weekly:["Digital Literacy"], status:"partial", note:"Digital Literacy is available, but practical technology, design, tools, materials and making content still needs its own mapping." },
    { id:"Home Economics", label:"Home Economics", worksheet:[], weekly:[], status:"missing", note:"Home Economics-specific learning content and worksheets have not yet been built. No unrelated content will be substituted." },
    { id:"Computer Studies", label:"Computer Studies", worksheet:[], weekly:["Digital Literacy"], status:"partial", note:"Digital Literacy weekly activities are only a temporary related source; Computer Studies-specific progression, computing concepts and worksheets are still required." },
    { id:"Vosa Vakaviti (iTaukei)", label:"Vosa Vakaviti (iTaukei)", worksheet:[], weekly:["iTaukei Language"], status:"partial", note:"Teacher-verified iTaukei-language weekly examples exist, but a distinct Vosa Vakaviti worksheet progression and local-language review are still required." },
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
