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
    ],
    "Science": [
      {topic:"Scientific skills and safety", passage:"A class investigates which materials absorb water. The learners predict, test equal-sized pieces safely, observe what happens, and record results. They change one factor at a time and do not taste or touch unknown substances.", questions:[
        ["What should learners do before testing?","Make a prediction",["Change every factor", "Taste the materials", "Hide the results"],0,"A prediction states what may happen."],
        ["Why use equal-sized pieces?","To make the comparison fair",["To change the weather", "To avoid recording", "To guarantee one result"],0,"Keeping sizes equal helps control the test."],
        ["What is an observation?","What the learner notices or measures",["A guess only", "A rule copied without testing", "A secret"],0,"Observations are recorded evidence."],
        ["What should learners do with an unknown substance?","Do not touch or taste it; tell the teacher",["Taste it", "Smell it closely", "Take it home"],0,"Unknown substances must be handled safely."]
      ]},
      {topic:"Living things and their environment", passage:"A school garden contains plants, insects, soil, water and sunlight. Plants need suitable conditions to grow. Living things interact with one another and with non-living parts of the environment.", questions:[
        ["Which item is living?","A plant",["A stone", "Sunlight", "Water"],0,"Plants grow and carry out life processes."],
        ["Name one non-living part of the garden.","Soil",["An insect", "A plant", "A worm"],0,"Soil is non-living but supports life."],
        ["Why should observations be recorded?","To keep evidence for comparison",["To replace evidence with guesses", "To hide changes", "To stop learning"],0,"Records help compare what was observed."],
        ["Give one way to care for the garden.","Avoid damaging plants and use water carefully",["Pull up all plants", "Leave rubbish", "Waste water"],0,"Care protects the shared environment."]
      ]},
      {topic:"Materials, forces and energy", passage:"A student pushes a toy trolley across a smooth floor and a rough mat. The trolley travels differently because the surfaces create different amounts of friction. The student repeats the test and records the distance.", questions:[
        ["What is a force?","A push or a pull",["A colour", "A living thing", "A type of food"],0,"Forces can change motion or shape."],
        ["What is friction?","A force that resists movement between surfaces",["A kind of plant", "A light source", "A measurement of time"],0,"Friction acts between surfaces in contact."],
        ["Why repeat the test?","To check whether the result is consistent",["To avoid measurements", "To change the question", "To guarantee a preferred answer"],0,"Repeated trials help check reliability."],
        ["What should be recorded?","The distance travelled and the surface used",["Only a favourite answer", "Nothing", "A made-up number"],0,"A record should include relevant evidence."]
      ]}
    ],
    "Chemistry": [
      {topic:"Form 5–7 Chemistry: particles and substances", passage:"Matter has mass and occupies space. A pure substance has characteristic properties. In a mixture, substances are physically combined and may often be separated by physical methods such as filtration or evaporation.", questions:[
        ["What is matter?","Something that has mass and occupies space",["Only a gas", "Only living things", "Anything without mass"],0,"Matter has mass and occupies space."],
        ["Which method can separate sand from water?","Filtration",["Magnetising water", "Freezing the sand only", "Adding more sand"],0,"A filter traps insoluble sand while water passes through."],
        ["Is salt water a pure substance or a mixture?","A mixture",["A single element", "A vacuum", "A single atom"],0,"Salt and water are physically combined."],
        ["What should be done before a school chemistry practical?","Follow teacher instructions and safety rules",["Taste chemicals", "Mix unknown chemicals", "Work without supervision"],0,"Laboratory safety comes first."]
      ]},
      {topic:"Form 5–7 Chemistry: atoms and the periodic table", passage:"An element contains one type of atom. The periodic table arranges elements by atomic number. Chemical symbols are short forms of element names, for example O for oxygen and Na for sodium.", questions:[
        ["What does an element contain?","One type of atom",["Many unrelated mixtures", "Only water", "No particles"],0,"An element is made of one type of atom."],
        ["What does O represent?","Oxygen",["Gold", "Sodium", "Iron"],0,"O is the chemical symbol for oxygen."],
        ["What determines an element's atomic number?","The number of protons",["The number of cups", "Its colour", "The room temperature"],0,"Atomic number equals proton number."],
        ["Why use chemical symbols?","They provide a standard short form for elements",["They replace all safety rules", "They show a substance is safe to taste", "They change an element"],0,"Symbols are internationally used shorthand."]
      ]}
    ],
    "Biology": [
      {topic:"Form 5–7 Biology: cells and life processes", passage:"Cells are the basic structural units of living organisms. Many plant cells have a cell wall, cell membrane, cytoplasm and nucleus. Cells carry out processes needed for life.", questions:[
        ["What is the basic unit of life?","The cell",["The habitat", "The population only", "The ecosystem"],0,"Cells are the basic units of living organisms."],
        ["Which structure surrounds a plant cell and provides support?","Cell wall",["Chlorophyll only", "Blood vessel", "Bone"],0,"The cell wall supports and protects plant cells."],
        ["What is one role of the cell membrane?","Controls movement of substances into and out of the cell",["Makes all food by itself", "Stores all bones", "Stops every substance"],0,"The membrane regulates exchange."],
        ["Why use a microscope?","To view structures too small to see clearly unaided",["To measure rainfall only", "To weigh a person", "To heat samples"],0,"Microscopes magnify small structures."]
      ]},
      {topic:"Form 5–7 Biology: ecosystems and food relationships", passage:"Green plants make food using light energy. Animals obtain energy by eating plants or other animals. Organisms interact with each other and with non-living factors in an ecosystem.", questions:[
        ["What is a producer in a food chain?","An organism such as a green plant that makes its own food",["An animal that hunts", "A rock", "A decomposing plastic bag"],0,"Green plants are producers."],
        ["What is a food chain used to show?","How energy passes between organisms",["The distance between islands", "Only water temperature", "A list of school rules"],0,"Food chains show feeding and energy relationships."],
        ["Name one non-living ecosystem factor.","Water",["A bird", "A tree", "An insect"],0,"Water is non-living and affects organisms."],
        ["What can happen if a habitat is damaged?","Organisms may lose food or shelter",["Every organism improves automatically", "Nothing can change", "All pollution disappears"],0,"Habitat damage can affect survival."]
      ]}
    ],
    "Physics": [
      {topic:"Form 5–7 Physics: measurement and motion", passage:"Physics uses measurements and models to describe the natural world. Speed is calculated by dividing distance travelled by time taken. Measurements should include suitable units.", questions:[
        ["How is average speed calculated?","Distance divided by time",["Time divided by mass", "Distance multiplied by colour", "Mass plus time"],0,"Speed = distance ÷ time."],
        ["A learner travels 100 metres in 20 seconds. What is the average speed?","5 m/s",["2 m/s", "20 m/s", "120 m/s"],0,"100 ÷ 20 = 5 metres per second."],
        ["Which is a unit of distance?","Metre",["Second", "Kilogram per second", "Degree Celsius only"],0,"The metre measures length."],
        ["Why repeat a measurement?","To check reliability and reduce the effect of random error",["To remove all units", "To change the answer", "To avoid recording"],0,"Repeated measurements can reveal variation."]
      ]},
      {topic:"Form 5–7 Physics: forces and energy", passage:"A force is a push or pull. A resultant force can change an object's motion. Energy can be transferred between stores and transformed from one form to another.", questions:[
        ["What can an unbalanced resultant force do?","Change an object's motion",["Make mass disappear", "Turn a solid into a name", "Stop gravity everywhere"],0,"A resultant force can change velocity."],
        ["Which is an example of energy transfer?","Electrical energy heating a kettle",["A label changing colour only", "A number being written", "A ruler lying still"],0,"Electrical energy is transferred into thermal energy."],
        ["What is the SI unit of force?","Newton",["Metre", "Second", "Litre"],0,"Force is measured in newtons."],
        ["Why should practical measurements be recorded with units?","So the quantities are clear and comparable",["To make results secret", "To remove the measurement", "To guess the answer"],0,"Units state what a measurement means."]
      ]}
    ]
  };
  var levels = ["ECE"];
  for (var c=1;c<=8;c+=1) levels.push("Class "+c);
  for (var f=3;f<=7;f+=1) levels.push("Form "+f);
  /* Fiji subject progression: Basic Science through Form 4 (Years 9–10);
     separate Chemistry, Biology and Physics for Forms 5–7 (Years 11–13). */
  var SCIENCE_SUBJECT_LEVELS = {
    "Science": ["ECE","Class 1","Class 2","Class 3","Class 4","Class 5","Class 6","Class 7","Class 8","Form 3","Form 4"],
    "Chemistry": ["Form 5","Form 6","Form 7"],
    "Physics": ["Form 5","Form 6","Form 7"],
    "Biology": ["Form 5","Form 6","Form 7"]
  };
  function subjectsForLevel(level) {
    var match = String(level).match(/^Form (\\d+)$/);
    var form = match ? Number(match[1]) : 0;
    return Object.keys(packs).filter(function(subject) {
      if (form >= 3 && form <= 4) return subject !== "Chemistry" && subject !== "Physics" && subject !== "Biology";
      if (form >= 5 && form <= 7) return subject !== "Science";
      return subject !== "Chemistry" && subject !== "Physics" && subject !== "Biology" && subject !== "Science";
    });
  }
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
      "PacEdu reads the short passage aloud when audio is available. Point, say, sign, select, or draw one thing you noticed.",
      "Use the example, picture prompts, or available objects to show one answer. PacEdu displays the steps before you begin.",
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
    if(ability==="support") tasks.unshift("SUPPORTED START: PacEdu shows a worked example first. Use read-aloud, picture cues, a word bank or objects, then try the next question.");
    else if(ability==="developing") tasks.unshift("DEVELOPING: try independently first; ask for one hint only if needed.");
    else if(ability==="expected") tasks.unshift("CORE PRACTICE: complete independently and check each answer.");
    else if(ability==="extension") tasks.unshift("EXTENSION: complete the core work, then create a new example or explain why a tempting wrong answer is incorrect.");
    /* Every worksheet follows a gentle-to-challenging learning path.
       The example teaches the method first; the child then practises with support,
       works independently, and finally applies or explains the idea. */
    var progressionByStage = {
      early: ["Look at or listen to the worked example.", "Try one activity using pictures, objects, pointing, speaking, signing or drawing.", "Show one thing you noticed or learned."],
      foundation: ["Study the worked example and say what the steps show.", "Try a similar question with a cue or word bank if needed.", "Answer independently, then explain your choice in a short sentence."],
      middle: ["Study the worked example and identify the method.", "Complete a similar task and show the steps.", "Apply the idea to a new example and explain how you checked it."],
      junior: ["Study the worked example and identify the evidence or rule.", "Solve a similar question independently.", "Apply the idea to a changed situation and justify the answer."],
      senior: ["Analyse the worked example, including why the method is suitable.", "Solve the core questions and show evidence or calculations.", "Evaluate a limitation, compare a second approach, or transfer the concept to an unfamiliar situation."]
    };
    var abilityChallenge = {
      support: "Work through one step at a time. Use the worked example, picture/object cues, read-aloud, or a word bank; then attempt the next similar item independently.",
      developing: "Use the worked example as a guide, complete a similar item, then try the remaining core questions with fewer prompts.",
      expected: "Complete the core questions independently, show your method, and explain how you checked one answer.",
      extension: "Complete the core questions, then solve a changed or unfamiliar example, compare methods, or explain why a plausible wrong answer is incorrect."
    };
    var activityProgression = (progressionByStage[st] || progressionByStage.middle).slice();
    var questionLimit = ability === "support" ? 2 : ability === "developing" ? Math.min(3, questions.length) : questions.length;
    if (questions.length > questionLimit) questions = questions.slice(0, questionLimit);
    var stretchPrompt = ability === "extension" ? "CHALLENGE: Change one condition in the problem. Predict how the result will change, solve or test it, and explain your reasoning using evidence." : "";
    var key=questions.map(function(q){return {number:q.number,answer:q.answer,explanation:q.why};});
    var displaySubject = (subject==="Science" && /^Form [34]$/.test(level)) ? "Basic Science" : subject;
    var workedExamples = {
      "Science": {prompt:"A learner says, ‘The soil feels damp.’ Is this an observation or a prediction?",workedAnswer:"It is an observation.",explanation:"The learner is describing what can be noticed now. A prediction says what may happen next."},
      "Chemistry": {prompt:"A learner separates sand from water using filter paper. Which method is being used?",workedAnswer:"Filtration.",explanation:"The filter traps insoluble sand while water passes through."},
      "Biology": {prompt:"A green plant makes its own food using light. What is the plant in a food chain?",workedAnswer:"A producer.",explanation:"A producer makes its own food, usually using energy from sunlight."},
      "Physics": {prompt:"A learner walks 10 metres in 2 seconds. What is the average speed?",workedAnswer:"5 metres per second.",explanation:"Speed = distance ÷ time, so 10 ÷ 2 = 5 m/s."},
      "Agriculture": {prompt:"A learner measures a seedling on Monday and again on Friday. Why record both dates?",workedAnswer:"To compare growth over time.",explanation:"Dated observations show whether and how the plant changed."},
      "Technology": {prompt:"A learner tests a model bridge and it bends. What should happen next?",workedAnswer:"Use the test result to improve and test the design again.",explanation:"Testing provides evidence for a useful design change."},
      "Mathematics": {prompt:"A basket has 3 coconuts and another has 2. How many coconuts are there altogether?",workedAnswer:"5 coconuts.",explanation:"3 + 2 = 5."},
      "English": {prompt:"Example: ‘The children plant seeds.’ Who performs the action?",workedAnswer:"The children.",explanation:"The subject tells who or what the sentence is about."}
    };
    var workedExample=workedExamples[subject]||{prompt:"Read the task carefully and identify what it asks you to do. Give one clear answer, then check it against the example.",workedAnswer:"A clear answer that addresses the task.",explanation:"The example shows the steps to follow; use the same steps with your own question."};
    var examples = [{
      number:0,format:"text",prompt:workedExample.prompt,workedAnswer:workedExample.workedAnswer,
      explanation:workedExample.explanation,
      alternatives:["picture-or-object","audio-read-aloud"],showBeforeQuestion:true,
      label:"Worked example — study this before starting"
    }];
    return {
      title:"Day "+day+" — "+displaySubject+" Daily Worksheet — "+level+" — "+ability,
      level:level,subject:displaySubject,contentSubject:subject,ability:ability,day:Number(day)||2,topic:chosen.topic,
      readingText:chosen.passage,
      instructions:"STUDENT INSTRUCTIONS: 1. Read or listen to the topic. 2. Study the worked example and how the answer is explained. 3. Answer each activity in order. 4. Show your steps, draw or point if writing is difficult, and check your work. 5. Submit your answers for PacEdu marking and teacher review. Do not copy the example as an answer unless the question asks for it. This is original practice, not an official examination.",
      activitySequence:["Read or listen to the topic","Study the worked example and explanation","Try the first similar activity","Complete the remaining activities in order","Check your work and explain one answer","Submit for PacEdu feedback and teacher review"],
      learningProgression:activityProgression,
      abilityChallenge:abilityChallenge[ability]||abilityChallenge.developing,
      stretchPrompt:stretchPrompt,
      thinkingDevelopment:["Notice and identify","Apply a demonstrated method","Explain using a reason or evidence","Transfer the learning to a new situation"],
      questionCount:questions.length,
      tasks:tasks,
      examples:examples,
      workedExample:workedExample,
      examplePlacement:"before_questions",
      abilityGroupRules:{
        support:"Use objects, picture cues, read-aloud and teacher modelling; complete fewer steps at a time.",
        developing:"Use a worked example, word bank or number line, then try a similar item independently.",
        expected:"Complete the class-level task independently and explain or check the answer.",
        extension:"Solve a harder or changed problem and explain why the method works."
      },
      exampleRequiredBeforeEachQuestion:true,
      exampleFormats:["text", "picture-or-object", "audio-read-aloud", "short-video-when-needed"],
      questions:questions,
      answerKey:key,
      responseLines:st==="early"?2:st==="foundation"?3:st==="middle"?5:7,
      teacherCheck:"PacEdu should compare the submitted response with the answer guide where the question is auto-markable and return a clear next step. Practical, oral, signed, picture or open-ended evidence must be flagged for teacher review rather than falsely auto-scored. For ECE, accept suitable oral, signed, picture, object or practical evidence.",
      differentiationNote:"Ability bands change support and challenge, not a learner's worth or permanent identity. Recheck using fresh evidence and teacher judgement.",
      status:"DRAFT_REQUIRES_OFFICIAL_OUTCOME_MAPPING",
      sourceNote:"PacEdu original content. Curriculum source mapping pending: link this worksheet to the current Fiji Ministry syllabus strand, outcome/achievement indicator, class, term and teaching week before calling it officially curriculum-aligned."
    };
  }
  function englishLevelExpectation(level) {
    var expectations = {
      "ECE": { target:"Listen, take turns, identify a sound or picture, and communicate an idea orally, by gesture or drawing.", output:"Show, say, sign, select or draw one response; writing is optional.", lines:2 },
      "Class 1": { target:"Recognise familiar words and letter-sounds, answer direct questions, and build a clear simple sentence.", output:"Write or dictate one complete sentence with support as needed.", lines:3 },
      "Class 2": { target:"Read a short text, sequence three ideas, use capital letters and full stops, and answer direct questions.", output:"Write 2–3 connected sentences and check sentence beginnings and endings.", lines:4 },
      "Class 3": { target:"Identify the main idea, use context to explain a word, and select a supporting detail.", output:"Write a short paragraph with a main idea and one relevant detail.", lines:5 },
      "Class 4": { target:"Summarise a short text, infer a simple unstated idea, and support an answer with text evidence.", output:"Write a paragraph with a main idea, evidence and a concluding sentence.", lines:6 },
      "Class 5": { target:"Compare information, organise paragraphs, and explain how details support a conclusion.", output:"Write two linked paragraphs and revise vocabulary or sentence structure.", lines:7 },
      "Class 6": { target:"Distinguish fact from opinion, infer meaning, and explain how language choices shape a text.", output:"Write a structured response with a claim, two details and a conclusion.", lines:8 },
      "Class 7": { target:"Compare viewpoints, assess the relevance of evidence, and organise writing for a stated purpose.", output:"Write a developed response that compares two ideas and justifies a conclusion.", lines:9 },
      "Class 8": { target:"Evaluate evidence, analyse purpose and audience, and use cohesive devices in extended writing.", output:"Write a structured multi-paragraph response with evidence and a considered conclusion.", lines:10 },
      "Form 3": { target:"Analyse purpose, audience, viewpoint and supporting details in different text types.", output:"Write a structured analytical paragraph with a claim, evidence and explanation.", lines:10 },
      "Form 4": { target:"Compare how two texts organise ideas, represent viewpoints and use language for effect.", output:"Write a comparative response with a clear thesis and relevant textual evidence.", lines:11 },
      "Form 5": { target:"Interpret complex ideas, evaluate evidence and explain the relationship between language and meaning.", output:"Write an extended response with a defensible interpretation and supporting evidence.", lines:12 },
      "Form 6": { target:"Synthesize information from more than one source and adapt register to purpose and audience.", output:"Write a coherent essay or report, cite supplied sources and acknowledge limitations.", lines:13 },
      "Form 7": { target:"Evaluate competing interpretations, synthesise evidence and qualify a conclusion for a defined audience.", output:"Write a sustained, evidence-based response with a counterpoint and qualified conclusion.", lines:14 }
    };
    return expectations[level] || expectations["Class 1"];
  }

  function makeScheduledEnglishContent(level, ability, theme, focus, weekDay) {
    var st = stage(level);
    var levelExpectation = englishLevelExpectation(level);
    var safeTheme = String(theme || "our learning").replace(/[<>]/g, "").trim() || "our learning";
    var safeFocus = String(focus || "read, discuss and explain").replace(/[<>]/g, "").trim();
    var dayFocus = [
      "Read or listen and identify the main topic",
      "Learn and use important words",
      "Sequence ideas and connect sentences",
      "Answer with a detail or evidence",
      "Review and create an independent response"
    ][Math.max(0, Math.min(4, Number(weekDay) - 1))];
    var passage;
    if (st === "early") {
      passage = "Today we learn about " + safeTheme.toLowerCase() + ". We look, listen, share, and take turns. We can care for our school and help one another. " + dayFocus + ".";
    } else if (st === "foundation") {
      passage = "Our class is learning about " + safeTheme.toLowerCase() + ". We listened to an example, shared one idea, and looked for a useful detail. We used the detail to explain our answer. " + safeFocus + ". Today we will " + dayFocus.toLowerCase() + ".";
    } else if (st === "middle") {
      passage = "During a class activity about " + safeTheme.toLowerCase() + ", learners recorded observations and compared ideas. They used details from the text or activity to explain what they noticed. When two answers differed, they checked the evidence before choosing a conclusion. The class wrote a short explanation and revised one sentence after feedback. " + safeFocus + ". The daily focus is to " + dayFocus.toLowerCase() + ".";
    } else if (st === "upper") {
      passage = "A class inquiry into " + safeTheme.toLowerCase() + " began with a question. Learners gathered relevant information, recorded examples, and compared their first ideas with evidence. Some details supported the original view, while others showed that it needed to be refined. The group discussed how to distinguish an observation from an opinion and wrote a conclusion that matched the evidence. " + safeFocus + ". The daily focus is to " + dayFocus.toLowerCase() + ".";
    } else if (st === "junior") {
      passage = "A student group investigated " + safeTheme.toLowerCase() + " after noticing that people described the issue differently. They compared relevant information, checked which details supported each interpretation, and separated observations from opinions. Their first conclusion was adjusted when one piece of evidence did not support it. The final response explained the reasoning and identified what further information would improve confidence. " + safeFocus + ". The daily focus is to " + dayFocus.toLowerCase() + ".";
    } else {
      passage = "In a study of " + safeTheme.toLowerCase() + ", students considered how a claim was shaped by purpose, audience, and available evidence. They compared supporting details with an alternative interpretation and noted a limitation in the information. Rather than treating one example as proof of a general rule, they qualified their conclusion and identified what additional evidence would be needed. Their final response stated a defensible claim, supported it, and acknowledged uncertainty. " + safeFocus + ". The daily focus is to " + dayFocus.toLowerCase() + ".";
    }

    function question(number, prompt, answer, distractors, explanation, type) {
      return {
        number: number,
        type: type || "Multiple choice",
        prompt: prompt,
        options: distractors && distractors.length ? [answer].concat(distractors).slice(0, 4) : [],
        answer: answer,
        correctOption: 0,
        why: explanation
      };
    }
    var questions;
    if (st === "early") {
      questions = [
        question(1, "Point to, say, sign, or select the topic of today's learning.", safeTheme, [], "Accept an accessible response that identifies the topic.", "Oral / picture response"),
        question(2, "What should learners do when another person is speaking?", "Listen and take turns", ["Shout over the speaker", "Walk away without listening", "Hide the learning materials"], "The passage says learners listen, share and take turns."),
        question(3, "Name or show one helpful action from the passage.", "Care for our school and help one another", ["Damage shared things", "Ignore everyone", "Touch unsafe objects"], "The passage describes caring for school and helping one another."),
        question(4, "Show, draw, sign, or tell one detail you noticed.", "Any relevant detail from the passage", [], "Accept a relevant detail; teacher records the response mode.", "Oral / picture response")
      ];
    } else if (st === "foundation") {
      questions = [
        question(1, "What is the class learning about?", safeTheme, ["A sports score", "A shopping bill", "A weather forecast"], "The first sentence names the learning topic."),
        question(2, "What did the learners do before explaining an answer?", "Shared an idea and looked for a detail", ["Copied without reading", "Ignored the example", "Changed the subject"], "The passage says they shared an idea and looked for a detail."),
        question(3, "Why did they use a detail?", "To explain their answer", ["To decorate the page", "To avoid the task", "To hide a mistake"], "The passage links the detail to explaining an answer."),
        question(4, "Write or dictate one clear sentence about the topic.", "Answers vary; sentence relates to the topic", [], "Teacher checks meaning, a clear sentence, and appropriate support.", "Short answer")
      ];
    } else if (st === "middle") {
      questions = [
        question(1, "What is the main idea of the passage?", "Learners use details and evidence to explain ideas about " + safeTheme.toLowerCase(), ["Learners should guess without checking", "The passage is only about sport", "Feedback should never change writing"], "The passage repeatedly describes using details, checking evidence and revising."),
        question(2, "What did the class do when answers differed?", "Checked the evidence before choosing a conclusion", ["Chose the longest answer", "Stopped listening", "Ignored all details"], "This action is stated directly in the passage."),
        question(3, "Why did the class revise a sentence?", "To improve it after feedback", ["To remove all evidence", "To make it harder to read", "To avoid the topic"], "The final sentence says they revised after feedback."),
        question(4, "Write 4–6 connected sentences explaining the topic and one supporting detail.", "Answers vary; include a relevant idea and supporting detail", [], "Teacher checks connection between the idea and its supporting detail.", "Short writing")
      ];
    } else if (st === "upper") {
      questions = [
        question(1, "Why did learners compare their first ideas with evidence?", "To decide whether their ideas needed refining", ["To prove the first idea must be right", "To avoid recording information", "To replace evidence with opinion"], "The passage says some details showed the original view needed refinement."),
        question(2, "Which statement best distinguishes observation from opinion?", "An observation records what was noticed; an opinion expresses a view", ["They always mean the same thing", "An opinion is automatically evidence", "An observation never needs recording"], "The group discussed distinguishing observations from opinions."),
        question(3, "What made the conclusion stronger?", "It matched the evidence", ["It was chosen before checking", "It ignored different details", "It was the longest sentence"], "The passage says the conclusion matched the evidence."),
        question(4, "Write a paragraph with a claim, evidence and conclusion about the topic.", "Answers vary; claim is supported by relevant evidence", [], "Teacher checks the claim-evidence link and the conclusion.", "Extended writing")
      ];
    } else if (st === "junior") {
      questions = [
        question(1, "Why did the group compare different descriptions of the issue?", "People described the issue differently", ["There was no question to investigate", "The group refused to read", "All information was identical"], "The opening sentence gives the reason for comparing descriptions."),
        question(2, "What caused the group to adjust its first conclusion?", "A piece of evidence did not support it", ["The conclusion was too short", "The group wanted no evidence", "The topic changed to sport"], "The passage states that one piece of evidence did not support the first conclusion."),
        question(3, "What further information would be useful?", "Reliable additional evidence relevant to the issue", ["An unrelated rumour", "A claim with no source", "A repeated guess"], "Further relevant information would improve confidence."),
        question(4, "Write a structured paragraph using a claim, evidence and explanation; note one information gap.", "Answers vary; include a defensible claim, relevant evidence and a limitation", [], "Teacher checks reasoning and whether the limitation follows from the passage.", "Extended writing")
      ];
    } else {
      questions = [
        question(1, "What makes the final response defensible?", "It states a claim, supports it with evidence and acknowledges uncertainty", ["It treats one example as universal proof", "It ignores alternative interpretations", "It makes a claim without reasons"], "The passage describes a qualified claim supported by evidence."),
        question(2, "Why should a limitation in the information be identified?", "It shows what the evidence cannot establish", ["It guarantees the claim is false", "It removes the need for sources", "It proves every view is equal"], "A limitation clarifies the strength and reach of a conclusion."),
        question(3, "What is a sound response to an alternative interpretation?", "Compare its evidence and explain the reasoning", ["Dismiss it without checking", "Repeat the claim louder", "Assume it is always wrong"], "The passage says students compared supporting details with an alternative interpretation."),
        question(4, "Write a reasoned response to the topic, using a claim, evidence, counterpoint and qualified conclusion.", "Answers vary; reasoning should be evidence-based and acknowledge a relevant counterpoint", [], "Teacher reviews argument quality, evidence, register and acknowledgement of uncertainty.", "Extended writing")
      ];
    }

    var tasks;
    if (st === "early") tasks = [
      "Listen to the passage. Point, say, sign, select, or draw one idea.",
      "Match a picture or object to a word connected to the topic.",
      "Retell or show one thing you noticed."
    ];
    else if (st === "foundation") tasks = [
      "Read or listen to the passage. Point to the sentence that names the topic.",
      "Answer the direct questions and use a word from the passage.",
      "Write, dictate, or select one clear sentence about the topic."
    ];
    else if (st === "middle") tasks = [
      "Read the passage and underline or identify a detail that supports the main idea.",
      "Answer the questions and explain how one detail supports your answer.",
      "Write a short paragraph and revise one sentence after feedback."
    ];
    else if (st === "upper") tasks = [
      "Read the passage and identify the main idea, evidence and one distinction between observation and opinion.",
      "Answer the questions using relevant details from the passage.",
      "Write a conclusion that matches the evidence and explain one revision."
    ];
    else if (st === "junior") tasks = [
      "Annotate the passage for the issue, viewpoints, evidence and information gap.",
      "Answer the questions and cite a detail that supports your interpretation.",
      "Write a structured response with claim, evidence, explanation and a limitation."
    ];
    else tasks = [
      "Analyse the claim, purpose, audience, evidence and limitation in the passage.",
      "Answer the questions and compare the evidence with an alternative interpretation.",
      "Write a reasoned response with claim, evidence, counterpoint and qualified conclusion."
    ];
    var bandPrefix = {
      support: "SUPPORTED START: teacher models Question 1; use read-aloud, pictures, a word bank or a sentence frame.",
      developing: "DEVELOPING: try independently first; ask for one hint or word bank if needed.",
      expected: "CORE PRACTICE: complete independently where possible and check each answer against the text.",
      extension: "EXTENSION: complete the core work, then create a related question or justify an alternative interpretation."
    }[ability] || "DEVELOPING: try independently first.";
    tasks.push("Class-level target: " + levelExpectation.target, levelExpectation.output);
    tasks.unshift(bandPrefix);
    return {
      topic: safeTheme + " — " + dayFocus,
      readingText: passage + "\n\nClass-level practice target: " + levelExpectation.target,
      questions: questions,
      answerKey: questions.map(function (q) { return {number:q.number,answer:q.answer,explanation:q.why}; }),
      tasks: tasks,
      instructions: "Original PacEdu English practice. Read, listen, or use an accessible response mode. This is practice, not an official examination.",
      responseLines: levelExpectation.lines,
      teacherCheck: "Check the learner's actual response and record independent / with support / not yet demonstrated / not observed. Auto-mark selected-choice items only; review constructed responses using teacher judgement.",
      teacherReview: "The scheduled theme and focus are planning suggestions. Confirm the current Fiji syllabus and exact achievement indicator before formal assignment.",
      differentiationNote: "Use the selected ability band to adjust scaffolding and challenge; bands are flexible and not permanent labels.",
      sourceNote: "Original PacEdu practice content; official Fiji syllabus outcome mapping pending.",
      status: "DRAFT_REQUIRES_OFFICIAL_OUTCOME_MAPPING"
    };
  }

  function makeDailyLesson(level, subject, ability, termLabel, week, day, worksheet, weeklyTopic, suggestedFocus) {
    var dayFocus = [
      "notice and identify the key idea",
      "follow a model and explain the example",
      "practise the skill with support as needed",
      "apply the skill to a new example",
      "review the skill and explain what the evidence shows"
    ][Math.max(0, Math.min(4, Number(day) - 1))];
    var topicLabel = String(weeklyTopic || (termLabel + " Week " + week)).replace(/\s+/g, " ").trim();
    var concept = topicLabel + " — " + subject + ": " + dayFocus + " (" + String(worksheet.topic || suggestedFocus || "daily practice") + ")";
    var stageName = stage(level);
    var levelObjectives = {
      "ECE":"Explore with play, pictures, objects, movement and one guided response.",
      "Class 1":"Identify the main idea or skill using a familiar example and a short response.",
      "Class 2":"Describe and sequence two or three parts of the example, then check the response.",
      "Class 3":"Classify information or steps and give one reason for the choice.",
      "Class 4":"Explain the concept with an example and one supporting detail or worked step.",
      "Class 5":"Compare two examples and justify a choice with relevant evidence or working.",
      "Class 6":"Explain a relationship, pattern or cause using subject vocabulary and evidence.",
      "Class 7":"Compare methods or viewpoints and explain which evidence supports the conclusion.",
      "Class 8":"Evaluate evidence or methods, identify a limitation, and explain a considered conclusion.",
      "Form 3":"Apply the concept to an unfamiliar example and explain the relationship using subject vocabulary.",
      "Form 4":"Compare two models, texts, methods or perspectives and justify the stronger explanation.",
      "Form 5":"Interpret complex examples, evaluate evidence and explain a limitation or alternative.",
      "Form 6":"Synthesize information or methods, state assumptions and support a structured conclusion.",
      "Form 7":"Evaluate competing explanations, qualify a conclusion and justify it with evidence and limitations."
    };
    var classLevelObjective = levelObjectives[level] || levelObjectives["Class 1"];
    var learnerAction = stageName === "early"
      ? "Look, listen, point, match, move, speak, sign, draw or select an answer."
      : stageName === "foundation"
        ? "Look at the example, read or listen to the short text, then answer with words, pictures or a sentence."
        : stageName === "middle"
          ? "Read or inspect the example, identify the important detail, solve the task and explain one choice."
          : "Examine the example, identify evidence or working, justify a conclusion and apply the concept to a new case.";
    var exampleText = worksheet.readingText || worksheet.passage || worksheet.topic || concept;
    var firstQuestion = worksheet.questions && worksheet.questions[0];
    var firstAnswer = worksheet.answerKey && worksheet.answerKey[0];
    var workedExample = firstQuestion
      ? firstQuestion.prompt + (firstAnswer ? " Model answer: " + firstAnswer.answer + ". " + (firstAnswer.explanation || "") : "")
      : "Teacher demonstrates one safe, accurate example of " + concept + " and explains the steps.";
    var narration = "Welcome. Today we are learning " + concept + " in " + subject + ". "
      + "Step 1. Look at the example on screen. " + exampleText + " "
      + "Step 2. Read the key idea and listen to the example. "
      + "Step 3. Watch the teacher model one answer: " + workedExample + " "
      + "Step 4. Try the activity yourself. " + learnerAction + " "
      + "Step 5. Check your work, explain your thinking, and ask your teacher for help if needed.";
    return {
      title: subject + " — " + level + " — " + termLabel + ", Week " + week + ", Day " + day,
      learningConcept: concept,
      learningIntention: "We are learning to " + dayFocus + " through " + String(worksheet.topic || subject + " example") + ".",
      classLevelObjective: classLevelObjective,
      successCriteria: [
        "I can identify or demonstrate the main idea or skill in the example.",
        "I can try the activity using an accessible response method.",
        "I can show evidence, working or an explanation that matches my class task."
      ],
      workedExample: workedExample,
      steps: [
        {step:1, mode:"SEE / VIDEO FRAME", onScreen:"Show a clear picture, object, diagram or short subject demonstration connected to: " + concept + ".", learnerAction:"Look closely and notice one important detail.", narration:"Step 1. Look at the example. What do you notice?"},
        {step:2, mode:"READ", onScreen:"Display the learning intention, key words and example text: " + exampleText, learnerAction:"Read the text or follow along while it is read aloud.", narration:"Step 2. Read the key idea and example. Pause when you meet an unfamiliar word."},
        {step:3, mode:"HEAR / AUDIO", onScreen:"Highlight each key word as the narrator reads the worked example.", learnerAction:"Listen once, then replay or read the transcript at your own pace.", narration:"Step 3. Listen to the worked example: " + workedExample},
        {step:4, mode:"TRY", onScreen:"Show the activity question and a step-by-step model; then remove the model for the learner's attempt.", learnerAction:learnerAction, narration:"Step 4. Now try the activity yourself. You may speak, write, point, draw, use objects, or use another response method agreed with your teacher."},
        {step:5, mode:"CHECK / REFLECT", onScreen:"Show the success criteria and invite the learner to explain or demonstrate one answer.", learnerAction:"Check your work and identify one thing you understand or want help with.", narration:"Step 5. Check your answer. Explain how you know, then ask for feedback if you need it."}
      ],
      videoStoryboard: {format:"5-frame storyboard for a short lesson video; not a rendered video file", frames:5, captions:"Use each step's onScreen text as the on-screen caption; display key words and the example while narration plays."},
      audioNarration: {status:"SCRIPT_READY_FOR_PACEDU_NARRATOR", language:"Use the learner's school-approved language and voice setting.", transcript:narration},
      learnerText: {status:"TEXT_READY", passage:exampleText, workedExample:workedExample, instructions:learnerAction},
      curriculumAlignment: {
        country:"Fiji", level:level, subject:subject, term:termLabel, week:week, day:day,
        draftConcept:concept, suggestedFocus:suggestedFocus || concept,
        officialSyllabusTitle:null, officialSyllabusVersion:null, strand:null,
        achievementIndicator:null, officialReference:null, reviewedBy:null, reviewedOn:null,
        verificationStatus:"NOT_YET_MAPPED",
        rule:"Do not invent an official achievement indicator. A qualified teacher must enter the exact current authorized syllabus reference before this lesson can be labelled curriculum-aligned."
      },
      abilityBand:ability,
      accessibility:"Provide captions/transcript, adjustable text size, pause/replay controls in the player, and alternatives to sound or video such as text, pictures, objects and teacher read-aloud."
    };
  }

  function getCurriculumWorksheet(options) {
    options = options || {};
    var block = String(options.term || "T1").toUpperCase();
    var week = Math.max(1, Number(options.week) || 1);
    var day = Math.max(1, Math.min(5, Number(options.day) || 1));
    var blockMap = {
      T1: { label: "Term 1", weeks: 9 },
      T2: { label: "Term 2", weeks: 9 },
      T3: { label: "Term 3", weeks: 5 },
      ASSESSMENT: { label: "Assessment window", weeks: 1 },
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
    if (subject === "English") {
      var scheduledEnglish = makeScheduledEnglishContent(
        level, ability,
        curriculumWeek ? curriculumWeek.topic : selected.label + " Week " + week,
        curriculumWeek ? curriculumWeek.focus : "Use the current school-approved scheme of work.",
        day
      );
      Object.keys(scheduledEnglish).forEach(function (key) { worksheet[key] = scheduledEnglish[key]; });
    }
    worksheet.dailyLesson = makeDailyLesson(
      level, subject, ability, selected.label, week, day, worksheet,
      curriculumWeek ? curriculumWeek.topic : selected.label + " Week " + week,
      curriculumWeek ? curriculumWeek.focus : selected.label + " Week " + week + " " + subject + " concept practice"
    );
    /* Short, action-based teacher steps shared across every supported subject. */
    var teacherStepsBySubject = {
      "English": ["Show the text or example.", "Read it aloud if needed.", "Ask the questions.", "Check answers and give one clear correction."],
      "Mathematics": ["Show the worked example.", "Model the steps.", "Let learners solve the questions.", "Check the working and answers."],
      "Science": ["Show the materials or observation.", "Explain the safe steps.", "Ask learners to observe and record.", "Check evidence before conclusions."],
      "Social Studies": ["Introduce the place, person or issue.", "Explain the key idea.", "Ask learners to compare or describe.", "Check answers and reasons."],
      "Healthy Living": ["Show the health or safety example.", "Explain the safe choice.", "Ask learners to practise or choose.", "Check understanding."],
      "Physical Education": ["Explain the skill and safety rule.", "Demonstrate the movement.", "Let learners practise safely.", "Check participation and technique."],
      "Arts and Crafts": ["Show the materials and example.", "Explain the making steps.", "Let learners create safely.", "Review the work and one improvement."],
      "Music": ["Model the sound or rhythm.", "Practise it together.", "Let learners repeat or create a pattern.", "Listen and give one helpful tip."],
      "Digital Literacy": ["Show the tool or digital example.", "Explain safe use.", "Guide learners through the task.", "Check the result and safe choices."],
      "iTaukei Language": ["Model the approved word or phrase.", "Say it together.", "Let learners practise speaking, listening or writing.", "Check meaning and pronunciation respectfully."],
      "Hindi": ["Model the approved word or phrase.", "Say or read it together.", "Let learners practise the task.", "Check meaning and give one correction."]
    };
    worksheet.teacherInstructions = (teacherStepsBySubject[subject] || [
      "Show the example.", "Explain the task.", "Guide learners through the questions.", "Check answers."
    ]).slice();
    worksheet.teacherInstructionStyle = "SHORT_NUMBERED_ACTION_STEPS";
    if (worksheet.dailyLesson && typeof worksheet.dailyLesson === "object") {
      worksheet.dailyLesson.teacherInstructions = worksheet.teacherInstructions.slice();
      worksheet.dailyLesson.teacherInstructionStyle = "SHORT_NUMBERED_ACTION_STEPS";
    }
    var indicatorEngine = global.PacificEducationAchievementDistributionEngine;
    var classReference = String(options.classReference || "").trim();
    var indicatorTerm = String(options.curriculumTerm || options.term || "").trim();
    if (classReference && indicatorEngine && typeof indicatorEngine.buildDailyIndicatorPlan === "function") {
      try {
        var indicatorResult = indicatorEngine.buildDailyIndicatorPlan({
          classId: classReference, level: level, subjectId: subject,
          term: indicatorTerm, dayNumber: Math.max(1, Number(options.dayNumber) || (2 + ((week - 1) * 5) + (day - 1)))
        });
        var assignment = indicatorResult && indicatorResult.assignment;
        if (assignment && assignment.indicatorId &&
            String(assignment.classId || "") === classReference &&
            String(assignment.level || "") === level &&
            String(assignment.subjectId || "") === subject &&
            String(assignment.term || "") === indicatorTerm) {
          worksheet.dailyLesson.curriculumAlignment.candidateIndicator = {
            id: String(assignment.indicatorId),
            text: String(assignment.indicatorText || ""),
            strand: String(assignment.strand || ""),
            sourceStatus: String(assignment.sourceStatus || "unverified"),
            productionEligible: assignment.productionEligible === true,
            status: "PENDING_TEACHER_REVIEW"
          };
          worksheet.dailyLesson.curriculumAlignment.rule += " A matching class-specific indicator candidate is attached for teacher review only; it is not treated as verified by this generator.";
        }
      } catch (indicatorError) {
        /* Missing or unavailable indicator services must not break daily lessons. */
      }
    }
    worksheet.status = "DRAFT_REQUIRES_OFFICIAL_OUTCOME_MAPPING";
    var candidateSource = null;
    if (level === "Class 1" && block === "T1" && week === 1) {
      candidateSource = {
        title: "Year 1 English — Language, Literacy and Communication",
        issuingBody: "Curriculum Development Unit, Ministry of Education, Heritage and Arts, Fiji (as stated in the resource)",
        statedVersion: "2013; revised 2019; reprinted 2020 (verify against current authorized copy)",
        reference: "Unit 1, \"Who am I?\" (resource p. 5); S/s and A/a activities (resource pp. 6–7)",
        url: "https://fliphtml5.com/gjgbb/miwv/Year_1_English_-_Language%2C_Literacy_and_Communication/",
        authorityStatus: "THIRD_PARTY_HOSTED_COPY_REQUIRES_AUTHORIZED_SOURCE_CHECK"
      };
      worksheet.sourceNote = "Original PacEdu English practice; candidate reference: Year 1 English — Language, Literacy and Communication, Unit 1 (resource p. 5), S/s and A/a (pp. 6–7). Copy located on a third-party host; compare with the current authorized school/FEMIS/Ministry copy. Official outcome mapping remains pending.";
    }
    worksheet.curriculumSchedule = {
      country: "Fiji",
      term: selected.label,
      termId: block,
      week: week,
      day: day,
      teachingTheme: curriculumWeek ? curriculumWeek.topic : selected.label + " Week " + week,
      suggestedFocus: curriculumWeek ? curriculumWeek.focus : "Use the current school-approved scheme of work.",
      candidateSource: candidateSource,
      syllabusTitle: null,
      syllabusVersion: null,
      strand: null,
      achievementIndicator: null,
      pageOrSection: null,
      reviewer: null,
      reviewDate: null,
      verificationStatus: "NOT_YET_MAPPED"
    };
    worksheet.curriculumNote = candidateSource
      ? "Candidate source reference is supplied for teacher comparison only. The copy is hosted off the Ministry domain; confirm the current authorized resource, exact syllabus outcome/indicator, page and weekly placement. Do not mark curriculum-verified until reviewed."
      : "The weekly theme is a planning framework, not proof of official syllabus alignment. A teacher must verify the current Fiji Ministry syllabus, exact strand and achievement indicator before assigning this as curriculum-verified.";
    if (!options.skipTermPlan && global.PacEduTermLearningPlan) {
      worksheet.termLearningPlan = global.PacEduTermLearningPlan.getTermPlan({level:level,subject:subject,term:block,ability:ability});
      worksheet.revisionPaper = global.PacEduTermLearningPlan.getRevisionPaper({level:level,subject:subject,term:block,ability:ability});
      if (global.PacEduPracticeExamPaper && typeof global.PacEduPracticeExamPaper.getPaper === "function") {
        worksheet.practiceExamPaper = global.PacEduPracticeExamPaper.getPaper({level:level,subject:subject,term:block,ability:ability});
      }
    }
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
    subjects:Object.keys(packs).concat(["Chemistry","Physics","Biology"]),
    getSubjectsForLevel:subjectsForLevel,
    secondaryScienceStructure:[
      {forms:["Form 3","Form 4"],subject:"Science",label:"Basic Science"},
      {forms:["Form 5","Form 6","Form 7"],subject:"Chemistry",label:"Chemistry"},
      {forms:["Form 5","Form 6","Form 7"],subject:"Biology",label:"Biology"},
      {forms:["Form 5","Form 6","Form 7"],subject:"Physics",label:"Physics"}
    ],
    scienceSubjectsForForms:["Chemistry","Physics","Biology"],
    getWorksheet:make,
    getCurriculumWorksheet:getCurriculumWorksheet,
    getAllAbilityWorksheets:function(level,subject,day){
      var groups=["support","developing","expected","extension"];
      return groups.map(function(ability){return make(level,subject,day,ability);});
    },
    getAllSubjectAbilityWorksheets:function(level,day){
      return Object.keys(packs).map(function(subject){
        return {subject:subject,groups:["support","developing","expected","extension"].map(function(ability){
          return make(level,subject,day,ability);
        })};
      });
    },
    hasAnswerKey:function(level,subject,day,ability){var w=make(level,subject,day,ability);return w.questions.length===4&&w.answerKey.length===4&&w.answerKey.every(function(a){return !!a.answer&&!!a.explanation;});}
  });
})(window);
