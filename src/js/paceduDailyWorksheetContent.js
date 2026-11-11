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
  /* Four distinct PacEdu practice banks. These are original draft activities,
     not imported Ministry syllabus outcomes; teachers must map and review them. */
  Object.assign(packs, {
    "Phonics": [
      {topic:"Hear and identify initial sounds",passage:"A learner says sun, sock and sand slowly. The words begin with the same sound. The learner listens first, then says the sound and matches it to the letter s.",questions:[
        ["Which sound begins sun, sock and sand?","/s/",["/m/","/t/","/p/"],0,"All three words begin with the /s/ sound."],
        ["Which word begins with /m/?","map",["sun","sock","sand"],0,"Map begins with /m/."],
        ["What should a learner do before choosing a sound?","Listen to the beginning of the word",["Guess from the last letter","Count the pictures only","Skip the word"],0,"Listening to the first sound supports accurate identification."],
        ["Which letter commonly represents /s/ in these words?","s",["m","t","p"],0,"The words shown use s for the initial /s/ sound."]
      ]},
      {topic:"Blend sounds to read a word",passage:"A teacher models the sounds /c/ /a/ /t/. The learner says each sound, then blends them smoothly to read cat. The learner repeats the process with map and sun.",questions:[
        ["Which word is made by blending /c/ /a/ /t/?","cat",["cap","can","cut"],0,"The three sounds blend to make cat."],
        ["What does blending mean?","Joining sounds to read a word",["Removing every vowel","Naming only the last letter","Counting syllables without saying sounds"],0,"Blending joins phonemes in sequence."],
        ["Which word can be blended from /m/ /a/ /p/?","map",["mat","man","mop"],0,"The final sound /p/ makes map."],
        ["What is a useful first step when a word is unfamiliar?","Say the grapheme sounds in order",["Guess without looking","Ignore the letters","Change the word"],0,"Sounding through the graphemes supports decoding."]
      ]},
      {topic:"Segment sounds for spelling",passage:"To spell fish, a learner listens for /f/ /i/ /sh/. The learner says the sounds in order and chooses the letters that represent them. The teacher reminds the learner that sh represents one sound.",questions:[
        ["How many sounds are heard in fish?","Three",["Two","Four","Five"],0,"Fish has /f/, /i/ and /sh/."],
        ["Which letters represent the final sound in fish?","sh",["s","h","ch"],0,"The digraph sh represents the final sound."],
        ["What is segmenting?","Breaking a spoken word into its sounds",["Joining two sentences","Counting only written letters","Changing the meaning"],0,"Segmenting identifies the phonemes in a word."],
        ["Which word also begins with /f/?","fan",["ship","map","sun"],0,"Fan begins with /f/."]
      ]}
    ],
    "Agriculture": [
      {topic:"Needs of a healthy garden plant",passage:"A school garden grows bean plants. Learners loosen the soil, water carefully, check for sunlight and observe new leaves. They do not pull up a plant to measure its growth.",questions:[
        ["Which item is needed by a growing bean plant?","Water",["Plastic toys","Paint","A metal spoon"],0,"Water is one of the basic needs of a plant."],
        ["Why should learners observe new leaves?","To record evidence of plant growth",["To stop the plant growing","To change the soil colour","To count classroom chairs"],0,"New leaves can be recorded as evidence of growth."],
        ["Which action is safer for checking growth?","Observe and measure without damaging the plant",["Pull the plant out each day","Break the stem","Remove all leaves"],0,"Non-destructive observation protects the plant."],
        ["What is a useful garden record?","Date and plant observations",["A guess with no date","An unrelated shopping list","A private password"],0,"Dated observations help compare growth over time."]
      ]},
      {topic:"Preparing soil safely",passage:"Before planting, a class checks the garden area with the teacher. Learners remove safe plant debris using suitable tools and adult guidance. They do not handle unknown chemicals, sharp waste or animal droppings.",questions:[
        ["Who should guide the class before garden work?","The teacher",["A younger child alone","An unknown visitor","Nobody"],0,"The passage says the class checks the area with the teacher."],
        ["What should learners do with unknown chemicals?","Do not touch them; tell the teacher",["Smell them closely","Mix them together","Pour them on plants"],0,"Unknown chemicals may be hazardous."],
        ["Why prepare soil before planting?","To make a suitable place for seeds or seedlings",["To hide tools","To make the area unsafe","To prevent all water entering"],0,"Soil preparation supports planting."],
        ["Which tool practice is appropriate?","Use suitable tools with instruction and care",["Wave tools near others","Leave sharp tools on a path","Use a damaged tool"],0,"Safe tool use requires guidance and care."]
      ]},
      {topic:"Harvesting and handling produce",passage:"A class harvests mature vegetables with adult guidance. Learners wash produce using safe water, remove damaged items and keep food away from soil and dirty surfaces.",questions:[
        ["When should produce be harvested?","When it is mature and ready",["Before it has grown","Whenever the soil is wet","Only after it has spoiled"],0,"The passage says mature vegetables are harvested."],
        ["What should be used to wash produce?","Safe water",["Unknown liquid","Dirty drain water","Paint"],0,"Safe water is stated in the passage."],
        ["Why keep food away from dirty surfaces?","To reduce contamination",["To change its shape","To make it grow again","To avoid washing"],0,"Clean handling helps reduce contamination."],
        ["Who should guide harvesting with tools?","An adult or teacher",["A learner without instruction","A person who is not present","Nobody"],0,"The passage specifies adult guidance."]
      ]}
    ],
    "Home Economics": [
      {topic:"Food hygiene before preparation",passage:"Before preparing a snack, Mere washes her hands with soap and safe water. She cleans the work surface, uses clean utensils and keeps raw and ready-to-eat foods separate.",questions:[
        ["What should Mere do before preparing food?","Wash her hands with soap and safe water",["Touch her face then handle food","Use dirty utensils","Skip cleaning"],0,"Handwashing is the first hygiene step described."],
        ["Why use clean utensils?","To reduce the risk of contamination",["To change the food colour","To make food cook instantly","To avoid washing hands"],0,"Clean utensils help prevent contamination."],
        ["What should be kept separate?","Raw and ready-to-eat foods",["Clean plates and clean cups","Different clean spoons","Food and a shopping list"],0,"Separation reduces cross-contamination risk."],
        ["Which is a clean preparation surface?","A washed and sanitised work surface",["A rubbish bin lid","A dirty floor","A surface with unknown chemicals"],0,"Food should be prepared on a properly cleaned surface."]
      ]},
      {topic:"Planning a balanced, affordable snack",passage:"A family plans a snack using foods that are available, affordable and suitable for their needs and culture. They include fruit when available and provide safe drinking water. They check reliable health advice for individual needs.",questions:[
        ["What should guide a family's snack plan?","Needs, affordability, availability and culture",["Only food colour","An online rumour","A fixed menu for every person"],0,"The passage names these factors."],
        ["Which drink is provided?","Safe drinking water",["Cleaning liquid","Unknown liquid","Paint"],0,"Safe drinking water is directly stated."],
        ["Why check reliable health advice?","Needs can differ between people",["Every person has identical needs","Advice is never useful","To avoid planning"],0,"The passage notes individual needs."],
        ["Which is a sensible planning action?","Compare available foods and costs",["Buy without checking the budget","Ignore household needs","Waste ingredients"],0,"Comparing choices supports affordable planning."]
      ]},
      {topic:"Safe use of household equipment",passage:"A learner uses a kitchen tool only after the teacher explains its purpose and safe handling. Hot surfaces and sharp tools are handled by an adult or under close supervision. Equipment is cleaned and stored safely after use.",questions:[
        ["What should happen before using a kitchen tool?","Receive instructions about its purpose and safe handling",["Use it without looking","Share it while running","Test it on another person"],0,"Instruction comes before use."],
        ["Who should handle hot surfaces or sharp tools?","An adult or learner under close supervision",["A learner alone without training","A person who cannot see the tool","Nobody should follow safety rules"],0,"The passage requires adult handling or close supervision."],
        ["What should happen after use?","Clean and store equipment safely",["Leave it on the floor","Hide it in food","Leave it switched on"],0,"The passage says equipment is cleaned and stored safely."],
        ["What is the main purpose of safety rules?","Prevent injury and use equipment responsibly",["Make tasks confusing","Encourage careless handling","Replace teacher guidance"],0,"Safety rules reduce risk."]
      ]}
    ],
    "Computer Studies": [
      {topic:"Parts of a computer system",passage:"A computer system can include input devices, a processor, storage and output devices. A keyboard enters text, a processor carries out instructions, storage keeps data, and a screen displays information.",questions:[
        ["Which device is used to enter text?","Keyboard",["Screen","Speaker","Projector"],0,"A keyboard is an input device."],
        ["What does storage do?","Keeps data",["Displays pictures only","Prints paper","Moves a cursor"],0,"Storage keeps data for later use."],
        ["Which part displays information?","Screen",["Keyboard","Mouse pad","Microphone"],0,"A screen is an output device."],
        ["What does a processor do?","Carries out instructions",["Washes the computer","Prints every file","Supplies drinking water"],0,"The processor executes instructions."]
      ]},
      {topic:"Files, folders and saving work",passage:"A learner creates a document, gives it a clear file name and saves it in the correct class folder. The learner checks that the saved file can be opened before closing the program.",questions:[
        ["Why give a file a clear name?","To make it easier to identify later",["To delete it automatically","To share a password","To change the screen size"],0,"A clear name helps locate the file."],
        ["Where should class work be saved?","In the correct class folder",["In a random unknown folder","Only in the recycle bin","Inside an unrelated picture"],0,"The passage says to use the correct class folder."],
        ["What should the learner do before closing the program?","Check that the file was saved and can be opened",["Switch off without saving","Delete the folder","Rename someone else's work"],0,"Checking helps confirm the work is saved."],
        ["Which is a suitable file name?","Class5_Science_Weather",["Untitled??","password123","newnewfinalmaybe"],0,"A descriptive name identifies class, subject and topic."]
      ]},
      {topic:"Digital safety and privacy",passage:"A learner keeps passwords private, asks a trusted teacher before opening an unfamiliar link and does not share personal details with strangers. If a message feels unsafe, the learner stops and tells a trusted adult.",questions:[
        ["Who should know a learner's password?","The learner and authorised trusted support where necessary",["Everyone in the class","Unknown online users","People sending suspicious messages"],0,"Passwords should be kept private and protected."],
        ["What should happen before opening an unfamiliar link?","Ask a trusted teacher or adult",["Click immediately","Send it to everyone","Enter personal details"],0,"The passage recommends checking first."],
        ["What should a learner do with an unsafe message?","Stop and tell a trusted adult",["Reply with private information","Forward it to strangers","Ignore all safety concerns"],0,"The passage gives this safe response."],
        ["Which information should not be shared with strangers?","Personal details",["A public classroom topic","A general subject name","A fictional character"],0,"Personal details should be protected."]
      ]}
    ]
  });
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
    if(ability==="support") tasks.unshift("FOUNDATION: teacher models Question 1; use read-aloud, pictures, a word bank or concrete objects, then try the next question.");
    else if(ability==="developing") tasks.unshift("DEVELOPING: try independently first; ask for one hint only if needed.");
    else if(ability==="expected") tasks.unshift("EXPECTED: complete independently and check each answer.");
    else if(ability==="extension") tasks.unshift("ADVANCED: complete the core work, then create a new example or explain why a tempting wrong answer is incorrect.");
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
      support: "FOUNDATION: teacher models Question 1; use read-aloud, pictures, a word bank or a sentence frame.",
      developing: "DEVELOPING: try independently first; ask for one hint or word bank if needed.",
      expected: "EXPECTED: complete independently where possible and check each answer against the text.",
      extension: "ADVANCED: complete the core work, then create a related question or justify an alternative interpretation."
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

  function indicatorTermForBlock(block) {
    return block === "T1" ? "Term 1" : block === "T2" ? "Term 2" : block === "T3" ? "Term 3" : String(block || "");
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
    /* Stable, ability-neutral question identity for safe learner resume.
       Increment the sequence version if the approved question order/content is deliberately replaced. */
    var activityScope = [level, subject, block, "week-" + week, "day-" + day].map(function (part) {
      return String(part || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    }).join(":");
    var activityId = "pacedu-fiji-daily-v1:" + activityScope;
    var questionSequenceVersion = 1;
    var questionSequenceId = activityId + ":sequence-v" + questionSequenceVersion;
    worksheet.activityId = activityId;
    worksheet.questionSequenceId = questionSequenceId;
    worksheet.questionSequenceVersion = questionSequenceVersion;
    worksheet.questions = (worksheet.questions || []).map(function (question, index) {
      return Object.assign({}, question, {
        questionId: activityId + ":question:" + String(index + 1),
        sequenceId: questionSequenceId,
        sequencePosition: index + 1,
        sequenceVersion: questionSequenceVersion
      });
    });
    worksheet.answerKey = (worksheet.answerKey || []).map(function (entry, index) {
      return Object.assign({}, entry, {
        questionId: worksheet.questions[index] && worksheet.questions[index].questionId || "",
        sequenceId: questionSequenceId,
        sequencePosition: index + 1,
        sequenceVersion: questionSequenceVersion
      });
    });
    var distributionRuntime = global.PacEduAchievementDistributionRuntime;
    var distributionTerm = indicatorTermForBlock(block);
    var distributionLink = distributionRuntime && typeof distributionRuntime.linkDailyActivity === "function"
      ? distributionRuntime.linkDailyActivity(worksheet, {
          level: level, subjectId: subject, term: distributionTerm, week: week, day: day
        })
      : { indicatorIds: [], indicatorMappingStatus: "DISTRIBUTION_FILE_NOT_IMPORTED", indicatorAssignment: null,
          assessmentMapping: { indicatorIds: [], evidenceTypes: [], mappingStatus: "DISTRIBUTION_FILE_NOT_IMPORTED",
            formalAssessmentEligible: false, serverAuthorizationRequired: true } };
    worksheet.indicatorIds = distributionLink.indicatorIds || [];
    worksheet.indicatorMappingStatus = distributionLink.indicatorMappingStatus;
    worksheet.indicatorAssignment = distributionLink.indicatorAssignment || null;
    worksheet.assessmentMapping = distributionLink.assessmentMapping;
    worksheet.questions = worksheet.questions.map(function (question) {
      return Object.assign({}, question, {
        indicatorIds: worksheet.indicatorIds.slice(),
        indicatorMappingStatus: worksheet.indicatorMappingStatus
      });
    });
    if (worksheet.indicatorAssignment) {
      var mapped = worksheet.indicatorAssignment;
      worksheet.dailyLesson.curriculumAlignment.candidateIndicator = {
        id: mapped.indicatorId,
        text: mapped.indicatorText,
        strand: mapped.strand || "",
        sourceStatus: mapped.sourceStatus,
        reviewStatus: mapped.reviewStatus,
        status: mapped.mappingStatus,
        productionEligible: false
      };
      worksheet.dailyLesson.curriculumAlignment.achievementIndicator = mapped.mappingStatus === "VALIDATED"
        ? mapped.indicatorText : null;
      worksheet.dailyLesson.curriculumAlignment.verificationStatus = mapped.mappingStatus;
      worksheet.dailyLesson.curriculumAlignment.rule += " The exact class/subject/term/week/day distribution slot is linked; formal assessment still requires trusted server-side authorization.";
    } else {
      worksheet.dailyLesson.curriculumAlignment.rule += " No indicator has been imported for this exact class/subject/term/week/day slot. Do not infer or invent one.";
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
    subjects:Object.keys(packs),
    getWorksheet:make,
    getCurriculumWorksheet:getCurriculumWorksheet,
    hasAnswerKey:function(level,subject,day,ability){var w=make(level,subject,day,ability);return w.questions.length===4&&w.answerKey.length===4&&w.answerKey.every(function(a){return !!a.answer&&!!a.explanation;});}
  });
})(window);
