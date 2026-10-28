/* PacEdu multi-subject daily worksheet library and teacher preview/print panel.
 * Original pilot content: differentiated by demonstrated skill, not age alone.
 * Day 1 is diagnostic evidence gathering; Days 2–365 are practice sequences.
 * Curriculum source alignment and teacher approval remain pending until verified.
 */
(function (global, document) {
  "use strict";
  var LEVELS = ["ECE"];
  for (var i = 1; i <= 8; i += 1) LEVELS.push("Class " + i);
  for (var form = 3; form <= 7; form += 1) LEVELS.push("Form " + form);
  var ABILITIES = [
    ["support", "Supported start"],
    ["developing", "Developing"],
    ["expected", "Working at current class goal"],
    ["extension", "Extension / deeper challenge"]
  ];
  var SUBJECTS = [
    ["English", "English"], ["Mathematics", "Mathematics"], ["Science", "Science"],
    ["Social Studies", "Social Studies"], ["Healthy Living", "Healthy Living"],
    ["Physical Education", "Physical Education"], ["Arts and Crafts", "Arts and Crafts"],
    ["Music", "Music"], ["Digital Literacy", "Digital Literacy"],
    ["iTaukei Language", "iTaukei Language"], ["Hindi", "Hindi"]
  ];
  function subjectTasksFor(subject, stage, ability, topic) {
    var tasks = {
      "English": {
        early:["Name, point to, sign, or select two things in the picture; communicate one detail.","Listen to or read a short sentence and match it to a picture or object.","Retell one part using words, signs, pictures, or communication support."],
        foundation:["Identify who or what the passage is about.","Find one word or sentence that supports an answer.","Write, dictate, sign, or select one clear sentence about the topic."],
        middle:["State the main idea and select two supporting details.","Explain one word using clues from the passage.","Write a short paragraph and revise one sentence using feedback."],
        junior:["Summarise the passage and distinguish fact from opinion where possible.","Point to evidence for an inference and explain the connection.","Write a structured paragraph with claim, evidence, and explanation."],
        senior:["Analyse the central claim, audience, and strength of evidence.","Identify an assumption or limitation affecting interpretation.","Write a reasoned response considering an alternative interpretation."]
      },
      "Mathematics": {
        early:["Count or move objects to show a small group.","Match numerals to quantities and show how you counted.","Make a group with one more or one less and compare."],
        foundation:["Use counters, drawings, or number sentences to solve the sharing problem.","Show the calculation in two ways and check the answer.","Create a similar sharing problem using classroom objects."],
        middle:["Represent the problem with a diagram and calculation.","Explain why the operation fits and estimate the result.","Change one number and describe how the answer changes."],
        junior:["Show a complete solution and define the quantities used.","Check the result using an inverse operation or second strategy.","Create a related problem and explain its assumptions."],
        senior:["Compare two solution methods for efficiency and accuracy.","State assumptions, units, and limits on the result.","Extend the problem, solve it, and justify the method."]
      },
      "Science": {
        early:["Observe the plant or picture and communicate one thing you notice.","Sort picture cards into same and different.","Predict what might happen next and show or tell why."],
        foundation:["Identify what changes and what stays the same in the investigation.","Record observations using words, pictures, marks, or an accessible format.","Compare a prediction with observed evidence."],
        middle:["Name the variable changed and the conditions kept the same.","Record results in a simple table or labelled drawing.","Write a conclusion and identify one possible source of error."],
        junior:["Form a testable question and identify variables to change and control.","Explain how repeated observations could improve reliability.","Use results to support a conclusion and suggest a fair-test improvement."],
        senior:["Evaluate method, controls, sample size, and possible bias.","Separate observed results from explanations inferred from them.","Propose a revised investigation and justify how it strengthens evidence."]
      },
      "Social Studies": {
        early:["Identify a shared place in a picture or local community.","Show one safe way to care for that place.","Role-play or communicate how to seek help with a problem."],
        foundation:["Name two shared places and one responsibility for each.","Sort helpful and harmful actions and explain one choice.","Suggest a fair class rule for caring for a shared place."],
        middle:["Describe a community issue and identify who is affected.","Compare two possible responses and one benefit of each.","Plan a small action and decide how to review its effect."],
        junior:["Identify different stakeholder viewpoints in a local issue.","Separate evidence from opinion and identify a missing perspective.","Recommend an action considering fairness, resources, and consequences."],
        senior:["Analyse causes and effects using more than one perspective.","Evaluate the reliability and limits of information sources.","Defend a practical recommendation and address a counterargument."]
      },
      "Healthy Living": {
        early:["Choose a picture showing a healthy routine and communicate why.","Practise the routine using pretend items or safe demonstration.","Identify a trusted adult who can help when unwell or unsafe."],
        foundation:["Put a handwashing or safe-water routine in the correct order.","Identify a barrier to the routine and ask for support.","Make a simple daily healthy-routine plan."],
        middle:["Explain how a daily choice can affect wellbeing and safety.","Compare two routines and identify which is safer and why.","Create a realistic reminder and decide how to check its usefulness."],
        junior:["Explain links between a health choice, risk, and protective action.","Assess a health message for evidence and misleading claims.","Develop an inclusive routine for different needs."],
        senior:["Evaluate a health claim and distinguish evidence from unsupported advice.","Analyse social or environmental barriers without blaming individuals.","Propose an evidence-informed action and a way to evaluate its impact."]
      },
      "Physical Education": {
        early:["Practise or adapt one safe movement in a clear space.","Identify a stop signal and demonstrate how to respond.","Take turns in a movement game and communicate how it felt."],
        foundation:["Perform or adapt a warm-up movement safely.","Follow a short movement sequence and identify the next step.","Describe one way to include a teammate with different movement needs."],
        middle:["Practise a skill and record one strength and one next step.","Apply a game rule and explain how it supports safety or fairness.","Adapt the activity so everyone can participate."],
        junior:["Set a specific skill goal and record practice evidence.","Analyse how technique, space, rules, or teamwork affected performance.","Suggest an adjustment that improves safety, inclusion, or fair play."],
        senior:["Design a safe practice plan with a measurable goal and review point.","Use observation evidence to evaluate performance and note limitations.","Justify adaptations for different participants and risks."]
      },
      "Arts and Crafts": {
        early:["Choose materials by texture, shape, or colour and communicate the choice.","Make a simple design using safe materials or an accessible alternative.","Show one feature of the finished work and what it represents."],
        foundation:["Sketch or arrange a design before making it.","Test how two materials or shapes fit and adjust the design.","Explain one choice made during the making process."],
        middle:["Create a design communicating an idea using two elements.","Test the construction and record one change after checking it.","Evaluate the finished work against its purpose."],
        junior:["Plan a prototype and identify materials, constraints, and safety needs.","Test the prototype, document a problem, and revise it.","Explain how form, material, and audience influence the design."],
        senior:["Compare design concepts against clear criteria.","Evaluate material use, accessibility, durability, and environmental impact.","Present a justified design and reflect on trade-offs."]
      },
      "Music": {
        early:["Show a steady beat by tapping, moving, or indicating it.","Copy a short sound or movement pattern and take a turn leading.","Choose or communicate a sound matching a mood or idea."],
        foundation:["Repeat a short rhythm pattern using an accessible mode.","Identify when a pattern repeats or changes.","Create and share a two-part pattern."],
        middle:["Perform or record a rhythm and mark its repeated section.","Compare two patterns and describe how they differ.","Create a short piece with a clear beginning and ending."],
        junior:["Use rhythm, tempo, dynamics, or texture in a short composition.","Explain how a musical choice changes the effect on a listener.","Revise the piece after feedback and describe the improvement."],
        senior:["Analyse how musical elements support mood, structure, or meaning.","Compare interpretations using audible or notated evidence.","Plan a piece for a stated audience and justify artistic choices."]
      },
      "Digital Literacy": {
        early:["Sort picture cards into public and private information.","Practise asking a trusted adult before opening an unfamiliar link.","Show one safe way to use a device or shared resource."],
        foundation:["Identify personal information that should not be posted publicly.","Compare a trusted class resource with an unfamiliar message.","Create a safe-use reminder using text, drawing, or symbols."],
        middle:["Check a source for author, date, purpose, and supporting evidence.","Identify a suspicious-message feature and a safe next step.","Explain why passwords and private details should not be shared."],
        junior:["Compare two sources and justify which is more reliable.","Explain how to verify a potentially misleading message.","Draft a safe digital workflow that protects personal information."],
        senior:["Evaluate source credibility, bias, evidence, and currency.","Analyse a privacy or security scenario and propose safeguards.","Design a digital-literacy guide and justify its advice."]
      },
      "iTaukei Language": {
        early:["With teacher-verified local examples, match a familiar word to an object.","Respond to a short greeting in an accessible communication mode.","Select or indicate one familiar expression with support."],
        foundation:["Use verified iTaukei words to match familiar objects and actions.","Identify the meaning of a locally checked phrase.","Create a simple response using verified vocabulary."],
        middle:["Identify the main idea of a locally verified short text.","Identify familiar vocabulary in context and ask about an unfamiliar word.","Compose a short response using teacher-reviewed examples."],
        junior:["Summarise a verified text and support the summary with details.","Discuss expressions only where accurate local resources are available.","Prepare a response and review language accuracy with the teacher."],
        senior:["Analyse purpose, audience, and meaning in a verified text.","Discuss language variation using locally validated examples.","Revise a response with a fluent speaker or qualified teacher checking accuracy."]
      },
      "Hindi": {
        early:["With teacher-verified Hindi examples, match a familiar word to an object.","Respond to a short greeting in an accessible communication mode.","Select or indicate one familiar expression with support."],
        foundation:["Use verified Hindi words to match familiar objects and actions.","Identify the meaning of a locally checked phrase.","Create a simple response using verified vocabulary."],
        middle:["Identify the main idea of a teacher-verified short text.","Identify familiar vocabulary in context and ask about an unfamiliar word.","Compose a short response using teacher-reviewed examples."],
        junior:["Summarise a verified text and support the summary with details.","Discuss word choice using accurate examples and suitable references.","Prepare a response and review language accuracy with the teacher."],
        senior:["Analyse purpose, audience, and meaning in a verified text.","Compare interpretations using evidence and reliable language references.","Revise a response with a proficient speaker or qualified teacher checking accuracy."]
      }
    };
    var stageKey = stage === "early" ? "early" : stage === "foundation" ? "foundation" : stage === "middle" ? "middle" : stage === "junior-secondary" ? "junior" : "senior";
    var selected = (tasks[subject] || tasks.English)[stageKey].slice();
    if (ability === "support") selected[0] = "Supported start: " + selected[0] + " The teacher may model the first step and offer accessible choices.";
    if (ability === "developing") selected[1] += " Offer one hint if needed, then allow an independent attempt.";
    if (ability === "expected") selected[2] += " Complete independently where possible and show the evidence or process.";
    if (ability === "extension") selected[2] += " Extension: compare an alternative and justify which is more effective.";
    selected.push("Teacher records: independent / with support / not yet demonstrated / not observed, then gives one specific next step.");
    return selected;
  }
  function subjectActivity(subject, level, ability, day, stage, topic) {
    var bank = {
      "English": {topic:"Reading comprehension and communication", passage:"Read the short text carefully. A class group planned a useful activity. Each learner shared an idea, listened to others, and checked the information before making a decision. They explained their choice with details from the text.", qs:[["What did the learners do before deciding?","They checked information","They left the class","They ignored each other","They guessed without listening",0],["Which action shows cooperation?","Listening to others","Hiding the plan","Skipping the task","Changing the topic",0],["What supports a good answer?","Details from the text","A random guess","The longest option","A friend’s name",0]]},
      "Mathematics": {topic:"Everyday problem solving", passage:"A school group has 24 books to share equally among 4 tables. Each table should receive the same number of books. Learners can use grouping, drawing, repeated subtraction, or division to show their thinking.", qs:[["How many books go to each table?","4","5","6","8",2],["Which operation can solve the sharing problem?","Division","Only addition","Spelling","Drawing letters",0],["How many books are shared altogether?","20","24","28","4",1]]},
      "Science": {topic:"Observation and fair testing", passage:"A learner places one plant in sunlight and another similar plant in a dark cupboard. Both plants receive the same amount of water. The learner records changes each day and compares the results.", qs:[["What is the learner comparing?","Plants in different light conditions","Two kinds of books","Different classroom sounds","Two maps",0],["What should stay the same for a fair test?","Amount of water","Light condition","Plant location","The question",0],["Why record changes each day?","To track evidence over time","To decorate the page","To avoid observing","To guess the result",0]]},
      "Social Studies": {topic:"Community and shared responsibility", passage:"People in a community use shared spaces such as roads, markets, parks, and schools. Community members can keep these places safe by following agreed rules, caring for facilities, and listening respectfully when problems are discussed.", qs:[["Which is a shared community space?","A public park","A private diary","One person’s pocket","A personal password",0],["What helps solve community problems?","Respectful discussion","Ignoring everyone","Damaging facilities","Spreading rumours",0],["Who can help care for shared spaces?","Community members","Only visitors","Nobody","Only children",0]]},
      "Healthy Living": {topic:"Healthy daily choices", passage:"Healthy routines include drinking safe water, eating a variety of foods, washing hands with soap, resting, and asking a trusted adult for help when unwell. Different people may need different support to follow a routine.", qs:[["When is handwashing with soap useful?","Before eating and after using the toilet","Only once a month","Never","Only when playing",0],["Which is a healthy routine?","Drinking safe water","Skipping all rest","Sharing dirty cups","Ignoring illness",0],["Who can a learner ask for help when unwell?","A trusted adult","A stranger online","Nobody","An unknown caller",0]]},
      "Physical Education": {topic:"Movement, safety and teamwork", passage:"Before a game, the class checks the playing area, listens to the rules, and warms up gently. During play, learners take turns, respect boundaries, and stop if someone is hurt or feels unsafe.", qs:[["Why warm up before activity?","To prepare the body for movement","To avoid all movement","To make rules disappear","To choose a winner early",0],["What should learners do if someone is hurt?","Stop and get appropriate help","Continue regardless","Hide the injury","Blame a teammate",0],["Which behaviour supports teamwork?","Taking turns","Refusing every turn","Ignoring safety rules","Changing rules secretly",0]]},
      "Arts and Crafts": {topic:"Planning and making", passage:"An artist plans a design, chooses suitable materials, and tests how pieces fit together. The artist works safely, reuses useful materials where possible, and explains how the finished work communicates an idea.", qs:[["What should happen before making?","Plan the design","Throw away all materials","Ignore the idea","Skip safety",0],["Why test how pieces fit?","To check whether the design works","To make the task longer","To hide the materials","To avoid planning",0],["What can an artwork communicate?","An idea","Only a number","Nothing by definition","A timetable only",0]]},
      "Music": {topic:"Rhythm and listening", passage:"A group practises a steady beat by clapping or tapping. They listen for when the pattern repeats and take turns leading. Learners who do not clap can tap, use an instrument, move, or indicate the beat another accessible way.", qs:[["What is a steady beat?","A regular pulse","A silent picture","A written paragraph","A random page",0],["What should group members do?","Listen and take turns","Play over everyone","Ignore the pattern","Stop all practice",0],["How can learners show the beat accessibly?","Tap, move, use an instrument, or indicate it","Only clap","Only write an essay","No response is allowed",0]]},
      "Digital Literacy": {topic:"Safe and responsible technology use", passage:"Before sharing information online, a learner checks whether the source is trustworthy and whether personal details are included. Strong passwords should be private. If a message seems suspicious, the learner asks a trusted adult or teacher.", qs:[["What should remain private?","A password","A public weather report","A class topic","A library title",0],["What should you do with a suspicious message?","Check with a trusted adult or teacher","Share it with everyone","Send your password","Click every link",0],["Why check a source?","To judge whether information is trustworthy","To make the screen brighter","To skip reading","To reveal private details",0]]},
      "iTaukei Language": {topic:"Language, listening and expression", passage:"Learners practise understanding a short message, identifying familiar words, and responding respectfully. The teacher should select accurate iTaukei words and examples appropriate to the local dialect and lesson goal; this template does not invent translations.", qs:[["What should the teacher verify before use?","Accuracy of the language examples","The page colour only","The longest answer","Nothing",0],["What skill is practised?","Listening and expression","Only multiplication","Plant growth","Running speed",0],["How should a learner respond?","In an accessible agreed way","Only in one fixed mode","Without understanding","By guessing every time",0]]},
      "Hindi": {topic:"Language, reading and expression", passage:"Learners practise understanding a short message, identifying familiar words, and responding respectfully. The teacher should provide accurate Hindi text and examples appropriate to the learners and lesson goal; this template does not invent translations.", qs:[["What should the teacher verify before use?","Accuracy of the language examples","The page colour only","The longest answer","Nothing",0],["What skill is practised?","Reading and expression","Only multiplication","Plant growth","Running speed",0],["How should a learner respond?","In an accessible agreed way","Only in one fixed mode","Without understanding","By guessing every time",0]]}
    };
    var item = bank[subject] || bank.English;
    var stagePassage = item.passage;
    if (stage === "early") stagePassage = "Look at the picture and talk about the activity. " + item.passage.split(".").slice(0,2).join(".") + ".";
    else if (stage === "foundation") stagePassage = item.passage.split(".").slice(0,3).join(".") + ".";
    else if (stage === "junior-secondary" || stage === "senior") stagePassage += " Explain why the evidence matters, identify one limitation, and suggest a practical improvement for a real situation in your school or community.";
    if (ability === "support") stagePassage = "Read or listen with support. " + stagePassage;
    if (ability === "extension") stagePassage += " Extension: compare another possible approach and justify which option is most effective, using evidence.";
    var questions = item.qs.map(function(q,i){ return {number:i+1,type:"multiple-choice",prompt:q[0],options:q.slice(1,5),answerIndex:q[5],answer:q[q[5]+1]}; });
    return {subject:subject,topic:item.topic,readingText:stagePassage,questions:questions,
      tasks:subjectTasksFor(subject, stage, ability, topic),
      answerKey:questions.map(function(q){return {number:q.number,answer:q.answer};}),
      abilityGuidance:({support:"Teacher models the first item; offer read-aloud, picture/word cues, fewer choices at a time, and a sentence frame.",developing:"Learner attempts independently first; offer one hint or word bank if needed.",expected:"Learner answers independently and points to evidence or shows working.",extension:"Learner justifies answers, creates a similar question, or evaluates an alternative."})[ability],
      teacherReview:"Teacher checks each response, records independent / with support / not yet demonstrated / not observed, gives feedback, and confirms the next step. This sample content needs local curriculum and language review before classroom use.",
      status:"PENDING_TEACHER_REVIEW"};
  }
  function makeWorksheet(level, ability, day, subject) {
    var selectedSubject = SUBJECTS.some(function(s){return s[0]===subject;}) ? subject : "English";
    var worksheet = makeEnglishWorksheet(level, ability, day);
    worksheet.subject = selectedSubject;
    if (day !== 1 && selectedSubject !== "English") {
      var content = subjectActivity(selectedSubject, level, ability, day, stageFor(classNumber(level)), topicFor(day));
      Object.keys(content).forEach(function(k){worksheet[k]=content[k];});
      worksheet.title = "Day " + day + " — " + selectedSubject + " Activity — " + level + " — " + labelAbility(ability);
      worksheet.picturePrompt = "Illustration prompt: learners exploring " + selectedSubject.toLowerCase() + " through a safe, age-appropriate classroom activity."; 
    } else if (day === 1 && selectedSubject !== "English") {
      worksheet.subject = selectedSubject;
      worksheet.title = "Day 1 — " + selectedSubject + " Initial Ability Check — " + level;
      worksheet.topic = selectedSubject + " baseline observation";
      worksheet.tasks = ["Complete a short teacher-selected task for " + selectedSubject + " using an accessible response mode.","Show what you can do independently, then try one supported example.","Teacher records evidence, support needed, and skills not yet observed."];
      worksheet.questionPlan = {
        count: worksheet.tasks.length,
        types: ["initial-observation"],
        questions: worksheet.tasks.map(function (task, index) {
          return { number: index + 1, type: "initial-observation", prompt: task, topic: worksheet.topic, thinkingFocus: "observe-and-record" };
        }),
        note: "Subject-specific initial observation; teacher supplies the genuine class-appropriate task."
      };
      worksheet.teacherCheck = "Teacher must select a genuine class-appropriate " + selectedSubject + " diagnostic task, record evidence, and confirm the learner pathway. This generic prompt is not a scored assessment."; 
    }
    if (day !== 1 && selectedSubject === "English") {
      var englishContent = subjectActivity("English", level, ability, day, stageFor(classNumber(level)), topicFor(day));
      worksheet.questions = englishContent.questions;
      worksheet.answerKey = englishContent.answerKey;
      worksheet.abilityGuidance = englishContent.abilityGuidance;
      worksheet.teacherReview = englishContent.teacherReview;
    }
    return worksheet;
  }
  var TOPICS = [
    "Greetings and introductions", "Sounds and letters", "Everyday words",
    "Sentence building", "People and community", "Instructions and sequence",
    "Describing words", "Reading for meaning", "Questions and answers",
    "Paragraph organisation", "Vocabulary in context", "Review and reflection"
  ];
  function clampDay(day) { return Math.max(1, Math.min(365, Math.floor(Number(day) || 1))); }
  function classNumber(level) {
    var s = String(level || "").trim();
    if (/^(ece|kindergarten)$/i.test(s)) return -1;
    var m = s.match(/(?:class|year)\s*(\d+)/i);
    if (m) return Math.max(1, Math.min(8, Number(m[1])));
    var form = s.match(/form\s*(\d+)/i);
    if (form) return Math.max(9, Math.min(13, Number(form[1]) + 6));
    return 1;
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
  function picturePromptFor(topic, stage) {
    var t = String(topic || "reading").toLowerCase();
    if (/water|environment|community|people/.test(t)) return "Illustration prompt: learners caring for their community and environment.";
    if (/sound|letter|word|vocabulary/.test(t)) return "Illustration prompt: a learner exploring letters, words, and a book.";
    if (/sequence|instruction/.test(t)) return "Illustration prompt: three simple panels showing an activity in order.";
    if (/question|reading|meaning|review/.test(t)) return "Illustration prompt: a learner reading a passage and thinking about its meaning.";
    if (/sentence|paragraph|describing/.test(t)) return "Illustration prompt: a learner building a sentence from word cards.";
    return stage === "early"
      ? "Illustration prompt: a child exploring a familiar object with a teacher."
      : "Illustration prompt: learners working together on a class reading task.";
  }
  function renderPicturePrompt(parent, topic, stage) {
    var figure = node("figure", null, parent);
    figure.style.cssText = "margin:12px 0;padding:12px;border:1px solid #cbd5e1;border-radius:8px;background:#f8fafc;color:#111827;";
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 320 120");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", picturePromptFor(topic, stage));
    svg.style.cssText = "display:block;width:100%;max-width:320px;height:auto;margin:auto;";
    function shape(tag, attrs) {
      var el = document.createElementNS("http://www.w3.org/2000/svg", tag);
      Object.keys(attrs).forEach(function (key) { el.setAttribute(key, attrs[key]); });
      svg.appendChild(el); return el;
    }
    shape("rect", {x:1,y:1,width:318,height:118,rx:10,fill:"#eaf5ff",stroke:"#94a3b8"});
    shape("circle", {cx:275,cy:25,r:13,fill:"#fbbf24"});
    shape("path", {d:"M20 95 Q55 76 90 95 T160 95 T230 95 T300 95",fill:"none",stroke:"#65a30d","stroke-width":3});
    shape("rect", {x:94,y:38,width:54,height:48,rx:3,fill:"#ffffff",stroke:"#2563eb","stroke-width":2});
    shape("path", {d:"M121 40 V84 M98 47 Q110 44 121 50 Q132 44 144 47 V80 Q132 77 121 83 Q110 77 98 80 Z",fill:"none",stroke:"#2563eb","stroke-width":2});
    shape("circle", {cx:55,cy:48,r:12,fill:"#f2c9a5",stroke:"#7c4a2d"});
    shape("path", {d:"M39 83 Q40 62 55 62 Q70 62 71 83 Z",fill:"#0f766e",stroke:"#115e59","stroke-width":2});
    shape("path", {d:"M74 66 L91 57",stroke:"#7c4a2d","stroke-width":4,"stroke-linecap":"round"});
    var caption = node("figcaption", picturePromptFor(topic, stage), figure);
    caption.style.cssText = "margin-top:8px;font-size:0.95em;";
    figure.insertBefore(svg, caption);
    return figure;
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
      picturePrompt: picturePromptFor("familiar learning", stage),
      topic: "Baseline observation (not a pass/fail exam)",
      instructions: "Teacher: use this short diagnostic to identify the learner's current demonstrated skills. Offer accessible response modes and record evidence, not assumptions. Do not assign a permanent level from one task. Mark each item: independent / with support / not yet demonstrated / not observed. This is not a pass/fail exam.",
      tasks: tasks,
      questionPlan: {
        count: tasks.length,
        types: ["initial-observation"],
        questions: tasks.map(function (task, index) {
          return { number: index + 1, type: "initial-observation", prompt: task, topic: "Baseline observation", thinkingFocus: "observe-and-record" };
        }),
        note: "Initial ability check: record evidence only; this is not a scored question plan."
      },
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
  function makeEnglishWorksheet(level, ability, day) {
    level = /^kindergarten$/i.test(String(level || "").trim()) ? "ECE" : (LEVELS.indexOf(String(level)) >= 0 ? String(level) : "Class 1");
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
      questionPlan: questionPlan,
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
  function storedWorksheetAbility() {
    var capability = "", source = "no saved capability";
    try {
      var roster = global.PacificEducationTeacherClassRosterContext;
      var classId = roster && typeof roster.getClassId === "function" ? String(roster.getClassId() || "").trim() : "";
      var studentContext = global.PacificEducationStudentCoverageContext;
      var studentId = studentContext && typeof studentContext.getStudentId === "function" ? String(studentContext.getStudentId() || "").trim() : "";
      if (classId && studentId) {
        capability = String(global.localStorage.getItem("pacificEducationCapability:student:" +
          encodeURIComponent(classId) + ":" + encodeURIComponent(studentId)) || "").toLowerCase();
        if (capability) source = "student assessment";
      }
      if (classId && !capability) {
        capability = String(global.localStorage.getItem("pacificEducationCapability:" + classId) || "").toLowerCase();
        if (capability) source = "class assessment";
      } else if (!classId) {
        capability = String(global.localStorage.getItem("pacificEducationCapability") || "").toLowerCase();
        if (capability) source = "saved learning capability";
      }
    } catch (e) {}
    var mapped = {
      support: "support",
      foundation: "support",
      remedial: "support",
      developing: "developing",
      expected: "expected",
      advanced: "extension",
      extension: "extension"
    }[capability];
    if (mapped) return { ability: mapped, source: source, capability: capability, hasEvidence: source === "student assessment" || source === "class assessment" || source === "saved learning capability" };
    try {
      var saved = String(global.localStorage.getItem("paceduEnglishWorksheetAbility") || "").toLowerCase();
      if (["support", "developing", "expected", "extension"].indexOf(saved) >= 0) {
        return { ability: saved, source: "saved worksheet choice", capability: "", hasEvidence: true };
      }
    } catch (e) {}
    return { ability: "initial-assessment", source: "no saved learner evidence; Day 1 check required", capability: "", hasEvidence: false };
  }
  function addTeacherPanel(card) {
    if (!card || card.querySelector("#paceduEnglishWorksheetBuilder")) return;
    var openButton = node("button", "📘 English — Daily Activities for All Classes", card);
    openButton.id = "paceduOpenEnglishDailyActivities";
    openButton.type = "button";
    openButton.setAttribute("aria-expanded", "false");
    openButton.style.cssText = "display:block;width:100%;min-height:48px;margin:12px 0;padding:12px;text-align:left;font-weight:700;border:2px solid #2563eb;border-radius:8px;background:#eff6ff;color:#111827;";
    card.insertBefore(openButton, card.children[1] || null);
    var panel = node("section", null, card);
    panel.id = "paceduEnglishWorksheetBuilder";
    panel.hidden = true;
    panel.style.cssText = "margin-top:18px;padding:14px;border:2px solid #2563eb;border-radius:10px;";
    card.insertBefore(panel, openButton.nextSibling);
    openButton.addEventListener("click", function () {
      panel.hidden = !panel.hidden;
      openButton.setAttribute("aria-expanded", panel.hidden ? "false" : "true");
      openButton.textContent = panel.hidden ? "📚 All Subjects — Daily Activities" : "📚 Close Daily Activities";
      if (!panel.hidden) panel.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    node("h3", "Daily Subject Worksheets — Preview Before Printing", panel);
    node("p", "Daily practice is available for ECE, Classes 1–8 and Forms 3–7 across the listed subjects. Choose a subject, class/form, term, week, day and evidence-based ability band. Day 1 is a separate initial ability check. Activities are original practice drafts until the current Fiji syllabus outcomes are verified by an educator.", panel);
    var subjectSelect = addSelect(panel, "Subject", "paceduDailySubject", SUBJECTS, "English");
    var levelDefault = global.localStorage.getItem("pacificEducationLevel") || "Class 1";
    if (/^kindergarten$/i.test(levelDefault)) levelDefault = "ECE";
    if (LEVELS.indexOf(levelDefault) < 0) levelDefault = "Class 1";
    var levelOptions = LEVELS.map(function (v) { return [v, v]; });
    var levelSelect = addSelect(panel, "Class / level", "paceduEnglishWorksheetLevel", levelOptions, levelDefault);
    var retrievedAbility = storedWorksheetAbility();
    var abilitySelect = addSelect(panel, "Ability (choose from observed evidence)", [["initial-assessment","Day 1 initial ability check"],["support","Supported start"],["developing","Developing"],["expected","Working at current class goal"],["extension","Extension / deeper challenge"]], "paceduEnglishWorksheetAbility", retrievedAbility.ability);
    /* Defensive recovery: some embedded/mobile browsers or prior page scripts can
       leave a select visible but with its options removed. Keep this control
       self-contained; ability bands are explicit teacher choices, not a roster
       lookup, and must remain available offline. */
    var abilityChoices = [
      ["initial-assessment", "Day 1 initial ability check"],
      ["support", "Supported start"],
      ["developing", "Developing"],
      ["expected", "Working at current class goal"],
      ["extension", "Extension / deeper challenge"]
    ];
    if (!abilitySelect || !abilitySelect.options || abilitySelect.options.length !== abilityChoices.length) {
      if (abilitySelect) {
        abilitySelect.textContent = "";
        abilityChoices.forEach(function (choice) {
          var option = document.createElement("option");
          option.value = choice[0];
          option.textContent = choice[1];
          abilitySelect.appendChild(option);
        });
      }
    }
    if (abilitySelect) {
      abilitySelect.setAttribute("aria-label", "Ability level retrieved from saved learning evidence; teacher may adjust");
      abilitySelect.setAttribute("required", "required");
      abilitySelect.style.cssText = "display:block!important;visibility:visible!important;position:relative;width:100%;min-height:46px;box-sizing:border-box;padding:10px;margin-top:4px;font:inherit;color:#111;background:#fff;border:2px solid #2563eb;border-radius:6px;opacity:1;";
    }
    var abilityStatus = node("p", retrievedAbility.hasEvidence ? "Retrieved category: " + labelAbility(retrievedAbility.ability) + " (" + retrievedAbility.source + "). Change it only when current learner evidence supports a different band." : "No saved learner evidence yet. Day 1 is the initial ability check; do not infer a band from a default.", panel);
    abilityStatus.id = "paceduEnglishWorksheetAbilityStatus";
    abilityStatus.setAttribute("role", "status");
    abilityStatus.setAttribute("aria-live", "polite");
    abilityStatus.style.cssText = "margin:6px 0;color:#374151;font-size:0.95em;";
    var abilityInfo = node("div", null, panel);
    abilityInfo.id = "paceduEnglishWorksheetAbilityInfo";
    abilityInfo.setAttribute("role", "status");
    abilityInfo.setAttribute("aria-live", "polite");
    abilityInfo.style.cssText = "margin:8px 0 12px;padding:12px;border:1px solid #93c5fd;border-left:5px solid #2563eb;border-radius:8px;background:#eff6ff;color:#111827;line-height:1.5;";
    var abilityDescriptions = {
      "initial-assessment": "Day 1 check: observe what the learner can do now. Record evidence; do not assign a band from one task.",
      support: "Supported start: use a teacher model, pictures or objects, a word bank, a sentence frame, and guided practice.",
      developing: "Developing: the learner is building the skill. Invite an independent attempt first, then offer a hint or word bank if needed.",
      expected: "Working at current class goal: practise the current learning goal, then check the work against clear success criteria.",
      extension: "Extension / deeper challenge: after the core task, ask the learner to explain reasoning, compare alternatives, or create a new example."
    };
    function showAbilityInfo() {
      var selected = abilitySelect.value || "initial-assessment";
      abilityInfo.textContent = "About this ability: " + (abilityDescriptions[selected] || abilityDescriptions["initial-assessment"]);
      abilityInfo.style.display = "block";
      abilityInfo.style.visibility = "visible";
    }
    abilitySelect.addEventListener("click", showAbilityInfo);
    abilitySelect.addEventListener("focus", showAbilityInfo);
    abilitySelect.addEventListener("change", showAbilityInfo);
    abilitySelect.addEventListener("input", showAbilityInfo);
    abilitySelect.addEventListener("pointerup", showAbilityInfo);
    showAbilityInfo();

    var dayLabel = node("label", "Teaching day (1–365)", panel);
    dayLabel.style.cssText = "display:block;margin:8px 0;font-weight:600;";
    var dayInput = node("input", null, dayLabel); dayInput.id = "paceduEnglishWorksheetDay"; dayInput.type = "number"; dayInput.min = "1"; dayInput.max = "365"; dayInput.step = "1";
    dayInput.value = String(Math.max(1, Math.min(365, Number(global.localStorage.getItem("currentDayNumber") || 1) || 1)));
    dayInput.style.cssText = "display:block;width:100%;box-sizing:border-box;min-height:42px;padding:8px;margin-top:4px;font:inherit;";

    /* English uses the term/week/day curriculum planner. The legacy day-number
       field remains available for other subject previews and is hidden for English. */
    var scheduleControls = node("div", null, panel);
    scheduleControls.id = "paceduEnglishCurriculumScheduleControls";
    scheduleControls.style.cssText = "margin:10px 0;padding:12px;border:1px solid #93c5fd;border-radius:8px;background:#f8fbff;";
    var termSelect = addSelect(scheduleControls, "Term / learning block", "paceduEnglishWorksheetTerm", [
      ["T1","Term 1"],["T2","Term 2"],["T3","Term 3"],
      ["ASSESSMENT","Assessment window"],["INTERVENTION","Intervention"],["REVISION","Revision"],["EXAMS","School-approved examination period"]
    ], "T1");
    var weekSelect = addSelect(scheduleControls, "Week", "paceduEnglishWorksheetWeek", [["1","Week 1"]], "1");
    var weekDaySelect = addSelect(scheduleControls, "Teaching day in week (1–5)", "paceduEnglishWorksheetWeekDay", [
      ["1","Day 1"],["2","Day 2"],["3","Day 3"],["4","Day 4"],["5","Day 5"]
    ], "1");
    var initialCheckRow = node("label", null, scheduleControls);
    initialCheckRow.style.cssText = "display:flex;align-items:center;gap:8px;margin:10px 0;font-weight:600;";
    var initialCheckToggle = node("input", null, initialCheckRow);
    initialCheckToggle.type = "checkbox";
    initialCheckToggle.id = "paceduEnglishInitialAbilityCheck";
    initialCheckToggle.style.cssText = "width:22px;height:22px;flex:0 0 auto;";
    initialCheckRow.appendChild(document.createTextNode("Preview Day 1 initial ability check"));
    node("p", "The initial ability check is separate. These choices select a practice slot; they do not certify an official Fiji term timetable or achievement indicator.", scheduleControls)
      .style.cssText = "font-size:.92em;margin:8px 0;color:#334155;";
    function syncScheduleControls() {
      var block = termSelect.value;
      var maximum = ({T1:10,T2:10,T3:5,ASSESSMENT:1,INTERVENTION:5,REVISION:2,EXAMS:2})[block] || 1;
      var prior = Number(weekSelect.value) || 1;
      weekSelect.textContent = "";
      for (var wi = 1; wi <= maximum; wi += 1) {
        var option = node("option", "Week " + wi, weekSelect);
        option.value = String(wi);
      }
      weekSelect.value = String(Math.min(prior, maximum));
      scheduleControls.hidden = subjectSelect.value !== "English";
      dayLabel.hidden = subjectSelect.value === "English";
    }
    termSelect.addEventListener("change", syncScheduleControls);
    subjectSelect.addEventListener("change", syncScheduleControls);
    syncScheduleControls();
    var actions = node("div", null, panel); actions.style.cssText = "display:flex;gap:8px;flex-wrap:wrap;margin:12px 0;";
    var previewButton = node("button", "Preview Worksheet", actions); previewButton.type = "button"; previewButton.style.cssText = "padding:11px 14px;font-weight:700;";
    var printButton = node("button", "Print Student Worksheet", actions); printButton.type = "button"; printButton.disabled = true; printButton.style.cssText = "padding:11px 14px;font-weight:700;";
    var preview = node("section", null, panel); preview.id = "paceduEnglishWorksheetPreview"; preview.setAttribute("aria-live","polite");
    var studentSheet = null;
    function renderPreview() {
      var day = clampDay(dayInput.value);
      dayInput.value = String(day);
      var isCurriculumSchedule = !!(
        global.PacEduDailyWorksheetContent &&
        typeof global.PacEduDailyWorksheetContent.getCurriculumWorksheet === "function");
      var savedEvidence = storedWorksheetAbility();
      if (((isCurriculumSchedule && !initialCheckToggle.checked) || day > 1) &&
          !savedEvidence.hasEvidence && abilitySelect.value === "initial-assessment" && !initialCheckToggle.checked) {
        preview.textContent = "Complete the Day 1 initial ability check and record learner evidence, or select a teaching band based on observed evidence, before creating a daily practice worksheet.";
        printButton.disabled = true;
        return;
      }
      var ability = isCurriculumSchedule
        ? (initialCheckToggle.checked ? "initial-assessment" : (abilitySelect.value === "initial-assessment" ? savedEvidence.ability : abilitySelect.value))
        : (day === 1 || abilitySelect.value === "initial-assessment" ? "initial-assessment" : abilitySelect.value);
      if (isCurriculumSchedule && initialCheckToggle.checked) {
        studentSheet = makeWorksheet(levelSelect.value, "initial-assessment", 1, subjectSelect.value);
      } else if (isCurriculumSchedule) {
        studentSheet = global.PacEduDailyWorksheetContent.getCurriculumWorksheet({
          level: levelSelect.value, subject: subjectSelect.value, term: termSelect.value,
          week: Number(weekSelect.value), day: Number(weekDaySelect.value), ability: ability
        });
      } else {
        studentSheet = makeWorksheet(levelSelect.value, ability, day, subjectSelect.value);
      }
      if (!studentSheet || studentSheet.status === "NOT_FOUND") {
        preview.textContent = studentSheet && studentSheet.message ? studentSheet.message : "This worksheet slot is not available.";
        printButton.disabled = true;
        return;
      }
      preview.textContent = "";
      var sheet = node("article", null, preview); sheet.id = "paceduEnglishStudentPrintSheet"; sheet.className = "pacedu-print-student-sheet";
      sheet.style.cssText = "background:white;color:#111;padding:18px;border:1px solid #888;margin-top:12px;";
      node("h2", studentSheet.title, sheet);
      node("p", "Name: __________________________________    Date: __________________", sheet);
      node("p", "Subject: " + (studentSheet.subject || subjectSelect.value), sheet);
      node("p", "Topic: " + studentSheet.topic, sheet);
      if (studentSheet.curriculumSchedule) {
        node("p", "Planning slot: " + studentSheet.curriculumSchedule.term + " · Week " +
          studentSheet.curriculumSchedule.week + " · Teaching day " + studentSheet.curriculumSchedule.day, sheet);
        node("p", "Curriculum verification: " + studentSheet.curriculumSchedule.verificationStatus, sheet);
      }
      renderPicturePrompt(sheet, studentSheet.topic, stageFor(classNumber(levelSelect.value)));
      if (studentSheet.readingText) {
        node("h3", "Read / listen to the passage", sheet);
        node("p", studentSheet.readingText, sheet).style.cssText = "padding:12px;border:1px solid #999;line-height:1.6;";
      }
      node("p", "Instructions: " + studentSheet.instructions, sheet);
      var list = node("ol", null, sheet);
      studentSheet.tasks.forEach(function (task) { node("li", task, list).style.marginBottom = "14px"; });
      if (studentSheet.questions && studentSheet.questions.length) {
        node("h3", "Look at the example first", sheet);
        var exampleList = node("ol", null, sheet);
        studentSheet.questions.forEach(function (question, questionIndex) {
          var example = studentSheet.examples && studentSheet.examples[questionIndex];
          var exampleItem = node("li", null, exampleList);
          exampleItem.style.marginBottom = "12px";
          node("p", "Example: " + (example ? example.prompt : question.prompt), exampleItem);
          node("p", "Worked answer: " + (example ? example.workedAnswer : (question.answer || "Ask your teacher to model one answer.")), exampleItem);
          if (example && example.explanation) node("p", "Why: " + example.explanation, exampleItem);
          node("p", "You can use words, a picture or object, or ask for the text to be read aloud. A short video may be used when available; written instructions always remain.", exampleItem);
        });
        node("h3", "Now try the questions", sheet);
        var subjectQuestions = node("ol", null, sheet);
        studentSheet.questions.forEach(function (question) {
          var item = node("li", question.prompt, subjectQuestions);
          item.style.marginBottom = "10px";
          if (question.options && question.options.length) {
            var choices = node("ul", null, item);
            question.options.forEach(function (option, optionIndex) {
              node("li", String.fromCharCode(65 + optionIndex) + ". " + option, choices);
            });
          }
          node("p", "Answer: __________________________________________________________", item);
        });
      } else if (studentSheet.questionPlan && studentSheet.questionPlan.questions) {
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
      if (studentSheet.teacherReview) node("p", studentSheet.teacherReview, guide);
      if (studentSheet.answerKey && studentSheet.answerKey.length) {
        node("h4", "Teacher-only answer key", guide);
        node("p", studentSheet.answerKey.map(function (entry) { return entry.number + ". " + entry.answer; }).join(" | "), guide);
      }
      node("p", studentSheet.differentiationNote, guide);
      node("p", studentSheet.sourceNote + " Status: " + studentSheet.status + ".", guide);
      if (studentSheet.curriculumNote) node("p", studentSheet.curriculumNote, guide);
      if (studentSheet.curriculumSchedule) {
        node("p", "Teacher check: record the current authorized syllabus title/version, exact strand and achievement-indicator reference, page/section, and reviewer before marking this activity curriculum-verified.", guide);
        var candidateSource = studentSheet.curriculumSchedule.candidateSource;
        if (candidateSource) {
          node("p", "Candidate source (teacher verification required): " + candidateSource.title + ". " +
            candidateSource.issuingBody + ". " + candidateSource.statedVersion + ". Reference: " +
            candidateSource.reference + ". Source-copy status: " + candidateSource.authorityStatus, guide);
          var candidateLink = node("a", "Open candidate source for teacher comparison", guide);
          candidateLink.href = candidateSource.url;
          candidateLink.target = "_blank";
          candidateLink.rel = "noopener noreferrer";
        }
      }
      printButton.disabled = false;
    }
    if (Number(dayInput.value) === 1) abilitySelect.value = "initial-assessment";
    abilitySelect.addEventListener("change", function () {
      if (abilitySelect.value !== "initial-assessment") {
        try { global.localStorage.setItem("paceduEnglishWorksheetAbility", abilitySelect.value); } catch (e) {}
        abilityStatus.textContent = "Selected for this worksheet: " + labelAbility(abilitySelect.value) + ". Confirm this matches recorded daily activity and term-assessment evidence; teacher review is required.";
        showAbilityInfo();
      }
    });
    previewButton.addEventListener("click", renderPreview);
    dayInput.addEventListener("change", function () {
      if (Number(dayInput.value) === 1) {
        abilitySelect.value = "initial-assessment";
        abilityStatus.textContent = "Day 1 uses the initial ability check; it does not assume an ability category.";
      } else if (abilitySelect.value === "initial-assessment") {
        var currentAbility = storedWorksheetAbility();
        abilitySelect.value = currentAbility.ability;
        abilityStatus.textContent = "Retrieved category: " + labelAbility(currentAbility.ability) + " (" + currentAbility.source + ").";
      }
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
    subjects: SUBJECTS.map(function (s) { return { id:s[0], label:s[1] }; }),
    abilities: ABILITIES.map(function (a) { return { id:a[0], label:a[1] }; }),
    getWorksheet: makeWorksheet,
    getQuestionPlan: questionPlanFor,
    getStoredAbility: storedWorksheetAbility
  });
})(window, document);
