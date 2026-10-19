/* Pacific Education — practical role activities and Fiji curriculum-aware learner tasks.
 * Pilot-only activity content. Resource topics are used as reference evidence, not
 * represented as an official/current Ministry achievement-indicator mapping.
 * Responses are saved locally on this device; teacher/reviewer approval is not implied.
 */
(function (global, document) {
  "use strict";

  var STORAGE_KEY = "pacificEducationRoleActivityEvidenceV1";
  var FIJI_YEAR1_ENGLISH = [
    { unit: 1, topic: "Who am I?", focus: "personal introduction, familiar words, letter recognition and beginning sounds", goal: "Introduce yourself using a clear greeting and a complete sentence.", task: "Say, sign, select, or write a greeting. Complete: “Good morning. My name is ____.” Then choose one letter in your name and identify its sound or name.", check: "Can you introduce yourself and identify one letter in your name?", evidence: "Learner introduction and letter response" },
    { unit: 2, topic: "My Friends", focus: "describing people, familiar vocabulary and beginning sounds", goal: "Describe a friend respectfully using simple words.", task: "Think of a friend or use a fictional example. Write, say, sign, or select two describing words, such as kind, helpful, tall, or cheerful. Identify the first letter of one word.", check: "Can you give two describing words and identify a starting letter?", evidence: "Two describing words and one letter response" },
    { unit: 3, topic: "My School", focus: "school and classroom discussion, familiar words and beginning sounds", goal: "Name classroom objects and communicate a simple idea about school.", task: "Name or describe three classroom objects. Choose one and complete: “I use the ____ to ____.” You may draw the objects and label them.", check: "Can you name three objects and explain one use?", evidence: "Object names, labels, or spoken/visual response" },
    { unit: 4, topic: "Getting Ready for School", focus: "daily routine vocabulary and sequencing", goal: "Put familiar morning actions in order.", task: "Arrange or write three actions in order, for example wake up, wash, prepare school materials. Use first, next, and last.", check: "Can you explain which action happens first and which happens last?", evidence: "Three-step routine sequence" },
    { unit: 5, topic: "A Rainy Day", focus: "weather discussion, recitation, familiar words and sound practice", goal: "Describe the weather using a complete sentence.", task: "Observe the weather from a safe place, or use a teacher-provided picture. Complete: “Today the weather is ____.” Add one word describing what people might wear or carry.", check: "Can you describe the weather and give one suitable item?", evidence: "Weather sentence or accessible equivalent" },
    { unit: 6, topic: "What I Do on a Rainy Day", focus: "discussion, drawing and describing, simple-word sounds", goal: "Describe a safe activity for rainy weather.", task: "Draw, describe, sign, or write one safe rainy-day activity. Add one sentence or label. If ready, separate a simple word into its sounds with teacher support.", check: "Can you describe your activity and provide one label or sentence?", evidence: "Drawing/description and word or sentence" },
    { unit: 7, topic: "Preparing a Family Feast", focus: "family participation, discussion, spelling and reading simple words", goal: "Use action words to explain how people help at home.", task: "Using a fictional or general family example, list or describe two safe ways people help prepare a shared meal. Choose one action word and use it in a sentence.", check: "Can you name two helpful actions and use one action word?", evidence: "Two actions and one sentence" },
    { unit: 8, topic: "A Family Feast", focus: "picture discussion, family/food vocabulary, reading and phonics patterns", goal: "Use food vocabulary and describe a picture or meal respectfully.", task: "Choose three familiar foods from a picture or memory. Say, sign, draw, or write their names. Choose one word and identify a letter or sound you are practising.", check: "Can you name three foods and identify one letter or sound?", evidence: "Food words and letter/sound response" }
  ];

  var SUBJECT_TASKS = {
    "English": { goal: "Communicate a clear idea using familiar words.", task: "Say, sign, draw, or write a greeting and one complete sentence about a familiar daily activity. Choose one word and explain what it means.", check: "What is your sentence? Which word did you choose, and what does it mean?", evidence: "Greeting, sentence and vocabulary response" },
    "Mathematics": { goal: "Count, compare and explain a small quantity.", task: "Count five safe objects you can already see. Record the total. Make two groups and explain which group has more. Do not collect or handle unsafe objects.", check: "What is the total? Which group has more, and how do you know?", evidence: "Count, comparison and explanation" },
    "Phonics": { goal: "Recognise a letter and connect it to a sound or word.", task: "Choose a familiar letter. Find or draw two words that begin with it. Say, sign, point to, or write the letter and words. A blind learner may use the approved screen reader or teacher-read prompt; a deaf learner may use printed letters and visual mouth/letter cues.", check: "Can you identify the letter and two words linked to it?", evidence: "Letter and two example words" },
    "Science": { goal: "Observe one feature of the natural world.", task: "From a safe place, observe the sky, a plant, or an animal. Record two things you notice and one question you have. Do not touch unknown plants or animals.", check: "What two things did you observe? What would you like to find out?", evidence: "Two observations and one question" },
    "Social Science": { goal: "Explain how people help a community.", task: "Choose a community helper, such as a nurse, farmer, teacher, or bus driver. Describe two ways the person helps people. Do not write private addresses or personal contact details.", check: "Who did you choose, and what are two ways they help?", evidence: "Community role and two contributions" },
    "Health": { goal: "Describe a safe everyday health routine.", task: "Put these handwashing steps in order: wet hands, use soap, rub, rinse, dry. Explain when handwashing is useful.", check: "Which step comes after using soap? When should hands be washed?", evidence: "Sequence and reason" },
    "Agriculture": { goal: "Observe what a plant needs to grow.", task: "Draw or describe a plant. Identify two things it needs, such as water, light, air, or suitable soil. Observe only; ask an adult before using tools.", check: "Name two things the plant needs and explain one.", evidence: "Plant drawing/description and explanation" },
    "Arts": { goal: "Create and describe a simple pattern.", task: "Make a pattern using shapes, lines, or colours on paper or with a drawing tool. Repeat the pattern at least three times and describe what repeats.", check: "What part repeats in your pattern?", evidence: "Pattern and explanation" },
    "Technology": { goal: "Plan a simple useful design.", task: "Draw a design for a classroom organiser using reused safe materials. Label two parts and explain what each part would do. Do not cut or build without adult permission.", check: "What problem does your design solve?", evidence: "Design, two labels and purpose" }
  };

  var ROLE_TASKS = {
    teacher: { host:"teacherDashboard", title:"Teacher Daily Planning & Review", goal:"Prepare one practical learning task and review evidence fairly.", task:"Use the selected class, subject, term and teaching day. Write a learning intention, one short activity, one check for understanding, and an adjustment for a learner who needs a different access method. Check the current Fiji curriculum source before calling it curriculum-aligned.", prompt:"Planning note: learning intention, activity, check, accessibility adjustment, and source still to verify.", evidence:"Teacher planning note", status:"PENDING_TEACHER_REVIEW" },
    parent: { host:"parentDashboard", title:"Family Learning Support", goal:"Support learning at home without doing the work for the learner.", task:"Ask the learner to explain one thing they learned today. Invite them to read, describe, draw, sign, or demonstrate it. Praise effort and note one question to ask the teacher. Do not enter sensitive child details.", prompt:"What did the learner explain or demonstrate? What question should be shared with the teacher?", evidence:"Family support note", status:"PENDING_TEACHER_REVIEW" },
    professional: { host:"pacificEducationExternalReviewerPortal", title:"Professional Reviewer Activity", goal:"Review a pilot activity for clarity, accessibility, evidence and safe claims.", task:"Choose a non-sensitive example activity. Check whether the instructions are clear, the task matches its stated learning goal, accessible response options exist, and curriculum-source status is honestly labelled. Record a finding; this does not grant approval.", prompt:"Finding, evidence observed, risk/limitation, and recommended correction.", evidence:"Reviewer finding", status:"PENDING_AUTHORIZED_REVIEW" },
    ngo: { host:"pacificEducationWebsitePilotChecklist", title:"NGO / Organisation Support Activity", goal:"Plan practical support that strengthens learning access.", task:"Draft a small support plan such as reading materials, accessible formats, family learning sessions, or connectivity support. State the intended benefit, resources needed, safeguarding consideration, and how progress could be observed. Do not add real child names.", prompt:"Support plan, intended benefit, resources, safeguarding check, and evidence of progress.", evidence:"Programme support plan", status:"PENDING_PILOT_REVIEW" },
    education: { host:"pacificEducationCurriculumMasterControlStatus", title:"Education / Government Curriculum Review", goal:"Check curriculum traceability and identify missing official verification.", task:"Inspect one proposed activity and record its country, year/level, subject, term, source document, page/section, verification status, and missing evidence. Do not mark a curriculum item officially approved unless the authorised verification process is completed.", prompt:"Source trace, current-authority check, gap found, and next verification action.", evidence:"Curriculum verification note", status:"PENDING_AUTHORIZED_VERIFICATION" },
    community: { host:"pacificEducationWebsitePilotChecklist", title:"Community / Partner Learning Support", goal:"Identify one safe, practical way to encourage learning.", task:"Plan a community reading, storytelling, numeracy, garden observation, or learning-material activity. Keep participation voluntary, accessible and supervised. Record what resources are needed and how feedback will be collected without sensitive personal data.", prompt:"Activity planned, resources needed, accessibility/safeguarding check, and feedback method.", evidence:"Community activity plan", status:"PENDING_PILOT_REVIEW" },
    "head-of-school": { host:"pacificEducationTeacherClassRoster", title:"Head of School — Learning Review", goal:"Review school-level progress and identify a practical follow-up.", task:"Use aggregated or synthetic pilot information only. Identify one class-level learning need, one support action for teachers, and a date to review whether the support helped. Do not treat unverified dashboard values as official school records.", prompt:"Aggregated need, support action, review date, and evidence required.", evidence:"School improvement note", status:"PENDING_SCHOOL_REVIEW" },
    "institution-admin": { host:"pacificEducationInstitutionSetup", title:"Institution Administration Task", goal:"Check that the institution setup is complete and safe for pilot use.", task:"Review school/institution identity, class references, term, subject options, contact process and access boundaries using synthetic data. List missing fields and who should verify them. Do not enter production credentials or private learner records.", prompt:"Setup items checked, gaps, responsible role, and next action.", evidence:"Institution setup checklist", status:"PENDING_ADMIN_REVIEW" },
    "special-education": { host:"specialEducationDashboard", title:"Inclusive Learning Adaptation", goal:"Offer equivalent ways for learners to access the same learning goal.", task:"Choose a task and plan one adjustment: spoken/screen-reader prompt, large print/high contrast, sign/visual instructions, tactile or concrete materials, extra response time, or a supported response mode. Keep the learning goal fair and ask the learner/teacher what works.", prompt:"Learning goal, access barrier, adjustment, and how the learner can show understanding.", evidence:"Inclusion adaptation note", status:"PENDING_SPECIAL_EDUCATION_REVIEW" },
    owner: { host:"pacificEducationPrivilegedAccessNotice", title:"Owner — Pilot Governance Review", goal:"Keep pilot scope, safety, and change control clear.", task:"Review one pilot issue or feature request. Record the observed issue, evidence needed, risk, owner decision required, and rollback/verification plan. This activity does not automatically change access, production gates, payments, or ownership.", prompt:"Issue, evidence, risk, decision required, and safe test/rollback plan.", evidence:"Pilot governance note", status:"PENDING_OWNER_REVIEW" },
    technician: { host:"pacificEducationPrivilegedAccessNotice", title:"Technician — Read-only Diagnostics", goal:"Collect safe diagnostics without changing user data or privileged settings.", task:"Check connection status, app version/build, whether the relevant screen opens, and whether the issue can be reproduced. Record only non-sensitive technical details. Do not clear user storage, change roles, enable production, or collect passwords.", prompt:"Build/version, screen tested, expected versus actual result, reproducible steps, and non-sensitive error text.", evidence:"Read-only diagnostic report", status:"PENDING_TECHNICAL_REVIEW" }
  };

  function readAll() {
    try { var value = JSON.parse(global.localStorage.getItem(STORAGE_KEY) || "{}"); return value && typeof value === "object" ? value : {}; }
    catch (_) { return {}; }
  }
  function writeAll(value) {
    try { global.localStorage.setItem(STORAGE_KEY, JSON.stringify(value)); return true; }
    catch (_) { return false; }
  }
  function escapeText(value) {
    return String(value == null ? "" : value).replace(/[&<>"]/g, function (c) { return ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" })[c]; });
  }
  var DAILY_LEARNING_STAGES = [
    {
      name: "Learn and notice",
      guidance: "First, read, listen to, view, or explore the instructions. Identify the main idea and look at one example. If you are unsure, ask for the instruction in another format.",
      practice: "Point to, say, sign, select, draw, or write one thing you noticed before starting the main task."
    },
    {
      name: "Guided practice",
      guidance: "Try the task one step at a time. Use the example or a teacher/approved support prompt, then explain which step helped you.",
      practice: "Complete one small part of the task with support if needed. Check that part before moving on."
    },
    {
      name: "Independent practice",
      guidance: "Try the task using your own example and as much independence as is comfortable. It is fine to use approved access tools; do not copy an answer without understanding it.",
      practice: "Complete the main task, then show or explain one step you worked out yourself."
    },
    {
      name: "Apply learning",
      guidance: "Use the same idea in a different but familiar situation. Explain, demonstrate, or represent how the idea still works.",
      practice: "Make one new example or real-life connection that was not used in the first example."
    },
    {
      name: "Review and reflect",
      guidance: "Look back at your work. Check it against the learning goal, correct one part if needed, and identify what you can now do or what you still need help with.",
      practice: "Improve one part of your response and name one thing learned or one question for the teacher."
    }
  ];

  function addDailyLearningSequence(activity, day, level, subject) {
    var number = Math.min(365, Math.max(1, Math.floor(Number(day) || 1)));
    var stageIndex = (number - 1) % DAILY_LEARNING_STAGES.length;
    var stage = DAILY_LEARNING_STAGES[stageIndex];
    var cycle = Math.floor((number - 1) / DAILY_LEARNING_STAGES.length) + 1;
    activity.day = number;
    activity.learningStage = stage.name;
    activity.learningStageNumber = stageIndex + 1;
    activity.learningCycle = cycle;
    activity.title = "Day " + number + " of 365 — " + activity.title + " — " + stage.name;
    activity.goal = activity.goal + " Today's focus: " + stage.name.toLowerCase() + ".";
    activity.task = activity.task + " Daily learning step: " + stage.guidance;
    activity.practicePrompt = stage.practice;
    activity.successCriteria = "I can show the learning goal (" + activity.goal + ") through my own response or demonstration.";
    activity.reflectionPrompt = "What did you learn or improve today? What was difficult, and what would you like help with next?";
    activity.accessibilityOptions = "Choose an equivalent response method that works for you: speak, sign, point/select, draw, type/write, use suitable tactile or concrete materials, or use an approved screen reader/communication aid. Instructions must not rely on sound or colour alone. Ask a teacher or caregiver for a safe adjustment or extra time when needed.";
    activity.evidence = activity.evidence + "; daily evidence: learner response or demonstration, one success check, and a brief reflection";
    activity.daySequenceNote = "Day " + number + " is stage " + (stageIndex + 1) + " of a five-step practice cycle (cycle " + cycle + "). The topic is revisited for spaced practice; this does not claim 365 separately ministry-authored lessons.";
    activity.subject = subject || activity.subject || "English";
    activity.level = level || activity.level || "";
    return activity;
  }

  function learnerActivity(day, context) {
    context = context || {};
    var subject = String(context.subject || "English");
    var level = String(context.level || "");
    var number = Math.min(365, Math.max(1, Math.floor(Number(day) || 1)));
    var activity;
    if ((/year\s*1|class\s*1/i).test(level) && subject.toLowerCase() === "english") {
      var item = FIJI_YEAR1_ENGLISH[(number - 1) % FIJI_YEAR1_ENGLISH.length];
      activity = {
        id:"fiji-y1-english-unit-" + item.unit + "-day-" + number,
        title:"Fiji Year 1 English — " + item.topic,
        goal:item.goal, task:item.task, check:item.check, evidence:item.evidence,
        source:"Fiji Ministry of Education resource: Year 1 English — Language, Literacy and Communication (reprint 2020), resource topics only.",
        curriculumStatus:"REFERENCE TOPIC ONLY — current Ministry curriculum and achievement-indicator validation still required.",
        verificationStatus:"REQUIRES_CURRENT_MINISTRY_VALIDATION", unit:item.unit, subject:subject, level:level
      };
    } else {
      var generic = SUBJECT_TASKS[subject] || SUBJECT_TASKS.English || {
        goal:"Practise the selected subject in a real-life context.",
        task:"Ask your teacher for today's approved class task. Describe, draw, or write one example connected to the selected subject.",
        check:"Explain what you learned and how it connects to the selected subject.",
        evidence:"Learner response"
      };
      activity = {
        id:"pacedu-practical-" + subject.toLowerCase().replace(/[^a-z0-9]+/g,"-") + "-day-" + number,
        title:subject + " — Practical Daily Activity",
        goal:generic.goal, task:generic.task, check:generic.check, evidence:generic.evidence,
        source:"PacEdu original practical pilot activity; not copied from a syllabus.",
        curriculumStatus:"PENDING TEACHER VERIFICATION against the current Fiji curriculum for the selected year/level, subject and term.",
        verificationStatus:"PENDING_TEACHER_REVIEW", subject:subject, level:level
      };
    }
    return addDailyLearningSequence(activity, number, level, subject);
  }
  function getActivity(role, stepId, day, context) {
    role = String(role || "").toLowerCase().replace(/_/g,"-");
    if (role === "student" || role === "blind-learner" || role === "deaf-learner") {
      if (stepId !== "dailyLesson") return null;
      return learnerActivity(day, context);
    }
    var pack = ROLE_TASKS[role];
    if (!pack || stepId !== pack.host) return null;
    return {
      id:"role-" + role + "-" + stepId, title:pack.title, goal:pack.goal, task:pack.task,
      check:pack.prompt, evidence:pack.evidence, source:"PacEdu controlled-pilot role activity",
      curriculumStatus:"Role workflow activity; not a claim of official curriculum approval.",
      verificationStatus:pack.status
    };
  }
  function render(role, stepId, host, day) {
    if (!host || !document || !document.createElement) return false;
    var context = {
      subject: global.localStorage.getItem("pacificEducationSubject") || "English",
      level: global.localStorage.getItem("pacificEducationLevel") || "",
      term: global.localStorage.getItem("pacificEducationTerm") || "",
      countryCode: global.localStorage.getItem("pacificEducationCurriculumCountryCode") || global.localStorage.getItem("pacificEducationPilotCountry") || "",
      classReference: global.localStorage.getItem("pacificEducationClassReference") || global.localStorage.getItem("pacificEducationClassId") || "",
      capability: global.localStorage.getItem("pacificEducationCapability") || ""
    };
    try {
      var classContext = global.PacificEducationTeacherClassRosterContext;
      if (classContext && typeof classContext.getClassId === "function") {
        context.classReference = String(classContext.getClassId() || context.classReference || "");
        if (context.classReference && typeof classContext.getClass === "function") {
          var assignedClass = classContext.getClass(context.classReference);
          if (assignedClass && assignedClass.level) context.level = String(assignedClass.level);
        }
      }
    } catch (_) {}
    var activity = getActivity(role, stepId, day, context);
    if (!activity) return false;
    var old = document.getElementById("paceduRoleActivityPack");
    if (old && old.parentNode) old.parentNode.removeChild(old);
    var card = document.createElement("section");
    card.id = "paceduRoleActivityPack";
    card.setAttribute("aria-label", activity.title);
    card.style.cssText = "margin:16px 0;padding:16px;border:2px solid #176b48;border-radius:10px;max-width:100%;box-sizing:border-box;";
    var heading = document.createElement("h3"); heading.textContent = activity.title; card.appendChild(heading);
    var goal = document.createElement("p"); goal.innerHTML = "<strong>Learning / work goal:</strong> "; goal.appendChild(document.createTextNode(activity.goal)); card.appendChild(goal);
    var task = document.createElement("p"); task.innerHTML = "<strong>Today's task:</strong> "; task.appendChild(document.createTextNode(activity.task)); card.appendChild(task);
    var check = document.createElement("p"); check.innerHTML = "<strong>Record / check:</strong> "; check.appendChild(document.createTextNode(activity.check)); card.appendChild(check);
    function appendActivityDetail(labelText, value) {
      if (!value) return;
      var detail = document.createElement("p");
      var labelNode = document.createElement("strong");
      labelNode.textContent = labelText + ": ";
      detail.appendChild(labelNode);
      detail.appendChild(document.createTextNode(value));
      card.appendChild(detail);
    }
    appendActivityDetail("Today's learning stage", activity.learningStage ? activity.learningStage + " (step " + activity.learningStageNumber + " of 5; cycle " + activity.learningCycle + ")" : "");
    appendActivityDetail("Practice prompt", activity.practicePrompt);
    appendActivityDetail("Success check", activity.successCriteria);
    appendActivityDetail("Reflection", activity.reflectionPrompt);
    appendActivityDetail("Accessible ways to respond", activity.accessibilityOptions);
    appendActivityDetail("Daily sequence", activity.daySequenceNote);
    if (activity.unit) {
      var unit = document.createElement("p"); unit.textContent = "Resource topic unit " + activity.unit + " • " + activity.source; card.appendChild(unit);
    } else {
      var source = document.createElement("p"); source.textContent = activity.source; card.appendChild(source);
    }
    var status = document.createElement("p"); status.textContent = activity.curriculumStatus; status.setAttribute("role","note"); card.appendChild(status);
    var label = document.createElement("label"); label.textContent = "Your response / work note (avoid private or sensitive information)";
    var input = document.createElement("textarea"); input.id = "paceduRoleActivityResponse"; input.rows = 4; input.style.cssText = "display:block;width:100%;max-width:100%;box-sizing:border-box;padding:10px;margin:8px 0;font:inherit;"; input.setAttribute("aria-label", label.textContent); label.appendChild(input); card.appendChild(label);
    var doneLabel = document.createElement("label"); doneLabel.style.cssText = "display:flex;gap:8px;align-items:flex-start;margin:10px 0;";
    var done = document.createElement("input"); done.type = "checkbox"; done.id = "paceduRoleActivityDone";
    var doneText = document.createElement("span"); doneText.textContent = role === "student" || role === "blind-learner" || role === "deaf-learner" ? "I have attempted this activity." : "I have completed this role task.";
    doneLabel.appendChild(done); doneLabel.appendChild(doneText); card.appendChild(doneLabel);
    var save = document.createElement("button"); save.type = "button"; save.textContent = "Save Activity on This Device"; save.style.cssText = "padding:11px 15px;font-weight:700;"; card.appendChild(save);
    var live = document.createElement("p"); live.id = "paceduRoleActivityStatus"; live.setAttribute("role","status"); live.setAttribute("aria-live","polite"); card.appendChild(live);
    var legacyKey = [
      activity.id, context.countryCode || "country-not-set", context.classReference || "class-not-set",
      context.level || "level-not-set", context.subject || "subject-not-set", context.term || "term-not-set"
    ].join("|");
    /* Include the active role in the storage key. Accessible learner roles can
       share the same subject/day/context, but their attempts must never overwrite
       or appear as another role's saved work. Migrate only a legacy record whose
       stored role exactly matches the current role. */
    var key = ["role:" + role, legacyKey].join("|");
    var all = readAll(); var prior = all[key];
    if (!prior && all[legacyKey] && all[legacyKey].role === role) {
      prior = all[legacyKey];
      all[key] = prior;
      delete all[legacyKey];
      writeAll(all);
    }
    if (prior) { input.value = prior.response || ""; done.checked = !!prior.completed; live.textContent = "Saved on this device. Review status: " + (prior.reviewStatus || activity.verificationStatus) + "."; }
    save.addEventListener("click", function () {
      var response = String(input.value || "").trim();
      if (!response) { live.textContent = "Please enter your response or work note before saving."; input.focus(); return; }
      if (!done.checked) { live.textContent = "Please confirm that you attempted or completed the task before saving."; done.focus(); return; }
      var records = readAll();
      records[key] = {
        activityId:activity.id, role:role, title:activity.title, countryCode:context.countryCode,
        classReference:context.classReference, level:context.level, subject:context.subject, term:context.term,
        capability:context.capability, day:Math.max(1,Number(day)||1), response:response, completed:true,
        learningStage:activity.learningStage || "", learningCycle:activity.learningCycle || null,
        practicePrompt:activity.practicePrompt || "", successCriteria:activity.successCriteria || "",
        reflectionPrompt:activity.reflectionPrompt || "", accessibilityOptions:activity.accessibilityOptions || "",
        evidenceType:activity.evidence, reviewStatus:activity.verificationStatus,
        savedAt:new Date().toISOString(), storage:"local-device-pilot"
      };
      if (writeAll(records)) {
        live.textContent = "Saved on this device. Status: " + activity.verificationStatus + ". This is not teacher approval or an official curriculum result.";
        try {
          var progressKey = "pacificEducationStudentDailyActivityProgressV1";
          if (role === "student" || role === "blind-learner" || role === "deaf-learner") {
            var progress = JSON.parse(global.localStorage.getItem(progressKey) || "{}") || {};
            progress[String(day)+":"+context.subject] = {completed:true,day:Number(day)||1,subject:context.subject,activityId:activity.id,reviewStatus:activity.verificationStatus};
            global.localStorage.setItem(progressKey, JSON.stringify(progress));
          }
          try {
            if (typeof global.dispatchEvent === "function" && typeof global.CustomEvent === "function") {
              global.dispatchEvent(new global.CustomEvent("pacificEducationDailyActivitySaved", { detail: { day: Number(day) || 1, subject: context.subject } }));
            }
          } catch (_) {}
        } catch (_) {}
      } else live.textContent = "Could not save on this device. Keep your response and tell your teacher or pilot coordinator.";
    });
    host.appendChild(card);
    return true;
  }

  global.PacificEducationRoleActivityPacks = Object.freeze({
    version:"1.0.0",
    getActivity:getActivity,
    render:render,
    getStudentActivity:function(day, context){return learnerActivity(day,context);},
    roles:Object.freeze(Object.keys(ROLE_TASKS))
  });
})(window, document);
