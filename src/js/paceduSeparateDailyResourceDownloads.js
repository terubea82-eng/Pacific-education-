/* PacEdu separate daily downloads: four learner files + separate teacher resources.
 * One shared objective per lesson; four flexible pathways. All content remains teacher-review draft.
 */
(function(global,document){
"use strict";
var GROUPS=[
 {id:"extension",name:"Gold",label:"Advanced"},
 {id:"expected",name:"Silver",label:"Expected"},
 {id:"developing",name:"Bronze",label:"Developing"},
 {id:"support",name:"Copper",label:"Supported"}
];
var TEACHER_FILES=[
 {id:"lesson-plan",label:"Teacher Lesson Plan"},
 {id:"lesson-notes",label:"Teacher Lesson Notes"},
 {id:"answer-guide",label:"Teacher Answer Guide & Marking Criteria"},
 {id:"teaching-aids",label:"Teacher Teaching Aids"}
];
function esc(v){return String(v==null?"":v).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}
function node(tag,text){var e=document.createElement(tag);if(text!=null)e.textContent=text;return e;}
function stamp(){var d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
function getSheet(options){
 var api=global.PacEduDailyWorksheetContent;
 if(!api||typeof api.getCurriculumWorksheet!=="function")throw new Error("Daily worksheet content is not ready.");
 return api.getCurriculumWorksheet({level:options.level,subject:options.sourceSubject||options.subject,term:options.term,week:options.week,day:options.day,ability:options.ability,skipTermPlan:true});
}
function commonData(options){
 var resolver=global.PacEduDownloadableClassPacks;
 var resolved=resolver&&resolver.resolveSubject?resolver.resolveSubject(options.subject,options.level):null;
 if(!resolved||!resolved.available)throw new Error(resolved&&resolved.note||"Subject content is not available.");
 var base=getSheet({level:options.level,subject:options.subject,sourceSubject:resolved.sourceSubject,term:options.term,week:options.week,day:options.day,ability:"expected"});
 if(!base||base.status==="NOT_FOUND")throw new Error("No matching daily content exists for this class, subject, term, week and day.");
 var lesson=base.dailyLesson||{};
 return {base:base,lesson:lesson,objective:lesson.classLevelObjective||lesson.learnerAction||base.topic||"Teacher-approved objective required",resolved:resolved};
}
function docHtml(title,meta,body){
 return "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>"+esc(title)+"</title><style>body{font:16px/1.5 Arial,sans-serif;max-width:850px;margin:auto;padding:20px;color:#17212b}h1,h2{line-height:1.2}.meta{background:#f2f5f7;padding:12px;border-radius:8px}li{margin:7px 0}@media print{body{max-width:none;padding:0}}</style></head><body><h1>"+esc(title)+"</h1><div class=\"meta\">"+meta+"</div>"+body+"<p><strong>PacEdu status:</strong> PENDING_TEACHER_REVIEW. Verify the current authorised Fiji syllabus, outcome, achievement indicator and school sequence before teaching or release.</p></body></html>";
}
function save(title,options,body,kind){
 var meta="<p><strong>Class:</strong> "+esc(options.level)+" · <strong>Subject:</strong> "+esc(options.subject)+"</p><p><strong>Term:</strong> "+esc(options.term)+" · <strong>Week:</strong> "+esc(options.week)+" · <strong>Day:</strong> "+esc(options.day)+" · <strong>Prepared:</strong> "+stamp()+"</p>";
 var html=docHtml(title,meta,body),blob=new Blob([html],{type:"text/html;charset=utf-8"}),url=global.URL.createObjectURL(blob),a=node("a");
 a.href=url;a.download=["PacEdu",options.level,options.subject,options.term,"Week-"+options.week,"Day-"+options.day,kind,stamp()].join("_").replace(/[^A-Za-z0-9_.-]+/g,"-")+".html";
 a.style.display="none";document.body.appendChild(a);a.click();a.remove();global.setTimeout(function(){global.URL.revokeObjectURL(url);},1500);
}
function weeklyBookDownload(options,group){
 var resolver=global.PacEduDownloadableClassPacks;
 var resolved=resolver&&resolver.resolveSubject?resolver.resolveSubject(options.subject,options.level):null;
 if(!resolved||!resolved.available)throw new Error(resolved&&resolved.note||"This subject does not yet have its own practice bank. No other subject will be substituted.");
 var api=global.PacEduDailyWorksheetContent;
 if(!api||typeof api.getCurriculumWorksheet!=="function")throw new Error("Daily classwork content is not ready.");
 var pages=[];
 for(var d=1;d<=5;d++){
  var sheet=api.getCurriculumWorksheet({level:options.level,subject:resolved.sourceSubject,term:options.term,week:options.week,day:d,ability:group.id,skipTermPlan:true});
  if(!sheet||sheet.status==="NOT_FOUND")throw new Error("A complete five-day activity book is not available for Day "+d+".");
  var lesson=sheet.dailyLesson||{},activities=sheet.abilityActivities||{},daily=activities.daily||{},questions=sheet.questions||[];
  var objective=lesson.classLevelObjective||lesson.learnerAction||sheet.topic||"Teacher-approved objective required";
  var criteria=lesson.successCriteria||[];
  var success=typeof daily.successCheck==="string"?daily.successCheck:(Array.isArray(criteria)?criteria.join("; "):"Explain, demonstrate, point, draw or write what you learned.");
  var page="<section class=\"day\"><h2>Day "+d+" — "+esc(sheet.title||sheet.topic||"Daily classwork")+"</h2>"+
   "<h3>Learning objective</h3><p>"+esc(objective)+"</p>"+
   "<h3>Learning focus</h3><p>"+esc(lesson.learningConcept||lesson.concept||sheet.topic||"Teacher to confirm")+"</p>"+
   "<h3>Learn and practise</h3><p>"+esc(lesson.exampleText||lesson.workedExample||sheet.readingText||"Teacher models a suitable example.")+"</p>"+
   "<p>"+esc(daily.subjectTask||lesson.learnerAction||sheet.instructions||"Complete the classwork activity.")+"</p><ol>"+(daily.steps||[]).map(function(x){return "<li>"+esc(x)+"</li>";}).join("")+"</ol>"+
   "<h3>Classwork</h3><ol>"+questions.map(function(q){return "<li>"+esc(q.prompt||q.question||q.text||"Complete the task.")+(q.options&&q.options.length?"<ul>"+q.options.map(function(v,i){return "<li>"+String.fromCharCode(65+i)+". "+esc(v)+"</li>";}).join("")+"</ul>":"")+"<p>Answer: __________________________________________________</p></li>";}).join("")+"</ol>"+
   "<h3>Show what you learned</h3><p>"+esc(success)+"</p><p>Teacher feedback: ______________________________________________</p></section>";
  pages.push(page);
 }
 var title="PacEdu "+options.level+" "+options.subject+" — "+group.name+" Classwork Activity Book";
 var meta="<p><strong>Country:</strong> Fiji · <strong>Class:</strong> "+esc(options.level)+" · <strong>Subject:</strong> "+esc(options.subject)+"</p><p><strong>Term:</strong> "+esc(options.term)+" · <strong>Week:</strong> "+esc(options.week)+" · <strong>Ability pathway:</strong> "+esc(group.name)+" ("+esc(group.label)+")</p><p><strong>Book:</strong> Five daily classwork activities · Student copy</p>";
 var html="<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>"+esc(title)+"</title><style>body{font:16px/1.55 Arial,sans-serif;max-width:850px;margin:auto;padding:20px;color:#17212b}.meta{background:#f2f5f7;padding:12px;border-radius:8px}.day{page-break-after:always;break-after:page;padding:10px 0}.day:last-of-type{page-break-after:auto}li{margin:9px 0}.status{border:1px solid #9a6b00;padding:10px;margin-top:18px}@media print{body{max-width:none;padding:10mm}}</style></head><body><h1>"+esc(title)+"</h1><div class=\"meta\">"+meta+"</div>"+pages.join("")+"<p class=\"status\"><strong>Curriculum status:</strong> PENDING_TEACHER_REVIEW. Original PacEdu classwork draft; verify the current Fiji syllabus outcome, achievement indicator, term placement and school adoption before formal alignment claims or student release.</p></body></html>";
 var blob=new Blob([html],{type:"text/html;charset=utf-8"}),url=global.URL.createObjectURL(blob),a=node("a");
 a.href=url;a.download=["PacEdu",options.level,options.subject,options.term,"Week-"+options.week,"Classwork-Activity-Book",group.name,stamp()].join("_").replace(/[^A-Za-z0-9_.-]+/g,"-")+".html";
 a.style.display="none";document.body.appendChild(a);a.click();a.remove();global.setTimeout(function(){global.URL.revokeObjectURL(url);},1500);
 return {days:pages.length,filename:a.download};
}
function learnerDownload(options,group,shared){
 var sheet=getSheet({level:options.level,subject:options.subject,sourceSubject:shared.resolved.sourceSubject,term:options.term,week:options.week,day:options.day,ability:group.id});
 if(!sheet||sheet.status==="NOT_FOUND")throw new Error("This ability group's daily activity is not available.");
 var a=sheet.abilityActivities||{},d=a.daily||{},lesson=sheet.dailyLesson||{};
 var body="<h2>Learning objective</h2><p>"+esc(shared.objective)+"</p><h2>Concept / learning focus</h2><p>"+esc(lesson.concept||sheet.topic||"Teacher to confirm")+"</p><h2>Learn and try</h2><p>"+esc(lesson.exampleText||lesson.visualExample||lesson.workedExample||"Teacher-provided example.")+"</p><p>"+esc(d.subjectTask||"Complete the class activity.")+"</p><ol>"+(d.steps||[]).map(function(x){return "<li>"+esc(x)+"</li>";}).join("")+"</ol><h2>Questions / activity</h2>";
 var qs=sheet.questions||[];body+="<ol>"+qs.map(function(q){return "<li>"+esc(q.prompt||q.question||q.text||"Complete the activity.")+(q.options&&q.options.length?"<ul>"+q.options.map(function(o){return "<li>"+esc(o)+"</li>";}).join("")+"</ul>":"")+"</li>";}).join("")+"</ol>";
 body+="<h2>Show what you learned</h2><p>"+esc(d.successCheck||"Show or explain your learning using an accessible response method.")+"</p><p>Answer space: __________________________________________________________</p><p>________________________________________________________________________</p><p>________________________________________________________________________</p><p>Accessible response options may include writing, speech, sign, pointing, drawing, objects or practical demonstration where appropriate.</p>";
 save("Student Activity — "+group.name+" Group",options,body,"STUDENT-"+group.name);
}
function teacherDownload(options,file,shared){
 var sheet=shared.base,lesson=shared.lesson,steps=lesson.steps||[],qs=sheet.questions||[],keys=sheet.answerKey||[];
 var body="";
 if(file.id==="lesson-plan"){
  body="<h2>Shared learning objective</h2><p>"+esc(shared.objective)+"</p><h2>Concept / achievement indicator</h2><p>"+esc(lesson.concept||sheet.curriculumSchedule&&sheet.curriculumSchedule.suggestedFocus||"Confirm the official concept and indicator.")+"</p><h2>Lesson sequence</h2><ol>"+steps.map(function(s){return "<li><strong>"+esc(s.mode||s.step||"Lesson step")+"</strong>: "+esc(s.learnerAction||s.onScreen||s.narration||"Teacher-guided activity.")+"</li>";}).join("")+"</ol><h2>Assessment and evidence</h2><p>"+esc(lesson.assessment||lesson.successCriteria||"Check learner work against the shared objective and record evidence.")+"</p><h2>Differentiation</h2><p>Gold: extension and transfer. Silver: independent class-level task. Bronze: limited prompts and guided practice. Copper: modelling, concrete examples and accessible supported responses.</p><h2>After-lesson reflection</h2><p>What worked? ____________________ Evidence: ____________________ Next step: ____________________</p>";
 }else if(file.id==="lesson-notes"){
  body="<h2>Shared learning objective</h2><p>"+esc(shared.objective)+"</p><h2>Teacher explanation / notes</h2><p>"+esc(lesson.teacherNotes||lesson.explanation||lesson.concept||lesson.exampleText||"Teacher to add a checked explanation for this lesson.")+"</p><h2>Worked example</h2><p>"+esc(lesson.workedExample||lesson.exampleText||"Teacher to prepare a subject-specific worked example.")+"</p><h2>Key vocabulary</h2><p>"+esc((lesson.keyVocabulary||lesson.vocabulary||[]).join? (lesson.keyVocabulary||lesson.vocabulary||[]).join(", "):lesson.keyVocabulary||"Teacher to verify key terms.")+"</p><h2>Common misconceptions</h2><p>"+esc(lesson.misconceptions||"Record misconceptions observed during teaching.")+"</p>";
 }else if(file.id==="answer-guide"){
  body="<h2>Shared learning objective</h2><p>"+esc(shared.objective)+"</p><h2>Answer guide</h2><ol>"+qs.map(function(q,i){var k=keys[i]||{};return "<li>"+esc(q.prompt||q.question||q.text||"Question "+(i+1))+"<p><strong>Suggested answer / marking note:</strong> "+esc(k.answer||k.explanation||"Teacher to verify against the approved subject rubric.")+"</p></li>";}).join("")+"</ol><h2>Marking criteria</h2><p>Assess accuracy, method/process, evidence and communication as appropriate to the subject and task. Record support or accommodations used. Do not penalise an inaccessible response mode when the target skill allows an equivalent response.</p><p><strong>Teacher marks / feedback:</strong> __________________________________________</p>";
 }else{
  body="<h2>Shared learning objective</h2><p>"+esc(shared.objective)+"</p><h2>Teaching aids and preparation</h2><ul><li>Visual chart or diagram illustrating the lesson concept.</li><li>Worked example or teacher demonstration.</li><li>Safe, low-cost local objects or printed picture cards where suitable.</li><li>Large-print, tactile, audio or signed alternatives according to learner access needs.</li><li>Offline alternative for any digital resource.</li></ul><h2>Existing lesson visuals / examples</h2><p>"+esc(lesson.visualExample||lesson.exampleText||lesson.concept||"Teacher to attach a verified subject-specific chart, diagram or demonstration.")+"</p><h2>Safety and accessibility</h2><p>Check materials, safe use, readable contrast, clear verbal description and accessible alternatives before the lesson.</p>";
 }
 save(file.label,options,body,"TEACHER-"+file.id.toUpperCase());
}
function renderControls(container,context){
 if(!container||!document||!document.createElement||container.querySelector("[data-pacedu-separate-daily-downloads]"))return false;
 context=context||{};
 var box=node("section");box.setAttribute("data-pacedu-separate-daily-downloads","true");box.setAttribute("aria-label","Separate daily student and teacher downloads");box.style.cssText="margin:14px 0;padding:14px;border:2px solid #527184;border-radius:10px;";
 box.appendChild(node("h4","Separate Daily Student Activities & Teacher Resources"));
 box.appendChild(node("p","Choose the exact lesson. Each student group downloads its own file; teacher plans, notes, answers and teaching aids download separately. All four groups share the same learning objective."));
 function select(label,values,chosen){var wrap=node("label",label);wrap.style.cssText="display:block;margin:8px 0;font-weight:600;";var s=node("select");s.style.cssText="display:block;width:100%;padding:9px;margin-top:4px;font:inherit;";values.forEach(function(v){var o=node("option",v.label);o.value=v.value;if(v.value===chosen)o.selected=true;s.appendChild(o);});wrap.appendChild(s);box.appendChild(wrap);return s;}
 var level=select("Class / level:",(global.PacEduDownloadableClassPacks.levels||[]).map(function(x){return {value:x,label:x};}),context.level||"Class 1");
 var subject=select("Subject:",(global.PacEduDownloadableClassPacks.subjects||[]).map(function(x){return {value:x,label:x};}),context.subject||"English");
 var term=select("Term:",[{value:"T1",label:"Term 1"},{value:"T2",label:"Term 2"},{value:"T3",label:"Term 3"}],context.term||"T1");
 var weeks=select("Week:",Array.from({length:9},function(_,i){return {value:String(i+1),label:"Week "+(i+1)};}),"1");
 var day=select("Day:",Array.from({length:5},function(_,i){return {value:String(i+1),label:"Day "+(i+1)};}),"1");
 term.addEventListener("change",function(){var max=term.value==="T3"?5:9;weeks.textContent="";for(var i=1;i<=max;i++){var o=node("option","Week "+i);o.value=String(i);weeks.appendChild(o);}weeks.value="1";});
 var studentHeading=node("h5","Student files — download separately");box.appendChild(studentHeading);
 var studentGrid=node("div");studentGrid.style.cssText="display:grid;grid-template-columns:repeat(auto-fit,minmax(145px,1fr));gap:8px;";
 GROUPS.forEach(function(g){var b=node("button","Download "+g.name+" Activity");b.type="button";b.style.cssText="min-height:46px;padding:10px;font:inherit;font-weight:700;";b.addEventListener("click",function(){try{var o={level:level.value,subject:subject.value,term:term.value,week:Number(weeks.value),day:Number(day.value)};learnerDownload(o,g,commonData(o));status.textContent=g.name+" student activity download started.";}catch(e){status.textContent="Student file not prepared: "+String(e.message||e);}});studentGrid.appendChild(b);});
 box.appendChild(studentGrid);
 box.appendChild(node("h5","Weekly Classwork Activity Book — five daily pages"));
 box.appendChild(node("p","Download a separate five-day classwork book for the selected ability group. Each day has its own learning focus, example, classwork questions and answer space."));
 var bookGrid=node("div");bookGrid.style.cssText="display:grid;grid-template-columns:repeat(auto-fit,minmax(145px,1fr));gap:8px;";
 GROUPS.forEach(function(g){var b=node("button","Download "+g.name+" Classwork Book");b.type="button";b.style.cssText="min-height:46px;padding:10px;font:inherit;font-weight:700;";b.addEventListener("click",function(){try{var result=weeklyBookDownload({level:level.value,subject:subject.value,term:term.value,week:Number(weeks.value)},g);status.textContent=g.name+" five-day classwork activity book download started ("+result.days+" daily pages).";}catch(e){status.textContent="Classwork book not prepared: "+String(e.message||e);}});bookGrid.appendChild(b);});
 box.appendChild(bookGrid);
 box.appendChild(node("h5","Teacher files — download separately"));
 var teacherGrid=node("div");teacherGrid.style.cssText="display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:8px;";
 var status=node("p","Curriculum mapping remains pending teacher review. No official Fiji curriculum alignment is claimed.");status.setAttribute("role","status");status.setAttribute("aria-live","polite");
 TEACHER_FILES.forEach(function(f){var b=node("button","Download "+f.label);b.type="button";b.style.cssText="min-height:46px;padding:10px;font:inherit;font-weight:700;";b.addEventListener("click",function(){try{var o={level:level.value,subject:subject.value,term:term.value,week:Number(weeks.value),day:Number(day.value)};teacherDownload(o,f,commonData(o));status.textContent=f.label+" download started.";}catch(e){status.textContent="Teacher file not prepared: "+String(e.message||e);}});teacherGrid.appendChild(b);});
 box.appendChild(teacherGrid);box.appendChild(status);container.appendChild(box);return true;
}
global.PacEduSeparateDailyResourceDownloads=Object.freeze({groups:GROUPS.map(function(g){return {id:g.id,name:g.name};}),teacherFiles:TEACHER_FILES.map(function(f){return f.id;}),downloadWeeklyBook:weeklyBookDownload,renderControls:renderControls});
})(window,document);
