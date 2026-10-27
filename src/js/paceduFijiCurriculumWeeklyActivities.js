/* PacEdu Fiji curriculum activity map — pilot framework.
 * Weekly distribution is configurable and is NOT a claim that every official
 * syllabus outcome has already been imported. Each activity must be linked to
 * the current Fiji Ministry syllabus, outcome/indicator and page before it is
 * labelled curriculum-verified. ECE is deliberately retained as the user-facing label.
 */
(function (global) {
  "use strict";
  var LEVELS = ["ECE"];
  for (var c = 1; c <= 8; c += 1) LEVELS.push("Class " + c);
  for (var f = 3; f <= 7; f += 1) LEVELS.push("Form " + f);
  var ABILITIES = [
    { id: "support", label: "Supported start", rule: "Model one example, reduce reading load, use concrete/picture cues and provide a sentence frame." },
    { id: "developing", label: "Developing", rule: "Give a short hint or word bank, then ask the learner to try independently." },
    { id: "expected", label: "Working at current class goal", rule: "Complete the core task independently and show the evidence or working." },
    { id: "extension", label: "Extension / deeper challenge", rule: "Add a new condition, compare methods, justify an answer or create a related example." }
  ];
  var SUBJECTS = [
    "English", "Mathematics", "Science", "Social Studies", "Healthy Living",
    "Physical Education", "Arts and Crafts", "Music", "Digital Literacy",
    "iTaukei Language", "Hindi"
  ];
  var WEEKS = [
    ["T1",1,"Getting to know ourselves and our learning","identity, baseline evidence and classroom routines"],
    ["T1",2,"Family, friends and belonging","describe, classify and communicate"],
    ["T1",3,"My school and shared spaces","objects, place, rules and responsibility"],
    ["T1",4,"Daily routines and time","sequence, order and time words"],
    ["T1",5,"Food, water and healthy choices","sort, compare and explain choices"],
    ["T1",6,"Weather and observations","observe, record and describe"],
    ["T1",7,"Plants, animals and living things","notice features, needs and differences"],
    ["T1",8,"Our community and helpers","roles, services and cooperation"],
    ["T1",9,"Patterns, shapes, numbers and Term 1 consolidation","identify, extend and explain patterns; review priority learning and evidence"],
    
    ["T2",1,"Stories and information texts","literal meaning, vocabulary and retelling"],
    ["T2",2,"Communication and instructions","listen/read, follow and give clear directions"],
    ["T2",3,"Materials and their uses","properties, grouping and safe use"],
    ["T2",4,"Number and practical problem solving","represent, calculate and check"],
    ["T2",5,"Land, sea and local environment","care, change and local observations"],
    ["T2",6,"Culture, language and respectful exchange","verified language examples and perspectives"],
    ["T2",7,"Movement, rhythm and creative expression","practise, repeat, perform and reflect"],
    ["T2",8,"Safety, wellbeing and help-seeking","recognise risk and choose safe actions"],
    ["T2",9,"Design, making, technology and Term 2 consolidation","plan, test, improve, explain and review priority learning"],
    ["T3",1,"Read, investigate and explain","use details or observations to support an answer"],
    ["T3",2,"Compare solutions and perspectives","similarities, differences and reasons"],
    ["T3",3,"Apply skills to a Fiji-life problem","choose a strategy and show working"],
    ["T3",4,"Create, present and communicate","organise ideas for a purpose and audience"],
    ["T3",5,"Pre-assessment consolidation","review priority outcomes and identify remaining gaps"],
    ["ASSESSMENT",1,"School-set assessment window","use the school's approved calendar and assessment rules"],
    ["INTERVENTION",1,"Targeted support cycle 1","reteach the highest-priority unmet learning outcome"],
    ["INTERVENTION",2,"Targeted support cycle 2","guided practice, feedback and retry"],
    ["INTERVENTION",3,"Targeted support cycle 3","repeat with a different example and check transfer"],
    ["INTERVENTION",4,"Targeted support cycle 4","small-group or individual practice based on evidence"],
    ["INTERVENTION",5,"Intervention progress check","compare fresh evidence with the initial baseline"],
    ["REVISION",1,"Cumulative revision 1","review core skills and common errors"],
    ["REVISION",2,"Cumulative revision 2","mixed practice, learner questions and exam routines"],
    ["EXAMS",1,"School-approved examination week 1","assess only taught outcomes and approved exam scope"],
    ["EXAMS",2,"School-approved examination week 2","complete remaining assessments and evidence records"]
  ];
  var SUBJECT_FOCUS = {
    "English": ["read/listen to a short, level-appropriate text; answer literal questions; retell or write a response", "use vocabulary in context, sequence ideas and support an answer with a text detail"],
    "Mathematics": ["use objects, drawings or numbers to solve a practical problem; show the method", "check the result another way and explain why the method fits"],
    "Science": ["observe a safe local example; record features or changes and ask a question", "make a prediction, compare observations and support a conclusion with evidence"],
    "Social Studies": ["identify a local place, role, rule or community need and describe it", "compare viewpoints or possible actions and explain a fair, practical choice"],
    "Healthy Living": ["identify or sequence a safe everyday routine and explain when it helps", "compare choices, recognise a risk and justify a realistic protective action"],
    "Physical Education": ["practise or adapt a movement skill safely; identify a rule and take turns", "review performance evidence and adapt the activity for safety and inclusion"],
    "Arts and Crafts": ["plan and make a simple piece using safe or reused materials; describe a feature", "test against a purpose, improve one feature and explain the design choice"],
    "Music": ["copy or create a rhythm/sound pattern and show where it repeats", "vary rhythm, tempo or dynamics and explain the effect"],
    "Digital Literacy": ["sort safe and private information; practise asking before opening unknown content", "check source, purpose and date; choose a safe response to a suspicious message"],
    "iTaukei Language": ["use teacher-verified local words/text for listening, matching and short response", "read or listen to a teacher-verified text and respond with suitable vocabulary"],
    "Hindi": ["use teacher-verified Hindi words/text for listening, matching and short response", "read or listen to a teacher-verified text and respond with suitable vocabulary"]
  };
  function levelStage(level) {
    if (level === "ECE") return "early";
    var n = Number(String(level).match(/\d+/));
    if (/^Class /.test(level)) return n <= 2 ? "foundation" : n <= 5 ? "middle" : "upper-primary";
    return n <= 4 ? "junior-secondary" : "senior-secondary";
  }
  function classExpectation(level, topic) {
    var stage = levelStage(level);
    if (stage === "early") return "Explore with play, talk, pictures, objects, movement and short guided choices; no long written worksheet.";
    if (stage === "foundation") return "Use short texts/instructions, concrete examples, basic vocabulary and brief written or spoken answers.";
    if (stage === "middle") return "Use connected paragraphs or multi-step working, relevant subject vocabulary and reasons.";
    if (stage === "upper-primary") return "Use longer texts or multi-step problems, evidence, organised explanations and independent checking.";
    if (stage === "junior-secondary") return "Apply subject concepts to unfamiliar examples, show method/evidence and explain relationships.";
    return "Analyse, evaluate and justify with accurate subject language, evidence, assumptions and limitations.";
  }
  function abilityTasks(subject, ability, core, level) {
    var band = ABILITIES.filter(function (x) { return x.id === ability; })[0] || ABILITIES[1];
    var task = core;
    if (ability === "support") task = "SUPPORTED: " + core + " Teacher models the first step; learner may use objects, picture cues, read-aloud, word bank or sentence frame.";
    if (ability === "developing") task = "DEVELOPING: " + core + " Offer one prompt if needed, then ask the learner to complete a similar item independently.";
    if (ability === "expected") task = "CORE: " + core + " Learner completes independently and checks the answer or working.";
    if (ability === "extension") task = "EXTENSION: " + core + " Add a changed condition or new example; ask the learner to compare options and justify the best answer.";
    return { band: band.label, adjustment: band.rule, task: task, expectation: classExpectation(level) };
  }
  function makeQuestions(subject, ability, week, level) {
    var stage = levelStage(level);
    var core = SUBJECT_FOCUS[subject] || SUBJECT_FOCUS.English;
    var topic = week.title;
    var prompts;
    if (subject === "English") {
      prompts = [
        {type:"multiple-choice", prompt:"Which detail from the text best supports the main idea about " + topic.toLowerCase() + "?"},
        {type:"matching", prompt:"Match two key words from the text to their meanings or examples."},
        {type:"true-false", prompt:"Decide whether this statement is true or false using the text: the main event or idea is connected to " + topic.toLowerCase() + "."},
        {type:"short-answer", prompt:"Answer who/what/where (or the suitable class-level question) and give one supporting detail."},
        {type:"writing", prompt:"Write, say, sign or select a short response explaining one idea from the text."}
      ];
    } else if (subject === "Mathematics") {
      prompts = [
        {type:"multiple-choice", prompt:"Choose the number, shape, measure or operation that best solves this week's practical problem."},
        {type:"matching", prompt:"Match each representation (objects, picture, number sentence or symbol) to its meaning."},
        {type:"true-false", prompt:"Check a worked example. Is the answer correct? Show how you checked."},
        {type:"short-answer", prompt:"Solve a new example using the same skill and show your working."},
        {type:"reasoning", prompt:"Explain or demonstrate why your method works; extension learners compare a second method."}
      ];
    } else {
      prompts = [
        {type:"multiple-choice", prompt:"Choose the response that best fits the week's " + topic.toLowerCase() + " learning task."},
        {type:"matching", prompt:"Match each key term, picture, step or example to the correct meaning or use."},
        {type:"true-false", prompt:"Judge a statement about the task. Correct it if it is false and show the evidence."},
        {type:"short-answer", prompt:"Give one accurate observation, example or explanation connected to the task."},
        {type:"application", prompt:"Apply the learning to a new Fiji-life example and explain your choice."}
      ];
    }
    if (stage === "early") prompts = [
      {type:"picture-choice",prompt:"Point to, say, sign or select the picture/object that fits " + topic.toLowerCase() + "."},
      {type:"matching",prompt:"Match two pictures, objects, sounds or actions that belong together."},
      {type:"oral-or-visual",prompt:"Show or tell one thing you noticed and how you know."}
    ];
    var count = ability === "support" ? 3 : ability === "developing" ? 4 : ability === "expected" ? 5 : 6;
    var out = [];
    for (var i = 0; i < count; i += 1) {
      var q = prompts[i % prompts.length];
      out.push({number:i+1,type:q.type,prompt:q.prompt,marking:"Mark against the verified lesson outcome; record independent / with support / not yet demonstrated / not observed."});
    }
    if (ability === "support") out[0].prompt += " Use a worked example or picture cue.";
    if (ability === "extension") out[out.length-1].prompt += " Give two reasons or create a harder example.";
    return out;
  }
  function getWeeklyActivity(options) {
    options = options || {};
    var level = LEVELS.indexOf(options.level) >= 0 ? options.level : "Class 1";
    var subject = SUBJECTS.indexOf(options.subject) >= 0 ? options.subject : "English";
    var term = String(options.term || "T1").toUpperCase();
    var weekNumber = Math.max(1, Number(options.week) || 1);
    var ability = ABILITIES.some(function (x) { return x.id === options.ability; }) ? options.ability : "developing";
    var week = WEEKS.filter(function (x) { return x[0] === term && x[1] === weekNumber; })[0];
    if (!week) return {status:"NOT_FOUND",message:"No week exists for this term/week selection. Choose a listed teaching, assessment, intervention, revision or exam block."};
    var item = {term:week[0],week:week[1],title:week[2],focus:week[3]};
    var core = (SUBJECT_FOCUS[subject] || SUBJECT_FOCUS.English)[0];
    return {
      status:"DRAFT_NEEDS_CURRICULUM_VERIFICATION",
      level:level, stage:levelStage(level), subject:subject, ability:ability,
      term:item.term, week:item.week, topic:item.title, focus:item.focus,
      learningTask:abilityTasks(subject,ability,core,level),
      questions:makeQuestions(subject,ability,item,level),
      lessonSequence:[
        "Introduce the week's focus with a familiar Fiji-life example and state the learning intention.",
        "Model one example; let learners practise with accessible materials or text.",
        "Learner completes the differentiated questions and shows working or evidence.",
        "Give specific feedback, allow a retry, and record the next learning step."
      ],
      teacherChecks:[
        "Attach the current Fiji Ministry syllabus title and version.",
        "Record the exact strand/sub-strand and achievement indicator/learning outcome.",
        "Confirm this week's task teaches that outcome and is suitable for this class.",
        "Review language accuracy, accessibility, answer key and assessment fairness before assigning."
      ],
      curriculumTrace:{country:"Fiji",officialSource:null,syllabusTitle:null,strand:null,indicator:null,pageOrSection:null,verificationStatus:"NOT_YET_MAPPED"},
      note:"This is a differentiated draft activity, not yet a complete official curriculum-aligned activity pack. Do not publish as verified until the curriculum trace is filled and teacher review passes."
    };
  }
  function installTeacherPanel() {
    var host = global.document && global.document.getElementById("paceduTeacherDailyLearningOnlyShell");
    if (!host || global.document.getElementById("paceduFijiWeeklyCurriculumPanel")) return;
    var doc = global.document;
    function el(tag, text, parent) { var n = doc.createElement(tag); if (text != null) n.textContent = text; if (parent) parent.appendChild(n); return n; }
    function select(label, id, options, parent) {
      var wrap = el("label", label, parent); wrap.style.cssText = "display:block;margin:8px 0;font-weight:600;";
      var s = el("select", null, wrap); s.id = id; s.style.cssText = "display:block;width:100%;min-height:42px;padding:8px;font:inherit;";
      options.forEach(function (o) { var opt = el("option", o.label, s); opt.value = o.value; });
      return s;
    }
    var panel = el("section", null, host); panel.id = "paceduFijiWeeklyCurriculumPanel";
    panel.setAttribute("aria-label","Fiji weekly differentiated activity preview");
    panel.style.cssText = "margin-top:16px;padding:14px;border:1px solid #c8d7e2;border-radius:10px;";
    el("h3","Fiji Weekly Activities — differentiated preview",panel);
    el("p","Choose class, subject, teaching block, week and learner ability to preview practical activities and questions. These are drafts until linked to the current official syllabus outcome and reviewed by the teacher.",panel);
    var level = select("Class / level","paceduFijiCurriculumLevel",LEVELS.map(function(x){return {value:x,label:x};}),panel);
    var subject = select("Subject","paceduFijiCurriculumSubject",SUBJECTS.map(function(x){return {value:x,label:x};}),panel);
    var termOptions = ["T1","T2","T3","ASSESSMENT","INTERVENTION","REVISION","EXAMS"].map(function(x){return {value:x,label:x==="T1"?"Term 1":x==="T2"?"Term 2":x==="T3"?"Term 3":x==="ASSESSMENT"?"Assessment window":x==="INTERVENTION"?"Intervention":x==="REVISION"?"Revision":"Examinations"};});
    var term = select("Term / learning block","paceduFijiCurriculumTerm",termOptions,panel);
    var week = select("Week","paceduFijiCurriculumWeek",[],panel);
    var day = select("Teaching day","paceduFijiCurriculumDay",[1,2,3,4,5].map(function(x){return {value:String(x),label:"Day "+x};}),panel);
    var ability = select("Ability band","paceduFijiCurriculumAbility",ABILITIES.map(function(x){return {value:x.id,label:x.label};}),panel);
    function refreshWeeks() {
      week.textContent = "";
      WEEKS.filter(function(x){return x[0]===term.value;}).forEach(function(x){
        var opt=el("option","Week "+x[1]+" — "+x[2],week); opt.value=String(x[1]);
      });
    }
    term.addEventListener("change",refreshWeeks); refreshWeeks();
    var button = el("button","Preview weekly activity and questions",panel);
    button.type="button"; button.style.cssText="padding:11px 14px;margin:8px 0;font:inherit;font-weight:700;";
    var printButton = el("button","Print student worksheet",panel);
    printButton.type="button"; printButton.disabled=true;
    printButton.style.cssText="padding:11px 14px;margin:8px 0;font:inherit;font-weight:700;";
    var output = el("div",null,panel); output.id="paceduFijiWeeklyCurriculumPreview"; output.setAttribute("aria-live","polite");
    button.textContent="Preview daily worksheet";
    button.addEventListener("click",function(){
      output.textContent="";
      var dailyApi=global.PacEduDailyWorksheetContent;
      var daily=dailyApi && typeof dailyApi.getCurriculumWorksheet==="function"
        ? dailyApi.getCurriculumWorksheet({level:level.value,subject:subject.value,term:term.value,week:week.value,day:day.value,ability:ability.value})
        : null;
      if(daily && daily.status==="NOT_FOUND"){el("p",daily.message,output);return;}
      if(daily){
        el("h4",daily.title,output);
        el("p","Curriculum theme: "+daily.curriculumSchedule.teachingTheme,output);
        el("p","Practice example: "+daily.readingText,output);
        if (daily.dailyLesson) {
          el("h4","Step-by-step lesson: see, read and hear",output);
          el("p","Learning intention: "+daily.dailyLesson.learningIntention,output);
          el("p",level.value+" learning target: "+daily.dailyLesson.classLevelObjective,output);
          el("p","Concept: "+daily.dailyLesson.learningConcept,output);
          el("h5","Video storyboard and learner steps",output);
          var lessonSteps=el("ol",null,output);
          daily.dailyLesson.steps.forEach(function(step){
            var li=el("li",null,lessonSteps);
            el("strong",step.mode+": ",li);
            el("span",step.onScreen+" Learner: "+step.learnerAction,li);
            el("p","Narration: "+step.narration,li);
          });
          el("h5","Read-along text and worked example",output);
          el("p",daily.dailyLesson.learnerText.passage,output);
          el("p","Worked example: "+daily.dailyLesson.workedExample,output);
          el("h5","Audio narration transcript",output);
          el("p",daily.dailyLesson.audioNarration.transcript,output);
          var listenButton=el("button","▶ Listen to lesson",output);
          listenButton.type="button";
          listenButton.style.cssText="padding:10px 14px;margin:6px 6px 6px 0;font:inherit;font-weight:700;";
          listenButton.addEventListener("click",function(){
            if(global.PacificEducationSpeech && typeof global.PacificEducationSpeech.speakText==="function"){
              global.PacificEducationSpeech.speakText(daily.dailyLesson.audioNarration.transcript,{allowRepeat:true});
            } else {
              el("p","PacEdu narrator is not available in this browser. Use the displayed narration transcript or ask the teacher to read it aloud.",output);
            }
          });
          var stopButton=el("button","Stop audio",output);
          stopButton.type="button";
          stopButton.style.cssText="padding:10px 14px;margin:6px;font:inherit;";
          stopButton.addEventListener("click",function(){
            if(global.PacificEducationSpeech && typeof global.PacificEducationSpeech.stopSpeech==="function") global.PacificEducationSpeech.stopSpeech();
          });
          el("p","Audio status: narration script prepared for the existing PacEdu narrator; this update does not create a rendered video or guarantee audio playback on every device.",output);
          el("h5","Curriculum alignment record",output);
          el("p","Draft concept: "+daily.dailyLesson.curriculumAlignment.draftConcept,output);
          el("p","Official achievement indicator: "+(daily.dailyLesson.curriculumAlignment.achievementIndicator || "NOT YET MAPPED — teacher must enter exact current official reference"),output);
          if (daily.dailyLesson.curriculumAlignment.candidateIndicator) {
            var candidate=daily.dailyLesson.curriculumAlignment.candidateIndicator;
            el("p","Candidate indicator for review only: "+candidate.id+" — "+candidate.text+" • strand: "+candidate.strand+" • source status: "+candidate.sourceStatus+". Not yet verified.",output);
          }
          el("p","Alignment status: "+daily.dailyLesson.curriculumAlignment.verificationStatus,output);
          var criteria=el("ul",null,output);
          daily.dailyLesson.successCriteria.forEach(function(c){el("li",c,criteria);});
        }
        el("p","Worked guidance: "+daily.answerKey[0].explanation,output);
        el("p",daily.instructions,output);
        el("h4","Student questions",output);
        var list=el("ol",null,output);
        daily.questions.forEach(function(q){
          var li=el("li",q.prompt,list);
          if(q.options.length){var opts=el("ul",null,li);q.options.forEach(function(v,i){el("li",String.fromCharCode(65+i)+". "+v,opts);});}
        });
        var guide=el("details",null,output);
        el("summary","Teacher answer key and curriculum check",guide);
        daily.answerKey.forEach(function(a){el("p",a.number+". "+a.answer+" — "+a.explanation,guide);});
        el("p",daily.teacherCheck,guide);
        el("p",daily.curriculumNote,guide);
        el("p",daily.sourceNote,guide);
        printButton.disabled=false;
        return;
      }
      var result=getWeeklyActivity({level:level.value,subject:subject.value,term:term.value,week:week.value,ability:ability.value});
      el("h4",result.topic || result.message || "Activity",output);
      if(result.status==="NOT_FOUND") return;
      el("p","Status: draft — official syllabus mapping still required.",output);
      el("p","Learning focus: "+result.focus,output);
      el("p","Learning task: "+result.learningTask.task,output);
      el("p","Class expectation: "+result.learningTask.expectation,output);
      el("h4","Student questions",output);
      var fallbackList=el("ol",null,output);
      result.questions.forEach(function(q){el("li",q.prompt+" ["+q.type+"]",fallbackList);});
      el("h4","Teacher verification before assigning",output);
      var checks=el("ul",null,output);
      result.teacherChecks.forEach(function(c){el("li",c,checks);});
      el("p",result.note,output);
      printButton.disabled=false;
    });
    printButton.addEventListener("click",function(){
      if(printButton.disabled || !output.firstChild) return;
      var style=el("style",null,doc.head);
      style.textContent='@media print{body.pacedu-print-daily-worksheet *{visibility:hidden!important}body.pacedu-print-daily-worksheet #paceduFijiWeeklyCurriculumPreview,body.pacedu-print-daily-worksheet #paceduFijiWeeklyCurriculumPreview *{visibility:visible!important}body.pacedu-print-daily-worksheet #paceduFijiWeeklyCurriculumPreview{position:absolute!important;left:0!important;top:0!important;width:100%!important;padding:0!important;margin:0!important;border:0!important;background:#fff!important;color:#111!important}body.pacedu-print-daily-worksheet #paceduFijiWeeklyCurriculumPreview details{display:none!important}body.pacedu-print-daily-worksheet #paceduFijiWeeklyCurriculumPanel button{display:none!important}}';
      doc.body.classList.add("pacedu-print-daily-worksheet");
      function cleanup(){doc.body.classList.remove("pacedu-print-daily-worksheet");if(style.parentNode)style.parentNode.removeChild(style);global.removeEventListener("afterprint",cleanup);}
      global.addEventListener("afterprint",cleanup);
      global.print();
    });
  }
  function observeTeacherPanel() {
    if (!global.document) return;
    installTeacherPanel();
    if (global.MutationObserver && global.document.body) {
      var observer = new global.MutationObserver(function(){ installTeacherPanel(); });
      observer.observe(global.document.body,{childList:true,subtree:true});
    }
  }
  if (global.document) {
    if (global.document.readyState === "loading") global.document.addEventListener("DOMContentLoaded",observeTeacherPanel);
    else observeTeacherPanel();
  }
  global.PacEduFijiCurriculumActivities = Object.freeze({
    version:"0.1.0-pilot-framework",
    levels:LEVELS.slice(), subjects:SUBJECTS.slice(),
    abilities:ABILITIES.map(function (x) { return {id:x.id,label:x.label}; }),
    weeklyDistribution:WEEKS.map(function (x) { return {term:x[0],week:x[1],topic:x[2],focus:x[3]}; }),
    getWeeklyActivity:getWeeklyActivity
  });
})(window);
