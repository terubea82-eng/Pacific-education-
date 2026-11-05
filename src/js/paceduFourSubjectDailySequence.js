/* PacEdu four-subject daily sequence planner.
 * Produces 45/45/25 planned teaching sessions for T1/T2/T3.
 * Original planning scaffold only: not official Fiji syllabus alignment and
 * not a substitute for a topic-specific passage/question bank.
 */
(function (global) {
  "use strict";
  var subjects = {
    "Phonics": {
      T1: ["listening for environmental sounds","recognising spoken words","hearing first sounds","hearing final sounds","hearing middle vowel sounds","matching sounds to letters","recognising taught letter forms","blending two-sound patterns","blending three-sound words"],
      T2: ["segmenting spoken words","matching phonemes and graphemes","short-vowel patterns","common consonant digraphs","initial consonant blends","final consonant blends","reading simple decodable words","spelling taught sound patterns","reading decodable phrases"],
      T3: ["reviewing taught sound correspondences","blending unfamiliar decodable words","segmenting words for spelling","reading connected decodable text","applying phonics independently"]
    },
    "Agriculture": {
      T1: ["recognising local food plants","identifying plant parts","observing plant needs","comparing healthy and unhealthy plants","identifying common garden tools","recognising soil types by observation","preparing a safe growing area","choosing suitable seeds or seedlings","planning a small garden bed"],
      T2: ["sowing seeds safely","transplanting seedlings","watering appropriately","observing germination","recording plant growth","identifying weeds without unsafe handling","mulching and conserving moisture","recognising common plant stress","caring for a school garden"],
      T3: ["identifying harvest readiness","harvesting with suitable tools and supervision","handling produce hygienically","sorting and storing produce","reviewing garden results and improvements"]
    },
    "Home Economics": {
      T1: ["identifying personal and kitchen hygiene","handwashing before food handling","recognising clean food-contact surfaces","identifying food groups using local examples","comparing everyday food choices","planning a simple balanced snack","measuring ingredients safely","recognising kitchen hazards","organising a safe work area"],
      T2: ["reading a simple recipe or procedure","sequencing food preparation steps","using utensils safely","preventing cross-contamination","storing food safely","planning a low-cost family meal","reducing food waste","managing water and energy carefully","cleaning and storing equipment"],
      T3: ["reviewing safe food preparation","adapting a snack to available ingredients","comparing cost and value","demonstrating a supervised practical task","evaluating hygiene, safety and the finished product"]
    },
    "Computer Studies": {
      T1: ["identifying computer system parts","distinguishing hardware and software","recognising input devices","recognising output devices","using a mouse or touch input","using a keyboard safely","opening and closing an approved application","recognising files and folders","following basic device-care routines"],
      T2: ["creating a clearly named file","saving work to an approved location","opening and locating saved work","organising files into folders","editing and correcting a document","using basic text formatting","recognising data and information","protecting passwords and private information","asking before opening unknown links or files"],
      T3: ["reviewing safe login and logout","retrieving and improving a saved file","organising a small digital project","checking information source and purpose","presenting a simple digital product responsibly"]
    }
  };
  var phases = [
    {name:"Explore", action:"Introduce the concept with a teacher model, real object, picture or safe local example."},
    {name:"Notice", action:"Identify key features and record what is seen, heard or demonstrated."},
    {name:"Practise", action:"Complete guided practice, then attempt a similar task independently."},
    {name:"Apply", action:"Use the concept in a new but familiar Fiji-life example or practical situation."},
    {name:"Show", action:"Demonstrate learning and explain, sign, point to or record evidence."}
  ];
  var ability = {
    support:"Model one step; use concrete objects, picture cues, read-aloud, communication supports and a short response.",
    developing:"Give one prompt or word bank, then invite an independent attempt.",
    expected:"Complete the core task independently and check the result.",
    extension:"Compare alternatives, solve a changed example and justify the choice."
  };
  function validLevel(level) {
    return level === "ECE" || /^Class [1-8]$/.test(level || "") || /^Form [3-7]$/.test(level || "");
  }
  function getDailyPlan(options) {
    options = options || {};
    var subject = String(options.subject || "");
    var term = String(options.term || "T1").toUpperCase();
    var week = Number(options.week), day = Number(options.day);
    var level = String(options.level || "Class 1");
    var band = String(options.ability || "developing");
    if (!subjects[subject] || !subjects[subject][term] || !validLevel(level) ||
        !Number.isInteger(week) || !Number.isInteger(day) || day < 1 || day > 5 ||
        week < 1 || week > (term === "T3" ? 5 : 9) ||
        !Object.prototype.hasOwnProperty.call(ability, band)) {
      return {status:"NOT_FOUND", message:"Choose a supported subject, level, ability, term, week and day."};
    }
    var unitIndex = week - 1;
    var concept = subjects[subject][term][unitIndex];
    var phase = phases[day - 1];
    var stage = level === "ECE" ? "early-years" : /^Class [1-2]$/.test(level) ? "foundation" :
      /^Class [3-5]$/.test(level) ? "middle-primary" : /^Class /.test(level) ? "upper-primary" :
      /^Form [3-4]$/.test(level) ? "junior-secondary" : "senior-secondary";
    var output = stage === "early-years" ? "Show, say, sign, select, move or draw; extended writing is not required." :
      stage === "foundation" ? "Use a short oral or written response with a model or concrete example." :
      stage === "middle-primary" ? "Record steps or observations and explain one reason." :
      stage === "upper-primary" ? "Work independently, record evidence and explain a practical choice." :
      stage === "junior-secondary" ? "Apply the concept, record a method and explain the result." :
      "Analyse the task, justify decisions and evaluate limitations or improvements.";
    return {
      status:"DRAFT_REQUIRES_TEACHER_AND_CURRICULUM_REVIEW",
      subject:subject, level:level, stage:stage, ability:band, abilitySupport:ability[band],
      term:term, week:week, day:day, dayNumber:(week - 1) * 5 + day,
      concept:concept, phase:phase.name, learningFocus:phase.action + " Focus: " + concept + ".",
      learnerOutput:output,
      evidence:"Teacher records independent / with support / not yet demonstrated / not observed, with one next step.",
      accessibility:"Accept suitable spoken, signed, tactile, object-based, picture, AAC, practical or written evidence. Describe images and materials aloud; provide large print/Braille or tactile alternatives where available.",
      curriculumAlignment:"NOT_YET_MAPPED",
      contentBoundary:"This is a daily teaching sequence scaffold. It does not create a topic-specific reading passage or four-question worksheet and is not an official Fiji Ministry syllabus mapping."
    };
  }
  function getTermPlan(options) {
    options = options || {};
    var term = String(options.term || "T1").toUpperCase();
    var weeks = term === "T3" ? 5 : (term === "T1" || term === "T2" ? 9 : 0);
    if (!weeks) return {status:"NOT_FOUND", days:[]};
    var days = [];
    for (var w = 1; w <= weeks; w += 1) {
      for (var d = 1; d <= 5; d += 1) {
        days.push(getDailyPlan({subject:options.subject,level:options.level,ability:options.ability,term:term,week:w,day:d}));
      }
    }
    return {status:"DRAFT_REQUIRES_TEACHER_AND_CURRICULUM_REVIEW", term:term, weeks:weeks, totalDays:days.length, days:days};
  }
  global.PacEduFourSubjectDailySequence = Object.freeze({
    subjects:Object.keys(subjects),
    terms:Object.freeze({T1:{weeks:9,days:45},T2:{weeks:9,days:45},T3:{weeks:5,days:25}}),
    getDailyPlan:getDailyPlan,
    getTermPlan:getTermPlan
  });
})(window);
