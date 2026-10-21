/* PacEdu English worksheet library and teacher preview/print panel.
 * Original pilot content: differentiated by demonstrated skill, not age alone.
 * Day 1 is diagnostic evidence gathering; Days 2–365 are practice sequences.
 * Curriculum source alignment and teacher approval remain pending until verified.
 */
(function (global, document) {
  "use strict";
  var LEVELS = ["ECE", "Kindergarten"];
  for (var i = 1; i <= 13; i += 1) LEVELS.push("Class " + i);
  var ABILITIES = [
    ["support", "Supported start"],
    ["developing", "Developing"],
    ["expected", "Working at current class goal"],
    ["extension", "Extension / deeper challenge"]
  ];
  var TOPICS = [
    "Greetings and introductions", "Sounds and letters", "Everyday words",
    "Sentence building", "People and community", "Instructions and sequence",
    "Describing words", "Reading for meaning", "Questions and answers",
    "Paragraph organisation", "Vocabulary in context", "Review and reflection"
  ];
  function clampDay(day) { return Math.max(1, Math.min(365, Math.floor(Number(day) || 1))); }
  function classNumber(level) {
    var s = String(level || "");
    if (/^ECE$/i.test(s)) return -1;
    if (/kindergarten/i.test(s)) return 0;
    var m = s.match(/(?:class|year)\s*(\d+)/i);
    return m ? Math.max(1, Math.min(13, Number(m[1]))) : 1;
  }
  function stageFor(n) {
    if (n <= 0) return "early";
    if (n <= 3) return "foundation";
    if (n <= 6) return "middle";
    if (n <= 9) return "junior-secondary";
    return "senior";
  }
  function topicFor(day) {
    return TOPICS[(Math.max(2, day) - 2) % TOPICS.length];
  }
  function passageFor(stage, topic, day) {
    var topicLabel = String(topic || "our learning").replace(/[<>]/g, "");
    if (stage === "early") return "A child sees " + (day % 2 ? "a red ball" : "a small cat") + ". The child points and says, “I can see it.” We take turns and listen.";
    if (stage === "foundation") return "Lani and Jo are learning about " + topicLabel.toLowerCase() + ". They read the words carefully. Jo asks a question, and Lani gives an answer. They check the sentence together.";
    if (stage === "middle") return "Our class explored " + topicLabel.toLowerCase() + " through a short activity. Each learner shared an observation and listened to another idea. The class compared details before writing a clear explanation. They reviewed their work and improved one sentence after feedback.";
    if (stage === "junior-secondary") return "A school group investigated " + topicLabel.toLowerCase() + " by gathering examples and comparing different viewpoints. The learners recorded the details that supported their conclusions, then discussed which evidence was most useful. They revised their first explanations when new information changed their understanding. Their final report distinguished observations from opinions.";
    return "A student team examined " + topicLabel.toLowerCase() + " and considered how language shapes the way readers understand an issue. They compared the author's central claim with the evidence provided, noting both useful details and unanswered questions. During peer review, the team identified an unsupported generalisation and replaced it with a more precise statement. Their final response explained the reasoning behind each revision and acknowledged an alternative interpretation.";
  }
  function dayOneAssessment(level) {
    var n = classNumber(level), stage = stageFor(n);
    var tasks;
    if (stage === "early") tasks = [
      "Listen to or view the teacher's prompt. Point, say, sign, select, or communicate a greeting.",
      "Match or identify familiar pictures/objects and name or indicate one.",
      "Notice a letter, symbol, or mark in a familiar word; attempt mark-making, tracing, or dictated writing.",
      "Listen to a short instruction and show what it asks you to do."
    ];
    else if (stage === "foundation") tasks = [
      "Identify or name letters you recognise. The teacher records which are independent and which need support.",
      "Read or match familiar words and pictures; try one unfamiliar simple word.",
      "Listen to or read a short 2–3 sentence passage, then answer one who/what question.",
      "Write, dictate, sign, or select a sentence about yourself or a familiar topic."
    ];
    else if (stage === "middle") tasks = [
      "Read a short passage supplied by the teacher and state its main idea.",
      "Answer one literal question and one question that asks you to infer a detail.",
      "Write 3–5 connected sentences on a familiar topic; punctuation and spelling are observed, not pre-scored.",
      "Identify a word whose meaning you can explain from context."
    ];
    else if (stage === "junior-secondary") tasks = [
      "Read a short age-appropriate passage and summarise its main point in your own words.",
      "Find evidence in the passage for one answer and make one reasonable inference.",
      "Write a structured paragraph with a clear main point and supporting detail.",
      "Edit a sample sentence for grammar, punctuation, and clarity; explain one choice."
    ];
    else tasks = [
      "Read an age-appropriate non-fiction or literary extract and summarise its central claim/theme.",
      "Identify a supporting detail and explain how it supports an interpretation.",
      "Write a structured paragraph with a claim, evidence, explanation, and appropriate register.",
      "Edit a short passage for clarity, cohesion, grammar, and punctuation; justify one revision."
    ];
    return {
      title: "Day 1 — English Initial Ability Check — " + level,
      topic: "Baseline observation (not a pass/fail exam)",
      instructions: "Teacher: use this short diagnostic to identify the learner's current demonstrated skills. Offer accessible response modes and record evidence, not assumptions. Do not assign a permanent level from one task. Mark each item: independent / with support / not yet demonstrated / not observed.",
      tasks: tasks,
      questionPlan: questionPlan,
      responseLines: 2,
      teacherCheck: "Record observed strengths, support used, items not observed, and the next teaching step. Missing or unclear evidence remains pending; do not infer mastery.",
      differentiationNote: "Use speech, sign, pointing, selection, drawing, tactile materials, large print, keyboard, or approved screen-reader/communication support as appropriate."
    };
  }
  function questionPlanFor(level, ability, topic) {
    var stage = stageFor(classNumber(level));
    var counts = {
      early: { support: 4, developing: 5, expected: 6, extension: 6 },
      foundation: { support: 5, developing: 6, expected: 8, extension: 9 },
      middle: { support: 6, developing: 8, expected: 10, extension: 12 },
      "junior-secondary": { support: 8, developing: 10, expected: 12, extension: 15 },
      senior: { support: 10, developing: 12, expected: 15, extension: 18 }
    };
    var t = String(topic || "").toLowerCase();
    var types;
    if (/sound|letter|phonics/.test(t)) {
      types = stage === "early"
        ? ["listen-and-identify", "picture-match", "oral-response", "letter-or-sound-choice"]
        : ["multiple-choice", "matching", "fill-in-the-blank", "read-aloud-or-decode", "short-answer"];
    } else if (/sentence|describing|grammar|paragraph|punctuation/.test(t)) {
      types = stage === "early"
        ? ["picture-choice", "sentence-frame", "oral-response", "sequence"]
        : ["multiple-choice", "fill-in-the-blank", "sentence-correction", "matching", "short-writing"];
    } else if (/reading|question|vocabulary|review/.test(t)) {
      types = stage === "early"
        ? ["listen-and-identify", "picture-choice", "sequence", "oral-response"]
        : ["multiple-choice", "short-answer", "sequence", "vocabulary-in-context", "evidence-or-inference"];
    } else {
      types = stage === "early"
        ? ["picture-choice", "matching", "oral-response", "sequence"]
        : ["multiple-choice", "matching", "fill-in-the-blank", "short-answer", "short-writing"];
    }
    if (stage === "junior-secondary" || stage === "senior") {
      types = types.concat(["evidence-or-inference", "editing", "extended-response"]);
    }
    var count = counts[stage][ability] || counts.foundation.developing;
    var questions = [];
    if (stage !== "early") types = types.concat(["cause-and-effect", "prediction", "compare-and-choose"]);
    if (stage === "junior-secondary" || stage === "senior") types = types.concat(["decision-and-justify", "source-check"]);
    var prompts = {
      "listen-and-identify": ["Listen. Which sound or word did you hear?", "Listen again. What clue helped you choose?"],
      "picture-match": ["Match the word to the picture that fits best.", "What detail shows that your match is correct?"],
      "picture-choice": ["Which picture best fits the prompt? What helped you decide?", "Choose the picture that does not fit. Explain with a word, sign, or point."],
      "oral-response": ["Tell, sign, point to, or select one answer. How do you know?", "Give one reason for your choice in a way that works for you."],
      "letter-or-sound-choice": ["Which letter or sound matches the example?", "Which other word starts or ends with the same sound?"],
      "multiple-choice": ["Choose the best answer. Which clue makes it the best choice?", "Which option is correct, and why are one or two other options less suitable?"],
      "matching": ["Match each item to its best partner. Explain one match.", "Find a pair that belongs together. What is the link?"],
      "fill-in-the-blank": ["Complete the sentence so the meaning is clear.", "Choose a word that fits. How would the meaning change with a different word?"],
      "read-aloud-or-decode": ["Read, listen to, or decode the word or sentence. What clue helped?", "Try the word in the sentence. Does it make sense? Explain or show why."],
      "short-answer": ["What is the key idea? Give one detail that supports your answer.", "What can you work out from the information? Point to a clue."],
      "sentence-correction": ["Correct the sentence so the reader understands it.", "Make the sentence clearer. Explain or show what you changed and why."],
      "short-writing": ["Write one clear sentence to explain your idea.", "Write a sentence that gives a reason or solves the problem in the prompt."],
      "sequence": ["Put the steps or events in order. What would go wrong if the order changed?", "What should happen next? Give a clue that supports your choice."],
      "vocabulary-in-context": ["What does the word most likely mean here? Which nearby clue helps?", "Choose a similar word. Would it keep the same meaning in this sentence?"],
      "evidence-or-inference": ["What can you infer? Give the exact detail that helped you decide.", "Which detail best supports your idea? Explain why another detail is weaker."],
      "editing": ["Find and fix an error that affects meaning.", "Improve the sentence. Which change makes it clearer for the reader?"],
      "extended-response": ["Explain your view with a reason and an example.", "Consider another view. Which idea is stronger, and what evidence supports it?"],
      "cause-and-effect": ["What caused this? Which detail tells you?", "What may happen because of this action? Explain the link."],
      "prediction": ["What do you think will happen next? Give one clue.", "If one detail changed, how might the outcome change?"],
      "compare-and-choose": ["Compare the two choices. Which fits the goal better, and why?", "What is one important difference? How does it affect your choice?"],
      "decision-and-justify": ["Choose the best action for this situation. Give two reasons and consider one risk.", "Which solution is fairest or most useful? Support your choice with evidence."],
      "source-check": ["Who created this message, and what might they want the reader to do?", "What information would you check before trusting this claim? Name a useful source."]
    };
    var questions = [];
    for (var i = 0; i < count; i += 1) {
      var type = types[i % types.length];
      var variants = prompts[type] || prompts["short-answer"];
      var prompt = variants[Math.floor(i / types.length) % variants.length];
      if (stage === "early") {
        prompt = prompt.replace(/Explain with a word, sign, or point\./g, "Show your choice by speaking, signing, pointing, or selecting.")
          .replace(/Give two reasons and consider one risk\./g, "Give one reason using words, signs, pictures, or choices.");
      }
      questions.push({ number: i + 1, type: type, prompt: prompt, topic: topic, thinkingFocus: /cause|prediction/.test(type) ? "predict-and-explain" : /compare|decision|source/.test(type) ? "reason-and-judge" : /evidence|inference|short-answer/.test(type) ? "use-clues" : "apply-and-check" });
    }
    return { count: count, types: types.slice(), questions: questions,
      note: "Question types are a starting plan based on class stage and topic. Teacher must match them to the verified daily Fiji English achievement indicator before use." };
  }
  function makeWorksheet(level, ability, day) {
    level = LEVELS.indexOf(String(level)) >= 0 ? String(level) : "Class 1";
    ability = ABILITIES.some(function (a) { return a[0] === ability; }) ? ability : "developing";
    day = clampDay(day);
    if (day === 1) {
      var baseline = dayOneAssessment(level);
      baseline.level = level; baseline.ability = "initial-assessment"; baseline.day = 1;
      baseline.status = "PENDING_TEACHER_REVIEW";
      baseline.sourceNote = "PacEdu original diagnostic template; verify against the current applicable curriculum. Not an official assessment or Ministry-approved instrument.";
      return baseline;
    }
    var n = classNumber(level), stage = stageFor(n), topic = topicFor(day), tasks = [];
    var questionPlan = questionPlanFor(level, ability, topic);
    var abilityPrefix = {
      support: "SUPPORTED START: use a teacher model, word bank, picture/object cue, sentence frame, or worked example. ",
      developing: "DEVELOPING: try independently first; use one hint or a word bank if needed. ",
      expected: "CLASS-GOAL PRACTICE: complete independently, then check your work against the success criteria. ",
      extension: "EXTENSION: complete the core task, then justify your choices, compare alternatives, or create a new example. "
    }[ability];
    if (stage === "early") {
      tasks = [
        abilityPrefix + "Look at or listen to the topic prompt: " + topic + ". Communicate one idea by speaking, signing, pointing, selecting, drawing, or using a communication aid.",
        "Match or identify two familiar pictures/objects/letters linked to the prompt. The teacher may read the choices aloud or provide tactile/large-print alternatives.",
        "Complete a short oral, signed, selected, or dictated frame: “I can ____.” or “I see ____.”",
        "Show one letter, mark, or word you noticed. No colour-only instructions."
      ];
    } else if (stage === "foundation") {
      tasks = [
        abilityPrefix + "Read, listen to, or view the prompt about “" + topic + "”.",
        "Complete two words or sentence frames using a word bank.",
        "Read or match a short 2–3 sentence text to a suitable picture/heading; answer who or what.",
        "Write, dictate, sign, or select one complete sentence and check its first letter and ending punctuation."
      ];
    } else if (stage === "middle") {
      tasks = [
        abilityPrefix + "Read the short passage supplied by the teacher about “" + topic + "” (3–5 sentences).",
        "Answer: (1) What is the main idea? (2) Which detail supports it? (3) What can you infer?",
        "Use two topic words in a connected 4–6 sentence response. Include a clear beginning and ending.",
        "Review spelling, capital letters, punctuation, and whether each sentence makes sense."
      ];
    } else if (stage === "junior-secondary") {
      tasks = [
        abilityPrefix + "Read the teacher-selected short text related to “" + topic + "”. Annotate or list its main idea and two supporting details.",
        "Answer one literal, one inferential, and one vocabulary-in-context question; cite words from the text for one answer.",
        "Write a focused paragraph (6–8 sentences) with a topic sentence, supporting evidence, and conclusion.",
        "Edit for sentence structure, agreement, punctuation, and precise vocabulary."
      ];
    } else {
      tasks = [
        abilityPrefix + "Read an age-appropriate text connected to “" + topic + "”. Identify purpose, audience, central idea/theme, and tone.",
        "Answer one analysis question with evidence, and explain an alternative interpretation or counterpoint.",
        "Write a structured response appropriate to the current class goal: claim/idea, evidence or example, explanation, and conclusion.",
        "Revise for cohesion, register, grammar, punctuation, and precise vocabulary; explain one revision."
      ];
    }
    return {
      title: "Day " + day + " — English Worksheet — " + level + " — " + labelAbility(ability),
      topic: topic,
      readingText: passageFor(stage, topic, day),
      level: level, ability: ability, day: day,
      instructions: "Student: try each task. You may answer in an accessible way agreed with your teacher. Ask for clarification if needed. This is practice, not a formal examination.",
      tasks: tasks,
      responseLines: stage === "early" ? 2 : stage === "foundation" ? 3 : stage === "middle" ? 5 : 7,
      teacherCheck: "Check the learning goal using the learner's actual response. Record: independent / with support / not yet demonstrated / not observed. Give feedback and a retry opportunity; do not mark missing evidence as mastery.",
      differentiationNote: "Support and extension are options based on demonstrated skill and current evidence, not a fixed label. Adjust text length, vocabulary, response mode, and time while preserving the learning goal.",
      status: "PENDING_TEACHER_REVIEW",
      sourceNote: "PacEdu original practice worksheet framework. Verify the exact class, term, learning outcome, and source against the current official curriculum before claiming formal alignment."
    };
  }
  function labelAbility(key) {
    var found = ABILITIES.filter(function (a) { return a[0] === key; })[0];
    return found ? found[1] : "Developing";
  }
  function node(tag, text, parent) {
    var el = document.createElement(tag);
    if (text != null) el.textContent = String(text);
    if (parent) parent.appendChild(el);
    return el;
  }
  function addSelect(parent, labelText, id, options, value) {
    var label = node("label", labelText, parent);
    label.style.cssText = "display:block;margin:8px 0;font-weight:600;";
    var select = node("select", null, label);
    select.id = id;
    select.style.cssText = "display:block;width:100%;min-height:42px;padding:8px;margin-top:4px;font:inherit;";
    options.forEach(function (option) {
      var el = node("option", option[1], select); el.value = option[0];
      if (option[0] === value) el.selected = true;
    });
    return select;
  }
  function addTeacherPanel(card) {
    if (!card || card.querySelector("#paceduEnglishWorksheetBuilder")) return;
    var panel = node("section", null, card);
    panel.id = "paceduEnglishWorksheetBuilder";
    panel.style.cssText = "margin-top:18px;padding:14px;border:2px solid #2563eb;border-radius:10px;";
    node("h3", "English Daily Worksheets — Preview Before Printing", panel);
    node("p", "Choose the class, learner's current demonstrated ability, and day. Day 1 opens the initial ability check; Day 2 onwards provides differentiated practice.", panel);
    var levelDefault = global.localStorage.getItem("pacificEducationLevel") || "Class 1";
    if (LEVELS.indexOf(levelDefault) < 0) levelDefault = "Class 1";
    var levelOptions = LEVELS.map(function (v) { return [v, v]; });
    var levelSelect = addSelect(panel, "Class / level", "paceduEnglishWorksheetLevel", levelOptions, levelDefault);
    var abilitySelect = addSelect(panel, "Ability (choose from observed evidence)", [["initial-assessment","Day 1 initial ability check"],["support","Supported start"],["developing","Developing"],["expected","Working at current class goal"],["extension","Extension / deeper challenge"]], "paceduEnglishWorksheetAbility", "developing");
    var dayLabel = node("label", "Teaching day (1–365)", panel);
    dayLabel.style.cssText = "display:block;margin:8px 0;font-weight:600;";
    var dayInput = node("input", null, dayLabel); dayInput.id = "paceduEnglishWorksheetDay"; dayInput.type = "number"; dayInput.min = "1"; dayInput.max = "365"; dayInput.step = "1";
    dayInput.value = String(Math.max(1, Math.min(365, Number(global.localStorage.getItem("currentDayNumber") || 1) || 1)));
    dayInput.style.cssText = "display:block;width:100%;box-sizing:border-box;min-height:42px;padding:8px;margin-top:4px;font:inherit;";
    var actions = node("div", null, panel); actions.style.cssText = "display:flex;gap:8px;flex-wrap:wrap;margin:12px 0;";
    var previewButton = node("button", "Preview Worksheet", actions); previewButton.type = "button"; previewButton.style.cssText = "padding:11px 14px;font-weight:700;";
    var printButton = node("button", "Print Student Worksheet", actions); printButton.type = "button"; printButton.disabled = true; printButton.style.cssText = "padding:11px 14px;font-weight:700;";
    var preview = node("section", null, panel); preview.id = "paceduEnglishWorksheetPreview"; preview.setAttribute("aria-live","polite");
    var studentSheet = null;
    function renderPreview() {
      var day = clampDay(dayInput.value);
      dayInput.value = String(day);
      var ability = day === 1 || abilitySelect.value === "initial-assessment" ? "initial-assessment" : abilitySelect.value;
      studentSheet = makeWorksheet(levelSelect.value, ability, day);
      preview.textContent = "";
      var sheet = node("article", null, preview); sheet.id = "paceduEnglishStudentPrintSheet"; sheet.className = "pacedu-print-student-sheet";
      sheet.style.cssText = "background:white;color:#111;padding:18px;border:1px solid #888;margin-top:12px;";
      node("h2", studentSheet.title, sheet);
      node("p", "Name: __________________________________    Date: __________________", sheet);
      node("p", "Topic: " + studentSheet.topic, sheet);
      if (studentSheet.readingText) {
        node("h3", "Read / listen to the passage", sheet);
        node("p", studentSheet.readingText, sheet).style.cssText = "padding:12px;border:1px solid #999;line-height:1.6;";
      }
      node("p", "Instructions: " + studentSheet.instructions, sheet);
      var list = node("ol", null, sheet);
      studentSheet.tasks.forEach(function (task) { node("li", task, list).style.marginBottom = "14px"; });
      if (studentSheet.questionPlan && studentSheet.questionPlan.questions) {
        node("h3", "Daily questions (" + studentSheet.questionPlan.count + ")", sheet);
        node("p", "Question types: " + studentSheet.questionPlan.types.join(", ").replace(/-/g, " "), sheet);
        var questions = node("ol", null, sheet);
        studentSheet.questionPlan.questions.forEach(function (question) {
          var item = node("li", question.prompt, questions);
          item.style.marginBottom = "10px";
          node("p", "Answer: __________________________________________________________", item);
        });
      }
      for (var i = 0; i < studentSheet.responseLines; i += 1) node("p", "________________________________________________________________", sheet).style.margin = "16px 0";
      node("p", "I tried the tasks:  □ Yes   □ I need help with: ______________________________", sheet);
      var guide = node("aside", null, preview); guide.id = "paceduEnglishTeacherGuide";
      guide.style.cssText = "margin-top:12px;padding:12px;background:#f3f4f6;color:#111;border-radius:6px;";
      node("h4", "Teacher review notes (not part of student printout)", guide);
      node("p", studentSheet.teacherCheck, guide);
      node("p", studentSheet.differentiationNote, guide);
      node("p", studentSheet.sourceNote + " Status: " + studentSheet.status + ".", guide);
      printButton.disabled = false;
    }
    previewButton.addEventListener("click", renderPreview);
    dayInput.addEventListener("change", function () {
      if (Number(dayInput.value) === 1) abilitySelect.value = "initial-assessment";
      else if (abilitySelect.value === "initial-assessment") abilitySelect.value = "developing";
    });
    printButton.addEventListener("click", function () {
      if (!studentSheet) renderPreview();
      if (!studentSheet || !global.print) return;
      var style = node("style", null, document.head);
      style.id = "paceduEnglishWorksheetPrintStyle";
      style.textContent = "@media print{body.pacedu-english-print *{visibility:hidden!important}body.pacedu-english-print #paceduEnglishStudentPrintSheet,body.pacedu-english-print #paceduEnglishStudentPrintSheet *{visibility:visible!important}body.pacedu-english-print #paceduEnglishStudentPrintSheet{position:absolute!important;left:0!important;top:0!important;width:100%!important;box-sizing:border-box!important;border:0!important;margin:0!important}body.pacedu-english-print #paceduEnglishTeacherGuide{display:none!important}}";
      document.body.classList.add("pacedu-english-print");
      function cleanup() {
        document.body.classList.remove("pacedu-english-print");
        if (style.parentNode) style.parentNode.removeChild(style);
        global.removeEventListener("afterprint", cleanup);
      }
      global.addEventListener("afterprint", cleanup);
      global.print();
    });
  }
  var original = global.PacificEducationRoleActivityPacks;
  if (original && typeof original.render === "function" && !original.englishWorksheetPreviewEnabled) {
    var enhanced = {};
    Object.keys(original).forEach(function (key) { enhanced[key] = original[key]; });
    enhanced.render = function (role, stepId, host, day) {
      var result = original.render(role, stepId, host, day);
      if (result && String(role || "").toLowerCase().replace(/_/g,"-") === "teacher" && stepId === "teacherDashboard") {
        addTeacherPanel(host && host.querySelector ? host.querySelector("#paceduRoleActivityPack") : null);
      }
      return result;
    };
    enhanced.englishWorksheetPreviewEnabled = true;
    global.PacificEducationRoleActivityPacks = Object.freeze(enhanced);
  }
  global.PacificEducationEnglishWorksheetLibrary = Object.freeze({
    version: "1.0.0",
    levels: LEVELS.slice(),
    abilities: ABILITIES.map(function (a) { return { id:a[0], label:a[1] }; }),
    getWorksheet: makeWorksheet,
    getQuestionPlan: questionPlanFor
  });
})(window, document);
