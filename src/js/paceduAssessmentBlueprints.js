/* PacEdu differentiated assessment blueprint framework.
 * Draft framework only: use current Ministry/school syllabus outcomes to populate
 * the assessment map before any paper is called an official curriculum paper.
 */
(function (global) {
  "use strict";
  var levels = ["ECE"];
  for (var c=1;c<=8;c+=1) levels.push("Class "+c);
  for (var f=3;f<=7;f+=1) levels.push("Form "+f);
  var abilities = [
    {id:"support",label:"Supported start"},
    {id:"developing",label:"Developing"},
    {id:"expected",label:"At class goal"},
    {id:"extension",label:"Extension"}
  ];
  var formats = ["Multiple choice","Matching","True / false","Short answer","Reading / source response","Show working / practical task","Explain or justify"];
  var defaultBlueprint = [
    {component:"Knowledge and understanding",weight:30,examples:"MCQ, matching, key terms"},
    {component:"Application and skills",weight:30,examples:"short answers, worked problems, practical tasks"},
    {component:"Reading / source / data interpretation",weight:20,examples:"unseen passage, table, diagram, map or source"},
    {component:"Reasoning and communication",weight:20,examples:"explain, justify, compare or extended response"}
  ];
  function stage(level) {
    if(level==="ECE") return "early";
    var n=Number((level.match(/\\d+/)||["0"])[0]);
    if(level.indexOf("Class ")===0) return n<=2?"foundation":n<=5?"middle":"upper-primary";
    return n<=4?"junior-secondary":"senior-secondary";
  }
  function adapt(text, ability) {
    if(ability==="support") return "Supported: "+text+" Use a worked example, read-aloud, picture/object cue or word bank; record support used.";
    if(ability==="developing") return "Developing: "+text+" Give one prompt if needed, then ask for an independent attempt.";
    if(ability==="expected") return "Core: "+text+" Complete independently and check the answer.";
    return "Extension: "+text+" Add an unfamiliar example and ask for a reason, comparison or second method.";
  }
  function buildQuestionSet(opts) {
    opts=opts||{};
    var level=levels.indexOf(opts.level)>=0?opts.level:"Class 1";
    var ability=abilities.some(function(a){return a.id===opts.ability;})?opts.ability:"developing";
    var subject=opts.subject||"English";
    var topic=opts.topic||"the selected syllabus outcome";
    var s=stage(level);
    var qs;
    if(subject==="Mathematics"){
      qs=[
        {type:"MCQ",prompt:"A learner uses the skill for "+topic+". Which method best fits the problem?",options:["Choose a method and show the working","Guess without checking","Copy an unrelated example","Leave it blank"],answer:"A",why:"The learner must choose a relevant method and show evidence."},
        {type:"Matching",prompt:"Match the worked example to the correct representation for "+topic+".",options:["Objects / drawing","Number sentence","Answer"],answer:"Teacher supplies verified matching set",why:"Insert values and representations from the selected syllabus outcome."},
        {type:"True / false",prompt:"A worked answer for "+topic+" should be checked. True or false?",options:["True","False"],answer:"True",why:"Learners should check results using an appropriate method."},
        {type:"Short answer",prompt:"Solve one fresh "+topic+" problem and show each step.",options:[],answer:"Outcome-specific marking guide required",why:"Award marks for method and answer only where the rubric specifies."},
        {type:"Reasoning",prompt:"Explain why your method works, or compare it with another method.",options:[],answer:"Reasoning rubric required",why:"Use age-appropriate language and subject-specific criteria."}
      ];
    } else {
      qs=[
        {type:"MCQ",prompt:"Read the short class-level text or source about "+topic+". Which choice best answers the question asked by the text?",options:["A detail supported by the text/source","A detail not mentioned","A statement that contradicts it","An unrelated idea"],answer:"A (after source is inserted)",why:"The teacher must insert an original age-appropriate passage/source and confirm the answer."},
        {type:"Matching",prompt:"Match each key word, idea or example from "+topic+" to its correct meaning.",options:["Teacher-created verified pairs"],answer:"Teacher supplies verified matching set",why:"Pairs must come from the selected subject outcome and taught vocabulary."},
        {type:"True / false",prompt:"Judge a statement about "+topic+" and use evidence to support your choice.",options:["True","False"],answer:"Depends on the statement written from the verified outcome",why:"Do not release until the statement and answer key are checked."},
        {type:"Short answer",prompt:"Give one accurate answer about "+topic+" and add a supporting detail or example.",options:[],answer:"Outcome-specific marking guide required",why:"Accept equivalent correct wording where appropriate."},
        {type:"Application",prompt:"Apply the learning about "+topic+" to a familiar Fiji-life example.",options:[],answer:"Outcome-specific marking guide required",why:"Check relevance, accuracy and the class-level achievement indicator."}
      ];
    }
    if(s==="early"){
      qs=[
        {type:"Picture / object choice",prompt:"Point to, say, sign or choose the picture/object that fits "+topic+".",options:["Use locally familiar pictures or real objects"],answer:"Teacher records the demonstrated choice",why:"ECE uses play, talk, movement and observation rather than a long written exam."},
        {type:"Matching",prompt:"Match two pictures, objects, sounds or actions connected to "+topic+".",options:["Teacher prepares two to four clear pairs"],answer:"Teacher observation key",why:"Check understanding without requiring unsupported reading."},
        {type:"Oral / practical",prompt:"Show or tell one thing you noticed about "+topic+".",options:[],answer:"Observation rubric",why:"Record independent, supported or not-yet-demonstrated evidence."}
      ];
    }
    var count=ability==="support"?3:ability==="developing"?4:ability==="expected"?5:6;
    var chosen=[];
    for(var i=0;i<count;i+=1){
      var q=qs[i%qs.length];
      chosen.push({number:i+1,type:q.type,prompt:adapt(q.prompt,ability),options:q.options,answerKey:q.answer,markingNote:q.why});
    }
    return {status:"DRAFT_REQUIRES_OUTCOME_MAPPING",level:level,stage:s,subject:subject,ability:ability,topic:topic,questions:chosen,
      warning:"Question structures are drafts. Replace placeholders with real text, numbers, data and subject-specific content linked to a verified syllabus outcome before assigning or examining."};
  }
  function buildBlueprint(opts) {
    opts=opts||{};
    var level=levels.indexOf(opts.level)>=0?opts.level:"Class 1";
    var subject=opts.subject||"English";
    var paperType=opts.paperType||"Term-end examination";
    var duration=stage(level)==="early"?"Short play-based observation stations; no long written paper":stage(level)==="foundation"?"30–45 minutes (school-approved)":stage(level)==="middle"?"45–60 minutes (school-approved)":stage(level)==="upper-primary"?"60–90 minutes (school-approved)":"Use the approved subject/exam authority duration";
    return {
      status:"DRAFT_BLUEPRINT_REQUIRES_SCHOOL_AND_SYLLABUS_APPROVAL",
      level:level,subject:subject,paperType:paperType,durationGuidance:duration,
      purpose:paperType==="Revision paper"?"Find gaps and practise outcomes taught during the selected period.": "Assess only outcomes taught and included in the approved school assessment scope.",
      blueprint:defaultBlueprint.map(function(x){return {component:x.component,weightPercent:x.weight,marks:"Calculate from the approved total marks",questionFormats:x.examples};}),
      formats:formats,
      paperSections:[
        {section:"A",name:"Selected response",suggestedWeight:30,formats:"MCQ, matching, true/false"},
        {section:"B",name:"Short response / working",suggestedWeight:30,formats:"Short answer, working, vocabulary or labelled response"},
        {section:"C",name:"Reading / source / practical application",suggestedWeight:20,formats:"Unseen passage, diagram, data, map or practical task"},
        {section:"D",name:"Reasoning / extended response",suggestedWeight:20,formats:"Explain, justify, compare or create"}
      ],
      controls:[
        "Map every question to the exact syllabus strand, learning outcome/achievement indicator and teaching week.",
        "Use a fresh unseen text, numbers or source; do not recycle the same daily activity as the whole examination.",
        "Provide an answer key, acceptable alternatives, worked solutions and a mark-by-mark rubric.",
        "Moderate paper difficulty, language load, fairness, accessibility and total marks before use.",
        "Use the school's approved calendar, examination rules and subject-specific requirements; this generic blueprint does not replace official requirements.",
        "Store the paper and answer key securely; show students only the released paper, never teacher marking notes."
      ],
      note:"Generic planning template only. Percentages and duration are suggestions, not official Fiji Ministry examination rules; teachers must adjust them to the approved subject syllabus and school policy."
    };
  }
  function installPanel(){
    var doc=global.document;
    var host=doc&&doc.getElementById("paceduTeacherDailyLearningOnlyShell");
    if(!host||doc.getElementById("paceduAssessmentBlueprintPanel"))return;
    function node(tag,txt,parent){var n=doc.createElement(tag);if(txt!=null)n.textContent=txt;if(parent)parent.appendChild(n);return n;}
    function select(label,id,values,parent){var l=node("label",label,parent);l.style.cssText="display:block;margin:8px 0;font-weight:600";var s=node("select",null,l);s.id=id;s.style.cssText="display:block;width:100%;min-height:42px;padding:8px;font:inherit";values.forEach(function(v){var o=node("option",v.label,s);o.value=v.value;});return s;}
    var panel=node("section",null,host);panel.id="paceduAssessmentBlueprintPanel";panel.style.cssText="margin-top:16px;padding:14px;border:1px solid #c8d7e2;border-radius:10px";
    node("h3","Teacher Assessment & Revision Planner",panel);
    node("p","Create a differentiated practice set or a draft revision / term-end paper blueprint. Review and map every question before assigning; this tool does not claim to generate official exam papers.",panel);
    var lv=select("Class / level","paceduAssessmentLevel",levels.map(function(x){return {value:x,label:x};}),panel);
    var sub=select("Subject","paceduAssessmentSubject",["English","Mathematics","Science","Social Studies","Healthy Living","Physical Education","Arts and Crafts","Music","Digital Literacy","iTaukei Language","Hindi"].map(function(x){return {value:x,label:x};}),panel);
    var ab=select("Learner ability","paceduAssessmentAbility",abilities.map(function(x){return {value:x.id,label:x.label};}),panel);
    var topic=node("input",null,panel);topic.type="text";topic.placeholder="Syllabus topic / outcome (teacher enters)";topic.setAttribute("aria-label","Syllabus topic or outcome");topic.style.cssText="display:block;width:100%;box-sizing:border-box;min-height:42px;padding:8px;margin:8px 0;font:inherit";
    var type=select("Paper type","paceduAssessmentPaperType",[{value:"Revision paper",label:"Revision paper"},{value:"Term-end examination",label:"Term-end examination"},{value:"Weekly practice",label:"Weekly practice"}],panel);
    var b=node("button","Generate question set",panel);b.type="button";b.style.cssText="padding:10px;margin:6px 6px 6px 0;font:inherit";
    var p=node("button","Show teacher paper blueprint",panel);p.type="button";p.style.cssText="padding:10px;margin:6px;font:inherit";
    var out=node("div",null,panel);out.setAttribute("aria-live","polite");
    b.addEventListener("click",function(){var r=buildQuestionSet({level:lv.value,subject:sub.value,ability:ab.value,topic:topic.value||"the selected syllabus outcome"});out.textContent="";node("h4","Draft questions — "+r.level+" / "+r.subject+" / "+r.ability,out);r.questions.forEach(function(q){node("p",q.number+". ["+q.type+"] "+q.prompt,out);if(q.options&&q.options.length){var ul=node("ul",null,out);q.options.forEach(function(o){node("li",o,ul);});}node("p","Teacher key: "+q.answerKey+" — "+q.markingNote,out);});node("p",r.warning,out);});
    p.addEventListener("click",function(){var r=buildBlueprint({level:lv.value,subject:sub.value,paperType:type.value});out.textContent="";node("h4",r.paperType+" blueprint — "+r.level+" / "+r.subject,out);node("p","Suggested duration: "+r.durationGuidance,out);node("p",r.purpose,out);r.blueprint.forEach(function(x){node("p",x.component+": "+x.weightPercent+"% — "+x.questionFormats,out);});node("h4","Teacher checks before approval",out);var ul=node("ul",null,out);r.controls.forEach(function(x){node("li",x,ul);});node("p",r.note,out);});
  }
  function boot(){installPanel();if(global.MutationObserver&&global.document&&global.document.body){var obs=new global.MutationObserver(installPanel);obs.observe(global.document.body,{childList:true,subtree:true});}}
  if(global.document){if(global.document.readyState==="loading")global.document.addEventListener("DOMContentLoaded",boot);else boot();}
  global.PacEduAssessmentBlueprints=Object.freeze({levels:levels.slice(),abilities:abilities.slice(),formats:formats.slice(),buildQuestionSet:buildQuestionSet,buildBlueprint:buildBlueprint});
})(window);
