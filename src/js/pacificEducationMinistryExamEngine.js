(function(window,document){"use strict";
var state={scope:null,concepts:[],questions:[]};
function clean(value){return String(value||"").replace(/\s+/g," ").trim();}
function extractConcepts(scopeText){
  var text=clean(scopeText), parts=text.split(/[.;\n]+/).map(clean).filter(Boolean);
  var stop=/^(students?|learners?|candidates?|examination|assessment|paper|section|part|year|term|marks?|time|instructions?)$/i;
  var concepts=[];
  parts.forEach(function(p){
    p=p.replace(/^(students?|learners?)\s+(should|will|can|must)\s+/i,"");
    p=p.replace(/^(identify|describe|explain|calculate|compare|analyse|analyze|evaluate|demonstrate|apply|solve)\s+/i,"");
    p=clean(p);
    if(p && p.length>2 && !stop.test(p) && concepts.indexOf(p)===-1) concepts.push(p);
  });
  return concepts.slice(0,100);
}
function makeQuestions(concepts,meta){
  return concepts.map(function(concept,i){
    var subject=clean(meta&&meta.subject)||"the subject";
    return {
      id:"MINISTRY-"+(i+1),
      concept:concept,
      question:"Explain the main idea of \""+concept+"\" in "+subject+" and give one relevant example.",
      solution:"A correct response should accurately explain \""+concept+"\", use the terminology expected for the verified official scope, and provide a relevant example. The teacher/reviewer must verify the final answer against the official curriculum and examination requirements before use.",
      status:"DRAFT — TEACHER/REVIEWER VERIFICATION REQUIRED"
    };
  });
}
function ensureUI(){
  var host=document.getElementById("pacificEducationNationalExamCalendar");
  if(!host||document.getElementById("pacificEducationMinistryExamCoverage"))return;
  var box=document.createElement("div"); box.id="pacificEducationMinistryExamCoverage";
  box.innerHTML='<h4>Official Examination Scope → Concept & Question Engine</h4><p>When an official, verified examination scope is entered, Pacific Education identifies the stated concepts and immediately prepares draft practice questions with solution guidance.</p><p><strong>Authority boundary:</strong> Pacific Education may generate practice material, but it does not create or replace official Ministry examination questions, scope, marks or timetable.</p><p id="pacificEducationMinistryExamCoverageStatus">No verified Ministry examination scope loaded.</p><div id="pacificEducationMinistryExamConcepts"></div><div id="pacificEducationMinistryExamQuestions"></div>';
  host.appendChild(box);
}
function render(){
  ensureUI();
  var status=document.getElementById("pacificEducationMinistryExamCoverageStatus"), c=document.getElementById("pacificEducationMinistryExamConcepts"), q=document.getElementById("pacificEducationMinistryExamQuestions");
  if(!status||!c||!q)return;
  if(!state.scope){status.textContent="No verified Ministry examination scope loaded.";c.innerHTML="";q.innerHTML="";return;}
  status.textContent="Verified Ministry scope loaded for "+(state.scope.year||"the specified examination year")+". "+state.concepts.length+" concept(s) identified; "+state.questions.length+" draft question(s) prepared.";
  c.innerHTML="<h5>Identified examination concepts</h5><ul>"+state.concepts.map(function(x){return "<li>"+escapeHtml(x)+"</li>";}).join("")+"</ul>";
  q.innerHTML="<h5>Automatically prepared practice questions</h5>"+state.questions.map(function(x){return "<article><p><strong>"+escapeHtml(x.concept)+"</strong></p><p>"+escapeHtml(x.question)+"</p><p><strong>Solution guidance:</strong> "+escapeHtml(x.solution)+"</p><small>"+escapeHtml(x.status)+"</small></article>";}).join("");
}
function escapeHtml(v){return String(v).replace(/[&<>"]/g,function(ch){return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[ch];});}
function loadVerifiedScope(payload){
  payload=payload||{};
  if(payload.verified!==true)throw new Error("Only a verified official examination scope can be loaded.");
  state.scope={year:clean(payload.year),level:clean(payload.level),subject:clean(payload.subject),source:clean(payload.source),text:clean(payload.scopeText)};
  state.concepts=extractConcepts(state.scope.text);
  state.questions=makeQuestions(state.concepts,state.scope);
  render();
  return {year:state.scope.year,level:state.scope.level,subject:state.scope.subject,concepts:state.concepts,questions:state.questions};
}
window.PacificEducationMinistryExamEngine={loadVerifiedScope:loadVerifiedScope,getState:function(){return JSON.parse(JSON.stringify(state));},render:render};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",ensureUI);else ensureUI();
})(window,document);