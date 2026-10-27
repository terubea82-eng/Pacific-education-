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

  function attachSharedAchievementIndicator(activity, context, day) {
    context = context || {};
    var engine = global.PacificEducationAchievementDistributionEngine;
    if (!engine || typeof engine.buildDailyIndicatorPlan !== "function") return activity;
    var expectedClass = String(context.classReference || "").trim();
    if (!expectedClass) return activity;
    var result = engine.buildDailyIndicatorPlan({
      classId: expectedClass, level: String(context.level || ""),
      subjectId: String(context.subject || "English"), term: String(context.term || ""),
      dayNumber: Math.max(1, Number(day) || 1)
    });
    var assignment = result && result.assignment;
    if (!assignment || !assignment.indicatorId || String(assignment.classId || "") !== expectedClass ||
        String(assignment.level || "") !== String(context.level || "") ||
        String(assignment.subjectId || "") !== String(context.subject || "English") ||
        String(assignment.term || "") !== String(context.term || "")) return activity;
    activity.indicatorId = assignment.indicatorId;
    activity.achievementIndicator = assignment.indicatorText;
    activity.indicatorStrand = assignment.strand || "";
    activity.indicatorSourceStatus = assignment.sourceStatus || "unverified";
    activity.indicatorVerificationStatus = "PENDING_TEACHER_REVIEW";
    activity.indicatorProductionEligible = false;
    activity.curriculumStatus = String(activity.curriculumStatus || "") +
      " Shared achievement indicator " + assignment.indicatorId +
      " is attached for planning only; verify the source and obtain teacher approval before treating it as authoritative.";
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
      /* Controlled Class 1 trial: Day 2 teaches greetings using Day 1 evidence.
         Missing evidence is not treated as mastery; the teacher selects support
         or extension from observed performance. This is not an official syllabus claim. */
      if (number === 2) {
        activity = {
          id:"pacedu-class1-english-term1-week1-day2-greetings",
          title:"Class 1 English — Greetings and Introducing Myself",
          goal:"Use a suitable greeting, respond politely, and introduce yourself with a complete sentence.",
          task:"DAY 2 TEACHING LESSON (about 30 minutes)\n\n1. Connect to Day 1 (3–5 min): the teacher checks the recorded Day 1 evidence. Do not repeat the identification assessment. If evidence is missing, observe the learner during the lesson before deciding mastery.\n\n2. Model (5 min): teacher says “Good morning!” and models a response. Then model: “Hello. What is your name?” — “My name is ____.” — “Nice to meet you.” Use names the learners choose to share.\n\n3. Guided practice (8–10 min): learners listen, match or select a greeting and response, then practise with the teacher or a partner. Repeat only the step that evidence shows is needed.\n\n4. Student worksheet (8–10 min): A. Complete: “Good ______.” B. Complete: “My name is ______.” C. Match or connect “Hello” with an appropriate greeting response. D. Practise one respectful greeting with a partner or trusted adult. Draw, dictate, point/select, sign, type or write as appropriate.\n\n5. Close (2 min): learner chooses or demonstrates one greeting and one introduction.\n\nDIFFERENTIATION: If Day 1 evidence shows greetings and introductions are already secure, extend with “How are you?” / “I am fine, thank you” and a polite turn-taking conversation. If a skill is not yet secure, model that step with a picture/object cue or short spoken example, then practise it again. Do not label mastery from repetition alone.",
          check:"Record evidence separately for: (1) recognises or selects a suitable greeting; (2) responds appropriately; (3) introduces themself using “My name is …” or an equivalent accessible response; (4) takes a turn. For each indicator record: demonstrated independently, demonstrated with support, not yet demonstrated, or not observed. Use Day 1 evidence to choose the next step; do not assume mastery if evidence is absent.",
          evidence:"Teacher-recorded response to greeting, introduction attempt, level of support, and next teaching step.",
          source:"PacEdu original controlled-pilot lesson. Topic and wording require verification against the current applicable curriculum before claiming official alignment.",
          curriculumStatus:"PENDING_TEACHER_REVIEW — verify the current Fiji Class 1 / Year 1 Term 1 achievement indicators; not a claim of Ministry approval.",
          verificationStatus:"PENDING_TEACHER_REVIEW",
          unit:1, subject:subject, level:level
        };
      }
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
    attachSharedAchievementIndicator(activity, context, number);
    return addDailyLearningSequence(activity, number, level, subject);
  }

  /* Four-level daily differentiation for every Fiji school level.
     Original PacEdu tasks are curriculum-aware drafts, not official syllabus claims.
     Four learner levels describe observed task support; teachers confirm using evidence. */
  var FOUR_ABILITY_TASKS = {
    English: {
      ECE: ["Match or point to a picture and name it with support.", "Name a familiar object and say a word about it.", "Say or write one clear sentence about a familiar object.", "Tell a short story about the object and explain one detail."],
      Y1_2: ["Match pictures to words; trace or copy a word with support.", "Read familiar words and complete a sentence using a word bank.", "Read a short passage and answer who/what/where questions.", "Write a short paragraph and explain a word choice."],
      Y3_5: ["Read a short text with prompts; identify a person or place.", "Read a paragraph and answer direct questions using clues.", "Summarise the main idea and support it with two details.", "Compare two characters or ideas and justify an interpretation."],
      Y6_8: ["Use a text guide to find key facts and unfamiliar words.", "Answer literal and simple inferential questions with prompts.", "Write a structured paragraph with evidence from a text.", "Compare viewpoints and support a conclusion with evidence."],
      Y9_10: ["Use a scaffold to identify a text's main claim and evidence.", "Explain the main idea and identify supporting evidence.", "Write a structured response using relevant evidence and clear paragraphs.", "Evaluate the writer's purpose, evidence and possible bias."],
      Y11_13: ["Use a planning frame to identify the issue and key evidence.", "Explain an argument and select relevant supporting points.", "Develop a coherent analytical response with evidence and citations where required.", "Evaluate competing interpretations and defend a reasoned conclusion."]
    },
    Mathematics: {
      ECE: ["Count or match up to three objects with adult support.", "Count a small set and match it to a numeral.", "Count, compare two sets and explain which has more.", "Make a repeating pattern and explain its rule."],
      Y1_2: ["Count objects one by one and match totals to numerals.", "Solve simple addition or subtraction using objects.", "Solve a class-level number problem and show the steps.", "Create a related number problem and explain another solution."],
      Y3_5: ["Use objects or a number line to solve a guided problem.", "Solve a one-step problem and show a model or calculation.", "Solve a multi-step problem and check the answer.", "Compare strategies and explain why one is efficient."],
      Y6_8: ["Use a worked example to identify the correct operation.", "Solve a familiar ratio, fraction, measurement or number task with prompts.", "Solve a multi-step class-level problem and show working.", "Create and solve a harder real-life problem; justify assumptions."],
      Y9_10: ["Identify known values and choose an operation with a scaffold.", "Solve a class-level algebra, geometry, statistics or number problem.", "Model a practical problem, show working and interpret the result.", "Compare models, test assumptions and explain limitations."],
      Y11_13: ["Use a formula sheet or worked example to set up the problem.", "Apply the relevant method and check units or values.", "Solve a subject-level problem and interpret the result in context.", "Compare methods, justify assumptions and evaluate the result."]
    },
    Science: {
      ECE: ["Point to or name one plant, animal or weather feature.", "Sort familiar pictures into two groups and say why.", "Observe one safe object and describe two features.", "Suggest a simple question about what might change and why."],
      Y1_2: ["Match a picture to a simple living/non-living example.", "Observe a plant or weather picture and record one fact.", "Record two observations and ask a testable question.", "Predict what may happen and explain the reason."],
      Y3_5: ["Use a picture or word bank to identify an observation.", "Record observations in a table with support.", "Make a prediction, observe safely and compare results.", "Use results to explain a pattern and suggest a fair test."],
      Y6_8: ["Follow a labelled diagram to identify the main parts.", "Describe a process and record results using a template.", "Plan a fair test, identify variables and explain findings.", "Evaluate the method and propose an improvement using evidence."],
      Y9_10: ["Use a diagram or formula prompt to identify key variables.", "Explain a scientific process using a labelled diagram.", "Interpret data and support a conclusion with evidence.", "Evaluate data quality, uncertainty and alternative explanations."],
      Y11_13: ["Use a scaffold to identify variables, units and relevant concepts.", "Apply a subject concept to explain a data set or process.", "Analyse results and construct an evidence-based explanation.", "Evaluate methodology, uncertainty and implications of the findings."]
    },
    "Social Science": {
      ECE: ["Identify a familiar place or community helper in a picture.", "Name one way a helper supports the community.", "Describe two community roles and why they matter.", "Compare two roles and explain how they work together."],
      Y1_2: ["Match a community helper to a picture of their work.", "Describe one place in the community and its use.", "Explain how people help keep a community safe and fair.", "Suggest a practical improvement for a shared place."],
      Y3_5: ["Use a map or picture with support to locate a feature.", "Describe a local place and one change people make to it.", "Compare two ways people use resources or work together.", "Use simple evidence to explain a community issue and response."],
      Y6_8: ["Use a map key or source prompt to find information.", "Describe causes or effects of a local or historical event.", "Compare sources or viewpoints and support a conclusion.", "Evaluate a proposed community response using evidence."],
      Y9_10: ["Use a source guide to identify place, event or viewpoint.", "Explain a cause-and-effect relationship using a source.", "Compare evidence and explain a social, historical or geographic issue.", "Assess competing explanations and justify a conclusion."],
      Y11_13: ["Use a planning frame to identify the issue and source.", "Explain a relevant concept and select supporting evidence.", "Analyse sources and construct a reasoned argument.", "Evaluate evidence, perspective and policy options; defend a conclusion."]
    },
    Health: {
      ECE: ["Choose a picture showing a safe or healthy action.", "Show or name one handwashing step.", "Put handwashing steps in order with picture cues.", "Explain when handwashing helps and teach the steps to someone."],
      Y1_2: ["Identify a healthy routine from picture choices.", "Put handwashing or toothbrushing steps in order.", "Explain why a daily hygiene routine matters.", "Create a simple reminder that teaches a healthy routine."],
      Y3_5: ["Use a prompt to identify a safe choice.", "Describe steps for a healthy routine and when to use it.", "Compare choices and explain likely effects on wellbeing.", "Design a practical health message and explain its audience."],
      Y6_8: ["Use a checklist to identify a safe, healthy action.", "Explain how a routine can reduce a common health risk.", "Assess a scenario and justify a safe response.", "Evaluate health information and design a clear prevention message."],
      Y9_10: ["Identify a risk and one protective action from a scenario.", "Explain links between choices and health outcomes.", "Use evidence to assess a health scenario and recommend action.", "Evaluate claims and develop an evidence-aware health message."],
      Y11_13: ["Use a framework to identify risks and support options.", "Explain a health issue and identify reliable information needs.", "Assess options and justify a safe, practical recommendation.", "Evaluate evidence quality and propose a feasible health promotion plan."]
    },
    Agriculture: {
      ECE: ["Point to or name a plant and one thing it needs.", "Match a plant picture to water, light or soil.", "Draw a plant and name two things it needs to grow.", "Compare two plant pictures and explain a visible difference."],
      Y1_2: ["Identify a seed, leaf or root using a picture.", "List two plant needs and describe a safe observation.", "Record a plant observation over time and explain a change.", "Suggest a simple way to care for a plant and explain why."],
      Y3_5: ["Use a diagram to identify plant parts.", "Record plant growth observations in a simple table.", "Compare growth conditions and support a conclusion.", "Plan a small safe growing activity and identify what to measure."],
      Y6_8: ["Label a crop or plant diagram with a word bank.", "Explain how water, soil and light affect plant growth.", "Plan and record a fair comparison of growing conditions.", "Use results to recommend a sustainable growing practice."],
      Y9_10: ["Use a guide to identify a crop need or farm input.", "Explain one factor affecting crop growth or soil health.", "Analyse observations and recommend a suitable practice.", "Compare practices for sustainability, cost and local conditions."],
      Y11_13: ["Use a planning frame to identify the production question.", "Explain relevant production factors and gather suitable evidence.", "Analyse data and justify an agricultural recommendation.", "Evaluate a production plan for sustainability, cost, risk and evidence."]
    },
    Arts: {
      ECE: ["Make marks or choose colours with support.", "Copy a simple line, shape or rhythm.", "Create a repeated pattern and name what repeats.", "Change the pattern and explain how the change affects it."],
      Y1_2: ["Choose materials and copy a simple pattern.", "Create a pattern using two shapes, colours or sounds.", "Create and describe an artwork or rhythm with a clear pattern.", "Develop a variation and explain the choices made."],
      Y3_5: ["Follow a model to create one design element.", "Combine shapes, colours, movement or sound for a purpose.", "Create a complete work and explain its main idea.", "Compare two design choices and revise the work with reasons."],
      Y6_8: ["Use a checklist to plan a basic composition.", "Use elements of art or performance to communicate an idea.", "Create, present and reflect on a finished work.", "Evaluate how choices communicate meaning to an audience."],
      Y9_10: ["Use a planning template to select a technique.", "Create a work that communicates a stated theme.", "Refine a work using feedback and explain the decisions.", "Compare techniques and evaluate their effect on the audience."],
      Y11_13: ["Use a brief to plan a manageable creative outcome.", "Apply selected techniques to express an intended idea.", "Develop and critique a portfolio piece with a clear rationale.", "Evaluate artistic choices, context and audience response with evidence."]
    },
    Technology: {
      ECE: ["Choose a safe object that solves a simple need.", "Draw or describe a useful object and name its purpose.", "Design an organiser and label two parts.", "Suggest a change that makes the design easier to use."],
      Y1_2: ["Choose a safe material from picture options.", "Draw a simple tool or organiser and label its use.", "Plan a design for a classroom need and explain its parts.", "Compare two designs and choose one with a reason."],
      Y3_5: ["Identify a problem using a teacher prompt.", "Sketch a solution and label materials and parts.", "Build or model only with permission, then test against criteria.", "Use test results to improve the design and explain why."],
      Y6_8: ["Use a checklist to identify a user need.", "Plan a design with materials, steps and safety rules.", "Test a model against criteria and record results.", "Improve the model using evidence, cost and sustainability."],
      Y9_10: ["Use a brief to identify a problem and user.", "Create a design with labelled parts and constraints.", "Test a prototype and justify changes using results.", "Compare design options against safety, usability and resource criteria."],
      Y11_13: ["Use a project brief to define a need and constraints.", "Develop a design plan with specifications and safety checks.", "Test and evaluate a prototype against measurable criteria.", "Optimise the design and justify trade-offs with evidence."]
    }
  };
  function abilityBand(value) {
    var v = String(value || "").toLowerCase().trim();
    if (v === "foundation" || v === "remedial" || v === "re-teaching") return 0;
    if (v === "developing") return 1;
    if (v === "expected" || v === "expected-level" || v === "secure") return 2;
    if (v === "advanced" || v === "extension") return 3;
    return -1;
  }
  function getCurrentDemonstratedAbility(context) {
    context = context || {};
    var records = readAll(), matches = [], approved = {
      "APPROVED": true, "TEACHER_APPROVED": true, "TEACHER_REVIEWED": true, "REVIEWED": true
    };
    Object.keys(records).forEach(function (key) {
      var record = records[key] || {};
      var role = String(record.role || "").toLowerCase();
      var status = String(record.reviewStatus || record.status || "").toUpperCase();
      if (["student", "blind-learner", "deaf-learner"].indexOf(role) < 0 || !approved[status]) return;
      if (String(record.subject || "").toLowerCase() !== String(context.subject || "").toLowerCase()) return;
      if (context.classReference && String(record.classReference || "") !== String(context.classReference)) return;
      if (context.level && String(record.level || "").toLowerCase() !== String(context.level).toLowerCase()) return;
      var value = record.teacherReviewedAbility || record.demonstratedAbility || record.reviewedAbility || record.masteryLevel;
      var band = abilityBand(value);
      if (band < 0 || record.teacherReviewedAbilityConfirmed === false) return;
      matches.push({ band: band, savedAt: String(record.reviewedAt || record.savedAt || ""), activityId: String(record.activityId || key) });
    });
    matches.sort(function (a, b) { return a.savedAt.localeCompare(b.savedAt); });
    var recent = matches.slice(-3), counts = [0, 0, 0, 0];
    recent.forEach(function (item) { counts[item.band] += 1; });
    var best = -1, bestCount = 0;
    counts.forEach(function (count, index) { if (count > bestCount) { best = index; bestCount = count; } });
    if (recent.length < 2 || bestCount < 2) {
      return { status: "INSUFFICIENT_EVIDENCE", level: "Insufficient evidence", evidenceCount: recent.length, message: "Complete a short subject check and/or collect teacher-reviewed work before assigning a revision level." };
    }
    return {
      status: "DEMONSTRATED",
      level: ["Foundation", "Developing", "Expected", "Advanced"][best],
      evidenceCount: bestCount,
      message: "Based on consistent, teacher-reviewed evidence in this subject; reassess as new work is completed."
    };
  }
  function levelBand(level) {
    var s = String(level || "").toLowerCase();
    if (/kindy|kindergarten|early childhood|year k|\bk\b/.test(s)) return "ECE";
    var n = Number((s.match(/\d+/) || [])[0]);
    if (!Number.isFinite(n)) return "Y1_2";
    if (n <= 2) return "Y1_2";
    if (n <= 5) return "Y3_5";
    if (n <= 8) return "Y6_8";
    if (n <= 10) return "Y9_10";
    return "Y11_13";
  }
  function nextAbilityStep(subject, band, index) {
    var pack = FOUR_ABILITY_TASKS[String(subject || "English")] || FOUR_ABILITY_TASKS.English;
    var tasks = pack[band] || pack.Y1_2;
    if (index < 3) {
      return {
        label: ["Foundation to Developing", "Developing to Expected", "Expected to Advanced"][index],
        task: tasks[index + 1],
        targetGroup: index + 2,
        criterion: [
          "Complete the current task with fewer prompts, then try the next task with a word bank, model or adult cue.",
          "Complete the current task with light prompts, then try the next task and explain one choice.",
          "Complete the current task independently, then try the next task and support the answer with a reason or evidence."
        ][index]
      };
    }
    return {
      label: "Advanced practice and transfer",
      task: tasks[3],
      targetGroup: 4,
      criterion: "Complete the task independently, explain the reasoning, and apply the skill to a new example. Extend depth and independence rather than moving beyond the learner's class curriculum."
    };
  }
  function progressionStatus(context, index) {
    var names = ["Foundation", "Developing", "Expected", "Advanced"];
    return {
      currentAbility: names[index],
      nextAbility: index < 3 ? names[index + 1] : "Advanced transfer",
      promotionRule: "Move up only after the learner demonstrates the current skill consistently across more than one activity and the teacher reviews the evidence. Do not promote from one tick or one score alone."
    };
  }
  function applyFourAbilityActivity(activity, context, day) {
    var subject = String(context && context.subject || "English");
    var pack = FOUR_ABILITY_TASKS[subject] || FOUR_ABILITY_TASKS.English;
    var band = levelBand(context && context.level);
    var demonstrated = getCurrentDemonstratedAbility(context);
    var index = demonstrated.status === "DEMONSTRATED" ? abilityBand(demonstrated.level) : -1;
    var hasAbilityEvidence = index >= 0;
    var task = hasAbilityEvidence ? pack[band][index] : "";
    var levelName = String(context && context.level || "selected class");
    activity.id = "pacedu-daily-" + levelName.toLowerCase().replace(/[^a-z0-9]+/g, "-") +
      "-" + subject.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" +
      (hasAbilityEvidence ? "ability-" + (index + 1) : "ability-unassessed") + "-day-" + (Number(day) || 1);
    /* Keep the existing subject-specific lesson as the main activity. Add the
       four-level task as differentiated practice instead of replacing the lesson. */
    var hasSpecificLesson = Boolean(activity.title && activity.task && activity.goal && activity.check);
    if (!hasSpecificLesson) {
      activity.title = levelName + " " + subject + " — Daily Activity";
      activity.goal = "Practise " + subject.toLowerCase() + " skills; personalise revision only after enough subject-specific evidence is available.";
      activity.task = hasAbilityEvidence ? ("Day " + (Number(day) || 1) + ": " + task) :
        ("Day " + (Number(day) || 1) + ": complete a short check against the stated learning objective, then review the evidence before selecting a revision level.");
      activity.check = hasAbilityEvidence ? [
        "With support, the learner attempts the task and shows one step.",
        "The learner completes the task with prompts and explains one choice.",
        "The learner completes the task independently and explains the result.",
        "The learner completes the task, explains the reasoning and applies it in a new way."
      ][index] : "Record the response and support needed; do not infer ability from missing or insufficient evidence.";
    } else if (hasAbilityEvidence) {
      activity.task += "\\n\\nAbility-level practice (" + ["Foundation", "Developing", "Expected", "Advanced"][index] + "): " + task;
      activity.check += " Ability-level check: " + [
        "With support, the learner attempts the task and shows one step.",
        "The learner completes the task with prompts and explains one choice.",
        "The learner completes the task independently and explains the result.",
        "The learner completes the task, explains the reasoning and applies it in a new way."
      ][index];
    }
    activity.evidence = "Learner response, completion, support needed and teacher observation";
    activity.source = "Original PacEdu differentiated activity draft; teacher review required.";
    activity.curriculumStatus = "PENDING_TEACHER_REVIEW — check against the current Fiji syllabus, term plan and achievement indicators for this class and subject. Not Ministry-approved.";
    activity.verificationStatus = "PENDING_TEACHER_REVIEW";
    activity.capabilityGroup = hasAbilityEvidence ? index + 1 : null;
    var bridge = hasAbilityEvidence ? nextAbilityStep(subject, band, index) : {
      label: "Evidence needed before revision placement",
      task: "Complete a short check for this subject and combine it with other reviewed work before choosing the next revision activity.",
      targetGroup: null,
      criterion: "Do not assign a revision level until there is sufficient subject-specific evidence; missing work or sickness is not evidence of low ability."
    };
    var progression = hasAbilityEvidence ? progressionStatus(context, index) : {
      currentAbility: "Insufficient evidence",
      nextAbility: "Determine after subject-specific evidence is reviewed",
      promotionRule: "Use consistent evidence from more than one activity or assessment. Missing work and one score alone do not establish ability."
    };
    activity.abilityEvidenceStatus = demonstrated.status;
    activity.abilityEvidenceCount = demonstrated.evidenceCount;
    activity.abilityEvidenceMessage = demonstrated.message;
    activity.currentAbility = progression.currentAbility;
    activity.nextAbility = progression.nextAbility;
    activity.nextLevelPractice = bridge.task;
    activity.progressionLabel = bridge.label;
    activity.progressionTargetGroup = bridge.targetGroup;
    activity.progressionSuccessCriteria = bridge.criterion;
    activity.promotionRule = progression.promotionRule;
    activity.learningPhilosophy = "Start from demonstrated learning; teach explicitly; practise with suitable support; give kind, specific feedback; check understanding; and build the next skill. Ability groups are flexible, not permanent labels.";
    activity.priorKnowledgePrompt = "Before teaching, ask the learner to show or explain what they already know about this skill. Record the response without penalty.";
    activity.teachingExample = "Show one clear example, think aloud through the steps, and check understanding before asking the learner to work alone.";
    activity.guidedPractice = "Complete one example together. Use prompts, concrete materials, a model or accessible alternatives as needed; gradually reduce help when the learner is ready.";
    activity.independentPractice = "Ask the learner to try the daily task independently where possible, or with their usual access support. Record what they did and how much help was needed.";
    activity.feedbackPrompt = "Name one thing the learner did well, explain one specific next step, and let the learner try again.";
    activity.reteachRule = "If the learner cannot yet show the key skill, use a different example or teaching method, practise the missing step, and check again before increasing difficulty.";
    activity.masteryRule = "Look for consistent evidence across more than one activity and context. One completed tick or one score alone is not enough to change the ability group.";
    activity.accessibilityOptions = "Keep the learning goal meaningful. Allow speaking, signing, pointing, drawing, typing or writing; provide screen-reader-compatible text, verbal descriptions, captions, clear print and extra processing time as needed.";
    activity.successCriteria = activity.check;
    activity.reflectionPrompt = "What did I learn? What helped me? What will I practise next?";
    activity.daySequenceNote = "Check prior knowledge → teach and model → practise together → try the task → give feedback → check evidence → practise again or try the next-step task.";

    return activity;
  }

  function getActivity(role, stepId, day, context) {
    role = String(role || "").toLowerCase().replace(/_/g,"-");
    if (role === "student" || role === "blind-learner" || role === "deaf-learner") {
      if (stepId !== "dailyLesson") return null;
      return applyFourAbilityActivity(learnerActivity(day, context), context || {}, day);
    }
    var pack = ROLE_TASKS[role];
    if (!pack || stepId !== pack.host) return null;
    var roleActivity = {
      id:"role-" + role + "-" + stepId, title:pack.title, goal:pack.goal, task:pack.task,
      check:pack.prompt, evidence:pack.evidence, source:"PacEdu controlled-pilot role activity",
      curriculumStatus:"Role workflow activity; not a claim of official curriculum approval.",
      verificationStatus:pack.status
    };
    if (role === "teacher") attachSharedAchievementIndicator(roleActivity, context || {}, day);
    return roleActivity;
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
    var old = document.getElementById("paceduRoleActivityPack");
    if (old && old.parentNode) old.parentNode.removeChild(old);
    var learnerRole = ["student", "blind-learner", "deaf-learner"].indexOf(String(role || "").toLowerCase()) >= 0;
    if (learnerRole) {
      var approval = global.PacificEducationTeacherDailyActivityCoordinator;
      var approved = !!(approval && typeof approval.isTeacherApprovedForStudent === "function" &&
        approval.isTeacherApprovedForStudent(context, day));
      if (!approved) {
        var locked = document.createElement("section");
        locked.id = "paceduRoleActivityPack";
        locked.setAttribute("role", "status");
        locked.setAttribute("aria-live", "polite");
        locked.setAttribute("aria-label", "Daily activity awaiting teacher approval");
        locked.style.cssText = "margin:16px 0;padding:16px;border:2px solid #b7791f;border-radius:10px;max-width:100%;box-sizing:border-box;";
        var lockedHeading = document.createElement("h3");
        lockedHeading.textContent = "Today's activity";
        locked.appendChild(lockedHeading);
        var lockedMessage = document.createElement("p");
        lockedMessage.textContent = "Your teacher must approve and release today's activity before you can view or attempt it. If your class is not shown, ask your teacher to confirm your class and subject.";
        locked.appendChild(lockedMessage);
        host.appendChild(locked);
        return true;
      }
    }
    var activity = getActivity(role, stepId, day, context);
    if (!activity) return false;
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
    appendActivityDetail("Learning approach", activity.learningPhilosophy);
    appendActivityDetail("1. Check what the learner knows", activity.priorKnowledgePrompt);
    appendActivityDetail("2. Teach and show an example", activity.teachingExample);
    appendActivityDetail("3. Practise together", activity.guidedPractice);
    appendActivityDetail("4. Learner tries the task", activity.independentPractice);
    appendActivityDetail("5. Feedback and another try", activity.feedbackPrompt);
    appendActivityDetail("If the learner is not ready", activity.reteachRule);
    appendActivityDetail("How to check mastery", activity.masteryRule);
    appendActivityDetail("Today's learning stage", activity.learningStage ? activity.learningStage + " (step " + activity.learningStageNumber + " of 5; cycle " + activity.learningCycle + ")" : "");
    appendActivityDetail("Practice prompt", activity.practicePrompt);
    appendActivityDetail("Success check", activity.successCriteria);
    appendActivityDetail("Current ability level", activity.currentAbility);
    appendActivityDetail("Ability evidence status", activity.abilityEvidenceStatus || "INSUFFICIENT_EVIDENCE");
    appendActivityDetail("Ability evidence note", activity.abilityEvidenceMessage || "Use subject-specific reviewed evidence before personalising revision; missing work is not low ability.");
    appendActivityDetail("Next ability goal", activity.nextAbility);
    appendActivityDetail("Practice to build the next level", activity.nextLevelPractice);
    appendActivityDetail("Next-step success check", activity.progressionSuccessCriteria);
    appendActivityDetail("Ability change rule", activity.promotionRule);
    appendActivityDetail("Reflection", activity.reflectionPrompt);
    appendActivityDetail("Accessible ways to respond", activity.accessibilityOptions);
    appendActivityDetail("Daily sequence", activity.daySequenceNote);
    appendActivityDetail("Shared achievement indicator", activity.achievementIndicator);
    appendActivityDetail("Indicator reference", activity.indicatorId ? activity.indicatorId + " • source: " + (activity.indicatorSourceStatus || "unverified") + " • teacher review required" : "No verified indicator is linked to this task yet; this activity remains a prototype concept focus.");
    if (activity.unit) {
      var unit = document.createElement("p"); unit.textContent = "Resource topic unit " + activity.unit + " • " + activity.source; card.appendChild(unit);
    } else {
      var source = document.createElement("p"); source.textContent = activity.source; card.appendChild(source);
    }
    var status = document.createElement("p"); status.textContent = activity.curriculumStatus; status.setAttribute("role","note"); card.appendChild(status);
    if (String(role || "").toLowerCase() === "teacher" && global.PacEduDownloadableClassPacks &&
        typeof global.PacEduDownloadableClassPacks.renderControls === "function") {
      global.PacEduDownloadableClassPacks.renderControls(card, context);
    }
    if (learnerRole && global.PacEduDailyWorksheetContent &&
        typeof global.PacEduDailyWorksheetContent.getCurriculumWorksheet === "function") {
      var rawLessonLevel = String(context.level || "");
      var yearMatch = rawLessonLevel.match(/^Year\\s+([1-8])$/i);
      if (yearMatch) rawLessonLevel = "Class " + yearMatch[1];
      var lessonLevel = global.PacEduDailyWorksheetContent.levels.indexOf(rawLessonLevel) >= 0 ? rawLessonLevel : "Class 1";
      var requestedLessonSubject = String(context.subject || "English");
      var lessonSubjectAliases = {"Maths":"Mathematics","Social Science":"Social Studies","Health":"Healthy Living","Arts":"Arts and Crafts"};
      var lessonSubject = lessonSubjectAliases[requestedLessonSubject] || requestedLessonSubject;
      if (global.PacEduDailyWorksheetContent.subjects.indexOf(lessonSubject) < 0) lessonSubject = "";
      if (lessonSubject) {
      var lessonTermRaw = String(context.term || global.localStorage.getItem("pacificEducationTerm") || "T1").toUpperCase();
      var lessonTerm = /^(T1|T2|T3|ASSESSMENT|INTERVENTION|REVISION|EXAMS)$/.test(lessonTermRaw) ? lessonTermRaw :
        (/2/.test(lessonTermRaw) ? "T2" : (/3/.test(lessonTermRaw) ? "T3" : "T1"));
      var storedWeek = Number(global.localStorage.getItem("pacificEducationWeek") || global.localStorage.getItem("pacificEducationTeachingWeek") || String(Math.ceil(Math.max(1,Number(day)||1)/5)));
      var lessonWeek = Math.max(1, Math.min(lessonTerm === "T3" ? 5 : lessonTerm === "INTERVENTION" ? 5 : lessonTerm === "REVISION" || lessonTerm === "EXAMS" ? 2 : 9, storedWeek || 1));
      var lessonDay = ((Math.max(1, Number(day) || 1) - 1) % 5) + 1;
      var lessonAbility = ["support","developing","expected","extension"].indexOf(context.capability) >= 0 ? context.capability : "developing";
      var lesson = global.PacEduDailyWorksheetContent.getCurriculumWorksheet({
        level:lessonLevel, subject:lessonSubject, term:lessonTerm, curriculumTerm:context.term || lessonTerm,
        week:lessonWeek, day:lessonDay, dayNumber:Math.max(1,Number(day)||1),
        ability:lessonAbility, classReference:context.classReference
      });
      if (lesson && lesson.dailyLesson) {
        var lessonPanel = document.createElement("section");
        lessonPanel.setAttribute("aria-label","Step-by-step see read and hear lesson");
        lessonPanel.style.cssText="margin:14px 0;padding:14px;border:1px solid #b7c9d6;border-radius:9px;";
        var lessonHeading = document.createElement("h4"); lessonHeading.textContent="Learn in steps: See • Read • Hear • Try • Check"; lessonPanel.appendChild(lessonHeading);
        var lessonNotice = document.createElement("p"); lessonNotice.textContent="Practice lesson example for "+lessonLevel+" "+lessonSubject+". Your teacher must confirm the exact current syllabus indicator and assigned week; this draft is not labelled officially aligned."; lessonPanel.appendChild(lessonNotice);
        var scheduleNav=document.createElement("section");
        scheduleNav.setAttribute("aria-label","Choose term and teaching week");
        scheduleNav.style.cssText="margin:10px 0;padding:10px;border:1px solid #c8d5de;border-radius:8px;";
        var scheduleLabel=document.createElement("label");scheduleLabel.textContent="Term: ";scheduleLabel.style.cssText="display:inline-block;margin:4px 8px 4px 0;";
        var termSelect=document.createElement("select");termSelect.style.cssText="padding:8px;font:inherit;";
        [["T1","Term 1 — 9 weeks"],["T2","Term 2 — 9 weeks"],["T3","Term 3 — 5 weeks"]].forEach(function(opt){var option=document.createElement("option");option.value=opt[0];option.textContent=opt[1];if(opt[0]===lessonTerm)option.selected=true;termSelect.appendChild(option);});
        scheduleLabel.appendChild(termSelect);scheduleNav.appendChild(scheduleLabel);
        var weekLabel=document.createElement("label");weekLabel.textContent="Week: ";weekLabel.style.cssText="display:inline-block;margin:4px 8px 4px 0;";
        var weekSelect=document.createElement("select");weekSelect.style.cssText="padding:8px;font:inherit;";
        function populateWeeks(){while(weekSelect.firstChild)weekSelect.removeChild(weekSelect.firstChild);var maxWeek=termSelect.value==="T3"?5:9;for(var wi=1;wi<=maxWeek;wi++){var option=document.createElement("option");option.value=String(wi);option.textContent="Week "+wi;if(wi===Math.min(maxWeek,Number(lessonWeek)||1))option.selected=true;weekSelect.appendChild(option);}}
        termSelect.addEventListener("change",populateWeeks);weekLabel.appendChild(weekSelect);scheduleNav.appendChild(weekLabel);
        var openWeek=document.createElement("button");openWeek.type="button";openWeek.textContent="Open selected week";openWeek.style.cssText="padding:9px 12px;font:inherit;font-weight:700;margin:4px;";
        openWeek.addEventListener("click",function(){global.localStorage.setItem("pacificEducationTerm",termSelect.value);global.localStorage.setItem("pacificEducationWeek",weekSelect.value);global.localStorage.setItem("pacificEducationTeachingWeek",weekSelect.value);render(role,stepId,host,day);});
        scheduleNav.appendChild(openWeek);lessonPanel.appendChild(scheduleNav);populateWeeks();
        var intention = document.createElement("p"); intention.textContent="Learning intention: "+lesson.dailyLesson.learningIntention; lessonPanel.appendChild(intention);
        var levelObjective = document.createElement("p"); levelObjective.textContent=lessonLevel+" learning target: "+lesson.dailyLesson.classLevelObjective; lessonPanel.appendChild(levelObjective);
        var player=document.createElement("section");
        player.setAttribute("aria-label","Step-by-step lesson player");
        player.style.cssText="padding:12px;border:1px solid #9bb4c4;border-radius:8px;margin:10px 0;";
        var stepCounter=document.createElement("p"); stepCounter.setAttribute("aria-live","polite"); player.appendChild(stepCounter);
        var frameHeading=document.createElement("h5"); player.appendChild(frameHeading);
        var frameCaption=document.createElement("p"); frameCaption.style.cssText="font-size:1.05em;line-height:1.5;"; player.appendChild(frameCaption);
        var frameAction=document.createElement("p"); player.appendChild(frameAction);
        var frameNarration=document.createElement("p"); player.appendChild(frameNarration);
        var playerControls=document.createElement("div"); playerControls.style.cssText="display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;";
        var previousStep=document.createElement("button"); previousStep.type="button"; previousStep.textContent="← Previous step"; previousStep.style.cssText="padding:10px;font:inherit;"; playerControls.appendChild(previousStep);
        var nextStep=document.createElement("button"); nextStep.type="button"; nextStep.textContent="Next step →"; nextStep.style.cssText="padding:10px;font:inherit;font-weight:700;"; playerControls.appendChild(nextStep);
        var hearStep=document.createElement("button"); hearStep.type="button"; hearStep.textContent="▶ Hear this step"; hearStep.style.cssText="padding:10px;font:inherit;"; playerControls.appendChild(hearStep);
        var stopStep=document.createElement("button"); stopStep.type="button"; stopStep.textContent="Stop audio"; stopStep.style.cssText="padding:10px;font:inherit;"; playerControls.appendChild(stopStep);
        player.appendChild(playerControls);
        var activeStep=0;
        function paintLessonStep(){
          var step=lesson.dailyLesson.steps[activeStep];
          stepCounter.textContent="Step "+(activeStep+1)+" of "+lesson.dailyLesson.steps.length;
          frameHeading.textContent=step.mode;
          frameCaption.textContent=step.onScreen;
          frameAction.textContent="Your action: "+step.learnerAction;
          frameNarration.textContent="Read / narration: "+step.narration;
          previousStep.disabled=activeStep===0;
          nextStep.disabled=activeStep===lesson.dailyLesson.steps.length-1;
        }
        previousStep.addEventListener("click",function(){if(activeStep>0){activeStep-=1;paintLessonStep();}});
        nextStep.addEventListener("click",function(){if(activeStep<lesson.dailyLesson.steps.length-1){activeStep+=1;paintLessonStep();}});
        hearStep.addEventListener("click",function(){
          var step=lesson.dailyLesson.steps[activeStep];
          if(global.PacificEducationSpeech && typeof global.PacificEducationSpeech.speakText==="function") global.PacificEducationSpeech.speakText(step.narration,{allowRepeat:true});
          else {frameNarration.textContent="Audio unavailable. Read this narration or ask your teacher to read it aloud: "+step.narration;}
        });
        stopStep.addEventListener("click",function(){if(global.PacificEducationSpeech && typeof global.PacificEducationSpeech.stopSpeech==="function") global.PacificEducationSpeech.stopSpeech();});
        paintLessonStep();
        lessonPanel.appendChild(player);
        var textHeading=document.createElement("h5"); textHeading.textContent="Read the example"; lessonPanel.appendChild(textHeading);
        var passage=document.createElement("p"); passage.textContent=lesson.dailyLesson.learnerText.passage; lessonPanel.appendChild(passage);
        var model=document.createElement("p"); model.textContent="Worked example: "+lesson.dailyLesson.workedExample; lessonPanel.appendChild(model);
        var listen=document.createElement("button"); listen.type="button"; listen.textContent="▶ Listen to lesson"; listen.style.cssText="padding:10px 14px;margin:5px 8px 5px 0;font:inherit;font-weight:700;";
        listen.addEventListener("click",function(){
          if(global.PacificEducationSpeech && typeof global.PacificEducationSpeech.speakText==="function") global.PacificEducationSpeech.speakText(lesson.dailyLesson.audioNarration.transcript,{allowRepeat:true});
          else { var msg=document.createElement("p"); msg.textContent="Audio is unavailable here. Read the narration transcript or ask your teacher to read it aloud."; lessonPanel.appendChild(msg); }
        });
        lessonPanel.appendChild(listen);
        var stopListen=document.createElement("button"); stopListen.type="button"; stopListen.textContent="Stop audio"; stopListen.style.cssText="padding:10px 14px;margin:5px;font:inherit;";
        stopListen.addEventListener("click",function(){if(global.PacificEducationSpeech && typeof global.PacificEducationSpeech.stopSpeech==="function") global.PacificEducationSpeech.stopSpeech();});
        lessonPanel.appendChild(stopListen);
        var transcriptHeading=document.createElement("h5"); transcriptHeading.textContent="Audio transcript"; lessonPanel.appendChild(transcriptHeading);
        var transcript=document.createElement("p"); transcript.textContent=lesson.dailyLesson.audioNarration.transcript; lessonPanel.appendChild(transcript);
        var questionsHeading=document.createElement("h5"); questionsHeading.textContent="Try these questions"; lessonPanel.appendChild(questionsHeading);
        var questions=document.createElement("ol");
        lesson.questions.forEach(function(question){
          var q=document.createElement("li"); q.textContent=question.prompt;
          if(question.options && question.options.length){
            var choices=document.createElement("ul");
            question.options.forEach(function(option,index){var choice=document.createElement("li");choice.textContent=String.fromCharCode(65+index)+". "+option;choices.appendChild(choice);});
            q.appendChild(choices);
          }
          questions.appendChild(q);
        });
        lessonPanel.appendChild(questions);
        if (lesson.termLearningPlan) {
          var plan = lesson.termLearningPlan;
          var planSection = document.createElement("section");
          planSection.setAttribute("aria-label","Term learning pathway");
          planSection.style.cssText="margin:14px 0;padding:12px;border:1px solid #b7c9d6;border-radius:8px;";
          var planTitle=document.createElement("h5"); planTitle.textContent=plan.term+" pathway: "+plan.weeks+" weeks / "+plan.teachingDays+" daily learning slots"; planSection.appendChild(planTitle);
          var planNote=document.createElement("p"); planNote.textContent=plan.purpose+" Ability group: "+plan.abilityLabel+". "+plan.differentiation+" Official indicator mapping: "+plan.curriculumStatus+"."; planSection.appendChild(planNote);
          var weeksList=document.createElement("ol");
          plan.weeksPlan.forEach(function(weekPlan){var item=document.createElement("li");item.textContent=weekPlan.title+" — Day 1 introduce; Day 2 model; Day 3 guided practice; Day 4 apply independently; Day 5 review and evidence.";weeksList.appendChild(item);});
          planSection.appendChild(weeksList);
          lessonPanel.appendChild(planSection);
        }
        if (lesson.revisionPaper && lesson.revisionPaper.questions && lesson.revisionPaper.questions.length && lessonWeek === (lesson.termLearningPlan ? lesson.termLearningPlan.weeks : lessonWeek)) {
          var revisionSection=document.createElement("section");
          revisionSection.setAttribute("aria-label","End of term revision practice");
          revisionSection.style.cssText="margin:14px 0;padding:12px;border:1px solid #b7c9d6;border-radius:8px;";
          var revisionTitle=document.createElement("h5"); revisionTitle.textContent=lesson.revisionPaper.title+" ("+lesson.revisionPaper.questionCount+" questions)"; revisionSection.appendChild(revisionTitle);
          var revisionNote=document.createElement("p"); revisionNote.textContent="Practice paper from the final two teaching weeks. It is not an official examination paper; teacher review and syllabus mapping are required."; revisionSection.appendChild(revisionNote);
          var revisionQuestions=document.createElement("ol");
          lesson.revisionPaper.questions.forEach(function(question){var item=document.createElement("li");item.textContent=question.prompt;if(question.options&&question.options.length){var opts=document.createElement("ul");question.options.forEach(function(option,index){var opt=document.createElement("li");opt.textContent=String.fromCharCode(65+index)+". "+option;opts.appendChild(opt);});item.appendChild(opts);}revisionQuestions.appendChild(item);});
          revisionSection.appendChild(revisionQuestions);
          if (!learnerRole) {
            var keyDetails=document.createElement("details");
            var keySummary=document.createElement("summary"); keySummary.textContent="Teacher answer key and explanations"; keyDetails.appendChild(keySummary);
            var keyList=document.createElement("ol");
            lesson.revisionPaper.answerKey.forEach(function(entry){var item=document.createElement("li");item.textContent=entry.answer+" — "+entry.explanation;keyList.appendChild(item);});
            keyDetails.appendChild(keyList);revisionSection.appendChild(keyDetails);
          }
          lessonPanel.appendChild(revisionSection);
        } else if (lesson.termLearningPlan && lessonWeek < lesson.termLearningPlan.weeks) {
          var revisionLocked=document.createElement("p");revisionLocked.setAttribute("role","note");revisionLocked.textContent="Term revision and the practice examination become available in Week "+lesson.termLearningPlan.weeks+", after this term's scheduled daily activities.";lessonPanel.appendChild(revisionLocked);
        }
        if (lesson.practiceExamPaper && lesson.practiceExamPaper.questions && lesson.practiceExamPaper.questions.length && lessonWeek === (lesson.termLearningPlan ? lesson.termLearningPlan.weeks : lessonWeek)) {
          var examSection=document.createElement("section");examSection.setAttribute("aria-label","End of term practice examination");examSection.style.cssText="margin:14px 0;padding:12px;border:1px solid #b7c9d6;border-radius:8px;";
          var examTitle=document.createElement("h5");examTitle.textContent=lesson.practiceExamPaper.title+" ("+lesson.practiceExamPaper.questionCount+" questions)";examSection.appendChild(examTitle);
          var examNote=document.createElement("p");examNote.textContent="Mock practice only, not an official or past examination paper. Teacher review and syllabus mapping are required.";examSection.appendChild(examNote);
          var examQuestions=document.createElement("ol");lesson.practiceExamPaper.questions.forEach(function(question){var item=document.createElement("li");item.textContent=question.prompt;if(question.options&&question.options.length){var opts=document.createElement("ul");question.options.forEach(function(option,index){var opt=document.createElement("li");opt.textContent=String.fromCharCode(65+index)+". "+option;opts.appendChild(opt);});item.appendChild(opts);}examQuestions.appendChild(item);});examSection.appendChild(examQuestions);
          if (!learnerRole) {var examKey=document.createElement("details");var examKeySummary=document.createElement("summary");examKeySummary.textContent="Teacher answer key and explanations";examKey.appendChild(examKeySummary);var examKeyList=document.createElement("ol");lesson.practiceExamPaper.answerKey.forEach(function(entry){var item=document.createElement("li");item.textContent=entry.answer+" — "+entry.explanation;examKeyList.appendChild(item);});examKey.appendChild(examKeyList);examSection.appendChild(examKey);}
          lessonPanel.appendChild(examSection);
        }
        var alignment=document.createElement("p");
        var candidateIndicator=lesson.dailyLesson.curriculumAlignment.candidateIndicator;
        alignment.textContent="Curriculum trace: "+lesson.dailyLesson.curriculumAlignment.verificationStatus+". "+
          (candidateIndicator ? "Candidate indicator for teacher review: "+candidateIndicator.id+" — "+candidateIndicator.text+"; strand: "+candidateIndicator.strand+"; source status: "+candidateIndicator.sourceStatus+". This is not verified alignment." :
          "Exact official achievement indicator: not yet mapped; teacher review is required.");
        lessonPanel.appendChild(alignment);
        card.appendChild(lessonPanel);
      }
      } else {
        var unsupportedLesson = document.createElement("p");
        unsupportedLesson.setAttribute("role","note");
        unsupportedLesson.textContent="A dedicated see-read-hear lesson template is not available yet for "+requestedLessonSubject+". PacEdu will not substitute an English lesson. The approved activity above remains available; the teacher must supply and verify this subject's example and syllabus indicator.";
        card.appendChild(unsupportedLesson);
      }
    }
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
        currentAbility:activity.currentAbility || "", nextAbility:activity.nextAbility || "",
        nextLevelPractice:activity.nextLevelPractice || "", progressionLabel:activity.progressionLabel || "",
        priorKnowledgePrompt:activity.priorKnowledgePrompt || "", teachingExample:activity.teachingExample || "",
        guidedPractice:activity.guidedPractice || "", independentPractice:activity.independentPractice || "",
        feedbackPrompt:activity.feedbackPrompt || "", reteachRule:activity.reteachRule || "",
        masteryRule:activity.masteryRule || "", promotionRule:activity.promotionRule || "",
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
    getStudentActivity:function(day, context){return applyFourAbilityActivity(learnerActivity(day,context), context || {}, day);},
    getCurrentDemonstratedAbility:getCurrentDemonstratedAbility,
    roles:Object.freeze(Object.keys(ROLE_TASKS))
  });
})(window, document);
