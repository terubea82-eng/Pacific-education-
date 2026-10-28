/* PacEdu shared daily marking-criteria engine.
 * Draft rubrics are generated from task/subject context; they are not official Ministry
 * marking schemes. Only verified objective keys may be auto-scored. Open responses,
 * oral/performance/practical work and unclear keys stay for teacher review.
 */
(function (global) {
  "use strict";
  var VERSION = "1.0.0";
  var ABILITIES = {
    support: {label:"Supported start", focus:"Recognise or demonstrate the core idea with models, pictures, objects, read-aloud or worked steps.", prompt:"Use a short step, visual cue, word bank or worked example; record the support used."},
    developing: {label:"Developing", focus:"Complete the core task with a model or limited prompt, then try independently.", prompt:"Give one planned prompt if needed; record whether the learner completes the next step independently."},
    expected: {label:"Working at class goal", focus:"Apply the taught learning independently in a familiar task.", prompt:"Score the stated success criteria and accept equivalent correct methods or wording where appropriate."},
    extension: {label:"Extension / deeper challenge", focus:"Transfer learning to a new situation, compare methods or justify a decision.", prompt:"Award extension marks only for the stated reasoning/transfer criterion, not for extra writing alone."}
  };
  var SUBJECTS = {
    "English": [
      ["Meaning / comprehension",35,"Answer is supported by the text, prompt or task."],
      ["Language / vocabulary",25,"Uses suitable words, sounds, grammar or sentence forms for the taught goal."],
      ["Evidence / communication",25,"Explains, reads, writes or speaks so the intended meaning is clear."],
      ["Conventions / revision",15,"Checks the relevant spelling, punctuation, presentation or correction target."]
    ],
    "Mathematics": [
      ["Concept and method",35,"Chooses a mathematically appropriate operation, representation or strategy."],
      ["Working and accuracy",35,"Shows correct steps, calculations, units or representations required by the task."],
      ["Reasoning / checking",20,"Explains or checks the result with a valid method."],
      ["Communication",10,"Uses clear mathematical symbols, labels and units where required."]
    ],
    "Science": [
      ["Scientific understanding",30,"Uses accurate concepts and vocabulary for the selected learning goal."],
      ["Method / practical skill",25,"Follows a safe, suitable method and identifies variables or materials where relevant."],
      ["Evidence and interpretation",30,"Records observations/data accurately and draws a conclusion supported by evidence."],
      ["Scientific communication",15,"Explains the result with suitable terms, tables, diagrams or labels."]
    ],
    "Social Studies": [
      ["Knowledge and concepts",30,"Identifies relevant people, places, events, systems or concepts accurately."],
      ["Use of sources / examples",25,"Uses relevant information, examples, maps, timelines or source evidence."],
      ["Explanation and reasoning",30,"Explains relationships, causes, effects, similarities, differences or civic choices."],
      ["Communication",15,"Organises ideas and uses suitable vocabulary, labels or evidence."]
    ],
    "Healthy Living": [
      ["Understanding",30,"Identifies relevant health, safety, wellbeing or relationship knowledge."],
      ["Safe application",30,"Chooses a safe, practical action for the stated context."],
      ["Reasoning / decision",25,"Gives a sensible reason or explains possible consequences."],
      ["Communication / reflection",15,"Communicates the decision and reflects respectfully where relevant."]
    ],
    "Physical Education": [
      ["Skill execution",35,"Demonstrates the taught movement or skill using the task-specific checklist."],
      ["Control and participation",25,"Shows coordination, effort and participation appropriate to the activity."],
      ["Safety and teamwork",25,"Follows safety rules, space awareness and fair-play expectations."],
      ["Reflection / improvement",15,"Identifies one strength or next step using observed evidence."]
    ],
    "Arts and Crafts": [
      ["Idea and planning",20,"Shows an idea, plan or purposeful choice related to the task."],
      ["Technique and process",30,"Uses materials and techniques safely and appropriately."],
      ["Creation / expression",30,"Communicates an idea or purpose through the created work."],
      ["Reflection and care",20,"Explains a choice, reviews the work and handles materials responsibly."]
    ],
    "Music": [
      ["Listening / recognition",25,"Recognises the target sound, pattern, element or musical instruction."],
      ["Performance / participation",35,"Performs, sings, plays or moves in line with the taught task."],
      ["Timing / expression",20,"Shows suitable pulse, rhythm, pitch, dynamics or expression for the activity."],
      ["Reflection / collaboration",20,"Listens, works respectfully with others and identifies a next step."]
    ],
    "Digital Literacy": [
      ["Concept and tool choice",25,"Identifies the relevant digital concept or selects an appropriate tool."],
      ["Practical process",35,"Completes the steps in the required order and handles devices safely."],
      ["Problem solving",25,"Checks a result, identifies an issue or chooses a sensible next step."],
      ["Digital safety / communication",15,"Protects private information and communicates or saves work appropriately."]
    ],
    "iTaukei Language": [
      ["Meaning / comprehension",30,"Understands the spoken or written message relevant to the task."],
      ["Language accuracy",30,"Uses appropriate vocabulary, sounds, grammar or language structures for the level."],
      ["Oral / written communication",25,"Communicates the intended meaning clearly in the required mode."],
      ["Cultural / task context",15,"Uses respectful, context-appropriate language and examples."]
    ],
    "Hindi": [
      ["Meaning / comprehension",30,"Understands the spoken or written message relevant to the task."],
      ["Language accuracy",30,"Uses appropriate vocabulary, script, grammar or language structures for the level."],
      ["Oral / written communication",25,"Communicates the intended meaning clearly in the required mode."],
      ["Context / conventions",15,"Uses suitable conventions and context-appropriate examples for the task."]
    ]
  };
  var DEFAULT_CRITERIA = [
    ["Knowledge / understanding",30,"Shows accurate understanding of the selected learning goal."],
    ["Application / task skill",30,"Applies the skill or concept to the task."],
    ["Evidence / reasoning",25,"Uses relevant evidence, a valid explanation or an appropriate method."],
    ["Communication / checking",15,"Presents, labels, explains or checks work as required."]
  ];
  function text(v) { return String(v == null ? "" : v).trim(); }
  function clamp(n,min,max) { return Math.max(min,Math.min(max,n)); }
  function normalizeTerm(value) {
    var v=text(value).toLowerCase().replace(/\s+/g,"");
    if(v==="t1"||v==="term1")return "T1";
    if(v==="t2"||v==="term2")return "T2";
    if(v==="t3"||v==="term3")return "T3";
    return text(value)||"T1";
  }
  function levelStage(level) {
    if (level === "ECE") return "early-years";
    var m = text(level).match(/(Class|Form)\s+(\d+)/i);
    if (!m) return "class-level";
    var n = Number(m[2]);
    return m[1].toLowerCase() === "class" ? (n <= 2 ? "foundation-primary" : n <= 5 ? "middle-primary" : "upper-primary") : (n <= 4 ? "junior-secondary" : "senior-secondary");
  }
  function questionText(q) { return text(q && (q.prompt || q.question || q.text || q.title)) || "Complete the linked worksheet task."; }
  function questionType(q) {
    var raw = text(q && (q.type || q.questionType)).toLowerCase();
    if (Array.isArray(q && q.options) && q.options.length) return /match/.test(raw) ? "matching" : "selected-response";
    if (/oral|speak|audio/.test(raw)) return "oral";
    if (/practical|performance|movement|experiment/.test(raw)) return "practical";
    if (/match/.test(raw)) return "matching";
    if (/true.?false/.test(raw)) return "true-false";
    if (/draw|create|art|music/.test(raw)) return "performance";
    return "constructed-response";
  }
  function criteriaFor(subject, level, ability) {
    var rows = SUBJECTS[subject] || DEFAULT_CRITERIA;
    var early = level === "ECE";
    return rows.map(function (r, i) {
      var weight = Number(r[1]);
      return {id:"C"+(i+1),name:r[0],weightPercent:weight,descriptor:r[2],
        observableEvidence: early ? "Observe play, talk, movement, choice or a practical demonstration; do not require long written responses." : "Use the learner's written, oral, practical or visual evidence appropriate to this task.",
        bandFocus: ABILITIES[ability].focus};
    });
  }
  function build(options) {
    options = options || {};
    var level = text(options.level) || "Class 1";
    var subject = text(options.subject) || "English";
    var ability = ABILITIES[options.ability] ? options.ability : "developing";
    var questions = Array.isArray(options.questions) ? options.questions : [];
    var keys = Array.isArray(options.answerKey) ? options.answerKey : [];
    var criteria = criteriaFor(subject, level, ability);
    var qCriteria = questions.map(function (q, i) {
      var type = questionType(q);
      var key = keys[i] || {};
      var keyValue = text(key.answer || key.correctAnswer || q.answer);
      var isPlaceholder = !keyValue || /teacher supplies|outcome-specific|requires|depends on|after source|not provided|review required/i.test(keyValue);
      var objective = (type === "selected-response" || type === "matching" || type === "true-false") && !isPlaceholder;
      return {
        questionNumber: Number(q.number) || i+1,
        questionId: text(q.id) || "Q"+(i+1),
        type: type,
        prompt: questionText(q),
        maxMarks: Number(q.maxMarks || q.marks) > 0 ? Number(q.maxMarks || q.marks) : (type === "constructed-response" || type === "practical" || type === "performance" ? 3 : 1),
        scoringMode: objective ? "AUTO_SCORE_ELIGIBLE_AFTER_KEY_VALIDATION" : "TEACHER_REVIEW_REQUIRED",
        keyStatus: objective ? "KEY_PRESENT_REQUIRES_ITEM_VALIDATION" : "MISSING_OR_NON_OBJECTIVE_KEY",
        criteria: type === "constructed-response" || type === "practical" || type === "performance" || type === "oral" ?
          ["Accuracy against the task outcome","Evidence / method / skill shown","Explanation, communication or reflection"].map(function (name,j) {return {name:name,marks:j===0?2:1,descriptor:j===0?"Meets the question's stated outcome.":j===1?"Shows relevant steps, evidence, skill or method.":"Communicates or reflects at the level required."};}) :
          [{name:"Correct response",marks:Number(q.maxMarks || q.marks)>0?Number(q.maxMarks||q.marks):1,descriptor:"Matches the validated answer key or accepted alternative."}],
        teacherNote: objective ? "Validate options, answer key and distractors before enabling automated scoring." : "Do not auto-score from a guessed key. Apply the rubric and record feedback; ambiguous answers may receive appropriate partial credit."
      };
    });
    var maxMarks = qCriteria.reduce(function (sum,q) { return sum + q.maxMarks; },0);
    var familyParts=[text(options.country)||"Fiji",text(options.curriculumVersion)||"NOT_CONFIRMED",level,subject,normalizeTerm(options.term),ability];
    var familyId="PACEDU-CRITERIA-FAMILY-"+familyParts.join("-").replace(/[^A-Z0-9-]/gi,"-").toUpperCase();
    return {
      schemaVersion:VERSION,
      criteriaId:"PACEDU-RUBRIC-"+[text(options.country)||"COUNTRY",text(options.level)||"LEVEL",text(options.subject)||"SUBJECT",normalizeTerm(options.term),text(options.week)||"WEEK",text(options.day)||"DAY",ability,text(options.activityId)||"ACTIVITY"].join("-").replace(/[^A-Z0-9-]/gi,"-").toUpperCase(),
      criteriaFamilyId:familyId,
      status:"DRAFT_REQUIRES_TEACHER_REVIEW",
      country:text(options.country)||"Fiji",
      curriculumVersion:text(options.curriculumVersion)||"NOT_CONFIRMED",
      level:level,stage:levelStage(level),subject:subject,term:normalizeTerm(options.term),
      week:Number(options.week)||null,day:Number(options.day)||null,
      activityId:text(options.activityId)||null,achievementIndicator:text(options.achievementIndicator)||null,
      curriculumMappingStatus:text(options.curriculumMappingStatus)||"NOT_YET_MAPPED",
      ability:ability,abilityLabel:ABILITIES[ability].label,abilityGuidance:ABILITIES[ability].prompt,
      criteria:criteria,questionCriteria:qCriteria,totalMarks:maxMarks,
      feedbackRules:[
        "Name one demonstrated success using evidence from this task.",
        "Name one next step linked to a criterion, not a judgement about the learner.",
        "Offer a matched revision activity for each criterion not yet demonstrated.",
        "Record support or accessibility adjustments used; do not count missing work as zero without the school's approved rule."
      ],
      progression:{rule:"Use this activity as one piece of evidence only. Do not change a learner's ability group from one worksheet alone.",bands:[
        {id:"support",label:"Supported start",guide:"Re-teach the prerequisite with concrete examples and guided practice."},
        {id:"developing",label:"Developing",guide:"Repeat the core skill with a model and then a new independent item."},
        {id:"expected",label:"Working at class goal",guide:"Practise transfer to a fresh task and maintain spaced revision."},
        {id:"extension",label:"Extension / deeper challenge",guide:"Use unfamiliar applications, justification or comparison while checking core accuracy."}
      ]},
      links:{criteriaFamilyId:familyId,dailyWorksheet:{activityId:text(options.activityId)||null,criteriaId:null},revisionPaper:{criteriaFamilyId:familyId,status:"USE_SAME_INDICATOR_MAP_AND_CRITERIA_VERSION"},examPaper:{criteriaFamilyId:familyId,status:"USE_TERM_COVERAGE_MAP_AND_TEACHER-APPROVED_MARK_SCHEME"}},
      warning:"Suggested marking framework only, not an official Ministry rubric. Verify the current syllabus outcome and the actual question/answer key before use. Open-ended, oral, creative, practical and performance responses require teacher review."
    };
  }
  function attach(resource, kind) {
    if (!resource || typeof resource !== "object") return resource;
    var opts = {
      country:resource.country || (resource.curriculumSchedule && resource.curriculumSchedule.country) || "Fiji",
      curriculumVersion:resource.curriculumVersion || "",
      level:resource.level || resource.classLevel,
      subject:resource.subject,
      term:resource.term || (resource.curriculumSchedule && resource.curriculumSchedule.term),
      week:resource.week || (resource.curriculumSchedule && resource.curriculumSchedule.week),
      day:resource.day || (resource.curriculumSchedule && resource.curriculumSchedule.day),
      ability:resource.ability,
      activityId:resource.activityId || (resource.dailyLesson && resource.dailyLesson.activityId) || (kind+"-"+(resource.term||"term")+"-"+(resource.week||"week")+"-"+(resource.day||"day")+"-"+(resource.level||"level")+"-"+(resource.subject||"subject")+"-"+(resource.ability||"developing")),
      achievementIndicator:resource.achievementIndicator || (resource.curriculumSchedule && resource.curriculumSchedule.achievementIndicator) || (resource.dailyLesson && resource.dailyLesson.curriculumAlignment && resource.dailyLesson.curriculumAlignment.candidateIndicator && resource.dailyLesson.curriculumAlignment.candidateIndicator.text),
      curriculumMappingStatus:resource.curriculumMappingStatus || (resource.curriculumSchedule && resource.curriculumSchedule.verificationStatus) || resource.status,
      questions:resource.questions || [],
      answerKey:resource.answerKey || []
    };
    var marking=build(opts);
    marking.links.dailyWorksheet.activityId = opts.activityId;
    marking.links.dailyWorksheet.criteriaId = marking.criteriaId;
    marking.links.revisionPaper.criteriaId = marking.criteriaId;
    marking.links.examPaper.criteriaId = marking.criteriaId;
    resource.markingCriteria = marking;
    resource.markingCriteriaId = marking.criteriaId;
    resource.markingStatus = marking.status;
    return resource;
  }
  function wrapApi(name, methods, kind) {
    var api=global[name];
    if(!api || api.__markingCriteriaWrapped) return;
    var copy={};Object.keys(api).forEach(function(k){copy[k]=api[k];});
    methods.forEach(function(method){
      if(typeof api[method]!=="function")return;
      var original=api[method];
      copy[method]=function(){
        var result=original.apply(api,arguments);
        if(!result || typeof result!=="object")return result;
        if(Array.isArray(result))return result.map(function(item){return attach(item,kind);});
        return attach(result,kind);
      };
    });
    copy.__markingCriteriaWrapped=true;
    global[name]=Object.freeze(copy);
  }
  function scoreObjective(response, item) {
    if(!item || !item.markingCriteria || !Array.isArray(item.markingCriteria.questionCriteria)) return {status:"REVIEW_REQUIRED",reason:"No generated marking criteria."};
    var q= item.markingCriteria.questionCriteria.filter(function(x){return x.questionNumber===Number(response && response.questionNumber);})[0];
    if(!q || q.scoringMode!=="AUTO_SCORE_ELIGIBLE_AFTER_KEY_VALIDATION") return {status:"TEACHER_REVIEW_REQUIRED",reason:"Question is not eligible for objective auto-scoring."};
    var key=(item.answerKey||[])[q.questionNumber-1]||{};
    var expected=text(key.answer || key.correctAnswer);
    if(!expected || /teacher supplies|outcome-specific|requires|depends on|after source|not provided|review required/i.test(expected)) return {status:"TEACHER_REVIEW_REQUIRED",reason:"Answer key is missing or a placeholder."};
    var actual=text(response && (response.answer!==undefined?response.answer:response.value));
    var correct=actual.toLowerCase()===expected.toLowerCase();
    return {status:"SUGGESTED_OBJECTIVE_MARK",correct:correct,marks:correct?q.maxMarks:0,maxMarks:q.maxMarks,questionNumber:q.questionNumber,criteriaId:item.markingCriteriaId,requiresTeacherApproval:true};
  }
  function install() {
    wrapApi("PacEduDailyWorksheetContent",["getWorksheet","getCurriculumWorksheet"],"daily");
    wrapApi("PacEduTermLearningPlan",["getRevisionPaper","getTermPlan"],"revision");
    wrapApi("PacEduPracticeExamPaper",["getPaper"],"exam");
    return !!(global.PacEduDailyWorksheetContent && global.PacEduTermLearningPlan && global.PacEduPracticeExamPaper);
  }
  function installPanel() {
    var doc=global.document;
    if(!doc || doc.getElementById("paceduDailyMarkingCriteriaPanel")) return;
    var host=doc.getElementById("paceduTeacherDailyLearningOnlyShell") || doc.getElementById("teacherDashboard");
    if(!host) return;
    function node(tag, value, parent) { var n=doc.createElement(tag); if(value!=null)n.textContent=value; if(parent)parent.appendChild(n); return n; }
    function select(labelText,id,values,parent) {
      var label=node("label",labelText,parent);label.style.cssText="display:block;margin:8px 0;font-weight:600";
      var s=node("select",null,label);s.id=id;s.style.cssText="display:block;width:100%;min-height:42px;padding:8px;margin-top:4px;font:inherit";
      values.forEach(function(v){var o=node("option",v.label||v,s);o.value=v.value||v;});return s;
    }
    var panel=node("section",null,host);panel.id="paceduDailyMarkingCriteriaPanel";
    panel.style.cssText="margin:12px 0;padding:14px;border:1px solid #9ab8c7;border-radius:10px";
    node("h3","Daily Marking Criteria",panel);
    node("p","Generate a marking guide linked to the selected daily worksheet. The same criteria ID is attached to revision and practice-exam outputs. Draft criteria must be checked against the real task and approved syllabus outcome.",panel);
    var api=global.PacEduDailyWorksheetContent;
    var levels=(api&&api.levels||["ECE","Class 1","Class 2","Class 3","Class 4","Class 5","Class 6","Class 7","Class 8","Form 1","Form 2","Form 3","Form 4","Form 5","Form 6","Form 7"]).map(function(v){return {value:v,label:v};});
    var subjects=(api&&api.subjects||Object.keys(SUBJECTS)).map(function(v){return {value:v,label:v};});
    var lv=select("Class / level","paceduMarkingLevel",levels,panel);
    var sub=select("Subject","paceduMarkingSubject",subjects,panel);
    var ab=select("Ability group","paceduMarkingAbility",Object.keys(ABILITIES).map(function(k){return {value:k,label:ABILITIES[k].label};}),panel);
    var term=select("Term","paceduMarkingTerm",[{value:"T1",label:"Term 1"},{value:"T2",label:"Term 2"},{value:"T3",label:"Term 3"}],panel);
    var week=select("Week","paceduMarkingWeek",Array.from({length:9},function(_,i){return {value:String(i+1),label:"Week "+(i+1)};}),panel);
    var day=select("Day","paceduMarkingDay",Array.from({length:5},function(_,i){return {value:String(i+1),label:"Day "+(i+1)};}),panel);
    term.addEventListener("change",function(){
      var max=term.value==="T3"?5:9,old=Number(week.value)||1;week.textContent="";
      for(var i=1;i<=max;i++){var o=node("option","Week "+i,week);o.value=String(i);}
      week.value=String(Math.min(old,max));
    });
    var generate=node("button","Generate marking guide",panel);generate.type="button";generate.style.cssText="min-height:44px;padding:10px 14px;margin:8px 8px 8px 0;font:inherit;font-weight:700";
    var print=node("button","Print / Save as PDF",panel);print.type="button";print.style.cssText="min-height:44px;padding:10px 14px;margin:8px 0;font:inherit";
    var out=node("div",null,panel);out.id="paceduDailyMarkingCriteriaOutput";out.setAttribute("aria-live","polite");
    generate.addEventListener("click",function(){
      out.textContent="";
      var worksheetApi=global.PacEduDailyWorksheetContent;
      var opts={level:lv.value,subject:sub.value,term:term.value,week:Number(week.value),day:Number(day.value),ability:ab.value};
      var sheet=worksheetApi&&typeof worksheetApi.getCurriculumWorksheet==="function"?worksheetApi.getCurriculumWorksheet(opts):null;
      var rubric=sheet&&sheet.markingCriteria?sheet.markingCriteria:build(opts);
      node("h4",rubric.level+" · "+rubric.subject+" · "+rubric.term+" · Week "+(rubric.week||opts.week)+" Day "+(rubric.day||opts.day),out);
      node("p","Ability: "+rubric.abilityLabel+" — "+rubric.abilityGuidance,out);
      node("p","Criteria ID: "+rubric.criteriaId+" · Total marks: "+rubric.totalMarks+" · Status: "+rubric.status,out);
      node("p","Curriculum mapping: "+rubric.curriculumMappingStatus+". This is not an official Ministry marking scheme until verified.",out);
      node("h4","Marking criteria",out);
      rubric.criteria.forEach(function(c){node("p",c.name+" ("+c.weightPercent+"%): "+c.descriptor,out);});
      if(rubric.questionCriteria.length){
        node("h4","Question-by-question guide",out);
        rubric.questionCriteria.forEach(function(q){node("p","Q"+q.questionNumber+" ("+q.maxMarks+" mark"+(q.maxMarks===1?"":"s")+") — "+q.type+": "+q.prompt+" | "+q.scoringMode+". "+q.teacherNote,out);});
      } else node("p","No questions were returned for this selection. Review the worksheet source before using this guide.",out);
      node("h4","Feedback and revision",out);
      rubric.feedbackRules.forEach(function(rule){node("p","• "+rule,out);});
      node("p",rubric.warning,out);
      try{global.localStorage.setItem("pacEduLastGeneratedMarkingCriteria",JSON.stringify(rubric));}catch(e){}
    });
    print.addEventListener("click",function(){if(!out.textContent.trim())generate.click();if(typeof global.print==="function")global.print();});
  }
  global.PacEduDailyMarkingCriteria=Object.freeze({
    version:VERSION,abilities:ABILITIES,subjects:Object.keys(SUBJECTS),
    build:build,attach:attach,scoreObjective:scoreObjective,install:install,installPanel:installPanel,
    getCriteria:function(options){return build(options||{});}
  });
  if(global.document){
    if(global.document.readyState==="loading")global.document.addEventListener("DOMContentLoaded",function(){install();installPanel();});
    else {install();installPanel();}
    if(global.MutationObserver && global.document.body){var observer=new global.MutationObserver(function(){install();installPanel();});observer.observe(global.document.body,{childList:true,subtree:true});}
    if(typeof global.setInterval==="function"){var tries=0;var timer=global.setInterval(function(){tries++;install();installPanel();if((global.PacEduDailyWorksheetContent&&global.PacEduTermLearningPlan&&global.PacEduPracticeExamPaper&&global.document.getElementById("paceduDailyMarkingCriteriaPanel"))||tries>=40)global.clearInterval(timer);},100);}
  } else { install(); }
})(window);
