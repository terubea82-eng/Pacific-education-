/* PacEdu concrete daily worksheet content for Fiji-life practice.
 * Original pilot questions and worked examples; NOT a verified import of Ministry
 * achievement indicators. Keep the source-alignment status visible until each
 * item is mapped to the current official subject syllabus, outcome and week.
 */
(function (global) {
  "use strict";
  var packs = {
    "English": [
      {topic:"Who am I? — Class 1 Term 1 Week 1", passage:"Lani is in Class 1. She greets her teacher and says, “Good morning. My name is Lani.” She carries a book and a pencil. Lani listens when her classmates speak and takes turns sharing ideas.", questions:[
        ["Which class is Lani in?","Class 1",["Class 2","Form 3","ECE"],0,"The first sentence says Lani is in Class 1."],
        ["Which greeting does Lani use?","Good morning",["Good night","Goodbye forever","See you next year"],0,"The passage quotes her greeting."],
        ["Name one item Lani carries.","A book",["A cooking pot","A fishing net","A football goal"],0,"The passage names a book and a pencil."],
        ["Which action shows respectful listening?","Taking turns sharing ideas",["Speaking over everyone","Ignoring classmates","Hiding the class books"],0,"The final sentence describes listening and taking turns."]
      ]},
      {topic:"Sharing at the market", passage:"At the market, Saki bought 3 ripe bananas and 2 pawpaw slices. He put the fruit in a reusable bag. He shared one banana with his sister and kept the rest for the journey home.", questions:[
        ["Where did Saki buy the fruit?","At the market",["At the library","At the airport","At the clinic"],0,"The first words tell us where."],
        ["Name one fruit in the passage.","Banana",["Carrot","Breadfruit leaf","Potato"],0,"Banana is directly named."],
        ["Why might a reusable bag be useful?","It can be used again",["It makes fruit disappear","It is always disposable","It changes the weather"],0,"Reusable means it can be used again."],
        ["How many bananas did Saki buy?","3",["2","4","5"],0,"The passage says 3 bananas."]
      ]},
      {topic:"Keeping the school clean", passage:"Our class made a cleaning plan. One group picked up safe paper litter with gloves. Another group sorted clean paper for recycling. The teacher reminded everyone never to touch broken glass or unknown waste.", questions:[
        ["What did one group use to handle safe paper litter?","Gloves",["Bare feet","A cooking pot","A toy"],0,"The text says the group used gloves."],
        ["What did the second group sort?","Clean paper",["Broken glass","Food in a hot pot","Unknown chemicals"],0,"The passage says clean paper for recycling."],
        ["What should learners do about broken glass?","Do not touch it; tell an adult",["Pick it up with bare hands","Kick it away","Hide it in a bag"],0,"The safety instruction says never to touch it."],
        ["What is the main idea?","Work together safely to keep school clean",["Make more litter","Avoid all teamwork","Touch dangerous waste"],0,"All details support safe teamwork."]
      ]}
    ],
    "Mathematics": [
      {topic:"Sharing books equally", passage:"The library has 24 storybooks. A teacher shares them equally among 4 reading tables.", questions:[
        ["How many books does each table receive?","6",["4","5","8"],0,"24 ÷ 4 = 6."],
        ["Which number sentence matches the sharing?","24 ÷ 4 = 6",["24 + 4 = 6","24 − 4 = 6","4 × 5 = 24"],0,"Division represents equal sharing; 4 × 6 = 24 also checks it."],
        ["How can you check the answer?","4 × 6 = 24",["6 − 4 = 24","24 + 6 = 4","4 ÷ 24 = 6"],0,"Multiplication checks the equal groups."],
        ["If one more table is added and the 24 books are shared among 6 tables, how many per table?","4",["3","5","6"],0,"24 ÷ 6 = 4."]
      ]},
      {topic:"Market money", passage:"A basket of bananas costs $4. A family buys 3 baskets and pays with a $20 note.", questions:[
        ["What is the cost of 3 baskets?","$12",["$7","$8","$14"],0,"3 × $4 = $12."],
        ["How much change should the family receive?","$8",["$6","$12","$16"],0,"$20 − $12 = $8."],
        ["Which operation finds the total cost?","Multiplication",["Only subtraction","Division by zero","Letter matching"],0,"Equal-price baskets are repeated groups."],
        ["If one basket price rises to $5, what is the cost of 3 baskets?","$15",["$10","$12","$20"],0,"3 × $5 = $15."]
      ]},
      {topic:"Rainfall data", passage:"A class records rainfall over four days: Monday 2 mm, Tuesday 5 mm, Wednesday 3 mm and Thursday 6 mm.", questions:[
        ["Which day had the most rainfall?","Thursday",["Monday","Tuesday","Wednesday"],0,"6 mm is the largest value."],
        ["What was the total rainfall?","16 mm",["14 mm","15 mm","17 mm"],0,"2 + 5 + 3 + 6 = 16."],
        ["How much more rain fell on Thursday than Monday?","4 mm",["3 mm","5 mm","8 mm"],0,"6 − 2 = 4."],
        ["What was the mean rainfall per day?","4 mm",["3 mm","5 mm","6 mm"],0,"16 ÷ 4 = 4 mm."]
      ]}
    ],
    "Science": [
      {topic:"A fair plant investigation", passage:"Two similar bean plants are placed in different light conditions. Both receive 50 mL of water each day and are measured at the same time. Plant A receives sunlight; Plant B is kept in a dark cupboard.", questions:[
        ["What factor is deliberately changed?","Light condition",["Water amount","Time of measurement","Plant type"],0,"Light is the stated difference."],
        ["What is kept the same?","Daily water amount",["Light condition","Location of both plants","The result"],0,"Both receive 50 mL daily."],
        ["Why measure at the same time?","To make the comparison fairer",["To guarantee the expected result","To stop all growth","To change the plant type"],0,"Consistent measuring conditions improve comparison."],
        ["What should the learner do before making a conclusion?","Record and compare observations",["Guess without evidence","Change every condition","Ignore the measurements"],0,"A conclusion should be based on recorded evidence."]
      ]},
      {topic:"Safe water", passage:"A family collects rainwater for washing. For drinking, they follow local public-health advice about safe water treatment and clean storage. They keep drinking-water containers covered and use a clean cup.", questions:[
        ["Why keep the container covered?","To reduce contamination",["To heat it with sunlight","To add dirt","To change its colour"],0,"A cover helps keep contaminants out."],
        ["What should guide water treatment?","Current local public-health advice",["A random online comment","A guess","A label on an unrelated bottle"],0,"Safe treatment depends on reliable local guidance."],
        ["Which practice supports safer storage?","Use a clean cup",["Dip dirty hands into the water","Leave it open near waste","Share an unclean cup"],0,"A clean cup reduces contamination."],
        ["What is the evidence in this passage?","The stated storage and handling practices",["An untested prediction","A made-up measurement","A personal password"],0,"The passage describes practices, not experimental results."]
      ]},
      {topic:"Weather observations", passage:"For three days, a learner records the weather at the same time: Monday is sunny, Tuesday is cloudy, and Wednesday has light rain. The learner writes the observation rather than guessing tomorrow's weather.", questions:[
        ["Which day had light rain?","Wednesday",["Monday","Tuesday","Thursday"],0,"Wednesday is named in the passage."],
        ["Why record observations at the same time?","To compare days consistently",["To make every day sunny","To prove a guess","To stop the weather changing"],0,"Consistent timing helps comparison."],
        ["Is 'tomorrow will definitely be sunny' proven by these three observations?","No",["Yes, always","Only if it is Monday","The passage says it is certain"],0,"Three past observations do not prove that claim."],
        ["What is the learner collecting?","Weather observations",["A list of passwords","A shopping bill","A story character list"],0,"The records describe weather."]
      ]}
    ],
    "Social Studies": [
      {topic:"Caring for a shared place", passage:"After a community sports day, volunteers place rubbish in the correct bins and report a broken bottle near the field to an adult. The group discusses how to keep the field safe for children and visitors.", questions:[
        ["What should happen to the broken bottle?","Keep away and report it to an adult",["Pick it up with bare hands","Kick it toward children","Hide it under leaves"],0,"Broken glass can injure people."],
        ["Why are bins useful?","They help manage waste correctly",["They make all waste safe to touch","They replace every rule","They stop people needing water"],0,"Correct disposal supports a cleaner shared place."],
        ["Who benefits from a safe field?","Children and visitors",["Only one person","Nobody","Only the rubbish"],0,"The passage says the field is for children and visitors."],
        ["Suggest one fair way to decide on a clean-up plan.","Listen to community members and agree on safe tasks",["Let one person ignore everyone","Ask children to touch glass","Hide safety concerns"],0,"Shared decisions should include listening and safety."]
      ]},
      {topic:"Community services", passage:"A health centre provides health services. A school supports learning. A municipal market gives sellers a place to sell goods. People can help these services by following rules, keeping spaces clean, and treating others respectfully.", questions:[
        ["Which place supports learning?","School",["Market only","Bus stop only","Sports field only"],0,"The passage directly says the school supports learning."],
        ["What is one role of a municipal market?","A place for sellers to sell goods",["A place for private passwords","A place to store broken glass","A replacement for a health centre"],0,"This is the role described."],
        ["Name one way people can support shared services.","Keep spaces clean",["Damage facilities","Ignore all rules","Block access"],0,"Keeping spaces clean is named in the passage."],
        ["Why are services important to a community?","They help meet community needs",["They remove every responsibility","They serve no purpose","They replace all families"],0,"Services support needs such as health, learning and trade."]
      ]},
      {topic:"A local environmental problem", passage:"After heavy rain, leaves block a drain near a footpath. Water begins to collect. Residents keep away from unsafe water and report the blockage to the responsible local service rather than entering the drain.", questions:[
        ["What caused water to collect in the example?","Leaves blocked the drain",["The footpath was painted","People read a book","A market opened"],0,"The first sentence identifies the blockage."],
        ["What is a safer action?","Report the blockage to the responsible service",["Enter the drain","Touch unknown water","Remove heavy debris alone"],0,"The passage recommends reporting it."],
        ["Who may be affected?","People using the footpath",["Only people in another country","Nobody by definition","Only the leaves"],0,"Water collecting near the footpath can affect users."],
        ["What evidence would help review the response?","Record whether the drain is cleared and water recedes",["A rumour with no observation","An unrelated photo","A guess before action"],0,"Follow-up observations help judge whether the action worked."]
      ]}
    ],
    "Healthy Living": [
      {topic:"Handwashing routine", passage:"Before preparing food, Litia wets her hands, uses soap, rubs all hand surfaces, rinses with safe water, and dries them with a clean method.", questions:[
        ["What does Litia use after wetting her hands?","Soap",["Paint","Soil","Cooking oil"],0,"The passage lists soap next."],
        ["Why rub all hand surfaces?","To clean hands thoroughly",["To make hands sticky","To replace rinsing","To avoid soap"],0,"The routine aims to clean all surfaces."],
        ["What should be used for rinsing?","Safe water",["Unknown liquid","Dirty puddle water","A chemical not meant for skin"],0,"The passage says safe water."],
        ["Put the main steps in order.","Wet, soap and rub, rinse, dry",["Dry, then wet, then stop","Rinse, add dirt, dry","Use paint, then eat"],0,"This follows the routine in the text."]
      ]},
      {topic:"Choosing a balanced snack", passage:"At break, a learner chooses a banana, water, and a small portion of another available food. Healthy choices depend on individual needs, access, culture, and reliable health advice; no single food provides everything.", questions:[
        ["What drink did the learner choose?","Water",["Energy drink by default","Cleaning liquid","Unknown liquid"],0,"Water is directly named."],
        ["Does one food provide every nutrient a person needs?","No",["Yes, always","Only a banana does","The passage says all foods are identical"],0,"The passage says no single food provides everything."],
        ["What can influence food choices?","Needs, access and culture",["Only the colour of a plate","Nothing ever","An unrelated password"],0,"These factors are stated in the passage."],
        ["Where should health advice come from?","A reliable health source",["An unverified rumour","A stranger's promise","A guess"],0,"Reliable advice is explicitly recommended."]
      ]}
    ],
    "Physical Education": [
      {topic:"Safe teamwork", passage:"Before a relay game, the class checks the playing area, warms up, listens to the rules and agrees on safe boundaries. If someone is hurt, play stops and the teacher is told.", questions:[
        ["What should happen before the game?","Check the area and warm up",["Run without checking","Ignore the rules","Push other players"],0,"The passage lists these preparations."],
        ["What should the class do if someone is hurt?","Stop play and tell the teacher",["Continue regardless","Hide the injury","Blame the person"],0,"The final sentence gives the safe response."],
        ["Which action shows teamwork?","Follow agreed rules and take turns",["Change rules secretly","Block teammates","Ignore boundaries"],0,"Shared rules and turns support teamwork."],
        ["Why check the playing area?","To notice hazards before activity",["To guarantee no one ever falls","To avoid all exercise","To choose a winner"],0,"Checking can help identify hazards."]
      ]}
    ],
    "Arts and Crafts": [
      {topic:"Designing a useful pencil holder", passage:"A learner plans a pencil holder using a clean, safe reused container. The learner checks that there are no sharp edges, decorates it, and tests whether it stands upright with pencils inside.", questions:[
        ["What should happen before decorating?","Check that the container is safe",["Touch sharp edges","Use an unknown chemical","Ignore damage"],0,"Safety comes before use."],
        ["Why test it with pencils inside?","To see whether it works for its purpose",["To change the weather","To count classmates","To avoid planning"],0,"Testing checks function."],
        ["What could improve an unstable holder?","Make the base steadier",["Remove the base","Add sharp edges","Ignore the problem"],0,"A steadier base can improve stability."],
        ["What is one design criterion?","It holds pencils safely and stands upright",["It must be dangerous","It cannot be tested","It must waste all materials"],0,"The passage gives these success criteria."]
      ]}
    ],
    "Music": [
      {topic:"Repeating rhythm", passage:"A class practises the pattern clap, clap, tap; clap, clap, tap. Learners keep a steady beat and take turns leading. Anyone who cannot clap may tap, move, use an instrument, or show the beat another way.", questions:[
        ["Which sound comes third in the pattern?","Tap",["Clap","Sing a paragraph","Silence always"],0,"The pattern is clap, clap, tap."],
        ["What is repeated?","Clap, clap, tap",["Tap, tap, clap","Only silence","A written sentence"],0,"The same three-part pattern repeats."],
        ["What should learners do when leading?","Take turns",["Stop others from joining","Ignore the beat","Change the pattern secretly"],0,"The passage says learners take turns."],
        ["Name one accessible way to show the beat besides clapping.","Tap or move with the beat",["No response is allowed","Only write an essay","Leave the activity"],0,"The passage offers tapping and movement."]
      ]}
    ],
    "Digital Literacy": [
      {topic:"Checking a scholarship message", passage:"A message says a student has won a scholarship but must pay an unknown person immediately. It gives no official provider link. The student does not send money or identity documents and checks the scholarship on the official provider website with a trusted adult.", questions:[
        ["What is a warning sign?","A demand to pay an unknown person immediately",["A link to an official provider page","A published eligibility guide","A public school calendar"],0,"The demand and unknown recipient are warning signs."],
        ["What should the student do first?","Check the official provider website",["Send money quickly","Post identity documents publicly","Share a password"],0,"The passage says to verify with the provider."],
        ["Should the student send identity documents to the unknown person?","No",["Yes, without checking","Only send a password too","The passage says it is required"],0,"The passage says not to send them."],
        ["Why verify the source?","To check whether the offer is genuine",["To make every offer genuine","To avoid reading terms","To guarantee a scholarship"],0,"Verification helps check authenticity but does not guarantee funding."]
      ]}
    ],
    "iTaukei Language": [
      {topic:"Teacher-verified iTaukei vocabulary", passage:"Teacher: insert a short iTaukei-language text checked against a current, trusted local language resource or qualified speaker. Read it aloud, then let learners use the verified word list to answer.", questions:[
        ["Which source should confirm the target words?","A trusted local language resource or qualified speaker",["An unverified machine guess","An unrelated social post","A random word list"],0,"Language examples must be verified for accuracy."],
        ["What should learners do with the verified text?","Listen/read and answer using its words",["Invent translations","Ignore the text","Copy a password"],0,"The task is based on the verified text."],
        ["What if the teacher is unsure about a word?","Check it before teaching or marking",["Pretend it is correct","Penalise every learner","Publish the guess as official"],0,"Accuracy must be checked."],
        ["What should the answer key contain?","Teacher-verified meaning and acceptable responses",["Unverified translations","Private student details","No criteria"],0,"The answer key must be checked."]
      ]}
    ],
    "Hindi": [
      {topic:"Teacher-verified Hindi vocabulary", passage:"Teacher: insert a short Hindi text and vocabulary list checked against a trusted Hindi resource or qualified speaker. Read or listen to the text and answer using the verified words.", questions:[
        ["Who should verify the Hindi words?","A trusted Hindi resource or qualified speaker",["An unverified machine guess","An unrelated message","A random list"],0,"The language content needs reliable verification."],
        ["What should the worksheet use?","The verified text and word list",["Invented translations","Unrelated vocabulary","Private information"],0,"Questions should be based on checked material."],
        ["What if a translation is uncertain?","Verify it before teaching or marking",["Guess and call it official","Hide the uncertainty","Mark all answers wrong"],0,"Verification prevents teaching incorrect language."],
        ["What belongs in the teacher key?","Verified meaning and acceptable alternatives",["Unverified guesses","Learner passwords","No marking guidance"],0,"The key needs verified answers."]
      ]}
    ]
  };
  var levels = ["ECE"];
  for (var c=1;c<=8;c+=1) levels.push("Class "+c);
  for (var f=3;f<=7;f+=1) levels.push("Form "+f);
  function stage(level) {
    if(level==="ECE") return "early";
    var m=String(level).match(/[0-9]+/), n=m?Number(m[0]):1;
    if(/^Form/.test(level)) return n<=4?"junior":"senior";
    return n<=2?"foundation":n<=5?"middle":"upper";
  }
  function make(level, subject, day, ability) {
    level=levels.indexOf(level)>=0?level:"Class 1";
    var pack=(packs[subject]||packs.English);
    var index=Math.max(0,(Math.floor((Number(day)||2)-2))%pack.length);
    var chosen=pack[index];
    var st=stage(level), questions=chosen.questions.map(function(q,i){
      var opts=[q[1]].concat(q[2]).slice(0,4), answer=q[1];
      if(st==="early" && i>1) return {number:i+1,type:"Oral / picture response",prompt:q[0],options:[],answer:answer,why:q[4]};
      return {number:i+1,type:"Multiple choice",prompt:q[0],options:opts,answer:answer,correctOption:q[3],why:q[4]};
    });
    var tasks;
    if(st==="early") tasks=[
      "Teacher reads the short story aloud. Point, say, sign, select, or draw one thing you noticed.",
      "Use pictures or objects to show one answer. The teacher may model the first item.",
      "Tell or show one safe, helpful action connected to the topic."
    ];
    else if(st==="foundation") tasks=[
      "Read or listen to the short passage. Circle or point to important words.",
      "Answer the four questions. You may use the word bank or one worked example.",
      "Tell or write one sentence explaining an answer."
    ];
    else if(st==="middle") tasks=[
      "Read the passage and underline the detail that helps answer each question.",
      "Answer all four questions and show the calculation or evidence where relevant.",
      "Write one sentence explaining how you checked your answer."
    ];
    else tasks=[
      "Read the passage and identify the evidence that supports each answer.",
      "Answer all four questions and justify at least two answers using evidence or working.",
      "Create one related question and provide a correct answer with reasoning."
    ];
    if(ability==="support") tasks.unshift("SUPPORTED START: teacher models Question 1; use read-aloud, pictures, a word bank or concrete objects, then try the next question.");
    else if(ability==="developing") tasks.unshift("DEVELOPING: try independently first; ask for one hint only if needed.");
    else if(ability==="expected") tasks.unshift("CORE PRACTICE: complete independently and check each answer.");
    else if(ability==="extension") tasks.unshift("EXTENSION: complete the core work, then create a new example or explain why a tempting wrong answer is incorrect.");
    var key=questions.map(function(q){return {number:q.number,answer:q.answer,explanation:q.why};});
    return {
      title:"Day "+day+" — "+subject+" Daily Worksheet — "+level+" — "+ability,
      level:level,subject:subject,ability:ability,day:Number(day)||2,topic:chosen.topic,
      readingText:chosen.passage,
      instructions:"Original PacEdu practice worksheet. Complete the questions, show working where needed, and ask the teacher to explain unfamiliar words. This is practice, not an official examination.",
      tasks:tasks,
      questions:questions,
      answerKey:key,
      responseLines:st==="early"?2:st==="foundation"?3:st==="middle"?5:7,
      teacherCheck:"Mark from the actual response. Record independent / with support / not yet demonstrated / not observed, then give one specific next step. For ECE, accept suitable oral, signed, picture, object or practical evidence.",
      differentiationNote:"Ability bands change support and challenge, not a learner's worth or permanent identity. Recheck using fresh evidence and teacher judgement.",
      status:"DRAFT_REQUIRES_OFFICIAL_OUTCOME_MAPPING",
      sourceNote:"PacEdu original content. Curriculum source mapping pending: link this worksheet to the current Fiji Ministry syllabus strand, outcome/achievement indicator, class, term and teaching week before calling it officially curriculum-aligned."
    };
  }
  function getCurriculumWorksheet(options) {
    options = options || {};
    var block = String(options.term || "T1").toUpperCase();
    var week = Math.max(1, Number(options.week) || 1);
    var day = Math.max(1, Math.min(5, Number(options.day) || 1));
    var blockMap = {
      T1: { label: "Term 1", weeks: 10 },
      T2: { label: "Term 2", weeks: 10 },
      T3: { label: "Term 3", weeks: 5 },
      INTERVENTION: { label: "Intervention", weeks: 5 },
      REVISION: { label: "Revision", weeks: 2 },
      EXAMS: { label: "School-approved examination period", weeks: 2 }
    };
    var selected = blockMap[block];
    if (!selected || week > selected.weeks) {
      return { status: "NOT_FOUND", message: "Choose a valid term, week and learning block." };
    }
    var curriculumMap = global.PacEduFijiCurriculumActivities;
    var distribution = curriculumMap && curriculumMap.weeklyDistribution;
    var curriculumWeek = distribution && distribution.filter(function (item) {
      return String(item.term).toUpperCase() === block && Number(item.week) === week;
    })[0] || null;
    var level = levels.indexOf(options.level) >= 0 ? options.level : "Class 1";
    var subject = Object.prototype.hasOwnProperty.call(packs, options.subject) ? options.subject : "English";
    var ability = ["support", "developing", "expected", "extension"].indexOf(options.ability) >= 0 ? options.ability : "developing";
    // Day 1 is reserved by the existing registration flow for baseline identification.
    // This API is for subsequent scheduled teaching worksheets, so the selected daily
    // worksheet remains separate and never overwrites that diagnostic.
    var scheduledDay = 2 + ((week - 1) * 5) + (day - 1);
    var worksheet = make(level, subject, scheduledDay, ability);
    worksheet.status = "DRAFT_REQUIRES_OFFICIAL_OUTCOME_MAPPING";
    worksheet.curriculumSchedule = {
      country: "Fiji",
      term: selected.label,
      termId: block,
      week: week,
      day: day,
      teachingTheme: curriculumWeek ? curriculumWeek.topic : selected.label + " Week " + week,
      suggestedFocus: curriculumWeek ? curriculumWeek.focus : "Use the current school-approved scheme of work.",
      syllabusTitle: null,
      syllabusVersion: null,
      strand: null,
      achievementIndicator: null,
      pageOrSection: null,
      verificationStatus: "NOT_YET_MAPPED"
    };
    worksheet.curriculumNote = "The weekly theme is a planning framework, not proof of official syllabus alignment. A teacher must verify the current Fiji Ministry syllabus, exact strand and achievement indicator before assigning this as curriculum-verified.";
    return worksheet;
  }
  function install() {
    var lib=global.PacificEducationEnglishWorksheetLibrary;
    if(!lib||typeof lib.getWorksheet!=="function"||lib.dailyContentEnhanced) return false;
    var original=lib.getWorksheet;
    var enhanced={};
    Object.keys(lib).forEach(function(k){enhanced[k]=lib[k];});
    enhanced.getWorksheet=function(level,ability,day,subject) {
      if(Number(day)===1) return original(level,ability,day,subject);
      var real=make(level,subject||"English",day,ability||"developing");
      return real;
    };
    enhanced.getDailyContentWorksheet=make;
    enhanced.dailyContentEnhanced=true;
    global.PacificEducationEnglishWorksheetLibrary=Object.freeze(enhanced);
    return true;
  }
  if(!install() && global.document) {
    var attempts=0;
    var timer=global.setInterval(function(){attempts+=1;if(install()||attempts>=40)global.clearInterval(timer);},100);
  }
  global.PacEduDailyWorksheetContent=Object.freeze({
    levels:levels.slice(),
    subjects:Object.keys(packs),
    getWorksheet:make,
    getCurriculumWorksheet:getCurriculumWorksheet,
    hasAnswerKey:function(level,subject,day,ability){var w=make(level,subject,day,ability);return w.questions.length===4&&w.answerKey.length===4&&w.answerKey.every(function(a){return !!a.answer&&!!a.explanation;});}
  });
})(window);
