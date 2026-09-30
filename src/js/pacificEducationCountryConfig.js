(function(window,document){"use strict";
var DEFAULT_LEVELS=["Class 1","Class 2","Class 3","Class 4","Class 5","Class 6","Class 7","Class 8","Class 9","Class 10","Class 11","Class 12","Class 13"];
var DEFAULT_TERMS=["Term 1","Term 2","Term 3"];
var DEFAULT_SUBJECTS=[
"English","Mathematics","Science","Basic Science","Elementary Science","Biology","Chemistry","Physics",
"Health Science","Health & Physical Education","Geography","History","Social Science","Accounting","Economics",
"Business/Enterprise Studies","Office Technology","Computer Studies","Agricultural Science","Home Economics",
"Basic Technology","Basic Graphics Technology","Applied Technology","Technical Drawing","Arts","Vosa Vakaviti",
"Hindi","Urdu","Other"
];
var defaults={
 country:"Fiji",educationAuthority:"Ministry of Education",language:"English",currency:"FJD",
 levelSystem:"National system",termSystem:"National system",nationalExamName:"National examinations",
 levels:DEFAULT_LEVELS,terms:DEFAULT_TERMS,subjects:DEFAULT_SUBJECTS
};
var state=clone(defaults);
function clone(v){return JSON.parse(JSON.stringify(v));}
function clean(v){return String(v||"").replace(/\s+/g," ").trim();}
function cleanList(value,fallback){
 if(!Array.isArray(value)) return fallback.slice();
 var list=value.map(clean).filter(Boolean);
 return list.length?list:fallback.slice();
}
function load(config){
 config=config||{};
 ["country","educationAuthority","language","currency","levelSystem","termSystem","nationalExamName"].forEach(function(k){
   if(config[k]!==undefined&&clean(config[k])) state[k]=clean(config[k]);
 });
 if(config.levels!==undefined) state.levels=cleanList(config.levels,DEFAULT_LEVELS);
 if(config.terms!==undefined) state.terms=cleanList(config.terms,DEFAULT_TERMS);
 if(config.subjects!==undefined) state.subjects=cleanList(config.subjects,DEFAULT_SUBJECTS);
 render();
 document.dispatchEvent(new CustomEvent("pacificEducationCountryConfigChanged",{detail:clone(state)}));
 return getState();
}
function getState(){return clone(state);}
function getLevels(){return state.levels.slice();}
function getTerms(){return state.terms.slice();}
function getSubjects(){return state.subjects.slice();}
function reset(){state=clone(defaults);render();document.dispatchEvent(new CustomEvent("pacificEducationCountryConfigChanged",{detail:clone(state)}));return getState();}
function ensureUI(){
 var app=document.getElementById("app");if(!app||document.getElementById("pacificEducationCountrySettings"))return;
 var s=document.createElement("section");s.id="pacificEducationCountrySettings";s.hidden=true;
 s.innerHTML="<h2>Country & Education System</h2><p>Pacific Education is adaptable by country. Each country keeps its own education authority, curriculum, levels, terms, examinations, language and local settings.</p><p><strong>International mapping:</strong> Optional UNESCO ISCED mapping can support cross-country comparison without replacing national terminology or authority.</p><div id="pacificEducationCountrySettingsSummary"></div>";
 app.appendChild(s);
}
function render(){
 ensureUI();var e=document.getElementById("pacificEducationCountrySettingsSummary");if(!e)return;
 e.innerHTML="<p><strong>Country:</strong> "+esc(state.country)+"</p><p><strong>Education authority:</strong> "+esc(state.educationAuthority)+"</p><p><strong>Language:</strong> "+esc(state.language)+"</p><p><strong>Currency:</strong> "+esc(state.currency)+"</p><p><strong>Level system:</strong> "+esc(state.levelSystem)+"</p><p><strong>Term system:</strong> "+esc(state.termSystem)+"</p><p><strong>National examination name:</strong> "+esc(state.nationalExamName)+"</p><p><strong>Configured levels:</strong> "+state.levels.length+" • <strong>Terms:</strong> "+state.terms.length+" • <strong>Subjects:</strong> "+state.subjects.length+"</p>";
}
function esc(v){return String(v).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c];});}
window.PacificEducationCountryConfig={
 load:load,getState:getState,getLevels:getLevels,getTerms:getTerms,getSubjects:getSubjects,reset:reset,render:render,
 defaults:function(){return clone(defaults);}
};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",ensureUI);else ensureUI();
})(window,document);