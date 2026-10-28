/* PacEdu dynamic differentiation layer for every generated class/subject/day.
 * Adds explicit ability-specific activities without replacing the existing worksheet content.
 * Draft practice only: teachers verify current Fiji syllabus alignment before assigning.
 */
(function(global){
  "use strict";
  var bands={
    support:{label:"Supported start",tasks:[
      "Teacher models the first item and thinks aloud.",
      "Complete the first two core items with a picture, object, word bank, worked example or read-aloud as appropriate.",
      "Explain, point, draw, sign, select or demonstrate one answer; record prompts used."
    ],revision:"Revisit one earlier example with the teacher, then try a similar item with less help.",check:"Can the learner demonstrate the target with the planned support?"},
    developing:{label:"Developing",tasks:[
      "Review one worked example, then attempt the core questions independently before asking for a hint.",
      "Complete the core task and show the important step, detail or evidence.",
      "Correct one response using feedback and explain the correction."
    ],revision:"Answer two retrieval questions from earlier lessons, then correct one using the notes or feedback.",check:"Can the learner complete the core skill with limited prompting?"},
    expected:{label:"Working at class goal",tasks:[
      "Complete the class-level task independently using the success criteria.",
      "Show working, evidence, a demonstration or a clear explanation appropriate to the subject.",
      "Check the result against the success criteria and identify one improvement."
    ],revision:"Complete a short mixed review of previously taught skills without a model, then check answers.",check:"Does the evidence meet the stated class-level success criteria independently?"},
    extension:{label:"Extension / deeper challenge",tasks:[
      "Complete the core task, then apply the skill to a new or less familiar Fiji-life example.",
      "Compare two approaches or interpretations and justify the stronger one with evidence or working.",
      "Create one related challenge question and provide a reasoned answer or model solution."
    ],revision:"Mix skills from earlier lessons and solve one transfer question; explain why the method fits.",check:"Can the learner transfer the skill and justify a decision, not merely finish faster?"}
  };
  var subjectActions={
    "English":"Read/listen to the text, identify meaning and vocabulary, then respond using the class-level reading or writing target.",
    "Mathematics":"Represent the problem with objects, a drawing, number sentence or calculation; show and check the method.",
    "Science":"Observe or use the provided evidence, record a result, explain the concept and follow safety instructions.",
    "Social Studies":"Use a local community, place, source, map or timeline example; explain the idea with relevant evidence.",
    "Healthy Living":"Apply the concept to a safe, age-appropriate everyday choice and explain the reason.",
    "Physical Education":"Practise or describe the movement skill safely; use an accessible equivalent response where needed.",
    "Arts and Crafts":"Plan, make or analyse a suitable design; explain the materials, technique and one improvement.",
    "Music":"Listen, perform, tap, move, represent or describe the rhythm/pattern; allow an accessible equivalent.",
    "Digital Literacy":"Complete or describe the digital task safely; protect personal information and explain the steps.",
    "iTaukei Language":"Use teacher-verified iTaukei text or vocabulary; practise the assigned language skill with checked meanings.",
    "Hindi":"Use teacher-verified Hindi text or vocabulary; practise the assigned language skill with checked meanings."
  };
  function enrich(sheet, options){
    if(!sheet||sheet.status==="NOT_FOUND") return sheet;
    options=options||{};
    var ability=["support","developing","expected","extension"].indexOf(options.ability)>=0?options.ability:(sheet.ability||"developing");
    var band=bands[ability]||bands.developing;
    var subject=sheet.subject||options.subject||"English";
    var level=sheet.level||options.level||"Class 1";
    var day=Number(options.day)||Number(sheet.day)||1;
    var lesson=sheet.dailyLesson||{};
    var action=subjectActions[subject]||"Complete the subject task, show evidence and check the result.";
    var activities={
      bandId:ability,bandLabel:band.label,subject:subject,level:level,day:day,
      daily:{title:"Today's differentiated activity",steps:band.tasks.slice(),subjectTask:action,successCheck:band.check},
      drill:{title:"Short skill drill",instructions:ability==="support"?"Teacher models one example; learner completes two similar items with support.":ability==="developing"?"Complete three short items; use one hint only after trying.":ability==="expected"?"Complete four short items independently and check each answer.":"Complete the core drill and one transfer item; explain the method.",subjectTask:action},
      revision:{title:"Retrieval revision",instructions:band.revision,linkage:"Use only skills taught in earlier approved daily lessons for this class and subject."},
      examPractice:{title:"Exam-style practice",instructions:ability==="support"?"Try one accessible question with instructions read aloud; teacher checks understanding.":ability==="developing"?"Try two exam-style items with limited prompts.":ability==="expected"?"Complete the class-level exam-style item independently and show evidence or working.":"Complete a more demanding application item and justify the answer.",safeguard:"Practice only; not an official or past examination paper."},
      evidence:{acceptableModes:["written response","oral response","signed response","picture/object demonstration","practical performance where suitable"],teacherRecord:["independent","with support","not yet demonstrated","not observed"],rule:"Do not assign a lower ability group from missing, unclear or absent evidence."}
    };
    sheet.abilityActivities=activities;
    sheet.abilityBand=ability;
    sheet.differentiationNote="This activity is differentiated by the selected ability band. Bands are flexible teaching supports, not permanent labels. Teacher must check age/class fit, answer guidance and current official Fiji syllabus mapping.";
    if(lesson && typeof lesson==="object"){
      lesson.abilitySpecificActivities=activities.daily.steps.slice();
      lesson.abilitySubjectTask=action;
      lesson.abilitySuccessCheck=band.check;
      sheet.dailyLesson=lesson;
    }
    return sheet;
  }
  function install(){
    var api=global.PacEduDailyWorksheetContent;
    if(!api||typeof api.getCurriculumWorksheet!=="function"||api.abilityDifferentiationInstalled) return false;
    var originalCurriculum=api.getCurriculumWorksheet;
    var originalWorksheet=api.getWorksheet;
    var wrapped={};
    Object.keys(api).forEach(function(k){wrapped[k]=api[k];});
    wrapped.getCurriculumWorksheet=function(options){return enrich(originalCurriculum(options),options);};
    if(typeof originalWorksheet==="function"){
      wrapped.getWorksheet=function(level,ability,day,subject){
        var sheet=originalWorksheet(level,ability,day,subject);
        return enrich(sheet,{level:level,ability:ability,day:day,subject:subject});
      };
    }
    wrapped.abilityDifferentiationInstalled=true;
    global.PacEduDailyWorksheetContent=Object.freeze(wrapped);
    return true;
  }
  if(!install()&&global.document){
    var tries=0,timer=global.setInterval(function(){tries+=1;if(install()||tries>=40)global.clearInterval(timer);},100);
  }
  global.PacEduAbilityDifferentiation=Object.freeze({bands:bands,subjects:Object.keys(subjectActions),enrich:enrich});
})(window);
