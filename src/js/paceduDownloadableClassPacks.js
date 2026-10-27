/* PacEdu downloadable class packs: prepared-date metadata, class/subject/ability filters,
 * daily worksheets, revision practice, mock practice exam, answer keys and marking guidance.
 * Generated locally in the teacher browser; no learner ID is embedded in class-wide downloads.
 */
(function(global,document){
"use strict";
var SUBJECTS=["English","Mathematics","Science","Social Studies","Healthy Living","Physical Education","Arts and Crafts","Music","Digital Literacy","iTaukei Language","Hindi"];
var LEVELS=["ECE"];for(var c=1;c<=8;c++)LEVELS.push("Class "+c);for(var f=3;f<=7;f++)LEVELS.push("Form "+f);
var ABILITIES=[
 {id:"support",label:"Support",guidance:"Use short instructions, concrete objects or pictures, model one step, allow oral/sign/point/draw responses and record prompts used."},
 {id:"developing",label:"Developing",guidance:"Show one model, provide limited prompts, then ask for an independent attempt."},
 {id:"expected",label:"Expected",guidance:"Complete the class-level task independently and explain or check the method."},
 {id:"extension",label:"Extension",guidance:"Add transfer to an unfamiliar example, comparison, justification or second method."}
];
var SUBJECT_CRITERIA={
 "English":[["Meaning and comprehension","Understand the text, question or spoken prompt."],["Vocabulary and language","Use suitable words, sentence structure and language features."],["Evidence and task completion","Use relevant details and complete the requested task."],["Communication","Communicate clearly in an appropriate spoken, signed, written or accessible form."]],
 "Mathematics":[["Accuracy","Correct answer and appropriate units or notation."],["Method and working","Steps, calculations or strategy are shown where required."],["Representation","Suitable objects, diagram, table, equation or model."],["Reasoning and checking","Explain the method and check whether the result makes sense."]],
 "Science":[["Scientific understanding","Use accurate subject concepts and terms."],["Observation and recording","Record relevant observations or data clearly."],["Method and safety","Use a suitable method and follow safety instructions."],["Evidence and conclusion","Link the conclusion to observations or data."]],
 "Social Studies":[["Concept accuracy","Explain the relevant people, place, event or community concept accurately."],["Use of sources","Use relevant maps, timelines, sources or information."],["Explanation and evidence","Explain relationships, causes, effects or viewpoints with evidence."],["Context and communication","Apply learning respectfully to a suitable local or wider context."]],
 "Healthy Living":[["Health knowledge","Identify accurate health, wellbeing or safety information."],["Safe decision","Choose a safe, suitable action for the scenario."],["Steps and explanation","Describe practical steps and explain why they help."],["Application","Apply learning to an age-appropriate real-life situation."]],
 "Physical Education":[["Movement skill","Demonstrate the taught movement or skill at the learner's level."],["Understanding","Follow relevant rules, instructions or tactics."],["Safety and cooperation","Use safe practice and work respectfully with others."],["Effort and reflection","Participate appropriately and identify one improvement."]],
 "Arts and Crafts":[["Idea and intention","Show a clear idea or purpose for the work."],["Technique and elements","Use suitable art, craft, design or performance elements."],["Making and completion","Complete the task using materials safely and appropriately."],["Reflection","Describe choices, meaning or a possible improvement."]],
 "Music":[["Rhythm and pitch","Demonstrate the taught rhythm, pitch or sound pattern."],["Technique and control","Use an appropriate voice, instrument, body or digital method."],["Expression and participation","Participate and communicate the intended musical idea."],["Listening and reflection","Notice a feature and describe or demonstrate an improvement."]],
 "Digital Literacy":[["Task and concept","Complete the intended digital task or explain the concept accurately."],["Process and problem-solving","Follow steps, select a suitable tool and resolve a simple problem."],["Safety and responsibility","Protect personal information and use technology respectfully."],["Output and explanation","Present the result clearly and explain key choices."]],
 "iTaukei Language":[["Meaning and comprehension","Understand the taught spoken, written or visual language."],["Vocabulary and structure","Use suitable iTaukei words and language patterns for the level."],["Language skill","Demonstrate the assigned listening, speaking, reading or writing skill."],["Communication and context","Communicate meaning appropriately and respectfully in context."]],
 "Hindi":[["Meaning and comprehension","Understand the taught spoken, written or visual Hindi."],["Vocabulary and structure","Use suitable vocabulary and language patterns for the level."],["Language skill","Demonstrate the assigned listening, speaking, reading or writing skill."],["Communication and context","Communicate meaning appropriately and respectfully in context."]]
};
function criteriaHtml(subject){
 var items=SUBJECT_CRITERIA[subject]||[["Accuracy","Use correct subject knowledge."],["Process","Show the steps, method or practical process."],["Evidence","Support the response with relevant evidence or demonstration."],["Communication","Explain or present the result clearly."]];
 return "<p>Suggested scoring per criterion: 0 = not yet demonstrated; 1 = beginning / substantial support; 2 = developing / partly independent; 3 = meets the task criterion independently. Maximum 12 points if all four criteria apply. Teachers must adapt the scale for ECE, practical, oral, performance and syllabus-specific outcomes; do not apply it mechanically.</p><ol>"+items.map(function(x){return "<li><strong>"+esc(x[0])+"</strong>: "+esc(x[1])+"</li>";}).join("")+"</ol>";
}
function esc(v){return String(v==null?"":v).replace(/[&<>"]/g,function(ch){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[ch];});}
function dateStamp(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
function selectedApi(){return global.PacEduDailyWorksheetContent&&global.PacEduTermLearningPlan;}
function listQuestions(items,keys){
 if(!items||!items.length)return "<p>No questions were returned by the current subject template. Teacher must add and verify subject-specific questions before use.</p>";
 return "<ol>"+items.map(function(q,i){var key=keys&&keys[i]||{};var opts=q.options&&q.options.length?"<ul>"+q.options.map(function(o){return "<li>"+esc(o)+"</li>";}).join("")+"</ul>":"";return "<li>"+esc(q.prompt||q.question||q.text||"Teacher: enter the approved question.")+opts+(keys?"<p><strong>Teacher answer / marking note:</strong> "+esc(key.answer||key.explanation||"Review against the approved subject rubric.")+" "+esc(key.explanation||"")+"</p>":"")+"</li>";}).join("")+"</ol>";
}
function build(options){
 options=options||{};var api=selectedApi();if(!api)throw new Error("PacEdu lesson and term modules are not ready.");
 var level=LEVELS.indexOf(options.level)>=0?options.level:"Class 1";
 var subject=SUBJECTS.indexOf(options.subject)>=0?options.subject:"English";
 var ability=ABILITIES.some(function(a){return a.id===options.ability;})?options.ability:"developing";
 var term=/^T[123]$/.test(options.term||"")?options.term:"T1";
 var weeks=term==="T3"?5:9,prepared=new Date(),band=ABILITIES.filter(function(a){return a.id===ability;})[0];
 var sections=[],missing=0;
 for(var w=1;w<=weeks;w++)for(var d=1;d<=5;d++){
  var sheet=api.getCurriculumWorksheet({level:level,subject:subject,term:term,week:w,day:d,ability:ability,skipTermPlan:true});
  if(!sheet||sheet.status==="NOT_FOUND"){missing++;continue;}
  var lesson=sheet.dailyLesson||{},qs=sheet.questions||[],keys=sheet.answerKey||[];
  sections.push("<section class=\"worksheet\"><h2>"+esc(term+" · Week "+w+" · Day "+d)+" — "+esc(sheet.title||subject+" daily activity")+"</h2>"+
   "<p><strong>Prepared by PacEdu:</strong> "+esc(dateStamp(prepared))+" · <strong>Class:</strong> "+esc(level)+" · <strong>Subject:</strong> "+esc(subject)+" · <strong>Ability group:</strong> "+esc(band.label)+"</p>"+
   "<p><strong>Learning focus:</strong> "+esc(lesson.learningIntention||sheet.goal||sheet.topic||"Use the teacher-approved class scheme of work.")+"</p>"+
   "<p><strong>Concept / indicator:</strong> "+esc(sheet.concept||sheet.curriculumSchedule&&sheet.curriculumSchedule.suggestedFocus||"Teacher to verify")+" <em>— official indicator mapping: "+esc(sheet.curriculumSchedule&&sheet.curriculumSchedule.verificationStatus||"NOT_YET_MAPPED")+"</em></p>"+
   "<h3>See / visual example</h3><p>"+esc(lesson.visualStoryboard||lesson.visualPrompt||lesson.example||"Teacher: add a suitable visual or real-object example.")+"</p>"+
   "<h3>Read</h3><p>"+esc(lesson.readingText||lesson.text||lesson.workedExample||"Read the teacher-approved worked example.")+"</p>"+
   "<h3>Hear / narration</h3><p>"+esc(lesson.audioNarration&&lesson.audioNarration.transcript||lesson.narration||lesson.audioTranscript||"Teacher may read the instructions aloud; provide a written transcript.")+"</p>"+
   "<h3>Try</h3>"+listQuestions(qs,keys)+
   "<h3>Subject-specific marking criteria</h3>"+criteriaHtml(subject)+"<p><strong>Ability guidance ("+esc(band.label)+"):</strong> "+esc(band.guidance)+"</p><p>Accept accessible equivalent evidence where the learning outcome allows it; note prompts and accommodations used.</p>"+
   "<p><strong>Teacher review:</strong> verify source, class fit, answers and current achievement indicator before assigning. Do not infer ability from missing work or an unclear image.</p></section>");
 }
 var plan=global.PacEduTermLearningPlan;
 var revision=plan&&plan.getRevisionPaper?plan.getRevisionPaper({level:level,subject:subject,term:term,ability:ability}):null;
 var exam=global.PacEduPracticeExamPaper&&global.PacEduPracticeExamPaper.getPaper?global.PacEduPracticeExamPaper.getPaper({level:level,subject:subject,term:term,ability:ability}):null;
 var rubric=global.PacEduAssessmentBlueprints&&global.PacEduAssessmentBlueprints.buildBlueprint?global.PacEduAssessmentBlueprints.buildBlueprint({level:level,subject:subject,paperType:"Revision paper"}):null;
 var extras="";
 if(revision)extras+="<section class=\"worksheet\"><h2>End-of-term revision practice</h2><p>Prepared by PacEdu: "+esc(dateStamp(prepared))+" · "+esc(level)+" · "+esc(subject)+" · "+esc(band.label)+"</p><p>Draft status: "+esc(revision.status)+"; not an official paper.</p>"+listQuestions(revision.questions,revision.answerKey)+"</section>";
 if(exam)extras+="<section class=\"worksheet\"><h2>Mock practice examination — not an official or past paper</h2><p>Prepared by PacEdu: "+esc(dateStamp(prepared))+" · "+esc(level)+" · "+esc(subject)+" · "+esc(band.label)+"</p><p>Teacher must review every question and answer key before use.</p>"+listQuestions(exam.questions,exam.answerKey)+"</section>";
 if(rubric)extras+="<section class=\"worksheet\"><h2>Suggested assessment blueprint — teacher must adapt to the task</h2><p>"+esc(rubric.note||rubric.purpose||"Draft marking framework; not an official Ministry rubric.")+"</p>"+(rubric.blueprint||[]).map(function(x){return "<p><strong>"+esc(x.component)+"</strong>: "+esc(x.weightPercent)+"% — "+esc(x.questionFormats)+"</p>";}).join("")+"<h3>Marking safeguards</h3><ul><li>Use the task-specific answer key for objective questions.</li><li>Use a published teacher-approved rubric for open-ended, oral, practical, creative and language responses.</li><li>Keep raw marks, feedback and any adjustments visible to the authorised teacher for review.</li><li>Camera images must be clear enough to read; otherwise request a new image or manual review.</li></ul></section>";
 var html="<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>PacEdu "+esc(level)+" "+esc(subject)+" "+esc(term)+" pack</title><style>body{font:16px/1.5 Arial,sans-serif;max-width:900px;margin:auto;padding:20px;color:#17212b}h1,h2,h3{line-height:1.2}section{page-break-inside:avoid;border-bottom:1px solid #999;padding:12px 0}li{margin:7px 0}.meta{background:#f2f5f7;padding:12px;border-radius:8px}@media print{body{max-width:none;padding:0}section{page-break-inside:avoid}}</style></head><body><h1>PacEdu downloadable learning pack</h1><div class=\"meta\"><p><strong>Prepared by PacEdu:</strong> "+esc(dateStamp(prepared))+"</p><p><strong>Class:</strong> "+esc(level)+" · <strong>Subject:</strong> "+esc(subject)+" · <strong>Term:</strong> "+esc(term)+" · <strong>Ability:</strong> "+esc(band.label)+"</p><p><strong>Daily activities:</strong> "+sections.length+" · <strong>Schedule:</strong> "+weeks+" weeks / "+(weeks*5)+" planned learning days</p><p><strong>Prepared date</strong> is automatic. Exact calendar dates must come from the school-approved calendar; this pack does not invent them.</p><p><strong>Curriculum status:</strong> draft framework. Verify all achievement indicators against the current authorised syllabus before calling this officially aligned.</p></div>"+sections.join("")+extras+"<footer><p>PacEdu pilot resource · Prepared "+esc(dateStamp(prepared))+" · Student ID numbers are intentionally excluded from class-wide downloads. Link individual submissions using the authorised PacEdu learner reference and class/subject/activity identifiers.</p></footer></body></html>";
 return {html:html,filename:"PacEdu_"+level.replace(/[^A-Za-z0-9]+/g,"-")+"_"+subject.replace(/[^A-Za-z0-9]+/g,"-")+"_"+term+"_"+ability+"_"+dateStamp(prepared)+".html",preparedDate:dateStamp(prepared),level:level,subject:subject,term:term,ability:ability,dailyActivities:sections.length,missingSlots:missing};
}
function download(options){
 var pack=build(options);var blob=new Blob([pack.html],{type:"text/html;charset=utf-8"});var url=global.URL.createObjectURL(blob);var a=document.createElement("a");a.href=url;a.download=pack.filename;a.style.display="none";document.body.appendChild(a);a.click();a.remove();global.setTimeout(function(){global.URL.revokeObjectURL(url);},1500);return pack;
}
function renderControls(container,context){
 if(!container||!document||!document.createElement)return false;
 var panel=document.createElement("section");panel.setAttribute("aria-label","Download class learning pack");panel.style.cssText="margin:14px 0;padding:14px;border:1px solid #b7c9d6;border-radius:9px;";
 var h=document.createElement("h4");h.textContent="Download class activities and assessment pack";panel.appendChild(h);
 var note=document.createElement("p");note.textContent="Prepare a printable HTML pack for the selected class, subject, term and ability group. The preparation date is automatic. Open the file in a browser and choose Print / Save as PDF if needed.";panel.appendChild(note);
 function select(label,values,chosen){var wrap=document.createElement("label");wrap.style.cssText="display:block;margin:8px 0;font-weight:600;";wrap.appendChild(document.createTextNode(label+" "));var s=document.createElement("select");s.style.cssText="display:block;width:100%;max-width:100%;padding:9px;margin-top:4px;font:inherit;";values.forEach(function(v){var o=document.createElement("option");o.value=v.value;o.textContent=v.label;if(v.value===chosen)o.selected=true;s.appendChild(o);});wrap.appendChild(s);panel.appendChild(wrap);return s;}
 var levels=LEVELS.map(function(x){return {value:x,label:x};}),subjects=SUBJECTS.map(function(x){return {value:x,label:x};}),abilities=ABILITIES.map(function(x){return {value:x.id,label:x.label};});
 var level=select("Class / level:",levels,LEVELS.indexOf(context.level)>=0?context.level:"Class 1");
 var subject=select("Subject:",subjects,SUBJECTS.indexOf(context.subject)>=0?context.subject:"English");
 var term=select("Term:",[{value:"T1",label:"Term 1 — 9 weeks"},{value:"T2",label:"Term 2 — 9 weeks"},{value:"T3",label:"Term 3 — 5 weeks"}],/^T[123]$/.test(context.term)?context.term:"T1");
 var ability=select("Ability group:",abilities,ABILITIES.some(function(x){return x.id===context.capability;})?context.capability:"developing");
 var button=document.createElement("button");button.type="button";button.textContent="Download daily activities + revision + practice exam";button.style.cssText="display:block;width:100%;padding:12px;margin-top:12px;font:inherit;font-weight:700;";panel.appendChild(button);
 var status=document.createElement("p");status.setAttribute("role","status");status.setAttribute("aria-live","polite");panel.appendChild(status);
 button.addEventListener("click",function(){try{var p=download({level:level.value,subject:subject.value,term:term.value,ability:ability.value});status.textContent="Pack prepared "+p.preparedDate+": "+p.dailyActivities+" daily activities; "+p.missingSlots+" unavailable slots. Check the downloaded file. Official syllabus mapping and marking criteria still require teacher review.";}catch(e){status.textContent="Could not prepare the pack: "+String(e&&e.message||e);}});
 container.appendChild(panel);return true;
}
global.PacEduDownloadableClassPacks=Object.freeze({subjects:SUBJECTS.slice(),levels:LEVELS.slice(),abilities:ABILITIES.slice(),criteria:SUBJECT_CRITERIA,build:build,download:download,renderControls:renderControls});
})(window,document);
